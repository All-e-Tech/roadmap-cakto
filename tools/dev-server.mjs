// tools/dev-server.mjs — servidor de desenvolvimento local, sem dependências.
// Serve os arquivos estáticos da pasta do projeto e monta a função api/board.js em /api/board,
// igual ao que a Vercel faz em produção. Sem as envs do Supabase, o board fica em memória
// (some ao parar o servidor). Justificativa do arquivo: `python -m http.server` não roda a função.
//
//   Uso:  node tools/dev-server.mjs [porta]     (padrão 8080)
//
// Opcional: um arquivo .env.local na raiz (ignorado pelo git) com SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// e/ou APP_PASSWORD permite testar o adaptador real localmente. Nunca commitar esse arquivo.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const porta = Number(process.argv[2] || process.env.PORT || 8080);

const envLocal = path.join(raiz, '.env.local');
if (fs.existsSync(envLocal)) {
  for (const l of fs.readFileSync(envLocal, 'utf8').split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^(["'])(.*)\1$/, '$2');
  }
}
const { default: board } = await import('../api/board.js');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.md': 'text/plain; charset=utf-8', '.woff2': 'font/woff2',
};

http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');
  if (u.pathname === '/api/board') {
    try { await board(req, res); }
    catch (e) { console.error(e); res.statusCode = 500; res.end('erro na função'); }
    return;
  }
  let p = decodeURIComponent(u.pathname);
  if (p === '/') p = '/index.html';
  const arq = path.normalize(path.join(raiz, p));
  if (!arq.startsWith(raiz) || !fs.existsSync(arq) || fs.statSync(arq).isDirectory()) {
    res.statusCode = 404; res.setHeader('Content-Type', 'text/plain; charset=utf-8'); res.end('404 — ' + p); return;
  }
  res.setHeader('Content-Type', MIME[path.extname(arq).toLowerCase()] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store');
  fs.createReadStream(arq).pipe(res);
}).listen(porta, '127.0.0.1', () => {
  const store = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Supabase' : 'memória (efêmero)';
  console.log(`Roadmap Cakto em http://localhost:${porta}  ·  /api/board → ${store}${process.env.APP_PASSWORD ? '  ·  senha ativa' : ''}`);
});
