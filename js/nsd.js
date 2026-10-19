// New Star Darts (DOM-frei): Spielermodell im NSS-Stil auf Basis der bestehenden Simulation.
// Fähigkeiten 0–60 (Scoring, Finishing, Fokus, Rechnen: 20 Trainingslevel × max. 3 Punkte; Mental = Star-Status, max. 60),
// Star-Status 1–100, Energie 0–100, Sterne-Geld (★, skaliert mit dem Star-Status), Getränke, Beziehungen.
// Die Match-Engine arbeitet weiter mit Perzentil-Attributen → syncAttrs() rechnet Fähigkeiten um.
import { newCareer } from './state.js';
import { addNews } from './news.js';

export const SKILL_MAX = 60, SKILL_LEVELS = 20;
export const TRAINABLE = [
  { key: 'sco', label: 'Scoring', icon: '🎯' },
  { key: 'fin', label: 'Finishing', icon: '✔️' },
  { key: 'foc', label: 'Fokus', icon: '🧠' },
  { key: 'cal', label: 'Rechnen', icon: '🧮' },
];
export const SKILLS = [...TRAINABLE, { key: 'men', label: 'Mental', icon: '💪', star: true }];
// Fähigkeit 0 ≈ etwas unter dem schwächsten Tourcard-Holder (Attribut 82 ≈ 82 Ø), 60 = Weltspitze (100)
export const ATTR_BASE = 82, ATTR_PER_POINT = 0.3;
export const STAR_MAX = 100;
// Status-Faktor: Preisgelder UND Preise × (1 + 5 % je Stufe über 1)
export const starFactor = (level = 1) => 1 + 0.05 * (Math.max(1, level) - 1);
export const starPrice = (base, level = 1) => Math.max(1, Math.round(base * starFactor(level)));
export const START_STARS = 25;     // Startguthaben (★ auf Status 1)
// Star-Status-Fortschritt: je Stufe mehr Punkte nötig (Feinabstimmung Etappe 5)
export const starNeed = level => Math.round(100 * Math.pow(1.04, Math.max(1, level) - 1));
export const starPct = p => Math.min(100, ((p.star?.xp ?? 0) / starNeed(p.star?.level ?? 1)) * 100);
export { NSD_BLOCKED } from '../data/tournaments.js';

export const isNsd = state => state?.mode === 'nsd';
export const skillValue = (p, key) => (key === 'men' ? mentalOf(p) : (p.skills?.[key] ?? []).reduce((a, b) => a + b, 0));
export const mentalOf = p => Math.min(SKILL_MAX, p.star?.level ?? 1);
export const skillsAvg = p => SKILLS.reduce((a, s) => a + skillValue(p, s.key), 0) / SKILLS.length;
// Höchstes Level mit mindestens einem Punkt (+1 = nächstes spielbares Level)
export const skillLevel = (p, key) => (p.skills?.[key] ?? []).reduce((hi, v, i) => (v > 0 ? i + 1 : hi), 0);

// Fähigkeiten → Attribute der Match-Engine
export function syncAttrs(p) {
  if (!p.skills) return p.attrs;
  for (const s of SKILLS) p.attrs[s.key] = Math.round((ATTR_BASE + ATTR_PER_POINT * skillValue(p, s.key)) * 10) / 10;
  return p.attrs;
}

// Fähigkeitspunkte direkt setzen (Einstufung): Punkte auf Level 1
export function setStartSkills(p, points) {
  for (const s of TRAINABLE) {
    const arr = Array(SKILL_LEVELS).fill(0);
    arr[0] = Math.max(0, Math.min(3, points[s.key] ?? 0));
    p.skills[s.key] = arr;
  }
  syncAttrs(p);
}

// Neue Karriere im Tour-Modus: Profil (Vorname, Nachname, Nation, Alter, Wurfhand), Start mit Tourcard
export function newNsdCareer({ first, last, nation, age = 18, hand = 'R', slot = 1, seed }) {
  const name = `${first} ${last}`.trim();
  const s = newCareer({ name, nation, hand, age, slot, seed });
  s.mode = 'nsd';
  s.news = [];
  const p = s.player, y = s.date.year;
  Object.assign(p, {
    first, last,
    tour: 'tour', cardUntil: y + 1, everTourcard: true, cardVia: `Q-School ${y - 1}`, proMatches: 0,
    star: { level: 1, xp: 0 }, energy: 100,
    skills: Object.fromEntries(TRAINABLE.map(t => [t.key, Array(SKILL_LEVELS).fill(0)])),
    drinks: { beer: 0, schnaps: 0, wodka: 0 },
    rel: { manager: 0, fans: 10, partner: 0, sponsors: 0 },
    satisfaction: 60, lifestyle: 0,
    gear: null, fitness: null, assessed: false,
  });
  s.stars = START_STARS;
  syncAttrs(p);
  addNews(s, 'info', `Willkommen auf der Tour, ${first}!`,
    `Über die Q-School ${y - 1} hast du deine Tourcard gewonnen – gültig bis Ende ${y + 1}. Auf dem Papier gehörst du zu den Schwächsten. Zeit, das zu ändern.`);
  return s;
}

export const relLabel = { manager: 'Manager', fans: 'Fans', partner: 'Freundin', sponsors: 'Sponsoren' };
