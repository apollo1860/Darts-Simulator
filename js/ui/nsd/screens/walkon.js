// Version 244: Walk-on-Song wählen (Liste data/walkons.txt wird erst hier geladen, nichts wird abgespielt)
import { esc } from '../../../util.js';
import { setWalkon, walkonWait, WALKON_WEEKS } from '../../../life.js';
import { frame, header, titleBand, bar, bindHead, checkIcon } from '../frame.js';
import { toast, confirmDialog } from '../../components.js';
import { icon as nicon } from '../icons.js';
import { loadSongs, songHits } from '../walkonList.js';

export const nsd = true;
const row = (s, i) => `<button class="nsd-walk-hit" data-i="${i}"><b>${esc(s.t)}</b><small>${esc(s.a)}</small></button>`;

export function render(app) {
  const p = app.state.player, wait = walkonWait(app.state);
  return frame({
    cls: 'fixed',
    body: `${header(p.name)}${titleBand('Walk-on')}
      <div class="nsd-walk-cur"><span class="ic">🎵</span><div>${p.walkon ? `<b>${esc(p.walkon.t)}</b><small>${esc(p.walkon.a)}</small>` : '<b>Noch kein Walk-on-Song</b>'}</div></div>
      ${wait ? `<div class="nsd-walk-wait">Neuer Walk-on erst in ${wait} ${wait === 1 ? 'Woche' : 'Wochen'} möglich.</div>` : ''}
      <input class="nsd-input nsd-walk-q" id="w-q" maxlength="40" placeholder="Titel oder Interpret …" autocomplete="off">
      <div class="nsd-scroll nsd-walk-list" id="w-list"><div class="nsd-walk-info">Lade Liste …</div></div>`,
    bottom: bar([{ go: 'hub', icon: nicon('home'), label: 'Start' }, null, { go: 'life', icon: checkIcon(), wide: true }]),
  });
}

export function mount(root, app) {
  const s = app.state;
  bindHead(root, app, `<p>Wähle deinen Walk-on-Song aus über 5.000 Titeln. Jeder Wechsel ist ein Risiko: Die Fans feiern den neuen Song – oder sie pfeifen ihn aus. Danach kannst du ${WALKON_WEEKS} Wochen nicht wechseln.</p>`);
  const list = root.querySelector('#w-list'), q = root.querySelector('#w-q');
  let shown = [];
  const draw = () => {
    shown = songHits(q.value, s.date.year * 52 + s.date.week);
    list.innerHTML = shown.length ? shown.map(row).join('') : '<div class="nsd-walk-info">Kein Titel gefunden.</div>';
    list.scrollTop = 0;
  };
  q.oninput = draw;
  loadSongs().then(draw).catch(() => { list.innerHTML = '<div class="nsd-walk-info">Liste konnte nicht geladen werden.</div>'; });
  list.onclick = async e => {
    const b = e.target.closest('[data-i]'); if (!b) return;
    const song = shown[+b.dataset.i]; if (!song) return;
    const wait = walkonWait(s);
    if (wait) return toast(`Neuer Walk-on erst in ${wait} ${wait === 1 ? 'Woche' : 'Wochen'} möglich.`, 'error');
    if (s.player.walkon && s.player.walkon.t === song.t && s.player.walkon.a === song.a) return toast('Das ist schon dein Walk-on.');
    if (!await confirmDialog('Walk-on ändern?', `„${esc(song.t)}“ von ${esc(song.a)} – wie kommt das bei den Fans an?`, 'Song nehmen')) return;
    try {
      const r = setWalkon(s, song); app.save();
      toast(r.good ? `🎵 Die Fans feiern deinen neuen Walk-on! Fans +${String(r.delta).replace('.', ',')}` : `👎 Die Fans pfeifen deinen neuen Walk-on aus. Fans ${String(r.delta).replace('.', ',')}`, r.good ? 'success' : 'error');
      app.refresh();
    } catch (err) { toast(err.message, 'error'); }
  };
}
