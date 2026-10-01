// Spielerdaten (Stand: Saison 2026, Karriere startet Januar 2027).
// Format je Zeile: [Name, Nation, Alter im Jan. 2027, 3-Dart-Average (Spielstärke)]
// Namen/Werte einfach hier korrigieren – das Format bleibt gleich. Unsichere Angaben: siehe STATUS.md.
// Nur private Nutzung (echte Namen ohne Lizenz).

// --- Tourcard-Holder 2026 (128) ---
// a) Top 64 der PDC Order of Merit (Reihenfolge laut Nutzerliste) → Karte wird Ende 2026 verlängert
//    (Platz 46 war in der Liste doppelt „Madars Razma“ → nur einmal übernommen, daher 63 Einträge)
export const TOUR_TOP64 = [
  ['Luke Littler', 'ENG', 20, 102.5], ['Luke Humphries', 'ENG', 32, 100], ['Gian van Veen', 'NL', 25, 99],
  ['Michael van Gerwen', 'NL', 37, 98], ['Jonny Clayton', 'WAL', 52, 96], ['Gary Anderson', 'SCO', 56, 96],
  ['Stephen Bunting', 'ENG', 41, 97], ['Ryan Searle', 'ENG', 39, 96], ['Josh Rock', 'NIR', 25, 97],
  ['Danny Noppert', 'NL', 36, 95], ['James Wade', 'ENG', 43, 94], ['Gerwyn Price', 'WAL', 41, 97],
  ['Chris Dobey', 'ENG', 36, 95], ['Nathan Aspinall', 'ENG', 35, 95], ['Martin Schindler', 'DE', 30, 95],
  ['Ross Smith', 'ENG', 37, 94], ['Damon Heta', 'AU', 39, 95], ['Jermaine Wattimena', 'NL', 38, 93],
  ['Mike De Decker', 'BE', 31, 94], ['Rob Cross', 'ENG', 36, 95], ['Luke Woodhouse', 'ENG', 38, 94],
  ['Dave Chisnall', 'ENG', 46, 94], ['Daryl Gurney', 'NIR', 40, 92], ['Ryan Joyce', 'ENG', 41, 92],
  ['Dimitri Van den Bergh', 'BE', 32, 93], ['Cameron Menzies', 'SCO', 37, 93], ['Ritchie Edhouse', 'ENG', 43, 92],
  ['Krzysztof Ratajski', 'PL', 49, 93], ['Wessel Nijman', 'NL', 26, 96], ['Dirk van Duijvenbode', 'NL', 34, 94],
  ['Peter Wright', 'SCO', 56, 93], ['Michael Smith', 'ENG', 36, 93], ['Andrew Gilding', 'ENG', 56, 91],
  ['Ricardo Pietreczko', 'DE', 32, 93], ['Joe Cullen', 'ENG', 37, 93], ['Raymond van Barneveld', 'NL', 59, 92],
  ['Martin Lukeman', 'ENG', 41, 92], ['Kevin Doets', 'NL', 28, 92], ['Callan Rydz', 'ENG', 28, 94],
  ['Ricky Evans', 'ENG', 36, 90], ['Brendan Dolan', 'NIR', 53, 91], ['Niels Zonneveld', 'NL', 28, 91],
  ['William O\'Connor', 'IRL', 40, 91], ['Scott Williams', 'ENG', 36, 92], ['Madars Razma', 'LV', 38, 92],
  ['Gabriel Clemens', 'DE', 43, 92], ['James Hurrell', 'ENG', 29, 91], ['Connor Scutt', 'ENG', 31, 90],
  ['Justin Hood', 'ENG', 33, 91], ['Jeffrey de Graaf', 'SE', 36, 91], ['Ian White', 'ENG', 56, 90],
  ['Alan Soutar', 'SCO', 48, 89], ['Niko Springer', 'DE', 26, 92], ['Mensur Suljović', 'AT', 54, 90],
  ['Ryan Meikle', 'ENG', 30, 91], ['Richard Veenstra', 'NL', 45, 89], ['Keane Barry', 'IRL', 24, 92],
  ['Nick Kenny', 'WAL', 33, 90], ['Kim Huybrechts', 'BE', 41, 91], ['Thibault Tricole', 'FR', 36, 90],
  ['Lukas Wenig', 'DE', 30, 89], ['Robert Owen', 'WAL', 43, 89], ['Mario Vandenbogaerde', 'BE', 34, 89],
];

// b) Plätze 65–95: Karte läuft Ende 2026 aus (nur Top 64 der OOM behalten sie) → starten in der Q-School
export const TOUR_EXPIRING = [
  ['Karel Sedláček', 'CZ', 47, 90], ['Bradley Brooks', 'ENG', 23, 89], ['Cam Crabtree', 'ENG', 22, 88],
  ['Wesley Plaisier', 'NL', 36, 90], ['Sebastian Białecki', 'PL', 22, 90], ['Max Hopp', 'DE', 30, 89],
  ['Adam Lipscombe', 'ENG', 32, 88], ['Dominik Grüllich', 'DE', 21, 87], ['Cor Dekker', 'NL', 27, 89],
  ['Maik Kuivenhoven', 'NL', 38, 87], ['Andy Boulton', 'ENG', 40, 87], ['Tavis Dudeney', 'ENG', 22, 87],
  ['Oskar Lukasiak', 'PL', 24, 88], ['Darryl Pilgrim', 'ENG', 38, 87], ['Tom Bissell', 'ENG', 34, 88],
  ['Christian Kist', 'NL', 40, 89], ['Leon Weber', 'DE', 22, 88], ['Dennie Olde Kalter', 'NL', 25, 87],
  ['Jim Long', 'CA', 41, 88], ['Thomas Lovely', 'ENG', 33, 87], ['Marvin van Velzen', 'NL', 26, 87],
  ['Viktor Tingström', 'SE', 30, 87], ['Adam Warner', 'ENG', 34, 87], ['Greg Ritchie', 'ENG', 40, 87],
  ['Adam Paxton', 'ENG', 30, 87], ['Maximilian Czerwinski', 'DE', 25, 87], ['Tytus Kanik', 'PL', 20, 87],
  ['Stefaan Henderyck', 'BE', 45, 87], ['Rusty-Jake Rodriguez', 'AT', 28, 88], ['Pero Ljubić', 'AT', 41, 87],
  ['Kai Gotthardt', 'DE', 24, 89],
];

// c) Plätze 96–128: neu 2026 (Q-School 2026, Challenge-/Dev-Tour 2025) → Karte gültig bis Ende 2027
export const TOUR_NEW_2026 = [
  ['Stefan Bellmont', 'CH', 30, 89], ['Darius Labanauskas', 'LT', 50, 88], ['Beau Greaves', 'ENG', 22, 92],
  ['Owen Bates', 'ENG', 23, 89], ['Arno Merk', 'DE', 35, 87], ['Filip Bereza', 'PL', 25, 88],
  ['Rhys Griffin', 'WAL', 27, 89], ['Adam Leek', 'ENG', 30, 88], ['Jeffrey Sparidaans', 'NL', 26, 88],
  ['Cristo Reyes', 'ES', 49, 88], ['Carl Sneyd', 'ENG', 30, 88], ['Niall Culleton', 'IRL', 42, 88],
  ['Matthias Ehlers', 'DE', 30, 87], ['Yorick Hofkens', 'BE', 23, 88], ['Tom Sykes', 'ENG', 28, 88],
  ['Shane McGuirk', 'IRL', 35, 88], ['Jeffrey de Zwaan', 'NL', 30, 89], ['Sietse Lap', 'NL', 28, 87],
  ['Charlie Manby', 'ENG', 21, 90], ['Samuel Price', 'ENG', 25, 88], ['Jimmy van Schie', 'NL', 36, 88],
  ['Chris Landman', 'NL', 38, 88], ['Marvin Kraft', 'DE', 25, 88], ['Benjamin Pratnemer', 'SI', 35, 88],
  ['Adam Gawlas', 'CZ', 22, 89], ['Jurjen van der Velde', 'NL', 22, 90], ['Alexander Merkx', 'NL', 24, 88],
  ['Pascal Rupprecht', 'DE', 26, 88], ['Stephen Burton', 'ENG', 40, 88], ['Mervyn King', 'ENG', 61, 88],
  ['Tyler Thorpe', 'ENG', 21, 88], ['Stephen Rosney', 'SCO', 38, 87], ['David Sharp', 'ENG', 35, 87],
];

export const TOUR_PLAYERS = [...TOUR_TOP64, ...TOUR_EXPIRING, ...TOUR_NEW_2026];

// --- 50 Challenge-Tour-Spieler (ohne Tourcard, ~82–92) ---
export const CHALLENGE_PLAYERS = [
  ['José de Sousa', 'PT', 53, 89], ['Matt Campbell', 'CA', 44, 88], ['Jim Williams', 'WAL', 43, 90],
  ['Thijs Hoogland', 'NL', 34, 87], ['Jelle Klaasen', 'NL', 43, 87], ['Steve Lennon', 'IRL', 33, 88],
  ['Andreas Harrysson', 'SE', 28, 88], ['Joe Hunt', 'ENG', 30, 88], ['Fallon Sherrock', 'ENG', 32, 85],
  ['Steve Beaton', 'ENG', 63, 85], ['Jamie Hughes', 'ENG', 41, 86], ['Kevin Burness', 'NIR', 42, 86],
  ['Ron Meulenkamp', 'NL', 38, 86], ['Boris Krčmar', 'HR', 47, 86], ['Berry van Peer', 'NL', 30, 86],
  ['Geert Nentjes', 'NL', 37, 86], ['Danny van Trijp', 'NL', 30, 86], ['Ruud Jansen', 'NL', 38, 85],
  ['Dragutin Horvat', 'DE', 49, 86], ['Steffen Siepmann', 'DE', 39, 85], ['Nico Kurz', 'DE', 29, 86],
  ['Michael Unterbuchner', 'DE', 37, 86], ['Daniel Klose', 'DE', 40, 85], ['Kevin Münch', 'DE', 38, 86],
  ['Scott Waites', 'ENG', 49, 85], ['Darren Webster', 'ENG', 58, 85], ['Steve West', 'ENG', 47, 85],
  ['John Henderson', 'SCO', 52, 85], ['Kirk Shepherd', 'ENG', 40, 85], ['Jamie Clark', 'SCO', 33, 85],
  ['Marcel Brandt', 'DE', 31, 85], ['Jarred Cole', 'ENG', 34, 86], ['Callum Loose', 'ENG', 28, 86],
  ['Joe Davis', 'ENG', 33, 86], ['Brett Claydon', 'ENG', 37, 85], ['Harry Ward', 'ENG', 26, 85],
  ['Shaun Wilkinson', 'ENG', 33, 85], ['Jack Main', 'ENG', 26, 86], ['Ronny Huybrechts', 'BE', 61, 84],
  ['Kenny Neyens', 'BE', 31, 85], ['Robert Marijanović', 'DE', 40, 85], ['Martijn Kleermaker', 'NL', 36, 86],
  ['Vincent van der Voort', 'NL', 51, 85], ['Ryan Hogarth', 'SCO', 30, 85], ['Patrick Geeraets', 'BE', 31, 84],
  ['Jim McEwan', 'SCO', 40, 84], ['Gavin Carlin', 'IRL', 41, 85], ['Lisa Ashton', 'ENG', 56, 84],
  ['Gordon Mathers', 'AU', 54, 84], ['Krzysztof Kciuk', 'PL', 36, 84],
];

// --- Development Tour (bis 23 Jahre): Nutzerliste Dev-OOM 2025 ---
// Stärke aus Platzierung: „sehr gut“ (1–32) ≈ 85–90 Ø, „gut“ (33–50) ≈ 82–85, „ok“ (51–75) ≈ 78–82, „schlecht“ (285+) ≈ 72–76.
// Spieler mit Tourcard (Białecki, Crabtree, Weber, Manby …) stehen in den Tour-Listen und spielen als
// Holder außerhalb der Top 64 zusätzlich die Dev Tour. Nationen und Alter geschätzt.
export const DEV_PLAYERS = [
  ['Jack Drayton', 'ENG', 22, 89.8], ['James Beeton', 'ENG', 21, 89.2], ['Jamai van den Herik', 'NL', 19, 89.0],
  ['Angelo Balsamo', 'ENG', 23, 88.2], ['Nathan Potter', 'ENG', 21, 88.1], ['Lenny Schlueter', 'DE', 20, 87.4],
  ['Henry Coates', 'ENG', 18, 87.3], ['David Fidler', 'ENG', 23, 87.1], ['Sam Jackson', 'ENG', 21, 87.0],
  ['Florian Preis', 'DE', 19, 86.8], ['Finn Behrens', 'DE', 22, 86.5], ['Ben Townley', 'ENG', 20, 86.3],
  ['Mylo Michiels', 'BE', 23, 86.0], ['Kaya Baysal', 'DE', 21, 85.8], ['Lewis Cook', 'ENG', 19, 85.7],
  ['Ieuan Halsall', 'WAL', 17, 85.5], ['Keenan Thomas', 'WAL', 18, 85.0], ['Peter Kelemen', 'HU', 23, 84.9],
  ['Charlie Stocks', 'ENG', 21, 84.7], ['Jan Schmidt', 'DE', 19, 84.6], ['James Buckby', 'ENG', 17, 84.4],
  ['Connor Hopkins', 'ENG', 22, 84.2], ['Jenson Remory', 'ENG', 20, 84.1], ['Sean McKeon', 'IRL', 18, 83.9],
  ['Jarod Becker', 'DE', 23, 83.8], ['Jack Pollard', 'ENG', 21, 83.6], ['Nunjo Dewaele', 'BE', 19, 83.4],
  ['Harrison Leigh', 'ENG', 17, 83.3], ['Ciaran Forde', 'IRL', 20, 83.0], ['Cole Davey', 'ENG', 18, 82.8],
  ['Ryan Branley', 'NIR', 23, 82.6], ['Kimi Seemann', 'DE', 21, 82.5], ['Kai Clark', 'ENG', 19, 82.3],
  ['Shane de Jong', 'NL', 17, 82.2], ['JJ Wright', 'ENG', 22, 82.0], ['Martin Homola', 'CZ', 18, 81.7],
  ['Dylan Quinn', 'IRL', 23, 81.5], ['Liam Maendl-Lawrance', 'ENG', 21, 81.4], ['Milan Biro', 'HU', 19, 81.2],
  ['Matthias Moors', 'BE', 17, 81.0], ['Dean Fitch Jnr', 'ENG', 22, 80.9], ['Xanti Van den Bergh', 'BE', 20, 80.7],
  ['Bram van Dijk', 'NL', 18, 80.6], ['Oliver Pearce-Burgess', 'ENG', 23, 80.4], ['Nathan Care', 'ENG', 21, 80.2],
  ['Kilian Hohnstedt', 'DE', 17, 79.9], ['Joseph Brady', 'IRL', 22, 79.8], ['Lewis Mayes', 'ENG', 20, 79.6],
  ['Sebastian Caris', 'BE', 18, 79.4], ['Cody Crabtree', 'ENG', 23, 79.3], ['Mark Tabak', 'NL', 21, 79.1],
  ['Daan Beernink', 'NL', 19, 79.0], ['Cayden Smith', 'ENG', 17, 78.8], ['Ansh Sood', 'ENG', 22, 78.6],
  ['Lleyton Molyneux', 'ENG', 20, 78.5], ['Luca Wolff', 'DE', 18, 78.3], ['Barry Watson', 'ENG', 23, 78.2],
  ['Liam Vanhove', 'BE', 21, 76.0], ['Josef Howlett', 'ENG', 19, 75.9], ['Nicolas Lauwereins', 'BE', 17, 75.9],
  ['Cori Wiltshire', 'ENG', 22, 75.9], ['Lee Bradshaw', 'ENG', 20, 75.5], ['Emile Hendryks', 'BE', 18, 75.5],
  ['Jack Lilley', 'ENG', 23, 75.5], ['Scott Wyatt', 'ENG', 21, 75.5], ['Hayden Ball', 'ENG', 19, 75.0],
  ['Matej Cverha', 'CZ', 17, 75.0], ['Ben Dixon', 'ENG', 22, 75.0], ['Karl Robinson', 'ENG', 20, 75.0],
  ['Francesco Basili', 'IT', 18, 74.4], ['Lucas Bates', 'ENG', 23, 74.4], ['Lewis Parker', 'ENG', 21, 74.4],
  ['Mirko Paro', 'IT', 19, 74.4], ['Nathan Barr', 'ENG', 17, 73.9], ['Bradley Canning', 'ENG', 22, 73.9],
  ['Harvey Lawrence', 'ENG', 20, 73.9], ['Nathan Park', 'ENG', 18, 73.9], ['Callum Roach', 'ENG', 23, 73.9],
  ['Alfie Fisken', 'ENG', 21, 73.3], ['Garin Perkins', 'ENG', 19, 73.3], ['Ben Robinson', 'ENG', 17, 73.3],
  ['Alfie Cox', 'ENG', 22, 72.9], ['Harrison Kershaw', 'ENG', 20, 72.9], ['Toby Saunders', 'ENG', 18, 72.9],
  ['Ben Stanton', 'ENG', 23, 72.9], ['Philip Want', 'ENG', 21, 72.9], ['Finley Bennett', 'ENG', 19, 72.2],
  ['Alfie Busby', 'ENG', 17, 72.2], ['Oliver Clarke', 'ENG', 22, 72.2], ['Jory Scheldeman', 'BE', 20, 72.2],
  ['Joshua Wyer Powell', 'ENG', 18, 72.2],
  ['Dylan Slevin', 'IRL', 23, 87.8], ['Archie Self', 'ENG', 22, 87.6], ['Jenson Walker', 'ENG', 20, 86.6],
  ['Thomas Banks', 'ENG', 21, 85.4], ['Owen Roelofs', 'NL', 20, 83.1], ['Lewy Williams', 'WAL', 22, 81.8],
  ['Nathan Girvan', 'SCO', 19, 80.1],
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
