// Formtiefs (DOM-frei): player.slump = {id, icon, label, weeks, malus} → −malus auf Scoring, Finishing, Fokus (in perf()).
// Auslöser: Niederlagenserie, Blamage gegen viel Schwächere, Abheben nach Höhenflug, Ausgebranntsein (Ermüdung),
// seltene private Ereignisse. Ende: Wochen laufen ab, Ruhetag verkürzt um 1 Woche, Titel (nicht lokal) = Befreiungsschlag.
import { RNG } from './rng.js';
import { overall } from './player.js';
import { addNews } from './news.js';
import { clamp } from './util.js';

export const LOSS_STREAK = 4, UPSET_GAP = 8;
export const SLUMPS = {
  streak: { icon: '📉', label: 'Niederlagenserie', text: 'Vier Pleiten in Folge – der Kopf spielt nicht mehr mit.', weeks: 3, malus: 2 },
  upset: { icon: '😳', label: 'Kopfsache', text: 'Die Blamage gegen einen klar Schwächeren hängt nach.', weeks: 2, malus: 1.5 },
  cocky: { icon: '🎈', label: 'Abgehoben', text: 'Nach dem Höhenflug fehlt der letzte Biss im Training.', weeks: 2, malus: 2 },
  burnout: { icon: '🥵', label: 'Ausgebrannt', text: 'Zu viele Turniere, zu wenig Pause – nichts geht mehr.', weeks: 3, malus: 3 },
  love: { icon: '💔', label: 'Liebeskummer', text: 'Die Trennung geht dir näher als gedacht.', weeks: 3, malus: 2 },
  family: { icon: '🏠', label: 'Ärger im Umfeld', text: 'Streit in der Familie – die Gedanken sind woanders.', weeks: 2, malus: 1.5 },
  throw: { icon: '🎯', label: 'Wurfprobleme', text: 'Der Release fühlt sich plötzlich fremd an.', weeks: 4, malus: 2.5 },
  darts: { icon: '🔧', label: 'Neue Darts', text: 'Das neue Setup ist noch gewöhnungsbedürftig.', weeks: 2, malus: 1.5 },
  sleep: { icon: '😴', label: 'Schlafprobleme', text: 'Nächte ohne Schlaf – die Konzentration leidet.', weeks: 2, malus: 2 },
};
const PRIVATE = ['love', 'family', 'throw', 'darts', 'sleep'];
export const PRIVATE_CHANCE = 0.025, COCKY_CHANCE = 0.08, BURNOUT_CHANCE = 0.25;

export const slumpMalus = p => (p.slump?.weeks > 0 ? p.slump.malus : 0);

export function startSlump(state, id) {
  const p = state.player, s = SLUMPS[id];
  if (!s || p.slump?.weeks > 0) return null;
  p.slump = { id, icon: s.icon, label: s.label, weeks: s.weeks, malus: s.malus };
  addNews(state, 'info', `${s.icon} Formtief: ${s.label}`, `${s.text} −${s.malus} auf Scoring, Finishing und Fokus für ${s.weeks} Wochen. Ruhetage verkürzen es, ein Titel beendet es sofort.`);
  return p.slump;
}

// Nach jedem eigenen Match (nicht lokal): Serie zählen, Blamagen bestrafen
export function slumpAfterMatch(state, inst, won, opp) {
  const p = state.player;
  if (inst.cat === 'local') return;
  if (won) { p.lossStreak = 0; return; }
  p.lossStreak = (p.lossStreak ?? 0) + 1;
  if (p.lossStreak >= LOSS_STREAK) { p.lossStreak = 0; startSlump(state, 'streak'); return; }
  if (opp?.attrs && overall(p.attrs) - overall(opp.attrs) >= UPSET_GAP) {
    p.momentum = clamp((p.momentum ?? 0) - 1.5, -10, 10);
    if (new RNG(state.rng).chance(0.3)) startSlump(state, 'upset');
  }
}

// Titel (nicht lokal) beendet ein Formtief
export function slumpTitle(state, cat) {
  const p = state.player;
  if (cat === 'local' || !(p.slump?.weeks > 0)) return;
  addNews(state, 'xp', '💪 Befreiungsschlag!', `Der Titel beendet das Formtief (${p.slump.label}).`);
  p.slump = null;
}

// Ruhetag: Formtief 1 Woche kürzer
export function slumpRest(p) { if (p.slump?.weeks > 0) p.slump.weeks--; }

// Wöchentlich (nach advanceWeek): Formtief abbauen bzw. neue Auslöser prüfen
export function slumpWeek(state) {
  const p = state.player;
  if (p.slump?.weeks > 0) {
    p.slump.weeks--;
    if (p.slump.weeks <= 0) { addNews(state, 'xp', '🙂 Formtief überwunden', `${p.slump.label} ist abgehakt – volle Leistung.`); p.slump = null; }
    return;
  }
  const rng = new RNG(state.rng);
  if ((p.fatigue ?? 0) >= 75 && rng.chance(BURNOUT_CHANCE)) return startSlump(state, 'burnout');
  if ((p.momentum ?? 0) >= 7 && rng.chance(COCKY_CHANCE)) return startSlump(state, 'cocky');
  if (rng.chance(PRIVATE_CHANCE)) return startSlump(state, rng.pick(PRIVATE));
  return null;
}
