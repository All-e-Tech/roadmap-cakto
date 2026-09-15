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
export const KCOLS_DEFAULT = [
  { k: 'backlog',    label: 'Backlog',    role: 'entrada' },
  { k: 'priorizado', label: 'Priorizado', role: 'fluxo' },
  { k: 'execucao',   label: 'Execução',   role: 'execucao' },
  { k: 'concluido',  label: 'Concluído',  role: 'concluido' },
  { k: 'descartado', label: 'Descartado', role: 'descartado' },
];
export const SEED_DEMANDAS = (() => {
  const out = []; let id = 1;
  ['Payment', 'Platform', 'Cakto Members', 'Bank & App', 'MRR & Fiscal'].forEach(sq => {
    for (let i = 1; i <= 3; i++) out.push({ id: id++, t: sq + ' - Item ' + i, d: '', sq, col: 'backlog', link: '' });
  });
  return out;
})();

// ---------- Seed (SPEC §3) — dado inicial, não regra; cores e prefixos de squad são DADO ----------
export const SEED = { activeQuarter: 'q3-2026', order: ['q3-2026', 'q2-2026'], quarters: {
  'q3-2026': { label: 'Q3 2026', start: '2026-07-07', days: 14, count: 6, archived: false, squads: [
    { name: 'Payment', prefix: 'PAY', color: '#36b37e', groupByCat: true,
      categories: [{ name: 'Assinatura', subs: [] }, { name: 'Internacional', subs: ['Novos Métodos', 'Arquitetura', 'México'] }],
      items: [
        { n: 'FASE 0 · Arrumar a casa', s: '2026-07-07', e: '2026-07-20', st: 'entregue', pv: 'prod', p: 100, cat: 'Assinatura', sub: '' },
        { n: 'FASE 1 · MVP comercial', s: '2026-07-21', e: '2026-08-17', st: 'dev', pv: 'prazo', p: 15, cat: 'Assinatura', sub: '' },
        { n: 'FASE 2 · API + MCP', s: '2026-08-18', e: '2026-09-14', st: 'backlog', pv: 'nao', p: 0, cat: 'Assinatura', sub: '' },
        { n: 'FASE 3 · Inteligência', s: '2026-09-15', e: '2026-09-28', st: 'backlog', pv: 'nao', p: 0, cat: 'Assinatura', sub: '' },
        { n: 'Ebanx — MercadoPago', s: '2026-04-30', e: '2026-05-15', st: 'homolog', pv: 'bloq', p: 100, cat: 'Internacional', sub: 'Novos Métodos' },
        { n: 'Ebanx — Debit Card Internacional', s: '2026-07-20', e: '2026-07-29', st: 'homolog', pv: 'prod', p: 100, cat: 'Internacional', sub: 'Novos Métodos' },
        { n: 'LATAM — Colômbia (NEQUI · PSE)', s: '2026-08-04', e: '2026-08-17', st: 'backlog', pv: 'nao', p: 0, cat: 'Internacional', sub: 'Novos Métodos' },
        { n: 'LATAM — Chile (Webpay)', s: '2026-08-04', e: '2026-08-17', st: 'backlog', pv: 'nao', p: 0, cat: 'Internacional', sub: 'Novos Métodos' },
        { n: 'LATAM — Peru e Equador (Yape)', s: '2026-08-18', e: '2026-08-31', st: 'backlog', pv: 'nao', p: 0, cat: 'Internacional', sub: 'Novos Métodos' },
        { n: 'Checkout por Country Code', s: '2026-07-21', e: '2026-08-06', st: 'dev', pv: 'prazo', p: 50, cat: 'Internacional', sub: 'Arquitetura' },
        { n: 'Smart Routing', s: '2026-08-18', e: '2026-08-31', st: 'backlog', pv: 'nao', p: 0, cat: 'Internacional', sub: 'Arquitetura' },
        { n: 'CAKTO USD — Câmbio para Saque', s: '2026-07-20', e: '2026-07-29', st: 'homolog', pv: 'prod', p: 100, cat: 'Internacional', sub: 'México' },
      ],
      backlog: [
        { n: 'Order Bump e Add-ons na Assinatura', cat: 'Assinatura', note: 'aguardando discovery' },
        { n: 'Parcelamento Cartão de Crédito', cat: 'Internacional', note: 'depende de adquirente' },
        { n: 'Cartão de crédito Cakto', cat: '', note: 'ideia — sem prioridade' },
      ] },
    { name: 'Platform', prefix: 'PLA', color: '#0f7864', groupByCat: true, categories: [], items: [
        { n: 'Fluxo de Saque USD', s: '2026-07-14', e: '2026-08-04', st: 'dev', pv: 'prazo', p: 70, cat: '', sub: '' },
        { n: 'Partnership — Plataforma', s: '2026-08-04', e: '2026-08-25', st: 'dev', pv: 'prazo', p: 5, cat: '', sub: '' },
        { n: 'Partnership — ADMIN', s: '2026-08-25', e: '2026-09-08', st: 'backlog', pv: 'nao', p: 0, cat: '', sub: '' },
      ], backlog: [] },
    { name: 'Cakto Members', prefix: 'MEM', color: '#fdd465', groupByCat: true, categories: [], items: [
        { n: 'Novo Fluxo de Área de Membros', s: '2026-06-23', e: '2026-08-03', st: 'dev', pv: 'prazo', p: 50, cat: '', sub: '' },
        { n: '[BASE] Enablement de dados', s: '2026-07-07', e: '2026-08-03', st: 'qa', pv: 'prazo', p: 50, cat: '', sub: '' },
        { n: '[BASE] Consumir Conteúdo da V3', s: '2026-06-22', e: '2026-08-03', st: 'qa', pv: 'atraso', p: 50, cat: '', sub: '' },
      ], backlog: [] },
    { name: 'Bank & App', prefix: 'BNK', color: '#f4cd97', groupByCat: true, categories: [], items: [
        { n: 'Onboarding & KYC | Sustentação', s: '2026-07-20', e: '2026-08-31', st: 'dev', pv: 'prazo', p: 60, cat: '', sub: '' },
        { n: 'App | Portabilidade chave Pix', s: '2026-07-06', e: '2026-08-14', st: 'dev', pv: 'bloq', p: 70, cat: '', sub: '' },
        { n: 'Multicontas | Evolução', s: '2026-09-01', e: '2026-09-28', st: 'backlog', pv: 'nao', p: 0, cat: '', sub: '' },
      ], backlog: [] },
    { name: 'MRR & Fiscal', prefix: 'MRR', color: '#65a76b', groupByCat: true, categories: [], items: [
        { n: 'Reembolso', s: '2026-07-21', e: '2026-09-28', st: 'dev', pv: 'prazo', p: 40, cat: '', sub: '' },
        { n: 'Emissão NFSe (Cakto — interno)', s: '2026-07-21', e: '2026-08-03', st: 'qa', pv: 'risco', p: 90, cat: '', sub: '' },
        { n: 'Emissão NFSe (Produtor)', s: '2026-07-21', e: '2026-09-28', st: 'stories', pv: 'nao', p: 0, cat: '', sub: '' },
      ], backlog: [] },
  ] },
  'q2-2026': { label: 'Q2 2026', start: '2026-04-07', days: 14, count: 6, archived: true, squads: [
    { name: 'Payment', prefix: 'PAY', color: '#36b37e', groupByCat: true, categories: [], items: [
      { n: 'Worldpay — Integração', s: '2026-04-07', e: '2026-05-04', st: 'entregue', pv: 'prod', p: 100, cat: '', sub: '' },
    ], backlog: [] },
  ] },
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
  sq.items.forEach(it => { if (it.cat) { let c = sq.categories.find(x => x.name === it.cat); if (!c) { c = { name: it.cat, subs: [] }; sq.categories.push(c); } if (it.sub && !c.subs.includes(it.sub)) c.subs.push(it.sub); } });
}
export function normalize(d) {
  if (!d.quarters && d.config && d.squads) {
    d = { activeQuarter: 'q1', order: ['q1'], quarters: { q1: { label: d.config.quarter || 'Quarter', start: d.config.start || '2026-07-07', days: d.config.days || 14, count: d.config.count || 6, archived: false, squads: d.squads.map(s => ({ name: s.name, color: s.color, groupByCat: false, categories: [], items: (s.items || []).map(it => ({ ...it, cat: it.cat || '', sub: it.sub || '' })), backlog: [] })) } }, demandas: d.demandas };
  }
  if (!d.demandas) d.demandas = JSON.parse(JSON.stringify(SEED_DEMANDAS));
  if (!d.kcols || !d.kcols.length) d.kcols = JSON.parse(JSON.stringify(KCOLS_DEFAULT));
  const ROLE_BY_KEY = { backlog: 'entrada', discovery: 'fluxo', priorizado: 'fluxo', andamento: 'execucao', execucao: 'execucao', concluido: 'concluido', descartado: 'descartado' };
  d.kcols.forEach(c => { if (!c.role) c.role = ROLE_BY_KEY[c.k] || 'fluxo'; });
  const KREN = { 'Discovery': 'Priorizado', 'Em andamento': 'Execução' };
  d.kcols.forEach(c => { if (KREN[c.label]) c.label = KREN[c.label]; });
  if (!d.kcols.some(c => c.role === 'descartado')) d.kcols.push({ k: 'descartado', label: 'Descartado', role: 'descartado' });
  // C11: duração da sprint só 7/14/21/28. C8: cada squad tem `prefix` (único no quarter) e `archived`.
  Object.values(d.quarters).forEach(q => {
    if (!DURACOES_SPRINT.includes(Number(q.days))) q.days = 14;
    q.squads.forEach(s => { if (s.archived === undefined) s.archived = false; });
    q.squads.forEach(s => { if (!s.prefix) s.prefix = prefixoLivre(q, prefixoDeNome(s.name), s); });
    q.squads.forEach(normalizeSquad);
  });
  // A4 (09/09/2026): anexo é link — os campos de arquivo embutido são descartados ao carregar.
  d.demandas.forEach(dm => { delete dm.anexoNome; delete dm.anexoConteudo; if (!dm.createdAt) dm.createdAt = Date.now(); if (!dm.code) dm.code = prefixoSquad(d, dm.sq) + '-' + (100 + dm.id); });
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
export function iniciativas(data) { return data.demandas || []; }   // chave antiga `demandas` até a remodelagem (4b, A2)
export function colunasKanban(data) { return data.kcols || []; }     // estrutura fixa (A3); a chave sai na remodelagem (4b)
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
export function setCampoItem(sq, j, key, v) { if (key === 'p') v = Math.max(0, Math.min(100, parseInt(v) || 0)); sq.items[j][key] = v; }
// C9 (09/09/2026): item novo nasce sem datas — só ganha barra no Gantt quando o PM as definir. `q` mantido por compatibilidade de chamada.
export function novoItem(sq, q) { sq.items.push({ n: '', s: '', e: '', st: 'backlog', pv: 'nao', p: 0, cat: '', sub: '' }); }
export function removeItem(sq, j) { sq.items.splice(j, 1); }
export function enviarAoBacklog(sq, j) { const [x] = sq.items.splice(j, 1); sq.backlog.push({ n: x.n, cat: x.cat || '', note: '' }); }
export function promoverAoRoadmap(sq, k, q) { const [x] = sq.backlog.splice(k, 1); sq.items.push({ n: x.n, s: '', e: '', st: 'backlog', pv: 'nao', p: 0, cat: x.cat || '', sub: '' }); normalizeSquad(sq); }
export function novoItemBacklog(sq) { sq.backlog.push({ n: '', cat: '', note: '' }); }
export function removeItemBacklog(sq, k) { sq.backlog.splice(k, 1); }
export function alternaAgrupamento(sq) { sq.groupByCat = !sq.groupByCat; }
export function reordenarItem(sq, from, to, cat, sub) {
  const arr = sq.items;
  const [m] = arr.splice(from, 1);
  if (cat !== undefined) m.cat = cat;
  if (sub !== undefined) m.sub = sub;
  if (from < to) to--;
  to = Math.max(0, Math.min(arr.length, to));
  arr.splice(to, 0, m);
  normalizeSquad(sq);
}
export function ultimoIndice(items, pred) { let idx = -1; items.forEach((it, i) => { if (pred(it)) idx = i; }); return idx; }
export function novaCategoria(sq) { let n = sq.categories.length + 1, nn = 'Nova categoria'; while (sq.categories.some(c => c.name === nn)) nn = 'Nova categoria ' + (++n); sq.categories.push({ name: nn, subs: [] }); if (!sq.groupByCat) sq.groupByCat = true; }
// B5 (09/09/2026): devolvem false, sem alterar nada, se já existe outra com o mesmo nome.
export function renomeiaCategoria(sq, ci, nn) { if (sq.categories.some((c, i) => i !== ci && c.name === nn)) return false; const old = sq.categories[ci].name; sq.items.forEach(it => { if (it.cat === old) it.cat = nn; }); sq.categories[ci].name = nn; return true; }
export function removeCategoria(sq, ci) { const name = sq.categories[ci].name; sq.items.forEach(it => { if (it.cat === name) { it.cat = ''; it.sub = ''; } }); sq.categories.splice(ci, 1); }
export function novaSub(sq, ci) { const cc = sq.categories[ci]; let n = cc.subs.length + 1, nn = 'Nova subcategoria'; while (cc.subs.includes(nn)) nn = 'Nova subcategoria ' + (++n); cc.subs.push(nn); }
export function renomeiaSub(sq, ci, si, nn) { if (sq.categories[ci].subs.some((s, i) => i !== si && s === nn)) return false; const cat = sq.categories[ci].name, old = sq.categories[ci].subs[si]; sq.items.forEach(it => { if (it.cat === cat && it.sub === old) it.sub = nn; }); sq.categories[ci].subs[si] = nn; return true; }
export function removeSub(sq, ci, si) { const cat = sq.categories[ci].name, s = sq.categories[ci].subs[si]; sq.items.forEach(it => { if (it.cat === cat && it.sub === s) it.sub = ''; }); sq.categories[ci].subs.splice(si, 1); }

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
  data.quarters[id] = { label, start, days: 14, count: 6, archived: false, squads: cur.squads.map(s => ({ name: s.name, color: s.color, groupByCat: s.groupByCat, categories: JSON.parse(JSON.stringify(s.categories || [])), items: [], backlog: [] })) };
  data.order.unshift(id);
  data.activeQuarter = id;
  return id;
}
// Devolve o índice da squad criada.
export function novaSquad(data) {
  const q = quarterAtivo(data); let n = q.squads.length + 1, name = 'Nova squad'; while (q.squads.some(s => s.name === name)) name = 'Nova squad ' + (++n);
  q.squads.push({ name, prefix: prefixoLivre(q, prefixoDeNome(name)), archived: false, color: PALETTE[q.squads.length % PALETTE.length], groupByCat: true, categories: [], items: [], backlog: [] });
  return q.squads.length - 1;
}
export function removeSquad(data, i) { quarterAtivo(data).squads.splice(i, 1); }
export function substituiSquads(data, squads) { quarterAtivo(data).squads = squads; }   // Importar planilha (A11: substitui)

// ---------- Kanban (Anexo A) — gate e mutações ----------
export function podeMover(data, dragId, toKey) {
  const card = iniciativas(data).find(x => x.id === dragId);
  if (!card) return { ok: false, msg: '' };
  if (toKey === card.col) return { ok: true };
  const roleOf = k => { const c = colunasKanban(data).find(x => x.k === k); return c ? (c.role || 'fluxo') : 'fluxo'; };
  const from = roleOf(card.col), to = roleOf(toKey);
  const toCol = colunasKanban(data).find(x => x.k === toKey);
  if (to === 'descartado') {
    if (!card.motivo) return { ok: false, msg: 'Falta o motivo do descarte — defina na engrenagem do card' };
    return { ok: true };
  }
  if (from === 'entrada' && to !== 'entrada') {
    const req = [['sq', 'Squad'], ['pm', 'PM'], ['tl', 'Tech Lead'], ['tipo', 'Tipo'], ['est', 'Estimativa'], ['perQ', 'Período']];
    const miss = req.filter(([f]) => !card[f]).map(([, l]) => l);
    if (miss.length) return { ok: false, msg: 'Faltam para ' + (toCol ? toCol.label : 'avançar') + ': ' + miss.join(' · ') };
  }
  if (to === 'concluido' && (card.subsTotal || 0) > 0 && (card.subsDone || 0) < card.subsTotal) return { ok: false, msg: 'Progresso precisa estar em 100% para concluir' };
  return { ok: true };
}
// Move o card para `col`; se `targetId` for outro card, entra na posição dele; se null, vai ao fim.
export function moverIniciativa(data, dragId, targetId, col) {
  const d = data;
  const from = d.demandas.findIndex(x => x.id === dragId);
  if (from < 0) return;
  const [card] = d.demandas.splice(from, 1);
  card.col = col;
  if (targetId != null && targetId !== dragId) {
    const to = d.demandas.findIndex(x => x.id === targetId);
    d.demandas.splice(to < 0 ? d.demandas.length : to, 0, card);
  } else if (targetId == null) {
    d.demandas.push(card);
  } else {
    d.demandas.splice(from, 0, card);
  }
}
export function novaIniciativa(data, m) {
  const d = data;
  const nid = d.demandas.reduce((mx, x) => Math.max(mx, x.id), 0) + 1;
  d.demandas.push({ id: nid, t: m.t.trim(), d: m.d.trim(), sq: m.sq, col: d.kcols[0] ? d.kcols[0].k : 'backlog', link: m.link.trim(), prio: m.prio, tipo: m.tipo, est: m.est, perQ: m.perQ, perM: m.perM, pm: m.pm, tl: m.tl, origem: m.origem, motivo: m.motivo, createdAt: Date.now() });
  normalize(d);
}
export function atualizaIniciativa(data, id, m) {
  const dm = data.demandas.find(x => x.id === id);
  if (dm) Object.assign(dm, { t: m.t.trim(), d: m.d.trim(), sq: m.sq, link: m.link.trim(), prio: m.prio, tipo: m.tipo, est: m.est, perQ: m.perQ, perM: m.perM, pm: m.pm, tl: m.tl, origem: m.origem, motivo: m.motivo });
  normalize(data);
}
export function removeIniciativa(data, id) { data.demandas = data.demandas.filter(x => x.id !== id); }
// A3 (09/09/2026): colunas fixas — não há criar, renomear nem remover coluna. `kcols` permanece no dado até a remodelagem (4b, A2).
