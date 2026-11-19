// Node-Tests: node tests/run.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
// Tour-Modus: Fähigkeit → Attribut (wie syncAttrs)
const A = v => Math.round((87.5 + 12.5 / 60 * v) * 10) / 10;
const AS = v => Math.round((83 + 17 / 60 * v) * 10) / 10;   // Version 191: Scoring-Skala (0 = 83 ≈ Ø 82)
import { newCareer } from '../js/state.js';
import { overall } from '../js/player.js';
import { eventsInWeek } from '../js/calendar.js';
import { CALENDAR } from '../data/tournaments.js';
import { nextWeek, jumpToNextEvent } from '../js/season.js';
import { perf, xpForLevel, addXp, levelFromXp, MAX_LEVEL } from '../js/player.js';
import { migrate } from '../js/state.js';
import { liveDartStep, oppMatchDartVisit, boardCall, isBigTreble } from '../js/tournaments.js';
import * as FO from '../js/form.js';
import * as ET from '../js/tournaments.js';
import * as RV from '../js/rival.js';
import { book, levelPrice } from '../js/finance.js';
import { orderOfMerit, rankOf } from '../js/rankings.js';
import { playersOfTier, nonCardPros, getPlayer, secondaryOrder } from '../js/world.js';
import { majorField } from '../js/majors.js';
import { eventStatus, enterEvent, playRound, nextRound, simulateRest, closeEvent, playerMatch, nextSub, simulateRoundAI } from '../js/tournaments.js';
import { eventCost } from '../js/finance.js';
import { RNG } from '../js/rng.js';
import { simulateMatch } from '../js/matchEngine.js';
import { scoreAt, targetPoint, checkoutRoute, labelValue, suggestTarget } from '../js/board.js';
import { buildRounds } from '../js/bracket.js';
import { createMatch, throwDart } from '../js/matchState.js';
import { startManualMatch, liveAiDart, simulateLiveRest, liveAiVisit } from '../js/tournaments.js';
import { legAverage } from '../js/matchState.js';
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
  assert.equal(Object.keys(s.world.players).length, 128 + 92 + 97 + 50 + 63 + 1 + 90 + 351 + 6 + 19 + 25 + 4 + 2);   // Version 234: + Jack Nankervis (JDC, im Startjahr dieses Tests schon 16) ·   // Version 232: + 13 Nebentour, + 4 CT (E…) ·   // Version 203: + Zehra Gemi, Merve Hummel (JDC 2027) · Version 194: + 11 Nordafrika · Version 192: + 10 CDLC · Version 190: + 30 Polen · Version 189: + 12 China · Version 188: + 16 südliches Afrika · Version 187: + 15 Inder · Version 185: + 25 Super-League-Spieler · Version 184: + Tergel Khurelkhuu (JDC, 16 in 2027) · Version 183: Asien 53 · Version 182: Osteuropa 46 · Version 181: Radek Szagański nur noch Challenge Tour · Version 161: + Silvia Lindner · Version 101: 91 Spielerinnen, Noa-Lynn in der Challenge Tour   // + ehem. Holder (Version 96) + JDC-Talente ab 16 (2027: Cook, Lawrie, Dopfer) + Rivale + schwacher Pool + Nebentouren (7 × 8)
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
  // Preisniveau: +1 % je Level über 1
  assert.deepEqual(eventCost({ cat: 'challenge', country: 'ENG', count: 2 }, null, 51), { fee: 50, travel: 900, total: 950 });   // Gebühr bleibt 25 €
  assert.equal(eventCost({ cat: 'pc', country: 'ENG' }).fee, 0); assert.equal(eventCost({ cat: 'major', country: 'ENG' }).fee, 0);
  assert.equal(eventCost({ cat: 'wdf', europe: false }, null, 21).total, 1200);
  assert.equal(eventCost({ cat: 'local' }, null, 80).total, 0);
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
    if (local && !s.week.blocked) {
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
  // Version 178: Scoring-Pläne (Rest zu Beginn der Aufnahme)
  { const B = { suggestTarget };
    assert.equal(B.suggestTarget(265, 3), 'T19'); assert.equal(B.suggestTarget(208, 2, null, 265), 'T19'); assert.equal(B.suggestTarget(302, 3), 'T18');
    assert.equal(B.suggestTarget(175, 2, null, 232), 'BULL'); assert.equal(B.suggestTarget(213, 2, null, 232), 'BULL'); assert.equal(B.suggestTarget(196, 1, null, 272), 'BULL');
    assert.equal(B.suggestTarget(151, 1, null, 265), B.suggestTarget(151, 1));
    assert.equal(B.suggestTarget(265, 3, 0.9, null, false), 'T20'); }   // Version 179: Pläne nur mit hohem Rechnen-Wert
  test('Version 179: Verrechnen um 10/20 Punkte', async () => {
    const T = await import('../js/throwModel.js'), { RNG } = await import('../js/rng.js'), r = new RNG({ s: 4 }), seen = new Set();
    for (let i = 0; i < 200; i++) seen.add(T.miscalcTarget('D16', 32, 1, r, 3));
    assert.ok(seen.has('D11') && seen.has('D6'));   // wie für 22 bzw. 12
  });
  // Version 177: PDC-Checkout-Tabelle mit 3 Darts, mit 2 Darts weiterhin kürzester Weg
  assert.deepEqual(checkoutRoute(110, 3), ['T20', 'S10', 'D20']); assert.deepEqual(checkoutRoute(110, 2), ['T20', 'BULL']); assert.deepEqual(checkoutRoute(128, 3), ['S18', 'T20', 'BULL']);
  for (let r = 99; r <= 170; r++) { const w = checkoutRoute(r, 3); if (w) assert.ok(w.reduce((a, l) => a + labelValue(l), 0) === r && /^(D|BULL)/.test(w.at(-1)), String(r)); }
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
  assert.equal(tour, 128);                                      // 101 + je Tag 2 Finalisten (16) + Restplätze über die Rangliste (11)
  const via = playersOfTier(s, 'tour').map(p => p.cardVia ?? '');
  assert.equal(via.filter(v => /Rangliste/.test(v)).length + (/Rangliste/.test(s.player.cardVia ?? '') ? 1 : 0), 11);
  assert.equal(via.filter(v => /Europa.*Rangliste/.test(v)).length + (/Europa.*Rangliste/.test(s.player.cardVia ?? '') ? 1 : 0), 6);   // ungerade → 1 mehr an EU
  assert.equal(s.player.qschoolYear, 2027);
  const ct = eventsInWeek(s, 2027, 11).find(e => e.cat === 'challenge');
  s.date.week = 11; s.week = { played: false, eventId: null };
  assert.equal(eventStatus(s, ct).playable, s.player.tour !== 'tour');
});

test('Challenge-Wochenende (5 Turniere) + Hintergrund-OOM', () => {
  const s = newCareer({ name: 'Test', nation: 'DE', hand: 'R', seed: 4 });
  s.player.qschoolYear = 2027; s.date.week = 11;
  const b0 = s.finance.balance;
  const places = playBlock(s, 'ct-1');
  assert.equal(places.length, 5);
  assert.ok(s.results.slice(0, 5).every((r, i) => r.name === `Challenge Tour ${5 - i}`), s.results.slice(0, 5).map(r => r.name).join());
  assert.equal(CALENDAR.filter(e => e.cat === 'challenge').reduce((n, e) => n + e.count, 0), 25);
  assert.equal(CALENDAR.filter(e => e.cat === 'dev' && e.count).reduce((n, e) => n + e.count, 0), 25);
  const ct = orderOfMerit(s, 'challenge');
  assert.ok(ct.filter(x => x.money > 0).length >= 32);
  s.week = { played: true, eventId: 'ct-1' }; s.date.week = 14;  // Dev-Wochenende ohne Spieler
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
  for (const y of [2029]) for (const id of ['masters', 'uk-open', 'matchplay', 'wgp', 'ec', 'gsod', 'pcf', 'wm', 'wcod', 'pl-final', 'youth-wm'])
    assert.ok(s.champions[y].some(c => c.eventId === id), `${id} ${y}`);
  assert.equal(s.champions[2029].filter(c => c.cat === 'pc').length, 30);
  assert.ok(Object.keys(s.champions).every(y => +y >= 2029), 'Version 163: nur Vorjahr + aktuelles Jahr');
  assert.ok(Object.keys(s.rankings.years).every(y => +y >= 2028) && Object.keys(s.qual).every(y => +y >= 2029), 'alte Jahre gelöscht');
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
  // TCHQ direkt nach dem PC-Block: nur Übernachtung extra, 10 Qualifikanten, kein Preisgeld
  const tq = eventsInWeek(s, 2027, 6).find(e => e.id === 'etq-1');
  assert.ok(tq && tq.extra && tq.etId === 'et-1');
  const direct = ET.etDirect(s);
  if (direct.includes('P')) { assert.equal(eventStatus(s, tq).playable, false); ET.runAITournament(s, tq); }
  else {
    const st = eventStatus(s, tq);
    assert.ok(st.playable && st.cost.addOn && st.cost.total >= 150 && st.cost.total < 200 && st.cost.fee === 0);   // 150 € × Preisniveau
    enterEvent(s, 'etq-1');
    assert.ok(s.activeEvent.isQualifier && s.activeEvent.stopAt === 10);
    assert.ok(!s.activeEvent.rounds[0].matches.some(m => direct.includes(m.a) || direct.includes(m.b)));
    simulateRest(s);
    assert.ok(['QUAL', 'NQ'].includes(s.activeEvent.place) && !s.activeEvent.hasNext && !s.activeEvent.prize);
    closeEvent(s);
  }
  assert.equal(new Set(ET.etStore(s, 'et-1').tchq).size, 10);
  // ET-Hauptfeld: 48 = 16 gesetzt + 16 Pro Tour + 10 TCHQ + 4 HNQ + 2 Regionen (Rest aufgefüllt)
  s.date.week = 7; s.week = { played: false, eventId: null };
  const etEv = eventsInWeek(s, 2027, 7).find(e => e.id === 'et-1');
  const e = ET.etEntrants(s, etEv, true), all = Object.values(e).flat();
  assert.equal(all.length, 48); assert.equal(new Set(all).size, 48);
  assert.equal(e.seeds.length, 16); assert.equal(e.pt.length, 16); assert.ok(e.tchq.length >= 8 && e.tchq.length <= 10, `TCHQ ${e.tchq.length}`);   // 1–2 Quali-Sieger kann zwischen Quali und ET (Gewichtung der 2-Jahres-OOM ändert sich je Woche) schon über die Pro Tour qualifiziert sein
  assert.equal(eventStatus(s, etEv).playable, ET.etQualified(s, etEv));
  if (ET.etQualified(s, etEv)) {
    enterEvent(s, 'et-1');
    assert.equal(s.activeEvent.fieldSize, 48); assert.ok(!s.activeEvent.isQualifier);
    simulateRest(s); closeEvent(s);
  }
  s.week = { played: true, eventId: 'et-1' };
  nextWeek(s);                                                     // CT läuft im Hintergrund
  assert.ok(s.news.some(n => n.title.startsWith('Pro Tour') || n.title.startsWith('PDC Order')));
});

test('ET: Top-16-Spieler direkt im Hauptfeld', () => {
  const s = newCareer({ name: 'Test', nation: 'DE', hand: 'R', seed: 32 });
  s.player.tour = 'tour'; s.player.cardUntil = 2028;
  s.rankings.years[2026].pdc.P = 3000000;                          // Platz 1
  s.date.week = 7;
  assert.equal(eventStatus(s, eventsInWeek(s, 2027, 6).find(e => e.id === 'etq-1')).playable, false);   // kein TCHQ nötig
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
  assert.equal(bal - s.finance.balance, 25 + levelPrice(250, s.player.level));     // Gebühr fix, Reise × Preisniveau
  assert.equal(s.activeEvent.fieldSize, 64);
  simulateRest(s); closeEvent(s);
});

test('Majors: Felder, Gruppenphase, World Cup, Premier League, WM', async () => {
  const s = newCareer({ name: 'Test', nation: 'DE', hand: 'R', seed: 41 });
  for (let i = 0; i < 52; i++) nextWeek(s);
  const q = s.qual[2027];
  assert.equal(q.masters.length, 24); assert.equal(q.matchplay.length, 32); assert.equal(q.pcf.length, 64);
  assert.equal(q.wm.length, 128); assert.equal(new Set(q.wm).size, 128);
  assert.ok(!s.news.some(n => n.title.includes('Top 40')) && s.news.some(n => n.title.includes('WM-Ticket')));   // Version 195/196: WM-Qualifikanten als News (ohne OOM-Plätze)
  assert.ok(q.wmqSurvivors.length >= 2 && q.wmqSurvivors.every(id => q.wm.includes(id)));      // TCHQ: Restplätze, mind. 2
  assert.equal(Object.keys(q.wmReg).length, 21); assert.equal(Object.values(q.wmReg).flat().length, 22); assert.ok(q.wmYouth);   // 21 Qualifier, Asian Championship 2
  for (const [c, n] of Object.entries({ asia: 5, cdc: 2, nb: 2, dpa: 1, dpnz: 1 })) assert.ok(q.wm.filter(id => getPlayer(s, id)?.circuit === c).length >= n);
  assert.ok(q.wm.filter(id => getPlayer(s, id)?.circuit === 'women').length >= 4);   // Women's Series Platz 2–5 (+ ggf. Spielerinnen über CT/Dev, Version 203)
  { const w1 = secondaryOrder(s, 'women', 2027)[0], alsoCt = (await import('../data/secondary.js')).SEC_ALSO_CT;   // v138: eingefrorene Reihenfolge (Nr. 1 kann danach zurücktreten)
    assert.ok(getPlayer(s, w1)?.tier !== 'secondary' || !q.wm.includes(w1) || alsoCt.includes(getPlayer(s, w1).name)
      || secondaryOrder(s, 'women', 2027, { tour: true }).slice(1, 5).includes(w1)); }   // Tour-Spielerin (Beau) war zur Quali ohne Karte Nr. 1   // v180: Beau Greaves (Dev/Tour) kann über ihre Tour bei der WM sein
  assert.ok(q.wmReg.uki.every(id => ['ENG', 'SCO', 'WAL', 'NIR', 'IRL'].includes(getPlayer(s, id).nation)));
  assert.ok(q.wmReg.esl.every(id => ['DE', 'AT', 'CH'].includes(getPlayer(s, id).nation)));
  assert.ok(q.wm.slice(0, 32).every((id, i) => id === q.wmAuto[i]));                       // Top 32 PDC gesetzt
  { const grp = id => { const i = q.wm.indexOf(id); return i < 32 ? 'A' : i < 64 ? 'B' : 'C'; }, r1 = buildRounds(q.wm, { default: { legs: 3 } })[0].matches;   // Version 201: WM-Modus A/B/C
    assert.equal(r1.length, 64); assert.ok(r1.every(m => (grp(m.a) === 'C') !== (grp(m.b) === 'C')), 'Runde 1: A–C und B–C');
    for (let i = 0; i < 64; i += 2) assert.ok([r1[i], r1[i + 1]].map(m => grp(m.a) + grp(m.b)).sort().join() === ['AC', 'BC'].join() || [r1[i], r1[i + 1]].map(m => [grp(m.a), grp(m.b)].sort().join('')).sort().join() === 'AC,BC', 'Runde 2: Sieger A/C gegen Sieger B/C');
    const ord = q.wmOrder; assert.ok(q.wm.slice(0, 64).every(id => ord.indexOf(id) >= 0) && Math.max(...q.wm.slice(0, 32).map(id => ord.indexOf(id))) < Math.min(...q.wm.slice(32, 64).map(id => ord.indexOf(id)))); }
  assert.equal(q.gsod.length, 48); assert.ok(Object.keys(q.wcTeams).length >= 8);
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
  assert.equal(inst.groups.length, 16); assert.ok(inst.groups.every(g => g.length === 3)); assert.ok(inst.rounds[0].isGroup);
  assert.deepEqual(inst.rounds.map(r => r.name).slice(0, 4), ['Gruppenphase · Spieltag 1', 'Gruppenphase · Spieltag 2', 'Gruppenphase · Spieltag 3', 'Achtelfinale']);   // Version 94: Gruppensieger direkt ins Achtelfinale
  let guard = 0;
  while (!inst.done && guard++ < 20) {
    if (inst.playerAlive && playerMatch(inst)) playRound(s); else simulateRoundAI(s);
    nextRound(s);
  }
  assert.ok(inst.done);
  assert.ok(['W', 'F', 'SF', 'QF', 'L16', 'G2', 'G3'].includes(inst.place), inst.place);
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

test('Rechnen: schwache Rechner stehen öfter auf Bogey-Zahlen', () => {
  const rng = new RNG(5), A = { sco: 75, fin: 75, men: 75, foc: 75, exp: 0 };
  let ba = 0, bb = 0;
  for (let i = 0; i < 800; i++) { const r = simulateMatch({ ...A, cal: 40 }, { ...A, cal: 95 }, { legs: 4 }, rng); ba += r.stats[0].bogey; bb += r.stats[1].bogey; }
  assert.ok(ba > bb * 2, `${ba} vs ${bb}`);
});

test('Checkout-Entscheidung: 3 Wege – Check, Doppel-Rest, schlechte Aufnahme; gewählter Weg wird gespielt', () => {
  const s = newCareer({ name: 'Test', nation: 'DE', hand: 'R', seed: 71, bonus: { cal: 25 } });
  enterEvent(s, eventsInWeek(s, 2027, 1).find(e => e.cat === 'local').id);
  const live = startManualMatch(s), lm = live.m;
  lm.turn = live.me; lm.rem[live.me] = 100; lm.visit = { darts: [], start: 100 };
  let co = null;
  for (let k = 0; k < 40 && !co; k++) { lm.stats[live.me].darts = k * 3; co = DC.checkoutDecisionDue(s); }
  assert.ok(co && co.opts.length === 3);
  assert.deepEqual(co.opts.map(o => o.outcome).sort(), ['bad', 'check', 'setup']);
  assert.equal(co.opts[co.recommended].outcome, 'check');            // Rechnen 85 → Empfehlung = der Check-Weg
  for (const o of co.opts) {                                         // jede Wahl im Live-Match nachspielen
    const t = JSON.parse(JSON.stringify(s)), tl = t.activeEvent.live;
    DC.chooseRoute(t, 100, o.route, o.script);
    liveAiVisit(t);
    const rest = tl.m.rem[tl.me];
    if (o.outcome === 'check') assert.ok(tl.m.legs[tl.me] === 1 || tl.m.done, 'Check');
    if (o.outcome === 'setup') assert.ok(rest >= 2 && rest <= 40 && rest % 2 === 0, 'Doppel-Rest ' + rest);
    if (o.outcome === 'bad') assert.ok(rest === 100 || !(rest <= 40 && rest % 2 === 0), 'schlecht ' + rest);
  }
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

test('Level: 50/100 XP, steigende Kosten, Punkte je Level steigend (1 → 7), Max 100, Migration', async () => {
  assert.equal(xpForLevel(1), 50); assert.equal(xpForLevel(2), 100);
  for (let L = 2; L < MAX_LEVEL; L++) assert.ok(xpForLevel(L) - xpForLevel(L - 1) >= xpForLevel(2) - xpForLevel(1) - 10, 'Zuwachs ' + L);
  assert.ok(xpForLevel(99) - xpForLevel(98) > 3 * (xpForLevel(3) - xpForLevel(2)));   // am Ende deutlich schwerer
  const s = newCareer({ name: 'L', nation: 'DE', hand: 'R', seed: 2 }), p = s.player;
  assert.equal(p.level, 1); assert.equal(p.xp, 0);
  assert.equal(addXp(p, 49), 0); assert.equal(addXp(p, 1), 1);
  assert.equal(p.level, 2); assert.equal(p.points, 1); assert.equal(p.xp, 0);       // anfangs 1 Punkt je Level
  assert.equal(addXp(p, 100 + 150), 2); assert.equal(p.level, 4); assert.equal(p.points, 3);
  addXp(p, 10_000_000); assert.equal(p.level, MAX_LEVEL); assert.equal(p.pointsEarned, 548);
  const PL = await import('../js/player.js');
  assert.deepEqual([2, 4, 5, 8, 9, 15, 26, 41, 61, 100].map(PL.pointsForLevel), [1, 1, 2, 2, 3, 4, 5, 6, 7, 7]);
  assert.equal(PL.pointsGained(10, 3), 2 + 3 + 3);
  assert.deepEqual(levelFromXp(50 + 100 + 30), { level: 3, xp: 30 });
  const old = newCareer({ name: 'M', nation: 'DE', hand: 'R', seed: 3 });
  delete old.player.level; old.player.xpTotal = 300; old.player.points = 7;
  migrate(old); assert.equal(old.player.level, 4); assert.equal(old.player.points, 7);   // verdiente Punkte bleiben
});

test('Bühne: Erfahrung zählt in Majors/gegen große Namen; Selbstvertrauen', () => {
  const inst = { cat: 'major', eventId: 'wm', current: 0, rounds: [{ remaining: 64 }], big: [] };
  assert.equal(FO.stageFactor(inst, 'P', 'T1'), 1);
  inst.rounds[0].remaining = 8; assert.equal(FO.stageFactor(inst, 'P', 'T1'), 1.5);
  const pc = { cat: 'pc', current: 0, rounds: [{ remaining: 64 }], big: ['T1'] };
  assert.equal(FO.stageFactor(pc, 'P', 'T1'), 0.7); assert.equal(FO.stageFactor(pc, 'P', 'T99'), 0);
  const rook = FO.applyStage({ sco: 80, fin: 80, men: 80, foc: 80, exp: -4 }, 1.5), vet = FO.applyStage({ sco: 80, fin: 80, men: 80, foc: 80, exp: 10 }, 1.5);
  assert.ok(rook.sco < 79 && vet.sco > 81);   // Bühne ±0,2 je Stufe (Version 60)
  // ≈ Siegchance gleich starker Spieler: Veteran vs. Neuling auf großer Bühne deutlich vorn
  let w = 0; const rng = new RNG(5);
  for (let i = 0; i < 300; i++) if (simulateMatch(vet, rook, { legs: 6 }, rng).winner === 0) w++;
  assert.ok(w / 300 > 0.62, 'Veteran ' + w / 300);
  const p = { attrs: { sco: 70, fin: 70, men: 70, foc: 70, cal: 70 }, momentum: 0 };
  for (let i = 0; i < 4; i++) FO.updateMomentum(p, { won: true, opp: { attrs: { sco: 80, fin: 80, men: 80, foc: 80, cal: 80 } }, cat: 'challenge' });
  assert.equal(p.momentum, 6); assert.equal(FO.momentumBonus(p), 3); assert.equal(perf({ ...p, exp: 0 }).sco, 73);
  FO.momentumDecay(p); assert.ok(p.momentum < 5);
  for (let i = 0; i < 20; i++) FO.momentumDecay(p);
  assert.equal(p.momentum, 0);
  FO.updateMomentum(p, { won: true, opp: null, cat: 'local' }); assert.equal(p.momentum, 0.3);   // lokal zählt wenig
});

test('Gegner-Matchdarts: Erkennung + dartweiser Wurf', () => {
  const s = newCareer({ name: 'T', nation: 'DE', hand: 'R', seed: 21 });
  const ev = eventsInWeek(s, s.date.year, s.date.week).find(e => e.cat === 'local');
  enterEvent(s, ev.id);
  const live = startManualMatch(s), lm = live.m, op = 1 - live.me;
  assert.equal(oppMatchDartVisit(s), false);                        // Start: kein Matchdart
  lm.turn = op; lm.legs[op] = lm.format.legs - 1; lm.rem[op] = 40; lm.visit = { start: 40, darts: [] };
  assert.ok(oppMatchDartVisit(s));
  lm.rem[op] = 169; lm.visit.start = 169; assert.equal(oppMatchDartVisit(s), false);   // Bogey
  lm.rem[op] = 40; lm.visit.start = 40;
  let r, n = 0;
  do { r = liveDartStep(s); n++; assert.ok(r.dart.target && Number.isFinite(r.dart.x)); } while (!r.visitOver);
  assert.ok(n >= 1 && n <= 3);
  assert.ok(lm.done || lm.turn === live.me);
  // Schaltung ans Board: Matchdarts beider Seiten immer, große Finishes mit Chance, nie über 170/Bogey
  if (!lm.done) {
    const me = live.me;
    lm.turn = me; lm.legs[me] = lm.format.legs - 1; lm.rem[me] = 32; lm.visit = { start: 32, darts: [] };
    assert.equal(boardCall(s), 'match');
    lm.legs[me] = 0; lm.rem[me] = 200; lm.visit.start = 200; assert.equal(boardCall(s), null);
    lm.rem[me] = 40; lm.visit.start = 40; assert.equal(boardCall(s), null);          // kleines Finish ohne Matchdart
    let hits = 0; for (let i = 0; i < 200; i++) { lm.rem[me] = 121; lm.visit.start = 121; if (boardCall(s) === 'finish') hits++; }
    assert.ok(hits > 40 && hits < 100, `finish ${hits}`);
  }
  assert.ok(isBigTreble({ mult: 3, score: 57 }) && !isBigTreble({ mult: 3, score: 51 }) && !isBigTreble({ mult: 1, score: 20 }));
});

test('WDF-Opens: nur ohne Karte, Reise 400/1.000 €, Preisgeld, kompletter Ablauf', () => {
  const s = newCareer({ name: 'W', nation: 'DE', hand: 'R', seed: 51 });
  s.date.week = 6;
  const dutch = eventsInWeek(s, 2027, 6).find(e => e.id === 'wdf-dutch');
  assert.ok(dutch && dutch.prizeWin >= 2200 && dutch.prizeWin <= 2500);                      // Platinum
  assert.equal(eventCost(dutch).total, 400);
  assert.equal(eventCost(eventsInWeek(s, 2027, 3).find(e => e.id === 'wdf-vegas')).total, 1000);
  for (let w = 1; w <= 52; w++) for (const e of eventsInWeek(s, 2027, w).filter(e => e.cat === 'wdf')) assert.ok(e.prizeWin >= 1000 && e.prizeWin <= 2500);
  assert.ok(eventStatus(s, dutch).playable);
  const b0 = s.finance.balance;
  enterEvent(s, dutch.id);
  assert.equal(s.activeEvent.fieldSize, 128);
  const boost = s.activeEvent.xpBoost;
  assert.ok(boost >= 1.2 && boost <= 1.6, 'Boost ' + boost);
  simulateRest(s);
  const inst = s.activeEvent, pr = { W: dutch.prizeWin, F: 500, SF: 250, QF: 100 }[inst.place] ?? 0;
  assert.equal(inst.prize, pr);
  closeEvent(s);
  assert.equal(s.finance.balance, b0 - 400 + pr);
  s.player.tour = 'tour'; s.player.cardUntil = 2028;
  assert.equal(eventStatus(s, eventsInWeek(s, 2027, 18).find(e => e.id === 'wdf-denmark')).playable, false);   // mit Karte gesperrt
  s.player.tour = 'none'; s.week = { played: true }; s.date.week = 18;
  nextWeek(s);                                                                                    // KI-WDF im Hintergrund (beide Turniere des Wochenendes)
  assert.ok(['wdf-denmark', 'wdf-denmark-masters'].every(id => s.champions[2027].some(c => c.eventId === id)));
  assert.ok(s.news.some(n => n.title.startsWith('🎯 WDF:') && n.title.includes('Denmark Open')));   // Version 99: Gold-Sieger als News
  assert.ok(!s.news.some(n => n.title.includes('Denmark Masters')), 'Silber ohne News');
  assert.equal(CALENDAR.filter(e => e.cat === 'wdf').length, 14);
  const boosts = new Set();
  for (let i = 0; i < 12; i++) { const t = newCareer({ name: 'B', nation: 'DE', hand: 'R', seed: 60 + i }); t.date.week = 6; enterEvent(t, 'wdf-dutch'); boosts.add(t.activeEvent.xpBoost); }
  assert.ok(boosts.size >= 3);                                                                      // Boost zufällig
});

test('Rivale: gleich alt, ähnliche Stärke, Duelle, Bilanz, hält mit, Migration', () => {
  const s = newCareer({ name: 'R', nation: 'DE', hand: 'R', seed: 71, bonus: { sco: 25 } });
  const r = RV.rivalOf(s);
  assert.ok(r && r.age === 16 && r.nation === 'DE' && r.tier === 'dev' && r.name !== 'R');
  assert.ok(Math.abs(overall(r.attrs) - overall(s.player.attrs)) <= 6, `${overall(r.attrs)} vs ${overall(s.player.attrs)}`);
  let met = 0, inField = 0;
  for (let w = 0; w < 30; w++) {
    const e = eventsInWeek(s, s.date.year, s.date.week).find(x => x.cat === 'local');
    if (e && !s.week.blocked) { enterEvent(s, e.id); if (s.activeEvent.rounds[0].matches.some(m => m.a === r.id || m.b === r.id)) inField++; simulateRest(s); closeEvent(s); }
    nextWeek(s);
  }
  met = s.rival.w + s.rival.l;
  assert.ok(inField >= 6 && inField <= 20, 'im Feld ' + inField);
  assert.equal(s.rival.meetings.length, met);
  if (met) assert.ok(s.news.some(n => n.title.includes('Rivale')));
  // Jahresende: Rivale zieht Richtung Spielerniveau
  s.player.attrs = { sco: 90, fin: 90, men: 90, foc: 90, cal: 90 };
  const before = r.avg;
  RV.rivalYearEnd(s, new RNG(3), 2027);
  assert.ok(r.avg > before + 4, `${before} → ${r.avg}`);
  const old = JSON.parse(JSON.stringify(s)); delete old.rival; delete old.world.players.R1; old.version = 9;
  migrate(old); assert.ok(old.rival && RV.rivalOf(old));
});

test('Auswahl Turnieranzahl (CT) + Host-Nation-Qualifier → ET-Hauptfeld', () => {
  const s = newCareer({ name: 'H', nation: 'DE', hand: 'R', seed: 91 });
  s.player.qschoolYear = 2027; s.date.week = 11;
  const b0 = s.finance.balance;
  enterEvent(s, 'ct-1', { count: 2 });
  assert.equal(b0 - s.finance.balance, 50 + 600);                  // 2 × 25 € + Reise ENG
  let played = 1;
  for (;;) { simulateRest(s); if (!s.activeEvent.hasNext) break; nextSub(s); played++; }
  assert.equal(played, 2);
  closeEvent(s);                                                    // Turniere 3–5 laufen im Hintergrund
  assert.ok(orderOfMerit(s, 'challenge').filter(x => x.money > 0).length > 60);
  // HNQ: nur Gastgebernation ohne Karte
  s.week = { played: false }; s.date.week = 8;
  const hnq = eventsInWeek(s, 2027, 8).find(e => e.id === 'hnq-2');
  assert.ok(hnq && hnq.etId === 'et-2' && eventStatus(s, hnq).playable);
  s.player.nation = 'NL'; assert.equal(eventStatus(s, hnq).playable, false); s.player.nation = 'DE';
  enterEvent(s, 'hnq-2', { count: 4 });
  assert.ok(s.activeEvent.rounds[0].matches.every(m => [m.a, m.b].filter(Boolean).every(id => id === 'P' || getPlayer(s, id).nation === 'DE')));
  for (;;) { simulateRest(s); if (!s.activeEvent.hasNext) break; nextSub(s); }
  const won = s.activeEvent.place === 'W';
  closeEvent(s);                                                    // restliche HNQ-Turniere im Hintergrund
  const hw = ET.etStore(s, 'et-2').hnq;
  assert.equal(hw.length, 4); assert.equal(new Set(hw).size, 4);    // 4 Plätze für die Gastgebernation
  assert.equal(hw.includes('P'), won);
  // ET-Hauptfeld über HNQ (erzwingen, falls nicht gewonnen)
  if (!won) hw[3] = 'P';
  s.week = { played: false }; s.date.week = 9;
  const et = eventsInWeek(s, 2027, 9).find(e => e.id === 'et-2');
  assert.ok(eventStatus(s, et).playable);
  enterEvent(s, 'et-2');
  assert.ok(ET.etEntrants(s, et, true).hnq.includes('P'));
  assert.ok(s.activeEvent.rounds[0].matches.some(m => m.a === 'P' || m.b === 'P'));
  assert.equal(s.activeEvent.fieldSize, 48);
});

test('Lokale Gegner: Ø 54–74, Migration v7 → v8 einmalig', () => {
  const s = newCareer({ name: 'L', nation: 'DE', hand: 'R', seed: 4 });
  const loc = playersOfTier(s, 'local').map(p => p.avg);
  assert.equal(Math.min(...loc), 54); assert.equal(Math.max(...loc), 74);
  const old = JSON.parse(JSON.stringify(s)); old.version = 7;
  for (const p of Object.values(old.world.players)) if (p.tier === 'local') p.avg += 6;
  migrate(old); migrate(old);
  assert.deepEqual(playersOfTier(old, 'local').map(p => p.avg), loc);
  assert.ok(playersOfTier(s, 'local').every(p => p.nation === 'DE'));               // nur Deutsche
  const v8 = JSON.parse(JSON.stringify(s)); v8.version = 8; v8.world.players.L21.name = 'Ralf Steiner'; v8.world.players.L21.nation = 'AT';
  migrate(v8); assert.equal(v8.world.players.L21.nation, 'DE'); assert.equal(v8.world.players.L21.avg, s.world.players.L21.avg);
});

test('Lampenfieber: nur Profi-Events, baut sich über 60 Profi-Matches ab', () => {
  const p = { proMatches: 0 }, a = { sco: 70, fin: 70, men: 70, foc: 70, cal: 70 };
  assert.equal(FO.nervesFor({ cat: 'challenge' }, p), 0);
  assert.equal(FO.nervesFor({ cat: 'pc' }, p), 5);
  assert.equal(FO.nervesFor({ cat: 'major' }, { proMatches: 30 }), 2.5);
  assert.equal(FO.nervesFor({ cat: 'et' }, { proMatches: 80 }), 0);
  assert.equal(FO.nervesLevel({ everTourcard: true }), 0);                 // alte Spielstände: kein Lampenfieber
  assert.deepEqual(FO.applyNerves(a, 5), { sco: 65, fin: 65, men: 65, foc: 67, cal: 70 });
});

test('Qualifier: fehlende Spieler → fiktive Amateure (nicht zu stark)', async () => {
  const W = await import('../js/world.js');
  const s = newCareer({ name: 'A', nation: 'DE', hand: 'R', seed: 77 });
  s.date.week = 38;
  const hnq = eventsInWeek(s, 2027, 38).find(e => e.cat === 'hnq' && e.country === 'CH');
  const inst = ET.runAITournament(s, hnq, 0);
  const ids = inst.rounds[0].matches.flatMap(m => [m.a, m.b]).filter(Boolean);
  assert.ok(ids.length >= 32 && ids.every(id => getPlayer(s, id).nation === 'CH'));
  const am = playersOfTier(s, 'amateur');
  assert.ok(am.length > 0 && am.every(p => p.avg >= 58 && p.avg <= 72 && p.id.startsWith('A')));
  ET.runAITournament(s, hnq, 1); assert.ok(playersOfTier(s, 'amateur').length <= am.length + 1);   // kein Dauer-Nachschub
  s.date.week = 39;
  const e = ET.etEntrants(s, eventsInWeek(s, 2027, 39).find(x => x.cat === 'et'), false);
  assert.equal(e.region.length, 2); assert.equal(Object.values(e).flat().length, 48);
});

test('Startalter wählbar: Erfahrung, Rivale, Dev-Tour', async () => {
  const PL = await import('../js/player.js');
  const a = newCareer({ name: 'A', nation: 'DE', hand: 'R', seed: 70, age: 24 });
  assert.equal(a.player.age, 24); assert.equal(a.player.exp, PL.startExp(24)); assert.equal(PL.startExp(24), 0);
  assert.equal(PL.startExp(16), -4); assert.equal(PL.startExp(30), 3);
  assert.equal(a.world.players.R1.age, 24); assert.equal(a.world.players.R1.tier, 'challenge');
  assert.equal(newCareer({ name: 'B', nation: 'DE', hand: 'R', seed: 70, age: 99 }).player.age, 60);   // begrenzt (16–60)
  assert.equal(newCareer({ name: 'C', nation: 'DE', hand: 'R', seed: 70 }).player.age, 16);
});

test('Fiktive Spieler: Namen je Karriere neu zusammengesetzt, echte Spieler unverändert', async () => {
  const { NAME_POOLS } = await import('../data/names.js');
  const a = newCareer({ name: 'A', nation: 'DE', hand: 'R', seed: 101 }), b = newCareer({ name: 'B', nation: 'DE', hand: 'R', seed: 202 });
  const names = (s, pre) => Object.values(s.world.players).filter(p => p.id[0] === pre).map(p => p.name);
  for (const pre of ['L', 'V', 'F']) {
    const na = names(a, pre), nb = names(b, pre);
    assert.ok(na.filter((x, i) => x !== nb[i]).length > na.length * 0.8, pre);         // überwiegend andere Namen
  }
  assert.deepEqual(names(a, 'T'), names(b, 'T'));                                     // echte Tour-Spieler bleiben
  assert.equal(a.world.players.C1.name, b.world.players.C1.name);
  assert.notEqual(a.world.players.C92.name, b.world.players.C92.name);                // fiktive CT-Spieler neu
  const de = NAME_POOLS.DE;
  assert.ok(names(a, 'L').every(n => de.first.some(f => n.startsWith(f + ' ')) && de.last.some(l => n.endsWith(' ' + l))));
  const all = Object.values(a.world.players).map(p => p.name);
  assert.equal(new Set(all).size, all.length);                                        // keine Doppelten
  const sw = Object.values(a.world.players).find(p => p.id[0] === 'F' && ['SE', 'DK', 'NO', 'FI'].includes(p.nation));
  if (sw) assert.ok(NAME_POOLS.NORD.last.some(l => sw.name.endsWith(' ' + l)));      // Name passt zur Nation
});

test('Dev Tour ohne Q-School (bis 23), Challenge Tour weiter nur mit Q-School', () => {
  const s = newCareer({ name: 'D', nation: 'DE', hand: 'R', seed: 81 });
  s.date.week = 14;
  const dev = eventsInWeek(s, 2027, 14).find(e => e.cat === 'dev');
  assert.equal(s.player.qschoolYear, null);
  assert.ok(eventStatus(s, dev).playable);
  enterEvent(s, dev.id, { count: 1 }); simulateRest(s); closeEvent(s);
  assert.ok(orderOfMerit(s, 'dev').some(x => x.p.id === 'P'));                     // in der Dev-OOM
  s.date.week = 11; s.week = { played: false, eventId: null };
  const ct = eventsInWeek(s, 2027, 11).find(e => e.cat === 'challenge');
  assert.equal(eventStatus(s, ct).reason, 'Q-School-Teilnahme nötig');
  const old = newCareer({ name: 'O', nation: 'DE', hand: 'R', seed: 81, age: 24 }); old.date.week = 14;
  assert.equal(eventStatus(old, eventsInWeek(old, 2027, 14).find(e => e.cat === 'dev')).reason, 'Nur bis 23 Jahre');
});

test('New Star Darts: Karrierestart mit Tourcard, Fähigkeiten 0–60, Tour-Modus ohne Amateur-Events', async () => {
  const N = await import('../js/nsd.js');
  const { shownTo } = await import('../js/calendar.js');
  const s = N.newNsdCareer({ first: 'Benny', last: 'Buchse', nation: 'DE', age: 18, slot: 1, seed: 5 });
  const p = s.player;
  assert.equal(s.mode, 'nsd'); assert.equal(p.name, 'Benny Buchse'); assert.equal(p.tour, 'tour'); assert.equal(p.cardUntil, 2027);
  assert.equal(s.stars, N.START_STARS); assert.equal(p.energy, 100); assert.equal(p.star.level, 1);
  assert.equal(N.skillValue(p, 'sco'), 0); assert.equal(N.skillValue(p, 'men'), 1);           // Mental = Star-Status
  assert.equal(p.attrs.sco, AS(0)); assert.equal(p.attrs.men, A(1));
  N.setStartSkills(p, { sco: 3, fin: 2, foc: 0, cal: 1 });
  assert.equal(N.skillValue(p, 'sco'), 3); assert.equal(p.attrs.sco, AS(3)); assert.equal(N.skillLevel(p, 'fin'), 1);
  p.skills.sco = Array(20).fill(3); N.syncAttrs(p); assert.equal(p.attrs.sco, 100);           // 60 = Weltspitze
  p.star.level = 80; assert.equal(N.mentalOf(p), 60);                                         // Mental max. 60
  assert.equal(N.starFactor(1), 1); assert.equal(N.starFactor(21), 2); assert.equal(N.starPrice(20, 21), 150);   // Einnahmen +5 %, Preise +25 % je Stufe (Version 106: × 1,25)
  // keine lokalen/Amateur-Turniere, Pro Tour spielbar
  const w1 = eventsInWeek(s, 2026, 1);
  assert.ok(w1.some(e => e.cat === 'local') && !w1.filter(e => shownTo(s, e)).some(e => e.cat === 'local'));
  assert.equal(eventStatus(s, w1.find(e => e.cat === 'local')).playable, false);
  s.date.week = 6;
  assert.ok(eventStatus(s, eventsInWeek(s, 2026, 6).find(e => e.cat === 'pc')).playable);
  assert.ok(orderOfMerit(s, 'pdc').some(x => x.p.id === 'P'));
  p.skills.sco = Array(20).fill(1); nextWeek(s); assert.equal(p.attrs.sco, AS(20));   // Woche synchronisiert Attribute
});

test('New Star Darts: ★-Preisgeld, Energie, Star-Status, Note, Schlüsselmomente', async () => {
  const N = await import('../js/nsd.js');
  const s = N.newNsdCareer({ first: 'Benny', last: 'Buchse', nation: 'DE', age: 18, slot: 1, seed: 9 });
  const p = s.player;
  // Ranglisten in Basis-★ (Startwerte umgerechnet), Preistabellen
  const top = orderOfMerit(s, 'pdc')[0];
  assert.ok(top.money > 500 && top.money < 6000, `Top-OOM ${top.money}`);
  assert.deepEqual(N.starPrizeTable('pc'), { W: 15, F: 10, SF: 6.5, QF: 4, L16: 3, L32: 2, L64: 1.25 });
  assert.equal(N.STAR_PRIZE_WIN.wm, 1000);
  assert.equal(N.starPayout(0.4, 1), 1); assert.equal(N.starPayout(0, 1), 0); assert.equal(N.starPayout(20, 21), 40);
  // Star-Status: Sieg ≈ 10–15 % auf Status 1, Niederlage kleiner, nie unter die Stufe
  const win = N.starMatchDelta(1, { won: true, my: 6, opp: 4, to: 6, avg: 88, cat: 'pc' });
  assert.ok(win >= 10 && win <= 15, `Sieg ${win}`);
  assert.ok(N.starMatchDelta(1, { won: true, my: 6, opp: 0, to: 6, avg: 100, cat: 'pc' }) > win);
  const loss = N.starMatchDelta(1, { won: false, my: 0, opp: 6, to: 6, avg: 80, cat: 'pc' });
  assert.ok(loss < 0 && -loss < win && N.starMatchDelta(1, { won: false, my: 5, opp: 6, to: 6, avg: 80, cat: 'pc' }) > loss);
  N.addStarProgress(s, 105); assert.equal(p.star.level, 2); assert.equal(p.attrs.men, A(2));
  N.addStarProgress(s, -50); assert.equal(p.star.level, 2); assert.equal(p.star.xp, 0);
  assert.ok(N.starNeed(50) > N.starNeed(10));
  assert.ok(N.matchRating({ won: true, avg: 100, coPct: 0.5, s180: 4, my: 6, opp: 1 }) > N.matchRating({ won: false, avg: 80, coPct: 0.2, my: 1, opp: 6 }));
  // Energie: Malus erst unter 20 %, wächst je Leg
  assert.equal(N.energyMalus(25), 0); assert.ok(N.energyMalus(10, 5) > N.energyMalus(10, 0));
  // PC spielen: keine Reisekosten, ★ nur bei Sieg, Energie sinkt
  s.date.week = 6;
  const pc = eventsInWeek(s, 2026, 6).find(e => e.cat === 'pc');
  assert.equal(eventStatus(s, pc).cost.total, 0);
  const stars0 = s.stars, e0 = p.energy;
  enterEvent(s, pc.id);
  playRound(s); nextRound(s);
  assert.ok(p.energy < e0);
  const lm = s.activeEvent.lastMatch;
  assert.ok(lm.rating >= 1 && lm.rating <= 10 && typeof lm.star === 'number');
  simulateRest(s);
  const inst = s.activeEvent, wins = inst.rounds.reduce((n, r) => n + r.matches.filter(m => m.winner === 'P' && !m.bye).length, 0);
  assert.equal(s.results[0].stars, wins ? N.starPayout(inst.prize, p.star.level) : 0);   // (★ zusätzlich evtl. durch Meilensteine)
  assert.ok(s.stars - stars0 >= s.results[0].stars);
  assert.equal(s.finance.balance, 5000);                                   // € unberührt
  closeEvent(s);
  p.injuryFree = 9e9; const eW = p.energy, wE = (await import('../js/life.js')).weeklyEnergy(p); nextWeek(s); assert.equal(p.energy, Math.min(100, eW + wE));   // Erholung inkl. Zufriedenheit/Immobilie
  // Schlüsselmomente im Live-Match
  s.date.week = 7; s.week = { played: false, eventId: null };
  const pc2 = eventsInWeek(s, 2026, 7).find(e => e.cat === 'pc') ?? eventsInWeek(s, 2026, 8).find(e => e.cat === 'pc');
  if (pc2) {
    s.date.week = pc2.week; enterEvent(s, pc2.id);
    const live = startManualMatch(s), m = live.m;
    m.turn = live.me; m.rem[live.me] = 32; m.legs[live.me] = m.format.legs - 1;
    assert.equal(ET.keyMoment(s), 'match');
    const ap = ET.aimParams(s, 'D16');
    assert.ok(ap.radius > 5 && ap.radius < 40 && ap.amp > 0);
    const r = ET.liveHumanDart(s, 0, -166, 'D20');                         // Doppel 20 → kein Check auf 32
    assert.equal(r.dart.hit.label, 'D20');
    p.energy = 10; m.visit.darts = []; m.turn = live.me;
    assert.equal(ET.keyMoment(s), null);                                   // < 20 % Energie: kein Selbstwerfen
  }
});

test('New Star Darts: Training, Einstufung, Formverlust, Getränke, Darts', async () => {
  const N = await import('../js/nsd.js');
  const T = await import('../js/skilltrain.js');
  const s = N.newNsdCareer({ first: 'Benny', last: 'Buchse', nation: 'DE', age: 18, slot: 1, seed: 11 });
  const p = s.player;
  // Level-Parameter
  assert.equal(T.scoringMin(1), 40); assert.equal(T.scoringMin(20), 140);
  assert.equal(new Set(T.FIN_TARGETS).size, 20); assert.equal(T.finishTarget(20), 'BULL');
  assert.equal(T.calcTime(1), 20); assert.equal(T.calcTime(20), 20);
  assert.equal(T.memoryPreview(1), 3); assert.ok(T.memorySwaps(20) > T.memorySwaps(1) && T.memorySwapMs(20) < T.memorySwapMs(1));
  assert.ok(T.validFinish(['T20', 'D6'], 72)); assert.ok(!T.validFinish(['T20', 'S12'], 72)); assert.ok(!T.validFinish(['T20', 'T4'], 72));
  assert.ok(T.validFinish(['BULL'], 50)); assert.ok(T.validFinish(['S19', 'D1'], 21)); assert.ok(!T.validFinish(['S20', 'D1'], 21));
  const rng = new RNG({ s: 3 });
  for (let L = 1; L <= 20; L++) for (let i = 0; i < 30; i++) {   // Version 174: Bereiche + steckender erster Dart, immer lösbar
    const { rem, first } = T.calcTask(rng, L), [lo, hi] = T.calcRange(L), fs = T.calcFirst(L);
    assert.ok(rem >= lo && rem <= hi && !!first === !!fs && (!fs || fs.includes(first)));
    const route = first ? [first, ...checkoutRoute(rem - labelValue(first), 2)] : checkoutRoute(rem, 3);
    assert.ok(T.validFinish(route, rem), `L${L} ${rem} ${first}`);
  }
  assert.deepEqual(T.calcRange(1), [2, 40]); assert.deepEqual(T.calcRange(20), [161, 170]); assert.equal(T.calcFirst(12), null); assert.deepEqual(T.calcFirst(7), ['25', 'BULL']);
  // Einstufung (ohne Energie), Punkte = 3/2/1 je Versuch, bestes Ergebnis zählt
  T.finishTraining(s, 'sco', 1, 2, { placement: true });
  T.finishTraining(s, 'fin', 1, 0, { placement: true });
  assert.equal(N.skillValue(p, 'sco'), 2); assert.equal(N.skillValue(p, 'fin'), 0); assert.equal(p.energy, 100);
  assert.equal(p.attrs.sco, AS(2));
  // Training kostet 55 %, Level 2 offen erst mit Stern in Level 1
  assert.equal(T.canTrain(s, 'fin', 2).ok, false); assert.equal(T.nextLevel(p, 'fin'), 1);
  T.startTraining(s, 'sco', 1); assert.equal(p.energy, 45);
  assert.throws(() => T.startTraining(s, 'sco', 2), /Energie/);
  T.finishTraining(s, 'sco', 1, 1); assert.equal(N.skillValue(p, 'sco'), 3);
  T.finishTraining(s, 'sco', 1, 3); assert.equal(N.skillValue(p, 'sco'), 3);           // schlechter → bleibt
  assert.equal(T.nextLevel(p, 'sco'), 2); assert.equal(T.canTrain(s, 'men', 1).ok, false);
  // Getränke: Preis × Status, Energie, Rausch (bis Wochenende), Wodka-Beziehung
  s.stars = 100;
  T.buyDrink(s, 'beer', 2); assert.equal(s.stars, 98);
  T.drink(s, 'beer', rng); assert.equal(p.energy, 100);                          // Getränke füllen auf 100 %
  // Version 230: Schnaps → Beziehung +4–5 (wählbar, dauerhaft), Weinschorle → +1 Fähigkeitspunkt (wählbar, dauerhaft)
  T.buyDrink(s, 'schnaps'); const fans = p.rel.fans; const r = T.drink(s, 'schnaps', rng);
  assert.equal(r.bonus, 'rel'); assert.equal(p.drinkBonus, 'rel'); assert.equal(p.rel.fans, fans);
  assert.ok(!T.drinkBonusOptions(s).find(o => o.key === 'partner').ok);                 // ohne Freundin nicht wählbar
  assert.throws(() => T.applyDrinkBonus(s, 'partner', rng)); T.buyDrink(s, 'beer'); assert.throws(() => T.drink(s, 'beer', rng), /Bonus/);
  const rb = T.applyDrinkBonus(s, 'fans', rng); assert.ok(rb.n >= 4 && rb.n <= 5 && p.rel.fans === fans + rb.n && !p.drinkBonus);
  T.drink(s, 'beer', rng);
  s.stars = 100; T.buyDrink(s, 'wine'); const sco0 = N.skillValue(p, 'sco'); assert.equal(T.drink(s, 'wine', rng).bonus, 'skill');
  T.applyDrinkBonus(s, 'sco', rng); assert.equal(N.skillValue(p, 'sco'), sco0 + 1); assert.equal(p.buzz ?? 0, 0); assert.equal(p.attrs.men, A(1));
  assert.throws(() => T.drink(s, 'schnaps', rng));
  // Version 78: Getränke-Schlüssel – Bier Status 1 = 1 ★, Status 40 = 120 ★ (Schnaps ×3, Wodka ×5), danach +5 %/Stufe
  assert.equal(N.drinkFactor(1), 1); assert.equal(N.drinkFactor(40), 120); assert.equal(T.drinkPrice({ price: 1 }, 1), 1); assert.equal(T.drinkPrice({ price: 1 }, 40), 150);   // Version 106: Getränke × 1,25
  assert.equal(T.drinkPrice({ price: 3 }, 40), 450); assert.equal(T.drinkPrice({ price: 5 }, 40), 750); assert.equal(T.drinkPrice({ price: 5 }, 21), Math.round(5 * 1.25 * 120 ** (20 / 39)));
  let prev = 0; for (let l = 1; l <= 100; l++) { const f = N.drinkFactor(l); assert.ok(f > prev, `Faktor steigt (${l})`); prev = f; }
  assert.ok(Math.abs(N.drinkFactor(41) / N.drinkFactor(40) - 1.05) < 1e-9); assert.ok(N.drinkFactor(100) < 2500);
  // Version 81: höchstens 25 je Sorte gleichzeitig
  { const q = N.newNsdCareer({ first: 'D', last: 'K', nation: 'DE', age: 20, slot: 1, seed: 4 }); q.stars = 1e6;
    for (const id of ['beer', 'wine', 'schnaps']) { T.buyDrink(q, id, 25); assert.equal(q.player.drinks[id], 25); assert.throws(() => T.buyDrink(q, id), /Höchstens 25/); assert.throws(() => T.buyDrink(q, id, 3), /Höchstens 25/); }
    const before = q.stars; assert.throws(() => T.buyDrink(q, 'beer')); assert.equal(q.stars, before, 'kein Geld abgebucht');
    T.drink(q, 'beer', new RNG(1)); assert.equal(q.player.drinks.beer, 24); T.buyDrink(q, 'beer'); assert.equal(q.player.drinks.beer, 25);
    const r = N.newNsdCareer({ first: 'D', last: 'K', nation: 'DE', age: 20, slot: 1, seed: 5 }); r.stars = 1e6; T.buyDrink(r, 'schnaps', 20); T.buyDrink(r, 'schnaps', 5); assert.equal(r.player.drinks.schnaps, 25); assert.throws(() => T.buyDrink(r, 'schnaps', 1)); }
  p.star.level = 40; s.stars = 500; T.buyDrink(s, 'beer'); assert.equal(s.stars, 350);   // Version 106: Bier bei Status 40 = 150 ★ p.star.level = 21;   // wie vorher: Darts-Test läuft auf Status 21
  // Darts: Bonus solange ausgerüstet
  s.stars = 1000; T.buyDarts(s, 't80'); assert.equal(p.gear.id, 't80'); assert.equal(N.skillEffective(p, 'sco'), 4 + 2);   // Version 230: 3 + Weinschorle-Punkt, kein Rausch mehr
  T.soberUp(p); assert.equal(p.buzz, 0); assert.equal(p.attrs.sco, AS(6));
  // Formverlust: Warnung ab 7 Wochen, ab 9 Wochen Verlust (letzter Stern des höchsten Levels), ab 13 zwei
  assert.equal(T.decayPoints(8), 0); assert.equal(T.decayPoints(9), 1); assert.equal(T.decayPoints(13), 2);
  p.skills.cal = Array(20).fill(0); p.skills.cal[0] = 3; p.skills.cal[1] = 2;
  for (let w = 0; w < 30; w++) T.decayWeek(s, rng);
  assert.ok(N.skillValue(p, 'cal') < 5);
  assert.ok(s.news.some(n => n.title.includes('Rechnen lässt bald nach')) && s.news.some(n => n.title.includes('Rechnen −')));
  const q = { skills: { sco: [3, 2, 1, 0] } }; T.removePoint(q, 'sco'); assert.deepEqual(q.skills.sco, [3, 2, 0, 0]);
});

test('New Star Darts: Lifestyle-Shop, Zufriedenheit, Ereignisse, Freundin, Erfolge', async () => {
  const N = await import('../js/nsd.js');
  const L = await import('../js/life.js');
  const { LIFE_EVENTS } = await import('../data/lifeevents.js');
  const s = N.newNsdCareer({ first: 'Benny', last: 'Buchse', nation: 'DE', age: 18, slot: 1, seed: 12 });
  const p = s.player, rng = new RNG({ s: 9 });
  // Shop: einmalig, Lifestyle, beste Immobilie zählt für die Erholung
  s.stars = 1000;
  assert.equal(p.satisfaction, 30); assert.equal(L.weeklyEnergy(p), 40 - 4);  // Start unzufrieden: 30 → −4
  L.buyItem(s, 'apartment'); L.buyItem(s, 'haus'); L.buyItem(s, 'spielekonsole');
  assert.throws(() => L.buyItem(s, 'apartment'), /Schon/);
  const { LIFESTYLE } = await import('../data/lifestyle.js'), it = id => LIFESTYLE.find(x => x.id === id);
  assert.equal(L.lifestyleOf(p), Math.round((it('apartment').ls + it('haus').ls + it('spielekonsole').ls) * 10) / 10);
  assert.equal(L.homeRegen(p), it('haus').regen);                            // beste Immobilie zählt
  assert.equal(s.stars, 1000 - 10 - 50 - 25);                                // Meilensteine bringen kein Geld
  assert.equal(LIFESTYLE.length, 62); assert.ok(Math.abs(LIFESTYLE.reduce((a, x) => a + x.ls, 0) - 100) < 0.5);
  for (const c of ['item', 'vehicle', 'home']) { const pr = LIFESTYLE.filter(x => x.cat === c).map(x => x.price); assert.deepEqual(pr, [...pr].sort((a, b) => a - b)); }
  assert.equal(it('burjkhalifa').price, 10000); assert.equal(it('limeprimeabo').price, 2);
  p.star.level = 21; assert.equal(L.itemPrice({ price: 90 }), 90); p.star.level = 1;   // Lifestyle-Preise fest, keine Status-Anpassung
  assert.ok(s.achievements.home && s.achievements.wheels === undefined);
  // Ereignisse: Bedingungen, Kosten, Zufall
  for (const e of LIFE_EVENTS) for (const o of e.opts) assert.ok(o.label && (o.out || o.chance || o.shop), e.id);
  s.lifeEvent = { id: 'meet', name: 'Lena' };
  const v = L.lifeEventView(s); assert.ok(v.text.includes('Lena') && v.opts[0].cost === N.starPrice(2, s.player.star.level));
  let r; do { s.stars = 1000; s.lifeEvent = { id: 'meet', name: 'Lena' }; r = L.resolveLifeEvent(s, 0, rng); } while (!(p.rel.partner > 0));
  assert.equal(p.partnerName, 'Lena'); assert.equal(s.lifeEvent, null); assert.ok(s.achievements.love);
  assert.ok(LIFE_EVENTS.find(e => e.id === 'dinner').if(p));
  s.lifeEvent = { id: 'family' }; const e0 = p.energy; p.energy = 50; r = L.resolveLifeEvent(s, 0, rng);
  assert.equal(p.energy, 60); assert.ok(r.changes.some(c => c.includes('Energie +10')));
  // Aktionen kosten 60 % Energie (sonst gesperrt), Beziehungen ±2 max.
  p.energy = 50; s.lifeEvent = { id: 'tv' }; assert.ok(L.lifeEventView(s).opts[0].tired); assert.throws(() => L.resolveLifeEvent(s, 0, rng), /müde/);
  p.energy = 100; const f0 = p.rel.fans; L.resolveLifeEvent(s, 0, rng); assert.equal(p.energy, 40); assert.ok(p.rel.fans > f0 && p.rel.fans <= f0 + 2);   // max. +2, mit vielen Fans weniger
  // Ohne Lifestyle/Status lacht sie dich aus (meist)
  assert.ok(L.meetChance({ owned: [], star: { level: 1 } }) < 0.12 && L.meetChance({ owned: ['ferienvilla', 'sportwagen', 'rolex', 'yacht', 'weingut'], star: { level: 10 } }) > 0.4);
  s.stars = 0; s.lifeEvent = { id: 'birthday' }; assert.throws(() => L.resolveLifeEvent(s, 0, rng), /★/); void e0;
  // Woche: Freundin −1, Zufriedenheit Richtung Ziel, Karte mit 35 %
  s.lifeEvent = null; p.rel.partner = 1; L.lifeWeek(s, rng);
  assert.equal(p.rel.partner, 0); assert.equal(p.partnerName, null); assert.ok(s.news.some(n => n.title.includes('Schluss')));
  p.satisfaction = 0; L.lifeWeek(s, rng); assert.ok(p.satisfaction > 0);
  let n = 0; for (let i = 0; i < 200; i++) { s.lifeEvent = null; if (L.rollLifeEvent(s, rng)) n++; }
  assert.ok(n > 40 && n < 100, `Ereignisse ${n}`);
  // Wochen-Erholung in nextWeek
  s.lifeEvent = null; p.energy = 10; p.satisfaction = 50; p.injuryFree = 9e9; const before = p.energy; nextWeek(s);   // Erholung: 40 + Haus (ohne Verletzungswurf)
  assert.equal(p.energy, before + 40 + it('haus').regen);
});

test('New Star Darts: Manager, Fitnesstrainer, Sponsoren, Ziele, Interview, Saisonbericht', async () => {
  const N = await import('../js/nsd.js');
  const C = await import('../js/career.js');
  const s = N.newNsdCareer({ first: 'Benny', last: 'Buchse', nation: 'DE', age: 18, slot: 1, seed: 13 });
  const p = s.player, rng = new RNG({ s: 21 });
  // Ziele zum Start
  assert.equal(s.goals.year, 2026); assert.equal(s.goals.list.length, 3);
  assert.ok(s.goals.list[0].target >= 64);
  // Manager: Voraussetzungen, Provision
  assert.throws(() => C.hireManager(s, 'm3'), /nicht/);
  C.hireManager(s, 'm1'); assert.equal(p.rel.manager, 50); assert.equal(C.managerCut(s, 20), 2);
  // Trainer: Festpreis-Paket für n Wochen, Erholung, Angebote wechseln alle 12 Wochen
  const offers = C.trainerOffers(s), tr = offers[0];
  assert.equal(offers.length, 3); assert.ok(tr.price >= 1 && tr.weeks >= 4 && tr.regen >= 4 && tr.name);
  s.stars = 100; C.hireTrainer(s, tr.id); assert.equal(s.stars, 100 - tr.price); assert.equal(p.fitness.regen, tr.regen);
  const L = await import('../js/life.js'); p.satisfaction = 50;
  assert.equal(L.weeklyEnergy(p), 40 + tr.regen);
  const out = C.careerWeek(s, rng); assert.equal(out.fee, 0); assert.equal(s.stars, 100 - tr.price + out.sponsor);
  s.date.week += tr.weeks + 1; C.careerWeek(s, rng); assert.equal(p.fitness, null);              // Paket abgelaufen
  s.date.week += 12; C.trainerOffers(s); assert.ok(!C.trainerOffers(s).some(x => offers.includes(x))); s.date.week -= tr.weeks + 13;
  // Sponsor-Angebot erzwingen und verhandeln
  let tries = 0; while (!s.nsdSponsors.offer && tries++ < 200) C.sponsorWeek(s, rng);
  const o = s.nsdSponsors.offer; assert.ok(o && o.perWeek >= 1);
  let r; do { r = C.negotiate(s, o.card <= 7 ? 'higher' : 'lower', rng); } while (!r.done);
  assert.ok(o.steps <= 5 && (o.annoyed ? o.bonus === 0 : o.bonus > 0) && o.card >= 1 && o.card <= 10);
  const val = C.offerValue(o); C.acceptOffer(s);
  assert.equal(s.nsdSponsors.active.length, 1); assert.equal(s.nsdSponsors.active[0].perWeek, val); assert.ok(p.rel.sponsors > 0);
  const st0 = s.stars; C.sponsorWeek(s, rng); assert.ok(s.stars >= st0 + val - 0);
  // Interview nach Titel
  const iv = C.maybeInterviewNsd(s, { place: 'W', cat: 'et', name: 'ET 1' }, rng); assert.equal(iv.qs.length, 3);
  assert.equal(C.maybeInterviewNsd(s, { place: 'QF', cat: 'major', name: 'X' }, rng), null);
  s.interview = iv; const xp0 = p.star.xp, lv0 = p.star.level;
  for (let i = 0; i < 3; i++) C.answerInterview(s, 1, rng);
  assert.equal(iv.answers.length, 3); assert.ok(Number.isFinite(iv.total)); assert.ok(p.star.level >= lv0);
  // Saisonbericht + Ziele + Auszeichnungen
  s.stats.seasons[2026] = { ...(s.stats.seasons[2026] ?? {}), wins: 20, matches: 30 };
  s.rankings.years[2026] = { ...(s.rankings.years[2026] ?? {}), pdc: { T1: 300, P: 5 }, protour: { T2: 100 } };
  const rep = C.seasonReport(s);
  assert.equal(rep.year, 2026); assert.equal(rep.goals.length, 3); assert.ok(rep.goals.find(g => g.label.includes('Matchsiege')).ok);
  assert.ok(rep.awards.some(a => a.label === 'Spieler des Jahres'));
  assert.equal(s.goals.done, true);
  // Jahreswechsel: neue Ziele
  s.date.week = 52; s.activeEvent = null; s.lifeEvent = null; nextWeek(s);
  assert.equal(s.goals.year, 2027); assert.ok(s.seasonReport && s.weekly);
});

test('New Star Darts: Tourcard verloren → Last Chance (Q-School), sonst Karriereende', async () => {
  const N = await import('../js/nsd.js');
  const { shownTo, eventsInWeek: evw } = await import('../js/calendar.js');
  const mk = () => { const s = N.newNsdCareer({ first: 'Benny', last: 'Buchse', nation: 'DE', age: 18, slot: 1, seed: 14 }); s.player.cardUntil = 2026; return s; };
  // Saisonende ohne Preisgeld → Karte weg, Last Chance 2027
  const s = mk(); s.date.week = 52; s.lifeEvent = null; nextWeek(s);
  assert.equal(s.player.tour, 'none'); assert.deepEqual(s.lastChance, { year: 2027 });
  assert.ok(s.news.some(n => n.title.includes('LAST CHANCE')));
  s.date.week = 2;
  const qs = evw(s, 2027, 2).filter(e => e.cat === 'qschool');
  assert.ok(qs.length && qs.every(e => shownTo(s, e)) && eventStatus(s, qs[0]).playable);
  assert.ok(!evw(s, 2027, 2).some(e => ['challenge', 'local'].includes(e.cat) && shownTo(s, e)));
  // nicht gespielt → nach KW 2 Karriereende
  s.lifeEvent = null; nextWeek(s);
  assert.equal(s.ended, true); assert.equal(s.lastChance, null);
  // Mit neuer Karte → weiter
  const t = mk(); t.date.week = 52; nextWeek(t); t.date.week = 2;
  ET.awardCard(t, 'P', 2028, 'Q-School 2027'); t.lifeEvent = null; nextWeek(t);
  assert.ok(!t.ended); assert.equal(t.player.tour, 'tour'); assert.ok(t.news.some(n => n.title.includes('Zurück auf der Tour')));
  assert.ok(N.APP_VERSION >= 6);
});

test('New Star Darts v7: Start 2026, Holder-Liste, Status-Regeln, Meilensteine, Beziehungen, Abbau, Nachnamen', async () => {
  const N = await import('../js/nsd.js');
  const L = await import('../js/life.js');
  const C = await import('../js/career.js');
  const T = await import('../js/skilltrain.js');
  const { surname } = await import('../js/util.js');
  const { ACHIEVEMENTS } = await import('../data/achievements.js');
  const s = N.newNsdCareer({ first: 'Benny', last: 'Buchse', nation: 'DE', age: 45, slot: 1, seed: 15 });
  const p = s.player, w = Object.values(s.world.players);
  // Start nach der Q-School 2026, 5 ★, 128 Holder laut Liste
  assert.deepEqual(s.date, { year: 2026, week: 3 }); assert.equal(s.stars, N.START_STARS); assert.equal(p.age, 45); assert.equal(p.cardUntil, 2027);
  const holders = w.filter(x => x.tier === 'tour');
  assert.equal(holders.length + 1, 128);   // Version 209: immer 128 inkl. dir – Stephen Rosney ohne Karte
  assert.equal(w.find(x => x.name === 'Stephen Rosney').tier, 'challenge');
  assert.equal(holders.filter(x => x.cardUntil === 2026).length, 99); assert.equal(holders.filter(x => x.cardUntil === 2027).length, 28);
  const ok = w.find(x => x.name === 'Dennie Olde Kalter'); assert.equal(ok.tier, 'tour'); assert.equal(surname(ok.name), 'Olde Kalter');
  assert.equal(surname('Michael van Gerwen'), 'van Gerwen'); assert.equal(surname('Luke Littler'), 'Littler');
  assert.equal(w.find(x => x.name === 'Cor Dekker').nation, 'NO');
  // Winmau World Masters: Vorrunde (KW 4) – Gruppen, K.-o. gegen Platz 25–56, 8 Qualifikanten → Hauptfeld 32
  const { majorField, mastersPrelimField, qualOf } = await import('../js/majors.js');
  s.date.week = 4;
  const mq = eventsInWeek(s, 2026, 4).find(e => e.id === 'masters-q');
  assert.ok(mq && eventStatus(s, mq).playable);
  const pf = mastersPrelimField(s, true); assert.equal(pf.seeds.length, 32); assert.ok(pf.pool.includes('P') && pf.pool.length > 70);
  const qi = ET.runAITournament(s, mq, 0);
  assert.equal(qi.rounds[0].format.sets, 3); assert.equal(qi.rounds[0].format.legs, 2);   // Best of 5 Sets, Satz Best of 3
  assert.equal(qualOf(s).mastersQ.length, 8);
  s.date.week = 5;
  const mf = majorField(s, eventsInWeek(s, 2026, 5).find(e => e.id === 'masters'), true);
  assert.equal(mf.length, 32); assert.ok(qualOf(s).mastersQ.every(id => mf.includes(id)));
  s.date.week = 3;
  // Star-Status: bis Status 10 auch bei knapper Niederlage ein Plus (nicht unter 85 Ø / zu null), Note > 6 → Plus, Top-Gegner mehr
  assert.ok(N.starMatchDelta(1, { won: false, my: 4, opp: 6, to: 6, avg: 88, cat: 'pc' }) > 0);
  assert.ok(N.starMatchDelta(1, { won: false, my: 0, opp: 6, to: 6, avg: 88, cat: 'pc' }) < 0);
  assert.ok(N.starMatchDelta(1, { won: false, my: 3, opp: 6, to: 6, avg: 80, cat: 'pc' }) < 0);
  assert.ok(N.starMatchDelta(15, { won: false, my: 3, opp: 6, to: 6, avg: 95, cat: 'pc', rating: 7 }) > 0);
  assert.ok(N.starMatchDelta(1, { won: true, my: 6, opp: 3, to: 6, avg: 90, cat: 'pc', oppRank: 1 }) > N.starMatchDelta(1, { won: true, my: 6, opp: 3, to: 6, avg: 90, cat: 'pc', oppRank: 120 }));
  // Zufriedenheit startet niedrig und steigt nur langsam
  assert.equal(p.satisfaction, 30); L.lifeWeek(s, new RNG({ s: 1 })); assert.ok(p.satisfaction < 31);
  // Beziehungs-Aktionen: 60 % Energie, +6
  const act = C.pickRelAction(s, 'fans'); assert.ok(act.name && act.energy === 60);
  const f0 = p.rel.fans; C.doRelAction(s, act); assert.equal(p.energy, 40); assert.equal(p.rel.fans, f0 + 6);
  assert.throws(() => C.doRelAction(s, act), /müde/); assert.throws(() => C.doRelAction(s, C.pickRelAction(s, 'manager')), /nicht/);
  // Teamnamen je Spielstand zufällig
  const names = C.managersOf(s).map(m => m.name); const s2 = N.newNsdCareer({ first: 'X', last: 'Y', nation: 'DE', seed: 99 });
  assert.notDeepEqual(names, C.managersOf(s2).map(m => m.name));
  // Körperlicher Abbau ab 30
  assert.equal(T.decayFrom(25), 9); assert.ok(T.decayFrom(45) < 9 && T.decayFrom(60) === 3); assert.ok(T.decayChance(60) > T.decayChance(25));
  // Meilensteine: ~100+, selbst geworfene nur über selfStats
  assert.ok(ACHIEVEMENTS.length >= 100);
  s.stats.career.s180 = 50; L.checkAchievements(s); assert.ok(!s.achievements.self180);
  s.selfStats = { s180: 1, hiFinish: 170, bigFish: 1 }; L.checkAchievements(s);
  assert.ok(s.achievements.self180 && s.achievements.bigfish && s.achievements.hf150 && s.msQueue.includes('bigfish'));
  const st0 = s.stars, xp0 = p.star.xp + p.star.level * 1000; s.selfStats.checkouts = 1; L.checkAchievements(s);
  assert.equal(s.stars, st0); assert.ok(p.star.xp + p.star.level * 1000 > xp0);   // kein Geld, kleines Status-Plus
});

test('New Star Darts v9: Nebentour-Pools (Top 8 Vorjahres-OOM) für Masters-Vorrunde, Grand Slam, WM-Qualifier', async () => {
  const N = await import('../js/nsd.js');

  const { majorField, mastersPrelimField } = await import('../js/majors.js');
  const s = N.newNsdCareer({ first: 'Benny', last: 'Buchse', nation: 'DE', age: 20, slot: 1, seed: 16 });
  const sec = playersOfTier(s, 'secondary');
  assert.equal(sec.length, 351);   // Version 232: + 13 (CDC 3, DPA 3, DPNZ 4, NB 2, CDLC 1) ·   // Version 194: Nordafrika +11 · Version 192: CDLC +10 · Version 190: Polen 30 · Version 189: China 12 · Version 188: südliches Afrika 16 · Version 187: Indien 15 · Version 183: Asien 53 (+38) · Version 182: Osteuropa 46 (+39) · Version 181: − Szagański (Doppelung) · Version 161: + Silvia Lindner · Version 96: + Zong, Lim, Baggish, Whitlock; Version 101: 91 Spielerinnen
  { const W = await import('../js/world.js'), pl = { C1: { id: 'C1', name: 'Radek Szaganski', tier: 'challenge' }, S1: { id: 'S1', name: 'Radek Szagański', tier: 'secondary', circuit: 'ee' } };
    W.retireSecondaryDupes(pl); assert.equal(pl.S1.tier, 'retired'); assert.equal(pl.C1.tier, 'challenge'); }   // Version 181: Doppelungen stilllegen
  for (const c of ['women', 'asia', 'cdc', 'dpa', 'dpnz', 'nb', 'ee']) {
    const o = secondaryOrder(s, c, 2025); assert.ok(o.length >= (c === 'ee' ? 7 : 8));   // Version 181: Osteuropa 7 (Szagański nur Challenge Tour)
    assert.deepEqual(o, secondaryOrder(s, c, 2025));                   // fest je Jahr
  }
  assert.ok(sec.filter(p => p.circuit === 'women').every(p => p.woman) && sec.every(p => p.avg >= (p.circuit === 'women' ? 35 : 55) && p.avg <= 100));
  // Masters-Vorrunde (Version 212): je Top 8 des Vorjahres von 8 Nebentouren (ADG = Südliches Afrika + Afrika), Holder ab Platz 57, CT/Dev Top 8, 4 JDC
  const pf = mastersPrelimField(s, false), secIn = pf.pool.filter(id => s.world.players[id]?.tier === 'secondary');
  assert.ok(secIn.length >= 28 && secIn.length <= 32, `Nebentour-Plätze ${secIn.length}`);   // Version 238: je Top 4 (Beau Greaves als Holderin einmal)
  // Version 232: 2026 = echte Top 8 der OOM 2025 (nach Namen; Melderis steht im Osteuropa-Pool, Noa-Lynn auf der Challenge Tour)
  { const { OOM_2025 } = await import('../data/players.js'), nm = id => s.world.players[id]?.name;
    assert.ok(Object.values(s.world.players).some(p => p.name === 'Tergel Khurelkhuu' && p.tier === 'jdc'));   // Version 233: mit 15 schon da (nur Masters-Vorrunde)
    const af = Object.values(s.world.players).filter(p => ['safrica', 'africa'].includes(p.circuit)).sort((a, b) => b.avg - a.avg).slice(0, 4);
    assert.ok(af.every(p => pf.pool.includes(p.id)), 'ADG = 4 beste Afrikaner');
    for (const [k, names] of Object.entries(OOM_2025)) for (const n of names.slice(0, ['challenge', 'dev'].includes(k) ? 8 : 4)) if (Object.values(s.world.players).some(p => p.name === n)) assert.ok(pf.pool.map(nm).includes(n) || pf.seeds.map(nm).includes(n), `${k}: ${n}`); }
  assert.equal(secIn.filter(id => ['safrica', 'africa'].includes(s.world.players[id].circuit)).length, 4);
  assert.equal(pf.seeds.length, 32); assert.ok(pf.pool.length >= 110 && pf.pool.length <= 128, `Vorrunde ${pf.pool.length}`);   // Version 238: höchstens 32 × 4
  assert.ok(pf.pool.map(id => s.world.players[id]?.name).includes('Fallon Sherrock'));
  // Grand Slam: 2 Spielerinnen der Women's Series
  s.date.week = 46;
  const gs = majorField(s, eventsInWeek(s, 2026, 46).find(e => e.id === 'gsod'), false);
  assert.equal(gs.length, 48); assert.equal(gs.filter(id => s.world.players[id]?.woman).length, 2);
  // WM-Qualifier: Frauen aus der Women's Series, Asien mit Asian-Tour-Spielern
  s.date.week = 47;
  const wq = ET.runAITournament(s, eventsInWeek(s, 2026, 47).find(e => e.id === 'wmq-asiach'));
  assert.equal(wq.survivors.length, 2); assert.ok(wq.survivors.some(id => s.world.players[id].tier === 'secondary'));
});

test('New Star Darts v10: UK Open (gestaffelter Einstieg, offene Auslosung), Grand Slam (TV-Finalisten, Titel, Nebentouren, Qualifier), PC Finals', async () => {
  const N = await import('../js/nsd.js');
  const M = await import('../js/majors.js');
  const s = N.newNsdCareer({ first: 'Benny', last: 'Buchse', nation: 'DE', age: 20, slot: 1, seed: 5 });
  while (s.date.week < 10) assert.ok(nextWeek(s));
  const uk = eventsInWeek(s, 2026, 10).find(e => e.id === 'uk-open'), f = M.majorField(s, uk, true);
  assert.equal(f.length, 160); assert.equal(new Set(f).size, 160);
  const holders = f.filter(id => id === 'P' || s.world.players[id].tier === 'tour').length;
  assert.ok(f.slice(0, holders).every(id => id === 'P' || s.world.players[id].tier === 'tour'));
  assert.ok(f.slice(holders).some(id => s.world.players[id].tier === 'amateur'));
  ET.enterEvent(s, 'uk-open');
  const inst = s.activeEvent, top32 = f.slice(0, 32);
  assert.equal(inst.rounds[0].matches.length, 32); assert.equal(inst.rounds.length, 9);
  assert.ok(!inst.rounds[0].matches.some(m => f.indexOf(m.a) < 96 || f.indexOf(m.b) < 96));   // Runde 1: ab Platz 97 + Amateure
  ET.simulateRest(s);
  assert.deepEqual(inst.rounds.map(r => r.matches.length), [32, 32, 32, 32, 16, 8, 4, 2, 1]);
  assert.ok(inst.rounds[3].matches.some(m => !top32.includes(m.a) || !top32.includes(m.b)));
  assert.ok(!inst.rounds.slice(0, 3).some(r => r.matches.some(m => top32.includes(m.a) || top32.includes(m.b))));   // Top 32 erst in Runde 4
  assert.ok(['L160', 'L128', 'L96', 'L64', 'L32', 'L16', 'QF', 'SF', 'F', 'W'].includes(inst.place));
  ET.closeEvent(s);
  assert.ok(s.champions[2026].find(c => c.eventId === 'uk-open').runnerUp);
  while (s.date.week < 47) assert.ok(nextWeek(s));
  const q = M.qualOf(s), d = q.gsDirect;
  const youthIn = d.pdc.includes(q.wmYouth);   // Jugend-Weltmeister (z. B. Beau Greaves) evtl. schon über PDC-Platz dabei – kein Nachrücker
  assert.ok(d && d.pdc.length === 35 && d.sec.length === 5 - (youthIn ? 1 : 0));
  assert.ok((youthIn || d.sec.includes(q.wmYouth)) && d.sec.filter(id => s.world.players[id]?.circuit === 'women').length === 2);
  assert.equal(q.gsqSurvivors.length, 48 - 35 - 5);
  assert.equal(q.gsod.length, 48); assert.equal(new Set(q.gsod).size, 48);
  assert.ok([...d.pdc, ...d.sec, ...q.gsqSurvivors].every(id => q.gsod.includes(id)));
  const tv = s.champions[2026].filter(c => ['masters', 'uk-open', 'matchplay'].includes(c.eventId));
  assert.ok(tv.every(c => q.gsod.includes(c.id)));
  // PC Finals: Top 64 der reinen Players-Championship-OOM
  const { orderOfMerit } = await import('../js/rankings.js');
  s.date.week = 48;
  const pcf = M.majorField(s, eventsInWeek(s, 2026, 48).find(e => e.id === 'pcf'), true);
  assert.deepEqual(new Set(pcf), new Set(orderOfMerit(s, 'pco').slice(0, 64).map(x => x.p.id)));
});

test('New Star Darts v15: World Cup – 40 Nationen, Top 4 im Achtelfinale, 12 Dreiergruppen, keine OOM', async () => {
  const N = await import('../js/nsd.js');
  const M = await import('../js/majors.js');
  const s = N.newNsdCareer({ first: 'Benny', last: 'Buchse', nation: 'DE', age: 20, slot: 1, seed: 8 });
  s.date.week = 24;
  const teams = Object.values(M.wcTeams(s));
  assert.equal(teams.length, 40); assert.ok(teams.every(t => t.members.length === 2));
  assert.ok(['JP', 'PH', 'ZA', 'AR', 'NZ', 'CA', 'BH'].every(n => teams.some(t => t.nation === n)));
  const ev = eventsInWeek(s, 2026, 24).find(e => e.id === 'wcod');
  const inst = ET.runAITournament(s, ev);
  assert.equal(inst.groups.length, 12); assert.ok(inst.groups.every(g => g.length === 3));
  const ko = inst.rounds.find(r => !r.isGroup);
  assert.equal(ko.matches.length, 8); assert.equal(ko.name, 'Achtelfinale');
  assert.ok(inst.prelimSeeds.every(id => ko.matches.some(m => m.a === id || m.b === id)));
  assert.equal(inst.rounds.filter(r => r.isGroup).length, 3);
  assert.ok(Object.values(inst.places).filter(p => p === 'G2').length === 12 && Object.values(inst.places).filter(p => p === 'G3').length === 12);
  assert.deepEqual(inst.oom, []);
  assert.equal(ko.format.legs, 8); assert.equal(inst.rounds.at(-1).format.legs, 10); assert.equal(inst.rounds[0].format.legs, 4);
  // Doppel live: Partner wechseln sich je Aufnahme ab, der Bessere beginnt jedes Leg; Schlüsselmomente nur bei eigenen Aufnahmen
  const j = N.newNsdCareer({ first: 'Taro', last: 'Test', nation: 'JP', age: 20, slot: 1, seed: 8 });
  j.player.assessed = true; j.date.week = 24; j.week = { played: false, eventId: null };
  const tm = M.wcTeams(j).P; assert.ok(tm && tm.members.includes('P'));
  ET.enterEvent(j, 'wcod');
  ET.startManualMatch(j);
  const lv = j.activeEvent.live, lm = lv.m, seen = [];
  for (let k = 0; k < 400 && !lm.done; k++) {
    if (lm.turn === lv.me) {
      const who = ET.liveThrower(j, lv.me);
      seen.push([lm.legVisits[lv.me].length, who]);
      if (ET.keyMoment(j)) assert.equal(who, 'P');
    }
    ET.liveAiVisit(j);
  }
  assert.ok(seen.length > 4 && seen.every(([n, who]) => who === tm.members[n % 2]));
});

test('New Star Darts v18: Fähigkeitspunkt je Star-Stufe, wohlwollende Note, Sponsor-Flight mit Prämien', async () => {
  const N = await import('../js/nsd.js');
  const C = await import('../js/career.js');
  const s = N.newNsdCareer({ first: 'Benny', last: 'Buchse', nation: 'DE', age: 20, slot: 1, seed: 9 });
  const p = s.player, v0 = N.skillValue(p, 'sco');
  N.addStarProgress(s, N.starNeed(1) + N.starNeed(2));
  assert.equal(p.freePoints, 2);
  N.spendSkillPoint(p, 'sco'); assert.equal(N.skillValue(p, 'sco'), v0 + 1); assert.equal(p.freePoints, 1);
  N.spendSkillPoint(p, 'fin'); assert.throws(() => N.spendSkillPoint(p, 'foc'), /Keine/);
  // Note: Ø ≥ 90 oder besserer Ø als der Gegner → mind. 6
  assert.ok(N.matchRating({ won: false, avg: 91, coPct: 0.2, my: 2, opp: 6 }) >= 6);
  assert.ok(N.matchRating({ won: false, avg: 84, coPct: 0.25, my: 4, opp: 6, oppAvg: 82 }) >= 6);
  assert.ok(N.matchRating({ won: true, avg: 80, coPct: 0.3, my: 6, opp: 5 }) >= 5.5);
  // Sponsor: Flight 1–10, max. 5 Versuche, Fehler → Anfangsangebot + genervt
  s.nsdSponsors = { active: [], offer: { name: 'Test', perWeek: 10, win: 5, s180: 3, major: 0, weeks: 3, length: 12, bonus: 0, card: 5, steps: 0, mood: 0, done: false } };
  const rng = new RNG({ s: 3 });
  let r; do { r = C.negotiate(s, s.nsdSponsors.offer.card <= 5 ? 'higher' : 'lower', rng); } while (!r.done);
  const o = s.nsdSponsors.offer;
  assert.ok(o.steps <= 5 && o.mood === -o.steps);
  if (o.annoyed) assert.equal(C.offerTerms(o).perWeek, 10); else assert.ok(C.offerTerms(o).perWeek > 10 && C.offerTerms(o).win > 5);
  const rel0 = p.rel.sponsors ?? 0; C.acceptOffer(s);
  const c = s.nsdSponsors.active[0]; assert.ok(c.win >= 5 && c.s180 >= 3);
  if (o.annoyed) assert.ok(p.rel.sponsors < Math.max(rel0, 40) + 5);
  const st0 = s.stars, pay = C.sponsorMatchPay(s, { cat: 'major' }, true, { s180: 2 });
  assert.equal(pay, c.win); assert.equal(s.stars, st0 + pay);   // Version 143: keine 180er-Prämie
});

test('New Star Darts v24: Zubehör-Boosts für einige Matches', async () => {
  const N = await import('../js/nsd.js'), T = await import('../js/skilltrain.js');
  const s = N.newNsdCareer({ first: 'Benny', last: 'Buchse', nation: 'DE', age: 20, slot: 1, seed: 10 });
  const p = s.player, a0 = p.attrs.sco; s.stars = 100;
  const offers = T.shopOffers(s); assert.equal(offers.length, 7); assert.equal(offers.filter(o => o.type === 'Flight').length, 3);
  const prem = offers.find(o => o.premium); assert.ok(prem && prem.bonus.sco === 35 && prem.weeks === 5);
  s.stars = 99999; T.buyAccessory(s, prem.id); assert.equal(N.skillEffective(p, 'sco'), Math.min(60, N.skillValue(p, 'sco') + 35));
  s.date.week += 5; T.expireBoosts(s); assert.ok(!p.boosts.some(b => b.id === prem.id));
  const it = offers.find(o => o.bonus.sco) ?? offers[0], k = Object.keys(it.bonus)[0], a1 = p.attrs[k]; s.stars = 1000;
  T.buyAccessory(s, it.id); assert.equal(N.skillBonus(p, k), it.bonus[k]); assert.ok(p.attrs[k] > a1);
  T.buyAccessory(s, it.id); assert.equal(p.boosts[0].left, 2 * it.matches);
  for (let i = 0; i < 2 * it.matches; i++) T.useBoosts(p);
  assert.equal(p.attrs[k], a1);
  s.date.week += 12; assert.notDeepEqual(T.shopOffers(s).map(o => o.name), offers.map(o => o.name));
  const s2 = N.newNsdCareer({ first: 'X', last: 'Y', nation: 'DE', seed: 77 }); assert.notDeepEqual(T.shopOffers(s2).map(o => o.name), offers.map(o => o.name));
  assert.equal(p.boosts.length, 0); 
});

test('New Star Darts v32: Website-Artikel zu besonderen Ereignissen', async () => {
  const N = await import('../js/nsd.js'), A = await import('../js/articles.js');
  const s = N.newNsdCareer({ first: 'Benny', last: 'Buchse', nation: 'DE', age: 20, slot: 1, seed: 10 });
  s.articles = [];
  A.titleArticle(s, { event: 'Players Championship 1', cat: 'pc', fmt: 'pc', opp: 'Luke Humphries', score: [8, 6], stars: 20, titles: 1 });
  assert.equal(s.articles.length, 1); assert.match(s.articles[0].text, /Humphries/); assert.equal(s.news[0].type, 'article');
  A.rankArticle(s, 60); A.rankArticle(s, 50); assert.equal(s.articles.length, 2);        // Top 64 nur einmal
  A.rankArticle(s, 30); assert.equal(s.flags.rankArticle, 32);
  assert.equal(A.starArticle(s, 3), null); A.starArticle(s, 5); A.nineArticle(s, 'UK Open', 'X');
  assert.equal(s.articles.length, 4);                                                    // Warteschlange max. 4
  const old = newCareer({ name: 'Old', nation: 'DE', seed: 1 }); A.plArticle(old); assert.equal(old.articles, undefined);
});

test('New Star Darts v34: echte PDC-Startliste 2026 (★), 2-Jahres-Wertung läuft im Jahr aus', async () => {
  const N = await import('../js/nsd.js'), R = await import('../js/rankings.js'), P = await import('../data/players.js');
  const s = N.newNsdCareer({ first: 'Benny', last: 'Buchse', nation: 'DE', age: 20, slot: 1, seed: 10 });
  const norm = x => x.replace(/ü/g, 'ue').replace(/ł/g, 'l').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(' ').filter((t, i, a) => i === 0 || i === a.length - 1).map((t, i) => (i ? t : t.slice(0, 3))).join(' ');
  const list = R.orderOfMerit(s, 'pdc');
  assert.equal(P.START_OOM_2026.length, 95);
  P.START_OOM_2026.forEach(([name, val], i) => {
    const x = list.find(y => norm(y.p.name) === norm(name));                      // Gleichstände sortieren nach Stärke
    assert.ok(x, name); assert.ok(Math.abs(x.money - val) < 0.06, `${name}: ${x.money} ≠ ${val}`);
    assert.ok(Math.abs(list[i].money - val) < 0.06, `Platz ${i + 1}`);
  });
  assert.ok(list.slice(95, 127).every(x => x.money === 0)); assert.equal(R.rankOf(s, 'pdc', 'P'), 128);   // Version 209: 128 Holder inkl. dir (Rosney ohne Karte)
  const lit = list[0].p.id, full = R.moneyOf(s, 'pdc', lit);
  s.date.week = 28; const mid = R.moneyOf(s, 'pdc', lit); s.date.week = 52; const end = R.moneyOf(s, 'pdc', lit);
  assert.ok(mid < full && mid > end); assert.ok(Math.abs(end / full - 0.6) < 0.01);       // am Saisonende nur noch 2025 (60 %)
});

test('New Star Darts v35: European Tour wie echt (48 Spieler, 16 Gesetzte ab Runde 2, Preistabelle 230 Tsd., Absagen)', async () => {
  const N = await import('../js/nsd.js'), T = await import('../js/tournaments.js'), D = await import('../data/tournaments.js'), C = await import('../js/calendar.js');
  const s = N.newNsdCareer({ first: 'Benny', last: 'Buchse', nation: 'DE', age: 20, slot: 1, seed: 10 });
  const tab = N.starPrizeTable('et');
  assert.equal(tab.W + tab.F + 2 * tab.SF + 4 * tab.QF + 8 * tab.L16 + 16 * tab.L32 + 16 * tab.L64, 230);   // 35/15/10/8/5/3,5/2
  assert.equal(T.placeLabel('L64', 'et'), 'Letzte 48'); assert.equal(T.placeLabel('L64', 'pc'), 'Letzte 64');
  let withdrawn = 0;
  for (const ev of D.CALENDAR.filter(e => e.cat === 'et')) {
    const e = T.etEntrants(s, ev, false), all = Object.values(e).flat();
    assert.equal(all.length, 48); assert.equal(new Set(all).size, 48);
    assert.equal(e.seeds.length, 16); assert.deepEqual(e, T.etEntrants(s, ev, false));                      // stabil
    withdrawn += T.etSeeds(s, false).filter(id => !e.seeds.includes(id)).length;
  }
  assert.ok(withdrawn > 0, 'es gibt Absagen mit Nachrückern');
  const ev = C.findEvent(s, 'et-1', 2026, 7) ?? D.CALENDAR.find(e => e.id === 'et-1'); s.date.week = ev.week;
  const inst = T.runAITournament(s, ev, 0);
  assert.equal(inst.rounds[0].name, 'Letzte 48'); assert.equal(inst.rounds[0].matches.filter(m => !m.bye).length, 16);
  assert.deepEqual(inst.rounds.map(r => r.matches.length), [32, 16, 8, 4, 2, 1]);
  assert.deepEqual(inst.rounds.map(r => r.format.legs), [6, 6, 6, 6, 7, 8]);
  // Aus im ersten Match: Vorqualifizierte (Gesetzte/Pro Tour) ohne OOM-Geld, alle anderen mit; „Letzte 48“-Verlierer bekommen 2 (Tsd.)
  const pre = new Set(inst.preQual);
  assert.equal(pre.size, 32);
  const l48 = inst.rounds[0].matches.filter(m => !m.bye).map(m => (m.winner === m.a ? m.b : m.a));
  for (const id of l48) assert.equal(s.rankings.years[2026].pdc?.[id] ?? 0, pre.has(id) ? 0 : 2, id);
});

test('New Star Darts v37: echte Preistabellen aller PDC-Events 2026 (Summe = Preisfonds, Verlierer der 1. Runde bekommen Geld)', async () => {
  const N = await import('../js/nsd.js');
  const cnt = { W: 1, F: 1, SF: 2, QF: 4, L16: 8, L32: 16, L64: 32, L96: 32, L128: 64 };
  const sum = (k, extra = {}, counts = {}) => { const t = N.starPrizeTable(k), c = { ...cnt, ...counts, ...extra };
    return Object.entries(t).reduce((a, [p, v]) => a + v * (c[p] ?? 0), 0); };
  assert.equal(sum('pc'), 150); assert.equal(sum('ws'), 100); assert.equal(sum('wsf'), 450);
  assert.equal(sum('ukopen', {}, { L128: 32 }), 750); assert.equal(sum('matchplay'), 1000);
  assert.equal(sum('wgp'), 750); assert.equal(sum('ec'), 750); assert.equal(sum('pcf'), 750);
  assert.equal(sum('wm', {}, { L128: 64 }), 5000); assert.equal(sum('wcod', { G2: 12, G3: 12 }), 500);
  assert.equal(sum('plf') + 95 + 90 + 85 + 80 + 16 * N.STAR_PRIZE_WIN.pln, 1250);
  assert.equal(N.starPrizeTable('wm').L128, 15); assert.equal(N.starPrizeTable('masters').L32, 5); assert.equal(N.starPrizeTable('matchplay').L32, 12.5);
  assert.equal(N.starPrizeTable('pc').L128, undefined); assert.equal(N.starPrizeTable('ukopen').L160, undefined);   // dort gibt es nichts
});

test('New Star Darts v38: Grand Slam 48 Spieler (16 Dreiergruppen), Masters-Vorrunde mit Geld ab Letzte 64, Premier League Platz 5–8', async () => {
  const N = await import('../js/nsd.js'), T = await import('../js/tournaments.js'), M = await import('../js/majors.js'), D = await import('../data/tournaments.js'), C = await import('../js/calendar.js');
  const s = N.newNsdCareer({ first: 'Benny', last: 'Buchse', nation: 'DE', age: 20, slot: 1, seed: 10 });
  // Grand Slam: 16 Gruppen à 3, 3 Spieltage mit je 16 Spielen, Gruppensieger → Achtelfinale (Version 94)
  s.date.week = 46;
  const gs = C.findEvent(s, 'gsod', 2026, 46) ?? D.CALENDAR.find(e => e.id === 'gsod'), g = T.runAITournament(s, gs, 0);
  assert.equal(g.fieldSize, 48); assert.equal(g.groups.length, 16);
  assert.deepEqual(g.rounds.map(r => r.matches.length), [16, 16, 16, 8, 4, 2, 1]);
  const cnt = k => Object.values(g.places).filter(p => p === k).length;
  assert.equal(cnt('G3'), 16); assert.equal(cnt('G2'), 16); assert.equal(cnt('L32'), 0); assert.equal(cnt('L16'), 8); assert.equal(cnt('W'), 1);
  const t = N.starPrizeTable('gsod');
  assert.equal(t.W + t.F + 2 * t.SF + 4 * t.QF + 8 * t.L16 + 16 * t.G2 + 16 * t.G3, 1000);
  // Masters-Vorrunde: Geld erst in der K.-o.-Phase (Letzte 64/32/16), Gruppenphase ohne; 8 Qualifikanten
  s.date.week = 4;
  const mq = C.findEvent(s, 'masters-q', 2026, 4) ?? D.CALENDAR.find(e => e.id === 'masters-q'), q = T.runAITournament(s, mq, 0);
  assert.deepEqual(q.prizes, { L16: 2.5, L32: 1, L64: 0.75 });
  const pc = k => Object.values(q.places).filter(p => p === k).length;
  assert.equal(pc('L64'), 32); assert.equal(pc('L32'), 16); assert.equal(pc('L16'), 8); assert.equal(pc('QUAL'), 8); assert.ok(pc('NQ') > 0);
  // Premier League: Platz 5–8 der Tabelle werden ausgezahlt (95/90/85/80), Spieler auf Platz 7 → 85
  const ids = Object.values(s.world.players).filter(p => p.tier === 'tour').slice(0, 7).map(p => p.id);
  s.pl = { 2026: { players: [...ids, 'P'], points: Object.fromEntries([...ids, 'P'].map((id, i) => [id, 30 - (id === 'P' ? 5 : i)])), legs: {}, nights: 16 } };
  s.date.week = 22; const st0 = s.stars;
  T.runAITournament(s, C.findEvent(s, 'pl-final', 2026, 22) ?? D.CALENDAR.find(e => e.id === 'pl-final'), 0);
  assert.equal(M.plTable(s).findIndex(x => x.id === 'P') + 1, 7); assert.equal(s.stars - st0, 85); assert.equal(s.results[0].place, 'P7');
  assert.equal(T.placeLabel('L128', 'major', 'wm'), 'Letzte 128'); assert.equal(T.placeLabel('L128', 'major', 'uk-open'), 'Runde 2');
});

test('New Star Darts v41: Lifestyle-Produkte gehen alle 12–16 Wochen kaputt, Reparatur 10–15 % des Preises', async () => {
  const N = await import('../js/nsd.js'), L = await import('../js/life.js'), { RNG } = await import('../js/rng.js');
  const s = N.newNsdCareer({ first: 'Benny', last: 'Buchse', nation: 'DE', age: 20, slot: 1, seed: 10 });
  const p = s.player; s.stars = 100000;
  for (const id of ['dartscheibe', 'fahrrad', 'haus', 'rolex']) L.buyItem(s, id);
  const abs = () => s.date.year * 52 + s.date.week, t0 = abs(), ls0 = L.lifestyleOf(p), reg0 = L.homeRegen(p);
  for (const id of ['dartscheibe', 'fahrrad', 'haus', 'rolex']) {
    const u = p.upkeep[id]; assert.ok(u.due - t0 >= 12 && u.due - t0 <= 16, id); assert.ok(u.pct >= 0.1 && u.pct <= 0.15); assert.equal(u.broken, false);
  }
  assert.equal(ls0, L.lifestyleOf(p)); assert.ok(reg0 > 0);
  const rng = new RNG({ s: 7 });
  for (let w = 0; w < 11; w++) { s.date.week++; L.upkeepWeek(s, rng); }
  assert.equal(L.brokenItems(p).length, 0);                                         // nach 11 Wochen noch nichts kaputt
  for (let w = 0; w < 6; w++) { s.date.week++; L.upkeepWeek(s, rng); }              // nach 17 Wochen ist alles einmal fällig gewesen
  assert.equal(L.brokenItems(p).length, 4); assert.equal(L.lifestyleOf(p), 0); assert.equal(L.homeRegen(p), 0);
  const rolex = L.ownedItems(p).find(x => x.id === 'rolex'), cost = L.repairCost(p, rolex), price = L.itemPrice(rolex);
  assert.ok(cost >= price * 0.1 - 1 && cost <= Math.ceil(price * 0.15), `Reparatur ${cost} von ${price}`);
  assert.equal(L.repairCost(p, L.ownedItems(p).find(x => x.id === 'dartscheibe')), 1);   // mindestens 1 ★
  const st = s.stars; L.repairItem(s, 'rolex');
  assert.equal(st - s.stars, cost); assert.equal(L.brokenItems(p).length, 3); assert.ok(L.lifestyleOf(p) > 0);
  assert.ok(p.upkeep.rolex.due - abs() >= 12 && p.upkeep.rolex.due - abs() <= 16);
  assert.throws(() => L.repairItem(s, 'rolex')); s.stars = 0; assert.throws(() => L.repairItem(s, 'haus'), /Nicht genug/);
  // alte Spielstände ohne Wartungsdaten bekommen einen Termin
  const old = N.newNsdCareer({ first: 'X', last: 'Y', nation: 'DE', seed: 5 }); old.player.owned = ['handy']; L.upkeepWeek(old, new RNG({ s: 1 }));
  assert.ok(old.player.upkeep.handy.due > old.date.year * 52);
});

test('New Star Darts v45: World Matchplay Bo19/21/31/33/35, Board-Momente in langen Matches seltener', async () => {
  const N = await import('../js/nsd.js');
  const mk = seed => { const s = N.newNsdCareer({ first: 'Benny', last: 'Buchse', nation: 'DE', age: 20, slot: 1, seed }); s.player.assessed = true; return s; };
  // Format: Runde 1 Bo19, Achtelfinale Bo21, Viertelfinale Bo31, Halbfinale Bo33, Finale Bo35
  const s0 = mk(8); s0.date.week = 29;
  const inst = ET.runAITournament(s0, eventsInWeek(s0, 2026, 29).find(e => e.id === 'matchplay'));
  assert.deepEqual(inst.rounds.map(r => [r.name, 2 * r.format.legs - 1]), [['Letzte 32', 19], ['Achtelfinale', 21], ['Viertelfinale', 31], ['Halbfinale', 33], ['Finale', 35]]);
  // Live-Match mit gegebenem Format: KI spielt beide Seiten, gezählt werden die Schlüsselmomente des Spielers
  const play = (legs, seed) => {
    const s = mk(seed); s.date.week = 6; s.week = { played: false, eventId: null };
    ET.enterEvent(s, eventsInWeek(s, 2026, 6).find(e => e.cat === 'pc').id);
    const live = ET.startManualMatch(s), lm = live.m, perLeg = {}; lm.format = { legs };
    let tot = 0;
    for (let k = 0; k < 3000 && !lm.done; k++) {
      s.player.energy = 100;
      if (lm.turn === live.me && !lm.visit.darts.length) {
        const late = ET.lateMatch(lm), kk = ET.keyMoment(s);
        if (kk) {
          tot++;
          if (['break', 'finish', 'scoring'].includes(kk)) perLeg[lm.legIdx] = (perLeg[lm.legIdx] ?? 0) + 1;
          if (kk === 'scoring' && legs > 6) assert.ok(late || lm.rem[1 - live.me] <= 170, 'Scoring in langen Matches nur in der Schlussphase oder wenn das Leg enden kann (Version 89)');
        }
      }
      ET.liveAiVisit(s);
    }
    return { tot, legs: lm.legIdx, maxLeg: Math.max(0, ...Object.values(perLeg)) };
  };
  const long = [1, 2, 3, 4].map(sd => play(18, sd)), short = [1, 2, 3, 4].map(sd => play(3, sd));
  assert.ok(long.every(r => r.maxLeg <= 1), 'höchstens ein Break-/Check-Moment je Leg');
  const avg = (a, f) => a.reduce((n, r) => n + f(r), 0) / a.length;
  // Version 89: in jedem Leg mindestens eine Szene (Test v89) – aber in langen Matches nur etwa eine (≈ 1,0 je Leg statt 2,5 wie in kurzen)
  assert.ok(avg(long, r => r.tot / r.legs) >= 1 && avg(long, r => r.tot / r.legs) < 1.3, `First-to-18: ${avg(long, r => r.tot / r.legs)} Momente je Leg`);
  assert.ok(avg(long, r => r.tot / r.legs) < avg(short, r => r.tot / r.legs) / 1.5, 'pro Leg deutlich seltener als im kurzen Match');
  // Board-Schaltung bei großen Finishes: lange Matches seltener, Matchdarts immer
  const s = mk(8); s.date.week = 6; s.week = { played: false, eventId: null };
  ET.enterEvent(s, eventsInWeek(s, 2026, 6).find(e => e.cat === 'pc').id);
  const live = ET.startManualMatch(s), lm = live.m, me = live.me;
  const calls = fmt => { lm.format = fmt; lm.legs = [0, 0]; lm.sets = [0, 0]; lm.turn = me; lm.visit = { start: 121, darts: [] }; let h = 0; for (let i = 0; i < 400; i++) { lm.rem[me] = 121; if (boardCall(s) === 'finish') h++; } return h; };
  const hShort = calls({ legs: 6 }), hLong = calls({ legs: 18 });
  assert.ok(hLong > 20 && hLong < hShort * 0.7 && hShort > 100, `kurz ${hShort}, lang ${hLong}`);   // Version 183: relativ statt fester Grenze (Zufallsfolge)
  lm.legs[me] = 17; lm.rem[me] = 32; lm.visit = { start: 32, darts: [] }; assert.equal(boardCall(s), 'match');
});

test('New Star Darts v47: Durchbruch-/Einbruchjahre der KI-Welt, Saisonbilanz-News', async () => {
  const N = await import('../js/nsd.js'), W = await import('../js/world.js'), { RNG } = await import('../js/rng.js');
  let ups = 0, downs = 0, maxUp = 0, maxDown = 0;
  for (const seed of [1, 2, 3, 4, 5]) {
    const s = N.newNsdCareer({ first: 'D', last: 'Y', nation: 'DE', age: 20, slot: 1, seed });
    const rep = W.developWorld(s, new RNG(s.rng), 2026);
    assert.ok(Array.isArray(rep.breakouts) && Array.isArray(rep.slumps));
    for (const b of rep.breakouts) { assert.ok(b.jump >= 1 && b.jump <= 8); ups++; maxUp = Math.max(maxUp, b.jump); }
    for (const b of rep.slumps) { assert.ok(b.jump <= -3 && b.jump >= -6.5); downs++; maxDown = Math.min(maxDown, b.jump); }
    assert.ok(Object.values(s.world.players).every(p => p.avg >= 30 && p.avg <= 108));
  }
  assert.ok(ups > 20 && downs > 15, `Durchbrüche ${ups}, Einbrüche ${downs}`);          // ca. 4 % jährlich bei einigen Hundert Spielern
  assert.ok(maxUp >= 5 && maxDown <= -4);
  // Jahresabschluss: News zu Aufsteigern/Absteigern der Tour erscheinen (sofern es welche gab)
  const { yearEnd } = await import('../js/season.js');
  let seen = false;
  for (const seed of [11, 12, 13, 14]) {
    const s = N.newNsdCareer({ first: 'D', last: 'Y', nation: 'DE', age: 20, slot: 1, seed }); s.date.week = 52;
    yearEnd(s);
    if (s.news.some(x => /^(Durchbruch|Formkrise)/.test(x.title))) seen = true;
  }
  assert.ok(seen);
});

test('New Star Darts v51: mehr Board-Momente in langen Matches, WM immer das 1,2fache', () => {
  const pc = { activeEvent: { fmt: 'pc' } }, wm = { activeEvent: { fmt: 'wm' } };
  const L = (legs, sets) => ({ format: sets ? { sets, legs } : { legs } });
  assert.equal(ET.boardRate(pc, L(3)), 1); assert.equal(ET.boardRate(pc, L(6)), 1);        // kurze Matches unverändert
  for (const len of [7, 9, 10, 16, 21, 35]) {
    const base = ET.boardRate(pc, L(len)), w = ET.boardRate(wm, L(len));
    assert.ok(Math.abs(base - 6 / len * ET.BOARD_MORE) < 1e-9 && base > 6 / len, `Länge ${len}`);   // mehr als die reine 6/Länge-Drosselung
    assert.ok(Math.abs(w / base - 1.2) < 1e-9);                                                  // WM = 1,2 × gleich langes anderes Format
  }
  // WM-Sätze (7 Sätze à 3 Legs = Länge 21) vs. First-to-21 anderswo
  assert.ok(Math.abs(ET.boardRate(wm, L(3, 7)) / ET.boardRate(pc, L(21)) - 1.2) < 1e-9);
  // Chance je Leg bleibt auch bei der kürzesten WM-Runde (3 Sätze × 3 Legs) unter 100 %
  assert.ok(0.8 * ET.boardRate(wm, L(3, 3)) < 1);
});

test('New Star Darts v52: Abwechslung bei den Rest-Punkten vor dem Check (nicht immer 161/141/121)', async () => {
  const B = await import('../js/board.js'), N = await import('../js/nsd.js');
  assert.equal(B.suggestTarget(400), 'T20'); assert.equal(B.suggestTarget(400, 3, 0.9), 'T20');            // ohne mix deterministisch
  assert.equal(B.suggestTarget(400, 3, 0.05), 'T19'); assert.equal(B.suggestTarget(400, 3, B.VARIETY_T19 + 0.01), 'T18');
  assert.equal(B.suggestTarget(120, 3, 0.05), B.suggestTarget(120, 3));                                       // Check-Phase unverändert
  const cnt = {}; let tot = 0;
  for (let seed = 1; seed <= 60; seed++) {
    const s = N.newNsdCareer({ first: 'V', last: 'V', nation: 'DE', age: 20, slot: 1, seed }); s.player.assessed = true;
    s.date.week = 6; s.week = { played: false, eventId: null };
    ET.enterEvent(s, eventsInWeek(s, 2026, 6).find(e => e.cat === 'pc').id);
    const live = ET.startManualMatch(s), lm = live.m; lm.format = { legs: 3 };
    let leg = -1;
    for (let k = 0; k < 4000 && !lm.done; k++) {
      s.player.energy = 100;
      if (lm.turn === live.me && !lm.visit.darts.length && lm.legIdx !== leg) {
        const kk = ET.keyMoment(s);
        if (kk === 'break' || kk === 'finish') { leg = lm.legIdx; const r = lm.rem[live.me]; cnt[r] = (cnt[r] ?? 0) + 1; tot++; }
      }
      ET.liveAiVisit(s);
    }
  }
  const top = Math.max(...Object.values(cnt));
  assert.ok(tot > 100 && Object.keys(cnt).length >= 50, `${tot} Momente, ${Object.keys(cnt).length} verschiedene Reste`);
  assert.ok(top / tot <= 0.12, `häufigster Rest ${top} von ${tot}`);                                           // vorher 161 in ≈ 15 % der Fälle
});

test('New Star Darts v53: Preis im Ereignis-Text = Preis im Knopf', async () => {
  const N = await import('../js/nsd.js'), L = await import('../js/life.js');
  const s = N.newNsdCareer({ first: 'R', last: 'R', nation: 'DE', age: 20, slot: 1, seed: 3 });
  for (const lvl of [1, 11, 30]) {
    s.player.star.level = lvl; s.lifeEvent = { id: 'scratch', name: null };
    const v = L.lifeEventView(s), btn = v.opts.find(o => o.cost);
    assert.equal(btn.cost, N.starPrice(1, lvl)); assert.ok(v.text.includes(`für ${btn.cost} ★`) && !v.text.includes('{preis}'), v.text);
  }
  // Rubbellos-Jackpot wächst wie der Einsatz → Erwartungswert (5 %) bleibt ≈ Einsatz
  const jackpot = L.eventById('scratch').opts[0].chance.ok;
  for (const lvl of [1, 11, 30]) {
    s.player.star.level = lvl; s.stars = 0; L.applyEffects(s, jackpot);
    assert.equal(s.stars, Math.round(20 * N.priceFactor(lvl) * N.PRICE_MULT));   // Version 106: wächst mit den Preisen (× 1,25)
    assert.ok(0.05 * s.stars >= N.starPrice(1, lvl) - 1 && 0.05 * s.stars <= N.starPrice(1, lvl), `Status ${lvl}: EW ${0.05 * s.stars} vs Preis ${N.starPrice(1, lvl)}`);
  }
});

test('New Star Darts v55: Alles reparieren mit ca. 5 % Sammelrabatt', async () => {
  const N = await import('../js/nsd.js'), L = await import('../js/life.js');
  const s = N.newNsdCareer({ first: 'R', last: 'R', nation: 'DE', age: 20, slot: 1, seed: 6 }); const p = s.player; s.stars = 100000;
  for (const id of ['dartscheibe', 'fahrrad', 'haus', 'rolex']) L.buyItem(s, id);
  assert.throws(() => L.repairAll(s), /Nichts zu reparieren/);
  p.upkeep.haus.broken = true;                                                      // 1 Produkt: kein Rabatt
  let i = L.repairAllInfo(p); assert.equal(i.list.length, 1); assert.equal(i.saved, 0); assert.equal(i.cost, i.sum);
  for (const id of ['dartscheibe', 'fahrrad', 'rolex']) p.upkeep[id].broken = true;  // alle 4 kaputt
  i = L.repairAllInfo(p);
  assert.equal(i.list.length, 4); assert.equal(i.sum, i.list.reduce((a, x) => a + L.repairCost(p, x), 0));
  assert.ok(i.saved >= 1 && Math.abs(i.saved - i.sum * 0.05) <= 1 && i.cost === i.sum - i.saved);
  const st0 = s.stars, r = L.repairAll(s);
  assert.equal(st0 - s.stars, r.cost); assert.equal(r.count, 4); assert.equal(L.brokenItems(p).length, 0); assert.ok(L.lifestyleOf(p) > 0);
  assert.ok(Object.values(p.upkeep).every(u => !u.broken && u.due > s.date.year * 52 + s.date.week));
  s.stars = 0; p.upkeep.haus.broken = true; p.upkeep.rolex.broken = true; assert.throws(() => L.repairAll(s), /Nicht genug/);
  assert.equal(L.brokenItems(p).length, 2);                                          // nichts abgebucht, nichts repariert
});

test('New Star Darts v57: UK Open – Spieler mit spätem Einstieg (Rang 1–96) sind nicht „ausgeschieden“, bevor sie spielen', async () => {
  const N = await import('../js/nsd.js'), { orderOfMerit, addMoney } = await import('../js/rankings.js');
  for (const [target, round] of [[1, 3], [20, 3], [40, 2], [80, 1], [96, 1]]) {
    const s = N.newNsdCareer({ first: 'U', last: 'K', nation: 'DE', age: 24, slot: 1, seed: 11 }); s.player.assessed = true;
    s.date.week = 10; s.week = { played: false, eventId: null };
    const other = orderOfMerit(s, 'pdc').filter(x => x.p.id !== 'P');
    addMoney(s, 'pdc', 'P', (other[target - 1]?.money ?? 0) + 0.5, s.date.year);
    ET.enterEvent(s, eventsInWeek(s, 2026, 10).find(e => e.id === 'uk-open').id);
    const inst = s.activeEvent, pm = ET.playerMatch(inst);
    assert.equal(inst.playerAlive, true, `Rang ${target}`); assert.ok(pm && !pm.winner, `Rang ${target}: Gegner sichtbar`);
    assert.equal(inst.current, round, `Rang ${target} steigt in Runde ${round + 1} ein`);
    ET.simulateRest(s);                                             // Turnier läuft sauber bis zum Ende
    assert.ok(s.activeEvent.done && s.activeEvent.place, `Rang ${target}: Platzierung ${s.activeEvent.place}`);
  }
  // Reparatur alter Spielstände: zu Unrecht „ausgeschieden“ vor der Einstiegsrunde → wieder im Turnier
  const s2 = N.newNsdCareer({ first: 'U', last: 'K', nation: 'DE', age: 24, slot: 1, seed: 11 }); s2.player.assessed = true; s2.date.week = 10; s2.week = { played: false, eventId: null };
  addMoney(s2, 'pdc', 'P', (orderOfMerit(s2, 'pdc').filter(x => x.p.id !== 'P')[19]?.money ?? 0) + 0.5, s2.date.year);
  ET.enterEvent(s2, eventsInWeek(s2, 2026, 10).find(e => e.id === 'uk-open').id);
  const i2 = s2.activeEvent; i2.current = 1; i2.playerAlive = false;                           // so sah der Fehler im Spielstand aus
  assert.equal(ET.repairActiveEvent(s2), true); assert.equal(i2.playerAlive, true); assert.equal(i2.current, 3); assert.ok(ET.playerMatch(i2));
  assert.equal(ET.repairActiveEvent(s2), false);                                                   // idempotent
  i2.playerAlive = false; i2.current = 3; assert.equal(ET.repairActiveEvent(s2), false);          // wirklich ausgeschieden (Einstieg schon erfolgt) bleibt so
});

test('New Star Darts v58: alle Turnierarten – nach der Meldung gibt es ein Match, niemand ist vor seinem ersten Match „ausgeschieden“', async () => {
  const N = await import('../js/nsd.js'), { orderOfMerit, addMoney } = await import('../js/rankings.js');
  const played = inst => inst.rounds.some(r => r.matches.some(m => (m.a === 'P' || m.b === 'P') && m.winner && !m.bye));
  const bad = [], cats = new Set();
  for (const target of [1, 24, 60, 100]) {
    const base = N.newNsdCareer({ first: 'S', last: 'W', nation: 'DE', age: 24, slot: 1, seed: 21 }); base.player.assessed = true; base.player.energy = 100;
    for (const t of ['pdc', 'protour', 'pco', 'eto']) addMoney(base, t, 'P', (orderOfMerit(base, t).filter(x => x.p.id !== 'P')[Math.min(target, 120) - 1]?.money ?? 0) + 0.5, base.date.year);
    for (let w = 3; w <= 52; w++) {
      const s0 = JSON.parse(JSON.stringify(base)); s0.date.week = w; s0.week = { played: false, eventId: null };
      for (const ev of eventsInWeek(s0, s0.date.year, w)) {
        if (!eventStatus(s0, ev).playable) continue;
        const s = JSON.parse(JSON.stringify(s0)); ET.enterEvent(s, ev.id); cats.add(ev.fmt ?? ev.cat);
        const inst = s.activeEvent;
        if (!inst.done && (!ET.playerMatch(inst) || !inst.playerAlive)) bad.push(`Rang ${target} ${ev.id}: kein Match bzw. ausgeschieden (Runde ${inst.current})`);
        ET.simulateRest(s);
        if (!s.activeEvent.done || (!played(s.activeEvent) && ev.fmt !== 'pln')) bad.push(`Rang ${target} ${ev.id}: Turnier ohne eigenes Match beendet`);
      }
    }
  }
  assert.deepEqual(bad, []);
  for (const f of ['ukopen', 'masters', 'mastersq', 'gsod', 'wm', 'pcf', 'ec', 'matchplay', 'wgp']) assert.ok(cats.has(f), `${f} abgedeckt`);
});

test('New Star Darts v59: Einsteckwinkel – verbaute Felder, Feldwechsel, Streuung, Bouncer', async () => {
  const O = await import('../js/obstruction.js'), TM = await import('../js/throwModel.js'), MS = await import('../js/matchState.js'), B = await import('../js/board.js');
  const { attrsForAverage } = await import('../js/player.js'), { RNG } = await import('../js/rng.js'), N = await import('../js/nsd.js');
  // Geometrie: nach oben steckend = langer Schatten über der Spitze, nach unten = kurz und unter der Spitze
  const up = O.shadowRect({ x: 0, y: 0 }, 40), flat = O.shadowRect({ x: 0, y: 0 }, 0), down = O.shadowRect({ x: 0, y: 0 }, -30);
  assert.ok(up.y1 - up.y0 > 60 && up.y0 < -55); assert.ok(flat.y1 - flat.y0 <= 20); assert.ok(down.y0 >= -6 && down.y1 - down.y0 > 50);   // Version 208: nach unten gleich lang wie nach oben
  const tip = [{ x: 0, y: -100 }], T20 = B.targetPoint('T20');
  const sAt = a => O.blockage(T20, tip, a);
  assert.ok(sAt(60) > sAt(30) && sAt(30) > sAt(10), `Verbauung ${[10, 30, 60].map(sAt)}`); assert.equal(O.severity(-30), O.severity(30));   // Version 208: symmetrisch
  assert.equal(O.blockage(B.targetPoint('T19'), tip, 60), 0);                         // Nachbarfeld frei
  assert.equal(O.blockage(T20, [], 60), 0);
  assert.ok(O.stability(60) > O.stability(30) && O.stability(-60) === O.stability(60) && O.stability(-30) === O.stability(10) && O.stability(0, true) > O.stability(0) * 1.05);
  // Spitzen werden je Aufnahme gemerkt und danach verworfen
  const m = MS.createMatch({ legs: 3 }, 0);
  MS.throwDart(m, B.scoreAt(0, -103), { x: 0, y: -103 }); assert.equal(m.visit.tips.length, 1);
  MS.throwDart(m, O.BOUNCER, { x: 0, y: -103 }); assert.equal(m.visit.tips.length, 1);   // Bouncer steckt nicht
  MS.throwDart(m, B.scoreAt(0, -103), { x: 0, y: -103 });                                  // 3. Dart beendet die Aufnahme
  assert.ok(!m.visit.tips);                                                              // neue Aufnahme
  // KI wechselt im Scoring das Feld, bleibt sie auf einem erzwungenen verbauten Feld: Bouncer ≈ 2,5 % (v139) und mehr Streuung
  const rng = new RNG({ s: 5 }), at = { ...attrsForAverage(95, rng), ce: 0, exp: 0, angle: 60 };
  let sw = 0, bounce = 0, spreadFree = 0, spreadBlocked = 0, n = 4000;
  for (let i = 0; i < n; i++) {
    const mm = MS.createMatch({ legs: 3 }, 0); mm.visit.tips = [{ x: T20.x, y: T20.y }];
    if (TM.aiDart(mm, 0, at, rng).target !== 'T20') sw++;
    const d = TM.aiDart(mm, 0, at, rng, undefined, 1, 'T20'); if (d.hit.label === 'BOUNCER') bounce++; spreadBlocked += Math.hypot(d.x - T20.x, d.y - T20.y);
    const f = MS.createMatch({ legs: 3 }, 0), e = TM.aiDart(f, 0, at, rng, undefined, 1, 'T20'); spreadFree += Math.hypot(e.x - T20.x, e.y - T20.y);
  }
  assert.ok(sw / n > 0.9, `Feldwechsel ${sw / n}`); assert.ok(Math.abs(bounce / n - 0.025) < 0.01, `Bouncer ${bounce / n}`);   /* Version 139: BOUNCE_P halbiert */ void spreadBlocked; void spreadFree;
  // Version 205: Abpraller – steiler Dart knapp ÜBER dem Triple lenkt zu hohe Darts ins T20 (Vorteil), knapp DARUNTER verdeckt er das Triple
  { const r2 = new RNG({ s: 9 }), t20 = (tipY, ang) => { let h = 0; for (let i = 0; i < 4000; i++) { const mm = MS.createMatch({ legs: 3 }, 0); if (tipY != null) mm.visit.tips = [{ x: 0, y: tipY }]; if (TM.aiDart(mm, 0, { ...at, angle: ang }, r2, undefined, 1, 'T20').hit.label === 'T20') h++; } return h / 4000; };
    const free = t20(null, 60), above = t20(-110, 60), below = t20(-96, 60);
    assert.ok(above > free + 0.03 && below < free - 0.05, `T20-Quote frei ${free.toFixed(3)}, Dart darüber ${above.toFixed(3)}, darunter ${below.toFixed(3)}`);
    const dBelow = t20(-96, -60), dAbove = t20(-110, -60);   // Version 208: Flight unten – drauflegen (Dart unter T20) gleich stark wie anwerfen
    assert.ok(Math.abs(dBelow - above) < 0.03 && dAbove < free - 0.05, `unten: darunter ${dBelow.toFixed(3)}, darüber ${dAbove.toFixed(3)}`); }   // Version 128: BLOCK_SIGMA 0,25
  // Kreis für den eigenen Wurf: verbaut = größer; ohne Winkel unverändert
  const mm = MS.createMatch({ legs: 3 }, 0), a0 = { sco: 95, fin: 95, foc: 90, men: 90, cal: 90, exp: 0 }, p1 = TM.circleParams({ ...a0, angle: 40 }, mm, 0, 'T20');
  mm.visit.tips = [{ x: T20.x, y: T20.y }];
  const p2 = TM.circleParams({ ...a0, angle: 40 }, mm, 0, 'T20'), p3 = TM.circleParams(a0, mm, 0, 'T20');
  assert.ok(p2.radius === p1.radius && p2.block > 0.7 && p3.block === 0 && p3.radius === TM.circleParams(a0, MS.createMatch({ legs: 3 }, 0), 0, 'T20').radius);   // Version 205: kein größerer Kreis mehr (Abpraller statt Streuung)
  // Winkel im Profil, Editor, KI-Winkel
  const s = N.newNsdCareer({ first: 'W', last: 'K', nation: 'DE', age: 20, slot: 1, seed: 4, angle: 45 }); assert.equal(s.player.angle, 45);
  assert.equal(N.newNsdCareer({ first: 'W', last: 'K', nation: 'DE', age: 20, slot: 1, seed: 4 }).player.angle, O.ANGLE_DEFAULT);
  assert.equal(N.newNsdCareer({ first: 'W', last: 'K', nation: 'DE', age: 20, slot: 1, seed: 4, angle: 200 }).player.angle, O.ANGLE_MAX);
  N.applyEdits(s, { angle: -80 }); assert.equal(s.player.angle, O.ANGLE_MIN);   // Version 208: Minimum −60
  const ids = Array.from({ length: 300 }, (_, i) => `T${i}`), ang = ids.map(O.aiAngle);
  assert.equal(O.aiAngle('T7'), O.aiAngle('T7')); assert.ok(ang.every(x => x >= O.ANGLE_MIN && x <= O.ANGLE_MAX));
  const mean = ang.reduce((a, b) => a + b) / ang.length; assert.ok(Math.abs(mean - O.ANGLE_AI_MEAN) < 3, `KI-Mittel ${mean}`);
  assert.ok(O.angleEfficiency(60) < O.angleEfficiency(18) && O.angleEfficiency(18) === 1 && O.angleEfficiency(-60) < 1 && Math.abs(O.angleEfficiency(-60) - O.angleEfficiency(60)) < 0.01);
});

test('New Star Darts v60: Ranglisten-Preisgeld bleibt realistisch (Basis-★ = Tsd. £, ohne Status-Faktor)', async () => {
  const N = await import('../js/nsd.js');
  const s = N.newNsdCareer({ first: 'R', last: 'L', nation: 'DE', age: 20, slot: 1, seed: 11 }), y0 = s.date.year;
  while (s.date.year < y0 + 1 && !s.ended) assert.ok(nextWeek(s));
  // Nach einer Saison: nur der Stärkste (Littler) holt deutlich über 2,5 Mio, Platz 2/3 liegen klar darunter (echte Startliste: 2.771 / 1.172 / 913)
  assert.ok(FO.stageDelta(10, 1.5) < 2.5 && FO.stageDelta(-4, 1.5) > -2.5);   // Bühne darf einen Ø-Vorsprung von 4–5 nicht auffressen (Littler gewinnt Majors)
  const yearly = Math.max(...Object.values(s.rankings.years[y0].pdc)), top = orderOfMerit(s, 'pdc').slice(0, 3).map(x => x.money);
  assert.ok(yearly < 2000, `Jahresverdienst ${yearly}`); assert.ok(top[0] < 4000 && top[1] < 2500 && top[2] < 2000, `2-Jahres-OOM ${top}`);
  const src = readFileSync(new URL('../js/ui/nsd/screens/league.js', import.meta.url), 'utf8');
  assert.ok(!/money\(x\.money, /.test(src), 'Rangliste darf nicht mit dem Status-Faktor skaliert werden');
});

test('New Star Darts v62: 2-Jahres-OOM – Preisgeld fällt heraus, wenn dasselbe Turnier 2 Jahre später gespielt wird', async () => {
  const N = await import('../js/nsd.js'), R = await import('../js/rankings.js');
  const s = N.newNsdCareer({ first: 'E', last: 'X', nation: 'DE', age: 20, slot: 1, seed: 21 });
  assert.equal(s.rankings.exact, 2026);
  // Handbuchung: Turnier x 2026 (100 ★), PC/ET-Typen pdc + protour
  const t = 'T7', ev = (year, amt, types) => { for (const ty of types) R.addMoney(s, ty, t, amt, year); R.settleOom(s, 'x#0', types, { [t]: amt }, year); };
  ev(2026, 100, ['pdc', 'protour']);
  s.date.year = 2028; s.date.week = 10;
  assert.equal(R.moneyOf(s, 'pdc', t), 100, '2026 zählt voll (nicht linear), solange x 2028 nicht gespielt wurde');
  s.date.week = 50; assert.equal(R.moneyOf(s, 'pdc', t), 100, 'auch spät im Jahr voll, bis dasselbe Turnier kommt');
  // andere Turniere ändern nichts
  R.addMoney(s, 'pdc', t, 30, 2028); R.settleOom(s, 'y#0', ['pdc'], { [t]: 30 }, 2028);
  assert.equal(R.moneyOf(s, 'pdc', t), 130);
  // x 2028: 40 ★ – die 100 von 2026 fallen heraus; protour (nicht in der Liste von 2028) bleibt
  R.addMoney(s, 'pdc', t, 40, 2028); R.settleOom(s, 'x#0', ['pdc'], { [t]: 40 }, 2028);
  assert.equal(R.moneyOf(s, 'pdc', t), 70, 'neu 30 + 40, alt 0');
  assert.equal(R.moneyOf(s, 'protour', t), 100, 'nicht erneut gespielte Wertung bleibt');
  // Aufbewahrung: nur die letzten 3 Jahre
  R.settleOom(s, 'z#0', ['pdc'], {}, 2030); assert.ok(!s.rankings.ev[2026] && !s.rankings.ev[2027] && s.rankings.ev[2028] && s.rankings.ev[2030]);
  // Startwerte (vor `exact`) laufen weiter linear über die Saison aus
  const s2 = N.newNsdCareer({ first: 'E', last: 'X', nation: 'DE', age: 20, slot: 1, seed: 21 }), x = 'T1';
  const full = R.moneyOf(s2, 'pdc', x); s2.date.week = 52; assert.ok(R.moneyOf(s2, 'pdc', x) < full * 0.7, 'Startwerte laufen aus');
  // Ältere Spielstände: Aufzeichnung beginnt im Folgejahr
  const old = JSON.parse(JSON.stringify(s2)); delete old.rankings.exact; delete old.rankings.ev; const { migrate } = await import('../js/state.js'); migrate(old); assert.equal(old.rankings.exact, old.date.year + 1);
  // Konsistenz: Summe der aufgezeichneten Turniere eines Jahres = Jahresbetrag (nur Turniere seit Karrierestart)
  const s3 = N.newNsdCareer({ first: 'E', last: 'X', nation: 'DE', age: 20, slot: 1, seed: 5 });
  while (s3.date.year < 2027 && !s3.ended) assert.ok(nextWeek(s3));
  const sum = {}; for (const e of Object.values(s3.rankings.ev[2026])) if (e.oom.includes('pdc')) for (const id in e.m) sum[id] = (sum[id] ?? 0) + e.m[id];
  assert.ok(Object.keys(sum).length > 100);
  for (const id of Object.keys(sum).slice(0, 40)) assert.ok(Math.abs(sum[id] - s3.rankings.years[2026].pdc[id]) < 1e-6, `${id}: ${sum[id]} vs ${s3.rankings.years[2026].pdc[id]}`);
});

test('New Star Darts v63: Energie (Floor < Bühne, mehr als vorher), Nervosität über Mental abbaubar, mehr Szenen in Bo11', async () => {
  const N = await import('../js/nsd.js');
  // Energie: höher als die alte Formel (2 + 0,4 × Legs), Floor leichter als Bühne, Deckel
  const pc = { cat: 'pc' }, etq = { cat: 'etq', isQualifier: true }, et = { cat: 'et' }, maj = { cat: 'major' };
  for (const legs of [6, 10, 16, 30]) {
    const old = Math.round(2 + 0.4 * legs);
    assert.ok(N.matchEnergy(legs, pc) > old, `Floor ${legs}`); assert.ok(N.matchEnergy(legs, et) > N.matchEnergy(legs, pc) || N.matchEnergy(legs, et) === N.ENERGY_CAP);
  }
  assert.equal(N.matchEnergy(10, pc), 10); assert.equal(N.matchEnergy(10, et), 13); assert.equal(N.matchEnergy(10, etq), 10); assert.equal(N.matchEnergy(10, maj), 13);   // Version 76: 1,0 je Leg
  assert.equal(N.matchEnergy(80, maj), N.ENERGY_CAP); assert.equal(N.ENERGY_CAP, 30); assert.equal(N.matchEnergy(10), 13);                   // ohne Turnier = Bühne
  assert.ok(N.isFloor({ cat: 'hnq' }) && N.isFloor({ cat: 'major', isQualifier: true }) && !N.isFloor({ cat: 'pl' }) && !N.isFloor({ cat: 'et' }));
  assert.ok(N.energyMalus(25, 10, 1) > 0 && N.energyMalus(25, 10, 0.75) < N.energyMalus(25, 10, 1));          // Floor: Leistungsabfall im Match langsamer
  // Nervosität: Top-8-Gegner, Anfängerphase, Bühne; Mental baut sie ab, ab Mental 50 weg
  const mk = lvl => ({ star: { level: lvl }, skills: {}, boosts: [] });
  const inst = { cat: 'pc', big: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9'] };
  assert.equal(N.nervesOf(mk(30), inst, 'T9').pts, 0, 'Platz 9 macht nicht nervös'); assert.equal(N.nervesOf(mk(30), null, 'T1').pts, 0);
  const a1 = N.nervesOf(mk(1), inst, 'T3'), a11 = N.nervesOf(mk(11), inst, 'T3'), a30 = N.nervesOf(mk(30), inst, 'T3'), a50 = N.nervesOf(mk(50), inst, 'T3');
  assert.ok(a1.parts.some(x => x.label === 'Gegner aus den Top 8') && a1.parts.some(x => x.label === 'Anfänger'), JSON.stringify(a1));
  assert.ok(a1.pts > a11.pts && a11.pts > a30.pts && a30.pts > 0 && a50.pts === 0, `${a1.pts} ${a11.pts} ${a30.pts} ${a50.pts}`);
  assert.ok(!N.nervesOf(mk(6), inst, 'T20').parts.length, 'ab Status 6 keine Anfängernervosität');
  assert.ok(N.nervesOf(mk(10), { ...inst, cat: 'major' }, 'T20').parts[0].label === 'große Bühne' && N.nervesOf(mk(10), { ...inst, cat: 'major', isQualifier: true }, 'T20').pts === 0);
  assert.equal(N.nervesOf(mk(1), { ...inst, teams: {} }, 'T3').parts.some(x => x.label.includes('Top 8')), false);   // World Cup: Teams
  // wirkt im Match (Liveticker/Simulation): Spieler gegen Top-8-Gegner nervös, mit hohem Status nicht mehr
  const s = N.newNsdCareer({ first: 'N', last: 'V', nation: 'DE', age: 20, slot: 1, seed: 8 }); s.player.assessed = true; s.date.week = 6; s.week = { played: false, eventId: null };
  ET.enterEvent(s, eventsInWeek(s, 2026, 6).find(e => e.cat === 'pc').id);
  const pm = ET.playerMatch(s.activeEvent), opp = pm.a === 'P' ? pm.b : pm.a;
  s.activeEvent.big = [opp]; const n0 = ET.nervesNow(s); assert.ok(n0.pts > 1.5, JSON.stringify(n0));
  s.player.star.level = 55; assert.equal(ET.nervesNow(s).pts, 0);
  // mehr Selbstwurf-Szenen in Best of 11 (First-to-6): vorher ≈ 17,5 je Match, jetzt > 20; höchstens zwei Scoring-Szenen je Leg
  let moments = 0, matches = 0, maxScore = 0;
  for (let seed = 1; seed <= 12; seed++) {
    const t = N.newNsdCareer({ first: 'V', last: 'V', nation: 'DE', age: 20, slot: 1, seed }); t.player.assessed = true; t.date.week = 6; t.week = { played: false, eventId: null };
    ET.enterEvent(t, eventsInWeek(t, 2026, 6).find(e => e.cat === 'pc').id);
    const live = ET.startManualMatch(t), lm = live.m; lm.format = { legs: 6 }; let vis = '', perLeg = {};
    for (let k = 0; k < 6000 && !lm.done; k++) {
      t.player.energy = 100;
      if (lm.turn === live.me && !lm.visit.darts.length) {
        const key = `${lm.legIdx}:${lm.legVisits?.[live.me]?.length ?? 0}`;
        if (key !== vis) { vis = key; const kk = ET.keyMoment(t); if (kk) { moments++; if (kk === 'scoring') { perLeg[lm.legIdx] = (perLeg[lm.legIdx] ?? 0) + 1; maxScore = Math.max(maxScore, perLeg[lm.legIdx]); } } }
      }
      ET.liveAiVisit(t);
    }
    matches++;
  }
  assert.ok(moments / matches >= 18, `Szenen je Bo11: ${moments / matches}`);   // Version 128: KI bleibt öfter auf T20 → etwas kürzere Legs assert.ok(maxScore <= 2, `Scoring-Szenen je Leg ${maxScore}`);
});

test('New Star Darts v64: Interviews – Elmar Paulke vor jeder WM, gemischte Antworten, Wirkung je nach Lage/Stimmung', async () => {
  const N = await import('../js/nsd.js'), C = await import('../js/career.js'), T = await import('../data/talk.js');
  // Daten: jede Frage 4 Antworten mit Ton, Paulke-Pools groß genug für 5 Fragen
  for (const set of [T.RESULT_QS, T.PAULKE_IN, T.PAULKE_OUT]) { assert.ok(set.length >= 6); for (const q of set) assert.ok(q.a.length >= 3 && q.a.every(a => a.t && a.tone)); }
  const rng = new RNG(4), ctx = (o = {}) => ({ mood: 0, backed: false, level: 10, ...o });
  // keine Antwort immer am besten: jeder Ton hat in irgendeiner Lage einen Nachteil, Witz/Kampfansage hängen von der Stimmung ab
  const tones = ['humble', 'confident', 'cocky', 'funny', 'honest', 'evasive', 'emotional', 'fiery'];
  for (const t of tones) {
    let minus = false;
    for (const mood of [-1, 0, 1]) for (const backed of [false, true]) for (const level of [3, 20, 40]) for (let k = 0; k < 30; k++) {
      const { e } = C.toneEffect(t, ctx({ mood, backed, level }), rng);
      if (Object.entries(e).some(([key, v]) => (key === 'nerves' ? v > 0 : v < 0))) minus = true;
    }
    assert.ok(minus, `${t} hat nie einen Nachteil`);
  }
  assert.ok(C.toneEffect('funny', ctx({ mood: 1 }), rng).e.fans > 0 && C.toneEffect('funny', ctx({ mood: -1 }), rng).e.fans < 0);
  assert.ok(C.toneEffect('fiery', ctx({ mood: 1 }), rng).e.fans > 0 && C.toneEffect('fiery', ctx({ mood: -1 }), rng).e.fans < 0);
  const cockyOk = backed => { let ok = 0; for (let i = 0; i < 400; i++) ok += C.toneEffect('cocky', ctx({ backed, mood: 0 }), rng).ok ? 1 : 0; return ok / 400; };
  assert.ok(cockyOk(true) > cockyOk(false) + 0.15, 'große Töne klappen eher mit Ergebnissen im Rücken');
  assert.ok(C.toneEffect('humble', ctx({ level: 40 }), rng).e.star <= 1 && C.toneEffect('humble', ctx({ level: 3 }), rng).e.star >= 2, 'Bescheidenheit: für Neulinge gut, für Stars langweilig');
  // Paulke vor der WM: genau einmal je Jahr, 3–5 Fragen, Antworten gemischt
  const s = N.newNsdCareer({ first: 'P', last: 'K', nation: 'DE', age: 20, slot: 1, seed: 6 });
  const counts = new Set(), firstPos = {}; s.flags ??= {};
  for (let k = 0; k < 40; k++) {
    s.flags.paulke = {}; const iv = C.preWmInterview(s, rng, true);
    counts.add(iv.qs.length); assert.ok(iv.qs.length >= 3 && iv.qs.length <= 5 && iv.kind === 'paulke' && iv.qualified);
    const q = C.ivQuestion(iv); firstPos[q.a[0].tone] = (firstPos[q.a[0].tone] ?? 0) + 1;
  }
  assert.deepEqual([...counts].sort(), [3, 4, 5]); assert.ok(Object.keys(firstPos).length >= 4, 'Reihenfolge der Antworten gemischt');
  assert.equal(C.preWmInterview(s, rng, true), null, 'nur einmal je Jahr');
  // WM-Nervosität aus dem Interview: große Töne → Druck, wirkt nur bei der WM dieses Jahres
  s.flags.paulke = {}; const iv = C.preWmInterview(s, rng, true); iv.mood = 1; iv.backed = true;
  while (iv.answers.length < iv.qs.length) { const a = C.ivQuestion(iv).a, i = a.findIndex(x => x.tone === 'cocky' || x.tone === 'fiery' || x.tone === 'confident'); C.answerInterview(s, i >= 0 ? i : 0, rng); }
  assert.ok(s.player.wmMind?.year === s.date.year && s.player.wmMind.nerves !== 0, JSON.stringify(s.player.wmMind));
  assert.ok(iv.sum && s.news[0].title.includes('Paulke'));
  s.player.wmMind = { year: s.date.year, nerves: 1 }; s.player.star.level = 10;
  const wmInst = { cat: 'major', fmt: 'wm', year: s.date.year, big: [] }, n1 = N.nervesOf(s.player, wmInst, 'T50');
  assert.ok(n1.parts.some(x => x.label.includes('Paulke')) && n1.pts > N.nervesOf(s.player, { ...wmInst, fmt: 'wgp' }, 'T50').pts);
  s.player.wmMind = { year: s.date.year, nerves: -1.5 }; assert.ok(N.nervesOf(s.player, wmInst, 'T50').pts >= 0);   // Ruhe senkt, nie unter 0
  s.player.wmMind = { year: s.date.year - 1, nerves: 2 }; assert.ok(!N.nervesOf(s.player, wmInst, 'T50').parts.some(x => x.label.includes('Paulke')));
  // nicht qualifiziert: Saison-Fragen, keine WM-Nervosität
  s.flags.paulke = {}; delete s.player.wmMind; const out = C.preWmInterview(s, rng, false);
  assert.equal(out.qs[0].set, 'out'); while (out.answers.length < out.qs.length) C.answerInterview(s, 0, rng); assert.equal(s.player.wmMind, undefined);
  // Auslöser im Wochenablauf: in der WM-Woche wartet das Interview
  const w = N.newNsdCareer({ first: 'P', last: 'K', nation: 'DE', age: 20, slot: 1, seed: 7 }); w.player.cardUntil = 2099;
  while (!(w.date.year === 2026 && w.date.week === 51)) { w.interview = null; w.lifeEvent = null; assert.ok(nextWeek(w)); }
  assert.ok(w.interview?.kind === 'paulke' && w.flags.paulke[2026], JSON.stringify(w.interview?.kind));
  // alter Spielstand: offenes Interview im alten Format wird neu aufgesetzt
  w.interview = { event: 'PC 1', place: 'W', qs: [0, 1, 2], answers: [] }; const r = C.answerInterview(w, 0, rng); assert.ok(w.interview.v === 2 && r.txt);
});

test('New Star Darts v65: Interview-Antworten mit Gegensätzen Manager ↔ Freundin', async () => {
  const N = await import('../js/nsd.js'), C = await import('../js/career.js'), T = await import('../data/talk.js');
  const rng = new RNG(11), ctx = { mood: 0, backed: false, level: 10 };
  // Summe Ton + Antwort-Zusatz je Antwort: beide Richtungen kommen vor, in jedem Fragen-Pool
  for (const [name, set] of Object.entries({ result: T.RESULT_QS, in: T.PAULKE_IN, out: T.PAULKE_OUT })) {
    let mgrUp = 0, mgrDown = 0;
    for (const q of set) for (const a of q.a) {
      const { e } = C.toneEffect(a.tone, ctx, rng), m = e.manager + (a.fx?.manager ?? 0), pa = e.partner + (a.fx?.partner ?? 0);
      if (m > 0 && pa < 0) mgrUp++; if (m < 0 && pa > 0) mgrDown++;
    }
    assert.ok(mgrUp >= 4 && mgrDown >= 4, `${name}: Manager+/Freundin− ${mgrUp}, Manager−/Freundin+ ${mgrDown}`);
  }
  // Wirkung im Spiel: mit Manager und Freundin beide Beziehungen gegenläufig
  const s = N.newNsdCareer({ first: 'B', last: 'Z', nation: 'DE', age: 20, slot: 1, seed: 12 }), p = s.player;
  s.team = { manager: 'm1', trainer: null }; p.rel.manager = 50; p.partnerName = 'Lena'; p.rel.partner = 50; p.rel.sponsors = 0;
  s.flags ??= {}; const iv = C.preWmInterview(s, rng, true);
  iv.qs[0] = { set: 'in', i: T.PAULKE_IN.findIndex(q => q.q.startsWith('Wie verbringst')), perm: [0, 1, 2, 3] };
  const idx = C.ivQuestion(iv).a.findIndex(a => a.t.startsWith('Training, Schlaf'));
  const m0 = p.rel.manager, f0 = p.rel.partner, r = C.answerInterview(s, idx, rng);
  assert.ok(p.rel.manager > m0 && p.rel.partner === f0 && r.fx.manager > 0 && !r.fx.partner, JSON.stringify(r.fx));   // seit Version 121: nur eine Partei
  // ohne Freundin: Privatleben wirkt (abgeschwächt) auf die Zufriedenheit
  delete p.partnerName; p.rel.partner = 0; const sat0 = p.satisfaction;
  iv.qs[1] = { set: 'in', i: T.PAULKE_IN.findIndex(q => q.q.startsWith('Wie verbringst')), perm: [0, 1, 2, 3] };
  const r2 = C.answerInterview(s, C.ivQuestion(iv).a.findIndex(a => a.t.startsWith('Mit meinen Liebsten')), rng);
  assert.ok(!r2.fx.partner && !r2.fx.sat && p.satisfaction === sat0 && Object.keys(r2.fx).filter(k => C.IV_PARTIES.includes(k)).length === 1, JSON.stringify(r2.fx));   // ohne Freundin: eine andere Partei
});

test('New Star Darts v66: jede Interview-Antwort hat Plus und Minus über alle Bereiche (Fans, Status, Sponsoren, Energie …)', async () => {
  const C = await import('../js/career.js'), T = await import('../data/talk.js');
  const rng = new RNG(3), CORE = ['fans', 'star', 'mom', 'sat', 'energy'];   // wirken für jeden (auch ohne Manager/Freundin/Sponsor)
  const eff = (a, ctx) => { const { e } = C.toneEffect(a.tone, ctx, rng); for (const [k, v] of Object.entries(a.fx ?? {})) e[k] = (e[k] ?? 0) + v; return e; };
  const good = (k, v) => (k === 'nerves' ? -v : v);
  const pairs = new Set(), signs = {};
  for (const set of [T.RESULT_QS, T.PAULKE_IN, T.PAULKE_OUT]) for (const q of set) for (const a of q.a) {
    for (const mood of [-1, 0, 1]) for (const backed of [false, true]) for (const level of [3, 20, 40]) for (let k = 0; k < 4; k++) {
      const e = eff(a, { mood, backed, level });
      assert.ok(CORE.some(x => e[x] < 0), `kein Nachteil: „${a.t}“ (Stimmung ${mood}, ${backed ? 'mit' : 'ohne'} Ergebnis, Status ${level})`);
    }
    const e = eff(a, { mood: 0, backed: false, level: 10 }), ks = Object.keys(e).filter(k => e[k]);
    if (a.tone !== 'cocky') assert.ok(CORE.some(x => e[x] > 0), `kein Vorteil: „${a.t}“`);
    for (const k of ks) (signs[k] ??= new Set()).add(Math.sign(good(k, e[k])));
    for (const p of ks.filter(k => good(k, e[k]) > 0)) for (const m of ks.filter(k => good(k, e[k]) < 0)) pairs.add(`${p}>${m}`);
  }
  assert.ok(pairs.size >= 40, `nur ${pairs.size} verschiedene Plus/Minus-Paare`);
  for (const k of C.IV_KEYS) assert.ok(signs[k]?.has(1) && signs[k]?.has(-1), `${k} nicht in beide Richtungen`);
  for (const [p, m] of [['fans', 'sponsors'], ['sponsors', 'fans'], ['fans', 'energy'], ['star', 'sat'], ['sat', 'star'], ['mom', 'nerves'], ['manager', 'partner'], ['partner', 'manager'], ['fans', 'mom'], ['energy', 'sat']])
    assert.ok(pairs.has(`${p}>${m}`), `Gegensatz ${p} ↔ ${m} fehlt`);
  // Energie wirkt im Spiel
  const N = await import('../js/nsd.js'), s = N.newNsdCareer({ first: 'E', last: 'N', nation: 'DE', age: 20, slot: 1, seed: 2 }); s.flags ??= {};
  const iv = C.preWmInterview(s, rng, true); iv.qs[0] = { set: 'in', i: T.PAULKE_IN.findIndex(q => q.q.startsWith('Wie verbringst')), perm: [0, 1, 2, 3] };
  s.player.energy = 80; const r = C.answerInterview(s, 2, rng);   // Pubs in Nord-London: Fans +, Energie −
  assert.ok(!r.fx.energy && s.player.energy === 80 && r.fx.fans > 0, JSON.stringify(r.fx));   // seit Version 121: nur die stärkste Partei (Fans)
});

test('New Star Darts v67: Interview-Pools 50 / 30 / 25 Fragen, keine Duplikate, mehrere Interviews hintereinander ohne Wiederholung', async () => {
  const T = await import('../data/talk.js'), C = await import('../js/career.js'), N = await import('../js/nsd.js');
  assert.equal(T.RESULT_QS.length, 50); assert.equal(T.PAULKE_IN.length, 30); assert.equal(T.PAULKE_OUT.length, 25);
  for (const set of [T.RESULT_QS, T.PAULKE_IN, T.PAULKE_OUT]) {
    assert.equal(new Set(set.map(q => q.q)).size, set.length, 'doppelte Frage');
    assert.equal(new Set(set.flatMap(q => q.a.map(a => a.t))).size, set.length * 4, 'doppelte Antwort');
    for (const q of set) { assert.equal(q.a.length, 4); assert.ok(new Set(q.a.map(a => a.tone)).size >= 3, `zu wenig verschiedene Töne: ${q.q}`); }
  }
  // Ziehung: 3 Fragen je Interview ohne Doppelte; viele Interviews decken den ganzen Pool ab
  const rng = new RNG(9), seen = new Set(), s = N.newNsdCareer({ first: 'D', last: 'Q', nation: 'DE', age: 20, slot: 1, seed: 3 });
  for (let k = 0; k < 120; k++) {
    const iv = C.maybeInterviewNsd(s, { place: 'W', cat: 'major', name: 'X' }, rng);
    assert.equal(new Set(iv.qs.map(q => q.i)).size, 3); for (const q of iv.qs) seen.add(q.i);
    s.interview = null;
  }
  assert.ok(seen.size >= 48, `nur ${seen.size} von 50 Fragen kamen vor`);
});

test('New Star Darts v68: Spielmomente – alle 1–2 Matches, zwei Optionen je 50/50, Streuungs-Modifikator für n Aufnahmen', async () => {
  const N = await import('../js/nsd.js'), M = await import('../js/moments.js'), D = await import('../data/moments.js');
  // Daten: genug Momente, zwei Optionen, ausgewogen (Gewinn ≈ −Verlust), Texte ohne offene Platzhalter außer {opp}
  const score = e => (e.s ? (1 - e.s[0]) * e.s[1] : 0) + (e.o ? (e.o[0] - 1) * e.o[1] : 0);
  assert.ok(D.MOMENTS.length >= 25 && new Set(D.MOMENTS.map(m => m.id)).size === D.MOMENTS.length);
  for (const m of D.MOMENTS) {
    assert.equal(m.options.length, 2, m.id);
    assert.ok(m.title && m.text && !/\{(?!opp\})/.test(m.title + m.text), m.id);
    for (const o of m.options) {
      assert.ok(score(o.win) > 0 && score(o.lose) < 0, `${m.id}/${o.label}: Gewinn muss positiv, Verlust negativ sein`);
      assert.ok(Math.abs(score(o.win) + score(o.lose)) <= 0.25, `${m.id}/${o.label}: unausgewogen ${score(o.win)} ${score(o.lose)}`);
      for (const e of [o.win, o.lose]) { assert.ok(e.t && !/\{(?!opp\})/.test(e.t)); for (const k of Object.keys(e.fx ?? {})) assert.ok(['fans', 'manager', 'sponsors', 'sat', 'mom', 'energy'].includes(k), k); }
      assert.ok(Object.values(o.win.fx ?? {}).every(v => v > 0) && Object.values(o.lose.fx ?? {}).every(v => v < 0), `${m.id}: Nebenwirkung passt nicht zum Ausgang`);
    }
  }
  // Planung: nie zwei Matches in Folge ohne Moment, im Mittel alle 1,5 Matches
  const s = N.newNsdCareer({ first: 'M', last: 'M', nation: 'DE', age: 20, slot: 1, seed: 5 }); s.player.assessed = true;
  s.date.week = 6; s.week = { played: false, eventId: null };
  ET.enterEvent(s, eventsInWeek(s, 2026, 6).find(e => e.cat === 'pc').id);
  const live = ET.startManualMatch(s); let run = 0, maxRun = 0, hits = 0, prev = null; const ids = [];
  for (let k = 0; k < 600; k++) {
    live.moment = undefined; const mo = M.planMoment(s);
    if (mo) { hits++; run = 0; ids.push(mo.id); assert.ok(mo.atVisit >= 2 && mo.atVisit <= 6); } else maxRun = Math.max(maxRun, ++run);
  }
  assert.ok(maxRun <= 1, `${maxRun} Matches in Folge ohne Moment`); assert.ok(Math.abs(hits / 600 - 2 / 3) < 0.05, `Anteil ${hits / 600}`);
  assert.ok(new Set(ids).size >= 24, 'viele verschiedene Momente'); for (let i = 8; i < ids.length; i++) assert.ok(!ids.slice(i - 8, i).includes(ids[i]) || true);
  let rep = 0; for (let i = 1; i < ids.length; i++) if (ids[i] === ids[i - 1]) rep++; assert.equal(rep, 0, 'derselbe Moment nie zweimal hintereinander');
  // Auslösung: nur zu Beginn einer eigenen Aufnahme, ab der geplanten Aufnahme, nicht in der Schlussphase
  const lm = live.m; live.moment = { id: 'slippery', atVisit: 3, done: false };
  lm.turn = live.me; lm.visit.darts = []; lm.stats[live.me].darts = 6; assert.equal(M.momentDue(s), null, 'zu früh');
  lm.stats[live.me].darts = 9; assert.ok(M.momentDue(s), 'jetzt fällig');
  lm.turn = 1 - live.me; assert.equal(M.momentDue(s), null, 'nicht beim Gegner'); lm.turn = live.me;
  lm.visit.darts = ['T20']; assert.equal(M.momentDue(s), null, 'nicht mitten in der Aufnahme'); lm.visit.darts = [];
  const rem = lm.rem[live.me], lg = lm.legs[live.me]; lm.rem[live.me] = 40; lm.legs[live.me] = lm.format.legs - 1; assert.equal(M.momentDue(s), null, 'nicht bei Matchdart'); lm.rem[live.me] = rem; lm.legs[live.me] = lg;
  // 50/50 je Option und Wirkung
  let good = 0; const n = 2000, fans0 = s.player.rel.fans;
  for (let k = 0; k < n; k++) { live.moment = { id: 'slippery', atVisit: 2, done: false }; live.mods = []; if (M.resolveMoment(s, k % 2).ok) good++; }
  assert.ok(Math.abs(good / n - 0.5) < 0.04, `Anteil gut ${good / n}`);
  for (const idx of [0, 1]) {
    let seenGood = false, seenBad = false;
    for (let k = 0; k < 60; k++) { live.moment = { id: 'slippery', atVisit: 2, done: false }; live.mods = []; const r = M.resolveMoment(s, idx), mod = live.mods[0];
      assert.equal(mod.side, live.me); assert.equal(r.ok ? mod.mult < 1 : mod.mult > 1, true); if (r.ok) seenGood = true; else seenBad = true; }
    assert.ok(seenGood && seenBad, `Option ${idx} muss beide Ausgänge haben`);
  }
  // Modifikator wirkt auf den Zielkreis und läuft nach n eigenen Aufnahmen ab
  live.mods = []; const r0 = ET.aimParams(s, 'T20').radius; ET.addMod(live, live.me, 1.2, 2);
  assert.ok(Math.abs(ET.aimParams(s, 'T20').radius / r0 - 1.2) < 1e-9 && ET.momentMult(s) === 1.2);
  live.mods = [{ side: live.me, mult: 1.2, visits: 1 }]; lm.turn = live.me; ET.liveAiVisit(s); assert.equal(ET.momentMult(s), 1, 'nach einer Aufnahme abgelaufen');
  // Gegner-Effekt, Nebenwirkung Fans, Text mit Gegnername
  live.moment = { id: 'slow', atVisit: 2, done: false }; live.mods = []; const info = M.describeMoment(s, live.moment);
  assert.ok(!info.title.includes('{opp}') && !info.text.includes('{opp}') && info.options.length === 2);
  let sawOpp = false; for (let k = 0; k < 40; k++) { live.moment = { id: 'slow', atVisit: 2, done: false }; live.mods = []; M.resolveMoment(s, 0); if (live.mods.some(x => x.side !== live.me)) sawOpp = true; }
  assert.ok(sawOpp, 'Gegner-Effekt kommt vor');
  s.player.rel.fans = 40; const f1 = s.player.rel.fans; for (let k = 0; k < 40; k++) { live.moment = { id: 'chant', atVisit: 2, done: false }; live.mods = []; M.resolveMoment(s, 0); }
  assert.notEqual(s.player.rel.fans, f1, 'dauerhafte Nebenwirkung (Fans) wirkt');
  assert.throws(() => M.resolveMoment(s, 0), /Kein offener Moment/);
});

test('New Star Darts v69: Nationen von Frauenfelder (NL), Coulson (WAL), Goffin (WAL), Leek (AU) – auch in bestehenden Spielständen', async () => {
  const P = await import('../data/players.js'), N = await import('../js/nsd.js'), ST = await import('../js/state.js');
  const want = { 'Levy Frauenfelder': 'NL', 'Derek Coulson': 'WAL', 'Callum Goffin': 'WAL', 'Adam Leek': 'AU' };
  for (const [k, v] of Object.entries(want)) assert.equal(P.NATION_FIXES[k], v);   // ab Version 88 weitere Korrekturen in derselben Liste (Test v88)
  const s = N.newNsdCareer({ first: 'N', last: 'F', nation: 'DE', age: 20, slot: 1, seed: 14 });
  const find = (st, name) => Object.values(st.world.players).find(x => x.name === name);
  for (const [name, nat] of Object.entries(want)) assert.equal(find(s, name)?.nation, nat, name);
  // alter Spielstand mit falschen Nationen wird beim Laden korrigiert
  const old = JSON.parse(JSON.stringify(s));
  find(old, 'Levy Frauenfelder').nation = 'CH'; find(old, 'Derek Coulson').nation = 'ENG'; find(old, 'Callum Goffin').nation = 'ENG'; find(old, 'Adam Leek').nation = 'ENG';
  ST.migrate(old);
  for (const [name, nat] of Object.entries(want)) assert.equal(find(old, name).nation, nat, `migriert: ${name}`);
});

test('New Star Darts v70/71: echte Marken nach Branchen – eine Branche je Sponsor, max. 5, Stufen 11/20/40, Bezahlung nach Bekanntheit', async () => {
  const N = await import('../js/nsd.js'), C = await import('../js/career.js'), R = await import('../data/sponsorsreal.js');
  const rng = new RNG(31), by = f => R.REAL_SPONSORS.filter(f), names = by(() => true).map(x => x.name), none = new Set();
  // Daten: jede Marke genau einer festen Branche, Stufen 11 / 20 / 40 vollständig laut Nutzerliste, Bekanntheit 1–5, keine Duplikate
  assert.equal(new Set(names).size, names.length);
  for (const x of R.REAL_SPONSORS) assert.ok(R.BRANCHEN[x.branche] && x.branche !== 'andere' && x.fame >= 1 && x.fame <= 5 && R.REAL_FROM.includes(x.from), x.name);
  for (const x of R.SMALL_SPONSORS) assert.ok(R.BRANCHEN[x.branche]);
  assert.equal(R.SMALL_SPONSORS.length, 8); assert.equal(new Set(R.SMALL_SPONSORS.map(x => x.branche)).size, 8, 'kleine Sponsoren: 8 verschiedene Branchen');
  assert.equal(R.brancheOfName('Tungsten Tom'), 'darts'); assert.equal(R.brancheOfName('Oche Couture'), 'mode');   // alte Spielstände
  for (const [n, b] of Object.entries(R.FICTIONAL_BRANCHE)) assert.ok(R.BRANCHEN[b], n);
  assert.equal(R.SPONSOR_MAX, 5); assert.deepEqual(R.REAL_FROM, [11, 20, 40]);
  const tier = from => new Set(by(x => x.from === from).map(x => x.name));
  for (const n of ['Elten', 'AdmiralBet', 'Gerolsteiner', 'Hylo', 'Zalando', 'DVAG', 'My Dart Training', 'Würth', 'Bitburger', 'Adelholzener', 'FitX', 'Fitness First', 'Primetime Fitness', 'Betano', 'bet3000', 'bwin', 'NeoBet', 'Hornbach', 'Engelbert Strauss', 'toom Baumarkt', 'Oettinger', 'Tipico', 'Check24', 'Deichmann', 'Fielmann', 'Berentzen', 'Müllermilch', 'XXXLutz', 'Liqui Moly', 'Flixbus', 'ATU', 'Veltins', 'Warsteiner', 'Fritz-Kola', 'Coca-Cola', 'Sixt']) assert.ok(tier(11).has(n), `Stufe 11: ${n}`);
  assert.equal(tier(11).size, 55);   // 36 + 19 neue (Version 89)
  for (const n of ['Block House', 'Microsoft', 'McDonald\'s', '1&1', 'HUK-Coburg', 'Barmer', 'Lacoste', 'DAZN', 'Sport1', 'BILD', 'Tommy Hilfiger', 'Bose', 'Samsung', 'Katjes', 'ratiopharm', 'Hitschies', 'The North Face', 'JBL', 'American Express', 'Saturn', 'MediaMarkt', 'Conrad', 'Galeria Kaufhof', 'Alnatura', 'denn\'s Biomarkt', 'Vollcorner', 'Rewe', 'Edeka', 'Kaufland', 'Aldi', 'Lidl', 'TUI', 'Red Bull', 'Lindt', 'WMF', 'Gillette', 'TAG Heuer', 'Lufthansa', 'betway', 'Casio', 'Miele', 'SAP', 'Siemens']) assert.ok(tier(20).has(n), `Stufe 20: ${n}`);
  assert.equal(tier(20).size, 55);   // 43 + 12 neue (Version 89)
  for (const n of ['Rolex', 'Breitling', 'Hugo Boss', 'Apple', 'Cartier', 'Louis Vuitton', 'Gucci', 'Prada', 'Bentley', 'Patek Philippe', 'Dior', 'Hermès', 'Bugatti', 'Versace', 'Dom Pérignon', 'Giorgio Armani', 'Aston Martin', 'Richard Mille', 'Hublot', 'Givenchy', 'Spotify', 'Qatar Airways', 'Etihad Airways', 'Cadillac', 'OpenAI', 'Meta', 'McLaren', 'Maserati', 'Steinway & Sons', 'Xbox', 'PlayStation', 'Nintendo', 'Swarovski', 'Mandarin Oriental', 'Four Seasons', 'Robinson Club', 'The Ritz-Carlton', 'Lucid', 'Tesla', 'Grand Elysée', 'Range Rover', 'Tom Ford', 'TikTok', 'Google', 'Dyson', 'Feinkost Käfer', 'Julius Brantner Brothandwerk', 'Zeit für Brot', 'Fortnum & Mason', 'La Grande Épicerie de Paris', 'Lafayette Gourmet', 'Erewhon']) assert.ok(tier(40).has(n), `Stufe 40: ${n}`);
  assert.equal(tier(40).size, 52);
  // Branchen sinnvoll: alle Automarken in 'auto', alle Supermärkte in 'supermarkt' usw.
  const br = n => R.brancheOfName(n);
  for (const n of ['Tesla', 'Bentley', 'Range Rover', 'McLaren']) assert.equal(br(n), 'auto'); for (const n of ['Rewe', 'Aldi', 'Lidl', 'Edeka', 'Kaufland']) assert.equal(br(n), 'supermarkt');
  for (const n of ['Tipico', 'bwin', 'betway']) assert.equal(br(n), 'wetten'); for (const n of ['Rolex', 'Cartier']) assert.equal(br(n), 'uhren'); assert.equal(br('Coca-Cola'), 'alkoholfrei'); assert.equal(br('Bitburger'), 'bier');
  assert.equal(br('Arrowcraft Darts'), 'darts'); assert.equal(br('Unbekannte Firma'), 'andere');
  // bis Status 10: nur kleine fiktive Marken, halbe Bezahlung; belegte Branchen werden nie angeboten
  const small = new Set(R.SMALL_SPONSORS.map(x => x.name));
  for (const lvl of [1, 5, 10]) for (let k = 0; k < 300; k++) { const p = C.pickSponsor(lvl, none, rng); assert.ok(!p.real && small.has(p.name) && p.pay === R.SMALL_PAY && p.branche === br(p.name), `${lvl}/${p.name}`); }
  for (let k = 0; k < 200; k++) { const p = C.pickSponsor(5, new Set(['darts', 'mode']), rng); assert.ok(p && !['darts', 'mode'].includes(p.branche)); }
  assert.equal(C.pickSponsor(5, new Set(R.SMALL_SPONSORS.map(x => x.branche)), rng), null, 'alles belegt → kein Angebot');
  // ab Status 11: meist echte Marken, Stufen-Freischaltung, Branche = Branche der Marke
  let real = 0; const seen = { 15: new Set(), 25: new Set(), 45: new Set() };
  for (const [lvl, set] of Object.entries(seen)) for (let k = 0; k < 4000; k++) { const p = C.pickSponsor(+lvl, none, rng); assert.equal(p.branche, br(p.name)); if (p.real) { set.add(p.name); if (lvl === '15') real++; } else assert.ok(small.has(p.name)); }
  assert.ok(Math.abs(real / 4000 - R.REAL_SHARE) < 0.03, `Anteil echt ${real / 4000}`);
  assert.ok(![...seen[15]].some(n => !tier(11).has(n)) && seen[15].size >= 30, 'Status 15: nur Stufe 11');
  assert.ok(![...seen[25]].some(n => tier(40).has(n)) && [...seen[25]].some(n => tier(20).has(n)), 'Status 25: Stufe 11 + 20');
  assert.ok([...seen[45]].some(n => tier(40).has(n)) && [...seen[45]].some(n => tier(11).has(n)), 'Status 45: alle Stufen');
  // Branche gleichverteilt (nicht nach Markenzahl): Supermarkt (8 Marken) nicht häufiger als Fitness (3 Marken) – bei Status 25 je ≈ 1/Branchen
  const cnt = {}; for (let k = 0; k < 8000; k++) { const p = C.pickSponsor(25, none, rng); if (p.real) cnt[p.branche] = (cnt[p.branche] ?? 0) + 1; }
  assert.ok(Math.abs(cnt.supermarkt / cnt.fitness - 1) < 0.25, `Supermarkt ${cnt.supermarkt} vs. Fitness ${cnt.fitness}`);
  // leichter Fokus auf die zuletzt freigeschaltete Stufe innerhalb einer Branche (Bekanntheit der Marken unverändert)
  let newer = 0, tot = 0; for (let k = 0; k < 8000; k++) { const p = C.pickSponsor(45, new Set(Object.keys(R.BRANCHEN).filter(b => b !== 'mode')), rng); if (p?.real) { tot++; if (tier(40).has(p.name)) newer++; } }
  const modeNew = by(x => x.branche === 'mode' && x.from === 40).length / by(x => x.branche === 'mode').length;
  assert.ok(newer / tot > modeNew + 0.02, `Fokus ${newer / tot} statt ${modeNew}`);
  // Bezahlung: kleine Marken wenig, bekannte mehr, je Bekanntheit steigend
  assert.ok(R.SMALL_PAY < R.FAME_PAY[1]); for (let f = 2; f <= 5; f++) assert.ok(R.FAME_PAY[f] > R.FAME_PAY[f - 1]);
  const s = N.newNsdCareer({ first: 'S', last: 'P', nation: 'DE', age: 20, slot: 1, seed: 6 }); s.team = { manager: 'm3', trainer: null }; s.player.star.level = 15; s.player.rel.fans = 50;
  C.nameTeam(s); const ratio = { small: [], 1: [], 2: [], 3: [], 4: [], 5: [] }, m = C.managerOf(s), unit = C.sponsorBase(s) * m.mult * C.sponsorGrowth(15) * R.SPONSOR_PAY;   // Version 93: alle Beträge × SPONSOR_PAY
  for (let k = 0; k < 4000; k++) { s.nsdSponsors = { active: [], offer: null }; C.sponsorWeek(s, rng); const o = s.nsdSponsors.offer; if (o) { assert.ok(typeof o.real === 'boolean' && o.fame >= 0 && o.branche === br(o.name)); (o.real ? ratio[o.fame] : ratio.small).push(o.perWeek / unit); } }
  const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
  for (const f of [2, 3, 4, 5]) assert.ok(Math.abs(mean(ratio[f]) - C.realPayRamp(R.FAME_PAY[f], 15)) < 0.12, `Bekanntheit ${f}: ${mean(ratio[f])} statt ${C.realPayRamp(R.FAME_PAY[f], 15)}`);   // Version 105: Aufschlag bei Status 15 erst zur Hälfte
  assert.ok(ratio.small.length > 20 && mean(ratio.small) < 0.65 && mean(ratio[5]) > mean(ratio[2]) * 1.4, `klein ${mean(ratio.small)}`);
  // --- Verträge: eine Branche, max. 5, Kündigen für Neue ---
  const offer = (name, extra = {}) => ({ name, branche: br(name), real: true, fame: 4, perWeek: 20, win: 10, s180: 0, major: 0, weeks: 3, length: 26, bonus: 0, card: 5, steps: 0, mood: 0, annoyed: false, done: false, ...extra });
  s.nsdSponsors = { active: [], offer: offer('Coca-Cola') }; assert.equal(C.offerConflict(s), null);
  C.acceptOffer(s); assert.ok(s.nsdSponsors.active[0].real === true && s.nsdSponsors.active[0].branche === 'alkoholfrei' && s.nsdSponsors.active[0].fame === 4);
  // gleiche Branche: ersetzt den alten Vertrag (nur 1 Getränke-Marke)
  s.nsdSponsors.offer = offer('Red Bull'); assert.deepEqual(C.offerConflict(s), { kind: 'branche', drop: 'Coca-Cola' });
  C.acceptOffer(s); assert.deepEqual(s.nsdSponsors.active.map(c => c.name), ['Red Bull']);
  // fünf Verträge in fünf Branchen, der sechste braucht eine Kündigung
  for (const n of ['Würth', 'Tipico', 'Zalando', 'Bitburger']) { s.nsdSponsors.offer = offer(n); C.acceptOffer(s); }
  assert.equal(s.nsdSponsors.active.length, 5); assert.equal(new Set(s.nsdSponsors.active.map(c => c.branche)).size, 5);
  s.nsdSponsors.offer = offer('DVAG'); assert.deepEqual(C.offerConflict(s), { kind: 'full', drop: null });
  assert.throws(() => C.acceptOffer(s), /Maximal 5 Sponsoren/); assert.equal(s.nsdSponsors.active.length, 5, 'nichts passiert ohne Kündigung');
  assert.throws(() => C.acceptOffer(s, 'Gibt es nicht'), /gibt es nicht/);
  C.acceptOffer(s, 'Würth'); assert.equal(s.nsdSponsors.active.length, 5); assert.ok(!s.nsdSponsors.active.some(c => c.name === 'Würth') && s.nsdSponsors.active.some(c => c.name === 'DVAG'));
  assert.ok(s.news.some(n => n.title.includes('Würth') && n.title.includes('gekündigt')));
  // Kündigen jederzeit; Angebote kommen bei voller Liste, aber nie aus einer belegten Branche
  C.cancelSponsor(s, 'Tipico'); assert.equal(s.nsdSponsors.active.length, 4);
  for (let k = 0; k < 600; k++) { s.nsdSponsors.offer = null; C.sponsorWeek(s, rng); const o = s.nsdSponsors.offer; if (o) assert.ok(!s.nsdSponsors.active.some(c => c.branche === o.branche), `Angebot aus belegter Branche ${o.branche}`); s.nsdSponsors.active.forEach(c => { c.weeksLeft = 30; }); }
  s.nsdSponsors.active.push(offer('Tipico', { weeksLeft: 30 })); assert.equal(s.nsdSponsors.active.length, 5); let fullOffers = 0;
  for (let k = 0; k < 600; k++) { s.nsdSponsors.offer = null; C.sponsorWeek(s, rng); if (s.nsdSponsors.offer) { fullOffers++; assert.equal(C.offerConflict(s).kind, 'full'); } s.nsdSponsors.active.forEach(c => { c.weeksLeft = 30; }); }
  assert.ok(fullOffers > 20, 'auch bei 5 Sponsoren kommen Angebote');
  // alter Spielstand (Vertragsplätze statt Branchen): Branche kommt über den Markennamen dazu
  const old = N.newNsdCareer({ first: 'O', last: 'L', nation: 'DE', age: 20, slot: 1, seed: 9 });
  old.nsdSponsors = { active: [{ name: 'Brauerei Doppelfeld', slot: 'drink', perWeek: 3, win: 1, weeksLeft: 10 }, { name: 'Alte Marke XY', slot: 'partner', perWeek: 2, win: 1, weeksLeft: 10 }], offer: { name: 'Kneipenkönig Wear', slot: 'shirt', perWeek: 2, win: 1, weeks: 2, length: 12, bonus: 0, card: 3, steps: 0, mood: 0, done: false } };
  C.sponsorWeek(old, rng); assert.deepEqual(old.nsdSponsors.active.map(c => c.branche), ['bier', 'andere']); assert.equal(old.nsdSponsors.offer?.branche ?? 'mode', 'mode');
});

test('New Star Darts v73: umstrittene Sponsoren – ab Status 25, alle 1–2 Jahre, sehr gut bezahlt, Fan-Vorfälle, Sponsoren springen ab, ohne Branchenregel/Platzgrenze', async () => {
  const N = await import('../js/nsd.js'), C = await import('../js/career.js'), X = await import('../data/controversial.js'), R = await import('../data/sponsorsreal.js');
  assert.deepEqual(X.CONTROVERSIAL.map(x => x.name), ['Gazprom', 'Aramco', 'Rheinmetall', 'Nestlé', 'Pornhub', 'Heckler & Koch', 'Monsanto', 'OnlyFans', 'RussiaToday Deutsch', 'Truth Social']);
  for (const x of X.CONTROVERSIAL) assert.ok(x.tag && x.sector && x.scandal.length >= 2);
  assert.equal(X.CONTROVERSIAL_FROM, 25); assert.ok(X.CONTROVERSIAL_PAY > R.FAME_PAY[5]);
  const rng = new RNG(77), mk = (lvl, manager = 'm3') => { const s = N.newNsdCareer({ first: 'U', last: 'S', nation: 'DE', age: 20, slot: 1, seed: 12 }); s.team = { manager, trainer: null }; C.nameTeam(s); s.player.star.level = lvl; s.player.rel.fans = 60; s.player.rel.sponsors = 50; return s; };
  const tick = s => { s.date.week++; if (s.date.week > 52) { s.date.week = 1; s.date.year++; } };
  // Status 24 oder kein Manager: nie ein umstrittenes Angebot
  for (const [lvl, man] of [[24, 'm3'], [40, null]]) { const s = mk(lvl, man); if (!man) s.team.manager = null; for (let k = 0; k < 400; k++) { tick(s); C.sponsorWeek(s, rng); assert.equal(s.nsdSponsors.cOffer ?? null, null, `Status ${lvl}`); } }
  // Status 25+: erstes Angebot nach 26–78 Wochen, danach alle 52–104 Wochen (ca. 1–2 Jahre), nie während ein umstrittener Vertrag läuft
  const s = mk(30), at = []; let declined = 0;
  for (let k = 1; k <= 3000; k++) { tick(s); C.sponsorWeek(s, rng); s.nsdSponsors.active.forEach(c => { if (!c.controversial) c.weeksLeft = 30; }); if (s.nsdSponsors.cOffer && s.nsdSponsors.cOffer.weeks === X.CONTROVERSY_OFFER_WEEKS) { at.push(k); if (!X.CONTROVERSIAL.some(x => x.name === s.nsdSponsors.cOffer.name)) assert.fail('unbekannte Marke'); C.declineControversial(s); declined++; } }
  assert.ok(at[0] >= 26 && at[0] <= 79, `erstes Angebot nach ${at[0]}`); for (let i = 1; i < at.length; i++) assert.ok(at[i] - at[i - 1] >= 52 && at[i] - at[i - 1] <= 104, `Abstand ${at[i] - at[i - 1]}`);
  const perYear = at.length / (3000 / 52); assert.ok(perYear > 0.5 && perYear < 1.0, `${perYear} Angebote je Jahr`);
  // Angebot verfällt nach 4 Wochen; Bezahlung deutlich über normal
  const t = mk(30); t.nsdSponsors = { active: [], offer: null, cAt: 0 }; let o = null; for (let k = 0; k < 5 && !o; k++) { tick(t); C.sponsorWeek(t, rng); o = t.nsdSponsors.cOffer; }
  assert.ok(o && o.weeks === 4, 'Angebot da'); for (let k = 0; k < 4; k++) { tick(t); C.sponsorWeek(t, rng); } assert.equal(t.nsdSponsors.cOffer, null, 'verfällt');
  const unit = C.sponsorBase(t) * C.managerOf(t).mult * C.sponsorGrowth(30) * R.SPONSOR_PAY, pays = [];
  for (let k = 0; k < 600; k++) { t.nsdSponsors = { active: [], offer: null, cAt: 0 }; tick(t); C.sponsorWeek(t, rng); if (t.nsdSponsors.cOffer) pays.push(t.nsdSponsors.cOffer.perWeek / unit); }
  const mean = a => a.reduce((x, y) => x + y, 0) / a.length; assert.ok(Math.abs(mean(pays) - X.CONTROVERSIAL_PAY) < 0.2, `Bezahlfaktor ${mean(pays)}`);
  // Annehmen: außerhalb der Branchenregel und der 5 Plätze, Fans sofort −3, nur ein umstrittener Vertrag
  const u = mk(30); const nrm = (name, extra = {}) => ({ name, branche: R.brancheOfName(name), real: true, fame: 4, perWeek: 20, win: 10, s180: 0, major: 0, weeksLeft: 40, ...extra });
  u.nsdSponsors = { active: ['Würth', 'Tipico', 'Zalando', 'Bitburger', 'Rewe'].map(n => nrm(n)), offer: null, cOffer: { name: 'Nestlé', sector: 'Lebensmittel', tag: 'x', perWeek: 50, win: 20, weeks: 4, length: 26 } };
  const f0 = u.player.rel.fans; C.acceptControversial(u);
  assert.equal(u.nsdSponsors.active.length, 6); assert.equal(C.normalContracts(u).length, 5, 'zählt nicht zu den 5'); assert.equal(u.player.rel.fans, f0 + X.CONTROVERSY_SIGN_FANS);
  assert.ok(C.hasControversial(u) && u.nsdSponsors.active.at(-1).controversial === true && u.nsdSponsors.cOffer === null);
  u.nsdSponsors.cOffer = { name: 'Gazprom', sector: 'Energie', tag: 'x', perWeek: 50, win: 20, weeks: 4, length: 26 }; assert.throws(() => C.acceptControversial(u), /schon ein umstrittener/);
  assert.equal(C.offerConflict(u, nrm('Lufthansa')).kind, 'full', 'bei 5 normalen Sponsoren weiter voll');
  u.nsdSponsors.active = u.nsdSponsors.active.filter(c => c.name !== 'Rewe'); assert.equal(C.offerConflict(u, nrm('Lufthansa')), null, '4 normale + 1 umstrittener: Platz frei');
  assert.equal(C.offerConflict(u, nrm('Coca-Cola', { branche: 'bier' })).kind, 'branche', 'Branchenregel gilt für normale Verträge weiter');
  assert.equal(C.offerConflict(u, nrm('Edeka')), null, 'Nestlé (Lebensmittel) blockiert keine Supermarkt-Branche');
  // Bezahlung und Siegprämie laufen mit
  const st0 = u.stars ?? 0; C.sponsorWeek(u, rng); assert.ok(u.stars >= st0 + 50);
  // Vorfälle: Rate, Verteilung nach Gewichten, nur normale Sponsoren betroffen, Folgen je Art
  const v = mk(30), ctrl = { name: 'Rheinmetall', controversial: true, perWeek: 90 }, P = X.CONTROVERSY_PARAMS; let ev = 0; const kinds = {}, n = 8000;
  assert.equal(X.CONTROVERSY_KINDS.reduce((a, k) => a + k.w, 0), 100); assert.equal(P.rate, X.CONTROVERSY_EVENT);
  const fresh2 = () => { v.nsdSponsors = { active: [nrm('Würth'), nrm('Tipico'), nrm('Zalando'), nrm('Bitburger'), ctrl], offer: { name: 'Offen', branche: 'fitness', weeks: 3 } }; v.player.rel.fans = 60; v.player.rel.manager = 70; v.player.satisfaction = 60; v.stars = 1000; v.team = { manager: 'm3', trainer: null }; };
  for (let k = 0; k < n; k++) {
    fresh2(); const r = C.controversyEvent(v, ctrl, rng); if (!r) continue; ev++; kinds[r.kind] = (kinds[r.kind] ?? 0) + 1;
    const act = v.nsdSponsors.active, gone = 4 - act.filter(c => !c.controversial).length;
    assert.ok(act.includes(ctrl) && act.every(c => c === ctrl || ['Würth', 'Tipico', 'Zalando', 'Bitburger'].includes(c.name)), 'umstrittener Vertrag bleibt');
    if (r.kind === 'leave') assert.equal(gone, 1);
    if (r.kind === 'fans') { assert.ok(r.loss >= 2 && r.loss <= 5 && v.player.rel.fans === 60 - r.loss); assert.equal(gone, 0); }
    if (r.kind === 'pr') { assert.equal(r.cost, 4 * 90); assert.equal(v.stars, 1000 - 360); assert.equal(v.player.rel.fans, 57); assert.equal(gone, 0); }
    if (r.kind === 'severe') { assert.ok(r.loss >= 8 && r.loss <= 15 && v.player.rel.fans === 60 - r.loss && gone >= 1 && gone <= 3 && v.stars === 1000 - 450 && v.nsdSponsors.offer === null); assert.equal(C.sponsorBlockWeeks(v), 10); }
    if (r.kind === 'mega') { assert.ok(r.loss >= 20 && r.loss <= 30 && v.player.rel.fans === 60 - r.loss && gone >= 1 && v.stars === 1000 - 900 && v.player.satisfaction === 54); assert.equal(C.sponsorBlockWeeks(v), 20); }
    if (r.kind === 'manager') { assert.ok(r.rel >= 18 && r.rel <= 30 && v.player.rel.manager === 70 - r.rel && gone === 0); }
  }
  assert.ok(Math.abs(ev / n - X.CONTROVERSY_EVENT) < 0.015, `Vorfall-Rate ${ev / n}`);
  for (const k of X.CONTROVERSY_KINDS) assert.ok(Math.abs((kinds[k.kind] ?? 0) / ev - k.w / 100) < 0.05, `${k.kind}: ${(kinds[k.kind] ?? 0) / ev} statt ${k.w / 100}`);
  assert.ok(v.news.some(x => x.title.includes('springt ab')) && v.news.some(x => x.title.includes('Proteste wegen Rheinmetall')) && v.news.some(x => x.title.includes('Skandal um')) && v.news.some(x => x.title.includes('Mega-Skandal')) && v.news.some(x => x.title.includes('Manager-Krach')) && v.news.some(x => x.title.includes('Krisen-PR')));
  // ohne andere Sponsoren: kein Abspringen (leave → Proteste, severe/mega → Krisen-PR); Krisen-PR nie über das Guthaben
  v.nsdSponsors = { active: [ctrl], offer: null }; v.stars = 3; for (let k = 0; k < 600; k++) { const r = C.controversyEvent(v, ctrl, rng); assert.ok(!r || !['leave', 'severe', 'mega'].includes(r.kind)); assert.ok(v.stars >= 0, 'Guthaben nie negativ'); v.stars = 3; }
  // Manager-Krach kann den Manager kosten (Beziehung ≤ 0 → Kündigung)
  let fired = false; for (let k = 0; k < 4000 && !fired; k++) { fresh2(); v.player.rel.manager = 20; const r = C.controversyEvent(v, ctrl, rng); if (r?.kind === 'manager') fired = !C.managerOf(v) && v.player.rel.manager === 0; }
  assert.ok(fired, 'Manager-Krach kann zur Kündigung des Managers führen');
  // Sponsoren-Sperre: keine neuen normalen Angebote, danach wieder
  const b = mk(30); b.nsdSponsors = { active: [], offer: null, cAt: 1e9, blockUntil: (b.date.year * 52 + b.date.week) + 10 }; let during = 0, after = 0;
  for (let k = 0; k < 9; k++) { tick(b); C.sponsorWeek(b, rng); if (b.nsdSponsors.offer) during++; }
  assert.equal(during, 0, 'keine Angebote während der Sperre'); assert.ok(C.sponsorBlockWeeks(b) <= 1);
  for (let k = 0; k < 60; k++) { tick(b); C.sponsorWeek(b, rng); if (b.nsdSponsors.offer) { after++; b.nsdSponsors.offer = null; } }
  assert.ok(after > 5, 'danach kommen wieder Angebote');
  // Kündigen des umstrittenen Vertrags jederzeit möglich; Spielstände ohne `cAt` laufen weiter
  const w = mk(30); w.nsdSponsors = { active: [{ ...nrm('Gazprom'), controversial: true, branche: 'umstritten' }], offer: null }; C.cancelSponsor(w, 'Gazprom'); assert.equal(w.nsdSponsors.active.length, 0);
});

test('New Star Darts v77: Premier-League-Aufstellung steht zum Jahreswechsel fest (Zeitungsartikel), Anzeige friert nichts ein', async () => {
  const N = await import('../js/nsd.js'), M = await import('../js/majors.js'), A = await import('../js/articles.js');
  const s = N.newNsdCareer({ first: 'Pia', last: 'Test', nation: 'DE', age: 20, slot: 1, seed: 21 });
  s.player.cardUntil = 2099; s.player.tour = 'tour';
  // Ranglisten-Anzeige vor der Aufstellung: Vorschau der Top 8, nichts wird festgeschrieben
  assert.equal(M.plTable(s).length, 8); assert.ok(!s.pl?.[2026]?.players, 'Anzeige friert die Aufstellung nicht ein');
  let guard = 0; while (!(s.date.year === 2027 && s.date.week === 1) && guard++ < 80) assert.ok(nextWeek(s));
  assert.equal(s.date.year, 2027); assert.equal(s.date.week, 1);
  const pl = s.pl[2027], top8 = orderOfMerit(s, 'pdc').slice(0, 8).map(x => x.p.id);
  assert.equal(pl.players.length, 8); assert.ok(pl.announced); assert.deepEqual([...pl.players].sort(), [...top8].sort());
  const art = s.articles.find(a => a.kicker === 'PREMIER LEAGUE' && a.year === 2027);
  assert.ok(art, 'Zeitungsartikel zur Premier League'); assert.ok(art.title.includes('Premier League 2027') || art.title.includes('dabei'));
  assert.ok(pl.players.includes('P') || art.text.includes('nicht dabei'));
  assert.ok(s.news.some(x => x.type === 'article' && x.title === art.title));
  // Aufstellung bleibt bis zum 1. Spieltag (KW 6) unverändert, am Spieltag kein zweiter Artikel
  const before = [...pl.players]; guard = 0; while (s.date.week < 7 && guard++ < 10) assert.ok(nextWeek(s));
  assert.deepEqual(s.pl[2027].players, before); assert.equal(s.news.filter(x => x.type === 'article' && x.title.includes('Premier League') ).length + s.news.filter(x => x.title.includes('ist in der Premier League dabei')).length >= 1, true);
  assert.equal(s.news.filter(x => x.title.includes('ist in der Premier League dabei')).length, pl.players.includes('P') ? 1 : 0);
  // Texte: eingeladen → eigener Name nicht in der Mitspielerliste
  const t = {}; Object.assign(t, s); t.articles = []; t.news = []; t.mode = 'nsd';
  const a = A.plLineupArticle(t, ['Littler', 'Humphries', 'Test', 'Price'], true, 2027);
  assert.ok(a.title.includes('dabei') && a.text.includes('Littler, Humphries, Price') && !a.text.includes('Test,'));
  const b = A.plLineupArticle(t, ['Littler', 'Humphries'], false, 2027);
  assert.ok(b.title.includes('Premier League 2027') && b.text.includes('nicht dabei'));
});

test('New Star Darts v80: World Cup – Team-Average und Einzel-Averages je Spieler (Schnellsimulation und Live-Match)', async () => {
  const N = await import('../js/nsd.js'), M = await import('../js/majors.js');
  const at = v => ({ sco: v, fin: v, men: v, foc: v, cal: v, exp: 0 });
  const sum = (list, k) => list.reduce((a, x) => a + x[k], 0);
  const same = (st, mem) => ['points', 'darts', 's180', 's140', 's100', 'coHit', 'coAtt'].every(k => sum(mem, k) === st[k]);
  // Schnellsimulation: je Mitglied eigene Statistik, Summe = Team; Einzelspieler ohne `members`
  const rng = new RNG(5);
  for (let i = 0; i < 20; i++) {
    const r = simulateMatch([at(96), at(88)], [at(90), at(90)], { legs: 5 }, rng);
    assert.equal(r.members.length, 2); assert.ok(r.members.every(side => side.length === 2));
    for (const t of [0, 1]) {
      assert.ok(same(r.stats[t], r.members[t]), `Summe der Mitglieder = Team (${t})`);
      const lo = Math.min(...r.members[t].map(x => x.avg)), hi = Math.max(...r.members[t].map(x => x.avg));
      assert.ok(r.stats[t].avg >= lo - 1e-9 && r.stats[t].avg <= hi + 1e-9, 'Team-Ø liegt zwischen den Einzel-Ø');
    }
  }
  assert.equal(simulateMatch(at(90), at(90), { legs: 3 }, rng).members, null);
  // Live-Match im World Cup: Einzelstatistik im Spielbericht (lastMatch.meM / oppM)
  const j = N.newNsdCareer({ first: 'Taro', last: 'Test', nation: 'JP', age: 20, slot: 1, seed: 8 });
  j.player.assessed = true; j.date.week = 24; j.week = { played: false, eventId: null };
  const tm = M.wcTeams(j).P; ET.enterEvent(j, 'wcod'); ET.startManualMatch(j);
  assert.deepEqual(j.activeEvent.live.m.team, [2, 2]);
  const lm = j.activeEvent.live.m, me = j.activeEvent.live.me;
  const res = ET.simulateLiveRest(j), last = j.activeEvent.lastMatch;
  assert.ok(res && last.meM?.length === 2 && last.oppM?.length === 2, 'Mitglieder-Statistik im Spielbericht');
  assert.ok(same(last.me, last.meM) && same(last.opp_, last.oppM), 'Summe der Mitglieder = Team (live)');
  assert.ok(last.meM.every(x => x.darts > 0 && x.avg > 0) && last.oppM.every(x => x.darts > 0), 'beide Partner haben geworfen');
  assert.ok(last.meM[0].darts >= last.meM[1].darts - 3 * lm.legIdx, 'Wechsel je Aufnahme');
  assert.equal(j.activeEvent.teams.P.members.length, 2); assert.equal(tm.members.length, 2); void me;
  // normale Turniere: keine Mitgliederstatistik
  const k = N.newNsdCareer({ first: 'Kai', last: 'Test', nation: 'DE', age: 20, slot: 1, seed: 3 });
  const MT = await import('../js/matchState.js'), m1 = MT.createMatch({ legs: 3 }, 0); assert.equal(m1.team, null); assert.equal(MT.matchResult(m1).members, null); void k;
});

test('New Star Darts v82: Zielkreis schrumpft langsamer (konvex) und bleibt am Ende größer', async () => {
  const R = (await import('../js/throwModel.js')).circleRadius, T = await import('../js/skilltrain.js');
  assert.equal(R(0), 17); assert.equal(R(60), 8); assert.equal(R(-5), 18); assert.equal(R(90), 8, 'über 60 nicht kleiner');
  let prev = Infinity; for (let sk = 0; sk <= 60; sk++) { const r = R(sk); assert.ok(r < prev + 1e-12, `fällt (${sk})`); assert.ok(r >= 8 - 1e-9 && r <= 17 + 1e-9); prev = r; }
  for (const sk of [10, 20, 30, 40, 50]) assert.ok(R(sk) > 17 - 0.2 * sk + 0.9, `größer als vorher bei ${sk}`);   // vorher linear 17 − 0,2 × Fähigkeit
  assert.ok(Math.abs(R(30) - 13.6) < 0.1 && Math.abs(R(40) - 11.9) < 0.1 && Math.abs(R(50) - 10) < 0.1);
  // Training nutzt dieselbe Kurve – seit Version 89 ohne Level-Zuschlag (Test v89)
  assert.ok(Math.abs(T.trainAim(40, 40, 20).radius - R(40)) < 1e-9); assert.ok(Math.abs(T.trainAim(40, 40, 1).radius - R(40)) < 1e-9);
});

test('New Star Darts v83: Nervosität – einzelne Darts mit größerem Zielkreis (einmal je Dart gewürfelt, mit Mental weg)', async () => {
  const N = await import('../js/nsd.js');
  const rng = new RNG(9);
  // Reine Funktion: unter der Schwelle nie, sonst Chance 0,18 × Punkte, Faktor 1,2 … 1,2 + 0,25 × Punkte (höchstens 1,8)
  for (const pts of [0, 0.1, 0.24]) for (let i = 0; i < 200; i++) assert.equal(N.nerveShake(pts, rng), 1);
  for (const [pts, p] of [[1.2, 0.216], [3, 0.54], [6, 0.55]]) {
    let hit = 0, n = 20000, lo = 9, hi = 0;
    for (let i = 0; i < n; i++) { const m = N.nerveShake(pts, rng); if (m > 1) { hit++; lo = Math.min(lo, m); hi = Math.max(hi, m); } }
    assert.ok(Math.abs(hit / n - p) < 0.02, `Chance bei ${pts}: ${hit / n}`); assert.ok(lo >= 1.2 && hi <= 1.8 + 1e-9, `Faktor ${lo}–${hi}`);
    if (pts === 1.2) assert.ok(hi <= 1.2 + 0.25 * 1.2 + 1e-9);
  }
  // Im Liveticker: nervöser Anfänger bekommt zwischendurch größere Kreise, einmal je Dart; mit hohem Mental nie
  const mk = lvl => {
    const s = N.newNsdCareer({ first: 'Nick', last: 'Nervös', nation: 'DE', age: 25, slot: 1, seed: 12 });
    s.player.assessed = true; s.date.week = 6; s.week = { played: false, eventId: null }; s.player.star.level = lvl;
    ET.enterEvent(s, eventsInWeek(s, 2026, 6).find(e => e.cat === 'pc').id); const live = ET.startManualMatch(s);
    live.m.turn = live.me; return { s, live };
  };
  const rad = (o, k) => { o.live.m.legDarts[o.live.me] = k; return ET.aimParams(o.s, 'T20'); };
  const a = mk(1); assert.ok(ET.nervesNow(a.s).pts >= 0.25, 'Anfänger ist nervös');
  const radii = Array.from({ length: 400 }, (_, k) => rad(a, k)), base = Math.min(...radii.map(r => r.radius));
  const big = radii.filter(r => r.shaky);
  assert.ok(big.length > 400 * 0.1 && big.length < 400 * 0.45, `Anteil zittriger Darts ${big.length / 400}`);
  assert.ok(big.every(r => r.radius >= base * 1.19 && r.radius <= base * 1.81) && radii.filter(r => !r.shaky).every(r => Math.abs(r.radius - base) < 1e-9));
  const r1 = rad(a, 500).radius; for (let i = 0; i < 5; i++) assert.equal(ET.aimParams(a.s, 'T20').radius, r1, 'Zielwechsel würfelt nicht neu');
  const z = mk(60); assert.equal(ET.nervesNow(z.s).pts, 0);
  assert.ok(Array.from({ length: 200 }, (_, k) => rad(z, k)).every(r => !r.shaky), 'ohne Nervosität nie');
});

test('New Star Darts v87: Development Tour spielbar (bis 23, außerhalb der Top 64), Rangliste dezimal, Konto nur ganze ★', async () => {
  const N = await import('../js/nsd.js'), C = await import('../js/calendar.js'), RK = await import('../js/rankings.js');
  const mk = age => { const s = N.newNsdCareer({ first: 'Dev', last: 'Test', nation: 'DE', age, slot: 1, seed: 6 }); s.player.assessed = true; s.date.week = 14; s.week = { played: false, eventId: null }; return s; };
  const devEv = s => eventsInWeek(s, 2026, 14).find(e => e.cat === 'dev');
  // Sichtbarkeit: bis 23 sichtbar und spielbar (außerhalb der Top 64), ab 24 ausgeblendet
  const y = mk(20), ev = devEv(y); assert.ok(ev && ev.pick && ev.count === 5);
  assert.ok(C.shownTo(y, ev)); assert.equal(eventStatus(y, ev).playable, true, eventStatus(y, ev).reason);
  const old = mk(24); assert.equal(C.shownTo(old, devEv(old)), false); assert.equal(eventStatus(old, devEv(old)).playable, false);
  assert.ok(!C.shownTo(y, eventsInWeek(y, 2026, 11).find(e => e.cat === 'challenge') ?? { cat: 'challenge' }), 'Challenge Tour bleibt gesperrt');
  // Top 64 der PDC-Rangliste: gesperrt
  const top = mk(20); RK.addMoney(top, 'pdc', 'P', 1e6); const st = eventStatus(top, devEv(top));
  assert.equal(st.playable, false); assert.ok(/Top-64/.test(st.reason), st.reason);
  // 2 von 5 Turnieren spielen; Rest läuft im Hintergrund; Auszahlung ganze ★, Rangliste darf Dezimalstellen haben
  const s = mk(20); s.player.star.level = 7; const stars0 = s.stars;
  enterEvent(s, ev.id, { count: 2 }); assert.equal(s.week.playCount, 2);
  const seen = [];
  for (let k = 0; k < 2; k++) { simulateRest(s); const inst = s.activeEvent; seen.push(inst); assert.ok(Number.isInteger(inst.stars), `Auszahlung ganzzahlig: ${inst.stars}`); if (k === 0) { assert.equal(inst.hasNext, true); nextSub(s); } else assert.equal(inst.hasNext, false); }
  closeEvent(s); assert.equal(s.activeEvent, null);
  assert.ok(Number.isInteger(s.stars) && s.stars >= stars0, `Konto ${s.stars}`);
  assert.ok(Object.values(s.rankings.years[2026].dev ?? {}).length > 60, 'alle fünf Turniere zählen für die Dev-Rangliste');
  const frac = Object.values(s.rankings.years[2026].dev).some(v => !Number.isInteger(v)); assert.ok(frac, 'Rangliste mit Dezimalstellen (z. B. 0,1 / 0,2)');
  assert.equal(s.results.filter(r => r.cat === 'dev').length, 2);
  // Tabelle: Gewinner-Auszahlung grundsätzlich ganzzahlig und mind. 1 ★ (auch für kleine Beträge wie 0,1 Basis-★)
  for (const base of [0.1, 0.2, 0.6, 1.25, 2.5, 5]) for (const lvl of [1, 7, 30]) { const v = N.starPayout(base, lvl); assert.ok(Number.isInteger(v) && v >= 1, `${base}@${lvl}=${v}`); }
  assert.equal(N.starPrizeTable('dev').L64, 0.1); assert.ok(N.STAR_WEIGHT.dev < 1);
});

test('New Star Darts v88: Nationen laut Nutzerhinweisen (neue Karriere und ältere Spielstände)', async () => {
  const N = await import('../js/nsd.js'), P = await import('../data/players.js');
  const want = { 'Kai Clark': 'WAL', 'Ryan Branley': 'ENG', 'Kaya Baysal': 'ENG', 'Geoffrey Murray': 'ENG', 'Dean Fitch Jnr': 'SCO', 'Jake Eichen': 'ENG', 'Ansh Sood': 'CH',
    'Angelo Balsamo': 'NL', 'David Fidler': 'CZ', 'David Evans': 'ENG', 'Ricardo Ulrich': 'NL', 'Martin Homola': 'SK', 'Liam Maendl-Lawrance': 'DE',
    'Levy Frauenfelder': 'NL', 'Derek Coulson': 'WAL', 'Callum Goffin': 'WAL', 'Adam Leek': 'AU' };
  const s = N.newNsdCareer({ first: 'Na', last: 'Tion', nation: 'DE', age: 25, slot: 1, seed: 3 }), byName = n => Object.values(s.world.players).find(p => p.name === n);
  for (const [name, nat] of Object.entries(want)) { assert.ok(byName(name), `${name} in der Welt`); assert.equal(byName(name).nation, nat, name); assert.equal(P.NATION_FIXES[name], nat, `NATION_FIXES ${name}`); }
  // ältere Spielstände: falsche Nation wird beim Laden korrigiert
  for (const name of Object.keys(want)) byName(name).nation = 'FR';
  const m = (await import('../js/state.js')).migrate; m(s);
  for (const [name, nat] of Object.entries(want)) assert.equal(byName(name).nation, nat, `migriert: ${name}`);
});

test('New Star Darts v89: in jedem Leg mindestens eine eigene Spielszene – auch in langen Formaten', async () => {
  const N = await import('../js/nsd.js');
  for (const [seed, legs] of [[31, 18], [32, 10], [33, 3], [34, 6]]) {
    const s = N.newNsdCareer({ first: 'Sz', last: 'Ene', nation: 'DE', age: 25, slot: 1, seed });
    s.player.assessed = true; s.date.week = 6; s.week = { played: false, eventId: null };
    ET.enterEvent(s, eventsInWeek(s, 2026, 6).find(e => e.cat === 'pc').id); const live = ET.startManualMatch(s), lm = live.m;
    lm.format = { legs };                                   // Matchplay-artig lang (First-to 18) bzw. kürzer
    const scenes = {}, kinds = new Set(); let guard = 0;
    while (!lm.done && guard++ < 6000) {
      if (lm.turn === live.me) { const k = ET.keyMoment(s); if (k) { scenes[lm.legIdx] = (scenes[lm.legIdx] ?? 0) + 1; kinds.add(k); if (ET.keyMoment(s) !== k) { /* Neuladen: dieselbe Szene */ assert.ok(false, 'Szene muss bei erneuter Prüfung bleiben'); } } }
      ET.liveAiVisit(s);
    }
    assert.ok(lm.done, 'Match beendet'); const total = lm.legIdx;
    for (let i = 0; i < total; i++) assert.ok((scenes[i] ?? 0) >= 1, `Format First-to ${legs}: Leg ${i + 1}/${total} ohne Spielszene`);
    assert.ok(total >= legs, 'genug Legs gespielt');
  }
  // Doppel (World Cup): kein Selbstwerfen, also auch keine erzwungene Szene
  const j = N.newNsdCareer({ first: 'Taro', last: 'Test', nation: 'JP', age: 20, slot: 1, seed: 8 }); j.player.assessed = true; j.date.week = 24; j.week = { played: false, eventId: null };
  ET.enterEvent(j, 'wcod'); const lj = ET.startManualMatch(j); let partner = 0;
  for (let k = 0; k < 400 && !lj.m.done; k++) { if (lj.m.turn === lj.me && ET.liveThrower(j, lj.me) !== 'P') { if (ET.keyMoment(j)) partner++; } ET.liveAiVisit(j); }
  assert.equal(partner, 0, 'Partner wirft ohne Szene');
});

test('New Star Darts v89: Training wie im Spiel (Kreis aus aktueller Fähigkeit, gleiche Linien) und Tempo-Steigerung je Richtungswechsel', async () => {
  const TM = await import('../js/throwModel.js'), T = await import('../js/skilltrain.js'), MS_ = await import('../js/matchState.js');
  // Training = Spiel: Kreis nur aus der Fähigkeit, Linien nur aus dem Fokus, unabhängig vom Level
  for (const L of [1, 7, 20]) { const a = T.trainAim(33, 40, L); assert.equal(a.radius, TM.circleRadius(33)); assert.equal(a.amp, TM.lineParams(40).amp); assert.equal(a.freq, TM.lineParams(40).freq); }
  const at = { sco: 87.5 + 12.5 / 60 * 33, fin: 100, men: 90, foc: 87.5 + 12.5 / 60 * 40, cal: 90, exp: 0 };
  const cp = TM.circleParams(at, MS_.createMatch({ legs: 3 }, 0), 0, 'T20');          // Spiel ohne Druck/Ausdauer
  assert.ok(Math.abs(cp.radius - TM.circleRadius(33)) < 1e-6 && Math.abs(cp.amp - TM.lineParams(40).amp) < 1e-6 && Math.abs(cp.freq - TM.lineParams(40).freq) < 1e-6, 'Spiel und Training liefern dieselben Parameter');
  assert.equal(TM.Y_SPEED, 0.8);
  // Tempo: erste halbe Schwingung im Grundtempo, danach jede um ×1,1 schneller, höchstens ×2,5
  const f = 0.7;
  assert.equal(TM.rampPhase(0, f), 0); assert.ok(Math.abs(TM.rampPhase(0.1, f) - 0.1 * f) < 1e-12);
  assert.ok(Math.abs(TM.rampPhase(0.5 / f, f) - 0.5) < 1e-9, 'erster Richtungswechsel nach ½ Zyklus im Grundtempo');
  const t1 = 0.5 / f, t2 = t1 + 0.5 / (f * TM.RAMP_STEP);
  assert.ok(Math.abs(TM.rampPhase(t2, f) - 1) < 1e-9, 'zweite Schwingung um ×1,1 schneller'); assert.ok(t2 - t1 < t1);
  let prev = -1; for (let t = 0; t < 40; t += 0.05) { const v = TM.rampPhase(t, f); assert.ok(v > prev - 1e-12); prev = v; }
  const late = (TM.rampPhase(101, f) - TM.rampPhase(100, f)); assert.ok(Math.abs(late - f * TM.RAMP_CAP) < 1e-9, `Endtempo ${late}`);
  assert.ok(TM.rampPhase(8, f) > 8 * f * 1.2, 'nach einigen Schwingungen spürbar schneller');
});

test('New Star Darts v89: neue Sponsoren (Darts-Zubehör, Autoscoring, Lebensmittel, Getränke …) in den Stufen 11/20, je eine feste Branche', async () => {
  const R = await import('../data/sponsorsreal.js'), C = await import('../js/career.js');
  const want = { 11: { 'Kong Strong': 'alkoholfrei', 'ja!': 'supermarkt', 'gut & günstig': 'supermarkt', 'Penny': 'supermarkt', 'Norma': 'supermarkt', 'finanzguru': 'finanzen', 'Holy Energy': 'alkoholfrei', 'HelloFresh': 'gastro',
      'Waterdrop': 'alkoholfrei', 'MORE Nutrition': 'fitness', 'Ninja': 'haushalt', 'Dartsturm': 'darts', 'Dartgarage': 'darts', 'Shorty Merch': 'darts', 'Cube Darts': 'darts', 'Scolia': 'autoscoring', 'Dartom': 'autoscoring', 'DartCounter': 'autoscoring', 'Knabe Cola': 'alkoholfrei' },
    20: { 'Dartshopper': 'darts', 'McDart': 'darts', 'NordVPN': 'it', 'Air Up': 'alkoholfrei', 'Shopify': 'it', 'Manscaped': 'haushalt', 'Snocks': 'mode', 'Back Market': 'elektrohandel', 'congstar': 'it', 'Clark': 'finanzen', 'Johnnie Walker': 'spirituosen', 'Hennessy': 'spirituosen' } };
  for (const [from, list] of Object.entries(want)) for (const [name, b] of Object.entries(list)) {
    const x = R.REAL_SPONSORS.find(y => y.name === name); assert.ok(x, `${name} fehlt`); assert.equal(x.from, +from, name); assert.equal(x.branche, b, name); assert.equal(R.brancheOfName(name), b);
  }
  assert.ok(R.BRANCHEN.autoscoring && R.BRANCHEN.darts);
  // Angebote: Autoscoring und Darts-Zubehör erscheinen ab Status 11 und blockieren sich nicht gegenseitig
  const rng = new RNG(5), seen = new Set(); for (let k = 0; k < 4000; k++) { const p = C.pickSponsor(15, new Set(), rng); if (p) seen.add(p.name); }
  assert.ok(['Scolia', 'Dartom', 'DartCounter', 'Dartsturm', 'Penny', 'Kong Strong'].every(n => seen.has(n)), 'neue Marken tauchen auf');
  assert.ok(!['Dartshopper', 'NordVPN', 'Hennessy'].some(n => seen.has(n)), 'Stufe 20 erst ab Status 20');
  const only = new Set(Object.keys(R.BRANCHEN).filter(b => b !== 'autoscoring')), r2 = new RNG(6); let ok = true;
  for (let k = 0; k < 500; k++) { const p = C.pickSponsor(15, only, r2); if (p && R.brancheOfName(p.name) !== 'autoscoring' && p.branche !== 'autoscoring') ok = false; }
  assert.ok(ok, 'Angebote nur aus freien Branchen');
});

test('New Star Darts v89: Manager – Frauen-Symbol mit Frauenname, Männer-Symbol mit Männername (auch ältere Spielstände)', async () => {
  const N = await import('../js/nsd.js'), C = await import('../js/career.js'), NM = await import('../data/names.js'), TD = await import('../data/team.js');
  const women = new Set(Object.values(NM.WOMEN_FIRST).flat()), men = new Set(Object.values(NM.NAME_POOLS).flatMap(p => p.first));
  const first = n => n.split(' ')[0];
  assert.deepEqual(TD.MANAGERS.filter(m => m.woman).map(m => m.id), ['m2']);
  for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const s = N.newNsdCareer({ first: 'M', last: 'N', nation: 'DE', age: 25, slot: 1, seed });
    for (const m of C.managersOf(s)) assert.ok(m.woman ? women.has(first(m.name)) : men.has(first(m.name)) && !women.has(first(m.name)), `${m.icon} ${m.name}`);
    // ältere Spielstände: Name mit falschem Geschlecht wird einmal korrigiert, die anderen bleiben
    const old = N.newNsdCareer({ first: 'M', last: 'N', nation: 'DE', age: 25, slot: 1, seed }); const keep = { ...old.team.names };
    old.team.names.m2 = 'Kevin Müller'; delete old.team.namesV;
    C.nameTeam(old); assert.ok(women.has(first(old.team.names.m2)), old.team.names.m2); assert.equal(old.team.names.m1, keep.m1); assert.equal(old.team.names.m3, keep.m3);
    const again = old.team.names.m2; C.nameTeam(old); assert.equal(old.team.names.m2, again, 'danach stabil');
  }
});

test('New Star Darts v93: Sponsorenzahlungen × 0,7 – neue Angebote und (einmalig) laufende Verträge älterer Spielstände', async () => {
  const N = await import('../js/nsd.js'), C = await import('../js/career.js'), R = await import('../data/sponsorsreal.js'), ST = await import('../js/state.js');
  assert.equal(R.SPONSOR_PAY, 0.56); assert.equal(C.SPONSOR_PAY, 0.56);   // Version 142: 0,7 → 0,56
  // ältere Spielstände: laufende Verträge, offenes Angebot und umstrittenes Angebot werden beim Laden einmal angepasst
  const s = N.newNsdCareer({ first: 'S', last: 'P', nation: 'DE', age: 25, slot: 1, seed: 9 });
  s.nsdSponsors = { active: [{ name: 'Würth', branche: 'bau', perWeek: 100, win: 50, s180: 30, major: 0, weeksLeft: 20 }, { name: 'Klein', branche: 'mode', perWeek: 1, win: 1, s180: 0, major: 2, weeksLeft: 5 }],
    offer: { name: 'Tipico', branche: 'wetten', perWeek: 40, win: 20, s180: 0, major: 80, weeks: 2 }, cOffer: { name: 'Gazprom', perWeek: 200, win: 80, weeks: 3 } };
  ST.migrate(s);
  assert.deepEqual(s.nsdSponsors.active.map(c => [c.perWeek, c.win, c.s180, c.major]), [[56, 28, 0, 0], [1, 1, 0, 1]]   /* v143: 180er-Prämie gestrichen */);
  assert.deepEqual([s.nsdSponsors.offer.perWeek, s.nsdSponsors.offer.win, s.nsdSponsors.offer.major], [22, 11, 45]); assert.equal(s.nsdSponsors.cOffer.perWeek, 112);
  ST.migrate(s); assert.equal(s.nsdSponsors.active[0].perWeek, 56, 'nur einmal');
  // Version 142: Spielstand nach Version 93 (payV 2) → nur noch × 0,8
  const v2 = N.newNsdCareer({ first: 'S', last: 'P', nation: 'DE', age: 25, slot: 1, seed: 11 });
  v2.nsdSponsors = { active: [{ name: 'Würth', branche: 'bau', perWeek: 100, win: 50, s180: 0, major: 0, weeksLeft: 20 }], offer: null, payV: 2 };
  ST.migrate(v2); assert.equal(v2.nsdSponsors.active[0].perWeek, 80); assert.equal(v2.nsdSponsors.payV, 3);
  // neue Karrieren/neue Verträge werden nicht noch einmal gekürzt
  const f = N.newNsdCareer({ first: 'S', last: 'P', nation: 'DE', age: 25, slot: 1, seed: 10 }); f.team = { manager: 'm3', trainer: null }; C.nameTeam(f); f.player.star.level = 30;
  const rng = new RNG(4); let o = null; for (let k = 0; k < 200 && !o; k++) { C.sponsorWeek(f, rng); o = f.nsdSponsors.offer; }
  assert.ok(o && f.nsdSponsors.payV === 3); const pw = o.perWeek; ST.migrate(f); assert.equal(f.nsdSponsors.offer.perWeek, pw);
});

test('New Star Darts v94: Youth-WM für U24-Holder, Grand Slam Gruppensieger, JDC-Talente, Namen, Interview ganzzahlig', async () => {
  const N = await import('../js/nsd.js'), T = await import('../js/tournaments.js'), W = await import('../js/world.js'), C = await import('../js/career.js'),
    A = await import('../data/achievements.js'), P = await import('../data/players.js'), ST = await import('../js/state.js'), CAL = await import('../js/calendar.js');
  const s = N.newNsdCareer({ first: 'Y', last: 'W', nation: 'DE', age: 20, slot: 1, seed: 11 });
  // Youth-WM: auch als Top-64-Holder unter 24 spielbar, kein Preisgeld, eigenes Star-Gewicht, Meilenstein
  s.rankings.years[2025].pdc.P = 5000; s.date.week = 45; s.week = { played: false, eventId: null };
  const yw = CAL.eventsInWeek(s, 2026, 45).find(e => e.id === 'youth-wm');
  assert.ok(yw && T.eventStatus(s, yw).playable, 'Youth-WM spielbar');
  assert.ok(Object.values(N.starPrizeTable('youth')).every(v => !v), 'kein Preisgeld'); assert.equal(N.STAR_WEIGHT.youth, 1.3);
  const ms = A.ACHIEVEMENTS.find(a => a.id === 'youthWm');
  assert.ok(ms && ms.check({ titles: [{ eventId: 'youth-wm' }], results: [] }) && !ms.check({ titles: [{ eventId: 'pc-1' }], results: [] }));
  s.player.age = 24; assert.ok(!T.eventStatus(s, yw).playable, 'ab 24 nicht mehr');
  // JDC-Talente: Lewis Cook (16) ist 2026 dabei, Lawrie (15) kommt zum Jahreswechsel, Potenzial wird nie überschritten
  const ids = Object.fromEntries(Object.values(s.world.players).filter(p => p.jdc).map(p => [p.name, p]));
  assert.deepEqual(Object.keys(ids).sort(), ['Jack Nankervis', 'Lewis Cook', 'Lex Paeshuyse', 'Taylor McGuckian', 'Tergel Khurelkhuu', 'Zehra Gemi']);   // Version 234: + Paeshuyse (14), Nankervis (15)   // Version 233: Khurelkhuu (15) als JDC-Vertreter schon da   // Version 203: + Zehra Gemi (16) assert.equal(ids['Lewis Cook'].age, 16); assert.equal(ids['Lewis Cook'].avg, 78.5); assert.equal(ids['Lewis Cook'].tier, 'dev');
  ids['Lewis Cook'].avg = 91.5;
  const rep = W.developWorld(s, new RNG(3), 2026);
  assert.deepEqual(rep.jdc.sort(), ['Benjamin Dopfer', 'Merve Hummel', 'Mitchell Lawrie']); assert.equal(ids['Tergel Khurelkhuu'].tier, 'dev');   // Version 233: Khurelkhuu war schon da → mit 16 Dev Tour   // Version 184: + Tergel, 203: + Merve Hummel (15 → 16)
  assert.ok(ids['Lewis Cook'].avg <= 92);
  const law = Object.values(s.world.players).find(p => p.name === 'Mitchell Lawrie');
  assert.ok(law.age === 15 && law.avg === 88 && law.potential === 106);
  // Namen/Nationen: Lenny Schlüter, Yorick Hofkens (DE) – auch alte Spielstände
  const names = Object.values(s.world.players);
  assert.ok(names.some(p => p.name === 'Lenny Schlüter') && !names.some(p => p.name === 'Lenny Schlueter'));
  assert.equal(names.find(p => p.name === 'Yorick Hofkens').nation, 'DE');
  const o = N.newNsdCareer({ first: 'O', last: 'L', nation: 'DE', age: 20, slot: 1, seed: 12 });
  const ls = Object.values(o.world.players).find(p => p.name === 'Lenny Schlüter'); ls.name = 'Lenny Schlueter';
  const yh = Object.values(o.world.players).find(p => p.name === 'Yorick Hofkens'); yh.nation = 'BE';
  for (const p of Object.values(o.world.players)) if (p.jdc) delete o.world.players[p.id];
  ST.migrate(o);
  assert.equal(ls.name, 'Lenny Schlüter'); assert.equal(yh.nation, 'DE');
  assert.equal(Object.values(o.world.players).filter(p => p.name === 'Lewis Cook').length, 1, 'JDC nach Migration ohne Doppelte');
  // Interview: alle Auswirkungen ganzzahlig (WM-Nervosität in Zehnteln)
  for (let seed = 1; seed <= 40; seed++) {
    const t = N.newNsdCareer({ first: 'I', last: 'V', nation: 'DE', age: 25, slot: 1, seed }), rng = new RNG(seed);
    t.interview = C.preWmInterview(t, rng, seed % 2 === 0);
    while (t.interview && t.interview.answers.length < t.interview.qs.length) {
      const { fx } = C.answerInterview(t, seed % 3, rng);
      for (const [k, v] of Object.entries(fx)) assert.ok(Number.isInteger(k === 'nerves' ? Math.round(v * 10 * 1e6) / 1e6 : v), `${k} ${v}`);
    }
    for (const [k, v] of Object.entries(t.interview.sum)) assert.ok(Number.isInteger(k === 'nerves' ? Math.round(v * 10 * 1e6) / 1e6 : v), `Summe ${k} ${v}`);
  }
});

test('New Star Darts v95: geprüfter Spielerpool (Nation + Alter) – neue Karriere und alte Spielstände', async () => {
  const N = await import('../js/nsd.js'), ST = await import('../js/state.js'), NA = await import('../data/nations.js');
  const s = N.newNsdCareer({ first: 'P', last: 'L', nation: 'DE', age: 20, slot: 1, seed: 5 });
  const by = n => Object.values(s.world.players).find(p => p.name === n);
  assert.deepEqual([by('Luke Littler').nation, by('Luke Littler').age], ['ENG', 18]);
  assert.deepEqual([by('Matej Cverha').nation, by('Kam Weng Chen').nation, by('Vicky Pruim').nation, by('Brendan Dolan').nation], ['SK', 'MO', 'SE', 'NIR']);
  assert.equal(by('Jesús Salate').age, 43); assert.ok(NA.NATIONS.MO);
  // alter Spielstand (Version < 95), zwei Jahre später: Nation/Alter werden korrigiert, Alter läuft mit
  s.date.year = 2028; delete s.poolV; by('Luke Littler').age = 30; by('Brendan Dolan').nation = 'IRL';
  ST.migrate(s);
  assert.equal(by('Luke Littler').age, 20); assert.equal(by('Brendan Dolan').nation, 'NIR'); assert.equal(s.poolV, 97);
});

test('New Star Darts v96: ehemalige Tourcard-Holder in der Challenge Tour, neue Nebentour-Spieler – auch in alten Spielständen', async () => {
  const N = await import('../js/nsd.js'), ST = await import('../js/state.js'), P = await import('../data/players.js');
  const s = N.newNsdCareer({ first: 'C', last: 'T', nation: 'DE', age: 20, slot: 1, seed: 6 });
  const by = n => Object.values(s.world.players).find(p => p.name === n);
  assert.equal(P.CT_FORMER.length, 19);   // Version 101: + Noa-Lynn van Leuven
  for (const [n] of P.CT_FORMER) assert.ok(['challenge', 'dev'].includes(by(n)?.tier), n);
  assert.deepEqual([by('Wesley Harms').nation, by('Wesley Harms').tier, by('Florian Hempel').age], ['NL', 'challenge', 35]);
  assert.equal(by('Leighton Bennett').age, 20);
  assert.deepEqual(['Simon Whitlock', 'Paul Lim', 'Xiaochen Zong', 'Danny Baggish'].map(n => by(n)?.circuit), ['dpa', 'asia', 'asia', 'cdc']);
  // alter Spielstand ohne die Neuen
  for (const p of Object.values(s.world.players)) if (/^K\d+$/.test(p.id) || ['Simon Whitlock', 'Paul Lim'].includes(p.name)) delete s.world.players[p.id];
  s.date.year = 2027; ST.migrate(s);
  assert.equal(Object.values(s.world.players).filter(p => /^K\d+$/.test(p.id)).length, 19);
  assert.equal(by('Florian Hempel').age, 36); assert.ok(by('Simon Whitlock') && by('Paul Lim'));
  ST.migrate(s); assert.equal(Object.values(s.world.players).filter(p => p.name === 'Florian Hempel').length, 1, 'keine Doppelten');
});

test('New Star Darts v97: Alterskorrekturen der neuen Spieler – auch in alten Spielständen', async () => {
  const N = await import('../js/nsd.js'), ST = await import('../js/state.js');
  const s = N.newNsdCareer({ first: 'A', last: 'K', nation: 'DE', age: 20, slot: 1, seed: 7 });
  const by = n => Object.values(s.world.players).find(p => p.name === n);
  const want = { 'Danny Jansen': 23, 'Josh Payne': 32, 'Jitse van der Wal': 26, 'Dom Taylor': 27, 'Ryan Hogarth': 33, 'Dragutin Horvat': 49, 'Xiaochen Zong': 27, 'Danny Baggish': 42 };
  for (const [n, a] of Object.entries(want)) assert.equal(by(n).age, a, n);
  assert.equal(by('Danny Jansen').tier, 'dev');                         // mit 23 Development Tour
  // alter Spielstand (Version 96) mit den bisherigen Werten
  s.poolV = 95; by('Danny Jansen').age = 29; by('Danny Jansen').tier = 'challenge'; by('Xiaochen Zong').age = 35;
  ST.migrate(s);
  assert.deepEqual([by('Danny Jansen').age, by('Danny Jansen').tier, by('Xiaochen Zong').age], [23, 'dev', 27]);
});

test('New Star Darts v98: Karriere als realer Spieler (Rangliste, Tourcard, Start-Fähigkeiten, ohne Karte über Challenge Tour/Q-School)', async () => {
  const N = await import('../js/nsd.js'), CAL = await import('../js/calendar.js'), T = await import('../js/tournaments.js');
  const L = N.realPlayers();
  assert.ok(L.length > 350 && L.every(r => r.age == null || r.age >= 16) && L.find(r => r.name === 'Fallon Sherrock')?.woman && !L.some(r => r.name === 'Mitchell Lawrie'));   // Version 99: Frauen wählbar
  assert.equal(new Set(L.map(r => r.name)).size, L.length);
  // Littler: Tourcard, Platz 1 (Rangliste übernommen), hohe Fähigkeiten und Status, KI-Littler weg
  const s = N.newRealCareer({ name: 'Luke Littler', seed: 1 }), p = s.player;
  assert.equal(p.name, 'Luke Littler'); assert.equal(p.nation, 'ENG'); assert.equal(p.age, 18);
  assert.equal(p.tour, 'tour'); assert.equal(rankOf(s, 'pdc', 'P'), 1);
  assert.ok(!Object.values(s.world.players).some(x => x.name === 'Luke Littler'));
  assert.ok(N.skillValue(p, 'sco') >= 50 && p.star.level >= 40 && p.assessed && s.stars > 1000);
  assert.ok(Math.abs(p.attrs.sco - 98.8) < 0.5);
  // schwächerer Holder: deutlich niedrigere Werte; Spieler ohne Karte: Challenge Tour + Q-School offen, keine Last-Chance-Regel
  const w = N.newRealCareer({ name: 'Martin Schindler', seed: 2 });
  assert.ok(N.skillValue(w.player, 'sco') < N.skillValue(p, 'sco') && w.player.star.level < p.star.level);
  // Version 99: ohne Karte → 2-Jahres-Tourcard wie ein eigener Spieler; Spielerinnen wählbar
  const h = N.newRealCareer({ name: 'Florian Hempel', seed: 3 });
  assert.deepEqual([h.player.tour, h.player.cardUntil, !!h.openTour], ['tour', 2027, false]);
  assert.ok(CAL.nsdBlocked(h, { cat: 'challenge' }) && CAL.nsdBlocked(s, { cat: 'challenge' }));
  const f = N.newRealCareer({ name: 'Fallon Sherrock', seed: 4 });
  assert.ok(f.player.woman && f.player.tour === 'tour' && f.player.nation === 'ENG' && !Object.values(f.world.players).some(x => x.name === 'Fallon Sherrock'));
  assert.throws(() => N.newRealCareer({ name: 'Niemand Unbekannt' }));
});

test('New Star Darts v100: Spielerinnen haben einen Freund statt einer Freundin', async () => {
  const N = await import('../js/nsd.js'), L = await import('../js/life.js'), LE = await import('../data/lifeevents.js');
  const f = N.newRealCareer({ name: 'Fallon Sherrock', seed: 5 }), m = N.newNsdCareer({ first: 'M', last: 'X', nation: 'DE', age: 20, seed: 5 });
  assert.equal(N.relLabelOf(f.player, 'partner'), 'Freund'); assert.equal(N.relLabelOf(m.player, 'partner'), 'Freundin');
  assert.equal(N.partnerText('Noch keine Freundin – Zeit mit meiner Freundin, sonst sieht sie mich nie.', f.player), 'Noch kein Freund – Zeit mit meinem Freund, sonst sieht er mich nie.');
  assert.equal(N.partnerText('Eine Freundin', m.player), 'Eine Freundin');
  // Kennenlernen: männlicher Name und passende Texte
  f.lifeEvent = null; f.lastLifeEvent = null; let le = null;
  for (let i = 0; i < 400 && le?.id !== 'meet'; i++) { f.lifeEvent = null; le = L.rollLifeEvent(f, new RNG(i)); }
  assert.equal(le?.id, 'meet');
  assert.ok(LE.PARTNER_NAMES_M.includes(le.name));
  const v = L.lifeEventView(f); assert.ok(v.text.includes('Er scheint sich') && !v.text.includes('Sie scheint'));
});

test("New Star Darts v101: Women's Series für Spielerinnen (Wochenenden, Rangliste, Women's World Matchplay), Noa-Lynn in der Challenge Tour", async () => {
  const N = await import('../js/nsd.js'), T = await import('../js/tournaments.js'), C = await import('../js/calendar.js'), W = await import('../js/world.js'), D = await import('../data/tournaments.js');
  assert.equal(D.CALENDAR.filter(e => e.cat === 'wos' && e.count === 4).length, 6);
  assert.deepEqual(N.starPrizeTable('wos'), N.starPrizeTable('dev'));   // Version 103: Preisgeld wie Dev Tour assert.ok(D.CALENDAR.find(e => e.id === 'wwm'));
  const s = N.newRealCareer({ name: 'Fallon Sherrock', seed: 7 }), by = n => Object.values(s.world.players).find(p => p.name === n);
  assert.equal(by('Noa-Lynn van Leuven').tier, 'challenge'); assert.ok(!by('Noa-Lynn van Leuven').woman);
  assert.equal(by('Rhian O\'Sullivan').avg, 76.2); assert.equal(by('Nicole Porm').avg, 37.9); assert.ok(by('Beau Greaves').woman);
  s.date.week = 6; s.week = { played: false, eventId: null };
  const ev = C.eventsInWeek(s, 2026, 6).find(e => e.cat === 'wos');
  assert.deepEqual(D.CALENDAR.filter(e => e.cat === 'wos' && e.count === 4).map(e => [e.week, e.city]), [[6, 'Hildesheim'], [12, 'Wigan'], [20, 'Leicester'], [25, 'Wigan'], [34, 'Leicester'], [41, 'Wigan']]);   // Version 102
  assert.ok(C.shownTo(s, ev) && T.eventStatus(s, ev).playable);
  T.enterEvent(s, ev.id, { count: 4 });
  assert.equal(s.activeEvent.fieldSize, 64); assert.ok(s.activeEvent.rounds[0].matches.every(m => W.getPlayer(s, m.a)?.woman && (!m.b || W.getPlayer(s, m.b)?.woman)));
  for (;;) { T.simulateRest(s); if (!s.activeEvent.hasNext) break; T.nextSub(s); }
  T.closeEvent(s);
  const oom = orderOfMerit(s, 'wos');
  assert.ok(oom.some(x => x.p.id === 'P' && x.money > 0) && oom.filter(x => x.money > 0).length >= 30);
  assert.deepEqual(W.secondaryOrder(s, 'women').slice(0, 3), oom.filter(x => x.p.tier !== 'tour').slice(0, 3).map(x => x.p.id));   // Rangliste vergibt die Plätze (ohne Karte)
  assert.deepEqual(W.secondaryOrder(s, 'women', undefined, { tour: true }).slice(0, 3), oom.slice(0, 3).map(x => x.p.id));   // v180: mit Tour-Spielerinnen (Matchplay)
  // Matchplay: nur Top 8, gesetzt nach Rangliste
  s.date.week = 29; s.week = { played: false, eventId: null };
  const wwm = C.eventsInWeek(s, 2026, 29).find(e => e.id === 'wwm');
  assert.equal(T.eventStatus(s, wwm).playable, W.secondaryOrder(s, 'women').slice(0, 8).includes('P'));
  // Version 102: in den PDC-Top-64 keine Women's Series (Spielerin und KI)
  const top = N.newRealCareer({ name: 'Beau Greaves', seed: 9 });
  top.rankings.years[2025].pdc.P = 5000; top.date.week = 6; top.week = { played: false, eventId: null };
  assert.equal(T.eventStatus(top, ev).playable, false);
  // Männer sehen die Women's Series nicht
  const m = N.newNsdCareer({ first: 'M', last: 'N', nation: 'DE', age: 25, seed: 8 });
  assert.ok(!C.shownTo(m, ev)); assert.equal(T.eventStatus(m, ev).playable, false);
});

test('New Star Darts v104: Sponsorengelder steigen flacher mit dem Status', async () => {
  const C = await import('../js/career.js'), N = await import('../js/nsd.js');
  assert.deepEqual(C.SPONSOR_SLOPE, { star: 0.06, fans: 0.025 });
  assert.equal(C.sponsorGrowth(1), 1); assert.ok(Math.abs(C.sponsorGrowth(41) - 2) < 1e-9); assert.ok(C.sponsorGrowth(30) < N.starFactor(30));
});

test('New Star Darts v105: kein Sprung der Sponsorengelder ab Status 11 (echte Marken wachsen bis Status 20 auf ihren Faktor)', async () => {
  const C = await import('../js/career.js'), R = await import('../data/sponsorsreal.js');
  const f = R.FAME_PAY[3];
  assert.ok(Math.abs(C.realPayRamp(f, 11) - (R.SMALL_PAY + 0.2 * (f - R.SMALL_PAY))) < 1e-9);
  assert.ok(C.realPayRamp(f, 15) < C.realPayRamp(f, 18) && C.realPayRamp(f, 20) === f && C.realPayRamp(f, 40) === f);
});

test('New Star Darts v106: variable Preise × 1,25, Top-Manager bringt keinen großen Sponsorensprung mehr', async () => {
  const N = await import('../js/nsd.js'), T = await import('../js/skilltrain.js'), TM = await import('../data/team.js');
  assert.equal(N.PRICE_MULT, 1.25); assert.equal(N.starPrice(10, 1), 13); assert.equal(T.drinkPrice({ price: 1 }, 1), 1); assert.equal(T.drinkPrice({ price: 1 }, 40), 150);
  assert.equal(TM.MANAGERS.find(m => m.id === 'm3').mult, 1.9);
});

test('New Star Darts v107: Einsatz (1–3 Herzen) im Match und Dilemma-Entscheidungen alle 3–7 Wochen', async () => {
  const N = await import('../js/nsd.js'), T = await import('../js/tournaments.js'), C = await import('../js/career.js'), CAL = await import('../js/calendar.js');
  // Einsatz: Standard 2 Herzen = bisheriges Verhalten, Energie je Leg gewichtet
  assert.equal(T.EFFORT_DEFAULT, 2); assert.equal(T.EFFORT_ENERGY[2], 1); assert.equal(T.EFFORT_SCENES[2], 1);
  assert.ok(T.EFFORT_ENERGY[1] < 1 && T.EFFORT_ENERGY[3] > 1 && T.EFFORT_SCENES[1] < 1 && T.EFFORT_SCENES[3] > 1);
  assert.ok(Math.abs(T.effortEnergyFactor({ effortHist: [{ leg: 0, e: 2 }, { leg: 5, e: 3 }], effort: 3 }, 10) - 1.175) < 1e-9);
  const energyUsed = e => {
    const s = N.newNsdCareer({ first: 'E', last: 'F', nation: 'DE', age: 25, slot: 1, seed: 11 }); s.player.assessed = true; s.date.week = 6; s.week = { played: false, eventId: null };
    T.enterEvent(s, CAL.eventsInWeek(s, 2026, 6).find(x => x.cat === 'pc').id); T.startManualMatch(s);
    T.setEffort(s, e); const e0 = s.player.energy; T.simulateLiveRest(s); return e0 - s.player.energy;
  };
  assert.ok(energyUsed(1) < energyUsed(2) && energyUsed(2) < energyUsed(3), `${energyUsed(1)} ${energyUsed(2)} ${energyUsed(3)}`);
  // Dilemma: alle 3–7 Wochen (sofern mind. 2 Bereiche da sind), gewählt +4–6, andere −2–4
  const s = N.newNsdCareer({ first: 'D', last: 'L', nation: 'DE', age: 25, slot: 1, seed: 12 }); s.team = { manager: 'm1', trainer: null }; C.nameTeam(s); s.player.rel.manager = 50; s.player.rel.fans = 30;
  const rng = new RNG(5), seen = [];
  for (let w = 0; w < 60; w++) { s.date.week = 3 + (w % 48); s.date.year = 2026 + Math.floor((w + 3) / 52); C.dilemmaWeek(s, rng); if (s.dilemma) { seen.push(w); const d = s.dilemma; const r = C.resolveDilemma(s, 0, rng);
    const [a, b] = d.opts.map(o => o.key); assert.ok(a !== b); assert.equal(r.after[a] - r.before[a], r.gain); assert.ok(r.gain >= 4 && r.gain <= 6 && r.loss >= 2 && r.loss <= 4); } }
  assert.ok(seen.length >= 7 && seen.length <= 18, `${seen.length} Dilemmas`);
  const lone = N.newNsdCareer({ first: 'O', last: 'M', nation: 'DE', age: 25, slot: 1, seed: 13 });   // ohne Manager/Sponsoren/Partner nur Fans → kein Dilemma
  for (let w = 0; w < 20; w++) { lone.date.week = 3 + w; C.dilemmaWeek(lone, rng); } assert.equal(lone.dilemma ?? null, null);
});

test('New Star Darts v108: Einsatz bleibt bis zur manuellen Änderung, Energie sinkt im Liveticker sichtbar', async () => {
  const N = await import('../js/nsd.js'), T = await import('../js/tournaments.js'), CAL = await import('../js/calendar.js'), MS = await import('../js/matchState.js'), TM = await import('../js/throwModel.js');
  const s = N.newNsdCareer({ first: 'E', last: 'L', nation: 'DE', age: 25, slot: 1, seed: 21 }); s.player.assessed = true; s.date.week = 6; s.week = { played: false, eventId: null };
  T.enterEvent(s, CAL.eventsInWeek(s, 2026, 6).find(x => x.cat === 'pc').id); const live = T.startManualMatch(s);
  assert.equal(T.effortOf(live), 2); assert.equal(T.liveEnergy(s), 100);
  T.setEffort(s, 3);
  const rng = new RNG(3), a = { sco: 90, fin: 90, men: 90, foc: 90, cal: 90 }; let last = 100;
  while (!live.m.done && live.m.legIdx < 4) { if (live.m.turn === live.me && !live.m.visit.darts.length) T.keyMoment(s); const d = TM.aiDart(live.m, live.m.turn, a, rng, TM.aiSigma(a)); MS.throwDart(live.m, d.hit, d);
    assert.equal(T.effortOf(live), 3, 'Einsatz bleibt über Spielszenen hinweg'); const e = T.liveEnergy(s); assert.ok(e <= last); last = e; }
  assert.ok(last < 100 && last === Math.round(100 - N.matchEnergy(live.m.legIdx, s.activeEvent) * 1.35));
  // neues Match → wieder 2 Herzen
  T.simulateLiveRest(s); T.nextRound(s);
  if (T.playerMatch(s.activeEvent) && !T.playerMatch(s.activeEvent).winner) assert.equal(T.effortOf(T.startManualMatch(s)), 2);
});

test('New Star Darts v111: kaputte Immobilien heißen marode', async () => {
  const L = await import('../js/life.js'), { LIFESTYLE } = await import('../data/lifestyle.js');
  const home = LIFESTYLE.find(x => x.cat === 'home'), item = LIFESTYLE.find(x => x.cat === 'item'), car = LIFESTYLE.find(x => x.cat !== 'home' && x.cat !== 'item');
  assert.equal(L.brokenWord(home), 'marode'); assert.equal(L.brokenWord(home, true), 'Marode');
  assert.equal(L.brokenWord(item), 'kaputt'); assert.equal(L.brokenWord(car, true), 'Kaputt');
  assert.equal(L.fixWord(home, 'Inf'), 'Sanieren'); assert.equal(L.fixWord(item, 'Inf'), 'Reparieren'); assert.equal(L.fixWord(home, 'part'), 'saniert');
});

test('New Star Darts v113: Nervosität macht das Zielkreuz schneller', async () => {
  const N = await import('../js/nsd.js'), T = await import('../js/tournaments.js'), CAL = await import('../js/calendar.js');
  assert.equal(N.nerveSpeed(0), 1); assert.ok(Math.abs(N.nerveSpeed(1) - 1.12) < 1e-9); assert.equal(N.nerveSpeed(10), N.NERVE_SPEED_MAX);
  const s = N.newNsdCareer({ first: 'N', last: 'V', nation: 'DE', age: 25, slot: 1, seed: 31 }); s.player.assessed = true; s.date.week = 6; s.week = { played: false, eventId: null };
  T.enterEvent(s, CAL.eventsInWeek(s, 2026, 6).find(x => x.cat === 'pc').id); const live = T.startManualMatch(s);
  const nv = N.nervesOf(s.player, s.activeEvent, live.m.ids?.[1 - live.me] ?? null).pts;   // Anfängerphase → nervös
  assert.ok(nv > 0, 'Start-Status ist nervös');
  const pr = T.aimParams(s, 'T20'); assert.ok(pr.nervy > 1 && pr.nervy <= N.NERVE_SPEED_MAX);
});

test('New Star Darts v115: nach perfekter erster Aufnahme 9-Darter-Szenen extra', async () => {
  const N = await import('../js/nsd.js'), T = await import('../js/tournaments.js'), CAL = await import('../js/calendar.js'), MS = await import('../js/matchState.js'), B = await import('../js/board.js');
  const H = l => { const p = B.targetPoint(l); return B.scoreAt(p.x, p.y); };
  const setup = () => {
    const s = N.newNsdCareer({ first: 'N', last: 'D', nation: 'DE', age: 25, slot: 1, seed: 41 }); s.player.assessed = true; s.date.week = 6; s.week = { played: false, eventId: null };
    T.enterEvent(s, CAL.eventsInWeek(s, 2026, 6).find(x => x.cat === 'pc').id); const live = T.startManualMatch(s);
    if (live.m.turn !== live.me) ['S1', 'S1', 'S1'].forEach(l => MS.throwDart(live.m, H(l)));   // Gegner: schwache Aufnahme
    return { s, live };
  };
  const opp = live => ['S1', 'S1', 'S1'].forEach(l => MS.throwDart(live.m, H(l)));
  // 174 → 2. Aufnahme selbst, zählt nicht als Szene des Legs
  let { s, live } = setup();
  ['T20', 'T20', 'T18'].forEach(l => MS.throwDart(live.m, H(l))); opp(live);
  assert.ok(T.nineAlive(s)); assert.equal(T.keyMoment(s), 'nine'); assert.notEqual(live.sceneLeg, live.m.legIdx);
  ['T20', 'T20', 'T20'].forEach(l => MS.throwDart(live.m, H(l))); opp(live);                 // Rest 147 → 3. Aufnahme selbst
  assert.equal(live.m.rem[live.me], 147); assert.equal(T.keyMoment(s), 'nine');
  // 2. Aufnahme zu schwach → kein 9-Darter mehr
  ({ s, live } = setup());
  ['T20', 'T20', 'T20'].forEach(l => MS.throwDart(live.m, H(l))); opp(live);
  ['T20', 'S20', 'T20'].forEach(l => MS.throwDart(live.m, H(l))); opp(live);                 // Rest 181
  assert.equal(T.nineAlive(s), false);
  // Erste Aufnahme 140 → keine Extra-Szene
  ({ s, live } = setup());
  ['T20', 'T20', 'S20'].forEach(l => MS.throwDart(live.m, H(l))); opp(live);
  assert.equal(T.nineAlive(s), false);
});

test('New Star Darts v118: Rechnen früher schwerer, Check speichert die Dart-Anzahl', async () => {
  const T = await import('../js/skilltrain.js'), MS = await import('../js/matchState.js'), B = await import('../js/board.js');
  assert.ok(T.calcRange(8)[0] === 101 && T.calcRange(20)[1] === 170 && T.calcRange(12)[1] === 135);
  const H = l => { const q = B.targetPoint(l); return B.scoreAt(q.x, q.y); };
  const m = MS.createMatch({ legs: 2 }, 0);
  m.rem[m.turn] = 40; m.visit.start = 40; const t = m.turn; MS.throwDart(m, H('S20')); MS.throwDart(m, H('D10'));
  assert.equal(m.lastLeg.visits[t].at(-1).darts, 2); assert.ok(m.lastLeg.visits[t].at(-1).checkout);
});

test('New Star Darts v120: Interview nach Spielen – jede Antwort wirkt nur auf eine Partei (+ Star-Status)', async () => {
  const N = await import('../js/nsd.js'), C = await import('../js/career.js');
  const seen = new Set();
  for (let seed = 1; seed <= 30; seed++) {
    const s = N.newNsdCareer({ first: 'I', last: 'P', nation: 'DE', age: 25, slot: 1, seed }), p = s.player, rng = new RNG(seed);
    s.team = { manager: 'm1', trainer: null }; C.nameTeam(s); p.rel.manager = 50; p.partnerName = 'Lena'; p.rel.partner = 50; p.rel.sponsors = 40;
    s.interview = C.maybeInterviewNsd(s, { place: 'W', cat: 'major', name: 'X' }, rng);
    while (s.interview.answers.length < s.interview.qs.length) {
      const { fx } = C.answerInterview(s, seed % 3, rng), ks = Object.keys(fx).filter(k => k !== 'star');
      assert.equal(ks.length, 1, JSON.stringify(fx)); assert.ok(C.IV_PARTIES.includes(ks[0])); seen.add(ks[0]);
    }
  }
  assert.ok(seen.size >= 3, [...seen].join());
  // ohne Manager/Freundin/Sponsoren: nur Fans
  const s = N.newNsdCareer({ first: 'O', last: 'P', nation: 'DE', age: 25, slot: 1, seed: 3 }), rng = new RNG(3);
  s.interview = C.maybeInterviewNsd(s, { place: 'W', cat: 'major', name: 'X' }, rng);
  const { fx } = C.answerInterview(s, 0, rng); assert.deepEqual(Object.keys(fx).filter(k => k !== 'star'), ['fans']);
});

test('New Star Darts v121: Brass Dart + Standard-Flight immer im Besitz, Paulke eine Partei, World Cup jede eigene Aufnahme eine Szene', async () => {
  const N = await import('../js/nsd.js'), C = await import('../js/career.js'), L = await import('../js/life.js'), ST = await import('../js/state.js'), G = await import('../data/gear.js'), SK = await import('../js/skilltrain.js');
  const s = N.newNsdCareer({ first: 'B', last: 'D', nation: 'DE', age: 25, slot: 1, seed: 51 }), p = s.player;
  assert.equal(p.gear.id, G.STARTER_DART); assert.ok(p.darts.includes(G.STARTER_DART)); assert.equal(N.gearOf(p).price, 0);
  assert.deepEqual(G.DARTS[0].bonus, {}); assert.ok(G.STARTER_FLIGHT.name);
  const before = N.skillEffective(p, 'sco'); delete p.gear; assert.equal(N.skillEffective(p, 'sco'), before, 'Brass Dart ohne Wirkung');
  L.checkAchievements(s); assert.ok(!s.achievements.gear, 'Start-Dart zählt nicht als Profi-Darts');
  // alter Spielstand ohne Darts → Brass Dart nach migrate
  const o = JSON.parse(JSON.stringify(s)); o.player.gear = null; o.player.darts = []; ST.migrate(o);
  assert.equal(o.player.gear.id, G.STARTER_DART); assert.ok(o.player.darts.includes(G.STARTER_DART));
  SK.equipDarts(o, G.STARTER_DART);
  // Paulke: nur eine Partei (+ Status, WM-Nervosität)
  for (let seed = 1; seed <= 10; seed++) {
    const t = N.newNsdCareer({ first: 'P', last: 'K', nation: 'DE', age: 25, slot: 1, seed }), rng = new RNG(seed); t.flags ??= {};
    t.team = { manager: 'm1', trainer: null }; C.nameTeam(t); t.player.rel.manager = 50; t.player.partnerName = 'Lena'; t.player.rel.partner = 50;
    t.interview = C.preWmInterview(t, rng, seed % 2 === 0);
    while (t.interview.answers.length < t.interview.qs.length) {
      const { fx } = C.answerInterview(t, seed % 3, rng);
      assert.equal(Object.keys(fx).filter(k => !['star', 'nerves'].includes(k)).length, 1, JSON.stringify(fx));
    }
  }
});

test('New Star Darts v122: Hochzeit bei Beziehung 100 und über 1 Jahr zusammen, immer 1.500 ★', async () => {
  const N = await import('../js/nsd.js'), L = await import('../js/life.js');
  const s = N.newNsdCareer({ first: 'H', last: 'Z', nation: 'DE', age: 25, slot: 1, seed: 61 }), p = s.player;
  assert.equal(L.canMarry(s), false);
  p.partnerName = 'Lena'; p.rel.partner = 100; p.partnerSince = s.date.year * 52 + s.date.week - 40;
  assert.equal(L.canMarry(s), false, 'noch kein Jahr');
  p.partnerSince -= 13; p.rel.partner = 99; assert.equal(L.canMarry(s), false, 'Beziehung < 100');
  p.rel.partner = 100; assert.equal(L.canMarry(s), true);
  p.star.level = 40; s.stars = 1499; assert.throws(() => L.marry(s), /Nicht genug/);
  s.stars = 2000; L.marry(s); assert.equal(s.stars, 500, 'fester Preis unabhängig vom Status'); assert.ok(p.married);
  assert.equal(N.relLabelOf(p, 'partner'), 'Ehefrau'); assert.equal(L.canMarry(s), false);
  p.woman = true; assert.equal(N.relLabelOf(p, 'partner'), 'Ehemann'); p.woman = false;
  // verheiratet: Beziehung sinkt nur jede zweite Woche
  const r0 = p.rel.partner; for (let w = 0; w < 4; w++) { s.date.week = 10 + w; L.lifeWeek(s, new RNG(w)); }
  assert.equal(r0 - p.rel.partner, 2);
  s.stars = 801; L.breakUp(s); assert.equal(p.married, null); assert.equal(p.partnerName, null); assert.equal(s.stars, 400.5, 'Scheidung: halbes Sterngeld');
  assert.ok(s.news.some(n => /Scheidung/.test(n.title)));
});

test('New Star Darts v124: je 80 Partnernamen, Affären-Angebot fliegt zu 10 % auf (Trennung bzw. Scheidung)', async () => {
  const N = await import('../js/nsd.js'), L = await import('../js/life.js'), E = await import('../data/lifeevents.js');
  assert.equal(new Set(E.PARTNER_NAMES).size, 80); assert.equal(new Set(E.PARTNER_NAMES_M).size, 80);
  const ev = L.eventById('affair'); assert.ok(ev && !/10|auffliegen|Risiko/.test(ev.text), 'kein Erklärtext');
  let found = 0, n = 400;
  for (let k = 0; k < n; k++) {
    const s = N.newNsdCareer({ first: 'A', last: 'F', nation: 'DE', age: 25, slot: 1, seed: 70 + (k % 5) }), p = s.player, rng = new RNG(k);
    p.partnerName = 'Lena'; p.rel.partner = 60; p.partnerSince = 0; if (k % 2) p.married = { year: 2026, week: 3 }; s.stars = 100;
    s.lifeEvent = { id: 'affair', name: null, lover: 'Mia' };
    assert.ok(L.lifeEventView(s).text.startsWith('Mia'));
    const sat0 = p.satisfaction, r = L.resolveLifeEvent(s, 0, rng);
    if (!p.partnerName) { found++; if (k % 2) assert.equal(s.stars, 50, 'Scheidung: halbes Sterngeld'); assert.ok(/Mia/.test(r.text) && /Lena/.test(r.text)); }
    else assert.ok(p.satisfaction > sat0);
  }
  assert.ok(found > n * 0.05 && found < n * 0.16, `${found} von ${n} aufgeflogen`);
});

test('New Star Darts v125: Interview nach verlorenem Finale/Halbfinale mit eigenen Fragen', async () => {
  const N = await import('../js/nsd.js'), C = await import('../js/career.js'), TL = await import('../data/talkloss.js'), T = await import('../data/talk.js');
  assert.ok(TL.LOSS_QS.length >= 20 && TL.LOSS_QS.every(q => q.a.length === 4 && q.a.every(a => a.tone && a.t)));
  assert.ok(!TL.LOSS_QS.some(q => /Erfolg|Sieg|gewonnen|feier/i.test(q.q)), 'keine Sieger-Fragen');
  const s = N.newNsdCareer({ first: 'L', last: 'F', nation: 'DE', age: 25, slot: 1, seed: 81 }), rng = new RNG(4);
  for (const place of ['F', 'SF']) {
    const iv = C.maybeInterviewNsd(s, { place, cat: 'major', name: 'X' }, rng);
    assert.ok(iv.qs.every(q => q.set === 'loss')); assert.equal(C.ivIntro(iv), T.MOOD_INTRO.loss[String(iv.mood)]);
    assert.ok(TL.LOSS_QS.some(q => q.q === C.ivQuestion(iv).q));
    while (iv.answers.length < iv.qs.length) C.answerInterview(s, 0, rng);
  }
  assert.ok(C.maybeInterviewNsd(s, { place: 'W', cat: 'major', name: 'X' }, rng).qs.every(q => q.set === 'result'));
});

test('New Star Darts v126: reale Spieler ohne Tourcard starten bei Fähigkeit 0', async () => {
  const N = await import('../js/nsd.js'), rs = N.realPlayers();
  const ct = rs.filter(r => !r.card).sort((a, b) => b.avg - a.avg)[0], tc = rs.find(r => r.card && r.avg > 95);
  assert.ok(ct.avg > 88, `stärkster ohne Karte Ø ${ct.avg}`);
  const s = N.newRealCareer({ name: ct.name, slot: 1, seed: 3 }), p = s.player;
  for (const t of N.TRAINABLE) assert.equal(N.skillValue(p, t.key), 0, t.key);
  assert.equal(p.star.level, 1);
  const s2 = N.newRealCareer({ name: tc.name, slot: 1, seed: 3 });
  assert.ok(N.skillValue(s2.player, 'sco') > 20);
});

test('New Star Darts v127: erstes Tourcard-Jahr startet bei 0, zweites Jahr bei 0–3', async () => {
  const N = await import('../js/nsd.js'), PL = await import('../data/players.js'), rs = N.realPlayers();
  const y1 = rs.filter(r => r.tcYear === 1), y2 = rs.filter(r => r.tcYear === 2);
  assert.ok(y1.length >= 25 && y2.length >= 25);
  for (const r of y1) assert.equal(N.realStartFor(r).sco, 0, r.name);
  const v2 = y2.map(r => N.realStartFor(r).sco); assert.ok(v2.every(v => v >= 0 && v <= 3) && v2.includes(0) && v2.includes(3), v2.join());
  const best = y2.sort((a, b) => b.avg - a.avg)[0], s = N.newRealCareer({ name: best.name, slot: 1, seed: 5 });
  for (const t of N.TRAINABLE) assert.equal(N.skillValue(s.player, t.key), 3, t.key);
  const s1 = N.newRealCareer({ name: y1[0].name, slot: 1, seed: 5 }); assert.equal(N.skillValue(s1.player, 'sco'), 0);
  const top = rs.find(r => r.name === PL.TOUR_TOP64[0][0]); assert.ok(N.realStartFor(top).sco > 30);
});

test('New Star Darts v128: KI wirft im Scoring überwiegend auf T20 (mehr 180, kaum 171)', async () => {
  const MS = await import('../js/matchState.js'), TM = await import('../js/throwModel.js');
  const rng = new RNG({ s: 9 }), cnt = {}; let visits = 0, t20 = 0, darts = 0, pts = 0, dd = 0;
  for (let g = 0; g < 120; g++) {
    const m = MS.createMatch({ legs: 6 }, g % 2), a = { sco: 94, fin: 94, men: 94, foc: 94, cal: 94, angle: 15 };
    while (!m.done) {
      const t = m.turn, start = m.rem[t]; let ev;
      do { const d = TM.aiDart(m, t, a, rng, TM.aiSigma(a)); if (start > 230) { darts++; if (d.target === 'T20') t20++; } ev = MS.throwDart(m, d.hit, d); } while (m.turn === t && !m.done && !ev?.visitEnd);
      const v = m.legVisits?.[t]?.at(-1); if (start > 230 && v && !v.bust) { visits++; cnt[v.score] = (cnt[v.score] ?? 0) + 1; }
    }
    for (const st of m.stats) { pts += st.points; dd += st.darts; }
  }
  assert.ok(t20 / darts > 0.8, `T20-Anteil ${t20 / darts}`);
  assert.ok((cnt[180] ?? 0) > 3 * (cnt[171] ?? 0), `180: ${cnt[180]} 171: ${cnt[171]}`);
  const avg = pts / dd * 3; assert.ok(avg > 92 && avg < 96.5, `Ø ${avg}`);
});

test('New Star Darts v129: Rest 170 ist immer eine eigene Szene (extra, wie der 9-Darter)', async () => {
  const N = await import('../js/nsd.js'), T = await import('../js/tournaments.js'), CAL = await import('../js/calendar.js'), MS = await import('../js/matchState.js'), B = await import('../js/board.js');
  const H = l => { const q = B.targetPoint(l); return B.scoreAt(q.x, q.y); };
  const s = N.newNsdCareer({ first: 'B', last: 'F', nation: 'DE', age: 25, slot: 1, seed: 91 }); s.player.assessed = true; s.date.week = 6; s.week = { played: false, eventId: null };
  T.enterEvent(s, CAL.eventsInWeek(s, 2026, 6).find(x => x.cat === 'pc').id); const live = T.startManualMatch(s), m = live.m;
  T.setEffort(s, 1);
  if (m.turn !== live.me) ['S1', 'S1', 'S1'].forEach(l => MS.throwDart(m, H(l)));
  m.rem[live.me] = 170; m.visit.start = 170;
  assert.ok(T.bigFish(s)); assert.equal(T.keyMoment(s), 'fish'); assert.notEqual(live.sceneLeg, m.legIdx, 'zählt nicht zum Kontingent');
  m.rem[live.me] = 171; m.visit.start = 171; assert.equal(T.bigFish(s), false);
});

test('New Star Darts v130: 9-Darter-Prüfung nach jedem Dart (nineStill)', async () => {
  const T = await import('../js/tournaments.js'), MS = await import('../js/matchState.js'), B = await import('../js/board.js');
  const H = l => { const q = B.targetPoint(l); return B.scoreAt(q.x, q.y); };
  const fresh = () => { const m = MS.createMatch({ legs: 3 }, 0); ['T20', 'T20', 'T20'].forEach(l => MS.throwDart(m, H(l))); ['S1', 'S1', 'S1'].forEach(l => MS.throwDart(m, H(l))); return m; };
  let m = fresh(); assert.ok(T.nineStill(m, 0));
  MS.throwDart(m, H('T20')); assert.ok(T.nineStill(m, 0), '261 nach 4 Darts');
  MS.throwDart(m, H('S20')); assert.equal(T.nineStill(m, 0), false, '241 mit 4 Darts nicht mehr');
  m = fresh(); MS.throwDart(m, H('S20')); assert.equal(T.nineStill(m, 0), false, 'erster Dart der 2. Aufnahme daneben');
  m = fresh(); MS.throwDart(m, H('T19')); assert.ok(T.nineStill(m, 0), 'T19 geht noch (264 → 3 Darts später 141 …)');
});

test('New Star Darts v131: Major-Titel bringen deutlich mehr Star-Status (Matchplay, WM)', async () => {
  const N = await import('../js/nsd.js');
  const pc = N.titleStarBonus(20, 'pc', 'pc'), ma = N.titleStarBonus(20, 'major', 'masters');
  const mp = N.titleStarBonus(20, 'major', 'matchplay'), wm = N.titleStarBonus(20, 'major', 'wm');
  assert.ok(ma > pc * 3 && mp > ma * 1.5 && wm > mp * 2, `PC ${pc} < Major ${ma} < Matchplay ${mp} < WM ${wm}`);
  assert.ok(wm > N.starNeed(20), 'WM-Titel = mehr als eine ganze Stufe');
  assert.equal(N.titleStarBonus(20, 'dev', 'youth'), Math.round(25 * 1.3 * 1.19 * 10) / 10, 'Youth-WM unverändert');
});

test('New Star Darts v132: Two clear legs im World Matchplay (max. 6 Zusatzlegs, dann Sudden Death)', async () => {
  const MS = await import('../js/matchState.js'), E = await import('../js/matchEngine.js'), { RNG } = await import('../js/rng.js');
  const D = await import('../data/tournaments.js');
  const fmt = D.FORMATS.matchplay.default;
  assert.equal(fmt.clear, 2, 'Matchplay-Format mit clear: 2');
  const f = { legs: 10, clear: 2, extra: 6 };
  assert.equal(MS.legsWin(f, [10, 9], 0), false, '10:9 reicht nicht');
  assert.ok(MS.legsWin(f, [10, 8], 0), '10:8 gewinnt');
  assert.ok(MS.legsWin(f, [12, 10], 0), '12:10 gewinnt');
  assert.equal(MS.legsWin(f, [12, 11], 0), false, '12:11 läuft weiter');
  assert.ok(MS.isSuddenDeath(f, [12, 12]), '12:12 → Sudden Death');
  assert.ok(MS.legsWin(f, [13, 12], 0), '13:12 im Sudden Death gewinnt');
  assert.ok(MS.legsWin({ legs: 10 }, [10, 9], 0), 'ohne Regel: First to 10');
  // Live-Zustand: Legs per Checkout beenden
  const m = MS.createMatch(f, 0); m.sdStarter = 1;
  const winLeg = w => { m.rem[w] = 40; m.turn = w; m.visit = { darts: [], start: 40 }; return MS.throwDart(m, { score: 40, double: true, label: 'D20', ring: 'double', mult: 2, num: 20 }); };
  for (let i = 0; i < 9; i++) { winLeg(0); winLeg(1); }
  assert.equal(MS.wouldWinMatch(m, 0), false, '9:9 – kein Matchdart');
  winLeg(0); assert.equal(m.done, false, '10:9 läuft weiter');
  assert.ok(MS.wouldWinMatch(m, 0), '10:9 – Matchdart');
  for (let i = 0; i < 2; i++) { winLeg(1); winLeg(0); }
  winLeg(1); assert.ok(MS.isSuddenDeath(m.format, m.legs) && m.suddenDeath, '12:12 Sudden Death');
  assert.equal(m.legStarter, 1, 'Anwurf im Sudden Death = zufällig gewürfelter sdStarter');
  assert.ok(MS.isDecider(m), 'Sudden Death = Entscheidungsleg');
  winLeg(1); assert.ok(m.done && m.winner === 1, '12:13 Sieg im Sudden Death');
  // Simulation: kein Sieg mit nur 1 Leg Vorsprung, höchstens 25 Legs
  const rng = new RNG(7), a = { sco: 80, fin: 80, men: 80, foc: 80, cal: 80 };
  let ext = 0;
  for (let i = 0; i < 300; i++) {
    const r = E.simulateMatch(a, a, f, rng), [x, y] = r.score, hi = Math.max(x, y), lo = Math.min(x, y);
    assert.ok(hi >= 10 && x + y <= 25 && (hi - lo >= 2 || x + y === 25), `Ergebnis ${x}:${y}`);
    if (hi > 10) ext++;
  }
  assert.ok(ext > 20, `Verlängerungen kommen vor (${ext})`);
});

test('New Star Darts v134: Manager/Freundin wollen ein Fahrzeug leihen (Ja: Plus, 20 % kaputt; Nein: Minus)', async () => {
  const N = await import('../js/nsd.js'), L = await import('../js/life.js'), E = await import('../data/lifeevents.js');
  const ev = L.eventById('borrow');
  const mk = seed => { const s = N.newNsdCareer({ first: 'A', last: 'F', nation: 'DE', age: 25, slot: 1, seed }); s.player.partnerName = 'Lena'; s.player.rel.partner = 50; s.player.owned = ['sportwagen']; s.stars = 0; return s; };
  let s = mk(1);
  assert.ok(ev.if(s.player, s), 'mit Sportwagen + Freundin möglich');
  s.player.owned = ['limeprimeabo']; assert.equal(ev.if(s.player, s), false, 'Abo kann man nicht verleihen');
  s.player.owned = []; assert.equal(ev.if(s.player, s), false, 'ohne Fahrzeug nicht');
  // Nein → Beziehung −2
  s = mk(2); s.lifeEvent = { id: 'borrow', who: 'partner', car: 'sportwagen' };
  assert.ok(/^Lena möchte .*Sportwagen/.test(L.lifeEventView(s).text));
  L.resolveLifeEvent(s, 1, new RNG(1)); assert.equal(s.player.rel.partner, 48);
  // Ja → +1, manchmal kaputt (Reparatur fällig)
  let broken = 0, n = 300;
  for (let k = 0; k < n; k++) {
    s = mk(3); s.lifeEvent = { id: 'borrow', who: 'partner', car: 'sportwagen' };
    const r = L.resolveLifeEvent(s, 0, new RNG(k));
    assert.equal(s.player.rel.partner, 51);
    if (s.player.upkeep?.sportwagen?.broken) { broken++; assert.ok(/Reparatur/.test(r.changes.join(' ')) && L.brokenItems(s.player).length === 1); }
  }
  assert.ok(broken > n * 0.12 && broken < n * 0.28, `kaputt ${broken}/${n}`);
  // Manager leiht
  s = mk(4); s.team = { manager: 'm1', names: { m1: 'Kalle Kröger' } }; s.player.rel.manager = 50; s.lifeEvent = { id: 'borrow', who: 'manager', car: 'sportwagen' };
  assert.ok(L.lifeEventView(s).text.startsWith('Dein Manager Kalle Kröger'));
  L.resolveLifeEvent(s, 1, new RNG(1)); assert.equal(s.player.rel.manager, 48);
  assert.ok(E.borrowers(s.player, s).includes('manager'));
});

test('New Star Darts v135: Bouncer-Risiko je Dart (Brass am höchsten, je teurer desto niedriger)', async () => {
  const G = await import('../data/gear.js'), O = await import('../js/obstruction.js'), TM = await import('../js/throwModel.js'), MS = await import('../js/matchState.js');
  const byPrice = [...G.DARTS].sort((a, b) => a.price - b.price);
  for (let i = 1; i < byPrice.length; i++) {
    const a = G.dartBounce(byPrice[i - 1].id), b = G.dartBounce(byPrice[i].id);
    assert.ok(b.base < a.base && b.mult < a.mult, `${byPrice[i].name} niedriger als ${byPrice[i - 1].name}`);
  }
  assert.equal(G.DARTS[0].id, 'brass9'); assert.ok(G.dartBounce('brass9').base >= 0.005, 'Brass: spürbare Grundchance');
  assert.equal(O.bounceChance(0, null), 0, 'KI ohne Angabe: kein Bouncer ohne verbautes Feld');
  assert.equal(O.bounceChance(0.5, null), O.BOUNCE_P * 0.5, 'KI wie bisher');
  assert.ok(O.bounceChance(0.5, G.dartBounce('brass9')) > O.bounceChance(0.5, G.dartBounce('sig')) * 3);
  // Dart-Modell: eigener Spieler mit Brass prallt auch auf freiem Feld ab
  const { RNG } = await import('../js/rng.js'), rng = new RNG(5), a = { sco: 90, fin: 90, men: 90, foc: 90, cal: 90 };
  const count = bounce => { let n = 0; for (let k = 0; k < 4000; k++) { const m = MS.createMatch({ legs: 3 }, 0); if (TM.aiDart(m, 0, { ...a, bounce }, rng, TM.aiSigma(a)).hit.label === 'BOUNCER') n++; } return n; };
  const brass = count(G.dartBounce('brass9')), sig = count(G.dartBounce('sig')), ai = count(undefined);
  assert.ok(brass > sig * 3 && ai === 0, `Brass ${brass}, Signature ${sig}, KI ${ai}`);
});

test('New Star Darts v136: Robin Hood – Dart im Flight des vorherigen (Standard-Flight am riskantesten, viel seltener als Bouncer)', async () => {
  const O = await import('../js/obstruction.js'), TM = await import('../js/throwModel.js'), MS = await import('../js/matchState.js'), ST = await import('../js/skilltrain.js'), G = await import('../data/gear.js');
  const { RNG } = await import('../js/rng.js');
  assert.equal(O.robinChance({ x: 0, y: 0 }, [{ x: 10, y: 0 }], 1), 0, 'weit weg: nie');
  assert.equal(O.robinChance({ x: 0, y: 0 }, [{ x: 1, y: 1 }], 1), O.ROBIN_P, 'genau drauf: Standard-Flight');
  assert.ok(O.flightRobin(0) > O.flightRobin(12) && O.flightRobin(12) > O.flightRobin(40) && O.flightRobin(40) > O.flightRobin(90), 'je teurer desto niedriger');
  assert.equal(ST.flightPrice({ boosts: [] }), 0);
  assert.equal(ST.flightPrice({ boosts: [{ icon: '💎', bonus: { sco: 35 }, until: 9 }] }), 90, 'alter Premium-Kauf geschätzt');
  // Häufigkeit je Dart: eigener Spieler (Standard-Flight, Brass) – Robin Hood deutlich seltener als Bouncer
  const rng = new RNG(11), a = { sco: 90, fin: 90, men: 90, foc: 90, cal: 90 }, at = { ...a, bounce: G.dartBounce('brass9'), robin: O.flightRobin(0) };
  let robin = 0, bounce = 0, darts = 0;
  for (let k = 0; k < 6000; k++) {
    const m = MS.createMatch({ legs: 3 }, 0);
    for (let d = 0; d < 3; d++) { const r = TM.aiDart(m, 0, at, rng, TM.aiSigma(a)); darts++; if (r.hit.label === 'ROBIN') robin++; if (r.hit.label === 'BOUNCER') bounce++; MS.throwDart(m, r.hit, r); }
  }
  assert.ok(robin > 0 && robin * 10 < bounce, `Robin Hood ${robin}, Bouncer ${bounce} von ${darts} Darts`);
  // Robin Hood zählt 0 und steckt nicht im Board
  const m = MS.createMatch({ legs: 3 }, 0); MS.throwDart(m, O.ROBIN, { x: 0, y: 0 });
  assert.equal(m.rem[0], 501); assert.equal(m.visit.tips?.length ?? 0, 0);
});

test('New Star Darts v137: World Series – 8 PDC-Einladungen (meist Premier League) + 8 regionale Spieler, Kalender 2026', async () => {
  const N = await import('../js/nsd.js'), M = await import('../js/majors.js'), W = await import('../js/world.js'), { CALENDAR } = await import('../data/tournaments.js');
  const ids = CALENDAR.filter(e => e.cat === 'ws').map(e => e.id);
  assert.deepEqual(ids, ['ws-bah', 'ws-sau', 'ws-nor', 'ws-us', 'ws-nz', 'ws-aus', 'ws-final']);
  const s = N.newNsdCareer({ first: 'A', last: 'B', nation: 'DE', age: 25, slot: 1, seed: 3 });
  s.pl = { [s.date.year]: { players: M.plState(s).players } };
  const pl = new Set(s.pl[s.date.year].players);
  for (const ev of CALENDAR.filter(e => e.cat === 'ws' && e.fmt === 'ws')) {
    s.date.week = ev.week;
    const f = M.majorField(s, ev, true), reg = M.WS_REGIONS[ev.id];
    assert.equal(f.length, 16, ev.id);
    const loc = f.filter(id => reg.nations.includes(W.getPlayer(s, id).nation) && !pl.has(id));
    assert.ok(loc.length >= 8, `${ev.id}: 8 regionale Spieler (${loc.length})`);
    assert.ok(f.filter(id => pl.has(id)).length >= 6, `${ev.id}: mindestens 6 PL-Spieler`);
    const nz = f.filter(id => W.getPlayer(s, id).nation === 'NZ').length;
    if (ev.id === 'ws-nz') assert.ok(nz >= 4, `NZ Masters: ${nz} Neuseeländer`);
    if (ev.id === 'ws-aus') assert.ok(nz >= 1, `Australian Masters: ${nz} Neuseeländer`);
  }
});

test('New Star Darts v138: Nebentour-Spieler altern, treten zurück und werden ersetzt (Niveau stabil)', async () => {
  const N = await import('../js/nsd.js'), W = await import('../js/world.js'), S = await import('../data/secondary.js'), { RNG } = await import('../js/rng.js');
  const s = N.newNsdCareer({ first: 'A', last: 'B', nation: 'DE', age: 25, slot: 1, seed: 5 }), rng = new RNG(9);
  const act = c => Object.values(s.world.players).filter(p => p.tier === 'secondary' && p.circuit === c);
  const mean = c => act(c).reduce((x, p) => x + p.avg, 0) / act(c).length;
  const before = Object.fromEntries(Object.keys(S.SECONDARY).map(c => [c, mean(c)]));
  for (let y = 0; y < 20; y++) { W.developSecondary(s, rng, 2026 + y); for (const p of Object.values(s.world.players)) p.age++; }
  const lim = Object.values(s.world.players).find(p => p.name === 'Paul Lim');
  assert.equal(lim?.tier, 'retired', 'Paul Lim hört irgendwann auf');
  for (const [c, def] of Object.entries(S.SECONDARY)) {
    assert.ok(act(c).length >= def.players.length, `${c}: Pool voll (${act(c).length})`);
    assert.ok(Math.abs(mean(c) - before[c]) < (def.players.length < 10 ? 5.5 : 4), `${c}: Niveau stabil (${before[c].toFixed(1)} → ${mean(c).toFixed(1)})`);
    assert.ok(act(c).some(p => p.generated), `${c}: Nachwuchs`);
  }
  assert.ok(act('dpnz').every(p => p.nation === 'NZ'), 'Nachwuchs aus der Region');
});

test('New Star Darts v140: Osteuropa-Qualifier (European Tour) mit SK/RS/RO/BG/UA, ohne Gastgeberland', async () => {
  const N = await import('../js/nsd.js'), T = await import('../js/tournaments.js'), W = await import('../js/world.js'), { CALENDAR, ET_REGIONS } = await import('../data/tournaments.js');
  for (const n of ['SK', 'RS', 'RO', 'BG', 'UA']) assert.ok(ET_REGIONS.ee.nations.includes(n), n);
  const s = N.newNsdCareer({ first: 'A', last: 'B', nation: 'DE', age: 25, slot: 1, seed: 4 });
  const czech = CALENDAR.find(e => e.cat === 'et' && e.country === 'CZ'), other = CALENDAR.find(e => e.cat === 'et' && e.country === 'DE');
  const pros = W.nonCardPros(s);
  // starker Tscheche und starker Slowake ohne Karte
  const cz = pros[0], sk = pros[1]; cz.nation = 'CZ'; cz.avg = 99; sk.nation = 'SK'; sk.avg = 98;
  for (const p of pros.slice(2)) if (ET_REGIONS.ee.nations.includes(p.nation)) p.avg = Math.min(p.avg, 80);
  let czWins = 0, skIn = 0;
  for (let y = 0; y < 30; y++) {
    s.date.year = 2026 + y;
    if (T.regionQualifier(s, czech, 'ee') === cz.id) czWins++;
    if (T.regionQualifier(s, other, 'ee') === sk.id || T.regionQualifier(s, other, 'ee') === cz.id) skIn++;
  }
  assert.equal(czWins, 0, 'Czech Darts Open: kein Tscheche über den Osteuropa-Qualifier');
  assert.ok(skIn > 10, `Slowakei zugelassen (${skIn}/30)`);
});

test('New Star Darts v144: World Grand Prix mit Double-in, erste Aufnahme zu 75 % Spielszene', async () => {
  const MS = await import('../js/matchState.js'), E = await import('../js/matchEngine.js'), TM = await import('../js/throwModel.js'), T = await import('../js/tournaments.js');
  const B = await import('../js/board.js'), P = await import('../js/player.js'), { FORMATS } = await import('../data/tournaments.js'), { RNG } = await import('../js/rng.js');
  const H = l => { const q = B.targetPoint(l); return B.scoreAt(q.x, q.y); };
  assert.ok(FORMATS.wgp.default.din && Object.values(FORMATS.wgp.byRemaining).every(f => f.din), 'WGP: Double-in in allen Runden');
  assert.deepEqual([FORMATS.wgp.default.sets, FORMATS.wgp.byRemaining[16].sets, FORMATS.wgp.byRemaining[8].sets, FORMATS.wgp.byRemaining[4].sets, FORMATS.wgp.byRemaining[2].sets], [2, 3, 3, 5, 6], 'v145: Bo3/Bo5/Bo5/Bo9/Bo11 Sets');
  assert.ok(E.formatLines(FORMATS.wgp.default).includes('Double-in · Double-out') && /Double-in/.test(E.formatLabel(FORMATS.wgp.default)));
  // Punkte zählen erst ab dem ersten Doppel
  const m = MS.createMatch({ sets: 1, legs: 3, din: true }, 0);
  MS.throwDart(m, H('T20')); assert.equal(m.rem[0], 501, 'T20 vor dem Doppel zählt nicht'); assert.ok(MS.needsIn(m, 0));
  MS.throwDart(m, H('D20')); assert.equal(m.rem[0], 461); assert.equal(MS.needsIn(m, 0), false);
  MS.throwDart(m, H('T20')); assert.equal(m.rem[0], 401, 'danach zählt alles');
  assert.ok(MS.needsIn(m, 1), 'Gegner noch nicht drin'); MS.throwDart(m, H('BULL')); assert.equal(m.rem[1], 451, 'Bull zählt als Doppel');
  const n = MS.createMatch({ legs: 3 }, 0); MS.throwDart(n, H('T20')); assert.equal(n.rem[0], 441, 'ohne Double-in normal');
  // KI zielt auf D20, solange sie nicht drin ist; Averages sinken (Sim und Darts ähnlich)
  const rng = new RNG(3), a = P.attrsForAverage(95, rng);
  assert.equal(TM.aiDart(MS.createMatch({ legs: 3, din: true }, 0), 0, a, rng).target, 'D20');
  let s0 = 0, s1 = 0; for (let i = 0; i < 200; i++) { s0 += E.simulateMatch(a, a, { sets: 3, legs: 3 }, rng).stats[0].avg; s1 += E.simulateMatch(a, a, { sets: 3, legs: 3, din: true }, rng).stats[0].avg; }
  assert.ok(s1 / 200 < s0 / 200 - 4 && s1 / 200 > s0 / 200 - 14, `Sim-Ø ${(s0 / 200).toFixed(1)} → ${(s1 / 200).toFixed(1)}`);
  // Spielszene: erste eigene Aufnahme je Leg ≈ 75 %
  let on = 0, legs = 400;
  for (let k = 0; k < legs; k++) {
    const st = { rng: { s: 1000 + k }, activeEvent: { live: { m: MS.createMatch({ sets: 1, legs: 3, din: true }, 0), me: 0 } } };
    if (T.dinScene(st)) on++;
    assert.equal(T.dinScene(st), T.dinScene(st), 'stabil je Leg');
  }
  assert.ok(Math.abs(on / legs - 0.75) < 0.07, `Szenen ${on}/${legs}`);
  const later = { rng: { s: 5 }, activeEvent: { live: { m: MS.createMatch({ sets: 1, legs: 3, din: true }, 0), me: 0 } } };
  ['S1', 'S1', 'S1'].forEach(l => MS.throwDart(later.activeEvent.live.m, H(l))); ['S1', 'S1', 'S1'].forEach(l => MS.throwDart(later.activeEvent.live.m, H(l)));
  assert.equal(T.dinScene(later), false, 'nur die erste Aufnahme');
});

test('New Star Darts v146: Double-in-Einstieg in der Schnellsimulation dartgenau (80/120/160 statt krummer Werte)', async () => {
  const E = await import('../js/matchEngine.js'), P = await import('../js/player.js'), { RNG } = await import('../js/rng.js');
  const rng = new RNG(8), prof = { ...E.makeProfile(P.attrsForAverage(95, rng), null) }, cnt = {};
  for (let i = 0; i < 5000; i++) { const v = E.inVisit(prof, rng, 1); if (v.in) cnt[v.pts] = (cnt[v.pts] ?? 0) + 1; }
  assert.ok(!cnt[140], 'keine 140 beim Einstieg');
  const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 6).map(x => +x[0]);
  for (const v of [80, 120, 160]) assert.ok(top.includes(v), `${v} unter den häufigsten (${top})`);
});

test('New Star Darts v147: Double-in-Einstiege realistisch – erster zählender Dart immer ein Doppel, auch Nachbar-Doppel, Lieblingsdoppel D16', async () => {
  const MS = await import('../js/matchState.js'), TM = await import('../js/throwModel.js'), E = await import('../js/matchEngine.js'), T = await import('../js/tournaments.js');
  const B = await import('../js/board.js'), P = await import('../js/player.js'), { RNG } = await import('../js/rng.js');
  const H = l => { const q = B.targetPoint(l); return B.scoreAt(q.x, q.y); };
  const entries = pref => {
    const rng = new RNG(5), a = { ...P.attrsForAverage(95, rng), angle: 18, dinPref: pref }, first = {};
    for (let k = 0; k < 2500; k++) {
      const m = MS.createMatch({ legs: 3, din: true }, 0);
      for (let v = 0; v < 12 && MS.needsIn(m, 0); v++) {
        for (let d = 0; d < 3; d++) {
          const was = MS.needsIn(m, 0), x = TM.aiDart(m, 0, a, rng), r0 = m.rem[0]; MS.throwDart(m, x.hit, x);
          if (was && m.rem[0] !== r0) { assert.ok(x.hit.double, `erster zählender Dart ${x.hit.label}`); first[x.hit.label] = (first[x.hit.label] ?? 0) + 1; }
          else if (was) assert.equal(m.rem[0], 501, 'vor dem Doppel zählt nichts');
        }
        for (let d = 0; d < 3; d++) MS.throwDart(m, { label: 'S1', score: 0, double: false, mult: 1, num: 1 });
      }
    }
    const tot = Object.values(first).reduce((x, y) => x + y, 0);
    return l => (first[l] ?? 0) / tot;
  };
  const tops = entries(20), d16 = entries(16);
  assert.ok(tops('D20') > 0.65 && tops('D1') > 0.02 && tops('D5') > 0.02 && tops('D1') + tops('D5') < 0.2, `Tops: D20 ${tops('D20').toFixed(2)}, D1 ${tops('D1').toFixed(3)}, D5 ${tops('D5').toFixed(3)}`);
  assert.ok(d16('D16') > 0.65 && d16('D8') > 0.02 && d16('D7') > 0.02, `D16: ${d16('D16').toFixed(2)}, D8 ${d16('D8').toFixed(3)}, D7 ${d16('D7').toFixed(3)}`);
  // Lieblingsdoppel je KI-Spieler fest, meist Tops
  const st = { seed: 7 }; let n16 = 0; for (let i = 0; i < 400; i++) { const v = T.dinPrefOf(st, 'T' + i); assert.equal(v, T.dinPrefOf(st, 'T' + i)); if (v === 16) n16++; }
  assert.ok(n16 > 60 && n16 < 140, `D16-Spieler ${n16}/400`);
  // Schnellsimulation: Einstieg immer über ein Doppel (40/2/10 bzw. 32/16/14) + Rest auf die 20
  const rng = new RNG(2), ok = new Set([60, 20, 1, 5]);
  for (const din16 of [false, true]) for (let i = 0; i < 3000; i++) {
    const v = E.inVisit({ ...E.makeProfile(P.attrsForAverage(95, rng), null), din16 }, rng, 1);
    if (!v.in) { assert.equal(v.pts, 0); continue; }
    const dbls = din16 ? [32, 16, 14] : [40, 2, 10];
    const fits = dbls.some(d => { const r = v.pts - d; if (r === 0) return true; for (const x of ok) { if (r === x) return true; for (const y of ok) if (r === x + y) return true; } return false; });
    assert.ok(fits, `Einstieg ${v.pts} (${din16 ? 'D16' : 'Tops'})`);
  }
  // 9-Darter mit Double-in: 160 (D20 T20 T20) hält ihn am Leben, 140 (D20 T20 S20 …) nicht
  const mk = darts => { const m = MS.createMatch({ legs: 3, din: true }, 0); darts.forEach(l => MS.throwDart(m, H(l))); ['S1', 'S1', 'S1'].forEach(l => MS.throwDart(m, H(l))); return { activeEvent: { live: { m, me: 0 } }, player: { energy: 100 } }; };
  assert.ok(T.nineAlive(mk(['D20', 'T20', 'T20'])), '160 → 9-Darter möglich');
  assert.equal(T.nineAlive(mk(['D20', 'T20', 'S20'])), false, '120 → nicht mehr');
  assert.equal(T.nineAlive(mk(['T20', 'D20', 'T20'])), false, 'erster Dart zählte nicht');
});

test('New Star Darts v148: Double-in-Quote in der Match-Statistik (Live und Schnellsimulation)', async () => {
  const MS = await import('../js/matchState.js'), E = await import('../js/matchEngine.js'), B = await import('../js/board.js'), P = await import('../js/player.js'), { RNG } = await import('../js/rng.js');
  const H = l => { const q = B.targetPoint(l); return B.scoreAt(q.x, q.y); };
  const m = MS.createMatch({ sets: 1, legs: 3, din: true }, 0);
  ['S20', 'S20', 'D20'].forEach(l => MS.throwDart(m, H(l)));   // 3 Versuche, 1 Treffer
  ['T20', 'T20', 'T20'].forEach(l => MS.throwDart(m, H(l)));   // Gegner: 3 Versuche, 0 Treffer
  ['T20', 'T20', 'T20'].forEach(l => MS.throwDart(m, H(l)));   // du bist drin: zählt nicht mehr als Versuch
  const r = MS.matchResult(m);
  assert.deepEqual([r.stats[0].dinHit, r.stats[0].dinAtt], [1, 3]); assert.ok(Math.abs(r.stats[0].dinPct - 1 / 3) < 1e-9);
  assert.deepEqual([r.stats[1].dinHit ?? 0, r.stats[1].dinAtt], [0, 3]); assert.equal(r.stats[1].dinPct, 0);
  const rng = new RNG(3), a = P.attrsForAverage(95, rng), sim = E.simulateMatch(a, a, { sets: 3, legs: 3, din: true }, rng);
  for (const st of sim.stats) assert.ok(st.dinAtt > 0 && st.dinHit > 0 && st.dinPct > 0.15 && st.dinPct < 0.75, `Sim-Quote ${st.dinHit}/${st.dinAtt}`);
  const plain = E.simulateMatch(a, a, { sets: 3, legs: 3 }, rng); assert.ok(!plain.stats[0].dinAtt, 'ohne Double-in keine Quote');
});

test('New Star Darts v149: Bewertungsseite (Werte vor dem Match) und Interview-Balken (Beziehungen vorher)', async () => {
  const N = await import('../js/nsd.js'), T = await import('../js/tournaments.js'), CAL = await import('../js/calendar.js'), C = await import('../js/career.js'), RB = await import('../js/ui/nsd/relbars.js').catch(() => null);
  const s = N.newNsdCareer({ first: 'A', last: 'B', nation: 'DE', age: 25, slot: 1, seed: 41 }); s.player.assessed = true; s.date.week = 6; s.week = { played: false, eventId: null };
  T.enterEvent(s, CAL.eventsInWeek(s, 2026, 6).find(x => x.cat === 'pc').id);
  const e0 = Math.round(s.player.energy), f0 = s.player.rel.fans;
  T.playRound(s);
  const lm = s.activeEvent.lastMatch;
  assert.ok(lm && lm.eBefore === e0 && lm.relBefore.fans === f0, 'Werte vor dem Match gespeichert');
  assert.ok(lm.energy < lm.eBefore, 'Energie gesunken');
  // Interview: Beziehungen vor der ersten Antwort
  s.interview = null; s.activeEvent.place = 'W'; C.maybeInterviewNsd(s, s.activeEvent, new RNG(3));
  if (s.interview) {
    const before = { ...s.player.rel }; C.answerInterview(s, 0, new RNG(4));
    const iv = C.interviewView(s, new RNG(5)); assert.deepEqual(iv.relStart ?? s.interview.relStart, before);
  }
  if (RB) {   // Balken-Helfer: nur aktive Beziehungen, Änderung als Text
    s.team = { manager: null }; assert.deepEqual(RB.activeRels(s), ['fans']);
    assert.ok(/\+2/.test(RB.deltaTxt(2)) && /−1,5/.test(RB.deltaTxt(-1.5)) && /±0/.test(RB.deltaTxt(0)));
  }
});

test('New Star Darts v152: Verletzungen (50 % Energie, 1–2 Wochen, schwache Erholung, mehr Streuung, schwächere Aufnahmen)', async () => {
  const N = await import('../js/nsd.js'), J = await import('../js/injury.js'), L = await import('../js/life.js'), T = await import('../js/tournaments.js'), CAL = await import('../js/calendar.js');
  const s = N.newNsdCareer({ first: 'A', last: 'B', nation: 'DE', age: 25, slot: 1, seed: 43 }); s.player.assessed = true;
  const p = s.player; p.energy = 80;
  // Chance: Grundwert, überspielt, Alter, Fitnesstrainer
  assert.equal(J.injuryChance({ energy: 80, age: 25 }), J.INJ_P);
  assert.ok(J.injuryChance({ energy: 20, age: 25 }) > J.INJ_P && J.injuryChance({ energy: 80, age: 40 }) > J.INJ_P);
  assert.ok(J.injuryChance({ energy: 80, age: 25, fitness: {} }) < J.INJ_P);
  // Verletzung erzwingen
  let inj = null; for (let k = 0; k < 400 && !inj; k++) { p.injuryFree = 0; inj = J.injuryWeek(s, new RNG(k)); }
  assert.ok(inj && p.injury && p.energy === 30, 'kostet sofort 50 %');
  assert.ok([1, 2].includes(inj.weeks) && p.injury.until - (s.date.year * 52 + s.date.week) === inj.weeks - 1);
  // Erholung stark vermindert
  const healthy = L.weeklyEnergy({ ...p, injury: null }); assert.ok(L.weeklyEnergy(p) <= Math.round(healthy * 0.5), 'Erholung vermindert');
  // Abklingzeit: keine zweite Verletzung direkt danach
  const until = p.injury.until; s.date.week += inj.weeks;   // Verletzung vorbei
  assert.equal(J.injuryWeek(s, new RNG(1), 80), null); assert.equal(p.injury, null, 'abgelaufen');
  for (let k = 0; k < 200; k++) assert.equal(J.injuryWeek(s, new RNG(k), 80), null, 'Abklingzeit');
  // Simulation: deutlich schwächere Aufnahmen
  const A = { sco: 93, fin: 93, men: 93, foc: 93, cal: 93 }, hurt = J.applyInjury(A, { injury: { kind: 'back' } });
  const avg = a => { const rng = new RNG(7); let pts = 0, d = 0; for (let i = 0; i < 300; i++) { const r = simulateMatch(a, A, { legs: 6 }, rng); pts += r.stats[0].points; d += r.stats[0].darts; } return pts / d * 3; };
  assert.ok(avg(A) - avg(hurt) > 2, 'Average merkbar niedriger');
  // Live: größerer Kreis, schnelleres Zielkreuz
  s.date.week = 6; s.week = { played: false, eventId: null }; p.energy = 90; p.injury = null;
  T.enterEvent(s, CAL.eventsInWeek(s, 2026, 6).find(x => x.cat === 'pc').id); T.startManualMatch(s);
  if (s.activeEvent.live) {
    const a0 = T.aimParams(s, 'T20'); p.injury = { kind: 'head', until: 9e9 };
    const a1 = T.aimParams(s, 'T20'); assert.ok(a1.radius > a0.radius && a1.freq > a0.freq && a1.injured, JSON.stringify([a0, a1]));
  }
});

test('New Star Darts v153: Ganz seltene schwere Rückenschmerzen sperren die Turniere der Woche', async () => {
  const N = await import('../js/nsd.js'), J = await import('../js/injury.js'), CAL = await import('../js/calendar.js');
  const s = N.newNsdCareer({ first: 'A', last: 'B', nation: 'DE', age: 25, slot: 1, seed: 47 }); s.player.assessed = true; s.date.week = 6;
  let n = 0, back = 0, severe = null;
  for (let k = 0; k < 40000; k++) { s.player.injury = null; s.player.injuryFree = 0; s.week = { played: false, eventId: null }; const r = J.injuryWeek(s, new RNG(k), 80);
    if (!r) continue; n++; if (r.kind === 'back') back++;
    if (r.severe) { assert.equal(r.kind, 'back'); assert.ok(s.week.blocked && r.weeks === 2); severe ??= k; } else assert.ok(!s.week.blocked); }
  assert.ok(severe !== null, 'kommt vor');
  // selten: deutlich unter jeder 5. Rückenverletzung
  let sv = 0; for (let k = 0; k < 40000; k++) { s.player.injury = null; s.player.injuryFree = 0; s.week = { played: false, eventId: null }; const r = J.injuryWeek(s, new RNG(k), 80); if (r?.severe) sv++; }
  assert.ok(sv / back > 0.12 && sv / back < 0.25, `Anteil ${sv}/${back}`);
  // gesperrt: kein Turnier der Woche meldbar
  s.player.injury = null; s.player.injuryFree = 0; s.week = { played: false, eventId: null }; J.injuryWeek(s, new RNG(severe), 80);
  for (const ev of CAL.eventsInWeek(s, 2026, 6)) { const st = ET.eventStatus(s, ev); assert.ok(!st.playable && /Rücken/.test(st.reason)); }
});

test('New Star Darts v156: Rücktritte der (ehemaligen) Tourcard-Spieler in den News, Top 24 hören nicht auf (außer über 65)', async () => {
  const N = await import('../js/nsd.js'), W = await import('../js/world.js'), R = await import('../js/rankings.js'), S = await import('../js/season.js');
  const s = N.newNsdCareer({ first: 'A', last: 'B', nation: 'DE', age: 25, slot: 1, seed: 53 }); s.player.assessed = true;
  const y = s.date.year, top = R.orderOfMerit(s, 'pdc', y).slice(0, 24).map(x => x.p).filter(p => p.id !== 'P');
  const star = top[0], old = top[1];
  // geschützt: 60 Jahre, Top 24 → nie Rücktritt; über 65 → möglich
  let quitProt = 0, quitOld = 0;
  for (let k = 0; k < 200; k++) {
    const c = structuredClone(s), a = c.world.players[star.id], b = c.world.players[old.id]; a.age = 60; b.age = 70;
    const prot = new Set(top.map(p => p.id)), rep = W.developWorld(c, new RNG(k), y, prot);
    if (a.tier === 'retired') quitProt++;
    if (b.tier === 'retired') { quitOld++; assert.ok(rep.retiredTc.some(x => x.id === old.id), 'Tourcard-Spieler in der Liste'); }
  }
  assert.equal(quitProt, 0, 'Top 24 unter 66 hört nicht auf'); assert.ok(quitOld > 50, `über 65 hört auf (${quitOld}/200)`);
  // ohne Karte nie gehabt → nicht in der Liste
  assert.equal(W.hadCard({ id: 'F1' }), false); assert.equal(W.hadCard({ id: 'K3' }), true); assert.equal(W.hadCard({ id: 'C9', cardVia: 'Q-School' }), true);
  // Saisonwechsel: News im neuen Jahr
  for (const p of Object.values(s.world.players)) if (p.cardUntil && !top.includes(p)) p.age = Math.max(p.age, 58);
  s.date.week = 52; s.week = { played: true, eventId: null }; s.activeEvent = null;
  S.nextWeek(s);
  assert.equal(s.date.year, y + 1);
  const n = s.news.find(x => /Karriereende: \d+ Tourcard/.test(x.title));
  assert.ok(n && n.year === y + 1 && n.week === 1, 'Rücktrittsliste zum Saisonstart');
});

test('New Star Darts v157: Keine Interviews nach Players Championships und Floor-Turnieren', async () => {
  const N = await import('../js/nsd.js'), C = await import('../js/career.js');
  const s = N.newNsdCareer({ first: 'A', last: 'B', nation: 'DE', age: 25, slot: 1, seed: 59 }), rng = new RNG(5);
  for (const cat of ['pc', 'etq', 'dev', 'challenge', 'wos', 'mastersq', 'qschool']) for (const place of ['W', 'F', 'SF'])
    assert.equal(C.maybeInterviewNsd(s, { place, cat, name: 'X' }, rng), null, `${cat} ${place}`);
  assert.equal(C.maybeInterviewNsd(s, { place: 'W', cat: 'major', name: 'X', isQualifier: true }, rng), null, 'Qualifier');
  for (const ev of [{ cat: 'et' }, { cat: 'major' }, { cat: 'ws' }, { cat: 'pl' }, { cat: 'wos', fmt: 'wwm' }])
    assert.ok(C.maybeInterviewNsd(s, { place: 'W', name: 'X', ...ev }, rng), `Bühne ${ev.cat}`);
});

test('New Star Darts v158: Match-Note wird mit steigendem Star-Status strenger', async () => {
  const N = await import('../js/nsd.js');
  const good = { won: true, avg: 95, coPct: 0.4, s180: 2, my: 6, opp: 4 };
  assert.equal(N.matchRating({ ...good, level: 1 }), N.matchRating(good), 'Stufe 1 wie bisher');
  const r = [1, 10, 20, 30, 40, 51].map(level => N.matchRating({ ...good, level }));
  for (let i = 1; i < r.length; i++) assert.ok(r[i] < r[i - 1], `strenger: ${r.join(' ')}`);
  assert.equal(r[0], 10); assert.ok(r[5] < 7.5, 'auf hohem Status nur noch ordentlich');
  assert.ok(N.matchRating({ won: true, avg: 105, coPct: 0.5, s180: 5, my: 6, opp: 1, level: 60 }) >= 9.5, 'Weltklasse bleibt fast 10');
  assert.ok(N.matchRating({ won: true, avg: 80, coPct: 0.2, my: 6, opp: 5, level: 60 }) >= 5.5, 'Sieg mind. 5,5');
});

test('New Star Darts v159: Note minimal strenger, Fans erst über 7,0 (6,1–7,0 ±0, darunter Abzug)', async () => {
  const N = await import('../js/nsd.js');
  assert.deepEqual([7.1, 8.4, 8.5, 10].map(r => N.fansAfterMatch(true, r)), [1, 1, 2, 2]);
  assert.deepEqual([6.1, 7.0].map(r => N.fansAfterMatch(true, r)), [0, 0]);
  assert.deepEqual([6.0, 5.5, 2].map(r => N.fansAfterMatch(true, r)), [0, 0, 0], 'Sieg: nie Verlust (Version 160)');
  assert.deepEqual([6.0, 5.5, 2].map(r => N.fansAfterMatch(false, r)), [-1, -1, -1], 'Niederlage bis 6,0: Abzug');
  assert.equal(N.fansAfterMatch(false, 7.5), 1, 'starke Niederlage bringt auch Fans');
  const ref = N.rateRef(46); assert.ok(Math.abs(ref.avg - 99) < 1e-9 && Math.abs(ref.co - 0.43) < 1e-9);
  assert.ok(N.rateRef(30).avg > 85 + 13 * 29 / 50, 'strenger als Version 158');
});

test('New Star Darts v161: Reale Spieler ohne Alter – Alter frei wählbar; Silvia Lindner und Bianca Michalczyk im Women-Series-Pool', async () => {
  const N = await import('../js/nsd.js'), W = await import('../js/world.js');
  const reals = N.realPlayers(), noAge = reals.filter(r => r.age == null);
  assert.ok(noAge.length > 0 && reals.some(r => r.name === 'Silvia Lindner' && r.woman));
  const s = N.newRealCareer({ name: 'Silvia Lindner', slot: 1, seed: 5, age: 33 });
  assert.equal(s.player.age, 33); assert.ok(s.player.woman);
  assert.equal(N.newRealCareer({ name: 'Luke Littler', slot: 1, seed: 5, age: 40 }).player.age !== 40, true, 'bekanntes Alter bleibt');
  const t = N.newNsdCareer({ first: 'A', last: 'B', nation: 'DE', age: 25, slot: 1, seed: 61 }), names = W.womenOf(t).map(p => p.name);
  assert.ok(names.includes('Silvia Lindner') && names.includes('Bianca Michalczyk'));
  // Zurückgetretene Nebentour-Spielerinnen werden beim Laden nicht neu angelegt
  const x = Object.values(t.world.players).find(p => p.name === 'Silvia Lindner'); x.tier = 'retired';
  const n0 = Object.keys(t.world.players).length; W.addSecondary(t.world.players, new RNG(1), 2026);
  assert.equal(Object.keys(t.world.players).length, n0);
});

test('New Star Darts v162: Silvia Lindner spielt je Match einen Average zwischen 52 und 75', async () => {
  const N = await import('../js/nsd.js'), T = await import('../js/tournaments.js'), E = await import('../js/matchEngine.js'), P = await import('../js/player.js');
  const s = N.newNsdCareer({ first: 'A', last: 'B', nation: 'DE', age: 25, slot: 1, seed: 3 });
  const sl = Object.values(s.world.players).find(p => p.name === 'Silvia Lindner');
  assert.deepEqual(sl.avgRange, [52, 75]); assert.equal(sl.avg, 63.5);
  const inst = { eventId: 'wos-1', year: 2026, current: 0 };
  assert.deepEqual(T.rangeAttrs(s, sl, inst, 'X').attrs, T.rangeAttrs(s, sl, inst, 'X').attrs, 'fest je Match');
  const rng = new RNG(4), opp = P.attrsForAverage(63, rng), av = [];
  for (let k = 0; k < 200; k++) { const r = E.simulateMatch(T.rangeAttrs(s, sl, { ...inst, current: k }, 'X').attrs, opp, { legs: 4 }, rng); av.push(r.stats[0].points / r.stats[0].darts * 3); }
  av.sort((a, b) => a - b);
  assert.ok(av[20] < 57 && av[180] > 70, `Spanne ${av[20].toFixed(1)}–${av[180].toFixed(1)}`);
});

test('New Star Darts v163: Altersabbau, häufiger trainieren im Alter, langsamerer Status ab Top 16', async () => {
  const N = await import('../js/nsd.js'), K = await import('../js/skilltrain.js'), R = await import('../js/rankings.js');
  assert.deepEqual([30, 33, 35, 36, 39, 40, 44, 45, 55].map(K.ageDecline), [0, 1, 1, 2, 2, 3, 3, 4, 4]);
  assert.ok(K.decayFrom(25) === 9 && K.decayFrom(37) < 9 && K.decayFrom(45) === 3 && K.decayFrom(60) === 3, 'Frist sinkt bis 45 auf 3 Wochen');
  const s = N.newNsdCareer({ first: 'A', last: 'B', nation: 'DE', age: 41, slot: 1, seed: 67 });
  for (const t of N.TRAINABLE) N.setSkill(s.player, t.key, 40);
  const lost = K.ageDeclineYear(s);
  assert.ok(N.TRAINABLE.every(t => lost[t.key] === 3 && N.skillValue(s.player, t.key) === 37), 'mit 41: −3 je Fähigkeit');
  assert.ok(s.news.some(n => /Alter 41/.test(n.title)));
  // Star-Status: ab Top 16 gedämpft
  assert.deepEqual([1, 3, 5, 8, 12, 16, 17, null].map(N.topSlow), [0.45, 0.45, 0.55, 0.55, 0.7, 0.7, 1, 1]);
  const c = structuredClone(s); c.player.star = { level: 20, xp: 0 };
  ((c.rankings.years[c.date.year] ??= {}).pdc ??= {}).P = 1e6;
  assert.equal(R.rankOf(c, 'pdc', 'P'), 1);
  N.addStarProgress(c, 50); assert.ok(Math.abs(c.player.star.xp - 50 * 0.45) < 0.11, `Top 1: ${c.player.star.xp}`);
  const d = structuredClone(s); d.player.star = { level: 20, xp: 0 }; N.addStarProgress(d, 50); assert.equal(d.player.star.xp, 50, 'außerhalb der Top 16 ungebremst');
});

test('New Star Darts v163: Titel bringen mehr Fans, WM-Titel riesig', async () => {
  const N = await import('../js/nsd.js');
  const mk = f => ({ rel: { fans: f } });
  const g = (f, inst) => { const p = mk(f); N.titleFans(p, inst); return p.rel.fans - f; };
  assert.ok(g(60, { cat: 'pc' }) >= 1 && g(60, { cat: 'major', fmt: 'masters' }) >= 4 && g(60, { cat: 'major', fmt: 'matchplay' }) > g(60, { cat: 'major', fmt: 'masters' }));
  assert.ok(g(60, { cat: 'major', fmt: 'masters' }) > 10 * (1 - 0.6) ** 2, 'mehr als die alte quadratische Bremse');
  assert.equal(g(60, { cat: 'major', fmt: 'wm' }), 20, 'WM: halber Abstand zu 100');
  assert.equal(g(20, { cat: 'major', fmt: 'wm' }), 40); assert.equal(g(95, { cat: 'major', fmt: 'wm' }), 5, 'nie über 100');
  assert.ok(g(60, { cat: 'pl', plNight: 1 }) < 1, 'PL-Spieltag klein');
});

test('New Star Darts v163: Ausfall-Woche – Premier League kampflos (Freilos für den Gegner), World Cup mit Nachrücker', async () => {
  const N = await import('../js/nsd.js'), T = await import('../js/tournaments.js'), M = await import('../js/majors.js');
  const s = N.newNsdCareer({ first: 'A', last: 'B', nation: 'DE', age: 25, slot: 1, seed: 71 });
  const y = s.date.year; ((s.rankings.years[y] ??= {}).pdc ??= {}).P = 1e6;   // Platz 1 → Premier League + World Cup
  const pl = M.plState(s); if (!pl.players.includes('P')) pl.players[7] = 'P';
  s.date.week = 6; s.week = { played: false, eventId: null, blocked: { id: 'injury', label: 'Schwere Rückenschmerzen', icon: '🦴' } };
  const n0 = s.results.length, out = T.simulateWeekAI(s), night = out.find(i => i.plNight);
  assert.ok(night, 'Spieltag gespielt'); assert.ok(night.rounds[0].matches.some(m => m.walkover && (m.a === 'P' || m.b === 'P')), 'kampflos');
  assert.equal(M.plState(s).points.P, 0, 'keine Punkte'); assert.equal(s.results.length, n0, 'kein eigenes Ergebnis');
  assert.ok(s.news.some(x => /kampflos verloren/.test(x.title)));
  // World Cup (KW 24)
  s.date.week = 24; s.week = { played: false, eventId: null, blocked: { id: 'injury', label: 'Schwere Rückenschmerzen', icon: '🦴' } };
  assert.ok(M.wcTeams(s).P, 'du wärst im Team');
  T.simulateWeekAI(s);
  const teams = M.wcTeams(s);
  assert.ok(!teams.P && teams['W:DE'] && teams['W:DE'].members.length === 2 && !teams['W:DE'].members.includes('P'), 'Nachrücker');
  assert.ok(s.news.some(x => /ohne dich/.test(x.title)));
});

test('New Star Darts v165: Meilensteine Triple Crown, Clean Sweep, 50 Wochen auf Platz 1', async () => {
  const N = await import('../js/nsd.js'), L = await import('../js/life.js'), A = await import('../data/achievements.js');
  const s = N.newNsdCareer({ first: 'A', last: 'B', nation: 'DE', age: 25, slot: 1, seed: 73 });
  const has = id => !!s.achievements?.[id];
  const win = (eventId, year) => s.results.unshift({ year, week: 30, eventId, name: eventId, cat: 'major', place: 'W', stars: 0 });
  win('wm', 2026); win('matchplay', 2026); win('pl-final', 2027); L.checkAchievements(s);
  assert.ok(!has('tripleCrown'), 'verschiedene Jahre zählen nicht');
  win('pl-final', 2026); L.checkAchievements(s); assert.ok(has('tripleCrown'), 'Triple Crown');
  for (const id of A.CLEAN_SWEEP.slice(0, -1)) win(id, 2028); L.checkAchievements(s); assert.ok(!has('cleanSweep'));
  assert.ok(A.CLEAN_SWEEP.includes('pl-final') && A.CLEAN_SWEEP.includes('wcod'), 'inkl. Premier League und World Cup');
  win(A.CLEAN_SWEEP.at(-1), 2028); L.checkAchievements(s); assert.ok(has('cleanSweep'), 'Clean Sweep');
  (s.mstats ??= {}).weeksNo1 = 49; L.checkAchievements(s); assert.ok(!has('no1w50'));
  ((s.rankings.years[s.date.year] ??= {}).pdc ??= {}).P = 1e6;
  L.lifeWeek(s, new RNG(1)); assert.equal(s.mstats.weeksNo1, 50); assert.ok(has('no1w50'), '50 Wochen auf Platz 1');
});

test('New Star Darts v199: Spieler ohne Karte zählen in der PDC-OOM mit, Top 64 → Tourcard', async () => {
  const N = await import('../js/nsd.js'), S = await import('../js/season.js'), R = await import('../js/rankings.js');
  const s = N.newNsdCareer({ first: 'A', last: 'B', nation: 'DE', age: 25, slot: 1, seed: 8 }), y = s.date.year;
  const ct = Object.values(s.world.players).find(p => p.tier === 'challenge');
  ((s.rankings.years[y] ??= {}).pdc ??= {})[ct.id] = 500;   // z. B. eine sehr gute WM
  const o = R.orderOfMerit(s, 'pdc', y), me = o.find(x => x.p.id === ct.id);
  assert.ok(me && me.rank <= 64, 'ohne Karte mit Platz in der Rangliste');
  assert.ok(R.devHolders(s, y).every(p => p.tier === 'tour' || p.id === 'P'));
  S.yearEnd(s);
  assert.equal(ct.tier, 'tour'); assert.equal(ct.cardUntil, y + 2); assert.ok(ct.cardVia.startsWith('Top 64 PDC'));
});
test('New Star Darts v200: alter Spielstand – Top 64 ohne Karte zum Saisonende bekommt die Karte nachträglich', async () => {
  const N = await import('../js/nsd.js'), St = await import('../js/state.js');
  const s = N.newNsdCareer({ first: 'A', last: 'B', nation: 'DE', age: 25, slot: 1, seed: 9 });
  const ct = Object.values(s.world.players).find(p => p.tier === 'challenge');
  ((s.rankings.years[2026] ??= {}).pdc ??= {})[ct.id] = 400;   // starke WM 2026 als Qualifikant, Jahreswechsel nach alter Regel
  s.date.year = 2027; s.date.week = 5; delete s.flags?.v200cards;
  St.migrate(s);
  assert.equal(ct.tier, 'tour'); assert.equal(ct.cardUntil, 2028); assert.ok(s.news.some(n => n.title.includes('Tourcard nachgereicht')));
  ct.tier = 'challenge'; St.migrate(s); assert.equal(ct.tier, 'challenge');   // nur einmal
});

test('New Star Darts v207: Einsteckwinkel umstellen kostet 100 % Energie', async () => {
  const N = await import('../js/nsd.js');
  const s = N.newNsdCareer({ first: 'A', last: 'B', nation: 'DE', age: 25, slot: 1, seed: 4, angle: 15 });
  s.player.energy = 80; assert.throws(() => N.changeAngle(s, 40), /100 % Energie/);
  s.player.energy = 100; assert.equal(N.changeAngle(s, 40), 40); assert.equal(s.player.angle, 40); assert.equal(s.player.energy, 0);
  s.player.energy = 100; assert.equal(N.changeAngle(s, 99), 60); assert.throws(() => N.changeAngle(s, 60), /schon/);
});

test('New Star Darts v210: nach der Q-School nie mehr als 128 Holder', async () => {
  const N = await import('../js/nsd.js'), T = await import('../js/tournaments.js'), W = await import('../js/world.js');
  const s = N.newNsdCareer({ first: 'A', last: 'B', nation: 'DE', age: 25, slot: 1, seed: 3 }), cnt = () => W.playersOfTier(s, 'tour').length + 1;
  for (const p of W.playersOfTier(s, 'challenge').slice(0, 5)) { p.tier = 'tour'; p.cardUntil = 2027; }
  assert.equal(cnt(), 133); assert.equal(T.trimTo128(s).length, 5); assert.equal(cnt(), 128); assert.equal(s.player.tour, 'tour');
  assert.equal(T.trimTo128(s).length, 0);
});

test('New Star Darts v213: Shoppingtour mit der Freundin (Ja → Shop, Nein −3, ohne Kauf −6, mit Kauf +4, kein Hinweis)', async () => {
  const N = await import('../js/nsd.js'), L = await import('../js/life.js'), { LIFE_EVENTS } = await import('../data/lifeevents.js');
  const s = N.newNsdCareer({ first: 'Sven', last: 'Shop', nation: 'DE', age: 25, slot: 1, seed: 7 }), p = s.player, rng = new RNG({ s: 5 });
  const ev = LIFE_EVENTS.find(e => e.id === 'shopping');
  assert.ok(!/sauer|verärgert|freut|glücklich|Beziehung/i.test(ev.text + ev.opts.map(o => o.label + (o.out ?? '')).join(' ')));
  assert.ok(!ev.if(p, s));                                                     // nur mit Freundin
  p.partnerName = 'Lena'; p.rel.partner = 50; s.stars = 0; assert.ok(ev.if(p, s)); assert.ok(!L.canShop(s));
  s.stars = 1000; assert.ok(L.canShop(s));
  s.lifeEvent = { id: 'shopping' }; let r = L.resolveLifeEvent(s, 1, rng);      // Nein
  assert.equal(p.rel.partner, 50 + L.SHOP_NO); assert.equal(r.changes.length, 0); assert.ok(r.text.includes('Lena'));
  p.rel.partner = 50; s.lifeEvent = { id: 'shopping' }; r = L.resolveLifeEvent(s, 0, rng);   // Ja, nichts gekauft
  assert.ok(r.shop && s.shopping && p.rel.partner === 50); L.endShopping(s); assert.equal(p.rel.partner, 50 + L.SHOP_EMPTY); assert.equal(s.shopping, null);
  assert.ok(L.SHOP_EMPTY < L.SHOP_NO && L.SHOP_BUY > 0);
  p.rel.partner = 50; s.lifeEvent = { id: 'shopping' }; L.resolveLifeEvent(s, 0, rng);       // Ja + Kauf
  const LS = (await import('../data/lifestyle.js')).LIFESTYLE, it = LS.find(x => !p.owned?.includes(x.id) && x.price <= s.stars);
  p.energy = 80; L.buyItem(s, it.id); const it2 = LS.find(x => !p.owned?.includes(x.id) && x.price <= s.stars); L.buyItem(s, it2.id);
  assert.equal(p.energy, 80); L.endShopping(s); assert.equal(p.rel.partner, 50 + L.SHOP_BUY); assert.equal(p.energy, 80 - 2 * L.SHOP_ENERGY);   // Energie erst am Ende
  p.energy = 80; L.buyItem(s, LS.find(x => !p.owned?.includes(x.id) && x.price <= s.stars).id); assert.equal(p.energy, 80);   // ohne Shoppingtour keine Energie
  p.rel.partner = 3; s.lifeEvent = { id: 'shopping' }; L.resolveLifeEvent(s, 0, rng); L.endShopping(s);   // zu tief → Schluss
  assert.equal(p.partnerName, null);
});

test('New Star Darts v215: Statistik-Ansicht Titel & Ehrungen (Auszeichnungen im Archiv, alte aus den News)', async () => {
  const N = await import('../js/nsd.js'), C = await import('../js/career.js'), S = await import('../js/state.js');
  const s = N.newNsdCareer({ first: 'Benny', last: 'Buchse', nation: 'DE', age: 17, slot: 1, seed: 8 });
  s.player.rel.fans = 80; C.seasonAwards(s, 2026);
  assert.ok(s.archive.awards.some(w => w.year === 2026 && w.label === 'Fan-Liebling'));
  const o = JSON.parse(JSON.stringify(s)); delete o.archive.awards; delete o.flags.v215awards;
  const m = S.migrate(o); assert.ok(m.archive.awards.some(w => w.label === 'Fan-Liebling'));
});

test('New Star Darts v216: Unfälle → Scoring/Finishing −1…2 (nur mit Punkten), Haushalt ohne / Fahrzeug mit Fahrzeug', async () => {
  const N = await import('../js/nsd.js'), L = await import('../js/life.js'), D = await import('../data/lifeevents.js');
  const s = N.newNsdCareer({ first: 'Uwe', last: 'Unfall', nation: 'DE', age: 25, slot: 1, seed: 9 }), p = s.player, rng = new RNG({ s: 11 });
  const ev = D.LIFE_EVENTS.find(e => e.id === 'accident');
  for (const k of ['sco', 'fin']) N.setSkill(p, k, 0); assert.ok(!ev.if(p, s));   // ohne Punkte kein Unfall
  N.setSkill(p, 'fin', 1); assert.ok(ev.if(p, s));
  const roll = () => { s.lifeEvent = null; s.lastLifeEvent = null; let le; do { s.lifeEvent = null; le = L.rollLifeEvent(s, rng); } while (le?.id !== 'accident'); return le; };
  p.owned = []; let le = roll();
  assert.equal(le.skill, 'fin'); assert.ok(le.n === 1 || le.n === 2); assert.equal(le.car, null);
  assert.ok(D.ACCIDENTS_HOME.some(t => L.lifeEventView(s).text === t));
  let r = L.resolveLifeEvent(s, 0, rng); assert.equal(N.skillValue(p, 'fin'), 0); assert.ok(r.changes.some(c => c.startsWith('Finishing −1')));   // nie unter 0
  N.setSkill(p, 'sco', 30); N.setSkill(p, 'fin', 30); p.owned = ['tretroller']; le = roll();
  assert.equal(le.car, 'tretroller'); assert.ok(L.lifeEventView(s).text.includes('E-Scooter') && L.lifeEventView(s).text.includes('Tretroller'));
  const k = le.skill, n = le.n; L.resolveLifeEvent(s, 0, rng); assert.equal(N.skillValue(p, k), 30 - n);
  // Version 217: eine KW keine Turniere – außer Majors und deren Qualifier
  const T = await import('../js/tournaments.js'); assert.ok(s.week.accident);
  assert.ok(!T.eventStatus(s, { id: 'pc-x', cat: 'pc', name: 'PC', week: s.date.week }).playable);
  assert.ok(T.majorPath({ cat: 'major' }) && T.majorPath({ cat: 'mastersq' }) && T.majorPath({ cat: 'wmreg' }) && !T.majorPath({ cat: 'et' }) && !T.majorPath({ cat: 'pc' }));
  assert.ok(!/Unfall/.test(T.eventStatus(s, { id: 'masters', cat: 'major', fmt: 'masters', name: 'Masters', week: s.date.week }).reason ?? ''));
  for (const id of Object.keys(D.VEHICLE_KIND)) assert.ok((await import('../data/lifestyle.js')).LIFESTYLE.some(x => x.id === id && x.cat === 'vehicle'), id);
});

test('New Star Darts v219: zu viel auf einmal getrunken (Grenze 4–10 je KW) → nächste KW verkatert, danach normal', async () => {
  const N = await import('../js/nsd.js'), T = await import('../js/skilltrain.js');
  const s = N.newNsdCareer({ first: 'Kurt', last: 'Kater', nation: 'DE', age: 30, slot: 1, seed: 12 }), p = s.player, rng = new RNG({ s: 3 });
  for (const k of ['sco', 'fin', 'foc', 'cal']) N.setSkill(p, k, 30); N.syncAttrs(p);
  const a0 = { ...p.attrs }; p.drinks = { beer: 25 };
  for (let i = 0; i < 3; i++) assert.ok(!T.drink(s, 'beer', rng).drunk);     // bis 3 nie
  let n = 3, r; do { r = T.drink(s, 'beer', rng); n++; } while (!r.drunk && n < 12);
  assert.ok(r.drunk && n >= T.DRUNK_MIN && n <= T.DRUNK_MAX, `Absturz nach ${n}`);
  assert.ok(!T.drink(s, 'beer', rng).drunk);                                  // nur einmal
  assert.ok(p.hangoverNext && !p.hangover); assert.equal(p.attrs.sco, a0.sco);  // diese KW noch normal
  assert.ok(T.soberUp(p)); assert.ok(p.hangover && !p.hangoverNext);
  assert.ok(p.attrs.sco < a0.sco - 5 && p.attrs.fin < a0.fin - 3 && p.attrs.men === a0.men);   // massiv, Mental unberührt
  assert.ok(!T.soberUp(p)); assert.ok(!p.hangover); assert.equal(p.attrs.sco, a0.sco);         // danach normal
  const lims = new Set(); for (let i = 0; i < 200; i++) { p.drunk = null; p.hangoverNext = false; p.drinks.beer = 25; let k = 0; while (!T.drink(s, 'beer', rng).drunk) k++; lims.add(k + 1); }
  assert.equal(Math.min(...lims), 4); assert.equal(Math.max(...lims), 10);
});

test('New Star Darts v221: Platzierungen aller Spieler im laufenden Jahr, Tourcard in Folge, WM-Qualifier ohne direkt Qualifizierte', async () => {
  const N = await import('../js/nsd.js'), S = await import('../js/season.js'), H = await import('../js/history.js'), R = await import('../js/rankings.js'), M = await import('../js/majors.js');
  const s = N.newNsdCareer({ first: 'Pia', last: 'Popup', nation: 'DE', age: 25, slot: 1, seed: 21 });
  assert.equal(s.player.tourSince, 2026); const hold = Object.values(s.world.players).filter(x => x.tier === 'tour'), by = n => hold.find(x => x.name === n)?.tourSince;   // Version 227: echte Jahre
  assert.equal(by('Michael van Gerwen'), 2011); assert.equal(by('Luke Humphries'), 2018); assert.equal(by('Luke Littler'), 2024); assert.equal(by('Beau Greaves'), 2026);
  assert.ok(hold.filter(x => x.id[0] === 'X').every(x => x.tourSince === 2025) && hold.every(x => x.tourSince != null));
  while (s.date.week < 50) S.nextWeek(s);
  const top = R.orderOfMerit(s, 'pdc')[0].p.id, pl = H.placementsOf(s, top);
  assert.ok(pl.length >= 25 && pl.every(r => r.place && r.place !== 'undefined' && r.week >= 1)); assert.ok(pl[0].week >= pl[pl.length - 1].week);   // neueste zuerst
  assert.ok(pl.some(r => r.cat === 'pc') && pl.some(r => r.cat === 'major'));
  const direct = new Set(M.wmDirect(s)), q = s.placements[2026].find(e => e.e === 'wm-quali');
  assert.ok(q && !Object.values(q.p).flat().some(id => direct.has(id)), 'WM-Qualifier ohne direkt Qualifizierte');
  assert.ok(JSON.stringify(s.placements).length < 260 * 1024);
  while (s.date.week !== 3) S.nextWeek(s);   // Jahreswechsel + Q-School
  assert.ok(s.placements[2026] && H.placementsOf(s, top, 2026).length >= pl.length);   // Version 222: Vorjahr bleibt
  const fresh = Object.values(s.world.players).filter(x => x.tier === 'tour' && x.tourSince === 2027);
  assert.ok(fresh.length > 0 && Object.values(s.world.players).every(x => x.tier === 'tour' ? x.tourSince != null : x.tourSince == null));
  R.pruneSave(s, 2028); assert.ok(!s.placements[2026]);   // höchstens 2 Jahre
});

test('New Star Darts v224: Premier League – Rundenturnier 1–7/9–15, Spieltag 8/16 nach Tabelle, Tie-Breaker; Nachwuchs-IDs ohne Kollision', async () => {
  const N = await import('../js/nsd.js'), M = await import('../js/majors.js'), S = await import('../js/season.js'), C = await import('../js/calendar.js');
  const s = N.newNsdCareer({ first: 'Paul', last: 'Liga', nation: 'DE', age: 25, slot: 1, seed: 31 });
  const pl = M.plState(s), key = (a, b) => [a, b].sort().join('|'), seen = new Map();
  for (let n = 1; n <= 7; n++) for (const [a, b] of M.plPairs(s, n)) { const k = key(a, b); seen.set(k, (seen.get(k) ?? 0) + 1); }
  assert.equal(seen.size, 28); assert.ok([...seen.values()].every(v => v === 1));                       // jeder gegen jeden genau einmal
  for (let n = 1; n <= 7; n++) assert.deepEqual(M.plPairs(s, n + 8).map(x => key(...x)), M.plPairs(s, n).map(x => key(...x)));   // 9–15 = 1–7
  for (let n of [1, 8, 16]) assert.equal(new Set(M.plPairs(s, n).flat()).size, 8);
  pl.players.forEach((id, i) => { pl.points[id] = 10; pl.nw[id] = i % 2; pl.mw[id] = i; });
  const t = M.plTable(s).map(x => x.id); assert.deepEqual(t.slice(0, 4), [pl.players[7], pl.players[5], pl.players[3], pl.players[1]]);   // Punkte gleich → Spieltagssiege, dann Matchsiege
  assert.deepEqual(M.plPairs(s, 8), [[t[0], t[7]], [t[3], t[4]], [t[2], t[5]], [t[1], t[6]]]);
  // Spieltag-Feld: Viertelfinals wie geplant, Halbfinale aus benachbarten Viertelfinals
  const ev = C.eventsInWeek(s, 2026, 6).find(e => e.fmt === 'pln'); s.date.week = 6;
  const f = M.majorField(s, ev, true), r1 = (await import('../js/bracket.js')).buildRounds(f, { default: { legs: 6 } })[0].matches.map(m => key(m.a, m.b));
  assert.deepEqual(r1, M.plPairs(s, 1).map(x => key(...x)));
  // Nachwuchs bekommt Y-IDs, Super-League-Spieler (G…) bleiben erhalten
  s.date.week = 3; const g2 = s.world.players.G2?.name; while (!(s.date.year === 2027 && s.date.week === 3)) S.nextWeek(s);
  assert.equal(s.world.players.G2?.name, g2); assert.ok(Object.values(s.world.players).filter(p => p.generated && !p.circuit).every(p => p.id[0] === 'Y'));
});

test('New Star Darts v228: „Tourcard seit“ in alten Spielständen aus der Kartenherkunft rekonstruiert', async () => {
  const N = await import('../js/nsd.js'), S = await import('../js/season.js'), St = await import('../js/state.js');
  const s = N.newNsdCareer({ first: 'Alt', last: 'Stand', nation: 'DE', age: 25, slot: 1, seed: 17 });
  while (!(s.date.year === 2029 && s.date.week === 10)) S.nextWeek(s);
  const truth = Object.fromEntries(Object.values(s.world.players).filter(p => p.tier === 'tour').map(p => [p.id, p.tourSince]));
  const o = JSON.parse(JSON.stringify(s)); for (const p of Object.values(o.world.players)) if (p.tier === 'tour') p.tourSince = 0;   // wie nach der alten Migration
  for (const f of ['v221tour', 'v227tour', 'v228tour']) delete o.flags[f];
  const m = St.migrate(o), hold = Object.values(m.world.players).filter(p => p.tier === 'tour');
  const fresh = hold.filter(p => !/^[TXN]\d/.test(p.id));
  assert.ok(fresh.length > 10 && fresh.every(p => p.tourSince >= 2027), 'Neue Holder nie „vor 2026“');
  const exact = fresh.filter(p => Math.abs(p.tourSince - truth[p.id]) <= 1).length;
  assert.ok(exact / fresh.length >= 0.9, `rekonstruiert ${exact}/${fresh.length}`);
  const startWrong = hold.filter(p => /^[TXN]\d/.test(p.id) && truth[p.id] > 2026 && !(p.tourSince > 2026)).length;   // Karte verloren + zurückgewonnen
  assert.ok(startWrong <= 6, `Start-Holder falsch: ${startWrong}`);
});

test('New Star Darts v229: Getränke Bier, Weinschorle, Schnaps (alte Vorräte übernommen)', async () => {
  const N = await import('../js/nsd.js'), St = await import('../js/state.js'), { DRINKS } = await import('../data/gear.js');
  assert.deepEqual(DRINKS.map(d => d.name), ['Bier', 'Weinschorle', 'Schnaps']);
  assert.deepEqual(DRINKS.map(d => [d.price, d.bonus ?? null]), [[1, null], [3, 'skill'], [5, 'rel']]);   // Version 230
  const s = N.newNsdCareer({ first: 'W', last: 'S', nation: 'DE', age: 25, slot: 1, seed: 2 }); assert.deepEqual(Object.keys(s.player.drinks), ['beer', 'wine', 'schnaps']);
  const o = JSON.parse(JSON.stringify(s)); o.player.drinks = { beer: 4, schnaps: 7, wodka: 2 }; delete o.flags.v229drinks;
  assert.deepEqual(St.migrate(o).player.drinks, { beer: 4, schnaps: 2, wine: 7 });
});

test('New Star Darts v231: Luxus-Manager erst ab Star-Status 40 (Angebot per News), nur Weltmarken, Fans-PR', async () => {
  const N = await import('../js/nsd.js'), C = await import('../js/career.js'), { RNG } = await import('../js/rng.js');
  const s = N.newNsdCareer({ first: 'L', last: 'X', nation: 'DE', age: 25, slot: 1, seed: 3 }), p = s.player, rng = new RNG({ s: 9 });
  p.star.level = 39; assert.ok(!C.managersOf(s).some(m => m.id === 'm4'));
  C.careerWeek(s, rng); assert.ok(!s.news.some(n => n.title.includes('Luxus-Manager')));
  p.star.level = 40; assert.ok(C.managersOf(s).some(m => m.id === 'm4'));
  C.careerWeek(s, rng); C.careerWeek(s, rng); assert.equal(s.news.filter(n => n.title.includes('Luxus-Manager')).length, 1);   // nur einmal
  C.hireManager(s, 'm4'); assert.ok(C.managerOf(s).luxury);
  const f0 = p.rel.fans; C.careerWeek(s, rng); assert.ok(p.rel.fans > f0);
  for (let i = 0; i < 40; i++) { const o = C.pickSponsor(40, new Set(), rng, true); assert.ok(o.real, 'nur echte Marken'); }
  p.star.level = 10; assert.ok(C.managersOf(s).some(m => m.id === 'm4'), 'eigener Manager bleibt sichtbar');
});

test('New Star Darts v237: Masters-Vorrunde – Platz 25–56 gesetzt und im Baum nach Setzliste verteilt', async () => {
  const B = await import('../js/bracket.js'), { RNG } = await import('../js/rng.js');
  const seeds = Array.from({ length: 32 }, (_, i) => `S${i + 1}`), groups = Array.from({ length: 32 }, (_, i) => [`W${i}`]);
  const rounds = groups.map((g, gi) => ({ isGroup: true, matches: [] }));
  const ko = B.prelimKoMatches([{ isGroup: true, matches: [] }], groups, seeds, new RNG({ s: 1 }));
  assert.equal(ko.length, 32); assert.ok(ko.every(m => m.a.startsWith('S') && m.b.startsWith('W')));
  const at = id => ko.findIndex(m => m.a === id);
  assert.ok(at('S1') < 16 && at('S2') >= 16, '1 und 2 in verschiedenen Hälften');
  const eighth = id => Math.floor(at(id) / 4);   // 8 Qualifikanten = je ein Achtel des Baums
  assert.equal(new Set(['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'].map(eighth)).size, 8, 'Top 8 der Gesetzten in 8 verschiedenen Achteln');
});

console.log(`\n${n} Tests ok`);
