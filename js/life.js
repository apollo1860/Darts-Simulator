// New Star Darts (DOM-frei): Leben – Lifestyle-Shop, Zufriedenheit, Beziehungen (Freundin), Lebens-Ereignisse (Karten), Erfolge
import { LIFESTYLE } from '../data/lifestyle.js';
import { LIFE_EVENTS, PARTNER_NAMES, PARTNER_NAMES_M, lendableCars, borrowers, ACCIDENTS_HOME, ACCIDENTS_VEHICLE, VEHICLE_KIND, ownedVehicles, accidentSkills } from '../data/lifeevents.js';
import { removePoint } from './skilltrain.js';
import { MANAGERS } from '../data/team.js';
import { INJ_REGEN } from './injury.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { syncAttrs, starPrice, starPayout, priceFactor, addEnergy, addRel, addFans, skillsAvg, skillValue, addStarProgress, ENERGY_WEEK, TRAINABLE, partnerText, PRICE_MULT } from './nsd.js';
import { addNews } from './news.js';
import { rankOf } from './rankings.js';
import { RNG } from './rng.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fill = (txt, p) => partnerText(txt.replaceAll('{who}', p.who ?? 'Jemand').replaceAll('{car}', p.car ?? 'Fahrzeug').replaceAll('{lover}', p.lover ?? 'Jemand').replaceAll('{partner}', p.partnerName ?? (p.woman ? 'Er' : 'Sie')), p);   // Version 100: Spielerinnen → Freund

// ---- Lifestyle-Shop ----
export const ownedItems = p => LIFESTYLE.filter(x => p.owned?.includes(x.id));
// Nur intakte Dinge zählen (kaputte wirken erst nach der Reparatur wieder)
export const workingItems = p => ownedItems(p).filter(x => !p.upkeep?.[x.id]?.broken);
export const lifestyleOf = p => Math.min(100, Math.round(workingItems(p).reduce((a, x) => a + x.ls, 0) * 10) / 10);   // ganzer Shop = 100
export const homeRegen = p => Math.max(0, ...workingItems(p).map(x => x.regen ?? 0));
// Lifestyle-Preise sind fest (Basis-★), sie steigen NICHT mit dem Star-Status (Nutzerwunsch, Version 42)
export const itemPrice = it => it.price;
export function buyItem(state, id) {
  const p = state.player, it = LIFESTYLE.find(x => x.id === id);
  if (p.owned?.includes(id)) throw new Error('Schon gekauft');
  const cost = itemPrice(it);
  if ((state.stars ?? 0) < cost) throw new Error('Nicht genug ★');
  state.stars = Math.round((state.stars - cost) * 10) / 10;
  (p.owned ??= []).push(id);
  if (state.shopping) { state.shopping.bought = true; state.shopping.n = (state.shopping.n ?? 0) + 1; }   // Version 213/214: Käufe während der Shoppingtour
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
// Immobilien heißen im kaputten Zustand „marode“ (Nutzerwunsch, Version 111)
// Einzelne Immobilie: „sanieren“ statt „reparieren“ (Version 112; „Alles reparieren“ bleibt)
export const fixWord = (it, form = 'inf') => (it?.cat === 'home' ? { inf: 'sanieren', Inf: 'Sanieren', part: 'saniert', Part: 'Saniert', noun: 'Sanierung' } : { inf: 'reparieren', Inf: 'Reparieren', part: 'repariert', Part: 'Repariert', noun: 'Reparatur' })[form];
export const brokenWord = (it, cap = false) => (it?.cat === 'home' ? (cap ? 'Marode' : 'marode') : (cap ? 'Kaputt' : 'kaputt'));
export const repairCost = (p, it) => Math.max(1, Math.ceil(Math.round(itemPrice(it) * (p.upkeep?.[it.id]?.pct ?? 0.1) * 100) / 100));
export const weeksToRepair = (state, id) => { const u = state.player.upkeep?.[id]; return u && !u.broken ? Math.max(0, u.due - absWeek(state)) : 0; };
export function repairItem(state, id) {
  const p = state.player, it = LIFESTYLE.find(x => x.id === id), u = p.upkeep?.[id];
  if (!it || !u?.broken) throw new Error('Nichts zu reparieren');
  const cost = repairCost(p, it);
  if ((state.stars ?? 0) < cost) throw new Error('Nicht genug ★');
  state.stars = Math.round((state.stars - cost) * 10) / 10;
  p.upkeep[id] = newUpkeep(state, new RNG(state.rng));
  p.lifestyle = lifestyleOf(p);
  addNews(state, 'info', `🔧 ${fixWord(it, 'Part')}: ${it.name}`, `Kostete ${cost} ★ – ${it.cat === 'home' ? 'die Immobilie ist wieder in Schuss' : 'das Produkt funktioniert wieder'}. Die nächste Wartung steht in ${REPAIR_WEEKS[0]}–${REPAIR_WEEKS[1]} Wochen an.`);
  return cost;
}
// Alles auf einmal reparieren: ab 2 kaputten Produkten ca. 5 % Rabatt auf die Summe (mind. 1 ★ gespart)
export const REPAIR_ALL_DISCOUNT = 0.05;
export function repairAllInfo(p) {
  const list = brokenItems(p), sum = list.reduce((a, x) => a + repairCost(p, x), 0);
  const saved = list.length >= 2 ? Math.min(sum - list.length, Math.max(1, Math.round(sum * REPAIR_ALL_DISCOUNT))) : 0;
  return { list, sum, saved, cost: sum - saved };
}
export function repairAll(state) {
  const p = state.player, { list, sum, saved, cost } = repairAllInfo(p);
  if (!list.length) throw new Error('Nichts zu reparieren');
  if ((state.stars ?? 0) < cost) throw new Error('Nicht genug ★');
  state.stars = Math.round((state.stars - cost) * 10) / 10;
  const rng = new RNG(state.rng);
  for (const it of list) p.upkeep[it.id] = newUpkeep(state, rng);
  p.lifestyle = lifestyleOf(p);
  addNews(state, 'info', `🔧 Alles repariert (${list.length} Produkte)`, `${list.map(x => x.name).join(', ')} – ${cost} ★${saved ? ` statt ${sum} ★ (−${saved} ★ Sammelrabatt)` : ''}. Die nächste Wartung steht in ${REPAIR_WEEKS[0]}–${REPAIR_WEEKS[1]} Wochen an.`);
  return { count: list.length, cost, saved, sum };
}
// Wöchentlich: fällige Produkte gehen kaputt (alte Spielstände ohne Wartungsdaten bekommen einen Termin)
export function upkeepWeek(state, rng) {
  const p = state.player, now = absWeek(state);
  for (const it of ownedItems(p)) {
    const u = (p.upkeep ??= {})[it.id] ??= newUpkeep(state, rng);
    if (u.broken || now < u.due) continue;
    u.broken = true;
    addNews(state, 'info', `🔧 ${it.name} ist ${brokenWord(it)}`, `Ohne Reparatur zählt ${it.cat === 'home' ? 'die Immobilie' : 'das Produkt'} nicht mehr für Lifestyle${it.regen ? ' und Erholung' : ''}. Kosten: ${repairCost(p, it)} ★ (Leben → Lifestyle).`);
  }
  p.lifestyle = lifestyleOf(p);
}

// ---- Wöchentliche Erholung: Basis 40 + bestes Zuhause + Fitnesstrainer + Zufriedenheit (−10 … +10) ----
export const fitnessRegen = p => p.fitness?.regen ?? 0;
// Version 152: verletzt → Erholung stark vermindert (× INJ_REGEN)
export const weeklyEnergy = p => { const e = ENERGY_WEEK + homeRegen(p) + fitnessRegen(p) + Math.round(((p.satisfaction ?? 50) - 50) / 5); return p.injury ? Math.round(e * INJ_REGEN) : e; };

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
  const pool = LIFE_EVENTS.filter(e => (!e.if || e.if(p, state)) && e.id !== state.lastLifeEvent && (e.id !== 'shopping' || canShop(state)));
  const ev = rng.pick(pool);
  const names = p.woman ? PARTNER_NAMES_M : PARTNER_NAMES;
  state.lifeEvent = { id: ev.id, name: ev.id === 'meet' ? rng.pick(names) : null, lover: ev.id === 'affair' ? rng.pick(names.filter(n => n !== p.partnerName)) : null };
  if (ev.id === 'accident') {                        // Version 216: Unfall – Art, Fähigkeit und Rückgang (1–2) stehen beim Auslösen fest
    const cars = ownedVehicles(p), car = cars.length ? rng.pick(cars) : null;
    const texts = car ? ACCIDENTS_VEHICLE[VEHICLE_KIND[car.id] ?? 'other'] : ACCIDENTS_HOME;
    Object.assign(state.lifeEvent, { acc: texts.indexOf(rng.pick(texts)), car: car?.id ?? null, skill: rng.pick(accidentSkills(p)), n: rng.int(1, 2) });
  }
  if (ev.id === 'borrow') { state.lifeEvent.who = rng.pick(borrowers(p, state)); state.lifeEvent.car = rng.pick(lendableCars(p)).id; }
  return state.lifeEvent;
}
// Version 134: Wer leiht sich das Fahrzeug? (Freundin/Freund mit Namen, Manager mit Rolle)
function borrowCtx(state, le) {
  const p = state.player, car = LIFESTYLE.find(x => x.id === le?.car)?.name ?? null;
  if (le?.who === 'manager') {
    const m = MANAGERS.find(x => x.id === state.team?.manager);
    return { who: m ? `${m.woman ? 'Deine Managerin' : 'Dein Manager'} ${state.team.names?.[m.id] ?? m.name}` : 'Dein Manager', car };
  }
  return { who: le?.who === 'partner' ? p.partnerName : null, car };
}
export function lifeEventView(state) {
  const le = state.lifeEvent, ev = le && eventById(le.id);
  if (!ev) return null;
  const p = { ...state.player, partnerName: le.name ?? state.player.partnerName, lover: le.lover, ...borrowCtx(state, le) };
  const paid = ev.opts.find(o => o.stars < 0), price = paid ? starPrice(-paid.stars, state.player.star.level) : 0;   // Preis im Text = Preis im Knopf
  return { icon: ev.icon, text: fill(ev.text.replace('{accident}', accidentText(le)), p).replaceAll('{preis}', price), opts: ev.opts.map((o, i) => ({ i, label: fill(o.label, p), cost: o.stars < 0 ? starPrice(-o.stars, state.player.star.level) : 0,
    energy: o.energy < 0 ? -o.energy : 0, tired: o.energy < 0 && (state.player.energy ?? 0) < -o.energy })) };
}
function accidentText(le) {
  if (le?.id !== 'accident') return '';
  const car = LIFESTYLE.find(x => x.id === le.car), list = car ? ACCIDENTS_VEHICLE[VEHICLE_KIND[car.id] ?? 'other'] : ACCIDENTS_HOME;
  return (list[le.acc] ?? list[0]).replaceAll('{car}', car?.name ?? 'Fahrzeug');
}
// Effekte anwenden; Rückgabe: Liste lesbarer Änderungen
export function applyEffects(state, e) {
  const p = state.player, out = [];
  const lvl = p.star.level, sign = v => (v > 0 ? `+${v}` : `${v}`);
  if (e.stars) {
    const v = e.stars > 0 ? (e.priced ? Math.max(1, Math.round(e.stars * priceFactor(lvl) * PRICE_MULT)) : starPayout(e.stars, lvl)) : -starPrice(-e.stars, lvl);   // priced: Gewinn wächst wie der Einsatz
    state.stars = Math.max(0, (state.stars ?? 0) + v); out.push(`${sign(v)} ★`);
  }
  if (e.energy) { addEnergy(p, e.energy); out.push(`Energie ${sign(e.energy)} %`); }
  if (e.sat) { p.satisfaction = clamp((p.satisfaction ?? 50) + e.sat, 0, 100); out.push(`Zufriedenheit ${sign(e.sat)}`); }
  const rel = v => Math.max(-2, Math.min(2, v));        // Ereignisse: Beziehungen höchstens ±2
  if (e.fans) { addFans(p, rel(e.fans)); out.push(`Fans ${sign(rel(e.fans))}`); }
  if (e.meet) { p.partnerName = state.lifeEvent?.name ?? p.partnerName; p.rel.partner = e.meet; p.partnerSince = absWeek(state); p.married = null; out.push(partnerText(`Freundin: ${p.partnerName}`, p)); }
  if (e.partner && p.rel.partner > 0) { addRel(p, 'partner', rel(e.partner)); out.push(`${p.partnerName ?? partnerText('Freundin', p)} ${sign(rel(e.partner))}`); }
  for (const k of ['manager', 'sponsors']) if (e[k] && p.rel[k] > 0) { addRel(p, k, rel(e[k])); out.push(`${k === 'manager' ? 'Manager' : 'Sponsoren'} ${sign(rel(e[k]))}`); }
  if (e.borrower) {                                     // Version 134: Fahrzeug verliehen / nicht verliehen
    const k = state.lifeEvent?.who, n = rel(e.borrower);
    if (k && p.rel[k] > 0) { addRel(p, k, n); out.push(`${k === 'manager' ? 'Manager' : p.partnerName ?? partnerText('Freundin', p)} ${sign(n)}`); }
  }
  if (e.crash) {
    const id = state.lifeEvent?.car, it = LIFESTYLE.find(x => x.id === id);
    if (it && p.owned?.includes(id)) {
      const u = (p.upkeep ??= {})[id] ??= { due: absWeek(state), pct: REPAIR_PCT[1] / 100, broken: false };
      u.broken = true; p.lifestyle = lifestyleOf(p);
      out.push(`${it.name} ${brokenWord(it)} – Reparatur ${repairCost(p, it)} ★`);
    }
  }
  if (e.shopNo && p.rel.partner > 0) { addRel(p, 'partner', SHOP_NO); if (p.rel.partner <= 0) breakUp(state); }   // still, ohne Anzeige
  if (e.accident) {                                    // Version 216: Fähigkeitsrückfall durch Unfall
    const le = state.lifeEvent, t = TRAINABLE.find(x => x.key === le?.skill);
    let k = 0; if (t) for (let i = 0; i < (le.n ?? 1); i++) if (removePoint(p, t.key)) k++;
    if (k) { syncAttrs(p); out.push(`${t.label} −${k} (jetzt ${skillValue(p, t.key)})`); }
    if (state.week && !state.activeEvent) { state.week.accident = true; out.push('Diese Woche keine Turniere'); }   // Version 217 (Majors bleiben stillschweigend spielbar)
  }
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
  if (opt.shop) { startShopping(state); return { shop: true, text: '', changes }; }
  checkAchievements(state);
  return { text: fill(text, { partnerName: p.partnerName ?? name, woman: p.woman, lover: le.lover, ...borrowCtx(state, le) }), changes };
}
// ---- Shoppingtour mit der Freundin (Version 213) ----
// Ja → Lifestyle-Shop; wer dort etwas kauft, macht sie glücklich (+4). Ohne Kauf wieder raus: −6 (schlimmer als gleich Nein: −3).
// Die Änderungen werden nirgends angekündigt oder angezeigt (Nutzerwunsch).
export const SHOP_BUY = 4, SHOP_EMPTY = -6, SHOP_NO = -3, SHOP_ENERGY = 5;   // Version 214: am Ende −5 % Energie je gekauftem Teil
export function startShopping(state) { state.shopping = { bought: false }; }
export function endShopping(state) {
  const sh = state.shopping, p = state.player;
  if (!sh) return null;
  state.shopping = null;
  if (sh.n) addEnergy(p, -SHOP_ENERGY * sh.n);
  if (!((p.rel?.partner ?? 0) > 0)) return null;
  const n = sh.bought ? SHOP_BUY : SHOP_EMPTY;
  addRel(p, 'partner', n);
  if (p.rel.partner <= 0) breakUp(state);
  return n;
}
// Shoppingtour nur, wenn es im Shop überhaupt etwas Bezahlbares gibt
export const canShop = state => LIFESTYLE.some(it => !state.player.owned?.includes(it.id) && itemPrice(it) <= (state.stars ?? 0));
export function breakUp(state, news = true) {
  const p = state.player, name = p.partnerName ?? partnerText('Deine Freundin', p), wed = !!p.married;
  p.rel.partner = 0; p.partnerName = null; p.partnerSince = null; p.married = null;
  let lost = 0;
  if (wed) { lost = Math.round((state.stars ?? 0) * DIVORCE_SHARE * 10) / 10; state.stars = Math.round(((state.stars ?? 0) - lost) * 10) / 10; }   // Version 123: Scheidung kostet die Hälfte des Sterngelds
  if (news || wed) addNews(state, 'info', wed ? `💔 Scheidung von ${name}` : `💔 ${name} hat Schluss gemacht`, wed ? `Die Ehe ist gescheitert – die Hälfte deines Sterngelds ist weg (−${lost} ★).` : 'Die Beziehung ist vorbei. Zu wenig Zeit füreinander …');
  return lost;
}
// ---- Hochzeit (Version 122): möglich bei Beziehung 100 und mehr als einem Jahr zusammen; kostet immer 1.500 ★ (kein Status-Faktor) ----
export const WEDDING_COST = 1500, WEDDING_WEEKS = 52, WEDDING_SAT = 15, DIVORCE_SHARE = 0.5;
export const weeksTogether = state => (state.player.partnerName && state.player.partnerSince != null ? absWeek(state) - state.player.partnerSince : 0);
export const canMarry = state => { const p = state.player; return !!p.partnerName && !p.married && (p.rel.partner ?? 0) >= 100 && weeksTogether(state) > WEDDING_WEEKS; };
export function marry(state) {
  const p = state.player;
  if (!canMarry(state)) throw new Error('Heiraten ist gerade nicht möglich');
  if ((state.stars ?? 0) < WEDDING_COST) throw new Error('Nicht genug ★');
  state.stars = Math.round((state.stars - WEDDING_COST) * 10) / 10;
  p.married = { year: state.date.year, week: state.date.week };
  p.satisfaction = clamp((p.satisfaction ?? 50) + WEDDING_SAT, 0, 100);
  addNews(state, 'star', `💍 Hochzeit mit ${p.partnerName}!`, `Ihr habt euch das Ja-Wort gegeben. Zufriedenheit +${WEDDING_SAT}. Kosten: ${WEDDING_COST} ★.`);
  checkAchievements(state);
}

// Wöchentlich (Tour-Modus): Freundin will Zeit (−1), Zufriedenheit nähert sich dem Ziel, Ereignis-Karte, Erfolge
export function lifeWeek(state, rng) {
  const p = state.player;
  if (p.partnerName && p.partnerSince == null) p.partnerSince = absWeek(state);   // ältere Spielstände: Beziehung zählt ab jetzt
  if (p.rel.partner > 0 && !(p.married && absWeek(state) % 2)) { addRel(p, 'partner', -1); if (p.rel.partner <= 0) breakUp(state); }   // verheiratet: nur jede 2. Woche −1
  upkeepWeek(state, rng);
  const s = p.satisfaction ?? 50;
  p.satisfaction = Math.round(clamp(s + (satisfactionTarget(p) - s) * 0.08, 0, 100) * 10) / 10;   // langsam
  p.lifestyle = lifestyleOf(p);
  rollLifeEvent(state, rng);
  if (rankOf(state, 'pdc', 'P') === 1) { const ms = (state.mstats ??= {}); ms.weeksNo1 = (ms.weeksNo1 ?? 0) + 1; }   // Version 165: Wochen auf Platz 1
  checkAchievements(state);
}

// ---- Erfolge ----
const SELF0 = { visits: 0, s180: 0, s140: 0, ton: 0, checkouts: 0, hiFinish: 0, bigFish: 0, matchDarts: 0, bull: 0 };
const MS0 = { nilWins: 0, deciderWins: 0, beatTop16: 0, beatTop8: 0, beatNo1: 0, bestAvg: 0, bestRating: 0, weeksNo1: 0 };
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
