// Nachrichten-Feed
import { esc } from '../../util.js';
import { markAllRead } from '../../news.js';
import { topbar } from '../components.js';

const ICON = { info: 'ℹ️', result: '🎯', xp: '⭐', draw: '🎲', sponsor: '🤝', ranking: '📈' };

export function render(app) {
  const s = app.state;
  const html = `${topbar({ title: 'Neuigkeiten' })}
  <div class="panel">${s.news.length ? s.news.map(n => `<div class="news-item ${n.read ? '' : 'unread'}">
    <div class="ic">${ICON[n.type] ?? '•'}</div>
    <div><div class="ttl">${esc(n.title)}</div>${n.text ? `<div class="muted" style="font-size:.88rem">${esc(n.text)}</div>` : ''}
    <div class="meta">KW ${n.week} / ${n.year}</div></div></div>`).join('') : '<span class="muted">Keine Meldungen.</span>'}</div>`;
  return html;
}

export function mount(root, app) { markAllRead(app.state); app.save(); }
