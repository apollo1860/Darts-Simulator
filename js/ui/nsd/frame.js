// New-Star-Darts-Oberfläche: Rahmen (Glasdach + Zuschauer oben/unten), Titelband, Leisten, Balken, Buttons, Icons
import { esc } from '../../util.js';
import { installCrowd } from './crowd.js';
import { confirmDialog, modal } from '../components.js';

// ---- Icons (eigene SVGs) ----
export const starIcon = (n = '', cls = '') => `<span class="nsd-star ${cls}"><svg viewBox="0 0 48 46"><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6a8"/><stop offset=".45" stop-color="#ffcf2e"/><stop offset="1" stop-color="#f08a00"/></linearGradient></defs><path d="M24 2l6.6 14.2 15.4 1.8-11.4 10.6 3 15.3L24 36.4 10.4 43.9l3-15.3L2 18l15.4-1.8z" fill="url(#sg)" stroke="#c46a00" stroke-width="1.5"/></svg>${n !== '' ? `<b>${n}</b>` : ''}</span>`;
export const heartIcon = () => '<span class="nsd-heart"><svg viewBox="0 0 48 44"><defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6b6b"/><stop offset="1" stop-color="#c40000"/></linearGradient></defs><path d="M24 42S2 28 2 14C2 6 8 2 14 2c4.6 0 8 2.6 10 6 2-3.4 5.4-6 10-6 6 0 12 4 12 12 0 14-22 28-22 28z" fill="url(#hg)" stroke="#8a0000" stroke-width="1.5"/><ellipse cx="14" cy="11" rx="5" ry="3" fill="#fff" opacity=".45"/></svg></span>';
// Flight (Darts-Federn, Draufsicht): Farbe je Stufe; Premium in Gold mit Glanz
const FLIGHT_COLORS = [['#7fd3ff', '#1e6fd9'], ['#8dff6a', '#1f9e2c'], ['#ff7a7a', '#c4161c'], ['#fff3a0', '#e0a100']];
export const flightIcon = (tier = 0, size = 34) => { const [a, b] = FLIGHT_COLORS[Math.max(0, Math.min(3, tier))], id = `fg${tier}`;
  return `<svg class="nsd-gfx" width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <g stroke="#0d1b33" stroke-width="1.6" stroke-linejoin="round"><path d="M20 3 L35 6.5 L35 17 L21.5 32 Z" fill="url(#${id})"/><path d="M20 3 L5 6.5 L5 17 L18.5 32 Z" fill="url(#${id})" opacity=".8"/></g>
    <path d="M20 3 V32" stroke="#0d1b33" stroke-width="2.2"/><rect x="18" y="31" width="4" height="7" rx="1.5" fill="#9aa3ad" stroke="#2a2f36" stroke-width="1"/>
    ${tier === 3 ? '<path d="M23 7 L32 9 L32 15" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8"/><circle cx="12" cy="11" r="1.6" fill="#fff" opacity=".9"/>' : '<path d="M23 7.5 L31 9.5" stroke="#fff" stroke-width="1.4" opacity=".6"/>'}</svg>`; };
// Barrel (Tungsten-Schaft mit Rillen)
export const barrelIcon = (size = 34) => `<svg class="nsd-gfx" width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="bg-tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f3f5"/><stop offset=".5" stop-color="#9aa3ad"/><stop offset="1" stop-color="#4b535c"/></linearGradient></defs>
  <g transform="rotate(-35 20 20)"><path d="M3 20 H9" stroke="#c9ced3" stroke-width="2" stroke-linecap="round"/><rect x="9" y="15" width="20" height="10" rx="4" fill="url(#bg-tg)" stroke="#2a2f36" stroke-width="1.4"/>
  ${[13, 16, 19, 22, 25].map(x => `<path d="M${x} 15.6 V24.4" stroke="#2a2f36" stroke-width="1.1" opacity=".7"/>`).join('')}<path d="M29 20 H37" stroke="#cfd5db" stroke-width="3" stroke-linecap="round"/></g></svg>`;
export const coin = n => `<span class="nsd-coin">${starIcon('', 'sm')}${typeof n === 'number' ? (Math.round(n * 10) / 10).toLocaleString('de-DE') : n}</span>`;

// ---- Bausteine ----
export const titleBand = text => `<div class="nsd-title"><span>${text}</span></div>`;
export const darkBar = (text, extra = '') => `<div class="nsd-dark ${extra}">${text}</div>`;

// Balken mit Icon links, Beschriftung mittig (pct 0–100)
export function meter({ icon = '', label, pct = 0, tone = 'green', cls = '', title = '', from = null }) {
  const p = Math.max(0, Math.min(100, pct)), f = from == null ? null : Math.max(0, Math.min(100, from));
  const fill = f == null || Math.abs(f - p) < 0.5 ? `style="width:${p}%"` : `style="width:${f}%" data-to="${p}"`;   // data-to: Balken wächst (animateMeters)
  return `<div class="nsd-meter ${cls}" ${title ? `title="${esc(title)}"` : ''}><i class="fill ${tone}" ${fill}></i>${icon ? `<span class="ic">${icon}</span>` : ''}<span class="lb">${label}</span></div>`;
}

// Kopfzeile: [X] Name [?]
export function header(name, { help = true } = {}) {
  return `<div class="nsd-head">
    <button class="nsd-sq red" data-nsd="menu" aria-label="Menü">✖</button>
    <div class="nsd-name">${esc(name)}</div>
    ${help ? '<button class="nsd-sq green" data-nsd="help" aria-label="Hilfe">?</button>' : '<span></span>'}
  </div>`;
}

// Untere Button-Leiste: [{icon, label, go, id, disabled, wide}]
export function bar(buttons, cls = '') {
  return `<div class="nsd-bar ${cls}">${buttons.map(b => b ? `<button class="nsd-btn ${b.wide ? 'wide' : ''} ${b.cls ?? ''}"
    ${b.go ? `data-go="${b.go}"` : ''} ${b.id ? `id="${b.id}"` : ''} ${b.disabled ? 'disabled' : ''}>
    ${b.icon ? `<span class="ic">${b.icon}</span>` : ''}${b.label ? `<span class="lb">${b.label}</span>` : ''}</button>` : '<span class="nsd-gap"></span>').join('')}</div>`;
}

// Gesamter Rahmen: Glasdach, Zuschauer, Inhalt, Leiste, Zuschauer, Glasdach
export function frame({ body, bottom = '', bg = 'green', cls = '' }) {   // cls 'fixed': genau Bildschirmhöhe, Inhalt scrollt innen
  installCrowd();
  return `<div class="nsd ${cls}">
    <div class="nsd-roof"></div><div class="nsd-crowd top"></div><div class="nsd-rail"></div>
    <main class="nsd-main bg-${bg}">${body}</main>
    ${bottom}
    <div class="nsd-rail"></div><div class="nsd-crowd bottom"></div><div class="nsd-roof"></div>
  </div>`;
}

// Vollbild-Textkarte (grüner Rasen) mit Haken-Button
export function card(text, { okId = 'nsd-ok', left = null } = {}) {
  return frame({
    body: `<div class="nsd-card"><div>${text}</div></div>`,
    bottom: bar([left, null, { id: okId, icon: '<span class="nsd-check">✔</span>', wide: true }]),
  });
}

// Kopfzeilen-Buttons: ✖ → speichern + Titel, ? → Hilfe
export function bindHead(root, app, help = '') {
  root.querySelector('[data-nsd="menu"]')?.addEventListener('click', async () => {
    if (!await confirmDialog('Zum Hauptmenü?', 'Dein Spielstand wird gespeichert.', 'Hauptmenü')) return;
    app.save(); app.go('title');
  });
  root.querySelector('[data-nsd="help"]')?.addEventListener('click', () => modal({ title: 'Hilfe', body: help || 'Keine Hilfe verfügbar.' }));
}

// Star-Status-Balken: wächst seit der letzten Anzeige sichtbar an (Stufenaufstieg: von 0), dann gilt der Stand als gesehen
export function starMeter(state, { starIcon: ic, starPct: pctOf, starNeed: need }) {
  const p = state.player, lv = p.star?.level ?? 1, seen = p.starSeen ?? { level: lv, xp: p.star?.xp ?? 0 };
  const from = seen.level < lv ? 0 : seen.level > lv ? null : Math.min(100, (seen.xp / need(lv)) * 100);
  p.starSeen = { level: lv, xp: p.star?.xp ?? 0 };
  return meter({ icon: ic(lv), label: seen.level < lv ? `Star-Status ⬆ Stufe ${lv}` : 'Star-Status', pct: pctOf(p), from, cls: seen.level < lv ? 'lvup' : '' });
}
// Nach dem Einfügen: markierte Balken auf den Zielwert wachsen lassen
export function animateMeters(root) {
  const els = root.querySelectorAll('.nsd-meter .fill[data-to]');
  if (!els.length) return;
  requestAnimationFrame(() => requestAnimationFrame(() => els.forEach(el => {
    el.classList.add('grow'); el.parentElement.classList.add('growing');
    el.style.width = `${el.dataset.to}%`;
    setTimeout(() => el.parentElement.classList.remove('growing'), 1600);
  })));
}
