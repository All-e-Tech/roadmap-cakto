// app.js — montagem do app e roteamento entre views (SPEC §1.1). Preact + htm via CDN, sem build.
//
// Passo 3a: tradução fiel do shell do protótipo (barra lateral, header, seletor de quarter, toast,
// Importar / Carregar / Salvar). Estado no padrão do protótipo: um objeto único, mutado no lugar e
// re-renderizado (decisão de 07/09/2026).
// Passo 4: o board vem de /api/board via sync.js (SPEC §9.2); o localStorage vira cache. Indicador de
// sincronização no header e tela de senha (APP_PASSWORD, decisão de 09/09/2026) entram aqui.
import { render } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { html, Button, Icon } from './ui.js';
import { seedNovo, quarterAtivo, quartersDoSeletor, quartersOrdenados, squadsDoQuarter, itensDoQuarter, ativarQuarter, substituiSquads } from './data.js';
import { carregarLocal, salvarLocal, carregarSidebar, salvarSidebar, sync, iniciar, entrar } from './sync.js';
import { lerPlanilha, lerJson, baixarJson } from './io.js';
import { ConfigView } from './components/config.js';
import { GanttView } from './components/gantt.js';
import { TableView } from './components/table.js';
import { KanbanView } from './components/kanban.js';

// Constantes herdadas das props do Claude Design (SPEC §2, divergences A9).
export const PAGINA_INICIAL = 'dados';       // 'dados' | 'gantt'
export const MOSTRAR_ROTULO_BARRA = true;    // percentual escrito dentro da barra do Gantt (A10)
export const DESTACAR_HOJE = true;           // linha vertical de hoje no Gantt

// Rótulos travados (C5, SPEC §1): Roadmap · Visão geral (Gantt) · Kanban de iniciativas · Squads & sprints.
const TITULOS = { data: 'Roadmap', gantt: 'Visão geral (Gantt)', cfg: 'Squads & sprints', kanban: 'Kanban de iniciativas' };
const NAV_ROADMAP = [
  { page: 'data',   label: 'Roadmap',             icon: 'IcDashboard' },
  { page: 'gantt',  label: 'Visão geral (Gantt)', icon: 'InterfaceEssentialStatisticsAnalyticsArr' },
  { page: 'kanban', label: 'Kanban de iniciativas', icon: 'FilesFileBlankList' },
];
const NAV_CONFIG = [{ page: 'cfg', label: 'Squads & sprints', icon: 'InterfaceEssentialSettings' }];

// ---------- Estado único ----------
export const state = {
  data: carregarLocal() || seedNovo(),
  activeSquad: 0,
  page: PAGINA_INICIAL === 'gantt' ? 'gantt' : 'data',
  filter: 'all',
  toast: '',
  kFilter: 'all',
  modal: null,
  collapsed: {},
  qMenuOpen: false,
  dragMark: null,
  kDragId: null,      // Kanban: card sendo arrastado / alvo válido ou não
  kMark: null,
  viewQuarter: null,  // C7: quarter em visualização (local, não persiste); null = o ativo
  sideOpen: carregarSidebar(),
};
let rerender = () => {};
// Estado de interface: muda e re-renderiza.
export function set(patch) { Object.assign(state, patch); rerender(); }
// C7 (09/09/2026): o quarter mostrado nas views é o em visualização (local) ou o ativo do board.
export function quarterAtual() { const d = state.data; return (state.viewQuarter && d.quarters[state.viewQuarter]) ? d.quarters[state.viewQuarter] : quarterAtivo(d); }
export function idQuarterAtual() { return (state.viewQuarter && state.data.quarters[state.viewQuarter]) ? state.viewQuarter : state.data.activeQuarter; }
export function somenteLeitura() { return idQuarterAtual() !== state.data.activeQuarter; }
// Dados do board: muta, salva no navegador e re-renderiza (o `mut()` do protótipo). Em visualização de outro quarter, recusa.
export function mut(fn) {
  if (somenteLeitura()) { toast('Quarter em visualização — somente leitura'); rerender(); return; }
  fn(state.data); salvarLocal(state.data); rerender();
}
function mutSempre(fn) { fn(state.data); salvarLocal(state.data); rerender(); }
let toastTimer;
export function toast(msg) { set({ toast: msg }); clearTimeout(toastTimer); toastTimer = setTimeout(() => set({ toast: '' }), 2200); }
// Header: escolher um quarter só muda a visualização de quem clicou (C7).
export function verQuarter(id) { set({ viewQuarter: id === state.data.activeQuarter ? null : id, activeSquad: 0, qMenuOpen: false, collapsed: {} }); toast('Quarter: ' + quarterAtual().label); }
// Config → Ativar: a única ação que muda o quarter ativo do board (estado compartilhado).
export function switchQuarter(id) { mutSempre(d => ativarQuarter(d, id)); set({ viewQuarter: null, activeSquad: 0, qMenuOpen: false }); toast('Quarter: ' + quarterAtivo(state.data).label); }

// Views (uma por arquivo em components/).
const VIEWS = {
  data:   TableView,
  gantt:  GanttView,
  kanban: KanbanView,
  cfg:    ConfigView,
};

// Erro do servidor traduzido para causa provável (as duas que acontecem na instalação, SPEC §10).
// O texto técnico segue visível abaixo, para o diagnóstico.
function causaProvavel(detalhe) {
  const d = String(detalhe || '');
  if (/PGRST205|Could not find the table|does not exist/i.test(d)) return 'A tabela board não existe no banco. Rode o SQL do README no SQL Editor do Supabase, no mesmo projeto das variáveis de ambiente.';
  if (/row-level security|PGRST301|JWSError|Invalid API key|invalid signature|401|403/i.test(d)) return 'A chave do Supabase não tem permissão de escrita. Confira se é a chave secreta (service_role ou sb_secret_), não a pública (anon / publishable).';
  if (/ENOTFOUND|fetch failed|getaddrinfo/i.test(d)) return 'O endereço do Supabase não respondeu. Confira a variável SUPABASE_URL.';
  return 'Falha ao falar com o banco. O detalhe técnico está abaixo.';
}
// Faixa de erro (SPEC §9.2): quando o servidor falha, a causa fica visível na tela, não só no tooltip.
function ErroBanner() {
  if (sync.status !== 'erro') return '';
  return html`
    <div class="err-banner">
      <div>Erro no servidor — as alterações não estão sendo salvas.<span class="err-hint">${' ' + causaProvavel(sync.detalhe)}</span></div>
      ${sync.detalhe && html`<code class="err-detalhe">${sync.detalhe}</code>`}
    </div>`;
}
// Indicador de sincronização (SPEC §9.2): "Salvando…" / "Salvo · HH:MM" / "Sem conexão" / "Conflito…" / "Erro no servidor".
function SyncBadge() {
  const hora = sync.hora ? sync.hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
  const rot = {
    carregando: 'Carregando…', salvando: 'Salvando…', salvo: hora ? `Salvo · ${hora}` : 'Salvo',
    offline: 'Sem conexão', conflito: 'Conflito…', erro: 'Erro no servidor', senha: 'Senha',
  }[sync.status] || '';
  const tit = sync.status === 'offline' ? 'Sem acesso ao servidor. As alterações ficam neste navegador até a conexão voltar.' : (sync.detalhe || '');
  return html`<span class=${'sync sync-' + sync.status} title=${tit}>${rot}</span>`;
}
// Tela de senha (gate desta fase, sem login): aparece quando o servidor responde 401.
function Gate() {
  const [senha, setSenha] = useState('');
  const enviar = e => { e.preventDefault(); if (senha.trim()) entrar(senha.trim()); };
  return html`
    <div class="gate">
      <form class="card gate-card" onSubmit=${enviar}>
        <img class="logo" src="assets/cakto-logo.png" alt="Cakto" />
        <div class="card-title">Roadmap Cakto</div>
        <div class="card-sub card-sub-18">Digite a senha do time para entrar.</div>
        <input class="input" type="password" placeholder="Senha" value=${senha} onInput=${e => setSenha(e.target.value)} autofocus />
        ${sync.detalhe && html`<div class="gate-erro">${sync.detalhe}</div>`}
        <${Button} variant="primary" size="small" type="submit">Entrar</${Button}>
      </form>
    </div>`;
}

function App() {
  const [, tick] = useState(0);
  rerender = () => tick(t => t + 1);
  const jsonRef = useRef(null), xlsxRef = useRef(null);

  // Clique fora fecha o seletor de quarter (o `_doc` do protótipo).
  useEffect(() => {
    const onDoc = e => { if (state.qMenuOpen && !e.target.closest('[data-qwrap]')) set({ qMenuOpen: false }); };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const q = quarterAtual(), qid = idQuarterAtual(), ro = somenteLeitura();
  const go = p => () => { set({ page: p }); window.scrollTo(0, 0); };
  const toggleSide = () => { const v = !state.sideOpen; set({ sideOpen: v }); salvarSidebar(v); };
  const saveJson = () => { baixarJson(state.data); toast('Arquivo salvo'); };
  const onJsonFile = ev => {
    const f = ev.target.files[0]; if (!f) return;
    ev.target.value = '';
    lerJson(f).then(d => {
      if (!d) { toast('Arquivo inválido'); return; }
      // B2 (09/09/2026): confirmação nomeando o que será perdido; cancelar não faz nada
      const qs = quartersOrdenados(state.data), itens = qs.reduce((n, x) => n + itensDoQuarter(x.q), 0);
      if (!window.confirm(`Substituir o board inteiro (${qs.length} quarters, ${itens} itens)? Salve antes se quiser voltar.`)) return;
      state.data = d; salvarLocal(d); set({ activeSquad: 0 }); toast('Dados carregados');
    });
  };
  const onXlsxFile = ev => {
    const f = ev.target.files[0]; if (!f) return;
    ev.target.value = '';
    if (somenteLeitura()) { toast('Quarter em visualização — somente leitura'); return; }
    lerPlanilha(f).then(squads => {
      if (!squads.length) { toast('Nenhuma tabela reconhecida'); return; }
      // A11 (09/09/2026): Importar substitui o quarter — confirmação nomeando o que será perdido
      const q = quarterAtivo(state.data);
      if (!window.confirm(`Substituir o quarter ${q.label} (${squadsDoQuarter(q).length} squads, ${itensDoQuarter(q)} itens)? Salve antes se quiser voltar.`)) return;
      mut(d => substituiSquads(d, squads)); set({ activeSquad: 0 }); toast('Importado: ' + squads.length + ' squads');
    }).catch(() => toast('Erro ao ler a planilha'));
  };

  if (sync.status === 'senha') return Gate();

  const navBtn = n => html`<button class=${'nav' + (state.page === n.page ? ' on' : '')} onClick=${go(n.page)}><${Icon} name=${n.icon} size=${18} />${n.label}</button>`;
  const navBtnC = n => html`<button class=${'nav-c' + (state.page === n.page ? ' on' : '')} title=${n.label} onClick=${go(n.page)}><${Icon} name=${n.icon} size=${20} /></button>`;

  return html`
    <div class="shell">
      <aside class=${'side' + (state.sideOpen ? '' : ' closed')}>
        <div class="side-head">
          ${state.sideOpen && html`<img class="logo" src="assets/cakto-logo.png" alt="Cakto" />`}
          <button class="side-toggle" title=${state.sideOpen ? 'Recolher menu' : 'Expandir menu'} onClick=${toggleSide}>${state.sideOpen ? '⟨' : '⟩'}</button>
        </div>
        ${state.sideOpen
          ? html`
            <nav class="nav-list">
              <div class="nav-section">Roadmap</div>
              ${NAV_ROADMAP.map(navBtn)}
              <div class="nav-section nav-section-cfg">Config</div>
              ${NAV_CONFIG.map(navBtn)}
            </nav>
            <div class="side-note">Alterações são salvas automaticamente e compartilhadas com todos. Salvar / Carregar exportam e importam uma cópia em JSON.</div>`
          : html`<nav class="nav-list-c">${NAV_ROADMAP.map(navBtnC)}${NAV_CONFIG.map(navBtnC)}</nav>`}
      </aside>

      <main class=${'main' + (ro ? ' ro' : '')}>
        <header class="header">
          <div class="crumb">Roadmap <b>${q.label}</b>${' / '}<b>${TITULOS[state.page]}</b></div>
          <div class="qwrap" data-qwrap="1">
            <button class="qbtn" onClick=${e => { e.stopPropagation(); set({ qMenuOpen: !state.qMenuOpen }); }}>${q.label}<span class="caret">▾</span></button>
            ${state.qMenuOpen && (() => { const { ativos, arquivados } = quartersDoSeletor(state.data); const opt = o => html`<button class=${'qopt' + (o.id === qid ? ' on' : '')} onClick=${() => verQuarter(o.id)}><span>${o.label}${o.ativo ? html`<span class="qopt-ativo"> · ativo</span>` : ''}</span><span class="qmeta">${o.meta}</span></button>`; return html`
              <div class="qmenu">
                ${ativos.map(opt)}
                ${arquivados.length > 0 && html`<div class="qmenu-section">Arquivados</div>${arquivados.map(opt)}`}
              </div>`; })()}
          </div>
          ${SyncBadge()}
          ${state.page === 'data' && html`<${Button} variant="secondary" size="small" onClick=${() => xlsxRef.current && xlsxRef.current.click()}>Importar</${Button}>`}
          <${Button} variant="secondary" size="small" onClick=${() => jsonRef.current && jsonRef.current.click()}>Carregar</${Button}>
          <${Button} variant="primary" size="small" onClick=${saveJson}>Salvar</${Button}>
          <div class="avatar"></div>
        </header>
        ${ErroBanner()}
        ${ro && html`<div class="ro-banner">${q.archived ? 'Quarter arquivado — somente leitura' : 'Quarter não ativo — somente leitura'}<span class="ro-hint">Para editar, ative-o em Squads & sprints ou volte ao quarter ativo.</span></div>`}
        ${VIEWS[state.page]()}
      </main>

      <input type="file" accept=".json" ref=${jsonRef} onChange=${onJsonFile} class="hidden-input" />
      <input type="file" accept=".xlsx,.xls" ref=${xlsxRef} onChange=${onXlsxFile} class="hidden-input" />
      ${state.toast && html`<div class="toast">${state.toast}</div>`}
    </div>`;
}

render(html`<${App} />`, document.getElementById('app'));

// Sincronização com o servidor (SPEC §9.2). As views só veem `state.data`.
iniciar({
  obterDados: () => state.data,
  aoCarregar: d => {
    state.data = d; salvarLocal(d);
    if (state.viewQuarter && !d.quarters[state.viewQuarter]) state.viewQuarter = null;
    if (state.activeSquad >= squadsDoQuarter(quarterAtual()).length) state.activeSquad = 0;
    rerender();
  },
  aoConflito: () => Promise.resolve(window.confirm(
    'Outra pessoa salvou o roadmap enquanto você editava.\n\n' +
    'OK — manter as suas alterações (as dela serão sobrescritas).\n' +
    'Cancelar — recarregar a versão dela (as suas alterações serão perdidas).') ? 'manter' : 'recarregar'),
  aoEstado: rerender,
});
