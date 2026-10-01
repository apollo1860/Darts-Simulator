// Spielerdaten. Format je Zeile: [Name, Nation, Alter, 3-Dart-Average]
// Phase 1: Tour/Challenge/Dev sind PLATZHALTER. Echte Listen folgen in Phase 3
// (einfach die Arrays durch echte Zeilen ersetzen – das Format bleibt gleich).

const NAT_POOL = ['ENG', 'ENG', 'ENG', 'NL', 'NL', 'DE', 'SCO', 'WAL', 'NIR', 'IRL', 'BE', 'AT', 'PL', 'AU', 'US', 'CZ', 'LV', 'SE'];

// Platzhalter-Generator (deterministisch): Averages linear von hi bis lo
function placeholders(prefix, n, hi, lo, ageMin, ageMax) {
  return Array.from({ length: n }, (_, i) => [
    `${prefix} ${String(i + 1).padStart(3, '0')}`,
    NAT_POOL[(i * 7) % NAT_POOL.length],
    ageMin + ((i * 13) % (ageMax - ageMin + 1)),
    Math.round((hi - (hi - lo) * (i / Math.max(1, n - 1))) * 10) / 10,
  ]);
}

// 128 Tourcard-Holder (Top 16 ~96–106, Rest ~88–98)
export const TOUR_PLAYERS = [
  ...placeholders('Tour-Profi', 16, 106, 96, 22, 45),
  ...placeholders('Tourspieler', 112, 98, 88, 20, 52),
];

// 50 Challenge-Tour-Spieler (~82–92)
export const CHALLENGE_PLAYERS = placeholders('Challenger', 50, 92, 82, 20, 48);

// 50 Development-Tour-Spieler (≤ 23 Jahre, ~78–90)
export const DEV_PLAYERS = placeholders('Talent', 50, 90, 78, 16, 23);

// 50 fiktive Amateure für lokale Turniere (~60–80)
export const LOCAL_PLAYERS = [
  ['Kevin Brandt', 'DE', 27, 68], ['Sven Kowalski', 'DE', 34, 72], ['Marco Lindner', 'DE', 41, 65],
  ['Dennis Haas', 'DE', 29, 74], ['Tobias Wendt', 'DE', 23, 63], ['Rüdiger Pohl', 'DE', 55, 61],
  ['Jens Albrecht', 'DE', 38, 70], ['Patrick Seidel', 'DE', 31, 77], ['Uwe Krämer', 'DE', 49, 66],
  ['Nico Busch', 'DE', 21, 62], ['Andreas Vogt', 'DE', 44, 71], ['Daniel Ostermann', 'DE', 36, 79],
  ['Heiko Brückner', 'DE', 52, 64], ['Lars Engel', 'DE', 26, 69], ['Michael Sauer', 'DE', 47, 73],
  ['Stefan Riedel', 'DE', 39, 67], ['Timo Gerber', 'DE', 24, 75], ['Frank Ziegler', 'DE', 58, 60],
  ['Christian Böhm', 'DE', 33, 76], ['Mario Kuhn', 'DE', 30, 65], ['Ralf Steiner', 'AT', 46, 70],
  ['Florian Huber', 'AT', 28, 72], ['Lukas Gruber', 'AT', 22, 64], ['Beat Meier', 'CH', 43, 66],
  ['Jan de Groot', 'NL', 35, 78], ['Bas Visser', 'NL', 27, 74], ['Ruud Mulder', 'NL', 50, 68],
  ['Pieter Claes', 'BE', 37, 71], ['Wout Peeters', 'BE', 25, 66], ['Gary Holt', 'ENG', 45, 75],
  ['Dean Fowler', 'ENG', 32, 73], ['Lee Barnes', 'ENG', 40, 69], ['Craig Pickering', 'ENG', 29, 80],
  ['Stuart Lyle', 'SCO', 48, 67], ['Rhys Morgan', 'WAL', 34, 70], ['Connor Doyle', 'IRL', 26, 68],
  ['Tomasz Nowicki', 'PL', 31, 72], ['Pavel Dvořák', 'CZ', 39, 65], ['Mikael Lund', 'SE', 42, 63],
  ['Jesper Holm', 'DK', 36, 67], ['Kai Petersen', 'DE', 28, 71], ['Oliver Franke', 'DE', 35, 62],
  ['Marcel Schuster', 'DE', 22, 66], ['Björn Hartmann', 'DE', 44, 74], ['Sascha Winkler', 'DE', 37, 69],
  ['Dirk Lehmann', 'DE', 53, 63], ['René Kaiser', 'DE', 30, 78], ['Thorsten Beck', 'DE', 48, 61],
  ['Enrico Stein', 'DE', 25, 70], ['Philipp Roth', 'DE', 20, 64],
];
