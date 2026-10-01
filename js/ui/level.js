// Level-Balken mit animiertem XP-Fortschritt (füllt sich, läuft bei Level-Aufstieg über) + Level-Up-Fenster.
// Zuletzt angezeigter Stand liegt nur im Speicher (Sitzung); player.levelSeen merkt sich das zuletzt gefeierte Level.
import { xpForLevel, MAX_LEVEL, POINTS_PER_LEVEL } from '../player.js';
import { fmtNum } from '../util.js';
import { modal } from './components.js';

let shown = null;          // {key, level, xp} zuletzt im Balken gezeigt
const keyOf = s => `${s.slot}|${s.player.name}|${s.createdAt ?? ''}`;
const need = L => (L >= MAX_LEVEL ? 1 : xpForLevel(L));
const pct = (L, xp) => (L >= MAX_LEVEL ? 100 : Math.min(100, xp / need(L) * 100));

// Startzustand des Balkens = zuletzt gezeigter Stand (Animation läuft danach zum aktuellen Stand)
export function levelBar(s) {
  const p = s.player, from = shown?.key === keyOf(s) ? shown : { level: p.level ?? 1, xp: p.xp };
  return `<div class="lvl-box" data-lvlbar>
    <div class="row-between"><b class="lvl-no">LEVEL <span data-lv>${from.level}</span></b>
      <span class="lvl-xp num" data-lxp>${fmtNum(Math.round(from.xp))} / ${fmtNum(need(from.level))} XP</span></div>
    <div class="xp-bar lvl-bar"><i data-lfill style="width:${pct(from.level, from.xp)}%"></i></div>
  </div>`;
}

// Nach dem Mounten: Balken animieren (falls vorhanden), danach ggf. Level-Up-Fenster
export function afterMount(root, app) {
  const s = app.state;
  if (!s?.player) return;
  const p = s.player, key = keyOf(s), to = { key, level: p.level ?? 1, xp: p.xp };
  const el = root.querySelector('[data-lvlbar]');
  if (!el) {                                         // kein Balken: Stand nicht weiterschieben; im laufenden Turnier Fenster aufheben
    if (shown?.key !== key) shown = to;
    if (s.activeEvent && !s.activeEvent.done) return;
    return checkLevelUp(app);
  }
  const from = shown?.key === key ? shown : to;
  shown = to;
  if (from.level === to.level && from.xp === to.xp) return checkLevelUp(app);
  const fill = el.querySelector('[data-lfill]'), lv = el.querySelector('[data-lv]'), lx = el.querySelector('[data-lxp]');
  const SEG_MS = 700;
  let L = from.level, xp = from.xp;
  const countTo = (target, ms) => {                 // Zahl hochzählen
    const start = xp, t0 = performance.now();
    const tick = now => {
      const k = Math.min(1, (now - t0) / ms);
      lx.textContent = `${fmtNum(Math.round(start + (target - start) * k))} / ${fmtNum(need(L))} XP`;
      if (k < 1 && el.isConnected) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const step = () => {
    if (!el.isConnected) return checkLevelUp(app);
    fill.style.transition = `width ${SEG_MS}ms ease-out`;
    if (L < to.level) {                              // bis 100 % füllen, dann Level +1
      countTo(need(L), SEG_MS);
      fill.style.width = '100%';
      setTimeout(() => {
        L++; xp = 0;
        lv.textContent = L;
        el.classList.remove('lvl-up'); void el.offsetWidth; el.classList.add('lvl-up');
        fill.style.transition = 'none'; fill.style.width = '0%';
        void fill.offsetWidth;
        setTimeout(step, 120);
      }, SEG_MS + 80);
    } else {
      countTo(to.xp, SEG_MS);
      fill.style.width = `${pct(L, to.xp)}%`;
      setTimeout(() => checkLevelUp(app), SEG_MS + 150);
    }
  };
  setTimeout(step, 350);
}

// Eigenes Fenster bei neuem Level
export function checkLevelUp(app) {
  const p = app.state?.player;
  if (!p) return;
  if (p.levelSeen === undefined) { p.levelSeen = p.level ?? 1; return; }
  if ((p.level ?? 1) <= p.levelSeen) return;
  const ups = p.level - p.levelSeen;
  p.levelSeen = p.level;
  app.save();
  modal({
    title: '',
    body: `<div class="lvlup">
      <div class="lvlup-label">LEVEL UP!</div>
      <div class="lvlup-no">${p.level}</div>
      <p>${ups > 1 ? `${ups} Level auf einmal! ` : ''}Du hast <b class="gold">+${ups * POINTS_PER_LEVEL} Attributpunkte</b> bekommen${p.points > ups * POINTS_PER_LEVEL ? ` (insgesamt ${p.points} frei)` : ''}.</p>
      ${p.level < MAX_LEVEL ? `<p class="muted" style="font-size:.8rem">Nächstes Level: ${fmtNum(xpForLevel(p.level))} XP</p>` : '<p class="gold">Maximales Level erreicht!</p>'}
    </div>`,
    actions: [
      { label: 'Später', cls: 'btn-ghost' },
      { label: 'Punkte verteilen', cls: 'btn-gold', onClick: () => app.go('profile') },
    ],
  });
}
