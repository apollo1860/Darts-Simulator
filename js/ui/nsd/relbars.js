// Version 149: Beziehungsbalken mit Zu-/Abnahme (Bewertung nach dem Match, Ende eines Interviews)
import { esc, fmtNum } from '../../util.js';
import { relLabelOf } from '../../nsd.js';
import { meter } from './frame.js';

// Änderung als Text: ganze Zahlen ohne Komma, sonst eine Nachkommastelle; 0 → „±0“
export const deltaTxt = (d, unit = '') => {
  const r = Math.round(d * 10) / 10;
  if (!r) return `<b class="d">±0${unit}</b>`;
  return `<b class="d ${r > 0 ? 'pos' : 'neg'}">${r > 0 ? '+' : '−'}${fmtNum(Math.abs(r), Number.isInteger(r) ? 0 : 1)}${unit}</b>`;
};
// Aktive Beziehungen: Fans immer, Manager/Sponsoren nur mit Vertrag, Freundin/Freund nur in einer Beziehung
export function activeRels(state, keys = ['manager', 'fans', 'sponsors', 'partner']) {
  const p = state.player, rel = p.rel ?? {};
  const has = { fans: true, manager: !!state.team?.manager, sponsors: (state.nsdSponsors?.active?.length ?? 0) > 0 || (rel.sponsors ?? 0) > 0, partner: (rel.partner ?? 0) > 0 };
  return keys.filter(k => has[k]);
}
// Balken je Beziehung; before = Werte vorher (fehlt einer, ohne Animation). keys = welche, all = auch inaktive (grau)
export function relBars(state, before = {}, { keys = ['manager', 'fans', 'sponsors'], all = false, cls = '' } = {}) {
  const p = state.player, rel = p.rel ?? {}, act = new Set(activeRels(state, keys));
  return keys.filter(k => all || act.has(k)).map(k => {
    const on = act.has(k), now = rel[k] ?? 0, was = before[k] ?? now;
    const name = k === 'partner' && p.partnerName && !p.married ? esc(p.partnerName) : relLabelOf(p, k);
    return meter({ label: on ? `${name} ${deltaTxt(now - was)}` : name, pct: on ? now : 0, from: on ? was : null, tone: on ? 'green' : 'grey', cls });
  }).join('');
}
