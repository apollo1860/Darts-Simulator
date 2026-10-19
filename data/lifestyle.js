// New Star Darts: Lifestyle-Shop (einmalig kaufen). Preise in Basis-★ (× starFactor), ls = Lifestyle-Punkte,
// regen = zusätzliche Energie-Erholung pro Woche (nur Immobilien; es zählt die beste), sat = Zufriedenheit sofort.
export const LIFESTYLE = [
  { id: 'console', cat: 'item', name: 'Spielkonsole', icon: '🎮', price: 12, ls: 3, sat: 3 },
  { id: 'suit', cat: 'item', name: 'Maßanzug', icon: '🤵', price: 35, ls: 5, sat: 4 },
  { id: 'watch', cat: 'item', name: 'Designer-Uhr', icon: '⌚', price: 70, ls: 7, sat: 5 },
  { id: 'cinema', cat: 'item', name: 'Heimkino', icon: '🎬', price: 140, ls: 9, sat: 6 },
  { id: 'art', cat: 'item', name: 'Kunstwerk', icon: '🖼️', price: 450, ls: 12, sat: 6 },
  { id: 'scooter', cat: 'vehicle', name: 'E-Roller', icon: '🛴', price: 8, ls: 2, sat: 2 },
  { id: 'smallcar', cat: 'vehicle', name: 'Kleinwagen', icon: '🚗', price: 45, ls: 5, sat: 4 },
  { id: 'sportscar', cat: 'vehicle', name: 'Sportwagen', icon: '🏎️', price: 220, ls: 12, sat: 7 },
  { id: 'limo', cat: 'vehicle', name: 'Luxuslimousine', icon: '🚘', price: 500, ls: 16, sat: 7 },
  { id: 'jet', cat: 'vehicle', name: 'Privatjet', icon: '🛩️', price: 2200, ls: 28, sat: 10 },
  { id: 'flat', cat: 'home', name: 'Eigene Wohnung', icon: '🏢', price: 90, ls: 6, sat: 6, regen: 5 },
  { id: 'townhouse', cat: 'home', name: 'Stadthaus', icon: '🏠', price: 320, ls: 12, sat: 8, regen: 10 },
  { id: 'villa', cat: 'home', name: 'Villa', icon: '🏡', price: 1100, ls: 22, sat: 10, regen: 15 },
  { id: 'island', cat: 'home', name: 'Insel-Anwesen', icon: '🏝️', price: 4200, ls: 35, sat: 12, regen: 20 },
];
export const LIFESTYLE_CATS = [['item', 'Gegenstände'], ['vehicle', 'Fahrzeuge'], ['home', 'Immobilien']];
