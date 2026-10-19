// New-Star-Darts-Oberfläche: Rahmen (Glasdach + Zuschauer oben/unten), Titelband, Leisten, Balken, Buttons, Icons
import { esc } from '../../util.js';
import { installCrowd } from './crowd.js';
import { confirmDialog, modal } from '../components.js';

// ---- Icons (eigene SVGs) ----
export const starIcon = (n = '', cls = '') => `<span class="nsd-star ${cls}"><svg viewBox="0 0 48 46"><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6a8"/><stop offset=".45" stop-color="#ffcf2e"/><stop offset="1" stop-color="#f08a00"/></linearGradient></defs><path d="M24 2l6.6 14.2 15.4 1.8-11.4 10.6 3 15.3L24 36.4 10.4 43.9l3-15.3L2 18l15.4-1.8z" fill="url(#sg)" stroke="#c46a00" stroke-width="1.5"/></svg>${n !== '' ? `<b>${n}</b>` : ''}</span>`;
export const heartIcon = () => '<span class="nsd-heart"><svg viewBox="0 0 48 44"><defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6b6b"/><stop offset="1" stop-color="#c40000"/></linearGradient></defs><path d="M24 42S2 28 2 14C2 6 8 2 14 2c4.6 0 8 2.6 10 6 2-3.4 5.4-6 10-6 6 0 12 4 12 12 0 14-22 28-22 28z" fill="url(#hg)" stroke="#8a0000" stroke-width="1.5"/><ellipse cx="14" cy="11" rx="5" ry="3" fill="#fff" opacity=".45"/></svg></span>';
export const coin = n => `<span class="nsd-coin">${starIcon('', 'sm')}${n}</span>`;

// ---- Bausteine ----
export const titleBand = text => `<div class="nsd-title"><span>${text}</span></div>`;
export const darkBar = (text, extra = '') => `<div class="nsd-dark ${extra}">${text}</div>`;

// Balken mit Icon links, Beschriftung mittig (pct 0–100)
export function meter({ icon = '', label, pct = 0, tone = 'green', cls = '', title = '' }) {
  const p = Math.max(0, Math.min(100, pct));
  return `<div class="nsd-meter ${cls}" ${title ? `title="${esc(title)}"` : ''}><i class="fill ${tone}" style="width:${p}%"></i>${icon ? `<span class="ic">${icon}</span>` : ''}<span class="lb">${label}</span></div>`;
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
    body: `<div class="nsd-card">${text}</div>`,
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
