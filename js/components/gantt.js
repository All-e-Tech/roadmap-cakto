// components/gantt.js — view Visão geral / Gantt (SPEC §6). Preact + htm.
// Passo 3a: tradução fiel do bloco `showGantt` do protótipo. Só leitura: função de `data` para pixels.
// 3b Gantt-1 (09/09/2026): KPIs sobre os itens filtrados, independentes do colapso, e concluído = entregue (C10);
// layer virtual "Sem categoria" (B4); legenda de previsão com os 6 estados (B8).
import { html } from '../ui.js';
import { state, set, MOSTRAR_ROTULO_BARRA, DESTACAR_HOJE, quarterAtual } from '../app.js';
import {
  STATUS, PREV, squadsDoQuarter, itensDaSquad, normalizeSquad,
  sprintsOf, timelineOf, monthBands, addDays, passaFiltro, geometriaBarra, kpisDeItens, linhasRoadmap,
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
  const counts = kpisDeItens(squadsDoQuarter(q).filter(s => !s.archived).flatMap(sqd => itensDaSquad(sqd).filter(it => !it.arq && passaFiltro(it, filter))));   // §4.3

  // ---- varredura: swimlanes, camadas de categoria, iniciativas e itens ----
  // As linhas vêm de linhasRoadmap(), a mesma fonte da tabela (SPEC §5.1) — as duas telas nunca discordam.
  const lanes = [];
  const row = (it, indent) => ({ kind: 'row', label: it.n || 'sem nome', indent, p: it.p, geo: geometriaBarra(it, tl, q, MOSTRAR_ROTULO_BARRA) });
  squadsDoQuarter(q).forEach((sqd, si) => {
    if (sqd.archived) return;   // squad arquivada neste quarter não aparece
    const items = itensDaSquad(sqd).filter(it => !it.arq && passaFiltro(it, filter));
    if (!items.length && filter !== 'all') return;
    const sqKey = 'sq' + si, sqCol = collapsed[sqKey];
    lanes.push({ kind: 'squad', name: sqd.name, color: sqd.color, meta: items.length + ' itens' + (sqd.groupByCat ? ' · categorias' : ''), arrow: sqCol ? '▸' : '▾', onClick: toggle(sqKey) });
    if (sqCol) return;
    let catKey = null, catCol = false, iniKey = null, iniCol = false, ci = 0;
    linhasRoadmap(state.data, sqd, it => passaFiltro(it, filter)).forEach(l => {
      if (l.tipo === 'categoria') {
        catKey = sqKey + 'c' + (l.virtual ? 'u' : ci++); catCol = !!collapsed[catKey]; iniKey = null; iniCol = false;
        lanes.push({ kind: 'layer', name: l.nome, count: l.total, arrow: catCol ? '▸' : '▾', onClick: toggle(catKey), virtual: !!l.virtual });
        return;
      }
      if (catCol) return;
      if (l.tipo === 'vazio') { lanes.push({ kind: 'empty', label: '— sem itens —', indent: 40 }); return; }
      if (l.tipo === 'iniciativa') {
        // Iniciativa de um item só não ganha camada aqui: a barra do item já a representa, e uma linha
        // extra por item dobraria a altura do Gantt, que existe para ser denso (18/09/2026).
        if (l.total <= 1) { iniKey = null; iniCol = false; return; }
        // Barra envelope: do menor início ao maior fim dos itens (SPEC §6.1).
        iniKey = sqKey + 'i' + l.code; iniCol = !!collapsed[iniKey];
        const geo = geometriaBarra({ s: l.s, e: l.e, st: 'backlog', pv: 'prazo', p: l.pct, n: l.titulo }, tl, q, false);
        lanes.push({
          kind: 'sublayer', name: l.titulo || l.code, code: l.code, count: l.total,
          meta: l.entregues + '/' + l.total, arrow: iniCol ? '▸' : '▾', onClick: toggle(iniKey),
          envelope: geo.hasBar ? { left: geo.left, width: geo.width, pct: l.pct, title: (l.titulo || l.code) + ' · ' + l.entregues + ' de ' + l.total + ' entregues · ' + l.pct + '%' } : null,
        });
        return;
      }
      if (!iniKey) { lanes.push(row(l.it, sqd.groupByCat && catKey ? 40 : 24)); return; }   // iniciativa de um item só
      if (!iniCol) lanes.push(row(l.it, 56));
    });
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
    // Iniciativa: rótulo à esquerda e barra envelope na trilha, mais clara que a dos itens.
    if (g.kind === 'sublayer') return html`
      <div class="g-row g-row-ini">
        <div class="g-sublayer" onClick=${g.onClick}><span class="g-sublayer-arrow">${g.arrow}</span>${g.name}<span class="g-count">${g.meta}</span></div>
        <div class="g-track">
          ${sp.map(() => html`<span class="g-col"></span>`)}
          <div class="g-today" style=${`left:${todayPct}%;display:${DESTACAR_HOJE ? 'block' : 'none'}`}></div>
          ${g.envelope && html`
            <div class="g-env" title=${g.envelope.title} style=${`left:${g.envelope.left.toFixed(3)}%;width:${g.envelope.width.toFixed(3)}%`}>
              <span class="g-env-fill" style=${`width:${g.envelope.pct}%`}></span>
            </div>`}
        </div>
      </div>`;
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
