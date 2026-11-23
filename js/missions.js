// New Star Darts (DOM-frei, Version 273): Missionen – feste Ausgangslagen mit Hintergrundgeschichte und klarem Ziel (statt freier Karriere).
// Jede Mission baut ihren Spielstand selbst (teils mit vorab simulierter Saison), `missionCheck` prüft nach jeder Navigation Erfolg/Scheitern.
// Laufende Mission liegt im eigenen Slot 'M'; Karriere-Missionen lassen sich nach Erfolg als normale Karriere weiterspielen.
import { newNsdCareer, newRealCareer, realPlayers, syncAttrs, TRAINABLE, SKILL_LEVELS, NSD_START, DROP_FOR_PLAYER } from './nsd.js';
import { nextWeek } from './season.js';
import { eventsInWeek, shownTo, findEvent } from './calendar.js';
import { eventStatus, enterEvent, simulateRest, nextSub, closeEvent, newInstance, simulateRoundAI, nextRound, startManualMatch, playerMatch } from './tournaments.js';
import { orderOfMerit, rankOf } from './rankings.js';
import { plState, plTable } from './majors.js';
import { weekIndex } from './career.js';
import { addNews } from './news.js';
import { achievementCtx } from './life.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { RNG } from './rng.js';

export const MISSION_SLOT = 'M';
const fill = v => Array.from({ length: SKILL_LEVELS }, (_, i) => Math.max(0, Math.min(3, v - 3 * i)));
export function setSkills(p, v) { for (const t of TRAINABLE) p.skills[t.key] = fill(typeof v === 'object' ? v[t.key] : v); syncAttrs(p); }
const setStar = (p, lvl) => { p.star = { level: lvl, xp: 0 }; p.starSeen = { level: lvl, xp: 0 }; syncAttrs(p); };
const clearPopups = s => { s.interview = null; s.lifeEvent = null; s.dilemma = null; s.articles = []; };
const before = (s, y, w) => s.date.year < y || (s.date.year === y && s.date.week < w);
const nameOf = form => ({ first: (form.first || 'Max').trim(), last: (form.last || 'Mustermann').trim(), nation: form.nation || 'DE' });

// Eine Woche automatisch spielen (für vorab simulierte Saisons): passende Turniere melden und komplett simulieren
function autoWeek(s, cats) {
  for (const ev of eventsInWeek(s, s.date.year, s.date.week)) {
    if (!cats.includes(ev.cat) || !shownTo(s, ev) || !eventStatus(s, ev).playable) continue;
    s.player.energy = 100;
    try { enterEvent(s, ev.id); } catch { continue; }
    for (;;) { simulateRest(s); if (!s.activeEvent.hasNext) break; nextSub(s); }
    closeEvent(s); clearPopups(s);
  }
}
// Bis zu Jahr/Woche weiterspielen (optional mit automatisch gespielten Turnieren)
export function simulateUntil(s, year, week, cats = null) {
  for (let n = 0; n < 400 && before(s, year, week) && !s.ended; n++) {
    clearPopups(s);
    if (cats) autoWeek(s, cats);
    if (s.activeEvent) { simulateRest(s); closeEvent(s); }
    clearPopups(s);
    if (!nextWeek(s)) break;
  }
  clearPopups(s); s.player.energy = 100;
  return s;
}
// Realen Spieler nach Ranglistenplatz übernehmen und auf den eigenen Namen umbenennen (Daten/Platz bleiben)
function realByRank(form, seed, pick) {
  const tmp = newNsdCareer({ first: 'X', last: 'Y', nation: 'DE', seed, base: true }), names = new Set(realPlayers().map(r => r.name));
  const oom = orderOfMerit(tmp, 'pdc').filter(x => x.p.id !== 'P' && names.has(x.p.name));
  const hit = pick(oom, tmp) ?? oom[1];
  const s = newRealCareer({ name: hit.p.name, seed });
  const n = nameOf(form), p = s.player;
  Object.assign(p, { name: `${n.first} ${n.last}`, first: n.first, last: n.last, nation: n.nation, real: null });
  s.news = [];
  return s;
}
const finish = (s, def, form) => {
  Object.assign(s, { slot: MISSION_SLOT, mission: { id: def.id, status: 'active', started: { ...s.date }, form: nameOf(form) } });
  s.player.assessed = true; clearPopups(s); s.news = (s.news ?? []).slice(0, 5);
  const ctx = achievementCtx(s); s.achievements ??= {};                  // Startwerte zählen nicht als frische Meilensteine (keine Einblendungen)
  for (const a of ACHIEVEMENTS) if (!s.achievements[a.id] && a.check(ctx)) s.achievements[a.id] = { year: s.date.year, week: s.date.week, mission: true };
  s.msQueue = [];
  addNews(s, 'info', `🎯 Mission: ${def.name}`, def.goal);
  return s;
};

// ---------- Missionen ----------
export const MISSIONS = [
  {
    id: 'comeback', name: 'Comeback-König', kind: 'Match', icon: '👑',
    story: 'WM-Finale im Ally Pally. Die Nerven haben dich im Stich gelassen – 0:5 in Sätzen, im sechsten Satz liegst du 0:2 in Legs zurück. Die Halle ist still, die Buchmacher haben dich abgeschrieben.',
    goal: 'Gewinne das WM-Finale trotz 0:5-Satz- und 0:2-Leg-Rückstand.',
    setup(form, seed) {
      const n = nameOf(form), s = newNsdCareer({ ...n, age: 30, seed }), p = s.player;
      setSkills(p, 45); setStar(p, 45); p.rel.fans = 70; p.satisfaction = 60; s.stars = 400;
      simulateUntil(s, NSD_START.year, 51);                         // eine Saison ist vorab gelaufen
      const wm = findEvent(s, 'wm'), inst = newInstance(s, wm, 0, false, new RNG(s.rng));
      const top = orderOfMerit(s, 'pdc').map(x => x.p.id).filter(id => id !== 'P'), swap = inst.seedIds?.[1] ?? top[1];
      for (const m of inst.rounds[0].matches) { if (m.a === swap) m.a = 'P'; if (m.b === swap) m.b = 'P'; }
      if (inst.seedIds) inst.seedIds = inst.seedIds.map(id => (id === swap ? 'P' : id));
      Object.assign(inst, { withPlayer: true, playerAlive: true, big: top.slice(0, 16) });
      s.activeEvent = inst; s.week = { ...s.week, played: true, eventId: 'wm' };
      const rng = new RNG(s.rng);
      while (inst.current < inst.rounds.length - 1) {              // dein Weg ins Finale (gesetzt)
        const pm = playerMatch(inst), f = inst.rounds[inst.current].format;
        if (pm && !pm.winner) { const to = f.sets ?? f.legs, l = rng.int(0, to - 1); pm.winner = 'P'; pm.score = pm.a === 'P' ? [to, l] : [l, to]; }
        simulateRoundAI(s); nextRound(s);
      }
      const live = startManualMatch(s), lm = live.m, me = live.me;
      lm.sets[me] = 0; lm.sets[1 - me] = 5; lm.legs[me] = 0; lm.legs[1 - me] = 2;
      return finish(s, this, form);
    },
    check(s) {
      const i = s.activeEvent?.eventId === 'wm' ? s.activeEvent : null;
      if (i?.done) return i.place === 'W' ? 'won' : 'lost';
      const r = s.results?.find(x => x.eventId === 'wm');
      return r ? (r.place === 'W' ? 'won' : 'lost') : null;
    },
    progress(s) { const lm = s.activeEvent?.live?.m, me = s.activeEvent?.live?.me ?? 0; return lm ? `Sätze ${lm.sets[me]}:${lm.sets[1 - me]} · Legs ${lm.legs[me]}:${lm.legs[1 - me]}` : 'WM-Finale'; },
  },
  {
    id: 'playoff', name: 'Play-off-Jagd', kind: 'Turnier', icon: '🎤',
    story: 'Premier League, Halbzeit. Nach acht Spieltagen bist du Tabellenletzter – die Fans spotten schon, du seist nur wegen deines Namens eingeladen worden. Acht Abende bleiben.',
    goal: 'Erreiche nach Spieltag 16 einen Play-off-Platz (Top 4 der Premier-League-Tabelle).',
    setup(form, seed) {
      const n = nameOf(form), s = newNsdCareer({ ...n, age: 29, seed }), p = s.player;
      setSkills(p, 40); setStar(p, 35); p.rel.fans = 55; p.satisfaction = 45; s.stars = 300;
      const pl = plState(s), out = pl.players[7];
      pl.players[7] = 'P'; for (const k of ['points', 'legs', 'nw', 'mw']) { delete pl[k][out]; pl[k].P = 0; }
      simulateUntil(s, NSD_START.year, 14);                         // Spieltage 1–8 laufen automatisch
      const t = plTable(s).filter(x => x.id !== 'P'), min = Math.min(...t.map(x => pl.points[x.id]));
      pl.points.P = Math.max(0, min - 2); pl.nw.P = 0; pl.mw.P = Math.min(pl.mw.P ?? 0, Math.min(...t.map(x => pl.mw[x.id] ?? 0)));
      pl.legs.P = Math.min(pl.legs.P ?? 0, Math.min(...t.map(x => pl.legs[x.id] ?? 0)));
      return finish(s, this, form);
    },
    check(s) {
      const pl = s.pl?.[NSD_START.year];
      if (!pl || pl.nights < 16) return null;
      const pos = plTable(s).findIndex(x => x.id === 'P');
      return pos >= 0 && pos < 4 ? 'won' : 'lost';
    },
    progress(s) {
      const pl = s.pl?.[NSD_START.year]; if (!pl) return '';
      const pos = plTable(s).findIndex(x => x.id === 'P') + 1;
      return `Spieltag ${pl.nights}/16 · Platz ${pos} · ${pl.points.P ?? 0} Punkte`;
    },
  },
  {
    id: 'patrone', name: 'Letzte Patrone', kind: 'Karriere', icon: '🎯', cont: true,
    story: 'Dein letztes Tourcard-Jahr. Die Form ist weg, das Selbstvertrauen auch, und in der Rangliste bist du weit abgeschlagen. Wenn du die Karte jetzt nicht rettest, war es das mit dem Profidarts.',
    goal: 'Sichere dir die Tourcard über das Jahr 2027 hinaus – über die Top 64 der Order of Merit oder notfalls über die Q-School.',
    setup(form, seed) {
      const n = nameOf(form), s = newNsdCareer({ ...n, age: 31, seed }), p = s.player;
      setSkills(p, 8); setStar(p, 6);
      simulateUntil(s, NSD_START.year + 1, 3, ['pc']);              // Saison 2026 ist gelaufen (nur Players Championships)
      p.cardUntil = NSD_START.year + 1;                             // letztes Kartenjahr
      setSkills(p, 3); p.satisfaction = 8; p.rel.fans = 8; p.momentum = -4; s.stars = Math.min(s.stars ?? 0, 25);
      return finish(s, this, form);
    },
    check(s) {
      const y = NSD_START.year + 1;
      if (s.ended) return 'lost';
      if (s.date.year > y && !s.lastChance && s.player.tour === 'tour' && (s.player.cardUntil ?? 0) > y) return 'won';
      return null;
    },
    progress(s) { return `PDC-Rang ${rankOf(s, 'pdc', 'P') ?? '–'} · Top 64 sichert die Karte`; },
  },
  {
    id: 'rueckkehr', name: 'Rückkehr des Champions', kind: 'Karriere', icon: '🏆', cont: true,
    story: 'Zweimal Weltmeister, dann der Absturz: Verletzungen, Frust, Rücktritt. Drei Jahre später juckt es wieder. Bei der Q-School hast du die Karte knapp verpasst – also Challenge Tour, mit rostigem Arm, aber mit dem Kopf eines Champions.',
    goal: 'Gewinne bis Ende 2028 einen Major-Titel und beende 2028 in den Top 16 der Order of Merit.',
    setup(form, seed) {
      const n = nameOf(form), s = newNsdCareer({ ...n, age: 38, seed }), p = s.player, y = NSD_START.year;
      setSkills(p, 22); setStar(p, 30); p.rel.fans = 50; p.satisfaction = 40; s.stars = 60; p.exp = 10;
      Object.assign(p, { tour: 'none', cardUntil: null, cardVia: null, qschoolYear: y }); s.openTour = true;   // Q-School 2026 knapp verpasst → Challenge Tour offen   // ohne Karte: Challenge Tour / Q-School
      const r = Object.values(s.world.players).find(x => x.name === DROP_FOR_PLAYER);
      if (r && r.tier !== 'tour') Object.assign(r, { tier: 'tour', cardUntil: y, cardVia: `Tourcard ${y}` });   // sein Platz bleibt bei den 128
      return finish(s, this, form);
    },
    check(s) {
      const end = NSD_START.year + 2, major = (s.results ?? []).some(r => r.cat === 'major' && r.place === 'W');
      if (s.date.year <= end) return null;
      return major && (rankOf(s, 'pdc', 'P') ?? 999) <= 16 ? 'won' : 'lost';
    },
    progress(s) { return `Major-Titel: ${(s.results ?? []).some(r => r.cat === 'major' && r.place === 'W') ? 'ja' : 'noch nicht'} · PDC-Rang ${rankOf(s, 'pdc', 'P') ?? '–'}`; },
  },
  {
    id: 'phoenix', name: 'Phönix', kind: 'Karriere', icon: '🔥', cont: true,
    story: 'Vor einem Jahr warst du einer der Besten der Welt. Dann die schwere Rückenverletzung, Monate ohne Pfeil in der Hand. Die Rangliste ist abgerutscht, die Technik eingerostet – aber der Hunger ist größer denn je.',
    goal: 'Zurück in die Top 16 der Order of Merit nach der WM 2026.',
    setup(form, seed) {
      const s = realByRank(form, seed, oom => oom.find(x => x.rank >= 26 && x.rank <= 34 && x.p.tier === 'tour')), p = s.player;
      setSkills(p, 30); setStar(p, 32); p.rel.fans = 55; p.satisfaction = 40;
      return finish(s, this, form);
    },
    check(s) { if (s.date.year <= NSD_START.year) return null; return (rankOf(s, 'pdc', 'P') ?? 999) <= 16 ? 'won' : 'lost'; },
    progress(s) { return `PDC-Rang ${rankOf(s, 'pdc', 'P') ?? '–'} · Ziel Top 16`; },
  },
  {
    id: 'pleite', name: 'Pleitegeier', kind: 'Karriere', icon: '💸', cont: true,
    story: 'Ein Riesenskandal: Fotos, Schlagzeilen, Shitstorm. Alle Sponsoren sind abgesprungen, der Manager hat hingeschmissen, das Konto ist leer. Erst mal will keine Marke mehr etwas mit dir zu tun haben – und deine Tourcard läuft aus.',
    goal: 'Beende die Saison 2026 mit mindestens 250 ★ auf dem Konto und behalte deine Tourcard.',
    setup(form, seed) {
      const s = realByRank(form, seed, (oom, t) => oom.find(x => x.rank >= 45 && x.rank <= 62 && x.p.tier === 'tour' && x.p.cardUntil === t.date.year)
        ?? oom.find(x => x.rank >= 45 && x.rank <= 62 && x.p.tier === 'tour')), p = s.player;
      s.stars = 0; p.rel.fans = 12; p.rel.sponsors = 0; p.rel.manager = 0; p.satisfaction = 15; p.momentum = -3;
      p.cardUntil = s.date.year;                                    // Karte läuft aus: Top 64 nötig
      s.team = { ...(s.team ?? {}), manager: null };
      s.nsdSponsors = { active: [], offer: null, blockUntil: weekIndex(s) + PLEITE.block };
      (s.flags ??= {}).localSponsor = true; s.flags.scandal = { year: s.date.year, factor: PLEITE.slow };
      return finish(s, this, form);
    },
    check(s) {
      if (s.date.year <= NSD_START.year) return null;
      return (s.stars ?? 0) >= PLEITE.goal && s.player.tour === 'tour' ? 'won' : 'lost';
    },
    progress(s) { return `${Math.floor(s.stars ?? 0)}/${PLEITE.goal} ★ · PDC-Rang ${rankOf(s, 'pdc', 'P') ?? '–'}`; },
  },
  {
    id: 'thron', name: 'Thronfolger', kind: 'Karriere', icon: '🥇', cont: true,
    story: 'Seit Jahren immer nur Zweiter. Die Nummer 1 scheint unantastbar, die Presse nennt dich den ewigen Kronprinzen. Diese Saison soll das anders werden.',
    goal: 'Werde bis nach der WM 2026 die Nummer 1 der Order of Merit.',
    setup(form, seed) {
      const s = realByRank(form, seed, oom => oom.find(x => x.rank === 2));
      return finish(s, this, form);
    },
    check(s) { if (s.date.year <= NSD_START.year) return null; return rankOf(s, 'pdc', 'P') === 1 ? 'won' : 'lost'; },
    progress(s) {
      const o = orderOfMerit(s, 'pdc'), me = o.find(x => x.p.id === 'P'), top = o[0];
      return me?.rank === 1 ? 'Platz 1 – halte ihn bis nach der WM' : `Platz ${me?.rank ?? '–'} · ${Math.round((top?.money ?? 0) - (me?.money ?? 0))} ★ Rückstand`;
    },
  },
];
export const PLEITE = { goal: 250, block: 20, slow: 0.35 };   // Ziel kalibriert: passiver Bot ≈ 100 ★
export const missionById = id => MISSIONS.find(m => m.id === id);

export function startMission(id, form = {}, seed = Date.now() % 1e9) {
  const def = missionById(id);
  if (!def) throw new Error('Unbekannte Mission');
  return def.setup(form, seed);
}
// Nach jeder Aktion: Ziel erreicht oder verfehlt? → status 'won'/'lost' (einmalig)
export function missionCheck(s) {
  const m = s?.mission;
  if (!m || m.status !== 'active') return null;
  const r = missionById(m.id)?.check(s) ?? null;
  if (r) { m.status = r; m.endedAt = { ...s.date }; }
  return r;
}
export const missionProgress = s => (s?.mission ? missionById(s.mission.id)?.progress(s) ?? '' : '');
