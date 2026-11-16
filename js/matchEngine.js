// Schnelle Match-Simulation (aufnahmebasiert). Wird für eigene Matches im Sim-Modus
// und für alle KI-Matches genutzt. DOM-frei.
import { targetAverage, checkoutBase, calcError } from './player.js';
import { clamp } from './util.js';
import { legsWin, isSuddenDeath } from './matchState.js';

const BOGEY = new Set([169, 168, 166, 165, 163, 162, 159]);
const LEAVES = [32, 40, 16, 36, 24, 20, 8, 32, 40];   // bevorzugte Doppel-Reste
const SCORING_BOOST = 1.045;                          // Kalibrierung: Scoring-Aufnahmen > Gesamt-Average

// Leistungsprofil für ein Match (inkl. Tagesform)
export function makeProfile(attrs, rng, mod = {}) {
  const formSd = 0.055 - attrs.foc * 0.0003;           // Tagesform: auch Topspieler haben schwache Tage
  const form = (rng ? rng.normal(1, formSd) : 1) * (mod.formMult ?? 1);
  return {
    avg: targetAverage(attrs) * form * (attrs.angleMult ?? 1),   // Einsteckwinkel (obstruction.js)
    sd: 27 - attrs.foc * 0.12,
    co: checkoutBase(attrs) * (mod.coMult ?? 1),
    men: attrs.men,
    foc: attrs.foc,
    ce: attrs.ce ?? calcError(attrs.cal),
    exp: attrs.exp ?? 0,
    din16: attrs.dinPref === 16,                          // Double-in: Lieblingsdoppel D16 statt Tops
  };
}

const newStats = () => ({ points: 0, darts: 0, s180: 0, s140: 0, s100: 0, coHit: 0, coAtt: 0, hiFinish: 0, legsWon: 0, bestLeg: 0, bogey: 0, calcErr: 0 });

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
        // Verrechnet: falsches Doppel angespielt → Rest kaputt oder Bust
        if (rng.chance(p.ce * 0.5)) {
          st.calcErr++;
          if (rng.chance(0.4)) return { pts: 0, darts: 3, finished: false, bust: true };
          r = Math.max(2, r - rng.int(1, 9));
          continue;
        }
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
        if (rng.chance(0.85 + p.avg / 2000 - p.ce)) r = leave;
        else if (rng.chance(0.5)) { st.calcErr++; r -= rng.int(1, 20); if (r <= 1) return { pts: 0, darts: 3, finished: false, bust: true }; }
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
    // Falscher Weg (Rechnen) senkt die Chance, den Rest in einer Aufnahme zu checken
    const pf = clamp(finishFactor(r) * (p.co / 0.35) * pressure * (avg / targetAvgRef(p)) * (1 - p.ce * 0.6), 0, 0.92);
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
  // Stell-Zone (171–230): gute Rechner vermeiden Bogey-Reste, schwache stellen sich drauf
  if (r <= 230 && r - s > 0) {
    if (rng.chance(p.ce * 1.1)) {
      const b = rng.pick([...BOGEY].filter(x => r - x >= 0 && r - x <= 180));
      if (b) { s = r - b; st.calcErr++; }
    } else if (BOGEY.has(r - s)) s = Math.max(0, s - (BOGEY.has(r - s + 3) ? 2 : 3));
  }
  if (BOGEY.has(r - s)) st.bogey++;
  return { pts: s, darts: 3, finished: false };
}
const targetAvgRef = p => p.avgBase ?? p.avg;

// Version 144: Double-in – Aufnahme, solange noch kein Doppel getroffen ist: je Dart Chance aufs Doppel (meist D20, selten D1/D5);
// nach dem Treffer zählen die restlichen Darts normal. Rückgabe wie visit() + in (true = jetzt drin).
export const DIN_NEIGHBOUR = 0.07;
export const DIN_HIT = 1.0;   // Chance je Dart = Checkout-Basis × DIN_HIT (Version 147: 1,0 – passt zum Dart-Modell, Nachbar-Doppel inklusive)
export function inVisit(p, rng, fatigue) {
  const h = clamp(p.co * DIN_HIT, 0.05, 0.75);
  for (let d = 1; d <= 3; d++) {
    if (!rng.chance(h)) continue;
    // Version 147: Lieblingsdoppel Tops (D20, selten D1/D5) oder D16 (selten D8/D7); Nachbar-Doppel ≈ 7 % wie im Dart-Modell
    const dbl = p.din16 ? (rng.chance(1 - DIN_NEIGHBOUR) ? 32 : rng.pick([16, 14])) : (rng.chance(1 - DIN_NEIGHBOUR) ? 40 : rng.pick([2, 10]));
    // Version 146: restliche Darts dartgenau auf die 20 (T20 / S20 / Nachbar 1 oder 5) → typisch 80, 120, 160 statt krummer Werte
    const e = p.avg * fatigue * SCORING_BOOST / 3, q = clamp((e - 16.6) / 43.4, 0.03, 0.85);
    let rest = 0;
    for (let k = d; k < 3; k++) rest += rng.chance(q) ? 60 : rng.chance(0.8) ? 20 : rng.pick([1, 5]);
    return { pts: dbl + rest, darts: 3, finished: false, in: true };
  }
  return { pts: 0, darts: 3, finished: false, in: false };
}

// Teams (World Cup, Version 80): Zuwachs der Seitenstatistik durch einen Besuch auf das Teammitglied übertragen
const MEMBER_KEYS = ['points', 'darts', 's180', 's140', 's100', 'coHit', 'coAtt', 'bogey', 'calcErr'];
const addMember = (ms, s, snap) => { for (const k of MEMBER_KEYS) ms[k] += s[k] - snap[k]; };

function simLeg(starter, prof, st, rng, ctx) {
  const rem = [501, 501], legDarts = [0, 0], visits = [0, 0], inn = [!ctx.din, !ctx.din];
  let t = starter;
  for (let n = 0; n < 400; n++) {
    const idx = visits[t]++ % prof[t].length, p = prof[t][idx], s = st[t];   // Teams (World Cup): Partner wechseln sich ab
    const ms = ctx.mem?.[t]?.[idx], snap = ms ? { ...s } : null;
    // Matchdarts: Mental + Erfahrung (−4 … +10) entscheiden
    const pressure = ctx.wouldWin(t) ? clamp(0.8 + 0.17 * (p.men / 100) + 0.025 * p.exp, 0.55, 1.3) : 1;
    let fatigue = ctx.legIdx > 10 ? Math.max(0.9, 1 - (ctx.legIdx - 10) * 0.0025 * (1 - p.foc / 100)) : 1;
    if (ctx.wouldWin(0) && ctx.wouldWin(1)) fatigue *= 1 + 0.006 * p.exp;   // Entscheidungsleg: Scoring
    const v = inn[t] ? visit(p, rem[t], s, rng, pressure, fatigue) : inVisit(p, rng, fatigue);
    if (v.in) inn[t] = true;
    s.darts += v.darts; legDarts[t] += v.darts;
    if (!v.bust) { s.points += v.pts; rem[t] -= v.pts; addScore(s, v.pts); }
    if (ms) addMember(ms, s, snap);
    if (v.finished) {
      s.legsWon++;
      if (!s.bestLeg || legDarts[t] < s.bestLeg) s.bestLeg = legDarts[t];
      return t;
    }
    t = 1 - t;
  }
  return starter; // Sicherheitsnetz
}

// format: {legs:n} oder {sets:s, legs:l}; attrs je Seite einzeln oder als Liste (Doppel: Partner im Wechsel, Erster beginnt jedes Leg)
export function simulateMatch(attrsA, attrsB, format, rng, opts = {}) {
  const mk = (a, mod) => (Array.isArray(a) ? a : [a]).map(x => ({ ...makeProfile(x, rng, mod), avgBase: targetAverage(x) }));
  const prof = [mk(attrsA, opts.modA), mk(attrsB, opts.modB)];
  const st = [newStats(), newStats()];
  const mem = prof.map(side => (side.length > 1 ? side.map(() => newStats()) : null));   // Einzelstatistik je Teammitglied
  const isSets = !!format.sets, setsTo = format.sets || 1, legsTo = format.legs;
  const sets = [0, 0]; let legs = [0, 0];
  let setStarter = opts.starter ?? (rng.chance(0.5) ? 0 : 1), legStarter = setStarter, legIdx = 0;
  const log = [];
  for (;;) {
    const wouldWin = i => (isSets ? legs[i] + 1 >= legsTo && sets[i] + 1 >= setsTo : legsWin(format, legs.map((l, j) => l + (j === i ? 1 : 0)), i));
    const w = simLeg(legStarter, prof, st, rng, { wouldWin, legIdx, mem, din: !!format.din });
    legIdx++; legs[w]++;
    log.push(w);
    legStarter = 1 - legStarter;
    if (!isSets && isSuddenDeath(format, legs)) legStarter = rng.chance(0.5) ? 0 : 1;   // Sudden Death: Anwurf per Zufall
    if (isSets ? legs[w] >= legsTo : legsWin(format, legs, w)) {
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
    members: mem.some(Boolean) ? mem.map(side => side && side.map(finalizeStats)) : null,   // nur World Cup: [Seite][Mitglied]
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

export const formatLabel = f => (f.sets ? `Best of ${f.sets * 2 - 1} Sets` : `Best of ${f.legs * 2 - 1} Legs`) + (f.din ? ' · Double-in' : '');
// Zeilen fürs Scoreboard: bei Sätzen zusätzlich die Legs je Satz
export const formatLines = f => [...(f.sets ? [formatLabel(f), `Satz: Best of ${f.legs * 2 - 1}`] : [`Best of ${f.legs * 2 - 1}`, f.clear ? 'Legs · 2 Legs Vorsprung' : 'Legs']), ...(f.din ? ['Double-in · Double-out'] : [])];
