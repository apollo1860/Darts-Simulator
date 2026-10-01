// Node-Tests: node tests/run.mjs
import assert from 'node:assert/strict';
import { newCareer } from '../js/state.js';
import { overall } from '../js/player.js';
import { eventsInWeek } from '../js/calendar.js';
import { nextWeek, jumpToNextEvent } from '../js/season.js';
import { perf, xpForLevel, addXp, levelFromXp, MAX_LEVEL } from '../js/player.js';
import { migrate } from '../js/state.js';
import { orderOfMerit, rankOf } from '../js/rankings.js';
import { playersOfTier, nonCardPros } from '../js/world.js';
import { eventStatus, enterEvent, playRound, nextRound, simulateRest, closeEvent, playerMatch, nextSub, simulateRoundAI } from '../js/tournaments.js';
import { eventCost } from '../js/finance.js';
import { RNG } from '../js/rng.js';
import { simulateMatch } from '../js/matchEngine.js';
import { scoreAt, targetPoint, checkoutRoute, labelValue } from '../js/board.js';
import { createMatch, throwDart } from '../js/matchState.js';
import { startManualMatch, liveAiDart, simulateLiveRest, liveAiVisit } from '../js/tournaments.js';
import { legAverage } from '../js/matchState.js';
import * as D from '../js/distractions.js';
import * as SP from '../js/sponsors.js';
import * as TR from '../js/training.js';
import * as DC from '../js/decisions.js';
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
  assert.equal(s.player.age, 16);
  assert.equal(s.date.year, 2027);
  const o = overall(s.player.attrs);
  assert.equal(o, 60); assert.equal(s.player.exp, -4);
  const b = newCareer({ name: 'B', nation: 'DE', hand: 'R', seed: 1, bonus: { sco: 20, cal: 10 } });
  assert.deepEqual(b.player.attrs, { sco: 80, fin: 60, men: 60, foc: 60, cal: 65 });   // max. 25 Bonuspunkte
  assert.deepEqual(Object.keys(s.player.attrs), ['sco', 'fin', 'men', 'foc', 'cal']);
  assert.equal(s.player.avgReal, null); // kein vorgegebener Average
  assert.equal(Object.keys(s.world.players).length, 128 + 92 + 98 + 50 + 63);
  // Start 2027: 64 verlängert + 33 neu 2026 + 4 CT/Dev-2026 = 101 Karten, Rest in der Q-School
  assert.equal(playersOfTier(s, 'tour').length, 101);
  assert.ok(playersOfTier(s, 'dev').every(p => p.age <= 23));
  // Holder ≤ 23 außerhalb der PDC-Top-64 spielen zusätzlich Dev Tour
  const devIds = new Set(orderOfMerit(s, 'dev').map(x => x.p.id));
  const holders = playersOfTier(s, 'tour').filter(p => devIds.has(p.id));
  assert.ok(holders.length >= 5 && holders.every(p => p.age <= 23 && rankOf(s, 'pdc', p.id) > 64));
});

test('Kosten', () => {
  assert.deepEqual(eventCost({ cat: 'challenge', country: 'ENG', count: 2 }), { fee: 50, travel: 600, total: 650 });
  assert.equal(eventCost({ cat: 'et', country: 'DE' }).total, 250);
  assert.equal(eventCost({ cat: 'et', country: 'AT' }).total, 400);
  assert.equal(eventCost({ cat: 'local' }).total, 0);
});

test('Simulation: Satzformat', () => {
  const r = simulateMatch({ sco: 80, fin: 80, men: 80, foc: 80 }, { sco: 80, fin: 80, men: 80, foc: 80 }, { sets: 3, legs: 3 }, new RNG(3));
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
  assert.equal(s.player.age, 17);
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
  assert.equal(tour, 101 + 32);
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
  assert.equal(s.date.year, 2030); assert.equal(s.player.age, 19);
  const tour = playersOfTier(s, 'tour').length;
  assert.ok(tour >= 115 && tour <= 145, 'Tourgröße ' + tour);
  assert.ok(nonCardPros(s).length >= 60);           // nach Q-School (32 Karten vergeben)
  assert.ok(playersOfTier(s, 'dev').every(p => p.age <= 23));
  assert.ok(playersOfTier(s, 'tour').every(p => p.cardUntil >= 2030 && p.cardVia));
  // Titelträger: je Saison alle Majors erfasst
  for (const y of [2027, 2028, 2029]) for (const id of ['masters', 'uk-open', 'matchplay', 'wgp', 'ec', 'gsod', 'pcf', 'wm', 'wcod', 'pl-final', 'youth-wm'])
    assert.ok(s.champions[y].some(c => c.eventId === id), `${id} ${y}`);
  assert.equal(s.champions[2027].filter(c => c.cat === 'pc').length, 30);
  console.log(`   3 Saisons in ${Date.now() - t0} ms · Tour ${tour} · ohne Karte ${nonCardPros(s).length} · JSON ${(JSON.stringify(s).length / 1024).toFixed(0)} KB`);
});

test('Pro Tour: PC-Doppel + ET (Quali → Hauptfeld) + OOM', () => {
  const s = newCareer({ name: 'Test', nation: 'DE', hand: 'R', seed: 31 });
  // Startwerte: PDC OOM sortiert nach Vorjahres-Preisgeld
  const pdc0 = orderOfMerit(s, 'pdc');
  assert.equal(pdc0[0].p.name, 'Luke Littler'); assert.ok(pdc0[63].money > 0);
  s.player.tour = 'tour'; s.player.cardUntil = 2028;
  Object.keys(s.player.attrs).forEach(k => { s.player.attrs[k] = 97; });
  s.date.week = 6;
  const pcEv = eventsInWeek(s, 2027, 6).find(e => e.cat === 'pc');
  assert.ok(eventStatus(s, pcEv).playable);
  enterEvent(s, pcEv.id);
  assert.ok(s.activeEvent.fieldSize <= 128 && s.activeEvent.fieldSize >= 90);
  closeEventAfterAll(s);
  assert.ok(orderOfMerit(s, 'protour').filter(x => x.money > 0).length >= 64);
  // ET: nicht gesetzt → Qualifikation
  s.date.week = 7; s.week = { played: false, eventId: null };
  enterEvent(s, 'et-1');
  assert.ok(s.activeEvent.isQualifier); assert.equal(s.activeEvent.stopAt, 32);
  simulateRest(s);
  const q = s.activeEvent;
  assert.ok(['QUAL', 'NQ'].includes(q.place)); assert.equal(q.survivors.length, 32);
  if (q.hasNext) { nextSub(s); assert.equal(s.activeEvent.fieldSize, 48); simulateRest(s); }
  closeEvent(s);
  s.week = { played: true, eventId: 'et-1' };
  nextWeek(s);                                                     // CT läuft im Hintergrund
  assert.ok(s.news.some(n => n.title.startsWith('Pro Tour') || n.title.startsWith('PDC Order')));
});

test('ET: Top-16-Spieler direkt im Hauptfeld', () => {
  const s = newCareer({ name: 'Test', nation: 'DE', hand: 'R', seed: 32 });
  s.player.tour = 'tour'; s.player.cardUntil = 2028;
  s.rankings.years[2026].pdc.P = 3000000;                          // Platz 1
  s.date.week = 7;
  enterEvent(s, 'et-1');
  assert.ok(!s.activeEvent.isQualifier); assert.equal(s.activeEvent.fieldSize, 48);
  assert.ok(playerMatch(s.activeEvent) === null || s.activeEvent.current >= 1); // Freilos in Runde 1
});

function closeEventAfterAll(s) { for (;;) { simulateRest(s); if (!s.activeEvent.hasNext) break; nextSub(s); } closeEvent(s); }

test('Lokal: 16er-Feld im eigenen Bundesland, DDV-Turnier', () => {
  const s = newCareer({ name: 'Test', nation: 'DE', region: 'BY', hand: 'R', seed: 12 });
  const loc = eventsInWeek(s, 2027, 1).find(e => e.cat === 'local');
  assert.equal(loc.region, 'Bayern');
  enterEvent(s, loc.id);
  assert.equal(s.activeEvent.fieldSize, 16);
  simulateRest(s); closeEvent(s);
  assert.ok(s.player.clutch > 0);
  s.date.week = 9; s.week = { played: false, eventId: null };
  const ddv = eventsInWeek(s, 2027, 9).find(e => e.cat === 'ddv');
  assert.ok(eventStatus(s, ddv).playable);
  const bal = s.finance.balance;
  enterEvent(s, ddv.id);
  assert.equal(bal - s.finance.balance, 25 + 250);
  assert.equal(s.activeEvent.fieldSize, 64);
  simulateRest(s); closeEvent(s);
});

test('Störmoment: Chancen, Entscheidung, Modifikator', () => {
  const s = newCareer({ name: 'Test', nation: 'DE', hand: 'R', seed: 13 });
  const loc = eventsInWeek(s, 2027, 1).find(e => e.cat === 'local');
  enterEvent(s, loc.id);
  const live = startManualMatch(s);
  live.dist = { id: 'chat', atVisit: 0, who: 'opp', done: false };
  live.m.turn = live.me;
  assert.ok(D.distractionDue(s));
  const info = D.describe(s, live.dist);
  assert.equal(info.options.length, 2);
  // Start: Fokus 60, Erfahrung −4 → 65 % − 6 % = 59 %
  assert.equal(Math.round(info.options[0].chance * 100), 59);
  const r = D.resolveDistraction(s, 1);
  assert.ok(live.dist.done && typeof r.ok === 'boolean');
  assert.ok((live.mods ?? []).length >= 1);
  liveAiVisit(s);
});

test('Majors: Felder, Gruppenphase, World Cup, Premier League, WM', () => {
  const s = newCareer({ name: 'Test', nation: 'DE', hand: 'R', seed: 41 });
  for (let i = 0; i < 52; i++) nextWeek(s);
  const q = s.qual[2027];
  assert.equal(q.masters.length, 24); assert.equal(q.matchplay.length, 32); assert.equal(q.pcf.length, 64);
  assert.equal(q.wm.length, 128); assert.equal(new Set(q.wm).size, 128);
  assert.equal(q.wmqSurvivors.length, 16); assert.ok(q.wmqSurvivors.every(id => q.wm.includes(id)));
  assert.equal(q.gsod.length, 32); assert.ok(Object.keys(q.wcTeams).length >= 8);
  const pl = s.pl[2027]; assert.equal(pl.nights, 16);
  assert.equal(Object.values(pl.points).reduce((a, b) => a + b, 0), 16 * (5 + 3 + 2 + 2));
  // Majors fließen in die PDC OOM: Weltmeister hat ≥ 1,17 Mio. € im Jahr 2027
  const wmWinner = s.news.find(x => x.title.includes('Weltmeisterschaft') && x.title.includes('gewinnt'));
  assert.ok(wmWinner);
  assert.ok(orderOfMerit(s, 'pdc', 2027)[0].money > 1000000);
});

test('Grand Slam mit Spieler: Gruppenphase → K.-o.', () => {
  const s = newCareer({ name: 'Test', nation: 'DE', hand: 'R', seed: 42 });
  s.player.tour = 'tour'; s.player.cardUntil = 2028;
  s.rankings.years[2026].pdc.P = 5000000;                          // PDC-Platz 1 → überall qualifiziert
  s.date.week = 46;
  enterEvent(s, 'gsod');
  const inst = s.activeEvent;
  assert.equal(inst.groups.length, 8); assert.ok(inst.rounds[0].isGroup);
  let guard = 0;
  while (!inst.done && guard++ < 20) {
    if (inst.playerAlive && playerMatch(inst)) playRound(s); else simulateRoundAI(s);
    nextRound(s);
  }
  assert.ok(inst.done);
  assert.ok(['W', 'F', 'SF', 'QF', 'L16', 'G3', 'G4'].includes(inst.place), inst.place);
  closeEvent(s);
});

test('World Cup: Team mit Spieler, Preisgeld geteilt', () => {
  const s = newCareer({ name: 'Test', nation: 'DE', hand: 'R', seed: 43 });
  s.player.tour = 'tour'; s.player.cardUntil = 2028;
  s.rankings.years[2026].pdc.P = 5000000;
  s.date.week = 24;
  enterEvent(s, 'wcod');
  const inst = s.activeEvent;
  assert.ok(inst.teams.P && inst.teams.P.members.includes('P') && inst.teams.P.nation === 'DE');
  simulateRest(s);
  if (inst.place === 'W') assert.equal(inst.prize, 47000);
  closeEvent(s);
});

test('Sponsoren: Angebote, Vertrag, Zahlungen, Kündigung, Ablauf', () => {
  const s = newCareer({ name: 'Test', nation: 'DE', hand: 'R', seed: 51 });
  for (let i = 0; i < 8; i++) nextWeek(s);
  assert.equal(s.sponsors.offers.length, 0);                       // gesperrt ohne Tourcard
  s.player.tour = 'tour'; s.player.cardUntil = 2029; s.player.everTourcard = true;
  for (let i = 0; i < 40 && !s.sponsors.offers.length; i++) nextWeek(s);
  assert.ok(s.sponsors.offers.length >= 1);
  const o = s.sponsors.offers[0];
  assert.ok(o.amount > 0 && o.years >= 1);
  const bal = s.finance.balance;
  assert.ok(SP.acceptOffer(s, o.id).ok);
  assert.equal(s.sponsors.active.length, 1);
  if (o.type === 'annual') assert.ok(s.finance.balance > bal);
  // gleicher Platz doppelt → abgelehnt
  s.sponsors.offers.push({ ...o, id: 'X', name: 'Test GmbH' });
  assert.equal(SP.acceptOffer(s, 'X').ok, false);
  SP.cancelContract(s, o.name);
  assert.equal(s.sponsors.active.length, 0);
  assert.ok(SP.acceptOffer(s, 'X').ok);
  s.sponsors.active[0].until = s.date.year;                        // läuft zum Jahresende aus
  while (s.date.week !== 1) nextWeek(s);
  assert.equal(s.sponsors.active.length, 0);
  assert.ok(s.archive.seasons[2027]);
});

test('Training: Fortschritt, 1×/Woche, Formverlust ohne Training', () => {
  const s = newCareer({ name: 'Test', nation: 'DE', hand: 'R', seed: 61 });
  const r1 = TR.train(s, 'cal');
  assert.ok(r1 && r1.gain > 0);
  assert.equal(TR.train(s, 'cal'), null);                          // nur einmal pro Woche
  let ups = 0;
  for (let i = 0; i < 14; i++) { nextWeek(s); if (TR.train(s, 'cal')?.up) ups++; }
  assert.ok(ups >= 2 && s.player.attrs.cal >= 62, 'Rechnen ' + s.player.attrs.cal);
  const before = Object.values(s.player.attrs).reduce((a, b) => a + b, 0);
  for (let i = 0; i < 20; i++) nextWeek(s);                         // 20 Wochen ohne Training
  const after = Object.values(s.player.attrs).reduce((a, b) => a + b, 0);
  assert.ok(after < before, `${before} → ${after}`);
  assert.ok(s.news.some(n => n.title.startsWith('Formverlust')));
});

test('Rechnen: schwache Rechner stehen öfter auf Bogey-Zahlen', () => {
  const rng = new RNG(5), A = { sco: 75, fin: 75, men: 75, foc: 75, exp: 0 };
  let ba = 0, bb = 0;
  for (let i = 0; i < 800; i++) { const r = simulateMatch({ ...A, cal: 40 }, { ...A, cal: 95 }, { legs: 4 }, rng); ba += r.stats[0].bogey; bb += r.stats[1].bogey; }
  assert.ok(ba > bb * 2, `${ba} vs ${bb}`);
});

test('Checkout-Entscheidung: Wege, Chancen, gewählter Weg wird gespielt', () => {
  const s = newCareer({ name: 'Test', nation: 'DE', hand: 'R', seed: 71, bonus: { cal: 25 } });
  enterEvent(s, eventsInWeek(s, 2027, 1).find(e => e.cat === 'local').id);
  const live = startManualMatch(s), lm = live.m;
  lm.turn = live.me; lm.rem[live.me] = 100; lm.visit = { darts: [], start: 100 };
  let co = null;
  for (let k = 0; k < 40 && !co; k++) { lm.stats[live.me].darts = k * 3; co = DC.checkoutDecisionDue(s); }
  assert.ok(co && co.opts.length >= 2);
  assert.equal(co.recommended !== null, true);                       // Rechnen 85 → Empfehlung
  assert.deepEqual(co.opts[0].route, ['T20', 'D20']);
  DC.chooseRoute(s, 100, ['T19', 'S11', 'D16']);
  assert.equal(DC.routeTarget(live, 100, 0), 'T19');
  assert.equal(DC.routeTarget(live, 43, 1), 'S11');                  // nach T19 (57) → 43
  assert.equal(DC.routeTarget(live, 80, 1), null);                   // Plan verlassen → Standardlogik
  liveAiVisit(s);
  assert.equal(live.route, null);
  const hi = DC.routeChance({ sco: 95, fin: 95, men: 95, foc: 95, cal: 95, exp: 0 }, 40, ['D20'], new RNG(1));
  const lo = DC.routeChance({ sco: 50, fin: 50, men: 50, foc: 50, cal: 50, exp: 0 }, 40, ['D20'], new RNG(1));
  assert.ok(hi > lo);
});

test('Wochenplan: 1 Aktivität, Ruhetag, Sponsortermin, Exhibition, Ermüdung, Sprung', () => {
  const s = newCareer({ name: 'Test', nation: 'DE', hand: 'R', seed: 81 });
  assert.equal(TR.canDo(s, 'sponsor').ok, false);                   // kein Sponsor
  const r = TR.doActivity(s, 'exhibition');
  assert.ok(r.ok && s.player.fatigue === 20 && s.finance.balance > 5000);
  assert.equal(TR.train(s, 'sco'), null);                           // Woche schon verplant
  assert.equal(TR.doActivity(s, 'rest').ok, false);
  nextWeek(s);
  assert.equal(s.player.fatigue, 10);                               // −10 Erholung pro Woche
  s.player.fatigue = 100;
  assert.ok(perf(s.player).sco < s.player.attrs.sco);               // Ermüdung kostet Leistung
  assert.ok(TR.doActivity(s, 'rest').ok); assert.equal(s.player.fatigue, 70);
  s.player.fatigue = 0;
  enterEvent(s, eventsInWeek(s, 2027, 2).find(e => e.cat === 'local').id);
  simulateRest(s); closeEvent(s);
  assert.ok(s.player.fatigue > 0);                                  // Turnier ermüdet
  // Sprung: mit Tourcard bis zum nächsten Pro-Tour-Event, dabei automatisch trainiert
  s.player.tour = 'tour'; s.player.cardUntil = 2028;
  nextWeek(s);
  const weeks = jumpToNextEvent(s);
  assert.ok(weeks >= 1);
  assert.ok(eventsInWeek(s, s.date.year, s.date.week).some(e => e.cat !== 'local' && eventStatus(s, e).playable));
  assert.equal(TR.trainingOf(s).idle, 0);
  assert.equal(jumpToNextEvent(s), 0);                              // jetzt steht ein Event an → kein Sprung
});

test('Level: 50/100 XP, steigende Kosten, 5 Punkte je Level, Max 100, Migration', () => {
  assert.equal(xpForLevel(1), 50); assert.equal(xpForLevel(2), 100);
  for (let L = 2; L < MAX_LEVEL; L++) assert.ok(xpForLevel(L) - xpForLevel(L - 1) >= xpForLevel(2) - xpForLevel(1) - 10, 'Zuwachs ' + L);
  assert.ok(xpForLevel(99) - xpForLevel(98) > 3 * (xpForLevel(3) - xpForLevel(2)));   // am Ende deutlich schwerer
  const s = newCareer({ name: 'L', nation: 'DE', hand: 'R', seed: 2 }), p = s.player;
  assert.equal(p.level, 1); assert.equal(p.xp, 0);
  assert.equal(addXp(p, 49), 0); assert.equal(addXp(p, 1), 1);
  assert.equal(p.level, 2); assert.equal(p.points, 5); assert.equal(p.xp, 0);
  assert.equal(addXp(p, 100 + 150), 2); assert.equal(p.level, 4); assert.equal(p.points, 15);
  addXp(p, 10_000_000); assert.equal(p.level, MAX_LEVEL); assert.equal(p.pointsEarned, 5 * (MAX_LEVEL - 1));
  assert.deepEqual(levelFromXp(50 + 100 + 30), { level: 3, xp: 30 });
  const old = newCareer({ name: 'M', nation: 'DE', hand: 'R', seed: 3 });
  delete old.player.level; old.player.xpTotal = 300; old.player.points = 7;
  migrate(old); assert.equal(old.player.level, 4); assert.equal(old.player.points, 7);   // verdiente Punkte bleiben
});

console.log(`\n${n} Tests ok`);
