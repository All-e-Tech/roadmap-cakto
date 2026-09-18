// data.js — modelo de dados, seed, enums e lógica pura (SPEC §3, §4). Sem Preact.
//
// Passo 3a: comportamento idêntico ao protótipo do Claude Design, inclusive o que já se
// sabe errado (docs/divergences.md) — as migrações decididas entram no passo 3b.
//
// Regra de cores: hex só onde o valor é DADO gravado no board (cor de squad no seed e
// PALETTE, que vira `squad.color`). Cores de estilo referenciam tokens de css/tokens.css.

// ---------- Enums (SPEC §4) ----------
export const STATUS = {
  entregue: { label: 'Entregue',           color: 'var(--proto-green)',      tx: 'var(--proto-bg)',             chip: 'var(--proto-green)' },
  dev:      { label: 'Em desenvolvimento', color: 'var(--proto-green-deep)', tx: 'var(--proto-text)',           chip: 'var(--proto-green)' },
  qa:       { label: 'Em teste / QA',      color: 'var(--proto-yellow)',     tx: 'var(--proto-bg)',             chip: 'var(--proto-yellow)' },
  homolog:  { label: 'Homologação',        color: 'var(--proto-green-mid)',  tx: 'var(--proto-bg)',             chip: 'var(--proto-green-mid)' },
  backlog:  { label: 'Backlog',            color: 'var(--proto-grey-1)',     tx: 'var(--proto-text-2)',         chip: 'var(--proto-text-secondary)' },
  stories:  { label: 'User stories',       color: 'var(--proto-muted)',      tx: 'var(--proto-text-secondary)', chip: 'var(--proto-text-secondary)' },
};
export const PREV = {
  prazo:  { label: 'No prazo',     color: 'var(--proto-green)' },
  prod:   { label: 'Em produção',  color: 'var(--proto-green)' },
  risco:  { label: 'Em risco',     color: 'var(--proto-yellow)' },
  atraso: { label: 'Atrasado',     color: 'var(--proto-red)' },
  bloq:   { label: 'Bloqueado',    color: 'var(--proto-text-secondary)' },
  nao:    { label: 'Não iniciado', color: 'var(--proto-text-disabled)' },
};
// DADO: cor atribuída a squad nova e gravada em `squad.color` (por isso hex).
export const PALETTE = ['#36b37e', '#0f7864', '#65a76b', '#fdd465', '#f4cd97', '#919eab'];
export const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// ---------- Squads: estrutura e prefixo (SPEC §3; C8 revisada em 09/09/2026) ----------
// Não há lista fechada de squads. Cada squad vive dentro do quarter e tem `prefix` (ID legível das
// iniciativas) e `archived`. O prefixo nasce das três primeiras letras do nome, único no quarter,
// editável na Config; renomear a squad não o altera. O `code` da iniciativa é imutável depois de criado.
export function prefixoDeNome(name) { return (name ? name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() : '') || 'CKT'; }
// Prefixo livre no quarter a partir de uma base: PAY, PAY2, PAY3…
export function prefixoLivre(q, base, exceto) {
  const usado = p => q.squads.some(s => s !== exceto && s.prefix === p);
  let p = base, n = 1; while (usado(p)) p = base + (++n); return p;
}
// Prefixo para o `code` de uma iniciativa: o da squad homônima no quarter ativo, ou derivado do nome.
export function prefixoSquad(data, name) { const s = quarterAtivo(data).squads.find(x => x.name === name); return s ? s.prefix : prefixoDeNome(name); }
// C11: duração da sprint só em semanas inteiras (SPEC §7). Fora da lista → 14.
export const DURACOES_SPRINT = [7, 14, 21, 28];
export const KPRIO = {
  P0: { n: 4, c: 'var(--proto-k-red)' },
  P1: { n: 3, c: 'var(--proto-k-amber)' },
  P2: { n: 2, c: 'var(--proto-k-sage)' },
  P3: { n: 1, c: 'var(--proto-k-text-3)' },
};
// Colunas fixas (A3), renomeadas em 18/09/2026: a primeira deixou de se chamar "Backlog" porque havia dois
// backlogs de mesmo nome — o do Kanban e o do roadmap. A segunda passou a dizer o que é: o backlog do
// roadmap visto do outro lado. Nenhuma chave foi reaproveitada para outra coluna.
export const KCOLS_DEFAULT = [
  { k: 'iniciativas', label: 'Iniciativas',        role: 'entrada' },
  { k: 'priorizado',  label: 'Backlog Priorizado', role: 'fluxo' },
  { k: 'execucao',    label: 'Execução',           role: 'execucao' },
  { k: 'concluido',   label: 'Concluído',          role: 'concluido' },
  { k: 'descartado',  label: 'Descartado',         role: 'descartado' },
];
// Chaves já vistas em boards antigos, mapeadas pelo papel da coluna.
const ROLE_POR_CHAVE = {
  backlog: 'entrada', iniciativas: 'entrada', discovery: 'fluxo', priorizado: 'fluxo',
  andamento: 'execucao', execucao: 'execucao', concluido: 'concluido', descartado: 'descartado',
};
export function chavePorRole(role) { const c = KCOLS_DEFAULT.find(x => x.role === role); return c ? c.k : 'iniciativas'; }
// Coluna de entrada do Kanban, sempre pelo papel — nunca pelo nome, que já mudou uma vez.
export function chaveEntrada(data) { const c = colunasKanban(data).find(x => (x.role || '') === 'entrada'); return c ? c.k : chavePorRole('entrada'); }
// Colunas calculadas a partir dos itens (SPEC §3, Derivados): não recebem arraste.
export const COLUNAS_DERIVADAS = ['execucao', 'concluido'];

// ---------- Seed (SPEC §3) — quadro vazio ----------
// Decisão de 17/09/2026: o board nasce sem conteúdo. As cinco squads e o calendário do quarter são
// a estrutura mínima para começar; itens e iniciativas são criados pelos PMs. Cores e prefixos são DADO.
const SQUADS_INICIAIS = [
  ['Payment', 'PAY', '#36b37e'],
  ['Platform', 'PLA', '#0f7864'],
  ['Cakto Members', 'MEM', '#fdd465'],
  ['Bank & App', 'BNK', '#f4cd97'],
  ['MRR & Fiscal', 'MRR', '#65a76b'],
];
export const SEED = { activeQuarter: 'q3-2026', order: ['q3-2026'], iniciativas: [], quarters: {
  'q3-2026': { label: 'Q3 2026', start: '2026-07-07', days: 14, count: 6, archived: false,
    squads: SQUADS_INICIAIS.map(([name, prefix, color]) => ({ name, prefix, archived: false, color, groupByCat: true, pm: '', tl: '', categories: [], items: [], backlog: [] })) },
} };

// ---------- Datas e utilitários ----------
export function parseD(str) { if (!str) return null; const [y, m, d] = str.split('-').map(Number); return new Date(y, m - 1, d); }
export function addDays(dt, n) { const d = new Date(dt); d.setDate(d.getDate() + n); return d; }
export function fmtBR(str) { if (!str) return '—'; const [y, m, d] = str.split('-'); return d + '/' + m; }
export function dd(n) { return ('0' + n).slice(-2); }
export function avg(arr) { return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0; }

// ---------- normalize (SPEC §3, invariantes) ----------
export function normalizeSquad(sq) {
  if (!sq.categories) sq.categories = []; if (!sq.backlog) sq.backlog = []; if (!sq.items) sq.items = [];
  if (sq.groupByCat === undefined) sq.groupByCat = true;
  if (sq.pm === undefined) sq.pm = ''; if (sq.tl === undefined) sq.tl = '';   // padrões da squad (18/09/2026, §7)
  // `subs` não é apagado aqui: a migração abaixo precisa lê-lo para converter subcategoria em categoria.
}

// ---------- Migração 4b (17/09/2026): "1 iniciativa = N itens" ----------
// Regra decidida (docs/decisions.md): cada item vira uma iniciativa de UM item e cada subcategoria vira
// categoria. Nada vira iniciativa de vários itens automaticamente — errar para o lado da categoria é
// reversível em dois cliques; errar para o lado da iniciativa travaria a conclusão de coisas independentes.
function migraVinculo(d) {
  const nova = (sqName, titulo, cat) => criaIniciativa(d, sqName, titulo || 'Sem nome', cat, 'priorizado').code;
  Object.values(d.quarters).forEach(q => {
    q.squads.forEach(sq => {
      // 1. Subcategoria vira categoria, na posição seguinte à categoria mãe.
      const comSub = sq.categories.filter(c => (c.subs || []).length);
      comSub.forEach(c => {
        (c.subs || []).forEach(s => { if (s && !sq.categories.some(x => x.name === s)) sq.categories.push({ name: s }); });
      });
      // 2. A categoria mãe some se todos os itens dela estavam sob subcategorias.
      comSub.forEach(c => {
        const direto = sq.items.some(it => (it.cat || '') === c.name && !it.sub) || sq.backlog.some(b => (b.cat || '') === c.name);
        if (!direto) { const i = sq.categories.findIndex(x => x.name === c.name); if (i >= 0) sq.categories.splice(i, 1); }
      });
      sq.categories.forEach(c => { delete c.subs; });
      // 3. Cada item (roadmap e backlog) ganha a iniciativa dele.
      sq.items.forEach(it => {
        if (!it.ini) it.ini = nova(sq.name, it.n, it.sub || it.cat || '');
        delete it.cat; delete it.sub;
        if (it.arq === undefined) it.arq = ''; if (it.nota === undefined) it.nota = '';
      });
      sq.backlog.forEach(b => {
        if (!b.ini) b.ini = nova(sq.name, b.n, b.cat || '');
        delete b.cat;
        if (b.arq === undefined) b.arq = ''; if (b.nota === undefined) b.nota = '';
      });
    });
  });
}
export function normalize(d) {
  if (!d.quarters && d.config && d.squads) {
    d = { activeQuarter: 'q1', order: ['q1'], quarters: { q1: { label: d.config.quarter || 'Quarter', start: d.config.start || '2026-07-07', days: d.config.days || 14, count: d.config.count || 6, archived: false, squads: d.squads.map(s => ({ name: s.name, color: s.color, groupByCat: false, categories: [], items: (s.items || []).map(it => ({ ...it, cat: it.cat || '', sub: it.sub || '' })), backlog: [] })) } }, demandas: d.demandas };
  }
  // A2 (17/09/2026): a fila do Kanban passa a se chamar `iniciativas`; `demandas` é a chave antiga.
  if (!d.iniciativas) d.iniciativas = d.demandas || [];
  delete d.demandas;
  // Colunas fixas (A3): chave, rótulo e ordem vêm sempre de KCOLS_DEFAULT — o board não decide isso.
  // Os cards são remapeados pelo papel da coluna, o que cobre as chaves antigas (`backlog`, `discovery`,
  // `andamento`) e a renomeação de 18/09/2026 (`backlog` → `iniciativas`).
  d.kcols = JSON.parse(JSON.stringify(KCOLS_DEFAULT));
  d.iniciativas.forEach(x => { x.col = chavePorRole(ROLE_POR_CHAVE[x.col] || 'entrada'); });
  // C11: duração da sprint só 7/14/21/28. C8: cada squad tem `prefix` (único no quarter) e `archived`.
  Object.values(d.quarters).forEach(q => {
    if (!DURACOES_SPRINT.includes(Number(q.days))) q.days = 14;
    q.squads.forEach(s => { if (s.archived === undefined) s.archived = false; });
    q.squads.forEach(s => { if (!s.prefix) s.prefix = prefixoLivre(q, prefixoDeNome(s.name), s); });
    q.squads.forEach(normalizeSquad);
  });
  // A4 (09/09/2026): anexo é link — os campos de arquivo embutido são descartados ao carregar.
  d.iniciativas.forEach(dm => {
    delete dm.anexoNome; delete dm.anexoConteudo; delete dm.subsTotal; delete dm.subsDone;   // progresso vem dos itens (17/09/2026)
    if (!dm.createdAt) dm.createdAt = Date.now();
    if (!dm.code) dm.code = prefixoSquad(d, dm.sq) + '-' + (100 + dm.id);
    if (dm.cat === undefined) dm.cat = ''; if (dm.nota === undefined) dm.nota = ''; if (dm.arq === undefined) dm.arq = '';
  });
  migraVinculo(d);
  // Invariante (§3): iniciativa fora da coluna de entrada tem ao menos um item. Card antigo sem item volta à entrada.
  const entrada = chaveEntrada(d);
  d.iniciativas.forEach(dm => { if (dm.col !== entrada && !temItens(d, dm.code)) dm.col = entrada; });
  return d;
}
export function seedNovo() { return normalize(JSON.parse(JSON.stringify(SEED))); }

// ---------- Calendário (SPEC §6.2, §7) ----------
export function sprintsOf(q) {
  const start = parseD(q.start), out = [];
  for (let i = 0; i < q.count; i++) {
    const s = addDays(start, i * q.days), e = addDays(start, (i + 1) * q.days - 1);
    out.push({ label: 'Sprint ' + String(i + 1).padStart(2, '0'), start: s, end: e, range: dd(s.getDate()) + '/' + dd(s.getMonth() + 1) + '–' + dd(e.getDate()) + '/' + dd(e.getMonth() + 1) });
  }
  return out;
}
export function timelineOf(q) { const min = parseD(q.start), max = addDays(min, q.days * q.count); return { min, max, span: max - min }; }
export function monthBands(q) {
  const sp = sprintsOf(q), b = [];
  sp.forEach(s => { const m = s.start.getMonth(), y = s.start.getFullYear(), last = b[b.length - 1]; if (last && last.m === m && last.y === y) last.span++; else b.push({ m, y, span: 1 }); });
  return b.map(x => ({ label: MESES[x.m], span: x.span }));
}

// ---------- Acesso a dados (CLAUDE.md: componentes não leem `data` direto) ----------
export function quarterAtivo(data) { return data.quarters[data.activeQuarter]; }
export function squadAtiva(data, i) { return quarterAtivo(data).squads[i]; }
export function iniciativas(data) { return data.iniciativas || []; }
export function colunasKanban(data) { return data.kcols || []; }     // estrutura fixa (A3)

// ---------- Vínculo iniciativa ↔ item (SPEC §3, 17/09/2026) ----------
export function iniciativaPorCode(data, code) { return iniciativas(data).find(x => x.code === code) || null; }
export function itensDaIniciativa(sq, code) { return (sq.items || []).filter(it => it.ini === code); }
export function backlogDaIniciativa(sq, code) { return (sq.backlog || []).filter(b => b.ini === code); }
// Todos os itens de uma iniciativa, em qualquer squad e quarter — usado pelas travas e pelos derivados.
export function itensGlobais(data, code) {
  const out = [];
  Object.values(data.quarters).forEach(q => q.squads.forEach(sq => {
    (sq.items || []).forEach(it => { if (it.ini === code) out.push({ it, sq, q, backlog: false }); });
    (sq.backlog || []).forEach(b => { if (b.ini === code) out.push({ it: b, sq, q, backlog: true }); });
  }));
  return out;
}
export function temItens(data, code) { return itensGlobais(data, code).length > 0; }
// Derivados (SPEC §3): média simples do progresso, envelope de datas, contagem de entregues.
export function derivadosDaIniciativa(data, code) {
  const todos = itensGlobais(data, code).filter(x => !x.backlog).map(x => x.it);
  const vivos = todos.filter(it => !it.arq);
  const datas = vivos.filter(it => it.s && it.e);
  return {
    total: vivos.length,
    entregues: vivos.filter(it => it.st === 'entregue').length,
    pct: avg(vivos.map(it => it.p)),
    s: datas.length ? datas.map(it => it.s).sort()[0] : '',
    e: datas.length ? datas.map(it => it.e).sort().slice(-1)[0] : '',
  };
}
// Coluna em que o card aparece: Descartado e a entrada são humanos; Execução e Concluído vêm dos itens.
export function colunaDe(data, ini) {
  if (!ini) return chaveEntrada(data);
  if (ini.col === 'descartado' || ini.arq === 'descartado') return 'descartado';
  const ligados = itensGlobais(data, ini.code).filter(x => !x.it.arq);   // arquivado sai de circulação (§4.3)
  if (!ligados.length) return ini.col;
  const noRoadmap = ligados.filter(x => !x.backlog);
  if (!noRoadmap.length) return 'priorizado';
  if (noRoadmap.every(x => x.it.st === 'entregue')) return 'concluido';
  return 'execucao';
}
// Fora de circulação (§4.3): iniciativas arquivadas ou descartadas, com de onde vieram — a lista de §7.
export function foraDeCirculacao(data) {
  return iniciativas(data).filter(i => i.arq === 'arquivado' || i.arq === 'descartado').map(ini => {
    const ligados = itensGlobais(data, ini.code);
    const origens = [...new Set(ligados.map(x => x.q.label + ' · ' + x.sq.name))];
    return { ini, itens: ligados.length, origens, noRoadmap: ligados.filter(x => !x.backlog).length };
  });
}
// Categoria de um item, resolvida pela iniciativa (a categoria é dela — §3). "" = sem categoria.
export function categoriaDoItem(data, sq, it) {
  const ini = iniciativaPorCode(data, it.ini);
  if (!ini || !ini.cat) return '';
  return (sq.categories || []).some(c => c.name === ini.cat) ? ini.cat : '';
}
// Iniciativas com presença nesta squad, na ordem em que os itens aparecem na tabela.
export function iniciativasNaSquad(data, sq) {
  const vistos = [], out = [];
  (sq.items || []).forEach(it => { if (it.ini && !vistos.includes(it.ini)) { vistos.push(it.ini); out.push(iniciativaPorCode(data, it.ini)); } });
  return out.filter(Boolean);
}

// Modelo de linhas do roadmap (SPEC §5.1): categoria → iniciativa → item, na mesma ordem para a
// tabela e para o Gantt, que consomem daqui para nunca discordarem.
// Tipos: 'categoria' | 'iniciativa' (grupo, 2+ itens) | 'item' (sozinho = iniciativa de um item) | 'vazio'
export function linhasRoadmap(data, sq, filtro) {
  const passa = filtro || (() => true);
  const idx = (sq.items || []).map((it, j) => ({ it, j })).filter(x => !x.it.arq && passa(x.it));   // §4.3: arquivado e descartado saem do roadmap
  const linhas = [];
  const daCategoria = nome => {
    const codes = [];
    idx.forEach(x => { const c = categoriaDoItem(data, sq, x.it); if (c === nome && !codes.includes(x.it.ini)) codes.push(x.it.ini); });
    return codes;
  };
  const empilha = codes => codes.forEach(code => {
    const ini = iniciativaPorCode(data, code);
    const meus = idx.filter(x => x.it.ini === code);
    if (meus.length === 1) { linhas.push({ tipo: 'item', code, ini, j: meus[0].j, it: meus[0].it, sozinho: true, nivel: 1 }); return; }
    const der = derivadosDaIniciativa(data, code);
    linhas.push({ tipo: 'iniciativa', code, ini, titulo: ini ? ini.t : code, ...der, nivel: 1 });
    meus.forEach(x => linhas.push({ tipo: 'item', code, ini, j: x.j, it: x.it, sozinho: false, nivel: 2 }));
  });
  if (!sq.groupByCat) { empilha(iniciativasNaSquad(data, sq).map(i => i.code).filter(c => idx.some(x => x.it.ini === c))); return linhas; }
  (sq.categories || []).forEach(c => {
    const codes = daCategoria(c.name);
    const itens = idx.filter(x => categoriaDoItem(data, sq, x.it) === c.name);
    linhas.push({ tipo: 'categoria', nome: c.name, pct: avg(itens.map(x => x.it.p)), total: itens.length, vazia: !codes.length, nivel: 0 });
    if (!codes.length) linhas.push({ tipo: 'vazio', nivel: 1 });
    empilha(codes);
  });
  const semCat = daCategoria('');
  if (!semCat.length) return linhas;
  if (!(sq.categories || []).length) { empilha(semCat); return linhas; }   // squad sem categorias: iniciativas direto (§6.1)
  const itensSem = idx.filter(x => !categoriaDoItem(data, sq, x.it));
  linhas.push({ tipo: 'categoria', nome: SEM_CATEGORIA, virtual: true, pct: avg(itensSem.map(x => x.it.p)), total: itensSem.length, vazia: false, nivel: 0 });
  empilha(semCat);
  return linhas;
}
export function itensDoQuarter(q) { return q.squads.reduce((n, s) => n + (s.items || []).length, 0); }
export function squadsDoQuarter(q) { return q.squads; }                              // todas, inclusive arquivadas (Config)
export function squadsAtivas(q) { return q.squads.filter(s => !s.archived); }           // abas, Gantt, Kanban
export function primeiraSquadAtiva(q) { const i = q.squads.findIndex(s => !s.archived); return i < 0 ? 0 : i; }
// Squad com o mesmo nome em outro quarter = histórico (impede excluir; arquivar é o caminho).
export function temHistorico(data, name, qAtual) { return Object.values(data.quarters).some(q => q !== qAtual && q.squads.some(s => s.name === name)); }
export function iniciativasDaSquad(data, name) { return iniciativas(data).filter(dm => dm.sq === name); }
export function itensDaSquad(sq) { return sq.items; }
export function categoriasDaSquad(sq) { return sq.categories; }
// Quarters na ordem de exibição, com o ativo marcado — a lista da Config.
export function quartersOrdenados(data) { return data.order.map(id => ({ id, q: data.quarters[id], on: id === data.activeQuarter })); }
// Opções do seletor de quarter do header (C7, 09/09/2026): todos os quarters, arquivados por último e marcados.
export function quartersDoSeletor(data) {
  const op = id => { const x = data.quarters[id]; return { id, label: x.label, archived: !!x.archived, ativo: id === data.activeQuarter, meta: x.archived ? 'arquivado' : 'Sprint 01–' + String(x.count).padStart(2, '0') }; };
  const ativos = data.order.filter(id => !data.quarters[id].archived).map(op);
  const arquivados = data.order.filter(id => data.quarters[id].archived).map(op);
  return { ativos, arquivados };
}

// ---------- Gantt (SPEC §6) ----------
export function passaFiltro(it, f) {
  if (f === 'risco') return it.pv === 'risco' || it.pv === 'atraso';
  if (f === 'dev') return it.st === 'dev';
  return true;
}
// Geometria e conteúdo da barra — o componente aplica os estilos.
export function geometriaBarra(it, tl, q, showLabel) {
  const s = parseD(it.s), e = parseD(it.e);
  if (!s || !e) return { hasBar: false, isHist: false };
  if (e < tl.min) return { hasBar: false, isHist: true, histLabel: 'antes de ' + q.label.split(' ')[0] };
  if (s > tl.max) return { hasBar: false, isHist: false };
  const clampS = Math.max(s, tl.min), clampE = Math.min(addDays(e, 1), tl.max);
  const left = (clampS - tl.min) / tl.span * 100;
  const width = Math.max((clampE - clampS) / tl.span * 100, 2.2);
  const st = STATUS[it.st], pv = PREV[it.pv];
  return {
    hasBar: true, isHist: false, left, width, st, pv,
    barLabel: showLabel ? (s < tl.min ? '◀ ' : '') + it.p + '%' : (s < tl.min ? '◀' : ''),
    hasDot: it.pv !== 'prazo' && it.pv !== 'prod',
    title: it.n + ' · ' + fmtBR(it.s) + ' → ' + fmtBR(it.e) + ' · ' + st.label + ' · ' + pv.label + ' · ' + it.p + '%',
  };
}
// KPIs (C10, 09/09/2026): calculados sobre os itens filtrados, independentes do colapso;
// concluído = status `entregue`, exclusivamente — o percentual é progresso, não conclusão (SPEC §6.1).
export function kpisVazios() { return { done: 0, dev: 0, risk: 0, total: 0 }; }
export function acumulaKpi(counts, it) {
  counts.total++;
  if (it.st === 'entregue') counts.done++;
  if (it.st === 'dev') counts.dev++;
  if (it.pv === 'risco' || it.pv === 'atraso') counts.risk++;
}
export function kpisDeItens(items) { const c = kpisVazios(); items.forEach(it => acumulaKpi(c, it)); return c; }

// ---------- Tabela / Roadmap (SPEC §5) ----------
// B4 (09/09/2026): grupo virtual dos itens sem categoria — cabeçalho na tabela e layer no Gantt, alvo de arraste; não é uma categoria.
export const SEM_CATEGORIA = 'Sem categoria';
// Cria o card da iniciativa. Único lugar que gera `code` — imutável depois de criado (kanban-card-spec §4.5).
export function criaIniciativa(data, sqName, titulo, cat, col) {
  const id = iniciativas(data).reduce((mx, x) => Math.max(mx, x.id || 0), 0) + 1;
  const ini = {
    id, code: prefixoSquad(data, sqName) + '-' + (100 + id), t: titulo || '', d: '', sq: sqName,
    col: col || 'priorizado', cat: cat || '', prio: '', tipo: 'Delivery', est: '', perQ: '', perM: '',
    pm: '', tl: '', origem: '', motivo: '', nota: '', arq: '', link: '', dep: [], createdAt: Date.now(),
  };
  // PM e Tech Lead padrão da squad (§7, 18/09/2026): o card nasce preenchido, o que resolve sozinho
  // a obrigatoriedade desses campos na passagem de coluna (A.2).
  const sq = quarterAtivo(data).squads.find(x => x.name === sqName);
  if (sq) { ini.pm = sq.pm || ''; ini.tl = sq.tl || ''; }
  data.iniciativas.push(ini);
  return ini;
}
function itemVazio(code) { return { n: '', s: '', e: '', st: 'backlog', pv: 'nao', p: 0, ini: code, arq: '', nota: '' }; }
// Iniciativa sem nenhum item deixa de existir (invariante de §3). Devolve true se o card foi removido.
function limpaSeVazia(data, code) {
  if (temItens(data, code)) return false;
  data.iniciativas = iniciativas(data).filter(x => x.code !== code);
  return true;
}

export function setCampoItem(data, sq, j, key, v) {
  if (key === 'p') v = Math.max(0, Math.min(100, parseInt(v) || 0));
  const it = sq.items[j];
  it[key] = v;
  // Iniciativa de um item só tem um nome, compartilhado com o card (17/09/2026).
  if (key === 'n') { const ini = iniciativaPorCode(data, it.ini); if (ini && itensGlobais(data, it.ini).length === 1) ini.t = v; }
}
// + Adicionar item ao roadmap: cria a iniciativa e o primeiro item dela (C9: sem datas).
export function novaIniciativaNoRoadmap(data, sq, cat) {
  const ini = criaIniciativa(data, sq.name, '', cat || '', 'priorizado');
  sq.items.push(itemVazio(ini.code));
  return ini.code;
}
// + item numa iniciativa existente: entra logo depois do último item dela. Não cria card.
export function novoItemNaIniciativa(sq, code) {
  const last = ultimoIndice(sq.items, it => it.ini === code);
  sq.items.splice(last >= 0 ? last + 1 : sq.items.length, 0, itemVazio(code));
}
// Remover o último item de uma iniciativa remove também o card dela. Devolve true nesse caso.
export function removeItem(data, sq, j) { const code = sq.items[j].ini; sq.items.splice(j, 1); return limpaSeVazia(data, code); }
export function enviarAoBacklog(sq, j) { const [x] = sq.items.splice(j, 1); sq.backlog.push({ n: x.n, ini: x.ini, note: '' }); }
export function promoverAoRoadmap(sq, k) { const [x] = sq.backlog.splice(k, 1); const it = itemVazio(x.ini); it.n = x.n; sq.items.push(it); }
export function novoItemBacklog(data, sq) { const ini = criaIniciativa(data, sq.name, '', '', 'priorizado'); sq.backlog.push({ n: '', ini: ini.code, note: '' }); }
export function removeItemBacklog(data, sq, k) { const code = sq.backlog[k].ini; sq.backlog.splice(k, 1); return limpaSeVazia(data, code); }
export function setNomeBacklog(data, sq, k, v) {
  const b = sq.backlog[k]; b.n = v;
  const ini = iniciativaPorCode(data, b.ini); if (ini && itensGlobais(data, b.ini).length === 1) ini.t = v;
}
export function alternaAgrupamento(sq) { sq.groupByCat = !sq.groupByCat; }
// Reordenar dentro da tabela; `code` (opcional) troca a iniciativa do item.
export function reordenarItem(sq, from, to, code) {
  const arr = sq.items;
  const [m] = arr.splice(from, 1);
  if (code !== undefined) m.ini = code;
  if (from < to) to--;
  to = Math.max(0, Math.min(arr.length, to));
  arr.splice(to, 0, m);
}
// Mover item para outra iniciativa (§5.3). Recusa se for o último item da origem.
export function moveItemParaIniciativa(data, sq, from, code, to) {
  const it = sq.items[from];
  if (it.ini !== code && itensGlobais(data, it.ini).length <= 1) {
    return { ok: false, msg: 'A iniciativa ficaria sem itens — mova a iniciativa inteira' };
  }
  const destino = to !== undefined ? to : (() => { const last = ultimoIndice(sq.items, x => x.ini === code); return last >= 0 ? last + 1 : sq.items.length; })();
  reordenarItem(sq, from, destino, code);
  return { ok: true };
}
export function moveIniciativaParaCategoria(data, code, cat) { const ini = iniciativaPorCode(data, code); if (ini) ini.cat = cat || ''; }
export function setTituloIniciativa(data, code, v) {
  const ini = iniciativaPorCode(data, code); if (!ini) return;
  ini.t = v;
  const ligados = itensGlobais(data, code);
  if (ligados.length === 1) ligados[0].it.n = v;   // iniciativa de um item só: um nome só
}
// Visão plana: digitar uma categoria que não existe na squad cria a categoria.
export function defineCategoriaDaIniciativa(data, sq, code, nome) {
  const n = (nome || '').trim();
  if (n && !sq.categories.some(c => c.name === n)) sq.categories.push({ name: n });
  moveIniciativaParaCategoria(data, code, n);
}
// Extrair item: vira iniciativa própria, com card novo, mantendo datas, status e progresso.
export function extrairItem(data, sq, j) {
  const it = sq.items[j];
  if (itensGlobais(data, it.ini).length <= 1) return { ok: false, msg: 'A iniciativa já tem um item só' };
  const origem = iniciativaPorCode(data, it.ini);
  const ini = criaIniciativa(data, sq.name, it.n, origem ? origem.cat : '', 'priorizado');
  if (origem) Object.assign(ini, { pm: origem.pm, tl: origem.tl, tipo: origem.tipo, prio: origem.prio, origem: origem.origem });
  it.ini = ini.code;
  return { ok: true, code: ini.code };
}
// Juntar iniciativas: os itens da origem passam para o destino e o card da origem some.
export function juntarIniciativas(data, codeOrigem, codeDestino) {
  if (!codeOrigem || codeOrigem === codeDestino) return { ok: false, msg: '' };
  if (!iniciativaPorCode(data, codeDestino)) return { ok: false, msg: '' };
  itensGlobais(data, codeOrigem).forEach(x => { x.it.ini = codeDestino; });
  data.iniciativas = iniciativas(data).filter(x => x.code !== codeOrigem);
  return { ok: true, code: codeDestino };
}
// ---------- Saída de circulação (SPEC §4.3) ----------
// Arquivar e descartar não são status: marcam `arq` e preservam `st`, `pv` e `p` para a retomada.
function marcaCirculacao(data, code, marca, nota) {
  const ini = iniciativaPorCode(data, code);
  if (!ini) return 0;
  ini.arq = marca; ini.nota = nota || '';
  const ligados = itensGlobais(data, code);
  ligados.forEach(x => { x.it.arq = marca; x.it.nota = nota || ''; });
  return ligados.length;
}
// Despriorizada por tempo indeterminado: volta à coluna de entrada e os itens saem do roadmap e do Gantt.
export function arquivaIniciativa(data, code, nota) {
  const n = marcaCirculacao(data, code, 'arquivado', nota);
  const ini = iniciativaPorCode(data, code); if (ini) ini.col = chaveEntrada(data);
  return n;
}
// Descartada: exige motivo (A.2); o card fica na coluna Descartado e os itens saem do roadmap.
export function descartaIniciativa(data, code, nota) {
  const ini = iniciativaPorCode(data, code);
  if (!ini) return { ok: false, msg: '' };
  if (!ini.motivo) return { ok: false, msg: 'Falta o motivo do descarte — defina na engrenagem do card' };
  const n = marcaCirculacao(data, code, 'descartado', nota);
  ini.col = 'descartado';
  return { ok: true, itens: n };
}
// Retomar devolve a iniciativa ao Backlog Priorizado (§7, 18/09/2026): quem foi despriorizado volta para
// ser replanejado, não para o Gantt com as datas antigas. Os itens saem do roadmap e vão para o backlog da
// squad; o estado em que pararam vira observação, para o PM não perder o contexto ao repriorizar.
export function retomaIniciativa(data, code, squadNome) {
  const ini = iniciativaPorCode(data, code);
  if (!ini) return { semCategoria: false };
  itensGlobais(data, code).forEach(x => {
    x.it.arq = ''; x.it.nota = '';
    if (x.backlog) return;
    const i = x.sq.items.indexOf(x.it);
    if (i >= 0) x.sq.items.splice(i, 1);
    const st = STATUS[x.it.st];
    const andava = x.it.st !== 'backlog' || x.it.p > 0;
    const resumo = andava && st ? 'estava em ' + st.label + (x.it.p ? ' · ' + x.it.p + '%' : '') : '';
    x.sq.backlog.push({ n: x.it.n, ini: code, note: resumo, arq: '', nota: '' });
  });
  ini.arq = ''; ini.nota = ''; ini.col = 'priorizado';
  return squadNome && squadNome !== ini.sq ? moveIniciativaParaSquad(data, code, squadNome) : { semCategoria: false };
}

// Mover iniciativa de squad: leva os itens em todos os quarters não arquivados; `code` não muda (§3).
export function moveIniciativaParaSquad(data, code, nome) {
  const ini = iniciativaPorCode(data, code);
  if (!ini || ini.sq === nome) return { semCategoria: false };
  const antiga = ini.sq;
  ini.sq = nome;
  let destinoTemCat = true;
  Object.values(data.quarters).forEach(q => {
    if (q.archived) return;
    const de = q.squads.find(s => s.name === antiga), para = q.squads.find(s => s.name === nome);
    if (!de || !para) return;
    const separa = arr => { const fica = [], vai = []; arr.forEach(x => (x.ini === code ? vai : fica).push(x)); return [fica, vai]; };
    const [fi, vi] = separa(de.items || []); de.items = fi; para.items.push(...vi);
    const [fb, vb] = separa(de.backlog || []); de.backlog = fb; para.backlog.push(...vb);
    if (ini.cat && !(para.categories || []).some(c => c.name === ini.cat)) destinoTemCat = false;
  });
  const semCategoria = !!ini.cat && !destinoTemCat;
  if (semCategoria) ini.cat = '';
  return { semCategoria };
}
export function ultimoIndice(items, pred) { let idx = -1; items.forEach((it, i) => { if (pred(it)) idx = i; }); return idx; }
export function novaCategoria(sq) { let n = sq.categories.length + 1, nn = 'Nova categoria'; while (sq.categories.some(c => c.name === nn)) nn = 'Nova categoria ' + (++n); sq.categories.push({ name: nn }); if (!sq.groupByCat) sq.groupByCat = true; }
// B5 (09/09/2026): devolve false, sem alterar nada, se já existe outra com o mesmo nome.
// A categoria é da iniciativa (17/09/2026): renomear e remover propagam para os cards, não para os itens.
export function renomeiaCategoria(data, sq, ci, nn) {
  if (sq.categories.some((c, i) => i !== ci && c.name === nn)) return false;
  const old = sq.categories[ci].name;
  iniciativas(data).forEach(i => { if (i.sq === sq.name && i.cat === old) i.cat = nn; });
  sq.categories[ci].name = nn;
  return true;
}
export function removeCategoria(data, sq, ci) {
  const name = sq.categories[ci].name;
  iniciativas(data).forEach(i => { if (i.sq === sq.name && i.cat === name) i.cat = ''; });
  sq.categories.splice(ci, 1);
}

// ---------- Config / quarters / squads (SPEC §7) — mutações ----------
export function setCampoQuarter(q, key, v, num) { if (num) v = Math.max(num[0], Math.min(num[1], parseInt(v) || num[0])); q[key] = v; }
export function setRotuloQuarter(data, id, v) { data.quarters[id].label = v; }
export function setCampoSquad(sq, key, v) { sq[key] = v; }
// Prefixo editável: maiúsculas, 2–4 letras/dígitos, único no quarter. Devolve false se inválido ou repetido.
export function setPrefixoSquad(q, i, v) {
  const p = String(v || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 4);
  if (p.length < 2 || q.squads.some((s, k) => k !== i && s.prefix === p)) return false;
  q.squads[i].prefix = p; return true;
}
// O que impede arquivar ou excluir: itens no roadmap, no backlog ou iniciativas no Kanban. Devolve mensagem ou null.
export function travaSquad(data, q, i, acao) {
  const s = q.squads[i];
  const partes = [];
  if (s.items.length) partes.push(s.items.length + (s.items.length === 1 ? ' item no roadmap' : ' itens no roadmap'));
  if (s.backlog.length) partes.push(s.backlog.length + ' no backlog');
  const k = iniciativasDaSquad(data, s.name).length; if (k) partes.push(k + (k === 1 ? ' iniciativa no Kanban' : ' iniciativas no Kanban'));
  return partes.length ? 'Squad com ' + partes.join(', ') + ' — remaneje antes de ' + acao : null;
}
export function arquivaSquad(q, i) { q.squads[i].archived = !q.squads[i].archived; }
export function ativarQuarter(data, id) { data.activeQuarter = id; }
export function arquivaQuarter(data, id) { data.quarters[id].archived = !data.quarters[id].archived; }
// Devolve mensagem de trava ou null se excluiu.
export function excluirQuarter(data, id) {
  if (itensDoQuarter(data.quarters[id]) > 0) return 'Quarter com itens no roadmap não pode ser excluído';
  if (id === data.activeQuarter) return 'Ative outro quarter antes de excluir este';
  delete data.quarters[id]; data.order = data.order.filter(z => z !== id);
  return null;
}
export function novoQuarter(data) {
  const cur = data.quarters[data.activeQuarter];
  const id = 'q' + Date.now();
  const t = new Date();
  const start = t.getFullYear() + '-' + dd(t.getMonth() + 1) + '-' + dd(t.getDate());
  let n = 1, label = 'Novo quarter'; while (Object.values(data.quarters).some(x => x.label === label)) label = 'Novo quarter ' + (++n);
  data.quarters[id] = { label, start, days: 14, count: 6, archived: false, squads: cur.squads.map(s => ({ name: s.name, prefix: s.prefix, archived: !!s.archived, color: s.color, groupByCat: s.groupByCat, pm: s.pm || '', tl: s.tl || '', categories: JSON.parse(JSON.stringify(s.categories || [])), items: [], backlog: [] })) };
  data.order.unshift(id);
  data.activeQuarter = id;
  return id;
}
// Devolve o índice da squad criada.
export function novaSquad(data) {
  const q = quarterAtivo(data); let n = q.squads.length + 1, name = 'Nova squad'; while (q.squads.some(s => s.name === name)) name = 'Nova squad ' + (++n);
  q.squads.push({ name, prefix: prefixoLivre(q, prefixoDeNome(name)), archived: false, color: PALETTE[q.squads.length % PALETTE.length], groupByCat: true, pm: '', tl: '', categories: [], items: [], backlog: [] });
  return q.squads.length - 1;
}
export function removeSquad(data, i) { quarterAtivo(data).squads.splice(i, 1); }
// Importar planilha (A11: substitui). Cada linha vira uma iniciativa de um item; `Pilar` vira a
// categoria dela (SPEC §8, 17/09/2026) — o `normalize()` faz a conversão logo em seguida.
export function substituiSquads(data, squads) {
  const q = quarterAtivo(data);
  const nomes = squads.map(s => s.name);
  data.iniciativas = iniciativas(data).filter(i => !nomes.includes(i.sq) || !q.squads.some(s => s.name === i.sq));
  q.squads = squads;
  normalize(data);
}

// ---------- Kanban (Anexo A) — gate e mutações ----------
export function podeMover(data, dragId, toKey) {
  const card = iniciativas(data).find(x => x.id === dragId);
  if (!card) return { ok: false, msg: '' };
  const atual = colunaDe(data, card);
  if (toKey === atual) return { ok: true };
  // Execução e Concluído são derivados dos itens (§3) — não recebem arraste.
  if (COLUNAS_DERIVADAS.includes(toKey)) return { ok: false, msg: 'Execução e Concluído vêm dos itens no roadmap — mova os itens, não o card' };
  const entrada = chaveEntrada(data);
  const toCol = colunasKanban(data).find(x => x.k === toKey);
  if (toKey === 'descartado') {
    if (!card.motivo) return { ok: false, msg: 'Falta o motivo do descarte — defina na engrenagem do card' };
    return { ok: true };
  }
  if (atual === entrada) {
    const req = [['sq', 'Squad'], ['pm', 'PM'], ['tl', 'Tech Lead'], ['tipo', 'Tipo'], ['est', 'Estimativa'], ['perQ', 'Período']];
    const miss = req.filter(([f]) => !card[f]).map(([, l]) => l);
    if (miss.length) return { ok: false, msg: 'Faltam para ' + (toCol ? toCol.label : 'avançar') + ': ' + miss.join(' · ') };
    const q = quarterAtivo(data);
    if (!q.squads.some(s => s.name === card.sq && !s.archived)) return { ok: false, msg: 'A squad do card não existe neste quarter' };
  }
  return { ok: true };
}
// Move o card para `col`; se `targetId` for outro card, entra na posição dele; se null, vai ao fim.
// Priorizar cria a entrada no backlog do roadmap — priorizar e entrar no backlog são o mesmo ato (§5.4).
export function moverIniciativa(data, dragId, targetId, col) {
  const arr = data.iniciativas;
  const from = arr.findIndex(x => x.id === dragId);
  if (from < 0) return;
  const [card] = arr.splice(from, 1);
  card.col = col;
  if (targetId != null && targetId !== dragId) {
    const to = arr.findIndex(x => x.id === targetId);
    arr.splice(to < 0 ? arr.length : to, 0, card);
  } else if (targetId == null) {
    arr.push(card);
  } else {
    arr.splice(from, 0, card);
  }
  if (col === 'priorizado' && !temItens(data, card.code)) {
    const sq = quarterAtivo(data).squads.find(s => s.name === card.sq);
    if (sq) { if (!sq.backlog) sq.backlog = []; sq.backlog.push({ n: card.t, ini: card.code, note: '' }); }
  }
}
export function novaIniciativa(data, m) {
  const ini = criaIniciativa(data, m.sq, m.t.trim(), '', chaveEntrada(data));
  Object.assign(ini, { d: m.d.trim(), link: m.link.trim(), prio: m.prio, tipo: m.tipo, est: m.est, perQ: m.perQ, perM: m.perM, origem: m.origem, motivo: m.motivo });
  if (m.pm) ini.pm = m.pm;   // vazio no modal mantém o padrão da squad
  if (m.tl) ini.tl = m.tl;
  return ini;
}
// Trocar a squad no card move os itens junto (§3). Devolve { semCategoria } para a interface avisar.
export function atualizaIniciativa(data, id, m) {
  const dm = iniciativas(data).find(x => x.id === id);
  if (!dm) return { semCategoria: false };
  const novoNome = m.sq, mudouSquad = novoNome && novoNome !== dm.sq;
  Object.assign(dm, { t: m.t.trim(), d: m.d.trim(), link: m.link.trim(), prio: m.prio, tipo: m.tipo, est: m.est, perQ: m.perQ, perM: m.perM, pm: m.pm, tl: m.tl, origem: m.origem, motivo: m.motivo });
  // Iniciativa de um item só: o nome do card e o do item são o mesmo (17/09/2026).
  const ligados = itensGlobais(data, dm.code);
  if (ligados.length === 1) ligados[0].it.n = dm.t;
  if (!mudouSquad) { dm.sq = novoNome || dm.sq; return { semCategoria: false }; }
  dm.sq = dm.sq;   // moveIniciativaParaSquad cuida da troca e do remanejo dos itens
  return moveIniciativaParaSquad(data, dm.code, novoNome);
}
export function removeIniciativa(data, id) {
  const dm = iniciativas(data).find(x => x.id === id);
  if (dm) itensGlobais(data, dm.code).forEach(x => {
    const arr = x.backlog ? x.sq.backlog : x.sq.items;
    const i = arr.indexOf(x.it); if (i >= 0) arr.splice(i, 1);
  });
  data.iniciativas = iniciativas(data).filter(x => x.id !== id);
}
// A3 (09/09/2026): colunas fixas — não há criar, renomear nem remover coluna. `kcols` permanece no dado até a remodelagem (4b, A2).
