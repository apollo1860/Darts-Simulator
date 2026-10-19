// Erfolge: einmalige Meilensteine mit ★-Belohnung
import { ACHIEVEMENTS } from '../../../../data/achievements.js';
import { starPayout } from '../../../nsd.js';
import { frame, header, titleBand, coin, bar, bindHead } from '../frame.js';

export const nsd = true;
export function render(app) {
  const s = app.state, got = s.achievements ?? {}, n = ACHIEVEMENTS.filter(a => got[a.id]).length;
  return frame({
    cls: 'fixed',
    body: `${header(s.player.name)}${titleBand(`Erfolge ${n}/${ACHIEVEMENTS.length}`)}
      <div class="nsd-scroll"><table class="nsd-table nsd-ach">${ACHIEVEMENTS.map(a => `<tr class="${got[a.id] ? 'me' : ''}">
        <td class="c">${a.icon}</td><td class="nm">${a.label}${got[a.id] ? `<small>KW ${got[a.id].week}/${got[a.id].year}</small>` : ''}</td>
        <td class="num">${got[a.id] ? '✔' : coin(starPayout(a.stars, s.player.star.level))}</td></tr>`).join('')}</table></div>`,
    bottom: bar([{ go: 'hub', icon: '🏠', label: 'Start' }, null, { go: 'life', icon: '<span class="nsd-check">✔</span>', wide: true }]),
  });
}
export function mount(root, app) { bindHead(root, app, '<p>Erfolge gibt es nur einmal. Die Belohnung in ★ steigt mit deinem Star-Status.</p>'); }
