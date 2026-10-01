// Attribute, Gesamtwertung, abgeleitete Werte, XP (DOM-frei)
import { clamp } from './util.js';

export const ATTRS = [
  { key: 'sco', label: 'Scoring', short: 'SCO' },
  { key: 'fin', label: 'Doppelquote', short: 'DOP' },
  { key: 'con', label: 'Konstanz', short: 'KON' },
  { key: 'ner', label: 'Nervenstärke', short: 'NER' },
  { key: 'sta', label: 'Ausdauer', short: 'AUS' },
];

export const overall = a =>
  clamp(Math.round(a.sco * 0.35 + a.fin * 0.3 + a.con * 0.15 + a.ner * 0.1 + a.sta * 0.1), 1, 99);
export const targetAverage = a => 30 + 0.77 * a.sco;
export const checkoutBase = a => 0.12 + 0.0033 * a.fin;

// Attribute für einen Ziel-Average erzeugen (KI-Spieler)
export function attrsForAverage(avg, rng, spread = 7) {
  const sco = clamp(Math.round((avg - 30) / 0.77), 1, 99);
  const around = (base, sd) => clamp(Math.round(rng.normal(base, sd)), 1, 99);
  return {
    sco,
    fin: around(sco - 2, spread),
    con: around(sco - 3, spread + 2),
    ner: around(sco - 4, spread + 3),
    sta: around(sco, spread + 3),
  };
}

// Startwerte eigener Spieler: Gesamt ~40–50, Average ~60–65
export function startAttrs(rng) {
  return {
    sco: rng.int(40, 45),
    fin: rng.int(38, 48),
    con: rng.int(38, 50),
    ner: rng.int(40, 52),
    sta: rng.int(45, 56),
  };
}

// XP → Attributpunkte
export const xpForNextPoint = earned => 50 + 3 * earned;
export function addXp(p, xp) {
  p.xp += xp; p.xpTotal += xp;
  let gained = 0;
  while (p.xp >= xpForNextPoint(p.pointsEarned)) {
    p.xp -= xpForNextPoint(p.pointsEarned);
    p.pointsEarned++; p.points++; gained++;
  }
  return gained;
}
export const attrCost = v => (v >= 80 ? 3 : v >= 60 ? 2 : 1);
export function raiseAttr(p, key) {
  const v = p.attrs[key], cost = attrCost(v);
  if (v >= 99 || p.points < cost) return false;
  p.attrs[key] = v + 1; p.points -= cost;
  return true;
}

// XP-Faktor je Event-Kategorie
export const XP_FACTOR = { local: 0.8, qschool: 1, challenge: 1, dev: 1, pc: 1.5, et: 1.5, ws: 2, major: 2, pl: 2 };
export const XP_BASE = { match: 14, win: 22, title: 60, perRound: 8 };

export const TIER_LABEL = {
  top: 'Tour (Top)', tour: 'Tourcard', challenge: 'Challenge Tour', dev: 'Development Tour', local: 'Lokal', none: 'Amateur',
};
