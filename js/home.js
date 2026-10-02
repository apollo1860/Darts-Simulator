// Wohnen & Auto (DOM-frei).
// Mit 18 muss man ausziehen: zufällige Woche im 18. Lebensjahr → Meldung, 2 Wochen Zeit zur Wahl (sonst Studentenwohnheim).
// Jahresmiete einmalig bei Einzug und jeweils in KW 1. Teurer = bessere Erholung + Selbstvertrauen; Wohnheim leicht negativ.
// Auto (ab 18, Shop): Rabatt auf Reisekosten, jährliche Wartung in KW 1; beim Wechsel wird das alte für 30 % verkauft.
// Preise steigen mit dem Level (priceFactor) – außer Studentenwohnheim.
import { RNG } from './rng.js';
import { book, canAfford, levelPrice } from './finance.js';
import { addNews } from './news.js';
import { clamp } from './util.js';

export const MOVE_AGE = 18, MOVE_GRACE = 2, CAR_RESALE = 0.3;
export const HOMES = [
  { id: 'dorm', icon: '🏫', label: 'Studentenwohnheim', rent: 200, fixed: true, rec: -2, mom: -0.2, malus: 1, text: 'Laut, eng, Gemeinschaftsküche – leichtes Minus bei allem.' },
  { id: 'wg', icon: '🛋️', label: 'WG-Zimmer', rent: 400, rec: 0, mom: 0, text: 'Günstig, mit Mitbewohnern – neutral.' },
  { id: 'flat', icon: '🏢', label: '1-Zimmer-Wohnung', rent: 1000, rec: 2, mom: 0.2, text: 'Eigene vier Wände, Ruhe zum Erholen.' },
  { id: 'house', icon: '🏡', label: 'Haus', rent: 15000, rec: 4, mom: 0.4, text: 'Platz, Garten, eigener Dartraum.' },
  { id: 'villa', icon: '🏰', label: 'Villa', rent: 50000, rec: 6, mom: 0.6, text: 'Pool, Sauna, Profi-Oche – Luxus pur.' },
];
export const CARS = [
  { id: 'small', icon: '🚗', label: 'Kleinwagen', price: 4000, travel: 0.05, upkeep: 400 },
  { id: 'mid', icon: '🚙', label: 'Mittelklasse', price: 15000, travel: 0.10, upkeep: 900 },
  { id: 'premium', icon: '🏎️', label: 'Oberklasse', price: 45000, travel: 0.15, upkeep: 2000 },
];
export const homeOf = p => HOMES.find(h => h.id === p.home?.id) ?? null;
export const carOf = p => CARS.find(c => c.id === p.car?.id) ?? null;
export const rentOf = (h, level = 1) => (h.fixed ? h.rent : levelPrice(h.rent, level));
export const carPrice = (c, level = 1) => levelPrice(c.price, level);
export const upkeepOf = (c, level = 1) => levelPrice(c.upkeep, level);
export const travelMult = p => 1 - (carOf(p)?.travel ?? 0);
const abs = d => d.year * 52 + d.week;

// Auszug fällig? (Meldung kam, noch keine Wohnung gewählt)
export const moveDue = state => !!state.moveOut?.notified && !state.player.home;

// Wohnung wählen/wechseln: volle Jahresmiete sofort
export function chooseHome(state, id) {
  const p = state.player, h = HOMES.find(x => x.id === id);
  if (!h) return { ok: false, reason: 'Unbekannt' };
  if (p.age < MOVE_AGE && !state.moveOut?.notified) return { ok: false, reason: `Erst ab ${MOVE_AGE}` };
  if (p.home?.id === id) return { ok: false, reason: 'Wohnst du schon' };
  const rent = rentOf(h, p.level ?? 1);
  if (!canAfford(state, rent)) return { ok: false, reason: 'Budget reicht nicht' };
  book(state, -rent, `Jahresmiete ${h.label}`, 'living');
  const first = !p.home;
  p.home = { id, year: state.date.year, week: state.date.week };
  addNews(state, 'info', `${h.icon} ${first ? 'Eingezogen' : 'Umgezogen'}: ${h.label}`, `Jahresmiete ${rent.toLocaleString('de-DE')} € bezahlt. ${h.text}`);
  return { ok: true, rent };
}

// Auto kaufen (ersetzt das alte, Verkauf für 30 % des Kaufpreises)
export function buyCar(state, id) {
  const p = state.player, c = CARS.find(x => x.id === id);
  if (!c) return { ok: false, reason: 'Unbekannt' };
  if (p.age < MOVE_AGE) return { ok: false, reason: 'Führerschein ab 18' };
  if (p.car?.id === id) return { ok: false, reason: 'Fährst du schon' };
  const price = carPrice(c, p.level ?? 1), resale = p.car ? Math.round((p.car.paid ?? 0) * CAR_RESALE / 5) * 5 : 0;
  if (!canAfford(state, price - resale)) return { ok: false, reason: 'Budget reicht nicht' };
  if (resale) book(state, resale, `Verkauf ${carOf(p)?.label ?? 'Auto'}`, 'car');
  book(state, -price, `Kauf ${c.label}`, 'car');
  p.car = { id, paid: price, year: state.date.year };
  addNews(state, 'info', `${c.icon} Neues Auto: ${c.label}`, `Reisekosten −${Math.round(c.travel * 100)} %, Wartung ca. ${upkeepOf(c, p.level ?? 1).toLocaleString('de-DE')} € pro Jahr.`);
  return { ok: true, price, resale };
}

// Wöchentlich (nach advanceWeek): Auszug planen/melden/erzwingen, in KW 1 Miete + Wartung
export function homeWeek(state) {
  const p = state.player, d = state.date;
  if (!p.home) {
    if (p.age >= MOVE_AGE && !state.moveOut) {
      const rng = new RNG(state.rng);
      const week = d.week >= 45 ? d.week + 2 : rng.int(Math.max(d.week + 1, 2), 50);   // irgendwann im Jahr (alte Spielstände: bald)
      state.moveOut = { year: d.year + (week > 52 ? 1 : 0), week: week > 52 ? week - 52 : week };
    }
    const mo = state.moveOut;
    if (mo && !mo.notified && abs(d) >= abs(mo)) {
      mo.notified = { year: d.year, week: d.week };
      addNews(state, 'info', '📦 Du musst ausziehen!', `Mit ${p.age} heißt es: raus aus dem Elternhaus. Such dir im Bereich „Wohnen & Auto“ eine Wohnung – sonst landest du in ${MOVE_GRACE} Wochen im Studentenwohnheim.`);
    } else if (mo?.notified && abs(d) >= abs(mo.notified) + MOVE_GRACE) {
      const h = HOMES[0], rent = rentOf(h);
      book(state, -rent, `Jahresmiete ${h.label}`, 'living');
      p.home = { id: h.id, year: d.year, week: d.week, auto: true };
      addNews(state, 'info', `${h.icon} Ab ins Studentenwohnheim`, 'Du hast dich nicht entschieden – das Wohnheim hatte noch ein Zimmer frei. Umziehen kannst du jederzeit.');
    }
  }
  if (d.week !== 1) return;
  const lvl = p.level ?? 1, h = homeOf(p), c = carOf(p);
  if (h && p.home.year < d.year) {
    let home = h, rent = rentOf(h, lvl);
    if (!canAfford(state, rent) && !h.fixed) {                 // zu teuer geworden → günstigste Wohnung, die noch geht
      home = [...HOMES].reverse().find(x => canAfford(state, rentOf(x, lvl))) ?? HOMES[0];
      rent = rentOf(home, lvl);
      p.home = { id: home.id, year: d.year, week: 1 };
      addNews(state, 'info', `${home.icon} Umzug: ${home.label}`, `Die Miete für ${h.label} war nicht mehr drin.`);
    }
    book(state, -rent, `Jahresmiete ${home.label} ${d.year}`, 'living');
  }
  if (c && p.car.year < d.year) book(state, -upkeepOf(c, lvl), `Wartung & Versicherung ${c.label}`, 'car');
}

// Effekte: Erholung (Ermüdung pro Woche) und Selbstvertrauen (pro Woche), Wohnheim-Malus in perf()
export function homeWeekly(p) {
  const h = homeOf(p);
  if (!h) return;
  p.fatigue = clamp((p.fatigue ?? 0) - h.rec, 0, 100);
  if (h.mom) p.momentum = clamp(Math.round(((p.momentum ?? 0) + h.mom) * 10) / 10, -10, 10);
}
export const homeMalus = p => (p.home?.id === 'dorm' ? HOMES[0].malus : 0);
