// Fähigkeiten: Scoring, Finishing, Fokus, Rechnen (0–60, trainierbar) und Mental (= Star-Status, max. 60)
import { SKILLS, TRAINABLE, SKILL_MAX, skillValue, skillsAvg, skillBonus, spendSkillPoint } from '../../../nsd.js';
import { decayRisk } from '../../../skilltrain.js';
import { esc } from '../../../util.js';
import { frame, header, meter, heartIcon, bar, bindHead } from '../frame.js';
import { toast, modal } from '../../components.js';
import { placeLabel } from '../../../tournaments.js';

export const nsd = true;
const HELP = `<p>Jede Fähigkeit hat 20 Trainingslevel mit je bis zu 3 Punkten (max. 60). Ein Training kostet etwas mehr als 50 % Energie.</p>
  <p><b>Mental</b> lässt sich nicht trainieren – es steigt mit jedem neuen Star-Status (bis 60).</p>
  <p>Jede neue Star-Status-Stufe bringt außerdem <b>1 freien Fähigkeitspunkt</b>, den du mit ＋ auf Scoring, Finishing, Fokus oder Rechnen verteilst.</p>
  <p>Ab 9 Wochen ohne Training einer Fähigkeit können Punkte verloren gehen.</p>`;

export function render(app) {
  const p = app.state.player, e = Math.round(p.energy ?? 100);
  return frame({
    body: `${header(p.name)}
    <div class="nsd-meters">
      ${meter({ icon: '<span style="font-size:2.1rem">🎯</span>', label: 'Fähigkeiten', pct: skillsAvg(p) / SKILL_MAX * 100 })}
      ${meter({ icon: heartIcon(), label: 'Energie', pct: e, tone: e >= 20 ? 'green' : 'red' })}
    </div>
    ${p.freePoints > 0 ? `<div class="nsd-dark nsd-alert">⭐ ${p.freePoints} freie${p.freePoints > 1 ? '' : 'r'} Fähigkeitspunkt${p.freePoints > 1 ? 'e' : ''} – mit ＋ verteilen</div>` : ''}
    <div class="nsd-list">${SKILLS.map(s => {
      const v = skillValue(p, s.key), b = skillBonus(p, s.key), plus = p.freePoints > 0 && !s.star && v < SKILL_MAX;
      return `<div class="nsd-line ${plus ? 'has-plus' : ''}">
        ${meter({ label: `${s.label} ${v}${b ? ` <small>(+${b})</small>` : ''}`, pct: v / SKILL_MAX * 100 })}
        ${plus ? `<button class="nsd-btn nsd-plus" data-pt="${s.key}"><span class="ic" style="color:#2bd33a;font-weight:900">＋</span></button>` : ''}
        <button class="nsd-btn" data-sk="${s.key}">${s.star ? '<span class="ic">⭐</span>' : '<span class="ic" style="font-weight:900">❯</span>'}</button>
      </div>`;
    }).join('')}</div>
    ${decayRisk(p).length ? `<div class="nsd-warn">⚠️ Lange nicht trainiert: ${decayRisk(p).map(t => t.label).join(', ')}</div>` : ''}`,
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
  root.querySelectorAll('[data-sk]').forEach(b => b.onclick = () => (b.dataset.sk === 'men'
    ? toast('Mental steigt mit jedem neuen Star-Status.') : app.go('trainlevels', { key: b.dataset.sk })));
  // Trainiere: die am längsten nicht trainierte Fähigkeit
  root.querySelector('#k-train').onclick = () => {
    const p = app.state.player, t = [...TRAINABLE].sort((a, b) => (p.idle?.[b.key] ?? 0) - (p.idle?.[a.key] ?? 0))[0];
    app.go('trainlevels', { key: t.key });
  };
  root.querySelectorAll('[data-pt]').forEach(b => b.onclick = () => {
    try { spendSkillPoint(app.state.player, b.dataset.pt); app.save(); app.refresh(); } catch (e) { toast(e.message, 'error'); }
  });
  root.querySelector('#k-drink').onclick = () => app.go('drinks');
  root.querySelector('#k-form').onclick = () => {
    const rs = app.state.results.slice(0, 8);
    modal({ title: 'Form', body: rs.length ? `<table class="nsd-table">${rs.map(r =>
      `<tr><td class="nm">${esc(r.name)}</td><td class="c">${esc(placeLabel(r.place, r.cat, r.eventId))}</td></tr>`).join('')}</table>` : '<p>Noch keine Turniere gespielt.</p>' });
  };
}
