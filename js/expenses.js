// Einmalige Kosten bei hohem Vermögen (DOM-frei): ab 10.000 € Kontostand pro Woche eine Chance auf eine Ausgabe.
// Chance steigt mit dem Vermögen (10 Tsd. → 3 %, 100 Tsd. → 6 %, 1 Mio. → 9 %, max. 12 %).
// Kleine Posten mit festen Beträgen (× Preisniveau), größere als Anteil am Kontostand.
import { RNG } from './rng.js';
import { book, levelPrice } from './finance.js';
import { addNews } from './news.js';
import { fmtEUR } from './util.js';

export const WEALTH_MIN = 10000;
export const EXPENSES = [
  { id: 'fine', icon: '🚓', label: 'Bußgeld', text: 'Geblitzt auf dem Weg zum Turnier.', fixed: [100, 600] },
  { id: 'dentist', icon: '🦷', label: 'Zahnarzt', text: 'Eine Krone war fällig – die Kasse zahlt nur einen Teil.', fixed: [500, 2500] },
  { id: 'gear', icon: '🎯', label: 'Neues Equipment', text: 'Neue Barrels, Flights, Schäfte und ein Profi-Board für zu Hause.', fixed: [300, 1500] },
  { id: 'carfix', icon: '🔧', label: 'Autoreparatur', text: 'Getriebeschaden – die Werkstatt freut sich.', fixed: [600, 3500], needCar: true },
  { id: 'water', icon: '💧', label: 'Wasserschaden', text: 'Rohrbruch in der Wohnung – die Versicherung zahlt nicht alles.', fixed: [1000, 5000], needHome: true },
  { id: 'lawyer', icon: '⚖️', label: 'Anwaltskosten', text: 'Streit um einen alten Vertrag.', fixed: [2000, 8000], minBalance: 40000 },
  { id: 'family', icon: '👨‍👩‍👦', label: 'Familie unterstützen', text: 'Du hilfst deinen Eltern bei einer Renovierung.', share: [0.02, 0.06] },
  { id: 'charity', icon: '🎗️', label: 'Charity-Gala', text: 'Spende bei der Darts-Charity-Gala – gut fürs Image.', share: [0.01, 0.03] },
  { id: 'tax', icon: '🧾', label: 'Steuernachzahlung', text: 'Das Finanzamt hat nachgerechnet.', share: [0.06, 0.12], minBalance: 50000 },
  { id: 'invest', icon: '📉', label: 'Fehlinvestition', text: 'Der „todsichere“ Tipp eines Bekannten war es nicht.', share: [0.04, 0.12], minBalance: 80000 },
  { id: 'party', icon: '🍾', label: 'Feier', text: 'Die Runde für die ganze Kneipe nach dem letzten Erfolg.', fixed: [400, 2000] },
];

export const expenseChance = balance => (balance < WEALTH_MIN ? 0 : Math.min(0.12, 0.03 + 0.03 * Math.log10(balance / WEALTH_MIN)));

// Wöchentlich (nach advanceWeek)
export function expenseWeek(state) {
  const bal = state.finance.balance, p = state.player, rng = new RNG(state.rng);
  if (!rng.chance(expenseChance(bal))) return null;
  const list = EXPENSES.filter(e => (!e.needCar || p.car) && (!e.needHome || p.home) && bal >= (e.minBalance ?? 0));
  const e = rng.pick(list);
  const amount = e.share ? Math.round(bal * rng.float(...e.share) / 50) * 50 : levelPrice(Math.round(rng.float(...e.fixed) / 10) * 10, p.level ?? 1);
  book(state, -amount, `${e.label}`, 'misc');
  addNews(state, 'info', `${e.icon} ${e.label}: −${fmtEUR(amount)}`, e.text);
  return { ...e, amount };
}
