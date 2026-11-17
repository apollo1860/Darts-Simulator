// New Star Darts (DOM-frei): Verletzungen (Version 152, Nutzerwunsch) – Rücken-, Kopf- oder Zahnschmerzen
// Wöchentlich gewürfelt (nextWeek in season.js): kostet sofort 50 % Energie, hält 1 (70 %) oder 2 Wochen. Solange aktiv:
// Erholung stark vermindert (weeklyEnergy × INJ_REGEN), Abzug auf Scoring/Finishing/Fokus (soloAttrs0 in tournaments.js → Schnellsimulation,
// DartConnect-Aufnahmen und Zielhilfe: Kreis ≈ × 1,2–1,35, Zielkreuz ≈ × 1,1–1,3); circle/speed betonen je Art Rücken (Streuung) bzw. Kopf (Fokus).
export const INJURIES = {
  back:  { icon: '🦴', label: 'Rückenschmerzen', circle: 1.08, speed: 1.00, sco: 4, fin: 3, foc: 3 },
  head:  { icon: '🤕', label: 'Kopfschmerzen',   circle: 1.00, speed: 1.15, sco: 3, fin: 3, foc: 5 },
  tooth: { icon: '🦷', label: 'Zahnschmerzen',   circle: 1.05, speed: 1.07, sco: 3.5, fin: 3.5, foc: 4 },
};
export const INJ_P = 0.05, INJ_TIRED = 0.03, INJ_TIRED_E = 30, INJ_AGE_FROM = 35, INJ_AGE_STEP = 0.01, INJ_FIT = 0.7;
export const INJ_ENERGY = 50, INJ_LONG = 0.3, INJ_COOLDOWN = 4, INJ_REGEN = 0.4;
// Version 153: ganz selten sind Rückenschmerzen so schlimm, dass du in dieser KW weder melden noch spielen kannst (state.week.blocked → eventStatus)
export const INJ_SEVERE = 0.04;   // Anteil der Rückenverletzungen (≈ 1 Mal in 35–45 Saisons; Version 154: vorher 0,12)
const wk = state => state.date.year * 52 + state.date.week;

export const injuryOf = p => (p?.injury ? INJURIES[p.injury.kind] ?? null : null);
// noch verbleibende Wochen inkl. der laufenden
export const injuryWeeksLeft = (state, p = state.player) => (p.injury ? Math.max(1, p.injury.until - wk(state) + 1) : 0);
export const injuryText = (state, p = state.player) => {
  const j = injuryOf(p), n = injuryWeeksLeft(state, p);
  return j ? `${j.icon} ${j.label} – noch ${n} ${n === 1 ? 'Woche' : 'Wochen'}` : '';
};
// Chance je Woche: Grundwert + überspielt (Energie < 30 %) + Alter ab 35; Fitnesstrainer senkt sie
export function injuryChance(p) {
  let c = INJ_P;
  if ((p.energy ?? 100) < INJ_TIRED_E) c += INJ_TIRED;
  if ((p.age ?? 20) >= INJ_AGE_FROM) c += INJ_AGE_STEP * Math.floor((p.age - INJ_AGE_FROM) / 5 + 1);
  if (p.fitness) c *= INJ_FIT;
  return c;
}
// Wochenwechsel (nach der Erholung): abgelaufene Verletzung beenden, neue würfeln. Rückgabe: neue Verletzung oder null
export function injuryWeek(state, rng, energyBefore = state.player.energy) {
  const p = state.player, now = wk(state);
  if (p.injury && now > p.injury.until) p.injury = null;
  if (p.injury || now < (p.injuryFree ?? 0)) return null;
  if (!rng.chance(injuryChance({ ...p, energy: energyBefore }))) return null;
  const keys = Object.keys(INJURIES), kind = keys[rng.int(0, keys.length - 1)];
  const severe = kind === 'back' && rng.chance(INJ_SEVERE), weeks = severe || rng.chance(INJ_LONG) ? 2 : 1;
  p.injury = { kind, until: now + weeks - 1, ...(severe ? { severe: true } : {}) };
  if (severe) state.week.blocked = { id: 'injury', label: 'Schwere Rückenschmerzen', icon: '🦴' };
  p.injuryFree = now + weeks + INJ_COOLDOWN;
  p.energy = Math.max(0, Math.round((p.energy ?? 100) - INJ_ENERGY));
  const j = INJURIES[kind];
  if (severe) return { kind, weeks, severe, title: `${j.icon} Schwere Rückenschmerzen – Ausfall!`,
    text: `Du kannst dich kaum bewegen: Diese Woche kannst du kein Turnier melden oder spielen. Du verlierst sofort ${INJ_ENERGY} % Energie, auch nächste Woche streust du noch stärker und erholst dich kaum.` };
  return { kind, weeks, title: `${j.icon} Verletzt: ${j.label}`,
    text: `Du verlierst sofort ${INJ_ENERGY} % Energie. ${weeks === 1 ? 'Diese Woche' : 'Zwei Wochen lang'} streust du stärker, das Zielkreuz ist unruhiger, und du erholst dich kaum.` };
}
// Zielhilfe im Liveticker: Multiplikatoren für Kreis und Linien-Tempo
export const injuryAim = p => { const j = injuryOf(p); return j ? { circle: j.circle, speed: j.speed } : null; };
// Attribut-Abzug (Simulation + KI-Aufnahmen im DartConnect)
export function applyInjury(a, p) {
  const j = injuryOf(p);
  return j ? { ...a, sco: a.sco - j.sco, fin: a.fin - j.fin, foc: a.foc - j.foc } : a;
}
