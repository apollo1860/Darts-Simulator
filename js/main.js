// Bootstrap & Router
import { saveGame } from './state.js';
import { toast, modal } from './ui/components.js';
import * as menu from './ui/screens/menu.js';
import * as create from './ui/screens/create.js';
import * as hub from './ui/screens/hub.js';
import * as week from './ui/screens/week.js';
import * as calendar from './ui/screens/calendar.js';
import * as event from './ui/screens/event.js';
import * as finance from './ui/screens/finance.js';
import * as profile from './ui/screens/profile.js';
import * as stats from './ui/screens/stats.js';
import * as news from './ui/screens/news.js';
import * as rankings from './ui/screens/rankings.js';
import * as tour from './ui/screens/tour.js';
import * as team from './ui/screens/team.js';
import { afterMount } from './ui/level.js';
import * as sponsors from './ui/screens/sponsors.js';
import * as settings from './ui/screens/settings.js';
import * as careerEnd from './ui/screens/careerEnd.js';
import * as match from './matchUI.js';
import * as watch from './ui/screens/watch.js';
import * as training from './ui/screens/training.js';

const SCREENS = { menu, create, hub, week, calendar, event, finance, profile, stats, news, rankings, tour, team, sponsors, settings, careerEnd, match, watch, training };
const root = document.getElementById('app');

const app = {
  state: null,
  screen: null,
  params: {},
  go(name, params = {}) {
    const scr = SCREENS[name];
    if (!scr) return console.error('Unbekannter Screen', name);
    if (!app.state && !['menu', 'create'].includes(name)) name = 'menu';
    SCREENS[app.screen]?.unmount?.();
    app.screen = name; app.params = params;
    root.innerHTML = `<div class="screen">${SCREENS[name].render(app, params)}</div>`;
    SCREENS[name].mount?.(root, app, params);
    afterMount(root, app);
    window.scrollTo({ top: 0 });
  },
  refresh() { // gleichen Screen neu zeichnen, Scrollposition behalten
    const y = window.scrollY;
    SCREENS[app.screen]?.unmount?.();
    root.innerHTML = `<div class="screen" style="animation:none">${SCREENS[app.screen].render(app, app.params)}</div>`;
    SCREENS[app.screen].mount?.(root, app, app.params);
    afterMount(root, app);
    window.scrollTo({ top: y });
  },
  save(silent = true) {
    if (!app.state) return;
    const ok = saveGame(app.state);
    if (!ok) toast('Speichern fehlgeschlagen (Speicher voll?)', 'error');
    else if (!silent) toast('Gespeichert', 'success');
  },
  toast, modal,
};

// Globale Navigation per data-go
root.addEventListener('click', e => {
  const g = e.target.closest('[data-go]');
  if (g) { e.preventDefault(); app.go(g.dataset.go); }
});

window.app = app; // Debug
app.go('menu');
