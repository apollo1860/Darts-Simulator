// New Star Darts (DOM-frei): Leben – Lifestyle-Shop, Zufriedenheit, Beziehungen (Freundin), Lebens-Ereignisse (Karten), Erfolge
import { LIFESTYLE } from '../data/lifestyle.js';
import { LIFE_EVENTS, PARTNER_NAMES } from '../data/lifeevents.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { starPrice, starPayout, addEnergy, addRel, addFans, skillsAvg, skillValue, addStarProgress, ENERGY_WEEK, TRAINABLE } from './nsd.js';
import { addNews } from './news.js';
import { rankOf } from './rankings.js';
import { RNG } from './rng.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fill = (txt, p) => txt.replaceAll('{partner}', p.partnerName ?? 'Sie');

// ---- Lifestyle-Shop ----
export const ownedItems = p => LIFESTYLE.filter(x => p.owned?.includes(x.id));
// Nur intakte Dinge zählen (kaputte wirken erst nach der Reparatur wieder)
export const workingItems = p => ownedItems(p).filter(x => !p.upkeep?.[x.id]?.broken);
export const lifestyleOf = p => Math.min(100, Math.round(workingItems(p).reduce((a, x) => a + x.ls, 0) * 10) / 10);   // ganzer Shop = 100
export const homeRegen = p => Math.max(0, ...workingItems(p).map(x => x.regen ?? 0));
export const itemPrice = (it, level) => starPrice(it.price, level);
export function buyItem(state, id) {
  const p = state.player, it = LIFESTYLE.find(x => x.id === id);
  if (p.owned?.includes(id)) throw new Error('Schon gekauft');
  const cost = itemPrice(it, p.star.level);
  if ((state.stars ?? 0) < cost) throw new Error('Nicht genug ★');
  state.stars = Math.round((state.stars - cost) * 10) / 10;
  (p.owned ??= []).push(id);
  (p.upkeep ??= {})[id] = newUpkeep(state, new RNG(state.rng));
  p.lifestyle = lifestyleOf(p);
  p.satisfaction = clamp((p.satisfaction ?? 50) + it.sat, 0, 100);
  addNews(state, 'info', `${it.icon} Gekauft: ${it.name}`, `Lifestyle jetzt ${p.lifestyle}.${it.regen ? ` Zuhause erholst du dich besser: +${it.regen} % Energie pro Woche.` : ''}`);
  checkAchievements(state);
  return cost;
}

// ---- Wartung: Lifestyle-Produkte gehen alle 12–16 Wochen kaputt, die Reparatur kostet 10–15 % des Kaufpreises (min. 1 ★) ----
// p.upkeep[id] = { due (absolute Woche), pct (Anteil am Preis, je Produkt fest), broken }. Kaputte Produkte zählen nicht für Lifestyle/Erholung.
export const REPAIR_WEEKS = [12, 16], REPAIR_PCT = [10, 15];
const absWeek = s => s.date.year * 52 + s.date.week;
const newUpkeep = (state, rng) => ({ due: absWeek(state) + rng.int(REPAIR_WEEKS[0], REPAIR_WEEKS[1]), pct: rng.int(REPAIR_PCT[0], REPAIR_PCT[1]) / 100, broken: false });
export const brokenItems = p => ownedItems(p).filter(x => p.upkeep?.[x.id]?.broken);
export const repairCost = (p, it) => Math.max(1, Math.ceil(Math.round(itemPrice(it, p.star.level) * (p.upkeep?.[it.id]?.pct ?? 0.1) * 100) / 100));
export const weeksToRepair = (state, id) => { const u = state.player.upkeep?.[id]; return u && !u.broken ? Math.max(0, u.due - absWeek(state)) : 0; };
export function repairItem(state, id) {
  const p = state.player, it = LIFESTYLE.find(x => x.id === id), u = p.upkeep?.[id];
  if (!it || !u?.broken) throw new Error('Nichts zu reparieren');
  const cost = repairCost(p, it);
  if ((state.stars ?? 0) < cost) throw new Error('Nicht genug ★');
  state.stars = Math.round((state.stars - cost) * 10) / 10;
  p.upkeep[id] = newUpkeep(state, new RNG(state.rng));
  p.lifestyle = lifestyleOf(p);
  addNews(state, 'info', `🔧 Repariert: ${it.name}`, `Kostete ${cost} ★ – er funktioniert wieder. Die nächste Wartung steht in ${REPAIR_WEEKS[0]}–${REPAIR_WEEKS[1]} Wochen an.`);
  return cost;
}
// Wöchentlich: fällige Produkte gehen kaputt (alte Spielstände ohne Wartungsdaten bekommen einen Termin)
export function upkeepWeek(state, rng) {
  const p = state.player, now = absWeek(state);
  for (const it of ownedItems(p)) {
    const u = (p.upkeep ??= {})[it.id] ??= newUpkeep(state, rng);
    if (u.broken || now < u.due) continue;
    u.broken = true;
    addNews(state, 'info', `🔧 ${it.name} ist kaputt`, `Ohne Reparatur zählt er nicht mehr für Lifestyle${it.regen ? ' und Erholung' : ''}. Kosten: ${repairCost(p, it)} ★ (Leben → Lifestyle).`);
  }
  p.lifestyle = lifestyleOf(p);
}

// ---- Wöchentliche Erholung: Basis 40 + bestes Zuhause + Fitnesstrainer + Zufriedenheit (−10 … +10) ----
export const fitnessRegen = p => p.fitness?.regen ?? 0;
export const weeklyEnergy = p => ENERGY_WEEK + homeRegen(p) + fitnessRegen(p) + Math.round(((p.satisfaction ?? 50) - 50) / 5);

// Zufriedenheit: Zielwert aus Lifestyle, Freundin, Fans und Selbstvertrauen; wöchentlich 20 % Richtung Ziel
// Zufriedenheit: Ziel aus Luxus (Lifestyle), Freundin und dem Schnitt aller bestehenden Beziehungen; Start niedrig (30)
export const SAT_START = 30;
export function satisfactionTarget(p) {
  const r = p.rel ?? {}, keys = ['fans', 'manager', 'partner', 'sponsors'].filter(k => k === 'fans' || (r[k] ?? 0) > 0);
  const relAvg = keys.reduce((a, k) => a + (r[k] ?? 0), 0) / keys.length;
  return clamp(15 + 0.4 * lifestyleOf(p) + ((r.partner ?? 0) > 0 ? 6 + 0.1 * r.partner : 0) + 0.2 * relAvg + 1 * (p.momentum ?? 0), 0, 100);
}

// ---- Lebens-Ereignisse ----
// Frau ansprechen: ohne Lifestyle und Star-Status wirst du meist ausgelacht
export const meetChance = p => Math.max(0.08, Math.min(0.75, 0.05 + 0.025 * lifestyleOf(p) + 0.02 * (p.star?.level ?? 1)));
export const LIFE_EVENT_CHANCE = 0.35;
export const eventById = id => LIFE_EVENTS.find(e => e.id === id);
export function rollLifeEvent(state, rng) {
  const p = state.player;
  if (state.lifeEvent || !rng.chance(LIFE_EVENT_CHANCE)) return null;
  const pool = LIFE_EVENTS.filter(e => (!e.if || e.if(p, state)) && e.id !== state.lastLifeEvent);
  const ev = rng.pick(pool);
  state.lifeEvent = { id: ev.id, name: ev.id === 'meet' ? rng.pick(PARTNER_NAMES) : null };
  return state.lifeEvent;
}
export function lifeEventView(state) {
  const le = state.lifeEvent, ev = le && eventById(le.id);
  if (!ev) return null;
  const p = { ...state.player, partnerName: le.name ?? state.player.partnerName };
  return { icon: ev.icon, text: fill(ev.text, p), opts: ev.opts.map((o, i) => ({ i, label: fill(o.label, p), cost: o.stars < 0 ? starPrice(-o.stars, state.player.star.level) : 0,
    energy: o.energy < 0 ? -o.energy : 0, tired: o.energy < 0 && (state.player.energy ?? 0) < -o.energy })) };
}
// Effekte anwenden; Rückgabe: Liste lesbarer Änderungen
export function applyEffects(state, e) {
  const p = state.player, out = [];
  const lvl = p.star.level, sign = v => (v > 0 ? `+${v}` : `${v}`);
  if (e.stars) {
    const v = e.stars > 0 ? starPayout(e.stars, lvl) : -starPrice(-e.stars, lvl);
    state.stars = Math.max(0, (state.stars ?? 0) + v); out.push(`${sign(v)} ★`);
  }
  if (e.energy) { addEnergy(p, e.energy); out.push(`Energie ${sign(e.energy)} %`); }
  if (e.sat) { p.satisfaction = clamp((p.satisfaction ?? 50) + e.sat, 0, 100); out.push(`Zufriedenheit ${sign(e.sat)}`); }
  const rel = v => Math.max(-2, Math.min(2, v));        // Ereignisse: Beziehungen höchstens ±2
  if (e.fans) { addFans(p, rel(e.fans)); out.push(`Fans ${sign(rel(e.fans))}`); }
  if (e.meet) { p.partnerName = state.lifeEvent?.name ?? p.partnerName; p.rel.partner = e.meet; out.push(`Freundin: ${p.partnerName}`); }
  if (e.partner && p.rel.partner > 0) { addRel(p, 'partner', rel(e.partner)); out.push(`${p.partnerName ?? 'Freundin'} ${sign(rel(e.partner))}`); }
  for (const k of ['manager', 'sponsors']) if (e[k] && p.rel[k] > 0) { addRel(p, k, rel(e[k])); out.push(`${k === 'manager' ? 'Manager' : 'Sponsoren'} ${sign(rel(e[k]))}`); }
  if (e.idle) { for (const t of TRAINABLE) p.idle[t.key] = 0; p.warned = {}; out.push('Trainingsrückstand weg'); }
  if (e.single) breakUp(state, false);
  return out;
}
// Option wählen. Rückgabe {text, changes}
export function resolveLifeEvent(state, idx, rng) {
  const le = state.lifeEvent, ev = le && eventById(le.id), opt = ev?.opts[idx];
  if (!opt) throw new Error('Kein Ereignis');
  const p = state.player;
  if (opt.stars < 0 && (state.stars ?? 0) < starPrice(-opt.stars, p.star.level)) throw new Error('Nicht genug ★');
  if (opt.energy < 0 && (p.energy ?? 0) < -opt.energy) throw new Error(`Zu müde – ${-opt.energy} % Energie nötig`);
  const name = le.name ?? p.partnerName;
  const changes = applyEffects(state, { ...opt, stars: opt.stars, chance: undefined });
  let text = opt.out ?? '';
  if (opt.chance) {
    const pr = opt.chance.p === 'meet' ? meetChance(p) : opt.chance.p;
    const r = rng.chance(pr) ? opt.chance.ok : opt.chance.fail;
    changes.push(...applyEffects(state, r));
    text = r.out ?? text;
  }
  state.lastLifeEvent = le.id;
  state.lifeEvent = null;
  checkAchievements(state);
  return { text: fill(text, { partnerName: p.partnerName ?? name }), changes };
}
export function breakUp(state, news = true) {
  const p = state.player, name = p.partnerName ?? 'Deine Freundin';
  p.rel.partner = 0; p.partnerName = null;
  if (news) addNews(state, 'info', `💔 ${name} hat Schluss gemacht`, 'Die Beziehung ist vorbei. Zu wenig Zeit füreinander …');
}

// Wöchentlich (Tour-Modus): Freundin will Zeit (−1), Zufriedenheit nähert sich dem Ziel, Ereignis-Karte, Erfolge
export function lifeWeek(state, rng) {
  const p = state.player;
  if (p.rel.partner > 0) { addRel(p, 'partner', -1); if (p.rel.partner <= 0) breakUp(state); }
  upkeepWeek(state, rng);
  const s = p.satisfaction ?? 50;
  p.satisfaction = Math.round(clamp(s + (satisfactionTarget(p) - s) * 0.08, 0, 100) * 10) / 10;   // langsam
  p.lifestyle = lifestyleOf(p);
  rollLifeEvent(state, rng);
  checkAchievements(state);
}

// ---- Erfolge ----
const SELF0 = { visits: 0, s180: 0, s140: 0, ton: 0, checkouts: 0, hiFinish: 0, bigFish: 0, matchDarts: 0, bull: 0 };
const MS0 = { nilWins: 0, deciderWins: 0, beatTop16: 0, beatTop8: 0, beatNo1: 0, bestAvg: 0, bestRating: 0 };
export function achievementCtx(state) {
  const p = state.player, c = state.stats?.career ?? {}, results = state.results ?? [];
  return {
    state, p, rank: rankOf(state, 'pdc', 'P'), ptRank: rankOf(state, 'protour', 'P'),
    wins: c.wins ?? 0, events: c.events ?? 0, bestLeg: c.bestLeg ?? 0, results, titles: results.filter(r => r.place === 'W'),
    self: { ...SELF0, ...(state.selfStats ?? {}) }, ms: { ...MS0, ...(state.mstats ?? {}) }, flags: state.flags ?? {},
    skills: Object.fromEntries(TRAINABLE.map(t => [t.key, skillValue(p, t.key)])), skillsAvg: skillsAvg(p),
    owned: ownedItems(p), lifestyle: lifestyleOf(p), seasons: state.date.year - (state.startYear ?? state.date.year),
  };
}
// Meilenstein-Belohnung: wenige Star-Status-Punkte (1–10, Balken Stufe 1 = 100)
export const msStarPoints = a => Math.min(10, Math.max(1, Math.round(a.stars / 5)));
export function checkAchievements(state) {
  if (state.mode !== 'nsd') return [];
  const ctx = achievementCtx(state), got = [];
  state.achievements ??= {};
  for (const a of ACHIEVEMENTS) {
    if (state.achievements[a.id] || !a.check(ctx)) continue;
    const pts = msStarPoints(a);                                // kein Geld – nur ein kleines Plus beim Star-Status
    state.achievements[a.id] = { year: state.date.year, week: state.date.week };
    addStarProgress(state, pts);
    addNews(state, 'star', `${a.icon} Meilenstein: ${a.label}`, `Star-Status +${pts}.`);
    (state.msQueue ??= []).push(a.id);                        // Einblendung unten (UI)
    got.push(a);
  }
  return got;
}
