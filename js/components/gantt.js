// components/gantt.js — view Visão geral / Gantt (SPEC §6). Preact + htm.
// Passo 3a: tradução fiel do bloco `showGantt` do protótipo. Só leitura: função de `data` para pixels.
// 3b Gantt-1 (09/09/2026): KPIs sobre os itens filtrados, independentes do colapso, e concluído = entregue (C10);
// layer virtual "Sem categoria" (B4); legenda de previsão com os 6 estados (B8).
import { html } from '../ui.js';
import { state, set, MOSTRAR_ROTULO_BARRA, DESTACAR_HOJE, quarterAtual } from '../app.js';
import {
  STATUS, PREV, SEM_CATEGORIA, squadsDoQuarter, itensDaSquad, categoriasDaSquad, normalizeSquad,
  sprintsOf, timelineOf, monthBands, addDays, passaFiltro, geometriaBarra, kpisDeItens,
} from '../data.js';

const FILTROS = [['all', 'Todas as squads'], ['risco', 'Em risco / atrasado'], ['dev', 'Em desenvolvimento']];
const LEGENDA_PREV = Object.keys(PREV);   // os 6 estados de previsão (B8)

export function GanttView() {
  const { filter, collapsed } = state;
  const q = quarterAtual();   // C7: em visualização ou ativo
  const tl = timelineOf(q), sp = sprintsOf(q), now = new Date();
  const todayPct = Math.max(0, Math.min(100, (now - tl.min) / tl.span * 100));
  const toggle = key => () => set({ collapsed: { ...collapsed, [key]: !collapsed[key] } });

  // ---- KPIs: todos os itens que passam no filtro, colapsados ou não (C10) ----
  squadsDoQuarter(q).forEach(normalizeSquad);
  const counts = kpisDeItens(squadsDoQuarter(q).filter(s => !s.archived).flatMap(sqd => itensDaSquad(sqd).filter(it => passaFiltro(it, filter))));

  // ---- varredura: swimlanes, layers, sub-layers e linhas (o `glanes` do protótipo) ----
  const lanes = [];
  const row = (it, indent) => ({ kind: 'row', label: it.n || 'sem nome', indent, p: it.p, geo: geometriaBarra(it, tl, q, MOSTRAR_ROTULO_BARRA) });
  squadsDoQuarter(q).forEach((sqd, si) => {
    if (sqd.archived) return;   // squad arquivada neste quarter não aparece
    const items = itensDaSquad(sqd).filter(it => passaFiltro(it, filter));
    if (!items.length && filter !== 'all') return;
    const sqKey = 'sq' + si, sqCol = collapsed[sqKey];
    lanes.push({ kind: 'squad', name: sqd.name, color: sqd.color, meta: items.length + ' itens' + (sqd.groupByCat ? ' · categorias' : ''), arrow: sqCol ? '▸' : '▾', onClick: toggle(sqKey) });
    if (sqCol) return;
    if (sqd.groupByCat) {
      categoriasDaSquad(sqd).forEach((c, ci) => {
        const inCat = items.filter(i => (i.cat || '') === c.name);
        const ck = sqKey + 'c' + ci, cCol = collapsed[ck];
        lanes.push({ kind: 'layer', name: c.name, count: inCat.length, arrow: cCol ? '▸' : '▾', onClick: toggle(ck) });
        if (cCol) return;
        c.subs.forEach(s => {
          const inSub = inCat.filter(i => (i.sub || '') === s);
          if (inSub.length) { lanes.push({ kind: 'sublayer', name: s, count: inSub.length }); inSub.forEach(i => lanes.push(row(i, 56))); }
        });
        const loose = inCat.filter(i => !i.sub || !c.subs.includes(i.sub));
        loose.forEach(i => lanes.push(row(i, 40)));
        if (!inCat.length) lanes.push({ kind: 'empty', label: '— sem itens —', indent: 40 });
      });
      const unc = items.filter(i => !i.cat);   // B4: layer virtual "Sem categoria", colapsável como as outras
      if (unc.length && !categoriasDaSquad(sqd).length) unc.forEach(i => lanes.push(row(i, 24)));   // squad sem categorias: itens direto (§6.1)
      else if (unc.length) {
        const uk = sqKey + 'cu', uCol = collapsed[uk];
        lanes.push({ kind: 'layer', name: SEM_CATEGORIA, count: unc.length, arrow: uCol ? '▸' : '▾', onClick: toggle(uk), virtual: true });
        if (!uCol) unc.forEach(i => lanes.push(row(i, 40)));
      }
    } else {
      items.forEach(i => lanes.push(row(i, 24)));
    }
  });
  const pctDone = counts.total ? Math.round(counts.done / counts.total * 100) : 0;

  // ---- linha do Gantt: rótulo à esquerda, trilha com colunas, linha de hoje, chip "antes de", barra ----
  const renderRow = g => {
    const geo = g.geo || { hasBar: false, isHist: false };
    return html`
      <div class="g-row">
        <div class=${'g-row-label' + (g.kind === 'empty' ? ' empty' : g.indent > 24 ? ' w500' : '')} style=${`padding-left:${g.indent}px`} title=${g.label}>${g.label}</div>
        <div class="g-track">
          ${sp.map(() => html`<span class="g-col"></span>`)}
          <div class="g-today" style=${`left:${todayPct}%;display:${DESTACAR_HOJE ? 'block' : 'none'}`}></div>
          ${geo.isHist && html`<div class="g-hist">◀ ${geo.histLabel}</div>`}
          ${geo.hasBar && html`
            <div class="g-bar" title=${geo.title} style=${`left:${geo.left.toFixed(3)}%;width:${geo.width.toFixed(3)}%;background:${geo.st.color};color:${geo.st.tx}`}>
              <span class="g-fill" style=${`width:${g.p}%`}></span>
              <span class="g-bar-label">${geo.barLabel}</span>
              ${geo.hasDot && html`<span class="g-dot" style=${`background:${geo.pv.color}`}></span>`}
            </div>`}
        </div>
      </div>`;
  };
  const renderLane = g => {
    if (g.kind === 'squad') return html`<div class="g-squad" onClick=${g.onClick}><span class="g-squad-dot" style=${`background:${g.color}`}></span>${g.name}<span class="g-squad-meta">${g.meta} ${g.arrow}</span></div>`;
    if (g.kind === 'layer') return html`<div class=${'g-layer' + (g.virtual ? ' g-layer-virtual' : '')} onClick=${g.onClick}><span>${g.arrow}</span>${g.name}<span class="g-count">${g.count}</span></div>`;
    if (g.kind === 'sublayer') return html`<div class="g-sublayer"><span class="g-sublayer-arrow">▾</span>${g.name}<span class="g-count">${g.count}</span></div>`;
    return renderRow(g);
  };

  return html`
    <div>
      <div class="g-head">
        <div>
          <h1 class="g-title">Roadmap ${q.label} — Gantt</h1>
          <p class="page-sub">${'Sprints de ' + q.days + ' dias · categorias como camadas (opcional) · linha verde = hoje'}</p>
        </div>
        <div class="chips">
          ${FILTROS.map(([f, label]) => html`<button class=${'chip' + (filter === f ? ' on' : '')} onClick=${() => set({ filter: f })}>${label}</button>`)}
        </div>
      </div>

      <div class="kpis">
        <div class="kpi"><div class="kpi-label">Itens no roadmap</div><div class="kpi-value">${counts.total}</div></div>
        <div class="kpi"><div class="kpi-label">Em desenvolvimento</div><div class="kpi-value">${counts.dev}</div></div>
        <div class="kpi"><div class="kpi-label">Em risco / atrasados</div><div class=${'kpi-value' + (counts.risk ? ' risk' : '')}>${counts.risk}</div></div>
        <div class="kpi"><div class="kpi-label">Concluídos</div><div class="kpi-value">${counts.done}<span class="kpi-sub">${' / ' + counts.total + ' · ' + pctDone + '%'}</span></div></div>
      </div>

      <div class="gantt">
        <div class="gantt-inner">
          <div class="g-band"><div class="g-band-label">Squad / Categoria / Item</div><div class="g-band-q">${q.label}</div></div>
          <div class="g-months">
            <div class="g-spacer"></div>
            <div class="g-flex">${monthBands(q).map(m => html`<div class="g-month" style=${`flex:${m.span}`}>${m.label}</div>`)}</div>
          </div>
          <div class="g-sprints">
            <div class="g-sprints-label">clique na squad / camada para colapsar</div>
            <div class="g-flex">
              ${sp.map(s => html`<div class=${'g-sprint' + ((now >= s.start && now <= addDays(s.end, 1)) ? ' now' : '')}><div class="g-sprint-l">${s.label}</div><div class="g-sprint-r">${s.range}</div></div>`)}
            </div>
          </div>
          ${lanes.map(renderLane)}
        </div>
      </div>

      <div class="legend">
        <span class="legend-title">Status</span>
        ${Object.values(STATUS).map(o => html`<span class="legend-item"><span class="legend-sw" style=${`background:${o.color}`}></span>${o.label}</span>`)}
        <span class="legend-sep"></span>
        <span class="legend-title">Previsão</span>
        ${LEGENDA_PREV.map(k => html`<span class="legend-item"><span class="legend-dot" style=${`background:${PREV[k].color}`}></span>${PREV[k].label}</span>`)}
      </div>
    </div>`;
}
