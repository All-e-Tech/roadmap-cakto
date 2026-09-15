# Conciliação SPEC.md × código exportado

> Gerado em 2026-09-04 no Claude Code, conforme `SPEC.md` §0.3 e o passo 1 do `CLAUDE.md`.
>
> **Nada foi corrigido no código.** Este documento só lista. Decisões já tomadas aparecem item a item como **Decisão (data)**. Cada divergência é uma decisão a tomar: ou a spec está desatualizada e se ajusta ao código, ou o código está errado e se ajusta à spec. As duas coisas acontecem nesta lista.

**Fonte comparada:** `Claude Design/Roadmap Cakto.dc.html` (1220 linhas: marcação até a linha 529, script da aplicação da 531 em diante) + `Claude Design/support.js` e `Claude Design/_ds/` (runtime do Claude Design, não é código da aplicação).

**Como ler:** cada divergência tem um ID (`A1`, `B2`, `C3`…) para você referenciar na hora de decidir. **Spec** é o que o documento diz; **Código** é o que a ferramenta faz hoje; **Consequência** é o que isso significa para quem usa.

**Resumo:** 13 itens em (a), 9 em (b), 10 em (c). Os que mudam o tamanho do trabalho planejado são **A1**, **A2**, **B1** e **B7** — vale começar a decisão por eles.

---

## (a) O que o código faz e a spec não descreve

### A1 · A view do Kanban de intake existe e está funcional

**Spec:** Anexo A trata o Kanban como trilha paralela "em design, não implementada", que "**não** faz parte do código desta ferramenta". O `CLAUDE.md` coloca a construção dele no passo 6, o último.

**Código:** há uma quarta view, "Demandas (Kanban)", na navegação lateral, ao lado das três previstas. Está implementada: 5 colunas default (`Backlog · Priorizado · Execução · Concluído · Descartado`), cards arrastáveis entre colunas e reordenáveis dentro da coluna, modal de criação e edição com 14 campos, filtro por squad, e as regras de passagem entre colunas — inclusive o gate de 6 campos na saída do Backlog e o motivo obrigatório no descarte.

**Consequência:** o passo 6 do plano já está parcialmente feito. Precisa ser conciliado contra `docs/decisions.md` e `docs/kanban-card-spec.md` — que são a fonte da verdade dele, não esta spec — antes de qualquer decisão sobre o que falta.

**Decisão (07/09/2026):** o Kanban entra no modelo formal (SPEC §3, `iniciativas`). Conciliação própria contra `docs/decisions.md` e `docs/kanban-card-spec.md` no passo 6, gerando `docs/divergences-kanban.md`.

### A2 · O objeto `data` ganhou duas chaves de topo

**Spec:** §3 descreve `data` com `activeQuarter`, `order` e `quarters`. Só isso.

**Código:** `normalize()` cria e mantém mais duas chaves no mesmo nível: `demandas` (array de cards do Kanban) e `kcols` (array de colunas do Kanban). Quem nunca abriu o Kanban também tem as duas no JSON — o seed popula 15 iniciativas de exemplo.

**Consequência:** **é mudança de modelo.** O JSON que sai pelo botão Salvar hoje tem campos que a spec não conhece. Precisa entrar em §3 ou sair do código; enquanto ficar assim, qualquer backend construído sobre §3 vai descartar o Kanban inteiro.

**Decisão (07/09/2026):** `iniciativas` entra em §3 com o nome do glossário; `normalize()` migra `demandas` no passo 3. `kcols` **não** entra — ver A3.

**Adiado (09/09/2026):** a renomeação `demandas` → `iniciativas` fica para a remodelagem do passo 4b ("1 iniciativa = 1 item"), junto com a saída de `kcols`. Até lá o código lê `demandas` por `iniciativas(data)` em `data.js`.

### A3 · As colunas do Kanban são editáveis em runtime

**Spec:** Anexo A.2 descreve as colunas como estrutura fixa: `Backlog → Priorizado → Execução → Concluído`, mais `Descartado` terminal.

**Código:** o nome de cada coluna é um input editável; há botão "+" para criar coluna nova (entra com papel `fluxo`) e "×" para remover coluna — bloqueado se ela tiver cards. O comportamento é regido por um campo `role` (`entrada`/`fluxo`/`execucao`/`concluido`/`descartado`), não pelo nome exibido.

**Consequência:** um PM pode renomear "Priorizado" ou inserir uma coluna a mais sem quebrar as regras de passagem. Se a intenção era um fluxo padronizado entre as 6 squads, isso está aberto demais.

**Decisão (07/09/2026):** colunas fixas, identificadas por `role`, não editáveis em runtime. A edição de colunas sai no passo 3. Registrado em `decisions.md`, "Kanban no modelo de dados".

**Executado (09/09/2026, 3b Kanban):** nome da coluna vira texto; saem o "+" e o × de coluna e as funções correspondentes. A chave `kcols` permanece no dado até a remodelagem (4b, A2).

### A4 · Campos do card além dos que o Anexo A.2 lista

**Spec:** A.2 lista a frente do card com ~10 elementos e o gate de 6 campos.

**Código:** o card guarda ainda `d` (descrição), `origem` (enum de 6: stakeholder, suporte, dados, discovery, incidente, regulatório), `link` (URL de protótipo navegável do Claude Design), `anexoNome`/`anexoConteudo` (um arquivo `.html` inteiro guardado dentro do JSON e aberto numa aba nova), `subsTotal`/`subsDone` (progresso), `dep` (dependências), `createdAt` (base do aging) e `code` (o ID legível `PAY-101`, gerado por prefixo de squad).

**Consequência:** dois pontos merecem atenção. `anexoConteudo` guarda o HTML inteiro dentro do board — dez anexos e o JSON fica pesado o bastante para incomodar no salvamento. E `subsTotal`/`subsDone` não têm interface: nenhum campo do modal os preenche, então a barra de progresso do card nunca aparece hoje.

**Decisão (07/09/2026):** os campos entram em §3, **exceto** `anexoNome`/`anexoConteudo` — anexo é link, e `link` já existe. `subsTotal`/`subsDone` sem interface viram pendência do passo 6.

**Executado (09/09/2026, 3b Kanban):** `anexoNome`/`anexoConteudo` saem do modal, do card e do seed; `normalize()` descarta os dois em boards antigos. `subsTotal`/`subsDone` seguem como pendência.

### A5 · A persistência é `localStorage`, não a API de §9

**Spec:** §9 descreve a persistência inteira como API `/api/board` com versionamento.

**Código:** grava em `localStorage`, chave `cakto-roadmap-v1`, a cada alteração. Uma segunda chave, `cakto-roadmap-side`, guarda se a barra lateral está aberta.

**Consequência:** **cada PM tem a própria cópia do roadmap, no próprio navegador.** Ninguém vê a edição do outro; limpar o cache do navegador apaga o board. É a contrapartida de B1 e a razão pela qual o backend não pode demorar muito.

### A6 · Barra lateral colapsável e shell de navegação

**Spec:** não descreve o shell — nem sidebar, nem header, nem navegação.

**Código:** barra lateral de 280px com logo e ícones do design system, colapsável para 64px, com o estado lembrado entre sessões. Header com trilha ("Roadmap Q3 2026 / Quadro Principal"), seletor de quarter em menu suspenso e botões de ação.

**Consequência:** só falta na spec. Vira referência da migração visual (§12) — é o que existe hoje e o que precisa ser comparado com a skill.

**Decisão (07/09/2026):** aceito; descrito em `SPEC.md` §1.1.

### A7 · Config permite renomear e excluir quarters

**Spec:** §7 lista as ações do quarter: Ativar, Arquivar/Desarquivar, + Novo quarter.

**Código:** o rótulo do quarter é editável inline na lista, e há um "×" para excluir — com duas travas: só quarter sem nenhum item no roadmap, e nunca o quarter ativo.

**Consequência:** as travas são sensatas e evitam perda de dados. Só falta descrever.

**Decisão (07/09/2026):** aceito; descrito em `SPEC.md` §7.

### A8 · Mensagens de confirmação (toasts)

**Spec:** não menciona.

**Código:** toda ação relevante dispara uma mensagem curta no rodapé por 2,2s — "Squad criada — renomeie no campo de nome", "Categoria removida — itens preservados sem categoria", "Faltam para Priorizado: PM · Estimativa".

**Consequência:** é a principal camada de voz da interface. Entra na revisão de tom (`cakto-context`) na migração visual.

**Decisão (07/09/2026):** aceito; lista travada em `SPEC.md` §1.2.

### A9 · A view abre com estado configurável por props do Claude Design

**Spec:** não menciona.

**Código:** três props do componente controlam comportamento: `paginaInicial` (`dados` ou `gantt`), `mostrarRotuloBarra` e `destacarHoje`.

**Consequência:** essas props só existem dentro do Claude Design. Fora dele, viram constantes ou preferências — decisão da refatoração (passo 3).

**Decisão (07/09/2026):** viram constantes na reescrita; nomes e defaults em `SPEC.md` §2.

### A10 · A barra do Gantt exibe o % escrito dentro dela

**Spec:** §6.2 descreve a barra por cor, preenchimento interno, dot e tooltip. Não fala em rótulo.

**Código:** o número do percentual é escrito dentro da barra, quando `mostrarRotuloBarra` está ligado (default).

**Consequência:** informação duplicada com o preenchimento; barra curta fica com o texto cortado. Vale decidir na migração visual.

### A11 · Importar planilha apaga as squads do quarter ativo

**Spec:** §8 descreve o parser e diz que "cada aba vira uma squad". Não diz o que acontece com o que já existe.

**Código:** a importação **substitui todas as squads do quarter ativo**, com tudo dentro — itens, categorias e backlog. Não há confirmação antes, e o único caminho de volta é ter salvo o JSON.

**Consequência:** é a ação mais destrutiva da ferramenta, e o botão "Importar" fica no header, ao lado de "Salvar", sem aviso. Um clique errado apaga o quarter.

**Decisão (07/09/2026):** intenção original é carga inicial; comportamento desejado é **aditivo** — redesenho como evolução pós-validação (`SPEC.md` §11). Enquanto isso, confirmação antes de substituir nomeando o que será perdido: "Substituir o quarter {rótulo} ({N} squads, {M} itens)? Salve antes se quiser voltar." Executar após a reescrita. Vale também para B2.

**Executado (09/09/2026, 3b Roadmap-4):** confirmação nativa antes de substituir; cancelar não faz nada.

### A12 · O backlog do roadmap tem botão de adicionar

**Spec:** §5.4 descreve o backlog com duas ações: promover ao roadmap e remover.

**Código:** há também "+ Adicionar item ao backlog", criando linha vazia direto ali.

**Consequência:** só falta na spec.

**Decisão (07/09/2026):** aceito; descrito em `SPEC.md` §5.4.

### A13 · Filtro de squad no Kanban

**Spec:** não menciona filtros no Kanban.

**Código:** chips "Board geral", "Sem squad" e um chip por squad do quarter ativo.

**Consequência:** só falta na spec.

**Decisão (07/09/2026):** aceito; descrito em `SPEC.md` A.2.

---

## (b) O que a spec descreve e o código não faz

### B1 · A camada de sincronização de §9 não existe

**Spec:** §9 inteiro — `GET`/`PUT` em `/api/board`, autosave a cada 4s, refresh a cada 15s, `sendBeacon` no fechamento, conflito 409 com confirmação, indicador "Salvando… / Salvo · HH:MM / Sem conexão / Conflito…" no header.

**Código:** nada disso. Nenhuma chamada de rede, nenhum indicador. Ver A5.

**Consequência:** a ferramenta hoje não é multiusuário. Seis PMs preenchendo cada um a sua cópia é o cenário atual, e a única forma de juntar seria exportar o JSON e outro importar — que é justamente o que B2 quebra.

### B2 · "Restaurar ↑" não tem botão — e a interface promete que tem

**Spec:** §8 lista Backup ↓ e Restaurar ↑.

**Código:** o Backup funciona (botão "Salvar", baixa `roadmap-cakto.json`). O Restaurar está 95% pronto — existe o seletor de arquivo escondido, existe o handler que valida, normaliza e grava, e existe a função que abriria o seletor. **Mas nenhum elemento da interface chama essa função** (linha 1120: definida, nunca usada). E o rodapé da barra lateral diz: "Use Salvar / Carregar para compartilhar em JSON."

**Consequência:** **é um bug, não uma lacuna de escopo.** Hoje dá para exportar o board e não dá para trazê-lo de volta por nenhum caminho da interface — e o texto da própria tela promete um botão que não está lá. Combinado com B1, significa que não existe nenhuma forma de compartilhar o roadmap entre dois PMs.

**Resolvido (07/09/2026):** botão **Carregar** ligado a `loadJson` no header do export (linha 79), entre Importar e Salvar. `SPEC.md` §8 renomeado de "Restaurar ↑" para "Carregar ↑". **Decisão (07/09/2026):** mesma confirmação de A11 antes de substituir, nomeando o board inteiro. Executar após a reescrita.

**Executado (09/09/2026, 3b Roadmap-4):** "Substituir o board inteiro ({N} quarters, {M} itens)? Salve antes se quiser voltar." (`SPEC.md` §8).

### B3 · Exportar PDF não existe

**Spec:** §8 — impressão com CSS que mostra só o Gantt.

**Código:** nenhuma chamada de impressão e nenhum bloco de estilo de impressão.

**Consequência:** não há como tirar o roadmap da ferramenta para levar a uma reunião, a não ser por captura de tela.

**Decisão (07/09/2026):** vai para o passo 5 (migração visual). A decisão de produto já está em `SPEC.md` §8 — imprimir só o Gantt; falta o CSS de impressão.

### B4 · O grupo "Sem categoria" não existe

**Spec:** §5.1 — "Itens sem categoria caem num grupo 'Sem categoria'".

**Código:** na visão agrupada, os itens sem categoria são empilhados no fim da tabela, depois da última categoria, **sem cabeçalho nenhum**. O mesmo vale para o Gantt.

**Consequência:** o PM vê itens soltos no fim da lista sem entender por que estão fora dos grupos. E, sem cabeçalho, não há alvo para arrastar um item de volta para "sem categoria".

**Conserto confirmado (07/09/2026) — executar após a reescrita (passo 3):** criar o grupo "Sem categoria" com cabeçalho, na tabela agrupada e no Gantt, como alvo de arrastar.

**Executado (09/09/2026, 3b Roadmap-2 + Gantt-1):** cabeçalho virtual na tabela (rollup, alvo de arraste, sem renomear/+ sub/×) e layer colapsável no Gantt; rótulo em `data.js` (`SEM_CATEGORIA`). `SPEC.md` §5.1 atualizado.

### B5 · Nomes duplicados de categoria não são rejeitados

**Spec:** §5.2 — "Nomes duplicados são rejeitados".

**Código:** renomear categoria ou subcategoria aceita qualquer texto, inclusive um nome que já existe. A única proteção é na criação automática, que evita repetir o nome default ("Nova categoria 2").

**Consequência:** duas categorias com o mesmo nome viram duas faixas idênticas no Gantt, e os itens se distribuem entre elas de forma imprevisível — porque o vínculo item→categoria é por texto (`item.cat`), não por identificador.

**Conserto confirmado (07/09/2026) — executar após a reescrita (passo 3):** rejeitar nome duplicado ao renomear categoria ou subcategoria, com mensagem.

**Executado (09/09/2026, 3b Roadmap-3):** `renomeiaCategoria()`/`renomeiaSub()` devolvem `false` e não alteram nada quando o nome já existe; toasts "Já existe uma categoria com esse nome" / "Já existe uma subcategoria com esse nome" (`SPEC.md` §1.2).

### B6 · Os rótulos de status e previsão não têm os emojis

**Spec:** §4.1 e §4.2 grafam os rótulos com emoji: "✅ Entregue", "🏗️ Em Desenvolvimento", "🟢 No Prazo", "🔴 Atrasado".

**Código:** rótulos secos — "Entregue", "Em desenvolvimento", "No prazo". A capitalização também difere (spec "Em Desenvolvimento", código "Em desenvolvimento"; spec "Em Teste/QA", código "Em teste / QA").

**Consequência:** decisão de tom, não de função. Vale resolver junto com a migração visual e travar num lugar só.

**Decisão (07/09/2026):** grafia do código vence; lista travada em `SPEC.md` §4, sem emoji.

### B7 · O código não é HTML/CSS/JS vanilla

**Spec:** §2 fixa "sem framework e sem build"; §2.2 desenha o repositório como `index.html` + `css/` + `js/` com módulos carregados por `<script>`.

**Código:** o export é um componente do Claude Design. A marcação usa a linguagem de template do próprio Claude Design, e a lógica é uma classe que estende `DCLogic`, usa `React.createRef()` e depende de `support.js` e do bundle do design system para rodar. Abrir o arquivo fora do Claude Design não funciona.

**Consequência:** **muda o tamanho do passo 3.** Ele está escrito como "quebrar o single-file", que sugere recortar e colar em arquivos. Na prática é reescrever a camada de renderização inteira em JS vanilla, mantendo o comportamento igual. A lógica de negócio (`normalize`, `sprintsOf`, `timelineOf`, o cálculo da barra, as regras de passagem do Kanban, o parser de planilha) migra quase intacta; a marcação e o gerenciamento de estado migram do zero. É a maior tarefa do plano e merece conversa antes de começar.

**Decisão (07/09/2026):** Preact + htm via CDN, sem build. Registrado em `decisions.md`, "Camada de renderização"; SPEC §2 e `CLAUDE.md` atualizados.

### B8 · A legenda de previsão mostra 4 dos 6 estados

**Spec:** §6.1 — "Legenda de status e previsão no rodapé", com §4.2 definindo 6 previsões.

**Código:** a legenda de status traz os 6; a de previsão traz só "No prazo", "Em risco", "Atrasado" e "Bloqueado". Ficam de fora "Em produção" e "Não iniciado".

**Consequência:** "Não iniciado" é o valor default de todo item novo, então é justamente o mais comum no board — e o único sem legenda.

**Conserto confirmado (07/09/2026) — executar após a reescrita (passo 3):** legenda de previsão com os 6 estados de §4.2.

**Executado (09/09/2026, 3b Gantt-1):** legenda com os 6 estados.

### B9 · Não há como reordenar squads nem quarters

**Spec:** §3 define `order` como "ordem de exibição dos quarters no seletor", o que pressupõe controlá-la.

**Código:** `order` só muda por criação (entra no topo) e exclusão. Não há interface para reordenar quarters nem squads — a ordem das squads é a ordem de inserção.

**Consequência:** a ordem das abas de squad e das swimlanes do Gantt é a ordem em que foram criadas, e não dá para mudar sem editar o JSON à mão.

**Decisão (07/09/2026):** aceito como lacuna; evolução pós-validação (`SPEC.md` §11).

---

## (c) Contradições

### C1 · Os hex de status no código não são os da spec

**Spec:** §4.1 e §4.2 fixam o hex de cada status e previsão.

**Código:** quatro dos seis status divergem, e uma previsão:

| Chave | Spec §4 | Código | |
|---|---|---|---|
| `entregue` | `#36B37E` | `#36b37e` | igual |
| `dev` | `#0F7865` | `#0f7864` | **1 dígito de diferença** |
| `qa` | `#FFAB00` | `#fdd465` | diverge |
| `homolog` | `#2EA593` | `#65a76b` | diverge |
| `backlog` | `#2C2C2C` | `#454f5b` | diverge |
| `stories` | `#1C1C1C` | `#333e49` | diverge |
| `risco` (previsão) | `#FFAB00` | `#fdd465` | diverge |

**Consequência:** a spec chama esses valores de "proposta a validar visualmente". A validação aconteceu no Claude Design e o resultado não voltou para a spec. Precisa decidir qual das duas paletas vale — e a decisão só é honesta olhando o Gantt, não a tabela.

### C2 · §12 descreve uma dívida de design que já foi paga pela metade

**Spec:** §12 afirma que o código usa a paleta anterior (`#3FC958` Pulso, `#3E9337` Jade, `#1E1E1E` Âncora, `#F7F7F7` Névoa), a fonte Inter e layout Minimals light.

**Código:** o layout é dark, não light. Nenhum dos quatro hex da paleta v1.0 sobreviveu nos enums — foram substituídos pelos de C1. `#3FC958` restou em dois lugares isolados: o contorno de foco do card do Kanban e o preenchimento da barra de progresso do card.

**Consequência:** o passo 4 é menor do que a spec sugere para o Gantt e a tabela, e continua inteiro para o Kanban (ver C3). §12 precisa ser reescrita a partir do que o código realmente tem.

### C3 · Duas paletas convivem dentro do mesmo aplicativo

**Spec:** §0.2 manda seguir `cakto-design` v2.0, base `#0E0E0E`.

**Código:** o shell, a tabela e o Gantt usam uma família de cinzas azulados (`#161c24` de fundo, `#212b36` nos cartões, `#919eab` no texto secundário) — que não é a v2.0 nem a v1.0. O Kanban usa outra família, quente e neutra (`#1E1E1E` no card, `#F2F1EC` no texto, `#83857C` no secundário, `#E88178` no vermelho), essa sim mais próxima da v2.0.

**Consequência:** navegar do Gantt para o Kanban é atravessar duas identidades visuais diferentes. É a divergência visual mais visível da ferramenta e a que mais justifica o passo 4.

### C4 · A fonte declarada não é a fonte carregada

**Spec:** §2 e §0.2 — Public Sans, conforme `cakto-design` v2.0.

**Código:** a família tipográfica do shell pede `'Public Sans'` com fallback de sistema, mas o `<link>` do Google Fonts baixa **Inter** e JetBrains Mono. Public Sans nunca chega ao navegador.

**Consequência:** a ferramenta renderiza hoje na fonte de sistema (Segoe UI no Windows), não em Public Sans nem em Inter. É de um clique resolver, mas muda a aparência de todas as telas — então entra no passo 4, não antes.

### C5 · Os nomes das views não batem

**Spec:** "Inserção de Dados", "Gantt / Roadmap", "Config".

**Código:** a barra lateral diz "Quadro Principal", "Visão geral (Gantt)", "Demandas (Kanban)" e "Squads & sprints". O título interno da página do Gantt ainda é "Gantt / Roadmap" — ou seja, o código também está inconsistente consigo mesmo.

**Consequência:** conversar sobre a ferramenta fica confuso quando o documento e a tela usam nomes diferentes para a mesma coisa. Escolher um conjunto e travar nos dois lugares.

**Decisão (07/09/2026):** nomes travados nos dois lados — **Roadmap · Visão geral (Gantt) · Kanban de iniciativas · Squads & sprints**. "Quadro Principal", "Inserção de Dados" e "Demandas" saem de spec e código. Spec atualizada (§1, §1.1, §2.2, §5); código no passo 3.

**Executado parcialmente (09/09/2026, 3b Roadmap-5):** "Quadro Principal" → "Roadmap" no título da view, na barra lateral e na trilha. "Visão geral (Gantt)" e "Squads & sprints" já estavam certos. "Demandas" → "Kanban de iniciativas" entra com a tradução do Kanban.

**Executado (09/09/2026, 3b Kanban):** "Demandas (Kanban)" → "Kanban de iniciativas" na barra lateral, na trilha e no título da view; trilha do Gantt → "Visão geral (Gantt)". C5 completo.

### C6 · "Demanda" está na interface, e é termo proibido

**Spec:** §0.1 fixa **iniciativa** como o termo do Kanban. O `CLAUDE.md` lista "demanda" entre os sinônimos que não entram.

**Código:** a view se chama "Demandas", o campo de título diz "Nome da demanda", e a chave do modelo é `data.demandas`. Ao mesmo tempo, o modal se chama "Nova iniciativa" e os toasts dizem "Iniciativa adicionada", "Iniciativa removida".

**Consequência:** os dois termos convivem na mesma tela. Como `demandas` também é o nome da chave no JSON, corrigir mexe no modelo de dados (A2) — as duas decisões andam juntas.

**Decisão (07/09/2026):** termo oficial é **iniciativa**. A chave do modelo passa a `iniciativas` (§3); os textos da interface acompanham no passo 3.

**Executado na interface (09/09/2026, 3b Kanban):** nenhum texto visível usa "demanda" ("Nome da iniciativa", "Kanban de iniciativas"). A chave `demandas` fica para 4b (A2).

### C7 · Quarters arquivados somem do seletor do header

**Spec:** §7 — "quarters anteriores ficam arquivados e acessíveis"; §3 — arquivado é "fora do fluxo, ainda acessível".

**Código:** o menu do header filtra os arquivados (só mostra o ativo, se ele estiver arquivado). Para voltar a um quarter passado é preciso ir em Squads & sprints e clicar em "Ativar" — o que muda o quarter ativo de todo mundo, não só a sua visualização.

**Consequência:** consultar o Q2 encerrado exige alterar o estado do board. Não existe "só olhar" um quarter arquivado.

**Decisão (07/09/2026):** seletor lista todos os quarters, arquivados em seção própria; selecionar arquivado muda só a visualização local, somente leitura, com banner "Quarter arquivado — somente leitura". "Ativar" em Squads & sprints segue como única ação compartilhada. Quarter em visualização é estado local, fora de `data` (`SPEC.md` §3 e §7). Executar após a reescrita.

**Executado (09/09/2026, 3b shell):** `state.viewQuarter` (local); seletor com todos os quarters, ativos primeiro ("· ativo" marcado), seção "Arquivados"; qualquer quarter que não o ativo abre em somente leitura — banner no header e toda mutação recusada com "Quarter em visualização — somente leitura" (um só ponto: `mut()`); Ativar em Squads & sprints continua a única ação compartilhada e volta a visualização ao ativo.

### C8 · Quantas squads são, afinal

**Spec:** §1 — "6 squads, sob um GPM".

**Código:** o seed do Q3 traz 5: Payment, Platform, Growth, Cakto Members, Bank & App. A tabela de prefixos do Kanban lista 7 nomes: esses cinco, mais Partnership, mais "Cakto Bank" como sinônimo de "Bank & App".

**Consequência:** três listas diferentes em três lugares. Como o prefixo do ID do card (`PAY-101`) sai dessa tabela, uma squad fora dela recebe um prefixo improvisado a partir das letras do nome. Vale fixar a lista canônica.

**Decisão (07/09/2026):** cinco squads canônicas — Payment (PAY) · Platform (PLA) · Cakto Members (MEM) · Bank & App (BNK) · MRR & Fiscal (MRR). Growth e Partnership saem; "Cakto Bank" → "Bank & App" via `normalize()`; squad fora da lista recebe prefixo das três primeiras letras e aviso. Tabela em `SPEC.md` §3.

**Executado (09/09/2026, 3b Config-2):** `KSPEC` e seed com as cinco squads (itens de Growth passaram para MRR & Fiscal como dados de exemplo), `normalize()` renomeia "Cakto Bank", aviso "fora da lista canônica · prefixo XXX" na lista de squads da Config. Dados do protótipo não são preservados além disso (decisão do GPM: interface nova nasce com dados atuais).

**Revisado (09/09/2026):** não há lista fechada. `KSPEC` e o aviso saem; `squad.prefix` (editável, único no quarter) e `squad.archived` entram no modelo; arquivar/excluir com travas (itens, backlog, iniciativas; excluir só sem histórico). Seed com cinco squads fica como dado inicial. `SPEC.md` §3 "Squads: estrutura e prefixo", `decisions.md` "Squads: sem lista fechada".

### C9 · Promover do backlog gera item com início igual ao fim

**Spec:** §5.4 — promover "vira item com datas default e status `backlog`".

**Código:** o item nasce com início e fim iguais à data de início do quarter. O mesmo vale para "+ Adicionar item ao roadmap".

**Consequência:** no Gantt, isso vira uma barra de largura mínima grudada na borda esquerda do quarter, com aparência de item real de um dia. Se a intenção era "sem datas" — que a spec permite, já que data vazia é válida e não renderiza barra —, o comportamento atual é o oposto: cria ruído visual em vez de omitir.

**Decisão (07/09/2026):** item novo (promovido ou adicionado) nasce **sem datas**; sem barra no Gantt até o PM definir (`SPEC.md` §5.4 e §6.2). Executar após a reescrita.

**Executado (09/09/2026, 3b Roadmap-1):** `novoItem()` e `promoverAoRoadmap()` criam o item com `s = e = ""`.

### C10 · A definição de "concluído" no KPI é mais larga que a de status

**Spec:** §6.1 — KPI de "concluídos (com %)". §4.1 define `entregue` como um status.

**Código:** o KPI conta todo item com 100% **ou** status Entregue. Um item em Homologação com 100% preenchido entra na conta de concluídos.

**Consequência:** o número do KPI pode ser maior que a quantidade de itens verdes no Gantt, e não há nada na tela explicando a diferença. Vale decidir se "concluído" é o status ou o percentual — hoje é os dois.

**Decisão (07/09/2026):** concluído no KPI = `st = entregue`, exclusivamente; percentual é progresso (`SPEC.md` §6.1). Executar após a reescrita.

**Executado (09/09/2026, 3b Gantt-1):** KPIs calculados sobre todos os itens que passam no filtro, colapsados ou não; concluído = `entregue`. Resolve também a quirk do colapso registrada abaixo.

**Conserto confirmado (08/09/2026) — executar em 3b junto com C10:** os KPIs do Gantt são acumulados na mesma varredura que desenha as linhas, então **itens de squads ou categorias colapsadas não entram na conta** — colapsar Payment muda "itens no roadmap". Encontrado na tradução (passo 3a, `acumulaKpi()` em `data.js`), preservado por fidelidade. Conserto: contar sobre os itens filtrados, independentemente do colapso.

### C11 · Campos numéricos da Config aplicam o limite a cada tecla

**Spec:** §7 — "duração da sprint (dias, default 14), nº de sprints"; sem regra de edição.

**Código:** os campos "Duração da sprint" e "Número de sprints" validam a cada tecla digitada (`onChange` do React), com limites 7–30 e 1–16. Digitar "14" vira 7 no "1" e 30 no "4" — só se chega a um valor intermediário selecionando o campo inteiro e digitando de uma vez, ou pelas setinhas. Confirmado no Claude Design em 09/09/2026 (bloco A2 do roteiro); a tradução 3a reproduz o comportamento.

**Consequência:** o PM não consegue digitar a duração da sprint; na prática todo quarter fica com 7 ou 30 dias se ele não descobrir o truque.

**Decisão (09/09/2026):** trocar o campo de duração por um **seletor** com os valores `7 · 14 · 21 · 28` (1 a 4 semanas). "Número de sprints" fica como está até decisão.

**Resolvido (09/09/2026, 3b Config-1):** seletor implementado em `config.js`; `normalize()` corrige durações fora da lista para 14. `SPEC.md` §3 e §7 atualizados.

---

## Fechamento de 3a (09/09/2026)

As quatro views estão traduzidas para Preact + htm (pedidos 0–6) e conferidas no browser, item a item do roteiro. **Desvios aceitos**, únicos em que a tradução não é literal:

- **Button e Icon do design system** — só existiam no bundle do Claude Design; reconstruídos em `js/ui.js` a partir de `_ds/` (mesmos tamanhos, variantes, cores e caminhos SVG).
- **Props do Claude Design** (`paginaInicial`, `mostrarRotuloBarra`, `destacarHoje`) — viram constantes em `app.js` (SPEC §2).
- **Fontes** — o protótipo carregava Inter e declarava Public Sans; a tradução mantém exatamente isso (C4 fica para o passo 5).
- **Cores** — hex do protótipo movidos para `css/tokens.css` (paleta provisória); enums referenciam tokens. Mesmo resultado na tela.

**Diff de dados** (roteiro, parte B): mesma base — `base-prototipo.json`, o Salvar do protótipo no Claude Design em 08/09 — e as mesmas 20 ações executadas no app novo via DOM (`novo.json`) e na lógica do protótipo via Node (`prototipo.json`). Resultado em `docs/validacao-passo3/diff-dados.md`: **todas as diferenças são as esperadas pelo 3b já aplicado** (`prefix`/`archived` por squad — C8; `anexo*` fora — A4; item promovido sem datas — C9; hora de criação do card). Nenhuma inesperada.

**Lógica**: teste de equivalência contra a lógica extraída do export — 304 comparações iguais (`scratchpad` do Claude; reproduzível com `node teste-equivalencia.mjs js/ <pasta com proto-logic.js e proto-class.js>`).

**Fica em aberto para depois de 3a:** A2 (`demandas` → `iniciativas`, com a remodelagem do 4b), A5/B1 (backend, passo 4), A10, B3, C1–C4 (passo 5), B9 (evolução).

---

## Pendências desta conciliação

1. **Fora de escopo aqui:** o Kanban (A1) foi conciliado apenas contra `SPEC.md`, que o declara não implementado. A conciliação real dele é contra `docs/decisions.md` e `docs/kanban-card-spec.md` — trabalho separado, a fazer antes do passo 6.
2. **Não verificado:** o comportamento em execução. Tudo aqui vem da leitura do código. Divergências que só aparecem rodando — erros de renderização, o comportamento real do arrastar, o parser contra a planilha de verdade — exigem abrir a ferramenta.
3. **B2 é bug, não escopo.** Está listado em (b) por consistência de formato, mas não é decisão de produto: é conserto. Fica para um pedido próprio, depois das erratas.
