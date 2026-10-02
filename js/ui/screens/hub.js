// Karriere-Hub (Kachel-Raster)
import { esc, fmtEUR, weekLabel, fmtNum } from '../../util.js';
import { flag } from '../../../data/nations.js';
import { overall, ATTRS } from '../../player.js';
import { staffOf, coachActive } from '../../staff.js';
import { momentumState } from '../../form.js';
import { interviewPanel, bindInterview } from '../interview.js';
import { levelBar } from '../level.js';
import { rivalOf } from '../../rival.js';
import { eventsInWeek } from '../../calendar.js';
import { nextWeek, jumpToNextEvent } from '../../season.js';
import { trainingOf, weekActivity, ACTIVITIES, DECAY_AFTER, idleOf, mostOverdue } from '../../training.js';
import { eventStatus } from '../../tournaments.js';
import { unreadCount, markAllRead } from '../../news.js';
import { sponsorsUnlocked } from '../../sponsors.js';
import { tourStatus, DEV_MAX_AGE, playersOfTier } from '../../world.js';
import { rankOf } from '../../rankings.js';
import { homeOf, carOf, moveDue } from '../../home.js';
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

function oomLine(s) {
  const p = s.player, y = s.date.year;
  if (p.tour === 'tour') return `PDC OOM: Platz ${rankOf(s, 'pdc', 'P', y)}`;
  if (p.qschoolYear === y) {
    const parts = [`CT ${rankOf(s, 'challenge', 'P', y)}.`];
    if (p.age <= DEV_MAX_AGE) parts.push(`Dev ${rankOf(s, 'dev', 'P', y)}.`);
    return parts.join(' · ');
  }
  return 'Order of Merit';
}

function trainingTile(s) {
  const t = trainingOf(s), act = weekActivity(s), f = s.player.fatigue ?? 0;
  const by = idleOf(s), od = mostOverdue(s), late = by[od] >= DECAY_AFTER - 1;
  const sub = act ? `✔ ${ACTIVITIES[act].label}` : late ? `⚠ ${ATTRS.find(a => a.key === od).label} seit ${by[od]} Wo. nicht trainiert` : 'Training · Ruhetag · Sponsor · Exhibition';
  const badge = act ? '' : `<span class="badge ${late ? '' : 'badge-green'}">!</span>`;
  const prep = s.player.prep ? ` · 🎯 ${ATTRS.find(a => a.key === s.player.prep.key).short} +${s.player.prep.bonus}` : '';
  return tile('training', '📋', 'Wochenplan', `${sub}<br>Ermüdung ${f} %${f > 30 ? ' ⚠' : ''}${prep}`, badge);
}

// Selbstvertrauen nur anzeigen, wenn aktiv
function momentumTag(p) {
  const ms = momentumState(p);
  return ms.bonus ? ` · <b class="${ms.bonus > 0 ? 'pos' : 'neg'}" title="${ms.bonus > 0 ? '+' : ''}${ms.bonus} auf Scoring, Finishing, Fokus">${ms.icon} ${ms.label}</b>` : '';
}

function rivalTile(s) {
  const r = rivalOf(s);
  if (!r) return '';
  return tile('rival', '⚔️', 'Rivale', `${esc(r.name)} · OVR ${overall(r.attrs)}<br>Bilanz ${s.rival.w}–${s.rival.l}`);
}

function teamTile(s) {
  const st = staffOf(s), c = coachActive(s);
  const sub = [st.manager ? `👔 ${st.manager.name.split(' ')[0]}` : 'Kein Manager', c ? `🧑‍🏫 +${Math.round(c.xp * 100)} % XP` : 'Kein Trainer'].join(' · ');
  return tile('team', '👥', 'Team', sub, st.gigs?.length ? `<span class="badge">${st.gigs.length}</span>` : '');
}

// Wohnen & Auto
function homeTile(s) {
  const p = s.player, h = homeOf(p), c = carOf(p);
  return tile('home', h?.icon ?? '🏡', 'Wohnen & Auto', `${h ? esc(h.label) : 'Elternhaus'}<br>${c ? `${c.icon} ${esc(c.label)}` : 'Kein Auto'}`, moveDue(s) ? '<span class="badge">!</span>' : '');
}

export function render(app) {
  const s = app.state, p = s.player;
  const unread = unreadCount(s);
  const lastNews = s.news[0];
  const sp = sponsorsUnlocked(s);
  return `<header class="topbar">
    <div class="title">
      <h2>${flag(p.nation)} ${esc(p.name)}</h2>
      <div class="sub">${p.age} J. · ${esc(tourStatus(p, s.date.year))} · OVR ${overall(p.attrs)}${momentumTag(p)}</div>
    </div>
    <div class="money num">${fmtEUR(s.finance.balance)}</div>
  </header>
  ${s.week.blocked ? `<div class="panel warn" style="margin-bottom:12px">${s.week.blocked.icon} <b>Ausfall: ${esc(s.week.blocked.label)}</b> <span class="muted">– diese Woche kein Turnier möglich.</span></div>` : ''}
  ${moveDue(s) ? '<button class="panel warn" data-go="home" style="margin-bottom:12px;width:100%;text-align:left">📦 <b>Du musst ausziehen!</b> <span class="muted">Jetzt Wohnung wählen ▸</span></button>' : ''}
  ${levelBar(s)}
  ${interviewPanel(s)}
  <div class="tile-grid">
    ${heroTile(s)}
    ${trainingTile(s)}
    ${tile('calendar', '📅', 'Kalender', `Saison ${s.date.year}`)}
    ${tile('profile', '🎯', 'Spielerprofil', `Level ${p.level ?? 1} · OVR ${overall(p.attrs)} · Ø ${p.avgReal ? fmtNum(p.avgReal, 1) : '–'}`,
      p.points ? `<span class="badge badge-green">+${p.points}</span>` : '')}
    ${tile('rankings', '🏆', 'Ranglisten', oomLine(s))}
    ${tile('tour', '🎫', 'Tour & Titel', `${playersOfTier(s, 'tour').length + (p.tour === 'tour' ? 1 : 0)} Holder · Titelträger`)}
    ${rivalTile(s)}
    ${teamTile(s)}
    ${homeTile(s)}
    ${tile('finance', '💶', 'Finanzen', fmtEUR(s.finance.balance))}
    ${tile('news', '📰', 'Neuigkeiten', `${esc(lastNews?.title ?? 'Keine Meldungen')}${unread ? '<br><span class="tile-action" role="button" tabindex="0" data-readall>✓ Alle gelesen</span>' : ''}`, unread ? `<span class="badge">${unread}</span>` : '')}
    ${tile('stats', '📊', 'Statistiken', `${s.stats.career.wins}–${s.stats.career.matches - s.stats.career.wins} · ${s.stats.career.titles} Titel`)}
    ${tile('sponsors', sp ? '🤝' : '🔒', 'Sponsoren', sp ? `${s.sponsors.active.length}/4 aktiv` : 'Ab erster Tourcard', s.sponsors.offers.length ? `<span class="badge">${s.sponsors.offers.length}</span>` : '', sp ? '' : 'locked')}
    ${tile('settings', '⚙️', 'Speichern', 'Export · Import · Menü')}
  </div>
  <div class="bottom-bar"><div class="inner">
    <div class="hint">${s.activeEvent && !s.activeEvent.done ? 'Erst das laufende Turnier beenden.' : s.week.played ? '' : 'Ohne Meldung wird die Woche ausgelassen.'}</div>
    <button class="btn btn-ghost" id="btn-jump" ${s.activeEvent && !s.activeEvent.done ? 'disabled' : ''} title="Leere Wochen überspringen (mit automatischem Training)">⏭ Nächstes Event</button>
    <button class="btn btn-primary btn-continue" id="btn-next" ${s.activeEvent && !s.activeEvent.done ? 'disabled' : ''}>Weiter ▸</button>
  </div></div>`;
}

export function mount(root, app) {
  bindInterview(root, app);
  // Neuigkeiten direkt im Hub als gelesen markieren (ohne den Feed zu öffnen)
  const ra = root.querySelector('[data-readall]');
  if (ra) {
    const go = e => { e.preventDefault(); e.stopPropagation(); markAllRead(app.state); app.save(); app.refresh(); };
    ra.addEventListener('click', go);
    ra.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') go(e); });
  }
  root.querySelector('#btn-jump').onclick = () => {
    const s = app.state;
    if (s.activeEvent?.done) { app.go('event'); return; }
    const n = jumpToNextEvent(s);
    app.save();
    app.toast(n ? `${n} Woche${n > 1 ? 'n' : ''} übersprungen (automatisch trainiert)` : 'Diese Woche gibt es schon ein Event');
    app.refresh();
  };
  root.querySelector('#btn-next').onclick = () => {
    const s = app.state;
    if (s.activeEvent?.done) { app.go('event'); return; }
    if (!nextWeek(s)) return;
    app.save();
    app.toast(`${weekLabel(s.date.year, s.date.week)}`);
    app.refresh();
  };
}
