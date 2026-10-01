// Karriere-Hub (Kachel-Raster)
import { esc, fmtEUR, weekLabel, fmtNum } from '../../util.js';
import { flag } from '../../../data/nations.js';
import { overall } from '../../player.js';
import { eventsInWeek, advanceWeek } from '../../calendar.js';
import { eventStatus } from '../../tournaments.js';
import { unreadCount } from '../../news.js';
import { sponsorsUnlocked } from '../../sponsors.js';
import { tourStatus } from '../../world.js';
import { catTag } from '../components.js';

function heroTile(state) {
  const { year, week } = state.date;
  const evs = eventsInWeek(state, year, week);
  const ae = state.activeEvent;
  let title, sub, cta;
  if (ae) {
    title = ae.name;
    sub = ae.done ? 'Turnier beendet – Ergebnis ansehen' : 'Turnier läuft';
    cta = ae.done ? 'Abschließen' : 'Fortsetzen';
  } else if (state.week.played) {
    title = 'Woche abgeschlossen';
    sub = 'Weiter zur nächsten Woche';
    cta = 'Wochenübersicht';
  } else {
    const playable = evs.filter(e => eventStatus(state, e).playable);
    const best = playable.find(e => e.cat !== 'local') ?? playable[0];
    title = best ? best.name : 'Spielfreie Woche';
    sub = best ? `${esc(best.city)} · ${playable.length} spielbare${playable.length === 1 ? 's Event' : ' Events'} diese Woche`
      : 'Keine Events für dich – nutze die Woche zur Erholung';
    cta = 'Events ansehen';
  }
  const tags = [...new Set(evs.map(e => e.cat))].map(catTag).join(' ');
  return `<button class="tile tile-hero" data-go="${ae ? 'event' : 'week'}">
    <div class="dartboard-deco"></div>
    <div class="label">${weekLabel(year, week)}</div>
    <div>
      <div class="tile-title">${esc(title)}</div>
      <div class="tile-sub" style="margin-top:6px">${sub}</div>
      <div class="row" style="margin-top:10px;gap:6px">${tags}</div>
    </div>
    <div><span class="btn btn-primary btn-sm">${cta} ▸</span></div>
  </button>`;
}

const tile = (go, icon, title, sub, extra = '', cls = '') =>
  `<button class="tile ${cls}" data-go="${go}">${extra}<div class="tile-icon">${icon}</div><div><div class="tile-title">${title}</div><div class="tile-sub">${sub}</div></div></button>`;

export function render(app) {
  const s = app.state, p = s.player;
  const unread = unreadCount(s);
  const lastNews = s.news[0];
  const sp = sponsorsUnlocked(s);
  return `<header class="topbar">
    <div class="title">
      <h2>${flag(p.nation)} ${esc(p.name)}</h2>
      <div class="sub">${p.age} J. · ${esc(tourStatus(p))} · OVR ${overall(p.attrs)}</div>
    </div>
    <div class="money num">${fmtEUR(s.finance.balance)}</div>
  </header>
  <div class="tile-grid">
    ${heroTile(s)}
    ${tile('calendar', '📅', 'Kalender', `Saison ${s.date.year}`)}
    ${tile('profile', '🎯', 'Spielerprofil', `Ø ${p.avgReal ? fmtNum(p.avgReal, 1) : '–'} · OVR ${overall(p.attrs)}`,
      p.points ? `<span class="badge badge-green">+${p.points}</span>` : '')}
    ${tile('rankings', '🏆', 'Weltrangliste', 'Order of Merit')}
    ${tile('finance', '💶', 'Finanzen', fmtEUR(s.finance.balance))}
    ${tile('news', '📰', 'Neuigkeiten', esc(lastNews?.title ?? 'Keine Meldungen'), unread ? `<span class="badge">${unread}</span>` : '')}
    ${tile('stats', '📊', 'Statistiken', `${s.stats.career.wins}–${s.stats.career.matches - s.stats.career.wins} · ${s.stats.career.titles} Titel`)}
    ${tile('sponsors', sp ? '🤝' : '🔒', 'Sponsoren', sp ? `${s.sponsors.active.length}/4 aktiv` : 'Ab erster Tourcard', '', sp ? '' : 'locked')}
    ${tile('settings', '⚙️', 'Speichern', 'Export · Import · Menü')}
  </div>
  <div class="bottom-bar"><div class="inner">
    <div class="hint">${s.activeEvent && !s.activeEvent.done ? 'Erst das laufende Turnier beenden.' : s.week.played ? '' : 'Ohne Meldung wird die Woche ausgelassen.'}</div>
    <button class="btn btn-primary btn-continue" id="btn-next" ${s.activeEvent && !s.activeEvent.done ? 'disabled' : ''}>Weiter ▸</button>
  </div></div>`;
}

export function mount(root, app) {
  root.querySelector('#btn-next').onclick = () => {
    const s = app.state;
    if (s.activeEvent?.done) { app.go('event'); return; }
    if (!advanceWeek(s)) return;
    app.save();
    app.toast(`${weekLabel(s.date.year, s.date.week)}`);
    app.refresh();
  };
}
