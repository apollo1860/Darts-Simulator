// Illustrationen für den Lifestyle-Shop: lifeArt(id) → SVG (Gegenstände, Fahrzeuge, Immobilien)
import { ITEM_ART } from './items.js';
import { VEHICLE_ART } from './vehicles.js';
import { HOME_ART } from './homes.js';

const ALL = { ...ITEM_ART, ...VEHICLE_ART, ...HOME_ART };
export const lifeArt = id => ALL[id]?.() ?? '';
export const hasLifeArt = id => !!ALL[id];
