# cakto-design — components.md (v2.0.0)

Snippets HTML+CSS dos componentes da skill `cakto-design`. Todos consomem os tokens de `tokens.css` — nenhum hex fixo aqui. Cada bloco traz: tokens usados, medidas, estados e o snippet. Estados seguem a mesma gramática em todos os componentes:

- **hover** — muda cor de fundo (nunca escala). Botão preenchido: glow `--shadow-btn-hover`. Botão outline: preenche com a cor da borda.
- **active/selected** — sempre cor: fundo verde com alpha (`--soft-green` 16% / `--soft-green-strong` 20%) + texto ou borda verde. Nunca `transform`, nunca sombra interna.
- **disabled** — `opacity: var(--op-half)` (0.5) + `cursor: not-allowed`. Botão preenchido: fundo `--bg`, texto `--text-disabled`.
- **focus** — `:focus-visible` com `--focus-ring`. Em inputs, a borda vira `--focus-border` (branca no dark, verde no light).
- **transição** — cor/sombra em `--dur-fast` (150ms); toggle em `--dur` (200ms). Sem bounce.

Medidas: ícone dentro de botão/chip/input = 16–20px; ícone solto = 24px, stroke 1.5px, `stroke: currentColor`.

---

## Base

### Button

Tokens: `--primary`, `--primary-hover`, `--text-on-primary`, `--error`, `--r-control`, `--btn-h*`, `--btn-pad`, `--btn-gap`, `--t-button`, `--shadow-btn-hover*`.
Medidas: h40 (sm 32 / lg 48), pad `8px 16px`, gap 10, raio 8, peso 700.
Variantes: `primary` (fundo `--primary`, texto branco), `secondary` (outline `--primary-text`, preenche no hover), `ghost` (transparente, hover `--elevated`), `danger` (fundo `--error`).

```html
<button class="btn btn-primary">Efetuar saque</button>
<button class="btn btn-secondary">Exportar</button>
<button class="btn btn-ghost">Cancelar</button>
<button class="btn btn-danger">Excluir produto</button>
<button class="btn btn-primary" disabled>Salvando…</button>
```
```css
.btn{display:inline-flex;align-items:center;justify-content:center;gap:var(--btn-gap);min-height:var(--btn-h);padding:var(--btn-pad);border-radius:var(--r-control);border:1px solid transparent;font:var(--t-button);cursor:pointer;transition:background var(--dur-fast) var(--ease),box-shadow var(--dur-fast) var(--ease),color var(--dur-fast) var(--ease)}
.btn-primary{background:var(--primary);color:var(--text-on-primary)}
.btn-primary:hover{background:var(--primary-hover);box-shadow:var(--shadow-btn-hover)}
.btn-secondary{background:transparent;color:var(--primary-text);border-color:var(--primary-text)}
.btn-secondary:hover{background:var(--primary);color:var(--text-on-primary);border-color:transparent;box-shadow:var(--shadow-btn-hover)}
.btn-ghost{background:transparent;color:var(--text-secondary)}
.btn-ghost:hover{background:var(--elevated);color:var(--text)}
.btn-danger{background:var(--error);color:#fff}
.btn-danger:hover{box-shadow:var(--shadow-btn-hover-danger)}
.btn:disabled{background:var(--bg);color:var(--text-disabled);border-color:transparent;box-shadow:none;cursor:not-allowed}
.btn.sm{min-height:var(--btn-h-sm);padding:4px 12px;font-size:14px;line-height:20px}
.btn.lg{min-height:var(--btn-h-lg);padding:12px 20px;font-size:16px}
```

### IconButton

Tokens: `--icon-btn`, `--r-pill`, `--elevated`, `--nav-active-bg`, `--text-secondary`.
Medidas: 36px (sm 28 / lg 44), ícone 20px, pill. Hover: fundo `--elevated`. Active: `--nav-active-bg` + `--primary-text`.

```html
<button class="icon-btn" aria-label="Mais ações"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg></button>
```
```css
.icon-btn{width:var(--icon-btn);height:var(--icon-btn);display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:var(--r-pill);background:transparent;color:var(--text-secondary);cursor:pointer;transition:background var(--dur-fast) var(--ease)}
.icon-btn:hover{background:var(--elevated);color:var(--text)}
.icon-btn.active{background:var(--nav-active-bg);color:var(--primary-text)}
.icon-btn:disabled{color:var(--text-disabled);opacity:.6;cursor:not-allowed}
```

### Badge

Contador ou dot de notificação. Tokens: `--error`, `--r-pill`. Medidas: count minW20 h20 pad `0 6px` 12/18 700; dot 8px.
O badge gradiente NOVO/BETA do Figma é da paleta anterior (`#36b37e → #14513c`) — sem versão no rebrand; usar `Tag` soft com texto `NOVO` no lugar.

```html
<span class="badge-count">3</span>
<span class="badge-dot" aria-hidden="true"></span>
```
```css
.badge-count{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;border-radius:var(--r-pill);background:var(--error);color:#fff;font:700 12px/18px var(--font-sans)}
.badge-dot{display:inline-block;width:8px;height:8px;border-radius:var(--r-pill);background:var(--error)}
```

### Chip

Filtro aplicado / seleção múltipla. Tokens: `--chip-h`, `--r-pill`, `--t-chip-label`, `--soft-*`, `--on-soft-*`.
Medidas: h32 (sm 24), pad `0 12px`, gap 8, 500 13/18. Variantes: `soft` (padrão), `outlined`. Remover = `×` a 70% de opacidade.

```html
<span class="chip chip-green">Pix <button class="chip-x" aria-label="Remover">×</button></span>
<span class="chip chip-grey">Últimos 30 dias</span>
<span class="chip chip-outline">Assinatura</span>
```
```css
.chip{display:inline-flex;align-items:center;gap:var(--sp-8);height:var(--chip-h);padding:0 12px;border-radius:var(--r-pill);border:1px solid transparent;font:var(--t-chip-label)}
.chip-green{background:var(--soft-green);color:var(--on-soft-green)}
.chip-grey{background:var(--soft-grey);color:var(--on-soft-grey)}
.chip-outline{background:transparent;color:var(--text);border-color:var(--line-strong)}
.chip.sm{height:var(--chip-h-sm);padding:0 8px}
.chip-x{border:0;background:none;color:inherit;opacity:.7;cursor:pointer;font-size:14px;line-height:1;padding:0}
.chip-x:hover{opacity:1}
```

### Tag

Status em tabelas e cards — **sempre soft** (fundo 16% + texto legível). Nunca fundo sólido em status. Tokens: `--soft-*`, `--on-soft-*`, `--r-control`.
Medidas: h24, pad `0 8px`, 700 12/18, raio 8. Vocabulário: Ativo · Pago · Pendente · Cancelado · Chargeback · Em análise · Rascunho.

```html
<span class="tag tag-success">Pago</span>
<span class="tag tag-warning">Pendente</span>
<span class="tag tag-error">Chargeback</span>
<span class="tag tag-info">Em análise</span>
<span class="tag tag-grey">Rascunho</span>
<span class="tag tag-green">Ativo</span>
```
```css
.tag{display:inline-flex;align-items:center;gap:var(--sp-4);height:24px;padding:0 8px;border-radius:var(--r-control);font:700 12px/18px var(--font-sans);white-space:nowrap}
.tag-success{background:var(--soft-success);color:var(--on-soft-success)}
.tag-warning{background:var(--soft-warning);color:var(--on-soft-warning)}
.tag-error{background:var(--soft-error);color:var(--on-soft-error)}
.tag-info{background:var(--soft-info);color:var(--on-soft-info)}
.tag-grey{background:var(--soft-grey);color:var(--on-soft-grey)}
.tag-green{background:var(--soft-green);color:var(--on-soft-green)}
```

### Avatar

Tokens: `--avatar`, `--avatar-bg`, `--r-pill`, `--success`, `--paper`. Medidas: 40px (32 em tabela, 24 em lista densa), iniciais 600 a 36% do tamanho, dot de status 28% com borda 2px `--paper`.

```html
<span class="avatar" style="--size:40px">AL<i class="avatar-dot online"></i></span>
```
```css
.avatar{--size:var(--avatar);position:relative;display:inline-flex;align-items:center;justify-content:center;width:var(--size);height:var(--size);border-radius:var(--r-pill);background:var(--avatar-bg);color:var(--text);font-weight:600;font-size:calc(var(--size)*.36);flex:none;overflow:visible}
.avatar img{width:100%;height:100%;border-radius:inherit;object-fit:cover}
.avatar-dot{position:absolute;right:0;bottom:0;width:calc(var(--size)*.28);height:calc(var(--size)*.28);border-radius:var(--r-pill);border:2px solid var(--paper)}
.avatar-dot.online{background:var(--success)}.avatar-dot.busy{background:var(--error)}.avatar-dot.away{background:var(--warning)}.avatar-dot.offline{background:var(--text-secondary)}
```

### Divider

```html
<hr class="divider">
<span class="divider-v"></span>
```
```css
.divider{border:0;border-top:var(--stroke-hairline) solid var(--line);margin:0}
.divider-v{align-self:stretch;width:0;border-left:var(--stroke-hairline) solid var(--line)}
```

---

## Formulários

Anatomia comum: label 600 12/18 `--text-secondary` acima · campo h40 raio 8 fundo `--input-bg` borda `--input-border` · helper 12/18 abaixo. Erro: borda e helper em `--error`. Foco: borda `--focus-border`.

### Input

```html
<label class="field">
  <span class="field-label">E-mail</span>
  <span class="field-box"><input placeholder="voce@email.com"></span>
  <span class="field-help">Usado só para notificações.</span>
</label>
<label class="field is-error">
  <span class="field-label">CPF</span>
  <span class="field-box"><input value="123"></span>
  <span class="field-help">CPF inválido</span>
</label>
```
```css
.field{display:flex;flex-direction:column;gap:var(--sp-4);width:100%}
.field-label{font:var(--t-input-label);color:var(--text-secondary)}
.field-box{display:flex;align-items:center;gap:var(--sp-8);min-height:var(--input-h);padding:var(--input-pad);background:var(--input-bg);border:1px solid var(--input-border);border-radius:var(--r-control);transition:border-color var(--dur-fast) var(--ease)}
.field-box:focus-within{border-color:var(--focus-border)}
.field-box input,.field-box select{flex:1;min-width:0;border:0;outline:0;background:transparent;color:var(--text);font:var(--t-input-text)}
.field-box input::placeholder{color:var(--text-disabled)}
.field-box svg{flex:none;color:var(--text-secondary)}
.field-help{font:var(--t-caption);color:var(--text-secondary)}
.field.is-error .field-box{border-color:var(--error)}
.field.is-error .field-help{color:var(--error)}
.field.is-disabled{opacity:var(--op-half);pointer-events:none}
```

### Select

Mesma casca do Input (`.field-box`) com `<select>` nativo ou menu customizado. Menu: fundo `--paper`, borda `--line`, raio 8, sombra `--shadow`, pad 4, item `8px 12px` raio 4, selecionado = `--nav-active-bg` + `--primary-text` 700.

```html
<label class="field">
  <span class="field-label">Período</span>
  <span class="field-box"><select><option>Hoje</option><option>7 dias</option><option selected>30 dias</option></select></span>
</label>
<div class="menu" role="listbox">
  <div class="menu-item">Hoje</div>
  <div class="menu-item is-selected">30 dias</div>
</div>
```
```css
.field-box select{appearance:none;background:transparent url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23919EAB' stroke-width='1.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right center;padding-right:24px;cursor:pointer}
.menu{background:var(--paper);border:1px solid var(--line);border-radius:var(--r-control);box-shadow:var(--shadow);padding:var(--sp-4);min-width:180px;max-height:240px;overflow-y:auto;z-index:var(--z-menu)}
.menu-item{padding:8px 12px;border-radius:var(--r-4);font:var(--t-body2);color:var(--text);cursor:pointer}
.menu-item:hover{background:var(--elevated)}
.menu-item.is-selected{background:var(--nav-active-bg);color:var(--primary-text);font-weight:700}
```

### SearchInput

h40, w248 padrão, ícone lupa 20px `--text-secondary` à esquerda, fundo transparente (ou `--input-bg` quando `filled`), texto 14/20.

```html
<span class="search"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input placeholder="Pesquisar produto"></span>
```
```css
.search{display:flex;align-items:center;gap:var(--sp-8);width:248px;height:var(--input-h);padding:var(--input-pad);border:1px solid var(--input-border);border-radius:var(--r-control);color:var(--text-secondary);transition:border-color var(--dur-fast) var(--ease)}
.search.filled{background:var(--input-bg)}
.search:focus-within{border-color:var(--focus-border)}
.search input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:var(--text);font:var(--t-body-sm)}
```

### Checkbox

Caixa 16px raio 4, borda 1.667px `--text-secondary`; marcado = fundo `--primary`, check branco 3px. Hit-area 40px com halo `rgba(15,120,101,.15)` no hover. Label 14/22.

```html
<label class="check"><input type="checkbox" checked><span class="check-hit"><span class="check-box"></span></span>Lembrar de mim</label>
```
```css
.check{display:inline-flex;align-items:center;gap:var(--sp-8);font:var(--t-body2);color:var(--text);cursor:pointer}
.check input{position:absolute;opacity:0;width:0;height:0}
.check-hit{width:var(--checkbox-hit);height:var(--checkbox-hit);margin:-8px;display:inline-flex;align-items:center;justify-content:center;border-radius:var(--r-pill);transition:background var(--dur-fast) var(--ease)}
.check:hover .check-hit{background:rgba(15,120,101,.15)}
.check-box{width:var(--checkbox-size);height:var(--checkbox-size);border-radius:var(--r-4);border:var(--checkbox-stroke) solid var(--text-secondary);display:inline-flex;align-items:center;justify-content:center}
.check input:checked + .check-hit .check-box{background:var(--primary);border-color:transparent}
.check input:checked + .check-hit .check-box::after{content:"";width:5px;height:9px;border:solid #fff;border-width:0 2.5px 2.5px 0;transform:translateY(-1px) rotate(45deg)}
.check input:focus-visible + .check-hit{outline:var(--focus-ring);outline-offset:-4px}
.check.is-disabled{opacity:var(--op-half);pointer-events:none}
```

### Toggle

44×24, raio 16, thumb 16 branco, translate 20px. Off = `--surface-muted`/`--line`; on = `--primary`. 200ms.

```html
<label class="toggle"><input type="checkbox" checked><span class="toggle-track"><span class="toggle-thumb"></span></span>Ativar produto</label>
```
```css
.toggle{display:inline-flex;align-items:center;gap:var(--sp-12);font:var(--t-body2);color:var(--text);cursor:pointer}
.toggle input{position:absolute;opacity:0;width:0;height:0}
.toggle-track{width:var(--toggle-w);height:var(--toggle-h);padding:4px;border-radius:16px;background:var(--line);display:flex;align-items:center;transition:background var(--dur) var(--ease);flex:none}
.toggle-thumb{width:var(--toggle-thumb);height:var(--toggle-thumb);border-radius:var(--r-pill);background:#fff;transition:transform var(--dur) var(--ease)}
.toggle input:checked + .toggle-track{background:var(--primary)}
.toggle input:checked + .toggle-track .toggle-thumb{transform:translateX(20px)}
.toggle input:focus-visible + .toggle-track{outline:var(--focus-ring);outline-offset:var(--focus-offset)}
```

### DateField

Input com ícone calendário 20px à direita, placeholder `DD/MM/AAAA`. Mesma casca `.field`.

```html
<label class="field">
  <span class="field-label">Vencimento</span>
  <span class="field-box"><input placeholder="DD/MM/AAAA" value="29/08/2026"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></svg></span>
</label>
```

### FormHelperText

Já coberto por `.field-help`. Estados: default `--text-secondary` · error `--error` · success `--primary-text` · disabled `--text-disabled`.

```css
.field-help.success{color:var(--primary-text)}
.field-help.disabled{color:var(--text-disabled)}
```

---

## Dados

### Card

Fundo `--paper`, raio 16, pad 24, **sem borda por padrão**; borda hairline só quando o card está sobre `--paper` (card dentro de card). Hover em card clicável = `--shadow`. Acento: borda esquerda 4px. Destaque: outline 4px `--primary`. Título 600 18/28.

```html
<section class="card">
  <header class="card-head"><h3 class="card-title">Vendas por squad</h3><button class="btn btn-ghost sm">Ver tudo</button></header>
  …
</section>
<section class="card accent-warning">…</section>
```
```css
.card{background:var(--paper);border-radius:var(--r-card);padding:var(--card-pad);display:flex;flex-direction:column;gap:var(--card-gap);transition:box-shadow var(--dur-fast) var(--ease)}
.card.clickable{cursor:pointer}.card.clickable:hover{box-shadow:var(--shadow)}
.card.bordered{border:var(--stroke-hairline) solid var(--line)}
.card.highlight{outline:var(--stroke-outline) solid var(--primary)}
.card.accent-green{border-left:var(--stroke-outline) solid var(--green-light)}
.card.accent-warning{border-left:var(--stroke-outline) solid var(--warning)}
.card.accent-error{border-left:var(--stroke-outline) solid var(--error)}
.card-head{display:flex;align-items:center;gap:var(--sp-16)}
.card-title{flex:1;margin:0;font:var(--t-h6);color:var(--text)}
```

### StatCard

KPI: label 700 14/20 `--text-secondary` · valor `--t-metric` (700 32/40) `--text` tabular · delta em Tag soft. Borda esquerda 4px = semântica (verde disponível / warning pendente / error risco).

```html
<div class="stat accent-green">
  <div class="stat-label">Receita líquida <span class="tag tag-success">+12,4%</span></div>
  <div class="stat-value">R$ 1.284.560,00</div>
  <div class="stat-caption">vs. mês anterior</div>
</div>
```
```css
.stat{background:var(--paper);border-radius:var(--r-card);padding:var(--card-pad);display:flex;flex-direction:column;gap:var(--sp-12)}
.stat.accent-green{border-left:var(--stroke-outline) solid var(--green-light)}
.stat.accent-warning{border-left:var(--stroke-outline) solid var(--warning)}
.stat.accent-error{border-left:var(--stroke-outline) solid var(--error)}
.stat-label{display:flex;align-items:center;justify-content:space-between;gap:var(--sp-8);font:700 14px/20px var(--font-sans);color:var(--text-secondary)}
.stat-value{font:var(--t-metric);color:var(--text);font-variant-numeric:var(--num-tabular);letter-spacing:-.01em}
.stat-caption{font:var(--t-caption);color:var(--text-secondary)}
```

### Table

Tabela é um card: container `--paper` raio 16 overflow hidden. Head `--table-head-bg` 600 14/24 `--text-secondary`. Célula pad `16px 24px` (Figma: 16/32 em telas largas), 14/20. Linha: borda superior `--line`, hover `--elevated`, selecionada `--nav-active-bg`. Dinheiro à direita com `tabular-nums`, 700. Célula tipada: valor + caption 12/18 `--text-secondary`. Action cell: IconButtons à direita, visíveis só no hover quando `quick-view`.

```html
<div class="table-wrap">
<table class="table">
  <thead><tr><th>Data</th><th>Cliente</th><th>Status</th><th class="num">Valor líquido</th><th class="act"></th></tr></thead>
  <tbody>
    <tr>
      <td><div class="cell">04/09/2026 14:32<span class="cell-sub">há 2 h</span></div></td>
      <td><div class="cell">Ana Lima<span class="cell-sub">ana@exemplo.com</span></div></td>
      <td><span class="tag tag-success">Pago</span></td>
      <td class="num strong">R$ 4.980,00</td>
      <td class="act"><button class="icon-btn" aria-label="Ações">⋯</button></td>
    </tr>
  </tbody>
</table>
</div>
```
```css
.table-wrap{background:var(--paper);border-radius:var(--r-card);overflow:auto}
.table{width:100%;border-collapse:collapse;font:var(--t-body-sm);color:var(--text);min-width:640px}
.table th{text-align:left;padding:12px 24px;background:var(--table-head-bg);font:var(--t-table-head);color:var(--text-secondary);white-space:nowrap}
.table td{padding:var(--table-cell-pad);border-top:var(--stroke-hairline) solid var(--line);vertical-align:middle}
.table tbody tr{transition:background var(--dur-fast) var(--ease)}
.table tbody tr:hover{background:var(--elevated)}
.table tbody tr.is-selected{background:var(--nav-active-bg)}
.table .num{text-align:right;font-variant-numeric:var(--num-tabular)}
.table .strong{font-weight:700}
.table .act{width:48px;text-align:right}
.table.quick-view .act .icon-btn{opacity:0;transition:opacity var(--dur-fast) var(--ease)}
.table.quick-view tr:hover .act .icon-btn{opacity:1}
.cell{display:flex;flex-direction:column;gap:2px;min-width:0}
.cell > :first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cell-sub{font:var(--t-caption);color:var(--text-secondary)}
```

### Pagination

Botões 32×32 raio 8, 14/20; página atual = fundo `--primary` texto branco 700; outros `--text-secondary`, hover `--elevated`. "Por página" à esquerda em 12/18.

```html
<nav class="pagination">
  <span class="pagination-per">Por página <select class="pagination-select"><option>10</option><option>25</option></select></span>
  <span class="grow"></span>
  <button class="page-btn" aria-label="Anterior">‹</button>
  <button class="page-btn is-current">1</button><button class="page-btn">2</button><button class="page-btn">3</button>
  <button class="page-btn" aria-label="Próxima">›</button>
</nav>
```
```css
.pagination{display:flex;align-items:center;gap:var(--sp-8);padding:var(--sp-12) var(--sp-24)}
.pagination .grow{flex:1}
.pagination-per{display:inline-flex;align-items:center;gap:var(--sp-8);font:var(--t-caption);color:var(--text-secondary)}
.pagination-select{background:var(--elevated);color:var(--text);border:0;border-radius:var(--r-4);padding:4px 8px;font:700 12px/18px var(--font-sans)}
.page-btn{min-width:32px;height:32px;padding:0 8px;border:0;border-radius:var(--r-control);background:transparent;color:var(--text-secondary);font:var(--t-body-sm);cursor:pointer}
.page-btn:hover{background:var(--elevated);color:var(--text)}
.page-btn.is-current{background:var(--primary);color:var(--text-on-primary);font-weight:700}
```

### ProgressBar

Trilho h4 raio 34 `--progress-track`; preenchimento `--primary` (ou `--warning`/`--error` semântico). Label 700 14/20 acima, caption 12/18 abaixo. Sem gradiente (o `--gradient-brand` do Figma é da paleta anterior).

```html
<div class="progress">
  <div class="progress-label">Meta do mês <span>72%</span></div>
  <div class="progress-track"><div class="progress-fill" style="width:72%"></div></div>
  <div class="progress-caption">R$ 720 mil de R$ 1 mi</div>
</div>
```
```css
.progress{display:flex;flex-direction:column;gap:var(--sp-4)}
.progress-label{display:flex;justify-content:space-between;font:700 14px/20px var(--font-sans);color:var(--text)}
.progress-track{height:var(--progress-h);border-radius:34px;background:var(--progress-track);overflow:hidden}
.progress-fill{height:100%;border-radius:34px;background:var(--primary);transition:width var(--dur-slow) var(--ease)}
.progress-fill.warning{background:var(--warning)}.progress-fill.error{background:var(--error)}
.progress-caption{font:var(--t-caption);color:var(--text-secondary)}
```

### EmptyState

Uma linha 12/18 `--text-secondary`, centralizada, pad `32px 24px`. Sem ilustração. CTA só quando há ação óbvia (ex.: "Criar iniciativa"). Ícone opcional 24px em `--text-disabled`.

```html
<div class="empty">
  <p class="empty-title">Nenhum registro encontrado</p>
  <p class="empty-desc">Ajuste os filtros ou crie a primeira iniciativa.</p>
  <button class="btn btn-secondary sm">Criar iniciativa</button>
</div>
```
```css
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--sp-8);padding:32px 24px;text-align:center}
.empty-title,.empty-desc{margin:0;font:var(--t-caption);color:var(--text-secondary);max-width:320px}
.empty svg{color:var(--text-disabled)}
```

### Tooltip

Fundo `--surface-muted` (dark) / `--grey-800` (light), texto `--text`/branco, raio 8, pad `8px 12px`, 12/18, sombra `--shadow`, offset 8px. Só texto; sem seta.

```html
<span class="tip" data-tip="Valor após taxas e splits">Líquido</span>
```
```css
.tip{position:relative;display:inline-flex;border-bottom:1px dashed var(--line-strong);cursor:help}
.tip::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);white-space:nowrap;background:var(--surface-muted);color:#fff;border-radius:var(--r-control);padding:8px 12px;font:var(--t-caption);box-shadow:var(--shadow);opacity:0;pointer-events:none;transition:opacity var(--dur-fast) var(--ease);z-index:var(--z-menu)}
.tip:hover::after,.tip:focus-visible::after{opacity:1}
:root[data-theme="light"] .tip::after{background:var(--grey-800)}
```

---

## Navegação

### Sidebar / NavItem

Sidebar fixa `--sidebar-w` (238) fundo `--ground`, divisor à direita `--line`, pad `24px 16px`, gap 4. Logo no topo (pad `8px 16px 24px`). Seção: overline 700 11px `--text-disabled` letter-spacing .12em. Colapsada: 72px, só ícones, label em tooltip.
NavItem: h48, pad `0 16px`, gap 16, raio 8, ícone 24 (stroke 1.5), texto `--t-nav-item`. Default `--text-secondary` · hover `--elevated` + `--text` · **active `--nav-active-bg` + `--primary-text` 700**. Dot 8px `--green-light` para novidade; badge count à direita. Submenu indent 56px.

```html
<aside class="sidebar">
  <div class="sidebar-logo">cakto</div>
  <div class="nav-section">Produto</div>
  <a class="nav-item is-active" href="#"><svg …></svg><span>Roadmap</span></a>
  <a class="nav-item" href="#"><svg …></svg><span>Kanban</span><span class="badge-count">3</span></a>
  <a class="nav-item" href="#"><svg …></svg><span>OKRs</span><i class="nav-dot"></i></a>
  <div class="grow"></div>
  <a class="nav-item" href="#"><svg …></svg><span>Configurações</span></a>
</aside>
```
```css
.sidebar{position:fixed;inset:0 auto 0 0;width:var(--sidebar-w);background:var(--ground);border-right:var(--stroke-hairline) solid var(--line);padding:24px 16px;display:flex;flex-direction:column;gap:var(--sp-4);z-index:var(--z-bar)}
.sidebar-logo{font:800 22px/1 var(--font-sans);letter-spacing:-.02em;color:var(--text);padding:8px 16px 24px}
.nav-section{margin:16px 0 4px;padding:0 16px;font:700 11px/16px var(--font-sans);letter-spacing:.12em;text-transform:uppercase;color:var(--text-disabled)}
.nav-item{display:flex;align-items:center;gap:var(--sp-16);height:var(--nav-item-h);padding:0 16px;border-radius:var(--r-control);color:var(--text-secondary);font:var(--t-nav-item);text-decoration:none;transition:background var(--dur-fast) var(--ease),color var(--dur-fast) var(--ease)}
.nav-item svg{width:24px;height:24px;flex:none}
.nav-item span:not(.badge-count){flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nav-item:hover{background:var(--elevated);color:var(--text);text-decoration:none}
.nav-item.is-active{background:var(--nav-active-bg);color:var(--primary-text);font-weight:700}
.nav-dot{width:8px;height:8px;border-radius:var(--r-pill);background:var(--green-light);flex:none}
.nav-sub{padding-left:56px}
.sidebar .grow{flex:1}
.sidebar.collapsed{width:var(--sidebar-w-collapsed);padding:24px 12px}
.sidebar.collapsed .nav-item{justify-content:center;padding:0}
.sidebar.collapsed .nav-item span,.sidebar.collapsed .nav-section,.sidebar.collapsed .sidebar-logo{display:none}
```

### Tabs

Itens com gap 32; label `--t-tab-label` (700 no ativo) `--text-secondary` → `--text`; underline 2px `--primary` só no ativo; gap label→underline 12. Dot 8px `--error` para pendência. Linha base hairline `--line` opcional.

```html
<nav class="tabs">
  <button class="tab is-active">Visão geral</button>
  <button class="tab">Iniciativas <i class="tab-dot"></i></button>
  <button class="tab">Histórico</button>
</nav>
```
```css
.tabs{display:flex;gap:var(--sp-32);border-bottom:var(--stroke-hairline) solid var(--line)}
.tab{position:relative;display:inline-flex;align-items:center;gap:var(--sp-8);padding:0 0 12px;border:0;background:none;font:var(--t-tab-label);color:var(--text-secondary);cursor:pointer;transition:color var(--dur-fast) var(--ease)}
.tab:hover{color:var(--text)}
.tab.is-active{color:var(--text);font-weight:700}
.tab.is-active::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:var(--tab-underline);background:var(--primary)}
.tab-dot{width:8px;height:8px;border-radius:var(--r-pill);background:var(--error)}
```

### Breadcrumbs

14/22, separador = dot 4px `--text-secondary`, gap 8. Itens anteriores 600 `--text` (link); atual 400 `--text-secondary`.

```html
<nav class="crumbs"><a href="#">Produto</a><i></i><a href="#">Roadmap</a><i></i><span>Q4 2026</span></nav>
```
```css
.crumbs{display:flex;align-items:center;flex-wrap:wrap;gap:var(--sp-8);font:var(--t-body2)}
.crumbs a{color:var(--text);font-weight:600}
.crumbs a:hover{color:var(--primary-text);text-decoration:none}
.crumbs span{color:var(--text-secondary)}
.crumbs i{width:4px;height:4px;border-radius:50%;background:var(--text-secondary)}
```

### PageTitle

Eyebrow (hat) 700 14/20 uppercase ls .7px `--text-secondary` · h1 700 24/32 · count pill h24 `--nav-active-bg` + `--primary-text` 700 12/18 · ações à direita gap 8 · tabs abaixo (gap 16). Subtítulo 400 14/22 `--text-secondary`.

```html
<header class="page-title">
  <div class="page-title-main">
    <span class="hat">Squad Payment</span>
    <div class="page-title-row"><h1>Roadmap</h1><span class="count">24</span></div>
    <p class="page-title-sub">Iniciativas do trimestre por squad e status.</p>
  </div>
  <div class="page-title-actions"><button class="btn btn-secondary">Exportar</button><button class="btn btn-primary">Nova iniciativa</button></div>
</header>
```
```css
.page-title{display:flex;align-items:flex-start;gap:var(--sp-32);margin-bottom:var(--sp-24)}
.page-title-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--sp-4)}
.hat{font:var(--t-hat);letter-spacing:var(--t-hat-ls);text-transform:uppercase;color:var(--text-secondary)}
.page-title-row{display:flex;align-items:center;gap:var(--sp-12)}
.page-title h1{margin:0;font:var(--t-h3);color:var(--text)}
.count{display:inline-flex;align-items:center;height:24px;padding:0 8px;border-radius:var(--r-pill);background:var(--nav-active-bg);color:var(--primary-text);font:700 12px/18px var(--font-sans)}
.page-title-sub{margin:0;font:var(--t-body2);color:var(--text-secondary)}
.page-title-actions{display:flex;align-items:center;gap:var(--sp-8)}
```

### Steps

Barra h4 raio 2 por etapa, gap 16; concluída/atual `--primary`, pendente `--progress-track` (20% verde). Label 14/20: atual 700 `--text`, demais 400 `--text-secondary`.

```html
<ol class="steps">
  <li class="step is-done"><i></i>Contexto</li>
  <li class="step is-current"><i></i>Escopo</li>
  <li class="step"><i></i>Métricas</li>
</ol>
```
```css
.steps{display:flex;gap:var(--sp-16);list-style:none;margin:0;padding:0}
.step{flex:1;display:flex;flex-direction:column;gap:var(--sp-8);font:var(--t-body-sm);color:var(--text-secondary)}
.step i{height:4px;border-radius:2px;background:var(--progress-track)}
.step.is-done i,.step.is-current i{background:var(--primary)}
.step.is-current{color:var(--text);font-weight:700}
```

### FilterChip

Botão de filtro de período (Hoje · 7 dias · 30 dias). h36, pad `6px 16px`, raio 8, 14/20. Default `--elevated` + `--text-secondary`; hover `--surface-muted`; ativo `--nav-active-bg` + `--primary-text` 700. (No Figma antigo: `#29343f`/`#333d48` — recolorido para a rampa nova.)

```html
<div class="filter-group"><button class="fchip">Hoje</button><button class="fchip">7 dias</button><button class="fchip is-active">30 dias</button></div>
```
```css
.filter-group{display:inline-flex;gap:var(--sp-8)}
.fchip{height:var(--filterchip-h);padding:6px 16px;border:0;border-radius:var(--r-control);background:var(--elevated);color:var(--text-secondary);font:var(--t-body-sm);cursor:pointer;transition:background var(--dur-fast) var(--ease)}
.fchip:hover{background:var(--line);color:var(--text)}
.fchip.is-active{background:var(--nav-active-bg);color:var(--primary-text);font-weight:700}
```

---

## Feedback

### Modal

Overlay `--overlay` (60% preto). Painel `--paper`, raio **24** (`--r-frame`), sombra `--shadow`, pad 24, w560 (max 92vw), gap 16. Título 700 20/30 · `×` 20px `--text-secondary` · corpo 14/22 `--text-secondary` · rodapé botões à direita gap 8. Sem blur no overlay.

```html
<div class="overlay">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="m1">
    <header class="modal-head"><h2 id="m1">Arquivar iniciativa?</h2><button class="icon-btn" aria-label="Fechar">×</button></header>
    <div class="modal-body">A iniciativa sai do board, mas o histórico é mantido.</div>
    <footer class="modal-foot"><button class="btn btn-ghost">Cancelar</button><button class="btn btn-danger">Arquivar</button></footer>
  </div>
</div>
```
```css
.overlay{position:fixed;inset:0;background:var(--overlay);display:flex;align-items:center;justify-content:center;z-index:var(--z-overlay)}
.modal{width:var(--modal-w);max-width:92vw;background:var(--paper);border-radius:var(--r-frame);box-shadow:var(--shadow);padding:var(--card-pad);display:flex;flex-direction:column;gap:var(--sp-16)}
.modal-head{display:flex;align-items:flex-start;gap:var(--sp-16)}
.modal-head h2{flex:1;margin:0;font:var(--t-h5);color:var(--text)}
.modal-body{font:var(--t-body2);color:var(--text-secondary)}
.modal-foot{display:flex;justify-content:flex-end;gap:var(--sp-8)}
```

### Drawer

Painel lateral direito w480 (max 92vw), altura total, `--paper`, sombra `--shadow`, sem raio. Cabeçalho pad 24 + borda inferior `--line` (título 700 20/30, subtítulo 14/20 `--text-secondary`); corpo pad 24 com scroll; rodapé pad 24 + borda superior.

```html
<div class="overlay drawer-overlay">
  <aside class="drawer" role="dialog" aria-modal="true">
    <header class="drawer-head"><div><h2>Detalhe da iniciativa</h2><p>PAY-142 · Squad Payment</p></div><button class="icon-btn" aria-label="Fechar">×</button></header>
    <div class="drawer-body">…</div>
    <footer class="drawer-foot"><button class="btn btn-ghost">Fechar</button><button class="btn btn-primary">Salvar</button></footer>
  </aside>
</div>
```
```css
.drawer-overlay{justify-content:flex-end;align-items:stretch}
.drawer{width:var(--drawer-w);max-width:92vw;height:100%;background:var(--paper);box-shadow:var(--shadow);display:flex;flex-direction:column}
.drawer-head{display:flex;align-items:flex-start;gap:var(--sp-16);padding:var(--sp-24);border-bottom:var(--stroke-hairline) solid var(--line)}
.drawer-head div{flex:1;min-width:0}
.drawer-head h2{margin:0;font:var(--t-h5);color:var(--text)}
.drawer-head p{margin:0;font:var(--t-body-sm);color:var(--text-secondary)}
.drawer-body{flex:1;min-height:0;overflow-y:auto;padding:var(--sp-24)}
.drawer-foot{display:flex;justify-content:flex-end;gap:var(--sp-8);padding:var(--sp-24);border-top:var(--stroke-hairline) solid var(--line)}
```

### Toast

Soft fill + texto da cor do status, raio 8, pad 12, gap 8, **700 14/22** (Figma usa 16/24 — reduzido para ferramentas internas), ícone 20px. Posição: canto inferior direito, `--z-toast`, empilha com gap 8, sai em 4s. Warning no dark usa o par do Figma (`#7A4100` / `#FFF5CC`) por ser o único toast com fundo sólido desenhado; nos demais, soft.

```html
<div class="toast toast-success"><svg …></svg>Iniciativa salva</div>
<div class="toast toast-error">Falha ao sincronizar com o Jira</div>
<div class="toast toast-warning">Sprint sem owner definido</div>
```
```css
.toast-stack{position:fixed;right:24px;bottom:24px;display:flex;flex-direction:column;gap:var(--sp-8);z-index:var(--z-toast)}
.toast{display:inline-flex;align-items:center;gap:var(--sp-8);padding:var(--sp-12);border-radius:var(--r-control);font:700 14px/22px var(--font-sans);box-shadow:var(--shadow)}
.toast svg{width:20px;height:20px;flex:none}
.toast-success{background:var(--soft-success);color:var(--on-soft-success);background-color:color-mix(in srgb,var(--paper),var(--success) 16%)}
.toast-error{background-color:color-mix(in srgb,var(--paper),var(--error) 16%);color:var(--on-soft-error)}
.toast-info{background-color:color-mix(in srgb,var(--paper),var(--info) 16%);color:var(--on-soft-info)}
.toast-warning{background:#7A4100;color:#FFF5CC}
:root[data-theme="light"] .toast-warning{background:var(--soft-warning);background-color:color-mix(in srgb,#fff,var(--warning) 16%);color:var(--on-soft-warning)}
```

> Toasts flutuam sobre conteúdo variável; por isso o fundo usa `color-mix` com `--paper` (opaco) em vez do rgba 16% puro, mantendo a mesma leitura do soft fill sem transparecer o que está atrás.
