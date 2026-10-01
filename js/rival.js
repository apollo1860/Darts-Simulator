// Rivale (DOM-frei): gleichaltriges Talent aus deiner Nation/Region, startet mit dir und hält mit.
// Taucht in lokalen Turnieren (40 %), DDV (80 %) und WDF (50 %) gezielt im Feld auf, sonst über CT/Dev/Q-School/Tour.
// Kopf-an-Kopf-Bilanz in state.rival {id, w, l, meetings[]}; Duelle wirken extra aufs Selbstvertrauen.
import { RNG } from './rng.js';
import { NAME_POOLS } from '../data/names.js';
import { attrsForAverage, avgForRating, overall } from './player.js';
import { aiExp, changeStrength, DEV_MAX_AGE } from './world.js';
import { addNews } from './news.js';
import { clamp } from './util.js';

export const RIVAL_ID = 'R1';
export const RIVAL_CHANCE = { local: 0.4, ddv: 0.8, wdf: 0.5 };
const poolKey = n => (['DE', 'AT', 'CH'].includes(n) ? 'DE' : ['NL', 'BE'].includes(n) ? 'NL'
  : ['ENG', 'SCO', 'WAL', 'NIR', 'IRL', 'AU', 'NZ', 'US', 'CA'].includes(n) ? 'EN' : 'EU');

// Niveau des Spielers als Average (aus dem Gesamtwert, nicht nur Scoring)
const levelAvg = p => avgForRating(overall(p.attrs));

export const rivalOf = state => (state.rival ? state.world.players[state.rival.id] ?? null : null);
export const isRival = (state, id) => !!state.rival && id === state.rival.id;
export const rivalHasCard = state => rivalOf(state)?.tier === 'tour';

// Beim Karrierestart (oder Migration): Rivale anlegen – gleiches Alter, ähnliche Stärke
export function createRival(state, rng = new RNG(state.rng)) {
  const p = state.player, pool = NAME_POOLS[poolKey(p.nation)];
  const used = new Set(Object.values(state.world.players).map(x => x.name).concat(p.name));
  let name;
  for (let i = 0; i < 50 && (!name || used.has(name)); i++) name = `${rng.pick(pool.first)} ${rng.pick(pool.last)}`;
  const avg = Math.round((levelAvg(p) + rng.float(0, 1.5)) * 10) / 10;
  state.world.players[RIVAL_ID] = {
    id: RIVAL_ID, name, nation: p.nation, age: p.age, avg, tier: p.age <= DEV_MAX_AGE ? 'dev' : 'challenge', cardUntil: null,
    attrs: attrsForAverage(avg, rng), exp: aiExp('dev', p.age, rng), rival: true,
  };
  state.rival = { id: RIVAL_ID, w: 0, l: 0, meetings: [] };
  addNews(state, 'info', `⚔️ Dein Rivale: ${name}`,
    `Ihr kennt euch seit der Jugend – gleich alt, gleich ehrgeizig. ${name} will genau wie du auf die Tour. Ihr werdet euch noch oft begegnen.`);
  return state.world.players[RIVAL_ID];
}

// Rivale gezielt ins Feld (lokal/DDV/WDF), wenn er noch keine Karte hat
export function addRivalToField(state, cat, ids, rng) {
  const r = rivalOf(state);
  if (!r || r.tier === 'tour' || r.tier === 'retired' || ids.includes(r.id) || !rng.chance(RIVAL_CHANCE[cat] ?? 0)) return ids;
  return ids.length ? [...ids.slice(0, -1), r.id] : [r.id];
}

// Nach einem eigenen Match gegen den Rivalen
export function rivalMeeting(state, inst, won, score) {
  const rv = state.rival, r = rivalOf(state), p = state.player;
  if (won) rv.w++; else rv.l++;
  rv.meetings.unshift({ year: state.date.year, week: state.date.week, event: inst.name, round: inst.rounds[inst.current]?.name ?? '', won, score });
  rv.meetings = rv.meetings.slice(0, 30);
  p.momentum = clamp((p.momentum ?? 0) + (won ? 1 : -0.5), -10, 10);       // Duelle zählen extra
  const bil = `Bilanz ${rv.w}–${rv.l}`;
  addNews(state, 'result', won ? `⚔️ Sieg gegen Rivale ${r.name}!` : `⚔️ Niederlage gegen Rivale ${r.name}`,
    `${inst.name}, ${inst.rounds[inst.current]?.name ?? ''}: ${score}. ${bil}.${won ? ' Das tut gut – Selbstvertrauen steigt.' : ' Das nagt …'}`);
}

// Titel / Tourcard des Rivalen → News
export function rivalTitle(state, inst, id) {
  if (!isRival(state, id) || inst.withPlayer && inst.place === 'W') return;
  addNews(state, 'ranking', `⚔️ ${rivalOf(state).name} gewinnt ${inst.name}`, 'Dein Rivale legt vor. Zeit, nachzuziehen.');
}
export function rivalCard(state, id, until) {
  if (!isRival(state, id)) return;
  addNews(state, 'ranking', `⚔️ ${rivalOf(state).name} holt die Tourcard`, `Gültig bis Ende ${until}.${state.player.tour === 'tour' ? '' : ' Du musst nachziehen!'}`);
}

// Jahresende (nach developWorld): Rivale hält ungefähr mit dir mit (zieht 50 % Richtung deines Niveaus ± Zufall)
export function rivalYearEnd(state, rng, year) {
  const r = rivalOf(state);
  if (!r || r.tier === 'retired') return;
  const target = levelAvg(state.player) + rng.normal(0.5, 2);
  changeStrength(r, (target - r.avg) * 0.5);
  const rv = state.rival;
  addNews(state, 'info', `⚔️ Saisonduell ${year}: du vs. ${r.name}`,
    `Gesamt: du ${overall(state.player.attrs)} · ${r.name} ${overall(r.attrs)}. Direkte Bilanz ${rv.w}–${rv.l}${rv.meetings.some(m => m.year === year) ? '' : ' (dieses Jahr kein Duell)'}.`);
}
