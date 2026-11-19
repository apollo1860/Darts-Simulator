// Turniere: Berechtigung, Meldung, Feld/Auslosung, Runden, Platzierungen, Preisgeld/OOM,
// Mehrfach-Events (z. B. CT-Wochenende mit 5 Turnieren, 4 Q-School-Tage) und KI-Hintergrund-Turniere (DOM-frei)
import { CATEGORIES, FORMATS, QSCHOOL_UK_NATIONS, ET_REGIONS } from '../data/tournaments.js';
import { PRIZES } from '../data/prizemoney.js';
import { RNG, hashSeed } from './rng.js';
import { simulateMatch } from './matchEngine.js';
import { createMatch, throwDart, matchResult, wouldWinMatch, isDecider, inExtension, needsIn } from './matchState.js';
import { BOGEY, scoreAt, targetPoint, checkoutRoute } from './board.js';
import { angleOf, angleEfficiency, blockage, BOUNCE_P, BOUNCER, bounceChance, robinChance, ROBIN, flightRobin, deflect } from './obstruction.js';
import { dartBounce } from '../data/gear.js';
import { aiDart, aiSigma, circleParams } from './throwModel.js';
import { eventCost, canAfford, book, ENTRY_FEE, levelPrice, ETQ_NIGHT } from './finance.js';
import { getPlayer, playersOfTier, nonCardPros, addAmateurs, DEV_MAX_AGE, secondaryOrder, womenOf } from './world.js';
import { SEC_QSCHOOL } from '../data/secondary.js';
import { addXp, addClutch, expLabel, perf, XP_FACTOR, XP_BASE, pointsGained } from './player.js';
import { addNews } from './news.js';
import { seasonStats } from './state.js';
import { findEvent, eventsInWeek, nsdBlocked } from './calendar.js';
import { buildRounds, pairWinners, placeOf, buildGroupRounds, groupKoMatches, groupPlace, buildPrelimRounds, prelimKoMatches, buildUkOpenRounds, ukOpenMatches } from './bracket.js';
import { mastersPrelimField, MAJOR_CATS, majorField, majorEligibility, autoPlayer, wcTeams, wcWithdraw, scorePlNight, plTable, plState, qualOf, teamPrizeShare, wmTchqSlots, wmDirect, gsQualSlots } from './majors.js';
import { addMoney, settleOom, orderOfMerit, rankOf, devHolders } from './rankings.js';
import { fmtEUR } from './util.js';
import { routeTarget, scriptedHit } from './decisions.js';
import { trackTitle, recordChampion, recordPlaces } from './history.js';
import { addRivalToField, isRival, rivalMeeting, rivalTitle, rivalCard } from './rival.js';
import { applyInjury, injuryAim } from './injury.js';
import { canSelfPlay, skillEffective, starPrizeTable, starPayout, matchEnergy, energyMalus, energyKind, nervesOf, nerveShake, nerveSpeed, addEnergy, starMatchDelta, addStarProgress, titleStarBonus, STAR_TITLE, STAR_WEIGHT, PL_LEAGUE_PAY,
  matchRating, addRel, addFans, fansAfterMatch, titleFans, isFloor, starPrice } from './nsd.js';
import { overall, attrsForAverage, ratingForAvgExact, targetAverage } from './player.js';
import { checkAchievements, VAC_REGEN, VAC_REGEN_WEEKS } from './life.js';
import { managerCut, maybeInterviewNsd, managerOf, sponsorMatchPay } from './career.js';
import { useBoosts, flightPrice } from './skilltrain.js';
import { titleArticle, finalArticle, wmTicketArticle, nineArticle } from './articles.js';
import { stageFactor, applyStage, updateMomentum, titleMomentum, applyNerves, nervesFor, PRO_CATS, proMatchesOf } from './form.js';

export const IMPLEMENTED_PHASE = 5;
export const AI_CATS = ['qschool', 'challenge', 'dev', 'wos', 'pc', 'etq', 'mastersq', 'hnq', 'et', 'major', 'ws', 'pl', 'wdf', 'wmqs', 'wmreg'];   // laufen ohne Spieler im Hintergrund

// Inhaltliche Berechtigung
export function eligibility(state, ev) {
  const p = state.player, y = state.date.year;
  const card = p.tour === 'tour';
  if (nsdBlocked(state, ev)) return { ok: false, reason: 'Nicht im Tour-Modus' };
  switch (ev.cat) {
    case 'local': return { ok: true };
    case 'ddv': case 'wdf': return card ? { ok: false, reason: 'Nur ohne Tourcard' } : { ok: true };
    case 'wmqs':
      if (card) return { ok: false, reason: 'Nur ohne Tourcard' };
      return p.qschoolYear === y ? { ok: true } : { ok: false, reason: 'Nur für Q-School-Teilnehmer' };
    case 'hnq':
      if (card) return { ok: false, reason: 'Nur ohne Tourcard' };
      return p.nation === ev.country ? { ok: true } : { ok: false, reason: `Nur Spieler aus ${ev.country}` };
    case 'qschool': return card ? { ok: false, reason: 'Nur ohne Tourcard' } : { ok: true };
    case 'wmreg':
      if (ev.women) return { ok: false, reason: 'Nur für Spielerinnen' };
      if (card) return { ok: false, reason: 'Nur ohne Tourcard' };
      return ev.nations.includes(p.nation) ? { ok: true } : { ok: false, reason: `Nur Spieler aus ${ev.nations.join('/')}` };
    case 'challenge':
      if (card) return { ok: false, reason: 'Tourcard-Holder sind ausgeschlossen' };
      return p.qschoolYear === y ? { ok: true } : { ok: false, reason: 'Q-School-Teilnahme nötig' };
    case 'dev':
      if (p.age > DEV_MAX_AGE) return { ok: false, reason: 'Nur bis 23 Jahre' };
      if (ev.id === 'youth-wm') return { ok: true };       // Version 94: Youth-WM – alle U24, auch Tourcard-Holder in den Top 64
      if (card) return devHolders(state, y).includes(p) ? { ok: true } : { ok: false, reason: 'Holder nur außerhalb der PDC-Top-64' };
      return { ok: true };                                 // Dev Tour: offen für alle bis 23, keine Q-School nötig
    case 'wos': {                                        // Version 101: Women's Series nur für Spielerinnen; Matchplay = Top 8 der Rangliste
      if (!p.woman) return { ok: false, reason: 'Nur für Spielerinnen' };
      if (ev.fmt !== 'wwm' && (rankOf(state, 'pdc', 'P') ?? 999) <= 64) return { ok: false, reason: 'Nur außerhalb der PDC-Top-64' };   // Version 102
      if (ev.fmt === 'wwm') return secondaryOrder(state, 'women', undefined, { tour: true }).slice(0, 8).includes('P') ? { ok: true } : { ok: false, reason: "Nur Top 8 der Women's Series" };
      return { ok: true };
    }
    case 'pc': return card ? { ok: true } : { ok: false, reason: 'Tourcard nötig' };
    case 'et': return etQualified(state, ev) ? { ok: true } : { ok: false, reason: card ? 'Nicht qualifiziert (TCHQ verpasst?)' : 'Tourcard oder Host-Nation-Qualifier nötig' };
    case 'mastersq': {                                   // Winmau World Masters – Vorrunde: Holder außerhalb der Top 24 + Top 8 der Touren (Vorjahr)
      const r = rankOf(state, 'pdc', 'P');
      if (card && r && r <= 24) return { ok: false, reason: 'Direkt im Hauptfeld (Top 24)' };
      const f = mastersPrelimField(state, true);
      return f.seeds.includes('P') || f.pool.includes('P') ? { ok: true } : { ok: false, reason: card ? 'Nicht startberechtigt' : 'Tourcard oder Top 8 einer Tour (Vorjahr) nötig' };
    }
    case 'etq':
      if (!card) return { ok: false, reason: 'Tourcard nötig' };
      return etDirect(state).includes('P') ? { ok: false, reason: 'Schon direkt qualifiziert' } : { ok: true };
    default: return MAJOR_CATS.includes(ev.cat) ? majorEligibility(state, ev) : { ok: false, reason: 'Qualifikation nötig' };
  }
}

// Version 217: Majors, World Series, Premier League und Qualifier, über die man in ein Major kommt (Masters-Vorrunde, WM-Qualifier)
export const majorPath = ev => MAJOR_CATS.includes(ev.cat) || ['mastersq', 'wmqs', 'wmreg'].includes(ev.cat);
// Gesamtstatus für die UI
export function eventStatus(state, ev, n = null) {
  let cost = eventCost(ev, ev.pick ? n ?? 1 : null, state.player.level ?? 1, 1);
  if (ev.cat === 'etq' && findEvent(state, state.week.eventId)?.cat === 'pc') {   // direkt nach dem PC-Block: nur eine Übernachtung extra
    const travel = Math.round(levelPrice(ETQ_NIGHT, state.player.level ?? 1) * 1 / 5) * 5;
    cost = { fee: 0, travel, total: travel, addOn: true };
  }
  if (state.mode === 'nsd') cost = { fee: 0, travel: 0, total: 0 };   // New Star Darts: keine Reisekosten
  const phase = CATEGORIES[ev.cat]?.phase ?? 9;
  const elig = eligibility(state, ev);
  let playable = true, reason = '';
  if (state.week.blocked) { playable = false; reason = `Ausfall: ${state.week.blocked.label}`; }
  else if (state.week.accident && !majorPath(ev)) { playable = false; reason = 'Ausfall: Unfallfolgen'; }
  else if (state.week.vacation) { playable = false; reason = 'Du bist im Urlaub'; }   // Version 241   // Version 217: Unfall – nur Majors (und ihre Qualifier) spielbar
  else if (ev.startsThisWeek === false) { playable = false; reason = 'Läuft bereits'; }
  else if (ev.extra ? state.week.extras?.includes(ev.id) : state.week.played) {
    playable = false; reason = state.week.eventId === ev.id || ev.extra ? 'Gespielt' : 'Diese Woche schon gespielt';
  }
  else if (!elig.ok) { playable = false; reason = elig.reason; }
  else if (phase > IMPLEMENTED_PHASE) { playable = false; reason = `Ab Phase ${phase} spielbar`; }
  else if (!canAfford(state, cost.total)) { playable = false; reason = 'Budget reicht nicht'; }
  return { playable, reason, cost, eligible: elig.ok };
}

const PLACE_LABEL = {
  W: 'Sieger', F: 'Finale', SF: 'Halbfinale', QF: 'Viertelfinale', L16: 'Achtelfinale', L32: 'Letzte 32',
  L64: 'Letzte 64', L96: 'Letzte 96', L128: 'Letzte 128', L160: 'Letzte 160', L256: 'Letzte 256', CARD: 'Tourcard gewonnen',
  QUAL: 'Qualifiziert', NQ: 'Nicht qualifiziert', G2: 'Gruppenphase (2.)', G3: 'Gruppenphase (3.)', G4: 'Gruppenphase (4.)',
  P5: 'Premier League: 5. Platz', P6: 'Premier League: 6. Platz', P7: 'Premier League: 7. Platz', P8: 'Premier League: 8. Platz',
};
const UK_LABEL = { L96: 'Runde 3', L128: 'Runde 2', L160: 'Runde 1' };
// ET: 1. Runde = Letzte 48; UK Open: Runde 1–3 (evId = Event-ID)
export const placeLabel = (k, cat, evId) => (k === 'L64' && cat === 'et' ? 'Letzte 48' : evId === 'uk-open' && UK_LABEL[k]) || PLACE_LABEL[k] || k;

const fmtKey = (ev, sub = 0) => ev.subFmts?.[sub] ?? ev.fmt ?? ev.cat;
// Ranglisten, in die das Preisgeld fließt
const oomTypes = (ev, sub) => {
  if (ev.cat === 'ws' && ev.fmt === 'ws') return ['ws'];                // World-Series-Wertung (für die Finals)
  if (ev.noOom || FORMATS[fmtKey(ev, sub)].stopAt > 1) return [];
  if (ev.cat === 'major') return ['pdc'];
  if (ev.cat === 'et') return ['pdc', 'protour', 'eto'];
  if (ev.cat === 'challenge' || ev.cat === 'dev') return [ev.cat];
  if (ev.cat === 'wos') return ['wos'];                                  // Women's Series (Women's World Matchplay: noOom)
  if (ev.cat === 'pc') return ['pdc', 'protour', 'pco'];
  return [];
};
const subLabel = (ev, sub) => (ev.subs?.[sub] ?? (ev.count > 1 ? (ev.cat === 'qschool' ? `Tag ${sub + 1}` : `Turnier ${sub + 1}`) : ''));
const subName = (ev, sub) => {
  if (ev.subs) return sub === 0 ? `${ev.name} · ${ev.subs[0]}` : ev.name;
  if (ev.count > 1 && ev.cat !== 'qschool') {
    const m = ev.name.match(/^(.*?)(\d+)(?: & |–)(\d+)$/);
    if (m) return `${m[1]}${+m[2] + sub}`;
  }
  return ev.count > 1 ? `${ev.name} · ${subLabel(ev, sub)}` : ev.name;
};

function prizeTable(ev, sub = 0) {
  if (ev.cat === 'local') {
    const W = ev.prizeWin, s = PRIZES.local.shares;
    return { W, F: Math.round(W * s.F / 5) * 5, SF: Math.round(W * s.SF / 5) * 5 };
  }
  if (ev.cat === 'wdf') return { W: ev.prizeWin ?? 1000, ...PRIZES.wdf };   // Sieg aus dem Kalender (calendar.wdfPrize)
  return PRIZES[fmtKey(ev, sub)] ?? {};
}

// ---- Teilnehmerfeld (Setzliste: Bester zuerst) ----
// European Tour (48): Top 16 PDC (gesetzt) + Top 16 Pro Tour (ohne die Gesetzten) + 10 TCHQ + 4 HNQ + Nordic & Baltic + Osteuropa.
// Fehlende Qualifikanten werden über die Pro-Tour-Rangliste aufgefüllt. Ergebnisse der Qualifier: qual[year].et[etId].
const isHolder = (state, id) => (id === 'P' ? state.player.tour === 'tour' : getPlayer(state, id)?.tier === 'tour');
export const etStore = (state, etId) => ((qualOf(state).et ??= {})[etId] ??= {});
// Absagen: ein paar direkt Qualifizierte sagen je Event ab (fest je Event/Jahr/Spieler); der Spieler selbst nie. Nachrücker über die Ranglisten.
export const ET_WITHDRAW = 0.06;
export const etWithdrawn = (state, ev, id) => id !== 'P' && new RNG({ s: hashSeed(`${ev.id}|${state.date.year}|wd|${id}`) }).chance(ET_WITHDRAW);
export function etSeeds(state, includeP, ev = null) {
  return orderOfMerit(state, 'pdc').map(x => x.p.id).filter(id => (includeP || id !== 'P') && isHolder(state, id) && !(ev && etWithdrawn(state, ev, id))).slice(0, FORMATS.et.seeds);
}
// Direkt qualifiziert (Top 16 PDC + Top 16 Pro Tour) – diese spielen keinen TCHQ
export function etDirect(state) {
  const seeds = etSeeds(state, true);
  const pt = orderOfMerit(state, 'protour').map(x => x.p.id).filter(id => isHolder(state, id) && !seeds.includes(id)).slice(0, 16);
  return [...seeds, ...pt];
}
// Regionaler Qualifier (Hintergrund): Spieler ohne Karte der Region, Stärkere gewinnen öfter (fest je Event/Jahr)
export const REGION_MIN = 8;
export function regionQualifier(state, ev, key) {
  // Version 140: Spieler des Gastgeberlands gehören in den Host Nation Qualifier (z. B. Tschechen beim Czech Darts Open)
  const nations = ET_REGIONS[key].nations.filter(n => n !== ev.country);
  const cands = () => [...nonCardPros(state), ...playersOfTier(state, 'secondary', 'amateur')].filter(p => !p.woman && nations.includes(p.nation));
  let all = cands();
  for (let i = 0; all.length < REGION_MIN; i++) { addAmateurs(state, nations[i % nations.length], 1); all = cands(); }   // fiktive Amateure
  const pool = all.sort((a, b) => b.avg - a.avg).slice(0, 8);
  const rng = new RNG({ s: hashSeed(`${ev.id}|${key}|${state.date.year}`) }), w = pool.map(p => Math.max(1, p.avg - 55) ** 2);
  let r = rng.float(0, w.reduce((a, b) => a + b, 0));
  return pool.find((p, i) => (r -= w[i]) <= 0)?.id ?? pool[0].id;
}
export function etEntrants(state, ev, withPlayer) {
  const st = etStore(state, ev.id), ok = id => !!id && (id !== 'P' || withPlayer);
  const seeds = etSeeds(state, withPlayer, ev), taken = new Set(seeds);
  const take = (ids, n) => {
    const out = [];
    for (const id of ids) { if (out.length >= n) break; if (ok(id) && !taken.has(id)) { taken.add(id); out.push(id); } }
    return out;
  };
  const ptOrder = orderOfMerit(state, 'protour').map(x => x.p.id).filter(id => isHolder(state, id) && !etWithdrawn(state, ev, id));
  const pt = take(ptOrder, 16), tchq = take(st.tchq ?? [], 10), hnq = take(st.hnq ?? [], 4);
  const region = take(Object.keys(ET_REGIONS).map(k => st[k] ?? regionQualifier(state, ev, k)), 2);
  const fill = take([...ptOrder, ...orderOfMerit(state, 'pdc').map(x => x.p.id).filter(id => isHolder(state, id) && !etWithdrawn(state, ev, id))], 48 - taken.size);
  return { seeds, pt, tchq, hnq, region, fill };
}
// HNQ-Pool: Spieler ohne Karte, DDV/lokal der Gastgebernation (HNQ-Sieger sind schon qualifiziert)
// Zu wenige Spieler der Nation → fiktive Amateure auffüllen (mind. HNQ_MIN Teilnehmer + bisherige Sieger)
export const HNQ_MIN = 32;
function hnqPool(state, ev) {
  const won = new Set(etStore(state, ev.etId).hnq ?? []);
  const all = () => [...nonCardPros(state), ...playersOfTier(state, 'ddv', 'local', 'amateur')].filter(p => p.nation === ev.country);
  let base = all();
  if (base.length < HNQ_MIN + 4) { addAmateurs(state, ev.country, HNQ_MIN + 4 - base.length); base = all(); }
  return base.filter(p => !won.has(p.id)).map(p => p.id);
}
// Hintergrund-Turnier überhaupt möglich? (z. B. kein HNQ ohne mind. 2 Spieler der Nation)
const aiRunnable = (state, ev) => ev.cat !== 'hnq' || hnqPool(state, ev).length >= 2;   // mit Amateuren praktisch immer
// Pool eines internationalen WM-Qualifiers; zu wenige Spieler → fiktive Amateure (Frauen-Qualifier: nur Spielerinnen)
function wmRegPool(state, ev) {
  const min = Math.max(16, ev.slots * 6);
  // UK & IRE: auch Tourcard-Holder außerhalb der PDC-Top-64 (Associate Members = Spieler ohne Karte)
  const top = ev.holders ? new Set([...orderOfMerit(state, 'pdc').slice(0, 40), ...orderOfMerit(state, 'protour').slice(0, 40)].map(x => x.p.id)) : null;
  const holders = ev.holders ? playersOfTier(state, 'tour').filter(p => !top.has(p.id)) : [];   // ohne (voraussichtlich) direkt Qualifizierte
  const q = qualOf(state), done = new Set([q.wmYouth, ...Object.values(q.wmReg ?? {}).flat()]);   // schon über einen anderen Qualifier dabei
  const cands = () => (ev.women ? playersOfTier(state, 'secondary', 'amateur').filter(p => p.woman)
    : [...holders, ...nonCardPros(state), ...playersOfTier(state, 'secondary', 'ddv', 'local', 'amateur')].filter(p => !p.woman && !done.has(p.id) && ev.nations.includes(p.nation)));
  let all = cands();
  for (let i = 0; all.length < min; i++) { addAmateurs(state, ev.nations[i % ev.nations.length], 1, ev.women); all = cands(); }
  return all.map(p => p.id);
}
export const etQualified = (state, ev) => Object.values(etEntrants(state, ev, true)).some(l => l.includes('P'));

function seededField(state, ev, withPlayer, rng, sub = 0, ctx = {}) {
  const y = state.date.year;
  if (MAJOR_CATS.includes(ev.cat)) return majorField(state, ev, withPlayer || !!ctx.auto);
  if (ev.cat === 'pc') {
    let ids = orderOfMerit(state, 'pdc').map(x => x.p.id).filter(id => (withPlayer || id !== 'P') && isHolder(state, id)).slice(0, FORMATS.pc.field);   // nur Holder (Version 199)
    if (withPlayer && !ids.includes('P')) ids[ids.length - 1] = 'P';
    return rng.shuffle(ids);                                  // PC: freie Auslosung
  }
  if (ev.cat === 'et') {
    const e = etEntrants(state, ev, withPlayer);
    return [...e.seeds, ...rng.shuffle([...e.pt, ...e.tchq, ...e.hnq, ...e.region, ...e.fill])];
  }
  if (ev.cat === 'etq') {                    // alle Holder ohne direktes Ticket, freie Auslosung
    const direct = new Set(etDirect(state));
    const ids = playersOfTier(state, 'tour').map(p => p.id).filter(id => !direct.has(id));
    return rng.shuffle(withPlayer ? ['P', ...ids] : ids);
  }
  if (ev.cat === 'local') {
    let pool = rng.shuffle(playersOfTier(state, 'local').map(p => p.id)).slice(0, FORMATS.local.field - (withPlayer ? 1 : 0));
    if (withPlayer) pool = addRivalToField(state, 'local', pool, rng);
    return rng.shuffle(withPlayer ? ['P', ...pool] : pool);
  }
  let ids;
  if (ev.cat === 'wmqs') {                   // alle Q-School-Teilnehmer ohne Karte (KI: Pool ohne Karte), keine Setzliste
    ids = rng.shuffle(nonCardPros(state).map(p => p.id));
    return rng.shuffle(withPlayer ? ['P', ...ids] : ids);
  }
  if (ev.cat === 'wmreg') {                  // Internationaler WM-Qualifier: Spieler ohne Karte der Region (+ fiktive Amateure)
    ids = rng.shuffle(wmRegPool(state, ev));
    return rng.shuffle(withPlayer ? ['P', ...ids] : ids);
  }
  if (ev.cat === 'hnq') {                    // Gastgebernation: Spieler ohne Karte, DDV/lokal – keine Setzliste
    const all = hnqPool(state, ev), pros = new Set(nonCardPros(state).map(p => p.id));   // Version 186: CT-/Dev-Spieler der Nation immer dabei, Rest (DDV/lokal) zufällig
    const pool = [...rng.shuffle(all.filter(id => pros.has(id))), ...rng.shuffle(all.filter(id => !pros.has(id)))];
    ids = pool.slice(0, FORMATS.hnq.field - (withPlayer ? 1 : 0));
    return rng.shuffle(withPlayer ? ['P', ...ids] : ids);
  }
  if (ev.cat === 'wos') {                    // Version 101: Women's Series = alle Spielerinnen (offene Auslosung); Matchplay = Top 8 der Rangliste, gesetzt
    if (ev.fmt === 'wwm') { const ord = secondaryOrder(state, 'women', undefined, { tour: true }); return (withPlayer ? ord : ord.filter(id => id !== 'P')).slice(0, 8); }
    const top64 = new Set(orderOfMerit(state, 'pdc').slice(0, 64).map(x => x.p.id));   // Version 102: Spielerinnen in den PDC-Top-64 spielen nicht mit
    const elig = womenOf(state).filter(p => !top64.has(p.id)), byTier = t => rng.shuffle(elig.filter(p => (p.tier === 'tour') === t).map(p => p.id));
    const pool = [...byTier(true), ...byTier(false)];   // Version 180: Tourcard-Spielerinnen (Beau Greaves) immer im Feld, Rest zufällig
    ids = pool.slice(0, (FORMATS.wos.field) - (withPlayer ? 1 : 0));
    return rng.shuffle(withPlayer ? ['P', ...ids] : ids);
  }
  if (ev.cat === 'wdf') {                    // offene Auslosung: Spieler ohne Karte + DDV-Pool, keine Setzliste
    const pool = rng.shuffle([...nonCardPros(state), ...playersOfTier(state, 'secondary').filter(p => !p.woman), ...playersOfTier(state, 'ddv')].map(p => p.id));   // alle ohne Tourcard (Version 99: + Nebentouren)
    ids = pool.slice(0, (ev.field ?? FORMATS.wdf.field) - (withPlayer ? 1 : 0));
    if (withPlayer) ids = addRivalToField(state, 'wdf', ids, rng);
    return rng.shuffle(withPlayer ? ['P', ...ids] : ids);
  }
  if (ev.cat === 'ddv') {
    ids = playersOfTier(state, 'ddv').map(p => p.id).slice(0, FORMATS.ddv.field - (withPlayer ? 1 : 0));
    if (withPlayer) ids = addRivalToField(state, 'ddv', ids, rng);
    return rng.shuffle(withPlayer ? ['P', ...ids] : ids);
  }
  if (ev.cat === 'qschool') {
    const uk = ev.id === 'qs-uk';
    ids = [...nonCardPros(state), ...playersOfTier(state, 'secondary').filter(p => SEC_QSCHOOL.includes(p.name))]   // Version 192/203: einzelne Nebentour-Spieler(innen) spielen die Q-School ihrer Region
      .filter(p => uk ? QSCHOOL_UK_NATIONS.includes(p.nation) : !QSCHOOL_UK_NATIONS.includes(p.nation)).map(p => p.id);
    return rng.shuffle(withPlayer ? ['P', ...ids] : ids);     // Q-School ohne Setzliste
  }
  const type = ev.cat === 'dev' ? 'dev' : 'challenge';
  const order = orderOfMerit(state, type, y).map(x => x.p.id);
  ids = order.filter(id => id !== 'P' || withPlayer);
  if (withPlayer && !ids.includes('P')) ids.push('P');
  return ids;
}

function newInstance(state, ev, sub, withPlayer, rng, ctx = {}) {
  const field = seededField(state, ev, withPlayer, rng, sub, ctx);
  const fk = fmtKey(ev, sub);
  const slots = ev.fmt === 'wmq' ? wmTchqSlots(state) : ev.fmt === 'gsq' ? gsQualSlots(state) : ev.slots;          // Qualifier mit n Plätzen → n Sektionen
  const fmt = slots > 1 ? { ...FORMATS[fk], stopAt: slots, sections: slots } : FORMATS[fk];
  let groups = null, rounds;
  let prelimSeeds = null, ukEntry = null, groupAdv = null;
  if (ev.prelim) {         // Winmau World Masters – Vorrunde: 32 Gruppen (jeder gegen jeden), Sieger → K.-o. gegen Platz 25–56
    const f = mastersPrelimField(state, withPlayer);
    groups = Array.from({ length: 32 }, () => []);
    rng.shuffle(f.pool).forEach((id, i) => groups[i % 32].push(id));
    groups = groups.filter(g => g.length);
    prelimSeeds = f.seeds;
    rounds = buildPrelimRounds(groups, fmt);
  } else if (ev.team) {          // World Cup: Top 4 direkt im Achtelfinale, 36 Teams in 12 Dreiergruppen (Töpfe nach Stärke), Gruppensieger weiter
    prelimSeeds = field.slice(0, 4);
    const rest = field.slice(4), pots = [0, 1, 2].map(k => rng.shuffle(rest.slice(k * 12, k * 12 + 12)));
    groups = Array.from({ length: 12 }, (_, g) => pots.map(p => p[g]).filter(Boolean)).filter(g => g.length);
    rounds = buildPrelimRounds(groups, fmt, 16, 'Gruppenphase · Spieltag');
  } else if (ev.groups) {        // Grand Slam (48 Spieler): 3 Töpfe à 16 → 16 Dreiergruppen, Version 94: nur Gruppensieger → direkt Achtelfinale
    const pots = [0, 1, 2].map(k => rng.shuffle(field.slice(k * 16, k * 16 + 16)));
    groups = Array.from({ length: 16 }, (_, g) => pots.map(p => p[g]).filter(Boolean));
    groupAdv = groups.length >= 16 ? 1 : 2;
    rounds = buildGroupRounds(groups, fmt, groupAdv);
  } else if (fk === 'ukopen') ({ rounds, entry: ukEntry } = buildUkOpenRounds(field, fmt, rng));   // gestaffelter Einstieg
  else rounds = buildRounds(field, fmt);
  return {
    ...(ev.fmt === 'wm' ? { seedIds: field.slice(0, 32) } : {}),   // Version 201: WM-Setzplätze (Anzeige im Turnierbaum)
    groups, groupAdv, prelimSeeds, ukEntry, teams: ev.team ? wcTeams(state) : null, autoPlayer: !!ctx.auto, plNight: ev.plNight ?? null,
    eventId: ev.id, cat: ev.cat, fmt: fk, name: subName(ev, sub), baseName: ev.name,
    city: ev.city, country: ev.country, year: state.date.year, week: state.date.week,
    count: ev.count ?? 1, sub, subLabel: subLabel(ev, sub), oom: oomTypes(ev, sub),
    isQualifier: !!ev.qualifier && sub === 0, cards: !!fmt.cards,
    prizes: state.mode === 'nsd' ? starPrizeTable(fk) : prizeTable(ev, sub), stopAt: fmt.stopAt ?? 1, fieldSize: field.length,
    preQual: ev.cat === 'et' ? (({ seeds, pt }) => [...seeds, ...pt])(etEntrants(state, ev, withPlayer)) : null,   // ET: über die Ranglisten vorqualifiziert
    big: withPlayer ? orderOfMerit(state, 'pdc').slice(0, 16).map(x => x.p.id).filter(id => id !== 'P') : [],
    ...(ev.cat === 'wdf' && withPlayer ? { xpBoost: Math.round(rng.float(1.2, 1.6) * 20) / 20 } : {}),
    rounds,
    current: 0, playerAlive: withPlayer, withPlayer, done: false, place: null, prize: 0, xp: 0,
    lastMatch: null, live: null, cardWon: false, hasNext: false, survivors: null,
  };
}

// Melden: Kosten buchen, Feld auslosen, Instanz anlegen
// Über den Host-Nation-Qualifier fürs ET-Hauptfeld qualifiziert?
export const hnqQualified = (state, ev) => (etStore(state, ev.id).hnq ?? []).includes('P') || (state.hnq?.etId === ev.id && state.hnq.year === state.date.year);

// opts.count: bei Blöcken mit Auswahl (CT/Dev/HNQ) Anzahl der selbst gespielten Turniere (Rest läuft im Hintergrund)
export function enterEvent(state, eventId, opts = {}) {
  const ev = findEvent(state, eventId);
  if (!ev) throw new Error('Event nicht gefunden');
  const n = ev.pick ? Math.max(1, Math.min(ev.count, opts.count ?? ev.count)) : null;
  const st = eventStatus(state, ev, n);
  if (!st.playable) throw new Error(st.reason);
  const rng = new RNG(state.rng);
  if (st.cost.fee) book(state, -st.cost.fee, `Anmeldegebühr ${ev.name}`, 'fee');
  if (st.cost.travel) book(state, -st.cost.travel, `Reise ${ev.city}`, 'travel');
  if (ev.cat === 'qschool') {
    state.player.qschoolYear = state.date.year;
    addNews(state, 'info', `Gemeldet: ${ev.name}`, `4 Turniertage – wer an einem Tag das Halbfinale erreicht, gewinnt eine Tourcard. Mit der Teilnahme bist du ${state.date.year} für die Challenge Tour berechtigt.`);
  }
  if (ev.extra) (state.week.extras ??= []).push(ev.id);
  else state.week = { ...state.week, played: true, eventId: ev.id, extras: state.week.extras ?? [], playCount: n };   // Trainingsflag bleibt
  state.activeEvent = newInstance(state, ev, 0, true, rng);
  skipPlayerByes(state);
  return state.activeEvent;
}

// Nächstes Turnier im Block (Tag 2, Turnier 2 …)
export function nextSub(state) {
  const inst = state.activeEvent;
  if (!inst?.done || !inst.hasNext) return null;
  const ev = findEvent(state, inst.eventId, inst.year, inst.week);
  state.activeEvent = newInstance(state, ev, inst.sub + 1, true, new RNG(state.rng), { qualifiers: inst.survivors });
  skipPlayerByes(state);
  return state.activeEvent;
}

// Nervosität im aktuellen eigenen Match (Anzeige im Liveticker)
export const nervesNow = state => {
  const inst = state.activeEvent, pm = inst && state.mode === 'nsd' ? playerMatch(inst) : null;
  return pm ? nervesOf(state.player, inst, pm.a === 'P' ? pm.b : pm.a) : { pts: 0, parts: [] };
};
export function playerMatch(inst) {
  return inst.rounds[inst.current]?.matches.find(m => (m.a === 'P' || m.b === 'P') && !m.bye) ?? null;
}

// Leistungsdaten; World Cup: Liste der beiden Teamspieler (der Bessere zuerst, sie wechseln sich je Aufnahme ab)
// Bühne (Majors, große Namen): Erfahrung zählt zusätzlich (form.js)
const soloAttrs = (state, id, inst, sf, opp) => withAngle(state, id, soloAttrs0(state, id, inst, sf, opp));
// Version 147: Lieblingsdoppel für Double-in je KI-Spieler fest – 75 % Tops (D20), 25 % D16
export const DIN_D16_SHARE = 0.25;
export const dinPrefOf = (state, id) => (new RNG({ s: hashSeed(`din|${id}|${state.seed ?? 0}`) }).chance(DIN_D16_SHARE) ? 16 : 20);
// Einsteckwinkel (obstruction.js): wirkt im dartgenauen Live-Modell über attrs.angle
const withAngle = (state, id, a) => {
  const angle = angleOf(state, id);
  if (id !== 'P') return { ...a, angle, dinPref: dinPrefOf(state, id) };
  const bounce = dartBounce(state.player.gear?.id);    // Version 135: Bouncer je Dart (Schnellsimulation: Grundchance kostet Punkte)
  return { ...a, angle, bounce, robin: flightRobin(flightPrice(state.player)), angleMult: angleEfficiency(angle) * (1 - bounce.base) };   // robin: Version 136 (Flight)   // angleMult: nur Schnellsimulation (KI-Mittel ist kalibriert)   // angleMult: nur Schnellsimulation (KI-Mittel ist kalibriert)
};
// Version 162: launische Spielerinnen (avgRange, z. B. Silvia Lindner 52–75) – je Match ein eigener Average aus der Spanne,
// fest je Turnier/Runde/Gegner (gleicher Wert bei jedem Aufruf im Live-Match)
export const rangeAttrs = (state, pl, inst, opp) => {
  const [lo, hi] = pl.avgRange ?? [pl.avg - pl.avgSpread, pl.avg + pl.avgSpread], r = new RNG({ s: hashSeed(`rng|${pl.id}|${state.seed ?? 0}|${inst?.eventId}|${inst?.year}|${inst?.sub ?? 0}|${inst?.current ?? 0}|${opp}`) });
  return { ...pl, attrs: attrsForAverage(Math.round(r.float(lo, hi) * 10) / 10, r) };
};
const soloAttrs0 = (state, id, inst, sf, opp) => {
  const pl0 = getPlayer(state, id), pl = (pl0?.avgRange || pl0?.avgSpread) && id !== 'P' ? rangeAttrs(state, pl0, inst, opp) : pl0;   // avgSpread: Version 184 (± um den aktuellen Ø)
  let staged = applyStage(perf(pl), sf);
  if (id !== 'P') return staged;
  if (state.mode === 'nsd') {                         // Energie unter 20 %: Leistung bricht ein (je Leg mehr)
    const nv = nervesOf(state.player, inst, opp).pts;   // Nervosität (Top-8-Gegner, Anfänger, Bühne), über Mental abbaubar
    if (nv) staged = applyNerves(staged, nv);
    staged = applyInjury(staged, state.player);          // Version 152: Verletzung
    const mal = energyMalus(state.player.energy ?? 100, inst?.live?.m?.legIdx ?? 0, energyKind(inst));
    const ce = Math.max(0, 0.07 - 0.0012 * skillEffective(state.player, 'cal'));   // Rechnen schwach → Bogey-Reste, falsche Doppel
    return mal ? { ...staged, ce, sco: staged.sco - mal, fin: staged.fin - mal, foc: staged.foc - mal } : { ...staged, ce };
  }
  return applyNerves(staged, nervesFor(inst, state.player));   // Lampenfieber (erste Pro-Tour-Zeit)
};
const attrsOf = (state, id, inst = state.activeEvent) => {
  const m = inst?.rounds?.[inst.current]?.matches.find(x => x.a === id || x.b === id);
  const sf = stageFactor(inst, m?.a, m?.b), t = inst?.teams?.[id];
  const opp = m ? (m.a === id ? m.b : m.a) : null;
  return t ? t.members.map(x => soloAttrs(state, x, inst, sf, opp)) : soloAttrs(state, id, inst, sf, opp);
};
// Live: wer wirft gerade für Seite `side`? (Doppel: Wechsel je Aufnahme, der Bessere beginnt jedes Leg)
const memberIdx = (lm, side, n) => (lm.legVisits?.[side]?.length ?? 0) % n;
export function liveThrower(state, side) {
  const inst = state.activeEvent, pm = playerMatch(inst), id = side === 0 ? pm.a : pm.b, t = inst.teams?.[id];
  return t ? t.members[memberIdx(inst.live.m, side, t.members.length)] : id;
}
const liveAttrs = (state, side) => {
  const inst = state.activeEvent, pm = playerMatch(inst), a = attrsOf(state, side === 0 ? pm.a : pm.b);
  return Array.isArray(a) ? a[memberIdx(inst.live.m, side, a.length)] : a;
};
// Version 191 (Nutzerwunsch): 1 ❤ Einsatz – deine simulierten Aufnahmen (nicht die Spielszenen) im Schnitt 5–10 Punkte schwächer
// (einmal je Match gewürfelt, `live.lowMalus`); gilt nur, solange 1 ❤ eingestellt ist
export const LOW_EFFORT_MALUS = [5, 10];
const simAttrs = (state, side) => {
  const live = state.activeEvent.live, a = liveAttrs(state, side);
  if (side !== live.me || effortOf(live) !== 1 || state.activeEvent.teams) return a;
  live.lowMalus ??= Math.round(new RNG(state.rng).float(...LOW_EFFORT_MALUS) * 10) / 10;
  return { ...a, sco: ratingForAvgExact(Math.max(30, targetAverage(a) - live.lowMalus)) };
};

// Eigenes Match simulieren (Ergebnis wird gespeichert und zurückgegeben)
export function simulatePlayerMatch(state) {
  const inst = state.activeEvent;
  const m = playerMatch(inst);
  if (!m || m.winner) return null;
  const rng = new RNG(state.rng);
  const fmt = inst.rounds[inst.current].format;
  const res = simulateMatch(attrsOf(state, m.a, inst), attrsOf(state, m.b, inst), fmt, rng);
  applyResult(m, res);
  recordPlayerMatch(state, inst, m, res);
  return res;
}

// ---- Manuelles Match (Phase 2) ----
// Live-Zustand liegt in inst.live (serialisierbar, wird mitgespeichert)
export function startManualMatch(state) {
  const inst = state.activeEvent, m = playerMatch(inst);
  if (!m || m.winner) return null;
  if (!inst.live) {
    const rng = new RNG(state.rng);
    const team = inst.teams ? [m.a, m.b].map(id => inst.teams[id]?.members.length ?? 1) : null;   // World Cup: Einzelstatistik je Mitglied
    inst.live = { m: createMatch(inst.rounds[inst.current].format, rng.chance(0.5) ? 0 : 1, team), me: m.a === 'P' ? 0 : 1 };
    if (inst.live.m.format.clear) inst.live.m.sdStarter = rng.chance(0.5) ? 0 : 1;   // Version 133: Anwurf im Sudden Death per Zufall
  }
  return inst.live;
}

// Ein KI-Dart im Live-Match (für den Gegner oder beim Simulieren)
export function liveAiDart(state, side) {
  return aiDart(state.activeEvent.live.m, side, simAttrs(state, side), new RNG(state.rng));
}

// Eine komplette Aufnahme per KI (Schnellsimulation zum Zuschauen). Rückgabe: letztes Ereignis
export function liveAiVisit(state) {
  const inst = state.activeEvent, lm = inst.live.m;
  const rng = new RNG(state.rng), side = lm.turn, a = simAttrs(state, side);
  const sig = aiSigma(a), mult = modMult(inst.live, side);
  let ev = null;
  const live = inst.live, mine = side === live.me;
  while (!lm.done && lm.turn === side && !(ev && ev.legEnd)) {
    const forced = mine ? routeTarget(live, lm.rem[side], lm.visit.darts.length) : null;
    const scripted = mine ? scriptedHit(live, lm.visit.start, lm.visit.darts.length) : null;
    const d = aiDart(lm, side, a, rng, sig, mult, forced);
    ev = throwDart(lm, scripted ?? d.hit, scripted ? null : d);
  }
  if (mine) live.route = null;
  tickMods(inst.live, side);
  return ev;
}

// XP-/Clutch-Faktor des Turniers; WDF: zufälliger Boost ×1,2–1,6 je Turnier (inst.xpBoost)
const xpFactor = inst => inst.xpBoost ?? XP_FACTOR[inst.cat] ?? 1;

// Ein einzelner Dart im Live-Match (für die Scheiben-Anzeige bei Gegner-Matchdarts)
export function liveDartStep(state) {
  const inst = state.activeEvent, live = inst.live, lm = live.m;
  const side = lm.turn, a = simAttrs(state, side), mine = side === live.me;
  const forced = mine ? routeTarget(live, lm.rem[side], lm.visit.darts.length) : null;
  const scripted = mine ? scriptedHit(live, lm.visit.start, lm.visit.darts.length) : null;
  const dart = aiDart(lm, side, a, new RNG(state.rng), aiSigma(a), modMult(live, side), forced);
  if (scripted) dart.hit = scripted;
  const ev = throwDart(lm, dart.hit, scripted ? null : dart);
  const visitOver = !!(lm.done || ev?.visitEnd || ev?.legEnd || lm.turn !== side);
  if (visitOver) { if (mine) live.route = null; tickMods(live, side); }
  return { ev, dart, side, visitOver };
}
// Gegner steht zu Beginn seiner Aufnahme auf einem Finish, das das Match beenden würde
export function oppMatchDartVisit(state) {
  const inst = state.activeEvent, live = inst?.live, lm = live?.m;
  if (!lm || lm.done || lm.turn === live.me || lm.visit.darts.length) return false;
  const r = lm.rem[lm.turn];
  return wouldWinMatch(lm, lm.turn) && r <= 170 && !BOGEY.has(r);
}

// Schaltung ans Board (DartConnect), zu Beginn einer Aufnahme: jeder Matchdart (beide Seiten), eigener gewählter
// Checkout-Weg, sonst große Finishes (61–170, kein Bogey) mit 35 %. 180er-Schaltung macht der Screen nach 2 Triples.
export const BOARD_FINISH_CHANCE = 0.35;
export function boardCall(state) {
  const live = state.activeEvent?.live, lm = live?.m;
  if (!lm || lm.done || lm.visit.darts.length) return null;
  const side = lm.turn, r = lm.rem[side];
  if (r > 170 || BOGEY.has(r)) return null;
  if (wouldWinMatch(lm, side)) return 'match';
  if (side === live.me && live.route) return 'finish';
  return r > 60 && new RNG(state.rng).chance(BOARD_FINISH_CHANCE * (lateMatch(lm) || boardPace(lm) >= 1 ? 1 : boardRate(state, lm))) ? 'finish' : null;
}
export const isBigTreble = hit => hit?.mult === 3 && hit.score >= 54;   // T18/T19/T20

// ---- Version 195 (Nutzerwunsch): Jede fixe WM-Qualifikation als News (jeder Spieler nur einmal je Jahr, `qual.wmNews`) ----
// title null → Titel aus den Namen; skipP: eigener Spieler hat bei diesem Event schon eine eigene Meldung
function wmAnnounce(state, ids, title, text, skipP = false) {
  const q = qualOf(state), done = new Set(q.wmNews ?? []);
  const fresh = [...new Set(ids)].filter(id => id && !done.has(id));
  if (!fresh.length) return;
  q.wmNews = [...done, ...fresh];
  const list = skipP ? fresh.filter(id => id !== 'P') : fresh;
  if (!list.length) return;
  const nm = id => (id === 'P' ? state.player.name : getPlayer(state, id)?.name ?? '?'), names = list.map(nm), me = list.includes('P');
  const head = title ?? (list.length === 1 ? (me ? 'Du spielst die Weltmeisterschaft!' : `${names[0]} löst das WM-Ticket`) : `${names.length} Spieler lösen das WM-Ticket`);
  addNews(state, me ? 'result' : 'info', `🎟️ ${head}`, `${text}${list.length > 1 || title ? `: ${names.join(', ')}` : ''}.`);
}
// Nach den PC Finals: direkte Plätze (Top 40 PDC + 40 Pro Tour) und Plätze über Challenge/Dev Tour, Women's Series und Nebentouren
function wmDirectNews(state) {
  const q = qualOf(state), direct = wmDirect(state), auto = new Set(q.wmAuto ?? []), reg = new Set([q.wmYouth, ...Object.values(q.wmReg ?? {}).flat()]);
  // Top 40 PDC / Top 40 Pro Tour: keine Meldung (Version 196, Nutzerwunsch – nur internationale Qualifikanten)
  wmAnnounce(state, direct.filter(id => !auto.has(id) && !reg.has(id)), "WM-Tickets über Challenge/Dev Tour, Women's Series & Nebentouren", 'Über ihre Tour-Ranglisten für die WM qualifiziert');
}

// ---- New Star Darts: Schlüsselmomente selbst werfen ----
// Zu Beginn einer eigenen Aufnahme: Matchdarts, Entscheidungsleg, Break-Chance (Gegner hat Anwurf), Checks ab 61.
// Unter 20 % Energie wirft die KI für dich (schlechter werdend).
export function keyMoment(state) {
  const live = state.activeEvent?.live, lm = live?.m;
  if (!lm || lm.done || lm.turn !== live.me || lm.visit.darts.length || !canSelfPlay(state.player)) return null;
  if (liveThrower(state, live.me) !== 'P') return null;          // Doppel: Partner wirft
  if (dinScene(state)) return 'din';                              // Version 144: Double-in – erste Aufnahme des Legs zu 75 % selbst (extra)
  if (nineAlive(state)) return wouldWinMatch(lm, live.me) && lm.rem[live.me] <= 170 ? 'match' : 'nine';   // 9-Darter: extra, zählt nicht mit
  if (bigFish(state)) return wouldWinMatch(lm, live.me) ? 'match' : 'fish';   // Version 129: Rest 170 – immer selbst, extra
  let kind = pickMoment(state, live, lm) ?? (effortOf(live) === 1 ? null : forcedMoment(live, lm));   // 1 ❤: keine erzwungene Szene je Leg
  if (kind === 'scoring' && needsIn(lm, live.me)) kind = 'din';   // noch nicht „drin“: die Szene heißt Double-in
  if (kind) live.sceneLeg = lm.legIdx;                            // dieses Leg hat (mindestens) eine eigene Spielszene
  return kind;
}
// Version 144 (Nutzerwunsch): Bei Double-in (World Grand Prix) ist deine erste Aufnahme eines Legs zu 75 % eine Spielszene – zusätzlich,
// wie 9-Darter/170 (setzt weder `sceneLeg` noch das Kontingent). Gewürfelt einmal je Leg (`live.dinLeg`/`live.dinOn`, bleibt beim Neuladen).
export const DIN_SCENE = 0.75;
export function dinScene(state) {
  const live = state.activeEvent?.live, lm = live?.m;
  if (!lm?.format?.din || !needsIn(lm, live.me) || (lm.legVisits?.[live.me]?.length ?? 0) > 0) return false;
  if (live.dinLeg !== lm.legIdx) { live.dinLeg = lm.legIdx; live.dinOn = new RNG(state.rng).chance(DIN_SCENE); }
  return live.dinOn;
}
// Version 115 (Nutzerwunsch): Nach einer perfekten ersten Aufnahme (170/171/174/177/180 – danach ist ein 9-Darter noch möglich) wirfst du
// die 2. Aufnahme und – solange der 9-Darter möglich bleibt (Rest ≤ 170, kein Bogey) – auch die 3. selbst. Diese Szenen kommen immer
// zusätzlich: sie setzen weder `sceneLeg` (Mindest-Szene je Leg) noch `kmLeg`/Scoring-Zähler (Kontingent) und hängen nicht vom Einsatz ab.
export const NINE_FIRST = 170;
// Version 130: Ist der 9-Darter noch möglich (auch mitten in der Aufnahme, nach jedem Dart)? Kein Bust, höchstens 9 Darts, Rest mit den übrigen Darts checkbar.
const canFinishIn = (rem, k) => (k <= 0 ? false : k <= 3 ? rem <= 170 && !BOGEY.has(rem) && !!checkoutRoute(rem, k) : [60, 57, 54, 51].some(t => rem - t > 1 && canFinishIn(rem - t, k - 1)));
export function nineStill(lm, me) {
  const v = lm.legVisits?.[me] ?? [], d = lm.legDarts?.[me] ?? 0, rem = lm.rem[me];
  if (v.some(x => x.bust) || d > 9) return false;
  return rem === 0 ? true : canFinishIn(rem, 9 - d);
}
// Version 129 (Nutzerwunsch): Stehst du zu Beginn deiner Aufnahme auf 170 („Big Fish“), wirfst du immer selbst – wie der 9-Darter extra,
// ohne `sceneLeg`/Kontingent und unabhängig vom Einsatz.
export function bigFish(state) {
  const inst = state.activeEvent, live = inst?.live, lm = live?.m;
  return !!lm && !lm.done && !inst.teams && lm.turn === live.me && !lm.visit.darts.length && lm.rem[live.me] === 170;
}
export function nineAlive(state) {
  const inst = state.activeEvent, live = inst?.live, lm = live?.m;
  if (!lm || lm.done || inst.teams || lm.turn !== live.me || lm.visit.darts.length) return false;
  const v = lm.legVisits?.[live.me] ?? [], r = lm.rem[live.me];
  if (lm.legDarts?.[live.me] !== v.length * 3 || v.some(x => x.bust)) return false;
  if (lm.format?.din) return (v.length === 1 || v.length === 2) && nineStill(lm, live.me);   // Version 147: Double-in – z. B. 160 (D20 T20 T20), 180, 161
  if (v.length === 1) return v[0].score >= NINE_FIRST;
  if (v.length === 2) return v[0].score >= NINE_FIRST && r <= 170 && !BOGEY.has(r);
  return false;
}
// Version 89 (Nutzerwunsch): In JEDEM Leg gibt es mindestens eine eigene Spielszene – auch in langen Formaten (Matchplay …), in denen `paced` die
// Board-Momente drosselt. Ein Leg kann nur durch einen Checkout enden, und der ist nur aus einem Rest ≤ 170 (kein Bogey) möglich: Steht bei Beginn
// deiner Aufnahme einer von beiden auf so einem Rest, kann das Leg in dieser Runde enden → ohne bisherige Szene wird jetzt eine erzwungen
// (Break/Check, sonst eine Scoring-Aufnahme). Eine Szene aus `pickMoment` zählt mit; in langen Matches (gedrosselt) ist die erzwungene Szene zugleich
// die eine Szene dieses Legs (`kmLeg`) – mehr gibt es dort wie bisher nur bei Matchdarts und im Entscheidungsleg.
function forcedMoment(live, lm, me = live.me) {
  const vk = `${lm.legIdx}:${lm.legVisits?.[me]?.length ?? 0}`, r = lm.rem[me], fin = r <= 170 && !BOGEY.has(r);
  const kind = fin ? (lm.legStarter !== me ? 'break' : 'finish') : 'scoring';
  if (live.forceKey === vk) return kind;                          // dieselbe Aufnahme noch einmal geprüft (Neuladen)
  if (live.sceneLeg === lm.legIdx) return null;
  const ro = lm.rem[1 - me];
  if (!fin && !(ro <= 170 && !BOGEY.has(ro))) return null;       // das Leg kann in dieser Runde noch nicht enden
  live.forceKey = vk;
  if (boardPace(lm) < 1) { live.kmLeg = lm.legIdx; live.kmCnt = 1; }
  return kind;
}
// ---- Einsatz (Version 107, Nutzerwunsch wie im Vorbild): 1 ❤ gelb / 2 ❤ orange (Standard, bisheriges Verhalten) / 3 ❤ rot ----
// Mehr Einsatz = mehr eigene Spielszenen, kostet aber mehr Energie (abgerechnet je Leg mit dem Einsatz, der in diesem Leg galt).
export const EFFORT_DEFAULT = 2;
export const EFFORT_ENERGY = { 1: 0.3, 2: 1, 3: 1.35 };     // Energie-Faktor (Version 191: 1 ❤ sehr wenig)
export const EFFORT_SCENES = { 1: 0.15, 2: 1, 3: 1.6 };     // Faktor für Check-/Break-/Scoring-Szenen (Matchdarts, Entscheidungsleg bleiben; Version 191: 1 ❤ kaum Szenen, keine Mindest-Szene je Leg)
export const effortOf = live => live?.effort ?? EFFORT_DEFAULT;
export function setEffort(state, e) {
  const live = state.activeEvent?.live; if (!live || ![1, 2, 3].includes(e)) return;
  (live.effortHist ??= [{ leg: 0, e: effortOf(live) }]).push({ leg: live.m?.legIdx ?? 0, e });
  live.effort = e;
}
// Energie im laufenden Match (Version 108, nur Anzeige): Start-Energie minus Verbrauch der bisher gespielten Legs (mit Einsatz);
// abgebucht wird wie bisher am Matchende.
export function liveEnergy(state) {
  const inst = state.activeEvent, live = inst?.live, e0 = state.player.energy ?? 100;
  const legs = live?.m?.legIdx ?? 0;
  if (!legs) return Math.round(e0);
  return Math.max(0, Math.round(e0 - matchEnergy(legs, inst) * effortEnergyFactor(live, legs)));
}
// Energie-Faktor über das ganze Match: Mittel der Einsätze je Leg (Wechsel gelten ab dem laufenden Leg)
export function effortEnergyFactor(live, legsTotal) {
  const hist = live?.effortHist;
  if (!hist?.length || !legsTotal) return EFFORT_ENERGY[effortOf(live)];
  let sum = 0;
  for (let i = 0; i < legsTotal; i++) sum += EFFORT_ENERGY[[...hist].reverse().find(h => h.leg <= i)?.e ?? EFFORT_DEFAULT];
  return sum / legsTotal;
}
// Version 121 (Nutzerwunsch): Im Doppel (World Cup) wirfst du nur jede zweite Aufnahme deines Teams → dort ist JEDE deiner Aufnahmen eine
// Spielszene (≈ 2,9 je Leg statt ≈ 1,5; Einzel Best of 11 ≈ 2,7). Matchdarts/Entscheidungsleg wie immer zuerst.
function pickMoment(state, live, lm) {
  const team = !!state.activeEvent?.teams;
  const me = live.me, r = lm.rem[me], fin = r <= 170 && !BOGEY.has(r), eff = EFFORT_SCENES[effortOf(live)];
  if (fin && wouldWinMatch(lm, me)) return 'match';
  if (isDecider(lm)) return 'decider';
  if (team) return fin ? (lm.legStarter !== me ? 'break' : 'finish') : 'scoring';   // Doppel: jede deiner Aufnahmen ist eine Szene (du wirfst nur jede zweite)
  if (fin && (lm.legStarter !== me || r > 60) && paced(state, lm, me, Math.min(1, eff))) return lm.legStarter !== me ? 'break' : 'finish';
  // ab und zu eine Scoring-Aufnahme mitten im Leg: lange Matches höchstens eine je Leg (35 %), kurze (First-to ≤ 6) bis zu zwei (je 55 %)
  if (r > 170 && r < 501) {
    const vk = `${lm.legIdx}:${lm.legVisits?.[me]?.length ?? 0}`, short = boardPace(lm) >= 1 || wmClutch(state, lm);   // Version 240: WM knapp wie kurze Matches
    if (live.scoreKey === vk) return 'scoring';                    // dieselbe Aufnahme noch einmal geprüft (Neuladen)
    const cnt = live.scoreLeg === lm.legIdx ? (live.scoreCnt ?? 0) : 0;
    const max = (short ? SCORING_SHORT_MAX : 1) + (eff > 1 ? 1 : 0) - (eff < 1 ? 1 : 0);   // Einsatz: 3 ❤ eine Scoring-Szene mehr je Leg, 1 ❤ eine weniger
    if (cnt < max && paced(state, lm, me, Math.min(0.95, (short ? SCORING_SHORT : 0.35) * eff))) {
      live.scoreLeg = lm.legIdx; live.scoreCnt = cnt + 1; live.scoreKey = vk; return 'scoring';
    }
  }
  return null;
}
// Lange Matches (First-to ab 7, Sätze zählen mit ihren Legs): Board-Momente seltener und gezielter, damit sich die Partie nicht zieht.
// Matchdarts und Entscheidungsleg bleiben immer. Break/Check: höchstens ein Moment je Leg; ob ein Leg ein „Board-Leg“ ist, wird
// einmal ausgewürfelt (Chance 0,8 × 1,5 × 6 / Länge, z. B. First-to-10 ≈ 72 %, First-to-18 ≈ 40 %). Scoring-Aufnahmen gibt es nur noch
// in der Schlussphase, wenn jemand einen Matchdart-Leg hat – dort ist jedes Leg ein Board-Leg.
// Version 51 (Nutzerwunsch): etwas mehr Momente (× BOARD_MORE); bei der WM immer das 1,2fache wie bei gleich langen Formaten (× WM_BOARD).
export const LONG_MATCH = 6, BOARD_MORE = 1.5, WM_BOARD = 1.2;
export const SCORING_SHORT = 0.55, SCORING_SHORT_MAX = 2;   // Version 63: kurze Matches (z. B. Best of 11) mehr Scoring-Szenen
export const matchLen = lm => lm.format.legs * (lm.format.sets || 1);
export const boardPace = lm => Math.min(1, LONG_MATCH / matchLen(lm));
// Häufigkeitsfaktor für Board-Momente in langen Matches (1 = kurze Matches, ungedrosselt)
export const boardRate = (state, lm) => (boardPace(lm) >= 1 ? 1 : boardPace(lm) * BOARD_MORE * (state.activeEvent?.fmt === 'wm' ? WM_BOARD : 1));
export const lateMatch = lm => wouldWinMatch(lm, 0) || wouldWinMatch(lm, 1) || inExtension(lm.format, lm.legs);   // Version 132: Verlängerung (Two clear legs) = Schlussphase
// Version 240 (Nutzerwunsch): WM – knappe Schlussphase (höchstens 1 Satz Unterschied, einer nur noch 1 Satz vom Sieg entfernt) → mehr Szenen:
// jedes Leg ist ein Board-Leg, bis zu 2 Board-Momente und 2 Scoring-Aufnahmen je Leg (wie in kurzen Matches)
export const WM_CLUTCH_MOMENTS = 2;
export const wmClutch = (state, lm) => state.activeEvent?.fmt === 'wm' && (lm.format.sets ?? 0) > 1
  && Math.abs(lm.sets[0] - lm.sets[1]) <= 1 && Math.max(lm.sets[0], lm.sets[1]) >= lm.format.sets - 1;
function paced(state, lm, me, chance = 1) {
  const live = state.activeEvent.live, pace = boardPace(lm), key = `${lm.legIdx}:${lm.legVisits?.[me]?.length ?? 0}`;
  if (live.kmKey === key) return true;                                   // diese Aufnahme wurde schon vergeben (Neuladen, erneute Prüfung)
  if (pace < 1) {
    const late = lateMatch(lm), clutch = wmClutch(state, lm), max = clutch ? WM_CLUTCH_MOMENTS : 1;
    if ((live.kmLeg === lm.legIdx && (live.kmCnt ?? 1) >= max) || (chance < 1 && !late && !clutch)) return false; // höchstens ein Moment je Leg (WM knapp: 2), Scoring nur in der Schlussphase
    if (!late && !clutch) {
      if (live.kmRoll?.leg !== lm.legIdx) live.kmRoll = { leg: lm.legIdx, on: new RNG(state.rng).chance(Math.min(1, 0.8 * boardRate(state, lm) * EFFORT_SCENES[effortOf(live)])) };
      if (!live.kmRoll.on) return false;
    }
  }
  if (chance < 1 && !new RNG(state.rng).chance(chance)) return false;
  live.kmCnt = live.kmLeg === lm.legIdx ? (live.kmCnt ?? 1) + 1 : 1;
  live.kmKey = key; live.kmLeg = lm.legIdx;
  return true;
}
// Zielparameter (Kreis, Linien) für den eigenen Dart
export function aimParams(state, target) {
  const live = state.activeEvent.live, p = circleParams(liveAttrs(state, live.me), live.m, live.me, target), mm = modMult(live, live.me);
  if (mm !== 1) { p.radius *= mm; p.mod = mm; }                      // Spielmoment (moments.js): besser/schlechter für einige Aufnahmen
  // Nervosität: einzelne Darts mit größerem Kreis (einmal je Dart gewürfelt, damit Zielwechsel nicht neu würfelt)
  const lm = live.m, key = `${lm.legIdx}:${lm.turn}:${lm.legDarts?.[lm.turn] ?? 0}`;
  if (live.shake?.key !== key) live.shake = { key, mult: nerveShake(nervesNow(state).pts, new RNG(state.rng)) };
  if (live.shake.mult > 1) { p.radius *= live.shake.mult; p.shaky = live.shake.mult; }
  const sp = nerveSpeed(nervesNow(state).pts);                     // Nervosität: Zielkreuz bewegt sich schneller
  if (sp > 1) { p.freq *= sp; p.nervy = sp; }
  const inj = injuryAim(state.player);                             // Version 152: Verletzung – mehr Streuung, unruhigeres Zielkreuz
  if (inj) { p.radius *= inj.circle; p.freq *= inj.speed; p.injured = inj; }
  return p;
}
// Aktueller Streuungs-Multiplikator eines Spielmoments für dich (Anzeige im Liveticker), 1 = keiner
export const momentMult = state => { const live = state.activeEvent?.live; return live ? modMult(live, live.me) : 1; };
// Eigener Dart an Position (x, y) in mm
export function liveHumanDart(state, x, y, target) {
  const live = state.activeEvent.live, lm = live.m, side = lm.turn, start = lm.visit.start;
  // Einsteckwinkel: verbautes Feld → Dart kann abprallen (Bouncer, zählt nicht)
  const block = blockage(targetPoint(target), lm.visit.tips, liveAttrs(state, side).angle ?? null), rng = new RNG(state.rng);
  const dfl = deflect({ x, y }, lm.visit.tips, liveAttrs(state, side).angle ?? null, rng);   // Version 205: Abpraller am steckenden Dart
  if (dfl) { x = dfl.x; y = dfl.y; }
  const la = liveAttrs(state, side), bp = bounceChance(block, la.bounce);   // Version 135: Bouncer-Risiko je Dart-Modell
  const rp = robinChance({ x, y }, lm.visit.tips, la.robin);           // Version 136: Robin Hood je Flight
  const hit = bp > 0 && rng.chance(bp) ? BOUNCER : rp > 0 && rng.chance(rp) ? ROBIN : scoreAt(x, y), ev = throwDart(lm, hit, { x, y });
  const visitOver = !!(lm.done || ev?.visitEnd || ev?.legEnd || lm.turn !== side);
  if (visitOver) {
    live.route = null; tickMods(live, side);
    // Selbst geworfene Highlights (nur echte Würfe am Board zählen für Meilensteine)
    const st = (state.selfStats ??= { visits: 0, s180: 0, s140: 0, ton: 0, checkouts: 0, hiFinish: 0, bigFish: 0, matchDarts: 0, bull: 0 });
    st.visits++;
    if (ev?.visitScore === 180) st.s180++;
    else if (ev?.visitScore >= 140) st.s140++;
    else if (ev?.visitScore >= 100) st.ton++;
    if (ev?.checkout) {
      st.checkouts++; st.hiFinish = Math.max(st.hiFinish, start);
      if (start === 170) st.bigFish++;
      if (hit.label === 'BULL') st.bull++;
      if (ev.matchEnd) st.matchDarts++;
    }
    live.selfEvent = { score: ev?.visitScore ?? 0, checkout: !!ev?.checkout, start };
    checkAchievements(state);
  }
  return { ev, dart: { target, x, y, hit, deflected: !!dfl }, side, visitOver };
}

// Temporäre Leistungs-Modifikatoren (Ablenkungen): Multiplikator auf die Streuung, gilt für n Aufnahmen
export function addMod(live, side, mult, visits) {
  (live.mods ??= []).push({ side, mult, visits });
}
const modMult = (live, side) => (live.mods ?? []).filter(x => x.side === side).reduce((p, x) => p * x.mult, 1);
function tickMods(live, side) {
  if (!live.mods) return;
  for (const x of live.mods) if (x.side === side) x.visits--;
  live.mods = live.mods.filter(x => x.visits > 0);
}

// Rest des Live-Matches simulieren (dartgenau, beide Seiten mit KI-Modell)
export function simulateLiveRest(state) {
  const lm = state.activeEvent.live.m;
  const rng = new RNG(state.rng);
  while (!lm.done) { const a = simAttrs(state, lm.turn), d = aiDart(lm, lm.turn, a, rng, aiSigma(a)); throwDart(lm, d.hit, d); }
  return finishManualMatch(state);
}

// Abgeschlossenes Live-Match werten (+ restliche KI-Matches der Runde)
export function finishManualMatch(state) {
  const inst = state.activeEvent, m = playerMatch(inst);
  if (!inst.live?.m.done) return null;
  const res = matchResult(inst.live.m);
  applyResult(m, res);
  recordPlayerMatch(state, inst, m, res);
  inst.live = null;
  simulateRoundAI(state);
  return res;
}

function applyResult(m, res) {
  m.winner = res.winner === 0 ? m.a : m.b;
  m.score = res.score;
  m.avg = res.stats.map(s => Math.round(s.avg * 10) / 10);
}

// XP gutschreiben (inkl. Trainer-Faktor); Rückgabe = tatsächlich gutgeschriebene XP (für die Anzeige)
function grantXp(state, xp) {
  if (state.mode === 'nsd') return 0;                 // New Star Darts: Star-Status statt XP
  const got = Math.round(xp);
  const ups = addXp(state.player, got);
  if (ups) addNews(state, 'xp', `⬆️ Level ${state.player.level}! +${pointsGained(state.player.level, ups)} Attributpunkte`, 'Verteile sie im Spielerprofil oder direkt nach dem Turnier.');
  return got;
}

function recordPlayerMatch(state, inst, m, res) {
  const me = m.a === 'P' ? 0 : 1, s = res.stats[me], o = res.stats[1 - me];
  const won = m.winner === 'P';
  for (const t of [state.stats.career, seasonStats(state, state.date.year)]) {
    t.matches++; if (won) t.wins++;
    t.legsWon += res.legsTotal[me]; t.legsLost += res.legsTotal[1 - me];
    t.points += s.points; t.darts += s.darts;
    t.s180 += s.s180; t.s140 += s.s140; t.s100 += s.s100;
    t.coHit += s.coHit; t.coAtt += s.coAtt; t.bogey = (t.bogey ?? 0) + (s.bogey ?? 0);
    t.hiFinish = Math.max(t.hiFinish, s.hiFinish);
    if (s.bestLeg && (!t.bestLeg || s.bestLeg < t.bestLeg)) t.bestLeg = s.bestLeg;
  }
  const c = state.stats.career;
  state.player.avgReal = c.darts ? Math.round(c.points / c.darts * 300) / 100 : null;
  if (state.mode === 'nsd') return recordNsdMatch(state, inst, m, res, me, won);
  const f = xpFactor(inst);
  const xp = grantXp(state, Math.round((XP_BASE.match + (won ? XP_BASE.win : 0) + XP_BASE.perRound * Math.min(inst.current, 6)) * f));
  inst.xp += xp;
  // Erfahrung (Clutch): jedes Match, Entscheidungslegs/-sätze zählen extra
  const fmt = inst.rounds[inst.current].format, isSets = !!fmt.sets;
  const sc = res.score, to = isSets ? fmt.sets : fmt.legs;
  const decider = sc[0] >= to - 1 && sc[1] >= to - 1;
  const cp = Math.round((2 + (decider ? 3 : 0) + (decider && won ? 3 : 0)) * f);
  inst.clutch = (inst.clutch ?? 0) + cp;
  const up = addClutch(state.player, cp);
  // Selbstvertrauen (+ Rivalen-Duell)
  const oppId = me === 0 ? m.b : m.a;
  if (isRival(state, oppId)) rivalMeeting(state, inst, won, `${sc[me]}:${sc[1 - me]}`);
  if (PRO_CATS.includes(inst.cat)) {
    const p = state.player, before = proMatchesOf(p);
    p.proMatches = before + 1;
    if (before < 60 && p.proMatches >= 60) addNews(state, 'xp', '😌 Lampenfieber verflogen', 'Nach 60 Profi-Matches fühlst du dich auf der Tour zuhause – keine Nervosität mehr.');
  }
  const step = updateMomentum(state.player, { won, opp: inst.teams?.[oppId] ?? getPlayer(state, oppId), cat: inst.cat, big: inst.big?.includes(oppId) });
  if (step) addNews(state, 'xp', `${step.icon || '😐'} Selbstvertrauen: ${step.label}`, step.bonus > 0 ? `Du bist im Flow: +${step.bonus} auf Scoring, Finishing und Fokus.`
    : step.bonus < 0 ? `Die Zweifel nagen: ${step.bonus} auf Scoring, Finishing und Fokus. Siege helfen raus.` : 'Dein Selbstvertrauen ist wieder im Normalbereich.');
  if (up > 0) addNews(state, 'xp', `Erfahrung steigt auf ${expLabel(state.player.exp)}`, 'Du bleibst in engen Momenten ruhiger – Matchdarts und Entscheidungslegs gelingen dir besser.');
  if (!won && !inst.rounds[inst.current].isGroup) inst.playerAlive = false;
  inst.lastMatch = {
    round: inst.rounds[inst.current].name, opp: me ? m.a : m.b, won,
    score: me ? [...res.score].reverse() : res.score, me: s, opp_: o, xp,
  };
}

// Version 241: Urlaub – einmal pro Jahr eine Woche aussetzen: Energie 100 %, Zufriedenheit +15, Freundin +5, kostet ★ (Status-Preis);
// in dieser KW keine Turniere. Nicht in Wochen, in denen du ein Major (inkl. WS/PL/Major-Qualifier) spielen darfst, und nicht mit laufendem Turnier.
export const VACATION_STARS = 15, VACATION_SAT = 15, VACATION_PARTNER = 5;
export function vacationStatus(state) {
  const p = state.player, cost = starPrice(VACATION_STARS, p.star.level);
  if (p.vacationYear === state.date.year) return { ok: false, cost, reason: `Dein Urlaub ${state.date.year} ist schon vorbei – nächstes Jahr wieder` };
  if (state.week.vacation) return { ok: false, cost, reason: 'Du bist gerade im Urlaub' };
  if (state.activeEvent || state.week.played) return { ok: false, cost, reason: 'Diese Woche hast du schon gespielt' };
  const major = eventsInWeek(state, state.date.year, state.date.week).find(ev => majorPath(ev) && eligibility(state, ev).ok);
  if (major) return { ok: false, cost, reason: `Diese Woche steht ${major.name} an` };
  if ((state.stars ?? 0) < cost) return { ok: false, cost, reason: `Urlaub kostet ${cost} ★` };
  return { ok: true, cost };
}
export function takeVacation(state) {
  const st = vacationStatus(state), p = state.player;
  if (!st.ok) throw new Error(st.reason);
  state.stars = Math.round(((state.stars ?? 0) - st.cost) * 10) / 10;
  p.energy = 100; p.satisfaction = Math.min(100, (p.satisfaction ?? 50) + VACATION_SAT);
  if ((p.rel?.partner ?? 0) > 0) p.rel.partner = Math.min(100, p.rel.partner + VACATION_PARTNER);
  p.vacationYear = state.date.year; state.week.vacation = true; p.vacRegen = VAC_REGEN_WEEKS;   // Version 242: danach 4 Wochen bessere Erholung
  addNews(state, 'info', '🏝️ Urlaub!', `Eine Woche abschalten: Energie 100 %, Zufriedenheit +${VACATION_SAT}${(p.rel?.partner ?? 0) > 0 ? `, ${p.partnerName ?? 'deine Begleitung'} freut sich (+${VACATION_PARTNER})` : ''}. Diese Woche kein Training und keine Turniere, danach ${VAC_REGEN_WEEKS} Wochen +${VAC_REGEN} % Erholung.`);
  return st.cost;
}
// Version 241: direkte Bilanz je Gegner (state.h2h[id] = {w, l, last}) und Formkurve (state.form = letzte 5 Matches, neueste zuerst)
export const FORM_LEN = 5;
export function recordH2H(state, inst, oppId, won, my, opp, avg) {
  (state.form ??= []).unshift({ w: won ? 1 : 0, a: Math.round((avg ?? 0) * 10) / 10 });
  state.form.length = Math.min(state.form.length, FORM_LEN);
  if (inst.teams || !oppId || String(oppId).startsWith('W:')) return;   // World Cup: keine Einzel-Bilanz
  const h = ((state.h2h ??= {})[oppId] ??= { w: 0, l: 0 });
  if (won) h.w++; else h.l++;
  h.last = { y: state.date.year, w: won ? 1 : 0, s: `${my}:${opp}`, n: inst.name };
}
export const h2hOf = (state, id) => state.h2h?.[id] ?? null;
// New Star Darts: Energie, Star-Status, Note, Fans (keine XP-/Level-Systeme)
function recordNsdMatch(state, inst, m, res, me, won) {
  const p = state.player, s = res.stats[me], o = res.stats[1 - me];
  const fmt = inst.rounds[inst.current].format, to = fmt.sets ?? fmt.legs;
  const my = res.score[me], opp = res.score[1 - me];
  const oppId = me === 0 ? m.b : m.a, oppP = inst.teams?.[oppId] ?? getPlayer(state, oppId);
  const legsN = res.legsTotal[0] + res.legsTotal[1];
  const relBefore = { ...(p.rel ?? {}) }, eBefore = Math.round(p.energy ?? 100);   // Version 149: Bewertungsseite zeigt Zu-/Abnahme
  addEnergy(p, -Math.round(matchEnergy(legsN, inst) * effortEnergyFactor(inst.live, legsN)));   // Version 107: Einsatz (Herzen)
  const oppStrength = oppP?.attrs ? overall(oppP.attrs) - overall(p.attrs) : 0;
  const rating = matchRating({ won, avg: s.avg, coPct: s.coPct, s180: s.s180, my, opp, oppAvg: o.avg, level: p.star?.level ?? 1 });   // Version 158: strenger mit Status
  sponsorMatchPay(state, inst, won, s);                // Sponsor-Prämien (Sieg, 180er)
  if (s.bestLeg && s.bestLeg <= 9) nineArticle(state, inst.name, oppP?.name);
  useBoosts(p);                                        // Zubehör-Boosts: ein Match weniger
  const star = starMatchDelta(p.star.level, { won, my, opp, to, avg: s.avg, oppStrength, cat: inst.cat, fmt: inst.fmt, rating, oppRank: rankOf(state, 'pdc', oppId) });
  const ups = addStarProgress(state, star);
  const fans = fansAfterMatch(won, rating);
  addFans(p, fans);                                   // je mehr Fans, desto langsamer
  // Zähler für Meilensteine
  const ms = (state.mstats ??= {}), oppRank = rankOf(state, 'pdc', oppId), dec = res.score[0] >= to - 1 && res.score[1] >= to - 1;
  ms.bestAvg = Math.max(ms.bestAvg ?? 0, s.avg); ms.bestRating = Math.max(ms.bestRating ?? 0, rating);
  if (won) {
    if (opp === 0) ms.nilWins = (ms.nilWins ?? 0) + 1;
    if (dec) ms.deciderWins = (ms.deciderWins ?? 0) + 1;
    if (oppRank && oppRank <= 16) ms.beatTop16 = (ms.beatTop16 ?? 0) + 1;
    if (oppRank && oppRank <= 8) ms.beatTop8 = (ms.beatTop8 ?? 0) + 1;
    if (oppRank === 1) ms.beatNo1 = (ms.beatNo1 ?? 0) + 1;
  }
  checkAchievements(state);
  // Erfahrung (Clutch) und Selbstvertrauen laufen still weiter
  const decider = res.score[0] >= to - 1 && res.score[1] >= to - 1;
  addClutch(p, Math.round((2 + (decider ? 3 : 0) + (decider && won ? 3 : 0)) * xpFactor(inst)));
  updateMomentum(p, { won, opp: oppP, cat: inst.cat, big: inst.big?.includes(oppId) });
  if (isRival(state, oppId)) rivalMeeting(state, inst, won, `${my}:${opp}`);
  recordH2H(state, inst, oppId, won, my, opp, s.avg);   // Version 241: Bilanz gegen den Gegner + Formkurve
  if (!won && !inst.rounds[inst.current].isGroup) inst.playerAlive = false;
  inst.star = Math.round(((inst.star ?? 0) + star) * 10) / 10;
  inst.lastMatch = {
    round: inst.rounds[inst.current].name, opp: oppId, won, score: [my, opp], legs: [res.legsTotal[me], res.legsTotal[1 - me]],
    me: s, opp_: o, meM: res.members?.[me] ?? null, oppM: res.members?.[1 - me] ?? null, xp: 0, rating, star, ups, fans, energy: p.energy,
    relBefore, eBefore,
  };
}
// Siege des Spielers im Turnier (ohne Freilose)

// Alle offenen KI-Matches der aktuellen Runde simulieren
function simRoundMatches(state, round, rng, inst) {
  for (const m of round.matches) {
    if (!m.winner && inst.walkover && (m.a === inst.walkover || m.b === inst.walkover)) { m.winner = m.a === inst.walkover ? m.b : m.a; m.bye = true; m.walkover = true; continue; }   // kampflos
    if (m.winner || (!inst.autoPlayer && (m.a === 'P' || m.b === 'P'))) continue;
    applyResult(m, simulateMatch(attrsOf(state, m.a, inst), attrsOf(state, m.b, inst), round.format, rng));
  }
}
export function simulateRoundAI(state) {
  const inst = state.activeEvent;
  simRoundMatches(state, inst.rounds[inst.current], new RNG(state.rng), inst);
}

// UK Open: Index der Runde, in der der Spieler einsteigt (0 = Runde 1)
const ukEntryRound = inst => +(Object.keys(inst.ukEntry ?? {}).find(k => inst.ukEntry[k].includes('P')) ?? 0);
// Reparatur für Spielstände bis Version 56: UK-Open-Einsteiger (Rang 1–96) galten schon vor ihrer Einstiegsrunde als ausgeschieden
export function repairActiveEvent(state) {
  const inst = state.activeEvent;
  if (!inst?.ukEntry || inst.done || inst.playerAlive || !inst.withPlayer || ukEntryRound(inst) <= inst.current) return false;   // sonst wirklich ausgeschieden
  inst.playerAlive = true;
  skipPlayerByes(state);
  return true;
}

// Nächste Runde anlegen (Gruppen → K.-o. bzw. Gewinner paaren)
function advance(inst) {
  inst.current++;
  const r = inst.rounds[inst.current], prev = inst.rounds[inst.current - 1];
  if (r.isGroup) return;
  if (inst.ukEntry) {                       // UK Open: Neueinsteiger bzw. offene Auslosung
    r.matches = ukOpenMatches(prev, inst.ukEntry[inst.current] ?? [], new RNG({ s: hashSeed(`${inst.eventId}|${inst.year}|${inst.current}`) }), inst.current >= 3);
    // Erst ab der eigenen Einstiegsrunde zählt „kein Match“ als ausgeschieden (Rang 1–96 steigen in Runde 2–4 ein)
    if (inst.withPlayer && inst.playerAlive && inst.current >= ukEntryRound(inst) && !r.matches.some(m => m.a === 'P' || m.b === 'P')) inst.playerAlive = false;
    return;
  }
  r.matches = prev.isGroup ? (inst.prelimSeeds ? prelimKoMatches(inst.rounds, inst.groups, inst.prelimSeeds, new RNG({ s: hashSeed(`${inst.eventId}|${inst.year}`) }))
    : groupKoMatches(inst.rounds, inst.groups, inst.groupAdv ?? 2)) : pairWinners(prev);
  if (prev.isGroup && inst.withPlayer && inst.playerAlive && !r.matches.some(m => m.a === 'P' || m.b === 'P')) inst.playerAlive = false;
}

export const roundComplete = inst => inst.rounds[inst.current].matches.every(m => m.winner);

// Nächste Runde auslosen bzw. Turnier abschließen
export function nextRound(state) {
  const inst = state.activeEvent;
  if (!roundComplete(inst)) return;
  if (inst.current === inst.rounds.length - 1) return finishEvent(state, inst);
  advance(inst);
  skipPlayerByes(state);
}

// Freilos des Spielers: Runde der KI automatisch spielen
export function skipPlayerByes(state) {
  const inst = state.activeEvent;
  if (!inst || inst.done || !inst.playerAlive || playerMatch(inst)) return;
  simulateRoundAI(state);
  nextRound(state);
}

// Komplette Runde (eigenes Match + KI) spielen
export function playRound(state) {
  const res = simulatePlayerMatch(state);
  simulateRoundAI(state);
  return res;
}

// Rest des Turniers simulieren (auch eigene Matches)
export function simulateRest(state) {
  const inst = state.activeEvent;
  while (!inst.done) {
    const pm = playerMatch(inst);
    if (pm && !pm.winner) { inst.live = null; simulatePlayerMatch(state); }
    simulateRoundAI(state);
    nextRound(state);
  }
}

// Ergebnis verbuchen: Preisgeld + OOM für alle, Tourcards (Q-School)
function settle(state, inst) {
  const last = inst.rounds[inst.rounds.length - 1];
  const survivors = last.matches.map(m => m.winner);
  inst.survivors = survivors;
  const ids = new Set();
  for (const r of inst.rounds) for (const m of r.matches) { ids.add(m.a); if (m.b) ids.add(m.b); }
  const year = state.date.year, oomMap = {};
  for (const id of ids) {
    const place = survivors.includes(id) ? (inst.cards ? 'CARD' : inst.stopAt > 1 ? 'QUAL' : 'W')
      : inst.isQualifier ? (inst.cat === 'mastersq' && placeOf(inst.rounds, id)) || 'NQ' : ((inst.groups && groupPlace(inst.rounds, inst.groups, id, inst.teams ? 1 : inst.groupAdv ?? 2)) || placeOf(inst.rounds, id));
    (inst.places ??= {})[id] = place;
    let prize = inst.prizes[place] ?? 0;
    if (inst.teams && id === 'P') prize = Math.round(prize * teamPrizeShare);   // World Cup: Preisgeld wird geteilt
    // ET-Regel: wer über die Ranglisten vorqualifiziert ist und das erste Match verliert, bekommt das Geld, aber keine OOM-Punkte
    const oomPrize = inst.preQual?.includes(id) && !inst.rounds.some(r => r.matches.some(m => m.winner === id && !m.bye && m.a && m.b)) ? 0 : prize;
    if (oomPrize) { for (const t of inst.oom) addMoney(state, t, id, oomPrize, year); oomMap[id] = oomPrize; }
    if (id === 'P') { inst.place = place; inst.prize = prize; }
  }
  recordPlaces(state, inst);   // Version 221: Platzierungen aller Teilnehmer (Spieler-Pop-up)
  if (inst.oom?.length) settleOom(state, `${inst.eventId}#${inst.sub ?? 0}`, inst.oom, oomMap, year);   // 2-Jahres-OOM: gleiches Turnier von vor 2 Jahren fällt heraus
  if (inst.eventId === 'wm-quali') { qualOf(state).wmqSurvivors = survivors; wmAnnounce(state, survivors, 'WM-Tickets beim Tour Card Holder Qualifier', 'Über den Tour Card Holder Qualifier für die WM qualifiziert', true); }
  if (inst.eventId === 'gs-quali') qualOf(state).gsqSurvivors = survivors;
  if (inst.cat === 'wmreg') { (qualOf(state).wmReg ??= {})[inst.eventId.slice(4)] = survivors; wmAnnounce(state, survivors, null, `Über den ${inst.name} für die WM qualifiziert`, true); }
  if (inst.eventId === 'youth-wm') { qualOf(state).wmYouth = survivors[0]; wmAnnounce(state, survivors.slice(0, 1), null, 'Als Jugend-Weltmeister für die WM qualifiziert'); }
  if (inst.eventId === 'pcf') wmDirectNews(state);              // Version 195: nach den PC Finals stehen die Ranglisten-Plätze fest
  if (inst.cat === 'etq') etStore(state, inst.eventId.replace('etq', 'et')).tchq = survivors;
  if (inst.cat === 'mastersq') qualOf(state).mastersQ = survivors;
  if (inst.cat === 'hnq') {                                    // HNQ: je Turnier ein Platz (max. 4)
    const st = etStore(state, inst.eventId.replace('hnq', 'et'));
    st.hnq ??= [];
    if (st.hnq.length < 4 && !st.hnq.includes(survivors[0])) st.hnq.push(survivors[0]);
  }
  if (inst.cat === 'wmqs') {                                   // Q-School-WM-Qualifier: Sieger spielt die WM
    qualOf(state).wmQsWinner = survivors[0];
    wmAnnounce(state, survivors.slice(0, 1), null, 'Sieger des WM-Qualifiers der Q-School-Teilnehmer – Startplatz bei der WM im Dezember');
  }
  if (survivors.length === 1 && !inst.isQualifier && !inst.cards && inst.cat !== 'local' && inst.fmt !== 'pln') {
    const fin = last.matches[0], runnerUp = fin && fin.b ? (fin.a === survivors[0] ? fin.b : fin.a) : null;
    recordChampion(state, inst, survivors[0], runnerUp);
    rivalTitle(state, inst, survivors[0]);
  }
  if (inst.fmt === 'pln') scorePlNight(state, inst);
  if (inst.fmt === 'plf') plLeaguePayout(state);
  if (inst.cat === 'qschool') {                              // Q-School-Rangliste (Version 94): je gewonnenes Match 1 Punkt, je Region
    const qs = ((qualOf(state).qs ??= {})[inst.eventId === 'qs-uk' ? 'uk' : 'eu'] ??= {});
    for (const id of ids) qs[id] = (qs[id] ?? 0) + inst.rounds.reduce((n, r) => n + r.matches.filter(m => m.winner === id && !m.bye && m.a && m.b).length, 0);
  }
  if (inst.cards) {                                          // Q-School: Tourcards
    // Version 210: nie mehr als 128 Holder – Tageskarten nur, solange Plätze frei sind (Sieger zuerst)
    const free = () => TOUR_CARDS - playersOfTier(state, 'tour').length - (state.player.tour === 'tour' ? 1 : 0);
    const got = survivors.filter(id => free() > 0 && (awardCard(state, id, year + 1, `${inst.baseName} ${year}`), true));
    if (got.length) addNews(state, 'draw', `${inst.name}: Tourcards vergeben`, got.map(id => getPlayer(state, id).name).join(', '));
  }
}

// Premier League: Platz 5–8 der Tabelle (ohne Play-offs) bekommen Geld – relevant, wenn der Spieler dabei ist und dort landet
function plLeaguePayout(state) {
  if (state.mode !== 'nsd' || !plState(state).players?.includes('P')) return;
  const rank = plTable(state).findIndex(x => x.id === 'P') + 1, base = PL_LEAGUE_PAY[rank];
  if (!base) return;
  const gross = starPayout(base, state.player.star.level), net = gross - managerCut(state, gross);
  state.stars = (state.stars ?? 0) + net;
  state.results.unshift({ year: state.date.year, week: state.date.week, eventId: 'pl-final', name: 'Premier League', cat: 'pl', place: `P${rank}`, prize: 0, stars: net });
  addNews(state, 'result', `Premier League: ${rank}. Platz`, `Platz ${rank} der Tabelle bringt ${net} ★ – für die Play-offs hat es nicht gereicht.`);
}

// Q-School (Version 94): nach den 4 Tagen beider Regionen gehen die restlichen Karten (bis 128 Holder) über die Q-School-Rangliste weg –
// je zur Hälfte an UK und Europa (ungerade: einer mehr für Europa); innerhalb der Region nach Punkten (gewonnene Matches), bei Gleichstand nach Stärke.
export const TOUR_CARDS = 128;
export function qschoolRankingCards(state) {
  const q = qualOf(state), y = state.date.year;
  if (!q.qs || q.qsDone) return [];
  q.qsDone = true;
  const holders = playersOfTier(state, 'tour').length + (state.player.tour === 'tour' ? 1 : 0);
  const free = Math.max(0, TOUR_CARDS - holders), eu = Math.ceil(free / 2), uk = free - eu, out = [];
  const isHolder = id => (id === 'P' ? state.player.tour === 'tour' : getPlayer(state, id)?.tier === 'tour');
  for (const [reg, n] of [['uk', uk], ['eu', eu]]) {
    const pts = q.qs[reg] ?? {}, str = id => (id === 'P' ? overall(state.player.attrs) : overall(getPlayer(state, id)?.attrs ?? {}));
    const list = Object.keys(pts).filter(id => !isHolder(id) && getPlayer(state, id)).sort((a, b) => pts[b] - pts[a] || str(b) - str(a)).slice(0, n);
    for (const id of list) awardCard(state, id, y + 1, `Q-School ${reg === 'uk' ? 'UK' : 'Europa'} ${y} (Rangliste)`);
    out.push(...list);
  }
  if (out.length) addNews(state, 'draw', `Q-School: ${out.length} Tourcards über die Rangliste`, out.map(id => getPlayer(state, id).name).join(', '));
  trimTo128(state);
  return out;
}
// Version 210 (Nutzerwunsch): nach der Q-School immer genau 128 Holder – Überschuss (z. B. viele neue Karten zum Jahreswechsel):
// die in der PDC-Rangliste am schlechtesten platzierten KI-Holder verlieren ihre Karte (dein Spieler nie)
export function trimTo128(state) {
  const extra = () => playersOfTier(state, 'tour').length + (state.player.tour === 'tour' ? 1 : 0) - TOUR_CARDS;
  if (extra() <= 0) return [];
  const order = orderOfMerit(state, 'pdc').map(x => x.p).filter(p => p.id !== 'P' && p.tier === 'tour').reverse(), cut = [];
  for (const p of order) { if (extra() <= 0) break; p.tier = p.age <= DEV_MAX_AGE ? 'dev' : 'challenge'; p.cardUntil = null; cut.push(p.name); }
  if (cut.length) addNews(state, 'draw', 'Tourcard-Limit (128): Karten verfallen', cut.join(', '));
  return cut;
}
export function awardCard(state, id, until, via) {
  if (id === 'P') {
    const p = state.player;
    if (!p.everTourcard) p.proMatches ??= 0;
    p.tour = 'tour'; p.cardUntil = until; p.everTourcard = true; p.cardVia = via;
    addNews(state, 'result', '🎉 TOURCARD GEWONNEN!', `Über ${via} – gültig bis Ende ${until}. Ab ${state.date.week >= 50 ? state.date.year + 1 : 'sofort'} spielst du auf der PDC Pro Tour (ab Phase 4 spielbar).`);
  } else {
    const p = state.world.players[id];
    if (p) { p.tier = 'tour'; p.cardUntil = until; p.cardVia = via; rivalCard(state, id, until); }
  }
}

function finishEvent(state, inst) {
  inst.done = true;
  settle(state, inst);
  inst.winner = inst.stopAt === 1 ? inst.survivors[0] : null;
  const plays = inst.withPlayer ? state.week.playCount ?? inst.count : inst.count;
  inst.hasNext = !inst.isQualifier && inst.sub < plays - 1 && inst.place !== 'CARD';
  if (inst.cat === 'hnq' && inst.withPlayer && inst.place === 'W') {          // Host-Nation-Qualifier gewonnen
    const ev = findEvent(state, inst.eventId, inst.year, inst.week), left = plays - 1 - inst.sub;
    state.hnq = { etId: ev.etId, year: inst.year };
    inst.hasNext = false;
    if (left > 0) book(state, ENTRY_FEE * left, `Rückerstattung ${left} Turnier${left > 1 ? 'e' : ''} (${inst.baseName})`, 'fee');
    const et = findEvent(state, ev.etId, inst.year, ev.week + 1) ?? { name: 'das ET-Event' };
    addNews(state, 'result', `🎟️ Qualifiziert für ${et.name}!`, 'Über den Host-Nation-Qualifier stehst du nächste Woche im Hauptfeld – melde dich in der Wochenansicht.');
  }
  if (!inst.withPlayer) return;
  const place = inst.place, prize = inst.prize, nsd = state.mode === 'nsd';
  const f = xpFactor(inst);
  // Teilnahme-Bonus: nach jedem Turnier kann trainiert werden
  inst.xp += grantXp(state, Math.round(XP_BASE.event * f));
  if (place === 'W') titleMomentum(state.player, inst.cat);
  if (place === 'W' || place === 'CARD') {
    inst.xp += grantXp(state, Math.round(XP_BASE.title * f));
  }
  if (nsd) nsdEventEnd(state, inst);
  else {
    if (prize) book(state, prize, `Preisgeld ${inst.name} (${placeLabel(place, inst.cat, inst.eventId)})`, 'prize');
  }
  trackTitle(state, inst);
  if (inst.isQualifier) {
    if (inst.cat === 'mastersq') {
      const ok = place === 'QUAL' || place === 'W';
      addNews(state, 'result', ok ? '🎟️ Qualifiziert für die Winmau World Masters!' : `${inst.name}: ausgeschieden`, ok ? 'Du stehst im 32er-Hauptfeld – melde dich nächste Woche an.' : 'Kein Platz im Hauptfeld.');
      if (!ok) state.results.unshift({ year: inst.year, week: inst.week, eventId: inst.eventId, name: inst.baseName, cat: inst.cat, place, prize: 0 });
      return;
    }
    if (inst.cat === 'wmreg') {
      const ok = place === 'QUAL' || place === 'W';
      addNews(state, 'result', ok ? `🎟️ WM-Ticket! ${inst.name}` : `${inst.name}: nicht qualifiziert`, ok ? 'Du spielst im Dezember die Weltmeisterschaft im Ally Pally.' : 'Kein WM-Platz – nächstes Jahr wieder.');
      if (ok) wmTicketArticle(state, inst.name);
      if (!ok) state.results.unshift({ year: inst.year, week: inst.week, eventId: inst.eventId, name: inst.baseName, cat: inst.cat, place, prize: 0 });
      return;
    }
    const et = findEvent(state, inst.eventId.replace('etq', 'et'), inst.year, inst.week + 1) ?? findEvent(state, inst.eventId.replace('etq', 'et'), inst.year, inst.week + 2);
    addNews(state, 'result', `${inst.name}: ${placeLabel(place)}`, place === 'QUAL' ? `Du stehst im Hauptfeld von ${et?.name ?? 'dem ET-Event'} (Letzte 48) – melde dich in der Event-Woche.` : 'Kein Platz im Hauptfeld.');
    if (place === 'NQ') state.results.unshift({ year: inst.year, week: inst.week, eventId: inst.eventId, name: inst.baseName, cat: inst.cat, place, prize: 0 });
    return;
  }
  for (const t of [state.stats.career, seasonStats(state, state.date.year)]) {
    t.events++; if (place === 'W') t.titles++; if (place === 'W' || place === 'F') t.finals++;
  }
  state.results.unshift({ year: inst.year, week: inst.week, eventId: inst.eventId, name: inst.name, cat: inst.cat, place, prize: nsd ? 0 : prize, stars: inst.stars ?? 0 });
  if (nsd) checkAchievements(state);
  const money = nsd ? (inst.stars ? `${inst.stars} ★` : '') : prize ? fmtEUR(prize) : '';
  if (place === 'W') addNews(state, 'result', `TITEL! ${inst.name} gewonnen`, `Preisgeld: ${money}.`);
  if (nsd) eventArticle(state, inst, place);
  if (place !== 'W' && place !== 'CARD') {
    const wTxt = inst.winner ? ` Turniersieger: ${getPlayer(state, inst.winner).name}.` : '';
    addNews(state, 'result', `${inst.name}: ${placeLabel(place, inst.cat, inst.eventId)}`, `${wTxt.trim()}${money ? ` Preisgeld: ${money}.` : ''}`.trim());
  }
}

// New Star Darts: Website-Artikel nach Titel / verlorenem Major-Finale / WM-Quali (Tour Card Holder Qualifier)
function finalInfo(state, inst) {
  const last = inst.rounds?.[inst.rounds.length - 1];
  const mine = id => id === 'P' || !!getPlayer(state, id)?.members?.includes?.('P');
  const m = last?.matches?.find(x => x.b && x.score && (mine(x.a) || mine(x.b)));
  if (!m) return {};
  const meA = mine(m.a);
  return { opp: getPlayer(state, meA ? m.b : m.a)?.name ?? null, score: meA ? m.score : [m.score[1], m.score[0]] };
}
function eventArticle(state, inst, place) {
  if (inst.eventId === 'wm-quali') { if (place === 'QUAL' || place === 'W') wmTicketArticle(state, 'den Tour Card Holder Qualifier'); return; }
  if (inst.isQualifier || inst.plNight) return;
  const big = MAJOR_CATS.includes(inst.cat) || inst.fmt === 'wm';
  if (place === 'W') titleArticle(state, { event: inst.name, cat: inst.cat, fmt: inst.fmt, stars: inst.stars ?? 0, titles: state.stats.career.titles, ...finalInfo(state, inst) });
  else if (place === 'F' && big) { const f = finalInfo(state, inst); if (f.opp) finalArticle(state, { event: inst.name, fmt: inst.fmt, ...f }); }
}

// New Star Darts: ★ auszahlen, Titel-Bonus (Star-Status, Fans)
function nsdEventEnd(state, inst) {
  const p = state.player;
  const gross = starPayout(inst.prize, p.star.level);
  inst.cut = managerCut(state, gross);                 // Manager-Provision
  inst.stars = gross - inst.cut;
  state.stars = (state.stars ?? 0) + inst.stars;
  if (inst.withPlayer) maybeInterviewNsd(state, inst, new RNG(state.rng));
  if (managerOf(state) && inst.place === 'W') addRel(p, 'manager', 4);
  if (inst.place === 'W' && !inst.isQualifier) {
    const bonus = titleStarBonus(p.star.level, inst.cat, inst.fmt);
    inst.star = Math.round(((inst.star ?? 0) + bonus) * 10) / 10;
    inst.titleStar = bonus;
    addStarProgress(state, bonus);
    inst.titleFans = titleFans(p, inst);                // Version 163: Titel zählen mehr, WM riesig
    p.satisfaction = Math.min(100, (p.satisfaction ?? 30) + (inst.cat === 'major' ? 10 : 3));   // Major-Titel: deutlich zufriedener
  }
}

// Abgeschlossenes Turnier schließen; nicht gespielte Rest-Turniere des Blocks laufen im Hintergrund
export function closeEvent(state) {
  const inst = state.activeEvent;
  if (!inst?.done) return;
  // Version 202: eigenes Bühnen-Turnier, das du nicht gewonnen hast – Sieger (und Finale) als News
  if (inst.stopAt === 1 && inst.survivors?.[0] && inst.survivors[0] !== 'P' && !isFloor(inst) && !inst.plNight && !inst.groups?.length) {
    const fin = inst.rounds[inst.rounds.length - 1]?.matches?.[0], w = inst.survivors[0], ru = fin && (fin.a === w ? fin.b : fin.a);
    const nm = id => (id === 'P' ? state.player.name : getPlayer(state, id)?.name ?? '?'), sc = fin?.score ? (fin.a === w ? fin.score : [...fin.score].reverse()).join(':') : '';
    addNews(state, 'result', `🏆 ${inst.name}: ${nm(w)} gewinnt`, ru ? `Finale: ${nm(w)} – ${nm(ru)}${sc ? ` ${sc}` : ''}.` : '');
  }
  const ev = findEvent(state, inst.eventId, inst.year, inst.week);
  let prev = inst;
  if (ev) for (let s = inst.sub + 1; s < inst.count && aiRunnable(state, ev); s++) prev = runAITournament(state, ev, s, { qualifiers: prev.survivors });
  state.activeEvent = null;
}

// ---- KI-Turniere im Hintergrund ----
export function runAITournament(state, ev, sub, ctx = {}) {
  const rng = new RNG(state.rng);
  const inst = newInstance(state, ev, sub, false, rng, ctx);
  if (ctx.walkover) inst.walkover = 'P';
  for (;;) {
    simRoundMatches(state, inst.rounds[inst.current], rng, inst);
    if (inst.current === inst.rounds.length - 1) break;
    advance(inst);
  }
  inst.done = true;
  settle(state, inst);
  inst.winner = inst.stopAt === 1 ? inst.survivors[0] : null;
  if (inst.walkover) {                                 // Version 163: Ausfall – Gegner kommt kampflos weiter, keine Punkte für dich
    const m = inst.rounds.flatMap(r => r.matches).find(x => x.walkover);
    addNews(state, 'result', `${inst.name}: kampflos verloren`, `Wegen ${state.week.blocked?.label ?? 'Verletzung'} konntest du nicht antreten – Freilos für ${getPlayer(state, m?.winner)?.name ?? 'deinen Gegner'}.`);
  }
  // Premier League / World Cup ohne Meldung: Spieler spielt automatisch mit
  if (inst.autoPlayer && inst.places?.P) {
    const nsd = state.mode === 'nsd';
    if (nsd) nsdEventEnd(state, inst);
    else {
      if (inst.prize) book(state, inst.prize, `Preisgeld ${inst.name} (${placeLabel(inst.place, inst.cat, inst.eventId)})`, 'prize');
    }
    trackTitle(state, inst);
    state.results.unshift({ year: inst.year, week: inst.week, eventId: inst.eventId, name: inst.name, cat: inst.cat, place: inst.place, prize: nsd ? 0 : inst.prize, stars: inst.stars ?? 0 });
    if (nsd) checkAchievements(state);
    const money = nsd ? (inst.stars ? `${inst.stars} ★` : '') : inst.prize ? fmtEUR(inst.prize) : '';
    addNews(state, 'result', `${inst.name}: ${placeLabel(inst.place, inst.cat, inst.eventId)} (automatisch simuliert)`, money ? `Preisgeld: ${money}.` : '');
    if (nsd) eventArticle(state, inst, inst.place);
  }
  return inst;
}

// Alle KI-relevanten Events der aktuellen Woche, die der Spieler nicht gespielt hat
export function simulateWeekAI(state) {
  const out = [];
  for (const ev of eventsInWeek(state, state.date.year, state.date.week)) {
    if (!AI_CATS.includes(ev.cat) || !ev.startsThisWeek || ev.id === state.week.eventId || state.week.extras?.includes(ev.id)) continue;
    let auto = MAJOR_CATS.includes(ev.cat) && autoPlayer(state, ev), walkover = false;
    if (auto && state.week.blocked) {                  // Version 163: Ausfall-Woche – PL: Freilos für den Gegner, World Cup: Nachrücker
      auto = false;
      if (ev.team) { const sub = wcWithdraw(state); addNews(state, 'result', `${ev.name}: ohne dich`, `Wegen ${state.week.blocked.label} springt ${sub?.name ?? 'ein Nachrücker'} für dich ins Team.`); }
      else { walkover = true; }
    }
    let prev = null;
    for (let s = 0; s < (ev.count ?? 1) && aiRunnable(state, ev); s++) out.push(prev = runAITournament(state, ev, s, { qualifiers: prev?.survivors, auto, walkover }));
  }
  return out;
}
