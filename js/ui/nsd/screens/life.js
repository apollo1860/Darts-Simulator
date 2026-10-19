// Leben: Zufriedenheit, Energie, Beziehungen (Manager, Fans, Freundin, Sponsoren), Lifestyle, Erfolge
import { relLabel, starPrice, addRel } from '../../../nsd.js';
import { breakUp, satisfactionTarget, weeklyEnergy } from '../../../life.js';
import { esc } from '../../../util.js';
import { frame, header, meter, heartIcon, bar, bindHead } from '../frame.js';
import { toast, modal, confirmDialog } from '../../components.js';

export const nsd = true;
const ICONS = { manager: '💼', fans: '🧣', partner: '🌹', sponsors: '🤝' };
const HELP = '<p>Deine Beziehungen beeinflussen Ereignisse, Angebote und deine Zufriedenheit. Ein grauer Balken heißt: (noch) nicht vorhanden.</p><p><b>Zufriedenheit</b> folgt deinem Lifestyle, deiner Freundin, den Fans und deinem Selbstvertrauen – und bestimmt, wie gut du dich pro Woche erholst (−10 bis +10 % Energie).</p><p>Eine Freundin will Zeit: ohne Aufmerksamkeit sinkt die Beziehung jede Woche.</p>';
const GIFT = 4;

export function render(app) {
  const p = app.state.player, rel = p.rel ?? {}, e = Math.round(p.energy ?? 100);
  const has = { manager: !!app.state.team?.manager, sponsors: (app.state.nsdSponsors?.active?.length ?? 0) > 0 || (rel.sponsors ?? 0) > 0, partner: (rel.partner ?? 0) > 0, fans: true };
  return frame({
    body: `${header(p.name)}
    <div class="nsd-meters">
      ${meter({ icon: '<span style="font-size:2.1rem">🙂</span>', label: 'Zufriedenheit', pct: p.satisfaction ?? 50 })}
      ${meter({ icon: heartIcon(), label: 'Energie', pct: e, tone: e >= 20 ? 'green' : 'red' })}
    </div>
    <div class="nsd-list">${Object.keys(relLabel).map(k => `<div class="nsd-line">
      ${meter({ label: k === 'partner' && p.partnerName ? `${esc(p.partnerName)}` : relLabel[k], pct: has[k] ? rel[k] ?? 0 : 0, tone: has[k] ? 'green' : 'grey' })}
      <button class="nsd-btn" data-rel="${k}"><span class="ic">${ICONS[k]}</span></button>
    </div>`).join('')}</div>
    <div class="nsd-strip"><span>Erholung</span><span class="mid">+${weeklyEnergy(p)} %/Woche</span><span class="r">Ziel ${Math.round(satisfactionTarget(p))}</span></div>`,
    bottom: bar([
      { go: 'hub', icon: '🏠', label: 'Start' },
      { go: 'lifestyle', icon: '💎', label: 'Lifestyle' },
      { go: 'news', icon: '📰', label: 'News' },
      { id: 'l-ach', icon: '⭐', label: 'Erfolge' },
    ]),
  });
}

export function mount(root, app) {
  bindHead(root, app, HELP);
  root.querySelectorAll('[data-rel]').forEach(b => b.onclick = () => {
    const k = b.dataset.rel;
    if (k === 'partner') return partnerModal(app);
    if (k === 'fans') return toast('Fans gewinnst du mit Siegen, guten Noten und Auftritten.');
    app.go(k === 'manager' ? 'team' : 'sponsors');
  });
  root.querySelector('#l-ach').onclick = () => app.go('achievements');
}

// Freundin: Geschenk (+5) oder Schluss machen
function partnerModal(app) {
  const s = app.state, p = s.player;
  if (!(p.rel.partner > 0)) return toast('Noch keine Freundin – vielleicht lernst du ja bald jemanden kennen …');
  const cost = starPrice(GIFT, p.star.level);
  modal({
    title: `🌹 ${esc(p.partnerName ?? 'Freundin')}`,
    body: `<p>Beziehung: <b>${Math.round(p.rel.partner)}</b> / 100. Ohne Aufmerksamkeit sinkt sie jede Woche um 1.</p>`,
    actions: [
      { label: `Geschenk (${cost} ★)`, cls: 'btn-primary', onClick: () => {
        if ((s.stars ?? 0) < cost) return toast('Nicht genug ★', 'error');
        s.stars -= cost; addRel(p, 'partner', 5); app.save(); toast('Sie freut sich riesig! +5'); app.refresh();
      } },
      { label: 'Schluss machen', cls: 'btn-ghost', onClick: async () => {
        if (!await confirmDialog('Wirklich Schluss machen?', 'Die Beziehung ist dann vorbei.', 'Schluss machen')) return;
        breakUp(s, false); p.satisfaction = Math.max(0, (p.satisfaction ?? 50) - 8); app.save(); app.refresh();
      } },
      { label: 'Zurück', cls: 'btn-ghost' },
    ],
  });
}
