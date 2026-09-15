// sync.js — persistência e sincronização multiusuário (SPEC §9.2). Sem Preact.
//
// O servidor (/api/board) é a fonte da verdade; o localStorage é só cache — abre rápido e segura o board se
// estiver sem conexão. Ciclo: GET no início (servidor vazio → publica o board local como versão 1);
// autosave a cada 4 s se o board mudou; refresh a cada 15 s se não há edição pendente; sendBeacon ao fechar.
// Conflito (409: outra pessoa salvou antes) → quem chamou decide manter ou recarregar (`aoConflito`).
// O app liga tudo com `iniciar({ obterDados, aoCarregar, aoConflito, aoEstado })`; as views não sabem que existe.
import { normalize } from './data.js';

export const LS_KEY = 'cakto-roadmap-v1';
const SIDE_KEY = 'cakto-roadmap-side';
const SENHA_KEY = 'cakto-roadmap-senha';
const API = '/api/board';
const AUTOSAVE_MS = 4000, REFRESH_MS = 15000;

// Estado da sincronização, lido pelo indicador do header.
// status: carregando | salvo | salvando | offline | conflito | senha | erro
export const sync = { status: 'carregando', hora: null, version: 0, detalhe: '' };

let cfg = null;          // callbacks do app
let ultimoSalvo = '';    // snapshot (JSON) da última versão confirmada pelo servidor
let salvando = false, ouvindo = false, timerAuto, timerRefresh;

function estado(status, detalhe = '') { sync.status = status; sync.detalhe = detalhe; if (cfg) cfg.aoEstado(); }
function snapshot() { return JSON.stringify(cfg.obterDados()); }
function senha() { try { return localStorage.getItem(SENHA_KEY) || ''; } catch (e) { return ''; } }
function guardarSenha(s) { try { localStorage.setItem(SENHA_KEY, s); } catch (e) {} }

// Uma chamada à API. `corpo` já em JSON (string). Sem rede → status 0.
async function chamar(metodo, corpo) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    const s = senha(); if (s) headers['X-App-Password'] = s;
    const r = await fetch(API, { method: metodo, headers, body: corpo, cache: 'no-store' });
    const texto = await r.text(); let body = null; try { body = texto ? JSON.parse(texto) : null; } catch (e) {}
    return { ok: r.ok, status: r.status, body };
  } catch (e) { return { ok: false, status: 0, body: null }; }
}
function falha(r) {
  if (r.status === 401) estado('senha', senha() ? 'Senha incorreta' : '');
  else if (r.status === 0) estado('offline');
  else estado('erro', (r.body && (r.body.detalhe || r.body.error)) || ('HTTP ' + r.status));
}
// Adota o board do servidor como atual. Se o que veio não é um board (normalize falha), não toca no local
// e avisa — em vez de fingir que está tudo salvo.
function adotar({ data, version, updatedAt }) {
  let d;
  try { d = normalize(data); } catch (e) { console.error('[sync] board do servidor inválido', e); estado('erro', 'Dados do servidor inválidos'); return; }
  sync.version = version;
  cfg.aoCarregar(d);
  ultimoSalvo = snapshot();
  sync.hora = updatedAt ? new Date(updatedAt) : new Date();
  estado('salvo');
}

async function carregarDoServidor() {
  const r = await chamar('GET');
  if (!r.ok || !r.body) { falha(r); return; }
  if (r.body.data) { adotar(r.body); return; }
  // Servidor vazio: publica o board local (seed ou cache) como versão 1. Se outro cliente publicou
  // no meio, adota o dele — ninguém editou nada ainda.
  const s = snapshot();
  const p = await chamar('PUT', `{"data":${s},"baseVersion":0}`);
  if (p.ok && p.body) { sync.version = p.body.version; ultimoSalvo = s; sync.hora = new Date(p.body.updatedAt); estado('salvo'); return; }
  if (p.status === 409 && p.body && p.body.current && p.body.current.data) { adotar(p.body.current); return; }
  falha(p);
}

async function salvar(s, base) {
  salvando = true; estado('salvando');
  const r = await chamar('PUT', `{"data":${s},"baseVersion":${base}}`);
  salvando = false;
  if (r.ok && r.body) { sync.version = r.body.version; ultimoSalvo = s; sync.hora = new Date(r.body.updatedAt); estado('salvo'); return; }
  if (r.status === 409 && r.body && r.body.current) { await resolverConflito(r.body.current, s); return; }
  falha(r);
}
async function resolverConflito(current, s) {
  estado('conflito');
  const escolha = await cfg.aoConflito(current);
  if (escolha === 'manter') await salvar(s, current.version);   // sobrescreve com a base atualizada
  else if (current.data) adotar(current);
  else estado('salvo');
}

async function autosave() {
  if (!cfg || salvando || sync.status === 'senha' || sync.status === 'conflito') return;
  const s = snapshot();
  if (s !== ultimoSalvo) await salvar(s, sync.version);
}
async function refresh() {
  if (!cfg || salvando || sync.status === 'senha' || sync.status === 'conflito') return;
  if (snapshot() !== ultimoSalvo) return;   // edição local pendente: o autosave cuida
  const r = await chamar('GET');
  if (!r.ok || !r.body) { falha(r); return; }
  if (r.body.data && r.body.version > sync.version) adotar(r.body);
  else if (sync.status !== 'salvo') estado('salvo');   // conexão voltou
}
function flushAoFechar() {
  if (!cfg || sync.status === 'senha') return;
  const s = snapshot();
  if (s === ultimoSalvo) return;
  const corpo = `{"data":${s},"baseVersion":${sync.version},"senha":${JSON.stringify(senha())}}`;
  navigator.sendBeacon(API, new Blob([corpo], { type: 'application/json' }));
}

// Liga a sincronização. `obterDados()` devolve o board atual; `aoCarregar(data)` substitui o board;
// `aoConflito(current)` devolve Promise<'manter' | 'recarregar'>; `aoEstado()` re-renderiza o indicador.
export async function iniciar(opcoes) {
  cfg = opcoes;
  ultimoSalvo = snapshot();
  await carregarDoServidor();
  clearInterval(timerAuto); clearInterval(timerRefresh);
  timerAuto = setInterval(autosave, AUTOSAVE_MS);
  timerRefresh = setInterval(refresh, REFRESH_MS);
  if (!ouvindo) { window.addEventListener('beforeunload', flushAoFechar); ouvindo = true; }
}
// Tela de senha: guarda e tenta de novo.
export async function entrar(s) { guardarSenha(s); estado('carregando'); await carregarDoServidor(); }

// ---------- Cache local (só este navegador) ----------
// Board salvo neste navegador, normalizado — ou null se não há (ou não é um board).
export function carregarLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) { const d = JSON.parse(raw); if (d.quarters || (d.config && d.squads)) return normalize(d); }
  } catch (e) {}
  return null;
}
export function salvarLocal(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch (e) {}
}
// Estado da barra lateral (aberta = true). Padrão: aberta.
export function carregarSidebar() {
  try { return (localStorage.getItem(SIDE_KEY) ?? '1') === '1'; } catch (e) { return true; }
}
export function salvarSidebar(aberta) {
  try { localStorage.setItem(SIDE_KEY, aberta ? '1' : '0'); } catch (e) {}
}
