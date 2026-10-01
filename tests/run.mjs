// Node-Tests: node tests/run.mjs
import assert from 'node:assert/strict';
import { newCareer } from '../js/state.js';
import { overall } from '../js/player.js';
import { eventsInWeek } from '../js/calendar.js';
import { nextWeek } from '../js/season.js';
import { orderOfMerit } from '../js/rankings.js';
import { playersOfTier, nonCardPros } from '../js/world.js';
import { eventStatus, enterEvent, playRound, nextRound, simulateRest, closeEvent, playerMatch, nextSub } from '../js/tournaments.js';
import { eventCost } from '../js/finance.js';
import { RNG } from '../js/rng.js';
import { simulateMatch } from '../js/matchEngine.js';
import { scoreAt, targetPoint, checkoutRoute, labelValue } from '../js/board.js';
import { createMatch, throwDart } from '../js/matchState.js';
import { startManualMatch, liveAiDart, simulateLiveRest, liveAiVisit } from '../js/tournaments.js';
import { legAverage } from '../js/matchState.js';
import { wave } from '../js/throwModel.js';

let n = 0;
const test = (name, fn) => { fn(); n++; console.log('✓', name); };

test('RNG reproduzierbar', () => {
  const a = new RNG(7), b = new RNG(7);
  for (let i = 0; i < 10; i++) assert.equal(a.next(), b.next());
});

test('Neue Karriere: Startwerte', () => {
  const s = newCareer({ name: 'Test', nation: 'DE', hand: 'R', seed: 1 });
  assert.equal(s.finance.balance, 5000);
  assert.equal(s.player.age, 18);
  assert.equal(s.date.year, 2027);
  const o = overall(s.player.attrs);
  assert.ok(o >= 38 && o <= 52, 'Gesamt ' + o);
  assert.equal(s.player.avgReal, null); // kein vorgegebener Average
  assert.equal(Object.keys(s.world.players).length, 128 + 50 + 50 + 50);
  // Start 2027: 64 verlängert + 28 neu 2026 + 4 CT/Dev-2026 = 96 Karten, Rest in der Q-School
  assert.equal(playersOfTier(s, 'tour').length, 96);
  assert.ok(playersOfTier(s, 'dev').every(p => p.age <= 23));
});

test('Kosten', () => {
  assert.deepEqual(eventCost({ cat: 'challenge', country: 'ENG', count: 2 }), { fee: 50, travel: 600, total: 650 });
  assert.equal(eventCost({ cat: 'et', country: 'DE' }).total, 250);
  assert.equal(eventCost({ cat: 'et', country: 'AT' }).total, 400);
  assert.equal(eventCost({ cat: 'local' }).total, 0);
});

test('Simulation: Satzformat', () => {
  const r = simulateMatch({ sco: 80, fin: 80, con: 80, ner: 80, sta: 80 }, { sco: 80, fin: 80, con: 80, ner: 80, sta: 80 }, { sets: 3, legs: 3 }, new RNG(3));
  assert.equal(Math.max(...r.score), 3);
});

test('Lokales Turnier komplett + Saison', () => {
  const s = newCareer({ name: 'Test', nation: 'DE', hand: 'R', seed: 99 });
  let titles = 0, prize = 0;
  for (let w = 0; w < 60; w++) {
    const local = eventsInWeek(s, s.date.year, s.date.week).find(e => e.cat === 'local');
    if (local) {
      assert.ok(eventStatus(s, local).playable);
      enterEvent(s, local.id);
      assert.equal(eventStatus(s, local).playable, false);
      let guard = 0;
      while (s.activeEvent.playerAlive && !s.activeEvent.done && guard++ < 10) {
        assert.ok(playerMatch(s.activeEvent));
        playRound(s); nextRound(s);
      }
      if (!s.activeEvent.done) simulateRest(s);
      assert.ok(s.activeEvent.done);
      if (s.activeEvent.place === 'W') titles++;
      prize += s.activeEvent.prize;
      closeEvent(s);
    }
    assert.ok(nextWeek(s));
  }
  assert.equal(s.date.year, 2028);
  assert.equal(s.player.age, 19);
  assert.equal(s.finance.balance, 5000 + prize);
  assert.ok(s.player.avgReal > 30 && s.player.avgReal < 110, 'Avg ' + s.player.avgReal);
  console.log(`   Titel: ${titles}, Preisgeld: ${prize} €, Punkte verdient: ${s.player.pointsEarned}, Bilanz: ${s.stats.career.wins}-${s.stats.career.matches - s.stats.career.wins}`);
  JSON.parse(JSON.stringify(s));
});

const H = l => ({ label: l, score: labelValue(l), double: l === 'BULL' || l[0] === 'D' });

test('Scheibe: Felder & Zielpunkte', () => {
  for (const l of ['T20', 'T19', 'D16', 'D1', 'S5', 'BULL', '25']) { const p = targetPoint(l); assert.equal(scoreAt(p.x, p.y).label, l); }
  assert.equal(scoreAt(0, -175).label, 'OUT');
  assert.equal(scoreAt(0, -103).score, 60);
});

test('Checkout-Wege gültig', () => {
  for (let r = 2; r <= 170; r++) {
    const route = checkoutRoute(r);
    if ([169, 168, 166, 165, 163, 162, 159].includes(r)) { assert.equal(route, null, 'Bogey ' + r); continue; }
    assert.ok(route, 'Weg fehlt ' + r);
    assert.equal(route.reduce((a, l) => a + labelValue(l), 0), r);
    const last = route[route.length - 1];
    assert.ok(last === 'BULL' || last[0] === 'D');
  }
  assert.deepEqual(checkoutRoute(170), ['T20', 'T20', 'BULL']);
});

test('Regeln: Bust, Double-Out, Legwechsel', () => {
  const m = createMatch({ legs: 2 }, 0);
  for (let i = 0; i < 3; i++) throwDart(m, H('T20'));      // 501 → 321
  assert.equal(m.rem[0], 321); assert.equal(m.turn, 1); assert.equal(m.stats[0].s180, 1);
  m.rem[1] = 40; m.visit.start = 40;
  let ev = throwDart(m, H('S20'));                           // 20 Rest
  ev = throwDart(m, H('S20'));                               // 0 ohne Doppel → Bust
  assert.ok(ev.bust); assert.equal(m.rem[1], 40); assert.equal(m.turn, 0);
  m.rem[0] = 3; m.visit.start = 3;
  ev = throwDart(m, H('S2'));                                // Rest 1 → Bust
  assert.ok(ev.bust); assert.equal(m.rem[0], 3);
  m.visit.start = 40;
  ev = throwDart(m, H('D20'));                               // Check
  assert.ok(ev.checkout && ev.legEnd); assert.equal(m.legs[1], 1);
  assert.equal(m.rem[0], 501); assert.equal(m.turn, 1);     // Anwurf wechselt
});

test('Sätze', () => {
  const m = createMatch({ sets: 2, legs: 1 }, 0);
  for (let k = 0; k < 2; k++) {
    while (m.turn !== 0) throwDart(m, H('S1'));            // Gegner wirft Einsen
    m.rem[0] = 40; m.visit.start = 40; throwDart(m, H('D20'));
    if (k === 0) { assert.equal(m.sets[0], 1); assert.equal(m.turn, 1); } // Satz-Anwurf wechselt
  }
  assert.ok(m.done); assert.equal(m.winner, 0);
});

test('Welle in [-1, 1], stetig', () => {
  for (let p = 0; p < 3; p += 0.01) { const v = wave(p); assert.ok(v >= -1.0001 && v <= 1.0001); assert.ok(Math.abs(wave(p + 0.001) - v) < 0.01); }
});

test('Manuelles Match: Live → Rest simulieren', () => {
  const s = newCareer({ name: 'Test', nation: 'DE', hand: 'R', seed: 5 });
  const local = eventsInWeek(s, s.date.year, s.date.week).find(e => e.cat === 'local');
  enterEvent(s, local.id);
  const live = startManualMatch(s);
  for (let i = 0; i < 4; i++) throwDart(live.m, liveAiDart(s, live.m.turn).hit);
  JSON.parse(JSON.stringify(s));                              // speicherbar
  const res = simulateLiveRest(s);
  assert.ok(res && s.activeEvent.live === null);
  assert.ok(s.activeEvent.rounds[0].matches.every(m => m.winner));
  assert.equal(s.stats.career.matches, 1);
  assert.ok(s.player.avgReal > 0);
});

test('Schnellsimulation: Aufnahmen + Leg-Average', () => {
  const s = newCareer({ name: 'Test', nation: 'DE', hand: 'R', seed: 8 });
  const local = eventsInWeek(s, s.date.year, s.date.week).find(e => e.cat === 'local');
  enterEvent(s, local.id);
  const lm = startManualMatch(s).m;
  const t = lm.turn, ev = liveAiVisit(s);
  assert.ok(ev.visitEnd); assert.notEqual(lm.turn, t);
  assert.equal(lm.legVisits[t].length, 1);
  const v = lm.legVisits[t][0];
  assert.equal(legAverage(lm, t), v.score);                 // 1 Aufnahme à 3 Darts
  let legs = 0;
  while (!lm.done) { const e = liveAiVisit(s); if (e.legEnd) { legs++; assert.ok(lm.lastLeg.visits[e.legWinner].at(-1).checkout); } }
  assert.equal(legs, lm.log.length);
});

// Hilfsfunktion: eigenes Event komplett per Simulation durchspielen (inkl. aller Teil-Turniere)
function playBlock(s, id) {
  enterEvent(s, id);
  const places = [];
  for (;;) {
    simulateRest(s);
    places.push(s.activeEvent.place);
    if (!s.activeEvent.hasNext) break;
    nextSub(s);
  }
  closeEvent(s);
  return places;
}

test('Q-School: 4 Tage, Karten, Challenge-Zugang', () => {
  const s = newCareer({ name: 'Test', nation: 'DE', hand: 'R', seed: 21 });
  nextWeek(s);                                                  // → KW 2
  const qs = eventsInWeek(s, s.date.year, s.date.week).find(e => e.id === 'qs-eu');
  assert.ok(eventStatus(s, qs).playable);
  const before = s.finance.balance;
  const places = playBlock(s, 'qs-eu');
  assert.equal(before - s.finance.balance, 100 + 250);           // 4 × 25 € + Reise DE
  assert.ok(places.length >= 1 && places.length <= 4);
  if (places.includes('CARD')) assert.equal(s.player.tour, 'tour');
  nextWeek(s);                                                  // UK-Q-School läuft im Hintergrund
  const tour = playersOfTier(s, 'tour').length + (s.player.tour === 'tour' ? 1 : 0);
  assert.equal(tour, 96 + 32);
  assert.equal(s.player.qschoolYear, 2027);
  const ct = eventsInWeek(s, 2027, 7).find(e => e.cat === 'challenge');
  s.date.week = 7; s.week = { played: false, eventId: null };
  assert.equal(eventStatus(s, ct).playable, s.player.tour !== 'tour');
});

test('Challenge-Doppel + Hintergrund-OOM', () => {
  const s = newCareer({ name: 'Test', nation: 'DE', hand: 'R', seed: 4 });
  s.player.qschoolYear = 2027; s.date.week = 7;
  const places = playBlock(s, 'ct-1');
  assert.equal(places.length, 2);
  const ct = orderOfMerit(s, 'challenge');
  assert.ok(ct.filter(x => x.money > 0).length >= 32);
  s.week = { played: true, eventId: 'ct-1' }; s.date.week = 8;   // Dev-Wochenende ohne Spieler
  nextWeek(s);
  assert.ok(orderOfMerit(s, 'dev').filter(x => x.money > 0).length >= 30);
});

test('Mehrere Saisons: Karten, Jahreswechsel, Welt bleibt stabil', () => {
  const s = newCareer({ name: 'Test', nation: 'DE', hand: 'R', seed: 77 });
  const t0 = Date.now();
  for (let i = 0; i < 52 * 3 + 2; i++) assert.ok(nextWeek(s));    // bis nach der Q-School 2030
  assert.equal(s.date.year, 2030); assert.equal(s.player.age, 21);
  const tour = playersOfTier(s, 'tour').length;
  assert.ok(tour >= 115 && tour <= 145, 'Tourgröße ' + tour);
  assert.ok(nonCardPros(s).length >= 60);           // nach Q-School (32 Karten vergeben)
  assert.ok(playersOfTier(s, 'dev').every(p => p.age <= 23));
  assert.ok(playersOfTier(s, 'tour').every(p => p.cardUntil >= 2030));
  console.log(`   3 Saisons in ${Date.now() - t0} ms · Tour ${tour} · ohne Karte ${nonCardPros(s).length} · JSON ${(JSON.stringify(s).length / 1024).toFixed(0)} KB`);
});

console.log(`\n${n} Tests ok`);
