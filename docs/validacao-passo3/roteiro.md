# Roteiro de validação — passo 3a (tradução fiel)

> Referência do Claude para a validação lado a lado (decisão de 09/09/2026: a validação detalhada é do Claude, antes de entregar cada view; o GPM faz só um teste de fumaça por view). Duas janelas: o protótipo no Claude Design (referência) e o app novo no navegador. Tudo aqui é comportamento observável — o que se vê e o que acontece ao agir. Em cada item, o esperado é **igual nos dois lados**; qualquer diferença é bug de tradução e volta para o pedido da view. A parte B (diff de dados) roda uma vez, no fechamento de 3a — com a lista das migrações 3b já aplicadas por view como diferenças esperadas.
>
> Exceções aceitas de antemão (registradas em `divergences.md` ao fim de 3a): os botões e ícones do design system são reconstruídos a partir de `_ds/`, e as três props do Claude Design viram constantes. Tudo o mais tem de bater.

---

## 0. Preparação

1. **Mesma janela.** As duas com a mesma largura (≥ 1280px) e o mesmo zoom do navegador. Sidebar aberta nas duas.
2. **Mesmos dados.** No protótipo, **Salvar** → guardar o arquivo como `docs/validacao-passo3/base.json`. No app novo, **Carregar** → escolher `base.json`. As duas telas passam a mostrar o mesmo board. Repetir sempre que uma view nova ficar pronta.
3. **Mesmo dia.** Linha de "hoje", coluna da sprint atual e idade dos cards dependem da data. Executar os dois lados no mesmo dia.
4. **Mesmo quarter e mesma squad selecionados** antes de cada comparação: Q3 2026 · Payment.

---

## A. Checklist de interação por view

Marcar cada item como **igual** ou **diferente**. Se diferente, anotar o que se viu em cada lado.

### A1 · Shell (barra lateral, header, mensagens)

| # | Ação | Esperado |
|---|---|---|
| 1 | Abrir o app | Barra lateral com logo, três itens sob "Roadmap", um sob "Config"; texto no rodapé sobre salvamento no navegador. Header com trilha "Roadmap Q3 2026 / Quadro Principal", seletor de quarter, botões Importar · Carregar · Salvar e o círculo do avatar. |
| 2 | Clicar em cada item da barra lateral | Item ativo fica com fundo verde translúcido e texto verde; a trilha do header muda para o nome da view; a página rola para o topo. |
| 3 | Clicar em ⟨ na barra lateral | Barra encolhe para só ícones; passar o mouse mostra o nome; o botão vira ⟩. |
| 4 | Recarregar a página com a barra encolhida | Continua encolhida. Expandir e recarregar → continua expandida. |
| 5 | Clicar no seletor de quarter | Menu abre com "Q3 2026 · Sprint 01–06". "Q2 2026" **não** aparece (está arquivado — comportamento atual, C7 fica para 3b). |
| 6 | Com o menu aberto, clicar fora | Menu fecha. |
| 7 | Ir para a view do Gantt | Botão **Importar** desaparece; Carregar e Salvar continuam. Voltar à primeira view → Importar volta. |
| 8 | Clicar em **Salvar** | Baixa `roadmap-cakto.json`; mensagem "Arquivo salvo" aparece embaixo, centralizada, e some em ~2 segundos. |
| 9 | Clicar em **Carregar** e escolher um arquivo que não é board (um `.txt` renomeado para `.json`) | Mensagem "Arquivo inválido"; nada muda na tela. |
| 10 | **Carregar** `base.json` | Mensagem "Dados carregados"; tela volta ao estado inicial; aba de squad volta para a primeira. |

### A2 · Squads & sprints

| # | Ação | Esperado |
|---|---|---|
| 1 | Abrir a view | Três blocos: calendário do quarter, lista de quarters, lista de squads. Título e subtítulos iguais. |
| 2 | Ver os chips de sprint | Seis chips "Sprint 01 · 07/07–20/07" … "Sprint 06 · 15/09–28/09". |
| 3 | Mudar "Início da Sprint 01" para 06/07/2026 | Chips recalculam (Sprint 01 · 06/07–19/07 …). Voltar para 07/07. |
| 4 | Digitar 3 em "Duração da sprint" e sair do campo | Valor vira **7** (mínimo). Digitar 40 → vira **30**. Voltar para 14. |
| 5 | Digitar 0 em "Número de sprints" e sair | Vira **1**. Digitar 20 → **16**. Voltar para 6. |
| 6 | Ver a lista de quarters | "Q3 2026" com tag **ativo**, meta "Sprint 01–06 · início 07/07 · N itens", botão Arquivar; "Q2 2026" com tag **arquivado**, botões Ativar e Desarquivar. Nenhum × visível (os dois têm itens ou são ativos). |
| 7 | Clicar no rótulo "Q3 2026", acrescentar " x", sair do campo | Rótulo muda na lista, no seletor do header e na trilha. Desfazer (apagar " x"). |
| 8 | Clicar em **Ativar** no Q2 2026 | Q2 vira ativo; trilha muda para "Roadmap Q2 2026"; mensagem "Quarter: Q2 2026"; aba de squad volta para a primeira. Ativar Q3 de volta. |
| 9 | Clicar em **+ Novo quarter** | Mensagem "Quarter criado — ajuste rótulo e datas em Squads & sprints"; "Novo quarter" aparece no topo da lista como **ativo**, com 0 itens, e no seletor do header. Suas squads são as mesmas do Q3, com as mesmas categorias e sem itens. |
| 10 | No "Novo quarter" (ativo, 0 itens), procurar o × | **Não** aparece (é o ativo). Ativar Q3 → × aparece no "Novo quarter". Clicar → mensagem "Quarter excluído"; some da lista e do seletor. |
| 11 | Squads: mudar a cor de Payment | Dot da aba de squad, acento do cabeçalho e barras de % mudam de cor na view Roadmap; swimlane muda no Gantt. |
| 12 | Squads: renomear "Growth" para "Growth 2" | Aba, swimlane e chip de filtro do Kanban acompanham. Desfazer. |
| 13 | Squads: desligar "categorias" de Payment | Na view Roadmap, o toggle "Agrupar por categoria" de Payment aparece desligado e a tabela fica plana. Religar. |
| 14 | **+ Adicionar squad** | Mensagem "Squad criada — renomeie no campo de nome"; "Nova squad" entra no fim da lista com a próxima cor da paleta; aba nova na view Roadmap, já selecionada. |
| 15 | Remover "Nova squad" (×) | Mensagem "Squad removida"; aba some. |

### A3 · Visão geral (Gantt)

| # | Ação | Esperado |
|---|---|---|
| 1 | Abrir a view | Título "Roadmap Q3 2026 — Gantt", subtítulo "Sprints de 14 dias · categorias como camadas (opcional) · linha verde = hoje". Três chips de filtro à direita. |
| 2 | Ler os 4 KPIs | Os mesmos quatro números nos dois lados (itens no roadmap · em desenvolvimento · em risco/atrasados · concluídos com %). O de risco fica vermelho quando > 0. |
| 3 | Cabeçalho da timeline | Banda verde com "Squad / Categoria / Item" e "Q3 2026"; banda de meses "Julho · Agosto · Setembro" com larguras proporcionais; seis colunas "Sprint 01" … "Sprint 06" com intervalos; **a sprint que contém hoje** com fundo destacado. |
| 4 | Linha vertical de hoje | Verde, na mesma posição horizontal nas duas janelas, atravessando todas as linhas. |
| 5 | Swimlane Payment | Cabeçalho com dot na cor da squad, "Payment", "N itens · categorias" e ▾. Abaixo, layers "Assinatura" e "Internacional" com contagem; sob Internacional, sub-layers "Novos Métodos", "Arquitetura", "México". |
| 6 | Clicar no cabeçalho de Payment | Linhas somem, seta vira ▸, meta continua. Clicar de novo reabre. |
| 7 | Clicar na layer "Internacional" | Só ela colapsa; Assinatura continua aberta. |
| 8 | Item "Ebanx — MercadoPago" (abr–mai) | Sem barra; chip "◀ antes de Q3" no início da linha. |
| 9 | Item "Novo Fluxo de Área de Membros" (Cakto Members, começa em junho) | Barra encostada na borda esquerda com "◀ 50%" escrito dentro. |
| 10 | Barras | Cor pelo status (Entregue verde-claro, Em desenvolvimento verde-escuro com texto branco, QA amarelo, Homologação verde-médio, Backlog cinza, User stories cinza-escuro); preenchimento interno proporcional ao %; percentual escrito dentro. |
| 11 | Dots de previsão | "App \| Portabilidade chave Pix" (bloqueado) tem dot cinza na ponta direita; "Emissão NFSe (Cakto — interno)" (em risco) tem dot amarelo; "[BASE] Consumir Conteúdo da V3" (atrasado) tem dot vermelho. Itens no prazo ou em produção **não** têm dot. |
| 12 | Passar o mouse numa barra | Tooltip "nome · dd/mm → dd/mm · status · previsão · %". |
| 13 | Chip "Em risco / atrasado" | Ficam só os itens com previsão em risco ou atrasado; squads sem nenhum somem; KPIs recalculam. |
| 14 | Chip "Em desenvolvimento" | Só itens com status Em desenvolvimento. "Todas as squads" volta ao normal. |
| 15 | Legenda no rodapé | Seis status (com amostra de cor) e quatro previsões (No prazo · Em risco · Atrasado · Bloqueado — comportamento atual, B8 fica para 3b). |
| 16 | Platform, Growth, Cakto Members, Bank & App | Sem layers (não têm categorias); itens direto sob a squad. |

### A4 · Roadmap (tabela)

| # | Ação | Esperado |
|---|---|---|
| 1 | Abrir a view | Título "Quadro Principal", subtítulo "Editando Q3 2026 · 6 sprints a partir de 07/07 · categorias (Pilar) opcionais por squad."; abas Payment · Platform · Growth · Cakto Members · Bank & App com dot; linha de ajuda sobre a alça ⠿. |
| 2 | Cabeçalho da tabela de Payment | Acento na cor da squad, "Payment", toggle "Agrupar por categoria" ligado, pill "N no roadmap · 2 categorias". |
| 3 | Colunas (agrupado) | Pilar / Item · Início · Fim · Status · Previsão · % Conclusão. |
| 4 | Cabeçalho da categoria "Assinatura" | Dot na cor da squad, nome em campo editável, "+ sub", ×, barra de rollup com % (média dos itens). |
| 5 | Sub-layer "Novos Métodos" | ▸ verde, nome editável, ×, rollup próprio. |
| 6 | Desligar o toggle "Agrupar por categoria" | Colunas passam a Item · Categoria · Subcat. · Início · Fim · Status · Previsão · %; categoria e subcategoria são campos de texto (categoria com sugestões ao digitar). Religar. |
| 7 | Linha de um item | Alça ⠿, nome, dois seletores de data, status como select com fundo translúcido na cor do status, previsão como select com texto na cor da previsão, barra de % na cor da squad + número, ↓ e ×. |
| 8 | Clicar no nome de "FASE 1 · MVP comercial", digitar " x", clicar fora | Nome fica "FASE 1 · MVP comercial x"; no Gantt, a barra mostra o novo nome no tooltip. Desfazer. |
| 9 | No % de "FASE 1", digitar 150 e sair | Vira **100**; barra cheia. Digitar -5 → **0**. Voltar para 15. |
| 10 | Mudar status de "FASE 1" para "Homologação" | Select muda de cor; no Gantt a barra muda de cor. Voltar. |
| 11 | Arrastar pela alça "FASE 3 · Inteligência" para cima de "FASE 1", **metade de cima** | Linha arrastada fica semitransparente; alvo mostra risco verde no topo; ao soltar, FASE 3 fica acima de FASE 1. Arrastar de volta. |
| 12 | Arrastar "Smart Routing" para o **cabeçalho** da categoria "Assinatura" | Cabeçalho ganha contorno tracejado verde durante o arraste; ao soltar, Smart Routing vira o último item de Assinatura, sem subcategoria. Arrastar de volta para "Arquitetura". |
| 13 | **+ Nova categoria** | Mensagem "Categoria criada — clique no nome para editar"; cabeçalho "Nova categoria" no fim, com linha "— arraste itens para cá ou use + para adicionar —". |
| 14 | Renomear "Nova categoria" para "Teste" e clicar fora | Cabeçalho e Gantt (layer "Teste", 0 itens) acompanham. |
| 15 | Em "Teste", clicar "+ sub" | Mensagem "Subcategoria criada — clique no nome para editar"; sub-layer "Nova subcategoria" aparece sob Teste. |
| 16 | Remover a subcategoria (×) | Mensagem "Subcategoria removida — itens preservados". |
| 17 | Remover a categoria "Teste" (×) | Mensagem "Categoria removida — itens preservados sem categoria"; cabeçalho some. |
| 18 | Renomear "Internacional" para "Internacional x" | Todos os itens da categoria seguem juntos (nada cai para "sem categoria"); Gantt acompanha. Desfazer. |
| 19 | Clicar ↓ em "LATAM — Chile (Webpay)" | Mensagem "Movido para o backlog"; item some da tabela e aparece na tabela de backlog com a categoria "Internacional" e observação vazia. |
| 20 | Backlog: cabeçalho | "Backlog — fora do roadmap", pill "não aparece no Gantt · N itens"; colunas Item · Categoria · Observação; ↑ e × por linha. |
| 21 | Backlog: clicar ↑ em "LATAM — Chile (Webpay)" | Mensagem "Promovido ao roadmap — defina as datas"; item volta ao roadmap com início = fim = 07/07/2026, status Backlog, previsão Não iniciado, 0% (comportamento atual — C9 fica para 3b); no Gantt, barra mínima na borda esquerda. |
| 22 | **+ Adicionar item ao backlog** | Linha vazia com placeholders "Item do backlog" / "—" / "observação / motivo". Remover com ×. |
| 23 | Esvaziar o backlog de Platform (não tem itens) | Linha "Nenhum item no backlog." |
| 24 | **+ Adicionar item ao roadmap** em Platform | Linha nova no fim com nome vazio (placeholder "Nome do item"), datas 07/07/2026, Backlog, Não iniciado, 0%. Remover com ×. |
| 25 | Itens sem categoria em Payment (se houver) | Aparecem no **fim** da tabela, sem cabeçalho (comportamento atual — B4 fica para 3b). |

### A5 · Kanban

| # | Ação | Esperado |
|---|---|---|
| 1 | Abrir a view | Título "Demandas", subtítulo sobre a fila priorizada, botão **Adicionar** à direita. Chips: "Board geral" (ativo), "Sem squad", um por squad com dot. |
| 2 | Colunas | Backlog · Priorizado · Execução · Concluído · Descartado, cada uma com nome em campo editável, contador, e à direita um botão alto "+" tracejado. |
| 3 | Cards do seed | 15 cards no Backlog (3 por squad), códigos `PAY-101`…; cada um com código mono, tag da squad com dot, quatro barrinhas de prioridade apagadas, título, chip de idade "0d" (ou os dias desde a criação). Sem chip de tipo (é Backlog). |
| 4 | Passar o mouse num card | Sobe 2px, ganha sombra; engrenagem e × aparecem no topo direito. |
| 5 | Chip "Payment" | Só cards de Payment; contadores das colunas recalculam. "Sem squad" → nenhum card (seed todos têm squad) → "Nenhum registro encontrado" em cada coluna. "Board geral" volta. |
| 6 | Clicar em **Adicionar** | Modal "Nova iniciativa" com: Título, Descrição, Destino (Fila central + squads), Prioridade, Tipo, Estimativa, Período trimestre, Período mês-alvo, PM, Tech Lead, Origem, Motivo do descarte, Anexo (botão "Anexar HTML" + "Nenhum arquivo anexado"), Link do protótipo. Botões Cancelar e "Adicionar à fila". |
| 7 | Clicar "Adicionar à fila" com título vazio | Mensagem "Dê um título à iniciativa"; modal continua aberto. |
| 8 | Clicar fora do modal | Fecha sem criar. Reabrir. |
| 9 | Preencher só o título "Teste" e adicionar | Mensagem "Iniciativa adicionada ao fim da fila de backlog"; card `CKT-116` no fim do Backlog, sem tag de squad, chip "0d". |
| 10 | Arrastar "Teste" para Priorizado | Coluna alvo ganha borda vermelha durante o arraste; ao soltar, mensagem "Faltam para Priorizado: Squad · PM · Tech Lead · Estimativa · Período"; card volta ao Backlog. |
| 11 | Engrenagem de "Teste" | Modal "Configurar iniciativa" com os valores atuais; botão "Salvar alterações". Preencher Destino Payment, Estimativa S, Período Q4, PM "Ana", TL "Bruno" → salvar → mensagem "Iniciativa atualizada"; código passa a `PAY-116`, tag Payment aparece. |
| 12 | Arrastar "Teste" para Priorizado de novo | Aceito. No card aparecem: chip "Delivery", chip "S", chip "Q4", avatares "A" e "B" no rodapé; chip de idade some. |
| 13 | Arrastar "Teste" para cima de outro card na mesma coluna | Reordena para a posição do alvo. |
| 14 | Arrastar "PAY-101" para Descartado | Recusado: "Falta o motivo do descarte — defina na engrenagem do card". Engrenagem → Motivo "duplicado" → salvar → arrastar de novo → aceito; título riscado, chip "não faremos: duplicado". |
| 15 | Renomear a coluna "Priorizado" para "Priorizado x" | Nome muda; as regras continuam (é o comportamento atual — A3 fica para 3b). Desfazer. |
| 16 | Clicar no "+" à direita | Coluna "Nova coluna" aparece no fim, vazia, com × no cabeçalho. Clicar × → "Coluna removida". Tentar × numa coluna com cards → "Esvazie a coluna antes de removê-la". |
| 17 | Modal: "Anexar HTML" com um `.html` qualquer | Nome do arquivo aparece ao lado; após salvar, o card ganha um chip com o nome; clicar abre o HTML em aba nova. |
| 18 | Modal: Link "https://exemplo.com" | Card ganha chip de link; clicar abre em aba nova. |
| 19 | Card com mês-alvo já passado (perM anterior ao mês atual), fora de Concluído | Chip de período em vermelho. Movido para Concluído → chip verde com check. |
| 20 | × num card | Mensagem "Iniciativa removida"; card some. |

### A6 · Import / Export

| # | Ação | Esperado |
|---|---|---|
| 1 | **Importar** com `Q2 Weekly Review.xlsx` (ou outra planilha com a coluna "Item") | Mensagem "Importado: N squads"; **todas** as squads do quarter ativo são substituídas pelas abas da planilha (comportamento atual — A11 fica para 3b). Depois, **Carregar** `base.json` para voltar. |
| 2 | **Importar** com uma planilha sem coluna "Item" | Mensagem "Nenhuma tabela reconhecida"; nada muda. |
| 3 | Recarregar a página após qualquer edição | Edição continua lá (salva no navegador). |

---

## B. Roteiro das 20 ações — diff de dados

> **Executado em 09/09/2026** pelo Claude: app novo via DOM (`novo.json`) × lógica do protótipo via Node (`prototipo.json`), a partir de `base-prototipo.json`. Resultado em `diff-dados.md`.

A prova objetiva de que a lógica é a mesma. Executar **exatamente** estas ações, na ordem, nos dois lados, a partir de `base.json` carregado. Ao final, **Salvar** nos dois e comparar os arquivos (VS Code: selecionar os dois → botão direito → *Comparar selecionados*).

**Diferença esperada:** apenas `createdAt` do card criado na ação 17 (é a hora do clique). Qualquer outra diferença é bug.

Começar em **Roadmap · Q3 2026 · aba Payment**, agrupamento ligado.

| # | View | Ação exata |
|---|---|---|
| 1 | Roadmap | **+ Adicionar item ao roadmap**. No nome, digitar `Teste A`. |
| 2 | Roadmap | Em "Teste A": início `03/08/2026`, fim `14/08/2026`. |
| 3 | Roadmap | Em "Teste A": status **Em desenvolvimento**, previsão **Em risco**, % `40`. |
| 4 | Roadmap | Arrastar "Teste A" pela alça e soltar sobre o **cabeçalho** da categoria "Assinatura". |
| 5 | Roadmap | Arrastar "FASE 2 · API + MCP" e soltar sobre a **metade de cima** de "FASE 0 · Arrumar a casa". |
| 6 | Roadmap | **+ Nova categoria**. Renomear "Nova categoria" para `Teste Cat`. |
| 7 | Roadmap | Em "Internacional", **+ sub**. Renomear "Nova subcategoria" para `Teste Sub`. |
| 8 | Roadmap | Arrastar "Smart Routing" e soltar sobre o cabeçalho da subcategoria "Teste Sub". |
| 9 | Roadmap | Clicar ↓ em "LATAM — Chile (Webpay)". |
| 10 | Roadmap | No backlog, clicar ↑ em "Order Bump e Add-ons na Assinatura". |
| 11 | Roadmap | **+ Adicionar item ao backlog**: item `Teste BL`, categoria `Assinatura`, observação `obs`. |
| 12 | Roadmap | Remover a categoria "Teste Cat" (×). |
| 13 | Roadmap | Aba **Platform**: desligar "Agrupar por categoria". Deixar desligado. |
| 14 | Squads & sprints | Rótulo do quarter Q3 2026: acrescentar ` v2` → `Q3 2026 v2`. |
| 15 | Squads & sprints | "Início da Sprint 01" → `06/07/2026`. |
| 16 | Squads & sprints | Squads: renomear "Growth" para `Growth 2`. **+ Adicionar squad** (deixar como "Nova squad"). |
| 17 | Kanban | **Adicionar**: título `Teste Card`, destino **Squad Payment**, prioridade **P1**, tipo **Bug**, estimativa **S**, trimestre **Q4**, mês-alvo **out**, PM `Ana`, Tech Lead `Bruno`, origem **suporte**. "Adicionar à fila". |
| 18 | Kanban | Arrastar "Teste Card" para **Priorizado** (deve ser aceito). |
| 19 | Kanban | Arrastar "Payment - Item 1" para **Descartado** (deve ser recusado). Engrenagem → motivo **duplicado** → "Salvar alterações". Arrastar de novo para Descartado (aceito). |
| 20 | Kanban | Arrastar "Payment - Item 3" e soltar **sobre** "Payment - Item 2" (reordena dentro do Backlog). |

Depois: header → **Salvar** nos dois lados. Nomear `protótipo.json` e `novo.json`. Comparar.

Se o diff mostrar só `createdAt`, a lógica migrou intacta. Se mostrar mais, anotar o caminho do campo (ex.: `quarters.q3-2026.squads[0].items[3].cat`) — ele aponta direto para a função que traduziu errado.

---

## C. Registro

Para cada view, guardar nesta pasta:

- `NN-<view>-prototipo.png` e `NN-<view>-novo.png` — screenshot pareado, mesma largura.
- Estados extras que valem screenshot: sidebar encolhida; Gantt com filtro "Em risco / atrasado"; Gantt com Payment colapsada; tabela com agrupamento desligado; Kanban com filtro de squad; modal aberto.
- `protótipo.json` e `novo.json` da parte B.

Estes "antes" servem também ao passo 5, que exige screenshot antes/depois por view.
