# Roadmap Cakto

Ferramenta interna de roadmap por squad — Roadmap (tabela), Visão geral (Gantt), Kanban de iniciativas, Squads & sprints. Protótipo em validação, multiusuário: o board fica num banco (Supabase) e todos os PMs veem e editam o mesmo, pela URL publicada na Vercel.

## Rodar localmente

Não há build nem dependências para instalar. Precisa de Node 18+ (o projeto usa o 24).

```bash
node tools/dev-server.mjs
```

`http://localhost:8080`. O servidor local serve os arquivos e roda a função `api/board.js` **em memória**: o board existe enquanto o servidor estiver de pé e some ao parar. Preact + htm e SheetJS vêm de CDN (precisa de internet na primeira carga).

Para testar localmente contra o banco real, crie um arquivo `.env.local` na raiz (ignorado pelo git) com as variáveis da seção "Variáveis de ambiente". Nunca commite esse arquivo.

## Colocar no ar (passo 4 da sequência do `CLAUDE.md`)

Três serviços, cada um com um papel:

| Serviço | Papel |
|---|---|
| **GitHub** | guarda o código; a Vercel publica a partir dele |
| **Supabase** | banco Postgres; uma tabela `board` com uma linha (o board inteiro em JSON + número de versão) |
| **Vercel** | serve a página e roda a função `api/board.js`, a única que fala com o banco |

O navegador nunca acessa o banco direto. A chave do banco fica só nas variáveis de ambiente da Vercel.

### 1. GitHub
Repositório **privado** `roadmap-cakto`. Enviar o código:

```bash
git remote add origin https://github.com/<usuario>/roadmap-cakto.git
git push -u origin main
```

### 2. Supabase
1. Criar projeto (região São Paulo, se disponível). Guardar a senha do banco no gerenciador de senhas; ela não é usada pelo app.
2. **SQL Editor → New query**, colar e executar:

```sql
create table public.board (
  id text primary key,
  version integer not null default 0,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.board enable row level security;
```

Com RLS ligado e sem políticas, só a chave de serviço (usada pela função) acessa a tabela.

3. Copiar dois valores para o passo 3 (o painel do Supabase separa os dois):
   - **Settings → Data API → Project URL**. Serve tanto `https://<ref>.supabase.co` quanto a forma que o painel mostra com `/rest/v1/` no fim — a função aceita as duas.
   - **Settings → API Keys**: a chave de serviço — na aba **Legacy API keys**, a `service_role` (texto longo começando com `eyJ`); ou, na aba principal, **Create new secret key** (começa com `sb_secret_`). As duas funcionam. A chave `anon`/`publishable` é pública e **não** serve aqui.

### 3. Vercel
1. Entrar com o GitHub; **Add New → Project**; escolher `roadmap-cakto`.
2. Framework Preset **Other**; sem comando de build; Output Directory vazio.
3. **Environment Variables** (ver tabela abaixo), depois **Deploy**.
4. Abrir a URL. A primeira abertura publica o board inicial (seed) como versão 1.
5. (Opcional) domínio `roadmap.cakto.com.br`.

Cada `git push` na `main` gera um deploy novo, sem parar o que está no ar. Código e dados são separados: publicar interface nova não toca no board. Rollback: Vercel → Deployments → Promote to Production numa versão anterior.

### Variáveis de ambiente

| Nome | Onde obter | Efeito |
|---|---|---|
| `SUPABASE_URL` | Supabase → Settings → Data API → Project URL (com ou sem `/rest/v1/` no fim) | sem ela (e a chave), a função roda em memória |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API Keys → `service_role` (aba Legacy API keys) ou uma secret key nova (`sb_secret_…`) | acesso total ao banco; **só na Vercel e no `.env.local`, nunca no código ou em chat** |
| `APP_PASSWORD` | escolhida pelo GPM | senha compartilhada pedida na primeira abertura; sem ela, o app abre sem senha |

### Custos e limites
- **Vercel Hobby** é gratuito, mas o termo de uso é não comercial; para uso pela empresa, o plano Pro (US$ 20/mês por assento de quem administra o deploy; os PMs não precisam de conta).
- **Supabase Free** pausa o banco após 7 dias sem acesso (reativa no painel); o Pro (US$ 25/mês) não pausa.
- Nenhum dos dois cobra por pessoa que usa o roadmap.

## Zerar o board

`docs/board-vazio.json` é o quadro vazio: um quarter, as cinco squads, nenhum item e nenhuma iniciativa. Para substituir o board que está no ar, abra o roadmap, clique em **Carregar** e escolha esse arquivo. A confirmação diz o que será perdido. Use **Salvar** antes se quiser guardar uma cópia do que existe hoje.

## Como a sincronização funciona (SPEC §9)

- A função `GET /api/board` devolve `{ data, version, updatedAt }`; `PUT { data, baseVersion }` grava só se `baseVersion` ainda for a versão atual (senão devolve `409 { current }`).
- O cliente (`js/sync.js`) carrega no início, salva a cada 4 s quando algo mudou, busca novidades a cada 15 s quando não há edição pendente e faz um último envio ao fechar a aba.
- Conflito (duas pessoas editando ao mesmo tempo): quem salvou por último escolhe entre manter as suas alterações ou recarregar as da outra pessoa.
- Indicador no header: "Salvando…", "Salvo · HH:MM", "Sem conexão", "Conflito…", "Erro no servidor".
- O localStorage segue como cache: abre rápido e mantém o board se a conexão cair.

## Estrutura

```
index.html            shell + import map (Preact, preact/hooks, htm)
api/board.js          função serverless (Vercel/Node): GET/PUT do board, adaptador Supabase + fallback em memória, senha
tools/dev-server.mjs  servidor local: estáticos + api/board.js em memória
css/tokens.css        paleta provisória do protótipo — substituir no passo 5 (migração visual)
css/app.css           estilos, só tokens
js/app.js             montagem, estado único, roteamento, header, indicador de sync, tela de senha
js/ui.js              html (htm), Button, Icon, mix()
js/data.js            modelo, seed, normalize(), enums, acesso e mutações — sem Preact
js/io.js              importar planilha, salvar/carregar JSON — sem Preact
js/sync.js            cliente de /api/board (autosave, refresh, conflito) + cache local — sem Preact
js/components/        uma view por arquivo: table.js, gantt.js, kanban.js, config.js
docs/                 decisões, conciliação spec × código, roteiro de validação (não publicados na Vercel)
```

## Documentos

- `SPEC.md` — fonte da verdade dos requisitos, do modelo (§3), da API (§9) e do deploy (§10).
- `CLAUDE.md` — convenções e sequência de trabalho.
- `docs/decisions.md` — decisões (Kanban, renderização, squads, vínculo iniciativa → item, storage e hospedagem).
- `docs/divergences.md` — conciliação spec × protótipo e o que foi decidido/executado item a item.
- `docs/validacao-passo3/` — roteiro de validação e o diff de dados do fechamento de 3a.
- `Claude Design/` — export original do protótipo (referência; não roda fora do Claude Design).
