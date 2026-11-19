// Statistik: Karriere und jede Saison (Matches, Siege, Average, 180er, Checkout, High Finish, Titel)
import { fmtNum, esc } from '../../../util.js';
import { CATEGORIES } from '../../../../data/tournaments.js';
import { frame, header, titleBand, bar, bindHead } from '../frame.js';
import { icon as nicon } from '../icons.js';

export const nsd = true;
let view = 0;   // Version 215: 0 = Zahlen, 1 = Titel & Ehrungen (Knopf „Ansicht ändern“)
// Titel (Archiv) und eigene Auszeichnungen, neueste zuerst
function honours(s) {
  const a = s.archive ?? {}, list = [
    ...(a.titles ?? []).map(t => ({ year: t.year, week: t.week ?? 53, tag: CATEGORIES[t.cat]?.short ?? '', name: t.name })),
    ...(a.awards ?? []).map(w => ({ year: w.year, week: 54, tag: 'EHRUNG', name: w.label })),
  ];
  return list.sort((x, y) => y.year - x.year || y.week - x.week);
}
function honoursTable(s) {
  const list = honours(s);
  if (!list.length) return '<div class="nsd-card" style="margin:8px">Noch keine Titel oder Auszeichnungen.</div>';
  return `<table class="nsd-table nsd-stats-t nsd-hon"><tr><th class="a">Jahr</th><th class="a"></th><th class="a">Turnier</th></tr>
    ${list.map((h, i) => `<tr><td class="nm">${h.year}</td><td class="c ${i % 2 ? 'b' : 'a'} tg">${esc(h.tag)}</td><td class="c ${i % 2 ? 'b' : 'a'}">${esc(h.name)}</td></tr>`).join('')}</table>`;
}
export function render(app) {
  const s = app.state, seasons = Object.keys(s.stats?.seasons ?? {}).map(Number).sort((a, b) => b - a);
  const cols = [['Karriere', s.stats.career], ...seasons.map(y => [String(y), s.stats.seasons[y]])];
  // Version 89: Karriere (blau) und die Saisons (abwechselnd hell/getönt) farblich getrennt, damit man die Spalten leichter unterscheidet
  const cls = i => (i === 0 ? 'k' : i % 2 ? 'a' : 'b');
  const avg = t => (t.darts ? fmtNum(t.points / t.darts * 3, 1) : '–');
  const co = t => (t.coAtt ? `${fmtNum(t.coHit / t.coAtt * 100, 1)} %` : '–');
  const rows = [['Matches', t => t.matches ?? 0], ['Siege', t => t.wins ?? 0], ['Legs', t => `${t.legsWon ?? 0}:${t.legsLost ?? 0}`],
    ['Average', avg], ['180er', t => t.s180 ?? 0], ['140+', t => t.s140 ?? 0], ['Checkout', co], ['High Finish', t => t.hiFinish || '–'],
    ['Bestes Leg', t => (t.bestLeg ? `${t.bestLeg} D.` : '–')], ['Turniere', t => t.events ?? 0], ['Titel', t => t.titles ?? 0]];
  return frame({
    cls: 'fixed', bg: 'grey',
    body: `${header(s.player.name)}${titleBand('Statistik')}<div class="nsd-scroll">${view ? honoursTable(s) : `<table class="nsd-table nsd-stats-t">
      <tr><th></th>${cols.map(([l], i) => `<th class="${cls(i)}">${l}</th>`).join('')}</tr>
      ${rows.map(([l, f]) => `<tr><td class="nm">${l}</td>${cols.map(([, t], i) => `<td class="c ${cls(i)}">${f(t ?? {})}</td>`).join('')}</tr>`).join('')}
    </table>`}</div>
      <button class="nsd-btn nsd-viewbtn" id="st-view"><span class="lb">${view ? nicon('stats') : '🏆'} Ansicht ändern</span></button>`,
    bottom: bar([{ go: 'hub', icon: nicon('home'), label: 'Start' }, { go: 'achievements', icon: '⭐', label: 'Erfolge' }, { go: 'league', icon: nicon('ranks'), label: 'Ranglisten', wide: true }]),
  });
}
export function mount(root, app) {
  bindHead(root, app, '<p>Deine Zahlen über die ganze Karriere und je Saison. „Ansicht ändern“ wechselt zu deinen Titeln und Auszeichnungen.</p>');
  root.querySelector('#st-view').onclick = () => { view = 1 - view; app.refresh(); };
}
