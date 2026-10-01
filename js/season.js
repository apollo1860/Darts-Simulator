// Saisonablauf (DOM-frei): Woche abschließen (KI-Turniere), Jahresabschluss (Tourcards, Welt-Entwicklung)
import { RNG } from './rng.js';
import { advanceWeek, eventsInWeek } from './calendar.js';
import { simulateWeekAI, awardCard } from './tournaments.js';
import { orderOfMerit, OOM_TYPES, rankOf } from './rankings.js';
import { developWorld, updateTiers, getPlayer, DEV_MAX_AGE } from './world.js';
import { addNews } from './news.js';
import { WEEKS_PER_YEAR } from './util.js';

// „Weiter“: aktuelle Woche abschließen und zur nächsten springen. false = Turnier läuft noch.
export function nextWeek(state) {
  if (state.activeEvent && !state.activeEvent.done) return false;
  const { year, week } = state.date;
  const evs = eventsInWeek(state, year, week);
  const ai = simulateWeekAI(state);
  weekNews(state, evs, ai);
  if (week >= WEEKS_PER_YEAR) yearEnd(state);
  advanceWeek(state);
  if (state.date.week === 1) { updateTiers(state); newSeasonNews(state); }
  return true;
}

function weekNews(state, evs, ai) {
  const p = state.player, y = state.date.year;
  // Pro-Tour-Sieger der Woche (ohne Qualifikationen)
  const pro = ai.filter(i => (i.cat === 'pc' || i.cat === 'et') && i.stopAt === 1);
  if (pro.length) {
    addNews(state, 'result', `Pro Tour: ${pro.map(i => i.name).join(' · ')}`,
      pro.map(i => `${i.name}: ${getPlayer(state, i.survivors[0]).name}`).join(' · '));
  }
  // OOM-Stand nach Challenge-/Dev-Wochenenden
  if (p.tour === 'tour' && evs.some(e => (e.cat === 'pc' || e.cat === 'et') && e.startsThisWeek)) {
    addNews(state, 'ranking', `PDC Order of Merit: Platz ${rankOf(state, 'pdc', 'P', y)}`,
      `Pro Tour OOM: Platz ${rankOf(state, 'protour', 'P', y)}. Top 64 der PDC OOM behalten am Saisonende eine auslaufende Tourcard.`);
  }
  for (const type of ['challenge', 'dev']) {
    if (!evs.some(e => e.cat === type && !e.noOom && e.startsThisWeek)) continue;
    const eligible = p.tour !== 'tour' && p.qschoolYear === y && (type !== 'dev' || p.age <= DEV_MAX_AGE);
    const list = orderOfMerit(state, type, y);
    const lead = list[0];
    const r = eligible ? rankOf(state, type, 'P', y) : null;
    addNews(state, 'ranking', `${OOM_TYPES[type].label}: ${r ? `du bist Platz ${r}` : `${lead.p.name} führt`}`,
      `Top 2 am Saisonende erhalten eine Tourcard. Spitze: ${list.slice(0, 3).map(x => `${x.rank}. ${x.p.name}`).join(' · ')}`);
  }
}

// Jahresabschluss (vor dem Jahreswechsel)
export function yearEnd(state) {
  const y = state.date.year, p = state.player, rng = new RNG(state.rng);
  const lines = [];
  // 1) Challenge-/Dev-OOM: Top 2 ohne Karte → Tourcard für die nächsten 2 Saisons
  for (const type of ['challenge', 'dev']) {
    const list = orderOfMerit(state, type, y).filter(x => (x.p.id === 'P' ? p.tour !== 'tour' : x.p.tier !== 'tour') && x.money > 0);
    for (const x of list.slice(0, 2)) {
      awardCard(state, x.p.id, y + 2, `${OOM_TYPES[type].label} ${y} (Platz ${x.rank})`);
      lines.push(`${x.p.name} (${OOM_TYPES[type].short}-OOM ${x.rank}.)`);
    }
  }
  // 2) Auslaufende Karten: nur Top 64 der PDC Order of Merit behalten sie
  const lost = [];
  for (const x of orderOfMerit(state, 'pdc', y)) {
    const pl = x.p;
    if (!pl.cardUntil || pl.cardUntil > y) continue;
    if (x.rank <= 64) { pl.cardUntil = y + 2; continue; }
    lost.push(pl.name);
    if (pl.id === 'P') {
      p.tour = 'none'; p.cardUntil = null;
      addNews(state, 'ranking', 'Tourcard verloren', `Platz ${x.rank} der PDC Order of Merit reicht nicht (Top 64 nötig). Zurück zur Q-School.`);
    } else { pl.tier = 'challenge'; pl.cardUntil = null; }
  }
  // 3) KI-Welt entwickelt sich weiter
  const dev = developWorld(state, rng, y);
  addNews(state, 'info', `Saisonbilanz ${y}`,
    `Neue Tourcards: ${lines.join(', ') || '–'}. Karte verloren: ${lost.length} Spieler. Rücktritte: ${dev.retired.length}${dev.retired.length ? ` (u. a. ${dev.retired.slice(0, 3).join(', ')})` : ''}. Neue Talente: ${dev.talents.length}.`);
}

function newSeasonNews(state) {
  const p = state.player, y = state.date.year;
  if (p.tour === 'tour') addNews(state, 'info', `Saison ${y}: Tourcard bis ${p.cardUntil}`, 'Q-School, Challenge und Development Tour sind für dich gesperrt.');
  else addNews(state, 'info', `Saison ${y}: Q-School in KW 2`, `Melde dich für die Q-School UK oder Europa an – sonst keine Challenge-/Dev-Tour-Berechtigung in ${y}.`);
}
