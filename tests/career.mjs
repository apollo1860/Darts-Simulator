// Balancing: automatische Karriere (Q-School → CT/Dev → sonst lokal), Punkte auf sco/fin/con
import { newCareer } from '../js/state.js';
import { eventsInWeek } from '../js/calendar.js';
import { nextWeek } from '../js/season.js';
import { enterEvent, eventStatus, simulateRest, nextSub, closeEvent } from '../js/tournaments.js';
import { raiseAttr, overall, targetAverage } from '../js/player.js';
import { rankOf } from '../js/rankings.js';
const s = newCareer({ name: 'Bot', nation: 'DE', hand: 'R', seed: +(process.argv[2] || 3) });
const pref = ['qschool', 'dev', 'challenge', 'local'];
for (let y = 0; y < 6; y++) {
  const y0 = s.date.year, m0 = s.finance.prizeTotal;
  for (let w = 0; w < 52; w++) {
    const evs = eventsInWeek(s, s.date.year, s.date.week).filter(e => eventStatus(s, e).playable)
      .sort((a, b) => pref.indexOf(a.cat) - pref.indexOf(b.cat));
    // Reise nur, wenn danach noch 300 € Puffer
    const ev = evs.find(e => e.cat === 'local' || s.finance.balance - eventStatus(s, e).cost.total > 300);
    if (ev) { enterEvent(s, ev.id); for (;;) { simulateRest(s); if (!s.activeEvent.hasNext) break; nextSub(s); } closeEvent(s); }
    while (s.player.points > 0) { if (!['sco', 'fin', 'con', 'sco', 'ner', 'sta'].some(k => raiseAttr(s.player, k))) break; }
    nextWeek(s);
  }
  const p = s.player;
  console.log(`${y0}: Ø-Ziel ${targetAverage(p.attrs).toFixed(1)} OVR ${overall(p.attrs)} · Status ${p.tour}${p.cardUntil ? ' bis ' + p.cardUntil : ''} · Preisgeld ${Math.round(s.finance.prizeTotal - m0)} € · Konto ${Math.round(s.finance.balance)} € · CT-Rang ${p.qschoolYear === y0 ? rankOf(s, 'challenge', 'P', y0) ?? '-' : '-'}`);
}
