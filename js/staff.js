// Team (DOM-frei): Manager (Provision auf alle Einnahmen, mehr/bessere Sponsoren, Exhibition-Einladungen)
// und Trainer (Einmalzahlung, 1 Jahr: mehr XP + schnellerer Trainingsfortschritt).
// Provision wird zentral in finance.book() abgezogen (Kategorien prize/sponsor).
import { MANAGERS, COACHES, MANAGER_UNLOCK, GIG_CITIES, GIG_KINDS } from '../data/staff.js';
import { RNG } from './rng.js';
import { book } from './finance.js';
import { addNews } from './news.js';
import { rankOf } from './rankings.js';
import { addXp, addClutch, xpForLevel, POINTS_PER_LEVEL } from './player.js';
import { fmtEUR } from './util.js';

export const GIG_WEEKS = 2;            // Einladung gilt 2 Wochen
export const staffOf = state => (state.staff ??= { manager: null, coach: null, gigs: [] });
const wkIndex = (y, w) => y * 52 + w;

export function managerAvailable(state, m) {
  const p = state.player;
  if (!p.everTourcard) return { ok: false, reason: MANAGER_UNLOCK.card };
  const r = p.tour === 'tour' ? rankOf(state, 'pdc', 'P') ?? 999 : 999;
  if (m.unlock === 'top64' && r > 64) return { ok: false, reason: MANAGER_UNLOCK.top64 };
  if (m.unlock === 'top16' && r > 16) return { ok: false, reason: MANAGER_UNLOCK.top16 };
  return { ok: true };
}

export function hireManager(state, id) {
  const m = MANAGERS.find(x => x.id === id), st = staffOf(state);
  if (!m || !managerAvailable(state, m).ok) return false;
  st.manager = { ...m, since: { ...state.date }, paid: 0 };
  addNews(state, 'sponsor', `Neuer Manager: ${m.name}`, `Provision ${Math.round(m.cut * 100)} % auf Preisgeld, Sponsoren und Exhibitions. Dafür mehr und bessere Angebote.`);
  return true;
}
export function fireManager(state) {
  const st = staffOf(state);
  if (!st.manager) return;
  addNews(state, 'sponsor', `Trennung von ${st.manager.name}`, `Insgesamt ${fmtEUR(st.manager.paid)} Provision gezahlt.`);
  st.manager = null; st.gigs = [];
}

export const coachActive = state => {
  const c = staffOf(state).coach;
  return c && wkIndex(state.date.year, state.date.week) < wkIndex(c.until.year, c.until.week) ? c : null;
};
export function hireCoach(state, id) {
  const c = COACHES.find(x => x.id === id), st = staffOf(state);
  if (!c || coachActive(state) || state.finance.balance < c.price) return false;
  book(state, -c.price, `Trainer: ${c.name} (1 Jahr)`, 'staff');
  st.coach = { ...c, since: { ...state.date }, until: { year: state.date.year + 1, week: state.date.week } };
  addNews(state, 'xp', `Trainer verpflichtet: ${c.name}`, `+${Math.round(c.xp * 100)} % XP und schnellere Trainingsfortschritte bis KW ${state.date.week}/${state.date.year + 1}.`);
  return true;
}
// XP-Faktor durch den Trainer
export const xpMult = state => 1 + (coachActive(state)?.xp ?? 0);

// Wöchentlich: Trainervertrag prüfen, Exhibition-Einladungen vom Manager
export function staffWeek(state) {
  const st = staffOf(state), { year, week } = state.date;
  if (st.coach && !coachActive(state)) {
    addNews(state, 'xp', `Trainervertrag beendet: ${st.coach.name}`, 'Im Team-Bereich kannst du wieder einen Trainer verpflichten.');
    st.coach = null;
  }
  st.gigs = st.gigs.filter(g => wkIndex(g.until.year, g.until.week) >= wkIndex(year, week));
  const m = st.manager;
  if (!m || st.gigs.length >= 2) return;
  const rng = new RNG(state.rng);
  if (!rng.chance(m.gig)) return;
  const base = state.player.tour === 'tour' ? 800 + marketBase(state) : 300;
  const g = {
    id: `G${year}-${week}-${rng.int(100, 999)}`, kind: rng.pick(GIG_KINDS), city: rng.pick(GIG_CITIES),
    fee: Math.round(base * m.gigFee * rng.float(0.8, 1.25) / 50) * 50, until: { year, week: week + GIG_WEEKS - 1 },
  };
  st.gigs.push(g);
  addNews(state, 'sponsor', `Exhibition-Einladung: ${g.kind} in ${g.city}`, `Gage ${fmtEUR(g.fee)} (vor Provision). Zusätzlich zum Wochenplan – im Wochenplan annehmen.`);
}
// Gage-Basis aus PDC-Rang (ohne Import aus sponsors.js): Platz 1 ≈ 6.000 €, Platz 64 ≈ 200 €
const marketBase = state => {
  const r = rankOf(state, 'pdc', 'P') ?? 128;
  return Math.round(6000 * Math.pow(r, -0.8));
};

// Einladung annehmen: Klick-Event (kein Turnier), Geld + XP + Erfahrung, Ermüdung
export function acceptGig(state, id) {
  const st = staffOf(state), g = st.gigs.find(x => x.id === id), p = state.player;
  if (!g) return null;
  st.gigs = st.gigs.filter(x => x !== g);
  book(state, g.fee, `Exhibition: ${g.kind} in ${g.city}`, 'prize');
  const xp = Math.round(Math.max(20, xpForLevel(p.level ?? 1) * 0.05) * xpMult(state));
  const ups = addXp(p, xp); addClutch(p, 2);
  p.fatigue = Math.min(100, (p.fatigue ?? 0) + 15);
  if (ups) addNews(state, 'xp', `⬆️ Level ${p.level}! +${ups * POINTS_PER_LEVEL} Attributpunkte`, 'Verteile sie im Spielerprofil.');
  return { fee: g.fee, xp, ups, text: `${g.kind} in ${g.city}: volle Halle, Selfies, ein 180er zum Abschluss. Gage ${fmtEUR(g.fee)}, +${xp} XP, Ermüdung jetzt ${p.fatigue} %.` };
}
export const declineGig = (state, id) => { const st = staffOf(state); st.gigs = st.gigs.filter(g => g.id !== id); };
