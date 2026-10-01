// Wöchentliches Training (DOM-frei): 1 Einheit pro Woche auf ein Attribut.
// Fortschritt sammelt sich; Einheiten für +1 = 5 × Attributkosten (60 → 5, 75 → 10, 90 → 15, 95+ → 20).
// Jede Einheit bringt XP (mitwachsend mit dem Level) und +3 auf das Attribut für Turniere dieser + nächster Woche.
// Jedes Attribut muss mind. 1× in 6 Wochen trainiert werden, sonst droht diesem Attribut pro Woche ein Rückgang (−1).
import { ATTRS, attrCost } from './player.js';
import { RNG, hashSeed } from './rng.js';
import { addNews } from './news.js';
import { clamp, fmtEUR } from './util.js';
import { book, levelPrice } from './finance.js';
import { addXp, addClutch, xpForLevel, POINTS_PER_LEVEL } from './player.js';
import { xpMult } from './staff.js';
import { momentumDecay } from './form.js';

export const DECAY_AFTER = 6;           // Wochen ohne Training eines Attributs bis zum ersten Risiko (je Attribut)
export const PREP_BONUS = 3, PREP_WEEKS = 2;   // Turniervorbereitung: +3 auf das trainierte Attribut (diese + nächste Woche)
// XP je Einheit: 3 % des aktuellen Level-Bedarfs × Qualität (mind. 10); Exhibition 5 %
export const trainingXp = (p, quality = 1) => Math.max(10, Math.round(xpForLevel(p.level ?? 1) * 0.03 * quality / 5) * 5);
export const exhibitionXp = p => Math.max(20, Math.round(xpForLevel(p.level ?? 1) * 0.05 / 5) * 5);
export const sessionsFor = v => 5 * attrCost(v);
export const DECAY_FLOOR = 50;          // darunter kein Formverlust
const tr = state => (state.training ??= { progress: {}, idle: 0, sessions: 0, lost: 0 });
export const trainingOf = tr;
export const trainedThisWeek = state => !!state.week.trained;
export const weekActivity = state => state.week.activity ?? (state.week.trained ? 'train' : null);
// Wochen seit dem letzten Training je Attribut (alte Spielstände: Start bei höchstens 4 → 2 Wochen Schonfrist)
export const idleOf = state => {
  const t = tr(state);
  t.idleBy ??= Object.fromEntries(ATTRS.map(a => [a.key, Math.min(t.idle ?? 0, DECAY_AFTER - 2)]));
  for (const a of ATTRS) t.idleBy[a.key] ??= 0;
  return t.idleBy;
};
// Am längsten nicht trainiertes Attribut (bei Gleichstand das schwächere)
export const mostOverdue = state => {
  const by = idleOf(state), a = state.player.attrs;
  return ATTRS.map(x => x.key).sort((x, y) => by[y] - by[x] || a[x] - a[y])[0];
};

// Eine Trainingseinheit. Rückgabe {gain (0..1 Fortschritt), up (Attribut gestiegen), text}
export function train(state, key) {
  if (weekActivity(state)) return null;                       // nur 1 Aktivität pro Woche
  const t = tr(state), p = state.player, rng = new RNG(state.rng);
  const v = p.attrs[key];
  const need = sessionsFor(v);
  const quality = rng.pick([0.7, 1, 1, 1, 1.3]);              // Tagesform im Training
  const labels = { 0.7: 'Zähe Einheit', 1: 'Solides Training', 1.3: 'Starke Einheit' };
  const boost = xpMult(state);                                 // Trainer: schnellerer Fortschritt
  t.progress[key] = (t.progress[key] ?? 0) + quality * boost / need;
  let up = false;
  if (t.progress[key] >= 1 && v < 100) { p.attrs[key] = v + 1; t.progress[key] -= 1; up = true; }
  state.week.trained = key; state.week.activity = 'train'; state.lastTrained = key;
  t.idle = 0; t.sessions++; idleOf(state)[key] = 0;
  p.prep = { key, bonus: PREP_BONUS, weeks: PREP_WEEKS };
  const xp = Math.round(trainingXp(p, quality) * boost), ups = addXp(p, xp);
  const label = ATTRS.find(a => a.key === key).label;
  if (up) addNews(state, 'xp', `Training: ${label} steigt auf ${p.attrs[key]}`, 'Regelmäßiges Training zahlt sich aus.');
  if (ups) addNews(state, 'xp', `⬆️ Level ${p.level}! +${ups * POINTS_PER_LEVEL} Attributpunkte`, 'Durch Training aufgestiegen – verteile die Punkte im Spielerprofil.');
  return { gain: quality * boost / need, up, text: labels[quality], progress: clamp(t.progress[key], 0, 1), need, xp, ups };
}

// Am Wochenende (vor dem Wechsel): Trainingspause zählen, ggf. Formverlust
export function trainingWeekEnd(state) {
  const t = tr(state), p = state.player;
  if (p.prep && --p.prep.weeks <= 0) delete p.prep;          // Turniervorbereitung läuft ab
  const by = idleOf(state);
  for (const a of ATTRS) by[a.key] = state.week.trained === a.key ? 0 : by[a.key] + 1;
  t.idle = state.week.trained ? 0 : (t.idle ?? 0) + 1;
  // Je Attribut: ab 6 Wochen ohne Training pro Woche Risiko 25 % (+10 %/Woche, max. 60 %) auf −1 (nicht unter DECAY_FLOOR)
  const rng = new RNG(state.rng), lost = [];
  for (const a of ATTRS) {
    if (by[a.key] < DECAY_AFTER || p.attrs[a.key] <= DECAY_FLOOR) continue;
    if (!rng.chance(clamp(0.25 + (by[a.key] - DECAY_AFTER) * 0.1, 0, 0.6))) continue;
    p.attrs[a.key]--; t.lost++; t.progress[a.key] = 0; lost.push(a.key);
    addNews(state, 'ranking', `Formverlust: ${a.label} −1`, `${a.label} seit ${by[a.key]} Wochen nicht trainiert. Jedes Attribut muss mindestens alle ${DECAY_AFTER} Wochen einmal trainiert werden.`);
  }
  return lost.length ? lost : null;
}

// ---- Wochenplan: genau EINE Aktivität pro Woche ----
export const ACTIVITIES = {
  train: { label: 'Training', icon: '🏋️', info: 'XP + Turniervorbereitung (+3 auf das Attribut), schützt vor Formverlust' },
  rest: { label: 'Ruhetag', icon: '🛋️', info: 'Ermüdung −30' },
  sponsor: { label: 'Sponsortermin', icon: '🤝', info: 'Geld von deinen Sponsoren (nur mit aktivem Vertrag)' },
  exhibition: { label: 'Exhibition', icon: '🎪', info: 'Nur auf Angebot (ab Tourcard): Geld + Erfahrung, aber Ermüdung +20' },
};

// ---- Erholung kaufen (zusätzlich zur Wochenaktivität, je Art 1× pro Woche) ----
// Preis zufällig 50–100 €, aber pro Woche fest (aus Spiel-Seed, Jahr, KW, Art)
export const RECOVERY = {
  sauna: { label: 'Saunabesuch', icon: '🧖', fatigue: 10 },
  massage: { label: 'Massage', icon: '💆', fatigue: 15 },
};
export const recoveryPrice = (state, type) =>
  levelPrice(50 + Math.round(new RNG(hashSeed(state.seed ?? 0, state.date.year, state.date.week, type)).next() * 10) * 5, state.player.level ?? 1);
export function canRecover(state, type) {
  if ((state.week.recovery ?? []).includes(type)) return { ok: false, reason: 'Diese Woche schon' };
  if (!(state.player.fatigue > 0)) return { ok: false, reason: 'Du bist ausgeruht' };
  if (state.finance.balance < recoveryPrice(state, type)) return { ok: false, reason: 'Zu teuer' };
  return { ok: true };
}
export function buyRecovery(state, type) {
  const st = canRecover(state, type);
  if (!st.ok) return { ok: false, text: st.reason };
  const r = RECOVERY[type], price = recoveryPrice(state, type), p = state.player;
  book(state, -price, r.label, 'recovery');
  p.fatigue = Math.max(0, p.fatigue - r.fatigue);
  (state.week.recovery ??= []).push(type);
  return { ok: true, price, text: `${r.label} für ${fmtEUR(price)}: Ermüdung −${r.fatigue} %, jetzt ${p.fatigue} %.` };
}

export function canDo(state, type) {
  if (weekActivity(state)) return { ok: false, reason: 'Diese Woche schon verplant' };
  if (type === 'sponsor' && !state.sponsors.active.length) return { ok: false, reason: 'Kein aktiver Sponsor' };
  if (type === 'rest' && !(state.player.fatigue > 0)) return { ok: false, reason: 'Du bist ausgeruht' };
  if (type === 'exhibition' && !exOffer(state)) return { ok: false, reason: state.player.tour === 'tour' ? 'Kein Angebot' : 'Ab Tourcard' };
  return { ok: true };
}

// ---- Exhibition-Angebote: nur mit Tourcard, 30 % pro Woche, 2 Wochen gültig; Gage steigt mit dem Level ----
// Gage = (400 + 60 · Level) × Manager-Faktor × 0,8–1,2 (Level 10 ≈ 1.000 €, Level 50 ≈ 3.400 €)
export const EX_OFFER_CHANCE = 0.3;
const wk = (y, w) => y * 52 + w;
export const exOffer = state => {
  const o = state.exOffer;
  return o && wk(o.until.year, o.until.week) >= wk(state.date.year, state.date.week) ? o : null;
};
export function exhibitionWeek(state) {
  const p = state.player;
  if (p.tour !== 'tour' || exOffer(state)) return null;
  const rng = new RNG(state.rng);
  if (!rng.chance(EX_OFFER_CHANCE)) return null;
  const fee = Math.round((400 + 60 * (p.level ?? 1)) * (state.staff?.manager?.gigFee ?? 1) * rng.float(0.8, 1.2) / 50) * 50;
  state.exOffer = { fee, city: rng.pick(EX_CITIES), until: { year: state.date.year, week: state.date.week + 1 } };
  addNews(state, 'sponsor', `🎪 Exhibition-Angebot: ${state.exOffer.city}`, `Gage ${fmtEUR(fee)}. Annehmen im Wochenplan (ersetzt die Wochenaktivität), gültig 2 Wochen.`);
  return state.exOffer;
}
const EX_CITIES = ['Oberhausen', 'Bremen', 'Hannover', 'Nürnberg', 'Graz', 'Utrecht', 'Blackpool', 'Glasgow', 'Kopenhagen', 'Gibraltar'];

// Geldbetrag eines Sponsortermins bzw. einer Exhibition (für Anzeige + Auszahlung)
export const sponsorGigValue = state => state.sponsors.active.reduce((sum, c) =>
  sum + Math.max(150, Math.round((c.type === 'annual' ? c.amount * 0.04 : c.type === 'event' ? c.amount * 0.6 : c.amount * 0.3) / 10) * 10), 0);
export const exhibitionValue = state => exOffer(state)?.fee ?? 0;

export function doActivity(state, type) {
  const st = canDo(state, type);
  if (!st.ok) return { ok: false, text: st.reason };
  const p = state.player, rng = new RNG(state.rng);
  p.fatigue ??= 0;
  state.week.activity = type;
  if (type === 'rest') {
    p.fatigue = Math.max(0, p.fatigue - 30);
    return { ok: true, text: `Erholt – Ermüdung jetzt ${p.fatigue} %.` };
  }
  if (type === 'sponsor') {
    const v = sponsorGigValue(state);
    book(state, v, 'Sponsortermin (Autogramme, Fotoshooting)', 'sponsor');
    state.sponsors.total = (state.sponsors.total ?? 0) + v;
    return { ok: true, text: `Fotoshooting und Autogrammstunde: ${fmtEUR(v)}.` };
  }
  if (type === 'exhibition') {
    const v = exhibitionValue(state);
    state.exOffer = null;
    book(state, v, 'Exhibition', 'prize');
    const xp = Math.round(exhibitionXp(p) * xpMult(state)), ups = addXp(p, xp); addClutch(p, 3);
    p.fatigue = Math.min(100, p.fatigue + 20);
    return { ok: true, text: `Showkampf vor Publikum: ${fmtEUR(v)}, +${xp} XP${ups ? ` – Level ${p.level}!` : ''}. Ermüdung jetzt ${p.fatigue} %.` };
  }
  return { ok: false, text: 'Unbekannt' };
}

// ---- Ermüdung (0–100): Turniere kosten Kraft, jede Woche −10 Erholung ----
export function addEventFatigue(state, inst) {
  const p = state.player;
  const matches = inst.rounds.reduce((n, r) => n + r.matches.filter(m => (m.a === 'P' || m.b === 'P') && !m.bye && m.score).length, 0);
  const travel = inst.cat === 'local' ? 0 : 4;
  p.fatigue = Math.min(100, (p.fatigue ?? 0) + matches * 4 + travel);
}
export function weeklyRecovery(state) {
  const p = state.player;
  p.fatigue = Math.max(0, (p.fatigue ?? 0) - 10);
  momentumDecay(p);
}
