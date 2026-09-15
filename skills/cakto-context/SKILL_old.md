---
name: cakto-design
description: Design system e identidade visual da Cakto (rebrand 2026, dark-first, Public Sans) para protótipos HTML, dashboards e ferramentas internas de gestão de produto. Tokens de cor/tipografia/espaçamento, layout de página, componentes e regras de qualidade visual. Usar sempre que gerar qualquer artefato visual para a Cakto.
version: 2.0.0
---

# Skill: cakto-design (v2.0.0)

Use esta skill ao gerar protótipos HTML, dashboards, boards, tabelas, telas de configuração ou qualquer artefato visual para a Cakto. Ela define tokens, layout, componentes e regras de composição. Contexto institucional, persona e tom de voz estão em `cakto-context` — não são repetidos aqui.

Arquivos desta skill:
- `SKILL.md` — este documento (princípios, tokens, layout, regras, template, checklist)
- `tokens.css` — todos os tokens em um arquivo linkável (dark em `:root`, light em `[data-theme="light"]`)
- `components.md` — um bloco por componente: tokens, medidas, estados, snippet HTML+CSS

**Fonte de verdade:** Figma "Cakto", bloco `.nova` (rebrand). O Manual de Marca anterior e o DS extraído do dashboard em produção (Minimal UI / Inter / `#00A76F`) documentam a identidade que está sendo substituída — não usar seus valores.

---

## 1. Identidade e princípios

**Dark-first.** O tema padrão é escuro, quase preto (`#0E0E0E`), com superfícies em degraus de cinza neutro e o verde Cakto como única cor de destaque. Light existe como derivação opt-in (ver §2.4). Tudo o mais na tela é monocromático: nada de gradiente colorido de fundo, textura, ilustração ou imagem decorativa.

**Sóbrio, premium, direto.** Arquétipo Soberano + Sábio (ver `cakto-context`): não grita, não explica demais, deixa o dado falar. Cada elemento justifica sua presença. Espaço generoso é parte da marca — telas apertadas contradizem a persona.

**O verde tem papel fixo, não é decorativo.** Ele aparece em CTA, seleção, estado ativo, link e valor positivo. Nunca como fundo de área grande, nunca em texto pequeno no tom `#0F7865` sobre fundo escuro.

**Uma fonte, uma sombra, um raio por nível.** Public Sans em tudo. Sombra assinatura deslocada à esquerda. Raios 8 (controle) · 16 (card) · 24 (modal) · pill.

**Logo.** Símbolo (quadrado de cantos totalmente arredondados com cacto estilizado) + wordmark `cakto` em caixa baixa. Nunca distorcer, recolorir ou aplicar efeitos. Em protótipos HTML, sem o PNG à mão: texto `cakto` em Public Sans 800, `letter-spacing: -0.02em`, na cor `--text`. Símbolo isolado só em favicon/avatar da marca.

---

## 2. Tokens — cor

Arquitetura: **primitivas** (verde, status, cinzas, superfícies) → **aliases semânticos** que flipam por tema (`--bg`, `--paper`, `--line`, `--text`, `--primary-text`…) → **soft fills** a 16% com par de texto legível (`--on-soft-*`). Componentes consomem só aliases e soft fills.

### 2.1 Primitivas (iguais nos dois temas)

| Token | Valor | Uso |
|---|---|---|
| `--green-darker` | `#064C3B` | Fundo de destaque profundo, gradiente |
| `--green-dark` | `#0B6856` | Hover de CTA; texto verde hover (light) |
| `--green-principal` | `#0F7865` | **Superfície**: CTA, seleção, underline, toggle on. Texto só no light |
| `--green-light` | `#2EA593` | **Texto** verde no dark (6.4:1). Decorativo no light |
| `--green-lighter` | `#82CABF` | Texto verde pequeno / sobre paper no dark (9.2:1). Decorativo no light |
| `--success` | `#36B37E` | Único verde de status. Tag "Pago/Ativo", delta positivo |
| `--warning` | `#FFAB00` | Pendente, atenção |
| `--error` | `#FF5630` | Erro, chargeback, ação destrutiva |
| `--info` | `#00B8D9` | Em análise, informativo |

`#38CA4F` (success strong do Figma) foi **descartado** na v2.0: um só verde de status.

### 2.2 Superfícies dark (`:root`, padrão)

Empilhar em ordem, sem pular níveis. Separação entre níveis vem do contraste bg↔paper mais hairline — não de sombra.

| Alias | Primitiva | Uso |
|---|---|---|
| `--bg` | `#0E0E0E` base | Fundo de página |
| `--ground` | `#141414` elevated | Sidebar, header, faixas |
| `--paper` | `#1A1A1A` paper | Card, modal, drawer, menu |
| `--elevated` | `#1C1C1C` extra | Head de tabela, hover de linha, fundo de FilterChip |
| `--line` | `#2C2C2C` muted | Borda hairline, trilho de toggle off |
| `--shell-bg` | `linear-gradient(135deg,#0E0E0E 0%,#0E0E0E 65%,#0F7865 120%)` | Fundo do shell (body), `fixed` |
| `--overlay` | `rgba(0,0,0,.60)` | Fundo de modal/drawer, sem blur |

Texto: `--text #FFFFFF` · `--text-secondary #919EAB` (7.1:1) · `--text-disabled #637381` (3.9:1 — só em disabled e placeholder).

Verde para texto no dark: `--primary-text = #2EA593`, `--primary-text-strong = #82CABF`. **`#0F7865` sobre `#0E0E0E` rende 3.6:1 — insuficiente para texto pequeno.**

### 2.3 Soft fills (16%) e texto por cima

| Fill | Valor | `--on-soft-*` dark | `--on-soft-*` light |
|---|---|---|---|
| `--soft-green` | `rgba(15,120,101,.16)` | `#2EA593` | `#0B6856` |
| `--soft-green-strong` | `rgba(15,120,101,.20)` | nav ativo, step pendente, count pill | idem |
| `--soft-success` | `rgba(54,179,126,.16)` | `#36B37E` | `#0D7B1F` |
| `--soft-warning` | `rgba(255,171,0,.16)` | `#FFAB00` | `#B76E00` (4.0:1 — só bold ≥14px) |
| `--soft-error` | `rgba(255,86,48,.16)` | `#FF5630` | `#B71D18` |
| `--soft-info` | `rgba(0,184,217,.16)` | `#00B8D9` | `#006C9C` |
| `--soft-grey` | `rgba(145,158,171,.16)` | `#919EAB` | `#637381` |

Regra: **status é sempre soft** (fill 16% + texto da cor). Fundo sólido de status só em botão danger, badge count e barra de progresso.

### 2.4 Light — derivado · `status: derivado — pendente de validação do design`

O rebrand não define light no Figma. A derivação combina, sem inventar valores: superfícies e texto do bloco `.light` do Figma (tema light oficial da paleta anterior), a mesma rampa de verde `.nova`, e a arquitetura de aliases do DS de produção. Ativa via `<html data-theme="light">`.

| Alias | Light |
|---|---|
| `--bg` | `#F4F6F8` |
| `--ground` / `--paper` | `#FFFFFF` |
| `--elevated` | `#F4F6F8` |
| `--line` | `#DFE3E8` |
| `--text` / `--text-secondary` / `--text-disabled` | `#212B36` / `#637381` / `#919EAB` |
| `--primary-text` | `#0F7865` (5.4:1 sobre branco) |
| `--primary-text-strong` (hover) | `#0B6856` |
| `--shell-bg` | `--bg` sólido — o gradiente não tem versão light |
| `--shadow` | `0 12px 24px -4px rgba(145,158,171,.12), 0 0 2px rgba(145,158,171,.20)` |

**Inversão de papel do verde.** Dark: texto/link em `#2EA593`/`#82CABF`, `#0F7865` só em superfícies. Light: `#0F7865` serve para texto, link e CTA; `#2EA593` e `#82CABF` viram decorativos (fills, dots, bordas de acento) — nunca texto (3.0:1 e 1.9:1 sobre branco). Soft fills mantêm a mesma alpha; só `--on-soft-*` muda.

---

## 3. Tokens — tipografia

**Public Sans** (Google Fonts, 300–800), fallback `-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`. Nunca Inter, Roboto, SF Pro, Montserrat. Escala curta e pesada: títulos 700, subtítulos 600, corpo 400. O texto mais usado é **Body Small 14/20**.

| Token | Spec | Uso |
|---|---|---|
| `--t-h1` | 700 48/56 | Hero/display (raro em ferramenta interna) |
| `--t-h2` | 700 36/40 | Título de tela de destaque |
| `--t-h3` | 700 24/32 | **Título de página** (PageTitle) |
| `--t-h4` | 700 24/36 | Título com respiro |
| `--t-h5` | 700 20/30 | Título de modal/drawer |
| `--t-h6` | 600 18/28 | Título de card |
| `--t-subtitle1` / `--t-subtitle2` | 600 16/24 · 600 14/22 | Subtítulos, nome em lista |
| `--t-body1` / `--t-body2` | 400 16/24 · 400 14/22 | Corpo longo · corpo padrão |
| `--t-body-sm` | 400 14/20 | Tabela, nav, texto denso |
| `--t-caption` / `--t-body-xs` | 400 12/18 | Caption, helper, meta |
| `--t-overline` | 700 12/18 uppercase | Rótulo de seção |
| `--t-hat` | 700 14/20 uppercase, ls .7px | Eyebrow do PageTitle |
| `--t-link` | 500 14/20 | Link inline |
| `--t-metric` | 700 32/40 tabular | Valor de StatCard |
| Componentes | `--t-table-head` 600 14/24 · `--t-nav-item` 500 14/22 · `--t-tab-label` 500 14/22 · `--t-chip-label` 500 13/18 · `--t-button` 700 14/24 · `--t-input-label` 600 12/18 · `--t-input-text` 400 15/24 | |

Dinheiro: `R$ 1.234,56`, 700, `font-variant-numeric: tabular-nums`, alinhado à direita em tabela. Sem letter-spacing negativo além de `-.01em` em métricas.

---

## 4. Tokens — espaçamento, raio, stroke, elevação, motion

**Espaçamento** (Figma): `4 · 6 · 8 · 12 · 16 · 24 · 32`; `10` só como gap interno de botão. Card pad 24 / gap 16 · grid gap 16 · conteúdo pad lateral 32 (16 mobile) · seção 32.

**Raios:** `--r-4` 4 (label, checkbox, item de menu) · `--r-control` 8 (botão, input, tag, nav item, tooltip, toast) · `--r-12` 12 · `--r-card` 16 · `--r-frame` 24 (modal) · `--r-pill` 100.

**Strokes:** hairline 1 · ícone 1.5 · acento 2 (tab underline) · outline 4 (card em destaque, borda esquerda de StatCard).

**Elevação — sombra assinatura deslocada à esquerda:** `--shadow: -3px 8px 24px rgba(0,0,0,.30)`. Herdada do DS anterior no Figma e mantida no rebrand por decisão (o `.nova` não define sombra própria). Usar em card hover, menu, modal, tooltip, toast. `--shadow-z1` para separação mínima. Hover de botão preenchido é **glow** na cor do botão a 28% (`--shadow-btn-hover`), não mudança de fundo. No light, sombras cinza-azuladas `rgba(145,158,171,…)` — nunca as pretas.

**Opacidades:** disabled `.26` (herdado MUI) → na prática usar `.5` em controles inteiros; dim `.40`; half `.50`.

**Motion:** `--dur-fast` 150ms (cor/sombra) · `--dur` 200ms (toggle) · `--dur-slow` 250ms (progress) · `--ease: cubic-bezier(.4,0,.2,1)`. Sem bounce, spring ou entrada animada de tela. Respeitar `prefers-reduced-motion`.

**Foco:** `:focus-visible` com `--focus-ring` (2px `#2EA593` dark / `#0F7865` light, offset 2). Em inputs a borda vira `--focus-border` (branca no dark, verde no light). **Z-index:** bar 50 · menu 100 · overlay 1300 · toast 1400.

---

## 5. Layout de página

```
┌─ body: background var(--shell-bg) fixed ───────────────────────────────┐
│ SIDEBAR 238px fixa (--ground, borda direita --line, pad 24/16)         │
│   logo "cakto" · seções (overline) · NavItem h48 · rodapé (config)     │
│   colapsa para 72px (só ícones) em <1280px ou por toggle               │
├────────────────────────────────────────────────────────────────────────┤
│ HEADER 64px sticky (--ground a 92% + borda inferior --line, sem blur)  │
│   breadcrumbs à esquerda · busca/ações/avatar à direita                │
├────────────────────────────────────────────────────────────────────────┤
│ MAIN pad 32 (16 mobile) · max-width 1440 opcional                      │
│   PageTitle (hat + h3 + count + ações) → Tabs → grid de cards gap 16   │
└────────────────────────────────────────────────────────────────────────┘
```

- `--sidebar-w: 238px` é o padrão para ferramentas internas (roadmap com seis squads lado a lado, kanban, tabelas largas). `--sidebar-w-figma: 304px` é o valor do painel do produtor — usar só quando o protótipo imita o produto.
- O gradiente do shell fica no `body` (fixed); sidebar e header são `--ground` sólido; cards `--paper`. O verde do gradiente aparece só no canto inferior direito, discreto.
- Grid: `repeat(4,1fr)` para StatCards em ≥1280; 2 colunas em 768–1279; 1 abaixo. Boards horizontais (roadmap/kanban) usam `overflow-x: auto` no container, nunca no body.
- Densidade: linha de tabela 52px (pad 16); linha densa 44px (pad 12) quando a tela é de operação.

---

## 6. Componentes

Snippets completos em **`components.md`**. Inventário e regra de uma linha de cada:

**Base** — `Button` primary/secondary/ghost/danger, h40 r8 700, hover = glow · `IconButton` 36 pill, hover `--elevated` · `Badge` count/dot em `--error` · `Chip` h32 pill soft, remover com × · `Tag` status h24 r8 **sempre soft** · `Avatar` 40 pill iniciais 600 · `Divider` hairline.

**Formulários** — `Input` h40 r8 fundo `--input-bg` borda 20% branco→foco · `Select` mesma casca, menu `--paper` r8 sombra · `SearchInput` h40 w248 lupa 20 · `Checkbox` 16 r4, hit 40 com halo · `Toggle` 44×24 thumb 16 · `DateField` input + calendário 20 · `FormHelperText` 12/18.

**Dados** — `Card` `--paper` r16 pad 24 sem borda; acento = borda esquerda 4 · `StatCard` label 700 14 + métrica 700 32 tabular + Tag de delta · `Table` é um card: head `--elevated`, célula 16/24, dinheiro à direita, action cell no hover · `Pagination` 32×32, atual `--primary` · `ProgressBar` h4 r34 trilho 20% verde · `EmptyState` uma linha 12/18 centrada · `Tooltip` `--surface-muted` r8 12/18.

**Navegação** — `Sidebar/NavItem` h48 r8, ativo `--soft-green-strong` + `--primary-text` 700 · `Tabs` gap 32, underline 2 `--primary` · `Breadcrumbs` 14/22 dot 4 · `PageTitle` hat + h3 + count pill + ações · `Steps` barra h4 por etapa · `FilterChip` h36 r8, ativo soft verde.

**Feedback** — `Modal` r24 pad 24 w560 sobre overlay 60% · `Drawer` w480 direita, cabeçalho/rodapé com hairline · `Toast` soft r8 pad 12 700 14/22, inferior direito.

Fora de escopo desta skill: charts, calendar, checkout, área de membros, afiliados, cartão de crédito.

**Ícones.** Grid 24px, stroke 1.5px, `fill:none; stroke:currentColor` — nunca cor própria. 16–20px dentro de botão/input/chip, 24px solto. O Figma consome sets Iconify (Interface Essential, Solar, Material); 105 glifos foram extraídos em `assets/icons/icon-data.js` do export — quando o set não estiver disponível, **Lucide** é o equivalente (mesma geometria 24/1.5). Sem emoji em UI.

---

## 7. Regras de qualidade e acessibilidade

1. **Verde em texto sobre fundo escuro nunca é `#0F7865`.** Usar `--primary-text` (`#2EA593`) ou `--primary-text-strong` (`#82CABF`). `#0F7865` é cor de superfície no dark.
2. **Status é sempre soft**: fill 16% + texto `--on-soft-*`. Sem fundo sólido em Tag. Filled só em `btn-danger`, `badge-count`, `progress-fill`.
3. **Contraste AA obrigatório** (4.5:1 texto, 3:1 UI). Pares validados no dark: `--text-secondary` 7.1 · `--primary-text` 6.4 · `--success` 7.3 · `--error` 6.1 · `--warning` 10.2 · `--info` 8.1 · branco sobre `--primary` 5.4. No light: `#0F7865` 5.4 · `#637381` 4.9 · `#B76E00` 4.0 (só bold ≥14px).
4. **Texto sobre fundo verde é branco** (`--text-on-primary`); sobre `--success` ou `--info` sólidos seria `#0E0E0E` — mas evite sólidos de status.
5. **Foco visível sempre**: `:focus-visible` com `--focus-ring`; nunca `outline:none` sem substituto.
6. **Hit area ≥ 40px** em todo controle clicável (checkbox, icon button, nav item). Botões h40; sm h32 só em toolbars densas.
7. **Sem blur, sem transform em hover.** Alpha sim, `backdrop-filter` não. Hover muda cor/sombra; seleção é cor, não escala.
8. **Superfícies em ordem**: `--bg` → `--ground` → `--paper` → `--elevated`. Card sobre card recebe hairline. Nunca `#000` puro; `#FFF` puro só como `--text` no dark e `--paper` no light.
9. **Bordas hairline 1px `--line`**; 2px só tab underline; 4px só acento/outline de card.
10. **Espaço é premium**: card pad 24, grid gap 16, seção 32. Se a tela pede mais densidade, reduza altura de linha, não padding de card.
11. **Dados financeiros**: `R$ 0,00`, 700, tabular, à direita. Datas `dd/mm/aaaa hh:mm`, tempo relativo em caption.
12. **Copy**: pt-BR, sentence case com nomes de produto capitalizados ("Nova iniciativa", "Cakto Members"), botões verbo + objeto, rótulos curtos sem artigo, sem exclamação exceto risco. Estado vazio em uma linha. Ver `cakto-context` §9.
13. **Responsivo**: sidebar colapsa para 72 (<1280) e vira drawer (<768); pad de conteúdo 16; grids para 1 coluna; tabelas/boards rolam dentro do próprio container.
14. **Light é derivado**: ao entregar em light, marcar no protótipo "tema light derivado — pendente de validação do design".

---

## 8. Template HTML base

Pronto para copiar. Tokens completos (dark + light) inline — para reutilizar entre arquivos, troque o bloco `:root…` por `<link rel="stylesheet" href="tokens.css">`. Snippets de componentes em `components.md`.

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cakto — [Nome da Tela]</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{color-scheme:dark;
  /* verde e status */
  --green-darker:#064C3B;--green-dark:#0B6856;--green-principal:#0F7865;--green-light:#2EA593;--green-lighter:#82CABF;
  --success:#36B37E;--warning:#FFAB00;--error:#FF5630;--info:#00B8D9;
  --grey-500:#919EAB;--grey-600:#637381;--grey-800:#212B36;--grey-line:#DFE3E8;--grey-bg:#F4F6F8;
  /* superfícies e aliases (dark) */
  --surface-base:#0E0E0E;--surface-elevated:#141414;--surface-paper:#1A1A1A;--surface-extra:#1C1C1C;--surface-muted:#2C2C2C;
  --bg:var(--surface-base);--ground:var(--surface-elevated);--paper:var(--surface-paper);--elevated:var(--surface-extra);--line:var(--surface-muted);
  --line-strong:rgba(145,158,171,.28);--overlay:rgba(0,0,0,.60);
  --shell-bg:linear-gradient(135deg,#0E0E0E 0%,#0E0E0E 65%,#0F7865 120%);
  --text:#FFFFFF;--text-secondary:var(--grey-500);--text-disabled:var(--grey-600);--text-on-primary:#FFFFFF;
  --primary:var(--green-principal);--primary-hover:var(--green-dark);--primary-text:var(--green-light);--primary-text-strong:var(--green-lighter);
  /* soft fills */
  --soft-green:rgba(15,120,101,.16);--soft-green-strong:rgba(15,120,101,.20);--soft-success:rgba(54,179,126,.16);--soft-warning:rgba(255,171,0,.16);--soft-error:rgba(255,86,48,.16);--soft-info:rgba(0,184,217,.16);--soft-grey:rgba(145,158,171,.16);
  --on-soft-green:var(--green-light);--on-soft-success:var(--success);--on-soft-warning:var(--warning);--on-soft-error:var(--error);--on-soft-info:var(--info);--on-soft-grey:var(--grey-500);
  /* tipografia */
  --font-sans:"Public Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;
  --t-h3:700 24px/32px var(--font-sans);--t-h5:700 20px/30px var(--font-sans);--t-h6:600 18px/28px var(--font-sans);
  --t-body2:400 14px/22px var(--font-sans);--t-body-sm:400 14px/20px var(--font-sans);--t-caption:400 12px/18px var(--font-sans);
  --t-hat:700 14px/20px var(--font-sans);--t-hat-ls:.7px;--t-metric:700 32px/40px var(--font-sans);
  --t-table-head:600 14px/24px var(--font-sans);--t-nav-item:500 14px/22px var(--font-sans);--t-tab-label:500 14px/22px var(--font-sans);
  --t-chip-label:500 13px/18px var(--font-sans);--t-button:700 14px/24px var(--font-sans);--t-input-label:600 12px/18px var(--font-sans);--t-input-text:400 15px/24px var(--font-sans);
  --num-tabular:tabular-nums;
  /* espaço, forma, elevação, motion */
  --sp-4:4px;--sp-8:8px;--sp-12:12px;--sp-16:16px;--sp-24:24px;--sp-32:32px;--card-pad:24px;--card-gap:16px;--grid-gap:16px;--content-pad:32px;
  --r-4:4px;--r-control:8px;--r-card:16px;--r-frame:24px;--r-pill:100px;--stroke-hairline:1px;--stroke-outline:4px;
  --shadow:-3px 8px 24px 0 rgba(0,0,0,.30);--shadow-z1:0 1px 2px 0 rgba(0,0,0,.16);--shadow-btn-hover:0 4px 14.2px 0 rgba(15,120,101,.28);--shadow-btn-hover-danger:0 4px 14.2px 0 rgba(255,86,48,.28);
  --op-half:.5;--ease:cubic-bezier(.4,0,.2,1);--dur-fast:150ms;--dur:200ms;--dur-slow:250ms;
  --focus-ring:2px solid var(--green-light);--focus-offset:2px;--focus-border:#FFFFFF;--z-bar:50;--z-menu:100;--z-overlay:1300;--z-toast:1400;
  /* medidas */
  --sidebar-w:238px;--sidebar-w-collapsed:72px;--header-h:64px;--btn-h:40px;--btn-h-sm:32px;--btn-pad:8px 16px;--btn-gap:10px;--icon-btn:36px;
  --input-h:40px;--input-pad:8px 12px;--input-bg:var(--surface-base);--input-border:rgba(145,158,171,.20);--nav-item-h:48px;--nav-active-bg:var(--soft-green-strong);
  --chip-h:32px;--filterchip-h:36px;--tab-underline:2px;--toggle-w:44px;--toggle-h:24px;--toggle-thumb:16px;--checkbox-size:16px;--checkbox-stroke:1.667px;--checkbox-hit:40px;
  --avatar:40px;--avatar-bg:var(--surface-muted);--table-head-bg:var(--surface-extra);--table-cell-pad:16px 24px;--progress-h:4px;--progress-track:var(--soft-green-strong);--modal-w:560px;--drawer-w:480px;
}
/* LIGHT — derivado, pendente de validação do design */
:root[data-theme="light"]{color-scheme:light;
  --bg:var(--grey-bg);--ground:#FFFFFF;--paper:#FFFFFF;--elevated:var(--grey-bg);--line:var(--grey-line);--line-strong:rgba(145,158,171,.32);--overlay:rgba(33,43,54,.48);--shell-bg:var(--grey-bg);
  --text:var(--grey-800);--text-secondary:var(--grey-600);--text-disabled:var(--grey-500);
  --primary-text:var(--green-principal);--primary-text-strong:var(--green-dark);
  --on-soft-green:var(--green-dark);--on-soft-success:#0D7B1F;--on-soft-warning:#B76E00;--on-soft-error:#B71D18;--on-soft-info:#006C9C;--on-soft-grey:var(--grey-600);
  --shadow:0 12px 24px -4px rgba(145,158,171,.12),0 0 2px 0 rgba(145,158,171,.20);--shadow-z1:0 1px 2px 0 rgba(145,158,171,.16);
  --focus-ring:2px solid var(--green-principal);--focus-border:var(--green-principal);--input-bg:#FFFFFF;--avatar-bg:var(--grey-line);--table-head-bg:var(--grey-bg);
}

/* base */
*,*::before,*::after{box-sizing:border-box}
body{margin:0;font:var(--t-body-sm);color:var(--text);background:var(--shell-bg) fixed;min-height:100vh;-webkit-font-smoothing:antialiased}
a{color:var(--primary-text);text-decoration:none}a:hover{color:var(--primary-text-strong);text-decoration:underline}
:focus-visible{outline:var(--focus-ring);outline-offset:var(--focus-offset)}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}

/* shell */
.sidebar{position:fixed;inset:0 auto 0 0;width:var(--sidebar-w);background:var(--ground);border-right:var(--stroke-hairline) solid var(--line);padding:24px 16px;display:flex;flex-direction:column;gap:var(--sp-4);z-index:var(--z-bar)}
.sidebar-logo{font:800 22px/1 var(--font-sans);letter-spacing:-.02em;color:var(--text);padding:8px 16px 24px}
.nav-section{margin:16px 0 4px;padding:0 16px;font:700 11px/16px var(--font-sans);letter-spacing:.12em;text-transform:uppercase;color:var(--text-disabled)}
.nav-item{display:flex;align-items:center;gap:var(--sp-16);height:var(--nav-item-h);padding:0 16px;border-radius:var(--r-control);color:var(--text-secondary);font:var(--t-nav-item);transition:background var(--dur-fast) var(--ease),color var(--dur-fast) var(--ease)}
.nav-item svg{width:24px;height:24px;flex:none}.nav-item span{flex:1}
.nav-item:hover{background:var(--elevated);color:var(--text);text-decoration:none}
.nav-item.is-active{background:var(--nav-active-bg);color:var(--primary-text);font-weight:700}
.sidebar .grow{flex:1}
.main{margin-left:var(--sidebar-w);min-height:100vh;display:flex;flex-direction:column}
.header{position:sticky;top:0;height:var(--header-h);display:flex;align-items:center;justify-content:space-between;gap:var(--sp-16);padding:0 var(--content-pad);background:var(--ground);border-bottom:var(--stroke-hairline) solid var(--line);z-index:var(--z-bar)}
.content{padding:var(--content-pad);flex:1}

/* primitivas mais usadas (resto em components.md) */
.page-title{display:flex;align-items:flex-start;gap:var(--sp-32);margin-bottom:var(--sp-24)}
.page-title-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--sp-4)}
.hat{font:var(--t-hat);letter-spacing:var(--t-hat-ls);text-transform:uppercase;color:var(--text-secondary)}
.page-title h1{margin:0;font:var(--t-h3);color:var(--text)}
.page-title-actions{display:flex;gap:var(--sp-8)}
.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--grid-gap)}
.card{background:var(--paper);border-radius:var(--r-card);padding:var(--card-pad);display:flex;flex-direction:column;gap:var(--card-gap)}
.card-title{margin:0;font:var(--t-h6);color:var(--text)}
.stat{background:var(--paper);border-radius:var(--r-card);padding:var(--card-pad);display:flex;flex-direction:column;gap:var(--sp-12)}
.stat.accent-green{border-left:var(--stroke-outline) solid var(--green-light)}.stat.accent-warning{border-left:var(--stroke-outline) solid var(--warning)}.stat.accent-error{border-left:var(--stroke-outline) solid var(--error)}
.stat-label{display:flex;justify-content:space-between;align-items:center;font:700 14px/20px var(--font-sans);color:var(--text-secondary)}
.stat-value{font:var(--t-metric);color:var(--text);font-variant-numeric:var(--num-tabular)}
.stat-caption{font:var(--t-caption);color:var(--text-secondary)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:var(--btn-gap);min-height:var(--btn-h);padding:var(--btn-pad);border-radius:var(--r-control);border:1px solid transparent;font:var(--t-button);cursor:pointer;transition:background var(--dur-fast) var(--ease),box-shadow var(--dur-fast) var(--ease),color var(--dur-fast) var(--ease)}
.btn-primary{background:var(--primary);color:var(--text-on-primary)}.btn-primary:hover{background:var(--primary-hover);box-shadow:var(--shadow-btn-hover)}
.btn-secondary{background:transparent;color:var(--primary-text);border-color:var(--primary-text)}.btn-secondary:hover{background:var(--primary);color:var(--text-on-primary);border-color:transparent}
.btn-ghost{background:transparent;color:var(--text-secondary)}.btn-ghost:hover{background:var(--elevated);color:var(--text)}
.btn:disabled{background:var(--bg);color:var(--text-disabled);box-shadow:none;cursor:not-allowed}
.tag{display:inline-flex;align-items:center;height:24px;padding:0 8px;border-radius:var(--r-control);font:700 12px/18px var(--font-sans);white-space:nowrap}
.tag-success{background:var(--soft-success);color:var(--on-soft-success)}.tag-warning{background:var(--soft-warning);color:var(--on-soft-warning)}.tag-error{background:var(--soft-error);color:var(--on-soft-error)}.tag-info{background:var(--soft-info);color:var(--on-soft-info)}.tag-grey{background:var(--soft-grey);color:var(--on-soft-grey)}.tag-green{background:var(--soft-green);color:var(--on-soft-green)}
.icon-btn{width:var(--icon-btn);height:var(--icon-btn);display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:var(--r-pill);background:transparent;color:var(--text-secondary);cursor:pointer}.icon-btn:hover{background:var(--elevated);color:var(--text)}
.theme-toggle{font:var(--t-caption);color:var(--text-secondary);background:var(--elevated);border:1px solid var(--line);border-radius:var(--r-pill);padding:6px 12px;cursor:pointer}

@media (max-width:1279px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.sidebar{width:var(--sidebar-w-collapsed);padding:24px 12px}.sidebar .nav-item{justify-content:center;padding:0}.sidebar .nav-item span,.sidebar .nav-section,.sidebar-logo{display:none}.main{margin-left:var(--sidebar-w-collapsed)}}
@media (max-width:767px){.grid{grid-template-columns:1fr}.content,.header{padding-left:16px;padding-right:16px}.sidebar{display:none}.main{margin-left:0}}
</style>
</head>
<body>
<aside class="sidebar">
  <div class="sidebar-logo">cakto</div>
  <div class="nav-section">Produto</div>
  <a class="nav-item is-active" href="#"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/></svg><span>Roadmap</span></a>
  <a class="nav-item" href="#"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="18" rx="1.5"/><rect x="14" y="3" width="7" height="11" rx="1.5"/></svg><span>Kanban</span></a>
  <a class="nav-item" href="#"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg><span>OKRs</span></a>
  <div class="grow"></div>
  <a class="nav-item" href="#"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14.2 3H9.8l-.4 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2l.4 2.6h4.4l.4-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z"/></svg><span>Configurações</span></a>
</aside>

<div class="main">
  <header class="header">
    <nav style="font:var(--t-body2);color:var(--text-secondary)"><a href="#" style="color:var(--text);font-weight:600">Produto</a> · Roadmap</nav>
    <div style="display:flex;align-items:center;gap:var(--sp-8)">
      <button class="theme-toggle" id="theme">Tema: dark</button>
      <button class="icon-btn" aria-label="Notificações"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 8a6 6 0 0 1 12 0v5l2 3H4l2-3Z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg></button>
    </div>
  </header>

  <main class="content">
    <header class="page-title">
      <div class="page-title-main">
        <span class="hat">Q4 2026</span>
        <h1>[Título da Página]</h1>
      </div>
      <div class="page-title-actions"><button class="btn btn-secondary">Exportar</button><button class="btn btn-primary">Nova iniciativa</button></div>
    </header>

    <section class="grid" style="margin-bottom:var(--sp-24)">
      <div class="stat accent-green"><div class="stat-label">Entregues <span class="tag tag-success">+4</span></div><div class="stat-value">18</div><div class="stat-caption">no trimestre</div></div>
      <div class="stat"><div class="stat-label">Em andamento</div><div class="stat-value">12</div><div class="stat-caption">6 squads</div></div>
      <div class="stat accent-warning"><div class="stat-label">Em risco <span class="tag tag-warning">Atenção</span></div><div class="stat-value">3</div><div class="stat-caption">sem owner</div></div>
      <div class="stat accent-error"><div class="stat-label">Bloqueadas</div><div class="stat-value">1</div><div class="stat-caption">dependência externa</div></div>
    </section>

    <section class="card">
      <h3 class="card-title">[Conteúdo]</h3>
      <!-- tabela, board, formulário — ver components.md -->
    </section>
  </main>
</div>

<script>
(function(){var b=document.getElementById('theme'),r=document.documentElement;
function paint(){b.textContent=r.getAttribute('data-theme')==='light'?'Tema: light (derivado)':'Tema: dark'}
b.addEventListener('click',function(){if(r.getAttribute('data-theme')==='light'){r.removeAttribute('data-theme')}else{r.setAttribute('data-theme','light')}paint()});paint()})();
</script>
</body>
</html>
```

---

## 9. Checklist de entrega

- [ ] Public Sans carregada (Google Fonts); nenhum Inter/Roboto/SF Pro no CSS
- [ ] `:root` dark com os tokens desta skill; `[data-theme="light"]` presente e marcado como derivado
- [ ] Fundo do shell: `--shell-bg` (gradiente) no dark; sidebar e header em `--ground`; cards em `--paper`
- [ ] Nenhum texto verde em `#0F7865` sobre fundo escuro — links, nav ativo e valores em `--primary-text`
- [ ] CTA primário: fundo `--primary`, texto branco, hover com glow (não muda de tom)
- [ ] Tags de status **soft** (16% + `--on-soft-*`); um só verde de success (`#36B37E`)
- [ ] Sombra assinatura `-3px 8px 24px rgba(0,0,0,.30)` apenas em card hover/menu/modal/toast; nenhuma sombra em card parado
- [ ] Raios: 8 controle · 16 card · 24 modal · pill; hairline 1px `--line`
- [ ] Sidebar 238px (ou 304 justificado), NavItem h48, ativo `--soft-green-strong` + `--primary-text`
- [ ] Hit area ≥ 40px; `:focus-visible` com `--focus-ring` em todos os controles
- [ ] Dinheiro `R$ 0,00` 700 tabular à direita; datas `dd/mm/aaaa`
- [ ] Copy pt-BR, sentence case, botões verbo + objeto, estado vazio em uma linha, sem emoji
- [ ] Boards/tabelas rolam no próprio container; body nunca rola na horizontal
- [ ] Nenhum `#000`, nenhum `#3FC958`/`#3E9337`/`#1E1E1E`/`#F7F7F7`/`#00A76F` (paletas anteriores)

---

## 10. Changelog

### v2.0.0 — 2026-09 · rebrand

**Por quê.** O Manual de Marca (v1.0) estava desatualizado em cor e tipografia; o dashboard em produção seguia o Minimal UI (Inter, `#00A76F`). O Figma consolidou a nova identidade no bloco `.nova`, dark-only. Esta versão a torna a fonte de verdade e reaproveita do DS de produção só a arquitetura de tokens.

**O que mudou.**

| Área | v1.0 | v2.0 |
|---|---|---|
| Fonte | SF Pro / Inter | **Public Sans** 300–800 |
| Tema padrão | Light (`#F7F7F7`), dark opcional | **Dark** (`#0E0E0E`), light derivado e marcado como pendente |
| Verde principal | `#3FC958` Pulso (CTA com texto escuro) | `#0F7865` (CTA com texto branco); texto verde em `#2EA593`/`#82CABF` |
| Rampa | Pulso, Jade, Raiz, Veludo | `#064C3B · #0B6856 · #0F7865 · #2EA593 · #82CABF` |
| Cores de apoio | Linho `#E6DED3`, Pergaminho `#E2CFB7` | **Removidas** — sem tons quentes; tela monocromática + verde |
| Superfícies | Âncora `#1E1E1E`, Névoa `#F7F7F7` | `#0E0E0E → #141414 → #1A1A1A → #1C1C1C → #2C2C2C`; light `#F4F6F8 / #FFFFFF / #DFE3E8` |
| Status | success `#3FC958`, warning `#FFAB00` (texto `#7A4F00`) | `#36B37E · #FFAB00 · #FF5630 · #00B8D9`, sempre soft com `--on-soft-*` |
| Arquitetura de cor | 9 tokens fixos | Primitivas → aliases semânticos que flipam por tema → soft fills 16% + `--on-soft-*` |
| Sombra | Minimals `rgba(145,158,171,…)` | Assinatura `-3px 8px 24px rgba(0,0,0,.30)` (dark); Minimals só no light |
| Raios | 6 · 12 · 16 · 24 | 4 · **8** · 12 · **16** (card) · 24 (modal) · pill |
| Sidebar | 280px | **238px** padrão interno; 304px (Figma) documentado |
| Header | Branco com blur | `--ground` sólido, hairline; sem `backdrop-filter` |
| Componentes | 5 snippets | 36 componentes com tokens, medidas, estados e snippet (`components.md`) |
| Ícones | Lucide/Heroicons/Phosphor | Set do Figma (24/1.5) com Lucide como equivalente |
| Entregáveis | SKILL.md | SKILL.md + `tokens.css` + `components.md` |

**Decisões registradas.** Sombra deslocada à esquerda mantida (herdada, sem contraparte no rebrand). `#38CA4F` descartado: um só success. Light derivado de três fontes sem valores inventados; `--on-soft-warning` light (`#B76E00`, 4.0:1) é o ponto mais fraco e deve ser revisto na validação do design. Badge gradiente NOVO/BETA e `--gradient-brand` do Figma pertencem à paleta anterior e não entram na v2.0.

### v1.0.0 — versão inicial (Manual de Marca + Minimals)
