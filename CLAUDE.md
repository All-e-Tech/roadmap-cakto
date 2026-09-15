# Roadmap Cakto — ferramenta interna de roadmap por squad

Protótipo funcional em validação, usado pelos PMs das 5 squads e pelo GPM. Single-page app sem build (HTML/CSS + Preact e htm via CDN) com quatro views: Roadmap (tabela), Visão geral (Gantt), Kanban de iniciativas, Squads & sprints. Ainda sem deploy.

Quem trabalha aqui é um GPM com pouca experiência de backend. Explique decisões técnicas em termos de consequência para o produto, não de implementação. Antes de qualquer mudança estrutural, diga o que muda para quem usa.

## Antes de mexer em qualquer coisa

1. Ler `SPEC.md` inteiro — é a fonte da verdade dos requisitos. O glossário (§0.1) fixa os termos: **item**, **categoria**, **iniciativa**. Não usar sinônimos.
2. Ler `skills/cakto-design/SKILL.md` antes de tocar em qualquer coisa visual. Tokens em `skills/cakto-design/tokens.css`, componentes em `components.md`.
3. Ler `skills/cakto-context/SKILL.md` para tom de voz em textos de interface (estados vazios, mensagens, labels).
4. Ler `docs/decisions.md` antes de tocar em qualquer coisa do Kanban de intake.

## Convenções

- **Sem build, sem bundler.** Preact + htm via CDN é a única camada de renderização aceita; lógica de negócio em módulos sem dependência de Preact. Módulos via `<script type="module">` em `index.html`. Se algo parecer exigir build, parar e discutir.
- **Uma responsabilidade por arquivo** em `js/`: `app.js` (montagem e roteamento), `components/` (um arquivo por view: `table.js`, `gantt.js`, `kanban.js`, `config.js`), `data.js` (modelo, seed, normalize, enums), `io.js`, `sync.js`. Lógica (`data`, `io`, `sync`) nunca importa Preact. Não criar arquivos novos sem justificar.
- **Cores só por token.** Nenhum hex em `app.css` ou em `js/`. Se um token não existir, propor o token — não inventar o hex.
- **Dados só em `data.js`.** Seed, enums de status/previsão e `normalize()` vivem lá. Nada hardcoded nas views.
- **Acesso a dados só por `data.js`.** Nenhum componente lê `data.quarters[…].items` ou `data.iniciativas` direto — usa funções de `data.js`. Motivo: o modelo pode ser invertido (A.1, H3) e a inversão deve ficar contida em um arquivo.
- **O objeto `data` é o contrato.** Qualquer mudança de forma no JSON (§3 da spec) exige: atualizar `normalize()` para retrocompatibilidade, atualizar a spec, e avisar explicitamente que é mudança de modelo.
- **Português brasileiro** em toda a interface e nos comentários de código.
- **Diffs pequenos.** Uma tarefa por pedido. Refatoração e mudança de comportamento nunca no mesmo diff.

## Nunca

- Alterar `SPEC.md` ou `docs/decisions.md` sem pedir confirmação — são documentos de decisão, não de código.
- Mudar comportamento durante refatoração. Se encontrar um bug no meio de uma refatoração, anotar e reportar; corrigir em pedido separado.
- Adicionar dependência externa sem avisar. A única aceita hoje é SheetJS via CDN.
- Tocar no vínculo Iniciativa → Roadmap (spec, Anexo A.1) antes do passo 4b. A definição de trabalho está registrada em A.1 ("1 iniciativa = 1 item", 09/09/2026); a modelagem e a implementação são o passo 4b, depois do backend.
- Usar termos fora do glossário (épico, demanda, task, feature).

## Sequência planejada de trabalho

Em ordem. Cada passo é um ou mais pedidos separados; não antecipar o seguinte.

1. **Conciliação** — comparar `SPEC.md` com o código exportado; gerar `docs/divergences.md` listando: (a) o que o código faz e a spec não descreve, (b) o que a spec descreve e o código não faz, (c) contradições. Não corrigir nada — só listar. O GPM decide lado a lado.
2. **Erratas** — aplicar `erratas.md` em `docs/decisions.md`.
2b. **B2 — Restaurar** — ligar o botão à função existente; único conserto antes da reescrita, porque devolve o contorno exporta/importa.
3a. **Tradução fiel** — traduzir o componente do Claude Design para Preact + htm, conforme `SPEC.md` §2.2, lógica migrando intacta. **Zero mudança de comportamento, inclusive do que já se sabe errado** — o protótipo é a referência; a regra vale para cada pedido de tradução. **A validação lado a lado detalhada é do Claude**, no browser, antes de entregar, com `docs/validacao-passo3/roteiro.md` como referência; o GPM faz só um teste de fumaça por view. O diff de dados (20 ações, JSONs idênticos) roda **uma vez, no fechamento de 3a**. `css/tokens.css` nasce como paleta provisória do protótipo (cabeçalho "substituir no passo 5"); estado no padrão do protótipo (mutar `data` e re-renderizar).
3b. **Migrações decididas — por view.** Assim que uma view é traduzida e conferida, aplicar em seguida as migrações decididas que pertencem a ela, um pedido por grupo, cada um mudando comportamento de propósito e dizendo o que muda para quem usa. Grupos: (1) `normalize()` — `demandas`→`iniciativas`, "Cakto Bank"→"Bank & App", descarte de `anexo*`, colunas fixas sem `kcols` (A2–A4); (2) rótulos das views e textos (C5, C6); (3) seed com 5 squads, prefixos e aviso (C8); (4) consertos B4, B5, B8, C9, C10; (5) quarter em visualização (C7); (6) confirmação antes de substituir (A11, B2). Referência: `docs/divergences.md`.
4. **Backend** — Vercel + Supabase (Postgres), decidido em 09/09/2026 (`SPEC.md` §2.1): `api/board.js` com adaptador Supabase e fallback em memória, `sync.js` conforme §9, deploy conforme §10. Antes do visual porque multiusuário desbloqueia o uso pelos PMs; visual não.
4b. **1 iniciativa = 1 item — modelagem e implementação** conforme `SPEC.md` A.1 (definição de trabalho de 09/09/2026). O GPM decide os pontos abertos listados em A.1, partindo de `docs/kanban-card-spec.md` §4 como proposta a adotar ou descartar explicitamente. Mudança de modelo: `normalize()` migra ao carregar; o storage é documento.
5. **Migração visual** — aplicar `cakto-design` v2.0 conforme `SPEC.md` §12, na ordem lá descrita. Screenshot antes/depois por view.
6. **Kanban de intake** — conciliar a view existente contra `docs/decisions.md` e `docs/kanban-card-spec.md`, gerar `docs/divergences-kanban.md`, decidir, complementar. Vínculo com o roadmap continua em aberto até decisão.

## Ao terminar um pedido

Dizer em duas linhas: o que mudou, e o que o GPM deve abrir no browser para conferir. Sem resumo do código.
