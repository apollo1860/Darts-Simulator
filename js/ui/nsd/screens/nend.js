// Karriereende (Tourcard verloren, Last Chance verpasst): Bilanz und zurück ins Hauptmenü
import { esc } from '../../../util.js';
import { card } from '../frame.js';
import { rankOf } from '../../../rankings.js';

export const nsd = true;
export function render(app) {
  const s = app.state, p = s.player, c = s.stats?.career ?? {};
  const titles = (s.results ?? []).filter(r => r.place === 'W').length;
  const best = s.archive?.peak?.pdc?.rank ?? rankOf(s, 'pdc', 'P') ?? '–';
  const n = s.date.year - (s.startYear ?? 2026) + 1;
  return card(`🏁 Karriereende<br><br>${esc(p.name)} beendet seine Profikarriere.<br><br>
    ${n} ${n === 1 ? 'Saison' : 'Saisons'} · ${c.matches ?? 0} Matches · ${c.wins ?? 0} Siege<br>
    ${titles} Titel · Beste PDC-Platzierung: ${best}<br>Star-Status ${p.star?.level ?? 1} · ${Object.keys(s.achievements ?? {}).length} Erfolge`);
}
export function mount(root, app) {
  root.querySelector('#nsd-ok').onclick = () => { app.save(); app.state = null; app.go('title'); };
}
