// Darts News: Nachrichten-Feed im NSS-Stil; article = Website-Artikel aus state.articles (Titel, Finale, WM-Ticket …) als Browser-Karte
import { esc } from '../../../util.js';
import { markAllRead } from '../../../news.js';
import { frame, header, titleBand, bar, bindHead } from '../frame.js';
import { continueWeek } from './weekly.js';

export const nsd = true;
const ICON = { result: '🏆', ranking: '📊', star: '⭐', info: '📰', draw: '🎟️', xp: '💬', article: '🗞️' };

const browser = (a, more) => `<div class="nsd-browser"><div class="nsd-browser-bar"><i></i><i></i><i></i><span>www.darts-news.de</span></div>
  <div class="nsd-art-photo"><span>${a.icon ?? '🎯'}</span></div>
  <div class="nsd-browser-page"><div class="kick">${esc(a.kicker ?? 'DARTS NEWS')} · KW ${a.week}/${a.year}</div><h2>${esc(a.title)}</h2><p>${esc(a.text)}</p>
  ${more ? `<div class="nsd-art-more">Noch ${more} weitere${more > 1 ? '' : 'r'} Artikel</div>` : ''}</div></div>`;

export function render(app, params = {}) {
  const s = app.state, art = params.article ? s.articles?.[0] : null;
  if (art) return frame({
    cls: 'fixed',
    body: `${header(s.player.name)}${titleBand('Darts News')}<div class="nsd-scroll">${browser(art, s.articles.length - 1)}</div>`,
    bottom: bar([null, null, { id: 'n-ok', icon: '<span class="nsd-check">✔</span>', wide: true }]),
  });
  const rows = s.news.slice(0, 40).map(n => `<div class="nsd-news ${n.read ? '' : 'new'}">
      <div class="ic">${ICON[n.type] ?? '📰'}</div>
      <div><div class="t">${esc(n.title)}</div>${n.text ? `<div class="x">${esc(n.text)}</div>` : ''}<div class="d">KW ${n.week} · ${n.year}</div></div>
    </div>`).join('');
  return frame({
    cls: 'fixed',
    body: `${header(s.player.name)}${titleBand('Darts News')}<div class="nsd-scroll">${rows || '<div class="nsd-card">Noch keine Nachrichten.</div>'}</div>`,
    bottom: bar([{ go: 'hub', icon: '🏠', label: 'Start' }, null, { go: 'life', icon: '<span class="nsd-check">✔</span>', wide: true }]),
  });
}

export function mount(root, app, params = {}) {
  bindHead(root, app, '<p>Ergebnisse, Ranglisten und Schlagzeilen rund um deine Karriere. Bei besonderen Ereignissen erscheint ein Artikel auf darts-news.de.</p>');
  markAllRead(app.state);
  app.save();
  root.querySelector('#n-ok')?.addEventListener('click', () => {
    const s = app.state;
    s.articles?.shift(); app.save();
    if (s.articles?.length) return app.refresh();
    if (params.back === 'continue') return continueWeek(app);
    app.go(params.back ?? 'hub');
  });
}
