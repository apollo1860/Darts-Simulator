// Meilensteine: alle auf einen Blick – erreicht in Farbe, offen ausgegraut; nach Bereichen gruppiert
import { ACHIEVEMENTS, MS_CATS } from '../../../../data/achievements.js';
import { msStarPoints } from '../../../life.js';
import { esc } from '../../../util.js';
import { partnerText } from '../../../nsd.js';
import { frame, header, titleBand, bar, bindHead, checkIcon } from '../frame.js';
import { icon as nicon } from '../icons.js';

export const nsd = true;
export function render(app) {
  const s = app.state, got = s.achievements ?? {}, n = ACHIEVEMENTS.filter(a => got[a.id]).length;
  const groups = MS_CATS.map(([cat, label]) => {
    const list = ACHIEVEMENTS.filter(a => a.cat === cat), k = list.filter(a => got[a.id]).length;
    return `<div class="nsd-ms-group"><div class="nsd-ms-head">${label} <small>${k}/${list.length}</small></div>
      <div class="nsd-ms-grid">${list.map(a => `<div class="nsd-ms ${got[a.id] ? 'on' : ''}" title="${esc(partnerText(a.label, app.state.player))}">
        <span class="ic">${a.icon}</span><span class="lb">${esc(partnerText(a.label, app.state.player))}</span>
        <span class="rw">${got[a.id] ? `KW ${got[a.id].week}/${got[a.id].year}` : `+${msStarPoints(a)} Status`}</span></div>`).join('')}</div></div>`;
  }).join('');
  return frame({
    cls: 'fixed',
    body: `${header(s.player.name)}${titleBand(`Meilensteine ${n}/${ACHIEVEMENTS.length}`)}<div class="nsd-scroll">${groups}</div>`,
    bottom: bar([{ go: 'hub', icon: nicon('home'), label: 'Start' }, { go: 'stats', icon: nicon('stats'), label: 'Statistik' }, { go: 'life', icon: checkIcon(), wide: true }]),
  });
}
export function mount(root, app) {
  bindHead(root, app, '<p>Jeder Meilenstein zählt einmal und bringt ein kleines Plus beim Star-Status (kein Geld). Meilensteine „Am Board“ – 180er, High Finishes, Big Fish – gibt es nur für Würfe, die du im Liveticker selbst wirfst.</p>');
}
