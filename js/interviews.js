// Interviews nach Majors (DOM-frei): 5×5-Raster mit Floskeln, 4–6 leuchten nacheinander auf,
// danach in richtiger Reihenfolge antippen → Bonus-XP + Clutch-Punkte (Erfahrung). Ein Fehler beendet das Interview.
import { PHRASES } from '../data/interviews.js';
import { RNG } from './rng.js';
import { addXp, addClutch, xpForLevel, expLabel, pointsGained } from './player.js';
import { addNews } from './news.js';
import { xpMult } from './staff.js';

export const GRID = 25;
// Chance je Platzierung (Majors außer WM-Quali, Premier-League-Play-offs, World-Series-Finals)
const CHANCE = { W: 1, F: 0.8, SF: 0.6, QF: 0.4 };
export const interviewEligible = inst => !inst.isQualifier && inst.place
  && ((inst.cat === 'major' && inst.eventId !== 'wm-quali') || inst.eventId === 'pl-final' || inst.eventId === 'ws-final');

// Nach einem eigenen Turnier: evtl. Interview-Anfrage anlegen (state.interview)
export function maybeInterview(state, inst) {
  if (!interviewEligible(inst)) return null;
  const rng = new RNG(state.rng);
  if (!rng.chance(CHANCE[inst.place] ?? 0.25)) return null;
  const tiles = rng.shuffle(PHRASES.map((_, i) => i)).slice(0, GRID);
  const len = inst.place === 'W' ? 6 : rng.int(4, 5);
  const seq = rng.shuffle([...Array(GRID).keys()]).slice(0, len);
  state.interview = { event: inst.name, place: inst.place, tiles, seq, year: state.date.year, week: state.date.week };
  return state.interview;
}

export const interviewReward = (state, len) => ({
  xp: Math.round(Math.max(30, xpForLevel(state.player.level ?? 1) * 0.12 * (len / 5)) * xpMult(state)),
  clutch: 3 * len,
});

// picks = angetippte Kachel-Positionen (in Reihenfolge). Ergebnis {ok, xp, clutch, ups, expUp}
export function resolveInterview(state, picks) {
  const iv = state.interview;
  if (!iv) return null;
  state.interview = null;
  const ok = picks.length === iv.seq.length && picks.every((p, i) => p === iv.seq[i]);
  if (!ok) {
    addNews(state, 'info', `Interview nach ${iv.event}`, 'Floskel-Salat – die Reporter waren wenig begeistert. Nächstes Mal klappt es.');
    return { ok: false };
  }
  const r = interviewReward(state, iv.seq.length), p = state.player;
  const ups = addXp(p, r.xp), expUp = addClutch(p, r.clutch);
  addNews(state, 'xp', `🎤 Starkes Interview nach ${iv.event}`, `+${r.xp} XP, +${r.clutch} Clutch-Punkte.${expUp > 0 ? ` Erfahrung jetzt ${expLabel(p.exp)}.` : ''}`);
  if (ups) addNews(state, 'xp', `⬆️ Level ${p.level}! +${pointsGained(p.level, ups)} Attributpunkte`, 'Verteile sie im Spielerprofil.');
  return { ok: true, ...r, ups, expUp };
}
export const skipInterview = state => { state.interview = null; };
// Offene Anfrage verfällt mit der nächsten Woche
export function interviewWeekEnd(state) { if (state.interview) state.interview = null; }
