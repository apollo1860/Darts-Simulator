// Dartgenauer Match-Zustand: 501 Double Out, Bust, Legs/Sets, Statistik (DOM-frei, serialisierbar)

const newStats = () => ({ points: 0, darts: 0, s180: 0, s140: 0, s100: 0, coHit: 0, coAtt: 0, hiFinish: 0, legsWon: 0, bestLeg: 0, bogey: 0 });
const BOGEY = new Set([169, 168, 166, 165, 163, 162, 159]);

// team = [Spieler Seite 0, Seite 1] (World Cup: 2, sonst 1) → Einzelstatistik je Mitglied (`m.mstats`)
export function createMatch(format, starter = 0, team = null) {
  return {
    team, mstats: [[], []],
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

// Version 132: „Two clear legs“ (World Matchplay, `format.clear` = 2): mit 2 Legs Vorsprung gewinnen;
// höchstens `format.extra` (6) Zusatzlegs, dann entscheidet ein Sudden-Death-Leg (Anwurf per Zufall)
export const maxLegs = f => 2 * f.legs - 1 + (f.extra ?? 0);
export function legsWin(f, legs, w) {
  if (legs[w] < f.legs) return false;
  if (!f.clear || f.sets) return true;
  return legs[w] - legs[1 - w] >= f.clear || legs[0] + legs[1] >= maxLegs(f);
}
// Nächstes Leg ist das Sudden-Death-Leg (z. B. 12:12 bei First to 10)
export const isSuddenDeath = (f, legs) => !!f.clear && !f.sets && legs[0] === legs[1] && legs[0] + legs[1] === maxLegs(f) - 1;
// Verlängerung läuft (beide mindestens First-to − 1, noch kein Sieger)
export const inExtension = (f, legs) => !!f.clear && !f.sets && Math.min(...legs) >= f.legs - 1;

// Gewinnt Spieler i mit dem aktuellen Leg das Match?
export const wouldWinMatch = (m, i) => (m.format.sets
  ? m.legs[i] + 1 >= legsTo(m) && m.sets[i] + 1 >= setsTo(m)
  : legsWin(m.format, m.legs.map((l, j) => l + (j === i ? 1 : 0)), i));
// Entscheidungsleg (beide einen Leg vom Matchgewinn entfernt)
export const isDecider = m => wouldWinMatch(m, 0) && wouldWinMatch(m, 1);
export const dartsLeft = m => 3 - m.visit.darts.length;
// Statistik des Teammitglieds, das gerade wirft (Wechsel je Aufnahme, wie `memberIdx` in tournaments.js); null bei Einzelspielern
function curMember(m, t) {
  const n = m.team?.[t] ?? 1;
  if (n <= 1) return null;
  return ((m.mstats ??= [[], []])[t][(m.legVisits?.[t]?.length ?? 0) % n] ??= newStats());
}
// Doppel-Chance mit einem Dart?
export const onDouble = r => r === 50 || (r <= 40 && r % 2 === 0);

function addScoreBand(s, pts) {
  if (pts === 180) s.s180++;
  else if (pts >= 140) s.s140++;
  else if (pts >= 100) s.s100++;
}

// Einen Dart werten. hit = {label, score, double}. Rückgabe: Ereignis
// pos (optional): Position des Darts in mm – wer steckt, wird für die „Verbauung“ (obstruction.js) bis zum Aufnahmeende gemerkt
export function throwDart(m, hit, pos = null) {
  if (m.done) return null;
  m.legPoints ??= [0, 0]; m.legVisits ??= [[], []];   // ältere Spielstände
  const t = m.turn, s = m.stats[t];
  const r = m.rem[t];
  const after = r - hit.score;
  m.visit.darts.push(hit.label);
  if (pos && hit.label !== 'OUT' && hit.label !== 'BOUNCER' && hit.label !== 'ROBIN') (m.visit.tips ??= []).push({ x: pos.x, y: pos.y });
  m.legDarts[t]++;
  const ms = curMember(m, t);
  if (onDouble(r)) { s.coAtt++; if (ms) ms.coAtt++; }
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
    s.coHit++; if (ms) ms.coHit++;
    s.hiFinish = Math.max(s.hiFinish, m.visit.start);
    endVisit(m, ev, m.visit.start);
    endLeg(m, t, ev);
    return ev;
  }
  if (m.visit.darts.length === 3) endVisit(m, ev, m.visit.start - after);
  return ev;
}

function endVisit(m, ev, pts) {
  const t = m.turn, s = m.stats[t], ms = curMember(m, t);
  s.points += pts;
  s.darts += m.visit.darts.length;
  if (!ev.bust) addScoreBand(s, pts);
  if (!ev.bust && BOGEY.has(m.rem[t])) s.bogey = (s.bogey ?? 0) + 1;
  if (ms) {
    ms.points += pts; ms.darts += m.visit.darts.length;
    if (!ev.bust) addScoreBand(ms, pts);
    if (!ev.bust && BOGEY.has(m.rem[t])) ms.bogey = (ms.bogey ?? 0) + 1;
  }
  m.last[t] = { darts: [...m.visit.darts], score: pts, bust: ev.bust };
  m.legPoints[t] += pts;
  m.legVisits[t].push({ score: pts, bust: ev.bust, checkout: ev.checkout, rem: m.rem[t], ...(ev.checkout ? { darts: m.visit.darts.length } : {}) });   // Check: benötigte Darts
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
  if (m.format.sets ? m.legs[w] >= legsTo(m) : legsWin(m.format, m.legs, w)) {
    if (!m.format.sets) return finish(m, w, ev);
    m.sets[w]++; ev.setEnd = true;
    if (m.sets[w] >= setsTo(m)) return finish(m, w, ev);
    m.legs = [0, 0]; m.setStarter = 1 - m.setStarter; m.legStarter = m.setStarter;
  } else m.legStarter = 1 - m.legStarter;
  // Sudden Death: Anwurf per Zufall – beim Matchstart gewürfelt (`m.sdStarter`, tournaments.js), sonst Parität der Punkte
  if (isSuddenDeath(m.format, m.legs)) { m.legStarter = m.sdStarter ?? (m.stats[0].points + m.stats[1].points + m.legIdx) % 2; m.suddenDeath = true; ev.suddenDeath = true; }
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
    members: m.team?.some(n => n > 1) ? [0, 1].map(t => ((m.team[t] ?? 1) > 1
      ? Array.from({ length: m.team[t] }, (_, i) => { const s = m.mstats?.[t]?.[i] ?? newStats(); return { ...s, avg: s.darts ? s.points / s.darts * 3 : 0, coPct: s.coAtt ? s.coHit / s.coAtt : 0 }; })
      : null)) : null,                                   // nur World Cup: [Seite][Mitglied]
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
