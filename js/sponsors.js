// Sponsoren (DOM-frei): erst nach der ersten Tourcard, max. 4 (eine pro Kategorie), Laufzeit 1–3 Jahre,
// jederzeit kündbar. Angebote alle 4 Wochen über die News, Höhe nach PDC-Rang.
import { SPONSORS, SPONSOR_SLOTS, CONTRACT_TYPES } from '../data/sponsors.js';
import { RNG } from './rng.js';
import { rankOf } from './rankings.js';
import { book } from './finance.js';
import { addNews } from './news.js';
import { fmtEUR, clamp } from './util.js';

export const MAX_SPONSORS = 4;
export const OFFER_WEEKS = 6;                          // Angebot gilt 6 Wochen
const PRO_CATS = ['pc', 'et', 'major', 'ws', 'pl'];
export const sponsorsUnlocked = state => !!state.player.everTourcard;

// Marktwert (Jahresbasis in €) aus PDC-Rang: Platz 1 ≈ 250.000 €, Platz 50 ≈ 3.400 €, Platz 100 ≈ 1.600 €
export function marketValue(state) {
  const p = state.player;
  const r = p.tour === 'tour' ? (rankOf(state, 'pdc', 'P') ?? 128) : 160;
  const titles = state.stats.career.titles ?? 0;
  return clamp(Math.round(250000 * Math.pow(r, -1.1) * (1 + Math.min(titles, 20) * 0.02)), 600, 400000);
}

const round50 = v => Math.max(50, Math.round(v / 50) * 50);

function makeOffer(state, rng) {
  const s = state.sponsors, y = state.date.year;
  const value = marketValue(state);
  const r = state.player.tour === 'tour' ? (rankOf(state, 'pdc', 'P') ?? 128) : 160;
  const maxTier = r <= 16 ? 3 : r <= 64 ? 2 : 1;
  const taken = new Set([...s.active.map(c => c.name), ...s.offers.map(c => c.name)]);
  const pool = SPONSORS.filter(x => x.tier <= maxTier && !taken.has(x.name));
  if (!pool.length) return null;
  const sp = rng.pick(pool);
  const type = rng.pick(['annual', 'annual', 'event', 'bonus']);
  const years = rng.int(1, maxTier);
  const v = value * rng.float(0.7, 1.3) * (0.7 + sp.tier * 0.15);
  const offer = { id: `S${y}-${state.date.week}-${rng.int(100, 999)}`, name: sp.name, slot: sp.slot, type, years,
    expires: { year: y, week: state.date.week + OFFER_WEEKS } };
  if (type === 'annual') offer.amount = round50(v);
  if (type === 'event') offer.amount = round50(v / 25);         // ~25 Profi-Turniere im Jahr
  if (type === 'bonus') offer.amount = round50(v / 6);          // pro Halbfinale, Titel ×3
  return offer;
}

export const describeOffer = o => {
  const t = CONTRACT_TYPES[o.type];
  const amt = o.type === 'annual' ? `${fmtEUR(o.amount)} / Jahr` : o.type === 'event' ? `${fmtEUR(o.amount)} je Turnier` : `${fmtEUR(o.amount)} je Halbfinale, Titel ${fmtEUR(o.amount * 3)}`;
  return `${t.label}: ${amt} · ${o.years} Jahr${o.years > 1 ? 'e' : ''}`;
};

// Wöchentlich: Angebote erzeugen/verfallen lassen, Jahresgehälter quartalsweise auszahlen
export function sponsorWeek(state) {
  const s = state.sponsors, { year, week } = state.date;
  s.offers = s.offers.filter(o => o.expires.year > year || o.expires.week >= week);
  if (!sponsorsUnlocked(state)) return;
  if ([1, 14, 27, 40].includes(week)) {
    for (const c of s.active.filter(c => c.type === 'annual')) pay(state, c, Math.round(c.amount / 4), 'Quartalsrate');
  }
  if (week % 4 === 0 && s.offers.length < 3) {
    const rng = new RNG(state.rng);
    const n = rng.chance(0.6) ? 1 : 0;
    for (let i = 0; i < n; i++) {
      const o = makeOffer(state, rng);
      if (!o) break;
      s.offers.push(o);
      addNews(state, 'sponsor', `Sponsorenangebot: ${o.name}`, `${SPONSOR_SLOTS[o.slot].label} · ${describeOffer(o)}. Gültig ${OFFER_WEEKS} Wochen.`);
    }
  }
}

function pay(state, c, amount, what) {
  if (!amount) return;
  book(state, amount, `Sponsor ${c.name} (${what})`, 'sponsor');
  c.paid = (c.paid ?? 0) + amount;
  state.sponsors.total = (state.sponsors.total ?? 0) + amount;
}

// Nach jedem eigenen Turnier: Antrittsgeld + Erfolgsbonus
export function sponsorEventPayout(state, inst) {
  if (!PRO_CATS.includes(inst.cat) || inst.isQualifier) return;
  for (const c of state.sponsors.active) {
    if (c.type === 'event') pay(state, c, c.amount, `Antrittsgeld ${inst.name}`);
    if (c.type === 'bonus' && ['W', 'F', 'SF'].includes(inst.place)) pay(state, c, inst.place === 'W' ? c.amount * 3 : c.amount, `Bonus ${inst.name}`);
  }
}

export function acceptOffer(state, id) {
  const s = state.sponsors, o = s.offers.find(x => x.id === id);
  if (!o) return { ok: false, reason: 'Angebot abgelaufen' };
  if (s.active.some(c => c.slot === o.slot)) return { ok: false, reason: `Platz „${SPONSOR_SLOTS[o.slot].label}“ ist belegt – erst kündigen` };
  if (s.active.length >= MAX_SPONSORS) return { ok: false, reason: 'Maximal 4 Sponsoren' };
  s.offers = s.offers.filter(x => x !== o);
  const c = { ...o, start: state.date.year, until: state.date.year + o.years - 1, paid: 0 };
  s.active.push(c);
  if (c.type === 'annual') pay(state, c, Math.round(c.amount / 4), 'Antrittsrate');
  addNews(state, 'sponsor', `Vertrag unterschrieben: ${c.name}`, `${describeOffer(c)} · bis Ende ${c.until}.`);
  return { ok: true };
}

export function cancelContract(state, name) {
  const s = state.sponsors;
  s.active = s.active.filter(c => c.name !== name);
  addNews(state, 'sponsor', `Vertrag gekündigt: ${name}`, 'Der Platz ist wieder frei.');
}
export const declineOffer = (state, id) => { state.sponsors.offers = state.sponsors.offers.filter(o => o.id !== id); };

// Jahresende: abgelaufene Verträge beenden
export function sponsorYearEnd(state) {
  const y = state.date.year, s = state.sponsors;
  const ended = s.active.filter(c => c.until <= y);
  s.active = s.active.filter(c => c.until > y);
  for (const c of ended) addNews(state, 'sponsor', `Vertrag ausgelaufen: ${c.name}`, `Gesamt erhalten: ${fmtEUR(c.paid ?? 0)}.`);
}
