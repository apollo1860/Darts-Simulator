// Finanzen: Kosten pro Event, Buchungen, Bilanzen (DOM-frei)
import { UK } from '../data/nations.js';

export const START_BUDGET = 5000;
export const ENTRY_FEE = 25;
const FEE_CATS = new Set(['qschool', 'challenge', 'dev', 'ddv']);

export function travelCost(country) {
  if (UK.has(country)) return 600;
  if (country === 'DE') return 250;
  return 400;
}

// Gebühr gilt je Turnier im Block (z. B. CT-Doppel = 2 × 25 €, Q-School 4 Tage = 4 × 25 €)
export function eventCost(ev) {
  if (ev.cat === 'local') return { fee: 0, travel: 0, total: 0 };
  if (ev.cat === 'wdf') { const travel = ev.europe ? 400 : 1000; return { fee: 0, travel, total: travel }; }   // WDF: Europa 400 €, Übersee 1.000 €
  const fee = FEE_CATS.has(ev.cat) ? ENTRY_FEE * (ev.count ?? 1) : 0;
  const travel = travelCost(ev.country);
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
