import { newCareer } from '../js/state.js';
import { eventsInWeek, advanceWeek } from '../js/calendar.js';
import { enterEvent, playRound, nextRound, simulateRest, closeEvent } from '../js/tournaments.js';
import { raiseAttr, overall, targetAverage } from '../js/player.js';
const s = newCareer({ name: 'T', nation: 'DE', hand: 'R', seed: +process.argv[2] || 5 });
for (let y = 0; y < 3; y++) { let t=0, pr=0, w0 = s.stats.career.wins, m0 = s.stats.career.matches;
  for (let w = 0; w < 52; w++) {
    const l = eventsInWeek(s, s.date.year, s.date.week).find(e => e.cat === 'local');
    if (l) { enterEvent(s, l.id); while (s.activeEvent.playerAlive && !s.activeEvent.done) { playRound(s); nextRound(s); } if (!s.activeEvent.done) simulateRest(s); if (s.activeEvent.place==='W') t++; pr += s.activeEvent.prize; closeEvent(s); }
    while (s.player.points > 0) { const k = ['sco','fin','sco','con','ner','sta'].find(k => raiseAttr(s.player, k)); if (!k) break; }
    advanceWeek(s);
  }
  console.log(`Jahr ${y+1}: Titel ${t}, Preisgeld ${pr}, Siege ${s.stats.career.wins-w0}/${s.stats.career.matches-m0}, OVR ${overall(s.player.attrs)}, Avg ${targetAverage(s.player.attrs).toFixed(1)}, Punkte ${s.player.pointsEarned}`);
}
