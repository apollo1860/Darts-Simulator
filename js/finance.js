// Finanzen: Kosten pro Event, Buchungen, Bilanzen (DOM-frei)
import { UK } from '../data/nations.js';

export const START_BUDGET = 5000;
export const ENTRY_FEE = 25;
export const ETQ_NIGHT = 150;           // TCHQ direkt nach dem Pro-Tour-Block: eine Übernachtung extra (× Preisniveau)
const FEE_CATS = new Set(['qschool', 'challenge', 'dev', 'ddv', 'hnq']);

export function travelCost(country) {
  if (UK.has(country)) return 600;
  if (country === 'DE') return 250;
  return 400;
}

// Preisniveau steigt mit dem Level: +1 % je Level über 1 (Level 10 → +9 %, Level 50 → +49 %, Level 100 → +99 %)
// gilt für Reise, Erholung, Wohnung, Auto – Startgebühren bleiben immer 25 €; Beträge auf 5 € gerundet
export const priceFactor = (level = 1) => 1 + 0.01 * Math.max(0, level - 1);
export const levelPrice = (amount, level = 1) => (amount ? Math.max(5, Math.round(amount * priceFactor(level) / 5) * 5) : 0);

// Gebühr gilt je Turnier im Block (z. B. CT-Wochenende = 5 × 25 €, Q-School 4 Tage = 4 × 25 €)
// n = Anzahl gewählter Turniere bei Blöcken mit Auswahl (CT/Dev/HNQ), sonst alle; level = Spielerlevel (Preisniveau Reise),
// travelMult = Rabatt durch eigenes Auto (z. B. 0,9). Pro Tour, European Tour und Majors: keine Startgebühr, nur Reise.
export function eventCost(ev, n = null, level = 1, travelMult = 1) {
  if (ev.cat === 'local') return { fee: 0, travel: 0, total: 0 };
  const trip = base => Math.round(levelPrice(base, level) * travelMult / 5) * 5;
  if (ev.cat === 'wdf') { const travel = trip(ev.europe ? 400 : 1000); return { fee: 0, travel, total: travel }; }   // WDF: Europa 400 €, Übersee 1.000 €
  const fee = FEE_CATS.has(ev.cat) ? ENTRY_FEE * (n ?? ev.count ?? 1) : 0;
  const travel = trip(travelCost(ev.country));
  return { fee, travel, total: fee + travel };
}

export function book(state, amount, text, cat) {
  state.finance.balance += amount;
  state.finance.tx.unshift({ year: state.date.year, week: state.date.week, text, amount, cat });
  const s = seasonFinance(state, state.date.year);
  if (amount >= 0) s.income += amount; else s.expenses += -amount;
  if (cat === 'prize') { s.prize += amount; state.finance.prizeTotal += amount; }
  // Manager-Provision auf alle Einnahmen (Preisgeld, Sponsoren, Exhibitions)
  const m = state.staff?.manager;
  if (m && amount > 0 && (cat === 'prize' || cat === 'sponsor')) {
    const c = Math.round(amount * m.cut);
    if (c) { m.paid = (m.paid ?? 0) + c; book(state, -c, `Provision ${m.name} (${Math.round(m.cut * 100)} %)`, 'staff'); }
  }
}

export function seasonFinance(state, year) {
  state.finance.seasons[year] ??= { income: 0, expenses: 0, prize: 0 };
  return state.finance.seasons[year];
}

export const canAfford = (state, cost) => state.finance.balance >= cost;
