// Fähigkeiten: Scoring, Finishing, Fokus, Rechnen (0–60, trainierbar) und Mental (= Star-Status, max. 60)
import { SKILLS, TRAINABLE, SKILL_MAX, skillValue, skillsAvg, skillBonus, spendSkillPoint } from '../../../nsd.js';
import { decayRisk } from '../../../skilltrain.js';
import { esc } from '../../../util.js';
import { frame, header, meter, heartIcon, bar, bindHead } from '../frame.js';
import { toast, modal } from '../../components.js';
import { ANGLE_DEFAULT, ANGLE_MIN, ANGLE_MAX } from '../../../obstruction.js';
import { changeAngle, ANGLE_CHANGE_ENERGY } from '../../../nsd.js';
import { dartSvg, effectText, ANGLE_INFO } from '../angle.js';
import { icon as nicon } from '../icons.js';

export const nsd = true;
const HELP = `<p>Jede Fähigkeit hat 20 Trainingslevel mit je bis zu 3 Punkten (max. 60). Ein Training kostet etwas mehr als 50 % Energie.</p>
  <p><b>Mental</b> lässt sich nicht trainieren – es steigt mit jedem neuen Star-Status (bis 60).</p>
  <p>Jede neue Star-Status-Stufe bringt außerdem <b>1 freien Fähigkeitspunkt</b>, den du mit ＋ auf Scoring, Finishing, Fokus oder Rechnen verteilst.</p>
  <p>Ab 9 Wochen ohne Training einer Fähigkeit können Punkte verloren gehen. Ab 30 wird die Frist kürzer (mit 45 nur noch 3 Wochen) – im Alter musst du öfter trainieren.</p>
  <p><b>Alter:</b> Ab 33 gehen zu jedem Jahreswechsel Punkte auf allen Fähigkeiten verloren (33–35: 1, 36–39: 2, 40–44: 3, ab 45: 4) – du kannst sie zurücktrainieren.</p>
  <p>Ab den Top 16 der PDC-Rangliste wächst der Star-Status langsamer (Top 8 und Top 3 noch langsamer).</p>`;

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
      { go: 'hub', icon: nicon('home'), label: 'Start' },
      { id: 'k-train', icon: '👟', label: 'Trainiere' },
      { id: 'k-angle', icon: nicon('darts'), label: 'Winkel' },   // Version 206: statt „Form“
      { id: 'k-drink', icon: nicon('beer'), label: 'Trinken' },
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
  root.querySelector('#k-angle').onclick = () => {           // Version 206/207: Einsteckwinkel ansehen und umstellen (100 % Energie)
    const p = app.state.player, cur = p.angle ?? ANGLE_DEFAULT, full = (p.energy ?? 0) >= ANGLE_CHANGE_ENERGY;
    let a = cur;
    const view = () => `${dartSvg(a)}<p><b>${a}°</b>${a === cur ? ' (aktuell)' : ` (aktuell ${cur}°)`} · ${effectText(a)}</p>`;
    modal({ title: 'Einsteckwinkel', body: `<div class="nsd-angle-box"><div id="ang-view">${view()}</div>
      <input type="range" class="nsd-range" id="ang-r" min="${ANGLE_MIN}" max="${ANGLE_MAX}" step="1" value="${cur}">
      <p class="sub">${ANGLE_INFO}</p>
      <p class="sub">0° = waagerecht, positiv = Flight oben, negativ = Flight unten. Umstellen kostet einmalig ${ANGLE_CHANGE_ENERGY} % Energie${full ? '' : ' – du brauchst volle Energie'}.</p></div>`,
      actions: [{ label: 'Schließen' }, { label: 'Umstellen', cls: 'btn-primary', disabled: !full, onClick: () => {
        try { changeAngle(app.state, a); app.save(); toast(`Neuer Einsteckwinkel: ${a}°`); app.refresh(); } catch (e) { toast(e.message, 'error'); return false; }
      } }],
      onMount: bd => { bd.querySelector('#ang-r').oninput = e => { a = +e.target.value; bd.querySelector('#ang-view').innerHTML = view(); }; } });
  };
}
