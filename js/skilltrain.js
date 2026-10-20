// New Star Darts (DOM-frei): Training per Minispiel, Einstufung, Formverlust, Getränke, Darts-Shop.
// Jede trainierbare Fähigkeit: 20 Level × max. 3 Punkte. Erfolg im 1./2./3. Versuch → 3/2/1 Punkte (Level behält das Beste).
import { TRAINABLE, SKILL_LEVELS, skillValue, syncAttrs, starPrice, addEnergy, addRel, relLabel } from './nsd.js';
import { DRINKS, DARTS } from '../data/gear.js';
import { ACCESSORIES } from '../data/accessories.js';
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
// Fokus (Memory 4×4): Karten 2 s offen, dann umgedreht und vermischt – Anzahl und Tempo der Tausche steigen mit dem Level
export const memoryPreview = () => 2;
export const memorySwaps = L => Math.round(1 + (lvl(L) - 1) * 0.8);          // L1 1 … L20 16 Tausche
export const memorySwapMs = L => Math.round(1100 - (lvl(L) - 1) * 40);        // L1 1,1 s … L20 0,34 s je Tausch
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
// Frühe Level sehr leicht: kleiner Kreis, ruhige Linien; je Level etwas schwerer
export function trainAim(skill, focus, L) {
  const t = (lvl(L) - 1) / 19;
  return {
    radius: Math.max(4, Math.min(36, (17 - 0.2 * skill) * (0.55 + 0.45 * t))),
    amp: Math.max(16, Math.min(50, (40 - 0.25 * focus) * (0.6 + 0.4 * t))),
    freq: Math.max(0.4, Math.min(1.3, (0.8 - 0.004 * focus) * (0.7 + 0.3 * t))) * lineSpeed(L),
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
// Ab 30 körperlicher Abbau: die Schwelle sinkt bis 60 auf 3 Wochen, die Chance steigt bis 70 %
export const DECAY_FROM = 9, DECAY_STEP = 4, DECAY_CHANCE = 0.35, DECAY_WARN = 7;
const ageT = age => Math.max(0, Math.min(1, ((age ?? 20) - 29) / 31));
export const decayFrom = (age = 20) => DECAY_FROM - Math.round(6 * ageT(age));
export const decayChance = (age = 20) => DECAY_CHANCE + 0.35 * ageT(age);
export const decayWarn = (age = 20) => Math.max(1, decayFrom(age) - 2);
export const decayPoints = (idle, age = 20) => (idle < decayFrom(age) ? 0 : 1 + Math.floor((idle - decayFrom(age)) / DECAY_STEP));
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
    if (idle >= decayWarn(p.age) && idle < decayFrom(p.age) && !p.warned[t.key]) {
      p.warned[t.key] = true;
      addNews(state, 'info', `⚠️ ${t.label} lässt bald nach`, `Seit ${idle} Wochen kein ${t.label}-Training. Ab ${decayFrom(p.age)} Wochen können Punkte verloren gehen${p.age >= 30 ? ' (ab 30 baut der Körper schneller ab)' : ''}.`);
    }
    const n = decayPoints(idle, p.age);
    if (n && rng.chance(decayChance(p.age))) {
      let lost = 0;
      for (let k = 0; k < n; k++) if (removePoint(p, t.key)) lost++;
      if (lost) addNews(state, 'info', `📉 ${t.label} −${lost}`, `${idle} Wochen ohne Training: ${t.label} sinkt auf ${skillValue(p, t.key)}. Trainiere, um das zu stoppen.`);
    }
  }
  syncAttrs(p);
}
// Fähigkeiten mit drohendem Verlust (für Hinweise)
export const decayRisk = p => TRAINABLE.filter(t => (p.idle?.[t.key] ?? 0) >= decayWarn(p.age) && skillValue(p, t.key) > 0);

// ---- Getränke ----
export const drinkPrice = (d, level) => starPrice(d.price, level);
export function buyDrink(state, id, n = 1) {
  const d = DRINKS.find(x => x.id === id), cost = drinkPrice(d, state.player.star.level) * n;
  if ((state.stars ?? 0) < cost) throw new Error('Nicht genug ★');
  state.stars = Math.round((state.stars - cost) * 10) / 10;
  state.player.drinks[id] = (state.player.drinks[id] ?? 0) + n;
  return cost;
}
export function drink(state, id, rng) {
  const p = state.player, d = DRINKS.find(x => x.id === id);
  if (!(p.drinks[id] > 0)) throw new Error(`Kein ${d.name} mehr da`);
  p.drinks[id]--;
  p.energy = 100;                                   // jedes Getränk füllt die Energie ganz auf
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
  state.stars = Math.round((state.stars - cost) * 10) / 10;
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

// ---- Zubehör (Boost für n eigene Matches; gleiches Teil verlängert die Laufzeit) ----
export const accessoryPrice = (a, level) => starPrice(a.price, level);
export function buyAccessory(state, id) {
  const p = state.player, a = ACCESSORIES.find(x => x.id === id);
  const cost = accessoryPrice(a, p.star.level);
  if ((state.stars ?? 0) < cost) throw new Error('Nicht genug ★');
  state.stars -= cost;
  const cur = (p.boosts ??= []).find(b => b.id === id);
  if (cur) cur.left += a.matches; else p.boosts.push({ id, name: a.name, icon: a.icon, bonus: a.bonus, left: a.matches });
  syncAttrs(p);
  return cost;
}
// Nach jedem eigenen Match: Laufzeit −1, abgelaufene fallen weg
export function useBoosts(p) {
  if (!p.boosts?.length) return [];
  for (const b of p.boosts) b.left--;
  const gone = p.boosts.filter(b => b.left <= 0).map(b => b.name);
  p.boosts = p.boosts.filter(b => b.left > 0);
  syncAttrs(p);
  return gone;
}
