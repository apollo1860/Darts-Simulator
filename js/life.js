// New Star Darts (DOM-frei): Leben – Lifestyle-Shop, Zufriedenheit, Beziehungen (Freundin), Lebens-Ereignisse (Karten), Erfolge
import { LIFESTYLE } from '../data/lifestyle.js';
import { LIFE_EVENTS, PARTNER_NAMES } from '../data/lifeevents.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { starPrice, starPayout, addEnergy, addRel, skillsAvg, ENERGY_WEEK, TRAINABLE } from './nsd.js';
import { addNews } from './news.js';
import { rankOf } from './rankings.js';
import { TRAINERS } from '../data/team.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fill = (txt, p) => txt.replaceAll('{partner}', p.partnerName ?? 'Sie');

// ---- Lifestyle-Shop ----
export const ownedItems = p => LIFESTYLE.filter(x => p.owned?.includes(x.id));
export const lifestyleOf = p => Math.min(100, ownedItems(p).reduce((a, x) => a + x.ls, 0));
export const homeRegen = p => Math.max(0, ...ownedItems(p).map(x => x.regen ?? 0));
export const itemPrice = (it, level) => starPrice(it.price, level);
export function buyItem(state, id) {
  const p = state.player, it = LIFESTYLE.find(x => x.id === id);
  if (p.owned?.includes(id)) throw new Error('Schon gekauft');
  const cost = itemPrice(it, p.star.level);
  if ((state.stars ?? 0) < cost) throw new Error('Nicht genug ★');
  state.stars -= cost;
  (p.owned ??= []).push(id);
  p.lifestyle = lifestyleOf(p);
  p.satisfaction = clamp((p.satisfaction ?? 50) + it.sat, 0, 100);
  addNews(state, 'info', `${it.icon} Gekauft: ${it.name}`, `Lifestyle jetzt ${p.lifestyle}.${it.regen ? ` Zuhause erholst du dich besser: +${it.regen} % Energie pro Woche.` : ''}`);
  checkAchievements(state);
  return cost;
}

// ---- Wöchentliche Erholung: Basis 40 + bestes Zuhause + Fitnesstrainer + Zufriedenheit (−10 … +10) ----
export const fitnessRegen = p => TRAINERS.find(t => t.id === p.fitness?.id)?.regen ?? 0;
export const weeklyEnergy = p => ENERGY_WEEK + homeRegen(p) + fitnessRegen(p) + Math.round(((p.satisfaction ?? 50) - 50) / 5);

// Zufriedenheit: Zielwert aus Lifestyle, Freundin, Fans und Selbstvertrauen; wöchentlich 20 % Richtung Ziel
export function satisfactionTarget(p) {
  const r = p.rel ?? {};
  return clamp(35 + 0.3 * lifestyleOf(p) + ((r.partner ?? 0) > 0 ? 5 + 0.15 * r.partner : 0) + 0.1 * (r.fans ?? 0) + 1.5 * (p.momentum ?? 0), 0, 100);
}

// ---- Lebens-Ereignisse ----
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
  return { icon: ev.icon, text: fill(ev.text, p), opts: ev.opts.map((o, i) => ({ i, label: fill(o.label, p), cost: o.stars < 0 ? starPrice(-o.stars, state.player.star.level) : 0 })) };
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
  if (e.fans) { addRel(p, 'fans', e.fans); out.push(`Fans ${sign(e.fans)}`); }
  if (e.meet) { p.partnerName = state.lifeEvent?.name ?? p.partnerName; p.rel.partner = e.meet; out.push(`Freundin: ${p.partnerName}`); }
  if (e.partner && p.rel.partner > 0) { addRel(p, 'partner', e.partner); out.push(`${p.partnerName ?? 'Freundin'} ${sign(e.partner)}`); }
  for (const k of ['manager', 'sponsors']) if (e[k] && p.rel[k] > 0) { addRel(p, k, e[k]); out.push(`${k === 'manager' ? 'Manager' : 'Sponsoren'} ${sign(e[k])}`); }
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
  const name = le.name ?? p.partnerName;
  const changes = applyEffects(state, { ...opt, stars: opt.stars, chance: undefined });
  let text = opt.out ?? '';
  if (opt.chance) {
    const r = rng.chance(opt.chance.p) ? opt.chance.ok : opt.chance.fail;
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
  const s = p.satisfaction ?? 50;
  p.satisfaction = Math.round(clamp(s + (satisfactionTarget(p) - s) * 0.2, 0, 100) * 10) / 10;
  p.lifestyle = lifestyleOf(p);
  rollLifeEvent(state, rng);
  checkAchievements(state);
}

// ---- Erfolge ----
export function achievementCtx(state) {
  const p = state.player, c = state.stats?.career ?? {};
  return {
    state, p, rank: rankOf(state, 'pdc', 'P'), stats: { wins: c.wins ?? 0, s180: c.s180 ?? 0, bestLeg: c.bestLeg ?? 0 },
    titles: (state.results ?? []).filter(r => r.place === 'W'), skillsAvg: skillsAvg(p), owned: ownedItems(p), lifestyle: lifestyleOf(p),
  };
}
export function checkAchievements(state) {
  if (state.mode !== 'nsd') return [];
  const ctx = achievementCtx(state), got = [];
  state.achievements ??= {};
  for (const a of ACHIEVEMENTS) {
    if (state.achievements[a.id] || !a.check(ctx)) continue;
    const reward = starPayout(a.stars, state.player.star.level);
    state.achievements[a.id] = { year: state.date.year, week: state.date.week };
    state.stars = (state.stars ?? 0) + reward;
    addNews(state, 'star', `${a.icon} Erfolg: ${a.label}`, `Belohnung: ${reward} ★.`);
    got.push(a);
  }
  return got;
}
