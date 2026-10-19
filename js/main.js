// Bootstrap & Router
import { saveGame } from './state.js';
import { toast, modal } from './ui/components.js';
import { flushMilestones } from './ui/nsd/msToast.js';
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
import * as nteam from './ui/nsd/screens/nteam.js';
import * as nsponsors from './ui/nsd/screens/nsponsors.js';
import * as goals from './ui/nsd/screens/goals.js';
import * as weekly from './ui/nsd/screens/weekly.js';
import * as season from './ui/nsd/screens/season.js';
import * as interview from './ui/nsd/screens/interview.js';
import * as schedule from './ui/nsd/screens/schedule.js';
import * as titles from './ui/nsd/screens/titles.js';
import * as nstats from './ui/nsd/screens/nstats.js';
import * as nend from './ui/nsd/screens/nend.js';

const SCREENS = { title, menu: title, slots, options, welcome, newprofile, intro, hub: status, skills, life, league,
  week: tourweek, event: tourevent, live, matchstats, news: newsfeed, trainlevels, minigame, placement, practice, drinks, darts, lifestyle, lifeevent,
  achievements, goals, weekly, season, interview, calendar: schedule, tour: titles, stats: nstats, careerEnd: nend, team: nteam, sponsors: nsponsors };
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
    flushMilestones(app);
    window.scrollTo({ top: 0 });
  },
  refresh() { // gleichen Screen neu zeichnen, Scrollposition behalten
    const y = window.scrollY;
    SCREENS[app.screen]?.unmount?.();
    root.innerHTML = wrap(SCREENS[app.screen], SCREENS[app.screen].render(app, app.params), 'style="animation:none"');
    SCREENS[app.screen].mount?.(root, app, app.params);
    flushMilestones(app);
    window.scrollTo({ top: y });
  },
  save(silent = true) {
    if (!app.state) return;
    const ok = saveGame(app.state);
    if (!ok) toast('Speichern fehlgeschlagen (Speicher voll?)', 'error');
    else if (!silent) toast('Gespeichert', 'success');
  },
  toast, modal, flushMilestones: () => flushMilestones(app),
};

// Globale Navigation per data-go
root.addEventListener('click', e => {
  const g = e.target.closest('[data-go]');
  if (g) { e.preventDefault(); app.go(g.dataset.go); }
});

window.app = app; // Debug
app.go('title');
