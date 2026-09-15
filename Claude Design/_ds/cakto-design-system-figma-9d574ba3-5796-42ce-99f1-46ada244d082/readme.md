# Cakto — Design System

Cakto é uma plataforma brasileira de pagamentos e produtos digitais (**Cakto Pay**).
O produto cobre quatro superfícies: **checkout**, **painel do produtor** (dashboard,
produtos, vendas, financeiro), **afiliados** e **área de membros** do aluno. É um app
web **dark-first**, inteiro em **Public Sans**.

## Fontes deste design system

| Fonte | Onde |
|---|---|
| Arquivo Figma | `Cakto - Arquivo parcialmente salvo 31-08-2026.fig` — 3 páginas (UI - Cakto, Cakto-Split, Style Guide), 108.790 nós, 1.030 Figma Variables. Montado como VFS somente-leitura. |
| Codebase anexado | `ds-project/` — extração anterior via REST API (arquivo `laEs2iqvWR5YOFw7zdviaL`): `tokens/cakto-tokens.css`, `docs/cakto-design-system.md`, previews de foundations/componentes e a tela 6.0 Financeiro validada contra produção. |
| Upload | `uploads/cakto-logo.png` → `assets/cakto-logo.png` |

Os valores de token e as medidas de componente vêm desses dois materiais, cruzados.
Onde divergem, o arquivo Figma vence — está anotado no ponto.

## Índice

- `styles.css` — entrada global (só `@import`s). Linke este arquivo.
- `tokens/` — `fig-tokens.css` (as 1.030 Figma Variables cruas, ver ressalva abaixo),
  `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `shape.css`,
  `elevation.css`, `gradients.css`, `components.css`, `primitives.css`.
- `components/` — primitivas React (lista abaixo).
- `assets/` — `cakto-logo.png`, `images/` (bitmaps do arquivo), `icons/` (105 glifos).
- `guidelines/` — cards de specimen das fundações.
- `ui_kits/` — `painel-produtor/`, `checkout/`, `area-de-membros/` (recriações clicáveis).
- `templates/` — os mesmos três surfaces como Design Components prontos para copiar:
  `painel-produtor/PainelProdutor.dc.html`, `checkout/Checkout.dc.html`,
  `area-de-membros/AreaDeMembros.dc.html`.
- `SKILL.md` — versão Agent Skill deste sistema.

### Componentes

**core** — `Button`, `IconButton`, `Logo`, `Tag`, `Label`, `Badge`, `Avatar`, `Divider`, `Flag`
**forms** — `Input`, `SearchInput`, `Select`, `Checkbox`, `CheckboxText`, `Checkmark`, `Toggle`, `ThemeToggle`, `PaymentMethod`, `DateField`, `CopyField`, `FormHelperText`
**navigation** — `NavItem`, `NavHorizontal`, `NavHorizontalItem`, `MenubarItem`, `MonthYearDropdown`, `Tabs`, `FilterChip`, `Steps`, `Breadcrumbs`, `Menu`, `MenuItem`, `MenuList`, `PageTitle`, `WeekStrip`, `StepText`
**data** — `Card`, `StatCard`, `WidgetSummary`, `DashboardHeader`, `Welcome`, `Table`, `Toast`, `Modal`, `Tooltip`, `ProgressBar`, `Calendar`, `CalendarTile`, `LogExpand`, `HistoricoPagamento`, `CreditCardPreview`, `Chip`, `TableRow`, `TableCell`, `Pagination`, `Drawer`, `EmptyState`, `FeeRow`
**charts** — `ChartArea`, `ChartBar`, `ChartDonut`, `Sparkline`, `ChartLegend`, `ChartAxis`
**surfaces** — `Paper`, `Typography`, `Image`, `Carousel`, `ShapeBlur`, `ScrollArea`, `ColorSwatch`, `Cursor`
**members & comércio** — `CardContinueAssistindo`, `CardCurso`, `CardAula`, `CardVitrine`, `CardResgate`, `AfiliadoOptions`, `Medalha`, `Cupom`, `PriceRow`
**icons** — `Icon` (105 glifos, ver `assets/icons/Icon.d.ts`)

**figma-aliases** — wrappers finos que expõem os componentes acima sob o **nome literal
da família no Figma**, para quem procura pelo nome que vê no arquivo. Em código novo use
o componente real. São eles: `AfiliadoOptionsFig`, `AnalyticsWidget`, `AppWelcome`,
`AppWidget`, `AppWidgetSummary`, `BackgroundShapeCircle`, `BackgroundShapeSquare`,
`ButtonsDarkBG`, `CalendarTileFig`, `CalendarWrapper`, `CardAulas`,
`CardCarrinhoResgate`, `CardCursos`, `CardDashboard`, `CardResgateFig`,
`CardVitrineFig`, `ChartColumn`, `ChartColumnStacked`, `ChartElementsLegends`,
`ChartGraph`, `ChartPie`, `ChartRadar`, `ChartSparkline`, `CheckboxTextFig`, `Cupon`,
`CustomTab`, `CustomTabs`, `DashboardHeaderFig`, `Dia`, `DiaCalendar`, `EclipToggle`,
`FiltroPeriodo`, `GeralPreco`, `Icons`, `LayoutDashboard`, `LogExpandFig`,
`MenubarItemFig`, `Menus`, `ModalidadeDePagamento`, `MonthYearDropdownFig`,
`NavHorizontalBlogMenu`, `NavHorizontalInvoiceMenu`, `NavHorizontalItemFig`,
`NavHorizontalJobMenu`, `NavHorizontalOrderMenu`, `NavHorizontalProductMenu`, `AccountPayment`, `CardHeaderFig`, `CreditCardDark`, `DateFieldFig`, `FlagsAustralia`, `FlagsChina`, `FlagsJapan`, `FlagsPortugal`, `HistoricaPagamento`, `IconsSetsFlags`, `IconsSetsNavbar`, `IconsSetsPayments`, `IconsSetsSocials`, `MainContainer`, `MaiosDePagamentoDash`, `PageTitleFig`, `Semanas`, `StateCompleted`, `StateTransition`, `StepTextFig`, `BreadcrumbsFig`, `CalendarFig`, `CardVender`, `ChartElementsAxis`, `Checkout`, `Cobraca`, `ColorFig`, `DipararPurchase`, `FormHelperTextFig`, `HeaderAluno`, `HelperInstances`, `Input`, `Materiais`, `Menubar`, `NativeBrowserScroll`, `TableCellAction`, `TableCellVisualization`, `TableOrderRow`, `TableOrderRowQuickView`, `Title`, `AnalyticsConversionRates`, `AnalyticsCurrentSubject`, `AnalyticsCurrentVisits`, `AnalyticsTask`, `AnalyticsTrafficbySite`, `AnalyticsWebsiteVisits`, `AppCarouselFeaturedApp`, `AppCurrentDownload`, `AppTopAuthors`, `AppTopInstalledCountries`, `AppTopRelatedApplications`, `AppTotalInstalled`, `AvatarFig`, `BadgeFig`, `ButtonFig`, `CarouselFig`, `ChartAreaFig`, `ChartBarFig`, `ChartDonutFig`, `CheckboxFig`, `ChipFig`, `DividerFig`, `IconButtonFig`, `IconFig`, `ImageFig`, `LabelFig`, `LogoFig`.

#### Adições intencionais
- `Icon` — wrapper sobre o set de glifos extraído; o arquivo não define um componente
  "Icon" único, define famílias de ícones. O wrapper existe para que o set seja usável.
- `StatCard`, `ProgressBar`, `PriceRow` — nomes nossos para padrões que o arquivo
  desenha repetidamente (cards de saldo, barra de meta, linhas do resumo de preço) sem
  nomear como component set.

## CONTENT FUNDAMENTALS

Tudo em **português do Brasil**, sem exceção — inclusive nomes de componentes de
produto ("Faturamento", "Serviços bancários", "Continue assistindo").

**Tom.** Direto e operacional. O produto fala de dinheiro, então evita entusiasmo e vai
ao número: "Saldo Disponível BRL · R$ 5.797,11". Nada de saudação, nada de exclamação —
exceto em avisos de risco, onde a exclamação carrega o peso: "Conta negativada!".

**Pessoa.** O produto se dirige ao usuário como **você**, e nomeia as coisas do usuário
com possessivo de primeira pessoa nos itens de menu: "Minhas Vendas", "Meus Afiliados",
"Seus clientes", "Minhas chaves pix". A marca nunca fala em primeira pessoa do singular.

**Caixa.** Títulos de tela e de card em **capitalização de frase** ("Serviços bancários",
"Informação de contato"), não title case. Itens de menu variam no arquivo entre
"Minhas Vendas" e "Seus clientes" — reproduza o que o Figma traz. Caixa alta só em
badges (`NOVO`, `BETA`) e nos styles Hat/overline.

**Rótulos.** Curtos, sem artigo: "Valor Recebido", "Taxa", "Status", "Tipo", "Baixar".
Botões são verbo + objeto: "Efetuar Saque", "Adicionar produto", "Pagar boleto",
"Transferir com pix". Moeda sempre `R$ 0.000,00`; a sigla da moeda aparece colada ao
rótulo quando há mais de uma ("Saldo Disponível BRL").

**Estados vazios.** Uma linha, 12/18, cinza, centralizada: "Nenhum registro encontrado".
Sem ilustração, sem CTA.

**Emoji.** Não. Nenhum emoji em UI. Ícones fazem esse trabalho.

## VISUAL FOUNDATIONS

**Temperatura.** Escuro azulado, não neutro: as superfícies `#161c24 → #212b36 → #333e49`
são cinzas com viés azul. O verde é a única cor quente-fria de destaque; o resto da tela
é monocromático. Nada de gradiente colorido de fundo.

**Os três verdes têm papéis fixos e não são intercambiáveis:**
- `#0f7864` **tertiary** — estrutural: CTA, tab underline, toggle ligado, checkbox
  marcado, fundos de seleção com alpha 15–20%.
- `#36b37e` **secondary** — texto e estado: item de nav ativo, tags "Ativo", cor do glow.
- `#65a76b` **primary** — decorativo: dots, outline de card em destaque, ponta clara do
  gradiente da marca.

**Tipografia.** Public Sans em tudo, 300→800. A escala é curta e pesada: títulos 700,
corpo 400, subtítulos 600. O texto mais usado do app é Body Small 14/20. A única fuga é
Space Grotesk 10.4px no título do card Faturamento — não a generalize.

**Espaçamento.** 4 · 6 · 8 · 12 · 16 · 24 · 32. Card = pad 24 / gap 16; sidebar = pad
32/24/8/24 e gap 24; tabela = pad 16/32. O gap 10 aparece muito dentro de componentes
(botão) mas não é uma variável nomeada.

**Raios.** 8 botão/input · 16 card · 24 modal/frame grande · 100 pill. Valores
fracionários existem em componentes específicos (13.56 no card-cursos, 7.5 no miolo do
card Faturamento) — copie, não arredonde.

**Fundos e imagens.** Sem full-bleed, sem textura, sem padrão repetido, sem ilustração
desenhada. Imagem aparece só como **capa de produto/aula**, sempre dentro de card e
cortada em `cover`. Nas capas de "continue assistindo" a imagem fica a **50% de
opacidade** atrás do texto; nos cards de aula há um gradiente de proteção
`rgba(22,28,36,0) → .92` de cima para baixo. O tratamento da imagem é neutro — sem
filtro, sem grão, sem duotone.

**Sombra.** Uma assinatura: `-3px 8px 24px rgba(0,0,0,.30)`. O deslocamento é para a
**esquerda** — mantenha o x negativo, inclusive no disco do toggle de tema
(`-1px 1px 4.9px`). As sombras z1/z8/card existem para superfícies claras.

**Hover.** Botão preenchido: **glow** `0 4px 14.2px` na cor do botão a 28% — não escurece
nem clareia o fundo. Botão outline: **preenche** com a cor da borda. Nav item: fundo
`#212b36`. Filtro-período: `#29343f` (hover) e `#333d48` (ativo). Checkbox: halo circular
`rgba(15,120,100,.15)` na hit-area de 40. Card: ganha a sombra assinatura.

**Press / seleção.** Não há estado de "shrink" no arquivo. Seleção é sempre cor: fundo
verde com alpha (15% em tiles de pagamento, 20% em nav e steps pendentes) + borda ou
texto verde. Nunca escala, nunca sombra interna.

**Foco.** A borda do campo vira **branca**. Não há anel de foco no arquivo — o
`--ring` no CSS está marcado como extra inferido e não deve ser usado sem checar.

**Bordas.** Hairline 1px é a regra (`#333e49` no dark). 2px só em tab underline. 4px em
dois lugares: outline de card em destaque (verde `#65a76b`) e **borda esquerda** dos
cards de saldo nas telas reais — verde = disponível, warning = pendente. A única borda
decorativa do sistema é o gradiente ouro (~1.5px) do card Faturamento.

**Transparência e blur.** Alpha sim, blur não. Não há `backdrop-filter` em lugar nenhum.
Os alphas recorrentes: 15% e 20% do verde tertiary (seleção), 50% do `#919eab`
(divisor da sidebar), 20% do `#919eab` (borda de input), 26% (disabled herdado do MUI).

**Animação.** Discreta e curta: transições de cor/sombra em ~150ms, o thumb do toggle em
200ms. Sem bounce, sem spring, sem entrada animada de tela. Se um movimento precisa de
curva, use `ease` — o arquivo não especifica easing customizado.

**Layout.** Sidebar fixa de 304px com divisor à direita; conteúdo com padding lateral
de 32. O checkout usa uma composição fixa: página 1536, coluna de formulário 752
deslocada 112 da esquerda, resumo à direita, gap 24. Modais centralizados sobre
overlay preto a 60%.

**Cartões.** Fundo `#212b36`, raio 16, padding 24, sombra assinatura, sem borda por
padrão. A borda aparece só quando o card precisa de acento (esquerda 4px) ou destaque
(outline 4px). Tabelas são um card: container r16, header `#333e49` com os dois cantos
superiores arredondados.

## ICONOGRAPHY

O arquivo não tem um icon font nem um sprite próprio. Ele consome **sets iconify**
colados como componentes: `solar` (bold duotone — carteira, cartão, medalha, usuários),
`Interface, Essential` (traço, o set mais usado da UI), `material` (`ic:baseline-*`,
`material-symbols:*`) e marcas (`simple-icons:nubank`, `simple-icons:picpay`,
`logos:paypal`, `logos:apple-pay`, Visa, Master, `mdi:ethereum`, `token-branded:*`).

Regras de uso: **grid 24px**, traço **1.5px**, `fill: none` + `stroke: currentColor` nos
ícones de traço. Sociais em círculo de 40px. Ícone dentro de botão = 16px; tile de ação
rápida = 40px. Ícones nunca carregam cor própria — herdam `color`.

105 glifos foram extraídos do arquivo para `assets/icons/icon-data.js` e são renderizados
por `<Icon name="…" size={24} />`. Os nomes válidos estão em `assets/icons/Icon.d.ts`.
**Nada de CDN e nada de SVG desenhado à mão** — se faltar um glifo, extraia do arquivo.

Emoji: não usado. Caracteres unicode como ícone: só o `×` de fechar em modal/chip.

## Marca

`assets/cakto-logo.png` é o único ativo de marca fornecido — **não existe SVG do
logo** no material de origem. `<Logo variant="wordmark" />` renderiza o nome em Public
Sans 800 para os casos em que o PNG não serve. Não redesenhe a marca.

## Ressalvas conhecidas

1. **`tokens/fig-tokens.css` (1.030 variáveis)** é o dump literal das Figma Variables do
   arquivo. Elas são majoritariamente do **kit MUI/Minimal** importado, não do sistema
   Cakto. Está importado **primeiro** em `styles.css` para ficar disponível, e os tokens
   Cakto (`colors.css` etc.) o sobrescrevem. Use os tokens Cakto.
2. **Text styles**: o `METADATA.md` do arquivo não lista nenhum TEXT/EFFECT style
   nomeado, e `fig-typography.css` saiu vazio. A escala tipográfica aqui vem dos styles
   nomeados registrados na extração anterior (`ds-project/docs`), confirmada contra os
   tamanhos de uso do arquivo.
3. **Checkout**: o tema `.checkout` light com verde `#095a49` não existe no Figma. O
   checkout do arquivo é dark. O bloco fica documentado, mas o UI kit segue o Figma.
4. **Nova Identidade** (`.nova`): rebrand dark-only, só fundação (cores, superfícies,
   texto). Não há componentes desenhados nesse tema. Usar só quando pedido.
5. **Cobertura de componentes — o que foi pulado e por quê.** O arquivo declara 238
   component sets + 332 símbolos avulsos (327 famílias na contagem do compilador). Este
   sistema implementa as famílias **autorais da Cakto** (Style Guide + telas reais) mais
   os primitivos genéricos que o produto realmente consome (`Paper`, `Typography`,
   `Image`, `Carousel`, `Chart/*`, `App/Widget*`). Ficam **deliberadamente de fora**:

   - **Duplicatas de página** — o arquivo repete a mesma família em UI-Cakto, Cakto-Split
     e Style Guide (`Button` aparece 2×, `Avatar` 2×, `Checkbox` 4×, `card-aulas` 2×…).
     Cada uma foi construída **uma vez**; a contagem de 327 conta as cópias.
   - **Variantes de estado tratadas como família** — `Property1Default`, `Property1Hover`,
     `TypePrimaryHoverNo`, `StateSelected` e ~180 irmãos são *estados* de componentes já
     construídos, expostos aqui como props (`state`, `hover`, `selected`), não como
     componentes separados.
   - **Glifos de ícone** — as ~243 entradas de `Icons`/`icons/sets-*` são o set de ícones.
     Vivem em `assets/icons/icon-data.js` (105 glifos extraídos) atrás de `<Icon />`, não
     como 243 componentes.
   - **Biblioteca importada não usada pela Cakto** — `Flags/*`, `Cursor`, `Color`,
     `Helper/Instances`, `_Native Browser Scroll`, `_Library / Instance Slot`,
     `Analytics/*` e `App/Top*` são peças do kit MUI/Minimal e de utilitários de arquivo
     Figma. Portá-las criaria uma segunda cópia de uma biblioteca pública com valores que
     ninguém no time reconhece como "Cakto".
   - **Frames de rascunho** — `Frame 2`, `Frame 1087358`, `Component 1`, `Group 35683`,
     `box`, `cactus`, `TESTE`, `Rascunhos` e afins não têm semântica de componente.

   Se algum desses grupos for de fato usado em produção, me diga qual e eu construo.

   **O que sobra na contagem (verificado em 31/08/2026).** Depois de 167 famílias
   construídas, o que o compilador ainda lista é exatamente isto: `Component 1` (×4),
   `filtro-período` (×3), `Frame 2`, `Frame 1087358`, `Frame 1087379` e mais ~92 do mesmo
   tipo — **cópias da mesma família em páginas diferentes** e **frames sem semântica de
   componente**. `filtro-período` está construído como \`FilterChip\` (+ alias
   \`FiltroPeriodo\`); as três entradas são as três páginas do arquivo. A auditoria de
   valores do compilador contra os nós de origem retorna **zero divergências**.

   **Mapa nome-Figma → nome-aqui.** O verificador conta famílias por nome literal do
   arquivo, então estas aparecem como "não construídas" mesmo estando implementadas:

   | Família no Figma | Componente aqui |
   |---|---|
   | \`App/Welcome\` | \`Welcome\` |
   | \`App/WidgetSummary\`, \`App/Widget\`, \`Analytics/Widget\` | \`WidgetSummary\` |
   | \`background/shape-circle\`, \`background/shape-square\`, \`cyan-shape-blur\` | \`ShapeBlur\` |
   | \`Chart/Area\` | \`ChartArea\` |
   | \`Chart/Bar\`, \`Chart/Column\`, \`Chart/ColumnStacked\` | \`ChartBar\` |
   | \`Chart/Donut\`, \`Chart/Pie\` | \`ChartDonut\` |
   | \`Chart/Sparkline\` | \`Sparkline\` |
   | \`Chart/Elements/Legends\` | \`ChartLegend\` |
   | \`Dashboard/Header\`, \`Layout/Dashboard\` | \`DashboardHeader\` |
   | \`?Paper?\`, \`?Typography?\`, \`?Select?\`, \`?Menu?\`, \`?MenuItem?\`, \`?MenuList?\`, \`?Chip?\`, \`?Badge?\`, \`?Avatar?\`, \`?Icon?\`, \`?FormHelperText?\` | \`Paper\`, \`Typography\`, \`Select\`, \`Menu\`, \`MenuItem\`, \`MenuList\`, \`Chip\`, \`Badge\`, \`Avatar\`, \`Icon\`, \`FormHelperText\` |
   | \`CustomTab\`, \`CustomTabs\` | \`Tabs\` |
   | \`NavHorizontal/Item\` + os menus Blog/Invoice/Job/Order/Product | \`NavHorizontalItem\` |
   | \`Calendar_Tile\`, \`Dia\`, \`dia-calendar\` | \`CalendarTile\` |
   | \`Month+Year Dropdown\` | \`MonthYearDropdown\` |
   | \`eclip-toggle\` | \`ThemeToggle\` |
   | \`Checkbox-text\` | \`CheckboxText\` |
   | \`checkmark\` | \`Checkmark\` |
   | \`log-expand\` | \`LogExpand\` |
   | \`filtro-período\` | \`FilterChip\` |
   | \`geral-preço\` | \`PriceRow\` |
   | \`cupon\` | \`Cupom\` |
   | \`medalha\` | \`Medalha\` |
   | \`card-dashboard\` | \`Card\`, \`StatCard\` |
   | \`card-vitrine\`, \`card-resgate\`, \`card-carrinho-resgate\` | \`CardVitrine\`, \`CardResgate\` |
   | \`afiliado-options\`, \`Modalidade de pagamento\` | \`AfiliadoOptions\`, \`PaymentMethod\` |
   | \`menubar item\`, \`menus\` | \`MenubarItem\` |
   | \`Buttons Dark BG\`, \`button\` (5 cópias) | \`Button\` |
   | \`Image\` (8 aspect ratios) | \`Image\` |
   | \`Icons\`, \`icons/sets-*\` (~243 glifos) | \`Icon\` |
