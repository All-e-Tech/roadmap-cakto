# Diff de dados — fechamento de 3a (2026-09-09)

Mesma base (`base.json` = seed do protótipo), mesmas 20 ações do roteiro (parte B): no app novo via DOM, na lógica do protótipo via Node.

**49 diferenças, 0 inesperadas.**

## C9 — item promovido/adicionado nasce sem datas (novo) em vez de início do quarter (protótipo) — 2

| Caminho | Protótipo | Novo |
|---|---|---|
| `quarters.q3-2026.squads[0].items[12].s` | `"2026-07-07"` | `""` |
| `quarters.q3-2026.squads[0].items[12].e` | `"2026-07-07"` | `""` |

## C8 revisada — `prefix`/`archived` por squad (só no novo) — 14

| Caminho | Protótipo | Novo |
|---|---|---|
| `quarters.q3-2026.squads[0].archived` | `undefined` | `false` |
| `quarters.q3-2026.squads[0].prefix` | `undefined` | `"PAY"` |
| `quarters.q3-2026.squads[1].archived` | `undefined` | `false` |
| `quarters.q3-2026.squads[1].prefix` | `undefined` | `"PLA"` |
| `quarters.q3-2026.squads[2].archived` | `undefined` | `false` |
| `quarters.q3-2026.squads[2].prefix` | `undefined` | `"GRO"` |
| `quarters.q3-2026.squads[3].archived` | `undefined` | `false` |
| `quarters.q3-2026.squads[3].prefix` | `undefined` | `"CAK"` |
| `quarters.q3-2026.squads[4].archived` | `undefined` | `false` |
| `quarters.q3-2026.squads[4].prefix` | `undefined` | `"BAN"` |
| `quarters.q3-2026.squads[5].prefix` | `undefined` | `"NOV"` |
| `quarters.q3-2026.squads[5].archived` | `undefined` | `false` |
| `quarters.q2-2026.squads[0].archived` | `undefined` | `false` |
| `quarters.q2-2026.squads[0].prefix` | `undefined` | `"PAY"` |

## A4 — anexo saiu do modelo (só no protótipo) — 32

| Caminho | Protótipo | Novo |
|---|---|---|
| `demandas[0].anexoNome` | `""` | `undefined` |
| `demandas[0].anexoConteudo` | `""` | `undefined` |
| `demandas[1].anexoNome` | `""` | `undefined` |
| `demandas[1].anexoConteudo` | `""` | `undefined` |
| `demandas[2].anexoNome` | `""` | `undefined` |
| `demandas[2].anexoConteudo` | `""` | `undefined` |
| `demandas[3].anexoNome` | `""` | `undefined` |
| `demandas[3].anexoConteudo` | `""` | `undefined` |
| `demandas[4].anexoNome` | `""` | `undefined` |
| `demandas[4].anexoConteudo` | `""` | `undefined` |
| `demandas[5].anexoNome` | `""` | `undefined` |
| `demandas[5].anexoConteudo` | `""` | `undefined` |
| `demandas[6].anexoNome` | `""` | `undefined` |
| `demandas[6].anexoConteudo` | `""` | `undefined` |
| `demandas[7].anexoNome` | `""` | `undefined` |
| `demandas[7].anexoConteudo` | `""` | `undefined` |
| `demandas[8].anexoNome` | `""` | `undefined` |
| `demandas[8].anexoConteudo` | `""` | `undefined` |
| `demandas[9].anexoNome` | `""` | `undefined` |
| `demandas[9].anexoConteudo` | `""` | `undefined` |
| `demandas[10].anexoNome` | `""` | `undefined` |
| `demandas[10].anexoConteudo` | `""` | `undefined` |
| `demandas[11].anexoNome` | `""` | `undefined` |
| `demandas[11].anexoConteudo` | `""` | `undefined` |
| `demandas[12].anexoNome` | `""` | `undefined` |
| `demandas[12].anexoConteudo` | `""` | `undefined` |
| `demandas[13].anexoNome` | `""` | `undefined` |
| `demandas[13].anexoConteudo` | `""` | `undefined` |
| `demandas[14].anexoNome` | `""` | `undefined` |
| `demandas[14].anexoConteudo` | `""` | `undefined` |
| `demandas[15].anexoNome` | `""` | `undefined` |
| `demandas[15].anexoConteudo` | `""` | `undefined` |

## hora do clique (Date.now real no browser × fixo no Node) — 1

| Caminho | Protótipo | Novo |
|---|---|---|
| `demandas[14].createdAt` | `1757000000000` | `1788979805872` |

