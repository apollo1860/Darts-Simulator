// Node-Tests: node tests/run.mjs
import assert from 'node:assert/strict';
import { newCareer } from '../js/state.js';
import { overall } from '../js/player.js';
import { eventsInWeek } from '../js/calendar.js';
import { CALENDAR } from '../data/tournaments.js';
import { nextWeek, jumpToNextEvent } from '../js/season.js';
import { perf, xpForLevel, addXp, levelFromXp, MAX_LEVEL } from '../js/player.js';
import { migrate } from '../js/state.js';
import { liveDartStep, oppMatchDartVisit, boardCall, isBigTreble } from '../js/tournaments.js';
import * as ST from '../js/staff.js';
import * as FO from '../js/form.js';
import * as ET from '../js/tournaments.js';
import * as IV from '../js/interviews.js';
import * as RV from '../js/rival.js';
import * as MH from '../js/mishaps.js';
import * as MS from '../js/milestones.js';
import { book, levelPrice } from '../js/finance.js';
import { orderOfMerit, rankOf } from '../js/rankings.js';
import { playersOfTier, nonCardPros, getPlayer } from '../js/world.js';
import { majorField } from '../js/majors.js';
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
  assert.equal(Object.keys(s.world.players).length, 128 + 92 + 98 + 50 + 63 + 1 + 90);   // + Rivale + schwacher Pool
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
  // TCHQ direkt nach dem PC-Block: nur Übernachtung extra, 10 Qualifikanten, kein Preisgeld
  const tq = eventsInWeek(s, 2027, 6).find(e => e.id === 'etq-1');
  assert.ok(tq && tq.extra && tq.etId === 'et-1');
  const direct = ET.etDirect(s);
  if (direct.includes('P')) assert.equal(eventStatus(s, tq).playable, false);
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
  assert.equal(e.seeds.length, 16); assert.equal(e.pt.length, 16); assert.equal(e.tchq.length, 10);
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
  assert.ok(q.wmqSurvivors.length >= 2 && q.wmqSurvivors.every(id => q.wm.includes(id)));      // TCHQ: Restplätze, mind. 2
  assert.equal(Object.keys(q.wmReg).length, 17);                                            // 17 internationale Qualifier
  assert.equal(Object.values(q.wmReg).flat().length, 35); assert.ok(q.wmYouth);           // Europa 10, Asien/Ozeanien 14, Amerika/Afrika 7, Frauen 4
  assert.ok(q.wmReg.women.every(id => getPlayer(s, id).woman));
  assert.ok(q.wmReg.esl.every(id => ['DE', 'AT', 'CH'].includes(getPlayer(s, id).nation)));
  assert.ok(q.wm.slice(0, 32).every((id, i) => id === q.wmAuto[i]));                       // Top 32 PDC gesetzt
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

test('Wochenplan: 1 Aktivität, Ruhetag, Sponsortermin, Exhibition, Ermüdung, Sprung', () => {
  const s = newCareer({ name: 'Test', nation: 'DE', hand: 'R', seed: 81 });
  assert.equal(TR.canDo(s, 'sponsor').ok, false);                   // kein Sponsor
  assert.equal(TR.doActivity(s, 'exhibition').ok, false);           // ohne Angebot / ohne Karte
  s.player.tour = 'tour'; s.player.level = 30;
  for (let i = 0; i < 40 && !TR.exOffer(s); i++) TR.exhibitionWeek(s);
  const fee = TR.exOffer(s).fee;
  assert.ok(fee >= 1700 && fee <= 2650, 'Gage ' + fee);            // (400 + 60·30) × 0,8–1,2
  const r = TR.doActivity(s, 'exhibition');
  assert.ok(r.ok && s.player.fatigue === 20 && s.finance.balance === 5000 + fee && !TR.exOffer(s));
  s.player.tour = 'none';
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

test('Training: XP + Turniervorbereitung (+3, 2 Wochen), schwächerer Formverlust', () => {
  const s = newCareer({ name: 'T', nation: 'DE', hand: 'R', seed: 9 }), p = s.player;
  const r = TR.train(s, 'fin');
  assert.ok(r.xp >= 10 && p.xpTotal === r.xp);
  assert.deepEqual(p.prep, { key: 'fin', bonus: 3, weeks: 2 });
  assert.equal(perf(p).fin, p.attrs.fin + 3);
  nextWeek(s); assert.equal(p.prep.weeks, 1);                       // nächste Woche noch aktiv
  nextWeek(s); assert.equal(p.prep, undefined); assert.equal(perf(p).fin, p.attrs.fin);
  p.level = 30; assert.ok(TR.trainingXp(p) > 40);                   // wächst mit dem Level
  assert.equal(TR.DECAY_AFTER, 6);
});

test('Team: Manager-Provision, Sponsor-/Exhibition-Boni, Trainer 1 Jahr', () => {
  const s = newCareer({ name: 'T', nation: 'DE', hand: 'R', seed: 12 });
  assert.equal(ST.hireManager(s, 'm1'), false);                     // erst ab Tourcard
  s.player.tour = 'tour'; s.player.cardUntil = 2028; s.player.everTourcard = true;
  assert.equal(ST.hireManager(s, 'm3'), false);                     // Top 16 nötig
  assert.ok(ST.hireManager(s, 'm1'));
  const b0 = s.finance.balance;
  book(s, 1000, 'Preisgeld Test', 'prize');
  assert.equal(s.finance.balance, b0 + 900);                        // 10 % Provision
  book(s, -50, 'Reise', 'travel'); assert.equal(s.finance.balance, b0 + 850);   // Ausgaben ohne Provision
  let gigs = 0;
  for (let i = 0; i < 30; i++) { nextWeek(s); gigs += ST.staffOf(s).gigs.length ? 1 : 0; const g = ST.staffOf(s).gigs[0]; if (g) assert.ok(ST.acceptGig(s, g.id).fee > 0); }
  assert.ok(gigs >= 2, 'Einladungen ' + gigs);
  s.finance.balance = 10000;
  assert.ok(ST.hireCoach(s, 'c2')); assert.equal(s.finance.balance, 4000);
  assert.equal(ST.xpMult(s), 1.2); assert.equal(ST.hireCoach(s, 'c1'), false);   // nur einer gleichzeitig
  { const e = eventsInWeek(s, s.date.year, s.date.week).find(x => x.cat === 'local'); const x0 = s.player.xpTotal; s.week.blocked = null; s.milestones = Object.fromEntries(MS.MILESTONES.map(m => [m.id, {}]));   // Meilenstein-XP ausklammern
    enterEvent(s, e.id); simulateRest(s); assert.equal(s.activeEvent.xp, s.player.xpTotal - x0, 'Anzeige = gutgeschriebene XP'); closeEvent(s); }
  for (let i = 0; i < 52; i++) nextWeek(s);
  assert.equal(ST.coachActive(s), null); assert.equal(ST.xpMult(s), 1);
});

test('Bühne: Erfahrung zählt in Majors/gegen große Namen; Selbstvertrauen', () => {
  const inst = { cat: 'major', eventId: 'wm', current: 0, rounds: [{ remaining: 64 }], big: [] };
  assert.equal(FO.stageFactor(inst, 'P', 'T1'), 1);
  inst.rounds[0].remaining = 8; assert.equal(FO.stageFactor(inst, 'P', 'T1'), 1.5);
  const pc = { cat: 'pc', current: 0, rounds: [{ remaining: 64 }], big: ['T1'] };
  assert.equal(FO.stageFactor(pc, 'P', 'T1'), 0.7); assert.equal(FO.stageFactor(pc, 'P', 'T99'), 0);
  const rook = FO.applyStage({ sco: 80, fin: 80, men: 80, foc: 80, exp: -4 }, 1.5), vet = FO.applyStage({ sco: 80, fin: 80, men: 80, foc: 80, exp: 10 }, 1.5);
  assert.ok(rook.sco < 76 && vet.sco > 84);
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

test('Interview nach Major: 25 Floskeln, 4–6 Reihenfolge, Belohnung', () => {
  const s = newCareer({ name: 'I', nation: 'DE', hand: 'R', seed: 31 });
  assert.equal(IV.maybeInterview(s, { cat: 'pc', place: 'W', name: 'PC 1' }), null);          // nur Majors
  const iv = IV.maybeInterview(s, { cat: 'major', eventId: 'wm', place: 'W', name: 'Weltmeisterschaft' });
  assert.ok(iv && iv.tiles.length === 25 && new Set(iv.tiles).size === 25 && iv.seq.length === 6);
  const x0 = s.player.xpTotal, c0 = s.player.clutch ?? 0;
  const r = IV.resolveInterview(s, [...iv.seq]);
  assert.ok(r.ok && s.player.xpTotal - x0 === r.xp && (s.player.clutch ?? 0) - c0 === 18);
  assert.equal(s.interview, null);
  let n = 0;
  for (let i = 0; i < 40; i++) { const v = IV.maybeInterview(s, { cat: 'major', eventId: 'masters', place: 'L16', name: 'M' }); if (v) { n++; assert.ok(v.seq.length >= 4 && v.seq.length <= 5); IV.skipInterview(s); } }
  assert.ok(n > 3 && n < 20, 'nur manchmal ' + n);
  const v = IV.maybeInterview(s, { cat: 'major', eventId: 'wm', place: 'W', name: 'WM' });
  assert.equal(IV.resolveInterview(s, [v.seq[1]]).ok, false);                                // falsche Reihenfolge
});

test('Erholung kaufen: Sauna/Massage, Preis 50–100 €, je 1× pro Woche', () => {
  const s = newCareer({ name: 'E', nation: 'DE', hand: 'R', seed: 41 });
  assert.equal(TR.canRecover(s, 'sauna').ok, false);                // ausgeruht
  s.player.fatigue = 40;
  const pr = TR.recoveryPrice(s, 'massage'), b0 = s.finance.balance;
  assert.ok(pr >= 50 && pr <= 100 && pr === TR.recoveryPrice(s, 'massage'));   // pro Woche fest
  assert.ok(TR.buyRecovery(s, 'massage').ok); assert.equal(s.player.fatigue, 25); assert.equal(s.finance.balance, b0 - pr);
  assert.ok(TR.buyRecovery(s, 'sauna').ok); assert.equal(s.player.fatigue, 15);
  assert.equal(TR.buyRecovery(s, 'sauna').ok, false);               // 1× pro Woche
  assert.equal(TR.train(s, 'sco') !== null, true);                  // Wochenaktivität bleibt frei
  nextWeek(s); assert.ok(TR.canRecover(s, 'sauna').ok);
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
  assert.equal(eventStatus(s, eventsInWeek(s, 2027, 10).find(e => e.id === 'wdf-iom')).playable, false);   // mit Karte gesperrt
  s.player.tour = 'none'; s.week = { played: true }; s.date.week = 16;
  nextWeek(s);                                                                                    // KI-WDF im Hintergrund
  assert.ok(s.champions[2027].some(c => c.eventId === 'wdf-estonia'));
  for (let w = 1; w <= 52; w++) assert.ok(eventsInWeek(s, 2027, w).filter(e => e.cat === 'wdf').length <= 1, 'KW ' + w);   // max. 1 WDF pro Woche
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

test('WM-Qualifier (Q-School-Teilnehmer): KW 46, nur mit Q-School, Sieger in der WM', () => {
  const s = newCareer({ name: 'Q', nation: 'DE', hand: 'R', seed: 93 });
  s.date.week = 46;
  const ev = eventsInWeek(s, 2027, 46).find(e => e.id === 'wm-qs');
  assert.ok(ev);
  assert.equal(eventStatus(s, ev).playable, false);                 // ohne Q-School
  s.player.qschoolYear = 2027;
  assert.ok(eventStatus(s, ev).playable);
  s.week = { played: true, eventId: 'x' };
  nextWeek(s);                                                      // läuft im Hintergrund
  const w = s.qual[2027].wmQsWinner;
  assert.ok(w && getPlayer(s, w).tier !== 'tour');
  while (s.date.week < 51) nextWeek(s);
  assert.ok(majorField(s, eventsInWeek(s, 2027, 51).find(e => e.id === 'wm'), false).includes(w));
});

test('Zufallsereignisse: Trainingsrückschlag oder Ausfall (Turniere gesperrt), Schule nur bis 18', () => {
  let hits = 0, blocked = 0, school = 0;
  for (let i = 0; i < 4000; i++) {
    const s = { rng: { s: 1000 + i }, player: { age: i % 2 ? 17 : 25 }, week: {}, training: { progress: { sco: 0.9, fin: 0.9, men: 0.9, foc: 0.9, cal: 0.9 } }, news: [], date: { year: 2027, week: 5 } };
    const m = MH.mishapWeek(s);
    if (!m) continue;
    hits++; if (m.blocked) { blocked++; assert.ok(s.week.blocked); } else assert.ok(Object.values(s.training.progress).some(v => v < 0.61));
    if (m.id === 'school') { school++; assert.equal(s.player.age, 17); }
  }
  assert.ok(hits > 200 && hits < 400, 'Treffer ' + hits);           // ~7 %
  assert.ok(blocked / hits > 0.15 && blocked / hits < 0.35);
  assert.ok(school > 0);
  const t = newCareer({ name: 'M', nation: 'DE', hand: 'R', seed: 5 });
  t.week.blocked = { id: 'cold', label: 'Erkältung' };
  const loc = eventsInWeek(t, 2027, 1).find(e => e.cat === 'local');
  assert.equal(eventStatus(t, loc).playable, false);
});

test('Meilensteine: einmalig, Extra-XP, Match/Titel/Rang', () => {
  const s = newCareer({ name: 'M', nation: 'DE', hand: 'R', seed: 95 });
  const x0 = s.player.xpTotal;
  MS.matchMilestones(s, { s180: 1, bestLeg: 11, points: 505, darts: 15 }, true);   // 101 Ø
  assert.ok(['win', 's180', 'd12', 'd11', 'avg100'].every(id => MS.reached(s, id)));
  assert.ok(!MS.reached(s, 'd10') && !MS.reached(s, 'avg110'));
  assert.equal(s.player.xpTotal - x0, 30 + 50 + 120 + 250 + 300);
  const x1 = s.player.xpTotal;
  MS.matchMilestones(s, { s180: 3, bestLeg: 12, points: 330, darts: 9 }, true);    // nichts Neues außer 110er Avg
  assert.equal(s.player.xpTotal - x1, 800);
  MS.titleMilestones(s, { place: 'W', cat: 'wdf' }); assert.ok(MS.reached(s, 'wdf'));
  MS.titleMilestones(s, { place: 'F', cat: 'dev' }); assert.ok(!MS.reached(s, 'dev'));
  MS.titleMilestones(s, { place: 'W', cat: 'major', eventId: 'wm-quali' }); assert.ok(!MS.reached(s, 'major'));
  // im echten Turnier: lokaler Sieg wird erkannt (starker Spieler, damit es sicher klappt)
  s.player.attrs = { sco: 88, fin: 88, men: 88, foc: 88, cal: 88 };
  for (let i = 0; i < 20 && !MS.reached(s, 'local'); i++) {
    const e = eventsInWeek(s, s.date.year, s.date.week).find(x => x.cat === 'local');
    if (e && !s.week.blocked) { enterEvent(s, e.id); simulateRest(s); closeEvent(s); }
    nextWeek(s);
  }
  assert.ok(MS.reached(s, 'local'));
});

test('Formverlust je Attribut: jedes Attribut mind. 1× in 6 Wochen trainieren', () => {
  const keys = ['sco', 'fin', 'men', 'foc', 'cal'];
  // reihum trainieren (alle 5 Wochen jedes Attribut) → kein Verlust
  const a = newCareer({ name: 'A', nation: 'DE', hand: 'R', seed: 97, bonus: { sco: 25 } });
  for (let w = 0; w < 30; w++) { a.week.blocked = null; TR.train(a, keys[w % 5]); nextWeek(a); }
  assert.equal(TR.trainingOf(a).lost, 0);
  assert.ok(Object.values(TR.idleOf(a)).every(v => v < 6));
  // nur Scoring trainieren → die anderen vier verlieren, Scoring nicht
  const b = newCareer({ name: 'B', nation: 'DE', hand: 'R', seed: 98, bonus: { sco: 10, fin: 10, foc: 5 } });
  const before = { ...b.player.attrs };
  let scoUps = 0;
  for (let w = 0; w < 20; w++) { const r = TR.train(b, 'sco'); if (r?.up) scoUps++; nextWeek(b); }
  assert.ok(TR.trainingOf(b).lost >= 4, 'Verluste ' + TR.trainingOf(b).lost);
  assert.equal(b.player.attrs.sco, before.sco + scoUps);              // trainiertes Attribut verliert nie
  assert.ok(['fin', 'men', 'foc', 'cal'].filter(k => b.player.attrs[k] < before[k]).length >= 3);
  assert.equal(TR.idleOf(b).sco, 0); assert.equal(TR.idleOf(b).fin, 20);
  assert.equal(TR.mostOverdue(b) !== 'sco', true);
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

test('Wohnen & Auto: Auszug mit 18, Jahresmiete, Effekte, Auto-Rabatt', async () => {
  const H = await import('../js/home.js');
  const { weeklyRecovery } = await import('../js/training.js');
  const s = newCareer({ name: 'W', nation: 'DE', hand: 'R', seed: 41 });
  assert.equal(H.chooseHome(s, 'wg').ok, false);                         // mit 16 noch bei den Eltern
  assert.equal(H.buyCar(s, 'small').ok, false);
  s.player.age = 18; s.finance.balance = 100000; H.homeWeek(s);
  assert.ok(s.moveOut && s.moveOut.week >= 2 && s.moveOut.week <= 50 && !H.moveDue(s));
  s.date.week = s.moveOut.week; H.homeWeek(s); assert.ok(H.moveDue(s));
  s.date.week += 2; H.homeWeek(s);                                        // keine Wahl → Wohnheim
  assert.equal(s.player.home.id, 'dorm'); assert.equal(s.finance.balance, 100000 - 200);
  const a0 = perf({ ...s.player, home: null }), a1 = perf(s.player);
  assert.equal(a1.sco, a0.sco - 1); assert.equal(a1.cal, a0.cal - 1);    // Wohnheim: leichtes Minus
  s.player.level = 51;
  assert.equal(H.rentOf(H.HOMES[0], 51), 200); assert.equal(H.rentOf(H.HOMES[4], 51), 75000);   // Preise steigen, Wohnheim nicht
  const b = s.finance.balance; assert.ok(H.chooseHome(s, 'villa').ok); assert.equal(s.finance.balance, b - 75000);
  s.player.fatigue = 50; s.player.momentum = 0; weeklyRecovery(s);
  assert.equal(s.player.fatigue, 34); assert.equal(s.player.momentum, 0.6);
  // Auto: Reiserabatt, Wechsel mit 30 % Inzahlungnahme, Wartung in KW 1
  const ev = { cat: 'challenge', country: 'ENG', count: 1 };
  assert.equal(H.buyCar(s, 'mid').ok, true); assert.equal(s.player.car.paid, 22500);
  assert.equal(eventCost(ev, null, 51, H.travelMult(s.player)).travel, 810);
  const b2 = s.finance.balance; assert.ok(H.buyCar(s, 'small').ok); assert.equal(s.finance.balance, b2 + 6750 - 6000);
  s.finance.balance = 200000; s.date.year++; s.date.week = 1; const b3 = s.finance.balance; H.homeWeek(s);
  assert.equal(s.finance.balance, b3 - 75000 - 600);                      // Villa-Miete + Wartung Kleinwagen
  s.finance.balance = 1000; s.date.year++; H.homeWeek(s);                 // Villa zu teuer → günstigere Wohnung
  assert.equal(s.player.home.id, 'wg'); assert.equal(s.finance.balance, 1000 - 600 - 600);
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

test('Formtiefs: Serie, Blamage, Ruhetag, Titel, Auslöser', async () => {
  const SL = await import('../js/slump.js');
  const s = newCareer({ name: 'F', nation: 'DE', hand: 'R', seed: 61 }), p = s.player;
  const inst = { cat: 'challenge' }, opp = { attrs: { ...p.attrs } };
  for (let i = 0; i < 3; i++) SL.slumpAfterMatch(s, inst, false, opp);
  assert.ok(!p.slump);
  SL.slumpAfterMatch(s, { cat: 'local' }, false, opp); assert.ok(!p.slump);        // lokal zählt nicht
  SL.slumpAfterMatch(s, inst, false, opp);
  assert.equal(p.slump.id, 'streak'); assert.equal(p.lossStreak, 0);
  const base = perf({ ...p, slump: null }), low = perf(p);
  assert.equal(low.sco, base.sco - 2); assert.equal(low.foc, base.foc - 2); assert.equal(low.cal, base.cal);
  SL.slumpRest(p); assert.equal(p.slump.weeks, 2);
  SL.slumpTitle(s, 'local'); assert.ok(p.slump);                                    // lokaler Titel hilft nicht
  SL.slumpTitle(s, 'challenge'); assert.equal(p.slump, null);
  // Auslöser: ausgebrannt (Ermüdung) – Häufigkeit
  let n = 0;
  for (let i = 0; i < 400; i++) { p.slump = null; p.fatigue = 90; p.momentum = 0; if (SL.slumpWeek(s)?.id === 'burnout') n++; }
  assert.ok(n > 60 && n < 150, `burnout ${n}`);
  p.slump = { id: 'sleep', weeks: 1, malus: 2 }; SL.slumpWeek(s); assert.equal(p.slump, null);   // läuft ab
});

test('Einmalige Kosten bei hohem Vermögen', async () => {
  const EX = await import('../js/expenses.js');
  assert.equal(EX.expenseChance(9000), 0);
  assert.ok(Math.abs(EX.expenseChance(100000) - 0.06) < 1e-9 && EX.expenseChance(1e9) === 0.12);
  const s = newCareer({ name: 'E', nation: 'DE', hand: 'R', seed: 62 });
  s.finance.balance = 5000; for (let i = 0; i < 100; i++) assert.equal(EX.expenseWeek(s), null);
  let hits = 0, maxShare = 0;
  for (let i = 0; i < 2000; i++) {
    s.finance.balance = 500000; const e = EX.expenseWeek(s);
    if (e) { hits++; maxShare = Math.max(maxShare, e.amount / 500000); assert.ok(!e.needCar && !e.needHome); }
  }
  assert.ok(hits > 60 && hits < 200, `hits ${hits}`); assert.ok(maxShare <= 0.12 && maxShare > 0.03);
});

test('Startalter wählbar: Erfahrung, Rivale, Dev-Tour', async () => {
  const PL = await import('../js/player.js');
  const a = newCareer({ name: 'A', nation: 'DE', hand: 'R', seed: 70, age: 24 });
  assert.equal(a.player.age, 24); assert.equal(a.player.exp, PL.startExp(24)); assert.equal(PL.startExp(24), 0);
  assert.equal(PL.startExp(16), -4); assert.equal(PL.startExp(30), 3);
  assert.equal(a.world.players.R1.age, 24); assert.equal(a.world.players.R1.tier, 'challenge');
  assert.equal(newCareer({ name: 'B', nation: 'DE', hand: 'R', seed: 70, age: 99 }).player.age, 30);   // begrenzt
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
  assert.equal(s.mode, 'nsd'); assert.equal(p.name, 'Benny Buchse'); assert.equal(p.tour, 'tour'); assert.equal(p.cardUntil, 2028);
  assert.equal(s.stars, N.START_STARS); assert.equal(p.energy, 100); assert.equal(p.star.level, 1);
  assert.equal(N.skillValue(p, 'sco'), 0); assert.equal(N.skillValue(p, 'men'), 1);           // Mental = Star-Status
  assert.equal(p.attrs.sco, 85); assert.equal(p.attrs.men, 85.3);
  N.setStartSkills(p, { sco: 3, fin: 2, foc: 0, cal: 1 });
  assert.equal(N.skillValue(p, 'sco'), 3); assert.equal(p.attrs.sco, 85.8); assert.equal(N.skillLevel(p, 'fin'), 1);
  p.skills.sco = Array(20).fill(3); N.syncAttrs(p); assert.equal(p.attrs.sco, 100);           // 60 = Weltspitze
  p.star.level = 80; assert.equal(N.mentalOf(p), 60);                                         // Mental max. 60
  assert.equal(N.starFactor(1), 1); assert.equal(N.starPrice(20, 21), 40);                    // +5 % je Stufe
  // keine lokalen/Amateur-Turniere, Pro Tour spielbar
  const w1 = eventsInWeek(s, 2027, 1);
  assert.ok(w1.some(e => e.cat === 'local') && !w1.filter(e => shownTo(s, e)).some(e => e.cat === 'local'));
  assert.equal(eventStatus(s, w1.find(e => e.cat === 'local')).playable, false);
  s.date.week = 6;
  assert.ok(eventStatus(s, eventsInWeek(s, 2027, 6).find(e => e.cat === 'pc')).playable);
  assert.ok(orderOfMerit(s, 'pdc').some(x => x.p.id === 'P'));
  p.skills.sco = Array(20).fill(1); nextWeek(s); assert.equal(p.attrs.sco, 85 + 0.25 * 20);   // Woche synchronisiert Attribute
});

test('New Star Darts: ★-Preisgeld, Energie, Star-Status, Note, Schlüsselmomente', async () => {
  const N = await import('../js/nsd.js');
  const s = N.newNsdCareer({ first: 'Benny', last: 'Buchse', nation: 'DE', age: 18, slot: 1, seed: 9 });
  const p = s.player;
  // Ranglisten in Basis-★ (Startwerte umgerechnet), Preistabellen
  const top = orderOfMerit(s, 'pdc')[0];
  assert.ok(top.money > 500 && top.money < 6000, `Top-OOM ${top.money}`);
  assert.deepEqual(N.starPrizeTable('pc'), { W: 20, F: 10, SF: 5, QF: 2.4, L16: 1.2, L32: 0.8, L64: 0.4, G3: 1, G4: 0.5 });
  assert.equal(N.STAR_PRIZE_WIN.wm, 2 * N.STAR_PRIZE_WIN.matchplay);
  assert.equal(N.starPayout(0.4, 1), 1); assert.equal(N.starPayout(0, 1), 0); assert.equal(N.starPayout(20, 21), 40);
  // Star-Status: Sieg ≈ 10–15 % auf Status 1, Niederlage kleiner, nie unter die Stufe
  const win = N.starMatchDelta(1, { won: true, my: 6, opp: 4, to: 6, avg: 88, cat: 'pc' });
  assert.ok(win >= 10 && win <= 15, `Sieg ${win}`);
  assert.ok(N.starMatchDelta(1, { won: true, my: 6, opp: 0, to: 6, avg: 100, cat: 'pc' }) > win);
  const loss = N.starMatchDelta(1, { won: false, my: 0, opp: 6, to: 6, avg: 80, cat: 'pc' });
  assert.ok(loss < 0 && -loss < win && N.starMatchDelta(1, { won: false, my: 5, opp: 6, to: 6, avg: 80, cat: 'pc' }) > loss);
  N.addStarProgress(s, 105); assert.equal(p.star.level, 2); assert.equal(p.attrs.men, 85.5);
  N.addStarProgress(s, -50); assert.equal(p.star.level, 2); assert.equal(p.star.xp, 0);
  assert.ok(N.starNeed(50) > N.starNeed(10));
  assert.ok(N.matchRating({ won: true, avg: 100, coPct: 0.5, s180: 4, my: 6, opp: 1 }) > N.matchRating({ won: false, avg: 80, coPct: 0.2, my: 1, opp: 6 }));
  // Energie: Malus erst unter 20 %, wächst je Leg
  assert.equal(N.energyMalus(25), 0); assert.ok(N.energyMalus(10, 5) > N.energyMalus(10, 0));
  // PC spielen: keine Reisekosten, ★ nur bei Sieg, Energie sinkt
  s.date.week = 6;
  const pc = eventsInWeek(s, 2027, 6).find(e => e.cat === 'pc');
  assert.equal(eventStatus(s, pc).cost.total, 0);
  const stars0 = s.stars, e0 = p.energy;
  enterEvent(s, pc.id);
  playRound(s); nextRound(s);
  assert.ok(p.energy < e0);
  const lm = s.activeEvent.lastMatch;
  assert.ok(lm.rating >= 1 && lm.rating <= 10 && typeof lm.star === 'number');
  simulateRest(s);
  const inst = s.activeEvent, wins = inst.rounds.reduce((n, r) => n + r.matches.filter(m => m.winner === 'P' && !m.bye).length, 0);
  assert.equal(s.stars - stars0, wins ? N.starPayout(inst.prize, p.star.level) : 0);
  assert.equal(s.finance.balance, 5000);                                   // € unberührt
  assert.equal(s.results[0].stars, s.stars - stars0);
  closeEvent(s);
  const eW = p.energy; nextWeek(s); assert.equal(p.energy, Math.min(100, eW + N.ENERGY_WEEK));
  // Schlüsselmomente im Live-Match
  s.date.week = 7; s.week = { played: false, eventId: null };
  const pc2 = eventsInWeek(s, 2027, 7).find(e => e.cat === 'pc') ?? eventsInWeek(s, 2027, 8).find(e => e.cat === 'pc');
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
  assert.equal(T.calcTime(5), null); assert.equal(T.calcTime(6), 20); assert.equal(T.calcTime(20), 8);
  assert.ok(T.memoryPreview(1) > T.memoryPreview(20));
  assert.ok(T.validFinish(['T20', 'D6'], 72)); assert.ok(!T.validFinish(['T20', 'S12'], 72)); assert.ok(!T.validFinish(['T20', 'T4'], 72));
  assert.ok(T.validFinish(['BULL'], 50)); assert.ok(T.validFinish(['S19', 'D1'], 21)); assert.ok(!T.validFinish(['S20', 'D1'], 21));
  const rng = new RNG({ s: 3 });
  for (let L = 1; L <= 20; L++) { const r = T.calcTask(rng, L), [lo, hi] = T.calcRange(L); assert.ok(r >= lo && r <= hi && T.validFinish(checkoutRoute(r, 3), r)); }
  // Einstufung (ohne Energie), Punkte = 3/2/1 je Versuch, bestes Ergebnis zählt
  T.finishTraining(s, 'sco', 1, 2, { placement: true });
  T.finishTraining(s, 'fin', 1, 0, { placement: true });
  assert.equal(N.skillValue(p, 'sco'), 2); assert.equal(N.skillValue(p, 'fin'), 0); assert.equal(p.energy, 100);
  assert.equal(p.attrs.sco, 85.5);
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
  T.drink(s, 'beer', rng); assert.equal(p.energy, 65);
  T.buyDrink(s, 'wodka'); const fans = p.rel.fans; const r = T.drink(s, 'wodka', rng);
  assert.equal(p.buzz, 3); assert.equal(p.attrs.sco, 85 + 0.25 * 6); assert.equal(p.attrs.men, 85.3);   // kein Mental-Bonus
  assert.equal(r.rel, 'fans'); assert.equal(p.rel.fans, fans + 1);
  assert.throws(() => T.drink(s, 'schnaps', rng));
  p.star.level = 21; assert.equal(T.drinkPrice({ price: 5 }, 21), 10);
  // Darts: Bonus solange ausgerüstet
  s.stars = 1000; T.buyDarts(s, 't80'); assert.equal(p.gear.id, 't80'); assert.equal(N.skillEffective(p, 'sco'), 3 + 3 + 2);
  T.soberUp(p); assert.equal(p.buzz, 0); assert.equal(p.attrs.sco, 86.3);
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
  assert.equal(L.weeklyEnergy(p), 40 + 2);                                   // Zufriedenheit 60 → +2
  L.buyItem(s, 'flat'); L.buyItem(s, 'townhouse'); L.buyItem(s, 'console');
  assert.throws(() => L.buyItem(s, 'flat'), /Schon/);
  assert.equal(L.lifestyleOf(p), 6 + 12 + 3); assert.equal(L.homeRegen(p), 10);
  assert.equal(s.stars, 1000 - 90 - 320 - 12 + 5);                          // + Erfolg „Eigene Immobilie“
  p.star.level = 21; assert.equal(L.itemPrice({ price: 90 }, 21), 180); p.star.level = 1;
  assert.ok(s.achievements.home && s.achievements.wheels === undefined);
  // Ereignisse: Bedingungen, Kosten, Zufall
  for (const e of LIFE_EVENTS) for (const o of e.opts) assert.ok(o.label && (o.out || o.chance), e.id);
  s.lifeEvent = { id: 'meet', name: 'Lena' };
  const v = L.lifeEventView(s); assert.ok(v.text.includes('Lena') && v.opts[0].cost === 2);
  let r; do { s.lifeEvent = { id: 'meet', name: 'Lena' }; r = L.resolveLifeEvent(s, 0, rng); } while (!(p.rel.partner > 0));
  assert.equal(p.partnerName, 'Lena'); assert.equal(s.lifeEvent, null); assert.ok(s.achievements.love);
  assert.ok(LIFE_EVENTS.find(e => e.id === 'dinner').if(p));
  s.lifeEvent = { id: 'family' }; const e0 = p.energy; p.energy = 50; r = L.resolveLifeEvent(s, 0, rng);
  assert.equal(p.energy, 60); assert.ok(r.changes.some(c => c.includes('Energie +10')));
  s.stars = 0; s.lifeEvent = { id: 'birthday' }; assert.throws(() => L.resolveLifeEvent(s, 0, rng), /★/); void e0;
  // Woche: Freundin −1, Zufriedenheit Richtung Ziel, Karte mit 35 %
  s.lifeEvent = null; p.rel.partner = 1; L.lifeWeek(s, rng);
  assert.equal(p.rel.partner, 0); assert.equal(p.partnerName, null); assert.ok(s.news.some(n => n.title.includes('Schluss')));
  p.satisfaction = 0; L.lifeWeek(s, rng); assert.ok(p.satisfaction > 0);
  let n = 0; for (let i = 0; i < 200; i++) { s.lifeEvent = null; if (L.rollLifeEvent(s, rng)) n++; }
  assert.ok(n > 40 && n < 100, `Ereignisse ${n}`);
  // Wochen-Erholung in nextWeek
  s.lifeEvent = null; p.energy = 10; p.satisfaction = 50; const before = p.energy; nextWeek(s);
  assert.equal(p.energy, before + 40 + 10);
});

console.log(`\n${n} Tests ok`);
