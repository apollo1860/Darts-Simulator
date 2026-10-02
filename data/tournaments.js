// Jahreskalender (Vorlage, gilt für jedes Jahr). week = ISO-KW, weeks = Dauer in Wochen.
// phase = ab welcher Entwicklungsphase spielbar. count = Anzahl Turniere im Block (z. B. PC-Doppel).
// Orientiert am PDC-Kalender, vereinfacht (siehe STATUS.md → Annahmen).

export const CATEGORIES = {
  local:     { label: 'Lokal',             short: 'LOKAL', phase: 1 },
  ddv:       { label: 'DDV-Ranglistenturnier', short: 'DDV', phase: 1 },
  wdf:       { label: 'WDF Open', short: 'WDF', phase: 1 },
  hnq:       { label: 'Host-Nation-Qualifier', short: 'HNQ', phase: 1 },
  wmqs:      { label: 'WM-Qualifier (Q-School)', short: 'WM-Q', phase: 1 },
  qschool:   { label: 'Q-School',          short: 'Q-SCHOOL', phase: 3 },
  challenge: { label: 'Challenge Tour',    short: 'CT', phase: 3 },
  dev:       { label: 'Development Tour',  short: 'DEV', phase: 3 },
  pc:        { label: 'Players Championship', short: 'PC', phase: 4 },
  et:        { label: 'European Tour',     short: 'ET', phase: 4 },
  etq:       { label: 'ET-Qualifier (Tour Card Holder)', short: 'TCHQ', phase: 4 },
  ws:        { label: 'World Series',      short: 'WS', phase: 5 },
  major:     { label: 'Major',             short: 'MAJOR', phase: 5 },
  pl:        { label: 'Premier League',    short: 'PL', phase: 5 },
};

const pcWeeks = [6, 8, 11, 13, 15, 17, 19, 21, 25, 27, 31, 33, 35, 38, 41];
const pcCities = ['Leicester', 'Leicester', 'Wigan', 'Leicester', 'Milton Keynes', 'Wigan', 'Leicester', 'Hildesheim',
  'Wigan', 'Milton Keynes', 'Leicester', 'Wigan', 'Hildesheim', 'Leicester', 'Leicester'];
// Challenge/Dev Tour: je 5 Wochenenden à 5 Turniere (= 25 je Tour)
const ctWeeks = [11, 19, 29, 37, 42];
const devWeeks = [14, 22, 32, 39, 43];
export const TOUR_WEEKEND_EVENTS = 5;
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

// Regionale ET-Qualifier (je 1 Platz, nur Spieler ohne Tourcard, laufen im Hintergrund)
export const ET_REGIONS = {
  nb: { label: 'Nordic & Baltic', nations: ['DK', 'SE', 'NO', 'FI', 'EE', 'LV', 'LT'] },
  ee: { label: 'Osteuropa', nations: ['PL', 'CZ', 'HU', 'HR', 'SI'] },
};

// DDV (Deutscher Dartverband): 4 Ranglistenturniere pro Jahr, nur ohne Tourcard
const DDV = [[9, 'Gelsenkirchen'], [20, 'Bad Nauheim'], [33, 'Hamburg'], [44, 'München']];

const WS = [
  [3, 'ws-bah', 'Bahrain Darts Masters', 'Manama', 'BH'], [4, 'ws-ned', 'Dutch Darts Masters', 'Leeuwarden', 'NL'],
  [25, 'ws-nor', 'Nordic Darts Masters', 'Kopenhagen', 'DK'], [26, 'ws-us', 'US Darts Masters', 'New York', 'US'],
  [30, 'ws-pol', 'Poland Darts Masters', 'Warschau', 'PL'], [33, 'ws-aus', 'Australian Darts Masters', 'Wollongong', 'AU'],
  [34, 'ws-nz', 'New Zealand Darts Masters', 'Auckland', 'NZ'], [37, 'ws-final', 'World Series Finals', 'Amsterdam', 'NL'],
];
const PL_CITIES = ['Cardiff', 'Glasgow', 'Exeter', 'Dublin', 'Belfast', 'Nottingham', 'Brighton', 'Newcastle', 'Berlin', 'Manchester',
  'Rotterdam', 'Liverpool', 'Birmingham', 'Leeds', 'Aberdeen', 'Sheffield'];
const PL_COUNTRY = { 0: 'WAL', 1: 'SCO', 3: 'IRL', 4: 'NIR', 8: 'DE', 10: 'NL', 14: 'SCO' };

// WDF-Opens (nur ohne Tourcard): [KW, id, Name, Ort, Land, Kategorie, Europa]. KW nach den Terminen 2026.
// Max. ein WDF-Open pro Woche (gestrichen: Tallinn Open, Canadian Open, Philippines Open).
// Platinum/Gold: 128er-Feld, sonst 64. Sieg 1.000–2.500 € je nach Kategorie (jährlich zufällig im Band).
const WDF = [
  [3, 'vegas', 'Las Vegas Open', 'Las Vegas', 'US', 'Gold', false], [6, 'dutch', 'Dutch Open', 'Assen', 'NL', 'Platinum', true],
  [10, 'iom', 'Isle of Man Open', 'Douglas', 'IM', 'Gold', true], [13, 'virginia', 'Virginia Beach Classic', 'Virginia Beach', 'US', 'Silver', false],
  [16, 'estonia', 'Estonian Open', 'Tallinn', 'EE', 'Bronze', true],
  [18, 'denmark', 'Denmark Open', 'Esbjerg', 'DK', 'Gold', true], [21, 'toronto', 'Toronto Area Open', 'Toronto', 'CA', 'Gold', false],
  [23, 'england', 'England Open', 'Selsey', 'ENG', 'Gold', true], [24, 'finland', 'Finnish Open', 'Helsinki', 'FI', 'Bronze', true],
  [25, 'japan', 'The Steel Masters', 'Tokio', 'JP', 'Gold', false],
  [26, 'nz', 'New Zealand Open', 'Auckland', 'NZ', 'Gold', false], [28, 'charlotte', 'Charlotte Open', 'Charlotte', 'US', 'Silver', false],
  [30, 'pacific', 'Pacific Masters', 'Sydney', 'AU', 'Gold', false], [31, 'belgium', 'Belgium Open', 'Antwerpen', 'BE', 'Silver', true], [33, 'italy', 'Italian Open', 'Rom', 'IT', 'Bronze', true],
  [35, 'wales', 'Welsh Open', 'Prestatyn', 'WAL', 'Silver', true], [47, 'czech', 'Czech Open', 'Prag', 'CZ', 'Silver', true],
];
export const WDF_PRIZE_BAND = { Platinum: [2200, 2500], Gold: [1700, 2200], Silver: [1300, 1700], Bronze: [1000, 1300] };

export const CALENDAR = [
  ...WDF.map(([w, id, name, city, country, tier, europe]) => ({
    id: `wdf-${id}`, cat: 'wdf', name, week: w, city, country, tier, europe, field: tier === 'Platinum' || tier === 'Gold' ? 128 : 64,
    note: `WDF ${tier} · nur ohne Tourcard · ${europe ? 'Europa' : 'Übersee'}`,
  })),
  ...DDV.map(([w, city], i) => ({
    id: `ddv-${i + 1}`, cat: 'ddv', name: `DDV-Ranglistenturnier ${i + 1}`, week: w, city, country: 'DE',
    note: '64 Spieler · viel Erfahrung',
  })),
  { id: 'qs-uk', cat: 'qschool', name: 'Q-School UK', week: 2, city: 'Milton Keynes', country: 'ENG', count: 4, note: '4 Tage · je 4 Tourcards (Halbfinalisten)' },
  { id: 'qs-eu', cat: 'qschool', name: 'Q-School Europa', week: 2, city: 'Kalkar', country: 'DE', count: 4, note: '4 Tage · je 4 Tourcards (Halbfinalisten)' },
  ...WS.map(([w, id, name, city, country]) => ({ id, cat: 'ws', fmt: id === 'ws-final' ? 'wsf' : 'ws', name, week: w, city, country, noOom: true,
    note: id === 'ws-final' ? 'Top 24 der World-Series-Wertung' : 'Einladung: Top 8 PDC + 8 Qualifikanten' })),
  { id: 'masters', cat: 'major', fmt: 'masters', name: 'The Masters', week: 5, city: 'Milton Keynes', country: 'ENG', note: 'Top 24 PDC OOM' },
  ...Array.from({ length: 16 }, (_, i) => ({
    id: `pl-${i + 1}`, cat: 'pl', fmt: 'pln', name: `Premier League · Spieltag ${i + 1}`, week: 6 + i,
    city: PL_CITIES[i], country: PL_COUNTRY[i] ?? 'ENG', noOom: true, extra: true, plNight: i + 1,
    note: 'Top 8 PDC (Einladung) · zählt zusätzlich zum Wochen-Event',
  })),
  { id: 'uk-open', cat: 'major', fmt: 'ukopen', name: 'UK Open', week: 10, city: 'Minehead', country: 'ENG', note: 'Alle Tourcard-Holder + 32 Amateure (CT-OOM)' },
  { id: 'pl-final', cat: 'pl', fmt: 'plf', name: 'Premier League Play-offs', week: 22, city: 'London', country: 'ENG', noOom: true, extra: true, note: 'Top 4 der Tabelle' },
  { id: 'wcod', cat: 'major', fmt: 'wcod', name: 'World Cup of Darts', week: 24, city: 'Frankfurt', country: 'DE', noOom: true, team: true, note: 'Zweierteams: die 2 Besten jeder Nation' },
  { id: 'matchplay', cat: 'major', fmt: 'matchplay', name: 'World Matchplay', week: 29, weeks: 2, city: 'Blackpool', country: 'ENG', note: 'Top 16 PDC + Top 16 Pro Tour' },
  { id: 'wgp', cat: 'major', fmt: 'wgp', name: 'World Grand Prix', week: 40, city: 'Leicester', country: 'ENG', note: 'Top 16 PDC + Top 16 Pro Tour · Sätze' },
  { id: 'ec', cat: 'major', fmt: 'ec', name: 'European Championship', week: 42, city: 'Dortmund', country: 'DE', note: 'Top 32 der European-Tour-Wertung' },
  { id: 'youth-wm', cat: 'dev', fmt: 'youth', name: 'Youth-WM', week: 45, city: 'Minehead', country: 'ENG', note: 'nur U24 · zählt nicht zur Dev-OOM', noOom: true },
  { id: 'gsod', cat: 'major', fmt: 'gsod', name: 'Grand Slam of Darts', week: 46, city: 'Wolverhampton', country: 'ENG', groups: true, note: '32 Spieler · Gruppenphase + K.-o.' },
  { id: 'pcf', cat: 'major', fmt: 'pcf', name: 'Players Championship Finals', week: 48, city: 'Minehead', country: 'ENG', note: 'Top 64 Pro Tour OOM' },
  { id: 'wm-qs', cat: 'wmqs', name: 'WM-Qualifier (Q-School-Teilnehmer)', week: 46, city: 'Milton Keynes', country: 'ENG',
    note: 'alle Q-School-Teilnehmer des Jahres ohne Tourcard · Sieger spielt die WM' },
  { id: 'wm-quali', cat: 'major', fmt: 'wmq', name: 'WM-Qualifikation', week: 49, city: 'Milton Keynes', country: 'ENG', noOom: true, note: 'Tourcard-Holder ohne WM-Platz · 16 Tickets' },
  { id: 'wm', cat: 'major', fmt: 'wm', name: 'Weltmeisterschaft', week: 51, weeks: 2, city: 'London', country: 'ENG', note: '128 Spieler · Sätze' },
  ...pcWeeks.map((w, i) => ({
    id: `pc-${i + 1}`, cat: 'pc', name: `Players Championship ${i * 2 + 1} & ${i * 2 + 2}`,
    week: w, city: pcCities[i], country: cityCountry(pcCities[i]), count: 2,
  })),
  // Host-Nation-Qualifier: Woche vor jedem ET-Event, nur Spieler der Gastgebernation ohne Tourcard, bis zu 4 Turniere
  // (Anzahl wählbar, 25 € je Turnier); wer eins gewinnt, steht im Hauptfeld des ET-Events
  ...ET.map(([w, name, city, country], i) => ({
    id: `hnq-${i + 1}`, cat: 'hnq', name: `Host-Nation-Qualifier ${name}`, week: w - 1, city, country, count: 4, pick: true,
    etId: `et-${i + 1}`, note: `nur ohne Tourcard aus ${country} · Turniersieg = Platz im Hauptfeld`,
  })),
  // European Tour: 48er-Feld = Top 16 PDC (gesetzt, Runde 2) + Top 16 Pro Tour + 10 TCHQ + 4 HNQ + Nordic & Baltic + Osteuropa
  ...ET.map(([w, name, city, country], i) => ({
    id: `et-${i + 1}`, cat: 'et', name, week: w, city, country,
    note: 'Top 16 PDC (gesetzt) · Top 16 Pro Tour · 10 TCHQ · 4 Host Nation · Nordic & Baltic · Osteuropa',
  })),
  // Tour Card Holder Qualifier: direkt nach dem letzten Pro-Tour-Block vor dem ET-Event (Zusatz-Event, kein Preisgeld,
  // nach dem PC-Block nur eine Übernachtung extra), 10 Plätze im Hauptfeld
  ...ET.map(([w, name], i) => {
    const k = pcWeeks.findLastIndex(x => x < w);
    return {
      id: `etq-${i + 1}`, cat: 'etq', name: `TCHQ ${name}`, week: pcWeeks[k], city: pcCities[k], country: cityCountry(pcCities[k]),
      extra: true, qualifier: true, etId: `et-${i + 1}`, note: 'Tour Card Holder Qualifier · 10 Plätze im Hauptfeld · kein Preisgeld',
    };
  }),
  ...ctWeeks.map((w, i) => ({
    id: `ct-${i + 1}`, cat: 'challenge', name: `Challenge Tour ${i * 5 + 1}–${i * 5 + 5}`,
    week: w, city: tourCities[i % 4], country: cityCountry(tourCities[i % 4]), count: TOUR_WEEKEND_EVENTS, pick: true,
  })),
  ...devWeeks.map((w, i) => ({
    id: `dev-${i + 1}`, cat: 'dev', name: `Development Tour ${i * 5 + 1}–${i * 5 + 5}`,
    week: w, city: tourCities[(i + 2) % 4], country: cityCountry(tourCities[(i + 2) % 4]), count: TOUR_WEEKEND_EVENTS, pick: true,
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
  local: { field: 16, default: { legs: 3 } },          // immer best of 5 (first to 3), auch im Finale
  ddv: { field: 64, default: { legs: 4 }, byRemaining: { 4: { legs: 5 }, 2: { legs: 6 } } },
  wmqs: { default: { legs: 5 }, byRemaining: { 4: { legs: 6 }, 2: { legs: 6 } } },
  hnq: { field: 64, default: { legs: 4 }, byRemaining: { 2: { legs: 5 } } },
  wdf: { field: 64, default: { legs: 4 }, byRemaining: { 8: { legs: 5 }, 4: { legs: 5 }, 2: { legs: 6 } } },
  qschool: { default: { legs: 5 }, stopAt: 4, cards: true },
  pc: { field: 128, default: { legs: 6 }, byRemaining: { 4: { legs: 7 }, 2: { legs: 8 } } },   // Bo11, HF Bo13, F Bo15
  etq: { default: { legs: 6 }, stopAt: 10, sections: 10 },         // Tour-Card-Holder-Qualifier: 10 Sektionen → 10 Qualifikanten
  et: { default: { legs: 6 }, byRemaining: { 4: { legs: 7 }, 2: { legs: 8 } }, seeds: 16 },
  challenge: { default: { legs: 5 } },                               // durchgehend Bo9
  dev: { default: { legs: 4 }, byRemaining: { 8: { legs: 5 }, 4: { legs: 5 }, 2: { legs: 5 } } },   // Bo7, ab VF Bo9
  youth: { default: { legs: 5 }, byRemaining: { 8: { legs: 6 }, 4: { legs: 6 }, 2: { legs: 7 } } },
  // Majors & Events (Phase 5)
  masters: { default: { legs: 6 }, byRemaining: { 16: { legs: 10 }, 8: { legs: 10 }, 4: { legs: 11 }, 2: { legs: 11 } } },
  ukopen: { default: { legs: 6 }, byRemaining: { 8: { legs: 10 }, 4: { legs: 11 }, 2: { legs: 11 } } },
  matchplay: { default: { legs: 10 }, byRemaining: { 16: { legs: 11 }, 8: { legs: 13 }, 4: { legs: 17 }, 2: { legs: 18 } } },
  wgp: { default: { sets: 2, legs: 3 }, byRemaining: { 16: { sets: 3, legs: 3 }, 8: { sets: 3, legs: 3 }, 4: { sets: 4, legs: 3 }, 2: { sets: 5, legs: 3 } } },
  ec: { default: { legs: 6 }, byRemaining: { 16: { legs: 10 }, 8: { legs: 10 }, 4: { legs: 11 }, 2: { legs: 11 } } },
  gsod: { group: { legs: 5 }, default: { legs: 10 }, byRemaining: { 8: { legs: 16 }, 4: { legs: 16 }, 2: { legs: 16 } } },
  pcf: { default: { legs: 6 }, byRemaining: { 16: { legs: 10 }, 8: { legs: 10 }, 4: { legs: 11 }, 2: { legs: 11 } } },
  wmq: { default: { legs: 6 }, stopAt: 16 },
  wm: { default: { sets: 3, legs: 3 }, byRemaining: { 32: { sets: 4, legs: 3 }, 16: { sets: 4, legs: 3 }, 8: { sets: 5, legs: 3 }, 4: { sets: 6, legs: 3 }, 2: { sets: 7, legs: 3 } } },
  ws: { default: { legs: 6 }, byRemaining: { 4: { legs: 7 }, 2: { legs: 8 } } },
  wsf: { default: { legs: 6 }, byRemaining: { 4: { legs: 10 }, 2: { legs: 11 } } },
  wcod: { default: { legs: 4 }, byRemaining: { 8: { legs: 8 }, 4: { legs: 8 }, 2: { legs: 10 } } },
  pln: { default: { legs: 6 } },
  plf: { default: { legs: 10 }, byRemaining: { 2: { legs: 11 } } },
};

// Q-School: Zuordnung zum Standort nach Nation (Rest → Europa)
export const QSCHOOL_UK_NATIONS = ['ENG', 'SCO', 'WAL', 'NIR', 'IRL', 'AU', 'NZ', 'US', 'CA', 'ZA', 'PH'];
