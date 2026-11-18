// Spielerdaten (Stand: Saison 2026, Karriere startet Januar 2027).
// Format je Zeile: [Name, Nation, Alter im Jan. 2027, 3-Dart-Average (Spielstärke)]
// Namen/Werte einfach hier korrigieren – das Format bleibt gleich. Unsichere Angaben: siehe STATUS.md.
// Nur private Nutzung (echte Namen ohne Lizenz).

// --- Tourcard-Holder 2026 (128) ---
// a) Top 64 der PDC Order of Merit (Reihenfolge laut Nutzerliste) → Karte Ende 2026 um 1 Jahr verlängert (bis 2027)
export const TOUR_TOP64 = [
  ['Luke Littler', 'ENG', 19, 102.5], ['Luke Humphries', 'ENG', 31, 100], ['Gian van Veen', 'NL', 24, 99],
  ['Michael van Gerwen', 'NL', 37, 98], ['Jonny Clayton', 'WAL', 52, 96], ['Gary Anderson', 'SCO', 56, 96],
  ['Stephen Bunting', 'ENG', 41, 97], ['Ryan Searle', 'ENG', 39, 96], ['Josh Rock', 'NIR', 25, 97],
  ['Danny Noppert', 'NL', 36, 95], ['James Wade', 'ENG', 43, 94], ['Gerwyn Price', 'WAL', 41, 97],
  ['Chris Dobey', 'ENG', 36, 95], ['Nathan Aspinall', 'ENG', 35, 95], ['Martin Schindler', 'DE', 30, 95],
  ['Ross Smith', 'ENG', 37, 94], ['Damon Heta', 'AU', 39, 95], ['Jermaine Wattimena', 'NL', 38, 93],
  ['Mike De Decker', 'BE', 31, 94], ['Rob Cross', 'ENG', 36, 95], ['Luke Woodhouse', 'ENG', 38, 94],
  ['Dave Chisnall', 'ENG', 46, 94], ['Daryl Gurney', 'NIR', 40, 92], ['Ryan Joyce', 'ENG', 41, 92],
  ['Dimitri van den Bergh', 'BE', 32, 93], ['Cameron Menzies', 'SCO', 37, 93], ['Ritchie Edhouse', 'ENG', 43, 92],
  ['Krzysztof Ratajski', 'PL', 50, 93], ['Wessel Nijman', 'NL', 26, 96], ['Dirk van Duijvenbode', 'NL', 34, 94],
  ['Peter Wright', 'SCO', 56, 93], ['Michael Smith', 'ENG', 36, 93], ['Andrew Gilding', 'ENG', 56, 91],
  ['Ricardo Pietreczko', 'DE', 32, 93], ['Joe Cullen', 'ENG', 37, 93], ['Raymond van Barneveld', 'NL', 59, 92],
  ['Martin Lukeman', 'ENG', 41, 92], ['Kevin Doets', 'NL', 28, 92], ['Callan Rydz', 'ENG', 28, 94],
  ['Ricky Evans', 'ENG', 36, 90], ['Brendan Dolan', 'NIR', 53, 91], ['Niels Zonneveld', 'NL', 28, 91],
  ['William O\'Connor', 'IRL', 40, 91], ['Scott Williams', 'ENG', 36, 92], ['Madars Razma', 'LV', 38, 92],
  ['Mickey Mansell', 'NIR', 53, 90],  ['Gabriel Clemens', 'DE', 43, 92], ['James Hurrell', 'ENG', 42, 91], ['Connor Scutt', 'ENG', 30, 90],
  ['Justin Hood', 'ENG', 33, 91], ['Jeffrey de Graaf', 'SE', 36, 91], ['Ian White', 'ENG', 56, 90],
  ['Alan Soutar', 'SCO', 48, 89], ['Niko Springer', 'DE', 26, 92], ['Mensur Suljović', 'AT', 54, 90],
  ['Ryan Meikle', 'ENG', 30, 91], ['Richard Veenstra', 'NL', 45, 89], ['Keane Barry', 'IRL', 24, 92],
  ['Nick Kenny', 'WAL', 33, 90], ['Kim Huybrechts', 'BE', 41, 91], ['Thibault Tricole', 'FR', 37, 90],
  ['Lukas Wenig', 'DE', 32, 89], ['Robert Owen', 'WAL', 42, 89], ['Mario Vandenbogaerde', 'BE', 53, 89],
];

// b) Zweites Kartenjahr 2026 (Karte 2025/2026), nicht in den Top 64 → Karte läuft aus → starten in der Q-School
export const TOUR_EXPIRING = [
  ['Karel Sedláček', 'CZ', 47, 90], ['Bradley Brooks', 'ENG', 26, 89], ['Cam Crabtree', 'ENG', 23, 88],
  ['Wesley Plaisier', 'NL', 36, 90], ['Sebastian Białecki', 'PL', 23, 90], ['Max Hopp', 'DE', 30, 89],
  ['Adam Lipscombe', 'ENG', 34, 88], ['Dominik Grüllich', 'DE', 24, 87], ['Cor Dekker', 'NO', 39, 89],
  ['Maik Kuivenhoven', 'NL', 38, 87], ['Andy Boulton', 'SCO', 53, 87], ['Tavis Dudeney', 'ENG', 22, 87],
  ['Oskar Lukasiak', 'SE', 35, 88], ['Darryl Pilgrim', 'ENG', 39, 87], ['Tom Bissell', 'ENG', 39, 88],
  ['Christian Kist', 'NL', 40, 89], ['Leon Weber', 'DE', 24, 88], ['Dennie Olde Kalter', 'NL', 35, 87],
  ['Jim Long', 'CA', 58, 88], ['Thomas Lovely', 'ENG', 30, 87], ['Marvin van Velzen', 'NL', 26, 87],
  ['Viktor Tingström', 'SE', 25, 87], ['Adam Warner', 'ENG', 29, 87], ['Greg Ritchie', 'SCO', 31, 87],
  ['Adam Paxton', 'ENG', 27, 87], ['Maximilian Czerwinski', 'DE', 28, 87], ['Tytus Kanik', 'PL', 42, 87],
  ['Stefaan Henderyck', 'BE', 52, 87], ['Rusty-Jake Rodriguez', 'AT', 26, 88], ['Pero Ljubić', 'HR', 48, 87],
  ['Kai Gotthardt', 'DE', 31, 89],
];

// c) Neu 2026 (Q-School 2026: 13 UK + 16 EU, Challenge-/Dev-Tour 2025: Bellmont, Labanauskas, Greaves, Bates) → Karte 2026/2027
export const TOUR_NEW_2026 = [
  ['Stefan Bellmont', 'CH', 37, 89], ['Darius Labanauskas', 'LT', 50, 88], ['Beau Greaves', 'ENG', 22, 95],
  ['Owen Bates', 'ENG', 24, 89], ['Arno Merk', 'DE', 34, 87], ['Filip Bereza', 'PL', 28, 88],
  ['Rhys Griffin', 'WAL', 29, 89], ['Adam Leek', 'AU', 27, 88], ['Jeffrey Sparidaans', 'NL', 33, 88],
  ['Cristo Reyes', 'ES', 39, 88], ['Carl Sneyd', 'ENG', 39, 88], ['Niall Culleton', 'IRL', 39, 88],
  ['Matthias Ehlers', 'DE', 45, 87], ['Yorick Hofkens', 'DE', 19, 88], ['Tom Sykes', 'ENG', 34, 88],
  ['Shane McGuirk', 'IRL', 31, 88], ['Jeffrey de Zwaan', 'NL', 30, 89], ['Sietse Lap', 'NL', 38, 87],
  ['Charlie Manby', 'ENG', 21, 90], ['Samuel Price', 'ENG', 33, 88], ['Jimmy van Schie', 'NL', 33, 88],
  ['Chris Landman', 'NL', 45, 88], ['Marvin Kraft', 'DE', 26, 88], ['Benjamin Pratnemer', 'SI', 47, 88],
  ['Adam Gawlas', 'CZ', 24, 89], ['Jurjen van der Velde', 'NL', 24, 90], ['Alexander Merkx', 'NL', 32, 88],
  ['Pascal Rupprecht', 'DE', 26, 88], ['Stephen Burton', 'ENG', 39, 88], ['Mervyn King', 'ENG', 60, 88],
  ['Tyler Thorpe', 'ENG', 24, 88], ['Stephen Rosney', 'IRL', 31, 87], ['David Sharp', 'SCO', 37, 87],
];

// Nationen-Korrekturen (Nutzerhinweise): gelten auch für bestehende Spielstände (state.js → migrate)
export const NATION_FIXES = { 'Levy Frauenfelder': 'NL', 'Derek Coulson': 'WAL', 'Callum Goffin': 'WAL', 'Adam Leek': 'AU',
  // Version 88 (Nutzerhinweise)
  'Kai Clark': 'WAL', 'Ryan Branley': 'ENG', 'Kaya Baysal': 'ENG', 'Geoffrey Murray': 'ENG', 'Dean Fitch Jnr': 'SCO', 'Jake Eichen': 'ENG', 'Ansh Sood': 'CH',
  'Angelo Balsamo': 'NL', 'David Fidler': 'CZ', 'David Evans': 'ENG', 'Ricardo Ulrich': 'NL', 'Martin Homola': 'SK', 'Liam Maendl-Lawrance': 'DE',
  // Version 94
  'Yorick Hofkens': 'DE' };
// Namens-Korrekturen (Nutzerhinweise, gelten auch für bestehende Spielstände): alt → neu
export const NAME_FIXES = { 'Lenny Schlueter': 'Lenny Schlüter' };
// JDC-Talente (Nutzerliste, Version 94): [Name, Nation, Alter 2026, Ø-Spanne von, bis]. Sie kommen mit 16 in die Welt (Dev Tour):
// Start-Ø = von + 25 % der Spanne, Potenzial = bis (Entwicklung bis 24 zusätzlich Richtung Potenzial, nie darüber – world.js developWorld).
export const JDC_TALENTS = [['Mitchell Lawrie', 'SCO', 15, 82, 106], ['Jack Johnson', 'ENG', 13, 76, 92], ['Jayden Walker', 'ENG', 13, 77, 94],
  ['Owen Bryceland', 'SCO', 11, 75, 90], ['Lewis Cook', 'ENG', 16, 74, 92], ['Benjamin Dopfer', 'DE', 15, 70, 90], ['Nicardo Pieper', 'DE', 14, 70, 85],
  ['Tergel Khurelkhuu', 'MN', 15, 80, 96, 8]];   // Version 184: Mongole, Start-Ø 84 (80 + ¼ × 16), je Match ± 8 (6. Wert = Schwankung)
export const jdcStartAvg = (lo, hi) => Math.round((lo + 0.25 * (hi - lo)) * 10) / 10;

// Q-School-2026-Gewinner UK (Rest von c ohne CT/Dev 2025 = EU)
export const QSCHOOL_UK_2026 = ['Rhys Griffin', 'Adam Leek', 'Carl Sneyd', 'Niall Culleton', 'Tom Sykes', 'Shane McGuirk', 'Charlie Manby',
  'Samuel Price', 'Stephen Burton', 'Mervyn King', 'Tyler Thorpe', 'Stephen Rosney', 'David Sharp'];
// PDC Order of Merit (gesamt, 2 Jahre) zu Beginn der Saison 2026 in Tsd. £ = Basis-★ (1 ★ = 1.000). Reihenfolge = Platz 1–95:
// Plätze 1–64 = TOUR_TOP64 (T1–T64), 65–95 = TOUR_EXPIRING (X1–X31); Neu-2026-Spieler (N) hatten noch kein PDC-Preisgeld.
export const START_OOM_2026 = [
  ['Luke Littler', 2770.5], ['Luke Humphries', 1172], ['Gian van Veen', 912.5], ['Michael van Gerwen', 691.25],
  ['Jonny Clayton', 625], ['Gary Anderson', 609.5], ['Stephen Bunting', 593.75], ['Ryan Searle', 568],
  ['Josh Rock', 555.5], ['Danny Noppert', 550.75], ['James Wade', 544.25], ['Gerwyn Price', 521],
  ['Chris Dobey', 505.25], ['Nathan Aspinall', 460], ['Martin Schindler', 458.25], ['Ross Smith', 447.75],
  ['Damon Heta', 439], ['Jermaine Wattimena', 423], ['Mike De Decker', 413.5], ['Rob Cross', 389],
  ['Luke Woodhouse', 383], ['Dave Chisnall', 362.5], ['Daryl Gurney', 346.5], ['Ryan Joyce', 345],
  ['Dimitri Van den Bergh', 335.25], ['Cameron Menzies', 325.25], ['Ritchie Edhouse', 324], ['Krzysztof Ratajski', 322.5],
  ['Wessel Nijman', 320.75], ['Dirk van Duijvenbode', 319.75], ['Peter Wright', 311.5], ['Michael Smith', 303.5],
  ['Andrew Gilding', 300], ['Ricardo Pietreczko', 293], ['Joe Cullen', 275], ['Raymond van Barneveld', 246],
  ['Martin Lukeman', 226.5], ['Kevin Doets', 219], ['Callan Rydz', 189], ['Ricky Evans', 188],
  ['Brendan Dolan', 183.25], ['Niels Zonneveld', 182.75], ['William O\'Connor', 182.25], ['Scott Williams', 173.75],
  ['Madars Razma', 162.5], ['Mickey Mansell', 159.25], ['Gabriel Clemens', 154.25], ['James Hurrell', 147],
  ['Connor Scutt', 144.75], ['Justin Hood', 139.75], ['Jeffrey de Graaf', 139.5], ['Ian White', 134.5],
  ['Alan Soutar', 131.5], ['Niko Springer', 129.75], ['Mensur Suljovic', 127.75], ['Ryan Meikle', 125.5],
  ['Richard Veenstra', 117.25], ['Keane Barry', 116.25], ['Nick Kenny', 114.5], ['Kim Huybrechts', 108],
  ['Thibault Tricole', 106.25], ['Lukas Wenig', 101.25], ['Rob Owen', 95.5], ['Mario Vandenbogaerde', 94.75],
  ['Karel Sedlacek', 83], ['Bradley Brooks', 78.75], ['Cam Crabtree', 73], ['Wesley Plaisier', 68.5],
  ['Sebastian Bialecki', 63.75], ['Max Hopp', 58.25], ['Adam Lipscombe', 56.75], ['Dominik Gruellich', 44.25],
  ['Cor Dekker', 41.25], ['Maik Kuivenhoven', 26], ['Andy Boulton', 26], ['Tavis Dudeney', 24.5],
  ['Oskar Lukasiak', 24.5], ['Darryl Pilgrim', 24.25], ['Tom Bissell', 20.25], ['Christian Kist', 20],
  ['Leon Weber', 19.75], ['Dennie Olde Kalter', 18.5], ['Jim Long', 17.25], ['Thomas Lovely', 17.25],
  ['Marvin van Velzen', 17.25], ['Viktor Tingstrom', 16], ['Adam Warner', 15.5], ['Greg Ritchie', 13.5],
  ['Adam Paxton', 11.75], ['Maximilian Czerwinski', 11.25], ['Tytus Kanik', 9.25], ['Stefaan Henderyck', 8.5],
  ['Rusty-Jake Rodriguez', 7.5], ['Pero Ljubic', 5.25], ['Kai Gotthardt', 5],
];
export const TOUR_PLAYERS = [...TOUR_TOP64, ...TOUR_EXPIRING, ...TOUR_NEW_2026];

// --- Challenge Tour (nur ohne Tourcard): Nutzerliste CT-OOM, Plätze 1–75 ---
// Stärke aus Platzierung: 91 Ø − 0,14 je Platz (75 → 80,6). Dev-Spieler auf der Liste stehen nur in DEV_PLAYERS
// (spielen ohnehin CT mit; Average = max(Dev, CT)). Danach 30 fiktive Europäer (~66–72 Ø) als Kanonenfutter.
// Version 185: DDV-Super-League-Spieler (Teilnehmer 2024/25, Nutzerliste), die noch fehlten → echte Spieler ohne Karte (IDs G…):
// bis 23 Jahre Development Tour, sonst Challenge Tour (beide spielen auch die Host-Nation-Qualifier). Format [Name, Nation, Alter 2026, Super-League-Ø];
// Welt-Ø = Super-League-Ø − SUPER_LEAGUE_SHIFT (Annahme: bei den schon vorhandenen SL-Spielern liegt der Welt-Ø im Mittel ~4 Punkte unter dem SL-Ø).
export const SUPER_LEAGUE_SHIFT = 4;
export const SUPER_LEAGUE = [
  ['Paul Krohne', 'DE', 25, 93], ['Jaimy van de Weerd', 'DE', 23, 91], ['Franz Rötzsch', 'DE', 31, 88], ['Mika Donnevert', 'DE', 18, 88],
  ['Oliver Müller', 'DE', 42, 88], ['Patrick Reisenegger', 'AT', 30, 87], ['Michael Klönhammer', 'DE', 58, 87], ['Andree Welge', 'DE', 54, 86],
  ['Marcel Hausotter', 'DE', 35, 85], ['Kevin Troppmann', 'DE', 27, 85], ['Carsten Hoffmann', 'DE', 45, 85], ['Kevin Jußen', 'DE', 32, 85],
  ['Patrick Klingelhöfer', 'DE', 39, 84], ['Christian Gödl', 'AT', 34, 84], ['Lukas Nußbaum', 'DE', 25, 84], ['René Damm', 'DE', 40, 83],
  ['René Kern', 'CH', 41, 83], ['Tim Scholz', 'DE', 26, 82], ['Deniz Baudis', 'DE', 18, 82], ['Steven Noster', 'DE', 36, 82],
  ['Christian Schmidt', 'DE', 40, 81], ['Kevin Kuhn', 'DE', 41, 81], ['Moritz Bohrmann', 'DE', 23, 80], ['Felix Springer', 'DE', 20, 79],
  ['Finn Chudziak', 'DE', 21, 78]];

// Ehemalige Tourcard-Holder ohne Karte 2026 (Version 96, Nutzerwunsch) → Challenge Tour, IDs K…; Alter auf Basis 2027 (= Alter 01.01.2026 + 1; Version 97: Korrekturen vom Nutzer),
// Average geschätzt. Werden auch alten Spielständen hinzugefügt (world.js addFormer).
export const CT_FORMER = [
  ['Florian Hempel', 'DE', 36, 88.0], ['Rowby-John Rodriguez', 'AT', 32, 87.5], ['José de Sousa', 'PT', 52, 87.5], ['Jim Williams', 'WAL', 42, 87.5],
  ['Nathan Rafferty', 'NIR', 26, 87.0], ['Danny Jansen', 'NL', 24, 86.5], ['Martijn Kleermaker', 'NL', 35, 86.5], ['Adrian Lewis', 'ENG', 41, 86.5],
  ['Josh Payne', 'ENG', 33, 86.0], ['Leighton Bennett', 'ENG', 21, 86.0], ['Jitse van der Wal', 'NL', 27, 85.5], ['Nico Kurz', 'DE', 29, 85.5],
  ['Wesley Harms', 'NL', 42, 85.5], ['Dom Taylor', 'ENG', 28, 85.0], ['Ryan Hogarth', 'SCO', 34, 84.5], ['René Eidams', 'DE', 37, 84.5],
  ['Dragutin Horvat', 'DE', 50, 84.0], ['Darren Webster', 'ENG', 58, 84.0],
  ['Noa-Lynn van Leuven', 'NL', 30, 85.0]];   // Version 101: spielt bei den Männern (Nutzerhinweis), Average geschätzt
// Spielerinnen mit Tourcard bzw. in den Männer-Listen (spielen zusätzlich die Women's Series)
export const WOMEN_ON_TOUR = ['Beau Greaves'];
// Version 180: Average-Spanne je Match für Tour-Spielerinnen (Nutzervorgabe: Beau Greaves Ø 95 ± 10)
export const TOUR_AVG_RANGE = { 'Beau Greaves': [95, [85, 105]] };
export const CT_FICTIONAL = 30;   // die letzten 30 Einträge sind fiktiv (Namen werden je Karriere neu gewürfelt)
export const CHALLENGE_PLAYERS = [
  ['Joe Hunt', 'ENG', 34, 91.0], ['Derek Coulson', 'WAL', 58, 90.9], ['Tommy Morris', 'ENG', 34, 90.7],
  ['Daniel Klose', 'DE', 47, 90.6], ['Tommy Lishman', 'ENG', 31, 90.3], ['Jack Aldridge', 'ENG', 28, 90.2],
  ['Jack Tweddell', 'ENG', 31, 90.0], ['Daniel Ayres', 'ENG', 38, 89.9], ['Aden Kirk', 'ENG', 34, 89.7],
  ['Harry Ward', 'ENG', 29, 89.6], ['Steve Lennon', 'IRL', 33, 89.5], ['Patrik Williams', 'ENG', 25, 89.2],
  ['Martijn Dragt', 'NL', 38, 88.9], ['Christopher Wickenden', 'ENG', 35, 88.8], ['Ted Evetts', 'ENG', 29, 88.6],
  ['Kevin Burness', 'NIR', 61, 88.5], ['Scott Waites', 'ENG', 49, 88.3], ['Michele Turetta', 'IT', 44, 88.2],
  ['Lewis Pride', 'ENG', 30, 88.1], ['David Davies', 'WAL', 41, 87.9], ['Gilbert van der Meijden', 'NL', 35, 87.8],
  ['Radek Szaganski', 'PL', 47, 87.5], ['Stef Kosters', 'NL', 30, 87.4], ['Levy Frauenfelder', 'NL', 23, 87.2],
  ['Oliver Mitchell', 'ENG', 36, 86.9], ['Dan Hands', 'ENG', 27, 86.8], ['David Evans', 'ENG', 37, 86.5],
  ['Ashley Coleman', 'ENG', 29, 86.4], ['Callum Francis', 'ENG', 31, 86.2], ['Danny Trueman', 'SCO', 45, 86.0],
  ['Patrick Geeraets', 'NL', 48, 85.7], ['John Henderson', 'SCO', 53, 85.4], ['Alan Norris', 'ENG', 54, 85.3],
  ['Callum Goffin', 'WAL', 30, 85.1], ['Robbie Martin', 'ENG', 43, 85.0], ['Jamie Kay', 'ENG', 36, 84.8],
  ['James Howard Hughes', 'ENG', 31, 84.7], ['Jake Jones', 'ENG', 33, 84.4], ['Paul Rowley', 'ENG', 36, 84.3],
  ['Andy Hamilton', 'ENG', 59, 84.1], ['Michael Unterbuchner', 'DE', 38, 84.0], ['Jack Main', 'ENG', 30, 83.9],
  ['Andy Courtney', 'ENG', 38, 83.7], ['Scott Campbell', 'SCO', 37, 83.6], ['Steve Beaton', 'ENG', 62, 83.3],
  ['Ricardo Ulrich', 'NL', 36, 83.2], ['Carl Wilson', 'ENG', 37, 83.0], ['Geoffrey Murray', 'ENG', 36, 82.7],
  ['Jamie Hughes', 'ENG', 40, 82.6], ['Jake Eichen', 'ENG', 27, 82.5], ['Graham Usher', 'ENG', 53, 82.3],
  ['Nicolas Thuillier', 'FR', 33, 82.2], ['Patrick Tringler', 'AT', 31, 82.0], ['Jose Justicia', 'ES', 37, 81.9],
  ['Danny Goddard', 'ENG', 27, 81.8], ['Michael Flynn', 'ENG', 34, 81.6], ['Arron Monk', 'ENG', 36, 81.5],
  ['Simon Stevenson', 'ENG', 54, 81.2], ['Steve Hine', 'ENG', 57, 81.1], ['Keegan Brown', 'ENG', 34, 80.9],
  ['Ashton Brown', 'ENG', 22, 80.8], ['Ron Meulenkamp', 'NL', 38, 80.6], ['Pierre Lavigne', 'FR', 41, 72.0],
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
  ['Jack Drayton', 'ENG', 20, 85.8], ['James Beeton', 'ENG', 23, 89.2], ['Jamai van den Herik', 'NL', 23, 89.0],
  ['Angelo Balsamo', 'NL', 23, 84.2], ['Nathan Potter', 'ENG', 23, 89.0], ['Lenny Schlüter', 'DE', 18, 83.4],
  ['Henry Coates', 'ENG', 20, 89.3], ['David Fidler', 'CZ', 22, 83.1], ['Sam Jackson', 'ENG', 19, 87.0],
  ['Florian Preis', 'DE', 19, 87.1], ['Finn Behrens', 'DE', 20, 82.5], ['Ben Townley', 'ENG', 17, 86.3],
  ['Mylo Michiels', 'BE', 20, 82.0], ['Kaya Baysal', 'ENG', 16, 81.8],
  ['Ieuan Halsall', 'WAL', 21, 81.5], ['Keenan Thomas', 'WAL', 24, 81.0], ['Peter Kelemen', 'HU', 21, 80.9],
  ['Charlie Stocks', 'ENG', 21, 80.7], ['Jan Schmidt', 'DE', 22, 80.6], ['James Buckby', 'ENG', 22, 80.4],
  ['Connor Hopkins', 'WAL', 21, 80.2], ['Jenson Remory', 'BE', 21, 84.1], ['Sean McKeon', 'IRL', 20, 79.9],
  ['Jarod Becker', 'DE', 23, 79.8], ['Jack Pollard', 'ENG', 23, 79.6], ['Nunjo Dewaele', 'BE', 23, 79.4],
  ['Harrison Leigh', 'ENG', 21, 85.8], ['Ciaran Forde', 'ENG', 22, 79.0], ['Cole Davey', 'WAL', 22, 78.8],
  ['Ryan Branley', 'ENG', 18, 78.6], ['Kimi Seemann', 'DE', 20, 78.5], ['Kai Clark', 'WAL', 22, 78.3],
  ['Shane de Jong', 'NL', 20, 78.2], ['JJ Wright', 'ENG', 23, 78.0], ['Martin Homola', 'SK', 21, 77.7],
  ['Dylan Quinn', 'IRL', 23, 77.5], ['Liam Maendl-Lawrance', 'DE', 22, 77.4], ['Milan Biro', 'HU', 20, 77.2],
  ['Matthias Moors', 'BE', 21, 77.0], ['Dean Fitch Jnr', 'SCO', 24, 76.9], ['Xanti Van den Bergh', 'BE', 22, 76.7],
  ['Bram van Dijk', 'NL', 22, 76.6], ['Oliver Pearce-Burgess', 'ENG', 24, 76.4], ['Nathan Care', 'ENG', 22, 76.2],
  ['Kilian Hohnstedt', 'DE', 20, 75.9], ['Joseph Brady', 'IRL', 17, 75.8], ['Lewis Mayes', 'ENG', 19, 75.6],
  ['Sebastian Caris', 'SE', 23, 75.4], ['Cody Crabtree', 'ENG', 18, 75.3], ['Mark Tabak', 'NL', 24, 75.1],
  ['Daan Beernink', 'NL', 21, 75.0], ['Cayden Smith', 'ENG', 19, 81.3], ['Ansh Sood', 'CH', 23, 74.6],
  ['Lleyton Molyneux', 'ENG', 24, 74.5], ['Luca Wolff', 'DE', 17, 74.3], ['Barry Watson', 'ENG', 19, 74.2],
  ['Liam Vanhove', 'BE', 18, 72.0], ['Josef Howlett', 'WAL', 20, 71.9], ['Nicolas Lauwereins', 'BE', 17, 71.9],
  ['Cori Wiltshire', 'ENG', 17, 71.9], ['Lee Bradshaw', 'ENG', 23, 71.5], ['Emile Hendryks', 'BE', 21, 71.5],
  ['Jack Lilley', 'ENG', 21, 71.5], ['Scott Wyatt', 'NIR', 21, 71.5], ['Hayden Ball', 'ENG', 19, 71.0],
  ['Matej Cverha', 'SK', 21, 71.0], ['Ben Dixon', 'ENG', 21, 71.0], ['Karl Robinson', 'ENG', 23, 71.0],
  ['Francesco Basili', 'IT', 19, 70.4], ['Lucas Bates', 'ENG', 18, 70.4], ['Lewis Parker', 'ENG', 21, 70.4],
  ['Mirko Paro', 'IT', 22, 70.4], ['Nathan Barr', 'SCO', 19, 69.9], ['Bradley Canning', 'ENG', 22, 69.9],
  ['Harvey Lawrence', 'ENG', 17, 69.9], ['Nathan Park', 'SCO', 23, 69.9], ['Callum Roach', 'ENG', 21, 69.9],
  ['Alfie Fisken', 'ENG', 21, 69.3], ['Garin Perkins', 'WAL', 19, 69.3], ['Ben Robinson', 'ENG', 20, 69.3],
  ['Alfie Cox', 'ENG', 19, 68.9], ['Harrison Kershaw', 'ENG', 18, 68.9], ['Toby Saunders', 'ENG', 23, 68.9],
  ['Ben Stanton', 'ENG', 24, 68.9], ['Philip Want', 'ENG', 18, 68.9], ['Finley Bennett', 'WAL', 21, 68.2],
  ['Alfie Busby', 'ENG', 20, 68.2], ['Oliver Clarke', 'ENG', 17, 68.2], ['Jory Scheldeman', 'BE', 17, 68.2],
  ['Joshua Wyer Powell', 'ENG', 18, 68.2], ['Dylan Slevin', 'IRL', 24, 87.8], ['Archie Self', 'ENG', 17, 90.4],
  ['Jenson Walker', 'ENG', 20, 86.6], ['Thomas Banks', 'ENG', 20, 81.4], ['Owen Roelofs', 'NL', 24, 79.1],
  ['Lewy Williams', 'WAL', 24, 77.8], ['Nathan Girvan', 'SCO', 24, 76.1],
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
