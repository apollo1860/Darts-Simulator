// Training: 1 Einheit pro Woche, Fortschritt je Attribut, Warnung bei Trainingspause
import { esc, fmtPct } from '../../util.js';
import { ATTRS } from '../../player.js';
import { train, trainingOf, sessionsFor, trainedThisWeek, DECAY_AFTER } from '../../training.js';
import { topbar, modal } from '../components.js';

export function render(app) {
  const s = app.state, p = s.player, t = trainingOf(s), done = trainedThisWeek(s);
  const warn = t.idle >= DECAY_AFTER - 1 && !done;
  return `${topbar({ title: 'Training', sub: `1 Einheit pro Woche · ${t.sessions} Einheiten gesamt` })}
  <div class="panel ${warn ? 'warn' : ''}" style="margin-bottom:12px">
    ${done ? `<b class="pos">✔ Diese Woche trainiert (${esc(ATTRS.find(a => a.key === s.week.trained).label)}).</b> <span class="muted">Nächste Einheit ab kommender Woche.</span>`
      : t.idle ? `<b class="${warn ? 'neg' : ''}">${t.idle} Woche${t.idle > 1 ? 'n' : ''} ohne Training.</b> <span class="muted">Ab ${DECAY_AFTER} Wochen Pause droht jede Woche ein Formverlust (−1, eher bei hohen Werten; Risiko steigt bis 40 %).</span>`
      : '<span class="muted">Wähle ein Attribut für die Einheit dieser Woche.</span>'}
  </div>
  <div class="stack">${ATTRS.map(a => {
    const v = p.attrs[a.key], need = sessionsFor(v), prog = Math.min(1, t.progress[a.key] ?? 0);
    return `<div class="panel">
      <div class="row-between"><div><div class="attr-name">${a.label} <span class="attr-val" style="font-size:1.3rem;margin-left:6px">${v}</span></div>
        <div class="muted" style="font-size:.78rem">${a.info} · ${need} Einheiten für +1</div></div>
        <button class="btn btn-sm btn-primary" data-train="${a.key}" ${done || v >= 100 ? 'disabled' : ''}>Trainieren</button></div>
      <div class="xp-bar" style="margin-top:8px"><i style="width:${prog * 100}%"></i></div>
      <div class="muted" style="font-size:.75rem;margin-top:3px">Fortschritt ${fmtPct(prog, 0)}</div>
    </div>`;
  }).join('')}</div>
  <p class="muted" style="font-size:.78rem;margin-top:12px">Training ist zusätzlich zum Turnier der Woche möglich und kostet nichts. Höhere Werte brauchen mehr Einheiten. Trainingspunkte aus Turnieren (XP) verteilst du weiterhin im Profil.</p>`;
}

export function mount(root, app) {
  root.querySelectorAll('[data-train]').forEach(b => b.onclick = () => {
    const r = train(app.state, b.dataset.train);
    if (!r) return;
    app.save();
    const label = ATTRS.find(a => a.key === b.dataset.train).label;
    modal({
      title: r.up ? `⬆ ${label} +1!` : `🏋️ ${r.text}`,
      body: `<p>${r.up ? `Durchbruch – ${esc(label)} steigt auf <b>${app.state.player.attrs[b.dataset.train]}</b>.` : `${esc(label)}: Fortschritt jetzt ${fmtPct(r.progress, 0)} (${r.need} Einheiten für +1).`}</p>`,
      actions: [{ label: 'Weiter', cls: 'btn-primary', onClick: () => app.refresh() }],
    });
  });
}
