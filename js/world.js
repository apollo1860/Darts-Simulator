// KI-Spielwelt (DOM-frei). Phase 3: Jahresentwicklung, Auf-/Abstieg, Nachwuchs.
import { TOUR_PLAYERS, CHALLENGE_PLAYERS, DEV_PLAYERS, LOCAL_PLAYERS } from '../data/players.js';
import { attrsForAverage } from './player.js';

export function createWorld(rng) {
  const players = {};
  const add = (rows, tier, prefix) => rows.forEach(([name, nation, age, avg], i) => {
    const id = `${prefix}${i + 1}`;
    players[id] = {
      id, name, nation, age, avg,
      tier: tier === 'tour' && i < 16 ? 'top' : tier,
      attrs: attrsForAverage(avg, rng),
    };
  });
  add(TOUR_PLAYERS, 'tour', 'T');
  add(CHALLENGE_PLAYERS, 'challenge', 'C');
  add(DEV_PLAYERS, 'dev', 'D');
  add(LOCAL_PLAYERS, 'local', 'L');
  return { players };
}

export const getPlayer = (state, id) => (id === 'P' ? state.player : state.world.players[id]);
export const playersOfTier = (state, ...tiers) =>
  Object.values(state.world.players).filter(p => tiers.includes(p.tier));

// Tour-Status-Text für Karten
export function tourStatus(p) {
  if (p.id === 'P') {
    return { tour: 'Tourcard', challenge: 'Challenge Tour', dev: 'Development Tour' }[p.tour] ?? 'Amateur';
  }
  return { top: 'Tourcard', tour: 'Tourcard', challenge: 'Challenge Tour', dev: 'Development Tour', local: 'Amateur' }[p.tier];
}
