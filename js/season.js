// Saisonablauf (DOM-frei): Woche abschließen (KI-Turniere), Jahresabschluss (Tourcards, Welt-Entwicklung)
import { RNG } from './rng.js';
import { advanceWeek, eventsInWeek } from './calendar.js';
import { simulateWeekAI, awardCard } from './tournaments.js';
import { orderOfMerit, OOM_TYPES, rankOf, devHolders } from './rankings.js';
import { developWorld, updateTiers, getPlayer, DEV_MAX_AGE } from './world.js';
import { addNews } from './news.js';
import { WEEKS_PER_YEAR } from './util.js';
import { plTable, plState } from './majors.js';
import { sponsorWeek, sponsorYearEnd } from './sponsors.js';
import { staffWeek } from './staff.js';
import { interviewWeekEnd } from './interviews.js';
import { rivalYearEnd } from './rival.js';
import { recordHistory, trackPeak } from './history.js';
import { trainingWeekEnd, weeklyRecovery, train, weekActivity } from './training.js';
import { eventStatus } from './tournaments.js';

// „Weiter“: aktuelle Woche abschließen und zur nächsten springen. false = Turnier läuft noch.
export function nextWeek(state) {
  if (state.activeEvent && !state.activeEvent.done) return false;
  const { year, week } = state.date;
  const evs = eventsInWeek(state, year, week);
  const ai = simulateWeekAI(state);
  interviewWeekEnd(state);
  trainingWeekEnd(state);
  weeklyRecovery(state);
  weekNews(state, evs, ai);
  if (week >= WEEKS_PER_YEAR) { recordHistory(state); sponsorYearEnd(state); yearEnd(state); }
  advanceWeek(state);
  sponsorWeek(state);
  staffWeek(state);
  trackPeak(state);
  if (state.date.week === 1) { updateTiers(state); newSeasonNews(state); }
  return true;
}

function weekNews(state, evs, ai) {
  const p = state.player, y = state.date.year;
  // Majors / World Series: Sieger
  for (const i of ai.filter(x => (x.cat === 'major' || x.cat === 'ws' || x.fmt === 'plf') && x.stopAt === 1)) {
    addNews(state, 'result', `🏆 ${i.name}: ${getPlayer(state, i.survivors[0])?.name ?? '?'} gewinnt`,
      i.fieldSize ? `${i.fieldSize} ${i.teams ? 'Teams' : 'Spieler'}.` : '');
  }
  // Premier League: Teilnehmer (1. Spieltag) und Tabelle
  if (evs.some(e => e.plNight && e.startsThisWeek)) {
    const pl = plState(state), night = evs.find(e => e.plNight).plNight;
    if (night === 1) {
      const invited = pl.players.includes('P');
      addNews(state, invited ? 'result' : 'info', invited ? '🎤 Einladung zur Premier League!' : `Premier League ${y}: Teilnehmer`,
        pl.players.map(id => getPlayer(state, id).name).join(', '));
    }
    addNews(state, 'ranking', `Premier League nach Spieltag ${night}`,
      plTable(state).slice(0, 4).map((x, i) => `${i + 1}. ${getPlayer(state, x.id).name} ${x.pts} P.`).join(' · '));
  }
  // Pro-Tour-Sieger der Woche (ohne Qualifikationen)
  const pro = ai.filter(i => (i.cat === 'pc' || i.cat === 'et') && i.stopAt === 1);
  if (pro.length) {
    addNews(state, 'result', `Pro Tour: ${pro.map(i => i.name).join(' · ')}`,
      pro.map(i => `${i.name}: ${getPlayer(state, i.survivors[0]).name}`).join(' · '));
  }
  // OOM-Stand nach Challenge-/Dev-Wochenenden
  if (p.tour === 'tour' && evs.some(e => (e.cat === 'pc' || e.cat === 'et') && e.startsThisWeek)) {
    addNews(state, 'ranking', `PDC Order of Merit: Platz ${rankOf(state, 'pdc', 'P', y)}`,
      `Pro Tour OOM: Platz ${rankOf(state, 'protour', 'P', y)}. Top 64 der PDC OOM: Tourcard am Saisonende um 1 Jahr verlängert.`);
  }
  for (const type of ['challenge', 'dev']) {
    if (!evs.some(e => e.cat === type && !e.noOom && e.startsThisWeek)) continue;
    const eligible = p.tour !== 'tour' ? p.qschoolYear === y && (type !== 'dev' || p.age <= DEV_MAX_AGE)
      : type === 'dev' && devHolders(state, y).includes(p);
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
  // 2) Top 64 der PDC OOM: Karte gilt mindestens bis Ende Folgejahr (+1 Jahr); auslaufende Karten außerhalb → Verlust
  const lost = [];
  for (const x of orderOfMerit(state, 'pdc', y)) {
    const pl = x.p;
    if (!pl.cardUntil) continue;
    if (x.rank <= 64) { if (pl.cardUntil <= y) pl.cardVia = `Top 64 PDC ${y}`; pl.cardUntil = Math.max(pl.cardUntil, y + 1); continue; }
    if (pl.cardUntil > y) continue;
    lost.push(pl.name);
    if (pl.id === 'P') {
      p.tour = 'none'; p.cardUntil = null;
      addNews(state, 'ranking', 'Tourcard verloren', `Platz ${x.rank} der PDC Order of Merit reicht nicht (Top 64 nötig). Zurück zur Q-School.`);
    } else { pl.tier = 'challenge'; pl.cardUntil = null; }
  }
  // 3) KI-Welt entwickelt sich weiter
  const dev = developWorld(state, rng, y);
  rivalYearEnd(state, rng, y);
  addNews(state, 'info', `Saisonbilanz ${y}`,
    `Neue Tourcards: ${lines.join(', ') || '–'}. Karte verloren: ${lost.length} Spieler. Rücktritte: ${dev.retired.length}${dev.retired.length ? ` (u. a. ${dev.retired.slice(0, 3).join(', ')})` : ''}. Neue Talente: ${dev.talents.length}.`);
}

function newSeasonNews(state) {
  const p = state.player, y = state.date.year;
  if (p.tour === 'tour') addNews(state, 'info', `Saison ${y}: Tourcard bis ${p.cardUntil}`, 'Q-School, Challenge und Development Tour sind für dich gesperrt.');
  else addNews(state, 'info', `Saison ${y}: Q-School in KW 2`, `Melde dich für die Q-School UK oder Europa an – sonst keine Challenge-/Dev-Tour-Berechtigung in ${y}.`);
}

// „Zum nächsten Event springen“: Wochen ohne spielbares Event (außer lokal) überspringen.
// autoTrain: in übersprungenen Wochen wird automatisch trainiert (zuletzt trainiertes bzw. schwächstes Attribut).
export function jumpToNextEvent(state, { autoTrain = true, max = 20 } = {}) {
  let n = 0;
  const important = () => eventsInWeek(state, state.date.year, state.date.week)
    .some(e => e.cat !== 'local' && eventStatus(state, e).playable);
  if (important()) return 0;                                  // diese Woche gibt es schon ein Event
  do {
    if (state.activeEvent && !state.activeEvent.done) break;
    if (autoTrain && !weekActivity(state)) {
      const a = state.player.attrs, last = state.lastTrained;
      train(state, last ?? Object.keys(a).sort((x, y) => a[x] - a[y])[0]);
    }
    if (!nextWeek(state)) break;
    n++;
  } while (n < max && !important());
  return n;
}
