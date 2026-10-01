// Wochenplan: genau eine Aktivität pro Woche (Training, Ruhetag, Sponsortermin, Exhibition) + Ermüdung
import { esc, fmtPct, fmtEUR } from '../../util.js';
import { ATTRS } from '../../player.js';
import { train, trainingOf, sessionsFor, DECAY_AFTER, ACTIVITIES, canDo, doActivity, weekActivity, sponsorGigValue, exhibitionValue } from '../../training.js';
import { topbar, modal } from '../components.js';

export function fatigueBar(p) {
  const f = p.fatigue ?? 0;
  const cls = f > 60 ? 'neg' : f > 30 ? 'gold' : 'pos';
  return `<div class="row-between"><span class="label">Ermüdung</span><b class="${cls}">${f} %</b></div>
    <div class="xp-bar fatigue"><i style="width:${f}%"></i></div>
    <div class="muted" style="font-size:.75rem">${f > 30 ? 'Über 30 % leidet deine Leistung (Scoring, Fokus, Finishing).' : 'Fit. Turniere ermüden, jede Woche erholst du dich um 10 %.'}</div>`;
}

export function render(app) {
  const s = app.state, p = s.player, t = trainingOf(s), act = weekActivity(s);
  const warn = t.idle >= DECAY_AFTER - 1 && act !== 'train';
  const status = act
    ? `<b class="pos">✔ Diese Woche: ${ACTIVITIES[act].icon} ${ACTIVITIES[act].label}${act === 'train' ? ` (${esc(ATTRS.find(a => a.key === s.week.trained).label)})` : ''}</b> <span class="muted">– nächste Aktivität ab kommender Woche.</span>`
    : '<span class="muted">Eine Aktivität pro Woche – zusätzlich zum Turnier. Wähle klug!</span>';
  const card = (type, extra = '') => {
    const a = ACTIVITIES[type], st = canDo(s, type);
    return `<div class="panel stack">
      <div class="row-between"><div><h3>${a.icon} ${a.label}</h3><div class="muted" style="font-size:.8rem">${a.info}</div>${extra}</div>
        <button class="btn btn-sm btn-primary" data-act="${type}" ${st.ok ? '' : 'disabled'}>${st.ok ? 'Wählen' : esc(st.reason)}</button></div>
    </div>`;
  };
  return `${topbar({ title: 'Wochenplan', sub: `KW ${s.date.week} · 1 Aktivität pro Woche` })}
  <div class="panel ${warn ? 'warn' : ''}" style="margin-bottom:12px">${status}
    ${t.idle && act !== 'train' ? `<div class="${warn ? 'neg' : 'muted'}" style="font-size:.82rem;margin-top:4px">${t.idle} Woche${t.idle > 1 ? 'n' : ''} ohne Training – ab ${DECAY_AFTER} Wochen droht Formverlust.</div>` : ''}
  </div>
  <div class="panel" style="margin-bottom:12px">${fatigueBar(p)}</div>
  <div class="section-title"><span class="label">🏋️ Training</span></div>
  <div class="stack">${ATTRS.map(a => {
    const v = p.attrs[a.key], need = sessionsFor(v), prog = Math.min(1, t.progress[a.key] ?? 0);
    return `<div class="panel">
      <div class="row-between"><div><div class="attr-name">${a.label} <span class="attr-val" style="font-size:1.3rem;margin-left:6px">${v}</span></div>
        <div class="muted" style="font-size:.78rem">${a.info} · ${need} Einheiten für +1</div></div>
        <button class="btn btn-sm btn-primary" data-train="${a.key}" ${act || v >= 100 ? 'disabled' : ''}>Trainieren</button></div>
      <div class="xp-bar" style="margin-top:8px"><i style="width:${prog * 100}%"></i></div>
      <div class="muted" style="font-size:.75rem;margin-top:3px">Fortschritt ${fmtPct(prog, 0)}</div>
    </div>`;
  }).join('')}</div>
  <div class="section-title"><span class="label">Alternativen</span></div>
  <div class="stack">
    ${card('rest')}
    ${card('sponsor', s.sponsors.active.length ? `<div class="pos" style="font-size:.8rem">≈ ${fmtEUR(sponsorGigValue(s))}</div>` : '')}
    ${card('exhibition', `<div class="pos" style="font-size:.8rem">≈ ${fmtEUR(exhibitionValue(s))} · +60 XP</div>`)}
  </div>
  <p class="muted" style="font-size:.78rem;margin-top:12px">Training, Ruhetag, Sponsortermin oder Exhibition – nur eins davon pro Woche. Nur Training schützt vor Formverlust.</p>`;
}

export function mount(root, app) {
  const done = (title, text) => modal({ title, body: `<p>${text}</p>`, actions: [{ label: 'Weiter', cls: 'btn-primary', onClick: () => app.refresh() }] });
  root.querySelectorAll('[data-train]').forEach(b => b.onclick = () => {
    const r = train(app.state, b.dataset.train);
    if (!r) return;
    app.save();
    const label = ATTRS.find(a => a.key === b.dataset.train).label;
    done(r.up ? `⬆ ${label} +1!` : `🏋️ ${r.text}`,
      r.up ? `Durchbruch – ${esc(label)} steigt auf <b>${app.state.player.attrs[b.dataset.train]}</b>.` : `${esc(label)}: Fortschritt jetzt ${fmtPct(r.progress, 0)} (${r.need} Einheiten für +1).`);
  });
  root.querySelectorAll('[data-act]').forEach(b => b.onclick = () => {
    const r = doActivity(app.state, b.dataset.act);
    if (!r.ok) return;
    app.save();
    done(`${ACTIVITIES[b.dataset.act].icon} ${ACTIVITIES[b.dataset.act].label}`, esc(r.text));
  });
}
