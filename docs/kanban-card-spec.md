# Spec — Quadro Kanban de intake da Cakto

> Documento de handoff para o Claude Code. Especifica o **board Kanban de entrada de iniciativas**: quadro, colunas, card, estados, modelo de dados compartilhado com a ferramenta de Roadmap/Gantt, persistência e migração. Estado em 2026-09-04.
>
> Companheiro de `SPEC.md`, que documenta a ferramenta de Roadmap/Gantt (protótipo validado; **sem deploy** — ver `SPEC.md`, estado real). Esta spec **altera** o modelo de dados dessa ferramenta (§4) — as duas devem ser lidas juntas.
>
> Antecedentes de design: `docs/decisions.md`, `claude/pesquisa-anatomia-card-trello.md` (não está no repositório), artifact "Card do Roadmap Cakto".
>
> **Erratas (`erratas.md`) aplicadas em 07/09/2026:** terminologia alinhada ao glossário da `SPEC.md` §0.1 — **iniciativa**, nunca "demanda". Paleta já estava na v2.0 (a tabela §3.1 e o checklist §11 citam os hex antigos apenas como valores proibidos).

---

## 1. Decisões que governam esta spec

Quatro, tomadas em 04/09/2026. Tudo abaixo deriva delas.

1. **Modelo compartilhado.** O card do Kanban é a **fonte de verdade** do item de produto. Os itens do Gantt passam a ser **projeção derivada** dos cards, não dado armazenado. Uma única entidade, duas visualizações.
2. **Agrupamento alternável.** O board tem toggle plano ↔ swimlanes por squad, espelhando o `groupByCat` da ferramenta de Roadmap.
3. **Design system v2.0.** Dark-first `#0E0E0E`, Public Sans, verde `#0F7865`. Toda a paleta das specs anteriores do card está obsoleta (§3.1).
4. **Board de entrada.** Cards nascem só na primeira coluna, sem PM, sem Tech Lead, às vezes sem squad. Obrigatoriedade é **condição de passagem** entre colunas, nunca propriedade do card. Campo ausente por estágio **não renderiza** — sem placeholder, sem tracejado, sem "—".

---

## 2. Visão geral

Tela do mesmo app da ferramenta de Roadmap (`index.html`), acessível pelo NavItem "Kanban" da sidebar. Serve o fluxo de **entrada e triagem** de iniciativas das 6 squads sob o GPM; a tela de Gantt serve o **acompanhamento** das que foram priorizadas.

```
Backlog  →  Priorizado  →  Execução  →  Concluído          (+ Descartado, terminal)
   ↑            └──────── projeta no Gantt ────────┘
 criação
```

- **Backlog** — entrada. Única coluna onde se cria card. Não projeta no Gantt.
- **Priorizado** — card completo, trabalho não iniciado. Projeta no Gantt.
- **Execução** — em andamento, com sub-status (dev / QA / homologação).
- **Concluído** — entregue.
- **Descartado** — terminal com motivo. Sai do board para a visão de arquivo. Não projeta.

---

## 3. Design system — migração obrigatória

### 3.1 Tokens obsoletos → v2.0

As specs do card de 02/09 usam a paleta anterior por inteiro. **Nenhum destes valores pode aparecer no código.**

| Elemento | Obsoleto (v1) | v2.0 |
|---|---|---|
| Fonte | Inter | **Public Sans** 300–800 |
| Fundo de página | `#F7F7F7` / `#F2F1EE` | `--bg #0E0E0E` (shell com `--shell-bg`) |
| Superfície do card | `#FFFFFF` | `--paper #1A1A1A` |
| Superfície recuada | `#FAFAF8` | `--elevated #1C1C1C` |
| Texto | `#1E1E1E` / `#55584F` / `#87897F` | `--text #FFF` · `--text-secondary #919EAB` · `--text-disabled #637381` |
| Hairline | `rgba(30,30,30,.10)` | `--line #2C2C2C` |
| Verde | `#3FC958` / `#3E9337` | `--primary #0F7865` (superfície) · `--primary-text #2EA593` (texto) |
| Sombra | Minimals `rgba(145,158,171,…)` | `--shadow -3px 8px 24px rgba(0,0,0,.30)` — **só em hover/menu/modal**, nunca em card parado |
| Raio do card | 12 | `--r-card 16` |
| Neutros cálidos | Linho `#E6DED3`, Pergaminho `#E2CFB7` | **removidos** — sem tons quentes |
| Verde médio | `--veludo #476D47` | **removido** (ver §3.3) |
| Escala de squad | 6 matizes (cobre, ameixa, oliva…) | **removida** (ver §3.2) |

Duas regras da v2 que mudam o card de forma concreta:

- **Card parado não tem sombra.** Separação vem do contraste `--bg` ↔ `--paper` mais hairline. A sombra assinatura entra só no hover. Isso muda o estado de repouso definido na spec 02.
- **Verde em texto sobre fundo escuro nunca é `#0F7865`** (3.6:1). Onde houver texto verde, usar `--primary-text #2EA593`.

### 3.2 Identidade de squad sem cor

O DS v2 é monocromático + verde, e o verde tem papel fixo (CTA, seleção, ativo, valor positivo). A escala categórica de seis matizes não tem como existir.

**Identidade de squad muda de canal: de hue para tipografia e layout.**

| Canal | Como |
|---|---|
| Prefixo do ID | `PAY-231` · `PLT-076` · `GRW-142` · `MBR-104` · `BNK-017` · `PRT-052` — mono, sempre visível |
| Chip de squad | texto em `--text-secondary`, sem ponto colorido, sem fill |
| Swimlane | faixa por squad quando o agrupamento está ligado (§6.4) |
| FilterChip | isolar uma squad no board plano |

Ganho colateral: com a cor liberada do eixo de identidade, todo o orçamento cromático fica para **estado** — que é o eixo que precisa dele. O board fica legível por posição e texto, não por decodificação de paleta.

### 3.3 Eixos de estado nos tokens v2

Regra do DS: **status é sempre soft** — fill 16% + texto `--on-soft-*`.

| Eixo / estado | Token | Aplicação |
|---|---|---|
| Bloqueado | `--error` / `--soft-error` | filete de topo 2px + Tag com ID do bloqueador |
| Em risco | `--soft-warning` / `--on-soft-warning` | Tag de período |
| Atrasado | `--soft-error` / `--on-soft-error` | Tag de período |
| Concluído | `--soft-success` / `--on-soft-success` | Tag de período com check |
| Idade no Backlog | `--text-secondary` → `--warning` | contador mono no rodapé (§5.4) |
| Prioridade P0 | `--error` | único nível com cor |
| Prioridade P1–P3 | `--text` / `--text-secondary` / `--text-disabled` | **monocromática** — é a contagem de traços que informa |
| Progresso | `--progress-track` + `--primary` | ProgressBar h4 do DS |
| Seleção / foco | `--primary` / `--focus-ring` | anel 2px |
| Avatares | `--avatar-bg #2C2C2C`, iniciais `--text-secondary` | PM e TL distintos por **ordem**, não por cor |

**Prioridade monocromática é mudança de decisão.** A spec 02 dava cor a P1 e P2 (âmbar e verde). Com o DS v2, âmbar pertence a "em risco" e verde a "positivo/ativo" — reusá-los em prioridade cria colisão semântica dentro do mesmo card. A contagem de traços (4/3/2/1) já ordena; só P0 justifica gastar cor.

> Filete de bloqueio cai de 3px para **2px**: a v2 reserva 4px para acento/outline de card e 2px para acento. Hairline 1px, acento 2px, outline 4px — não inventar espessura.

---

## 4. Modelo de dados compartilhado

### 4.1 Princípio

```
cards{}  =  fonte de verdade
    │
    ├─→ board Kanban       (agrupa por coluna)
    └─→ Gantt              (projeção: só cards fora do Backlog, com período)
```

Os arrays `quarters[q].squads[i].items` e `quarters[q].squads[i].backlog` **deixam de ser armazenados**. Passam a ser computados a partir de `cards` a cada render. Isso elimina a possibilidade de as duas telas divergirem.

### 4.2 Documento persistido — `roadmap:board:v2`

```jsonc
{
  "schema": 2,
  "activeQuarter": "q4-2026",
  "order": ["q4-2026", "q3-2026"],

  // calendário e configuração — inalterado da v1, menos items/backlog
  "quarters": {
    "q4-2026": {
      "label": "Q4 2026",
      "start": "2026-10-06",        // início da Sprint 01
      "days": 14,
      "count": 6,
      "archived": false,
      "squads": [
        {
          "name": "Payment",
          "prefix": "PAY",           // NOVO — prefixo do ID legível
          "groupByCat": true,
          "wip": 4,                  // NOVO — limite de WIP em Execução (0 = sem limite)
          "categories": [ { "name": "Assinatura", "subs": [] } ]
          // items[] e backlog[] REMOVIDOS — derivados de cards
        }
      ]
    }
  },

  // NOVO — dicionário de cards, fonte de verdade
  "cards": {
    "GRW-142": {
      "id": "GRW-142",
      "titulo": "Order bump com oferta dinâmica por faixa de BIN no checkout",
      "coluna": "execucao",          // backlog | priorizado | execucao | concluido | descartado
      "squad": "Growth",             // "" no Backlog
      "tipo": "delivery",            // discovery|delivery|bug|debito|compliance — "" no Backlog
      "prioridade": "P1",            // P0|P1|P2|P3|"" (não avaliado)
      "estimativa": "M",             // XS|S|M|L|XL|XXL|""
      "periodo": {                   // null enquanto no Backlog
        "quarter": "q4-2026",
        "sprint_inicio": 2,          // nº da sprint (1-based)
        "sprint_fim": 4
      },
      "subestado": "dev",            // dev|qa|homolog — só em Execução
      "pm": "u_marcelo",
      "tech_lead": "u_ulisses",
      "categoria": "Checkout",       // alimenta as layers do Gantt — opcional
      "subcategoria": "",
      "origem": "dados",             // stakeholder|suporte|dados|discovery|incidente|regulatorio
      "sub_itens": [
        { "t": "Mapear faixas de BIN", "done": true },
        { "t": "Endpoint de oferta", "done": false }
      ],
      "progresso_manual": null,      // 0–100; usado só quando sub_itens está vazio
      "bloqueado_por": ["PAY-088"],
      "relacionado": ["PLT-076"],
      "parent": null,
      "descricao": {
        "problema": "…", "hipotese": "…", "metrica": "…",
        "escopo": "…", "fora_escopo": "…"
      },
      "metrica_alvo": { "nome": "conversão order bump", "baseline": "3,1%", "meta": "6%" },
      "links": { "prd": "", "deck": "", "figma": "", "metabase": "" },
      "motivo_descarte": null,       // obrigatório quando coluna = descartado
      "tags": [],
      "criado_em": "2026-08-12T14:02:00Z",
      "atualizado_em": "2026-09-03T09:41:00Z",
      "historico": [
        { "q": "coluna", "de": "priorizado", "para": "execucao",
          "por": "u_marcelo", "em": "2026-09-03T09:41:00Z" }
      ],
      "comentarios": []
    }
  },

  // ordem de exibição por coluna (ids)
  "ordem": {
    "backlog":    ["PRT-061", "GRW-155"],
    "priorizado": ["BNK-017"],
    "execucao":   ["GRW-142", "PAY-231"],
    "concluido":  ["PAY-198"],
    "descartado": ["GRW-097"]
  },

  "seq": { "PAY": 231, "PLT": 76, "GRW": 155, "MBR": 104, "BNK": 17, "PRT": 61 },
  "ui": { "groupBySquad": false }
}
```

### 4.3 Campos derivados — nunca armazenados

| Derivado | Cálculo |
|---|---|
| `progresso` | `sub_itens` concluídos / total. Sem sub-itens → `progresso_manual`. Sem os dois → não renderiza. |
| `idade_backlog` | `hoje − criado_em`, em dias. Só renderiza na coluna Backlog. |
| `saude_temporal` | `no_prazo` \| `em_risco` \| `atrasado`, de `periodo` × `progresso` × hoje (§5.3) |
| `bloqueia[]` | espelho de `bloqueado_por` de outros cards. **Nunca preencher os dois lados à mão.** |
| `datas` | de `periodo` + calendário do quarter (§4.4) |

### 4.4 Projeção Kanban → Gantt

Um card entra no Gantt quando `coluna ∉ {backlog, descartado}` **e** `periodo != null` **e** `periodo.quarter == activeQuarter`.

**Tempo — âncora em sprint, não em mês.** O Gantt posiciona barras por data exata sobre um eixo de sprints; o `periodo` do card guarda números de sprint e as datas são derivadas do calendário do quarter:

```js
const q = quarters[card.periodo.quarter];
const s = addDays(q.start, (card.periodo.sprint_inicio - 1) * q.days);
const e = addDays(q.start,  card.periodo.sprint_fim      * q.days - 1);
```

Assim a barra nasce alinhada à coluna de sprint, sem arredondamento. O rótulo humano (`out`, `nov`) é derivado de `s` para exibição no card.

**Mapa de campos:**

| Card (fonte) | Item do Gantt | Regra |
|---|---|---|
| `titulo` | `n` | direto |
| `periodo` + calendário | `s` · `e` | derivado (acima) |
| `coluna` + `subestado` | `st` | tabela abaixo |
| eixos de estado | `pv` | tabela abaixo — **deixa de ser campo manual** |
| `progresso` | `p` | `round(ratio × 100)` |
| `categoria` · `subcategoria` | `cat` · `sub` | direto — alimentam as layers |
| `squad` | swimlane | direto |
| `tipo`, `prioridade`, `estimativa`, `origem` | — | não projetam |

**`coluna` + `subestado` → `st`:**

| Coluna | `subestado` | `st` |
|---|---|---|
| Priorizado | — | `stories` |
| Execução | `dev` | `dev` |
| Execução | `qa` | `qa` |
| Execução | `homolog` | `homolog` |
| Concluído | — | `entregue` |
| Backlog / Descartado | — | não projeta |

> É por isso que `subestado` existe: "Execução" é grosseiro demais para um Gantt que já distingue dev, QA e homologação. Uma coluna, três sub-estados.

**Eixos de estado → `pv`** (derivado, o PM não digita mais):

| Condição no card | `pv` |
|---|---|
| `bloqueado_por` não vazio | `bloq` |
| `coluna == concluido` | `prod` |
| `saude_temporal == atrasado` | `atraso` |
| `saude_temporal == em_risco` | `risco` |
| `periodo == null` | `nao` |
| caso contrário | `prazo` |

**Backlog do Gantt é o Backlog do Kanban.** A tabela `backlog[]` por squad da ferramenta atual é removida; a coluna Backlog do Kanban ocupa o lugar. Na tela de Roadmap ela aparece como leitura dos cards em `coluna == backlog` filtrados pela squad; cards **sem squad** existem apenas no Kanban, num agrupamento "Sem squad".

### 4.5 Geração de ID

```
id = `${squad.prefix}-${String(++seq[prefix]).padStart(3,'0')}`
```
Gerado **na criação**, imutável. Card criado sem squad recebe prefixo provisório `INB` (inbox) e é **renumerado** ao receber squad na priorização — a única exceção à imutabilidade, registrada em `historico`.

---

## 5. O card

Frente com **no máximo 10 elementos**. Anatomia completa no artifact "Card do Roadmap Cakto"; aqui só o que muda com o DS v2 e com o modelo compartilhado.

### 5.1 Geometria

```
largura:     fluida, max-width 320px   (320 é referência de desenho, não trava)
padding:     16px  (--sp-16)
raio:        16px  (--r-card)
gap:         12px  (--sp-12)
superfície:  --paper
borda:       nenhuma; hairline --line só quando sobre outro card
sombra:      nenhuma em repouso; --shadow no hover
```

### 5.2 As quatro linhas

```
┌──────────────────────────────────────────────┐
│ GRW-142   Growth              ▏▎▍  P1        │  1
│ Order bump com oferta dinâmica por faixa     │  2
│ de BIN no checkout                           │
│ Delivery   M   Q4 · S02–S04   [slot]         │  3
│ ──────────────────────────────────────────── │
│ ▬▬▬▬ 5/11              🔒PAY-088   MC UL     │  4
└──────────────────────────────────────────────┘
```

**O slot contextual da linha 3** é o que mantém o teto de dez elementos com informação nova por coluna:

| Coluna | Slot exibe |
|---|---|
| Backlog | `origem: suporte` — Chip contorno, `--text-disabled` |
| Priorizado | nada |
| Execução | `subestado` — Tag soft (`dev` · `QA` · `homologação`) |
| Concluído | nada |
| Descartado | `não faremos: duplicado` — Tag `--soft-grey` |

Quando a linha 4 fica inteiramente vazia (Backlog típico), **o divisor também não renderiza**.

### 5.3 Saúde temporal — regra de derivação

Só existe com `periodo != null`, portanto nunca no Backlog.

```
progresso_esperado = sprints_decorridas / sprints_totais_do_item
atrasado  →  hoje > fim do periodo  E  coluna != concluido
em_risco  →  progresso < progresso_esperado − 0.25   (25 pontos de folga)
no_prazo  →  caso contrário
```
Item sem sub-itens e sem `progresso_manual` nunca entra em `em_risco` — não há como medir. Só pode ficar `atrasado`.

### 5.4 Idade no Backlog

Contador mono no rodapé, na posição do progresso.

| Faixa | Aparência |
|---|---|
| < 14 dias | `--t-caption`, `--text-disabled` — `6d` |
| 14–45 dias | 600, `--text-secondary` — `23d` |
| > 45 dias | 700, `--warning` — `61d` |

Inverte o card aging do Trello de propósito: o Trello desbota o card antigo; num board de intake, iniciativa esquecida precisa ficar **mais** visível. O card mantém contraste, o contador ganha peso.

### 5.5 Eixos e canais

Cada eixo é dono de um canal. Por construção, dois estados nunca disputam o mesmo pixel.

| Canal | Eixo dono |
|---|---|
| Presença de elementos · título · barra de progresso | ciclo de vida (coluna) |
| Tag de período | saúde temporal |
| Filete de topo 2px | impedimento |
| Contador mono no rodapé | idade no Backlog |
| Anel de contorno 2px · sombra | interação |

Combinações com regra: bloqueado + em risco → **só o filete** (a Tag volta a neutra); bloqueado + atrasado → **ambos**; bloqueado + descartado → **só descartado**; concluído + atrasado → **concluído ganha**.

---

## 6. O quadro

### 6.1 Layout

Template base da skill `cakto-design` — sidebar 238px, header 64px sticky, conteúdo pad 32.

```
PageTitle:  hat "Q4 2026" · h3 "Kanban de iniciativas" · count pill · [Nova iniciativa]
StatCards:  4 em grid gap 16
FilterChips: linha de filtros
Board:      overflow-x auto NO CONTAINER — o body nunca rola na horizontal
```

**StatCards** (`accent` na borda esquerda 4px conforme DS):

| Card | Valor | Acento |
|---|---|---|
| Entradas novas | cards criados nos últimos 7 dias | verde |
| No backlog | total em `backlog` · caption com quantos > 45d | — |
| Em execução | total em `execucao` · caption com squads envolvidas | — |
| Bloqueadas / em risco | soma dos dois · caption do maior ofensor | erro |

### 6.2 Coluna

```
largura:      minmax(272px, 1fr), max 320
gap:          16px (--grid-gap)
fundo:        transparente sobre --bg (a coluna não é card)
cabeçalho:    sticky no topo do scroll do board, fundo --ground
corpo:        overflow-y auto, gap 12
```

**Cabeçalho da coluna:**

```
NOME DA COLUNA        (--t-overline, --text-secondary)
count pill            (--soft-green-strong / --on-soft-green)
WIP "4/4"             (só em Execução — ver 6.3)
```

**Rodapé:** botão `+ Nova iniciativa` **somente na coluna Backlog**. As outras colunas não têm criação — card só entra nelas por movimentação. Isso é a regra do board de entrada expressa na interface, não só no texto.

**Estado vazio:** uma linha, `--t-caption`, `--text-disabled`, centrada. Sem ilustração.

```
Backlog      "Nenhuma iniciativa na entrada."
Priorizado   "Nada priorizado para este trimestre."
Execução     "Nenhuma squad com trabalho em andamento."
Concluído    "Nada entregue ainda em Q4 2026."
```

### 6.3 WIP limit

Por squad, campo `wip` na config (0 = desligado). Vale **só na coluna Execução**.

| Situação | Contador da coluna | Comportamento |
|---|---|---|
| abaixo do limite | `--soft-green-strong` | normal |
| no limite | `--soft-warning` | normal, com Tooltip "WIP no limite para Payment" |
| acima do limite | `--soft-error` | normal — **não bloqueia** o drop |

**WIP avisa, não impede.** Bloquear movimentação por WIP transforma a métrica em burocracia e ensina o time a burlar (card fica em Priorizado com trabalho já rolando). O sinal visual no cabeçalho é o suficiente — e no modo swimlane o limite é avaliado por faixa de squad, que é onde ele significa algo.

### 6.4 Agrupamento alternável

Toggle `groupBySquad` no PageTitle, persistido em `ui`. Espelha o `groupByCat` da ferramenta de Roadmap — mesma linguagem, mesmo lugar.

**Modo plano** (default): quatro colunas, cards misturados, squad lida no prefixo do ID e no chip. FilterChip isola uma squad.

**Modo swimlane:** faixas horizontais por squad cruzando as quatro colunas.

```
┌─ Payment ─────────── 3 · WIP 2/4 ───────────────────── [colapsar] ─┐
│  Backlog        Priorizado      Execução       Concluído           │
│  [card]         [card]          [card]         [card]              │
└────────────────────────────────────────────────────────────────────┘
┌─ Growth ──────────── 5 · WIP 4/4 ─────────────────────────────────┐
```

- Cabeçalho da faixa: nome, contagem total, WIP da squad, chevron de colapso. Fundo `--ground`, hairline inferior.
- Faixa colapsada guarda só o cabeçalho e a contagem.
- **Cards sem squad** vão para uma faixa `Sem squad`, fixada no topo, visível apenas quando há cards nela. É o pátio de triagem do GPM.
- Estado de colapso é local (não persiste no documento compartilhado) — cada PM colapsa o que não é dele sem afetar os outros.

### 6.5 Filtros

FilterChip h36, ativo em soft verde.

```
Squad (6)  ·  Tipo (5)  ·  Prioridade (P0–P3)  ·  Só bloqueados  ·  Só meus  ·  Backlog > 45d
```
Combinam por E. Filtro ativo altera as contagens das colunas e é refletido no count pill do PageTitle (`18 de 64`). Sem filtro persistido no documento.

### 6.6 Drag & drop

Mesma implementação da ferramenta de Roadmap — HTML5 nativo com delegação de eventos no container do board (`dragstart`/`dragover`/`drop`), reatribuindo posição em `ordem[coluna]` e `card.coluna`.

```
arrastando:      opacidade .5 · sem transform de escala (regra 7 do DS)
origem:          placeholder hairline --line com a altura exata do card
coluna alvo:     fundo --elevated durante o hover válido
reordenar:       indicador na metade superior/inferior do card alvo
```

**Recusa de drop** — o gate (§7) nomeia os campos, não a regra:

```
coluna alvo:  borda --error 1px
card:         retorna à origem, 160ms --ease
Toast:        soft error, inferior direito
              "Faltam para Priorizado: Tech Lead · período"
```

Em modo swimlane, arrastar entre faixas **atribui a squad daquela faixa** — é a forma mais rápida de triar do "Sem squad" para a squad certa.

### 6.7 Interação e acessibilidade

| Estado | Especificação |
|---|---|
| Hover | `--shadow` aparece. Sem transform. IconButtons de ação surgem no topo direito. |
| Foco de teclado | `--focus-ring` 2px `#2EA593`, `outline-offset 2px` |
| Selecionado | anel 2px `--primary`, sem offset |
| Clique | abre `Drawer` 480px à direita com o verso do card. Board permanece visível. |

Atalhos: `/` busca · `N` nova iniciativa (só com foco no Backlog) · `P` prioridade · `D` período · `A` dono · `B` bloqueio · `Esc` fecha drawer · setas navegam entre cards, `Espaço` pega e solta para mover por teclado.

Controles de edição são **chrome de interface** — vivem em `:hover` e `:focus-visible`, permanecem visíveis em toque, e **não contam** no teto de dez elementos.

Hit area ≥ 40px em todo controle. Board rola no próprio container.

### 6.8 Responsivo

| Largura | Comportamento |
|---|---|
| ≥ 1280 | 4 colunas visíveis, sidebar 238 |
| 768–1279 | sidebar colapsa para 72; board rola na horizontal |
| < 768 | sidebar vira drawer; board vira **uma coluna por vez** com Tabs de coluna no topo; card em modo compacto |

Modo compacto (coluna < 272px): cai tipo, estimativa e slot contextual; divisor removido; gap 12 → 8. Único caso em que a altura do card muda.

---

## 7. Gate — condições de passagem

| Transição | Exige |
|---|---|
| **Backlog → Priorizado** | `squad` · `pm` · `tech_lead` · `tipo` · `estimativa` · `periodo` |
| Priorizado → Execução | `subestado` (default `dev` ao entrar) |
| Execução → Concluído | progresso 100 %, ou confirmação explícita sem sub-itens |
| Qualquer → Descartado | `motivo_descarte` obrigatório |
| Volta para Backlog | permitida; card **mantém** os campos e volta a exibir idade |

`motivo_descarte` ∈ `duplicado · fora de estratégia · sem viabilidade técnica · resolvido por outro card · sem impacto suficiente`.

Toda mudança de coluna, prioridade ou período grava evento em `historico` com autor e horário. É o insumo da review de portfólio — e o único registro de quando algo foi prometido.

**Consequência de projeto:** com o gate completo, **Backlog é a única coluna com cards esparsos**. De Priorizado em diante todo card tem os dez elementos, exceto dependência e progresso, condicionais por natureza. Nenhuma outra coluna precisa de variação de campo ausente.

---

## 8. Persistência

Contrato de `/api/board` **inalterado** (§9 do handoff do Roadmap): `GET → { data, version, updatedAt }`; `PUT { data, baseVersion } → 200 { version }` ou `409 { current }`. Autosave 4s, refresh 15s sem pendência local, `sendBeacon` no `beforeunload`, resolução de 409 por confirm.

Muda apenas a chave: **`roadmap:board:v2`**. A `v1` permanece intacta para rollback.

`normalize()` ganha `normalizeCards()`: garante `ordem` consistente com `cards` (remove ids órfãos, adiciona cards ausentes ao fim da coluna), reconstrói `seq` a partir dos ids existentes, e espelha `bloqueia[]` a partir de `bloqueado_por[]`.

---

## 9. Migração v1 → v2

Executar **uma vez**, com backup antes. Fazer **Backup ↓** na ferramenta atual e guardar o JSON.

```
Para cada quarter, para cada squad:
  1. Definir squad.prefix (PAY, PLT, GRW, MBR, BNK, PRT)
  2. Para cada item de squads[].items[]:
       card = {
         id:          gerar com o prefixo
         titulo:      item.n
         coluna:      map(item.st)   // entregue→concluido · dev|qa|homolog→execucao
                                      // stories→priorizado · backlog→backlog
         subestado:   item.st ∈ {dev,qa,homolog} ? item.st : null
         squad:       squad.name
         periodo:     datas → nº de sprint pelo calendário do quarter (arredondar
                      início para baixo, fim para cima)
         categoria:   item.cat        subcategoria: item.sub
         progresso_manual: item.p
         prioridade:  ""              // não existe na v1 — preencher manualmente depois
         tipo:        ""              // idem
         estimativa:  ""              // idem
         pm/tech_lead: null           // idem
         origem:      "discovery"     // default de migração
         criado_em:   data do backup  // v1 não guarda criação
       }
  3. Para cada item de squads[].backlog[]:
       card com coluna="backlog", titulo=item.n, categoria=item.cat,
       descricao.problema=item.note
  4. Remover squads[].items e squads[].backlog
  5. Reconstruir ordem{} e seq{}
```

**Três avisos.**

`prioridade`, `tipo`, `estimativa`, `pm` e `tech_lead` não existem na v1. Cards migrados chegam **sem gate cumprido** — mas já estão em Priorizado ou Execução. A migração **não** deve empurrá-los de volta ao Backlog: o gate vale para movimentação futura, não retroativamente. Marcá-los com Tag `--soft-warning` "dados incompletos" no card até serem completados é a forma honesta de tratar isso.

`criado_em` migrado é a data do backup, não a real. O contador de idade dos cards migrados começa em zero — está errado e é irrecuperável. Aceitável: idade só importa no Backlog, e o backlog migrado é pequeno.

`item.pv` da v1 é **descartado** na migração. Previsão passa a ser derivada (§4.4). Se algum PM marcou "em risco" à mão contra a regra, o valor derivado vai discordar — e a regra é que está certa.

---

## 10. Evolução

Herda o roteiro do handoff do Roadmap (auth Google restrita ao domínio → Next.js, RBAC no servidor, Postgres quando o formato estabilizar, audit log, concorrência fina). Específico do Kanban:

1. **Automação de coluna** — mover para Execução ao abrir o primeiro PR; para Concluído ao fechar a release. Depende de integração com o repositório.
2. **Regra de WIP por squad configurável pelo TL**, não pelo GPM.
3. **Relatório de intake** — volume por origem, tempo médio no Backlog por squad, taxa de descarte. É o que responde "estamos recusando o suficiente?".
4. **Sub-itens como cards** (hierarquia real de um nível) em vez de checklist embutido, quando as squads pedirem.
5. **Verso do card** — spec ainda não escrita. Blocos por tipo de item, área de relações, histórico. É a próxima peça de design.

---

## 11. Checklist de verificação

Antes de considerar a tela pronta:

- [ ] Public Sans; nenhum Inter no CSS
- [ ] Nenhum `#3FC958` · `#3E9337` · `#1E1E1E` · `#F7F7F7` · `#476D47` · `#E6DED3` · `#E2CFB7` · `#00A76F`
- [ ] Nenhuma cor por squad; identidade só por prefixo de ID, chip de texto e swimlane
- [ ] Card em repouso **sem sombra**; `--shadow` só no hover
- [ ] Prioridade monocromática, exceto P0 em `--error`
- [ ] Tags de estado **soft** (16 % + `--on-soft-*`)
- [ ] Filete de bloqueio 2px, não 3px
- [ ] `+ Nova iniciativa` existe **só** na coluna Backlog
- [ ] Campo ausente por estágio não renderiza placeholder nem tracejado
- [ ] Recusa de drop nomeia os campos faltantes
- [ ] WIP avisa e não bloqueia
- [ ] `items[]` do Gantt é derivado, não armazenado — editar card reflete nas duas telas
- [ ] `pv` do Gantt derivado, sem campo manual
- [ ] Board rola no próprio container; body sem scroll horizontal
- [ ] `:focus-visible` em todo controle; hit area ≥ 40px
- [ ] Backup do board v1 guardado antes da migração

---

*Cakto · Roadmap · Spec do quadro Kanban · 04/09/2026*
