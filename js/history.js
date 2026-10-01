// Statistik-Archiv (DOM-frei): Saisonbilanzen, Titel, Bestergebnisse je Event, Höchstplatzierung
import { rankOf } from './rankings.js';
import { seasonStats } from './state.js';
import { overall } from './player.js';
import { getPlayer } from './world.js';

export const PLACE_ORDER = ['W', 'CARD', 'F', 'SF', 'QF', 'L16', 'G3', 'G4', 'L32', 'L64', 'L128', 'L256', 'QUAL', 'NQ'];
const better = (a, b) => (b === undefined || PLACE_ORDER.indexOf(a) < PLACE_ORDER.indexOf(b));

const arch = state => (state.archive ??= { seasons: {}, titles: [], bests: {}, peak: {} });

// Turniersieger aller Turniere (außer lokal/Quali/PL-Spieltage): state.champions[year] = [{week, eventId, name, cat, id, who, nation}]
export function recordChampion(state, inst, id) {
  const w = getPlayer(state, id);
  ((state.champions ??= {})[state.date.year] ??= []).push({ week: state.date.week, eventId: inst.eventId, name: inst.name, cat: inst.cat, id, who: w?.name ?? '?', nation: w?.nation ?? null });
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
  check('dev', p.tour !== 'tour' && p.qschoolYear === state.date.year && p.age <= 23);
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
