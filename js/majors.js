// Majors & Events (DOM-frei): Qualifikation/Felder, World-Cup-Teams, Premier-League-Tabelle.
// Felder werden in der Event-Woche einmal berechnet und in state.qual[Jahr][eventId] gespeichert.
import { orderOfMerit, moneyOf } from './rankings.js';
import { playersOfTier, getPlayer, secondaryOrder, addAmateurs } from './world.js';
import { overall } from './player.js';
import { RNG, hashSeed } from './rng.js';
import { nationName } from '../data/nations.js';
import { WM_QUALIFIERS, WM_TOURS } from '../data/tournaments.js';
import { clamp } from './util.js';

export const MAJOR_CATS = ['major', 'ws', 'pl'];
// Anzahl gesetzter Spieler (Rest wird zugelost)
const SEEDS = { masters: 8, matchplay: 16, wgp: 16, ec: 32, pcf: 32, ukopen: 999, wm: 32, ws: 8, wsf: 8, wcod: 8, plf: 4, wmq: 0, gsq: 0, pln: 0, gsod: 32 };

export const RULE_TEXT = {
  masters: 'Top 24 der PDC Order of Merit (Tour-Modus: alle Tourcard-Holder, Vorrunden)', ukopen: 'Tourcard, Top 8 Challenge-/Dev-Tour-OOM oder Riley’s-Amateur-Qualifier',
  matchplay: 'Top 16 PDC OOM oder Top 16 Pro Tour OOM', wgp: 'Top 16 PDC OOM oder Top 16 Pro Tour OOM',
  ec: 'Top 32 der European-Tour-Wertung', pcf: 'Top 64 der Players-Championship-OOM', gsod: "Finale eines TV-Majors (12 Monate), Pro-Tour-Titel, Jugend-Weltmeister, Top 2 Challenge Tour, Top 2 Women's Series oder Grand-Slam-Qualifier",
  gsq: 'Tourcard ohne direkten Grand-Slam-Platz',
  wmq: 'Tourcard ohne direkten WM-Platz', wm: 'Top 40 PDC, Top 40 Pro Tour, CT/Dev Top 3, Jugend-Weltmeister, Nebentour, internationaler Qualifier oder PDPA Qualifier',
  ws: 'Einladung: Top 8 PDC OOM (+ 8 Qualifikanten)', wsf: 'Top 24 der World-Series-Wertung',
  pln: 'Einladung: Top 8 der PDC OOM zu Saisonbeginn', plf: 'Top 4 der Premier-League-Tabelle', wcod: 'Unter den 2 Besten deiner Nation',
};

const idsOf = list => list.map(x => x.p.id);
const take = (src, n, used) => {
  const out = [];
  for (const id of src) { if (out.length >= n) break; if (!used.has(id)) { out.push(id); used.add(id); } }
  return out;
};
const fieldRng = (state, ev) => new RNG(hashSeed(state.seed, 'field', ev.id, state.date.year));
export const qualOf = state => ((state.qual ??= {})[state.date.year] ??= {});

// WM: direkte Startplätze (Top 40 PDC + 40 Pro Tour) – wird zur WM-Quali fixiert
function wmAuto(state) {
  const q = qualOf(state);
  if (!q.wmAuto) {
    const used = new Set();
    q.wmAuto = [...take(idsOf(orderOfMerit(state, 'pdc')), 40, used), ...take(idsOf(orderOfMerit(state, 'protour')), 40, used)];
  }
  return q.wmAuto;
}

// WM: alle Plätze außer dem PDPA Qualifier – Top 40 PDC + 40 Pro Tour (rücken nach), Top 3 Dev/CT (ohne Karte), Jugend-Weltmeister,
// Touren (WM_TOURS: Women's Series 3, Asian Tour 5, DPA 2, DPNZ 1, Nordic & Baltic 3, CDC 3), 14 Qualifier. Doppelt Qualifizierte rücken NICHT nach → mehr TCHQ-Plätze.
export function wmDirect(state) {
  const q = qualOf(state), used = new Set(wmAuto(state)), out = [...used];
  const add = ids => { for (const id of ids) if (id && !used.has(id)) { used.add(id); out.push(id); } };
  const noCard = ids => ids.filter(id => (id === 'P' ? state.player.tour !== 'tour' : getPlayer(state, id)?.tier !== 'tour'));
  add(noCard(idsOf(orderOfMerit(state, 'dev'))).slice(0, 3));
  add(noCard(idsOf(orderOfMerit(state, 'challenge'))).slice(0, 3));
  add([q.wmYouth]);
  add(wmTourDirect(state));                                        // Women's Series, Asian Tour, DPA, DPNZ, Nordic & Baltic, CDC
  for (const x of WM_QUALIFIERS) add(q.wmReg?.[x.key] ?? []);
  return out.slice(0, 126);
}
export const wmTchqSlots = state => 128 - wmDirect(state).length;
export const wmTourDirect = state => Object.entries(WM_TOURS).flatMap(([c, n]) => secondaryOrder(state, c).slice(0, n));

// ---- Grand Slam of Darts (KW 46) ----
// 1. Sieger + Finalisten aller TV-Majors der letzten 12 Monate, 2. offene Plätze (bis 16): meiste Pro-Tour-Titel (PC/ET) des Jahres,
// 3. Nebentouren: Jugend-Weltmeister, Top 2 Challenge Tour (ohne Karte), Top 2 Women's Series, 4. Rest: Tour Card Holder Qualifier (KW 45)
const GS_TV = ['masters', 'uk-open', 'matchplay', 'wgp', 'ec', 'gsod', 'pcf', 'wm', 'pl-final', 'ws-final'];
const GS_PDC = 16, GS_SECONDARY = 5, GS_WEEK = 46;
const active = (state, id) => id === 'P' || (getPlayer(state, id) && getPlayer(state, id).tier !== 'retired');
export function gsDirect(state) {
  const q = qualOf(state), y = state.date.year;
  if (q.gsDirect) return q.gsDirect;
  const ch = [...(state.champions?.[y - 1] ?? []).filter(c => c.week >= GS_WEEK), ...(state.champions?.[y] ?? []).filter(c => c.week < GS_WEEK)];
  const tv = ch.filter(c => GS_TV.includes(c.eventId)), used = new Set();
  const pdc = take([...tv.map(c => c.id), ...tv.map(c => c.runnerUp)].filter(id => id && active(state, id)), GS_PDC, used);
  const titles = {};
  for (const c of state.champions?.[y] ?? []) if ((c.cat === 'pc' || c.cat === 'et') && c.week < GS_WEEK) titles[c.id] = (titles[c.id] ?? 0) + 1;
  const ptMoney = id => moneyOf(state, 'protour', id);
  pdc.push(...take(Object.keys(titles).filter(id => active(state, id)).sort((a, b) => titles[b] - titles[a] || ptMoney(b) - ptMoney(a)), GS_PDC - pdc.length, used));
  const ct = idsOf(orderOfMerit(state, 'challenge')).filter(id => id === 'P' ? state.player.tour !== 'tour' : getPlayer(state, id)?.tier !== 'tour');
  const sec = [...take([q.wmYouth].filter(Boolean), 1, used), ...take(ct, 2, used), ...take(secondaryOrder(state, 'women', y), 2, used)];
  const out = { pdc, sec };
  if (state.date.week >= GS_WEEK - 1 && q.wmYouth) q.gsDirect = out;   // fixiert, sobald der Jugend-Weltmeister feststeht
  return out;
}
// Restplätze für den Qualifier (Jugend-Weltmeister-Platz ist immer reserviert)
export const gsQualSlots = state => Math.max(2, 32 - gsDirect(state).pdc.length - GS_SECONDARY);
const holderIds = (state, ids) => ids.filter(id => (id === 'P' ? state.player.tour === 'tour' : getPlayer(state, id)?.tier === 'tour'));

// ---- UK Open: 160 Spieler = alle Holder nach Rangliste + Top 8 CT/Dev-OOM (ohne Karte, Vorjahr) + Riley's-Amateure ----
const UK_NATIONS = ['ENG', 'SCO', 'WAL', 'NIR', 'IRL'];
function ukOpenField(state, rng) {
  const y = state.date.year, used = new Set();
  const holders = take(holdersByRank(state), 160, used), k = Math.min(8, Math.floor((160 - used.size) / 2));   // alle Holder spielen
  const noCard = ids => ids.filter(id => id !== 'P' && getPlayer(state, id)?.tier !== 'tour');
  const ct = take(noCard(idsOf(orderOfMerit(state, 'challenge', y - 1))), k, used), dev = take(noCard(idsOf(orderOfMerit(state, 'dev', y - 1))), k, used);
  const need = 160 - used.size;
  const ams = () => playersOfTier(state, 'amateur').filter(p => !p.woman && UK_NATIONS.includes(p.nation) && !used.has(p.id));
  if (ams().length < need) addAmateurs(state, 'ENG', need - ams().length);
  return [...holders, ...ct, ...dev, ...take(rng.shuffle(ams().map(p => p.id)), need, used)];
}

// ---- World Cup: Zweierteams ----
export function wcTeams(state) {
  const q = qualOf(state);
  if (q.wcTeams) return q.wcTeams;
  const p = state.player, rankP = idsOf(orderOfMerit(state, 'pdc'));
  const pool = [...playersOfTier(state, 'tour', 'challenge'), ...(p.tour === 'tour' || p.qschoolYear === state.date.year ? [p] : [])];
  const score = x => { const r = rankP.indexOf(x.id); return r >= 0 ? 1000 - r : overall(x.attrs); };
  const byNation = {};
  for (const x of pool) (byNation[x.nation] ??= []).push(x);
  const teams = {};
  for (const [nat, list] of Object.entries(byNation)) {
    if (list.length < 2) continue;
    const two = list.sort((a, b) => score(b) - score(a)).slice(0, 2);
    const id = two.some(x => x.id === 'P') ? 'P' : `W:${nat}`;
    const avg = k => Math.round((two[0].attrs[k] + two[1].attrs[k]) / 2);
    teams[id] = { id, nation: nat, name: `Team ${nationName(nat)}`, members: two.map(x => x.id), age: '–',
      attrs: { sco: avg('sco'), fin: avg('fin'), men: avg('men'), foc: avg('foc'), cal: avg('cal') },
      exp: Math.round(((two[0].exp ?? 0) + (two[1].exp ?? 0)) / 2), strength: score(two[0]) + score(two[1]) };
  }
  return (q.wcTeams = teams);
}

// ---- Premier League ----
export function plState(state) {
  const pl = ((state.pl ??= {})[state.date.year] ??= { players: null, points: {}, legs: {}, nights: 0 });
  if (!pl.players) pl.players = idsOf(orderOfMerit(state, 'pdc')).slice(0, 8);
  for (const id of pl.players) { pl.points[id] ??= 0; pl.legs[id] ??= 0; }
  return pl;
}
export function plTable(state) {
  const pl = plState(state);
  return pl.players.map(id => ({ id, pts: pl.points[id], legs: pl.legs[id] }))
    .sort((a, b) => b.pts - a.pts || b.legs - a.legs);
}
// Spieltag gewertet: Sieger 5, Finalist 3, Halbfinalisten 2 Punkte; Leg-Differenz für die Tabelle
export function scorePlNight(state, inst) {
  const pl = plState(state);
  const pts = { W: 5, F: 3, SF: 2 };
  for (const r of inst.rounds) for (const m of r.matches) {
    if (!m.score || m.bye) continue;
    pl.legs[m.a] = (pl.legs[m.a] ?? 0) + m.score[0] - m.score[1];
    pl.legs[m.b] = (pl.legs[m.b] ?? 0) + m.score[1] - m.score[0];
  }
  for (const [id, place] of Object.entries(inst.places ?? {})) pl.points[id] = (pl.points[id] ?? 0) + (pts[place] ?? 0);
  pl.nights++;
}

// ---- Winmau World Masters: Vorrunde ----
// Holder nach PDC-Rangliste (inkl. Spieler mit Karte)
const holdersByRank = state => idsOf(orderOfMerit(state, 'pdc')).filter(id => (id === 'P' ? state.player.tour === 'tour' : getPlayer(state, id)?.tier === 'tour'));
// Gesetzt (K.-o.): Platz 25–56. Gruppenphase: Holder ab Platz 57 + Beste der Nebentouren (CT, Dev, Nordic & Baltic, Asien,
// Nordamerika, Australien, Neuseeland, Frauen) + 4 JDC-Talente (jüngste starke Dev-Spieler)
export function mastersPrelimField(state, withPlayer) {
  const h = holdersByRank(state).filter(id => withPlayer || id !== 'P');
  const seeds = h.slice(24, 56), used = new Set(h);
  const pool = h.slice(56);
  const free = id => id && !used.has(id) && (used.add(id), true);
  for (const type of ['challenge', 'dev']) idsOf(orderOfMerit(state, type)).filter(id => id !== 'P' && getPlayer(state, id)?.tier !== 'tour').slice(0, 2).forEach(id => free(id) && pool.push(id));
  // Nebentouren: jeweils der Beste der Vorjahres-OOM (Women's Series, Asian Tour, CDC, DPA, DPNZ, Nordic & Baltic)
  for (const c of ['women', 'asia', 'cdc', 'dpa', 'dpnz', 'nb']) {
    const id = secondaryOrder(state, c, state.date.year - 1).find(x => !used.has(x));
    if (id) { free(id); pool.push(id); }
  }
  playersOfTier(state, 'dev').filter(p => p.age <= 18 && !used.has(p.id)).sort((a, b) => b.avg - a.avg).slice(0, 4).forEach(p => free(p.id) && pool.push(p.id));
  return { seeds, pool };
}

// ---- Felder ----
function computeField(state, ev) {
  const rng = fieldRng(state, ev), y = state.date.year;
  const pdc = idsOf(orderOfMerit(state, 'pdc')), pt = idsOf(orderOfMerit(state, 'protour'));
  const used = new Set();
  switch (ev.fmt) {
    case 'masters': {                        // Tour-Modus: Top 24 + 8 Qualifikanten der Vorrunde (fehlen sie noch: Platz 25–32)
      if (state.mode !== 'nsd') return pdc.slice(0, 24);
      const top = holdersByRank(state).slice(0, 24);
      top.forEach(id => used.add(id));
      return [...top, ...take(qualOf(state).mastersQ ?? [], 8, used), ...take(holdersByRank(state).slice(24), 32 - used.size, used)];
    }
    case 'matchplay': case 'wgp': return [...take(pdc, 16, used), ...take(pt, 16, used)];
    case 'ec': return idsOf(orderOfMerit(state, 'eto')).slice(0, 32);
    case 'pcf': return idsOf(orderOfMerit(state, 'pco')).slice(0, 64);
    case 'ukopen': return ukOpenField(state, rng);
    case 'ws': return [...take(pdc, 8, used), ...rng.shuffle(pdc.slice(8, 64)).slice(0, 8)];
    case 'wsf': {
      const ws = orderOfMerit(state, 'ws').filter(x => x.money > 0).map(x => x.p.id);
      return [...take(ws, 24, used), ...take(pdc, 24 - used.size, used)];
    }
    case 'gsq': {                            // alle Holder ohne direkten Grand-Slam-Platz
      const d = gsDirect(state), direct = new Set([...d.pdc, ...d.sec]);
      return holderIds(state, pdc).filter(id => !direct.has(id));
    }
    case 'gsod': {                           // Töpfe nach PDC-Rangliste, Nebentouren zuletzt
      const d = gsDirect(state);
      [...d.pdc, ...d.sec].forEach(id => used.add(id));
      const main = [...d.pdc, ...take(qualOf(state).gsqSurvivors ?? [], 32 - used.size, used)];
      main.push(...take(holderIds(state, pdc), 32 - used.size, used));      // fehlende Plätze: PDC-Rangliste
      const rk = id => { const i = pdc.indexOf(id); return i < 0 ? 999 : i; };
      return [...main.sort((a, b) => rk(a) - rk(b)), ...d.sec];
    }
    case 'wmq': {                            // Last Chance: alle Holder ohne WM-Platz
      const direct = new Set(wmDirect(state));
      return pdc.filter(id => !direct.has(id) && (id === 'P' ? state.player.tour === 'tour' : getPlayer(state, id)?.tier === 'tour'));
    }
    case 'wm': {
      const q = qualOf(state), direct = wmDirect(state);
      direct.forEach(id => used.add(id));
      const tchq = take(q.wmqSurvivors ?? [], 128 - used.size, used);
      return [...direct, ...tchq, ...take(pdc, 128 - used.size, used)];       // fehlende Plätze: PDC-Rangliste
    }
    case 'pln': return rng.shuffle([...plState(state).players]);
    case 'plf': return plTable(state).slice(0, 4).map(x => x.id);
    case 'wcod': return Object.values(wcTeams(state)).sort((a, b) => b.strength - a.strength).map(t => t.id);
    default: return [];
  }
}

// Gesetzte zuerst, Rest zugelost
function arrange(state, ev, ids) {
  const n = SEEDS[ev.fmt] ?? 0;
  return [...ids.slice(0, n), ...fieldRng(state, ev).shuffle(ids.slice(n))];
}

// Feld abrufen; ab der Event-Woche fixiert. withPlayer=false → Spieler wird durch Nachrücker ersetzt
// (Ausnahme Premier League / World Cup: dort spielt er automatisch mit).
export function majorField(state, ev, withPlayer) {
  const q = qualOf(state);
  let field = q[ev.id];
  if (!field) {
    field = arrange(state, ev, computeField(state, ev));
    if (state.date.week >= ev.week) q[ev.id] = field;
  }
  if (withPlayer || !field.includes('P') || ev.cat === 'pl' || ev.team) return [...field];
  const all = computeField(state, ev).concat(idsOf(orderOfMerit(state, 'pdc')));
  const reserve = all.find(id => id !== 'P' && !field.includes(id) && !String(id).startsWith('W:'));
  return field.map(id => (id === 'P' ? reserve : id)).filter(Boolean);
}

export const autoPlayer = (state, ev) => (ev.cat === 'pl' || ev.team) && majorField(state, ev, true).includes('P');

export function majorEligibility(state, ev) {
  const field = majorField(state, ev, true);
  if (field.includes('P')) return { ok: true };
  const rule = RULE_TEXT[ev.fmt] ?? 'Qualifikation nötig';
  const p = state.player;
  const rank = p.tour === 'tour' ? ` (du: PDC-Platz ${orderOfMerit(state, 'pdc').findIndex(x => x.p.id === 'P') + 1})` : '';
  return { ok: false, reason: `${rule}${rank}` };
}

// Team-/Spielerobjekt für World-Cup-IDs
export function teamOf(state, id) { return qualOf(state).wcTeams?.[id] ?? null; }
export const teamPrizeShare = 0.5;
export const clampRank = r => clamp(r, 1, 999);
export { moneyOf };
