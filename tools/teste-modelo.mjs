// tools/teste-modelo.mjs — teste do modelo e da migração do passo 4b (SPEC §3, 17/09/2026).
//
// Por que existe: `normalize()` roda em todo board carregado, inclusive em arquivos antigos abertos pelo
// botão Carregar. Um erro ali transforma dados em lixo sem avisar ninguém. Este teste monta um board no
// formato antigo, migra e confere as invariantes uma a uma.
//
//   node tools/teste-modelo.mjs
//
// `js/data.js` não importa Preact nem toca no DOM, então roda direto no Node.
import * as D from '../js/data.js';

let passou = 0, falhou = 0;
const ok = (cond, nome) => { if (cond) { passou++; } else { falhou++; console.log('  FALHOU:', nome); } };
const eq = (a, b, nome) => ok(JSON.stringify(a) === JSON.stringify(b), `${nome} — esperado ${JSON.stringify(b)}, veio ${JSON.stringify(a)}`);
const bloco = n => console.log('\n' + n);

// ---------- Board no formato antigo (pré-17/09/2026) ----------
const boardAntigo = () => ({
  activeQuarter: 'q3', order: ['q3', 'q2'],
  quarters: {
    q3: { label: 'Q3 2026', start: '2026-07-07', days: 14, count: 6, archived: false, squads: [
      { name: 'Payment', prefix: 'PAY', color: '#36b37e', groupByCat: true,
        categories: [{ name: 'Assinatura', subs: [] }, { name: 'Internacional', subs: ['Novos Métodos', 'México'] }],
        items: [
          { n: 'FASE 0', s: '2026-07-07', e: '2026-07-20', st: 'entregue', pv: 'prod', p: 100, cat: 'Assinatura', sub: '' },
          { n: 'FASE 1', s: '2026-07-21', e: '2026-08-17', st: 'dev', pv: 'prazo', p: 20, cat: 'Assinatura', sub: '' },
          { n: 'Ebanx', s: '2026-07-20', e: '2026-07-29', st: 'homolog', pv: 'prod', p: 100, cat: 'Internacional', sub: 'Novos Métodos' },
          { n: 'CAKTO USD', s: '', e: '', st: 'backlog', pv: 'nao', p: 0, cat: 'Internacional', sub: 'México' },
        ],
        backlog: [{ n: 'Parcelamento', cat: 'Internacional', note: 'depende de adquirente' }] },
      { name: 'Platform', prefix: 'PLA', color: '#0f7864', groupByCat: true, categories: [], items: [
        { n: 'Partnership — Plataforma', s: '2026-08-04', e: '2026-08-25', st: 'dev', pv: 'prazo', p: 40, cat: '', sub: '' },
      ], backlog: [] },
      // Categoria cujos itens estão TODOS sob subcategoria: a mãe deve desaparecer na migração.
      { name: 'Growth', prefix: 'GRO', color: '#65a76b', groupByCat: true,
        categories: [{ name: 'Infra', subs: ['Observabilidade'] }],
        items: [{ n: 'Tracing', s: '', e: '', st: 'backlog', pv: 'nao', p: 0, cat: 'Infra', sub: 'Observabilidade' }],
        backlog: [] },
    ] },
    q2: { label: 'Q2 2026', start: '2026-04-07', days: 14, count: 6, archived: true, squads: [
      { name: 'Payment', prefix: 'PAY', color: '#36b37e', groupByCat: true, categories: [], items: [
        { n: 'Worldpay', s: '2026-04-07', e: '2026-05-04', st: 'entregue', pv: 'prod', p: 100, cat: '', sub: '' },
      ], backlog: [] },
    ] },
  },
  demandas: [
    { id: 1, t: 'Card solto no backlog', d: '', sq: 'Payment', col: 'backlog', link: '', subsTotal: 2, subsDone: 1 },
    { id: 2, t: 'Card priorizado sem item', d: '', sq: 'Platform', col: 'priorizado', link: '' },
  ],
});

// ---------- Migração ----------
bloco('Migração — formato antigo → 1 iniciativa = N itens');
const d = D.normalize(boardAntigo());

ok(d.demandas === undefined, 'chave `demandas` removida');
ok(Array.isArray(d.iniciativas), 'chave `iniciativas` presente');

const todosItens = [];
Object.values(d.quarters).forEach(q => q.squads.forEach(sq => { sq.items.forEach(it => todosItens.push(it)); sq.backlog.forEach(b => todosItens.push(b)); }));
ok(todosItens.every(it => it.ini), 'todo item tem `ini`');
ok(todosItens.every(it => D.iniciativaPorCode(d, it.ini)), '`ini` aponta para uma iniciativa existente');
ok(todosItens.every(it => it.cat === undefined && it.sub === undefined), '`cat` e `sub` saíram dos itens');
Object.values(d.quarters).forEach(q => q.squads.forEach(sq => ok(sq.categories.every(c => c.subs === undefined), 'categorias sem `subs` em ' + sq.name)));

const pay = d.quarters.q3.squads[0];
const nomesCat = pay.categories.map(c => c.name);
ok(nomesCat.includes('Novos Métodos') && nomesCat.includes('México'), 'subcategoria virou categoria');
ok(nomesCat.includes('Assinatura'), 'categoria com itens diretos permanece');
ok(nomesCat.includes('Internacional'), 'categoria mãe com item de backlog direto permanece');
const growth = d.quarters.q3.squads.find(s => s.name === 'Growth').categories.map(c => c.name);
eq(growth, ['Observabilidade'], 'categoria mãe sem nenhum item direto é removida e sobra a subcategoria');

const cat = n => D.iniciativaPorCode(d, pay.items.find(it => it.n === n).ini).cat;
eq(cat('FASE 0'), 'Assinatura', 'item sem subcategoria herda a categoria');
eq(cat('Ebanx'), 'Novos Métodos', 'item com subcategoria herda a subcategoria virada categoria');
eq(cat('CAKTO USD'), 'México', 'segunda subcategoria idem');
eq(D.iniciativaPorCode(d, pay.backlog[0].ini).cat, 'Internacional', 'item de backlog mantém a categoria antiga');

const codes = d.iniciativas.map(i => i.code);
eq(codes.length, new Set(codes).size, 'códigos únicos');
eq(d.iniciativas.length, 8 + 2, "uma iniciativa por item (7 do Q3 + 1 do Q2) + 2 cards antigos");
ok(d.iniciativas.every(i => i.subsTotal === undefined && i.subsDone === undefined), 'contador de sub-itens saiu do card');
ok(d.iniciativas.every(i => i.cat !== undefined && i.nota !== undefined && i.arq !== undefined), 'campos novos presentes no card');

const entrada = D.chaveEntrada(d);
eq(d.iniciativas.find(i => i.t === 'Card priorizado sem item').col, entrada, 'card sem item volta para a entrada');

bloco('Idempotência');
const duas = D.normalize(D.normalize(boardAntigo()));
const uma = D.normalize(boardAntigo());
// createdAt usa Date.now(); compara ignorando ele.
const semData = x => JSON.parse(JSON.stringify(x, (k, v) => (k === 'createdAt' ? 0 : v)));
eq(semData(duas), semData(uma), 'normalizar duas vezes dá o mesmo board');

bloco('Derivados');
const plat = d.quarters.q3.squads[1];
const codePart = plat.items[0].ini;
D.novoItemNaIniciativa(plat, codePart);
Object.assign(plat.items[1], { n: 'Partnership — ADMIN', s: '2026-08-25', e: '2026-09-08', st: 'backlog', pv: 'nao', p: 0 });
const der = D.derivadosDaIniciativa(d, codePart);
eq(der.total, 2, 'contagem de itens');
eq(der.entregues, 0, 'nenhum entregue ainda');
eq(der.pct, 20, 'percentual é a média simples (40 e 0)');
eq(der.s, '2026-08-04', 'início é o menor dos itens');
eq(der.e, '2026-09-08', 'fim é o maior dos itens');
eq(D.colunaDe(d, D.iniciativaPorCode(d, codePart)), 'execucao', 'com item no roadmap, a coluna é Execução');
plat.items.forEach(it => { it.st = 'entregue'; it.p = 100; });
eq(D.colunaDe(d, D.iniciativaPorCode(d, codePart)), 'concluido', 'todos entregues → Concluído');
const iniBacklog = D.iniciativaPorCode(d, pay.backlog[0].ini);
eq(D.colunaDe(d, iniBacklog), 'priorizado', 'só no backlog do roadmap → Backlog Priorizado');

bloco('Linhas do roadmap');
const linhas = D.linhasRoadmap(d, pay);
ok(linhas[0].tipo === 'categoria' && linhas[0].nome === 'Assinatura', 'primeira linha é a categoria');
eq(linhas.filter(l => l.tipo === 'iniciativa').length, 4, 'toda iniciativa tem linha, mesmo com um item só (18/09/2026)');
ok(linhas.filter(l => l.tipo === 'item').every(l => l.nivel === 2), 'itens ficam sempre sob a linha da iniciativa');
ok(linhas.every((l, i) => l.tipo !== 'item' || linhas.slice(0, i).reverse().find(x => x.tipo !== 'item').tipo === 'iniciativa'), 'nenhum item aparece solto');
// A linha da iniciativa mostra quantos itens estão no roadmap e quantos ficaram no backlog.
const codeBl = pay.backlog[0].ini;
D.novoItemNaIniciativa(pay, codeBl);
const linhaB = D.linhasRoadmap(d, pay).find(l => l.tipo === 'iniciativa' && l.code === codeBl);
eq([linhaB.total, linhaB.noBacklog], [1, 1], 'um item no roadmap e um no backlog');
// Squad sem categoria: a linha da iniciativa continua aparecendo.
const plano = d.quarters.q3.squads[1];
ok(D.linhasRoadmap(d, plano).some(l => l.tipo === 'iniciativa'), 'sem categoria, a iniciativa ainda tem linha');
plano.groupByCat = false;
ok(D.linhasRoadmap(d, plano).some(l => l.tipo === 'iniciativa'), 'com o agrupamento por categoria desligado, também');
plano.groupByCat = true;

bloco('Movimentos');
const p2 = d.quarters.q3.squads[0];
const idx = pred => p2.items.findIndex(pred);
D.novoItemNaIniciativa(p2, p2.items.find(it => it.n === 'FASE 0').ini);
const codeFase1 = p2.items.find(it => it.n === 'FASE 1').ini;   // 1 item
const codeFase0 = p2.items.find(it => it.n === 'FASE 0').ini;   // 2 itens
eq(D.itensDaIniciativa(p2, codeFase0).length, 2, 'FASE 0 tem dois itens antes dos movimentos');
const antesJ = d.iniciativas.length;
const rJ = D.moveItemParaIniciativa(d, p2, idx(it => it.n === 'FASE 1'), codeFase0);
eq([rJ.ok, !!rJ.juntou], [true, true], 'mover o último item da origem junta as duas iniciativas');
eq(d.iniciativas.length, antesJ - 1, 'e o card da origem some');
eq(D.itensDaIniciativa(p2, codeFase0).length, 3, 'destino ficou com três itens');
ok(!D.iniciativaPorCode(d, codeFase1), 'a iniciativa de origem não existe mais');

const antes = d.iniciativas.length;
const ex = D.extrairItem(d, p2, idx(it => it.ini === codeFase0 && it.n === ''));
eq(ex.ok, true, 'extrair item de iniciativa com vários itens');
eq(d.iniciativas.length, antes + 1, 'extrair cria um card novo');
eq(D.extrairItem(d, p2, idx(it => it.ini === ex.code)).ok, false, 'extrair de iniciativa com um item só é recusado');

const antes2 = d.iniciativas.length;
eq(D.juntarIniciativas(d, ex.code, codeFase0).ok, true, 'juntar duas iniciativas');
eq(d.iniciativas.length, antes2 - 1, 'juntar remove o card da origem');
eq(D.itensDaIniciativa(p2, codeFase0).length, 3, 'itens da origem passaram para o destino');

bloco('Remoção e invariante');
const codeSozinha = p2.items.find(it => it.n === 'Ebanx').ini;
const removeu = D.removeItem(d, p2, p2.items.findIndex(it => it.n === 'Ebanx'));
eq(removeu, true, 'remover o último item remove a iniciativa');
ok(!D.iniciativaPorCode(d, codeSozinha), 'card sumiu junto');
eq(D.itensDaIniciativa(p2, codeFase0).length, 3, 'a iniciativa com três itens segue intacta');
D.removeItem(d, p2, p2.items.findIndex(it => it.ini === codeFase0));
ok(!!D.iniciativaPorCode(d, codeFase0), 'remover um de vários mantém a iniciativa');
eq(D.itensDaIniciativa(p2, codeFase0).length, 2, 'e sobra um a menos');

bloco('Mover de squad');
const dd = D.normalize(boardAntigo());
const payQ3 = dd.quarters.q3.squads[0];
const codeMove = payQ3.items.find(it => it.n === 'FASE 0').ini;
const r = D.moveIniciativaParaSquad(dd, codeMove, 'Platform');
eq(r.semCategoria, true, 'squad de destino sem a categoria → iniciativa fica sem categoria');
eq(dd.quarters.q3.squads[1].items.some(it => it.ini === codeMove), true, 'item mudou de squad');
eq(dd.quarters.q3.squads[0].items.some(it => it.ini === codeMove), false, 'item saiu da squad de origem');
eq(D.iniciativaPorCode(dd, codeMove).code, codeMove, 'o código não muda ao mudar de squad');

bloco('Arquivar, descartar e retomar (§4.3)');
const da = D.normalize(boardAntigo());
const payA = da.quarters.q3.squads[0];
const codeA = payA.items.find(it => it.n === 'FASE 1').ini;
const itemA = payA.items.find(it => it.n === 'FASE 1');
eq(D.arquivaIniciativa(da, codeA, 'sem capacidade'), 1, 'arquivar marca os itens da iniciativa');
eq(itemA.arq, 'arquivado', 'item marcado como arquivado');
eq([itemA.st, itemA.p], ['dev', 20], 'status e progresso preservados');
eq(D.iniciativaPorCode(da, codeA).col, D.chaveEntrada(da), 'card volta para a coluna de entrada');
eq(D.colunaDe(da, D.iniciativaPorCode(da, codeA)), D.chaveEntrada(da), 'coluna derivada ignora itens arquivados');
ok(!D.linhasRoadmap(da, payA).some(l => l.tipo === 'item' && l.it === itemA), 'item arquivado sai do roadmap');
eq(D.derivadosDaIniciativa(da, codeA).total, 0, 'derivados ignoram arquivados');
eq(D.foraDeCirculacao(da).length, 1, 'aparece na lista de fora de circulação');
eq(D.foraDeCirculacao(da)[0].ini.nota, 'sem capacidade', 'a nota da ação fica gravada');

D.retomaIniciativa(da, codeA);
ok(!payA.items.includes(itemA), 'retomar tira o item do roadmap');
const noBacklog = payA.backlog.find(b => b.ini === codeA);
ok(!!noBacklog, 'retomar devolve o item ao backlog da squad');
eq(noBacklog.note, 'estava em Em desenvolvimento · 20%', 'o estado em que parou vira observação');
eq(D.colunaDe(da, D.iniciativaPorCode(da, codeA)), 'priorizado', 'card volta ao Backlog Priorizado');
eq(D.foraDeCirculacao(da).length, 0, 'sai da lista depois de retomada');

const semMotivo = D.descartaIniciativa(da, codeA, 'nada');
eq(semMotivo.ok, false, 'descartar sem motivo é recusado');
D.iniciativaPorCode(da, codeA).motivo = 'fora de estratégia';
eq(D.descartaIniciativa(da, codeA, 'stakeholder desistiu').ok, true, 'descartar com motivo é aceito');
eq(payA.backlog.find(b => b.ini === codeA).arq, 'descartado', 'itens marcados como descartados');
eq(D.colunaDe(da, D.iniciativaPorCode(da, codeA)), 'descartado', 'card vai para a coluna Descartado');
eq(D.kpisDeItens(payA.items.filter(it => !it.arq)).total, payA.items.filter(it => !it.arq).length, 'KPIs contam só itens em circulação');

const codeOutraSquad = payA.items.find(it => it.n === 'FASE 0').ini;
D.arquivaIniciativa(da, codeOutraSquad, '');
D.retomaIniciativa(da, codeOutraSquad, 'Platform');
eq(da.quarters.q3.squads[1].backlog.some(b => b.ini === codeOutraSquad), true, 'retomar em outra squad manda os itens para o backlog dela');
eq(da.quarters.q3.squads[0].items.some(it => it.ini === codeOutraSquad), false, 'e tira da squad de origem');

bloco('Colunas renomeadas e padrões da squad (entrega 3)');
const dc = D.normalize(boardAntigo());
eq(dc.kcols.map(c => c.k), ['iniciativas', 'priorizado', 'execucao', 'concluido', 'descartado'], 'chaves das colunas');
eq(dc.kcols.map(c => c.label), ['Iniciativas', 'Backlog Priorizado', 'Execução', 'Concluído', 'Descartado'], 'rótulos das colunas');
eq(D.chaveEntrada(dc), 'iniciativas', 'a coluna de entrada é encontrada pelo papel');
eq(dc.iniciativas.find(i => i.t === 'Card solto no backlog').col, 'iniciativas', 'card que estava em `backlog` foi remapeado');
ok(dc.iniciativas.every(i => dc.kcols.some(c => c.k === i.col)), 'nenhum card aponta para coluna inexistente');
// chave antiga do protótipo continua coberta
const dAntigo = D.normalize({ ...boardAntigo(), kcols: [{ k: 'backlog', label: 'Backlog' }, { k: 'discovery', label: 'Discovery' }, { k: 'andamento', label: 'Em andamento' }] });
eq(dAntigo.kcols.map(c => c.k), ['iniciativas', 'priorizado', 'execucao', 'concluido', 'descartado'], 'board com colunas do protótipo é normalizado para as cinco fixas');

const sqPay = dc.quarters.q3.squads[0];
eq([sqPay.pm, sqPay.tl], ['', ''], 'squad nasce com PM e TL padrão vazios');
sqPay.pm = 'Alessandro'; sqPay.tl = 'Ulisses';
const codeNovo = D.novaIniciativaNoRoadmap(dc, sqPay, '');
const iniNova = D.iniciativaPorCode(dc, codeNovo);
eq([iniNova.pm, iniNova.tl], ['Alessandro', 'Ulisses'], 'iniciativa criada pelo roadmap herda o PM e o TL da squad');
// O gate de saída só vale para quem está na coluna de entrada (A.2).
const iniEntrada = D.criaIniciativa(dc, 'Payment', 'Card de entrada', '', 'iniciativas');
eq([iniEntrada.pm, iniEntrada.tl], ['Alessandro', 'Ulisses'], 'card do Kanban também herda os padrões');
eq(D.podeMover(dc, iniEntrada.id, 'priorizado').ok, false, 'sem estimativa e período, o gate ainda recusa');
ok(!D.podeMover(dc, iniEntrada.id, 'priorizado').msg.includes('PM'), 'e a recusa não cobra PM nem Tech Lead');
Object.assign(iniEntrada, { est: 'M', perQ: 'Q4' });
eq(D.podeMover(dc, iniEntrada.id, 'priorizado').ok, true, 'com os padrões preenchidos, o gate passa sem digitar PM nem TL');

bloco('Seed');
const s = D.seedNovo();
eq(D.itensDoQuarter(s.quarters[s.activeQuarter]), 0, 'quadro nasce vazio');
eq(s.iniciativas.length, 0, 'sem iniciativas no quadro novo');
eq(D.squadsDoQuarter(s.quarters[s.activeQuarter]).length, 5, 'com as cinco squads');

console.log(`\n${passou} passaram, ${falhou} falharam`);
process.exit(falhou ? 1 : 0);
