// Geräte-Einstellungen (nicht im Spielstand): Zoom-Hilfe beim Checken
const KEY = 'newStarDarts.settings';
const DEFAULTS = { zoom: false };
export function getSettings() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }; } catch { return { ...DEFAULTS }; }
}
export function setSetting(k, v) {
  const s = getSettings(); s[k] = v;
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* Speicher nicht verfügbar */ }
  return s;
}
