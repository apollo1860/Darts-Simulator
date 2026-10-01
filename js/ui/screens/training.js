// Wochenplan: genau eine Aktivität pro Woche (Training, Ruhetag, Sponsortermin, Exhibition) + Ermüdung
import { esc, fmtPct, fmtEUR } from '../../util.js';
import { ATTRS } from '../../player.js';
import { train, trainingOf, sessionsFor, DECAY_AFTER, idleOf, ACTIVITIES, canDo, doActivity, weekActivity, sponsorGigValue, exhibitionValue, exOffer, trainingXp, exhibitionXp, PREP_BONUS, RECOVERY, recoveryPrice, canRecover, buyRecovery } from '../../training.js';
import { topbar, modal } from '../components.js';
import { staffOf, acceptGig, declineGig } from '../../staff.js';

export function fatigueBar(p) {
  const f = p.fatigue ?? 0;
  const cls = f > 60 ? 'neg' : f > 30 ? 'gold' : 'pos';
  return `<div class="row-between"><span class="label">Ermüdung</span><b class="${cls}">${f} %</b></div>
    <div class="xp-bar fatigue"><i style="width:${f}%"></i></div>
    <div class="muted" style="font-size:.75rem">${f > 30 ? 'Über 30 % leidet deine Leistung (Scoring, Fokus, Finishing).' : 'Fit. Turniere ermüden, jede Woche erholst du dich um 10 %.'}</div>`;
}

// Aktive Turniervorbereitung
export function prepLine(p) {
  if (!p.prep) return '<span class="muted">Keine Turniervorbereitung aktiv.</span>';
  const a = ATTRS.find(x => x.key === p.prep.key);
  return `<b class="gold">🎯 Vorbereitung aktiv: ${esc(a.label)} +${p.prep.bonus}</b> <span class="muted">(${p.prep.weeks > 1 ? 'diese und nächste Woche' : 'noch diese Woche'})</span>`;
}

// Exhibition-Einladungen vom Manager (zusätzlich zum Wochenplan, nur Klick-Event)
function gigs(s) {
  const g = staffOf(s).gigs ?? [];
  if (!g.length) return '';
  return `<div class="section-title"><span class="label">🎪 Einladungen vom Manager</span></div>
  <div class="stack" style="margin-bottom:12px">${g.map(x => `<div class="panel row-between">
    <div><b>${esc(x.kind)}</b> · ${esc(x.city)}<div class="muted" style="font-size:.8rem">Gage ${fmtEUR(x.fee)} (vor Provision) · Ermüdung +15 · gültig bis KW ${x.until.week}</div></div>
    <div class="row" style="gap:6px"><button class="btn btn-sm btn-primary" data-gig="${x.id}">Annehmen</button><button class="btn btn-sm btn-ghost" data-nogig="${x.id}">✕</button></div>
  </div>`).join('')}</div>`;
}

export function render(app) {
  const s = app.state, p = s.player, t = trainingOf(s), act = weekActivity(s), by = idleOf(s);
  const due = ATTRS.filter(a => by[a.key] >= DECAY_AFTER - 1 && s.week.trained !== a.key);   // ab 5 Wochen: Warnung
  const warn = due.length > 0;
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
    <div class="${warn ? 'neg' : 'muted'}" style="font-size:.82rem;margin-top:4px">${warn
      ? `⚠ Bald fällig: ${due.map(a => `${esc(a.label)} (${by[a.key]} Wo.)`).join(', ')} – jedes Attribut mindestens alle ${DECAY_AFTER} Wochen trainieren, sonst Formverlust.`
      : `Jedes Attribut mindestens alle ${DECAY_AFTER} Wochen einmal trainieren, sonst droht Formverlust.`}</div>
  </div>
  <div class="panel" style="margin-bottom:12px">${fatigueBar(p)}
    <div class="row" style="margin-top:10px">${Object.entries(RECOVERY).map(([k, r]) => {
      const st = canRecover(s, k);
      return `<button class="btn btn-sm ${st.ok ? '' : 'btn-ghost'}" data-rec="${k}" ${st.ok ? '' : 'disabled'} title="Zusätzlich zur Wochenaktivität, 1× pro Woche">
        ${r.icon} ${r.label} −${r.fatigue} % · ${st.ok || st.reason === 'Zu teuer' ? fmtEUR(recoveryPrice(s, k)) : esc(st.reason)}</button>`;
    }).join('')}</div>
  </div>
  ${gigs(s)}
  <div class="section-title"><span class="label">🏋️ Training</span></div>
  <div class="panel" style="margin-bottom:10px;font-size:.84rem">
    ${prepLine(p)}
    <div class="muted" style="margin-top:4px">Jede Einheit: <b class="cyan">+${trainingXp(p)} XP</b> (±30 % je nach Tagesform) und <b class="gold">+${PREP_BONUS}</b> auf das Attribut für Turniere dieser und nächster Woche. Dazu langsamer Fortschritt zum dauerhaften +1.</div>
  </div>
  <div class="stack">${ATTRS.map(a => {
    const v = p.attrs[a.key], need = sessionsFor(v), prog = Math.min(1, t.progress[a.key] ?? 0);
    return `<div class="panel">
      <div class="row-between"><div><div class="attr-name">${a.label} <span class="attr-val" style="font-size:1.3rem;margin-left:6px">${v}</span></div>
        <div class="muted" style="font-size:.78rem">${a.info} · ${need} Einheiten für +1</div></div>
        <button class="btn btn-sm btn-primary" data-train="${a.key}" ${act || v >= 100 ? 'disabled' : ''}>Trainieren</button></div>
      <div class="xp-bar" style="margin-top:8px"><i style="width:${prog * 100}%"></i></div>
      <div class="row-between" style="font-size:.75rem;margin-top:3px"><span class="muted">Fortschritt ${fmtPct(prog, 0)}</span>
        <span class="${by[a.key] >= DECAY_AFTER ? 'neg' : by[a.key] >= DECAY_AFTER - 1 ? 'gold' : 'muted'}">${by[a.key] === 0 ? 'gerade trainiert' : `zuletzt vor ${by[a.key]} Wo.`}${by[a.key] >= DECAY_AFTER ? ' · Formverlust droht!' : ''}</span></div>
    </div>`;
  }).join('')}</div>
  <div class="section-title"><span class="label">Alternativen</span></div>
  <div class="stack">
    ${card('rest')}
    ${card('sponsor', s.sponsors.active.length ? `<div class="pos" style="font-size:.8rem">≈ ${fmtEUR(sponsorGigValue(s))}</div>` : '')}
    ${card('exhibition', exOffer(s) ? `<div class="pos" style="font-size:.8rem">Angebot ${esc(exOffer(s).city)}: ${fmtEUR(exhibitionValue(s))} · +${exhibitionXp(p)} XP · bis KW ${exOffer(s).until.week}</div>`
      : `<div class="muted" style="font-size:.8rem">${p.tour === 'tour' ? 'Aktuell kein Angebot – Angebote kommen zufällig, je höher dein Level, desto mehr Gage.' : 'Angebote erst ab Tourcard.'}</div>`)}
  </div>
  <p class="muted" style="font-size:.78rem;margin-top:12px">Training, Ruhetag, Sponsortermin oder Exhibition – nur eins davon pro Woche. Nur Training schützt vor Formverlust (ab 4 Wochen Pause).</p>`;
}

export function mount(root, app) {
  const done = (title, text) => modal({ title, body: `<p>${text}</p>`, actions: [{ label: 'Weiter', cls: 'btn-primary', onClick: () => app.refresh() }] });
  root.querySelectorAll('[data-train]').forEach(b => b.onclick = () => {
    const r = train(app.state, b.dataset.train);
    if (!r) return;
    app.save();
    const label = ATTRS.find(a => a.key === b.dataset.train).label;
    done(r.up ? `⬆ ${label} +1!` : `🏋️ ${r.text}`,
      `${r.up ? `Durchbruch – ${esc(label)} steigt auf <b>${app.state.player.attrs[b.dataset.train]}</b>.` : `${esc(label)}: Fortschritt jetzt ${fmtPct(r.progress, 0)} (${r.need} Einheiten für +1).`}
      <br><b class="cyan">+${r.xp} XP</b>${r.ups ? ` – <b class="gold">Level ${app.state.player.level}!</b>` : ''} · <b class="gold">${esc(label)} +${PREP_BONUS}</b> für Turniere dieser und nächster Woche.`);
  });
  root.querySelectorAll('[data-rec]').forEach(b => b.onclick = () => {
    const r = buyRecovery(app.state, b.dataset.rec);
    if (!r.ok) return;
    app.save();
    done(`${RECOVERY[b.dataset.rec].icon} ${RECOVERY[b.dataset.rec].label}`, esc(r.text));
  });
  root.querySelectorAll('[data-gig]').forEach(b => b.onclick = () => {
    const r = acceptGig(app.state, b.dataset.gig);
    if (!r) return;
    app.save();
    done('🎪 Exhibition', `${esc(r.text)}${r.ups ? ` <b class="gold">Level ${app.state.player.level}!</b>` : ''}`);
  });
  root.querySelectorAll('[data-nogig]').forEach(b => b.onclick = () => { declineGig(app.state, b.dataset.nogig); app.save(); app.refresh(); });
  root.querySelectorAll('[data-act]').forEach(b => b.onclick = () => {
    const r = doActivity(app.state, b.dataset.act);
    if (!r.ok) return;
    app.save();
    done(`${ACTIVITIES[b.dataset.act].icon} ${ACTIVITIES[b.dataset.act].label}`, esc(r.text));
  });
}
