// Sponsoren (Phase 6)
import { sponsorsUnlocked, MAX_SPONSORS } from '../../sponsors.js';
import { topbar } from '../components.js';

export function render(app) {
  const s = app.state;
  return `${topbar({ title: 'Sponsoren', sub: `max. ${MAX_SPONSORS} gleichzeitig` })}
  <div class="panel stack center">
    <div style="font-size:3rem">${sponsorsUnlocked(s) ? '🤝' : '🔒'}</div>
    <h3>${sponsorsUnlocked(s) ? 'Noch keine Angebote' : 'Noch gesperrt'}</h3>
    <p class="muted">Sponsoren interessieren sich erst für dich, sobald du deine erste Tourcard gewonnen hast.
    Danach steigen Angebote mit Weltranglistenplatz und Erfolgen. Angebote erscheinen in den Neuigkeiten.</p>
  </div>`;
}
