// Statistik-Archiv (DOM-frei): Saisonbilanzen, Titel, Bestergebnisse je Event, Höchstplatzierung
import { rankOf } from './rankings.js';
import { seasonStats } from './state.js';
import { overall } from './player.js';
import { getPlayer } from './world.js';
import { nationName } from '../data/nations.js';

export const PLACE_ORDER = ['W', 'CARD', 'F', 'SF', 'QF', 'L16', 'G2', 'G3', 'G4', 'L32', 'L64', 'L96', 'L128', 'L160', 'L256', 'QUAL', 'NQ'];
const better = (a, b) => (b === undefined || PLACE_ORDER.indexOf(a) < PLACE_ORDER.indexOf(b));

const arch = state => (state.archive ??= { seasons: {}, titles: [], bests: {}, peak: {} });

// Turniersieger aller Turniere (außer lokal/Quali/PL-Spieltage): state.champions[year] = [{week, eventId, name, cat, id, who, nation}]
export function recordChampion(state, inst, id, runnerUp = null) {
  const w = getPlayer(state, id), t = inst.teams?.[id];   // Version 193: World Cup – Sieger ist das Land
  ((state.champions ??= {})[state.date.year] ??= []).push({ week: state.date.week, eventId: inst.eventId, name: inst.name, cat: inst.cat, id,
    who: t ? nationName(t.nation) : w?.name ?? '?', nation: t?.nation ?? w?.nation ?? null, ...(t ? { team: true } : {}), ...(runnerUp ? { runnerUp } : {}) });
}

// Version 221: Platzierungen ALLER Teilnehmer je Turnier im laufenden Jahr (für das Spieler-Pop-up der Ranglisten).
// state.placements[Jahr] = [{ w: KW, n: Name, c: Kategorie, e: Event-ID, p: { Platz: [IDs] } }] – kompakt nach Platz gruppiert, nur das aktuelle Jahr (pruneSave)
const NO_PLACES = new Set(['local', 'ddv', 'wdf']);
export function recordPlaces(state, inst) {
  if (!inst.places || inst.teams || NO_PLACES.has(inst.cat)) return;
  const p = {};
  for (const [id, pl] of Object.entries(inst.places)) (p[pl ?? 'NQ'] ??= []).push(id);   // Holder-Qualifier ohne Platz → nicht qualifiziert
  ((state.placements ??= {})[state.date.year] ??= []).push({ w: inst.week ?? state.date.week, n: inst.name, c: inst.cat, e: inst.eventId, p });
}
export function placementsOf(state, id, year = state.date.year) {
  const out = [];
  for (const ev of state.placements?.[year] ?? []) for (const [pl, ids] of Object.entries(ev.p)) if (ids.includes(id)) { out.push({ week: ev.w, name: ev.n, cat: ev.c, eventId: ev.e, place: pl }); break; }
  return out.reverse();   // neueste zuerst
}
// Version 221: Tourcard ohne Unterbrechung seit (Jahr); 0 = schon vor Spielbeginn (echte Dauer unbekannt). Wöchentlich nachgeführt.
export function trackTourSince(state) {
  const y = state.date.year, p = state.player;
  for (const x of Object.values(state.world.players)) {
    if (x.tier === 'tour') x.tourSince ??= y;
    else if (x.tourSince != null) delete x.tourSince;
  }
  if (p.tour === 'tour') p.tourSince ??= y;
  else if (p.tourSince != null) delete p.tourSince;
}
export function initTourSince(state) {   // Karrierestart/alte Spielstände: alle aktuellen Holder „seit vor Spielbeginn“
  for (const x of Object.values(state.world.players)) if (x.tier === 'tour') x.tourSince ??= 0;
}

// Nach jedem eigenen Turnier
export function trackTitle(state, inst) {
  if (inst.isQualifier || !inst.place) return;
  const a = arch(state);
  if (inst.place === 'W' && !inst.plNight) a.titles.unshift({ year: inst.year, week: inst.week, name: inst.name, cat: inst.cat, prize: inst.prize });
  // Bestergebnis je Event (Pro Tour/CT/Dev zusammengefasst je Serie)
  const key = inst.plNight ? 'cat:plnight' : ['pc', 'et', 'challenge', 'dev', 'local', 'ddv', 'wdf'].includes(inst.cat) && inst.eventId !== 'youth-wm' ? `cat:${inst.cat}` : inst.baseName;
  const b = a.bests[key];
  if (!b || better(inst.place, b.place)) a.bests[key] = { place: inst.place, year: inst.year, cat: inst.cat, name: key.startsWith('cat:') ? null : inst.baseName };
}

// Wöchentlich: Höchstplatzierungen in den Ranglisten
export function trackPeak(state) {
  const a = arch(state), p = state.player;
  const check = (type, ok) => {
    if (!ok) return;
    const r = rankOf(state, type, 'P');
    if (r && (!a.peak[type] || r < a.peak[type].rank)) a.peak[type] = { rank: r, year: state.date.year, week: state.date.week };
  };
  check('pdc', p.tour === 'tour');
  check('challenge', p.tour !== 'tour' && p.qschoolYear === state.date.year);
  check('dev', p.tour !== 'tour' && p.age <= 23);
}

// Jahresende: Saison archivieren
export function recordHistory(state) {
  const y = state.date.year, p = state.player, st = seasonStats(state, y), f = state.finance.seasons[y] ?? {};
  arch(state).seasons[y] = {
    age: p.age, ovr: overall(p.attrs), exp: p.exp, status: p.tour === 'tour' ? 'Tourcard' : p.qschoolYear === y ? 'Challenge/Dev' : 'Amateur',
    pdc: p.tour === 'tour' ? rankOf(state, 'pdc', 'P') : null,
    ct: p.tour !== 'tour' && p.qschoolYear === y ? rankOf(state, 'challenge', 'P') : null,
    avg: st.darts ? st.points / st.darts * 3 : 0, matches: st.matches, wins: st.wins, titles: st.titles,
    prize: f.prize ?? 0, income: f.income ?? 0,
  };
}

export const archiveOf = arch;
