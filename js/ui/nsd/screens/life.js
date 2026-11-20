// Leben: Zufriedenheit, Energie, Beziehungen (Manager, Fans, Freundin, Sponsoren), Lifestyle, Erfolge
import { relLabel, relLabelOf, partnerText, inTournament, IN_TOURNAMENT_MSG } from '../../../nsd.js';
import { vacationStatus, takeVacation, VACATION_SAT } from '../../../tournaments.js';
import { relAvailable, pickRelAction, doRelAction } from '../../../career.js';
import { breakUp, satisfactionTarget, weeklyEnergy, canMarry, marry, WEDDING_COST } from '../../../life.js';
import { esc } from '../../../util.js';
import { frame, header, meter, heartIcon, bar, bindHead, coin } from '../frame.js';
import { toast, modal, confirmDialog } from '../../components.js';
import { icon as nicon } from '../icons.js';

export const nsd = true;
const ICONS = { manager: '💼', fans: '🧣', partner: '🌹', sponsors: '🤝' };
const HELP = '<p>Deine Beziehungen beeinflussen Ereignisse, Angebote und deine Zufriedenheit. Ein grauer Balken heißt: (noch) nicht vorhanden.</p><p><b>Zufriedenheit</b> folgt deinem Lifestyle, deiner Freundin, den Fans und deinem Selbstvertrauen – und bestimmt, wie gut du dich pro Woche erholst (−10 bis +10 % Energie).</p><p>Eine Freundin will Zeit: ohne Aufmerksamkeit sinkt die Beziehung jede Woche.</p><p>💍 Bei Beziehung 100 und mehr als einem Jahr zusammen kannst du heiraten (1.500 ★). Verheiratet sinkt die Beziehung nur noch jede zweite Woche. Eine Scheidung kostet die Hälfte deines Sterngelds.</p><p><b>Pflege nicht vergessen:</b> Machst du mit Freundin, Fans, Manager oder Sponsoren länger als 6 Wochen nichts, wird die Beziehung jede Woche schlechter – gute Leistungen gleichen das dann nur noch zum Teil aus.</p><p>Tippe auf eine Beziehung, um sie zu pflegen: Fans, Manager und Sponsoren kosten 60 % Energie, ein Geschenk für die Freundin kostet ★.</p>';

// Version 94: hat sich ein Wert seit dem letzten Besuch geändert (Aktion, Ereignis, Woche), wächst der Balken sichtbar vom alten Wert aus
// (player.lifeSeen wie starSeen, animateMeters in main.js)
export function render(app) {
  const p = app.state.player, rel = p.rel ?? {}, e = Math.round(p.energy ?? 100), from = p.lifeSeen ?? {};
  p.lifeSeen = { rel: { ...rel }, energy: e, sat: p.satisfaction ?? 50 };
  const has = { manager: !!app.state.team?.manager, sponsors: (app.state.nsdSponsors?.active?.length ?? 0) > 0 || (rel.sponsors ?? 0) > 0, partner: (rel.partner ?? 0) > 0, fans: true };
  return frame({
    body: `${header(p.name)}
    <div class="nsd-meters">
      ${meter({ icon: '<span style="font-size:2.1rem">🙂</span>', label: 'Zufriedenheit', pct: p.satisfaction ?? 50, from: from.sat ?? null })}
      ${meter({ icon: heartIcon(), label: 'Energie', pct: e, tone: e >= 20 ? 'green' : 'red', from: from.energy ?? null })}
    </div>
    <div class="nsd-list">${Object.keys(relLabel).map(k => `<div class="nsd-line">
      ${meter({ label: k === 'partner' && p.partnerName ? `${esc(p.partnerName)}` : relLabelOf(p, k), pct: has[k] ? rel[k] ?? 0 : 0, tone: has[k] ? 'green' : 'grey', from: has[k] ? from.rel?.[k] ?? null : null })}
      <button class="nsd-btn" data-rel="${k}"><span class="ic">${ICONS[k]}</span></button>
    </div>`).join('')}</div>
    <div class="nsd-strip"><span>Erholung</span><span class="mid">+${weeklyEnergy(p)} %/Woche</span><span class="r">Ziel ${Math.round(satisfactionTarget(p))}</span></div>
    <div class="nsd-lrow">${(() => { const v = vacationStatus(app.state); return `<button class="nsd-btn row nsd-vac" id="l-vac" ${v.ok ? '' : 'disabled'}><span class="ic">🏝️</span><span class="lb"><span class="t">${app.state.week.vacation ? 'Im Urlaub' : `Urlaub ${coin(v.cost)}`}</span>${v.ok ? '' : `<small>${esc(v.reason)}</small>`}</span></button>`; })()}
    <button class="nsd-btn row nsd-vac" id="l-walk"><span class="ic">🎵</span><span class="lb"><span class="t">Walk-on</span><small>${p.walkon ? esc(p.walkon.t) : 'Song wählen'}</small></span></button></div>`,
    bottom: bar([
      { go: 'hub', icon: nicon('home'), label: 'Start' },
      { go: 'lifestyle', icon: '💎', label: 'Lifestyle' },
      { go: 'news', icon: nicon('news'), label: 'News' },
      { id: 'l-ach', icon: '⭐', label: 'Meilensteine' },
    ]),
  });
}

export function mount(root, app) {
  bindHead(root, app, partnerText(HELP, app.state.player));
  root.querySelectorAll('[data-rel]').forEach(b => b.onclick = () => relModal(app, b.dataset.rel));
  root.querySelector('#l-ach').onclick = () => app.go('achievements');
  root.querySelector('#l-walk').onclick = () => app.go('walkon');   // Version 244
  root.querySelector('#l-vac')?.addEventListener('click', async () => {   // Version 241: Urlaub
    const v = vacationStatus(app.state);
    if (!await confirmDialog('Urlaub machen?', `Kostet ${v.cost} ★. Energie 100 %, Zufriedenheit +${VACATION_SAT}, danach 4 Wochen bessere Erholung. Diese Woche kein Training und keine Turniere. Nur einmal pro Jahr.`, 'Ab in den Urlaub')) return;
    try { takeVacation(app.state); app.save(); toast('🏝️ Gute Erholung!', 'success'); app.refresh(); } catch (e) { toast(e.message, 'error'); }
  });
}

// Beziehung pflegen: zufällige Aktion (Fans/Manager/Sponsoren: 60 % Energie, Freundin: Geschenk in ★) → Balken steigt
const LINK = { manager: ['team', 'Team'], sponsors: ['sponsors', 'Verträge'] };
function relModal(app, key) {
  const s = app.state, p = s.player;
  if (inTournament(s) && relAvailable(s, key)) return toast(IN_TOURNAMENT_MSG, 'error');   // Version 243
  if (!relAvailable(s, key)) {
    const txt = partnerText({ partner: 'Noch keine Freundin – vielleicht lernst du ja bald jemanden kennen …', manager: 'Noch kein Manager.', sponsors: 'Noch keine Sponsoren.' }[key], p);
    return LINK[key] ? app.go(LINK[key][0]) : toast(txt);
  }
  const act = pickRelAction(s, key);
  const label = key === 'partner' ? esc(p.partnerName ?? relLabelOf(p, 'partner')) : relLabel[key];
  const cost = act.energy ? `${act.energy} % Energie` : `${act.stars} ★`;
  const actions = [
    { label: `${act.name} (${cost})`, cls: 'btn-primary', onClick: () => {
      try { const v = doRelAction(s, act); app.save(); toast(`${act.name}: ${label} +${act.gain} → ${Math.round(v)}`); app.refresh(); }
      catch (e) { toast(e.message, 'error'); }
    } },
  ];
  if (LINK[key]) actions.push({ label: LINK[key][1], cls: 'btn-ghost', onClick: () => app.go(LINK[key][0]) });
  if (key === 'partner' && canMarry(s)) actions.push({ label: `💍 Heiraten (${WEDDING_COST.toLocaleString('de-DE')} ★)`, cls: 'btn-primary', onClick: async () => {
    if (!await confirmDialog(`${p.partnerName} heiraten?`, `Die Hochzeit kostet ${WEDDING_COST.toLocaleString('de-DE')} ★.`, 'Heiraten')) return;
    try { marry(s); app.save(); toast(`💍 Ihr seid verheiratet!`); app.refresh(); } catch (e) { toast(e.message, 'error'); }
  } });
  if (key === 'partner') actions.push({ label: p.married ? 'Scheidung' : 'Schluss machen', cls: 'btn-ghost', onClick: async () => {
    if (!await confirmDialog(p.married ? 'Wirklich scheiden lassen?' : 'Wirklich Schluss machen?', p.married ? `Die Ehe ist dann vorbei – und du verlierst die Hälfte deines Sterngelds (−${Math.round((s.stars ?? 0) / 2 * 10) / 10} ★).` : 'Die Beziehung ist dann vorbei.', p.married ? 'Scheidung' : 'Schluss machen')) return;
    breakUp(s, false); p.satisfaction = Math.max(0, (p.satisfaction ?? 50) - 8); app.save(); app.refresh();
  } });
  actions.push({ label: 'Zurück', cls: 'btn-ghost' });
  modal({ title: `${ICONS[key]} ${label}`, body: `${key === 'partner' && p.married ? `<p>💍 ${p.woman ? 'Dein Ehemann' : 'Deine Ehefrau'} seit KW ${p.married.week} / ${p.married.year}.</p>` : ''}<p>Beziehung: <b>${Math.round(p.rel[key] ?? 0)}</b> / 100.</p><p>Vorschlag: <b>${esc(act.name)}</b> – Beziehung +${act.gain}.</p>`, actions });
}
