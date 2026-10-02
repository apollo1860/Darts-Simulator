// Majors & Events (DOM-frei): Qualifikation/Felder, World-Cup-Teams, Premier-League-Tabelle.
// Felder werden in der Event-Woche einmal berechnet und in state.qual[Jahr][eventId] gespeichert.
import { orderOfMerit, moneyOf } from './rankings.js';
import { playersOfTier, getPlayer } from './world.js';
import { overall } from './player.js';
import { RNG, hashSeed } from './rng.js';
import { nationName } from '../data/nations.js';
import { WM_QUALIFIERS } from '../data/tournaments.js';
import { clamp } from './util.js';

export const MAJOR_CATS = ['major', 'ws', 'pl'];
// Anzahl gesetzter Spieler (Rest wird zugelost)
const SEEDS = { masters: 8, matchplay: 16, wgp: 16, ec: 32, pcf: 32, ukopen: 999, wm: 32, ws: 8, wsf: 8, wcod: 8, plf: 4, wmq: 0, pln: 0, gsod: 32 };

export const RULE_TEXT = {
  masters: 'Top 24 der PDC Order of Merit', ukopen: 'Tourcard oder Top 32 der Challenge-Tour-OOM',
  matchplay: 'Top 16 PDC OOM oder Top 16 Pro Tour OOM', wgp: 'Top 16 PDC OOM oder Top 16 Pro Tour OOM',
  ec: 'Top 32 der European-Tour-Wertung', pcf: 'Top 64 der Pro Tour OOM', gsod: 'Top 16 PDC, Top 12 Pro Tour oder Top 2 CT/Dev',
  wmq: 'Tourcard ohne direkten WM-Platz', wm: 'Top 40 PDC, Top 40 Pro Tour, CT/Dev Top 3, Jugend-Weltmeister, internationaler Qualifier oder TCHQ',
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

// WM: alle Plätze außer dem Tour Card Holder Qualifier – Top 40 PDC + 40 Pro Tour (rücken nach), Jugend-Weltmeister,
// Top 3 Dev/CT-OOM, Q-School-WM-Qualifier, internationale Qualifier. Doppelt Qualifizierte rücken NICHT nach → mehr TCHQ-Plätze.
export function wmDirect(state) {
  const q = qualOf(state), used = new Set(wmAuto(state)), out = [...used];
  const add = ids => { for (const id of ids) if (id && !used.has(id)) { used.add(id); out.push(id); } };
  add([q.wmYouth]);
  add(idsOf(orderOfMerit(state, 'dev')).slice(0, 3));
  add(idsOf(orderOfMerit(state, 'challenge')).slice(0, 3));
  add([q.wmQsWinner]);
  for (const x of WM_QUALIFIERS) add(q.wmReg?.[x.key] ?? []);
  return out.slice(0, 126);
}
export const wmTchqSlots = state => 128 - wmDirect(state).length;

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

// ---- Felder ----
function computeField(state, ev) {
  const rng = fieldRng(state, ev), y = state.date.year;
  const pdc = idsOf(orderOfMerit(state, 'pdc')), pt = idsOf(orderOfMerit(state, 'protour'));
  const used = new Set();
  switch (ev.fmt) {
    case 'masters': return pdc.slice(0, 24);
    case 'matchplay': case 'wgp': return [...take(pdc, 16, used), ...take(pt, 16, used)];
    case 'ec': return idsOf(orderOfMerit(state, 'eto')).slice(0, 32);
    case 'pcf': return pt.slice(0, 64);
    case 'ukopen': return [...take(pdc, 999, used), ...take(idsOf(orderOfMerit(state, 'challenge')), 32, used)];
    case 'ws': return [...take(pdc, 8, used), ...rng.shuffle(pdc.slice(8, 64)).slice(0, 8)];
    case 'wsf': {
      const ws = orderOfMerit(state, 'ws').filter(x => x.money > 0).map(x => x.p.id);
      return [...take(ws, 24, used), ...take(pdc, 24 - used.size, used)];
    }
    case 'gsod': return [...take(pdc, 16, used), ...take(pt, 8, used),
      ...take(idsOf(orderOfMerit(state, 'challenge')), 2, used), ...take(idsOf(orderOfMerit(state, 'dev')), 2, used), ...take(pt, 4, used)];
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
