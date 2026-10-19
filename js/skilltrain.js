// New Star Darts (DOM-frei): Training per Minispiel, Einstufung, Formverlust, Getränke, Darts-Shop.
// Jede trainierbare Fähigkeit: 20 Level × max. 3 Punkte. Erfolg im 1./2./3. Versuch → 3/2/1 Punkte (Level behält das Beste).
import { TRAINABLE, SKILL_LEVELS, skillValue, syncAttrs, starPrice, addEnergy, addRel, relLabel } from './nsd.js';
import { DRINKS, DARTS } from '../data/gear.js';
import { addNews } from './news.js';
import { checkoutRoute, BOGEY, labelValue, isDoubleLabel } from './board.js';

export const TRAIN_ENERGY = 55;
export const ATTEMPTS = 3;
export const pointsFor = attempt => (attempt >= 1 && attempt <= ATTEMPTS ? ATTEMPTS + 1 - attempt : 0);   // 1. Versuch = 3 Punkte
const lvl = L => Math.max(1, Math.min(SKILL_LEVELS, L));

// ---- Level-Parameter der Minispiele ----
// Scoring: Mindestpunktzahl einer Aufnahme (L1 40 … L20 140)
export const scoringMin = L => Math.round(40 + (lvl(L) - 1) * 100 / 19);
// Finishing: je Level ein anderes Doppel (L20 = Bull)
export const FIN_TARGETS = ['D20', 'D16', 'D10', 'D8', 'D18', 'D12', 'D4', 'D6', 'D14', 'D2', 'D19', 'D17', 'D3', 'D9', 'D11', 'D13', 'D7', 'D15', 'D5', 'BULL'];
export const finishTarget = L => FIN_TARGETS[lvl(L) - 1];
// Linien werden je Level nur minimal schneller (+1,5 %/Level)
export const lineSpeed = L => 1 + 0.015 * (lvl(L) - 1);
// Fokus (Memory 4×4): Vorschau-Zeit in Sekunden (L1 8 s … L20 2,5 s)
export const memoryPreview = L => Math.round((8 - 5.5 * (lvl(L) - 1) / 19) * 10) / 10;
// Rechnen: Zeitlimit (L1–5 ohne, L6 20 s … L20 8 s) und Zahlenbereich
export const calcTime = L => (lvl(L) <= 5 ? null : Math.round(20 - 12 * (lvl(L) - 6) / 14));
export function calcRange(L) {
  const t = (lvl(L) - 1) / 19;
  return [Math.round(2 + t * 98), Math.round(40 + t * 130)];   // L1 2–40 … L20 100–170
}
export function calcTask(rng, L) {
  const [lo, hi] = calcRange(L);
  for (;;) { const r = rng.int(lo, hi); if (!BOGEY.has(r) && checkoutRoute(r, 3)) return r; }
}
// Gültiges Finish: ≤ 3 Darts, Summe = Rest, letzter Dart Doppel/Bull, kein Zwischenstand 1 oder < 0
export function validFinish(labels, rem) {
  if (!labels.length || labels.length > 3) return false;
  let r = rem;
  for (const l of labels) { r -= labelValue(l); if (r < 0 || r === 1) return false; }
  return r === 0 && isDoubleLabel(labels[labels.length - 1]);
}

// Aim-Parameter für Scoring/Finishing-Training aus der aktuellen Fähigkeit (ohne Druck)
export function trainAim(skill, focus, L) {
  return {
    radius: Math.max(5, Math.min(36, 20 - 0.22 * skill)),
    amp: Math.max(24, Math.min(50, 40 - 0.25 * focus)),
    freq: Math.max(0.65, Math.min(1.3, 0.95 - 0.004 * focus)) * lineSpeed(L),
  };
}

// ---- Freischaltung ----
// Level L spielbar, wenn L = 1 oder Level L−1 mindestens 1 Punkt hat; ein Level mit 3 Punkten ist erledigt
export const levelPoints = (p, key, L) => p.skills?.[key]?.[L - 1] ?? 0;
export const levelOpen = (p, key, L) => L === 1 || levelPoints(p, key, L - 1) > 0;
export const nextLevel = (p, key) => { for (let L = 1; L <= SKILL_LEVELS; L++) if (levelPoints(p, key, L) < 3) return levelOpen(p, key, L) ? L : null; return null; };

// Training starten: kostet Energie (Einstufung/freies Training nicht)
export function canTrain(state, key, L) {
  const p = state.player;
  if (!TRAINABLE.some(t => t.key === key)) return { ok: false, reason: 'Nicht trainierbar' };
  if (!levelOpen(p, key, L)) return { ok: false, reason: `Erst Level ${L - 1} schaffen` };
  if (levelPoints(p, key, L) >= 3) return { ok: false, reason: 'Level schon perfekt' };
  if ((p.energy ?? 0) < TRAIN_ENERGY) return { ok: false, reason: `Zu wenig Energie (${TRAIN_ENERGY} % nötig)` };
  return { ok: true };
}
export function startTraining(state, key, L) {
  const c = canTrain(state, key, L);
  if (!c.ok) throw new Error(c.reason);
  addEnergy(state.player, -TRAIN_ENERGY);
}

// Ergebnis eintragen: attempt = erfolgreicher Versuch (1–3) oder 0 (gescheitert). Rückgabe {got, before, after}
export function finishTraining(state, key, L, attempt, { placement = false } = {}) {
  const p = state.player, label = TRAINABLE.find(t => t.key === key).label;
  const before = levelPoints(p, key, L), got = pointsFor(attempt);
  if (got > before) p.skills[key][L - 1] = got;
  (p.idle ??= {})[key] = 0;
  (p.warned ??= {})[key] = false;
  syncAttrs(p);
  const gain = Math.max(0, got - before);
  if (!placement && gain) addNews(state, 'star', `💪 ${label} +${gain}`, `Training Level ${L} geschafft (${got} von 3 Sternen). ${label} jetzt ${skillValue(p, key)}.`);
  return { got, before, gain, value: skillValue(p, key) };
}

// ---- Formverlust: ab 9 Wochen ohne Training kann 1 Punkt verloren gehen, ab 13 Wochen 2 … (je 4 Wochen +1) ----
export const DECAY_FROM = 9, DECAY_STEP = 4, DECAY_CHANCE = 0.35, DECAY_WARN = 7;
export const decayPoints = idle => (idle < DECAY_FROM ? 0 : 1 + Math.floor((idle - DECAY_FROM) / DECAY_STEP));
// Letzten Stern des höchsten Levels abziehen
export function removePoint(p, key) {
  const arr = p.skills[key];
  for (let i = arr.length - 1; i >= 0; i--) if (arr[i] > 0) { arr[i]--; return true; }
  return false;
}
export function decayWeek(state, rng) {
  const p = state.player;
  p.idle ??= {}; p.warned ??= {};
  for (const t of TRAINABLE) {
    const idle = p.idle[t.key] = (p.idle[t.key] ?? 0) + 1;
    if (skillValue(p, t.key) <= 0) continue;
    if (idle >= DECAY_WARN && idle < DECAY_FROM && !p.warned[t.key]) {
      p.warned[t.key] = true;
      addNews(state, 'info', `⚠️ ${t.label} lässt bald nach`, `Seit ${idle} Wochen kein ${t.label}-Training. Ab ${DECAY_FROM} Wochen können Punkte verloren gehen.`);
    }
    const n = decayPoints(idle);
    if (n && rng.chance(DECAY_CHANCE)) {
      let lost = 0;
      for (let k = 0; k < n; k++) if (removePoint(p, t.key)) lost++;
      if (lost) addNews(state, 'info', `📉 ${t.label} −${lost}`, `${idle} Wochen ohne Training: ${t.label} sinkt auf ${skillValue(p, t.key)}. Trainiere, um das zu stoppen.`);
    }
  }
  syncAttrs(p);
}
// Fähigkeiten mit drohendem Verlust (für Hinweise)
export const decayRisk = p => TRAINABLE.filter(t => (p.idle?.[t.key] ?? 0) >= DECAY_WARN && skillValue(p, t.key) > 0);

// ---- Getränke ----
export const drinkPrice = (d, level) => starPrice(d.price, level);
export function buyDrink(state, id, n = 1) {
  const d = DRINKS.find(x => x.id === id), cost = drinkPrice(d, state.player.star.level) * n;
  if ((state.stars ?? 0) < cost) throw new Error('Nicht genug ★');
  state.stars -= cost;
  state.player.drinks[id] = (state.player.drinks[id] ?? 0) + n;
  return cost;
}
export function drink(state, id, rng) {
  const p = state.player, d = DRINKS.find(x => x.id === id);
  if (!(p.drinks[id] > 0)) throw new Error(`Kein ${d.name} mehr da`);
  p.drinks[id]--;
  addEnergy(p, d.energy);
  if (d.buzz) { p.buzz = (p.buzz ?? 0) + d.buzz; syncAttrs(p); }
  let rel = null;
  if (d.rel) {                                  // niedrigste bestehende Beziehung (Fans immer, andere nur wenn vorhanden)
    const keys = Object.keys(relLabel).filter(k => k === 'fans' || p.rel[k] > 0);
    const low = Math.min(...keys.map(k => p.rel[k] ?? 0));
    rel = rng.pick(keys.filter(k => (p.rel[k] ?? 0) === low));
    addRel(p, rel, d.rel);
  }
  return { energy: p.energy, buzz: p.buzz ?? 0, rel };
}
// Wochenende: Rausch verfliegt
export function soberUp(p) { if (p.buzz) { p.buzz = 0; syncAttrs(p); } }

// ---- Darts-Shop ----
export const dartsPrice = (d, level) => starPrice(d.price, level);
export function buyDarts(state, id) {
  const p = state.player, d = DARTS.find(x => x.id === id);
  if (p.darts?.includes(id)) throw new Error('Schon gekauft');
  const cost = dartsPrice(d, p.star.level);
  if ((state.stars ?? 0) < cost) throw new Error('Nicht genug ★');
  state.stars -= cost;
  (p.darts ??= []).push(id);
  equipDarts(state, id);
  return cost;
}
export function equipDarts(state, id) {
  const p = state.player, d = DARTS.find(x => x.id === id);
  if (!p.darts?.includes(id)) throw new Error('Nicht im Besitz');
  p.gear = { id, name: d.name };
  syncAttrs(p);
}
