// New Star Darts: Sponsoren nach Branchen (Version 71). Jede Marke gehört zu genau einer festen Branche; pro Branche gibt es höchstens EINEN
// laufenden Vertrag (z. B. nur eine Automarke, nur ein Supermarkt), insgesamt höchstens SPONSOR_MAX = 5 Verträge gleichzeitig – für einen
// neuen Sponsor muss man sonst einen kündigen (career.js: `acceptOffer`, `cancelSponsor`).
// Bis Star-Status 10 gibt es nur kleine fiktive Sponsoren (SMALL_SPONSORS, zahlen wenig); ab Status 11 kommen die echten Marken der Stufe 11 dazu,
// ab 20 und ab 40 jeweils weitere (mit leichtem Fokus auf den zuletzt freigeschalteten). fame = Bekanntheit 1–5: je bekannter, desto besser die Bezahlung.
export const SPONSOR_MAX = 5;
export const REAL_FROM = [11, 20, 40];                       // Star-Status, ab dem die Marken der jeweiligen Stufe angeboten werden
export const FAME_PAY = [0, 0.7, 0.9, 1.15, 1.4, 1.7];       // Bezahlfaktor je Bekanntheit (Index = fame)
export const SMALL_PAY = 0.5;                                // kleine fiktive Sponsoren zahlen nur halb so viel wie ein „normaler“
export const REAL_SHARE = 0.85;                              // ab Status 11: so oft ist ein Angebot eine echte Marke (sonst klein/fiktiv)
export const NEW_TIER_FOCUS = 1.4;                           // leichter Fokus auf die Marken der zuletzt freigeschalteten Stufe

// Feste Branchen (id → Anzeige)
export const BRANCHEN = {
  darts: { label: 'Darts & Training', icon: '🎯' },
  bau: { label: 'Baumarkt & Werkzeug', icon: '🔨' },
  auto: { label: 'Automarken', icon: '🚗' },
  mobil: { label: 'Mobilität & Auto-Service', icon: '🛠️' },
  reise: { label: 'Airlines & Reisen', icon: '✈️' },
  hotel: { label: 'Hotels', icon: '🏨' },
  wetten: { label: 'Sportwetten', icon: '🎲' },
  fitness: { label: 'Fitness', icon: '🏋️' },
  finanzen: { label: 'Versicherung, Bank & Immobilien', icon: '🏦' },
  it: { label: 'Software & Internet', icon: '💻' },
  medien: { label: 'Medien & Streaming', icon: '📺' },
  elektro: { label: 'Unterhaltungselektronik', icon: '🎧' },
  elektrohandel: { label: 'Elektronikhandel', icon: '🔌' },
  gaming: { label: 'Gaming', icon: '🎮' },
  haushalt: { label: 'Haushalt & Pflege', icon: '🏠' },
  gesundheit: { label: 'Gesundheit & Optik', icon: '💊' },
  mode: { label: 'Mode & Schuhe', icon: '👕' },
  luxusmode: { label: 'Luxusmode', icon: '👗' },
  uhren: { label: 'Uhren & Schmuck', icon: '⌚' },
  bier: { label: 'Bier', icon: '🍺' },
  spirituosen: { label: 'Spirituosen & Sekt', icon: '🥂' },
  alkoholfrei: { label: 'Alkoholfreie Getränke', icon: '🥤' },
  supermarkt: { label: 'Supermarkt & Discounter', icon: '🛒' },
  feinkost: { label: 'Feinkost & Bäckerei', icon: '🥐' },
  gastro: { label: 'Gastronomie', icon: '🍔' },
  suessware: { label: 'Süßwaren', icon: '🍬' },
  handel: { label: 'Möbel & Kaufhaus', icon: '🛋️' },
  musik: { label: 'Musikinstrumente', icon: '🎹' },
  andere: { label: 'Sonstige', icon: '🤝' },                 // nur für alte Spielstände (nicht angeboten)
};

// Kleine fiktive Sponsoren (bis Status 10 und danach selten); alle fiktiven Marken stehen für alte Spielstände in FICTIONAL_BRANCHE
export const SMALL_SPONSORS = [
  { name: 'Arrowcraft Darts', branche: 'darts' }, { name: 'Tungsten Tom', branche: 'darts' },
  { name: 'Kneipenkönig Wear', branche: 'mode' }, { name: 'Oche Couture', branche: 'mode' },
  { name: 'Bullseye Energy', branche: 'alkoholfrei' }, { name: 'Brauerei Doppelfeld', branche: 'bier' },
  { name: 'Autohaus Bogenschütz', branche: 'auto' }, { name: 'Pfeil & Partner Immobilien', branche: 'finanzen' },
];
export const FICTIONAL_BRANCHE = {
  ...Object.fromEntries(SMALL_SPONSORS.map(x => [x.name, x.branche])),
  'Flightline Pro': 'darts', 'Bullhaus Darts': 'darts', 'Apex Tungsten': 'darts', 'Ninefinity': 'darts',
  'Shotglass Sportswear': 'mode', 'Triple Twenty Apparel': 'mode', 'Matchdart Athletics': 'mode',
  'Checkout Cola': 'alkoholfrei', 'Hydra Oche Water': 'alkoholfrei', 'Ton-80 Lager': 'bier',
  'Leg-Bank': 'finanzen', 'DartBet Sports': 'wetten', 'Nexus Gaming': 'gaming', 'Crown Airlines': 'reise',
};

// [Name, Branche, Bekanntheit]
const mk = (from, list) => list.map(([name, branche, fame]) => ({ name, branche, from, fame, real: true }));

export const REAL_SPONSORS = [
  // ab Status 11
  ...mk(11, [['My Dart Training', 'darts', 2], ['Würth', 'bau', 3], ['Hornbach', 'bau', 3], ['toom Baumarkt', 'bau', 3],
    ['Elten', 'mode', 2], ['Engelbert Strauss', 'mode', 3], ['Zalando', 'mode', 4], ['Deichmann', 'mode', 4],
    ['Liqui Moly', 'mobil', 3], ['ATU', 'mobil', 3], ['Sixt', 'mobil', 4], ['Flixbus', 'mobil', 4],
    ['Fielmann', 'gesundheit', 4], ['Hylo', 'gesundheit', 2],
    ['Bitburger', 'bier', 4], ['Oettinger', 'bier', 3], ['Veltins', 'bier', 4], ['Warsteiner', 'bier', 4], ['Berentzen', 'spirituosen', 2],
    ['Gerolsteiner', 'alkoholfrei', 4], ['Adelholzener', 'alkoholfrei', 3], ['Fritz-Kola', 'alkoholfrei', 3], ['Coca-Cola', 'alkoholfrei', 5], ['Müllermilch', 'alkoholfrei', 4],
    ['AdmiralBet', 'wetten', 3], ['Betano', 'wetten', 3], ['bet3000', 'wetten', 2], ['bwin', 'wetten', 4], ['NeoBet', 'wetten', 2], ['Tipico', 'wetten', 4],
    ['FitX', 'fitness', 3], ['Fitness First', 'fitness', 3], ['Primetime Fitness', 'fitness', 2],
    ['DVAG', 'finanzen', 4], ['Check24', 'finanzen', 4], ['XXXLutz', 'handel', 4]]),
  // ab Status 20
  ...mk(20, [['Samsung', 'elektro', 5], ['Bose', 'elektro', 4], ['JBL', 'elektro', 4],
    ['Saturn', 'elektrohandel', 3], ['MediaMarkt', 'elektrohandel', 4], ['Conrad', 'elektrohandel', 3],
    ['Miele', 'haushalt', 4], ['WMF', 'haushalt', 3], ['Gillette', 'haushalt', 4],
    ['Lacoste', 'mode', 4], ['Tommy Hilfiger', 'mode', 4], ['The North Face', 'mode', 4], ['TAG Heuer', 'uhren', 4], ['Casio', 'uhren', 4],
    ['Block House', 'gastro', 3], ['McDonald\'s', 'gastro', 5], ['Katjes', 'suessware', 4], ['Hitschies', 'suessware', 3], ['Lindt', 'suessware', 4],
    ['Rewe', 'supermarkt', 4], ['Edeka', 'supermarkt', 4], ['Kaufland', 'supermarkt', 4], ['Aldi', 'supermarkt', 5], ['Lidl', 'supermarkt', 5],
    ['Alnatura', 'supermarkt', 3], ['denn\'s Biomarkt', 'supermarkt', 2], ['Vollcorner', 'supermarkt', 1], ['Red Bull', 'alkoholfrei', 5],
    ['Microsoft', 'it', 5], ['1&1', 'it', 4], ['SAP', 'it', 4], ['Siemens', 'it', 5],
    ['HUK-Coburg', 'finanzen', 4], ['Barmer', 'finanzen', 4], ['American Express', 'finanzen', 5],
    ['DAZN', 'medien', 4], ['Sport1', 'medien', 3], ['BILD', 'medien', 4], ['ratiopharm', 'gesundheit', 4],
    ['Galeria Kaufhof', 'handel', 3], ['TUI', 'reise', 4], ['Lufthansa', 'reise', 5], ['betway', 'wetten', 3]]),
  // ab Status 40
  ...mk(40, [['Rolex', 'uhren', 5], ['Breitling', 'uhren', 4], ['Cartier', 'uhren', 5], ['Patek Philippe', 'uhren', 5], ['Richard Mille', 'uhren', 4],
    ['Hublot', 'uhren', 4], ['Swarovski', 'uhren', 4],
    ['Hugo Boss', 'mode', 4], ['Louis Vuitton', 'luxusmode', 5], ['Gucci', 'luxusmode', 5], ['Prada', 'luxusmode', 5], ['Dior', 'luxusmode', 5],
    ['Hermès', 'luxusmode', 5], ['Versace', 'luxusmode', 4], ['Giorgio Armani', 'luxusmode', 5], ['Givenchy', 'luxusmode', 4], ['Tom Ford', 'luxusmode', 4],
    ['Bentley', 'auto', 4], ['Bugatti', 'auto', 4], ['Aston Martin', 'auto', 4], ['Cadillac', 'auto', 3], ['McLaren', 'auto', 4], ['Maserati', 'auto', 4],
    ['Range Rover', 'auto', 4], ['Lucid', 'auto', 3], ['Tesla', 'auto', 5],
    ['Apple', 'elektro', 5], ['Dyson', 'haushalt', 4], ['Xbox', 'gaming', 5], ['PlayStation', 'gaming', 5], ['Nintendo', 'gaming', 5],
    ['Steinway & Sons', 'musik', 4], ['Spotify', 'medien', 5],
    ['Qatar Airways', 'reise', 5], ['Etihad Airways', 'reise', 4],
    ['Mandarin Oriental', 'hotel', 3], ['Four Seasons', 'hotel', 4], ['Robinson Club', 'hotel', 3], ['The Ritz-Carlton', 'hotel', 4], ['Grand Elysée', 'hotel', 2],
    ['OpenAI', 'it', 4], ['Meta', 'it', 5], ['Google', 'it', 5], ['TikTok', 'it', 4],
    ['Dom Pérignon', 'spirituosen', 5], ['Feinkost Käfer', 'feinkost', 3], ['Julius Brantner Brothandwerk', 'feinkost', 1], ['Zeit für Brot', 'feinkost', 2],
    ['Fortnum & Mason', 'feinkost', 3], ['La Grande Épicerie de Paris', 'feinkost', 3], ['Lafayette Gourmet', 'feinkost', 2], ['Erewhon', 'feinkost', 2]]),
];

// Branche einer Marke (echt oder fiktiv); unbekannte Namen aus alten Spielständen → „Sonstige“
const BY_NAME = new Map([...REAL_SPONSORS.map(x => [x.name, x.branche]), ...Object.entries(FICTIONAL_BRANCHE)]);
export const brancheOfName = name => BY_NAME.get(name) ?? 'andere';
