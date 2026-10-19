// New Star Darts (DOM-frei): Karriere-Rahmen – Manager, Fitnesstrainer, Sponsoren (Höher/Niedriger-Verhandlung),
// Saisonziele, Interviews, Wochen-Update-Daten, Saisonbericht und Auszeichnungen
import { MANAGERS, TRAINERS, INTERVIEW_QS, REL_ACTIONS } from '../data/team.js';
import { randomName } from '../data/names.js';
import { RNG } from './rng.js';
import { SPONSORS, SPONSOR_SLOTS } from '../data/sponsors.js';
import { starPrice, starPayout, starFactor, addRel, addStarProgress } from './nsd.js';
import { addNews } from './news.js';
import { rankOf } from './rankings.js';
import { getPlayer } from './world.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const team = state => (state.team ??= { manager: null, trainer: null });
// Namen von Managern/Trainern: je Spielstand zufällig (Namenspool), einmal festgelegt
export function nameTeam(state, rng = new RNG(state.rng)) {
  const t = team(state), used = new Set();
  t.names ??= {};
  for (const m of MANAGERS) t.names[m.id] ??= randomName(rng, rng.pick(['DE', 'ENG', 'NL', 'IRL']), used);
  for (const f of TRAINERS) t.names[f.id] ??= `${f.title} ${randomName(rng, rng.pick(['DE', 'ENG', 'NL']), used).split(' ').slice(-1)[0]}`;
  return t.names;
}
const named = (state, x) => (x ? { ...x, name: team(state).names?.[x.id] ?? x.name } : null);
export const managersOf = state => (nameTeam(state), MANAGERS.map(m => named(state, m)));
export const trainersOf = state => (nameTeam(state), TRAINERS.map(t => named(state, t)));

// ---------- Manager ----------
export const managerOf = state => named(state, MANAGERS.find(m => m.id === team(state).manager));
export function managerOk(state, m) {
  const p = state.player, r = rankOf(state, 'pdc', 'P');
  return p.star.level >= m.needStar || (m.needRank && r && r <= m.needRank);
}
export function hireManager(state, id) {
  const m = named(state, MANAGERS.find(x => x.id === id));
  if (!managerOk(state, m)) throw new Error(`${m.name} nimmt dich (noch) nicht unter Vertrag`);
  team(state).manager = id;
  state.player.rel.manager = 50;
  addNews(state, 'info', `💼 Neuer Manager: ${m.name}`, `Provision ${Math.round(m.cut * 100)} % auf dein Preisgeld – dafür mehr und bessere Sponsor-Angebote und Saisonziele.`);
}
export function fireManager(state, news = true) {
  const m = managerOf(state);
  if (!m) return;
  team(state).manager = null; state.player.rel.manager = 0;
  if (news) addNews(state, 'info', `💼 ${m.name} ist nicht mehr dein Manager`, 'Ohne Manager kommen Sponsoren nur selten auf dich zu.');
}
// Provision vom Preisgeld (Rückgabe: Provision in ★)
export function managerCut(state, stars) {
  const m = managerOf(state);
  return m && stars > 0 ? Math.round(stars * m.cut) : 0;
}

// ---------- Fitnesstrainer ----------
export const trainerOf = state => named(state, TRAINERS.find(t => t.id === team(state).trainer));
export const trainerFee = (t, level) => starPrice(t.fee, level);
export const trainerRegen = state => trainerOf(state)?.regen ?? 0;
export function hireTrainer(state, id) {
  const t = named(state, TRAINERS.find(x => x.id === id)), fee = trainerFee(t, state.player.star.level);
  if ((state.stars ?? 0) < fee) throw new Error('Nicht genug ★ für die erste Woche');
  team(state).trainer = id;
  state.player.fitness = { id, name: t.name };
}
export function fireTrainer(state) { team(state).trainer = null; state.player.fitness = null; }

// ---------- Beziehungs-Aktionen (Fans, Manager, Sponsoren: 60 % Energie; Freundin: Geschenk in ★) ----------
export const REL_ENERGY = 60, REL_GAIN = 6, GIFT_PRICE = 4;
export function relAvailable(state, key) {
  const p = state.player;
  if (key === 'manager') return !!managerOf(state);
  if (key === 'sponsors') return (state.nsdSponsors?.active?.length ?? 0) > 0 || (p.rel.sponsors ?? 0) > 0;
  if (key === 'partner') return (p.rel.partner ?? 0) > 0;
  return true;
}
export function pickRelAction(state, key, rng = new RNG(state.rng)) {
  return { key, name: rng.pick(REL_ACTIONS[key]), energy: key === 'partner' ? 0 : REL_ENERGY,
    stars: key === 'partner' ? starPrice(GIFT_PRICE, state.player.star.level) : 0, gain: REL_GAIN };
}
export function doRelAction(state, act) {
  const p = state.player;
  if (!relAvailable(state, act.key)) throw new Error('Diese Beziehung gibt es (noch) nicht');
  if (act.energy && (p.energy ?? 0) < act.energy) throw new Error(`Zu müde – ${act.energy} % Energie nötig`);
  if (act.stars && (state.stars ?? 0) < act.stars) throw new Error('Nicht genug ★');
  if (act.energy) p.energy = Math.max(0, p.energy - act.energy);
  if (act.stars) state.stars -= act.stars;
  return addRel(p, act.key, act.gain);
}

// ---------- Sponsoren ----------
const sp = state => (state.nsdSponsors ??= { active: [], offer: null });
export const SPONSOR_MAX = Object.keys(SPONSOR_SLOTS).length;
// Wochenbetrag (Basis): Status, Fans, PDC-Rang
export function sponsorBase(state) {
  const p = state.player, r = rankOf(state, 'pdc', 'P') ?? 150;
  return 1 + 0.08 * p.star.level + 0.03 * (p.rel.fans ?? 0) + Math.max(0, (80 - r) / 20);
}
export function sponsorWeek(state, rng) {
  const s = sp(state), p = state.player, out = { paid: 0, ended: [] };
  for (const c of s.active) { state.stars = (state.stars ?? 0) + c.perWeek; out.paid += c.perWeek; c.weeksLeft--; }
  for (const c of s.active.filter(x => x.weeksLeft <= 0)) {
    out.ended.push(c.name);
    addNews(state, 'info', `🤝 Vertrag mit ${c.name} ausgelaufen`, 'Neue Angebote kommen über deinen Manager oder bei guten Leistungen.');
  }
  s.active = s.active.filter(x => x.weeksLeft > 0);
  if (!s.active.length && p.rel.sponsors > 0) p.rel.sponsors = Math.max(1, p.rel.sponsors - 1);
  // Angebot erzeugen (eins offen, 3 Wochen gültig)
  if (s.offer && --s.offer.weeks <= 0) s.offer = null;
  const free = Object.keys(SPONSOR_SLOTS).filter(k => !s.active.some(c => c.slot === k));
  const m = managerOf(state), chance = (m ? m.offer : 0.06) + 0.002 * (p.rel.fans ?? 0);
  if (!s.offer && free.length && rng.chance(chance)) {
    const slot = rng.pick(free), tier = p.star.level >= 30 ? 3 : p.star.level >= 10 ? 2 : 1;
    const name = rng.pick(SPONSORS.filter(x => x.slot === slot && x.tier <= tier)).name;
    const perWeek = Math.max(1, Math.round(sponsorBase(state) * (m?.mult ?? 0.8) * rng.float(0.8, 1.2) * starFactor(p.star.level)));
    s.offer = { name, slot, perWeek, weeks: 3, length: rng.pick([12, 20, 26, 36, 52]), bonus: 0, card: rng.int(2, 12), streak: 0, done: false };
    addNews(state, 'info', `🤝 Sponsor-Angebot: ${name}`, `${SPONSOR_SLOTS[slot].label} · ${perWeek} ★ pro Woche für ${s.offer.length} Wochen. Verhandle im Leben-Screen (Sponsoren).`);
  }
  return out;
}
// Höher/Niedriger: Karte 1–13, richtig → +15 % (max. 5×), falsch → −10 % und Verhandlung vorbei
export function negotiate(state, guess, rng) {
  const o = sp(state).offer;
  if (!o || o.done) throw new Error('Kein offenes Angebot');
  const next = rng.int(1, 13), prev = o.card;
  const ok = next === prev || (guess === 'higher' ? next > prev : next < prev);
  o.card = next;
  if (ok) { o.streak++; o.bonus = Math.min(0.75, o.bonus + 0.15); if (o.streak >= 5) o.done = true; }
  else { o.bonus = -0.1; o.done = true; }
  return { ok, prev, next, perWeek: offerValue(o), done: o.done };
}
export const offerValue = o => Math.max(1, Math.round(o.perWeek * (1 + o.bonus)));
export function acceptOffer(state) {
  const s = sp(state), o = s.offer, p = state.player;
  if (!o) throw new Error('Kein offenes Angebot');
  s.active = s.active.filter(c => c.slot !== o.slot);
  s.active.push({ name: o.name, slot: o.slot, perWeek: offerValue(o), weeksLeft: o.length });
  s.offer = null;
  p.rel.sponsors = clamp((p.rel.sponsors || 40) + 5, 0, 100);
  addNews(state, 'info', `🤝 Unterschrieben: ${o.name}`, `${offerValue(o)} ★ pro Woche für ${o.length} Wochen.`);
}
export function declineOffer(state) { sp(state).offer = null; }

// ---------- Saisonziele (KW 1 bzw. Karrierestart) ----------
const PLACE_ORDER = ['L128', 'L64', 'L32', 'L16', 'QF', 'SF', 'F', 'W'];
export const placeRank = pl => PLACE_ORDER.indexOf(pl);
export const PLACE_TXT = { L64: 'Letzte 64', L32: 'Letzte 32', L16: 'Achtelfinale', QF: 'Viertelfinale', SF: 'Halbfinale', F: 'Finale', W: 'Turniersieg' };
export function setGoals(state) {
  const y = state.date.year, p = state.player, r = rankOf(state, 'pdc', 'P') ?? 128;
  const prev = state.stats?.seasons?.[y - 1];
  const bestPrev = Math.max(1, ...(state.results ?? []).filter(x => x.year === y - 1).map(x => placeRank(x.place)));
  const rankT = r > 64 ? Math.max(64, Math.round(r * 0.8)) : Math.max(1, Math.round(r * 0.7));
  state.goals = {
    year: y, done: false, by: managerOf(state)?.name ?? null,
    list: [
      { id: 'rank', label: `PDC-Rangliste: Platz ${rankT} oder besser`, target: rankT, reward: 15 },
      { id: 'wins', label: `${Math.max(8, (prev?.wins ?? 0) + 4)} Matchsiege`, target: Math.max(8, (prev?.wins ?? 0) + 4), reward: 10 },
      { id: 'round', label: `Mindestens ${PLACE_TXT[PLACE_ORDER[Math.min(7, Math.max(2, bestPrev + 1))]]} in einem Turnier`, target: PLACE_ORDER[Math.min(7, Math.max(2, bestPrev + 1))], reward: 10 },
    ],
  };
  return state.goals;
}
export function goalProgress(state, g) {
  const y = state.goals.year;
  if (g.id === 'rank') { const r = rankOf(state, 'pdc', 'P'); return { now: r ?? '–', ok: !!r && r <= g.target }; }
  if (g.id === 'wins') { const w = state.stats?.seasons?.[y]?.wins ?? 0; return { now: w, ok: w >= g.target }; }
  const best = Math.max(-1, ...(state.results ?? []).filter(x => x.year === y).map(x => placeRank(x.place)));
  return { now: best >= 0 ? PLACE_TXT[PLACE_ORDER[best]] ?? '–' : '–', ok: best >= placeRank(g.target) };
}
// Saisonende: Ziele werten (★ + Star-Status, Manager-Beziehung)
export function settleGoals(state) {
  const gs = state.goals;
  if (!gs || gs.done) return [];
  const p = state.player, res = gs.list.map(g => ({ ...g, ok: goalProgress(state, g).ok }));
  let reward = 0;
  for (const g of res) if (g.ok) reward += starPayout(g.reward, p.star.level);
  state.stars = (state.stars ?? 0) + reward;
  const n = res.filter(g => g.ok).length;
  if (n) addStarProgress(state, n * 10);
  if (managerOf(state)) { addRel(p, 'manager', n * 8 - 10); if (p.rel.manager <= 0) fireManager(state); }
  gs.done = true; gs.result = { n, reward };
  if (n === gs.list.length) (state.flags ??= {}).allGoals = true;
  return res;
}

// ---------- Interview (nach Halbfinale/Finale/Titel außerhalb der Pro Tour bzw. nach jedem Titel) ----------
export function maybeInterviewNsd(state, inst, rng) {
  const big = inst.cat !== 'pc' && inst.cat !== 'etq';
  if (inst.isQualifier || !(inst.place === 'W' || (big && ['F', 'SF'].includes(inst.place)))) return null;
  const qs = rng.shuffle([...INTERVIEW_QS]).slice(0, 3).map(x => INTERVIEW_QS.indexOf(x));
  state.interview = { event: inst.name, place: inst.place, qs, answers: [] };
  return state.interview;
}
// style 0 = bescheiden, 1 = selbstbewusst, 2 = großspurig. Rückgabe: Reaktion
export function answerInterview(state, style, rng) {
  const iv = state.interview, p = state.player;
  if (!iv) throw new Error('Kein Interview');
  const win = iv.place === 'W';
  let fans = 0, star = 0, txt;
  if (style === 0) { fans = 1; star = 3; txt = 'Sympathisch – die Leute mögen das.'; }
  else if (style === 1) { fans = win ? 2 : 1; star = win ? 6 : 4; txt = 'Klare Worte, gut angekommen.'; }
  else if (rng.chance(win ? 0.55 : 0.35)) { fans = 4; star = 9; txt = 'Die Presse liebt dein Selbstbewusstsein!'; }
  else { fans = -3; star = 0; txt = 'Das kam arrogant rüber – Buhrufe in den sozialen Medien.'; }
  addRel(p, 'fans', fans);
  if (managerOf(state)) addRel(p, 'manager', style === 2 && fans < 0 ? -3 : 1);
  if (p.rel.sponsors > 0) addRel(p, 'sponsors', fans > 0 ? 1 : -2);
  iv.answers.push({ style, fans, star, txt });
  if (iv.answers.length >= iv.qs.length) {
    const total = iv.answers.reduce((a, x) => a + x.star, 0);
    addStarProgress(state, Math.round(total * (1 + 0.03 * (p.star.level - 1))));
    iv.total = total;
    (state.flags ??= {}).interview = true;
  }
  return { fans, star, txt, done: iv.answers.length >= iv.qs.length };
}

// ---------- Wöchentlich (Tour-Modus) ----------
export function careerWeek(state, rng) {
  const p = state.player, out = { fee: 0, sponsor: 0 };
  const t = trainerOf(state);
  if (t) {
    const fee = trainerFee(t, p.star.level);
    if ((state.stars ?? 0) >= fee) { state.stars -= fee; out.fee = fee; }
    else { fireTrainer(state); addNews(state, 'info', `🏃 ${t.name} hat gekündigt`, 'Du konntest die Wochengebühr nicht mehr bezahlen.'); }
  }
  out.sponsor = sponsorWeek(state, rng).paid;
  if (managerOf(state) && p.rel.manager > 0 && rng.chance(0.15)) addRel(p, 'manager', -1);   // will Erfolge sehen
  return out;
}

// ---------- Saisonbericht + Auszeichnungen (Jahresende, vor dem Jahreswechsel) ----------
export function seasonReport(state) {
  const y = state.date.year, p = state.player, st = state.stats?.seasons?.[y] ?? {};
  const res = (state.results ?? []).filter(x => x.year === y);
  const best = res.reduce((b, x) => (placeRank(x.place) > placeRank(b?.place) ? x : b), null);
  const goals = settleGoals(state);
  const awards = seasonAwards(state, y);
  state.seasonReport = {
    year: y, matches: st.matches ?? 0, wins: st.wins ?? 0, titles: res.filter(x => x.place === 'W').map(x => x.name),
    best: best ? `${best.name} (${PLACE_TXT[best.place] ?? best.place})` : '–', stars: res.reduce((a, x) => a + (x.stars ?? 0), 0),
    rank: rankOf(state, 'pdc', 'P'), status: p.star.level, avg: st.darts ? Math.round(st.points / st.darts * 300) / 100 : null,
    goals: goals.map(g => ({ label: g.label, ok: g.ok })), awards,
  };
  return state.seasonReport;
}
const yearList = (state, type, y) => Object.entries(state.rankings.years?.[y]?.[type] ?? {}).sort((a, b) => b[1] - a[1]);
export function seasonAwards(state, y) {
  const p = state.player, out = [];
  const nm = id => (id === 'P' ? p.name : getPlayer(state, id)?.name ?? '?');
  const add = (label, id, reward) => {
    out.push({ label, id, name: nm(id), mine: id === 'P' });
    if (id === 'P') {
      (state.flags ??= {}).award = true;
      const r = starPayout(reward, p.star.level);
      state.stars = (state.stars ?? 0) + r; addStarProgress(state, 30); addRel(p, 'fans', 3);
      addNews(state, 'result', `🏅 Auszeichnung: ${label}`, `Belohnung: ${r} ★.`);
    }
  };
  const poy = yearList(state, 'pdc', y)[0]; if (poy) add('Spieler des Jahres', poy[0], 40);
  const pt = yearList(state, 'protour', y)[0]; if (pt) add('Pro-Tour-Spieler des Jahres', pt[0], 20);
  const fresh = id => (id === 'P' ? (p.cardVia ?? '').includes(String(y)) && !p.yearsOnTour : (getPlayer(state, id)?.cardVia ?? '').includes(`Q-School UK ${y}`) || (getPlayer(state, id)?.cardVia ?? '').includes(`Q-School Europa ${y}`));
  const nw = yearList(state, 'pdc', y).find(([id]) => fresh(id)); if (nw) add('Newcomer des Jahres', nw[0], 15);
  if ((p.rel.fans ?? 0) >= 75) add('Fan-Liebling', 'P', 15);
  p.yearsOnTour = (p.yearsOnTour ?? 0) + 1;
  return out;
}
