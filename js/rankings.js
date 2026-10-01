// Order of Merits (DOM-frei). Preisgeld wird je Jahr/Typ/Spieler aggregiert:
// state.rankings.years[year][type][id] = Betrag
import { playersOfTier, nonCardPros } from './world.js';
import { overall } from './player.js';

export const OOM_TYPES = {
  pdc: { label: 'PDC Order of Merit', short: 'PDC', years: 2, cards: 64 },
  protour: { label: 'Pro Tour OOM', short: 'Pro Tour', years: 1 },
  challenge: { label: 'Challenge Tour OOM', short: 'Challenge', years: 1, cards: 2 },
  dev: { label: 'Development Tour OOM', short: 'Dev', years: 1, cards: 2 },
};

export function addMoney(state, type, id, amount, year = state.date.year) {
  if (!amount) return;
  const y = (state.rankings.years ??= {})[year] ??= {};
  const t = y[type] ??= {};
  t[id] = (t[id] ?? 0) + amount;
}

// Teilnehmerkreis je Rangliste
function members(state, type, year) {
  const p = state.player;
  if (type === 'pdc' || type === 'protour') {
    const list = playersOfTier(state, 'tour');
    if (p.tour === 'tour') list.push(p);
    return list;
  }
  const list = type === 'dev' ? playersOfTier(state, 'dev') : nonCardPros(state);
  const eligible = p.tour !== 'tour' && p.qschoolYear === year && (type !== 'dev' || p.age <= 23);
  if (eligible) list.push(p);
  return list;
}

export function moneyOf(state, type, id, year = state.date.year) {
  let sum = 0;
  for (let y = year - OOM_TYPES[type].years + 1; y <= year; y++) sum += state.rankings.years?.[y]?.[type]?.[id] ?? 0;
  return sum;
}

// Sortiert nach Preisgeld; Gleichstand (z. B. noch keine Turniere) → Spielstärke
export function orderOfMerit(state, type, year = state.date.year) {
  const list = members(state, type, year).map(p => ({ p, money: moneyOf(state, type, p.id, year), ovr: overall(p.attrs) }));
  // Spieler mit Preisgeld, die nicht mehr im Teilnehmerkreis sind (z. B. Karte gewonnen), bleiben sichtbar
  list.sort((a, b) => b.money - a.money || b.ovr - a.ovr);
  return list.map((x, i) => ({ ...x, rank: i + 1 }));
}

export const rankOf = (state, type, id, year) => orderOfMerit(state, type, year).find(x => x.p.id === id)?.rank ?? null;

// Startwerte PDC OOM (Saisons vor Karrierestart), damit die erste Rangliste nicht leer ist.
// Top 64 nach Listenreihenfolge (≈ 2,8 Mio. € · Rang^−0,8), übrige 2026er Tour-Spieler 30–150 Tsd. €.
export function seedRankings(state, rng, startYear) {
  const add = (id, total) => {
    addMoney(state, 'pdc', id, Math.round(total * 0.4 / 50) * 50, startYear - 2);
    addMoney(state, 'pdc', id, Math.round(total * 0.6 / 50) * 50, startYear - 1);
  };
  for (const p of Object.values(state.world.players)) {
    const n = +p.id.slice(1);
    if (p.id[0] === 'T') add(p.id, 2800000 * Math.pow(n, -0.8));
    else if (p.id[0] === 'X' || p.id[0] === 'N') add(p.id, rng.float(30000, 150000) * (p.id[0] === 'N' ? 0.4 : 1));
  }
  state.rankings.seeded = true;
}
