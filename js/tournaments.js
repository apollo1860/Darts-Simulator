// Turniere: Berechtigung, Meldung, Feld/Auslosung, Runden, Platzierungen, Preisgeld/OOM,
// Mehrfach-Events (z. B. CT-Wochenende mit 5 Turnieren, 4 Q-School-Tage) und KI-Hintergrund-Turniere (DOM-frei)
import { CATEGORIES, FORMATS, QSCHOOL_UK_NATIONS } from '../data/tournaments.js';
import { PRIZES } from '../data/prizemoney.js';
import { RNG } from './rng.js';
import { simulateMatch } from './matchEngine.js';
import { createMatch, throwDart, matchResult, wouldWinMatch } from './matchState.js';
import { BOGEY } from './board.js';
import { aiDart, aiSigma } from './throwModel.js';
import { eventCost, canAfford, book, ENTRY_FEE, levelPrice } from './finance.js';
import { getPlayer, playersOfTier, nonCardPros, DEV_MAX_AGE } from './world.js';
import { addXp, addClutch, expLabel, perf, XP_FACTOR, XP_BASE, POINTS_PER_LEVEL } from './player.js';
import { addNews } from './news.js';
import { seasonStats } from './state.js';
import { findEvent, eventsInWeek } from './calendar.js';
import { buildRounds, pairWinners, placeOf, buildGroupRounds, groupKoMatches, groupPlace } from './bracket.js';
import { MAJOR_CATS, majorField, majorEligibility, autoPlayer, wcTeams, scorePlNight, qualOf, teamPrizeShare } from './majors.js';
import { addMoney, orderOfMerit, rankOf, devHolders } from './rankings.js';
import { fmtEUR } from './util.js';
import { sponsorEventPayout } from './sponsors.js';
import { routeTarget, scriptedHit } from './decisions.js';
import { addEventFatigue } from './training.js';
import { trackTitle, recordChampion } from './history.js';
import { xpMult } from './staff.js';
import { maybeInterview } from './interviews.js';
import { matchMilestones, titleMilestones } from './milestones.js';
import { addRivalToField, isRival, rivalMeeting, rivalTitle, rivalCard } from './rival.js';
import { stageFactor, applyStage, updateMomentum, titleMomentum } from './form.js';

export const IMPLEMENTED_PHASE = 5;
export const AI_CATS = ['qschool', 'challenge', 'dev', 'pc', 'et', 'major', 'ws', 'pl', 'wdf', 'wmqs'];   // laufen ohne Spieler im Hintergrund

// Inhaltliche Berechtigung
export function eligibility(state, ev) {
  const p = state.player, y = state.date.year;
  const card = p.tour === 'tour';
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
    case 'challenge':
      if (card) return { ok: false, reason: 'Tourcard-Holder sind ausgeschlossen' };
      return p.qschoolYear === y ? { ok: true } : { ok: false, reason: 'Q-School-Teilnahme nötig' };
    case 'dev':
      if (p.age > DEV_MAX_AGE) return { ok: false, reason: 'Nur bis 23 Jahre' };
      if (card) return devHolders(state, y).includes(p) ? { ok: true } : { ok: false, reason: 'Holder nur außerhalb der PDC-Top-64' };
      return p.qschoolYear === y ? { ok: true } : { ok: false, reason: 'Q-School-Teilnahme nötig' };
    case 'pc': return card ? { ok: true } : { ok: false, reason: 'Tourcard nötig' };
    case 'et': return card || hnqQualified(state, ev) ? { ok: true } : { ok: false, reason: 'Tourcard oder Host-Nation-Qualifier nötig' };
    default: return MAJOR_CATS.includes(ev.cat) ? majorEligibility(state, ev) : { ok: false, reason: 'Qualifikation nötig' };
  }
}

// Gesamtstatus für die UI
export function eventStatus(state, ev, n = null) {
  const cost = eventCost(ev, ev.pick ? n ?? 1 : null, state.player.level ?? 1);
  const phase = CATEGORIES[ev.cat]?.phase ?? 9;
  const elig = eligibility(state, ev);
  let playable = true, reason = '';
  if (state.week.blocked) { playable = false; reason = `Ausfall: ${state.week.blocked.label}`; }
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
  L64: 'Letzte 64', L128: 'Letzte 128', L256: 'Letzte 256', CARD: 'Tourcard gewonnen',
  QUAL: 'Qualifiziert', NQ: 'Nicht qualifiziert', G3: 'Gruppenphase (3.)', G4: 'Gruppenphase (4.)',
};
export const placeLabel = k => PLACE_LABEL[k] ?? k;

const fmtKey = (ev, sub = 0) => ev.subFmts?.[sub] ?? ev.fmt ?? ev.cat;
// Ranglisten, in die das Preisgeld fließt
const oomTypes = (ev, sub) => {
  if (ev.cat === 'ws' && ev.fmt === 'ws') return ['ws'];                // World-Series-Wertung (für die Finals)
  if (ev.noOom || FORMATS[fmtKey(ev, sub)].stopAt > 1) return [];
  if (ev.cat === 'major') return ['pdc'];
  if (ev.cat === 'et' && sub === 1) return ['pdc', 'protour', 'eto'];
  if (ev.cat === 'challenge' || ev.cat === 'dev') return [ev.cat];
  if (ev.cat === 'pc' || ev.cat === 'et') return ['pdc', 'protour'];
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
// ET: Top 16 der PDC Order of Merit sind fürs Hauptfeld gesetzt
export function etSeeds(state, includeP) {
  return orderOfMerit(state, 'pdc').map(x => x.p.id).filter(id => includeP || id !== 'P').slice(0, FORMATS.et.seeds);
}

function seededField(state, ev, withPlayer, rng, sub = 0, ctx = {}) {
  const y = state.date.year;
  if (MAJOR_CATS.includes(ev.cat)) return majorField(state, ev, withPlayer || !!ctx.auto);
  if (ev.cat === 'pc') {
    let ids = orderOfMerit(state, 'pdc').map(x => x.p.id).filter(id => withPlayer || id !== 'P').slice(0, FORMATS.pc.field);
    if (withPlayer && !ids.includes('P')) ids[ids.length - 1] = 'P';
    return rng.shuffle(ids);                                  // PC: freie Auslosung
  }
  if (ev.cat === 'et') {
    const seeds = etSeeds(state, withPlayer || !!ctx.playerIn);
    if (sub === 0) {
      const ids = orderOfMerit(state, 'pdc').map(x => x.p.id).filter(id => !seeds.includes(id) && (withPlayer || id !== 'P'));
      return rng.shuffle(ids);
    }
    return [...seeds, ...rng.shuffle([...(ctx.qualifiers ?? [])])];
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
  if (ev.cat === 'hnq') {                    // Gastgebernation: Spieler ohne Karte, DDV/lokal – keine Setzliste
    const pool = rng.shuffle([...nonCardPros(state), ...playersOfTier(state, 'ddv', 'local')].filter(p => p.nation === ev.country).map(p => p.id));
    ids = pool.slice(0, FORMATS.hnq.field - (withPlayer ? 1 : 0));
    return rng.shuffle(withPlayer ? ['P', ...ids] : ids);
  }
  if (ev.cat === 'wdf') {                    // offene Auslosung: Spieler ohne Karte + DDV-Pool, keine Setzliste
    const pool = rng.shuffle([...nonCardPros(state), ...playersOfTier(state, 'ddv')].map(p => p.id));
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
    ids = nonCardPros(state).filter(p => QSCHOOL_UK_NATIONS.includes(p.nation) === uk).map(p => p.id);
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
  const fk = fmtKey(ev, sub), fmt = FORMATS[fk];
  let groups = null, rounds;
  if (ev.groups) {        // Grand Slam: 4 Töpfe à 8 → 8 Gruppen
    const pots = [0, 1, 2, 3].map(k => rng.shuffle(field.slice(k * 8, k * 8 + 8)));
    groups = Array.from({ length: 8 }, (_, g) => pots.map(p => p[g]).filter(Boolean));
    rounds = buildGroupRounds(groups, fmt);
  } else rounds = buildRounds(field, fmt);
  return {
    groups, teams: ev.team ? wcTeams(state) : null, autoPlayer: !!ctx.auto, plNight: ev.plNight ?? null,
    eventId: ev.id, cat: ev.cat, fmt: fk, name: subName(ev, sub), baseName: ev.name,
    city: ev.city, country: ev.country, year: state.date.year, week: state.date.week,
    count: ev.count ?? 1, sub, subLabel: subLabel(ev, sub), oom: oomTypes(ev, sub),
    isQualifier: !!ev.qualifier && sub === 0, cards: !!fmt.cards,
    prizes: prizeTable(ev, sub), stopAt: fmt.stopAt ?? 1, fieldSize: field.length,
    big: withPlayer ? orderOfMerit(state, 'pdc').slice(0, 16).map(x => x.p.id).filter(id => id !== 'P') : [],
    ...(ev.cat === 'wdf' && withPlayer ? { xpBoost: Math.round(rng.float(1.2, 1.6) * 20) / 20 } : {}),
    rounds,
    current: 0, playerAlive: withPlayer, withPlayer, done: false, place: null, prize: 0, xp: 0,
    lastMatch: null, live: null, cardWon: false, hasNext: false, survivors: null,
  };
}

// Melden: Kosten buchen, Feld auslosen, Instanz anlegen
// Über den Host-Nation-Qualifier fürs ET-Hauptfeld qualifiziert?
export const hnqQualified = (state, ev) => state.hnq?.etId === ev.id && state.hnq.year === state.date.year;

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
    addNews(state, 'info', `Gemeldet: ${ev.name}`, `4 Turniertage – wer an einem Tag das Halbfinale erreicht, gewinnt eine Tourcard. Mit der Teilnahme bist du ${state.date.year} für die Challenge Tour${state.player.age <= DEV_MAX_AGE ? ' und die Development Tour' : ''} berechtigt.`);
  }
  if (ev.extra) (state.week.extras ??= []).push(ev.id);
  else state.week = { ...state.week, played: true, eventId: ev.id, extras: state.week.extras ?? [], playCount: n };   // Trainingsflag bleibt
  if (ev.qualifier && hnqQualified(state, ev) && !etSeeds(state, true).includes('P')) {
    // Host-Nation-Qualifier gewonnen: ET-Qualifikation läuft ohne den Spieler, er ersetzt einen der 32 Qualifikanten
    const q = runAITournament(state, ev, 0);
    state.activeEvent = newInstance(state, ev, 1, true, rng, { qualifiers: [...q.survivors.slice(0, -1), 'P'] });
  } else if (ev.qualifier && etSeeds(state, true).includes('P')) {
    // Gesetzt: Qualifikation läuft ohne den Spieler, direkt ins Hauptfeld
    const q = runAITournament(state, ev, 0, { playerIn: true });
    state.activeEvent = newInstance(state, ev, 1, true, rng, { qualifiers: q.survivors });
    addNews(state, 'info', `${ev.name}: gesetzt`, `Als Top 16 der PDC Order of Merit (Platz ${rankOf(state, 'pdc', 'P')}) bist du direkt im Hauptfeld.`);
  } else state.activeEvent = newInstance(state, ev, 0, true, rng);
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

export function playerMatch(inst) {
  return inst.rounds[inst.current]?.matches.find(m => (m.a === 'P' || m.b === 'P') && !m.bye) ?? null;
}

// Leistungsdaten; World Cup: Teamwerte (Durchschnitt beider Spieler)
// Bühne (Majors, große Namen): Erfahrung zählt zusätzlich (form.js)
const attrsOf = (state, id, inst = state.activeEvent) => {
  const t = inst?.teams?.[id];
  const base = t ? { ...t.attrs, exp: t.exp } : perf(getPlayer(state, id));
  const m = inst?.rounds?.[inst.current]?.matches.find(x => x.a === id || x.b === id);
  return applyStage(base, stageFactor(inst, m?.a, m?.b));
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
    inst.live = { m: createMatch(inst.rounds[inst.current].format, rng.chance(0.5) ? 0 : 1), me: m.a === 'P' ? 0 : 1 };
  }
  return inst.live;
}

// Ein KI-Dart im Live-Match (für den Gegner oder beim Simulieren)
export function liveAiDart(state, side) {
  const inst = state.activeEvent, m = playerMatch(inst);
  const id = side === 0 ? m.a : m.b;
  return aiDart(inst.live.m, side, attrsOf(state, id), new RNG(state.rng));
}

// Eine komplette Aufnahme per KI (Schnellsimulation zum Zuschauen). Rückgabe: letztes Ereignis
export function liveAiVisit(state) {
  const inst = state.activeEvent, pm = playerMatch(inst), lm = inst.live.m;
  const rng = new RNG(state.rng), side = lm.turn, a = attrsOf(state, side === 0 ? pm.a : pm.b);
  const sig = aiSigma(a), mult = modMult(inst.live, side);
  let ev = null;
  const live = inst.live, mine = side === live.me;
  while (!lm.done && lm.turn === side && !(ev && ev.legEnd)) {
    const forced = mine ? routeTarget(live, lm.rem[side], lm.visit.darts.length) : null;
    const scripted = mine ? scriptedHit(live, lm.visit.start, lm.visit.darts.length) : null;
    ev = throwDart(lm, scripted ?? aiDart(lm, side, a, rng, sig, mult, forced).hit);
  }
  if (mine) live.route = null;
  tickMods(inst.live, side);
  return ev;
}

// XP-/Clutch-Faktor des Turniers; WDF: zufälliger Boost ×1,2–1,6 je Turnier (inst.xpBoost)
const xpFactor = inst => inst.xpBoost ?? XP_FACTOR[inst.cat] ?? 1;

// Ein einzelner Dart im Live-Match (für die Scheiben-Anzeige bei Gegner-Matchdarts)
export function liveDartStep(state) {
  const inst = state.activeEvent, pm = playerMatch(inst), live = inst.live, lm = live.m;
  const side = lm.turn, a = attrsOf(state, side === 0 ? pm.a : pm.b), mine = side === live.me;
  const forced = mine ? routeTarget(live, lm.rem[side], lm.visit.darts.length) : null;
  const scripted = mine ? scriptedHit(live, lm.visit.start, lm.visit.darts.length) : null;
  const dart = aiDart(lm, side, a, new RNG(state.rng), aiSigma(a), modMult(live, side), forced);
  if (scripted) dart.hit = scripted;
  const ev = throwDart(lm, dart.hit);
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
  const inst = state.activeEvent, pm = playerMatch(inst), lm = inst.live.m;
  const rng = new RNG(state.rng);
  const at = [attrsOf(state, pm.a), attrsOf(state, pm.b)], sig = at.map(a => aiSigma(a));
  while (!lm.done) throwDart(lm, aiDart(lm, lm.turn, at[lm.turn], rng, sig[lm.turn]).hit);
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
  const got = Math.round(xp * xpMult(state));
  const ups = addXp(state.player, got);
  if (ups) addNews(state, 'xp', `⬆️ Level ${state.player.level}! +${ups * POINTS_PER_LEVEL} Attributpunkte`, 'Verteile sie im Spielerprofil oder direkt nach dem Turnier.');
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
  matchMilestones(state, s, won);
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

// Alle offenen KI-Matches der aktuellen Runde simulieren
function simRoundMatches(state, round, rng, inst) {
  for (const m of round.matches) {
    if (m.winner || (!inst.autoPlayer && (m.a === 'P' || m.b === 'P'))) continue;
    applyResult(m, simulateMatch(attrsOf(state, m.a, inst), attrsOf(state, m.b, inst), round.format, rng));
  }
}
export function simulateRoundAI(state) {
  const inst = state.activeEvent;
  simRoundMatches(state, inst.rounds[inst.current], new RNG(state.rng), inst);
}

// Nächste Runde anlegen (Gruppen → K.-o. bzw. Gewinner paaren)
function advance(inst) {
  inst.current++;
  const r = inst.rounds[inst.current], prev = inst.rounds[inst.current - 1];
  if (r.isGroup) return;
  r.matches = prev.isGroup ? groupKoMatches(inst.rounds, inst.groups) : pairWinners(prev);
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
  const year = state.date.year;
  for (const id of ids) {
    const place = survivors.includes(id) ? (inst.cards ? 'CARD' : inst.stopAt > 1 ? 'QUAL' : 'W')
      : inst.isQualifier ? 'NQ' : ((inst.groups && groupPlace(inst.rounds, inst.groups, id)) || placeOf(inst.rounds, id));
    (inst.places ??= {})[id] = place;
    let prize = inst.prizes[place] ?? 0;
    if (inst.teams && id === 'P') prize = Math.round(prize * teamPrizeShare);   // World Cup: Preisgeld wird geteilt
    if (prize) for (const t of inst.oom) addMoney(state, t, id, prize, year);
    if (id === 'P') { inst.place = place; inst.prize = prize; }
  }
  if (inst.eventId === 'wm-quali') qualOf(state).wmqSurvivors = survivors;
  if (inst.cat === 'wmqs') {                                   // Q-School-WM-Qualifier: Sieger spielt die WM
    qualOf(state).wmQsWinner = survivors[0];
    const w = getPlayer(state, survivors[0]);
    addNews(state, survivors[0] === 'P' ? 'result' : 'info', survivors[0] === 'P' ? '🎟️ Du spielst die Weltmeisterschaft!' : `WM-Qualifier: ${w?.name ?? '?'} löst das WM-Ticket`,
      'Sieger des WM-Qualifiers der Q-School-Teilnehmer – Startplatz bei der WM im Dezember.');
  }
  if (survivors.length === 1 && !inst.isQualifier && !inst.cards && inst.cat !== 'local' && inst.fmt !== 'pln') {
    recordChampion(state, inst, survivors[0]);
    rivalTitle(state, inst, survivors[0]);
  }
  if (inst.fmt === 'pln') scorePlNight(state, inst);
  if (inst.cards) {                                          // Q-School: Tourcards
    for (const id of survivors) awardCard(state, id, year + 1, `${inst.baseName} ${year}`);
    addNews(state, 'draw', `${inst.name}: Tourcards vergeben`, survivors.map(id => getPlayer(state, id).name).join(', '));
  }
}

export function awardCard(state, id, until, via) {
  if (id === 'P') {
    const p = state.player;
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
  inst.hasNext = inst.isQualifier ? inst.place === 'QUAL' : inst.sub < plays - 1 && inst.place !== 'CARD';
  if (inst.cat === 'hnq' && inst.withPlayer && inst.place === 'W') {          // Host-Nation-Qualifier gewonnen
    const ev = findEvent(state, inst.eventId, inst.year, inst.week), left = plays - 1 - inst.sub;
    state.hnq = { etId: ev.etId, year: inst.year };
    inst.hasNext = false;
    if (left > 0) book(state, levelPrice(ENTRY_FEE, state.player.level ?? 1) * left, `Rückerstattung ${left} Turnier${left > 1 ? 'e' : ''} (${inst.baseName})`, 'fee');
    const et = findEvent(state, ev.etId, inst.year, ev.week + 1) ?? { name: 'das ET-Event' };
    addNews(state, 'result', `🎟️ Qualifiziert für ${et.name}!`, 'Über den Host-Nation-Qualifier stehst du nächste Woche im Hauptfeld – melde dich in der Wochenansicht.');
  }
  if (!inst.withPlayer) return;
  const place = inst.place, prize = inst.prize;
  const f = xpFactor(inst);
  // Teilnahme-Bonus: nach jedem Turnier kann trainiert werden
  inst.xp += grantXp(state, Math.round(XP_BASE.event * f));
  if (place === 'W') titleMomentum(state.player, inst.cat);
  if (place === 'W' || place === 'CARD') {
    inst.xp += grantXp(state, Math.round(XP_BASE.title * f));
  }
  if (prize) book(state, prize, `Preisgeld ${inst.name} (${placeLabel(place)})`, 'prize');
  sponsorEventPayout(state, inst);
  trackTitle(state, inst);
  titleMilestones(state, inst);
  addEventFatigue(state, inst);
  if (inst.isQualifier) {
    addNews(state, 'result', `${inst.name}: ${placeLabel(place)}`, place === 'QUAL' ? 'Du stehst im Hauptfeld (Letzte 48).' : 'Kein Platz im Hauptfeld.');
    if (place === 'NQ') state.results.unshift({ year: inst.year, week: inst.week, eventId: inst.eventId, name: inst.baseName, cat: inst.cat, place, prize: 0 });
    return;
  }
  for (const t of [state.stats.career, seasonStats(state, state.date.year)]) {
    t.events++; if (place === 'W') t.titles++; if (place === 'W' || place === 'F') t.finals++;
  }
  state.results.unshift({ year: inst.year, week: inst.week, eventId: inst.eventId, name: inst.name, cat: inst.cat, place, prize });
  maybeInterview(state, inst);
  if (place === 'W') addNews(state, 'result', `TITEL! ${inst.name} gewonnen`, `Preisgeld: ${fmtEUR(prize)}.`);
  else if (place !== 'CARD') {
    const wTxt = inst.winner ? ` Turniersieger: ${getPlayer(state, inst.winner).name}.` : '';
    addNews(state, 'result', `${inst.name}: ${placeLabel(place)}`, `${wTxt.trim()}${prize ? ` Preisgeld: ${fmtEUR(prize)}.` : ''}`.trim());
  }
}

// Abgeschlossenes Turnier schließen; nicht gespielte Rest-Turniere des Blocks laufen im Hintergrund
export function closeEvent(state) {
  const inst = state.activeEvent;
  if (!inst?.done) return;
  const ev = findEvent(state, inst.eventId, inst.year, inst.week);
  let prev = inst;
  if (ev && ev.cat !== 'hnq') for (let s = inst.sub + 1; s < inst.count; s++) prev = runAITournament(state, ev, s, { qualifiers: prev.survivors });
  state.activeEvent = null;
}

// ---- KI-Turniere im Hintergrund ----
export function runAITournament(state, ev, sub, ctx = {}) {
  const rng = new RNG(state.rng);
  const inst = newInstance(state, ev, sub, false, rng, ctx);
  for (;;) {
    simRoundMatches(state, inst.rounds[inst.current], rng, inst);
    if (inst.current === inst.rounds.length - 1) break;
    advance(inst);
  }
  inst.done = true;
  settle(state, inst);
  inst.winner = inst.stopAt === 1 ? inst.survivors[0] : null;
  // Premier League / World Cup ohne Meldung: Spieler spielt automatisch mit
  if (inst.autoPlayer && inst.places?.P) {
    if (inst.prize) book(state, inst.prize, `Preisgeld ${inst.name} (${placeLabel(inst.place)})`, 'prize');
    sponsorEventPayout(state, inst);
    trackTitle(state, inst);
    titleMilestones(state, inst);
    addEventFatigue(state, inst);
    state.results.unshift({ year: inst.year, week: inst.week, eventId: inst.eventId, name: inst.name, cat: inst.cat, place: inst.place, prize: inst.prize });
    addNews(state, 'result', `${inst.name}: ${placeLabel(inst.place)} (automatisch simuliert)`, inst.prize ? `Preisgeld: ${fmtEUR(inst.prize)}.` : '');
  }
  return inst;
}

// Alle KI-relevanten Events der aktuellen Woche, die der Spieler nicht gespielt hat
export function simulateWeekAI(state) {
  const out = [];
  for (const ev of eventsInWeek(state, state.date.year, state.date.week)) {
    if (!AI_CATS.includes(ev.cat) || !ev.startsThisWeek || ev.id === state.week.eventId || state.week.extras?.includes(ev.id)) continue;
    const auto = MAJOR_CATS.includes(ev.cat) && autoPlayer(state, ev);
    let prev = null;
    for (let s = 0; s < (ev.count ?? 1); s++) out.push(prev = runAITournament(state, ev, s, { qualifiers: prev?.survivors, auto }));
  }
  return out;
}
