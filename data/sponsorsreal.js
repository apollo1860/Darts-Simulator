// New Star Darts: echte Marken als Sponsoren (Version 70, Nutzerliste). Bis Star-Status 10 gibt es nur kleine fiktive Sponsoren (data/sponsors.js,
// Stufe 1, zahlen wenig); ab Status 11 kommen die Marken der Stufe 11 dazu, ab 20 und ab 40 jeweils weitere (mit leichtem Fokus auf den
// zuletzt freigeschalteten). fame = Bekanntheit 1–5: je bekannter die Marke, desto besser zahlt sie (`FAME_PAY`).
// Vertragsplätze (Kategorien) – die Zuordnung der Marken ist eine Annahme, siehe STATUS.md.
export const REAL_FROM = [11, 20, 40];                       // Star-Status, ab dem die Marken der jeweiligen Stufe angeboten werden
export const FAME_PAY = [0, 0.7, 0.9, 1.15, 1.4, 1.7];       // Bezahlfaktor je Bekanntheit (Index = fame)
export const SMALL_PAY = 0.5;                                // kleine fiktive Sponsoren zahlen nur halb so viel wie ein „normaler“
export const REAL_SHARE = 0.85;                              // ab Status 11: so oft ist ein Angebot eine echte Marke (sonst klein/fiktiv)
export const NEW_TIER_FOCUS = 1.4;                           // leichter Fokus auf die Marken der zuletzt freigeschalteten Stufe

const mk = (slot, from, list) => list.map(([name, fame]) => ({ name, slot, from, fame, real: true }));

export const REAL_SPONSORS = [
  // ab Status 11
  ...mk('gear', 11, [['My Dart Training', 2], ['Würth', 3], ['Elten', 2], ['Hornbach', 3], ['toom Baumarkt', 3], ['Liqui Moly', 3], ['ATU', 3]]),
  ...mk('shirt', 11, [['Engelbert Strauss', 3], ['Zalando', 4], ['Deichmann', 4], ['Fielmann', 4]]),
  ...mk('drink', 11, [['Gerolsteiner', 4], ['Bitburger', 4], ['Adelholzener', 3], ['Oettinger', 3], ['Berentzen', 2], ['Müllermilch', 4], ['Veltins', 4],
    ['Warsteiner', 4], ['Fritz-Kola', 3], ['Coca-Cola', 5]]),
  ...mk('partner', 11, [['AdmiralBet', 3], ['Betano', 3], ['bet3000', 2], ['bwin', 4], ['NeoBet', 2], ['Tipico', 4], ['FitX', 3], ['Fitness First', 3],
    ['Primetime Fitness', 2], ['DVAG', 4], ['Check24', 4], ['XXXLutz', 4], ['Flixbus', 4], ['Sixt', 4], ['Hylo', 2]]),
  // ab Status 20
  ...mk('gear', 20, [['Bose', 4], ['Samsung', 5], ['JBL', 4], ['Saturn', 3], ['MediaMarkt', 4], ['Conrad', 3], ['WMF', 3], ['Gillette', 4], ['Casio', 4], ['Miele', 4]]),
  ...mk('shirt', 20, [['Lacoste', 4], ['Tommy Hilfiger', 4], ['The North Face', 4], ['TAG Heuer', 4]]),
  ...mk('drink', 20, [['Block House', 3], ['McDonald\'s', 5], ['Katjes', 4], ['Hitschies', 3], ['Alnatura', 3], ['denn\'s Biomarkt', 2], ['Vollcorner', 1], ['Rewe', 4],
    ['Edeka', 4], ['Kaufland', 4], ['Aldi', 5], ['Lidl', 5], ['Red Bull', 5], ['Lindt', 4]]),
  ...mk('partner', 20, [['Microsoft', 5], ['1&1', 4], ['HUK-Coburg', 4], ['Barmer', 4], ['DAZN', 4], ['Sport1', 3], ['BILD', 4], ['ratiopharm', 4], ['American Express', 5],
    ['Galeria Kaufhof', 3], ['TUI', 4], ['Lufthansa', 5], ['betway', 3], ['SAP', 4], ['Siemens', 5]]),
  // ab Status 40
  ...mk('gear', 40, [['Apple', 5], ['Steinway & Sons', 4], ['Xbox', 5], ['PlayStation', 5], ['Nintendo', 5], ['Dyson', 4]]),
  ...mk('shirt', 40, [['Rolex', 5], ['Breitling', 4], ['Hugo Boss', 4], ['Cartier', 5], ['Louis Vuitton', 5], ['Gucci', 5], ['Prada', 5], ['Patek Philippe', 5], ['Dior', 5],
    ['Hermès', 5], ['Versace', 4], ['Giorgio Armani', 5], ['Richard Mille', 4], ['Hublot', 4], ['Givenchy', 4], ['Swarovski', 4], ['Tom Ford', 4]]),
  ...mk('drink', 40, [['Dom Pérignon', 5], ['Feinkost Käfer', 3], ['Julius Brantner Brothandwerk', 1], ['Zeit für Brot', 2], ['Fortnum & Mason', 3],
    ['La Grande Épicerie de Paris', 3], ['Lafayette Gourmet', 2], ['Erewhon', 2]]),
  ...mk('partner', 40, [['Bentley', 4], ['Bugatti', 4], ['Aston Martin', 4], ['Spotify', 5], ['Qatar Airways', 5], ['Etihad Airways', 4], ['Cadillac', 3], ['OpenAI', 4],
    ['Meta', 5], ['McLaren', 4], ['Maserati', 4], ['Mandarin Oriental', 3], ['Four Seasons', 4], ['Robinson Club', 3], ['The Ritz-Carlton', 4], ['Lucid', 3],
    ['Tesla', 5], ['Grand Elysée', 2], ['Range Rover', 4], ['TikTok', 4], ['Google', 5]]),
];
