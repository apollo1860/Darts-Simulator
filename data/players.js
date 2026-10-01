// Spielerdaten (Stand: Saison 2026, Karriere startet Januar 2027).
// Format je Zeile: [Name, Nation, Alter im Jan. 2027, 3-Dart-Average (Spielstärke)]
// Namen/Werte einfach hier korrigieren – das Format bleibt gleich. Unsichere Angaben: siehe STATUS.md.
// Nur private Nutzung (echte Namen ohne Lizenz).

// --- Tourcard-Holder 2026 (128) ---
// a) Top 64 der PDC Order of Merit (Reihenfolge ≈ OOM Anfang 2026) → Karte wird Ende 2026 verlängert
export const TOUR_TOP64 = [
  ['Luke Littler', 'ENG', 20, 102.5], ['Luke Humphries', 'ENG', 32, 100], ['Gian van Veen', 'NL', 25, 99],
  ['Michael van Gerwen', 'NL', 37, 98], ['Jonny Clayton', 'WAL', 52, 96], ['Gary Anderson', 'SCO', 56, 96],
  ['Stephen Bunting', 'ENG', 41, 97], ['James Wade', 'ENG', 43, 94], ['Josh Rock', 'NIR', 25, 97],
  ['Danny Noppert', 'NL', 36, 95], ['Ryan Searle', 'ENG', 39, 96], ['Gerwyn Price', 'WAL', 41, 97],
  ['Chris Dobey', 'ENG', 36, 95], ['Nathan Aspinall', 'ENG', 35, 95], ['Martin Schindler', 'DE', 30, 95],
  ['Ross Smith', 'ENG', 37, 94], ['Damon Heta', 'AU', 39, 95], ['Rob Cross', 'ENG', 36, 95],
  ['Peter Wright', 'SCO', 56, 93], ['Dave Chisnall', 'ENG', 46, 94], ['Mike De Decker', 'BE', 31, 94],
  ['Wessel Nijman', 'NL', 26, 96], ['Luke Woodhouse', 'ENG', 38, 94], ['Dimitri Van den Bergh', 'BE', 32, 93],
  ['Joe Cullen', 'ENG', 37, 93], ['Ritchie Edhouse', 'ENG', 43, 92], ['Daryl Gurney', 'NIR', 40, 92],
  ['Cameron Menzies', 'SCO', 37, 93], ['Dirk van Duijvenbode', 'NL', 34, 94], ['Andrew Gilding', 'ENG', 56, 91],
  ['Krzysztof Ratajski', 'PL', 49, 93], ['Kevin Doets', 'NL', 28, 92], ['Ricardo Pietreczko', 'DE', 32, 93],
  ['Callan Rydz', 'ENG', 28, 94], ['Jermaine Wattimena', 'NL', 38, 92], ['Ryan Joyce', 'ENG', 41, 92],
  ['Gabriel Clemens', 'DE', 43, 92], ['Raymond van Barneveld', 'NL', 59, 92], ['Michael Smith', 'ENG', 36, 93],
  ['Brendan Dolan', 'NIR', 53, 91], ['Madars Razma', 'LV', 38, 92], ['Martin Lukeman', 'ENG', 41, 92],
  ['Mensur Suljović', 'AT', 54, 90], ['Scott Williams', 'ENG', 36, 92], ['Jeffrey de Graaf', 'SE', 36, 91],
  ['Niels Zonneveld', 'NL', 28, 91], ['Ian White', 'ENG', 56, 91], ['Keane Barry', 'IRL', 24, 92],
  ['Karel Sedláček', 'CZ', 47, 90], ['William O\'Connor', 'IRL', 40, 91], ['Mickey Mansell', 'NIR', 53, 89],
  ['Ryan Meikle', 'ENG', 30, 91], ['Ricky Evans', 'ENG', 36, 90], ['Josh Payne', 'ENG', 36, 90],
  ['Kim Huybrechts', 'BE', 41, 91], ['Danny Jansen', 'NL', 28, 91], ['Leonard Gates', 'US', 56, 89],
  ['Mario Vandenbogaerde', 'BE', 34, 89], ['Florian Hempel', 'DE', 36, 90], ['Thibault Tricole', 'FR', 36, 90],
  ['Dom Taylor', 'ENG', 29, 91], ['Rob Owen', 'WAL', 43, 89], ['Nick Kenny', 'WAL', 33, 90],
  ['Connor Scutt', 'ENG', 31, 90],
];

// b) Weitere Holder, deren Karte Ende 2026 ausläuft (nur Top 64 der OOM behalten sie)
export const TOUR_EXPIRING = [
  ['Darius Labanauskas', 'LT', 50, 89], ['Wesley Plaisier', 'NL', 36, 90], ['Andy Baetens', 'BE', 38, 90],
  ['Stowe Buntz', 'US', 47, 89], ['Alan Soutar', 'SCO', 48, 89], ['Owen Bates', 'ENG', 27, 90],
  ['Nathan Rafferty', 'NIR', 24, 91], ['Paolo Nebrida', 'PH', 48, 88], ['Jamai van den Herik', 'NL', 22, 90],
  ['Ted Evetts', 'ENG', 29, 90], ['Mitchell Clegg', 'ENG', 26, 89], ['Christian Kist', 'NL', 40, 89],
  ['Rowby-John Rodriguez', 'AT', 32, 89], ['Lukas Wenig', 'DE', 30, 89], ['Kai Gotthardt', 'DE', 24, 89],
  ['Niko Springer', 'DE', 26, 92], ['Sebastian Białecki', 'PL', 24, 90], ['Arron Monk', 'ENG', 33, 89],
  ['Cameron Carolissen', 'ZA', 28, 89], ['Max Hopp', 'DE', 30, 89], ['Haupai Puha', 'NZ', 46, 88],
  ['Richard Veenstra', 'NL', 45, 88], ['Cor Dekker', 'NL', 27, 89], ['Bradley Brooks', 'ENG', 23, 89],
  ['Tom Bissell', 'ENG', 34, 88], ['Simon Whitlock', 'AU', 58, 88], ['Justin Hood', 'ENG', 33, 90],
  ['Adam Lipscombe', 'ENG', 32, 88], ['Danny Lauby', 'US', 33, 88], ['Darren Beveridge', 'SCO', 38, 88],
  ['Keegan Brown', 'ENG', 34, 89], ['Matthew Dennant', 'ENG', 32, 88], ['Damian Mol', 'NL', 26, 88],
  ['Leighton Bennett', 'ENG', 21, 88], ['Ben Robb', 'NZ', 32, 88], ['Jules van Dongen', 'US', 36, 88],
];

// c) Neu 2026 (Q-School 2026, Challenge-/Dev-Tour 2025) → Karte gültig bis Ende 2027
export const TOUR_NEW_2026 = [
  ['Stefan Bellmont', 'CH', 30, 89], ['Beau Greaves', 'ENG', 22, 92],
  ['Rhys Griffin', 'WAL', 27, 89], ['Adam Leek', 'ENG', 30, 88], ['Carl Sneyd', 'ENG', 30, 88],
  ['Niall Culleton', 'IRL', 42, 88], ['Tom Sykes', 'ENG', 28, 88], ['Shane McGuirk', 'IRL', 35, 88],
  ['Charlie Manby', 'ENG', 21, 90], ['Samuel Price', 'ENG', 25, 88], ['Stephen Burton', 'ENG', 40, 88],
  ['Mervyn King', 'ENG', 61, 88], ['Tyler Thorpe', 'ENG', 22, 88], ['Stephen Rosney', 'SCO', 38, 87],
  ['David Sharp', 'ENG', 35, 87], ['Jimmy van Schie', 'NL', 36, 88], ['Chris Landman', 'NL', 38, 88],
  ['Marvin Kraft', 'DE', 25, 88], ['Benjamin Pratnemer', 'SI', 35, 88], ['Adam Gawlas', 'CZ', 23, 89],
  ['Jurjen van der Velde', 'NL', 36, 90], ['Alexander Merkx', 'NL', 24, 88], ['Pascal Rupprecht', 'DE', 26, 88],
  ['Yorick Hofkens', 'BE', 27, 88], ['Matthias Ehlers', 'DE', 30, 87], ['Filip Bereza', 'PL', 25, 88],
  ['Arno Merk', 'DE', 35, 87], ['Jeffrey de Zwaan', 'NL', 30, 89],
];

export const TOUR_PLAYERS = [...TOUR_TOP64, ...TOUR_EXPIRING, ...TOUR_NEW_2026];

// --- 50 Challenge-Tour-Spieler (ohne Tourcard, ~82–92) ---
export const CHALLENGE_PLAYERS = [
  ['José de Sousa', 'PT', 53, 89], ['Matt Campbell', 'CA', 44, 88], ['Jim Williams', 'WAL', 43, 90],
  ['Dylan Slevin', 'IRL', 27, 89], ['Jelle Klaasen', 'NL', 43, 87], ['Steve Lennon', 'IRL', 33, 88],
  ['Andreas Harrysson', 'SE', 28, 88], ['Joe Hunt', 'ENG', 30, 88], ['Fallon Sherrock', 'ENG', 32, 85],
  ['Steve Beaton', 'ENG', 63, 85], ['Jamie Hughes', 'ENG', 41, 86], ['Kevin Burness', 'NIR', 42, 86],
  ['Ron Meulenkamp', 'NL', 38, 86], ['Boris Krčmar', 'HR', 47, 86], ['Berry van Peer', 'NL', 30, 86],
  ['Geert Nentjes', 'NL', 37, 86], ['Danny van Trijp', 'NL', 30, 86], ['Maik Kuivenhoven', 'NL', 38, 85],
  ['Dragutin Horvat', 'DE', 49, 86], ['Steffen Siepmann', 'DE', 39, 85], ['Nico Kurz', 'DE', 29, 86],
  ['Michael Unterbuchner', 'DE', 37, 86], ['Daniel Klose', 'DE', 40, 85], ['Kevin Münch', 'DE', 38, 86],
  ['Scott Waites', 'ENG', 49, 85], ['Darren Webster', 'ENG', 58, 85], ['Steve West', 'ENG', 47, 85],
  ['John Henderson', 'SCO', 52, 85], ['Kirk Shepherd', 'ENG', 40, 85], ['Jamie Clark', 'SCO', 33, 85],
  ['Lewy Williams', 'WAL', 30, 86], ['Jarred Cole', 'ENG', 34, 86], ['Callum Loose', 'ENG', 28, 86],
  ['Joe Davis', 'ENG', 33, 86], ['Brett Claydon', 'ENG', 37, 85], ['Harry Ward', 'ENG', 26, 85],
  ['Shaun Wilkinson', 'ENG', 33, 85], ['Jack Main', 'ENG', 26, 86], ['Ronny Huybrechts', 'BE', 61, 84],
  ['Kenny Neyens', 'BE', 31, 85], ['Robert Marijanović', 'DE', 40, 85], ['Martijn Kleermaker', 'NL', 36, 86],
  ['Vincent van der Voort', 'NL', 51, 85], ['Ryan Hogarth', 'SCO', 30, 85], ['Patrick Geeraets', 'BE', 31, 84],
  ['Jim McEwan', 'SCO', 40, 84], ['Gavin Carlin', 'IRL', 41, 85], ['Lisa Ashton', 'ENG', 56, 84],
  ['Gordon Mathers', 'AU', 54, 84], ['Krzysztof Kciuk', 'PL', 36, 84],
];

// --- 50 Development-Tour-Spieler (≤ 23 Jahre, ~78–90) ---
// Erste Gruppe: real bekannte Nachwuchsspieler (Alter/Werte geschätzt). Danach FIKTIVE Talente –
// bitte bei Bedarf durch echte Namen ersetzen.
export const DEV_PLAYERS = [
  ['Thomas Banks', 'ENG', 21, 86], ['Nathan Girvan', 'SCO', 23, 85], ['Jenson Walker', 'ENG', 20, 83],
  ['Owen Roelofs', 'NL', 22, 86], ['Dominik Grüllich', 'DE', 21, 84], ['Keelan Kay', 'ENG', 22, 83],
  ['Moreno Blom', 'NL', 22, 84], ['Tavis Dudeney', 'ENG', 22, 84], ['Cam Crabtree', 'ENG', 22, 84],
  ['Bradly Roes', 'NL', 23, 86], ['Archie Self', 'ENG', 23, 84], ['Mitchell Lawrie', 'ENG', 23, 83],
  // fiktiv:
  ['Finn Hagemann', 'DE', 19, 82], ['Lasse Brinkmann', 'DE', 18, 80], ['Jonas Albers', 'DE', 20, 83],
  ['Tim Reuter', 'DE', 17, 79], ['Noah Lindemann', 'DE', 21, 84], ['Elias Kröger', 'AT', 19, 81],
  ['Luca Steiner', 'AT', 22, 82], ['Sven Bakker', 'NL', 18, 82], ['Daan Visser', 'NL', 20, 84],
  ['Thijs Mulder', 'NL', 19, 83], ['Ruben de Boer', 'NL', 21, 85], ['Jesse Smit', 'NL', 17, 80],
  ['Milan Peeters', 'BE', 20, 82], ['Arne Claes', 'BE', 22, 83], ['Kacper Nowak', 'PL', 19, 81],
  ['Jakub Wójcik', 'PL', 21, 82], ['Ondřej Novák', 'CZ', 20, 81], ['Oliver Hart', 'ENG', 18, 82],
  ['Harvey Cole', 'ENG', 19, 83], ['Alfie Turner', 'ENG', 17, 80], ['George Pritchard', 'WAL', 20, 82],
  ['Callum Reid', 'SCO', 21, 83], ['Lewis Fraser', 'SCO', 18, 80], ['Kieran Doyle', 'IRL', 20, 82],
  ['Seán Murphy', 'IRL', 22, 83], ['Ryan McCann', 'NIR', 19, 82], ['Jack Barlow', 'ENG', 21, 85],
  ['Ethan Moss', 'ENG', 20, 84], ['Leo Hartley', 'ENG', 22, 86], ['Max Weller', 'ENG', 16, 78],
  ['Rasmus Lind', 'SE', 21, 81], ['Mikkel Holm', 'DK', 20, 80], ['Teemu Laine', 'FI', 22, 81],
  ['Mateo García', 'ES', 19, 79], ['Lorenzo Ricci', 'IT', 21, 80], ['Hugo Lefèvre', 'FR', 20, 80],
  ['Riley Thompson', 'AU', 22, 83], ['Cody Walsh', 'US', 21, 80],
];

// --- 50 fiktive Amateure für lokale Turniere (~60–80) ---
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
