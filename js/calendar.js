// Wochenkalender (DOM-frei)
import { CALENDAR, LOCAL_BLOCKED_WEEKS, LOCAL_NAMES, LOCAL_CITIES } from '../data/tournaments.js';
import { REGIONS } from '../data/regions.js';
import { PRIZES } from '../data/prizemoney.js';
import { RNG, hashSeed } from './rng.js';
import { WEEKS_PER_YEAR } from './util.js';
import { addNews } from './news.js';
import { seasonFinance } from './finance.js';
import { seasonStats } from './state.js';

// Lokales Turnier der Woche (deterministisch aus Seed + Datum)
export function localEvent(state, year, week) {
  if (LOCAL_BLOCKED_WEEKS.includes(week)) return null;
  const r = new RNG(hashSeed(state.seed, 'local', year, week));
  const reg = state.player.nation === 'DE' ? REGIONS[state.player.region] : null;
  const cities = reg?.cities ?? LOCAL_CITIES[state.player.nation] ?? LOCAL_CITIES._;
  const city = r.pick(cities);
  const { winMin, winMax } = PRIZES.local;
  return {
    id: `local-${year}-${week}`, cat: 'local', week, weeks: 1,
    name: r.pick(LOCAL_NAMES).replace('{c}', city),
    city, country: state.player.nation, region: reg?.name ?? null,
    prizeWin: Math.round(r.int(winMin, winMax) / 10) * 10,
  };
}

const runsInWeek = (ev, week) => week >= ev.week && week < ev.week + (ev.weeks ?? 1);

export function eventsInWeek(state, year, week) {
  const list = CALENDAR.filter(ev => runsInWeek(ev, week)).map(ev => ({ ...ev, startsThisWeek: ev.week === week }));
  const loc = localEvent(state, year, week);
  if (loc) list.unshift(loc);
  return list;
}

export function findEvent(state, id, year = state.date.year, week = state.date.week) {
  return eventsInWeek(state, year, week).find(e => e.id === id) ?? null;
}

// Komplettes Jahr: [{week, events}]
export function yearSchedule(state, year) {
  return Array.from({ length: WEEKS_PER_YEAR }, (_, i) => ({ week: i + 1, events: eventsInWeek(state, year, i + 1) }));
}

// Woche vorrücken. false, wenn noch ein Turnier läuft.
export function advanceWeek(state) {
  if (state.activeEvent && !state.activeEvent.done) return false;
  state.activeEvent = null;
  state.date.week++;
  if (state.date.week > WEEKS_PER_YEAR) newYear(state);
  state.week = { played: false, eventId: null };
  return true;
}

function newYear(state) {
  state.date.year++;
  state.date.week = 1;
  state.player.age++;
  for (const p of Object.values(state.world.players)) p.age++;
  seasonFinance(state, state.date.year);
  seasonStats(state, state.date.year);
  addNews(state, 'info', `Saison ${state.date.year} beginnt`,
    `Du bist jetzt ${state.player.age} Jahre alt.${state.player.age === 24 ? ' Damit endet deine Berechtigung für die Development Tour.' : ''}`);
}
