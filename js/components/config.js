// components/config.js — view Squads & sprints (SPEC §7). Preact + htm.
// Passo 3a: tradução fiel do bloco `showCfg` do protótipo; toda mutação passa por data.js.
// 3b (Config-1, C11): duração da sprint em seletor 7·14·21·28. 3b (Config-2, C8 revisada): prefixo editável por squad,
// arquivar/desarquivar e excluir com travas nomeadas (itens, backlog, iniciativas; excluir só sem histórico).
import { html, Button } from '../ui.js';
import { state, set, mut, toast, switchQuarter, quarterAtual } from '../app.js';
import {
  quarterAtivo, quartersOrdenados, squadsDoQuarter, itensDoQuarter, sprintsOf, fmtBR,
  setCampoQuarter, setRotuloQuarter, arquivaQuarter, excluirQuarter, novoQuarter,
  novaSquad, removeSquad, setCampoSquad, alternaAgrupamento, DURACOES_SPRINT,
  setPrefixoSquad, travaSquad, arquivaSquad, temHistorico, primeiraSquadAtiva,
  foraDeCirculacao, retomaIniciativa, squadsAtivas,
} from '../data.js';

export function ConfigView() {
  const data = state.data;
  const q = quarterAtual();   // C7: em visualização ou ativo
  const sp = sprintsOf(q);

  // Calendário do quarter ativo — o `cfg(key, num)` do protótipo (clamp de dias 7–30 e sprints 1–16).
  const cfg = (key, num) => e => mut(d => setCampoQuarter(quarterAtivo(d), key, e.target.value, num));

  const onNovoQuarter = () => { mut(d => novoQuarter(d)); set({ activeSquad: 0, qMenuOpen: false }); toast('Quarter criado — ajuste rótulo e datas em Squads & sprints'); };
  const onExcluirQuarter = id => { let msg = null; mut(d => { msg = excluirQuarter(d, id); }); toast(msg || 'Quarter excluído'); };
  const onNovaSquad = () => { let i = 0; mut(d => { i = novaSquad(d); }); set({ activeSquad: i }); toast('Squad criada — renomeie no campo de nome'); };
  const ajustaAba = () => { const qq = quarterAtivo(state.data); const s = squadsDoQuarter(qq)[state.activeSquad]; if (!s || s.archived) set({ activeSquad: primeiraSquadAtiva(qq) }); };
  const onExcluirSquad = i => { const msg = travaSquad(state.data, q, i, 'excluir'); if (msg) { toast(msg); return; } mut(d => removeSquad(d, i)); set({ activeSquad: Math.min(state.activeSquad, squadsDoQuarter(quarterAtivo(state.data)).length - 1) }); ajustaAba(); toast('Squad excluída'); };
  const onArquivarSquad = i => { const s = squadsDoQuarter(q)[i]; if (!s.archived) { const msg = travaSquad(state.data, q, i, 'arquivar'); if (msg) { toast(msg); return; } } mut(d => arquivaSquad(quarterAtivo(d), i)); ajustaAba(); toast(s.archived ? 'Squad desarquivada' : 'Squad arquivada'); };
  const onPrefixo = (i, v) => { let ok = true; mut(d => { ok = setPrefixoSquad(quarterAtivo(d), i, v); }); if (!ok) toast('Prefixo inválido ou já usado por outra squad'); };

  // Fora de circulação (§4.3, §7): lista e retomada. A squad de destino é escolha local, não vai para o board.
  const fora = foraDeCirculacao(data);
  const destino = state.arqDestino || {};
  const onRetomar = (code, squadNome) => {
    let r; mut(d => { r = retomaIniciativa(d, code, squadNome); });
    toast(r && r.semCategoria ? 'Iniciativa retomada — a squad de destino não tem a categoria; ficou sem categoria' : 'Iniciativa retomada');
  };

  return html`
    <div>
      <h1 class="page-title">Squads & sprints</h1>
      <p class="page-sub">Configure o calendário de cada quarter e as squads.</p>

      <section class="card">
        <div class="card-title">Quarter atual — calendário de sprints</div>
        <div class="card-sub card-sub-18">As sprints (Sprint 01…NN) e as datas são geradas a partir do início da 1ª sprint e da quantidade. O Gantt recalcula automaticamente.</div>
        <div class="cfg-grid">
          <label class="cfg-label">Rótulo do quarter</label>
          <input class="input" value=${q.label} onInput=${cfg('label')} />
          <label class="cfg-label">Início da Sprint 01</label>
          <input class="input" type="date" value=${q.start} onChange=${cfg('start')} />
          <label class="cfg-label">Duração da sprint (dias)</label>
          <select class="input" value=${q.days} onChange=${e => mut(d => setCampoQuarter(quarterAtivo(d), 'days', Number(e.target.value)))}>
            ${DURACOES_SPRINT.map(n => html`<option value=${n}>${n + ' dias (' + n / 7 + (n === 7 ? ' semana)' : ' semanas)')}</option>`)}
          </select>
          <label class="cfg-label">Número de sprints</label>
          <input class="input" type="number" min="1" max="16" value=${q.count} onInput=${cfg('count', [1, 16])} />
        </div>
        <div class="sprint-chips">
          ${sp.map(s => html`<span class="sprint-chip">${s.label + ' · ' + s.range}</span>`)}
        </div>
      </section>

      <section class="card">
        <div class="card-title">Quarters</div>
        <div class="card-sub">Edite o nome, troque o ativo, arquive (sai do seletor do topo) ou exclua quarters sem itens no roadmap.</div>
        ${quartersOrdenados(data).map(({ id, q: x, on }) => {
          const itemCount = itensDoQuarter(x);
          return html`
            <div class="qrow">
              <input class="qlabel" value=${x.label} title="Clique para editar o nome do quarter" onInput=${e => mut(d => setRotuloQuarter(d, id, e.target.value))} />
              <span class="qmeta-cfg">${'Sprint 01–' + String(x.count).padStart(2, '0') + ' · início ' + fmtBR(x.start) + ' · ' + itemCount + ' itens'}</span>
              <span class=${'tag' + (on ? ' on' : '')}>${on ? 'ativo' : (x.archived ? 'arquivado' : 'inativo')}</span>
              <div class="qactions">
                ${!on && html`<button class="pill-btn pill-ativar" onClick=${() => switchQuarter(id)}>Ativar</button>`}
                <button class="pill-btn pill-arch" onClick=${() => mut(d => arquivaQuarter(d, id))}>${x.archived ? 'Desarquivar' : 'Arquivar'}</button>
                ${itemCount === 0 && !on && html`<button class="x-btn x-17" title="Excluir quarter (sem itens)" onClick=${() => onExcluirQuarter(id)}>×</button>`}
              </div>
            </div>`;
        })}
        <div class="mt14"><${Button} variant="secondary" size="small" onClick=${onNovoQuarter}>+ Novo quarter</${Button}></div>
      </section>

      <section class="card">
        <div class="card-title">Squads</div>
        <div class="card-sub">Nome, cor, prefixo do ID das iniciativas e se a squad usa categorias (Pilar). Arquivar ou excluir exige remanejar antes os itens e as iniciativas; excluir só sem histórico em outros quarters.</div>
        ${squadsDoQuarter(q).map((s, i) => html`
          <div class=${'sqrow' + (s.archived ? ' sqrow-arquivada' : '')}>
            <input class="color-input" type="color" value=${s.color} onChange=${e => mut(d => setCampoSquad(squadsDoQuarter(quarterAtivo(d))[i], 'color', e.target.value))} />
            <input class="sq-name" value=${s.name} onInput=${e => mut(d => setCampoSquad(squadsDoQuarter(quarterAtivo(d))[i], 'name', e.target.value))} />
            <input class="sq-prefix" value=${s.prefix} title="Prefixo do ID das iniciativas (ex.: PAY-107). Único no quarter." maxlength="4" onChange=${e => onPrefixo(i, e.target.value)} />
            <button class="toggle-btn" onClick=${() => mut(d => alternaAgrupamento(squadsDoQuarter(quarterAtivo(d))[i]))}>
              <span class=${'sw' + (s.groupByCat ? ' on' : '')}><span class="sw-knob"></span></span>categorias
            </button>
            ${s.archived && html`<span class="tag">arquivada</span>`}
            <button class="pill-btn pill-arch" onClick=${() => onArquivarSquad(i)}>${s.archived ? 'Desarquivar' : 'Arquivar'}</button>
            ${!temHistorico(data, s.name, q) && html`<button class="x-btn x-18" title="Excluir squad (sem histórico em outros quarters)" onClick=${() => onExcluirSquad(i)}>×</button>`}
          </div>`)}
        <div class="mt14"><${Button} variant="secondary" size="small" onClick=${onNovaSquad}>+ Adicionar squad</${Button}></div>
      </section>

      <section class="card">
        <div class="card-title">Arquivados e descartados</div>
        <div class="card-sub card-sub-18">Iniciativas fora de circulação (SPEC §4.3). Não aparecem no roadmap, no Gantt nem nos indicadores, e guardam o status em que os itens pararam. Retomar devolve tudo, na squad original ou em outra.</div>
        ${fora.length === 0 && html`<div class="bl-empty">Nada arquivado ou descartado.</div>`}
        ${fora.map(({ ini, itens, origens, noRoadmap }) => html`
          <div class="qrow">
            <span class="ini-selo">${ini.code}</span>
            <span class="arq-nome" title=${ini.t}>${ini.t || 'Sem nome'}</span>
            <span class=${'tag' + (ini.arq === 'descartado' ? ' tag-disc' : '')}>${ini.arq === 'descartado' ? 'descartado' : 'arquivado'}</span>
            <span class="qmeta-cfg">${itens + (itens === 1 ? ' item' : ' itens') + (noRoadmap ? ' · ' + noRoadmap + ' no roadmap' : '') + (origens.length ? ' · ' + origens.join(' · ') : '')}</span>
            ${!!ini.nota && html`<span class="arq-nota" title=${ini.nota}>${'“' + ini.nota + '”'}</span>`}
            ${!!ini.motivo && html`<span class="qmeta-cfg">${'motivo: ' + ini.motivo}</span>`}
            <div class="qactions">
              <select class="input arq-squad" value=${destino[ini.code] || ini.sq} onChange=${e => set({ arqDestino: { ...destino, [ini.code]: e.target.value } })}>
                ${squadsAtivas(q).map(s => html`<option value=${s.name}>${s.name}</option>`)}
              </select>
              <button class="pill-btn pill-ativar" onClick=${() => onRetomar(ini.code, destino[ini.code] || ini.sq)}>Retomar</button>
            </div>
          </div>`)}
      </section>
    </div>`;
}
