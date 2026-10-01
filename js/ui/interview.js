// Interview-Minispiel: 5×5 Floskeln, 4–6 leuchten nacheinander grün auf, dann Reihenfolge nachtippen
import { PHRASES } from '../../data/interviews.js';
import { resolveInterview, skipInterview, interviewReward } from '../interviews.js';
import { modal } from './components.js';
import { esc } from '../util.js';

const ON_MS = 750, GAP_MS = 300;

export function interviewPanel(s) {
  const iv = s.interview;
  if (!iv) return '';
  const r = interviewReward(s, iv.seq.length);
  return `<div class="panel interview-ask">
    <div class="row-between"><h3>🎤 Interview-Anfrage</h3><span class="badge badge-green">+${r.xp} XP · +${r.clutch} Clutch</span></div>
    <p class="muted" style="font-size:.84rem;margin:6px 0 10px">Die Presse wartet nach „${esc(iv.event)}“. Merke dir, welche Floskeln in welcher Reihenfolge aufleuchten (${iv.seq.length} Stück), und gib sie danach genauso wieder.</p>
    <div class="row"><button class="btn btn-gold" id="iv-start">Zum Interview</button><button class="btn btn-ghost" id="iv-skip">Ablehnen</button></div>
  </div>`;
}

export function bindInterview(root, app) {
  root.querySelector('#iv-skip')?.addEventListener('click', () => { skipInterview(app.state); app.save(); app.refresh(); });
  root.querySelector('#iv-start')?.addEventListener('click', () => play(app));
}

function play(app) {
  const iv = app.state.interview;
  if (!iv) return;
  const picks = [];
  let phase = 'show', timers = [];
  modal({
    title: '🎤 Interview',
    dismissable: false,
    body: `<p class="muted" id="iv-msg" style="font-size:.84rem;margin-bottom:8px">Merk dir die Reihenfolge …</p>
      <div class="iv-grid">${iv.tiles.map((t, i) => `<button class="iv-tile" data-t="${i}" disabled>${esc(PHRASES[t])}</button>`).join('')}</div>`,
    actions: [],
    onMount: bd => {
      const tiles = [...bd.querySelectorAll('.iv-tile')], msg = bd.querySelector('#iv-msg');
      iv.seq.forEach((pos, k) => {
        timers.push(setTimeout(() => tiles[pos].classList.add('lit'), 700 + k * (ON_MS + GAP_MS)));
        timers.push(setTimeout(() => tiles[pos].classList.remove('lit'), 700 + k * (ON_MS + GAP_MS) + ON_MS));
      });
      timers.push(setTimeout(() => {
        phase = 'input';
        msg.innerHTML = `<b class="cyan">Jetzt du:</b> Tippe die ${iv.seq.length} Floskeln in der richtigen Reihenfolge.`;
        tiles.forEach(t => { t.disabled = false; });
      }, 700 + iv.seq.length * (ON_MS + GAP_MS)));
      tiles.forEach(t => t.onclick = () => {
        if (phase !== 'input') return;
        const i = +t.dataset.t, k = picks.length;
        picks.push(i);
        const ok = iv.seq[k] === i;
        t.classList.add(ok ? 'good' : 'bad');
        if (ok && picks.length < iv.seq.length) return;
        phase = 'done';
        tiles.forEach(x => { x.disabled = true; });
        if (!ok) iv.seq.forEach((p, n) => tiles[p].insertAdjacentHTML('beforeend', `<small class="iv-no">${n + 1}</small>`));
        setTimeout(() => { bd.remove(); result(app, resolveInterview(app.state, picks)); }, ok ? 600 : 1800);
      });
    },
  });
}

function result(app, r) {
  app.save();
  modal({
    title: r.ok ? '🎤 Starkes Interview!' : '🎤 Floskel-Salat',
    body: r.ok ? `<p>Die Reporter sind begeistert. <b class="cyan">+${r.xp} XP</b>, <b class="gold">+${r.clutch} Clutch-Punkte</b>${r.expUp > 0 ? ` – <b class="gold">Erfahrung steigt!</b>` : ''}${r.ups ? ` · <b class="gold">Level ${app.state.player.level}!</b>` : ''}</p>`
      : '<p>Du hast dich verhaspelt. Diesmal gibt es keinen Bonus.</p>',
    actions: [{ label: 'Weiter', cls: 'btn-primary', onClick: () => app.refresh() }],
  });
}
