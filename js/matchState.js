// Dartgenauer Match-Zustand: 501 Double Out, Bust, Legs/Sets, Statistik (DOM-frei, serialisierbar)

const newStats = () => ({ points: 0, darts: 0, s180: 0, s140: 0, s100: 0, coHit: 0, coAtt: 0, hiFinish: 0, legsWon: 0, bestLeg: 0 });

export function createMatch(format, starter = 0) {
  return {
    format, sets: [0, 0], legs: [0, 0], rem: [501, 501],
    turn: starter, legStarter: starter, setStarter: starter, legIdx: 0,
    visit: { darts: [], start: 501 }, legDarts: [0, 0],
    legPoints: [0, 0], legVisits: [[], []], lastLeg: null,
    stats: [newStats(), newStats()], last: [null, null], log: [],
    done: false, winner: null,
  };
}

const legsTo = m => m.format.legs;
const setsTo = m => m.format.sets || 1;

// Gewinnt Spieler i mit dem aktuellen Leg das Match?
export const wouldWinMatch = (m, i) => m.legs[i] + 1 >= legsTo(m) && (!m.format.sets || m.sets[i] + 1 >= setsTo(m));
// Entscheidungsleg (beide einen Leg vom Matchgewinn entfernt)
export const isDecider = m => wouldWinMatch(m, 0) && wouldWinMatch(m, 1);
export const dartsLeft = m => 3 - m.visit.darts.length;
// Doppel-Chance mit einem Dart?
export const onDouble = r => r === 50 || (r <= 40 && r % 2 === 0);

function addScoreBand(s, pts) {
  if (pts === 180) s.s180++;
  else if (pts >= 140) s.s140++;
  else if (pts >= 100) s.s100++;
}

// Einen Dart werten. hit = {label, score, double}. Rückgabe: Ereignis
export function throwDart(m, hit) {
  if (m.done) return null;
  m.legPoints ??= [0, 0]; m.legVisits ??= [[], []];   // ältere Spielstände
  const t = m.turn, s = m.stats[t];
  const r = m.rem[t];
  const after = r - hit.score;
  m.visit.darts.push(hit.label);
  m.legDarts[t]++;
  if (onDouble(r)) s.coAtt++;
  const ev = { player: t, hit, bust: false, checkout: false, visitEnd: false, legEnd: false, matchEnd: false };

  if (after < 0 || after === 1 || (after === 0 && !hit.double)) {
    ev.bust = true;
    m.rem[t] = m.visit.start;
    endVisit(m, ev, 0);
    return ev;
  }
  m.rem[t] = after;
  if (after === 0) {
    ev.checkout = true;
    s.coHit++;
    s.hiFinish = Math.max(s.hiFinish, m.visit.start);
    endVisit(m, ev, m.visit.start);
    endLeg(m, t, ev);
    return ev;
  }
  if (m.visit.darts.length === 3) endVisit(m, ev, m.visit.start - after);
  return ev;
}

function endVisit(m, ev, pts) {
  const t = m.turn, s = m.stats[t];
  s.points += pts;
  s.darts += m.visit.darts.length;
  if (!ev.bust) addScoreBand(s, pts);
  m.last[t] = { darts: [...m.visit.darts], score: pts, bust: ev.bust };
  m.legPoints[t] += pts;
  m.legVisits[t].push({ score: pts, bust: ev.bust, checkout: ev.checkout, rem: m.rem[t] });
  ev.visitEnd = true;
  ev.visitScore = pts;
  m.turn = 1 - t;
  m.visit = { darts: [], start: m.rem[m.turn] };
}

function endLeg(m, w, ev) {
  const s = m.stats[w];
  s.legsWon++;
  if (!s.bestLeg || m.legDarts[w] < s.bestLeg) s.bestLeg = m.legDarts[w];
  m.legs[w]++; m.legIdx++; m.log.push(w);
  ev.legEnd = true; ev.legWinner = w;
  m.lastLeg = { visits: m.legVisits, starter: m.legStarter, winner: w, avg: [0, 1].map(i => legAverage(m, i)), rem: [...m.rem] };
  if (m.legs[w] >= legsTo(m)) {
    if (!m.format.sets) return finish(m, w, ev);
    m.sets[w]++; ev.setEnd = true;
    if (m.sets[w] >= setsTo(m)) return finish(m, w, ev);
    m.legs = [0, 0]; m.setStarter = 1 - m.setStarter; m.legStarter = m.setStarter;
  } else m.legStarter = 1 - m.legStarter;
  m.rem = [501, 501]; m.legDarts = [0, 0]; m.last = [null, null];
  m.legPoints = [0, 0]; m.legVisits = [[], []];
  m.turn = m.legStarter;
  m.visit = { darts: [], start: 501 };
}

function finish(m, w, ev) {
  m.done = true; m.winner = w; ev.matchEnd = true;
}

// Ergebnis im Format von simulateMatch()
export function matchResult(m) {
  return {
    winner: m.winner,
    score: m.format.sets ? [...m.sets] : [...m.legs],
    legsTotal: [m.stats[0].legsWon, m.stats[1].legsWon],
    sets: m.format.sets ? [...m.sets] : null,
    stats: m.stats.map(s => ({ ...s, avg: s.darts ? s.points / s.darts * 3 : 0, coPct: s.coAtt ? s.coHit / s.coAtt : 0 })),
    log: [...m.log],
  };
}

// Laufender Average (inkl. angefangener Aufnahme)
export function liveAverage(m, i) {
  const s = m.stats[i];
  let pts = s.points, d = s.darts;
  if (m.turn === i && m.visit.darts.length) { pts += m.visit.start - m.rem[i]; d += m.visit.darts.length; }
  return d ? pts / d * 3 : 0;
}

// Average im laufenden Leg (inkl. angefangener Aufnahme)
export function legAverage(m, i) {
  let pts = m.legPoints?.[i] ?? 0;
  if (m.turn === i && m.visit.darts.length) pts += m.visit.start - m.rem[i];
  const d = m.legDarts[i];
  return d ? pts / d * 3 : 0;
}
