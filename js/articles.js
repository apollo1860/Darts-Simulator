// New Star Darts: kurze Website-Artikel („darts-news.de“) zu besonderen Ereignissen
// Warteschlange state.articles → Browser-Karte im News-Screen; zusätzlich als News-Eintrag (Typ 'article')
import { RNG } from './rng.js';
import { addNews } from './news.js';
import { surname } from './util.js';

const MAX_QUEUE = 4;
const fmtScore = sc => (sc ? `${sc[0]}:${sc[1]}` : '');

function publish(state, icon, kicker, title, text) {
  if (state.mode !== 'nsd') return null;
  const a = { year: state.date.year, week: state.date.week, icon, kicker, title, text };
  (state.articles ??= []).push(a);
  if (state.articles.length > MAX_QUEUE) state.articles.shift();
  addNews(state, 'article', title, text);
  return a;
}
const names = state => { const n = state.player.name; return { n, sn: surname(n) }; };
const rngOf = state => new RNG(state.rng);

// Turniersieg: {event, cat, fmt, opp, score, stars, titles}
export function titleArticle(state, d) {
  const r = rngOf(state), { n, sn } = names(state), wm = d.fmt === 'wm';
  const major = ['major', 'pl', 'ws'].includes(d.cat);
  const kicker = wm ? 'WELTMEISTERSCHAFT' : major ? 'MAJOR-SIEG' : d.cat === 'et' ? 'EUROPEAN TOUR' : 'PRO TOUR';
  const title = wm ? r.pick([`${n} ist Weltmeister!`, `Krönung im Ally Pally: ${sn} holt den WM-Titel`, `Weltmeister ${sn}! Die Darts-Welt verneigt sich`])
    : major ? r.pick([`${sn} triumphiert bei ${d.event}`, `Großer Abend für ${sn}: Sieg bei ${d.event}`, `${d.event}: ${n} holt den Titel`])
    : r.pick([`${sn} gewinnt ${d.event}`, `Titel für ${sn}!`, `${d.event}: ${n} nicht zu stoppen`]);
  const fin = d.opp ? r.pick([`Im Finale besiegt ${n} ${d.opp} mit ${fmtScore(d.score)}.`, `${d.opp} muss sich im Endspiel mit ${fmtScore(d.score)} geschlagen geben.`, `Das Finale gegen ${d.opp} endet ${fmtScore(d.score)}.`]) : `${n} lässt im Turnier niemanden vorbei.`;
  const hist = d.titles <= 1 ? 'Es ist der erste Profititel der Karriere – ein Name, den man sich merken muss.'
    : wm ? `Titel Nummer ${d.titles} – aber keiner wiegt so schwer wie dieser.` : `Für ${sn} ist es bereits Titel Nummer ${d.titles}.`;
  const money = d.stars ? ` Dazu gibt es ${d.stars} ★ Preisgeld.` : '';
  return publish(state, wm ? '🏆' : major ? '🥇' : '🎯', kicker, title, `${fin} ${hist}${money}`);
}

// Finale verloren (Majors/WM): {event, fmt, opp, score}
export function finalArticle(state, d) {
  const r = rngOf(state), { n, sn } = names(state);
  const title = r.pick([`Knapp vorbei: ${sn} unterliegt im Finale`, `${d.opp} stoppt ${sn} im Endspiel`, `${d.event}: Bittere Final-Niederlage für ${sn}`]);
  return publish(state, '🥈', d.fmt === 'wm' ? 'WELTMEISTERSCHAFT' : 'FINALE', title,
    `${n} verliert das Finale von ${d.event} gegen ${d.opp} mit ${fmtScore(d.score)}. ${r.pick(['Trotzdem: der bisher größte Auftritt auf der großen Bühne.', 'Die Enttäuschung ist groß, die Leistung über das Turnier aber stark.', 'Der Titel war zum Greifen nah – das nächste Mal?'])}`);
}

// WM-Ticket gelöst
export function wmTicketArticle(state, via) {
  const r = rngOf(state), { n, sn } = names(state);
  return publish(state, '🎟️', 'WM-QUALIFIKATION', r.pick([`Ab in den Ally Pally: ${sn} spielt die WM`, `${sn} löst das WM-Ticket`]),
    `Über ${via} sichert sich ${n} einen Platz bei der Weltmeisterschaft in London. ${r.pick(['Der Traum vom Alexandra Palace wird wahr.', 'Im Dezember wartet die größte Bühne des Sports.'])}`);
}

// Erstmals in den Top 64/32/16/8/1 der PDC Order of Merit
const RANK_STEPS = [64, 32, 16, 8, 1];
export function rankArticle(state, rank) {
  const f = (state.flags ??= {}), best = f.rankArticle ?? 999;
  const step = RANK_STEPS.find(t => rank <= t && t < best);
  if (!step || state.mode !== 'nsd') return null;
  f.rankArticle = step;
  const r = rngOf(state), { n, sn } = names(state);
  if (step === 1) return publish(state, '👑', 'ORDER OF MERIT', `Die neue Nummer 1: ${n}`, `${sn} steht an der Spitze der PDC Order of Merit. Ganz oben – dort, wo jeder hin will und sich kaum einer hält.`);
  return publish(state, '📈', 'ORDER OF MERIT', r.pick([`${sn} stürmt in die Top ${step}`, `Erstmals Top ${step}: ${sn} klettert weiter`]),
    `${n} steht jetzt auf Platz ${rank} der PDC Order of Merit – zum ersten Mal in den Top ${step}. ${step === 64 ? 'Damit ist die Tourcard fürs nächste Jahr in Reichweite.' : step === 16 ? 'Die großen Majors rücken damit näher.' : 'Der Aufstieg geht weiter.'}`);
}

// Neun-Darter in einem eigenen Match
export function nineArticle(state, event, opp) {
  const { n, sn } = names(state);
  return publish(state, '9️⃣', 'PERFEKTION', `NEUN-DARTER! ${sn} schreibt Geschichte`,
    `Neun Darts, 501 Punkte: ${n} spielt bei ${event}${opp ? ` gegen ${opp}` : ''} das perfekte Leg. Die Halle steht kopf.`);
}

// Star-Status: alle 5 Stufen
export function starArticle(state, level) {
  if (level % 5) return null;
  const r = rngOf(state), { n, sn } = names(state);
  return publish(state, '⭐', 'STAR-STATUS', r.pick([`Der Hype um ${sn} wächst`, `${sn} wird zum Publikumsmagneten`, `Star-Status ${level}: ${sn} ist angekommen`]),
    `${n} erreicht Star-Status ${level}. ${r.pick(['Sponsoren klopfen an, die Fans singen den Namen.', 'Die Hallen werden voller, wenn dieser Name auf dem Spielplan steht.', 'Aus dem Talent ist eine feste Größe der Tour geworden.'])}`);
}

// Tourcard: verloren (Last Chance), zurückgeholt, Karriereende
export function cardArticle(state, kind, rank) {
  const { n, sn } = names(state);
  if (kind === 'lost') return publish(state, '⚠️', 'TOURCARD', `${sn} verliert die Tourcard`, `Platz ${rank} der Order of Merit reicht nicht. ${n} bleibt nur die Q-School im Januar – die allerletzte Chance.`);
  if (kind === 'back') return publish(state, '🎉', 'Q-SCHOOL', `Comeback! ${sn} zurück auf der Tour`, `Unter größtem Druck holt sich ${n} die Tourcard zurück. Die Karriere geht weiter.`);
  return publish(state, '🏁', 'KARRIEREENDE', `${sn} verabschiedet sich von der Tour`, `Ohne Tourcard endet die Profikarriere von ${n}. Danke für die Momente auf der Bühne.`);
}

// Premier-League-Einladung
export function plArticle(state) {
  const { n, sn } = names(state);
  return publish(state, '🎤', 'PREMIER LEAGUE', `${sn} ist in der Premier League dabei!`, `${n} gehört zu den acht Auserwählten: 16 Spieltage gegen die Weltelite, jede Woche live vor großem Publikum.`);
}
