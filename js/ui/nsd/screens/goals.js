// Saisonziele mit Fortschritt
import { goalProgress, setGoals } from '../../../career.js';
import { starPayout } from '../../../nsd.js';
import { frame, header, titleBand, darkBar, coin, bar, bindHead } from '../frame.js';

export const nsd = true;
export function render(app) {
  const s = app.state, p = s.player;
  if (!s.goals || s.goals.year !== s.date.year) setGoals(s);
  const g = s.goals;
  return frame({
    body: `${header(p.name)}${titleBand(`Ziele ${g.year}`)}${darkBar(g.by ? `Vorgaben von ${g.by}` : 'Deine eigenen Ziele', 'sm')}
      <div class="nsd-evs">${g.list.map(x => { const pr = goalProgress(s, x); return `<div class="nsd-ev ${pr.ok ? 'on' : ''}">
        <div class="nsd-ev-main"><div class="nsd-ev-name">${pr.ok ? '✅' : '🎯'} ${x.label}</div><div class="nsd-ev-sub">Stand: ${pr.now}</div>
          <div class="nsd-ev-sub">Belohnung ${coin(starPayout(x.reward, p.star.level))} + Star-Status</div></div></div>`; }).join('')}</div>
      <div class="nsd-ev-sub" style="padding:6px 14px">Abrechnung am Saisonende. ${g.by ? 'Verpasste Ziele ärgern deinen Manager.' : ''}</div>`,
    bottom: bar([{ go: 'hub', icon: '🏠', label: 'Start' }, null, { go: 'hub', icon: '<span class="nsd-check">✔</span>', wide: true }]),
  });
}
export function mount(root, app) { bindHead(root, app, '<p>Jede Saison gibt es drei Ziele: Ranglistenplatz, Matchsiege und ein Turnierergebnis. Erreichte Ziele bringen ★ und Star-Status.</p>'); }
