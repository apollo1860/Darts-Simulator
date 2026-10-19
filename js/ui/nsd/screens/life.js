// Leben: Zufriedenheit, Energie, Beziehungen (Manager, Fans, Freundin, Sponsoren), Lifestyle, Erfolge
import { relLabel } from '../../../nsd.js';
import { relAvailable, pickRelAction, doRelAction } from '../../../career.js';
import { breakUp, satisfactionTarget, weeklyEnergy } from '../../../life.js';
import { esc } from '../../../util.js';
import { frame, header, meter, heartIcon, bar, bindHead } from '../frame.js';
import { toast, modal, confirmDialog } from '../../components.js';

export const nsd = true;
const ICONS = { manager: '💼', fans: '🧣', partner: '🌹', sponsors: '🤝' };
const HELP = '<p>Deine Beziehungen beeinflussen Ereignisse, Angebote und deine Zufriedenheit. Ein grauer Balken heißt: (noch) nicht vorhanden.</p><p><b>Zufriedenheit</b> folgt deinem Lifestyle, deiner Freundin, den Fans und deinem Selbstvertrauen – und bestimmt, wie gut du dich pro Woche erholst (−10 bis +10 % Energie).</p><p>Eine Freundin will Zeit: ohne Aufmerksamkeit sinkt die Beziehung jede Woche.</p><p>Tippe auf eine Beziehung, um sie zu pflegen: Fans, Manager und Sponsoren kosten 60 % Energie, ein Geschenk für die Freundin kostet ★.</p>';

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
      { id: 'l-ach', icon: '⭐', label: 'Meilensteine' },
    ]),
  });
}

export function mount(root, app) {
  bindHead(root, app, HELP);
  root.querySelectorAll('[data-rel]').forEach(b => b.onclick = () => relModal(app, b.dataset.rel));
  root.querySelector('#l-ach').onclick = () => app.go('achievements');
}

// Beziehung pflegen: zufällige Aktion (Fans/Manager/Sponsoren: 60 % Energie, Freundin: Geschenk in ★) → Balken steigt
const LINK = { manager: ['team', 'Team'], sponsors: ['sponsors', 'Verträge'] };
function relModal(app, key) {
  const s = app.state, p = s.player;
  if (!relAvailable(s, key)) {
    const txt = { partner: 'Noch keine Freundin – vielleicht lernst du ja bald jemanden kennen …', manager: 'Noch kein Manager.', sponsors: 'Noch keine Sponsoren.' }[key];
    return LINK[key] ? app.go(LINK[key][0]) : toast(txt);
  }
  const act = pickRelAction(s, key);
  const label = key === 'partner' ? esc(p.partnerName ?? 'Freundin') : relLabel[key];
  const cost = act.energy ? `${act.energy} % Energie` : `${act.stars} ★`;
  const actions = [
    { label: `${act.name} (${cost})`, cls: 'btn-primary', onClick: () => {
      try { const v = doRelAction(s, act); app.save(); toast(`${act.name}: ${label} +${act.gain} → ${Math.round(v)}`); app.refresh(); }
      catch (e) { toast(e.message, 'error'); }
    } },
  ];
  if (LINK[key]) actions.push({ label: LINK[key][1], cls: 'btn-ghost', onClick: () => app.go(LINK[key][0]) });
  if (key === 'partner') actions.push({ label: 'Schluss machen', cls: 'btn-ghost', onClick: async () => {
    if (!await confirmDialog('Wirklich Schluss machen?', 'Die Beziehung ist dann vorbei.', 'Schluss machen')) return;
    breakUp(s, false); p.satisfaction = Math.max(0, (p.satisfaction ?? 50) - 8); app.save(); app.refresh();
  } });
  actions.push({ label: 'Zurück', cls: 'btn-ghost' });
  modal({ title: `${ICONS[key]} ${label}`, body: `<p>Beziehung: <b>${Math.round(p.rel[key] ?? 0)}</b> / 100.</p><p>Vorschlag: <b>${esc(act.name)}</b> – Beziehung +${act.gain}.</p>`, actions });
}
