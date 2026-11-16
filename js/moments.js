// New Star Darts: Spielmomente im DartConnect-Liveticker (DOM-frei, Version 68).
// Etwa alle 1–2 eigene Matches (`planMoment`) unterbricht ein kleiner Zwischenfall (Rutschiger Dart, Zwischenruf, Blitzlicht …) vor einer
// eigenen Aufnahme. Zwei Optionen, jede mit genau 50 % auf einen guten oder schlechten Ausgang: Streuungs-Multiplikator für n Aufnahmen
// (für dich bzw. den Gegner, wirkt in der Simulation und auf den Zielkreis beim Selbstwerfen) und manchmal eine kleine dauerhafte
// Nebenwirkung (Fans = Medienpräsenz, Manager/Sponsoren = Professionalität, Zufriedenheit, Selbstvertrauen, Energie).
import { MOMENTS } from '../data/moments.js';
import { RNG } from './rng.js';
import { getPlayer } from './world.js';
import { surname } from './util.js';
import { addMod, playerMatch, lateMatch, nineAlive, bigFish } from './tournaments.js';
import { addFans, addRel, addEnergy } from './nsd.js';
import { managerOf } from './career.js';

export const MOMENT_AFTER_ONE = 0.5;     // nach einem Match mit Moment: 50 % für das nächste, danach garantiert (→ alle 1–2 Matches)
export const MOMENT_WIN = 0.5;           // jede Option: gleiche Chance auf Gewinn und Verlust
export const MOMENT_VISITS = [2, 6];     // ab der wievielten eigenen Aufnahme (zufällig)
const NO_REPEAT = 8;                     // so viele zuletzt gesehene Momente werden nicht wiederholt
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Beim ersten Prüfen eines Live-Matches: kommt in diesem Match ein Moment, welcher und wann?
export function planMoment(state) {
  const live = state.activeEvent.live, rng = new RNG(state.rng);
  const skip = state.momentSkip ?? 1;                                  // Matches seit dem letzten Moment
  const on = skip >= 1 || rng.chance(MOMENT_AFTER_ONE);
  state.momentSkip = on ? 0 : skip + 1;
  if (!on) return (live.moment = null);
  const seen = state.momentSeen ??= [], pool = MOMENTS.filter(m => !seen.includes(m.id)), m = rng.pick(pool.length ? pool : MOMENTS);
  seen.push(m.id); if (seen.length > NO_REPEAT) seen.shift();
  return (live.moment = { id: m.id, atVisit: rng.int(MOMENT_VISITS[0], MOMENT_VISITS[1]), done: false });
}

// Ist jetzt (zu Beginn einer eigenen Aufnahme, nicht in der Schlussphase) der Moment gekommen?
export function momentDue(state) {
  const inst = state.activeEvent, live = inst?.live, lm = live?.m;
  if (!lm || lm.done || lm.turn !== live.me || lm.visit.darts.length) return null;
  if (live.moment === undefined) planMoment(state);
  const mo = live.moment;
  if (!mo || mo.done || lateMatch(lm) || nineAlive(state) || bigFish(state)) return null;   // kein Zwischenfall vor 9-Darter-Versuch / 170
  return Math.floor(lm.stats[live.me].darts / 3) >= mo.atVisit ? mo : null;
}

const oppName = state => {
  const inst = state.activeEvent, pm = playerMatch(inst), id = pm.a === 'P' ? pm.b : pm.a;
  return surname(inst.teams?.[id]?.name ?? getPlayer(state, id)?.name ?? 'dein Gegner');
};
const fill = (t, opp) => t.replaceAll('{opp}', opp);

// Texte für die Anzeige (Gegnername eingesetzt)
export function describeMoment(state, mo) {
  const def = MOMENTS.find(x => x.id === mo.id), opp = oppName(state);
  return { icon: def.icon, title: fill(def.title, opp), text: fill(def.text, opp), options: def.options.map(o => ({ label: o.label })) };
}

// Kurztext einer Wirkung („Dein Wurf: 10 % besser für 3 Aufnahmen“)
export const effectLines = eff => {
  const out = [], pct = m => Math.round(Math.abs(1 - m) * 100);
  if (eff.s) out.push({ good: eff.s[0] < 1, text: `Deine Würfe ${pct(eff.s[0])} % ${eff.s[0] < 1 ? 'genauer' : 'ungenauer'} · ${eff.s[1]} Aufnahmen` });
  if (eff.o) out.push({ good: eff.o[0] > 1, text: `Gegner ${pct(eff.o[0])} % ${eff.o[0] > 1 ? 'ungenauer' : 'genauer'} · ${eff.o[1]} Aufnahmen` });
  const L = { fans: 'Fans', manager: 'Manager', sponsors: 'Sponsoren', sat: 'Zufriedenheit', mom: 'Selbstvertrauen', energy: 'Energie' };
  for (const [k, v] of Object.entries(eff.fx ?? {})) out.push({ good: v > 0, text: `${L[k]} ${v > 0 ? '+' : '−'}${Math.abs(v)}${k === 'energy' ? ' %' : ''}` });
  return out;
};

// Entscheidung auswerten (50/50) → Modifikatoren für die nächsten Aufnahmen + dauerhafte Nebenwirkung
export function resolveMoment(state, idx) {
  const live = state.activeEvent.live, mo = live.moment, def = MOMENTS.find(x => x.id === mo?.id), opt = def?.options[idx];
  if (!opt || mo.done) throw new Error('Kein offener Moment');
  const ok = new RNG(state.rng).chance(MOMENT_WIN), eff = ok ? opt.win : opt.lose, p = state.player;
  if (eff.s) addMod(live, live.me, eff.s[0], eff.s[1]);
  if (eff.o) addMod(live, 1 - live.me, eff.o[0], eff.o[1]);
  const fx = eff.fx ?? {};
  if (fx.fans) addFans(p, fx.fans);
  if (fx.manager && managerOf(state)) addRel(p, 'manager', fx.manager);
  if (fx.sponsors && (p.rel.sponsors ?? 0) > 0) addRel(p, 'sponsors', fx.sponsors);
  if (fx.sat) p.satisfaction = clamp((p.satisfaction ?? 50) + fx.sat, 0, 100);
  if (fx.mom) p.momentum = clamp(Math.round(((p.momentum ?? 0) + fx.mom) * 10) / 10, -10, 10);
  if (fx.energy) addEnergy(p, fx.energy);
  mo.done = true; mo.choice = idx; mo.success = ok;
  (state.mstats ??= {}).moments = (state.mstats.moments ?? 0) + 1;
  return { ok, label: opt.label, text: fill(eff.t, oppName(state)), lines: effectLines(eff) };
}
