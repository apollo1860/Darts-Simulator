// New Star Darts (DOM-frei): Karriere-Rahmen – Manager, Fitnesstrainer, Sponsoren (Höher/Niedriger-Verhandlung),
// Saisonziele, Interviews, Wochen-Update-Daten, Saisonbericht und Auszeichnungen
import { MANAGERS, TRAINER_TITLES, TRAINER_ICONS, REL_ACTIONS } from '../data/team.js';
import { RESULT_QS, PAULKE_IN, PAULKE_OUT, MOOD_INTRO } from '../data/talk.js';
import { randomName } from '../data/names.js';
import { surname } from './util.js';
import { RNG } from './rng.js';
import { CONTROVERSIAL, CONTROVERSIAL_FROM, CONTROVERSIAL_PAY, CONTROVERSY_FIRST, CONTROVERSY_GAP, CONTROVERSY_OFFER_WEEKS, CONTROVERSY_SIGN_FANS, CONTROVERSY_EVENT, CONTROVERSY_LENGTHS, CONTROVERSY_KINDS, CONTROVERSY_PARAMS } from '../data/controversial.js';
import { REAL_SPONSORS, SMALL_SPONSORS, BRANCHEN, SPONSOR_MAX, brancheOfName, REAL_FROM, FAME_PAY, SMALL_PAY, REAL_SHARE, NEW_TIER_FOCUS, SPONSOR_PAY, scaleSponsorPay } from '../data/sponsorsreal.js';
import { starPrice, starPayout, starFactor, priceFactor, addRel, addFans, addStarProgress, addEnergy } from './nsd.js';
import { addNews } from './news.js';
import { rankOf } from './rankings.js';
import { getPlayer } from './world.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const team = state => (state.team ??= { manager: null, trainer: null });
// Namen von Managern/Trainern: je Spielstand zufällig (Namenspool), einmal festgelegt
export function nameTeam(state, rng = new RNG(state.rng)) {
  const t = team(state), used = new Set();
  t.names ??= {};
  // Version 89: Frauen-Symbol (👩‍💼) → Frauenname, Männer-Symbol → Männername (`woman` in data/team.js); ältere Spielstände bekommen einmal einen passenden Namen
  for (const m of MANAGERS) if (t.names[m.id] === undefined || (m.woman && t.namesV !== 2)) t.names[m.id] = randomName(rng, rng.pick(['DE', 'ENG', 'NL', 'IRL']), used, !!m.woman);
  t.namesV = 2;
  return t.names;
}
const named = (state, x) => (x ? { ...x, name: team(state).names?.[x.id] ?? x.name } : null);
export const managersOf = state => (nameTeam(state), MANAGERS.map(m => named(state, m)));

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
// Festpreis für eine Anzahl Wochen (z. B. 5 ★ für 6 Wochen). 3 Angebote, alle 12 Wochen neue (Name, Erholung, Preis, Dauer zufällig).
export const weekIndex = state => state.date.year * 52 + state.date.week;
export const OFFER_WEEKS = 12;
export function trainerOffers(state, rng = new RNG(state.rng)) {
  const t = team(state);
  if (!t.trainerOffers || weekIndex(state) >= (t.offersUntil ?? 0)) {
    const used = new Set(), f = priceFactor(state.player.star.level);
    t.trainerOffers = Array.from({ length: 3 }, (_, i) => {
      const regen = rng.int(4, 20), weeks = rng.pick([4, 6, 8, 10, 12]);
      return { id: `f${weekIndex(state)}-${i}`, icon: rng.pick(TRAINER_ICONS), regen, weeks,
        name: `${rng.pick(TRAINER_TITLES)} ${surname(randomName(rng, rng.pick(['DE', 'ENG', 'NL', 'IRL']), used))}`,
        price: Math.max(1, Math.round(regen * weeks * 0.08 * rng.float(0.8, 1.25) * f)) };
    }).sort((a, b) => a.price - b.price);
    t.offersUntil = weekIndex(state) + OFFER_WEEKS;
  }
  return t.trainerOffers;
}
export const trainerOf = state => state.player.fitness?.until ? state.player.fitness : null;
export const trainerWeeksLeft = state => Math.max(0, (trainerOf(state)?.until ?? 0) - weekIndex(state));
export function hireTrainer(state, id) {
  const o = trainerOffers(state).find(x => x.id === id);
  if (!o) throw new Error('Angebot nicht mehr verfügbar');
  if ((state.stars ?? 0) < o.price) throw new Error('Nicht genug ★');
  state.stars = Math.round((state.stars - o.price) * 10) / 10;
  team(state).trainer = o.id;
  state.player.fitness = { id: o.id, name: o.name, icon: o.icon, regen: o.regen, until: weekIndex(state) + o.weeks };
  team(state).trainerOffers = team(state).trainerOffers.filter(x => x.id !== id);
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
  if (act.stars) state.stars = Math.round((state.stars - act.stars) * 10) / 10;
  return addRel(p, act.key, act.gain);
}

// ---------- Sponsoren ----------
// Version 71: Sponsoren nach Branchen – ältere Spielstände (Vertragsplätze) bekommen die Branche über den Markennamen
export { SPONSOR_PAY, scaleSponsorPay };   // Version 93: alle Sponsorbeträge × SPONSOR_PAY (data/sponsorsreal.js)
const sp = state => {
  const s = (state.nsdSponsors ??= { active: [], offer: null, payV: 2 });
  for (const c of [...s.active, s.offer]) if (c && !c.branche) c.branche = brancheOfName(c.name);
  return s;
};
export { SPONSOR_MAX };
export const brancheOf = c => (c.controversial ? { label: `Umstritten · ${c.sector}`, icon: '⚠️' } : BRANCHEN[c.branche] ?? BRANCHEN.andere);
// Umstrittene Verträge (Version 73) zählen weder zu den 5 Plätzen noch zur Branchenregel
export const normalContracts = state => sp(state).active.filter(c => !c.controversial);
export const hasControversial = state => sp(state).active.some(c => c.controversial);
export const sponsorBlockWeeks = state => Math.max(0, (sp(state).blockUntil ?? 0) - weekIndex(state));
// Wochenbetrag (Basis): Status, Fans, PDC-Rang
export function sponsorBase(state) {
  const p = state.player, r = rankOf(state, 'pdc', 'P') ?? 150;
  return 1 + SPONSOR_SLOPE.star * p.star.level + SPONSOR_SLOPE.fans * (p.rel.fans ?? 0) + Math.max(0, (80 - r) / 20);
}
// Version 104 (Nutzerwunsch „zu schnell zu hoch“): flacherer Anstieg – Status/Fans zählen weniger (vorher 0,08/0,03) und der Status-Faktor
// wirkt nur halb (+2,5 % statt +5 % je Stufe). Laufende Verträge bleiben unverändert.
export const SPONSOR_SLOPE = { star: 0.06, fans: 0.025 };
export const sponsorGrowth = level => 1 + 0.025 * (Math.max(1, level) - 1);
// Sponsor für ein Angebot (Version 70/71): `taken` = Branchen mit laufendem Vertrag (pro Branche nur ein Sponsor). Bis Star-Status 10 nur kleine
// fiktive Marken (zahlen wenig); ab 11 meist echte Marken – Stufen ab 11 / 20 / 40, leichter Fokus auf die zuletzt freigeschaltete Stufe;
// je bekannter die Marke, desto besser die Bezahlung. Die Branche wird gleichverteilt gewählt (nicht nach Markenzahl), dann die Marke.
export function pickSponsor(level, taken, rng) {
  const small = () => {
    const pool = SMALL_SPONSORS.filter(x => !taken.has(x.branche));
    if (!pool.length) return null;
    const x = rng.pick(pool);
    return { name: x.name, branche: x.branche, real: false, fame: 0, pay: SMALL_PAY };
  };
  if (level < REAL_FROM[0] || !rng.chance(REAL_SHARE)) return small();
  const pool = REAL_SPONSORS.filter(x => x.from <= level && !taken.has(x.branche));
  if (!pool.length) return small();
  const branchen = [...new Set(pool.map(x => x.branche))], b = rng.pick(branchen), inB = pool.filter(x => x.branche === b);
  const top = Math.max(...pool.map(x => x.from)), w = x => (x.from === top && top > REAL_FROM[0] ? NEW_TIER_FOCUS : 1);
  let r = rng.next() * inB.reduce((a, x) => a + w(x), 0), pick = inB[inB.length - 1];
  for (const x of inB) { r -= w(x); if (r <= 0) { pick = x; break; } }
  return { name: pick.name, branche: b, real: true, fame: pick.fame, pay: FAME_PAY[pick.fame] };
}
export function sponsorWeek(state, rng) {
  const s = sp(state), p = state.player, out = { paid: 0, ended: [] };
  for (const c of s.active) { state.stars = (state.stars ?? 0) + c.perWeek; out.paid += c.perWeek; c.weeksLeft--; }
  for (const c of s.active.filter(x => x.weeksLeft <= 0)) {
    out.ended.push(c.name);
    addNews(state, 'info', `🤝 Vertrag mit ${c.name} ausgelaufen`, 'Neue Angebote kommen über deinen Manager oder bei guten Leistungen.');
  }
  s.active = s.active.filter(x => x.weeksLeft > 0);
  for (const c of s.active.filter(x => x.controversial)) controversyEvent(state, c, rng);      // Fan-Proteste, abspringende Sponsoren
  if (!s.active.length && p.rel.sponsors > 0) p.rel.sponsors = Math.max(1, p.rel.sponsors - 1);
  // Angebot erzeugen (eins offen, 3 Wochen gültig)
  if (s.offer && --s.offer.weeks <= 0) s.offer = null;
  // Ohne Manager keine Sponsoren; Kneipen-Kumpel selten und klein, Profi-Manager oft und groß. Angebote kommen auch bei voller Sponsorenliste
  // (dann muss für den Neuen einer gekündigt werden), aber nie aus einer Branche, in der du schon einen Vertrag hast.
  const m = managerOf(state), chance = m ? m.offer * (1 + 0.005 * (p.rel.fans ?? 0)) : 0;
  const blocked = weekIndex(state) < (s.blockUntil ?? 0);                    // Sponsoren-Sperre nach einem Skandal
  const sp0 = !s.offer && !blocked && rng.chance(chance) ? pickSponsor(p.star.level, new Set(normalContracts(state).map(c => c.branche)), rng) : null;
  if (sp0) {
    const name = sp0.name, branche = sp0.branche;
    const perWeek = Math.max(1, Math.round(sponsorBase(state) * m.mult * rng.float(0.8, 1.2) * sponsorGrowth(p.star.level) * sp0.pay * SPONSOR_PAY));
    // Prämien: Wochenhonorar + Siegprämie, manchmal 180er-Prämie und/oder Major-Teilnahme
    s.offer = { name, branche, real: sp0.real, fame: sp0.fame, perWeek, win: Math.max(1, Math.round(perWeek * 0.5)),
      s180: rng.chance(0.4) ? Math.max(1, Math.round(perWeek * 0.3)) : 0, major: rng.chance(0.3) ? Math.max(2, Math.round(perWeek * 2)) : 0,
      weeks: 3, length: rng.pick([12, 20, 26, 36, 52]), bonus: 0, card: rng.int(2, 9), steps: 0, mood: 0, annoyed: false, done: false };
    addNews(state, 'info', `🤝 Sponsor-Angebot: ${name}`, `${BRANCHEN[branche].label}${sp0.real ? ' · bekannte Marke' : ''} · ${perWeek} ★ pro Woche für ${s.offer.length} Wochen${normalContracts(state).length >= SPONSOR_MAX ? ` – du hast schon ${SPONSOR_MAX} Sponsoren, für diesen Vertrag musst du einen kündigen` : ''}. Verhandle im Leben-Screen (Sponsoren).`);
  }
  controversialOffer(state, m, rng);
  return out;
}
// ---- Umstrittene Sponsoren (data/controversial.js): ab Status 25, ca. alle 1–2 Jahre, sehr gut bezahlt, Fan-Probleme, andere Sponsoren springen ab ----
function controversialOffer(state, m, rng) {
  const s = sp(state), p = state.player, wk = weekIndex(state);
  if (s.cOffer && --s.cOffer.weeks <= 0) s.cOffer = null;
  if (p.star.level < CONTROVERSIAL_FROM || !m) return;
  s.cAt ??= wk + rng.int(CONTROVERSY_FIRST[0], CONTROVERSY_FIRST[1]);
  if (s.cOffer || hasControversial(state) || wk < s.cAt) return;
  const b = rng.pick(CONTROVERSIAL.filter(x => x.name !== s.cLast)); s.cLast = b.name;
  const perWeek = Math.max(2, Math.round(sponsorBase(state) * m.mult * rng.float(0.8, 1.2) * sponsorGrowth(p.star.level) * CONTROVERSIAL_PAY * SPONSOR_PAY));
  s.cOffer = { name: b.name, sector: b.sector, tag: b.tag, perWeek, win: Math.max(1, Math.round(perWeek * 0.4)), weeks: CONTROVERSY_OFFER_WEEKS, length: rng.pick(CONTROVERSY_LENGTHS) };
  s.cAt = wk + rng.int(CONTROVERSY_GAP[0], CONTROVERSY_GAP[1]);
  addNews(state, 'info', `⚠️ Umstrittenes Sponsor-Angebot: ${b.name}`, `${b.tag} · ${perWeek} ★ pro Woche für ${s.cOffer.length} Wochen – sehr gut bezahlt, aber Fans und andere Sponsoren könnten verärgert reagieren. Entscheide im Sponsoren-Screen.`);
}
export const controversialValue = o => o.perWeek;
export function acceptControversial(state) {
  const s = sp(state), o = s.cOffer, p = state.player;
  if (!o) throw new Error('Kein umstrittenes Angebot');
  if (hasControversial(state)) throw new Error('Es läuft schon ein umstrittener Vertrag');
  s.active.push({ name: o.name, branche: 'umstritten', controversial: true, sector: o.sector, tag: o.tag, real: true, fame: 0, perWeek: o.perWeek, win: o.win, s180: 0, major: 0, weeksLeft: o.length });
  s.cOffer = null;
  addFans(p, CONTROVERSY_SIGN_FANS);
  addNews(state, 'result', `⚠️ Umstrittener Deal: ${o.name}`, `${o.perWeek} ★ pro Woche für ${o.length} Wochen. Die ersten Fans sind schon empört (Fans ${CONTROVERSY_SIGN_FANS}).`);
}
export function declineControversial(state) { sp(state).cOffer = null; }
// Wöchentlicher Vorfall (Chance CONTROVERSY_EVENT, Art nach CONTROVERSY_KINDS): von Boykottaufruf bis Mega-Skandal – die schweren Folgen
// (mehrere Sponsoren weg, Sponsoren-Sperre, Krisen-PR, Manager-Krach) können den Deal unterm Strich zum Verlustgeschäft machen.
export function controversyEvent(state, c, rng) {
  if (!rng.chance(CONTROVERSY_PARAMS.rate)) return null;
  const def = CONTROVERSIAL.find(x => x.name === c.name), P = CONTROVERSY_PARAMS, p = state.player, s = sp(state), wk = weekIndex(state);
  let r = rng.next() * CONTROVERSY_KINDS.reduce((a, x) => a + x.w, 0), kind = CONTROVERSY_KINDS.at(-1).kind;
  for (const x of CONTROVERSY_KINDS) { r -= x.w; if (r <= 0) { kind = x.kind; break; } }
  const normal = normalContracts(state), drop = n => {                     // n zufällige normale Sponsoren springen ab
    const gone = rng.shuffle([...normal]).slice(0, n); s.active = s.active.filter(x => !gone.includes(x)); return gone.map(x => x.name);
  };
  const block = weeks => { s.blockUntil = Math.max(s.blockUntil ?? 0, wk + weeks); if (s.offer) s.offer = null; };   // Sponsoren-Sperre: keine neuen normalen Angebote
  const pay = mult => { const cost = Math.min(Math.max(0, state.stars ?? 0), Math.round(c.perWeek * mult)); state.stars = (state.stars ?? 0) - cost; return cost; };
  if (kind === 'leave' && !normal.length) kind = 'fans';
  if (kind === 'severe' && !normal.length) kind = 'pr';
  if (kind === 'mega' && !normal.length) kind = 'pr';
  if (kind === 'leave') {
    const [v] = drop(1); addRel(p, 'sponsors', -P.leave.rel);
    addNews(state, 'result', `🤝 ${v} springt ab`, `„Mit ${c.name} wollen wir nicht in einem Atemzug genannt werden.“ Der Vertrag ist beendet (Sponsoren −${P.leave.rel}).`);
    return { kind, sponsor: v };
  }
  if (kind === 'fans') {
    const loss = rng.int(...P.fans.loss); addFans(p, -loss);
    addNews(state, 'result', `📉 Proteste wegen ${c.name}`, `${rng.pick(def?.scandal ?? ['Die Fans sind verärgert.'])} (Fans −${loss})`);
    return { kind, loss };
  }
  if (kind === 'pr') {
    addFans(p, -P.pr.fans); const cost = pay(P.pr.cost);
    addNews(state, 'result', `🧯 Krisen-PR wegen ${c.name}`, `${rng.pick(def?.scandal ?? [''])} Eine PR-Agentur soll den Imageschaden begrenzen – das kostet ${cost} ★ (Fans −${P.pr.fans}).`);
    return { kind, cost };
  }
  if (kind === 'severe') {
    const loss = rng.int(...P.severe.fans), gone = drop(Math.min(normal.length, rng.int(...P.severe.leave)));
    addFans(p, -loss); p.satisfaction = clamp((p.satisfaction ?? 50) - P.severe.sat, 0, 100); addRel(p, 'sponsors', -8); block(P.severe.block); const cost = pay(P.severe.cost);
    addNews(state, 'result', `🔥 Skandal um ${c.name}!`, `${rng.pick(def?.scandal ?? [''])} ${gone.join(' und ')} ${gone.length > 1 ? 'springen' : 'springt'} ab, die Presse schießt sich ein: Fans −${loss}, Zufriedenheit −${P.severe.sat}, Krisen-PR ${cost} ★. ${P.severe.block} Wochen lang kommen keine neuen Sponsor-Angebote.`);
    return { kind, loss, gone, cost };
  }
  if (kind === 'manager') {
    const rel = rng.int(...P.manager.rel); addFans(p, -P.manager.fans);
    if (managerOf(state)) { addRel(p, 'manager', -rel); if (p.rel.manager <= 0) fireManager(state); }
    addNews(state, 'result', `💼 Manager-Krach wegen ${c.name}`, `Dein Manager stellt dich zur Rede: „Das ruiniert alles, was wir aufgebaut haben.“ (Manager −${rel}, Fans −${P.manager.fans})`);
    return { kind, rel };
  }
  if (kind === 'mega') {
    const loss = rng.int(...P.mega.fans), gone = drop(Math.max(1, normal.filter(() => rng.chance(P.mega.leaveP)).length));
    addFans(p, -loss); p.satisfaction = clamp((p.satisfaction ?? 50) - P.mega.sat, 0, 100); addRel(p, 'sponsors', -15); block(P.mega.block); const cost = pay(P.mega.cost);
    addNews(state, 'result', `💣 Mega-Skandal um ${c.name}!`, `Ein Shitstorm rollt durch die Medien. ${gone.join(', ')} ${gone.length > 1 ? 'kündigen' : 'kündigt'} sofort. Fans −${loss}, Zufriedenheit −${P.mega.sat}, Krisen-PR ${cost} ★ – ${P.mega.block} Wochen lang kommen keine neuen Sponsor-Angebote.`);
    return { kind, loss, gone, cost };
  }
  addFans(p, -1); p.satisfaction = clamp((p.satisfaction ?? 50) - 1, 0, 100);
  addNews(state, 'info', `📣 Boykottaufruf gegen ${c.name}`, 'Ein paar Fans rufen im Netz zum Boykott auf – es bleibt bei Wirbel (Fans −1, Zufriedenheit −1).');
  return { kind: 'minor' };
}
// Verhandlung (Darts-Flight 1–10): Höher/Niedriger, max. 5×. Richtig → alle Prämien +8 %; jeder Versuch kostet etwas
// Sponsor-Zufriedenheit; falsch → Verhandlung vorbei, nur noch das Anfangsangebot, der Sponsor startet genervt.
export const NEGO_MAX = 5, NEGO_STEP = 0.08;
export function negotiate(state, guess, rng) {
  const o = sp(state).offer;
  if (!o || o.done) throw new Error('Kein offenes Angebot');
  const prev = Math.min(10, o.card);
  let next = rng.int(1, 10);
  while (next === prev) next = rng.int(1, 10);
  const ok = guess === 'higher' ? next > prev : next < prev;
  o.card = next; o.steps = (o.steps ?? 0) + 1; o.mood = (o.mood ?? 0) - 1;
  if (ok) { o.bonus = Math.round((o.bonus + NEGO_STEP) * 100) / 100; if (o.steps >= NEGO_MAX) o.done = true; }
  else { o.bonus = 0; o.annoyed = true; o.done = true; }
  return { ok, prev, next, perWeek: offerValue(o), done: o.done };
}
const scaled = (v, o) => (v ? Math.max(1, Math.round(v * (1 + (o.bonus ?? 0)))) : 0);
export const offerValue = o => scaled(o.perWeek, o);
export const offerTerms = o => ({ perWeek: scaled(o.perWeek, o), win: scaled(o.win, o), s180: scaled(o.s180, o), major: scaled(o.major, o) });
// Was passiert beim Unterschreiben? 'branche' = ersetzt den laufenden Vertrag derselben Branche, 'full' = schon 5 Sponsoren → einen kündigen
export function offerConflict(state, o = sp(state).offer) {
  const normal = normalContracts(state), same = normal.find(c => c.branche === o.branche);
  if (same) return { kind: 'branche', drop: same.name };
  return normal.length >= SPONSOR_MAX ? { kind: 'full', drop: null } : null;
}
// Vertrag kündigen (jederzeit, kostenlos)
export function cancelSponsor(state, name, news = true) {
  const s = sp(state), c = s.active.find(x => x.name === name);
  if (!c) throw new Error('Diesen Vertrag gibt es nicht');
  s.active = s.active.filter(x => x !== c);
  if (news) addNews(state, 'info', `🤝 Vertrag mit ${c.name} gekündigt`, `${brancheOf(c).label} – Platz für neue Angebote.`);
  return c;
}
// `cancel` = Name des Vertrags, der für einen Neuen gekündigt wird (nötig, wenn schon 5 Sponsoren laufen)
export function acceptOffer(state, cancel = null) {
  const s = sp(state), o = s.offer, p = state.player;
  if (!o) throw new Error('Kein offenes Angebot');
  const t = offerTerms(o), conflict = offerConflict(state, o);
  if (conflict?.kind === 'branche') cancelSponsor(state, conflict.drop, false);                  // gleiche Branche: der alte Vertrag wird ersetzt
  else if (conflict?.kind === 'full') {
    if (!cancel) throw new Error(`Maximal ${SPONSOR_MAX} Sponsoren – kündige zuerst einen Vertrag.`);
    cancelSponsor(state, cancel);
  }
  s.active.push({ name: o.name, branche: o.branche, real: !!o.real, fame: o.fame ?? 0, ...t, weeksLeft: o.length });
  s.offer = null;
  p.rel.sponsors = clamp((p.rel.sponsors || 40) + (o.annoyed ? -8 : 5) + (o.mood ?? 0), 0, 100);
  addNews(state, 'info', `🤝 Unterschrieben: ${o.name}`, `${t.perWeek} ★ pro Woche für ${o.length} Wochen${t.win ? `, ${t.win} ★ je Sieg` : ''}${t.s180 ? `, ${t.s180} ★ je 180` : ''}${t.major ? `, ${t.major} ★ je Major-Teilnahme` : ''}.${o.annoyed ? ' Der Sponsor ist nach der Verhandlung leicht genervt.' : ''}`);
}
// Prämien nach jedem eigenen Match: Sieg, 180er, Major-Teilnahme (einmal je Turnier)
export function sponsorMatchPay(state, inst, won, stats) {
  let sum = 0;
  const firstMajor = inst.cat === 'major' && !inst.sponsorMajor;
  for (const c of sp(state).active) sum += (won ? c.win ?? 0 : 0) + (c.s180 ?? 0) * (stats.s180 ?? 0) + (firstMajor ? c.major ?? 0 : 0);
  if (firstMajor) inst.sponsorMajor = true;
  if (sum) { state.stars = (state.stars ?? 0) + sum; inst.sponsorPay = (inst.sponsorPay ?? 0) + sum; }
  return sum;
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

// ---------- Interviews (Version 64) ----------
// Nach großen Ergebnissen (Titel; Finale/Halbfinale außerhalb der Pro Tour) und immer vor der WM mit Elmar Paulke (3–5 Fragen).
// Jede Antwort hat einen Ton; die Wirkung hängt von der Lage ab (Ergebnis bzw. Form, Status), von der Stimmung der Medien
// (−1/0/+1, nur in der Einleitung angedeutet) und etwas Zufall – es gibt keine immer richtige Antwort, fast jede hat Plus und Minus.
// Die Antworten erscheinen gemischt. Vor der WM wirken die Antworten zusätzlich auf die Nervosität bei der WM (`player.wmMind`).
const IV_SETS = { result: RESULT_QS, in: PAULKE_IN, out: PAULKE_OUT };
export const IV_KEYS = ['fans', 'star', 'manager', 'sponsors', 'partner', 'mom', 'nerves', 'sat', 'energy'];
// Aktuelle (oder k-te) Frage mit Antworten in Anzeige-Reihenfolge
export function ivQuestion(iv, k = iv.answers.length) {
  const q = iv.qs[k], src = q && IV_SETS[q.set]?.[q.i];
  return src ? { q: src.q, a: q.perm.map(j => src.a[j]) } : null;
}
export const ivIntro = iv => MOOD_INTRO[iv.kind === 'paulke' ? 'paulke' : 'result'][String(iv.mood ?? 0)];
function newInterview(state, rng, { kind, set, n, event, place, backed, extra = {} }) {
  const pool = IV_SETS[set], idx = rng.shuffle(pool.map((_, i) => i)).slice(0, n);
  state.interview = {
    v: 2, kind, event, place, backed, mood: rng.pick([-1, 0, 0, 1]), answers: [], ...extra,
    qs: idx.map(i => ({ set, i, perm: rng.shuffle(pool[i].a.map((_, j) => j)) })),
  };
  return state.interview;
}
export function maybeInterviewNsd(state, inst, rng) {
  const big = inst.cat !== 'pc' && inst.cat !== 'etq' && inst.cat !== 'dev' && (inst.cat !== 'wos' || inst.fmt === 'wwm');   // Dev Tour/Women's Series: nur nach Titeln
  if (inst.isQualifier || !(inst.place === 'W' || (big && ['F', 'SF'].includes(inst.place)))) return null;
  return newInterview(state, rng, { kind: 'result', set: 'result', n: 3, event: inst.name, place: inst.place, backed: ['W', 'F'].includes(inst.place) });
}
// Vor jeder WM (einmal je Jahr): Elmar Paulke. Qualifiziert → WM-Fragen (wirken auf die WM-Nervosität), sonst Saison-Rückblick.
export function preWmInterview(state, rng, qualified) {
  const y = state.date.year, f = ((state.flags ??= {}).paulke ??= {});
  if (f[y] || state.ended) return null;
  f[y] = true;
  const p = state.player, titles = (state.results ?? []).filter(r => r.year === y && r.place === 'W').length;
  const backed = (p.momentum ?? 0) >= 3 || (rankOf(state, 'pdc', 'P') ?? 999) <= 16 || titles > 0;
  return newInterview(state, rng, { kind: 'paulke', set: qualified ? 'in' : 'out', n: rng.int(3, 5), event: `Weltmeisterschaft ${y}`,
    place: qualified ? 'WM' : 'NQ', backed, extra: { year: y, qualified: !!qualified } });
}
// Wirkung eines Tons in der aktuellen Lage → { e: {fans, star, …}, ok }
export function toneEffect(tone, { mood = 0, backed = false, level = 1 }, rng) {
  const e = Object.fromEntries(IV_KEYS.map(k => [k, 0])), top = level >= 30, rookie = level <= 10;
  let ok = true;
  switch (tone) {
    // Achse Karriere ↔ Privatleben (Version 65): was den Manager freut (Fokus, Ehrgeiz, Professionalität), ärgert oft die Freundin – und umgekehrt
    case 'humble': Object.assign(e, { fans: rookie ? 2 : 1, star: rookie ? 3 : top ? 0 : 2, sponsors: level >= 20 ? -1 : 0, nerves: -0.3, mom: backed ? -1 : -0.5, partner: 1 }); ok = !top; break;   // kleinmachen kostet Selbstvertrauen
    case 'confident': Object.assign(e, { star: backed ? 5 : 2, fans: mood < 0 ? 0 : 1, manager: 1, partner: -1, mom: 0.5, nerves: 0.2 }); ok = backed; break;
    case 'cocky': ok = rng.chance(clamp(0.2 + (backed ? 0.3 : 0) + 0.15 * mood + (top ? 0.1 : 0), 0.05, 0.85));
      Object.assign(e, ok ? { fans: 3, star: 7, sponsors: 2, manager: 1, partner: -1, mom: 1, nerves: 0.5, sat: -1 } : { fans: -3, star: -2, manager: -2, partner: -1, sponsors: -2, mom: -1, nerves: 0.8 }); break;
    case 'funny': Object.assign(e, mood > 0 ? { fans: 3, star: 2, sat: 2, nerves: -0.4, partner: 1 } : mood === 0 ? { fans: 1, star: 1, sat: 1, nerves: -0.3, partner: 1 } : { fans: -1, nerves: -0.2 }); ok = mood >= 0;
      e.manager = -1;                                                    // Manager findet es unseriös
      if (level >= 20) e.sponsors -= 1;                                  // Sponsoren wollen Seriosität
      break;
    case 'honest': Object.assign(e, { fans: mood < 0 ? 3 : mood > 0 ? 1 : 2, star: 2, manager: -2, partner: 1, sponsors: -1, mom: -0.5, nerves: -0.2 }); break;
    case 'evasive': Object.assign(e, { fans: mood < 0 ? -2 : -1, manager: 1, sponsors: 1, partner: -1, nerves: -0.1, sat: 1 }); ok = mood >= 0; break;
    case 'emotional': Object.assign(e, { fans: mood < 0 ? 1 : 2, star: top ? 0 : 1, sat: 3, partner: 3, manager: -1, nerves: -0.2, mom: -0.5, sponsors: mood < 0 ? -1 : 0 }); ok = mood >= 0; break;   // weich: weniger Killerinstinkt
    case 'fiery': Object.assign(e, { star: backed ? 5 : 2, fans: mood >= 0 ? 2 : -2, mom: 1.5, nerves: 0.6, manager: 1, partner: -1, sponsors: backed ? 1 : 0, sat: -1 }); ok = mood >= 0; break;
  }
  if (e.star && rng.chance(0.5)) e.star += rng.pick([-1, 1]);       // etwas Zufall
  return { e, ok };
}
const IV_REACT = {
  humble: [['Bescheiden – für einen Star aber ziemlich langweilig.'], ['Sympathisch – die Leute mögen das.']],
  confident: [['Selbstbewusst – mal sehen, ob Taten folgen.'], ['Klare Worte, gedeckt durch die Ergebnisse.']],
  cocky: [['Das kam arrogant rüber – Buhrufe in den sozialen Medien.'], ['Die Presse liebt dein Selbstbewusstsein!']],
  funny: [['Der Witz zündet nicht – Thema verfehlt.'], ['Die Lacher sind auf deiner Seite!']],
  honest: [[''], ['Ehrlich und authentisch – dein Umfeld ist allerdings wenig begeistert.']],
  evasive: [['Nachgehakt – die Zuschauer finden das ausweichend.'], ['Eine Floskel – sicher, aber blass.']],
  emotional: [['Rührend – aber die Kritiker verdrehen die Augen.'], ['Ein emotionaler Moment – das kommt an.']],
  fiery: [['Die Kampfansage kommt schlecht an – viel Gegenwind.'], ['Eine Kampfansage! Die Fans feiern es.']],
};
// Wirkungen anwenden; Rückgabe: tatsächlich angewandte Werte (für die Anzeige)
function applyIvEffect(state, e, iv) {
  const p = state.player, out = {};
  if (e.fans) { addFans(p, e.fans); out.fans = e.fans; }
  if (e.manager && managerOf(state)) { addRel(p, 'manager', e.manager); out.manager = e.manager; if (p.rel.manager <= 0) fireManager(state); }
  if (e.sponsors && (p.rel.sponsors ?? 0) > 0) { addRel(p, 'sponsors', e.sponsors); out.sponsors = e.sponsors; }
  if (e.partner && p.partnerName && (p.rel.partner ?? 0) > 0) { addRel(p, 'partner', e.partner); out.partner = e.partner; }
  else if (e.partner) e.sat = (e.sat ?? 0) + Math.sign(e.partner) * Math.ceil(Math.abs(e.partner) / 2);   // ohne Freundin: Privatleben → Zufriedenheit
  if (e.mom) { p.momentum = clamp(Math.round(((p.momentum ?? 0) + e.mom) * 10) / 10, -10, 10); out.mom = e.mom; }
  if (e.sat) { p.satisfaction = clamp((p.satisfaction ?? 50) + e.sat, 0, 100); out.sat = e.sat; }
  if (e.energy) { addEnergy(p, e.energy); out.energy = e.energy; }
  if (e.nerves && iv.kind === 'paulke' && iv.qualified) {
    const before = p.wmMind?.year === iv.year ? p.wmMind.nerves : 0;
    p.wmMind = { year: iv.year, nerves: clamp(Math.round((before + e.nerves) * 100) / 100, -1.5, 2) };
    out.nerves = e.nerves;
  }
  if (e.star) out.star = e.star;
  return out;
}
// Ältere Spielstände: offenes Interview im alten Format neu aufsetzen
function currentInterview(state, rng) {
  const iv = state.interview;
  if (iv && iv.v !== 2) return newInterview(state, rng, { kind: 'result', set: 'result', n: 3, event: iv.event, place: iv.place, backed: ['W', 'F'].includes(iv.place) });
  return iv;
}
export const interviewView = (state, rng) => currentInterview(state, rng);
// idx = Position der Antwort in der Anzeige. Rückgabe: { fx, txt, done }
export function answerInterview(state, idx, rng) {
  const iv = currentInterview(state, rng), p = state.player;
  if (!iv) throw new Error('Kein Interview');
  if (iv.answers.length >= iv.qs.length) throw new Error('Das Interview ist schon vorbei');
  const ans = ivQuestion(iv)?.a[idx];
  if (!ans) throw new Error('Unbekannte Antwort');
  const { e, ok } = toneEffect(ans.tone, { mood: iv.mood, backed: iv.backed, level: p.star.level }, rng);
  for (const [k, v] of Object.entries(ans.fx ?? {})) e[k] = (e[k] ?? 0) + v;
  // Version 94: immer ganze Zahlen (WM-Nervosität intern in Zehnteln, angezeigt ×10)
  for (const k of Object.keys(e)) { e[k] = k === 'nerves' ? Math.round(e[k] * 10) / 10 : Math.sign(e[k]) * Math.round(Math.abs(e[k])); if (!e[k]) delete e[k]; }   // ±0,5 → ±1
  const fx = applyIvEffect(state, e, iv), txt = IV_REACT[ans.tone][ok ? 1 : 0][0] || IV_REACT[ans.tone][1][0];
  iv.answers.push({ tone: ans.tone, fx, txt });
  const done = iv.answers.length >= iv.qs.length;
  if (done) {
    const total = iv.answers.reduce((a, x) => a + (x.fx.star ?? 0), 0);
    addStarProgress(state, Math.round(total * (1 + 0.01 * (p.star.level - 1))));
    iv.total = total;
    iv.sum = Object.fromEntries(IV_KEYS.map(k => [k, Math.round(iv.answers.reduce((a, x) => a + (x.fx[k] ?? 0), 0) * 10) / 10]).filter(([, v]) => v));   // nerves in Zehnteln, Rest ganzzahlig
    (state.flags ??= {}).interview = true;
    if (iv.kind === 'paulke') addNews(state, 'info', '🎤 Interview mit Elmar Paulke',
      iv.qualified ? `Vor der Weltmeisterschaft ${iv.year}: ${p.wmMind?.year === iv.year && p.wmMind.nerves > 0 ? 'Du hast dir selbst Druck gemacht – die Erwartungen sind gestiegen.' : 'Du gehst mit ruhigem Kopf ins Turnier.'}`
        : `Rückblick auf die Saison ${iv.year} – die WM findet ohne dich statt.`);
  }
  return { fx, txt, done };
}

// ---------- Wöchentlich (Tour-Modus) ----------
export function careerWeek(state, rng) {
  const p = state.player, out = { fee: 0, sponsor: 0 };
  const t = p.fitness;
  if (t && (!t.until || weekIndex(state) > t.until)) {           // Paket abgelaufen
    fireTrainer(state);
    addNews(state, 'info', `🏃 ${t.name ?? 'Fitnesstrainer'}: Vertrag ausgelaufen`, 'Im Team-Screen gibt es neue Angebote.');
  }
  const before = team(state).offersUntil;
  trainerOffers(state, rng);
  if (before && team(state).offersUntil !== before) addNews(state, 'info', '🏃 Neue Fitnesstrainer verfügbar', 'Drei neue Angebote im Team-Screen – Preise, Dauer und Erholung sind neu.');
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
      state.stars = (state.stars ?? 0) + r; addStarProgress(state, 30); addFans(p, 3);
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
