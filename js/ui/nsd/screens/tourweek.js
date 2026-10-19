// Wochenansicht (Tour-Modus): Turniere dieser Woche mit ★-Siegprämie, Melden, nächste Woche
import { esc } from '../../../util.js';
import { flag } from '../../../../data/nations.js';
import { CATEGORIES } from '../../../../data/tournaments.js';
import { eventsInWeek, shownTo } from '../../../calendar.js';
import { eventStatus, enterEvent } from '../../../tournaments.js';
import { nextWeek } from '../../../season.js';
import { STAR_PRIZE_WIN, starPayout } from '../../../nsd.js';
import { frame, header, titleBand, darkBar, bar, coin, bindHead } from '../frame.js';
import { toast, confirmDialog } from '../../components.js';

export const nsd = true;
const HELP = '<p>Pro Woche spielst du ein Turnier (Premier-League-Spieltage und Qualifier kommen zusätzlich). Die Siegprämie steigt mit deinem Star-Status. Wer sein erstes Match verliert, geht leer aus.</p><p>„Weiter“ beendet die Woche: +40 % Energie.</p>';
const fmtKey = ev => ev.subFmts?.[0] ?? ev.fmt ?? ev.cat;

export function render(app) {
  const s = app.state, { year, week } = s.date, lvl = s.player.star.level;
  const evs = eventsInWeek(s, year, week).filter(e => shownTo(s, e));
  const rows = evs.map(ev => {
    const st = eventStatus(s, ev), win = starPayout(STAR_PRIZE_WIN[fmtKey(ev)] ?? 0, lvl);
    return `<div class="nsd-ev ${st.playable ? '' : 'off'}">
      <div class="nsd-ev-main">
        <div class="nsd-ev-cat">${esc(CATEGORIES[ev.cat]?.label ?? ev.cat)}${ev.count > 1 ? ` · ${ev.count} Turniere` : ''}</div>
        <div class="nsd-ev-name">${esc(ev.name)}</div>
        <div class="nsd-ev-sub">${flag(ev.country)} ${esc(ev.city)}${ev.note ? ` · ${esc(ev.note)}` : ''}</div>
        ${win ? `<div class="nsd-ev-sub">Sieg ${coin(win)}</div>` : ''}
      </div>
      ${st.playable ? `<button class="nsd-btn" data-enter="${ev.id}"><span class="lb">Melden</span></button>`
        : `<div class="nsd-ev-why">${esc(st.reason)}</div>`}
    </div>`;
  }).join('');
  return frame({
    body: `${header(s.player.name)}${titleBand(`KW ${week} · ${year}`)}
      ${darkBar(s.week.played ? 'Diese Woche bist du gemeldet' : 'Turniere dieser Woche', 'sm')}
      <div class="nsd-evs">${rows || '<div class="nsd-card" style="font-size:1.3rem">Diese Woche gibt es kein Turnier für dich.</div>'}</div>`,
    bottom: bar([
      { go: 'hub', icon: '🏠', label: 'Start' },
      { go: 'calendar', icon: '🗓️', label: 'Spielplan' },
      { go: 'news', icon: '📰', label: 'News' },
      { id: 'w-next', icon: '<span style="color:#2bd33a">➡</span>', label: 'Weiter' },
    ]),
  });
}

export function mount(root, app) {
  bindHead(root, app, HELP);
  const s = app.state;
  root.querySelectorAll('[data-enter]').forEach(b => b.onclick = () => {
    try { enterEvent(s, b.dataset.enter); app.save(); app.go('event'); }
    catch (e) { toast(e.message, 'error'); }
  });
  root.querySelector('#w-next').onclick = async () => {
    if (s.activeEvent) return app.go('event');
    if (s.lifeEvent) return app.go('lifeevent', { back: 'week' });
    const open = eventsInWeek(s, s.date.year, s.date.week).filter(e => shownTo(s, e) && eventStatus(s, e).playable);
    if (open.length && !await confirmDialog('Woche beenden?', `${open.map(e => esc(e.name)).join(', ')} – ohne dich.`, 'Weiter')) return;
    const top = s.news[0];
    nextWeek(s); app.save();
    const fresh = [];
    for (const x of s.news) { if (x === top) break; fresh.push({ title: x.title, text: x.text }); }
    app.go('weekly', { news: fresh.slice(0, 12) });
  };
}
