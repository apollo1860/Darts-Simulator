// Order of Merits (DOM-frei). Phase 1: noch keine Ranglisten-Turniere → Anzeige nach Stärke.
// Ab Phase 3/4: state.rankings.entries [{id, oom, amount, year, week}] → rollierend summieren.
import { playersOfTier } from './world.js';
import { overall } from './player.js';

export const OOM_TYPES = {
  pdc: { label: 'PDC Order of Merit', tiers: ['top', 'tour'], tour: 'tour', years: 2 },
  protour: { label: 'Pro Tour OOM', tiers: ['top', 'tour'], tour: 'tour', years: 1 },
  challenge: { label: 'Challenge Tour OOM', tiers: ['challenge'], tour: 'challenge', years: 1 },
  dev: { label: 'Development Tour OOM', tiers: ['dev'], tour: 'dev', years: 1 },
};

export function orderOfMerit(state, type) {
  const t = OOM_TYPES[type];
  const money = {};
  const minYear = state.date.year - t.years + 1;
  for (const e of state.rankings.entries) if (e.oom === type && e.year >= minYear) money[e.id] = (money[e.id] ?? 0) + e.amount;
  const list = playersOfTier(state, ...t.tiers).map(p => ({ p, money: money[p.id] ?? 0, ovr: overall(p.attrs) }));
  if (state.player.tour === t.tour) list.push({ p: state.player, money: money.P ?? 0, ovr: overall(state.player.attrs) });
  list.sort((a, b) => b.money - a.money || b.ovr - a.ovr);
  return list.map((x, i) => ({ ...x, rank: i + 1 }));
}
