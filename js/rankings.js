// Order of Merits (DOM-frei). Preisgeld wird je Jahr/Typ/Spieler aggregiert:
// state.rankings.years[year][type][id] = Betrag
import { playersOfTier, nonCardPros, DEV_MAX_AGE } from './world.js';
import { overall } from './player.js';
import { START_OOM_2026 } from '../data/players.js';

export const OOM_TYPES = {
  pdc: { label: 'PDC Order of Merit', short: 'PDC', years: 2, cards: 64 },
  protour: { label: 'Pro Tour OOM', short: 'Pro Tour', years: 2 },
  pco: { label: 'Players Championship OOM', short: 'PC', years: 2, hidden: true },   // nur Players Championships (→ PC Finals)
  challenge: { label: 'Challenge Tour OOM', short: 'Challenge', years: 1, cards: 2 },
  dev: { label: 'Development Tour OOM', short: 'Dev', years: 1, cards: 2 },
  eto: { label: 'European Tour OOM', short: 'ET', years: 2, hidden: true },
  ws: { label: 'World Series', short: 'WS', years: 1, hidden: true },
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
  if (type === 'pdc' || type === 'protour' || type === 'pco' || type === 'eto' || type === 'ws') {
    const list = playersOfTier(state, 'tour');
    if (p.tour === 'tour') list.push(p);
    return list;
  }
  const list = type === 'dev' ? [...playersOfTier(state, 'dev'), ...devHolders(state, year)] : nonCardPros(state);
  const eligible = p.tour !== 'tour' && (type === 'dev' ? p.age <= DEV_MAX_AGE : p.qschoolYear === year);   // Dev ohne Q-School
  if (eligible) list.push(p);
  return list;
}

// Tourcard-Holder bis 23 außerhalb der PDC-Top-64 dürfen zusätzlich Dev Tour spielen (inkl. Spieler)
export function devHolders(state, year = state.date.year) {
  return orderOfMerit(state, 'pdc', year).filter(x => x.rank > 64 && x.p.age <= DEV_MAX_AGE).map(x => x.p);
}

// 2-Jahres-Wertungen (PDC wie echt): Vorjahr voll, das Jahr davor läuft im Verlauf der Saison aus
// (zu Saisonbeginn KW 3 = 100 %, KW 52 = 0 %) → die Startliste zeigt die vollen 2 Jahre, am Saisonende zählen genau 2 Saisons.
export const oldYearWeight = (state, year) => (year === state.date.year ? Math.max(0, 1 - Math.max(0, state.date.week - 3) / 49) : 0);
export function moneyOf(state, type, id, year = state.date.year) {
  const b = y => state.rankings.years?.[y]?.[type]?.[id] ?? 0;
  return OOM_TYPES[type].years < 2 ? b(year) : b(year) + b(year - 1) + oldYearWeight(state, year) * b(year - 2);
}

// Sortiert nach Preisgeld; Gleichstand (z. B. noch keine Turniere) → Spielstärke (der Spieler steht bei Gleichstand hinten)
export function orderOfMerit(state, type, year = state.date.year) {
  const list = members(state, type, year).map(p => ({ p, money: moneyOf(state, type, p.id, year), ovr: overall(p.attrs) }));
  // Spieler mit Preisgeld, die nicht mehr im Teilnehmerkreis sind (z. B. Karte gewonnen), bleiben sichtbar
  list.sort((a, b) => b.money - a.money || (a.p.id === 'P') - (b.p.id === 'P') || b.ovr - a.ovr);   // bei Gleichstand: Spieler zuletzt, sonst nach Stärke
  return list.map((x, i) => ({ ...x, rank: i + 1 }));
}

export const rankOf = (state, type, id, year) => orderOfMerit(state, type, year).find(x => x.p.id === id)?.rank ?? null;

// Startwerte PDC OOM (Saisons vor Karrierestart), damit die erste Rangliste nicht leer ist.
// Top 64 + auslaufende Karten (Plätze 65–95) laut echter Startliste START_OOM_2026 (Tsd. £ = ★); Neuzugänge ohne PDC-Preisgeld.
export function seedRankings(state, rng, startYear) {
  // PDC-Preisgeld der 2 Vorjahre; Pro Tour (~40 %), ET (~15 %) und Players Championships (~25 %) als Anteil davon (alle 2 Jahre rollierend)
  const add = (id, total) => {
    for (const [type, share] of [['pdc', 1], ['protour', 0.4], ['eto', 0.15], ['pco', 0.25]]) {
      const t = total * share * (type === 'pdc' ? 1 : rng.float(0.6, 1.4)), old = Math.round(t * 0.4 / 50) * 50;
      addMoney(state, type, id, old, startYear - 2);          // dieser Anteil läuft im Lauf der Saison aus
      addMoney(state, type, id, Math.round(t) - old, startYear - 1);
    }
  };
  for (const p of Object.values(state.world.players)) {
    const n = +p.id.slice(1), k = p.id[0] === 'T' ? n - 1 : p.id[0] === 'X' ? 63 + n : -1;   // Platz − 1 in der Startliste
    if (k >= 0 && START_OOM_2026[k]) add(p.id, START_OOM_2026[k][1] * 1000);
  }
  state.rankings.seeded = true;
}
