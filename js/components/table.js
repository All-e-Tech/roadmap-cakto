// components/table.js — view Roadmap / tabela (SPEC §5). Preact + htm.
// Passo 3a: tradução fiel do bloco `showData` do protótipo — abas por squad, tabela agrupada ou plana,
// edição inline, CRUD de categorias, drag & drop (HTML5) e backlog. Toda mutação passa por data.js.
// 3b Roadmap (09/09/2026): item novo sem datas (C9); grupo virtual "Sem categoria" com cabeçalho e alvo de
// arraste (B4); nome duplicado de categoria/subcategoria rejeitado com mensagem (B5); título "Roadmap" (C5).
import { html, Button, mix } from '../ui.js';
import { state, set, mut, toast, quarterAtual } from '../app.js';
import {
  STATUS, PREV, SEM_CATEGORIA, quarterAtivo, squadsDoQuarter, primeiraSquadAtiva, itensDaSquad, categoriasDaSquad, normalizeSquad, fmtBR, avg,
  setCampoItem, novoItem, removeItem, enviarAoBacklog, promoverAoRoadmap, novoItemBacklog, removeItemBacklog,
  alternaAgrupamento, reordenarItem, ultimoIndice, novaCategoria, renomeiaCategoria, removeCategoria,
  novaSub, renomeiaSub, removeSub,
} from '../data.js';

// Índice da linha sendo arrastada — variável de instância no protótipo (`_dragRow`), não estado.
let dragRow = null;

export function TableView() {
  const { activeSquad, dragMark } = state;
  const q = quarterAtual();   // C7: em visualização ou ativo
  const squads = squadsDoQuarter(q);
  const sq = squads[activeSquad];
  if (sq && sq.archived) { set({ activeSquad: primeiraSquadAtiva(q) }); return null; }   // aba apontando para squad arquivada
  if (sq) normalizeSquad(sq);
  const SQ = () => squadsDoQuarter(quarterAtivo(state.data))[state.activeSquad];

  // ---- edição inline ----
  const u = (j, key) => e => mut(d => setCampoItem(SQ(), j, key, e.target.value));

  // ---- drag & drop (o mesmo protocolo do protótipo) ----
  const markRow = j => dragMark && dragMark.type === 'row' && dragMark.j === j ? (dragMark.after ? ' mark-after' : ' mark-before') : '';
  const markCat = (cat, sub) => dragMark && dragMark.type === 'cat' && dragMark.cat === cat && dragMark.sub === (sub || '') ? ' mark-cat' : '';
  const rowDragOver = j => e => {
    if (dragRow == null) return; e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    const after = (e.clientY - r.top) > r.height / 2;
    const cur = state.dragMark;
    if (!cur || cur.type !== 'row' || cur.j !== j || cur.after !== after) set({ dragMark: { type: 'row', j, after } });
  };
  const rowDrop = j => e => {
    if (dragRow == null) return; e.preventDefault();
    const mk = state.dragMark;
    const tgt = itensDaSquad(SQ())[j];
    mut(() => reordenarItem(SQ(), dragRow, (mk && mk.type === 'row' && mk.after) ? j + 1 : j, tgt.cat, tgt.sub));
    dragRow = null; set({ dragMark: null });
  };
  const catDragOver = (cat, sub) => e => {
    if (dragRow == null) return; e.preventDefault();
    const cur = state.dragMark;
    if (!cur || cur.type !== 'cat' || cur.cat !== cat || cur.sub !== (sub || '')) set({ dragMark: { type: 'cat', cat, sub: sub || '' } });
  };
  const catDrop = (cat, sub) => e => {
    if (dragRow == null) return; e.preventDefault();
    const S = sub || '';
    const items = itensDaSquad(SQ());
    const last = ultimoIndice(items, it => (it.cat || '') === cat && (S ? (it.sub || '') === S : true));
    mut(() => reordenarItem(SQ(), dragRow, last >= 0 ? last + 1 : items.length, cat, S));
    dragRow = null; set({ dragMark: null });
  };
  const onDragStart = j => e => { dragRow = j; try { e.dataTransfer.setData('text/plain', ''); } catch (_) {} e.dataTransfer.effectAllowed = 'move'; };
  const onDragEnd = () => { dragRow = null; set({ dragMark: null }); };

  // ---- uma linha de item (agrupada: 8 colunas; plana: 10) ----
  const itemRow = (j, it, flat) => {
    const st = STATUS[it.st] || STATUS.backlog, pv = PREV[it.pv] || PREV.nao;
    return html`
      <tr class=${'t-row' + (dragRow === j ? ' dragging' : '') + markRow(j)} onDragOver=${rowDragOver(j)} onDrop=${rowDrop(j)}>
        <td class="t-handle" draggable="true" onDragStart=${onDragStart(j)} onDragEnd=${onDragEnd} title=${flat ? 'Arraste para reordenar' : 'Arraste para reordenar / mover'}>⠿</td>
        <td class=${'t-cell' + (flat ? ' t-min220' : ' t-min240')}><input class="cell cell-name" value=${it.n} onInput=${u(j, 'n')} placeholder="Nome do item" /></td>
        ${flat && html`<td class="t-cell"><input class="cell cell-cat" value=${it.cat} onInput=${u(j, 'cat')} placeholder="—" list="catlist" /></td>`}
        ${flat && html`<td class="t-cell"><input class="cell cell-sub" value=${it.sub} onInput=${u(j, 'sub')} placeholder="—" /></td>`}
        <td class="t-cell"><input class="cell cell-date" type="date" value=${it.s} onChange=${u(j, 's')} /></td>
        <td class="t-cell"><input class="cell cell-date" type="date" value=${it.e} onChange=${u(j, 'e')} /></td>
        <td class="t-cell"><select class="sel" value=${it.st} onChange=${u(j, 'st')} style=${`background-color:${mix(st.color, 16)};color:${st.chip}`}>${Object.entries(STATUS).map(([v, o]) => html`<option value=${v}>${o.label}</option>`)}</select></td>
        <td class="t-cell"><select class="sel sel-pv" value=${it.pv} onChange=${u(j, 'pv')} style=${`color:${pv.color}`}>${Object.entries(PREV).map(([v, o]) => html`<option value=${v}>${o.label}</option>`)}</select></td>
        <td class="t-cell t-pct">
          <div class="pct-wrap">
            <div class="pct-track"><i class="pct-fill" style=${`width:${it.p}%;background:${sq.color}`}></i></div>
            <input class="cell cell-pct" type="number" min="0" max="100" value=${it.p} onInput=${u(j, 'p')} /><span class="pct-sign">%</span>
          </div>
        </td>
        <td class="t-actions">
          <button class="row-btn row-btn-bl" title="Enviar ao backlog" onClick=${() => { mut(() => enviarAoBacklog(SQ(), j)); toast('Movido para o backlog'); }}>↓</button>
          <button class="row-btn row-btn-x" title="Remover" onClick=${() => mut(() => removeItem(SQ(), j))}>×</button>
        </td>
      </tr>`;
  };

  // ---- corpo da tabela: agrupado por categoria ou plano ----
  const rows = [];
  let theadCols, colspan;
  if (sq && sq.groupByCat) {
    theadCols = ['', 'Pilar / Item', 'Início', 'Fim', 'Status', 'Previsão', '% Conclusão', '']; colspan = 8;
    const idxOf = itensDaSquad(sq).map((it, j) => ({ it, j }));
    categoriasDaSquad(sq).forEach((c, ci) => {
      const inCat = idxOf.filter(x => (x.it.cat || '') === c.name);
      const pct = avg(inCat.map(x => x.it.p));
      rows.push(html`
        <tr class=${'cat-row' + markCat(c.name, '')} onDragOver=${catDragOver(c.name, '')} onDrop=${catDrop(c.name, '')}><td colSpan=${colspan} class="cat-td">
          <div class="cat-head">
            <span class="cat-name">
              <span class="cat-dot" style=${`background:${sq.color}`}></span>
              <input class="cat-input" value=${c.name || '—'} title="Clique para editar o nome da categoria" onInput=${e => { let ok = true; mut(() => { ok = renomeiaCategoria(SQ(), ci, e.target.value); }); if (!ok) toast('Já existe uma categoria com esse nome'); }} />
              <span class="cat-btns">
                <button class="cat-btn" onClick=${() => { mut(() => novaSub(SQ(), ci)); toast('Subcategoria criada — clique no nome para editar'); }}>+ sub</button>
                <button class="cat-btn cat-btn-x" title="Remover categoria" onClick=${() => { mut(() => removeCategoria(SQ(), ci)); toast('Categoria removida — itens preservados sem categoria'); }}>×</button>
              </span>
            </span>
            <span class="roll"><span class="roll-track"><i class="roll-fill" style=${`width:${pct}%;background:${sq.color}`}></i></span><b class="roll-pct">${pct}%</b></span>
          </div>
        </td></tr>`);
      c.subs.forEach((s, si) => {
        const inSub = inCat.filter(x => (x.it.sub || '') === s);
        const spct = avg(inSub.map(x => x.it.p));
        rows.push(html`
          <tr class=${'sub-row' + markCat(c.name, s)} onDragOver=${catDragOver(c.name, s)} onDrop=${catDrop(c.name, s)}><td colSpan=${colspan} class="sub-td">
            <div class="sub-head">
              <span class="sub-name">
                <span class="sub-arrow">▸</span>
                <input class="sub-input" value=${s} title="Clique para editar o nome da subcategoria" onInput=${e => { let ok = true; mut(() => { ok = renomeiaSub(SQ(), ci, si, e.target.value); }); if (!ok) toast('Já existe uma subcategoria com esse nome'); }} />
                <span class="cat-btns"><button class="cat-btn cat-btn-x" title="Remover subcategoria" onClick=${() => { mut(() => removeSub(SQ(), ci, si)); toast('Subcategoria removida — itens preservados'); }}>×</button></span>
              </span>
              <span class="roll"><span class="roll-track"><i class="roll-fill roll-fill-sub" style=${`width:${spct}%`}></i></span><b class="roll-pct roll-pct-sub">${spct}%</b></span>
            </div>
          </td></tr>`);
        inSub.forEach(x => rows.push(itemRow(x.j, x.it, false)));
      });
      inCat.filter(x => !x.it.sub || !c.subs.includes(x.it.sub)).forEach(x => rows.push(itemRow(x.j, x.it, false)));
      if (!inCat.length) rows.push(html`<tr onDragOver=${catDragOver(c.name, '')} onDrop=${catDrop(c.name, '')}><td colSpan=${colspan} class="empty-td">— arraste itens para cá ou use + para adicionar —</td></tr>`);
    });
    // B4: itens sem categoria sob um cabeçalho virtual (sem renomear/+ sub/×), alvo de arraste que limpa cat/sub
    const unc = idxOf.filter(x => !x.it.cat);
    if (unc.length && !categoriasDaSquad(sq).length) unc.forEach(x => rows.push(itemRow(x.j, x.it, false)));   // squad sem categorias: itens direto (§6.1)
    else if (unc.length) {
      const upct = avg(unc.map(x => x.it.p));
      rows.push(html`
        <tr class=${'cat-row' + markCat('', '')} onDragOver=${catDragOver('', '')} onDrop=${catDrop('', '')}><td colSpan=${colspan} class="cat-td">
          <div class="cat-head">
            <span class="cat-name cat-name-virtual"><span class="cat-dot cat-dot-virtual"></span>${SEM_CATEGORIA}</span>
            <span class="roll"><span class="roll-track"><i class="roll-fill" style=${`width:${upct}%;background:${sq.color}`}></i></span><b class="roll-pct">${upct}%</b></span>
          </div>
        </td></tr>`);
      unc.forEach(x => rows.push(itemRow(x.j, x.it, false)));
    }
  } else {
    theadCols = ['', 'Item', 'Categoria', 'Subcat.', 'Início', 'Fim', 'Status', 'Previsão', '% Conclusão', '']; colspan = 10;
    if (sq) itensDaSquad(sq).forEach((it, j) => rows.push(itemRow(j, it, true)));
  }

  const bl = sq ? (sq.backlog || []) : [];
  const catOpts = sq ? [...new Set(itensDaSquad(sq).map(i => i.cat).filter(Boolean))] : [];

  return html`
    <div>
      <h1 class="page-title">Roadmap</h1>
      <p class="page-sub">${'Editando ' + q.label + ' · ' + q.count + ' sprints a partir de ' + fmtBR(q.start) + ' · categorias (Pilar) opcionais por squad.'}</p>
      <div class="tabs">
        ${squads.map((s, i) => s.archived ? null : html`<button class=${'tab' + (i === activeSquad ? ' on' : '')} onClick=${() => set({ activeSquad: i })}><span class="tab-dot" style=${`background:${s.color}`}></span>${s.name}</button>`)}
      </div>
      <p class="help">Arraste pela alça ⠿ para reordenar um item ou movê-lo entre categorias. Use os botões nos cabeçalhos para gerenciar categorias e subcategorias.</p>

      <div class="tcard">
        <div class="tcard-head">
          <span class="squad-accent" style=${`background:${sq ? sq.color : 'var(--proto-green)'}`}></span>
          <span class="tcard-title">${sq ? sq.name : ''}</span>
          <div class="tcard-right">
            <button class="toggle-btn" onClick=${() => mut(() => alternaAgrupamento(SQ()))}><span class=${'sw' + (sq && sq.groupByCat ? ' on' : '')}><span class="sw-knob"></span></span>Agrupar por categoria</button>
            <span class="pill">${sq ? sq.items.length + ' no roadmap' + (sq.groupByCat ? ' · ' + sq.categories.length + ' categorias' : '') : ''}</span>
          </div>
        </div>
        <div class="tscroll">
          <table class="ttable">
            <thead><tr>${theadCols.map(c => html`<th class="th">${c}</th>`)}</tr></thead>
            <tbody>
              ${rows}
              <tr><td colSpan=${colspan} class="add-td"><button class="add-btn" onClick=${() => mut(() => novoItem(SQ(), quarterAtivo(state.data)))}>+ Adicionar item ao roadmap</button></td></tr>
            </tbody>
          </table>
        </div>
        <datalist id="catlist">${catOpts.map(c => html`<option value=${c}></option>`)}</datalist>
        <div class="newcat-wrap"><button class="newcat-btn" onClick=${() => { mut(() => novaCategoria(SQ())); toast('Categoria criada — clique no nome para editar'); }}>+ Nova categoria</button></div>
      </div>

      <div class="tcard">
        <div class="tcard-head tcard-head-bl">
          <span class="squad-accent squad-accent-bl"></span>
          <span class="tcard-title">Backlog — fora do roadmap</span>
          <span class="pill pill-right">${'não aparece no Gantt · ' + bl.length + ' itens'}</span>
        </div>
        <div class="tscroll">
          <table class="ttable">
            <thead><tr><th class="th th-16">Item</th><th class="th">Categoria</th><th class="th">Observação</th><th class="th"></th></tr></thead>
            <tbody>
              ${bl.map((b, k) => html`
                <tr class="bl-row">
                  <td class="t-cell t-cell-16 t-min240"><input class="cell cell-name" value=${b.n} onInput=${e => mut(() => { SQ().backlog[k].n = e.target.value; })} placeholder="Item do backlog" /></td>
                  <td class="t-cell"><input class="cell cell-cat cell-cat-150" value=${b.cat} onInput=${e => mut(() => { SQ().backlog[k].cat = e.target.value; })} placeholder="—" /></td>
                  <td class="t-cell t-min220"><input class="cell cell-note" value=${b.note} onInput=${e => mut(() => { SQ().backlog[k].note = e.target.value; })} placeholder="observação / motivo" /></td>
                  <td class="t-actions t-actions-12">
                    <button class="row-btn row-btn-up" title="Promover ao roadmap" onClick=${() => { mut(() => promoverAoRoadmap(SQ(), k, quarterAtivo(state.data))); toast('Promovido ao roadmap — defina as datas'); }}>↑</button>
                    <button class="row-btn row-btn-x" title="Remover" onClick=${() => mut(() => removeItemBacklog(SQ(), k))}>×</button>
                  </td>
                </tr>`)}
              ${bl.length === 0 && html`<tr><td colSpan="4" class="bl-empty">Nenhum item no backlog.</td></tr>`}
              <tr><td colSpan="4" class="add-td"><button class="add-btn" onClick=${() => mut(() => novoItemBacklog(SQ()))}>+ Adicionar item ao backlog</button></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
}
