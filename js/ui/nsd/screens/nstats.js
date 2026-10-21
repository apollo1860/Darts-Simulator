// Statistik: Karriere und jede Saison (Matches, Siege, Average, 180er, Checkout, High Finish, Titel)
import { fmtNum } from '../../../util.js';
import { frame, header, titleBand, bar, bindHead } from '../frame.js';

export const nsd = true;
export function render(app) {
  const s = app.state, seasons = Object.keys(s.stats?.seasons ?? {}).map(Number).sort((a, b) => b - a);
  const cols = [['Karriere', s.stats.career], ...seasons.map(y => [String(y), s.stats.seasons[y]])];
  const avg = t => (t.darts ? fmtNum(t.points / t.darts * 3, 1) : '–');
  const co = t => (t.coAtt ? `${fmtNum(t.coHit / t.coAtt * 100, 1)} %` : '–');
  const rows = [['Matches', t => t.matches ?? 0], ['Siege', t => t.wins ?? 0], ['Legs', t => `${t.legsWon ?? 0}:${t.legsLost ?? 0}`],
    ['Average', avg], ['180er', t => t.s180 ?? 0], ['140+', t => t.s140 ?? 0], ['Checkout', co], ['High Finish', t => t.hiFinish || '–'],
    ['Bestes Leg', t => (t.bestLeg ? `${t.bestLeg} D.` : '–')], ['Turniere', t => t.events ?? 0], ['Titel', t => t.titles ?? 0]];
  return frame({
    cls: 'fixed', bg: 'grey',
    body: `${header(s.player.name)}${titleBand('Statistik')}<div class="nsd-scroll"><table class="nsd-table nsd-stats-t">
      <tr><th></th>${cols.map(([l]) => `<th>${l}</th>`).join('')}</tr>
      ${rows.map(([l, f]) => `<tr><td class="nm">${l}</td>${cols.map(([, t]) => `<td class="c">${f(t ?? {})}</td>`).join('')}</tr>`).join('')}
    </table></div>`,
    bottom: bar([{ go: 'hub', icon: '🏠', label: 'Start' }, { go: 'achievements', icon: '⭐', label: 'Erfolge' }, { go: 'league', icon: '🏆', label: 'Ranglisten', wide: true }]),
  });
}
export function mount(root, app) { bindHead(root, app, '<p>Deine Zahlen über die ganze Karriere und je Saison.</p>'); }
