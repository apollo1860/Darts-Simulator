// Meilensteine (DOM-frei): einmalige Erfolge mit Extra-XP. state.milestones = {[id]: {year, week}}
import { addXp, pointsGained } from './player.js';
import { addNews } from './news.js';
import { xpMult } from './staff.js';
import { rankOf } from './rankings.js';

export const MILESTONES = [
  { id: 'win', icon: '✅', label: 'Erster Sieg', xp: 30 },
  { id: 's180', icon: '💯', label: 'Erste 180', xp: 50 },
  { id: 'local', icon: '🏠', label: 'Erster lokaler Turniersieg', xp: 80 },
  { id: 'd12', icon: '🎯', label: 'Erster 12-Darter', xp: 120 },
  { id: 'd11', icon: '🎯', label: 'Erster 11-Darter', xp: 250 },
  { id: 'd10', icon: '🎯', label: 'Erster 10-Darter', xp: 500 },
  { id: 'avg100', icon: '📈', label: 'Erstes Match mit 100er Average', xp: 300 },
  { id: 'avg110', icon: '🚀', label: 'Erstes Match mit 110er Average', xp: 800 },
  { id: 'wdf', icon: '🌍', label: 'Erster WDF-Turniersieg', xp: 300 },
  { id: 'dev', icon: '🌱', label: 'Erster Dev-Tour-Sieg', xp: 350 },
  { id: 'challenge', icon: '🧗', label: 'Erster Challenge-Tour-Sieg', xp: 400 },
  { id: 'top64', icon: '🎫', label: 'Erstmals Top 64 der PDC Order of Merit', xp: 600 },
  { id: 'top32', icon: '⭐', label: 'Erstmals Top 32', xp: 1000 },
  { id: 'top16', icon: '🌟', label: 'Erstmals Top 16', xp: 1600 },
  { id: 'protour', icon: '🏆', label: 'Erster Pro-Tour-Sieg', xp: 1200 },
  { id: 'major', icon: '👑', label: 'Erster Major-Titel', xp: 3000 },
];

export const reached = (state, id) => !!state.milestones?.[id];

// Meilenstein freischalten (einmalig) → XP (inkl. Trainer-Faktor) + News
export function unlock(state, id) {
  const ms = MILESTONES.find(m => m.id === id);
  if (!ms || reached(state, id)) return null;
  (state.milestones ??= {})[id] = { year: state.date.year, week: state.date.week };
  const xp = Math.round(ms.xp * xpMult(state)), ups = addXp(state.player, xp);
  addNews(state, 'xp', `🏅 Meilenstein: ${ms.label}`, `${ms.icon} +${xp} XP Bonus.`);
  if (ups) addNews(state, 'xp', `⬆️ Level ${state.player.level}! +${pointsGained(state.player.level, ups)} Attributpunkte`, 'Verteile sie im Spielerprofil.');
  return { ...ms, xp };
}

// Nach jedem eigenen Match (Stats der eigenen Seite)
export function matchMilestones(state, s, won) {
  if (won) unlock(state, 'win');
  if (s.s180 > 0) unlock(state, 's180');
  if (s.bestLeg) for (const [n, id] of [[12, 'd12'], [11, 'd11'], [10, 'd10']]) if (s.bestLeg <= n) unlock(state, id);
  const avg = s.darts ? s.points / s.darts * 3 : 0;
  if (avg >= 100) unlock(state, 'avg100');
  if (avg >= 110) unlock(state, 'avg110');
}

// Nach einem Turniersieg
export function titleMilestones(state, inst) {
  if (inst.place !== 'W' || inst.isQualifier) return;
  const id = { local: 'local', wdf: 'wdf', dev: 'dev', challenge: 'challenge', pc: 'protour', et: 'protour', major: 'major' }[inst.cat];
  if (id && !(inst.cat === 'major' && inst.eventId === 'wm-quali')) unlock(state, id);
}

// Wöchentlich: Weltranglisten-Meilensteine (nur mit Tourcard)
export function rankMilestones(state) {
  if (state.player.tour !== 'tour') return;
  const r = rankOf(state, 'pdc', 'P');
  if (!r) return;
  if (r <= 64) unlock(state, 'top64');
  if (r <= 32) unlock(state, 'top32');
  if (r <= 16) unlock(state, 'top16');
}
