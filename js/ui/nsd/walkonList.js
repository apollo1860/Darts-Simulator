// Version 245: Walk-on-Liste (data/walkons.txt) erst bei Bedarf laden und durchsuchen – genutzt von Profilerstellung und Walk-on-Screen
import { parseWalkon } from '../../life.js';

export const MAX_HITS = 60;
let SONGS = null, loading = null;
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’‘`´]/g, "'");
export const songsLoaded = () => SONGS;
export function loadSongs() {
  loading ??= fetch('data/walkons.txt').then(r => r.text()).then(txt => {
    SONGS = txt.split('\n').map(l => l.trim()).filter(Boolean).map((l, i) => { const s = parseWalkon(l); return { ...s, i, k: norm(`${s.t} ${s.a}`) }; });
    return SONGS;
  }).catch(e => { loading = null; throw e; });
  return loading;
}
export function songHits(q, seed = 0) {
  if (!SONGS) return [];
  const words = norm(q).split(/\s+/).filter(Boolean);
  if (!words.length) {   // ohne Suche: wechselnde Vorschläge (fest je Seed)
    const n = SONGS.length, step = 389, start = (seed * 977) % n;
    return Array.from({ length: Math.min(MAX_HITS, n) }, (_, i) => SONGS[(start + i * step) % n]);
  }
  const out = [];
  for (const s of SONGS) { if (words.every(w => s.k.includes(w))) { out.push(s); if (out.length >= MAX_HITS) break; } }
  return out;
}
