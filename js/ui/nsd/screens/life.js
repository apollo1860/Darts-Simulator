// Leben: Zufriedenheit, Energie, Beziehungen (Manager, Fans, Freundin, Sponsoren), Lifestyle, Erfolge
import { relLabel } from '../../../nsd.js';
import { MILESTONES, reached } from '../../../milestones.js';
import { frame, header, meter, heartIcon, bar, bindHead } from '../frame.js';
import { toast, modal } from '../../components.js';

export const nsd = true;
const ICONS = { manager: '💼', fans: '🧣', partner: '🌹', sponsors: '🤝' };
const HELP = '<p>Deine Beziehungen beeinflussen Ereignisse, Angebote und deine Zufriedenheit. Ein grauer Balken heißt: (noch) nicht vorhanden.</p>';

export function render(app) {
  const p = app.state.player, rel = p.rel ?? {}, e = Math.round(p.energy ?? 100);
  const has = { manager: !!app.state.staff?.manager, sponsors: (app.state.sponsors?.active?.length ?? 0) > 0, partner: (rel.partner ?? 0) > 0, fans: true };
  return frame({
    body: `${header(p.name)}
    <div class="nsd-meters">
      ${meter({ icon: '<span style="font-size:2.1rem">🙂</span>', label: 'Zufriedenheit', pct: p.satisfaction ?? 50 })}
      ${meter({ icon: heartIcon(), label: 'Energie', pct: e, tone: e >= 20 ? 'green' : 'red' })}
    </div>
    <div class="nsd-list">${Object.keys(relLabel).map(k => `<div class="nsd-line">
      ${meter({ label: relLabel[k], pct: has[k] ? rel[k] ?? 0 : 0, tone: has[k] ? 'green' : 'grey' })}
      <button class="nsd-btn" data-rel="${k}"><span class="ic">${ICONS[k]}</span></button>
    </div>`).join('')}</div>`,
    bottom: bar([
      { go: 'hub', icon: '🏠', label: 'Start' },
      { go: 'home', icon: '🏡', label: 'Lifestyle' },
      { go: 'news', icon: '📰', label: 'News' },
      { id: 'l-ach', icon: '⭐', label: 'Erfolge' },
    ]),
  });
}

export function mount(root, app) {
  bindHead(root, app, HELP);
  const go = { manager: 'team', sponsors: 'sponsors' };
  root.querySelectorAll('[data-rel]').forEach(b => b.onclick = () => (go[b.dataset.rel] ? app.go(go[b.dataset.rel])
    : toast(b.dataset.rel === 'fans' ? 'Fans gewinnst du mit Siegen und Auftritten.' : 'Noch keine Freundin – vielleicht beeindruckt dich ja jemand …')));
  root.querySelector('#l-ach').onclick = () => modal({ title: 'Erfolge', body: `<table class="nsd-table">${MILESTONES.map(m =>
    `<tr><td>${m.icon}</td><td class="nm">${m.label}</td><td class="c">${reached(app.state, m.id) ? '✔' : '–'}</td></tr>`).join('')}</table>` });
}
