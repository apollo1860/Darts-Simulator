// Saisonablauf (DOM-frei): Woche abschließen (KI-Turniere), Jahresabschluss (Tourcards, Welt-Entwicklung)
import { RNG } from './rng.js';
import { advanceWeek, eventsInWeek } from './calendar.js';
import { simulateWeekAI, awardCard, qschoolRankingCards, closeEvent } from './tournaments.js';
import { WDF_MAJOR_TIERS } from '../data/tournaments.js';
import { orderOfMerit, OOM_TYPES, rankOf, devHolders, pruneSave } from './rankings.js';
import { developWorld, updateTiers, getPlayer, DEV_MAX_AGE, TOP_PROTECT } from './world.js';
import { addNews } from './news.js';
import { rankArticle, cardArticle, plArticle, plLineupArticle } from './articles.js';
import { WEEKS_PER_YEAR, surname } from './util.js';
import { plTable, plState } from './majors.js';
import { rivalYearEnd } from './rival.js';
import { recordHistory, trackPeak, trackTourSince } from './history.js';
import { eventStatus } from './tournaments.js';
import { syncAttrs, addEnergy } from './nsd.js';
import { lifeWeek, weeklyEnergy } from './life.js';
import { injuryWeek } from './injury.js';
import { careerWeek, setGoals, seasonReport, preWmInterview, dilemmaWeek } from './career.js';
import { decayWeek, soberUp, expireBoosts, ageDeclineYear } from './skilltrain.js';

// „Weiter“: aktuelle Woche abschließen und zur nächsten springen. false = Turnier läuft noch.
export function nextWeek(state) {
  if (state.activeEvent && !state.activeEvent.done) return false;
  if (state.activeEvent?.done) closeEvent(state);           // offene Rest-Turniere des Blocks im Hintergrund zu Ende spielen
  const { year, week } = state.date;
  const evs = eventsInWeek(state, year, week);
  const ai = simulateWeekAI(state);
  if (evs.some(e => e.cat === 'qschool')) qschoolRankingCards(state);   // Version 94: Restkarten über die Q-School-Rangliste
  const nsd = state.mode === 'nsd';                      // New Star Darts: alte €-/XP-Nebensysteme ruhen
  weekNews(state, evs, ai);
  if (week >= WEEKS_PER_YEAR) { recordHistory(state); if (nsd) seasonReport(state); yearEnd(state); }
  advanceWeek(state);
  if (nsd) {
    const e0 = state.player.energy, c = careerWeek(state, new RNG(state.rng));
    addEnergy(state.player, weeklyEnergy(state.player));
    const inj = injuryWeek(state, new RNG(state.rng), e0);   // Version 152: Verletzung (nach der Erholung, kostet sofort 50 %)
    if (inj) addNews(state, 'info', inj.title, inj.text);
    trackTourSince(state);   // Version 221: Tourcard in Folge
    if (soberUp(state.player)) addNews(state, 'info', '🥴 Verkatert!', 'Zu viel getrunken: Diese Woche sind Scoring, Finishing, Fokus und Rechnen stark geschwächt. Nächste Woche bist du wieder fit.');
    expireBoosts(state); decayWeek(state, new RNG(state.rng)); lifeWeek(state, new RNG(state.rng)); dilemmaWeek(state, new RNG(state.rng));
    state.weekly = { ...c, energy: state.player.energy - e0, injury: inj ? -50 : 0 };
    if (state.date.week === 1) { ageDeclineYear(state); setGoals(state); }   // Version 163: Altersabbau zum Jahreswechsel
    lastChanceCheck(state);
    const wm = !state.ended && eventsInWeek(state, state.date.year, state.date.week).find(e => e.id === 'wm');   // WM-Woche: Elmar Paulke bittet zum Interview
    if (wm && !state.flags?.paulke?.[state.date.year]) preWmInterview(state, new RNG(state.rng), !!eventStatus(state, wm).playable);
  }
  trackPeak(state);
  if (state.date.week === 1) { updateTiers(state); newSeasonNews(state); if (nsd) announcePl(state); pruneSave(state); }   // Version 163: alte Jahre aufräumen
  if (state.mode === 'nsd') syncAttrs(state.player);     // Fähigkeiten bestimmen die Attribute
  return true;
}

function weekNews(state, evs, ai) {
  const p = state.player, y = state.date.year;
  // Majors / World Series: Sieger
  for (const i of ai.filter(x => (x.cat === 'major' || x.cat === 'ws' || x.fmt === 'plf' || x.fmt === 'wwm') && x.stopAt === 1)) {
    addNews(state, 'result', `🏆 ${i.name}: ${getPlayer(state, i.survivors[0])?.name ?? '?'} gewinnt`,
      i.fieldSize ? `${i.fieldSize} ${i.teams ? 'Teams' : 'Spieler'}.` : '');
  }
  // WDF (Version 99): Sieger der Platin-/Gold-Turniere
  for (const i of ai.filter(x => x.cat === 'wdf' && x.done !== false)) {
    const ev = evs.find(e => e.id === i.eventId);
    if (!ev || !WDF_MAJOR_TIERS.includes(ev.tier)) continue;
    const f = i.rounds.at(-1)?.matches?.[0], w = f?.winner, lo = f && (w === f.a ? f.b : f.a);
    if (!w) continue;
    const sc = f.score ? (w === f.a ? f.score : [...f.score].reverse()).join(':') : '';
    addNews(state, 'result', `🎯 WDF: ${getPlayer(state, w)?.name ?? '?'} gewinnt ${ev.name}`,
      `WDF ${{ Platinum: 'Platin', Gold: 'Gold' }[ev.tier]} in ${ev.city}${lo ? ` – Finale gegen ${getPlayer(state, lo)?.name ?? '?'}${sc ? ` ${sc}` : ''}` : ''}.`);
  }
  // Premier League: Teilnehmer (1. Spieltag) und Tabelle
  if (evs.some(e => e.plNight && e.startsThisWeek)) {
    const pl = plState(state), night = evs.find(e => e.plNight).plNight;
    if (night === 1) {
      const invited = pl.players.includes('P');
      addNews(state, invited ? 'result' : 'info', invited ? '🎤 Einladung zur Premier League!' : `Premier League ${y}: Teilnehmer`,
        pl.players.map(id => getPlayer(state, id).name).join(', '));
      if (invited && !pl.announced) plArticle(state);          // sonst schon zum Jahreswechsel gemeldet
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
    const r = rankOf(state, 'pdc', 'P', y);
    if (r) rankArticle(state, r);
  }
  for (const type of ['challenge', 'dev']) {
    if (!evs.some(e => e.cat === type && !e.noOom && e.startsThisWeek)) continue;
    const eligible = p.tour !== 'tour' ? (type === 'dev' ? p.age <= DEV_MAX_AGE : p.qschoolYear === y)
      : type === 'dev' && devHolders(state, y).includes(p);
    const list = orderOfMerit(state, type, y);
    const lead = list[0];
    const r = eligible ? rankOf(state, type, 'P', y) : null;
    addNews(state, 'ranking', `${OOM_TYPES[type].label}: ${r ? `du bist Platz ${r}` : `${lead.p.name} führt`}`,
      `Top 2 am Saisonende erhalten eine Tourcard. Spitze: ${list.slice(0, 3).map(x => `${x.rank}. ${x.p.name}`).join(' · ')}`);
  }
}

// New Star Darts: Nach der Q-School-Woche ohne neue Karte → Karriereende
export function lastChanceCheck(state) {
  const lc = state.lastChance;
  if (!lc || state.date.year !== lc.year || state.date.week <= 2) return;
  state.lastChance = null;
  if (state.player.tour === 'tour') {
    (state.flags ??= {}).lastChance = true;
    addNews(state, 'result', '🎉 Zurück auf der Tour!', 'Die Last Chance genutzt – deine neue Tourcard gilt bis Ende ' + state.player.cardUntil + '.');
    cardArticle(state, 'back');
    return;
  }
  state.ended = true;
  addNews(state, 'info', '🏁 Karriereende', 'Ohne Tourcard ist deine Profikarriere vorbei.');
  cardArticle(state, 'end');
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
    if (!pl.cardUntil || (pl.id === 'P' ? p.tour !== 'tour' : pl.tier !== 'tour')) {   // Version 199: ohne Karte in den Top 64 → neue Tourcard (2 Jahre)
      if (x.rank <= 64 && x.money > 0) { awardCard(state, pl.id, y + 2, `Top 64 PDC ${y} (Platz ${x.rank})`); lines.push(`${pl.name} (PDC-OOM ${x.rank}.)`); }
      continue;
    }
    if (x.rank <= 64) {
      if (pl.cardUntil <= y) pl.cardVia = `Top 64 PDC ${y}`;
      pl.cardUntil = Math.max(pl.cardUntil, y + 1);
      if (pl.id === 'P') (state.flags ??= {}).renewed = true;
      continue;
    }
    if (pl.cardUntil > y) continue;
    lost.push(pl.name);
    if (pl.id === 'P') {
      p.tour = 'none'; p.cardUntil = null;
      if (state.mode === 'nsd' && state.openTour) {        // Version 98: realer Spieler – Karriere geht über Challenge Tour/Q-School weiter
        addNews(state, 'ranking', '⚠️ Tourcard verloren', `Platz ${x.rank} der PDC Order of Merit reicht nicht (Top 64 nötig). Weiter geht es über die Q-School in KW 2 und die Challenge Tour.`);
        cardArticle(state, 'lost', x.rank);
      } else if (state.mode === 'nsd') {                   // New Star Darts: letzte Chance Q-School, sonst Karriereende
        state.lastChance = { year: y + 1 };
        addNews(state, 'ranking', '⚠️ Tourcard verloren – LAST CHANCE', `Platz ${x.rank} der PDC Order of Merit reicht nicht (Top 64 nötig). In KW 2 ${y + 1} hast du eine letzte Chance: Hol dir in der Q-School eine Tourcard (Finale eines Tages oder über die Q-School-Rangliste) – sonst ist deine Karriere vorbei.`);
        cardArticle(state, 'lost', x.rank);
      } else addNews(state, 'ranking', 'Tourcard verloren', `Platz ${x.rank} der PDC Order of Merit reicht nicht (Top 64 nötig). Zurück zur Q-School.`);
    } else { pl.tier = 'challenge'; pl.cardUntil = null; }
  }
  // 3) KI-Welt entwickelt sich weiter
  const top = new Set(orderOfMerit(state, 'pdc', y).slice(0, TOP_PROTECT).map(x => x.p.id));   // Version 156: Top 24 bleiben (bis 65)
  const dev = developWorld(state, rng, y, top);
  state.tcRetired = { year: y + 1, list: dev.retiredTc };     // Liste erscheint zum Saisonstart in den News (newSeasonNews)
  rivalYearEnd(state, rng, y);
  addNews(state, 'info', `Saisonbilanz ${y}`,
    `Neue Tourcards: ${lines.join(', ') || '–'}. Karte verloren: ${lost.length} Spieler. Rücktritte: ${dev.retired.length}${dev.retired.length ? ` (u. a. ${dev.retired.slice(0, 3).join(', ')})` : ''}. Neue Talente: ${dev.talents.length}.`);
  // Formsprünge der KI-Welt: die größten Aufsteiger und Absteiger der Tour
  const tourJump = (list, sign) => list.filter(x => x.tier === 'tour').sort((a, b) => sign * (b.jump - a.jump)).slice(0, 3);
  const up = tourJump(dev.breakouts, 1), down = tourJump(dev.slumps, -1);
  if (up.length) addNews(state, 'info', `Durchbruch ${y + 1}: Diese Profis legen zu`, `${up.map(x => `${x.name} (+${x.jump.toFixed(1)} Ø)`).join(', ')} – nach starker Vorbereitung gelten sie als Aufsteiger der kommenden Saison.`);
  if (down.length) addNews(state, 'info', `Formkrise ${y + 1}: Diese Profis schwächeln`, `${down.map(x => `${x.name} (${x.jump.toFixed(1)} Ø)`).join(', ')} – nach Verletzungen oder Motivationsproblemen sind sie schwer einzuschätzen.`);
}

// Jahreswechsel (NSD): Premier-League-Aufstellung = Top 8 der PDC-Rangliste nach der Saison, per Zeitungsartikel (Version 77)
function announcePl(state) {
  const pl = plState(state), invited = pl.players.includes('P');
  pl.announced = true;
  plLineupArticle(state, pl.players.map(id => surname(getPlayer(state, id)?.name ?? '?')), invited, state.date.year);
}

function newSeasonNews(state) {
  const p = state.player, y = state.date.year;
  const tr = state.tcRetired;                              // Version 156: alle (ehemaligen) Tourcard-Spieler, die aufgehört haben
  if (tr?.year === y) {
    if (tr.list.length) addNews(state, 'info', `👋 Karriereende: ${tr.list.length} ${tr.list.length === 1 ? 'Tourcard-Spieler hört' : 'Tourcard-Spieler hören'} auf`,
      `${[...tr.list].sort((a, b) => b.age - a.age).map(x => `${x.name} (${x.age})`).join(', ')}.`);
    delete state.tcRetired;
  }
  if (p.tour === 'tour') addNews(state, 'info', `Saison ${y}: Tourcard bis ${p.cardUntil}`, 'Q-School, Challenge und Development Tour sind für dich gesperrt.');
  else if (state.mode === 'nsd') addNews(state, 'info', `Saison ${y}: Last Chance in KW 2`, 'Melde dich in der Wochenansicht für die Q-School (UK oder Europa). Finale eines Tages oder ein Platz weit vorn in der Q-School-Rangliste = neue Tourcard.');
  else addNews(state, 'info', `Saison ${y}: Q-School in KW 2`, `Melde dich für die Q-School UK oder Europa an – sonst keine Challenge-Tour-Berechtigung in ${y}.${p.age <= DEV_MAX_AGE ? ' Die Development Tour (bis 23) kannst du auch ohne Q-School spielen.' : ''}`);
}

// „Zum nächsten Event springen“: Wochen ohne spielbares Event (außer lokal) überspringen.
export function jumpToNextEvent(state, { max = 20 } = {}) {
  let n = 0;
  const important = () => eventsInWeek(state, state.date.year, state.date.week)
    .some(e => e.cat !== 'local' && eventStatus(state, e).playable);
  if (important()) return 0;                                  // diese Woche gibt es schon ein Event
  do {
    if (state.activeEvent && !state.activeEvent.done) break;
    if (!nextWeek(state)) break;
    n++;
  } while (n < max && !important());
  return n;
}
