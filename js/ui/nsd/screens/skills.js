// Fähigkeiten: Scoring, Finishing, Fokus, Rechnen (0–60, trainierbar) und Mental (= Star-Status, max. 60)
import { SKILLS, SKILL_MAX, skillValue, skillsAvg } from '../../../nsd.js';
import { esc } from '../../../util.js';
import { frame, header, meter, heartIcon, bar, bindHead } from '../frame.js';
import { toast, modal } from '../../components.js';
import { placeLabel } from '../../../tournaments.js';

export const nsd = true;
const HELP = `<p>Jede Fähigkeit hat 20 Trainingslevel mit je bis zu 3 Punkten (max. 60). Ein Training kostet etwas mehr als 50 % Energie.</p>
  <p><b>Mental</b> lässt sich nicht trainieren – es steigt mit jedem neuen Star-Status (bis 60).</p>
  <p>Ab 9 Wochen ohne Training einer Fähigkeit können Punkte verloren gehen.</p>`;

export function render(app) {
  const p = app.state.player, e = Math.round(p.energy ?? 100);
  return frame({
    body: `${header(p.name)}
    <div class="nsd-meters">
      ${meter({ icon: '<span style="font-size:2.1rem">🎯</span>', label: 'Fähigkeiten', pct: skillsAvg(p) / SKILL_MAX * 100 })}
      ${meter({ icon: heartIcon(), label: 'Energie', pct: e, tone: e >= 20 ? 'green' : 'red' })}
    </div>
    <div class="nsd-list">${SKILLS.map(s => {
      const v = skillValue(p, s.key);
      return `<div class="nsd-line">
        ${meter({ label: `${s.label} ${v}`, pct: v / SKILL_MAX * 100 })}
        <button class="nsd-btn" data-sk="${s.key}">${s.star ? '<span class="ic">⭐</span>' : '<span class="ic" style="font-weight:900">❯</span>'}</button>
      </div>`;
    }).join('')}</div>`,
    bottom: bar([
      { go: 'hub', icon: '🏠', label: 'Start' },
      { id: 'k-train', icon: '👟', label: 'Trainiere' },
      { id: 'k-form', icon: '📋', label: 'Form' },
      { id: 'k-drink', icon: '🍺', label: 'Trinken' },
    ]),
  });
}

export function mount(root, app) {
  bindHead(root, app, HELP);
  root.querySelectorAll('[data-sk]').forEach(b => b.onclick = () => toast(b.dataset.sk === 'men'
    ? 'Mental steigt mit jedem neuen Star-Status.' : 'Die Trainings-Minispiele kommen in Etappe 3.'));
  root.querySelector('#k-train').onclick = () => toast('Die Trainings-Minispiele kommen in Etappe 3.');
  root.querySelector('#k-drink').onclick = () => toast('Getränke kommen in Etappe 3.');
  root.querySelector('#k-form').onclick = () => {
    const rs = app.state.results.slice(0, 8);
    modal({ title: 'Form', body: rs.length ? `<table class="nsd-table">${rs.map(r =>
      `<tr><td class="nm">${esc(r.name)}</td><td class="c">${esc(placeLabel(r.place))}</td></tr>`).join('')}</table>` : '<p>Noch keine Turniere gespielt.</p>' });
  };
}
