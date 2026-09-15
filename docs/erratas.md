# Erratas — migração de documentos para cakto-design v2.0

Lista de correções a aplicar em specs, protótipos e documentos que referenciam a paleta v1.0 (Manual de Marca), o DS de produção (Minimal UI) ou o Figma pré-rebrand. Use como find-and-replace guiado: cada linha traz o valor antigo, o token novo e a regra de uso quando ela mudou.

## 1. Paleta v1.0 (Manual de Marca) → v2.0

| Antigo (v1.0) | Onde costuma aparecer | Substituir por | Observação |
|---|---|---|---|
| `--color-primary` / Pulso `#3FC958` | CTA, badge positivo, item de nav ativo | `--primary` `#0F7865` (superfície) · `--primary-text` `#2EA593` (texto) | O verde deixa de ser claro-saturado. CTA passa a ter **texto branco**, não escuro |
| `--color-secondary` / Jade `#3E9337` | Hover, borda de input focado, progress | `--primary-hover` `#0B6856` · foco = `--focus-border` (branca no dark) · progress = `--primary` | Hover de botão preenchido vira glow, não troca de tom |
| `--color-bg-dark` / Âncora `#1E1E1E` | Sidebar, fundo dark, texto em light | `--ground` `#141414` (sidebar) · `--bg` `#0E0E0E` (página) · texto light `--text` `#212B36` | Um só token servia a três papéis; agora são três |
| `--color-bg-light` / Névoa `#F7F7F7` | Fundo de página light | `--bg` light `#F4F6F8` | Light é derivado — marcar "pendente de validação" |
| `--color-text-primary` `#1E1E1E` | Texto padrão | `--text` (`#FFFFFF` dark / `#212B36` light) | |
| Linho `#E6DED3` | Superfície secundária quente | **Remover** | Sem tons quentes na v2.0; usar `--elevated` |
| Pergaminho `#E2CFB7` | Superfície terciária | **Remover** | Idem |
| `--color-green-deep` / Raiz `#2F5733` | Texto sobre verde, texto de badge | `--text-on-primary` `#FFFFFF` (sobre CTA) · `--on-soft-success` (em tag) | |
| `--color-green-soft` / Veludo `#476D47` | Ícones secundários, divisores, coluna/etiqueta de Kanban | Ícone: `--text-secondary` · divisor: `--line` · acento verde: `--green-light` `#2EA593` | **Spec do Kanban usa `--veludo #476D47`** — trocar por `--green-light` em etiquetas e por `--line` em separadores. **Superada em 07/09/2026 para prioridade:** `kanban-card-spec.md` §3.3 decidiu prioridade monocromática — P2 → `--text-secondary`, só P0 leva cor. `--green-light` segue valendo para acentos verdes fora de prioridade |
| `rgba(63,201,88,.16)` | Badge success, nav ativo | `--soft-success` `rgba(54,179,126,.16)` · nav ativo `--soft-green-strong` `rgba(15,120,101,.20)` | |
| `rgba(30,30,30,.24)` / `.16` / `.08` | Bordas de botão secundário, input, header | `--line` `#2C2C2C` (dark) · `--input-border` `rgba(145,158,171,.20)` · `--line-strong` | |
| `#7A4F00` (texto warning) | Badge de alerta | `--on-soft-warning` (`#FFAB00` dark / `#B76E00` light) | |
| Inter / SF Pro Display / `-apple-system` primeiro | `font-family`, `@import` Google Fonts | `--font-sans` **Public Sans** | Trocar o `@import` |
| `--text-3xl 1.875rem` (título de página) | Page title | `--t-h3` 700 24/32 | Escala passa a px com line-height fixo |
| `--radius-sm 6px` (input, badge) | Inputs, tags | `--r-control` 8px (input, tag) · `--r-4` (label) | |
| `--radius-md 12px` (card, modal) | Cards | `--r-card` 16px (card) · `--r-frame` 24px (modal) | |
| `--sidebar-width 280px` | Shell | `--sidebar-w` 238px | 304px só para imitar o painel do produtor |
| `--shadow-card` Minimals em card parado | Cards | Sem sombra em repouso; `--shadow` `-3px 8px 24px rgba(0,0,0,.30)` só em hover/menu/modal | Light mantém a sombra Minimals |
| Header `rgba(255,255,255,.9)` + `backdrop-filter: blur(8px)` | Shell | `--ground` sólido + hairline `--line`; **sem blur** | |
| Regra "texto escuro sobre verde" | Regras de qualidade | Invertida: texto **branco** sobre `--primary` (5.4:1) | |
| Regra "nunca `#FFFFFF` como fundo de página" | Regras de qualidade | Mantida no light (`--bg #F4F6F8`); `#FFFFFF` é `--paper` no light | |

## 2. DS de produção (Minimal UI) → v2.0

| Antigo (produção) | Substituir por |
|---|---|
| `--green-main #00A76F`, `--green-light #5BE49B`, `--green-dark #007867`, `--green-darker #004B50`, `--green-lighter #C8FAD6` | Rampa nova: `#064C3B · #0B6856 · #0F7865 · #2EA593 · #82CABF` |
| `--soft-green rgba(0,167,111,.16)` | `rgba(15,120,101,.16)` |
| `--bg #141A21`, `--paper #1C252E`, `--elevated #28323D`, `--ground #10161C` | `#0E0E0E · #1A1A1A · #1C1C1C · #141414` |
| `--line rgba(145,158,171,.16)` | `#2C2C2C` (dark) / `#DFE3E8` (light) |
| `--secondary-* #8E33FF` (roxo) e `--soft-secondary` | **Remover** — sem cor secundária na v2.0 |
| `--success-main #22C55E` | `#36B37E` |
| Inter Variable | Public Sans |
| `--r-input 10px`, `--r-badge 6px` | 8px · 8px (tag) / 4px (label) |
| `--control-h 38px` | 40px |
| Nomes `--fs-*`, `--lh-*`, `--w-*` | `--t-*` (shorthand `font`) |

## 3. Figma pré-rebrand (`:root` do export) → v2.0

| Antigo (Figma `:root`) | Substituir por |
|---|---|
| `--base-100 #161C24`, `--base-200 #212B36`, `--base-300 #333E49` | `--bg #0E0E0E`, `--paper #1A1A1A`, `--line #2C2C2C` (cinza neutro, não azulado) |
| `--semantic-primary #65A76B` (decorativo) | `--green-light #2EA593` |
| `--semantic-secondary #36B37E` (texto/ativo) | `--primary-text #2EA593`; `#36B37E` fica só como `--success` |
| `--semantic-tertiary #0F7864` | `--primary #0F7865` (um dígito de diferença — unificar) |
| `--status-success #38CA4F` | `--success #36B37E` |
| `--status-warning #FDD465` | `--warning #FFAB00` |
| `--status-accet #61F3F3` (sic) | `--info #00B8D9` |
| `--gradient-brand #0F7864→#65A76B`, `--gradient-badge`, `--gradient-gold` | **Remover** — sem gradientes de componente; único gradiente é `--shell-bg` |
| `--nav-w 304px` | `--sidebar-w 238px` (interno) |
| `--chipbtn-hover-bg #29343F`, `--chipbtn-active-bg #333D48` | `--line` (hover) · `--nav-active-bg` (ativo) |
| `--avatar-bg #343B45` | `--surface-muted #2C2C2C` |
| Toast 700 16/24 | 700 14/22 |
| `.checkout` (`#095A49`, `#F1F1F1`) | Fora de escopo — não migrar |

## 4. Documentos a revisar (conhecidos)

| Documento | Ocorrência | Ação |
|---|---|---|
| Spec do Kanban | `--veludo #476D47` em etiquetas/colunas | `--green-light` (acento) ou `--line` (separador); tags de status → `.tag` soft. **Prioridade P2: `--text-secondary`** (monocromática, `kanban-card-spec.md` §3.3 — supera esta linha para esse uso) |
| Protótipos gerados com cakto-design v1.0 | `@import Inter`, `#3FC958`, `#1E1E1E`, `#F7F7F7`, sidebar 280 | Trocar `:root` pelo bloco do template v2.0 §8; revisar CTA (texto branco) e tema padrão (dark) |
| Protótipo Conta Digital (`cakto_prototipo_v12.html`) | Paleta v1.0 / Minimal | Idem; checkout e telas de produto final ficam **fora** desta skill — validar com design antes de recolorir |
| Deck de produto (modelo 11 slides) | Cores de marca nos slides | Fundo `#0E0E0E`, títulos brancos, destaque `#2EA593`, Public Sans |
| Dashboard de changelog (Google Sites) | Paleta v1.0 | Aplicar tokens §2 se o embed permitir CSS custom |

## 5. Regex úteis

```
# hexes das paletas anteriores (qualquer caixa)
#(3FC958|3E9337|1E1E1E|F7F7F7|E6DED3|E2CFB7|2F5733|476D47|00A76F|5BE49B|007867|004B50|C8FAD6|161C24|212B36|333E49|65A76B|0F7864|38CA4F|FDD465|61F3F3|8E33FF)\b

# nomes de token v1.0
--(color-(primary|secondary|bg-dark|bg-light|text-primary|support-warm-[12]|green-(deep|soft))|veludo|pulso|jade|ancora|nevoa|linho|pergaminho|raiz)

# fontes
(Inter|SF Pro|Roboto|Montserrat)
```
