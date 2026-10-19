// Darts News: Nachrichten-Feed im NSS-Stil; flash = Schlagzeile (z. B. nach einem Titel) als Browser-Karte
import { esc } from '../../../util.js';
import { markAllRead } from '../../../news.js';
import { frame, header, titleBand, bar, bindHead } from '../frame.js';

export const nsd = true;
const ICON = { result: '🏆', ranking: '📊', star: '⭐', info: '📰', draw: '🎟️', xp: '💬' };

export function render(app, params = {}) {
  const s = app.state, list = s.news.slice(0, 40), top = params.flash ? list[0] : null;
  const browser = top ? `<div class="nsd-browser"><div class="nsd-browser-bar"><i></i><i></i><i></i><span>www.darts-news.de</span></div>
      <div class="nsd-browser-page"><div class="kick">DARTS NEWS · KW ${top.week}/${top.year}</div><h2>${esc(top.title)}</h2><p>${esc(top.text)}</p></div></div>` : '';
  const rows = list.slice(top ? 1 : 0).map(n => `<div class="nsd-news ${n.read ? '' : 'new'}">
      <div class="ic">${ICON[n.type] ?? '📰'}</div>
      <div><div class="t">${esc(n.title)}</div>${n.text ? `<div class="x">${esc(n.text)}</div>` : ''}<div class="d">KW ${n.week} · ${n.year}</div></div>
    </div>`).join('');
  return frame({
    cls: 'fixed',
    body: `${header(s.player.name)}${titleBand('Darts News')}<div class="nsd-scroll">${browser}${rows || '<div class="nsd-card">Noch keine Nachrichten.</div>'}</div>`,
    bottom: bar([{ go: 'hub', icon: '🏠', label: 'Start' }, null, { go: params.flash ? 'hub' : 'life', icon: '<span class="nsd-check">✔</span>', wide: true }]),
  });
}

export function mount(root, app) {
  bindHead(root, app, '<p>Ergebnisse, Ranglisten und Schlagzeilen rund um deine Karriere.</p>');
  markAllRead(app.state);
  app.save();
}
