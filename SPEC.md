# Spec — Ferramenta de Roadmap/Gantt da Cakto

> Fonte da verdade dos requisitos. Descreve **tudo que foi definido e construído** para a ferramenta de roadmap dos PMs: modelo de dados, funcionalidades, regras de negócio, arquitetura, deploy planejado e evolução. Atualizada em 2026-09-04.
>
> **Estado real:** protótipo funcional validado no Claude Design (single-file HTML). O empacotamento para Vercel foi desenhado (§2, §9, §10) mas **não foi executado** — não há deploy. O código exportado do Claude Design pode conter ajustes posteriores a esta spec; ver §0.3.
>
> Existe uma trilha paralela no mesmo projeto — o **board Kanban de intake de iniciativas** (card, colunas, estados) — documentada em `docs/decisions.md`. É uma interface distinta, já presente no protótipo como quarta view e ainda em design, resumida no Anexo A. Esta spec cobre a ferramenta de **Roadmap/Gantt**.

---

## 0. Glossário e convenções

### 0.1 Termos

| Termo | Onde vive | Definição |
|---|---|---|
| **Item** | Roadmap/Gantt | Unidade de planejamento de uma squad em um quarter. Tem datas, status, previsão, %. É o que vira barra no Gantt. Todo item pertence a **uma** iniciativa (§3). **Não usar "épico"** — confirmado em 17/09/2026: o glossário fica em "item". |
| **Categoria** | Roadmap/Gantt | Agrupador **de iniciativas** dentro de uma squad, em um quarter. Sempre opcional. Existe mesmo vazia. Vira layer no Gantt. **Subcategoria deixou de existir** em 17/09/2026 — a iniciativa ocupa esse nível. |
| **Iniciativa** | Kanban ↔ Roadmap | A unidade de trabalho, do intake à entrega. Agrupa **um ou mais itens** e só está concluída quando todos estiverem entregues. Vive fora dos quarters (chave `iniciativas`, §3). No roadmap aparece como linha de grupo quando tem vários itens e como a própria linha do item quando tem um só. |
| **Backlog (do roadmap)** | Roadmap | Itens da squad **fora** do roadmap do quarter. Não entram no Gantt nem nos KPIs. É a mesma coisa que a coluna **Backlog Priorizado** do Kanban, vista do outro lado (17/09/2026). |
| **Arquivado · Descartado** | Roadmap ↔ Kanban | Marca que tira a iniciativa ou o item de circulação **preservando o status em que estavam** (§4.3). Arquivado = perdeu prioridade, pode ser retomado; Descartado = não será feito. Nenhum dos dois aparece no Gantt nem nos indicadores; ambos são consultáveis em Squads & sprints (§7). |
| **Squad · Sprint · Quarter** | Config | Estrutura temporal e organizacional. Sprint de 2 semanas por padrão; quarter = N sprints a partir de uma data de início. |

Regra: código, labels de interface e documentação usam **estes** termos. Sinônimos (demanda, épico, task, feature) não entram.

### 0.2 Design system

A interface segue a skill **`cakto-design` v2.0** (rebrand 2026: dark-first, Public Sans, verde principal `#0F7865`, base `#0E0E0E`), com tokens em `skills/cakto-design/tokens.css` e componentes em `skills/cakto-design/components.md`. Toda referência a cores nesta spec (§4) deve ser lida contra esses tokens; os hex da paleta anterior que ainda aparecerem no código são dívida a corrigir (ver §12).

### 0.3 Conciliação spec × código

O código exportado do Claude Design é a verdade do **comportamento implementado**; esta spec é a verdade da **intenção**. Onde divergirem, a divergência é listada e decidida caso a caso — não se assume que um dos lados está certo. Primeira tarefa no Claude Code: gerar essa lista (ver `CLAUDE.md`). Lista gerada em `docs/divergences.md` (04/09/2026); entre os achados, o protótipo tem **quatro** views, não três — o Kanban de intake já existe (item A1).

---

## 1. Visão geral

Ferramenta interna, usada pelos PMs (5 squads, sob um GPM — lista canônica em §3), para **alimentar itens de roadmap por squad** e **visualizar o roadmap trimestral em formato Gantt** (swimlanes por squad, eixo em sprints de 2 semanas).

Quatro views — **nomes travados** (decisão de 07/09/2026, `divergences.md` C5), iguais na navegação, na spec e no código; "Quadro Principal", "Inserção de Dados" e "Demandas" saem dos dois lados (código no passo 3):
- **Roadmap** — tabela editável por squad (o "alimentador"). Quando esta spec precisa distinguir da ferramenta como um todo, diz "view Roadmap" ou "tabela".
- **Visão geral (Gantt)** — visualização gerada automaticamente a partir dos dados.
- **Kanban de iniciativas** — fora do escopo desta spec; ver Anexo A e `docs/decisions.md`.
- **Squads & sprints** — calendário de sprints, quarters e squads (a "Config").

### 1.1 Shell e navegação

- **Barra lateral** (280px): logo, seção "Roadmap" (Roadmap, Visão geral (Gantt), Kanban de iniciativas) e seção "Config" (Squads & sprints), com ícones do design system. **Colapsável** para 64px (só ícones, com tooltip no título); o estado fica lembrado no navegador (`localStorage`, chave `cakto-roadmap-side`). Rodapé com a nota de persistência ("Alterações são salvas automaticamente e compartilhadas com todos. Salvar / Carregar exportam e importam uma cópia em JSON.", desde o passo 4).
- **Header:** trilha `Roadmap {quarter} / {view}`; **seletor de quarter** em menu suspenso (lista **todos** os quarters, arquivados em seção própria e marcados — comportamento em §7; cada linha mostra o rótulo e "Sprint 01–NN"; fecha ao clicar fora); botões **Importar** (só na view Roadmap), **Carregar** e **Salvar** (§8); placeholder de avatar à direita.
- Rótulos de navegação: os quatro nomes travados de §1. Enquanto um quarter que não é o ativo estiver em visualização (§7), o header exibe o banner "Quarter arquivado — somente leitura" (ou "Quarter não ativo — somente leitura", se não estiver arquivado) e toda edição é recusada com a mensagem de §1.2.

### 1.2 Mensagens de confirmação (toasts)

Toda ação relevante responde com uma mensagem curta no rodapé, centralizada, por 2,2 s. É a camada de voz da interface — os textos são revisados contra `cakto-context` na migração visual (passo 5). Lista atual, travada como comportamento:

| Gatilho | Texto |
|---|---|
| Salvar | Arquivo salvo |
| Carregar (sucesso · arquivo não reconhecido) | Dados carregados · Arquivo inválido |
| Importar planilha | Importado: N squads · Nenhuma tabela reconhecida · Erro ao ler a planilha |
| + Squad · excluir squad · arquivar/desarquivar | Squad criada — renomeie no campo de nome · Squad excluída · Squad arquivada · Squad desarquivada |
| Arquivar/excluir squad com pendências · prefixo inválido | Squad com {N itens no roadmap, M no backlog, K iniciativas no Kanban} — remaneje antes de {arquivar/excluir} · Prefixo inválido ou já usado por outra squad |
| + Nova categoria | Categoria criada — clique no nome para editar |
| Remover categoria | Categoria removida — iniciativas preservadas sem categoria |
| Renomear categoria para um nome que já existe (B5) | Já existe uma categoria com esse nome |
| Enviar ao backlog · promover ao roadmap | Movido para o backlog · Promovido ao roadmap — defina as datas |
| + Novo quarter · trocar quarter | Quarter criado — ajuste rótulo e datas em Squads & sprints · Quarter: {rótulo} |
| Excluir quarter (travas, §7) | Quarter com itens no roadmap não pode ser excluído · Ative outro quarter antes de excluir este · Quarter excluído |
| Kanban — criar / editar / remover | Dê um título à iniciativa · Iniciativa adicionada à fila de Iniciativas · Iniciativa atualizada · Iniciativa removida |
| Kanban — passagem recusada | Faltam para {coluna}: {campos} · Falta o motivo do descarte — defina na engrenagem do card · A squad do card não existe neste quarter |
| Arrastar card para coluna derivada (18/09/2026) | Execução e Concluído vêm dos itens no roadmap — mova os itens, não o card |
| Extrair item de iniciativa que já tem um item só | A iniciativa já tem um item só |
| Editar em quarter que não é o ativo (C7) | Quarter em visualização — somente leitura |
| Mover iniciativa para squad sem a categoria dela | Iniciativa movida — {squad} não tem a categoria {nome}; ficou sem categoria |
| Arrastar item avulso para outra categoria | A categoria é da iniciativa — arraste a iniciativa |
| Extrair item · juntar iniciativas | Item extraído — nova iniciativa {code} · Iniciativas juntadas em {code} |
| Remover o último item de uma iniciativa | Item e iniciativa removidos |
| Arquivar · descartar · retomar | Iniciativa arquivada — veja em Squads & sprints · Iniciativa descartada · Iniciativa retomada |

Substitui o preenchimento manual em planilha (`Q2 Weekly Review.xlsx`), preservando as mesmas colunas de entrada (Item, Início, Fim, Status, Previsão, % Conclusão) e adicionando estrutura (quarters, categorias, backlog) e uma visualização rica.

**Estado atual:** protótipo funcional completo (single-file HTML), validado. Deploy desenhado, não executado. Sem autenticação nesta fase (validação do modelo); quando houver deploy, acesso protegido por senha da hospedagem.

---

## 2. Arquitetura & stack

Decisão deliberada para a fase de validação, feita por um único dev (o GPM) com apoio do Claude: **sem build**, para manter o protótipo editável e publicável em qualquer host estático. (Até 07/09/2026 a regra era "sem framework e sem build"; a decisão Preact + htm, abaixo, mantém só a metade que importa.)

| Camada | Escolha | Racional |
|---|---|---|
| Front-end | **HTML/CSS + Preact e htm via CDN, sem build**. Single-page app com quatro views (Inserção, Gantt, Kanban, Config) | Zero fricção de build; funciona em qualquer host estático; renderização declarativa protege edição inline e drag & drop |
| Organização do código | **Módulos por responsabilidade** carregados via `<script>` (ver estrutura abaixo) | Legibilidade e edição incremental no Claude Code; um único arquivo de 3k+ linhas é hostil a diffs |
| Hospedagem | **Vercel** (site estático + função serverless) — decidido em 09/09/2026, §2.1 | Deploy Git-based, preview branches, rollback 1-clique |
| API | **1 função serverless** `api/board.js` (Node 18+, ESM, zero dependências) | GET/PUT do board; usa `fetch` nativo |
| Storage | **Supabase (Postgres)** — tabela `board` (`id`, `version`, `data jsonb`, `updated_at`), uma linha por board; ver §2.1 e §9.1 | O dado é um documento e continua sendo até 4b; Supabase cobre o passo seguinte (auth Google por domínio, §11) e o relacional no mesmo banco |
| Libs externas | **Preact + htm** via CDN (renderização) e **SheetJS** (`xlsx`) via CDN cdnjs (importar planilha) | Duas dependências de runtime, ambas carregadas no cliente, nenhuma exige build |
| Fonte | **Public Sans** (Google Fonts), fallback system | Conforme `cakto-design` v2.0 |

**Por que Preact + htm, e não vanilla puro (decisão de 07/09/2026, ver `docs/decisions.md`):** a conciliação (§0.3, item B7 de `docs/divergences.md`) mostrou que o export é um componente do Claude Design, não HTML/JS solto — a reescrita da camada de renderização é inevitável de qualquer forma. O que protege o projeto é **"sem build"**, não "sem framework": essa regra permanece. Edição inline na tabela e drag & drop na tabela e no Kanban tornam o redesenho manual do DOM a parte mais arriscada de uma versão vanilla pura; o export já tem estrutura de componentes com estado e refs, então a migração vira tradução. Preact + htm dá exatamente isso via `<script type="module">` de CDN, sem JSX, sem bundler.

**Constantes herdadas do Claude Design:** o protótipo expunha três props do componente; na reescrita (passo 3) viram constantes de configuração, com os mesmos defaults — `paginaInicial = 'dados'` (view inicial: `dados` ou `gantt`), `mostrarRotuloBarra = true` (percentual escrito dentro da barra do Gantt — manter ou não é decisão aberta em `divergences.md`, A10) e `destacarHoje = true` (linha vertical de hoje no Gantt, §6.1).

**Por que documento JSON e não relacional agora:** o modelo ainda pode mudar. Guardar o board como documento evita migrations a cada ajuste. A estrutura (`quarter → squad → categoria → iniciativa → item`, desde 17/09/2026) já mapeia direto para tabelas quando estabilizar (§11).

### 2.1 Decisão — storage e hospedagem (09/09/2026)

**Decidido: Vercel + Supabase (Postgres).** Uma tabela `board` (`id`, `version`, `data jsonb`, `updated_at`); `api/board.js` com adaptador para Supabase; contrato de §9 mantido. Racional: o dado é um documento e vai continuar sendo até 4b; Supabase cobre o passo seguinte (auth Google por domínio, §11) e o relacional no mesmo banco — uma ferramenta a menos ao longo do tempo. As três combinações avaliadas, todas compatíveis com o contrato de §9.1 (a API é a mesma; muda só o adaptador em `api/board.js`):

| Opção | O que é | A favor | Contra |
|---|---|---|---|
| **Vercel + Upstash Redis** | Host estático + chave/valor REST | O mais simples possível para "um JSON com versão"; free tier; zero schema | Ferramenta a mais; não evolui para relacional |
| **Vercel + Supabase (Postgres)** | Host estático + Postgres gerenciado | Já é o destino relacional de §11; auth Google embutida para a fase seguinte; uma ferramenta a menos no futuro | Usar Postgres para guardar um JSON é subutilizar; um pouco mais de setup |
| **Supabase completo** (storage + auth + hosting) | Tudo em um | Menor número de contas e integrações | Hospedagem estática do Supabase é menos madura que a Vercel |

Critérios usados (na ordem): esforço de setup para quem não é dev backend → aderência ao caminho de §11 (auth + relacional) → número de ferramentas a manter. Sem as variáveis de ambiente do Supabase, `api/board.js` roda com o fallback em memória (§9.1) — é o modo do desenvolvimento local.

### 2.2 Estrutura do repositório

```
roadmap/
├── CLAUDE.md                  # instruções de trabalho para o Claude Code
├── SPEC.md                    # este documento
├── skills/
│   ├── cakto-design/          # SKILL.md v2.0, components.md, tokens.css
│   └── cakto-context/         # SKILL.md
├── docs/
│   ├── decisions.md           # decisões do Kanban de intake (com erratas aplicadas)
│   └── divergences.md         # saída da conciliação spec × código (§0.3), gerada no Code
├── index.html                 # shell + quatro views; carrega Preact + htm e SheetJS via CDN
├── css/
│   ├── tokens.css             # link ou cópia de skills/cakto-design/tokens.css
│   └── app.css                # estilos da aplicação, só com tokens
├── js/
│   ├── app.js                 # montagem do app (Preact) e roteamento entre views
│   ├── components/            # um arquivo por view — camada de renderização (Preact + htm)
│   │   ├── table.js           # view Roadmap — tabela (§5)
│   │   ├── gantt.js           # §6
│   │   ├── kanban.js          # Anexo A
│   │   └── config.js          # §7
│   ├── data.js                # seed, normalize(), enums de §4 — lógica, sem Preact
│   ├── io.js                  # import/export (§8) — lógica, sem Preact
│   └── sync.js                # §9 — lógica, sem Preact
├── api/
│   └── board.js               # função serverless GET/PUT (adaptador de storage plugável)
├── package.json               # { "type": "module" }, sem deps
└── README.md                  # deploy + guia de atualização
```

---

## 3. Modelo de dados

Todo o estado da aplicação é um único objeto `data`, serializável em JSON, persistido inteiro. É a **fonte da verdade** e o contrato com o backend.

```jsonc
{
  "activeQuarter": "q3-2026",           // id do quarter ativo
  "order": ["q3-2026", "q2-2026"],      // ordem de exibição dos quarters no seletor
  "quarters": {
    "q3-2026": {
      "label": "Q3 2026",               // rótulo livre exibido
      "start": "2026-07-07",            // data de início da Sprint 01 (YYYY-MM-DD)
      "days": 14,                        // duração da sprint em dias
      "count": 6,                        // nº de sprints do quarter
      "archived": false,                 // arquivado = fora do fluxo, ainda acessível
      "squads": [
        {
          "name": "Payment",
          "prefix": "PAY",              // prefixo do ID das iniciativas (PAY-107); único no quarter; editável
          "archived": false,             // arquivada = fora das abas, do Gantt e do Kanban neste quarter; dados preservados
          "color": "#3FC958",           // cor da swimlane / chip (hex)
          "groupByCat": true,            // true = visão agrupada por categoria; false = plana
          "pm": "",                      // NOVO (17/09/2026) — PM padrão da squad; copiado para toda iniciativa nova
          "tl": "",                      // NOVO — Tech Lead padrão; o PM pode trocar no card da iniciativa
          "categories": [                // lista EXPLÍCITA de categorias (existem mesmo vazias)
            { "name": "Assinatura" },     // `subs` REMOVIDO em 17/09/2026 — a iniciativa ocupa esse nível
            { "name": "Internacional" }
          ],
          "items": [
            {
              "n": "FASE 1 · MVP comercial", // nome do item
              "s": "2026-07-21",              // início (YYYY-MM-DD) — pode ser "" 
              "e": "2026-08-17",              // fim (YYYY-MM-DD) — pode ser ""
              "st": "dev",                     // chave de status (ver §4.1)
              "pv": "prazo",                   // chave de previsão (ver §4.2)
              "p": 15,                          // % de conclusão (int 0–100)
              "ini": "PAY-104",                // NOVO (17/09/2026) — `code` da iniciativa dona; obrigatório
              "arq": "",                        // NOVO — "" | "arquivado" | "descartado" (§4.3)
              "nota": ""                        // NOVO — motivo livre do arquivamento ou do descarte
              // "cat" e "sub" REMOVIDOS — a categoria é da iniciativa; subcategoria não existe mais
            }
          ],
          "backlog": [                     // itens FORA do roadmap (não aparecem no Gantt)
            { "n": "Order Bump", "ini": "PAY-118", "note": "aguardando discovery" }   // `cat` saiu: vem da iniciativa
          ]
        }
      ]
    }
  },
  "iniciativas": [                        // cards do Kanban de intake (Anexo A). Vive FORA de quarters: a fila é única, não por quarter
    {                                     // NOTA: o código atual usa a chave `demandas`; a migração de nome acontece no passo 3,
                                          // com normalize() lendo a chave antiga e gravando a nova
      "id": 7,                            // inteiro sequencial, único no board
      "code": "PAY-107",                  // ID legível: `prefix` da squad homônima no quarter ativo + (100 + id), gerado na criação e imutável
      "t": "Order Bump na assinatura",    // título
      "d": "",                            // descrição (contexto, problema ou oportunidade)
      "sq": "Payment",                    // squad (nome); "" = fila central, sem squad
      "col": "iniciativas",               // coluna: iniciativas | priorizado | execucao | concluido | descartado (fixas — ver A.2)
      "cat": "Internacional",             // NOVO (17/09/2026) — categoria; "" = sem categoria. Resolvida por NOME dentro do quarter
      "prio": "P1",                       // prioridade: "" (não avaliada) | P0 | P1 | P2 | P3
      "tipo": "Delivery",                 // Discovery | Delivery | Bug | Débito técnico | Compliance
      "est": "M",                         // estimativa t-shirt: "" | XS | S | M | L | XL | XXL
      "perQ": "Q4",                       // período — trimestre: "" | Q1 | Q2 | Q3 | Q4
      "perM": "out",                      // período — mês-alvo: "" | jan … dez
      "pm": "Nome do PM",                 // "" no Backlog é legítimo (A.2); obrigatório para sair dele
      "tl": "Nome do TL",                 // idem
      "origem": "stakeholder",            // "" | stakeholder | suporte | dados | discovery | incidente | regulatório
      "motivo": "",                       // motivo do descarte (enum de 5, A.2); obrigatório para entrar em Descartado
      "nota": "",                         // NOVO (17/09/2026) — texto livre do descarte ou da despriorização; substituído a cada ação
      "arq": "",                          // NOVO — "" | "arquivado" | "descartado" (§4.3)
      "link": "https://…",               // protótipo navegável ou documento externo. Anexo é SEMPRE link — arquivo dentro do board não é aceito
      "dep": [],                          // dependências: lista de `code` de outras iniciativas; bloqueia enquanto o card não é terminal
      // "subsTotal"/"subsDone" REMOVIDOS em 17/09/2026 — o progresso vem dos itens (ver "Derivados" abaixo)
      "createdAt": 1757000000000          // epoch ms; base do card aging (faixas 14/45 dias)
    }
  ]
}
```

### Derivados — nunca armazenados (17/09/2026)

Calculados a partir dos itens da iniciativa, ignorando os que estão arquivados ou descartados:

| Derivado | Cálculo |
|---|---|
| `%` da iniciativa | **média simples** do `p` dos itens. Consequência aceita: item pequeno pesa igual a item grande, e item novo entra com zero e derruba a barra. |
| datas da iniciativa | envelope: menor `s` e maior `e` dos itens que estão no roadmap. |
| conclusão | todos os itens estão `entregue`. |
| `col` = `execucao` | pelo menos um item saiu do backlog para o roadmap. |
| `col` = `concluido` | conclusão verdadeira. |

`iniciativas` e `priorizado` são movimentos **humanos** (intake e priorização); `descartado` também, com motivo obrigatório. `execucao` e `concluido` são **derivados** e não se arrastam à mão.

### Invariantes
- Todo `item` tem `ini` apontando para uma iniciativa existente; toda iniciativa fora da coluna `iniciativas` tem **ao menos um** item (no roadmap ou no backlog da squad). Não existe item avulso (17/09/2026).
- A **categoria é da iniciativa**, nunca do item: os itens de uma iniciativa estão sempre na mesma categoria. `iniciativa.cat` guarda o **nome**; se a squad do quarter não tiver esse nome, a iniciativa fica sem categoria.
- `iniciativa.sq` é sempre a squad onde os itens dela estão. Mover a iniciativa de squad move os itens junto, em **todos os quarters não arquivados**; o `code` não muda (só tag e cor).
- `item.arq` e `iniciativa.arq` tiram do roadmap, do Gantt e dos indicadores, **sem** apagar `st`, `pv` e `p` (§4.3).
- `categories` é a **fonte de ordenação e existência** das categorias (permite categoria vazia). A função `normalizeSquad()` reconstrói/completa `categories` a partir dos `items` ao carregar (retrocompatível com JSON antigo sem `categories`).
- `backlog` nunca entra no Gantt nem nos KPIs.
- Datas vazias (`""`) são válidas: o item existe na tabela mas **não renderiza barra** no Gantt.
- `iniciativas` é uma fila única, fora de `quarters`; o card em si nunca vira barra no Gantt — quem vira barra são os **itens** dela. O vínculo com o roadmap está **fechado** desde 17/09/2026 (Anexo A.1).
- `quarter.days` ∈ `{7, 14, 21, 28}` (§7); `normalize()` corrige valores fora da lista para 14.
- `iniciativa.col` só aceita as cinco chaves fixas de A.2. `normalize()` traduz chaves antigas (`discovery` → `priorizado`, `andamento` → `execucao`, `backlog` → `iniciativas`) e a chave de topo antiga (`demandas` → `iniciativas`).
- Campo ausente numa iniciativa é `""` (ou `[]`/`0`), nunca `undefined`; obrigatoriedade é condição de passagem entre colunas, não propriedade do card (A.2).
- `activeQuarter` é o quarter ativo **do board** — estado compartilhado, muda só por "Ativar" em Squads & sprints (§7). O quarter **em visualização** é estado local de cada navegador, **não persiste** em `data`; quando difere do ativo, a interface fica somente leitura (decisão de 07/09/2026, C7).

### Squads: estrutura e prefixo

Decisão de 09/09/2026 (revisa C8): **não existe lista fechada de squads**. Qualquer pessoa cria, edita, arquiva ou exclui (perfis e permissões vêm depois, §11). Todas se comportam igual.

- **Squads vivem dentro de cada quarter.** "Payment" no Q3 e no Q2 são objetos distintos; criar um quarter copia as squads do ativo (nome, prefixo, cor, toggle, categorias) sem itens. Renomear vale para o quarter ativo em diante — quarters anteriores guardam o nome da época.
- **`prefix`** — forma o ID legível da iniciativa (`code`, ex.: `PAY-107`). Nasce das três primeiras letras do nome, em maiúsculas, único no quarter (`PAY`, `PAY2`…); editável na Config (2–4 letras/dígitos); renomear a squad **não** o altera. O `code` é gerado na criação da iniciativa e é **imutável** — mover a iniciativa de squad atualiza tag e cor, não o código (alinhado a `docs/kanban-card-spec.md` §4.5). `normalize()` preenche `prefix` em squads que não o tenham.
- **`archived`** — squad arquivada some das abas do Roadmap, do Gantt e do Kanban **neste quarter**; fica na Config com "Desarquivar"; dados preservados. Cobre "a squad deixou de existir": remanejam-se os itens, arquiva-se; o histórico dos quarters anteriores permanece.
- **Travas** (valem para arquivar e excluir): a squad não pode ter itens no roadmap, itens no backlog nem iniciativas no Kanban (`iniciativa.sq`). A recusa nomeia o que impede: "Squad com 3 itens no roadmap, 2 no backlog e 1 iniciativa no Kanban — remaneje antes de arquivar".
- **Excluir** só aparece para squad **sem histórico** (nenhum outro quarter tem squad com o mesmo nome) — o caso da squad criada por engano. Com histórico, o caminho é arquivar.
- O seed traz cinco squads (Payment `PAY` · Platform `PLA` · Cakto Members `MEM` · Bank & App `BNK` · MRR & Fiscal `MRR`) como **dado inicial**, não como regra.

---

## 4. Enums e regras de status

> **Cores:** as tabelas abaixo trazem o mapeamento para a paleta `cakto-design` v2.0. É uma **proposta** derivada dos tokens (`tokens.css`) — validar visualmente no Gantt após a refatoração, especialmente `homolog` vs `dev` (dois verdes adjacentes) e a legibilidade do texto sobre `entregue`. A coluna "v1.0" registra o valor anterior, para rastrear a errata no código.

**Rótulos travados (decisão de 07/09/2026, `divergences.md` B6):** a grafia abaixo é a oficial em interface e documentação — sem emoji, inicial maiúscula só na primeira palavra. Substitui a grafia anterior com emoji.

### 4.1 Status do item (`st`) — define a **cor da barra**
| Chave | Rótulo | Cor barra (v2.0) | Texto | Token | v1.0 (obsoleto) |
|---|---|---|---|---|---|
| `entregue` | Entregue | `#36B37E` | `#0E0E0E` | `--success` | `#3FC958` |
| `dev` | Em desenvolvimento | `#0F7865` | `#FFFFFF` | `--primary` | `#3E9337` |
| `qa` | Em teste / QA | `#FFAB00` | `#0E0E0E` | `--warning` | `#F5A623` |
| `homolog` | Homologação | `#2EA593` | `#0E0E0E` | `--primary-light` | `#476D47` |
| `backlog` | Backlog | `#2C2C2C` | `#919EAB` | `--muted` / `--text-secondary` | `#D9D4CB` |
| `stories` | User stories | `#1C1C1C` | `#919EAB` | `--surface-extra` / `--text-secondary` | `#E2CFB7` |

### 4.2 Previsão (`pv`) — define o **dot indicador** na barra
| Chave | Rótulo | Cor dot (v2.0) | Token | v1.0 (obsoleto) |
|---|---|---|---|---|
| `prazo` | No prazo | `#36B37E` | `--success` | `#3FC958` |
| `prod` | Em produção | `#36B37E` | `--success` | `#3FC958` |
| `risco` | Em risco | `#FFAB00` | `--warning` | `#F5A623` |
| `atraso` | Atrasado | `#FF5630` | `--error` | `#E03131` |
| `bloq` | Bloqueado | `#919EAB` | `--text-secondary` | `#9AA0A6` |
| `nao` | Não iniciado | `#637381` | `--text-disabled` | `#C4C4C4` |

Nos temas: os hex acima são do tema dark (padrão). No light derivado, `backlog` e `stories` usam `--elevated` (`#DFE3E8`) com texto `--text-secondary`; os demais mantêm o hex (status e verde principal são estáveis entre temas — ver `cakto-design` §2).

Regra de implementação: **o código referencia tokens, não hex.** Os hex aqui são documentação.

Convenção validada: **cor da barra = status**; **dot na ponta = previsão** (só aparece quando ≠ No Prazo/Em Produção). Preenchimento interno da barra = `% de conclusão`.

### 4.3 Circulação (`arq`) — eixo separado do status (17/09/2026)

| Chave | Rótulo | Efeito |
|---|---|---|
| `""` | em circulação | comportamento normal |
| `arquivado` | Arquivado | sai do roadmap, do Gantt e dos indicadores; `st`, `pv` e `p` **preservados**; volta pelo botão Retomar (§7) |
| `descartado` | Descartado | idem, e a iniciativa fica na coluna Descartado do Kanban, com motivo obrigatório (A.2) e `nota` livre |

**Por que não é um status.** Arquivar não é uma etapa da entrega: um item arquivado estava em desenvolvimento, em QA ou no backlog, e precisa lembrar disso para ser retomado. Se `arquivado` fosse um valor de `st`, a informação de onde ele parou seria sobrescrita.

**Não confundir com `pv: bloq`.** Bloqueado é item que segue no plano e no Gantt, travado por algo externo agora. Arquivado saiu do plano.

---

## 5. Funcionalidades — View Roadmap (tabela)

Abas por squad no topo (+ "+ Squad"). Cada squad tem duas tabelas: **roadmap** e **backlog**.

### 5.1 Tabela de roadmap
- Toggle **"Agrupar por categoria"** (`groupByCat`), por squad. **Padrão: ligado em todas as squads.**
- **Três tipos de linha** (17/09/2026), nesta ordem de aninhamento: **categoria** → **iniciativa** → **item**.
  - **Iniciativa com vários itens** vira linha de grupo, no lugar que era da subcategoria: `code`, título, contador "N de M entregues", datas por envelope e % derivado. Os itens ficam indentados sob ela.
  - **Iniciativa com um item só** é renderizada como a **própria linha do item**, com o `code` em selo discreto. Não vira grupo — senão todo item do roadmap viraria uma pasta com um arquivo dentro.
  - Iniciativas sem categoria caem num grupo **virtual**, que tem rollup e recebe arraste, mas não tem renomear nem remover. No Gantt vira layer com o mesmo nome (B4). Rótulo a definir no passo 5; "Sem categoria" hoje.
- **Visão plana:** coluna Categoria como input de texto editável, aplicada à iniciativa.
- Campos editáveis inline: nome (texto), início/fim (date pickers), status/previsão (selects coloridos), % (número 0–100 com barra).
- Por linha: **enviar ao backlog** (↓) e **remover** (🗑).
- Rodapé: **+ Adicionar item ao roadmap** (o item nasce **sem datas** — ver §5.4 e §6.2; pede a iniciativa como no backlog) e **+ Nova categoria** (sempre visível; cria categoria e liga o agrupamento).

### 5.2 CRUD de categorias
Nos cabeçalhos, na visão agrupada:
- **Categoria:** ✎ renomear (propaga para as iniciativas dela), 🗑 remover (as iniciativas ficam sem categoria — **não são excluídas**).
- Nomes duplicados são rejeitados.
- Não há mais `+ nova subcategoria`: agrupar itens é papel da iniciativa (17/09/2026).

### 5.3 Drag & drop (HTML5)
- Alça ⠿ por linha. Arrastar permite:
  - **Reordenar** dentro da tabela (indicador na metade de cima/baixo da linha alvo).
  - **Mover item entre iniciativas:** soltar o item sobre a linha de uma iniciativa. O item herda a squad e a categoria do destino. É o mesmo gesto que antes movia item para subcategoria, no mesmo lugar da tela.
  - **Mover iniciativa entre categorias:** soltar a linha da iniciativa sobre um cabeçalho de categoria. Todos os itens dela seguem juntos.
  - **Juntar iniciativas:** soltar a linha de uma iniciativa sobre outra. Como a iniciativa de um item só é renderizada como a própria linha do item, soltar **essa** linha sobre outra iniciativa também junta as duas — por isso mover o último item de uma iniciativa nunca é recusado: vira fusão, que dá o mesmo resultado (18/09/2026, decidido na implementação).
- **Recusa** (17/09/2026), com a mensagem de §1.2: arrastar um **item** direto para uma categoria, porque a categoria é da iniciativa.
- **Remover o último item** de uma iniciativa remove também o card dela, com aviso (18/09/2026). Sem isso, não haveria como apagar pelo roadmap uma iniciativa de um item só.
- **Duas operações fora do arraste**, na linha da iniciativa e do item: **extrair item** (o item vira iniciativa própria, com card novo no Kanban, mantendo datas, status e progresso) e **juntar iniciativas** (duas viram uma; a de destino passa a exigir a entrega de todos os itens). São o caminho de ida e volta da regra "o que pode ser entregue em separado é iniciativa separada".

### 5.4 Backlog (fora do roadmap)
- Tabela separada por squad. Colunas: Item, Iniciativa, Observação. A categoria vem da iniciativa e não é editável aqui.
- **Equivale à coluna Backlog Priorizado do Kanban** (17/09/2026): mover o card para lá cria a entrada aqui, e promover ao roadmap manda o card para Execução. São o mesmo ato visto de dois lugares.
- Ações: **promover ao roadmap** (↑ — vira item **sem datas**: `s` = `e` = `""`, status `backlog`, previsão `nao`; a barra só aparece no Gantt quando o PM definir as datas — decisão de 07/09/2026, C9) e remover. O protótipo cria o item com início = fim = início do quarter; conserto após a reescrita.
- Rodapé: **+ Adicionar item ao backlog**. Como todo item precisa de iniciativa, o botão pede a iniciativa: ou escolhe uma existente da squad, ou cria uma nova, que nasce como card no Kanban em Backlog Priorizado, já com PM e TL padrão da squad (§7).
- **Não** aparece no Gantt nem nos KPIs.

---

## 6. Funcionalidades — Página Gantt/Roadmap

### 6.1 Estrutura visual
- Banda do **quarter** (topo, verde escuro).
- Banda de **mês** (Julho/Agosto/Setembro…) — derivada agrupando sprints contíguas pelo mês da data de início.
- Banda de **sprints**: `Sprint 01 … Sprint NN` (zero à esquerda) + intervalo de datas `dd/mm–dd/mm`. Coluna da sprint atual destacada.
- **Swimlanes por squad**; dentro de cada squad, se `groupByCat`, as **categorias viram layers** (faixas) e as **iniciativas com vários itens, sub-layers** — o lugar que era das subcategorias (17/09/2026). Squad sem categorias renderiza as iniciativas direto.
- A iniciativa com vários itens ganha uma **barra envelope**, mais clara, do menor início ao maior fim dos itens. Recolhida, mostra só o envelope; expandida, mostra os itens dentro. Iniciativa de um item só tem a barra do próprio item.
- Squads e layers são **colapsáveis** (clique no cabeçalho).
- **Linha verde vertical = hoje** (`new Date()` posicionado na timeline).
- **Legenda** de status e previsão no rodapé.
- **4 KPIs** no topo: itens no roadmap; em desenvolvimento (`st = dev`); em risco/atrasados (`pv ∈ {risco, atraso}`); **concluídos = `st = entregue`, exclusivamente**, com % sobre o total (decisão de 07/09/2026, C10 — o percentual do item é progresso, não conclusão). Contam **itens**, nunca a linha da iniciativa, e **excluem** arquivados e descartados (17/09/2026). O protótipo conta também `p ≥ 100`; conserto após a reescrita.

### 6.2 Posicionamento das barras — **por data exata**
- `timeline.min = quarter.start`; `timeline.max = start + days*count`.
- `left% = (item.start − min) / span`; `width% = (min(item.end+1, max) − max(item.start, min)) / span` (largura mínima ~2,2%).
- Item que **termina antes** da janela → chip `◀ antes do Qx` (não ocupa barra).
- Item que **começa antes** da janela → marcador `◀` de continuação, barra recortada no início.
- Item que começa depois da janela → não renderiza.
- Item **sem datas** (`s` ou `e` vazios) → não renderiza barra; a linha aparece na swimlane só com o nome. É o estado de todo item novo até o PM definir as datas (C9).
- Barra: cor = status; preenchimento interno = `%`; dot na ponta = previsão (se ≠ prazo/prod); tooltip com nome, datas, status, previsão, %.

### 6.3 Filtros
Chips: Todas as squads / Em risco/atrasado / Em desenvolvimento.

---

## 7. Funcionalidades — Config (Squads & Sprints)

- **Calendário do quarter:** rótulo, **data de início da Sprint 01**, **duração da sprint** em seletor `7 · 14 · 21 · 28` dias (1 a 4 semanas; default 14 — decisão C11, 09/09/2026; valor fora da lista num board antigo vira 14 em `normalize()`), **nº de sprints** (1–16). As sprints e datas são geradas a partir daí; preview das sprints exibido.
- **Quarters:** lista com ativo/arquivado; **rótulo editável inline**; ações Ativar, Arquivar/Desarquivar e **Excluir** (× — duas travas: só quarter sem nenhum item no roadmap, e nunca o quarter ativo; cada trava responde com mensagem, §1.2); **+ Novo quarter** (rótulo + início + nº de sprints; herda squads e categorias com itens vazios; numeração reinicia em Sprint 01).
- **Squads:** nome, cor, **prefixo** (único no quarter), **PM padrão** e **Tech Lead padrão** (texto; copiados para toda iniciativa nova da squad, e editáveis no card — 17/09/2026), toggle de categorias; **+ Adicionar squad**; **Arquivar/Desarquivar** e **Excluir** (só sem histórico em outros quarters), ambos travados enquanto houver itens no roadmap, no backlog ou iniciativas no Kanban — a mensagem nomeia o que impede (§3, "Squads: estrutura e prefixo").
- **Seletor de quarter** no header lista **todos** os quarters, com os arquivados em seção própria e marcados. Selecionar qualquer quarter que não seja o ativo muda só a **visualização de quem clicou**, em modo **somente leitura**, com banner "Quarter arquivado — somente leitura" (ou "Quarter não ativo — somente leitura"); não altera `data.activeQuarter` nem o que os outros PMs veem. O ativo aparece marcado "· ativo" no seletor. **Ativar**, aqui em Squads & sprints, é a única ação que muda o quarter ativo do board (decisão de 07/09/2026, C7). Implica separar "quarter ativo" (compartilhado) de "quarter em visualização" (local) — invariante em §3.
- **Arquivados** (17/09/2026): seção própria listando iniciativas e itens fora de circulação (§4.3), com de onde vieram, a `nota` do arquivamento ou descarte e o botão **Retomar**. Retomar devolve a iniciativa ao Backlog Priorizado da squad original ou de outra: os itens voltam para o **backlog do roadmap**, não para o Gantt, porque o que foi despriorizado é replanejado (18/09/2026). O estado em que pararam vira a observação do item no backlog ("estava em Em desenvolvimento · 40%"), para o PM não perder o contexto ao repriorizar.

---

## 8. Import / Export

- **Importar planilha (.xlsx):** parser **header-aware** no cliente (SheetJS). Para cada aba: acha a linha de cabeçalho que contém "Item", mapeia colunas por nome (`Item`, `Pilar`/`Categoria`, `Início`, `Fim`, `Status`, `Previsão`, `% Conclusão`), lê até a primeira linha em branco (1º bloco da aba). Traduz status/previsão por regex, extrai % e datas. Desde 17/09/2026, como todo item precisa de iniciativa, **cada linha importada vira uma iniciativa de um item**, e `Pilar` vira a **categoria dessa iniciativa** — a mesma regra da migração de arquivos antigos (`docs/decisions.md`, 17/09/2026). Cada aba vira uma squad. **Comportamento atual: substitui todas as squads do quarter ativo.** A intenção original é carga inicial a partir da planilha, e o comportamento desejado é **aditivo** — adicionar itens ao roadmap, não substituir; o redesenho fica como evolução pós-validação (§11). Proteção mínima enquanto isso (após a reescrita): confirmação antes de substituir, nomeando o que será perdido — "Substituir o quarter {rótulo} ({N} squads, {M} itens)? Salve antes se quiser voltar." (decisão de 07/09/2026, A11 + B2).
- **Backup ↓:** baixa o `data` completo como JSON.
- **Carregar ↑:** carrega JSON de backup, **substitui o board inteiro** e **republica** no servidor (quando §9 existir). Confirmação antes de substituir: "Substituir o board inteiro ({N} quarters, {M} itens)? Salve antes se quiser voltar."
- **PDF:** `window.print()` com CSS de impressão que mostra só o Gantt (esconde sidebar/header/filtros).

---

## 9. Persistência & sincronização (multiusuário)

### 9.1 Contrato da API (`/api/board`)
| Método | Request | Response |
|---|---|---|
| `GET` | — | `{ data, version, updatedAt }` (ou `{ data: null, version: 0 }` se vazio) |
| `PUT`/`POST` | `{ data, baseVersion }` | `200 { version, updatedAt }` ou **`409 { current }`** se `baseVersion` obsoleto |

- Storage: Supabase (Postgres), tabela `board` com uma linha por board (`id = 'roadmap-v1'`): `version` inteiro, `data` jsonb, `updated_at`. `version` incrementa a cada escrita. A escrita é **condicional** (`update … where id = … and version = baseVersion`): se não afetar nenhuma linha, a função devolve `409 { current }` com a versão atual — é isso que detecta dois PMs editando ao mesmo tempo.
- A função acessa o Supabase pela API REST (PostgREST) com a chave de serviço, via `fetch` nativo — sem SDK, zero dependências. A chave nunca chega ao navegador.
- Envs reconhecidas: `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`. Sem elas → fallback em memória (efêmero, só desenvolvimento local).

### 9.2 Comportamento do cliente
- **Load:** `GET` no início; se o servidor estiver vazio, publica o seed (versão 1). Offline → usa o seed em memória (app 100% usável).
- **Autosave:** a cada 4s, se o snapshot mudou desde o último salvo, faz `PUT` com `baseVersion = versão carregada`.
- **Refresh:** a cada 15s, se **não** houver edição local pendente, busca o servidor e recarrega se a versão for maior (pega mudanças de outros PMs).
- **beforeunload:** `navigator.sendBeacon` faz um último flush se houver pendências.
- **Conflito (409):** dois editando ao mesmo tempo → confirm perguntando manter as suas (sobrescreve) ou recarregar a do servidor (last-write-wins com confirmação). Aceitável para o grupo pequeno na validação; substituível por edição por-item quando virar multiusuário sério.
- Indicador no header: "Salvando…" / "Salvo · HH:MM" / "Sem conexão" / "Conflito…" / "Erro no servidor".
- **Erro do servidor:** além do indicador, uma faixa abaixo do header diz que as alterações não estão sendo salvas, aponta a causa provável (tabela ausente, chave sem permissão, endereço inacessível) e mostra o detalhe técnico devolvido pela função — o erro tem de ser legível na tela, não só no tooltip.

---

## 10. Deploy & processo de atualização

### Deploy inicial (Vercel)
1. Repositório Git com os arquivos.
2. Import na Vercel como projeto **Other** (sem build).
3. **Supabase:** criar projeto, criar a tabela `board` (SQL no `README.md`), copiar URL e chave de serviço para as variáveis de ambiente do projeto na Vercel (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
4. Deploy. Primeira abertura publica o seed.
5. (Opcional) domínio `roadmap.cakto.com.br`.
6. **Senha compartilhada** (gate desta fase sem login): variável `APP_PASSWORD` no projeto da Vercel. `api/board.js` exige a senha em toda chamada (header `X-App-Password`, ou campo `senha` no corpo — o caminho do `sendBeacon`); o cliente pede a senha numa tela própria e a guarda no navegador. Substitui o *Deployment Protection → Password* da Vercel, que é recurso do plano Pro (decisão de 09/09/2026). Consequência: a página estática é pública para quem tem a URL; os dados, não.

### Atualização com produção no ar
- **Git push = deploy automático, atômico, sem downtime.** Código e dados são separados: melhorias de interface **não tocam nos dados**.
- Fluxo recomendado: branch → push (gera **URL de preview** isolada) → validar → merge na `main` → produção.
- **Rollback:** Vercel → Deployments → Promote to Production numa versão anterior (segundos).
- **Migração de dados:** mudança que só **adiciona** campo é retrocompatível (`normalize()` cobre e regrava). Renomear/remover exige um passo de migração na linha da tabela `board`. Sempre **Backup ↓** antes de mexer no formato.

---

## 11. Evolução planejada (fases futuras)

Fora do escopo atual (validação sem auth), já mapeado:

1. **Autenticação Google restrita ao domínio Cakto** (Auth.js/NextAuth) — implica migrar o front para **Next.js**. Validação do claim de domínio **no servidor** (restrição só no cliente é burlável).
2. **RBAC — perfis:**
   - **Admin:** acesso total, incluindo gestão de pessoas.
   - **Manager:** edita o painel de itens; **não** adiciona/remove pessoas.
   - **Viewer:** apenas visualiza.
   - Autorização aplicada **no servidor**, não só escondendo botões.
3. **Modelo relacional no Postgres** (Supabase/Neon) quando o formato estabilizar. A hierarquia atual mapeia direto: `quarters`, `squads`, `categories`, `initiatives`, `items`, `backlog_items`, `users`, `audit_log`.
4. **Audit log** (quem alterou o quê e quando) — recomendado ao sair da validação.
5. Concorrência fina (edição por item, sem last-write-wins) quando houver muitos editores simultâneos.
6. **Importar em modo aditivo** — Importar planilha adiciona itens ao roadmap em vez de substituir o quarter (decisão de 07/09/2026; ver §8).
7. **Reordenar squads e quarters** pela interface (`divergences.md`, B9).
8. **Cadastro de pessoas** (17/09/2026): PMs e Tech Leads cadastrados na plataforma e associados às squads, substituindo o texto livre de `pm`/`tl`; uma squad pode ter mais de um TL de apoio, com um deles como padrão. O passo 4b entrega só o mínimo — PM e TL padrão por squad, como texto (§7) — porque empilhar uma entidade nova e uma tela de cadastro sobre a remodelagem do vínculo dobraria o tamanho do passo. Converge com o item 2 (perfis).

Storage definitivo: **Postgres (Supabase)**, decidido em 09/09/2026 (§2.1). A passagem de documento (`data jsonb`) para tabelas relacionais é o item 3 acima, e depende do modelo do 4b.

Convenções default assumidas (fáceis de trocar): rollup por **média simples**; barra colorida por **status**.

---

## 12. Dívida de design

O código exportado do Claude Design foi construído com a paleta anterior (`#3FC958` Pulso, `#3E9337` Jade, `#1E1E1E` Âncora, `#F7F7F7` Névoa), Inter e layout Minimals light. O padrão vigente é a **`cakto-design` v2.0** (§0.2). A migração visual é uma tarefa própria no Claude Code, **depois** da refatoração estrutural (§2.2) e da conciliação (§0.3), nesta ordem:

1. Trocar Inter por Public Sans e linkar `tokens.css`
2. Substituir hex por tokens em `app.css` e nos enums de `data.js` (§4)
3. Aplicar shell dark (gradiente), sidebar e header conforme a skill
4. Validar Gantt e tabela contra `components.md` (Table, Chip, ProgressBar, Tooltip)
5. Adicionar toggle de tema (light derivado é opt-in)

Nenhum passo altera comportamento — só apresentação. Screenshot antes/depois de cada view para validação.

---

## Anexo A — Trilha paralela: board Kanban de intake (em design; existe no protótipo como quarta view)

Mesmo projeto, interface distinta, definida em 02/09/2026. É a **quarta view** do protótipo (ver `docs/divergences.md`, A1), mas **não é descrita nesta spec** — a fonte é `docs/decisions.md`. Fonte complementar: o artifact "Card do Roadmap Cakto", a exportar para `docs/kanban-card-spec.md`.

### A.1 Vínculo Iniciativa → Roadmap — **fechado em 17/09/2026**

Três hipóteses foram registradas e testadas em cima de um caso concreto (o programa de parceiros da Platform, com dois itens). Venceu a H3, na forma detalhada ao fim desta seção.

**H1 — Associação polimórfica.** A iniciativa carrega `vinculo: { tipo: 'categoria' | 'item' | null, id }`. No Backlog do Kanban é `null` (coerente com a regra de campos ausentes por estágio). Ao ser priorizada, aponta para uma categoria existente (iniciativa grande) ou para um item (iniciativa pequena). A iniciativa e o objeto do roadmap coexistem.

**H2 — Materialização.** A iniciativa não se associa — ela *se transforma* ao sair do Backlog. Grande → gera uma categoria (itens a detalhar pelo PM); pequena → gera um item sob categoria existente. O Kanban é a fase pré-roadmap; o gate Backlog → Priorizado é onde a intenção vira estrutura. A granularidade é decidida pelo PM na priorização, não imposta pelo modelo.

**H3 — Unificação** (**escolhida**; 04/09/2026, confirmada em 07/09/2026, fechada em 17/09/2026; ver `docs/kanban-card-spec.md` §1.1 e §4). Iniciativa e item são **a mesma entidade em estágios de vida distintos**. Kanban e roadmap são duas portas de entrada — a de negócio (intake) e a técnica (planejamento por sprint) — e duas vistas sobre o mesmo dado. Priorizar é ganhar squad e período e, com isso, entrar no Gantt. **Status: escolhida e fechada em 17/09/2026**; §3 passa a descrever este modelo. H1 e H2 ficam registradas como alternativas descartadas.

**Como foi decidida.** O critério registrado era esperar o uso real de uma ponte mínima "Promover ao roadmap" e ver se os PMs sentiriam falta da sincronização. Foi dispensado em 17/09/2026: o GPM percorreu o ciclo inteiro de uma iniciativa concreta, do intake à entrega, e a sincronização entre card e item apareceu como requisito explícito antes de a ponte existir. O que o experimento testaria já estava respondido.

**H3 fechada — 1 iniciativa = N itens (17/09/2026, GPM).** A definição de trabalho de 09/09 ("1 iniciativa = 1 item, com sub-itens") foi **superada**: não há sub-item nem quarto nível. O modelo é:

1. **Uma iniciativa agrupa um ou mais itens** e só está concluída quando **todos** estiverem entregues. É essa exigência que a distingue de duas iniciativas na mesma categoria, que se entregam de forma independente.
2. **Todo item pertence a uma iniciativa.** Não existe item avulso. Itens pequenos e soltos se agrupam numa iniciativa guarda-chuva.
3. **A categoria é da iniciativa**, e é sempre opcional. Categoria agrupa iniciativas; iniciativa agrupa itens. Sobram três níveis, os mesmos de antes, com a subcategoria substituída pela iniciativa.
4. **A criação vale nos dois sentidos.** Criar no Kanban e priorizar cria o item; criar no roadmap cria o card. Um item a mais numa iniciativa existente não cria card nenhum.
5. **Quatro movimentos:** mover iniciativa entre squads (leva os itens; `code` imutável), mover iniciativa entre categorias, mover item entre iniciativas, e o par **extrair item / juntar iniciativas**, que dá ida e volta para a regra "o que pode ser entregue em separado é iniciativa separada".
6. **Saída de circulação em dois modos**, sem virar status: arquivado (perdeu prioridade, retomável) e descartado (§4.3), com `nota` livre e, no descarte, o motivo em lista que já existia.

Os pontos que estavam em aberto foram respondidos assim: a **iniciativa absorve** o item como filho, e não o contrário — `items[]` continua em `quarter → squad` e ganha `ini`; a **coluna do Kanban é derivada** do estado dos itens em Execução e Concluído, e humana em Iniciativas, Backlog Priorizado e Descartado; os **dois "Backlog" viraram um**, com a coluna renomeada para Backlog Priorizado; a **conclusão derivada** convive com C10 porque os KPIs contam itens, nunca a linha da iniciativa.

Isso adota parcialmente `docs/kanban-card-spec.md` §4: fica o princípio de fonte única e de campos derivados; **descarta-se** o `cards{}` como dicionário-raiz, porque manter `items[]` onde está preserva o Gantt, o arraste e o `normalize()` já validados.

**Restrição do modelo atual que pesa nas três:** categorias vivem em `quarter → squad` e são **copiadas** ao criar novo quarter (§7). "Assinatura" no Q3 e "Assinatura" no Q4 são objetos distintos com o mesmo nome. Um vínculo por categoria que precise sobreviver à troca de quarter exige que a categoria suba um nível (existir fora do quarter, com o quarter apenas referenciando). Isso valia para H1, H2 e H3. **Resolvido em 17/09/2026:** a categoria continua morando em `quarter → squad`, e a iniciativa guarda o **nome** dela, não uma referência — do mesmo jeito que os itens já faziam. Ao trocar de quarter, a categoria é reencontrada pelo nome; se não existir no destino, a iniciativa fica sem categoria, com aviso (§1.2). A categoria **não** sobe de nível.

### A.2 Resumo das decisões do Kanban

- **Board de entrada de iniciativas** (não de execução). Cards criados só na 1ª coluna.
- **Colunas fixas** (07/09/2026; renomeadas em 17/09/2026): `Iniciativas · Backlog Priorizado · Execução · Concluído · Descartado`, identificadas por `role` (`entrada` / `fluxo` / `execucao` / `concluido` / `descartado`), **não editáveis em runtime**. As chaves são `iniciativas · priorizado · execucao · concluido · descartado`; a primeira deixou de se chamar `backlog` para acabar com os dois backlogs de mesmo nome, e nenhuma chave foi reaproveitada para outra coluna. Não existe chave `kcols` no modelo. O protótipo atual permite renomear, criar e remover colunas (`divergences.md`, A3) — isso sai no passo 3. Racional: o board consolidado das seis squads só funciona com colunas iguais para todas.
- Card em Iniciativas legitimamente **sem** PM/Tech Lead/squad/período — obrigatoriedade é **condição de passagem** entre colunas, não propriedade do card. Desde 17/09/2026 o gate se resolve quase sozinho: ao ganhar squad, o card herda o PM e o TL padrão dela (§7). Campo ausente por estágio **não** renderiza (sem placeholder/tracejado).
- **Gate de saída de Iniciativas:** 6 campos (`squad · pm · tech_lead · tipo · estimativa · periodo`); recusa nomeia o campo faltante. Com PM e TL padrão por squad (§7, 17/09/2026), na prática sobram tipo, estimativa e período.
- **Estados por 6 eixos independentes**, cada um com canal visual exclusivo (ciclo de vida, saúde temporal, impedimento, idade no backlog, interação).
- **Card aging invertido** (iniciativa esquecida fica mais visível; faixas 14/45 dias, âmbar).
- **Descartado com motivo obrigatório** (enum de 5 motivos).
- **Filtros do board:** chips "Board geral" · "Sem squad" · um chip por squad do quarter ativo (dot na cor da squad). Filtram os cards exibidos; não persistem no documento.
- Frente do card: ~10 elementos máx (ID legível `GROW-142`, título, chip de squad, tipo, prioridade enum, estimativa t-shirt, avatares PM+TL, badge de período, ícone de dependência, barra de progresso).
- Pendências: spec do verso do card; spec da coluna (WIP, contadores). (`periodo` já existe no modelo como `perQ`/`perM` — §3.)

Convergência entre as duas trilhas: ver A.1.

---

## Anexo B — Insumos da migração para o Claude Code

Arquivos que entram na pasta `roadmap/` no primeiro commit:

| Arquivo | Origem | Destino |
|---|---|---|
| Export do projeto (project archive do Claude Design) | Claude Design, 04/09/2026 | raiz → refatorar para `index.html` + `css/` + `js/` (§2.2) |
| `api/board.js`, `package.json`, `README.md` | pacote de deploy desenhado anteriormente, se disponível; senão, gerar a partir de §9–§10 | `api/`, raiz |
| `cakto-design` v2.0: `SKILL.md`, `components.md`, `tokens.css` | chat de consolidação do DS | `skills/cakto-design/` |
| `cakto-context` `SKILL.md` | Claude.ai | `skills/cakto-context/` |
| Decisões do Kanban + `erratas.md` | projeto Roadmap + chat do DS | `docs/decisions.md` (erratas aplicadas no Code) |
| Artifact "Card do Roadmap Cakto" | projeto Roadmap | `docs/kanban-card-spec.md` |

Histórico anterior a esta migração (`roadmap-cakto-q3` v1, `-v2`, `-v3`) fica no Claude Design como referência; não entra no repositório.
