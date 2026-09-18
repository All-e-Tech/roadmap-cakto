// components/kanban.js — view Kanban de iniciativas (SPEC Anexo A; fonte: docs/decisions.md). Preact + htm.
// Passo 3a: tradução fiel do bloco `showKanban` + modal do protótipo — colunas, cards, filtros por squad,
// drag & drop com gate de passagem (podeMover), modal de criar/editar.
// 3b Kanban (09/09/2026): "Kanban de iniciativas" e textos sem "demanda" (C5/C6); colunas fixas, sem criar/renomear/
// remover (A3); anexo é link — sem arquivo embutido (A4); squads do quarter, não arquivadas (C8 revisada).
// 4b entrega 1 (17/09/2026): a chave passou a ser `iniciativas`; o progresso do card vem dos itens do
// roadmap (média simples, SPEC §3) e as colunas Execução e Concluído são derivadas — não recebem arraste.
import { html, Button, Icon } from '../ui.js';
import { state, set, mut, toast, quarterAtual } from '../app.js';
import {
  KPRIO, squadsAtivas, iniciativas, colunasKanban, colunaDe, derivadosDaIniciativa, COLUNAS_DERIVADAS,
  podeMover, moverIniciativa, novaIniciativa, atualizaIniciativa, removeIniciativa,
} from '../data.js';

const MIDX = { jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5, jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11 };
const BAR_H = [6, 9, 12, 15];
const MODAL_VAZIO = { editId: null, t: '', d: '', sq: '', link: '', prio: '', tipo: 'Delivery', est: '', perQ: '', perM: '', pm: '', tl: '', origem: '', motivo: '' };
const OPCOES = {
  prio: [['', '— não avaliado'], ['P0', 'P0'], ['P1', 'P1'], ['P2', 'P2'], ['P3', 'P3']],
  tipo: ['Discovery', 'Delivery', 'Bug', 'Débito técnico', 'Compliance'].map(v => [v, v]),
  est: [['', '—'], ...['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(v => [v, v])],
  perQ: [['', '— sem compromisso —'], ...['Q1', 'Q2', 'Q3', 'Q4'].map(v => [v, v])],
  perM: [['', '—'], ...Object.keys(MIDX).map(v => [v, v])],
  origem: [['', '—'], ...['stakeholder', 'suporte', 'dados', 'discovery', 'incidente', 'regulatório'].map(v => [v, v])],
  motivo: [['', '—'], ...['duplicado', 'fora de estratégia', 'sem viabilidade técnica', 'resolvido por outro card', 'sem impacto suficiente'].map(v => [v, v])],
};
const iniciais = nome => nome.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase();

// Id do card sendo arrastado — variável de instância no protótipo (`_drag`), não estado.
let dragId = null;

export function KanbanView() {
  const { data, kFilter, modal, kDragId, kMark } = state;
  const q = quarterAtual();   // C7: em visualização ou ativo
  const squads = squadsAtivas(q);
  const cards = iniciativas(data);
  const cols = colunasKanban(data);
  const now = new Date();
  const squadColor = name => { const s = squads.find(x => x.name === name); return s ? s.color : null; };
  const kPass = dm => kFilter === 'all' ? true : kFilter === 'none' ? !dm.sq : dm.sq === kFilter;

  // ---- drag & drop entre colunas e dentro da coluna (o `dropOn` do protótipo) ----
  const dropOn = (targetId, col) => {
    if (dragId == null) return;
    const chk = podeMover(state.data, dragId, col);
    if (!chk.ok) { toast(chk.msg); dragId = null; set({ kDragId: null, kMark: null }); return; }
    const id = dragId;
    mut(d => moverIniciativa(d, id, targetId, col));
    dragId = null; set({ kDragId: null, kMark: null });
  };

  // ---- modal ----
  const abrirNovo = () => set({ modal: { ...MODAL_VAZIO } });
  const abrirEdicao = dm => set({ modal: { editId: dm.id, t: dm.t, d: dm.d, sq: dm.sq, link: dm.link, prio: dm.prio || '', tipo: dm.tipo || 'Delivery', est: dm.est || '', perQ: dm.perQ || '', perM: dm.perM || '', pm: dm.pm || '', tl: dm.tl || '', origem: dm.origem || '', motivo: dm.motivo || '' } });
  const fechar = () => set({ modal: null });
  const mSet = key => e => set({ modal: { ...state.modal, [key]: e.target.value } });
  const enviar = () => {
    const m = state.modal; if (!m) return;
    if (!m.t.trim()) { toast('Dê um título à iniciativa'); return; }
    let r = null;
    if (m.editId != null) mut(d => { r = atualizaIniciativa(d, m.editId, m); }); else mut(d => novaIniciativa(d, m));
    set({ modal: null });
    if (r && r.semCategoria) { toast('Iniciativa movida — a squad de destino não tem a categoria; ficou sem categoria'); return; }
    toast(m.editId != null ? 'Iniciativa atualizada' : 'Iniciativa adicionada ao fim da fila de entrada');
  };

  // ---- um card ----
  const renderCard = (dm, kc) => {
    const key = kc.k, role = kc.role || 'fluxo';
    const sqc = dm.sq ? squadColor(dm.sq) : null;
    const pr = KPRIO[dm.prio];
    const der = derivadosDaIniciativa(data, dm.code);
    const deps = Array.isArray(dm.dep) ? dm.dep : (dm.dep ? [dm.dep] : []);
    const isBacklog = role === 'entrada', isDone = role === 'concluido', isDisc = role === 'descartado';
    const terminal = isDone || isDisc;
    const blocked = deps.length > 0 && !terminal;
    const days = Math.max(0, Math.floor((Date.now() - (dm.createdAt || Date.now())) / 86400000));
    const late = !!dm.perM && MIDX[dm.perM] !== undefined && MIDX[dm.perM] < now.getMonth() && !isDone;
    const showProg = der.total > 0 && !isBacklog && !isDisc;
    const showDep = deps.length > 0 && !isDisc;
    const avatars = [dm.pm && { ini: iniciais(dm.pm), cls: 'k-av k-av-pm' }, dm.tl && { ini: iniciais(dm.tl), cls: 'k-av k-av-tl' }].filter(Boolean);
    const showAv = !isBacklog && avatars.length > 0;
    const dragging = kDragId === dm.id;
    const idadeCls = days > 45 ? ' k-idade-45' : days >= 14 ? ' k-idade-14' : '';
    const per = dm.perQ ? dm.perQ + (dm.perM ? ' · ' + dm.perM : '') : '';
    return html`
      <div class=${'kcard' + (terminal ? ' kcard-terminal' : '') + (blocked ? ' kcard-blocked' : '') + (isDisc ? ' kcard-disc' : '') + (dragging ? ' dragging' : '')} tabIndex="0" draggable="true"
        onDragStart=${() => { dragId = dm.id; set({ kDragId: dm.id }); }}
        onDragEnd=${() => { dragId = null; set({ kDragId: null, kMark: null }); }}
        onDragOver=${e => { if (dragId != null) e.preventDefault(); }}
        onDrop=${e => { e.preventDefault(); e.stopPropagation(); dropOn(dm.id, key); }}>
        <div class="k-top">
          <span class="k-code">${dm.code || 'CKT-' + (100 + dm.id)}</span>
          ${sqc && html`<span class="k-tag"><span class="k-tag-dot" style=${`background:${sqc}`}></span><span class="k-tag-txt" style=${`color:${sqc}`}>${dm.sq}</span></span>`}
          <span class="k-prio" title=${pr ? 'Prioridade ' + dm.prio : 'Prioridade não avaliada'} aria-label=${pr ? 'Prioridade ' + dm.prio : 'Prioridade não avaliada'}>
            ${BAR_H.map((h, i) => html`<span class="k-prio-bar" style=${`height:${h}px;background:${pr && i < pr.n ? pr.c : 'var(--proto-k-line-20)'}`}></span>`)}
          </span>
          <button class="kctl kctl-gear" title="Configurar" onClick=${() => abrirEdicao(dm)}><${Icon} name="InterfaceEssentialSettings" size=${14} /></button>
          <button class="kctl kctl-x" title="Remover" onClick=${() => { mut(d => removeIniciativa(d, dm.id)); toast('Iniciativa removida'); }}>×</button>
        </div>
        <div class=${'k-title' + (terminal ? ' k-title-terminal' : '') + (isDisc ? ' k-title-disc' : '')}>${dm.t}</div>
        <div class="k-chips">
          ${!isBacklog && html`<span class="k-chip">${dm.tipo || 'Delivery'}</span>`}
          ${isBacklog && !!dm.origem && html`<span class="k-chip k-chip-origem">${'origem: ' + dm.origem}</span>`}
          ${isDisc && !!dm.motivo && html`<span class="k-chip-soft">${'não faremos: ' + dm.motivo}</span>`}
          ${!isBacklog && !!dm.est && html`<span class="k-est">${dm.est}</span>`}
          ${!isBacklog && !!dm.perQ && html`<span class=${'k-per' + (isDone ? ' k-per-done' : late ? ' k-per-late' : '')}>${isDone && html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><path d="M20 6 9 17l-5-5"></path></svg>`}${per}</span>`}
          ${!!dm.link && html`<button class="k-linkbtn" onClick=${() => window.open(dm.link, '_blank')}>Protótipo</button>`}
        </div>
        ${!isBacklog && (showProg || showDep || showAv) && html`
          <div class="k-footer">
            ${showProg && html`<span class="k-prog" title=${der.entregues + ' de ' + der.total + ' itens entregues · ' + der.pct + '%'}><span class="k-prog-track"><i class=${'k-prog-fill' + (der.entregues >= der.total ? ' done' : '')} style=${`width:${der.pct}%`}></i></span><span class="k-progtxt">${der.entregues + '/' + der.total}</span></span>`}
            <span class="k-footer-right">
              ${showDep && html`<span class="k-dep" title=${'Bloqueado por ' + deps.join(', ')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><rect width="18" height="11" x="3" y="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>${deps.length === 1 ? deps[0] : String(deps.length)}</span>`}
              ${showAv && html`<span class="k-avatars">${avatars.map(a => html`<span class=${a.cls}>${a.ini}</span>`)}</span>`}
            </span>
          </div>`}
        ${isBacklog && html`<div class="k-idade-wrap"><span class=${'k-idade' + idadeCls} title="Idade no backlog">${days + 'd'}</span></div>`}
      </div>`;
  };

  // ---- uma coluna ----
  const renderCol = kc => {
    const key = kc.k;
    const visiveis = cards.filter(dm => colunaDe(data, dm) === key && kPass(dm));
    const bad = kMark && kMark.key === key && !kMark.ok;
    return html`
      <div class=${'kcol' + (bad ? ' kcol-bad' : '')}
        onDragOver=${e => { if (dragId == null) return; e.preventDefault(); const ok = podeMover(state.data, dragId, key).ok; const m = state.kMark; if (!m || m.key !== key || m.ok !== ok) set({ kMark: { key, ok } }); }}
        title=${COLUNAS_DERIVADAS.includes(key) ? 'Coluna calculada a partir dos itens no roadmap' : ''}
        onDrop=${e => { e.preventDefault(); dropOn(null, key); }}>
        <div class="kcol-head">
          <span class="kcol-label">${kc.label}</span>
          <span class="kcol-count">${visiveis.length}</span>
        </div>
        ${visiveis.map(dm => renderCard(dm, kc))}
        ${visiveis.length === 0 && html`<div class="kcol-empty">Nenhum registro encontrado</div>`}
      </div>`;
  };

  const m = modal;
  const opts = (lista) => lista.map(([v, l]) => html`<option value=${v}>${l}</option>`);
  return html`
    <div>
      <div class="g-head">
        <div>
          <h1 class="g-title">Kanban de iniciativas</h1>
          <p class="page-sub">Fila central priorizada — arraste um card para reordenar a prioridade ou mover de etapa. Novas iniciativas entram no fim da fila de backlog.</p>
        </div>
        <${Button} variant="primary" size="medium" onClick=${abrirNovo}>Adicionar</${Button}>
      </div>
      <div class="chips chips-k">
        <button class=${'chip chip-k' + (kFilter === 'all' ? ' on' : '')} onClick=${() => set({ kFilter: 'all' })}>Board geral</button>
        <button class=${'chip chip-k' + (kFilter === 'none' ? ' on' : '')} onClick=${() => set({ kFilter: 'none' })}>Sem squad</button>
        ${squads.map(s => html`<button class=${'chip chip-k' + (kFilter === s.name ? ' on' : '')} onClick=${() => set({ kFilter: s.name })}><span class="chip-dot" style=${`background:${s.color}`}></span>${s.name}</button>`)}
      </div>
      <div class="kgrid" style=${`grid-template-columns:repeat(${Math.max(1, cols.length)},minmax(272px,1fr))`}>
        ${cols.map(renderCol)}
      </div>

      ${m && html`
        <div class="modal-bg" onClick=${fechar}>
          <div class="modal" onClick=${e => e.stopPropagation()}>
            <div class="m-title">${m.editId != null ? 'Configurar iniciativa' : 'Nova iniciativa'}</div>
            <div class="m-field"><label class="m-label">Título</label><input class="input" value=${m.t} onInput=${mSet('t')} placeholder="Nome da iniciativa" /></div>
            <div class="m-field"><label class="m-label">Descrição</label><textarea class="input m-textarea" rows="3" value=${m.d} onInput=${mSet('d')} placeholder="Contexto, problema ou oportunidade"></textarea></div>
            <div class="m-field"><label class="m-label">Destino</label>
              <select class="input m-select" value=${m.sq} onChange=${mSet('sq')}><option value="">Fila central (sem squad)</option>${squads.map(s => html`<option value=${s.name}>${'Squad ' + s.name}</option>`)}</select></div>
            <div class="m-grid3">
              <div class="m-field"><label class="m-label">Prioridade</label><select class="input m-select" value=${m.prio} onChange=${mSet('prio')}>${opts(OPCOES.prio)}</select></div>
              <div class="m-field"><label class="m-label">Tipo</label><select class="input m-select" value=${m.tipo} onChange=${mSet('tipo')}>${opts(OPCOES.tipo)}</select></div>
              <div class="m-field"><label class="m-label">Estimativa</label><select class="input m-select" value=${m.est} onChange=${mSet('est')}>${opts(OPCOES.est)}</select></div>
            </div>
            <div class="m-grid2">
              <div class="m-field"><label class="m-label">Período — trimestre</label><select class="input m-select" value=${m.perQ} onChange=${mSet('perQ')}>${opts(OPCOES.perQ)}</select></div>
              <div class="m-field"><label class="m-label">Período — mês-alvo</label><select class="input m-select" value=${m.perM} onChange=${mSet('perM')}>${opts(OPCOES.perM)}</select></div>
            </div>
            <div class="m-grid2">
              <div class="m-field"><label class="m-label">PM</label><input class="input" value=${m.pm} onInput=${mSet('pm')} placeholder="Nome do PM" /></div>
              <div class="m-field"><label class="m-label">Tech Lead</label><input class="input" value=${m.tl} onInput=${mSet('tl')} placeholder="Nome do TL" /></div>
            </div>
            <div class="m-grid2">
              <div class="m-field"><label class="m-label">Origem</label><select class="input m-select" value=${m.origem} onChange=${mSet('origem')}>${opts(OPCOES.origem)}</select></div>
              <div class="m-field"><label class="m-label">Motivo do descarte</label><select class="input m-select" value=${m.motivo} onChange=${mSet('motivo')}>${opts(OPCOES.motivo)}</select></div>
            </div>
            <div class="m-field"><label class="m-label">Link do protótipo navegável (Claude design)</label><input class="input" value=${m.link} onInput=${mSet('link')} placeholder="https://…" /></div>
            <div class="m-actions">
              <${Button} variant="white" size="medium" onClick=${fechar}>Cancelar</${Button}>
              <${Button} variant="primary" size="medium" onClick=${enviar}>${m.editId != null ? 'Salvar alterações' : 'Adicionar à fila'}</${Button}>
            </div>
          </div>
        </div>`}
    </div>`;
}
