// Balancing: automatische Karriere (Q-School → CT/Dev → sonst lokal), Punkte auf sco/fin/con
import { newCareer } from '../js/state.js';
import { eventsInWeek } from '../js/calendar.js';
import { nextWeek } from '../js/season.js';
import { enterEvent, eventStatus, simulateRest, nextSub, closeEvent } from '../js/tournaments.js';
import { raiseAttr, overall, targetAverage } from '../js/player.js';
import { rankOf } from '../js/rankings.js';
import { train } from '../js/training.js';
const noTrain = process.argv[3] === 'ohne';
const s = newCareer({ name: 'Bot', nation: 'DE', hand: 'R', seed: +(process.argv[2] || 3) });
const pref = ['qschool', 'et', 'pc', 'ddv', 'dev', 'challenge', 'local'];
for (let y = 0; y < 8; y++) {
  const y0 = s.date.year, m0 = s.finance.prizeTotal;
  for (let w = 0; w < 52; w++) {
    const evs = eventsInWeek(s, s.date.year, s.date.week).filter(e => eventStatus(s, e).playable)
      .sort((a, b) => pref.indexOf(a.cat) - pref.indexOf(b.cat));
    // Reise nur, wenn danach noch 300 € Puffer
    const ev = evs.find(e => e.cat === 'local' || s.finance.balance - eventStatus(s, e).cost.total > 300);
    if (ev) { enterEvent(s, ev.id); for (;;) { simulateRest(s); if (!s.activeEvent.hasNext) break; nextSub(s); } closeEvent(s); }
    while (s.player.points > 0) { if (!['sco', 'fin', 'men', 'foc', 'cal'].sort((a, b) => s.player.attrs[a] - s.player.attrs[b] + (a === 'sco' ? -3 : 0)).some(k => raiseAttr(s.player, k))) break; }
    if (!noTrain) train(s, ['sco', 'fin', 'men', 'foc', 'cal'].sort((a, b) => s.player.attrs[a] - s.player.attrs[b])[0]);
    nextWeek(s);
  }
  const p = s.player;
  console.log(`${y0}: XP ${p.xpTotal} Lv ${p.level ?? "-"} Pkt ${p.pointsEarned} · Ø-Ziel ${targetAverage(p.attrs).toFixed(1)} OVR ${overall(p.attrs)} [${Object.values(p.attrs).join('/')}] ERF ${p.exp} · Status ${p.tour}${p.cardUntil ? ' bis ' + p.cardUntil : ''} · Preisgeld ${Math.round(s.finance.prizeTotal - m0)} € · Konto ${Math.round(s.finance.balance)} € · CT-Rang ${p.qschoolYear === y0 ? rankOf(s, 'challenge', 'P', y0) ?? '-' : '-'} · PDC-Rang ${p.tour === 'tour' ? rankOf(s, 'pdc', 'P', s.date.year) : '-'}`);
}
