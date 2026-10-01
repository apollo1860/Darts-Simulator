// Jahreskalender (Vorlage, gilt für jedes Jahr). week = ISO-KW, weeks = Dauer in Wochen.
// phase = ab welcher Entwicklungsphase spielbar. count = Anzahl Turniere im Block (z. B. PC-Doppel).
// Orientiert am PDC-Kalender, vereinfacht (siehe STATUS.md → Annahmen).

export const CATEGORIES = {
  local:     { label: 'Lokal',             short: 'LOKAL', phase: 1 },
  ddv:       { label: 'DDV-Ranglistenturnier', short: 'DDV', phase: 1 },
  qschool:   { label: 'Q-School',          short: 'Q-SCHOOL', phase: 3 },
  challenge: { label: 'Challenge Tour',    short: 'CT', phase: 3 },
  dev:       { label: 'Development Tour',  short: 'DEV', phase: 3 },
  pc:        { label: 'Players Championship', short: 'PC', phase: 4 },
  et:        { label: 'European Tour',     short: 'ET', phase: 4 },
  ws:        { label: 'World Series',      short: 'WS', phase: 5 },
  major:     { label: 'Major',             short: 'MAJOR', phase: 5 },
  pl:        { label: 'Premier League',    short: 'PL', phase: 5 },
};

const pcWeeks = [6, 8, 11, 13, 15, 17, 19, 21, 25, 27, 31, 33, 35, 38, 41];
const pcCities = ['Leicester', 'Leicester', 'Wigan', 'Leicester', 'Milton Keynes', 'Wigan', 'Leicester', 'Hildesheim',
  'Wigan', 'Milton Keynes', 'Leicester', 'Wigan', 'Hildesheim', 'Leicester', 'Leicester'];
const ctWeeks = [7, 11, 14, 17, 20, 23, 27, 30, 33, 36, 39, 42];
const devWeeks = [8, 13, 16, 19, 22, 26, 28, 32, 35, 38, 41, 43];
const tourCities = ['Milton Keynes', 'Leicester', 'Hildesheim', 'Wigan'];
const cityCountry = c => (c === 'Hildesheim' ? 'DE' : 'ENG');

const ET = [
  [7, 'Belgian Darts Open', 'Wieze', 'BE'], [9, 'German Darts Grand Prix', 'München', 'DE'],
  [12, 'European Darts Open', 'Leverkusen', 'DE'], [14, 'International Darts Open', 'Riesa', 'DE'],
  [16, 'Austrian Darts Open', 'Graz', 'AT'], [18, 'European Darts Grand Prix', 'Sindelfingen', 'DE'],
  [20, 'Dutch Darts Championship', 'Maastricht', 'NL'], [23, 'Czech Darts Open', 'Prag', 'CZ'],
  [26, 'Baltic Sea Darts Open', 'Kiel', 'DE'], [28, 'European Darts Matchplay', 'Hamburg', 'DE'],
  [32, 'Flanders Darts Trophy', 'Antwerpen', 'BE'], [34, 'Hungarian Darts Trophy', 'Budapest', 'HU'],
  [36, 'German Darts Championship', 'Hildesheim', 'DE'], [39, 'Swiss Darts Trophy', 'Basel', 'CH'],
];

// DDV (Deutscher Dartverband): 4 Ranglistenturniere pro Jahr, nur ohne Tourcard
const DDV = [[9, 'Gelsenkirchen'], [20, 'Bad Nauheim'], [33, 'Hamburg'], [44, 'München']];

export const CALENDAR = [
  ...DDV.map(([w, city], i) => ({
    id: `ddv-${i + 1}`, cat: 'ddv', name: `DDV-Ranglistenturnier ${i + 1}`, week: w, city, country: 'DE',
    note: '64 Spieler · viel Erfahrung',
  })),
  { id: 'qs-uk', cat: 'qschool', name: 'Q-School UK', week: 2, city: 'Milton Keynes', country: 'ENG', count: 4, note: '4 Tage · je 4 Tourcards (Halbfinalisten)' },
  { id: 'qs-eu', cat: 'qschool', name: 'Q-School Europa', week: 2, city: 'Kalkar', country: 'DE', count: 4, note: '4 Tage · je 4 Tourcards (Halbfinalisten)' },
  { id: 'ws-bah', cat: 'ws', name: 'Bahrain Darts Masters', week: 3, city: 'Manama', country: 'BH' },
  { id: 'ws-ned', cat: 'ws', name: 'Dutch Darts Masters', week: 4, city: 'Leeuwarden', country: 'NL' },
  { id: 'masters', cat: 'major', name: 'The Masters', week: 5, city: 'Milton Keynes', country: 'ENG' },
  { id: 'pl', cat: 'pl', name: 'Premier League (Spieltage)', week: 6, weeks: 16, city: 'diverse', country: 'ENG', note: 'nur Einladung' },
  { id: 'uk-open', cat: 'major', name: 'UK Open', week: 10, city: 'Minehead', country: 'ENG' },
  { id: 'pl-final', cat: 'pl', name: 'Premier League Play-offs', week: 22, city: 'London', country: 'ENG' },
  { id: 'wcod', cat: 'major', name: 'World Cup of Darts', week: 24, city: 'Frankfurt', country: 'DE' },
  { id: 'ws-nor', cat: 'ws', name: 'Nordic Darts Masters', week: 25, city: 'Kopenhagen', country: 'DK' },
  { id: 'ws-us', cat: 'ws', name: 'US Darts Masters', week: 26, city: 'New York', country: 'US' },
  { id: 'matchplay', cat: 'major', name: 'World Matchplay', week: 29, weeks: 2, city: 'Blackpool', country: 'ENG' },
  { id: 'ws-pol', cat: 'ws', name: 'Poland Darts Masters', week: 30, city: 'Warschau', country: 'PL' },
  { id: 'ws-aus', cat: 'ws', name: 'Australian Darts Masters', week: 33, city: 'Wollongong', country: 'AU' },
  { id: 'ws-nz', cat: 'ws', name: 'New Zealand Darts Masters', week: 34, city: 'Auckland', country: 'NZ' },
  { id: 'ws-final', cat: 'ws', name: 'World Series Finals', week: 37, city: 'Amsterdam', country: 'NL' },
  { id: 'wgp', cat: 'major', name: 'World Grand Prix', week: 40, city: 'Leicester', country: 'ENG' },
  { id: 'ec', cat: 'major', name: 'European Championship', week: 42, city: 'Dortmund', country: 'DE' },
  { id: 'youth-wm', cat: 'dev', fmt: 'youth', name: 'Youth-WM', week: 45, city: 'Minehead', country: 'ENG', note: 'nur U24 · zählt nicht zur Dev-OOM', noOom: true },
  { id: 'gsod', cat: 'major', name: 'Grand Slam of Darts', week: 46, city: 'Wolverhampton', country: 'ENG' },
  { id: 'pcf', cat: 'major', name: 'Players Championship Finals', week: 48, city: 'Minehead', country: 'ENG' },
  { id: 'wm-quali', cat: 'major', name: 'WM-Qualifikation', week: 49, city: 'Milton Keynes', country: 'ENG' },
  { id: 'wm', cat: 'major', name: 'Weltmeisterschaft', week: 51, weeks: 2, city: 'London', country: 'ENG' },
  ...pcWeeks.map((w, i) => ({
    id: `pc-${i + 1}`, cat: 'pc', name: `Players Championship ${i * 2 + 1} & ${i * 2 + 2}`,
    week: w, city: pcCities[i], country: cityCountry(pcCities[i]), count: 2,
  })),
  ...ET.map(([w, name, city, country], i) => ({
    id: `et-${i + 1}`, cat: 'et', name, week: w, city, country, count: 2, qualifier: true,
    subs: ['Qualifikation', 'Hauptfeld'], subFmts: ['etq', 'et'], note: 'Top 16 PDC gesetzt · Rest: Qualifikation (32 Plätze)',
  })),
  ...ctWeeks.map((w, i) => ({
    id: `ct-${i + 1}`, cat: 'challenge', name: `Challenge Tour ${i * 2 + 1} & ${i * 2 + 2}`,
    week: w, city: tourCities[i % 4], country: cityCountry(tourCities[i % 4]), count: 2,
  })),
  ...devWeeks.map((w, i) => ({
    id: `dev-${i + 1}`, cat: 'dev', name: `Development Tour ${i * 2 + 1} & ${i * 2 + 2}`,
    week: w, city: tourCities[(i + 2) % 4], country: cityCountry(tourCities[(i + 2) % 4]), count: 2,
  })),
];

// Lokale Turniere: jede Woche außer diesen KWs
export const LOCAL_BLOCKED_WEEKS = [52];
export const LOCAL_NAMES = ['{c} Open', 'Dart-Cup {c}', 'Kneipenturnier {c}', '{c} Steeldart Classic', 'Vereinsturnier {c}', '{c} Masters (Amateure)'];
export const LOCAL_CITIES = {
  DE: ['Bochum', 'Kassel', 'Bielefeld', 'Rostock', 'Augsburg', 'Mainz', 'Erfurt', 'Kiel', 'Osnabrück', 'Würzburg', 'Oberhausen', 'Chemnitz'],
  AT: ['Linz', 'Salzburg', 'Innsbruck', 'Wels', 'Klagenfurt'],
  CH: ['Bern', 'Luzern', 'Winterthur', 'St. Gallen'],
  NL: ['Utrecht', 'Zwolle', 'Breda', 'Groningen', 'Tilburg'],
  ENG: ['Stoke', 'Hull', 'Derby', 'Barnsley', 'Swindon', 'Leeds'],
  _: ['Nordstadt', 'Westhafen', 'Altstadt', 'Bergheim', 'Seedorf', 'Lindental'],
};

// Formate je Kategorie: default-Format, Abweichungen nach verbleibenden Spielern, stopAt = Turnierende
// (Q-School: bei den letzten 4 → diese erhalten eine Tourcard). {legs:n} = first to n.
export const FORMATS = {
  local: { field: 16, default: { legs: 3 }, byRemaining: { 4: { legs: 4 }, 2: { legs: 5 } } },
  ddv: { field: 64, default: { legs: 4 }, byRemaining: { 4: { legs: 5 }, 2: { legs: 6 } } },
  qschool: { default: { legs: 5 }, stopAt: 4, cards: true },
  pc: { field: 128, default: { legs: 6 } },
  etq: { default: { legs: 6 }, stopAt: 32 },                       // Tour-Card-Holder-Qualifier
  et: { default: { legs: 6 }, byRemaining: { 4: { legs: 7 }, 2: { legs: 8 } }, seeds: 16 },
  challenge: { default: { legs: 5 }, byRemaining: { 2: { legs: 6 } } },
  dev: { default: { legs: 5 }, byRemaining: { 2: { legs: 6 } } },
  youth: { default: { legs: 5 }, byRemaining: { 8: { legs: 6 }, 4: { legs: 6 }, 2: { legs: 7 } } },
};

// Q-School: Zuordnung zum Standort nach Nation (Rest → Europa)
export const QSCHOOL_UK_NATIONS = ['ENG', 'SCO', 'WAL', 'NIR', 'IRL', 'AU', 'NZ', 'US', 'CA', 'ZA', 'PH'];
