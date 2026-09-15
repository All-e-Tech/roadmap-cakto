# Decisões — quadro Kanban de entrada de iniciativas

Registro das decisões tomadas em 02/09/2026 na definição do card. A spec completa do card vive em `kanban-card-spec.md` (export do artifact "Card do Roadmap Cakto"); este doc guarda só as decisões e o porquê.

> **Terminologia:** alinhada ao glossário da `SPEC.md` (§0.1) — **iniciativa**, nunca "demanda". Erratas de `erratas.md` (terminologia e paleta v2.0) aplicadas em 07/09/2026.

## Natureza do board

O quadro é **board de entrada de iniciativas**, não board de execução de squad. Cards são criados exclusivamente na primeira coluna.

**Colunas:** `Backlog → Priorizado → Execução → Concluído`, mais `Descartado` como terminal fora do fluxo.

## Consequência central

Card criado no Backlog legitimamente **não tem** PM, Tech Lead, às vezes nem squad, nem período. A associação acontece na priorização, ao mover para Priorizado.

Isso derrubou duas premissas iniciais:

1. `pm` e `tech_lead` não são obrigatórios do card — obrigatoriedade é **condição de passagem entre colunas**, nunca propriedade do objeto.
2. O estado "Triagem" com borda tracejada foi descartado. Tracejado comunica "provisório/inválido", e um card de Backlog é definitivo — só tem menos campos. Substituído pelo estado **Entrada**, com superfície idêntica a qualquer card.

**Regra que governa toda a spec:** campo ausente por estágio nunca deve parecer campo faltando. Sem placeholder, sem "—", sem tracejado. O elemento não renderiza.

## Gate de saída do Backlog

Card só sai do Backlog com os seis campos: `squad · pm · tech_lead · tipo · estimativa · periodo`.

Recusa de drop nomeia o campo, não a regra: *"Faltam para Priorizado: Tech Lead · período"*.

Consequência de projeto: o Backlog é a **única** coluna com cards esparsos. De Priorizado em diante todo card tem os dez elementos, exceto dependência e progresso, que são condicionais por natureza.

## Modelo de estados por eixos

Estados não são lista — são seis eixos independentes, cada um dono de um canal visual exclusivo. É isso que permite bloqueado + atrasado + selecionado no mesmo card sem disputa de pixel.

| Canal | Eixo dono |
|---|---|
| Presença de elementos · título · barra de progresso | ciclo de vida |
| Cor do chip de período | saúde temporal |
| Filete de topo 3 px | impedimento |
| Contador mono no rodapé | idade no Backlog |
| Anel de contorno · sombra · rotação | interação |

Combinações com regra explícita: bloqueado + em risco → só o filete; bloqueado + atrasado → ambos; bloqueado + descartado → só descartado; concluído + atrasado → concluído ganha.

## Idade no Backlog

Adotado, invertendo o card aging do Trello. O Trello desbota o card antigo; num board de intake isso é o inverso do desejado — iniciativa esquecida precisa ficar mais visível. O card mantém contraste e o **contador ganha peso**. Faixas em 14 e 45 dias, calibradas para ciclo de priorização quinzenal (se o ritual virar mensal, os números certos são 30 e 90). Âmbar, não vermelho: card velho é sinal de atenção, não erro.

## Descartado

Estado terminal com **motivo obrigatório**: duplicado · fora de estratégia · sem viabilidade técnica · resolvido por outro card · sem impacto suficiente. Sem o motivo registrado, iniciativa recusada volta pela porta da frente em três meses.

## Erratas da spec 01 (falhas nossas, já corrigidas)

- `largura 320px (fixo)` estava errado — é largura de **referência**. Card fluido com `max-width:320px`, coluna em `minmax(272px,1fr)`. Travar em largura fixa força scroll horizontal no board consolidado das seis squads, que é o caso de uso principal do GPM.
- Faltavam equivalentes de tema escuro para prioridade. Na paleta v1.0, P2 e a barra de progresso compartilhavam `--veludo` (`#476D47` claro → `#9BB79B` escuro, porque `#476D47` sobre `#1E1E1E` rende contraste 2,2:1).
  > **Errata aplicada (07/09, conforme `erratas.md` §1 e §4):** `--veludo` não existe na v2.0. Barra de progresso → `--primary` (`#0F7865`); prioridade P2 → `--text-secondary` (`#919EAB`) — prioridade é **monocromática**, só P0 leva cor (`kanban-card-spec.md` §3.3, que supera a linha "Veludo → acento `--green-light`" de `erratas.md`); separadores de coluna → `--line` (`#2C2C2C`); superfície do card → `--paper` (`#1A1A1A`), não `#1E1E1E`. Os tokens da v2.0 já têm par dark/light, então o ajuste manual de contraste deixa de existir.
- Chip de tipo não leva ícone (glifo de 11px ao lado de texto de 11px não acrescenta leitura). Cadeado e check são os **únicos** ícones obrigatórios — são varridos, não lidos.
- Controles de edição (engrenagem, fechar, arraste) são chrome de interface, não contam no limite de dez elementos, e precisam de `:focus-visible` além de `:hover`.

## Vínculo com o roadmap — em aberto

Duas hipóteses registradas na `SPEC.md`, Anexo A.1: associação polimórfica (H1) ou materialização ao sair do Backlog (H2). Restrição a considerar em ambas: categorias do roadmap vivem por quarter e são copiadas ao criar novo quarter. Decidir testando no protótipo; não tocar no modelo antes.

> Atualização 07/09/2026: há uma terceira hipótese, H3, preferida — ver a seção "Vínculo Iniciativa → Roadmap" no fim deste documento.

## Pendências

- Spec do **verso** do card (blocos por tipo, relações, histórico) — não iniciada
- Spec da **coluna** (cabeçalho, WIP limit, contadores, agrupamento por squad) — não iniciada

---

## Camada de renderização (07/09/2026)

Decisão fora da trilha do Kanban, registrada aqui por ser o documento de decisões do projeto. Contexto em `docs/divergences.md`, item B7.

**Decisão:** a camada de renderização da ferramenta é **Preact + htm, carregados via CDN, sem build**. A lógica de negócio (`data.js`, `io.js`, `sync.js`) fica em módulos sem nenhuma dependência de Preact.

**Racional:** a conciliação mostrou que o export do Claude Design não é HTML/JS solto — é um componente do editor, com template próprio, estado e refs. A reescrita da renderização é inevitável de qualquer forma. O que protege o projeto é **"sem build"** (editável no Claude Code, publicável em qualquer host estático, sem toolchain para o GPM manter), não "sem framework". Edição inline na tabela e drag & drop na tabela e no Kanban tornam o redesenho manual do DOM a parte mais arriscada de uma versão vanilla pura. E como o export já tem estrutura de componentes com estado e refs, a migração vira tradução, não reinvenção.

**Alternativas rejeitadas:**

- **Vanilla puro** (renderização manual do DOM). Rejeitada porque a ferramenta é quase toda re-renderização reativa: cada edição inline, cada arrastar, cada troca de filtro redesenha tabela ou board. Fazer isso à mão exige uma camada própria de reconciliação — que é justamente o que Preact já é, testado, em 4 kB. O risco de bugs de estado (linha que não atualiza, arraste que perde a referência) recairia sobre quem menos tem experiência para depurá-los.
- **React via CDN.** Rejeitada porque entrega a mesma API que Preact com dez vezes o peso, e sem build continuaria precisando de htm (ou `createElement` à mão) do mesmo jeito. Não há ganho que justifique a diferença para uma ferramenta interna de seis squads.
- **Runtime do Claude Design como vendor** (`support.js` + `_ds_bundle.js`, trazidos para o repositório). Rejeitada porque não é um runtime distribuído nem documentado: sem versão, sem garantia de evolução, sem comunidade para consultar. Travaria o produto num motor de editor que não foi feito para ser hospedado sozinho.

**O que muda para quem usa:** nada visível. É o passo 3 do `CLAUDE.md` — zero mudança de comportamento, validada abrindo as quatro views no browser antes e depois.

---

## Kanban no modelo de dados (07/09/2026)

Contexto: `docs/divergences.md`, itens A1, A2, A3, A4 e C6. A conciliação mostrou que o Kanban já existe no protótipo, mas fora do modelo formal da `SPEC.md`.

**Decisão 1 — o Kanban entra no modelo formal.** O objeto `data` (SPEC §3) ganha a chave de topo `iniciativas`, com a estrutura completa do card. Consequência: o JSON que sai pelo botão Salvar passa a ser contrato também para o Kanban, e o backend (passo 4) o persiste junto com o roadmap.

**Decisão 2 — a chave se chama `iniciativas`, não `demandas`.** Segue o glossário (§0.1). O código atual grava `demandas`; a migração acontece no passo 3, com `normalize()` lendo a chave antiga e gravando a nova — quem abrir um JSON salvo hoje não perde nada.

**Decisão 3 — anexo é link.** `anexoNome` e `anexoConteudo` saem do modelo. Guardar um arquivo HTML inteiro dentro do board incha o JSON a cada anexo e compromete o autosave de §9; `link` já cobre o caso (protótipo navegável, documento externo).

**Decisão 4 — colunas fixas.** `Backlog · Priorizado · Execução · Concluído · Descartado`, identificadas por `role` (`entrada` / `fluxo` / `execucao` / `concluido` / `descartado`), não editáveis em runtime. `kcols` não entra no modelo; a edição de colunas do protótipo sai no passo 3. Racional: o board consolidado das seis squads — o caso de uso principal do GPM — só funciona com colunas iguais para todas. Uma squad que renomeia "Priorizado" quebra a leitura do board geral.

**Pendências para o passo 6:**

- `anexoConteudo` existe nos boards salvos hoje. Definir o destino desse conteúdo na migração (a opção simples é descartar e avisar no toast; a alternativa é exigir que o PM cole um link antes de perder o anexo).
- `subsTotal`/`subsDone` estão no modelo e no card, mas nenhum campo do modal os preenche — a barra de progresso nunca aparece. Decidir a interface ou remover os campos.

---

## Vínculo Iniciativa → Roadmap (04/09/2026, confirmada em 07/09/2026)

**Decisão:** a hipótese de trabalho preferida é **H3 — unificação**. Iniciativa e item são a mesma entidade em estágios de vida distintos. Kanban e roadmap são duas portas de entrada — a de negócio (intake) e a técnica (planejamento por sprint) — e duas vistas sobre o mesmo dado. Priorizar é ganhar squad e período e, com isso, entrar no Gantt. Registrada na `SPEC.md` A.1 como H3; detalhamento em `kanban-card-spec.md` §1.1 e §4.

**Status: hipótese preferida, não validada.** O modelo (`SPEC.md` §3) não muda até a validação. H1 e H2 permanecem como alternativas.

**Racional:** uma entidade com duas vistas elimina a possibilidade de o Kanban e o Gantt divergirem — hoje o PM teria que manter o card e o item à mão, e a primeira vez que os dois discordarem a ferramenta perde a confiança. Mas isso é uma aposta sobre como os PMs vão usar as duas telas, não um fato; por isso valida antes de virar modelo.

**Validação:** depois do backend, ponte mínima "Promover ao roadmap" — card priorizado → cria item de roadmap, com referência gravada nos dois lados (passo 4b do `CLAUDE.md`). H3 valida se, em uso real, os PMs esperarem sincronização entre card e item e a ausência dela for percebida como falha. Se ninguém sentir falta, H1 ou H2 bastam e são mais simples.

**Pendências para o passo 6:**

- Reconciliar os dois modelos de card: `cards{}` de `kanban-card-spec.md` §4.2 (dicionário por ID, `periodo` em números de sprint, `sub_itens`, `historico`, `comentarios`) e `iniciativas[]` de `SPEC.md` §3 (o modelo do código). Um dos dois vence; até lá, §3 é o contrato.
- Filete de bloqueio: 2px em `kanban-card-spec.md` §3.3 e §5.5, 3px na seção "Modelo de estados por eixos" deste documento.
- "Modelo compartilhado" e "agrupamento alternável" (`kanban-card-spec.md` §1, itens 1 e 2) são decisões de 04/09 sem registro aqui — registrar com racional.

---

## Decisões de produto — balde 2 (07/09/2026)

Contexto: `docs/divergences.md`, itens A11, B2, B9, C5, C7, C8, C9 e C10. Nada de código agora; tudo "executar após a reescrita (passo 3)", salvo indicação.

**A11 + B2 — Importar e Carregar.** A intenção original do Importar é carga inicial a partir da planilha atual; o comportamento desejado é **aditivo** — adicionar itens ao roadmap, não substituir o quarter. O redesenho para modo aditivo fica como evolução pós-validação (`SPEC.md` §11). Proteção mínima enquanto isso: Importar e Carregar pedem confirmação nomeando o que será perdido — "Substituir o quarter {rótulo} ({N} squads, {M} itens)? Salve antes se quiser voltar." Racional: hoje um clique errado apaga o quarter sem aviso, e a única volta é um JSON salvo antes.

**C5 — Nomes das views.** Travados nos dois lados: **Roadmap · Visão geral (Gantt) · Kanban de iniciativas · Squads & sprints**. "Quadro Principal", "Inserção de Dados" e "Demandas" saem de spec e código. Documento agora; código no passo 3.

**C7 — Quarters arquivados.** O seletor do header lista todos os quarters, arquivados em seção própria e marcados. Selecionar um arquivado muda só a visualização de quem clicou, em somente leitura, com banner "Quarter arquivado — somente leitura". "Ativar" segue em Squads & sprints como única ação que muda o estado compartilhado. Implica separar "quarter ativo do board" (`data.activeQuarter`) de "quarter em visualização" (estado local, não persiste). Racional: consultar um quarter encerrado não pode alterar o board de todo mundo.

**C8 — Squads canônicas.** Cinco: **Payment (PAY) · Platform (PLA) · Cakto Members (MEM) · Bank & App (BNK) · MRR & Fiscal (MRR)**. Growth e Partnership não existem mais. "Cakto Bank" é sinônimo de "Bank & App", migrado por `normalize()`. Squad fora da lista recebe prefixo das três primeiras letras e aviso. Atualizados: `SPEC.md` §1 e §3, `CLAUDE.md`. Pendente: seed do código (passo 3). A skill `cakto-context` (v1.1, seção 7) já traz a lista canônica com os mesmos prefixos.

**C9 — Item novo sem datas.** Item promovido do backlog ou adicionado ao roadmap nasce com `s` e `e` vazios; sem barra no Gantt até o PM definir. Racional: a barra de um dia colada na borda do quarter parecia item real e era ruído.

**C10 — Concluído no KPI.** Concluído = status `entregue`, exclusivamente. Percentual é progresso, não conclusão. Racional: o KPI não pode ser maior que o número de itens verdes no Gantt sem nada na tela explicando.

**B9 — Reordenar squads e quarters.** Aceito como lacuna; evolução pós-validação (`SPEC.md` §11).

---

## Squads: sem lista fechada (09/09/2026 — revisa C8)

**Decisão:** não existe lista canônica de squads. Todas se comportam igual; qualquer pessoa cria, edita, arquiva ou exclui (perfis e permissões vêm depois). Substitui a decisão C8 de 07/09 (cinco squads fixas) e a seção "Squads canônicas" da `SPEC.md` §3, agora "Squads: estrutura e prefixo".

**Regras:**

- **Prefixo é propriedade da squad** (`squad.prefix`), editável na Config ao lado do nome. Default ao criar: três primeiras letras do nome, maiúsculas, único entre as squads do quarter (`PAY`, `PAY2`…). Renomear não altera o prefixo. `normalize()` preenche em squads que não o tenham.
- **O `code` da iniciativa é imutável.** Mover uma iniciativa de squad atualiza a tag e a cor do card, não o código — conforme `kanban-card-spec.md` §4.5.
- **Squads vivem por quarter.** Renomear vale do quarter em questão em diante; quarters anteriores guardam o histórico.
- **Arquivar** (por quarter): a squad deixa de existir naquele quarter — sai das abas, do Gantt e do Kanban — e o histórico anterior permanece. É o caminho para "a squad deixou de existir".
- **Excluir**: só para squad sem histórico em outros quarters — o caso da squad criada por engano.
- **Trava comum a arquivar e excluir:** sem itens no roadmap, sem itens no backlog, sem iniciativas no Kanban (`iniciativa.sq`). Os itens e iniciativas devem ser remanejados antes; a recusa nomeia o que impede, no padrão dos toasts.
- **Kanban reflete a estrutura de squads do quarter** (chips e destino só com squads não arquivadas); iniciativa movida de squad tem tag e cor atualizadas.

**Racional:** lista fixa em código obriga um deploy para criar uma squad e trata como "fora da lista" qualquer reorganização — e squads mudam. Com prefixo e arquivamento por squad, a estrutura acompanha a empresa sem tocar em código. **Mudança de modelo:** dois campos novos por squad (`prefix`, `archived`); `normalize()` migra ao carregar.

---

## Vínculo Iniciativa → Roadmap — definição de trabalho (09/09/2026)

Registrada em `SPEC.md` A.1 como **H3 refinada**. Vale para a modelagem do passo 4b; §3 não muda até lá.

1. **1 iniciativa = 1 item no roadmap** (abaixo de uma categoria ou não).
2. Esse item/iniciativa pode ter **sub-itens** no roadmap.
3. Iniciativa com sub-itens só está **concluída quando todos os sub-itens estiverem** concluídos.
4. É possível **mover um sub-item entre iniciativas**.

**Encaminhamento (acordado em 09/09/2026):** (a) registro agora, sem código; (b) 3a e 3b do Kanban seguem com o modelo atual (`iniciativas[]`, colunas fixas), porque a validação lado a lado depende do protótipo, que tem duas estruturas; (c) a modelagem vem **depois do backend** (passo 4b) — `normalize()` migra ao carregar e o storage é documento, então não há custo em persistir o modelo atual até lá. Os seis pontos a resolver estão em A.1; a `kanban-card-spec.md` §4 é a proposta de partida, a adotar ou descartar explicitamente.

---

## Storage e hospedagem (09/09/2026 — fecha SPEC §2.1)

**Decisão:** **Vercel + Supabase (Postgres)**. Uma tabela `board` (`id`, `version`, `data jsonb`, `updated_at`), uma linha por board; `api/board.js` com adaptador para Supabase pela API REST, sem SDK; contrato de §9 mantido (`GET → { data, version, updatedAt }`; `PUT { data, baseVersion } → 200 | 409 { current }`).

**Racional:** o dado é um documento e vai continuar sendo até a remodelagem do 4b — guardar um JSON numa coluna `jsonb` custa o mesmo que num chave-valor. Supabase cobre o passo seguinte (autenticação Google restrita ao domínio, §11) e o relacional no mesmo banco quando o modelo estabilizar: uma ferramenta a menos ao longo do tempo. Descartadas: Upstash Redis (mais simples hoje, mas não evolui para relacional nem para auth) e Supabase completo (hospedagem estática menos madura que a Vercel).

**Consequência para quem usa:** o board passa a ser um só, compartilhado — o que um PM salva, os outros veem em até 15 s; duas edições simultâneas na mesma versão são detectadas (409) e resolvidas com confirmação, conforme §9.2. O JSON no navegador deixa de ser a fonte da verdade e vira cache.
