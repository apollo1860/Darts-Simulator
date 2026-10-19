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
import * as rival from './ui/screens/rival.js';
import { afterMount } from './ui/level.js';
import * as sponsors from './ui/screens/sponsors.js';
import * as settings from './ui/screens/settings.js';
import * as careerEnd from './ui/screens/careerEnd.js';
import * as match from './matchUI.js';
import * as watch from './ui/screens/watch.js';
import * as training from './ui/screens/training.js';
import * as home from './ui/screens/home.js';
// New Star Darts
import * as title from './ui/nsd/screens/title.js';
import * as slots from './ui/nsd/screens/slots.js';
import * as options from './ui/nsd/screens/options.js';
import * as welcome from './ui/nsd/screens/welcome.js';
import * as newprofile from './ui/nsd/screens/newprofile.js';
import * as intro from './ui/nsd/screens/intro.js';
import * as status from './ui/nsd/screens/status.js';
import * as skills from './ui/nsd/screens/skills.js';
import * as life from './ui/nsd/screens/life.js';
import * as league from './ui/nsd/screens/league.js';
import * as tourweek from './ui/nsd/screens/tourweek.js';
import * as tourevent from './ui/nsd/screens/tourevent.js';
import * as live from './ui/nsd/screens/live.js';
import * as matchstats from './ui/nsd/screens/matchstats.js';
import * as newsfeed from './ui/nsd/screens/newsfeed.js';
import * as trainlevels from './ui/nsd/screens/trainlevels.js';
import * as minigame from './ui/nsd/screens/minigame.js';
import * as placement from './ui/nsd/screens/placement.js';
import * as practice from './ui/nsd/screens/practice.js';
import * as drinks from './ui/nsd/screens/drinks.js';
import * as darts from './ui/nsd/screens/darts.js';
import * as lifestyle from './ui/nsd/screens/lifestyle.js';
import * as lifeevent from './ui/nsd/screens/lifeevent.js';
import * as achievements from './ui/nsd/screens/achievements.js';

// Alte Darts-Career-Screens (menu/create/hub) sind durch die New-Star-Darts-Screens ersetzt; übrige werden schrittweise umgebaut
void menu; void create; void hub; void week; void event; void news;
const SCREENS = { title, menu: title, slots, options, welcome, newprofile, intro, hub: status, skills, life, league,
  week: tourweek, event: tourevent, live, matchstats, news: newsfeed, trainlevels, minigame, placement, practice, drinks, darts, lifestyle, lifeevent, achievements, calendar, finance, profile, stats, rankings, tour, team, rival, sponsors, settings, careerEnd, match, watch, training, home };
const NO_STATE = ['title', 'menu', 'slots', 'options', 'welcome', 'newprofile', 'practice', 'minigame'];
// Container je Screen: NSD-Screens randlos, alte Screens im bisherigen Layout
const wrap = (scr, html, style = '') => {
  document.body.classList.toggle('nsd-on', !!scr.nsd);
  return `<div class="${scr.nsd ? 'nsd-root' : 'screen'}" ${style}>${html}</div>`;
};
const root = document.getElementById('app');

const app = {
  state: null,
  screen: null,
  params: {},
  go(name, params = {}) {
    const scr = SCREENS[name];
    if (!scr) return console.error('Unbekannter Screen', name);
    if (!app.state && !NO_STATE.includes(name)) name = 'title';
    SCREENS[app.screen]?.unmount?.();
    app.screen = name; app.params = params;
    root.innerHTML = wrap(SCREENS[name], SCREENS[name].render(app, params));
    SCREENS[name].mount?.(root, app, params);
    afterMount(root, app);
    window.scrollTo({ top: 0 });
  },
  refresh() { // gleichen Screen neu zeichnen, Scrollposition behalten
    const y = window.scrollY;
    SCREENS[app.screen]?.unmount?.();
    root.innerHTML = wrap(SCREENS[app.screen], SCREENS[app.screen].render(app, app.params), 'style="animation:none"');
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
app.go('title');
