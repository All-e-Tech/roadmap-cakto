// io.js — importar planilha, salvar e carregar JSON (SPEC §8). Sem Preact.
// Passo 3a: mesmas regras do protótipo. Importar SUBSTITUI as squads do quarter (A11 — 3b acrescenta confirmação).
/* global XLSX */
import { PALETTE, normalizeSquad, normalize, dd } from './data.js';

// ---------- Tradução da planilha ----------
export function xlDate(v) {
  if (!v) return '';
  if (v instanceof Date) return v.getFullYear() + '-' + dd(v.getMonth() + 1) + '-' + dd(v.getDate());
  const s = String(v).trim();
  let m = s.match(/(\d{4})-(\d{2})-(\d{2})/); if (m) return m[1] + '-' + m[2] + '-' + m[3];
  m = s.match(/(\d{2})\/(\d{2})\/(\d{4})/); if (m) return m[3] + '-' + m[2] + '-' + m[1];
  return '';
}
export function mapStatus(v) { v = String(v || '');
  if (/Entregue/i.test(v)) return 'entregue';
  if (/Desenvolvimento/i.test(v)) return 'dev';
  if (/Teste|QA/i.test(v)) return 'qa';
  if (/Homolog/i.test(v)) return 'homolog';
  if (/Stories/i.test(v)) return 'stories';
  return 'backlog';
}
export function mapPrev(v) { v = String(v || '');
  if (/Risco/i.test(v)) return 'risco';
  if (/Atrasad/i.test(v)) return 'atraso';
  if (/Bloque/i.test(v)) return 'bloq';
  if (/Produção|Producao/i.test(v)) return 'prod';
  if (/Prazo/i.test(v)) return 'prazo';
  return 'nao';
}
export function mapPct(v) { const m = String(v || '').match(/(\d{1,3})\s*%/); return m ? Math.min(100, parseInt(m[1])) : 0; }

// Converte um workbook já lido em squads (uma por aba com cabeçalho "Item"). Puro — testável sem browser.
export function squadsDaPlanilha(wb) {
  const newSquads = [];
  wb.SheetNames.forEach((name, idx) => {
    const ws = wb.Sheets[name];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, dateNF: 'yyyy-mm-dd' });
    let h = -1;
    for (let i = 0; i < rows.length; i++) { if ((rows[i] || []).some(c => /^item/i.test(String(c).trim()))) { h = i; break; } }
    if (h < 0) return;
    const hdr = (rows[h] || []).map(c => String(c || '').toLowerCase());
    const find = (...ks) => { for (let i = 0; i < hdr.length; i++) if (ks.some(k => hdr[i].includes(k))) return i; return -1; };
    const col = { item: find('item'), cat: find('pilar', 'categoria'), ini: find('início', 'inicio'), fim: find('fim'), st: find('status'), pv: find('previsão', 'previsao'), pct: find('conclus', '%') };
    if (col.item < 0) return;
    const items = []; let started = false;
    for (let i = h + 1; i < rows.length; i++) {
      const row = rows[i] || []; const nm = String(row[col.item] || '').trim();
      if (!nm) { if (started) break; else continue; }
      started = true;
      items.push({ n: nm, s: col.ini >= 0 ? xlDate(row[col.ini]) : '', e: col.fim >= 0 ? xlDate(row[col.fim]) : '', st: mapStatus(col.st >= 0 ? row[col.st] : ''), pv: mapPrev(col.pv >= 0 ? row[col.pv] : ''), p: mapPct(col.pct >= 0 ? row[col.pct] : ''), cat: col.cat >= 0 ? String(row[col.cat] || '').trim() : '', sub: '' });
    }
    if (items.length) { const sq = { name, color: PALETTE[idx % PALETTE.length], groupByCat: items.some(i => i.cat), categories: [], items, backlog: [] }; normalizeSquad(sq); newSquads.push(sq); }
  });
  return newSquads;
}

// ---------- Arquivos (browser) ----------
// Lê um .xlsx e devolve as squads reconhecidas (array vazio = "Nenhuma tabela reconhecida"). Rejeita em erro de leitura.
export function lerPlanilha(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      try { resolve(squadsDaPlanilha(XLSX.read(r.result, { type: 'array', cellDates: true }))); }
      catch (e) { console.error(e); reject(e); }
    };
    r.readAsArrayBuffer(file);
  });
}
// Baixa o board inteiro como JSON (botão Salvar).
export function baixarJson(data, nome = 'roadmap-cakto.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = nome; a.click();
}
// Lê um JSON de board (botão Carregar). Devolve o board normalizado, ou null se o arquivo não é um board.
export function lerJson(file) {
  return new Promise(resolve => {
    const r = new FileReader();
    r.onload = () => {
      try { let d = JSON.parse(r.result); if (!d.quarters && !(d.config && d.squads)) throw 0; resolve(normalize(d)); }
      catch (e) { resolve(null); }
    };
    r.readAsText(file);
  });
}
