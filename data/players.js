// Spielerdaten (Stand: Saison 2026, Karriere startet Januar 2027).
// Format je Zeile: [Name, Nation, Alter im Jan. 2027, 3-Dart-Average (Spielstärke)]
// Namen/Werte einfach hier korrigieren – das Format bleibt gleich. Unsichere Angaben: siehe STATUS.md.
// Nur private Nutzung (echte Namen ohne Lizenz).

// --- Tourcard-Holder 2026 (128) ---
// a) Top 64 der PDC Order of Merit (Reihenfolge laut Nutzerliste) → Karte Ende 2026 um 1 Jahr verlängert (bis 2027)
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
  ['Michael Mansell', 'NIR', 33, 90],  ['Gabriel Clemens', 'DE', 43, 92], ['James Hurrell', 'ENG', 29, 91], ['Connor Scutt', 'ENG', 31, 90],
  ['Justin Hood', 'ENG', 33, 91], ['Jeffrey de Graaf', 'SE', 36, 91], ['Ian White', 'ENG', 56, 90],
  ['Alan Soutar', 'SCO', 48, 89], ['Niko Springer', 'DE', 26, 92], ['Mensur Suljović', 'AT', 54, 90],
  ['Ryan Meikle', 'ENG', 30, 91], ['Richard Veenstra', 'NL', 45, 89], ['Keane Barry', 'IRL', 24, 92],
  ['Nick Kenny', 'WAL', 33, 90], ['Kim Huybrechts', 'BE', 41, 91], ['Thibault Tricole', 'FR', 36, 90],
  ['Lukas Wenig', 'DE', 30, 89], ['Robert Owen', 'WAL', 43, 89], ['Mario Vandenbogaerde', 'BE', 34, 89],
];

// b) Zweites Kartenjahr 2026 (Karte 2025/2026), nicht in den Top 64 → Karte läuft aus → starten in der Q-School
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

// c) Neu 2026 (Q-School 2026: 13 UK + 16 EU, Challenge-/Dev-Tour 2025: Bellmont, Labanauskas, Greaves, Bates) → Karte 2026/2027
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

// Q-School-2026-Gewinner UK (Rest von c ohne CT/Dev 2025 = EU)
export const QSCHOOL_UK_2026 = ['Rhys Griffin', 'Adam Leek', 'Carl Sneyd', 'Niall Culleton', 'Tom Sykes', 'Shane McGuirk', 'Charlie Manby',
  'Samuel Price', 'Stephen Burton', 'Mervyn King', 'Tyler Thorpe', 'Stephen Rosney', 'David Sharp'];
export const TOUR_PLAYERS = [...TOUR_TOP64, ...TOUR_EXPIRING, ...TOUR_NEW_2026];

// --- Challenge Tour (nur ohne Tourcard): Nutzerliste CT-OOM, Plätze 1–75 ---
// Stärke aus Platzierung: 91 Ø − 0,14 je Platz (75 → 80,6). Dev-Spieler auf der Liste stehen nur in DEV_PLAYERS
// (spielen ohnehin CT mit; Average = max(Dev, CT)). Danach 30 fiktive Europäer (~66–72 Ø) als Kanonenfutter.
export const CHALLENGE_PLAYERS = [
  ['Joe Hunt', 'ENG', 30, 91.0], ['Derek Coulson', 'ENG', 33, 90.9], ['Tommy Morris', 'ENG', 25, 90.7],
  ['Daniel Klose', 'DE', 40, 90.6], ['Tommy Lishman', 'ENG', 30, 90.3], ['Jack Aldridge', 'ENG', 28, 90.2],
  ['Jack Tweddell', 'ENG', 27, 90.0], ['Daniel Ayres', 'ENG', 35, 89.9], ['Aden Kirk', 'ENG', 24, 89.7],
  ['Harry Ward', 'ENG', 26, 89.6], ['Steve Lennon', 'IRL', 33, 89.5], ['Patrik Williams', 'ENG', 31, 89.2],
  ['Martijn Dragt', 'NL', 30, 88.9], ['Christopher Wickenden', 'ENG', 35, 88.8], ['Ted Evetts', 'ENG', 29, 88.6],
  ['Kevin Burness', 'NIR', 42, 88.5], ['Scott Waites', 'ENG', 49, 88.3], ['Michele Turetta', 'IT', 34, 88.2],
  ['Lewis Pride', 'ENG', 30, 88.1], ['David Davies', 'WAL', 32, 87.9], ['Gilbert van der Meijden', 'NL', 35, 87.8],
  ['Radek Szaganski', 'PL', 37, 87.5], ['Stef Kosters', 'NL', 30, 87.4], ['Levy Frauenfelder', 'CH', 28, 87.2],
  ['Oliver Mitchell', 'ENG', 27, 86.9], ['Dan Hands', 'ENG', 30, 86.8], ['David Evans', 'WAL', 34, 86.5],
  ['Ashley Coleman', 'ENG', 36, 86.4], ['Callum Francis', 'ENG', 28, 86.2], ['Danny Trueman', 'ENG', 30, 86.0],
  ['Patrick Geeraets', 'BE', 31, 85.7], ['John Henderson', 'SCO', 52, 85.4], ['Alan Norris', 'ENG', 53, 85.3],
  ['Callum Goffin', 'ENG', 30, 85.1], ['Robbie Martin', 'ENG', 33, 85.0], ['Jamie Kay', 'ENG', 30, 84.8],
  ['James Howard Hughes', 'ENG', 31, 84.7], ['Jake Jones', 'ENG', 29, 84.4], ['Paul Rowley', 'ENG', 36, 84.3],
  ['Andy Hamilton', 'ENG', 58, 84.1], ['Michael Unterbuchner', 'DE', 37, 84.0], ['Jack Main', 'ENG', 26, 83.9],
  ['Andy Courtney', 'ENG', 35, 83.7], ['Scott Campbell', 'SCO', 30, 83.6], ['Steve Beaton', 'ENG', 63, 83.3],
  ['Ricardo Ulrich', 'DE', 30, 83.2], ['Carl Wilson', 'ENG', 40, 83.0], ['Geoffrey Murray', 'SCO', 35, 82.7],
  ['Jamie Hughes', 'ENG', 41, 82.6], ['Jake Eichen', 'DE', 28, 82.5], ['Graham Usher', 'ENG', 50, 82.3],
  ['Nicolas Thuillier', 'FR', 33, 82.2], ['Patrick Tringler', 'AT', 32, 82.0], ['Jose Justicia', 'ES', 49, 81.9],
  ['Danny Goddard', 'ENG', 30, 81.8], ['Michael Flynn', 'ENG', 36, 81.6], ['Arron Monk', 'ENG', 40, 81.5],
  ['Simon Stevenson', 'ENG', 45, 81.2], ['Steve Hine', 'ENG', 40, 81.1], ['Keegan Brown', 'ENG', 34, 80.9],
  ['Ashton Brown', 'ENG', 25, 80.8], ['Ron Meulenkamp', 'NL', 38, 80.6], ['Pierre Lavigne', 'FR', 41, 72.0],
  ['Mathis Garnier', 'FR', 29, 71.8], ['Álvaro Ibáñez', 'ES', 36, 71.6], ['Sergio Domínguez', 'ES', 44, 71.4],
  ['Luca Ferraro', 'IT', 38, 71.2], ['Davide Colombo', 'IT', 27, 71.0], ['Rui Carvalho', 'PT', 42, 70.8],
  ['Tiago Mendes', 'PT', 31, 70.6], ['Piotr Wróbel', 'PL', 35, 70.4], ['Tomasz Zieliński', 'PL', 46, 70.2],
  ['Ondřej Kučera', 'CZ', 33, 70.0], ['Lukáš Beneš', 'CZ', 28, 69.8], ['Gergő Varga', 'HU', 39, 69.6],
  ['Dávid Kiss', 'HU', 30, 69.4], ['Mārtiņš Kalniņš', 'LV', 37, 69.2], ['Mindaugas Petrauskas', 'LT', 43, 69.0],
  ['Rasmus Holm', 'DK', 34, 68.8], ['Magnus Eriksson', 'SE', 48, 68.6], ['Henrik Solberg', 'NO', 40, 68.4],
  ['Jussi Lehtonen', 'FI', 45, 68.2], ['Nikos Papadakis', 'GR', 38, 68.0], ['Ivan Kovačević', 'HR', 32, 67.8],
  ['Matej Novak', 'SI', 29, 67.6], ['Florian Steiner', 'AT', 44, 67.4], ['Reto Ammann', 'CH', 51, 67.2],
  ['Dirk Vermeulen', 'BE', 47, 67.0], ['Kees Brouwer', 'NL', 52, 66.8], ['Uwe Hartmann', 'DE', 55, 66.6],
  ['Sven Kowalski', 'DE', 33, 66.4], ['Gary Pickering', 'ENG', 49, 66.2],
];

// --- Development Tour (bis 23 Jahre): Nutzerliste Dev-OOM 2025 ---
// Stärke aus Platzierung, Dev-Niveau 4 Ø unter der Challenge Tour: „sehr gut“ (1–32) ≈ 81–86 Ø, „gut“ (33–50) ≈ 78–81,
// „ok“ (51–75) ≈ 74–78, „schlecht“ (285+) ≈ 68–72. Ausnahme: 13 Spieler, die auch auf der CT-Liste stehen (CT-Niveau).
// Spieler mit Tourcard (Białecki, Crabtree, Weber, Manby …) stehen in den Tour-Listen und spielen als
// Holder außerhalb der Top 64 zusätzlich die Dev Tour. Nationen und Alter geschätzt.
// Dev-Spieler, die auch auf der Challenge-Liste stehen → behalten CT-Niveau
export const DEV_AT_CT_LEVEL = ['Archie Self', 'Henry Coates', 'Nathan Potter', 'James Beeton', 'Florian Preis', 'Dylan Slevin', 'Ben Townley',
  'Harrison Leigh', 'Sam Jackson', 'Jenson Walker', 'Jenson Remory', 'Jamai van den Herik', 'Cayden Smith'];
export const DEV_PLAYERS = [
  ['Jack Drayton', 'ENG', 22, 85.8], ['James Beeton', 'ENG', 21, 89.2], ['Jamai van den Herik', 'NL', 19, 89.0],
  ['Angelo Balsamo', 'ENG', 23, 84.2], ['Nathan Potter', 'ENG', 21, 89.0], ['Lenny Schlueter', 'DE', 20, 83.4],
  ['Henry Coates', 'ENG', 18, 89.3], ['David Fidler', 'ENG', 23, 83.1], ['Sam Jackson', 'ENG', 21, 87.0],
  ['Florian Preis', 'DE', 19, 87.1], ['Finn Behrens', 'DE', 22, 82.5], ['Ben Townley', 'ENG', 20, 86.3],
  ['Mylo Michiels', 'BE', 23, 82.0], ['Kaya Baysal', 'DE', 21, 81.8], ['Lewis Cook', 'ENG', 19, 81.7],
  ['Ieuan Halsall', 'WAL', 17, 81.5], ['Keenan Thomas', 'WAL', 18, 81.0], ['Peter Kelemen', 'HU', 23, 80.9],
  ['Charlie Stocks', 'ENG', 21, 80.7], ['Jan Schmidt', 'DE', 19, 80.6], ['James Buckby', 'ENG', 17, 80.4],
  ['Connor Hopkins', 'ENG', 22, 80.2], ['Jenson Remory', 'ENG', 20, 84.1], ['Sean McKeon', 'IRL', 18, 79.9],
  ['Jarod Becker', 'DE', 23, 79.8], ['Jack Pollard', 'ENG', 21, 79.6], ['Nunjo Dewaele', 'BE', 19, 79.4],
  ['Harrison Leigh', 'ENG', 17, 85.8], ['Ciaran Forde', 'IRL', 20, 79.0], ['Cole Davey', 'ENG', 18, 78.8],
  ['Ryan Branley', 'NIR', 23, 78.6], ['Kimi Seemann', 'DE', 21, 78.5], ['Kai Clark', 'ENG', 19, 78.3],
  ['Shane de Jong', 'NL', 17, 78.2], ['JJ Wright', 'ENG', 22, 78.0], ['Martin Homola', 'CZ', 18, 77.7],
  ['Dylan Quinn', 'IRL', 23, 77.5], ['Liam Maendl-Lawrance', 'ENG', 21, 77.4], ['Milan Biro', 'HU', 19, 77.2],
  ['Matthias Moors', 'BE', 17, 77.0], ['Dean Fitch Jnr', 'ENG', 22, 76.9], ['Xanti Van den Bergh', 'BE', 20, 76.7],
  ['Bram van Dijk', 'NL', 18, 76.6], ['Oliver Pearce-Burgess', 'ENG', 23, 76.4], ['Nathan Care', 'ENG', 21, 76.2],
  ['Kilian Hohnstedt', 'DE', 17, 75.9], ['Joseph Brady', 'IRL', 22, 75.8], ['Lewis Mayes', 'ENG', 20, 75.6],
  ['Sebastian Caris', 'BE', 18, 75.4], ['Cody Crabtree', 'ENG', 23, 75.3], ['Mark Tabak', 'NL', 21, 75.1],
  ['Daan Beernink', 'NL', 19, 75.0], ['Cayden Smith', 'ENG', 17, 81.3], ['Ansh Sood', 'ENG', 22, 74.6],
  ['Lleyton Molyneux', 'ENG', 20, 74.5], ['Luca Wolff', 'DE', 18, 74.3], ['Barry Watson', 'ENG', 23, 74.2],
  ['Liam Vanhove', 'BE', 21, 72.0], ['Josef Howlett', 'ENG', 19, 71.9], ['Nicolas Lauwereins', 'BE', 17, 71.9],
  ['Cori Wiltshire', 'ENG', 22, 71.9], ['Lee Bradshaw', 'ENG', 20, 71.5], ['Emile Hendryks', 'BE', 18, 71.5],
  ['Jack Lilley', 'ENG', 23, 71.5], ['Scott Wyatt', 'ENG', 21, 71.5], ['Hayden Ball', 'ENG', 19, 71.0],
  ['Matej Cverha', 'CZ', 17, 71.0], ['Ben Dixon', 'ENG', 22, 71.0], ['Karl Robinson', 'ENG', 20, 71.0],
  ['Francesco Basili', 'IT', 18, 70.4], ['Lucas Bates', 'ENG', 23, 70.4], ['Lewis Parker', 'ENG', 21, 70.4],
  ['Mirko Paro', 'IT', 19, 70.4], ['Nathan Barr', 'ENG', 17, 69.9], ['Bradley Canning', 'ENG', 22, 69.9],
  ['Harvey Lawrence', 'ENG', 20, 69.9], ['Nathan Park', 'ENG', 18, 69.9], ['Callum Roach', 'ENG', 23, 69.9],
  ['Alfie Fisken', 'ENG', 21, 69.3], ['Garin Perkins', 'ENG', 19, 69.3], ['Ben Robinson', 'ENG', 17, 69.3],
  ['Alfie Cox', 'ENG', 22, 68.9], ['Harrison Kershaw', 'ENG', 20, 68.9], ['Toby Saunders', 'ENG', 18, 68.9],
  ['Ben Stanton', 'ENG', 23, 68.9], ['Philip Want', 'ENG', 21, 68.9], ['Finley Bennett', 'ENG', 19, 68.2],
  ['Alfie Busby', 'ENG', 17, 68.2], ['Oliver Clarke', 'ENG', 22, 68.2], ['Jory Scheldeman', 'BE', 20, 68.2],
  ['Joshua Wyer Powell', 'ENG', 18, 68.2], ['Dylan Slevin', 'IRL', 23, 87.8], ['Archie Self', 'ENG', 22, 90.4],
  ['Jenson Walker', 'ENG', 20, 86.6], ['Thomas Banks', 'ENG', 21, 81.4], ['Owen Roelofs', 'NL', 20, 79.1],
  ['Lewy Williams', 'WAL', 22, 77.8], ['Nathan Girvan', 'SCO', 19, 76.1],
];

// --- 50 fiktive deutsche Amateure für lokale Turniere (Listenwert ~60–80, im Spiel − LOCAL_SHIFT) ---
export const LOCAL_PLAYERS = [
  ['Kevin Brandt', 'DE', 27, 68], ['Sven Kowalski', 'DE', 34, 72], ['Marco Lindner', 'DE', 41, 65],
  ['Dennis Haas', 'DE', 29, 74], ['Tobias Wendt', 'DE', 23, 63], ['Rüdiger Pohl', 'DE', 55, 61],
  ['Jens Albrecht', 'DE', 38, 70], ['Patrick Seidel', 'DE', 31, 77], ['Uwe Krämer', 'DE', 49, 66],
  ['Nico Busch', 'DE', 21, 62], ['Andreas Vogt', 'DE', 44, 71], ['Daniel Ostermann', 'DE', 36, 79],
  ['Heiko Brückner', 'DE', 52, 64], ['Lars Engel', 'DE', 26, 69], ['Michael Sauer', 'DE', 47, 73],
  ['Stefan Riedel', 'DE', 39, 67], ['Timo Gerber', 'DE', 24, 75], ['Frank Ziegler', 'DE', 58, 60],
  ['Christian Böhm', 'DE', 33, 76], ['Mario Kuhn', 'DE', 30, 65], ['Ralf Neumann', 'DE', 46, 70],
  ['Florian Brandl', 'DE', 28, 72], ['Lukas Hoffmann', 'DE', 22, 64], ['Bernd Meier', 'DE', 43, 66],
  ['Jan Kröger', 'DE', 35, 78], ['Sebastian Vogel', 'DE', 27, 74], ['Rolf Müller', 'DE', 50, 68],
  ['Peter Klaas', 'DE', 37, 71], ['Werner Peters', 'DE', 25, 66], ['Gerd Holtmann', 'DE', 45, 75],
  ['Dieter Fuchs', 'DE', 32, 73], ['Lennart Barth', 'DE', 40, 69], ['Christoph Pieper', 'DE', 29, 80],
  ['Steffen Lüdtke', 'DE', 48, 67], ['Rainer Morgenstern', 'DE', 34, 70], ['Konrad Döhler', 'DE', 26, 68],
  ['Thomas Nowak', 'DE', 31, 72], ['Paul Dorn', 'DE', 39, 65], ['Mike Lunde', 'DE', 42, 63],
  ['Jörg Holm', 'DE', 36, 67], ['Kai Petersen', 'DE', 28, 71], ['Oliver Franke', 'DE', 35, 62],
  ['Marcel Schuster', 'DE', 22, 66], ['Björn Hartmann', 'DE', 44, 74], ['Sascha Winkler', 'DE', 37, 69],
  ['Dirk Lehmann', 'DE', 53, 63], ['René Kaiser', 'DE', 30, 78], ['Thorsten Beck', 'DE', 48, 61],
  ['Enrico Stein', 'DE', 25, 70], ['Philipp Roth', 'DE', 20, 64],
];
