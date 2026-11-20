// New Star Darts (DOM-frei): Training per Minispiel, Einstufung, Formverlust, Getränke, Darts-Shop.
// Jede trainierbare Fähigkeit: 20 Level × max. 3 Punkte. Erfolg im 1./2./3. Versuch → 3/2/1 Punkte (Level behält das Beste).
import { TRAINABLE, SKILL_LEVELS, skillValue, syncAttrs, starPrice, drinkFactor, addEnergy, addRel, relLabel, DRINK_MULT, inTournament, IN_TOURNAMENT_MSG } from './nsd.js';
import { DRINKS, DARTS, DRINK_MAX } from '../data/gear.js';
import { FLIGHT_NAMES, BARREL_NAMES, SHOP_WEEKS } from '../data/accessories.js';
import { RNG } from './rng.js';
import { circleRadius, lineParams } from './throwModel.js';
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
// Fokus (Memory 4×4, Version 172 schwerer): verdeckt starten, „Los“ → 3 s offen, umdrehen, dann kurz nacheinander tauschen –
// Anzahl und Tempo der Tausche steigen mit dem Level
export const memoryPreview = () => 3;
export const memorySwaps = L => Math.round(3 + (lvl(L) - 1) * 1.1);           // L1 3 … L20 24 Tausche
export const memorySwapMs = L => Math.round(650 - (lvl(L) - 1) * 21);         // L1 0,65 s … L20 0,25 s je Tausch
export const MEMORY_GAP = 40;                                                 // Pause zwischen zwei Tauschen (ms)
// Rechnen (Version 174, Nutzervorgabe): immer 20 s; je Level Zahlenbereich und ggf. ein bereits steckender erster Dart
export const CALC_TIME = 20;
export const calcTime = () => CALC_TIME;
const CALC_LEVELS = [
  [2, 40], [41, 60], [61, 70], [71, 80], [81, 90], [91, 100], [91, 100, ['25', 'BULL']],
  [101, 106, ['S20', 'T20', 'D20', 'T5', 'S5']], [107, 110, ['S19', 'T7', 'T3']], [111, 119, ['S19', 'T19']], [120, 130, ['T20', 'T19']],
  [131, 135], [136, 140], [136, 140, ['T20', 'T18']], [141, 145], [146, 150], [146, 150, ['T19', 'T18', 'T20']],
  [151, 155], [156, 160], [161, 170],   // L20: nur 161, 164, 167, 170 (der Rest sind Bogey-Zahlen)
];
export const calcRange = L => CALC_LEVELS[lvl(L) - 1].slice(0, 2);
export const calcFirst = L => CALC_LEVELS[lvl(L) - 1][2] ?? null;   // mögliche erste Darts (steckt schon) oder null
// Aufgabe: { rem: Rest vor der Aufnahme, first: bereits steckender erster Dart oder null } – immer lösbar
export function calcTask(rng, L) {
  const [lo, hi] = calcRange(L), firsts = calcFirst(L), opts = [];
  for (let r = lo; r <= hi; r++) {
    if (BOGEY.has(r)) continue;
    if (!firsts) { if (checkoutRoute(r, 3)) opts.push({ rem: r, fs: [null] }); continue; }
    const fs = firsts.filter(f => { const x = r - labelValue(f); return x > 1 && checkoutRoute(x, 2); });
    if (fs.length) opts.push({ rem: r, fs });
  }
  const o = rng.pick(opts);
  return { rem: o.rem, first: rng.pick(o.fs) };
}
// Gültiges Finish: ≤ 3 Darts, Summe = Rest, letzter Dart Doppel/Bull, kein Zwischenstand 1 oder < 0
export function validFinish(labels, rem) {
  if (!labels.length || labels.length > 3) return false;
  let r = rem;
  for (const l of labels) { r -= labelValue(l); if (r < 0 || r === 1) return false; }
  return r === 0 && isDoubleLabel(labels[labels.length - 1]);
}

// Aim-Parameter für Scoring/Finishing-Training: exakt wie im Spiel (Version 89, Nutzerwunsch) – Kreisgröße aus der aktuellen Fähigkeit
// (`circleRadius`), Linien aus dem Fokus (`lineParams`), kein Level-Zuschlag; die Schwierigkeit der Level liegt in der Aufgabe selbst.
export function trainAim(skill, focus, L) {   // L: nur noch für die Aufrufer-Signatur
  return { radius: Math.max(4, Math.min(36, circleRadius(skill))), ...lineParams(focus) };
}

// ---- Freischaltung ----
// Level L spielbar, wenn L = 1 oder Level L−1 mindestens 1 Punkt hat; ein Level mit 3 Punkten ist erledigt
export const levelPoints = (p, key, L) => p.skills?.[key]?.[L - 1] ?? 0;
export const levelOpen = (p, key, L) => L === 1 || levelPoints(p, key, L - 1) > 0;
export const nextLevel = (p, key) => { for (let L = 1; L <= SKILL_LEVELS; L++) if (levelPoints(p, key, L) < 3) return levelOpen(p, key, L) ? L : null; return null; };

// Training starten: kostet Energie (Einstufung/freies Training nicht)
export function canTrain(state, key, L) {
  const p = state.player;
  if (state.week?.vacation) return { ok: false, reason: 'Du bist im Urlaub – kein Training' };   // Version 242
  if (inTournament(state)) return { ok: false, reason: IN_TOURNAMENT_MSG };   // Version 243
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
// Ab 30 körperlicher Abbau: die Schwelle sinkt (Version 163: schon bis 45, vorher 60) auf 3 Wochen, die Chance steigt bis 70 %
export const DECAY_FROM = 9, DECAY_STEP = 4, DECAY_CHANCE = 0.35, DECAY_WARN = 7, DECAY_AGE_FROM = 29, DECAY_AGE_SPAN = 16;
const ageT = age => Math.max(0, Math.min(1, ((age ?? 20) - DECAY_AGE_FROM) / DECAY_AGE_SPAN));
// Version 163: Altersabbau – zu jedem Jahreswechsel gehen ab 33 Punkte auf allen trainierbaren Fähigkeiten verloren, auch mit Training
// (33–35: 1, 36–39: 2, 40–44: 3, ab 45: 4 je Fähigkeit); verlorene Sterne lassen sich zurücktrainieren.
export const AGE_DECLINE = [[45, 4], [40, 3], [36, 2], [33, 1]];
export const ageDecline = age => AGE_DECLINE.find(([a]) => (age ?? 0) >= a)?.[1] ?? 0;
export function ageDeclineYear(state) {
  const p = state.player, n = ageDecline(p.age);
  if (!n) return null;
  const lost = {};
  for (const t of TRAINABLE) { let k = 0; for (let i = 0; i < n; i++) if (removePoint(p, t.key)) k++; if (k) lost[t.key] = k; }
  syncAttrs(p);
  if (Object.keys(lost).length) addNews(state, 'info', `📉 Alter ${p.age}: Fähigkeiten lassen nach`,
    `Der Körper baut ab: ${TRAINABLE.filter(t => lost[t.key]).map(t => `${t.label} −${lost[t.key]} (jetzt ${skillValue(p, t.key)})`).join(', ')}. Trainiere, um die Sterne zurückzuholen – und trainiere öfter, sonst geht noch mehr verloren.`);
  return lost;
}
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
// Version 78: eigener Preisschlüssel `drinkFactor` (Bier Status 40 = 120 ★), ganze ★
// Version 252/253: nur Bier mit steigendem Star-Status zusätzlich teurer (+0,5 % je Stufe: Status 40 × 1,2, Status 100 × 1,5; `statusStep` in data/gear.js)
export const drinkPrice = (d, level = 1) => Math.max(1, Math.round(d.price * drinkFactor(level) * DRINK_MULT * (1 + (d.statusStep ?? 0) * (Math.max(1, level) - 1))));   // Version 106: × 1,25
export function buyDrink(state, id, n = 1) {
  const d = DRINKS.find(x => x.id === id), cost = drinkPrice(d, state.player.star.level) * n;
  if ((state.player.drinks[id] ?? 0) + n > DRINK_MAX) throw new Error(`Höchstens ${DRINK_MAX} ${d.name} gleichzeitig`);   // Vorrat begrenzt (auch ältere Spielstände mit mehr: nur nicht weiter kaufen)
  if ((state.stars ?? 0) < cost) throw new Error('Nicht genug ★');
  state.stars = Math.round((state.stars - cost) * 10) / 10;
  state.player.drinks[id] = (state.player.drinks[id] ?? 0) + n;
  return cost;
}
export function drink(state, id, rng) {
  const p = state.player, d = DRINKS.find(x => x.id === id);
  if (!(p.drinks[id] > 0)) throw new Error(`Kein ${d.name} mehr da`);
  if (p.drinkBonus) throw new Error('Erst den Bonus des letzten Getränks wählen');
  p.drinks[id]--;
  p.energy = 100;                                   // jedes Getränk füllt die Energie ganz auf
  // Version 219: zu viel auf einmal (je KW zufällige Grenze 4–10 Getränke) → nächste KW verkatert
  const w = (p.drunk ??= { n: 0, limit: null });
  w.limit ??= rng.int(DRUNK_MIN, DRUNK_MAX); w.n++;
  const drunk = !p.hangoverNext && w.n >= w.limit;
  if (drunk) p.hangoverNext = true;
  if (d.bonus && drinkBonusOptions(state, d.bonus).some(o => o.ok)) p.drinkBonus = d.bonus;   // Version 230: Bonus wird danach gewählt
  return { energy: p.energy, bonus: p.drinkBonus ?? null, drunk };
}
// Version 230: dauerhafter Getränke-Bonus – Weinschorle +1 Punkt auf eine Fähigkeit (nicht volle), Schnaps +4–5 auf eine bestehende Beziehung
export const DRINK_REL_BONUS = [4, 5];
export function drinkBonusOptions(state, kind = state.player.drinkBonus) {
  const p = state.player, rel = p.rel ?? {};
  if (kind === 'skill') return TRAINABLE.map(t => ({ key: t.key, label: t.label, value: skillValue(p, t.key), pct: skillValue(p, t.key) / (SKILL_LEVELS * 3) * 100, ok: (p.skills?.[t.key] ?? []).some(v => v < 3) }));
  const has = { manager: !!state.team?.manager, fans: true, partner: (rel.partner ?? 0) > 0, sponsors: (state.nsdSponsors?.active?.length ?? 0) > 0 || (rel.sponsors ?? 0) > 0 };
  return Object.keys(relLabel).map(k => ({ key: k, value: rel[k] ?? 0, pct: has[k] ? rel[k] ?? 0 : 0, ok: has[k] && (rel[k] ?? 0) < 100 }));
}
export function applyDrinkBonus(state, key, rng = new RNG(state.rng)) {
  const p = state.player, kind = p.drinkBonus, opt = drinkBonusOptions(state, kind).find(o => o.key === key);
  if (!kind) throw new Error('Kein Bonus offen');
  if (!opt?.ok) throw new Error('Nicht wählbar');
  p.drinkBonus = null;
  if (kind === 'skill') {
    const arr = p.skills[key]; arr[arr.findIndex(v => v < 3)]++;
    syncAttrs(p);
    return { kind, key, n: 1, value: skillValue(p, key) };
  }
  const n = rng.int(...DRINK_REL_BONUS);
  return { kind, key, n: addRel(p, key, n) - opt.value, value: p.rel[key] };
}
// Wochenende: Rausch verfliegt; Kater (Version 219) gilt genau die KW nach dem Absturz, der Trinkzähler beginnt neu
export const DRUNK_MIN = 4, DRUNK_MAX = 10;
export function soberUp(p) {
  const was = !!p.hangover;
  p.hangover = !!p.hangoverNext; p.hangoverNext = false; p.drunk = null;
  if (p.buzz || was || p.hangover) { p.buzz = 0; syncAttrs(p); }
  return p.hangover;
}

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
  if (!d?.starter && !p.darts?.includes(id)) throw new Error('Nicht im Besitz');   // Brass Dart (9 g) gehört dir immer
  p.gear = { id, name: d.name };
  syncAttrs(p);
}

// ---- Zubehör: 3 Flights + 3 Barrels, je Spielstand zufällig, alle 12 Wochen neues Angebot ----
const KEYS = ['sco', 'fin', 'foc', 'cal'];
const weekNo = state => state.date.year * 52 + state.date.week;
// Flights: Boost auf ALLE Fähigkeiten, klar gestaffelt (3–6 / 10–15 / 20–25 je Fähigkeit) + Premium (35, 5 Wochen).
// Barrels: gezielte Boosts auf einzelne Fähigkeiten. Fähigkeiten bleiben immer bei max. 60.
// Preise = Niveau von Version 26 + 50 % (Basis-★)
const FLIGHT_TIERS = [{ v: [3, 6], m: [3, 4], p: 12 }, { v: [10, 15], m: [3, 4], p: 30 }, { v: [20, 25], m: [3, 4], p: 40 }];
const allSkills = v => Object.fromEntries(KEYS.map(k => [k, v]));
const pickName = (rng, pool, used) => { let n; do n = `${rng.pick(pool.first)} ${rng.pick(pool.second)}`; while (used.has(n)); used.add(n); return n; };
function makeItem(rng, kind, tier, used) {
  const id = `${kind[0]}${rng.int(1e5, 9e5)}`;
  if (kind === 'Flight') {
    const t = FLIGHT_TIERS[tier], v = rng.int(...t.v), matches = rng.int(...t.m);
    return { id, icon: '🪶', type: 'Flight', name: pickName(rng, FLIGHT_NAMES, used), matches, bonus: allSkills(v),
      price: Math.round(t.p * rng.float(0.9, 1.1)) };
  }
  const pts = rng.int(...[[3, 4], [5, 6], [7, 9]][tier]), n = tier + 1, keys = rng.shuffle([...KEYS]).slice(0, n), bonus = {};
  for (let i = 0; i < pts; i++) { const k = keys[i % n]; bonus[k] = (bonus[k] ?? 0) + 1; }
  const matches = rng.int(3, 4) + tier;
  return { id, icon: '🎯', type: 'Barrel', name: pickName(rng, BARREL_NAMES, used), matches, bonus,
    price: Math.round((pts * matches * rng.float(0.5, 0.7) + 3) * 1.5) };
}
// Premium-Flight: +35 auf alle Fähigkeiten für 5 Wochen
function premiumFlight(rng, used) {
  return { id: `P${rng.int(1e5, 9e5)}`, icon: '💎', type: 'Premium-Flight', name: `${pickName(rng, FLIGHT_NAMES, used)} Elite`, weeks: 5,
    bonus: allSkills(35), price: Math.round(rng.float(80, 100)), premium: true };
}
export function shopOffers(state, rng = new RNG(state.rng)) {
  const sh = state.shop;
  if (!sh || weekNo(state) >= sh.until || !sh.items.some(x => x.premium && x.price < 200)) {   // alte Stände/Preise: sofort neues Angebot
    const used = new Set();
    state.shop = { until: weekNo(state) + SHOP_WEEKS,
      items: [...[0, 1, 2].map(t => makeItem(rng, 'Flight', t, used)), premiumFlight(rng, used), ...[0, 1, 2].map(t => makeItem(rng, 'Barrel', t, used))] };
  }
  return state.shop.items;
}
export const shopWeeksLeft = state => Math.max(1, (state.shop?.until ?? 0) - weekNo(state));
export const accessoryPrice = (a, level) => starPrice(a.price, level);
export function buyAccessory(state, id) {
  const p = state.player, a = shopOffers(state).find(x => x.id === id);
  if (!a) throw new Error('Angebot nicht mehr verfügbar');
  const cost = accessoryPrice(a, p.star.level);
  if ((state.stars ?? 0) < cost) throw new Error('Nicht genug ★');
  state.stars -= cost;
  const cur = (p.boosts ??= []).find(b => b.id === id);
  if (a.weeks) {                                       // Premium: läuft nach Wochen ab, nicht nach Matches
    const end = weekNo(state) + a.weeks;
    if (cur) cur.until = Math.max(cur.until, weekNo(state)) + a.weeks; else p.boosts.push({ id, name: a.name, icon: a.icon, type: a.type, price: a.price, bonus: a.bonus, until: end });
  } else if (cur) cur.left += a.matches; else p.boosts.push({ id, name: a.name, icon: a.icon, type: a.type, price: a.price, bonus: a.bonus, left: a.matches });
  syncAttrs(p);
  return cost;
}
// Version 136: Preis (Basis-★) des aktiven Flights – 0 = Standard-Flight; ältere Käufe ohne Preis: nach Stärke geschätzt (Stufenpreise)
export const isFlight = b => /Flight/.test(b.type ?? '') || b.icon === '🪶' || b.icon === '💎';
export function flightPrice(p) {
  const fl = (p.boosts ?? []).filter(isFlight);
  if (!fl.length) return 0;
  return Math.max(...fl.map(b => b.price ?? (b.icon === '💎' ? 90 : (b.bonus?.sco ?? 0) > 15 ? 40 : (b.bonus?.sco ?? 0) > 6 ? 30 : 12)));
}
// Nach jedem eigenen Match: Laufzeit −1, abgelaufene fallen weg
export function useBoosts(p) {
  if (!p.boosts?.length) return [];
  for (const b of p.boosts) if (b.left != null) b.left--;
  const gone = p.boosts.filter(b => b.left != null && b.left <= 0).map(b => b.name);
  p.boosts = p.boosts.filter(b => b.left == null || b.left > 0);
  syncAttrs(p);
  return gone;
}
// Wöchentlich: zeitlich begrenzte Boosts (Premium) auslaufen lassen
export function expireBoosts(state) {
  const p = state.player;
  if (!p.boosts?.some(b => b.until != null && weekNo(state) >= b.until)) return;
  p.boosts = p.boosts.filter(b => b.until == null || weekNo(state) < b.until);
  syncAttrs(p);
}
