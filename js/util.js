// Formatierung & Hilfsfunktionen (DOM-frei)
const eur = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
export const fmtEUR = v => eur.format(Math.round(v));
export const fmtNum = (v, d = 0) =>
  new Intl.NumberFormat('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
export const fmtPct = (v, d = 1) => fmtNum(v * 100, d) + ' %';
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const esc = s => String(s ?? '').replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August',
  'September', 'Oktober', 'November', 'Dezember'];
export const MONTHS_SHORT = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];
export const WEEKS_PER_YEAR = 52;

// Montag der ISO-Kalenderwoche (UTC)
export function isoWeekMonday(year, week) {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const day = (jan4.getUTCDay() + 6) % 7;
  const mon = new Date(jan4);
  mon.setUTCDate(jan4.getUTCDate() - day + (week - 1) * 7);
  return mon;
}
const addDays = (d, n) => { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; };

// Monat (0–11) einer KW, bestimmt über den Donnerstag
export const monthOfWeek = (year, week) => addDays(isoWeekMonday(year, week), 3).getUTCMonth();

export function weekRange(year, week) {
  const a = isoWeekMonday(year, week), b = addDays(a, 6);
  const sameMonth = a.getUTCMonth() === b.getUTCMonth();
  return sameMonth
    ? `${a.getUTCDate()}.–${b.getUTCDate()}. ${MONTHS_SHORT[b.getUTCMonth()]} ${b.getUTCFullYear()}`
    : `${a.getUTCDate()}. ${MONTHS_SHORT[a.getUTCMonth()]} – ${b.getUTCDate()}. ${MONTHS_SHORT[b.getUTCMonth()]} ${b.getUTCFullYear()}`;
}
export const weekLabel = (year, week) => `KW ${week} · ${weekRange(year, week)}`;

export const uid = (() => { let n = 0; return p => `${p}${Date.now().toString(36)}${(n++).toString(36)}`; })();
