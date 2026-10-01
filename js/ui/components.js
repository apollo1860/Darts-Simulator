// Wiederverwendbare UI-Bausteine
import { esc, fmtEUR, fmtNum } from '../util.js';
import { flag } from '../../data/nations.js';
import { ATTRS, overall, targetAverage } from '../player.js';
import { tourStatus } from '../world.js';
import { CATEGORIES } from '../../data/tournaments.js';

// ---- Toast ----
export function toast(msg, type = '') {
  const host = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  host.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 2600);
}

// ---- Modal ----
// actions: [{label, cls, onClick, keepOpen}]
export function modal({ title, body, actions = [{ label: 'OK', cls: 'btn-primary' }], onMount, dismissable = true }) {
  const bd = document.createElement('div');
  bd.className = 'modal-backdrop';
  bd.innerHTML = `<div class="modal" role="dialog" aria-modal="true">
    ${title ? `<h3>${esc(title)}</h3>` : ''}
    <div class="modal-body">${body ?? ''}</div>
    <div class="modal-actions">${actions.map((a, i) =>
      `<button class="btn ${a.cls ?? ''}" data-i="${i}" ${a.disabled ? 'disabled' : ''}>${esc(a.label)}</button>`).join('')}</div>
  </div>`;
  const close = () => { bd.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape' && dismissable) close(); };
  bd.addEventListener('click', e => {
    if (e.target === bd && dismissable) return close();
    const b = e.target.closest('[data-i]');
    if (!b) return;
    const a = actions[+b.dataset.i];
    const r = a.onClick?.(bd);
    if (!a.keepOpen && r !== false) close();
  });
  document.addEventListener('keydown', onKey);
  document.body.appendChild(bd);
  onMount?.(bd);
  return close;
}

export const confirmDialog = (title, text, okLabel = 'Bestätigen', okCls = 'btn-primary') =>
  new Promise(res => modal({
    title, body: `<p>${text}</p>`,
    actions: [{ label: 'Abbrechen', cls: 'btn-ghost', onClick: () => res(false) },
      { label: okLabel, cls: okCls, onClick: () => res(true) }],
  }));

// ---- Topbar ----
export function topbar({ title, sub = '', back = 'hub', money = null }) {
  return `<header class="topbar">
    ${back ? `<button class="back-btn" data-go="${back}" aria-label="Zurück">◂</button>` : ''}
    <div class="title"><h2>${esc(title)}</h2>${sub ? `<div class="sub">${sub}</div>` : ''}</div>
    ${money !== null ? `<div class="money num">${fmtEUR(money)}</div>` : ''}
  </header>`;
}

// ---- Kategorie-Tag ----
export const catTag = cat => `<span class="tag tag-${cat}">${esc(CATEGORIES[cat]?.short ?? cat)}</span>`;

// ---- FUT-Karte ----
export function cardTier(ovr) {
  if (ovr >= 85) return 'elite';
  if (ovr >= 70) return 'gold';
  if (ovr >= 50) return 'silver';
  return 'bronze';
}
const initials = name => name.split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase();

export function futCard(p, { small = false, me = false } = {}) {
  const ovr = overall(p.attrs);
  const status = tourStatus(p);
  return `<div class="fut-card ${cardTier(ovr)} ${small ? 'small' : ''} ${me ? 'me' : ''}">
    <div class="fut-top">
      <div><div class="fut-ovr">${ovr}</div><div class="fut-pos">${fmtNum(targetAverage(p.attrs), 0)} Ø</div></div>
      <div class="fut-flag" title="${esc(p.nation)}">${flag(p.nation)}</div>
    </div>
    <div class="fut-avatar">${esc(initials(p.name))}</div>
    <div class="fut-name ${p.name.length > 14 ? 'long' : ''}">${esc(p.name)}</div>
    <div class="fut-attrs">
      ${ATTRS.map(a => `<span><b>${p.attrs[a.key]}</b> ${a.short}</span>`).join('')}
      <span><b>${p.age}</b> ALT</span>
    </div>
    <div class="fut-foot">${esc(status)}</div>
  </div>`;
}

export function playerModal(p, me = false) {
  modal({ title: p.name, body: `<div class="card-stage">${futCard(p, { me })}</div>` });
}

export const nameWithFlag = p => `${flag(p.nation)} ${esc(p.name)}`;
