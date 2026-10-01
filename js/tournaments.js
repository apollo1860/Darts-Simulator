// Turniere: Berechtigung, Meldung, Auslosung, Runden, Platzierungen (DOM-frei)
import { CATEGORIES, FORMATS } from '../data/tournaments.js';
import { PRIZES } from '../data/prizemoney.js';
import { RNG } from './rng.js';
import { simulateMatch } from './matchEngine.js';
import { eventCost, canAfford, book } from './finance.js';
import { getPlayer, playersOfTier } from './world.js';
import { addXp, XP_FACTOR, XP_BASE } from './player.js';
import { addNews } from './news.js';
import { seasonStats } from './state.js';
import { findEvent } from './calendar.js';
import { fmtEUR } from './util.js';

export const IMPLEMENTED_PHASE = 1;

// Inhaltliche Berechtigung (Vorbereitung für Phase 3–5)
export function eligibility(state, ev) {
  const p = state.player;
  switch (ev.cat) {
    case 'local': return { ok: true };
    case 'qschool': return p.tour === 'tour' ? { ok: false, reason: 'Nur ohne Tourcard' } : { ok: true };
    case 'challenge':
      if (p.tour === 'tour') return { ok: false, reason: 'Tourcard-Holder sind ausgeschlossen' };
      return p.qschoolYear === state.date.year ? { ok: true } : { ok: false, reason: 'Q-School-Teilnahme nötig' };
    case 'dev':
      if (p.tour === 'tour') return { ok: false, reason: 'Tourcard-Holder sind ausgeschlossen' };
      if (p.age > 23) return { ok: false, reason: 'Nur bis 23 Jahre' };
      return p.qschoolYear === state.date.year ? { ok: true } : { ok: false, reason: 'Q-School-Teilnahme nötig' };
    case 'pc': return p.tour === 'tour' ? { ok: true } : { ok: false, reason: 'Tourcard nötig' };
    case 'et': return p.tour === 'tour' ? { ok: true } : { ok: false, reason: 'Tourcard + Qualifikation nötig' };
    case 'pl': return { ok: false, reason: 'Nur auf Einladung' };
    default: return { ok: false, reason: 'Qualifikation nötig' };
  }
}

// Gesamtstatus für die UI
export function eventStatus(state, ev) {
  const cost = eventCost(ev);
  const phase = CATEGORIES[ev.cat]?.phase ?? 9;
  const elig = eligibility(state, ev);
  let playable = true, reason = '';
  if (ev.startsThisWeek === false) { playable = false; reason = 'Läuft bereits'; }
  else if (state.week.played) { playable = false; reason = state.week.eventId === ev.id ? 'Gespielt' : 'Diese Woche schon gespielt'; }
  else if (!elig.ok) { playable = false; reason = elig.reason; }
  else if (phase > IMPLEMENTED_PHASE) { playable = false; reason = `Ab Phase ${phase} spielbar`; }
  else if (!canAfford(state, cost.total)) { playable = false; reason = 'Budget reicht nicht'; }
  return { playable, reason, cost, eligible: elig.ok };
}

// Platzierungsschlüssel nach Ausscheiden in Runde i (0-basiert) von R Runden
const PLACE_KEYS = ['F', 'SF', 'QF', 'L16', 'L32', 'L64', 'L128'];
const PLACE_LABEL = { W: 'Sieger', F: 'Finale', SF: 'Halbfinale', QF: 'Viertelfinale', L16: 'Achtelfinale', L32: 'Letzte 32', L64: 'Letzte 64', L128: 'Letzte 128' };
export const placeLabel = k => PLACE_LABEL[k] ?? k;
const placeKey = (i, R) => PLACE_KEYS[R - 1 - i];

function prizeTable(ev) {
  if (ev.cat === 'local') {
    const W = ev.prizeWin, s = PRIZES.local.shares;
    return { W, F: Math.round(W * s.F / 5) * 5, SF: Math.round(W * s.SF / 5) * 5 };
  }
  return PRIZES[ev.cat] ?? {};
}

// Melden: Kosten buchen, Feld auslosen, Instanz anlegen
export function enterEvent(state, eventId) {
  const ev = findEvent(state, eventId);
  if (!ev) throw new Error('Event nicht gefunden');
  const st = eventStatus(state, ev);
  if (!st.playable) throw new Error(st.reason);
  const rng = new RNG(state.rng);
  const fmt = FORMATS[ev.cat];

  if (st.cost.fee) book(state, -st.cost.fee, `Anmeldegebühr ${ev.name}`, 'fee');
  if (st.cost.travel) book(state, -st.cost.travel, `Reise ${ev.city}`, 'travel');

  const pool = rng.shuffle(playersOfTier(state, 'local').map(p => p.id));
  const field = rng.shuffle(['P', ...pool.slice(0, fmt.field - 1)]);
  const first = [];
  for (let i = 0; i < field.length; i += 2) first.push({ a: field[i], b: field[i + 1], winner: null, score: null });

  state.week = { played: true, eventId: ev.id };
  state.activeEvent = {
    eventId: ev.id, cat: ev.cat, name: ev.name, city: ev.city, country: ev.country,
    year: state.date.year, week: state.date.week,
    prizes: prizeTable(ev),
    rounds: fmt.rounds.map((r, i) => ({ name: r.name, format: r.format, matches: i === 0 ? first : [] })),
    current: 0, playerAlive: true, done: false, place: null, prize: 0, xp: 0, lastMatch: null,
  };
  return state.activeEvent;
}

export function playerMatch(inst) {
  return inst.rounds[inst.current]?.matches.find(m => m.a === 'P' || m.b === 'P') ?? null;
}

const attrsOf = (state, id) => getPlayer(state, id).attrs;

// Eigenes Match simulieren (Ergebnis wird gespeichert und zurückgegeben)
export function simulatePlayerMatch(state) {
  const inst = state.activeEvent;
  const m = playerMatch(inst);
  if (!m || m.winner) return null;
  const rng = new RNG(state.rng);
  const fmt = inst.rounds[inst.current].format;
  const res = simulateMatch(attrsOf(state, m.a), attrsOf(state, m.b), fmt, rng);
  applyResult(m, res);
  recordPlayerMatch(state, inst, m, res);
  return res;
}

function applyResult(m, res) {
  m.winner = res.winner === 0 ? m.a : m.b;
  m.score = res.score;
  m.avg = res.stats.map(s => Math.round(s.avg * 10) / 10);
}

function recordPlayerMatch(state, inst, m, res) {
  const me = m.a === 'P' ? 0 : 1, s = res.stats[me], o = res.stats[1 - me];
  const won = m.winner === 'P';
  for (const t of [state.stats.career, seasonStats(state, state.date.year)]) {
    t.matches++; if (won) t.wins++;
    t.legsWon += res.legsTotal[me]; t.legsLost += res.legsTotal[1 - me];
    t.points += s.points; t.darts += s.darts;
    t.s180 += s.s180; t.s140 += s.s140; t.s100 += s.s100;
    t.coHit += s.coHit; t.coAtt += s.coAtt;
    t.hiFinish = Math.max(t.hiFinish, s.hiFinish);
    if (s.bestLeg && (!t.bestLeg || s.bestLeg < t.bestLeg)) t.bestLeg = s.bestLeg;
  }
  const f = XP_FACTOR[inst.cat] ?? 1;
  const xp = Math.round((XP_BASE.match + (won ? XP_BASE.win : 0) + XP_BASE.perRound * inst.current) * f);
  inst.xp += xp;
  const pts = addXp(state.player, xp);
  if (pts) addNews(state, 'xp', `+${pts} Attributpunkt${pts > 1 ? 'e' : ''}`, 'Verteile sie im Spielerprofil.');
  if (!won) inst.playerAlive = false;
  inst.lastMatch = {
    round: inst.rounds[inst.current].name, opp: me ? m.a : m.b, won,
    score: me ? [...res.score].reverse() : res.score, me: s, opp_: o, xp,
  };
}

// Alle offenen KI-Matches der aktuellen Runde simulieren
export function simulateRoundAI(state) {
  const inst = state.activeEvent, rng = new RNG(state.rng);
  const round = inst.rounds[inst.current];
  for (const m of round.matches) {
    if (m.winner || m.a === 'P' || m.b === 'P') continue;
    applyResult(m, simulateMatch(attrsOf(state, m.a), attrsOf(state, m.b), round.format, rng));
  }
}

export const roundComplete = inst => inst.rounds[inst.current].matches.every(m => m.winner);

// Nächste Runde auslosen bzw. Turnier abschließen
export function nextRound(state) {
  const inst = state.activeEvent;
  if (!roundComplete(inst)) return;
  const winners = inst.rounds[inst.current].matches.map(m => m.winner);
  if (winners.length === 1) return finishEvent(state, winners[0]);
  const next = [];
  for (let i = 0; i < winners.length; i += 2) next.push({ a: winners[i], b: winners[i + 1], winner: null, score: null });
  inst.current++;
  inst.rounds[inst.current].matches = next;
}

// Komplette Runde (eigenes Match + KI) spielen
export function playRound(state) {
  const res = simulatePlayerMatch(state);
  simulateRoundAI(state);
  return res;
}

// Nach Ausscheiden: Rest des Turniers simulieren
export function simulateRest(state) {
  const inst = state.activeEvent;
  while (!inst.done) {
    if (playerMatch(inst) && !playerMatch(inst).winner) simulatePlayerMatch(state);
    simulateRoundAI(state);
    nextRound(state);
  }
}

function finishEvent(state, winnerId) {
  const inst = state.activeEvent, R = inst.rounds.length;
  let place = 'W';
  if (winnerId !== 'P') {
    const i = inst.rounds.findIndex(r => r.matches.some(m => (m.a === 'P' || m.b === 'P') && m.winner !== 'P'));
    place = placeKey(i, R);
  }
  const prize = inst.prizes[place] ?? 0;
  inst.done = true; inst.place = place; inst.prize = prize; inst.winner = winnerId;

  const f = XP_FACTOR[inst.cat] ?? 1;
  if (place === 'W') {
    const bonus = Math.round(XP_BASE.title * f);
    inst.xp += bonus;
    const pts = addXp(state.player, bonus);
    if (pts) addNews(state, 'xp', `+${pts} Attributpunkt${pts > 1 ? 'e' : ''}`, 'Verteile sie im Spielerprofil.');
  }
  if (prize) book(state, prize, `Preisgeld ${inst.name} (${placeLabel(place)})`, 'prize');

  for (const t of [state.stats.career, seasonStats(state, state.date.year)]) {
    t.events++; if (place === 'W') t.titles++; if (place === 'W' || place === 'F') t.finals++;
  }
  state.results.unshift({ year: inst.year, week: inst.week, eventId: inst.eventId, name: inst.name, cat: inst.cat, place, prize });

  const wName = getPlayer(state, winnerId).name;
  if (place === 'W') addNews(state, 'result', `TITEL! ${inst.name} gewonnen`, `Preisgeld: ${fmtEUR(prize)}.`);
  else addNews(state, 'result', `${inst.name}: ${placeLabel(place)}`,
    `Turniersieger: ${wName}.${prize ? ` Preisgeld: ${fmtEUR(prize)}.` : ''}`);
}

// Abgeschlossenes Turnier schließen
export function closeEvent(state) {
  if (state.activeEvent?.done) state.activeEvent = null;
}
