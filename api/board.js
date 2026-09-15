// api/board.js — API do board (SPEC §9.1). Função serverless da Vercel (Node), sem dependências.
//
//   GET                       → 200 { data, version, updatedAt }   (ou { data: null, version: 0 } se vazio)
//   PUT/POST { data, baseVersion } → 200 { version, updatedAt }
//                              → 409 { current: { data, version, updatedAt } } se baseVersion está obsoleto
//
// Storage: Supabase (Postgres), tabela `board`, uma linha (id = 'roadmap-v1'), acessada pela API REST
// (PostgREST) com a chave de serviço — que fica só aqui, no servidor, nunca no navegador.
// A escrita é condicional (`where version = baseVersion`): se não afetar nenhuma linha, é conflito.
// Sem SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY → fallback em memória (efêmero; é o modo do desenvolvimento local).
// Com APP_PASSWORD definida, toda chamada exige a senha (header X-App-Password, ou campo `senha` no corpo
// — o caminho do sendBeacon, que não aceita headers).
import { timingSafeEqual } from 'node:crypto';

const BOARD_ID = 'roadmap-v1';
const env = n => (process.env[n] || '').trim();

// ---------- Adaptador em memória (desenvolvimento local) ----------
const memoria = { data: null, version: 0, updatedAt: null };
const emMemoria = {
  nome: 'memoria',
  async ler() { return { ...memoria }; },
  async gravar(data, baseVersion) {
    if (baseVersion !== memoria.version) return { ok: false, current: { ...memoria } };
    memoria.data = data; memoria.version += 1; memoria.updatedAt = new Date().toISOString();
    return { ok: true, version: memoria.version, updatedAt: memoria.updatedAt };
  },
};

// ---------- Adaptador Supabase (PostgREST via fetch) ----------
function supabase() {
  // O painel do Supabase oferece o endereço nas duas formas — "https://<ref>.supabase.co" (Project URL)
  // e "https://<ref>.supabase.co/rest/v1/" (Data API). Aceita as duas: tira a barra final e o /rest/v1
  // se já vier, para não montar um caminho duplicado (PGRST125).
  const url = env('SUPABASE_URL').replace(/\/+$/, '').replace(/\/rest\/v1$/i, ''), key = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return null;
  const base = `${url}/rest/v1/board`;
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };
  const linha = r => r ? { data: r.data, version: r.version, updatedAt: r.updated_at } : { data: null, version: 0, updatedAt: null };
  async function pede(metodo, qs, corpo) {
    const r = await fetch(base + qs, { method: metodo, headers, body: corpo ? JSON.stringify(corpo) : undefined });
    const texto = await r.text();
    if (!r.ok) { const e = new Error(`Supabase ${r.status}: ${texto.slice(0, 300)}`); e.status = r.status; throw e; }
    return texto ? JSON.parse(texto) : [];
  }
  return {
    nome: 'supabase',
    async ler() {
      const rows = await pede('GET', `?id=eq.${BOARD_ID}&select=version,data,updated_at`);
      return linha(rows[0]);
    },
    async gravar(data, baseVersion) {
      const agora = new Date().toISOString();
      if (baseVersion === 0) {
        // Primeira gravação: insere. Se a linha já existe (outro cliente publicou antes), o Postgres devolve 409.
        try { const rows = await pede('POST', '', { id: BOARD_ID, version: 1, data, updated_at: agora }); const l = linha(rows[0]); return { ok: true, version: l.version, updatedAt: l.updatedAt }; }
        catch (e) { if (e.status !== 409) throw e; return { ok: false, current: await this.ler() }; }
      }
      // Escrita condicional: só atualiza se a versão no banco ainda for a que o cliente carregou.
      const rows = await pede('PATCH', `?id=eq.${BOARD_ID}&version=eq.${baseVersion}`, { version: baseVersion + 1, data, updated_at: agora });
      if (rows.length) { const l = linha(rows[0]); return { ok: true, version: l.version, updatedAt: l.updatedAt }; }
      return { ok: false, current: await this.ler() };
    },
  };
}

// ---------- Utilitários HTTP (só Node puro, para rodar igual na Vercel e em tools/dev-server.mjs) ----------
function enviar(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}
async function lerCorpo(req) {
  if (req.body !== undefined) {   // a Vercel já interpreta JSON; texto vem como string
    if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch (e) { return null; } }
    return req.body;
  }
  let s = ''; for await (const chunk of req) s += chunk;
  try { return s ? JSON.parse(s) : null; } catch (e) { return null; }
}
function senhaOk(req, corpo) {
  const esperada = env('APP_PASSWORD');
  if (!esperada) return true;
  const recebida = String(req.headers['x-app-password'] || (corpo && corpo.senha) || '');
  const a = Buffer.from(recebida), b = Buffer.from(esperada);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  const store = supabase() || emMemoria;
  res.setHeader('X-Board-Store', store.nome);
  const metodo = req.method;
  let corpo = null;
  if (metodo === 'PUT' || metodo === 'POST') {
    corpo = await lerCorpo(req);
    if (!corpo || typeof corpo !== 'object') return enviar(res, 400, { error: 'JSON inválido' });
  }
  if (!senhaOk(req, corpo)) return enviar(res, 401, { error: 'senha' });
  try {
    if (metodo === 'GET') return enviar(res, 200, await store.ler());
    if (metodo === 'PUT' || metodo === 'POST') {
      const { data, baseVersion } = corpo;
      if (!data || typeof data !== 'object' || !data.quarters || !Number.isInteger(baseVersion) || baseVersion < 0) {
        return enviar(res, 400, { error: 'Esperado { data: board, baseVersion: inteiro }' });
      }
      const r = await store.gravar(data, baseVersion);
      if (!r.ok) return enviar(res, 409, { current: r.current });
      return enviar(res, 200, { version: r.version, updatedAt: r.updatedAt });
    }
    res.setHeader('Allow', 'GET, PUT, POST');
    return enviar(res, 405, { error: 'Método não permitido' });
  } catch (e) {
    console.error('[api/board]', e);
    return enviar(res, 502, { error: 'storage', detalhe: String(e.message || e).slice(0, 300) });
  }
}
