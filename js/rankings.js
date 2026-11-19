// Order of Merits (DOM-frei). Preisgeld wird je Jahr/Typ/Spieler aggregiert:
// state.rankings.years[year][type][id] = Betrag
import { playersOfTier, nonCardPros, DEV_MAX_AGE, womenOf } from './world.js';
import { SEC_ALSO_CT } from '../data/secondary.js';
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
  wos: { label: "Women's Series OOM", short: 'WoS', years: 1 },
};

export function addMoney(state, type, id, amount, year = state.date.year) {
  if (!amount) return;
  const y = (state.rankings.years ??= {})[year] ??= {};
  const t = y[type] ??= {};
  t[id] = (t[id] ?? 0) + amount;
}

// 2-Jahres-Ranglisten (PDC wie echt): Das Preisgeld eines Turniers zählt, bis dasselbe Turnier 2 Jahre später wieder gespielt wird –
// dann fällt es heraus (ersetzt durch das neue Ergebnis). Dafür merkt sich `state.rankings.ev[Jahr][Turnier] = {oom, m:{id:Betrag}}`,
// was jeder Spieler dort geholt hat; beim Abschluss desselben Turniers im Folgejahr+1 wandert der Betrag nach
// `state.rankings.gone[Jahr][Typ][id]` (= schon ersetzter Teil des Vor-Vorjahres). Jahre vor `rankings.exact` (Startwerte, ältere
// Spielstände) haben keine Turnier-Aufschlüsselung und laufen weiter linear über die Saison aus (`oldYearWeight`).
export const twoYear = type => OOM_TYPES[type]?.years === 2;
export function settleOom(state, key, oom, map, year = state.date.year) {
  const r = state.rankings;
  (((r.ev ??= {})[year] ??= {})[key]) = { oom: [...oom], m: map };
  const old = r.ev[year - 2]?.[key];
  if (old) for (const t of old.oom.filter(x => oom.includes(x) && twoYear(x))) {
    const g = (((r.gone ??= {})[year] ??= {})[t] ??= {});
    for (const id in old.m) g[id] = (g[id] ?? 0) + old.m[id];
  }
  for (const y of Object.keys(r.ev)) if (+y < year - 2) delete r.ev[y];       // nur die letzten 3 Jahre aufheben
  for (const y of Object.keys(r.gone ?? {})) if (+y < year) delete r.gone[y];
}

// Version 163: Spielstand klein halten – nur aufheben, was Ranglisten und Qualifikationen noch brauchen:
// Preisgeld der letzten 3 Jahre (2-Jahres-OOM inkl. auslaufendem Vor-Vorjahr), Titelträger dieses und des Vorjahres (Grand-Slam-Qualifikation
// über TV-Finalisten der letzten 12 Monate; Anzeige „Titelträger“), Felder/Qualifier dieses und des Vorjahres. Die eigene Bilanz liegt in results/stats.
export const KEEP_MONEY_YEARS = 3, KEEP_CHAMPION_YEARS = 2, KEEP_QUAL_YEARS = 2;
export function pruneSave(state, year = state.date.year) {
  const cut = (obj, keep) => { for (const k of Object.keys(obj ?? {})) if (+k <= year - keep) delete obj[k]; };
  cut(state.rankings?.years, KEEP_MONEY_YEARS);
  cut(state.champions, KEEP_CHAMPION_YEARS);
  cut(state.qual, KEEP_QUAL_YEARS);
  cut(state.placements, 2);   // Version 222: Platzierungen aller Spieler – laufendes Jahr + Vorjahr (älteres wird gelöscht, Verbrauch bleibt konstant)
}

// Teilnehmerkreis je Rangliste
function members(state, type, year) {
  const p = state.player;
  if (type === 'pdc' || type === 'protour' || type === 'pco' || type === 'eto' || type === 'ws') {
    const list = playersOfTier(state, 'tour');
    if (p.tour === 'tour') list.push(p);
    // Version 199 (wie die echte PDC): in der PDC Order of Merit zählen auch Spieler ohne Karte mit Preisgeld (2-Jahres-Wertung) mit
    if (type === 'pdc') {
      const ids = new Set(), yrs = state.rankings?.years ?? {};
      for (const yy of [year, year - 1, year - 2]) for (const id of Object.keys(yrs[yy]?.pdc ?? {})) ids.add(id);
      for (const id of ids) {
        const x = id === 'P' ? p : state.world.players[id];
        if (!x || (id === 'P' ? p.tour === 'tour' : x.tier === 'tour' || x.tier === 'retired')) continue;   // Holder sind schon drin
        if (moneyOf(state, 'pdc', id, year) > 0) list.push(x);
      }
    }
    return list;
  }
  if (type === 'wos') return [...womenOf(state), ...(p.woman ? [p] : [])];   // Version 101: Women's Series – alle Spielerinnen
  const alsoCt = () => playersOfTier(state, 'secondary').filter(x => SEC_ALSO_CT.includes(x.name));
  const list = type === 'dev' ? [...playersOfTier(state, 'dev'), ...devHolders(state, year), ...alsoCt().filter(x => x.age <= DEV_MAX_AGE)]
    : [...nonCardPros(state), ...alsoCt()];   // Version 188: einzelne Nebentour-Spieler auch Challenge Tour
  const eligible = p.tour !== 'tour' && (type === 'dev' ? p.age <= DEV_MAX_AGE : p.qschoolYear === year);   // Dev ohne Q-School
  if (eligible) list.push(p);
  return list;
}

// Tourcard-Holder bis 23 außerhalb der PDC-Top-64 dürfen zusätzlich Dev Tour spielen (inkl. Spieler)
export function devHolders(state, year = state.date.year) {
  return orderOfMerit(state, 'pdc', year).filter(x => x.rank > 64 && x.p.age <= DEV_MAX_AGE && (x.p.id === 'P' ? x.p.tour === 'tour' : x.p.tier === 'tour')).map(x => x.p);   // nur Holder (Version 199)
}

// 2-Jahres-Wertungen (PDC wie echt): Vorjahr voll, das Jahr davor läuft im Verlauf der Saison aus
// (zu Saisonbeginn KW 3 = 100 %, KW 52 = 0 %) → die Startliste zeigt die vollen 2 Jahre, am Saisonende zählen genau 2 Saisons.
export const oldYearWeight = (state, year) => (year === state.date.year ? Math.max(0, 1 - Math.max(0, state.date.week - 3) / 49) : 0);
export function moneyOf(state, type, id, year = state.date.year) {
  const b = y => state.rankings.years?.[y]?.[type]?.[id] ?? 0;
  if (OOM_TYPES[type].years < 2) return b(year);
  const r = state.rankings, exact = year === state.date.year && (r.exact ?? Infinity) <= year - 2;
  // Vor-Vorjahr: exakt = alles minus die Turniere, die dieses Jahr schon wieder gespielt wurden; sonst linear
  const old = exact ? Math.max(0, b(year - 2) - (r.gone?.[year]?.[type]?.[id] ?? 0)) : oldYearWeight(state, year) * b(year - 2);
  return b(year) + b(year - 1) + old;
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
  state.rankings.exact = startYear;   // ab diesem Jahr sind alle Turniere einzeln aufgezeichnet (Startwerte nicht)
}
