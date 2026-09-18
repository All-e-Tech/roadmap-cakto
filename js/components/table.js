// components/table.js — view Roadmap / tabela (SPEC §5). Preact + htm.
// 4b entrega 1 (17/09/2026): três tipos de linha — categoria → iniciativa → item. A iniciativa ocupa o
// lugar que era da subcategoria; iniciativa de um item só é renderizada como a própria linha do item, com
// o código em selo. O arraste move item entre iniciativas, iniciativa entre categorias e junta iniciativas.
// Toda leitura de linhas vem de linhasRoadmap() para a tabela e o Gantt nunca discordarem.
import { html, mix } from '../ui.js';
import { state, set, mut, toast, quarterAtual } from '../app.js';
import {
  STATUS, PREV, SEM_CATEGORIA, quarterAtivo, squadsDoQuarter, primeiraSquadAtiva, itensDaSquad, categoriasDaSquad, normalizeSquad, fmtBR,
  linhasRoadmap, iniciativaPorCode,
  setCampoItem, setTituloIniciativa, novaIniciativaNoRoadmap, novoItemNaIniciativa, removeItem,
  enviarAoBacklog, promoverAoRoadmap, novoItemBacklog, removeItemBacklog, setNomeBacklog,
  alternaAgrupamento, reordenarItem, moveItemParaIniciativa, moveIniciativaParaCategoria,
  extrairItem, juntarIniciativas, defineCategoriaDaIniciativa,
  novaCategoria, renomeiaCategoria, removeCategoria,
} from '../data.js';

// O que está sendo arrastado: { tipo: 'item' | 'iniciativa', j, code, sozinho }. Variável de instância, não estado.
let drag = null;

export function TableView() {
  const { data, activeSquad, dragMark } = state;
  const q = quarterAtual();   // C7: em visualização ou ativo
  const squads = squadsDoQuarter(q);
  const sq = squads[activeSquad];
  if (sq && sq.archived) { set({ activeSquad: primeiraSquadAtiva(q) }); return null; }
  if (sq) normalizeSquad(sq);
  const D = () => state.data;
  const SQ = () => squadsDoQuarter(quarterAtivo(state.data))[state.activeSquad];

  const u = (j, key) => e => mut(d => setCampoItem(d, SQ(), j, key, e.target.value));

  // ---- marcas visuais do arraste ----
  const markRow = j => dragMark && dragMark.type === 'row' && dragMark.j === j ? (dragMark.after ? ' mark-after' : ' mark-before') : '';
  const markAlvo = (tipo, chave) => dragMark && dragMark.type === tipo && dragMark.chave === chave ? ' mark-cat' : '';
  const fimDoArraste = () => { drag = null; set({ dragMark: null }); };
  const onDragStart = carga => e => { drag = carga; try { e.dataTransfer.setData('text/plain', ''); } catch (_) {} e.dataTransfer.effectAllowed = 'move'; };

  // ---- soltar sobre uma linha de item: reordena; se o alvo é de outra iniciativa, move para ela ----
  const rowDragOver = j => e => {
    if (!drag) return; e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    const after = (e.clientY - r.top) > r.height / 2;
    const cur = state.dragMark;
    if (!cur || cur.type !== 'row' || cur.j !== j || cur.after !== after) set({ dragMark: { type: 'row', j, after } });
  };
  const rowDrop = j => e => {
    if (!drag) return; e.preventDefault();
    const mk = state.dragMark, pos = (mk && mk.type === 'row' && mk.after) ? j + 1 : j;
    if (drag.tipo === 'item') {
      const alvo = itensDaSquad(SQ())[j];
      const de = drag.j;
      if (alvo.ini === drag.code) mut(() => reordenarItem(SQ(), de, pos));
      else if (drag.sozinho) {
        // Linha de item sozinha É a iniciativa: soltar sobre outra iniciativa junta as duas.
        let r; mut(d => { r = juntarIniciativas(d, drag.code, alvo.ini); });
        if (r && r.ok) toast('Iniciativas juntadas em ' + alvo.ini);
      } else { let r; mut(d => { r = moveItemParaIniciativa(d, SQ(), de, alvo.ini, pos); }); if (r && !r.ok) toast(r.msg); }
    }
    fimDoArraste();
  };

  // ---- soltar sobre uma linha de iniciativa: move o item para ela, ou junta as duas ----
  const iniDragOver = code => e => {
    if (!drag) return; e.preventDefault();
    const cur = state.dragMark;
    if (!cur || cur.type !== 'ini' || cur.chave !== code) set({ dragMark: { type: 'ini', chave: code } });
  };
  const iniDrop = code => e => {
    if (!drag) return; e.preventDefault();
    if (drag.code !== code) {
      if (drag.tipo === 'iniciativa' || drag.sozinho) {
        let r; mut(d => { r = juntarIniciativas(d, drag.code, code); });
        if (r && r.ok) toast('Iniciativas juntadas em ' + code);
      } else {
        let r; mut(d => { r = moveItemParaIniciativa(d, SQ(), drag.j, code); });
        if (r && !r.ok) toast(r.msg);
      }
    }
    fimDoArraste();
  };

  // ---- soltar sobre um cabeçalho de categoria: move a iniciativa; item avulso é recusado ----
  const catDragOver = nome => e => {
    if (!drag) return; e.preventDefault();
    const cur = state.dragMark;
    if (!cur || cur.type !== 'cat' || cur.chave !== nome) set({ dragMark: { type: 'cat', chave: nome } });
  };
  const catDrop = nome => e => {
    if (!drag) return; e.preventDefault();
    if (drag.tipo === 'iniciativa' || drag.sozinho) mut(d => moveIniciativaParaCategoria(d, drag.code, nome));
    else toast('A categoria é da iniciativa — arraste a iniciativa');
    fimDoArraste();
  };

  // ---- ações de uma linha de item ----
  const acoesItem = (j, code, podeExtrair) => html`
    <td class="t-actions">
      <button class="row-btn row-btn-add" title="Adicionar item a esta iniciativa" onClick=${() => mut(() => novoItemNaIniciativa(SQ(), code))}>+</button>
      ${podeExtrair && html`<button class="row-btn row-btn-out" title="Extrair para iniciativa própria" onClick=${() => { let r; mut(d => { r = extrairItem(d, SQ(), j); }); if (r && r.ok) toast('Item extraído — nova iniciativa ' + r.code); else if (r) toast(r.msg); }}>↗</button>`}
      <button class="row-btn row-btn-bl" title="Enviar ao backlog" onClick=${() => { mut(() => enviarAoBacklog(SQ(), j)); toast('Movido para o backlog'); }}>↓</button>
      <button class="row-btn row-btn-x" title="Remover" onClick=${() => { let foi; mut(d => { foi = removeItem(d, SQ(), j); }); if (foi) toast('Item e iniciativa removidos'); }}>×</button>
    </td>`;

  // ---- uma linha de item (agrupada: 8 colunas; plana: 10) ----
  const itemRow = (l, flat) => {
    const { j, it, code, sozinho } = l;
    const st = STATUS[it.st] || STATUS.backlog, pv = PREV[it.pv] || PREV.nao;
    const ini = iniciativaPorCode(data, code);
    const podeExtrair = !sozinho;
    const carga = { tipo: 'item', j, code, sozinho };
    return html`
      <tr class=${'t-row' + (drag && drag.tipo === 'item' && drag.j === j ? ' dragging' : '') + markRow(j) + (sozinho ? '' : ' t-row-filha')}
          onDragOver=${rowDragOver(j)} onDrop=${rowDrop(j)}>
        <td class="t-handle" draggable="true" onDragStart=${onDragStart(carga)} onDragEnd=${fimDoArraste} title=${sozinho ? 'Arraste para reordenar ou mover de categoria' : 'Arraste para reordenar ou mover de iniciativa'}>⠿</td>
        <td class=${'t-cell' + (flat ? ' t-min220' : ' t-min240')}>
          <span class="ini-selo" title=${ini ? 'Iniciativa ' + ini.code : ''}>${code}</span>
          <input class="cell cell-name" value=${it.n} onInput=${u(j, 'n')} placeholder="Nome do item" />
        </td>
        ${flat && html`<td class="t-cell"><span class="cell-ro">${ini ? ini.t || '—' : '—'}</span></td>`}
        ${flat && html`<td class="t-cell"><input class="cell cell-cat" value=${ini ? ini.cat : ''} onInput=${e => mut(d => defineCategoriaDaIniciativa(d, SQ(), code, e.target.value))} placeholder="—" list="catlist" /></td>`}
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
        ${acoesItem(j, code, podeExtrair)}
      </tr>`;
  };

  // ---- linha de grupo da iniciativa (2+ itens) ----
  const iniRow = (l, colspan) => html`
    <tr class=${'sub-row' + markAlvo('ini', l.code)} onDragOver=${iniDragOver(l.code)} onDrop=${iniDrop(l.code)}><td colSpan=${colspan} class="sub-td">
      <div class="sub-head">
        <span class="sub-name" draggable="true" onDragStart=${onDragStart({ tipo: 'iniciativa', code: l.code })} onDragEnd=${fimDoArraste}>
          <span class="sub-arrow">▸</span>
          <span class="ini-selo" title="Iniciativa">${l.code}</span>
          <input class="sub-input" value=${l.titulo} title="Nome da iniciativa" onInput=${e => mut(d => setTituloIniciativa(d, l.code, e.target.value))} />
          <span class="ini-meta">${l.entregues + ' de ' + l.total + ' entregues'}</span>
          <span class="ini-datas">${l.s ? fmtBR(l.s) + ' a ' + fmtBR(l.e) : 'sem datas'}</span>
          <span class="cat-btns"><button class="cat-btn" title="Adicionar item a esta iniciativa" onClick=${() => mut(() => novoItemNaIniciativa(SQ(), l.code))}>+ item</button></span>
        </span>
        <span class="roll"><span class="roll-track"><i class="roll-fill roll-fill-sub" style=${`width:${l.pct}%`}></i></span><b class="roll-pct roll-pct-sub">${l.pct}%</b></span>
      </div>
    </td></tr>`;

  // ---- corpo da tabela ----
  const rows = [];
  let theadCols, colspan;
  if (sq && sq.groupByCat) {
    theadCols = ['', 'Pilar / Item', 'Início', 'Fim', 'Status', 'Previsão', '% Conclusão', '']; colspan = 8;
    const linhas = linhasRoadmap(data, sq);
    let ci = -1;
    linhas.forEach(l => {
      if (l.tipo === 'categoria') {
        const idx = l.virtual ? -1 : ++ci;
        rows.push(html`
          <tr class=${'cat-row' + markAlvo('cat', l.virtual ? '' : l.nome)} onDragOver=${catDragOver(l.virtual ? '' : l.nome)} onDrop=${catDrop(l.virtual ? '' : l.nome)}><td colSpan=${colspan} class="cat-td">
            <div class="cat-head">
              ${l.virtual
                ? html`<span class="cat-name cat-name-virtual"><span class="cat-dot cat-dot-virtual"></span>${SEM_CATEGORIA}</span>`
                : html`<span class="cat-name">
                    <span class="cat-dot" style=${`background:${sq.color}`}></span>
                    <input class="cat-input" value=${l.nome || '—'} title="Clique para editar o nome da categoria" onInput=${e => { let ok = true; mut(d => { ok = renomeiaCategoria(d, SQ(), idx, e.target.value); }); if (!ok) toast('Já existe uma categoria com esse nome'); }} />
                    <span class="cat-btns"><button class="cat-btn cat-btn-x" title="Remover categoria" onClick=${() => { mut(d => removeCategoria(d, SQ(), idx)); toast('Categoria removida — iniciativas preservadas sem categoria'); }}>×</button></span>
                  </span>`}
              <span class="roll"><span class="roll-track"><i class="roll-fill" style=${`width:${l.pct}%;background:${sq.color}`}></i></span><b class="roll-pct">${l.pct}%</b></span>
            </div>
          </td></tr>`);
      } else if (l.tipo === 'vazio') {
        rows.push(html`<tr><td colSpan=${colspan} class="empty-td">— arraste iniciativas para cá ou use + para adicionar —</td></tr>`);
      } else if (l.tipo === 'iniciativa') {
        rows.push(iniRow(l, colspan));
      } else {
        rows.push(itemRow(l, false));
      }
    });
  } else {
    theadCols = ['', 'Item', 'Iniciativa', 'Categoria', 'Início', 'Fim', 'Status', 'Previsão', '% Conclusão', '']; colspan = 10;
    if (sq) linhasRoadmap(data, sq).filter(l => l.tipo === 'item').forEach(l => rows.push(itemRow(l, true)));
  }

  const bl = sq ? (sq.backlog || []) : [];
  const catOpts = sq ? categoriasDaSquad(sq).map(c => c.name) : [];

  return html`
    <div>
      <h1 class="page-title">Roadmap</h1>
      <p class="page-sub">${'Editando ' + q.label + ' · ' + q.count + ' sprints a partir de ' + fmtBR(q.start) + ' · categorias (Pilar) opcionais por squad.'}</p>
      <div class="tabs">
        ${squads.map((s, i) => s.archived ? null : html`<button class=${'tab' + (i === activeSquad ? ' on' : '')} onClick=${() => set({ activeSquad: i })}><span class="tab-dot" style=${`background:${s.color}`}></span>${s.name}</button>`)}
      </div>
      <p class="help">Arraste pela alça ⠿ para reordenar, mover um item entre iniciativas ou soltar uma iniciativa sobre outra para juntá-las. Cabeçalho de categoria recebe iniciativas.</p>

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
              <tr><td colSpan=${colspan} class="add-td"><button class="add-btn" onClick=${() => mut(d => novaIniciativaNoRoadmap(d, SQ(), ''))}>+ Adicionar item ao roadmap</button></td></tr>
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
            <thead><tr><th class="th th-16">Item</th><th class="th">Iniciativa</th><th class="th">Observação</th><th class="th"></th></tr></thead>
            <tbody>
              ${bl.map((b, k) => { const ini = iniciativaPorCode(data, b.ini); return html`
                <tr class="bl-row">
                  <td class="t-cell t-cell-16 t-min240"><span class="ini-selo">${b.ini}</span><input class="cell cell-name" value=${b.n} onInput=${e => mut(d => setNomeBacklog(d, SQ(), k, e.target.value))} placeholder="Item do backlog" /></td>
                  <td class="t-cell"><span class="cell-ro">${ini ? (ini.t || '—') + (ini.cat ? ' · ' + ini.cat : '') : '—'}</span></td>
                  <td class="t-cell t-min220"><input class="cell cell-note" value=${b.note} onInput=${e => mut(() => { SQ().backlog[k].note = e.target.value; })} placeholder="observação / motivo" /></td>
                  <td class="t-actions t-actions-12">
                    <button class="row-btn row-btn-up" title="Promover ao roadmap" onClick=${() => { mut(() => promoverAoRoadmap(SQ(), k)); toast('Promovido ao roadmap — defina as datas'); }}>↑</button>
                    <button class="row-btn row-btn-x" title="Remover" onClick=${() => { let foi; mut(d => { foi = removeItemBacklog(d, SQ(), k); }); if (foi) toast('Item e iniciativa removidos'); }}>×</button>
                  </td>
                </tr>`; })}
              ${bl.length === 0 && html`<tr><td colSpan="4" class="bl-empty">Nenhum item no backlog.</td></tr>`}
              <tr><td colSpan="4" class="add-td"><button class="add-btn" onClick=${() => mut(d => novoItemBacklog(d, SQ()))}>+ Adicionar item ao backlog</button></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
}
