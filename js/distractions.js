// Störmomente (DOM-frei): planen, Chancen berechnen, Entscheidung auswerten
import { DISTRACTIONS, DISTRACTION_CHANCE } from '../data/distractions.js';
import { RNG } from './rng.js';
import { getPlayer } from './world.js';
import { addMod } from './tournaments.js';
import { clamp } from './util.js';

export const levelOf = cat => (cat === 'local' ? 'local' : cat === 'ddv' || cat === 'wdf' ? 'ddv' : 'pro');

// Beim Start einer DartConnect-Simulation: kommt es zu einem Störmoment, und wann?
export function planDistraction(state) {
  const inst = state.activeEvent, live = inst.live;
  if (live.dist !== undefined) return live.dist;
  const rng = new RNG(state.rng), lvl = levelOf(inst.cat);
  if (!rng.chance(DISTRACTION_CHANCE[lvl])) { live.dist = null; return null; }
  const pool = DISTRACTIONS.filter(d => d.levels.includes(lvl));
  live.dist = { id: rng.pick(pool).id, atVisit: rng.int(2, 7), who: rng.chance(0.5) ? 'opp' : 'crowd', done: false };
  return live.dist;
}

// Ist jetzt (vor der eigenen Aufnahme) der Moment gekommen?
export function distractionDue(state) {
  const live = state.activeEvent?.live, d = live?.dist;
  if (!d || d.done || live.m.done || live.m.turn !== live.me) return null;
  const myVisits = Math.floor(live.m.stats[live.me].darts / 3);
  return myVisits >= d.atVisit ? d : null;
}

export function optionChance(p, opt) {
  return clamp(opt.base + ((p.attrs[opt.attr] ?? 60) - 60) * 0.006 + (p.exp ?? 0) * 0.015, 0.1, 0.92);
}

// Texte mit Gegnernamen
export function describe(state, d) {
  const def = DISTRACTIONS.find(x => x.id === d.id);
  const live = state.activeEvent.live, pm = state.activeEvent.rounds[state.activeEvent.current].matches.find(m => m.a === 'P' || m.b === 'P');
  const opp = getPlayer(state, live.me === 0 ? pm.b : pm.a).name.split(' ').slice(-1)[0];
  const fill = t => t.replaceAll('{opp}', opp).replace('{who}', d.who === 'opp' ? opp : 'ein Zuschauer');
  return {
    icon: def.icon, title: fill(def.title), text: fill(def.text), fill,
    options: def.options.map(o => ({ ...o, chance: optionChance(state.player, o) })),
  };
}

// Entscheidung auswerten → Modifikatoren für die nächsten Aufnahmen
export function resolveDistraction(state, idx) {
  const live = state.activeEvent.live, d = live.dist;
  const info = describe(state, d), opt = info.options[idx];
  const ok = new RNG(state.rng).chance(opt.chance);
  const eff = ok ? opt.win : opt.lose;
  if (eff.self) addMod(live, live.me, eff.self[0], eff.self[1]);
  if (eff.opp) addMod(live, 1 - live.me, eff.opp[0], eff.opp[1]);
  d.done = true; d.choice = idx; d.success = ok;
  return { ok, text: info.fill(eff.text), chance: opt.chance, label: opt.label };
}
