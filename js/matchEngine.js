// Schnelle Match-Simulation (aufnahmebasiert). Wird für eigene Matches im Sim-Modus
// und für alle KI-Matches genutzt. DOM-frei.
import { targetAverage, checkoutBase } from './player.js';
import { clamp } from './util.js';

const BOGEY = new Set([169, 168, 166, 165, 163, 162, 159]);
const LEAVES = [32, 40, 16, 36, 24, 20, 8, 32, 40];   // bevorzugte Doppel-Reste
const SCORING_BOOST = 1.045;                          // Kalibrierung: Scoring-Aufnahmen > Gesamt-Average

// Leistungsprofil für ein Match (inkl. Tagesform)
export function makeProfile(attrs, rng, mod = {}) {
  const formSd = 0.045 - attrs.con * 0.00025;
  const form = (rng ? rng.normal(1, formSd) : 1) * (mod.formMult ?? 1);
  return {
    avg: targetAverage(attrs) * form,
    sd: 27 - attrs.con * 0.12,
    co: checkoutBase(attrs) * (mod.coMult ?? 1),
    ner: attrs.ner,
    sta: attrs.sta,
  };
}

const newStats = () => ({ points: 0, darts: 0, s180: 0, s140: 0, s100: 0, coHit: 0, coAtt: 0, hiFinish: 0, legsWon: 0, bestLeg: 0 });

// Wahrscheinlichkeit, einen Rest 51–170 in einer Aufnahme zu checken (Basis co=0,35)
function finishFactor(r) {
  if (r <= 60) return 0.62;
  if (r <= 80) return 0.45;
  if (r <= 100) return 0.32;
  if (r <= 120) return 0.2;
  if (r <= 140) return 0.11;
  return 0.06;
}

function addScore(s, pts) {
  if (pts === 180) s.s180++;
  else if (pts >= 140) s.s140++;
  else if (pts >= 100) s.s100++;
}

// Eine Aufnahme. Rückgabe: {pts, darts, finished}
function visit(p, r, st, rng, pressure, fatigue) {
  const avg = p.avg * fatigue;
  // Dartgenaues Finish ≤ 50
  if (r <= 50) {
    const start = r;
    const h = clamp(p.co * pressure, 0.03, 0.75);
    for (let d = 1; d <= 3; d++) {
      if (r === 50 || (r % 2 === 0 && r <= 40)) {
        st.coAtt++;
        if (rng.chance(r === 50 ? h * 0.55 : h)) {
          st.coHit++; st.hiFinish = Math.max(st.hiFinish, start);
          return { pts: start, darts: d, finished: true };
        }
        if (r === 50) { if (rng.chance(0.3)) r = 25; continue; }
        if (rng.chance(0.45)) {           // Single statt Doppel
          r = r / 2;
          if (r === 1) return { pts: 0, darts: 3, finished: false, bust: true };
        }
      } else {
        // Stelldart auf ein Doppel
        let leave = LEAVES.find(L => r - L >= 1 && r - L <= 20) ?? (r % 2 ? r - 1 : r - 2);
        if (leave < 2) leave = 2;
        if (rng.chance(0.85 + p.avg / 2000)) r = leave;
        else {
          r -= rng.int(1, 20);
          if (r <= 1) return { pts: 0, darts: 3, finished: false, bust: true };
        }
      }
    }
    return { pts: start - r, darts: 3, finished: false };
  }
  // Finish-Bereich 51–170
  if (r <= 170 && !BOGEY.has(r)) {
    const pf = clamp(finishFactor(r) * (p.co / 0.35) * pressure * (avg / targetAvgRef(p)), 0, 0.92);
    if (rng.chance(pf)) {
      st.coAtt += rng.chance(0.3) ? 2 : 1; st.coHit++;
      st.hiFinish = Math.max(st.hiFinish, r);
      const darts = r > 110 ? 3 : (rng.chance(0.55) ? 3 : 2);
      return { pts: r, darts, finished: true };
    }
    // Verfehlt: Doppel stehen lassen oder normal scoren
    if (r <= 110 && rng.chance(0.55)) {
      const L = rng.pick(LEAVES.filter(x => x < r && r - x <= 60)) ?? 0;
      if (L) { st.coAtt += rng.int(1, 2); return { pts: r - L, darts: 3, finished: false }; }
    }
    const s = clamp(Math.round(rng.normal(Math.min(avg, r - 30), p.sd * 0.8)), 0, r - 2);
    return { pts: s, darts: 3, finished: false };
  }
  // Reine Scoring-Aufnahme
  const p180 = 0.058 * Math.pow(clamp((avg - 45) / 55, 0, 2), 2.5);
  let s = rng.chance(p180) ? 180 : clamp(Math.round(rng.normal(avg * SCORING_BOOST, p.sd)), 0, 177);
  if (r - s < 2) s = Math.max(0, r - rng.pick(LEAVES));
  return { pts: s, darts: 3, finished: false };
}
const targetAvgRef = p => p.avgBase ?? p.avg;

function simLeg(starter, prof, st, rng, ctx) {
  const rem = [501, 501], legDarts = [0, 0];
  let t = starter;
  for (let n = 0; n < 400; n++) {
    const p = prof[t], s = st[t];
    const pressure = ctx.wouldWin(t) ? 0.82 + 0.18 * (p.ner / 99) : 1;
    const fatigue = ctx.legIdx > 10 ? Math.max(0.9, 1 - (ctx.legIdx - 10) * 0.0025 * (1 - p.sta / 100)) : 1;
    const v = visit(p, rem[t], s, rng, pressure, fatigue);
    s.darts += v.darts; legDarts[t] += v.darts;
    if (!v.bust) { s.points += v.pts; rem[t] -= v.pts; addScore(s, v.pts); }
    if (v.finished) {
      s.legsWon++;
      if (!s.bestLeg || legDarts[t] < s.bestLeg) s.bestLeg = legDarts[t];
      return t;
    }
    t = 1 - t;
  }
  return starter; // Sicherheitsnetz
}

// format: {legs:n} oder {sets:s, legs:l}
export function simulateMatch(attrsA, attrsB, format, rng, opts = {}) {
  const prof = [makeProfile(attrsA, rng, opts.modA), makeProfile(attrsB, rng, opts.modB)];
  prof.forEach((p, i) => { p.avgBase = targetAverage(i ? attrsB : attrsA); });
  const st = [newStats(), newStats()];
  const isSets = !!format.sets, setsTo = format.sets || 1, legsTo = format.legs;
  const sets = [0, 0]; let legs = [0, 0];
  let setStarter = opts.starter ?? (rng.chance(0.5) ? 0 : 1), legStarter = setStarter, legIdx = 0;
  const log = [];
  for (;;) {
    const wouldWin = i => legs[i] + 1 >= legsTo && (!isSets || sets[i] + 1 >= setsTo);
    const w = simLeg(legStarter, prof, st, rng, { wouldWin, legIdx });
    legIdx++; legs[w]++;
    log.push(w);
    legStarter = 1 - legStarter;
    if (legs[w] >= legsTo) {
      if (!isSets) break;
      sets[w]++;
      if (sets[w] >= setsTo) break;
      legs = [0, 0]; setStarter = 1 - setStarter; legStarter = setStarter;
    }
  }
  const winner = log[log.length - 1];
  const legsTotal = [st[0].legsWon, st[1].legsWon];
  return {
    winner,
    score: isSets ? sets : legs,
    legsTotal,
    sets: isSets ? sets : null,
    stats: st.map(finalizeStats),
    log,
  };
}

export function finalizeStats(s) {
  return {
    ...s,
    avg: s.darts ? (s.points / s.darts) * 3 : 0,
    coPct: s.coAtt ? s.coHit / s.coAtt : 0,
  };
}

export const formatLabel = f => f.sets ? `Best of ${f.sets * 2 - 1} Sets` : `Best of ${f.legs * 2 - 1} Legs`;
