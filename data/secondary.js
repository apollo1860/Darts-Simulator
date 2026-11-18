// Nebentouren der PDC (Spieler ohne Tourcard): Top 8 der Order of Merit 2025 + Namen der WM-Qualifikanten 2026 (Reihenfolge = Platz).
// Zusammengestellt aus Claudes Wissen (Stand ~2025); Nation und Alter seit Version 95 aus der geprüften Nutzerliste (Stichtag 01.01.2026). Tourcard-Holder 2026 sind ausgenommen.
// Format je Spieler: [Name, Nation, Alter Anfang 2026]; Average wird aus dem Platz geschätzt (avgTop … avgTop − 7).
export const SECONDARY_SPREAD = 0.15;
export const SECONDARY = {
  // Version 101: Spielerinnen laut Nutzer-Rangliste mit ihrem Average (exakt, ohne Streuung); Alter nur wo bekannt (sonst zufällig 25–45).
  // Herkunft „UK“ in der Vorlage → ENG (Annahme). Noa-Lynn van Leuven spielt bei den Männern (Challenge Tour), Beau Greaves ist Tourcard-Holderin (data/players.js).
  // Mikuru Suzuki stand nicht in der Vorlage – Average geschätzt.
  women: { label: "PDC Women's Series", avgTop: 84, woman: true, exact: true, players: [
    ['Fallon Sherrock', 'ENG', 31, 79.54], ['Lisa Ashton', 'ENG', 55, 79.36], ['Gemma Hayter', 'ENG', 32, 77.66], ["Rhian O'Sullivan", 'WAL', null, 76.23],
    ['Deta Hedman', 'ENG', null, 76.1], ['Kirsi Viinikainen', 'FI', null, 75.53], ['Aileen de Graaf', 'NL', 35, 74.42],
    ['Karolina Ratajska', 'PL', null, 73.61], ['Vicky Pruim', 'SE', 51, 72.09], ['Mikuru Suzuki', 'JP', 43, 72.0], ['Rebecca Allen', 'IRL', null, 70.45],
    ['Angela Kirkwood', 'ENG', null, 70.29], ['Lorraine Winstanley', 'ENG', 50, 70.2], ['Robyn Byrne', 'IRL', 28, 70.17],
    ['Jade Gofford', 'ENG', null, 69.71], ['Aurora Fochesato', 'IT', null, 69.67], ['Kim Holden', 'ENG', null, 69.57], ['Jo Locke', 'ENG', null, 69.53],
    ['Steph Clarke', 'ENG', null, 69.25], ['Aoife McCormack', 'IRL', null, 69.24], ['Natalie Gilbert', 'ENG', null, 69.23],
    ['Leanne Topper', 'WAL', null, 69.23], ['Lorraine Hyde', 'SCO', null, 69.19], ['Eleanor Cairns', 'ENG', null, 68.37],
    ['Trina Gulliver', 'ENG', null, 67.82], ['Denise Cassidy', 'IRL', null, 67.37], ['Claire Brookin', 'ENG', null, 67.06],
    ['Joanne Oldershaw', 'ENG', null, 66.99], ['Macy Gibbons', 'ENG', null, 66.9], ['Lauren Hall', 'ENG', null, 66.78],
    ['Wendy Reinstadtler', 'ENG', null, 66.38], ['Katie Sheldon', 'IRL', null, 66.36], ['Lauren Bloomfield', 'ENG', null, 65.75],
    ['Stacey Ellis', 'ENG', null, 65.72], ['Louise Pearson', 'ENG', null, 65.63], ['Lauryn Salter', 'ENG', null, 65.16],
    ['Laura Turner', 'ENG', null, 65.14], ["Maria O'Brien", 'ENG', null, 64.94], ['Kirsty Hutchinson', 'ENG', null, 64.75],
    ['Anu Rasmus', 'FI', null, 64.5], ['Rachel Kingdon', 'WAL', null, 64.25], ['Sue Lowther', 'ENG', null, 64.05], ['Felicia Blay', 'ENG', null, 63.81],
    ['Lindsey Ashton', 'ENG', null, 63.7], ['Kyana Frauenfelder', 'NL', null, 63.56], ['Janine Gough', 'WAL', null, 63.4],
    ['Ruby Grey', 'ENG', null, 63.27], ['Carly Chenery', 'ENG', null, 63.23], ['Emma Martin', 'ENG', null, 62.57],
    ['Vicky Cauteruccio', 'ENG', null, 62.4], ['Grace Ferridge', 'ENG', null, 62.29], ['Tracey Dean', 'ENG', null, 61.63],
    ['Paige Pauling', 'ENG', null, 61.47], ['Holly Glet', 'ENG', null, 60.84], ['Greta Tekauer', 'HU', null, 60.78],
    ['Bianca Michalczyk', 'DE', null, 52.36], ['Jan Robbins', 'WAL', null, 52.27], ['Nancy-Vanessa Braun', 'DE', null, 52.19],
    ["Kacie O'Connor", 'ENG', null, 52.12], ['Vivian Cullimore', 'ENG', null, 52.09], ['Claire New', 'ENG', null, 52.03], ['Silvia Lindner', 'DE', null, 63.5, [52, 75]],
    ['Hannah Meek', 'ENG', null, 51.9], ['Emma Barlow', 'WAL', null, 51.42], ['Elaine Blackett', 'ENG', null, 51.09],
    ['Michaela Gillert', 'DE', null, 50.81], ['Jacqueline Abergel', 'CA', null, 50.8], ['Crissy Manley', 'ENG', null, 50.17],
    ['Louise Johnson', 'ENG', null, 50.15], ['Lenaic Cabestant', 'FR', null, 50.09], ['Miriam Fiore', 'DE', null, 50.01],
    ['Lauren Stokoe', 'ENG', null, 49.87], ['Millie Jolley', 'ENG', null, 49.86], ['Lesley Pattinson', 'ENG', null, 49.61],
    ['Jo Andrews', 'ENG', null, 43.51], ['Tania McAreavey', 'SCO', null, 43.46], ['Annett Kecke', 'DE', null, 43.4], ['Helen Kenny', 'IRL', null, 43.11],
    ['Lena Welc', 'DE', null, 43.01], ['Carolina Kaindl', 'DE', null, 42.36], ['Jane Biggs', 'ENG', null, 42.23], ['Jodie Paine', 'ENG', null, 41.94],
    ['Celine Menard', 'FR', null, 41.7], ['Lisa-Marie Killick', 'ENG', null, 41.58], ['Daniela Seele', 'DE', null, 41.4],
    ['Kirsten Eickler', 'DE', null, 41.0], ['Jessica Menard', 'FR', null, 40.66], ['Bianka Langendorf', 'DE', null, 40.56],
    ['Daniela Dambek', 'DE', null, 40.2], ['Diana Doerflinger', 'DE', null, 40.15], ['Lainey Webb', 'WAL', null, 39.71],
    ['Nicole Porm', 'DE', null, 37.94]] },
  asia: { label: 'PDC Asian Tour', avgTop: 89, players: [
    ['Paolo Nebrida', 'PH', 31], ['Ryuta Arihara', 'JP', 37], ['Lourence Ilagan', 'PH', 47], ['Christian Perez', 'PH', 43], ['Xiaochen Zong', 'CN', 27],
    ['Haruki Muramatsu', 'JP', 48], ['Alexis Toylo', 'PH', 33], ['Paul Lim', 'SG', 71], ['Lok Yin Lee', 'HK', 24], ['Ryusei Azemoto', 'JP', 30],
    ['Man Lok Leung', 'HK', 26], ['Tomoya Goto', 'JP', 29], ['Motomu Sakai', 'JP', 28], ['Kam Weng Chen', 'MO', 32], ['Nitin Kumar', 'IN', 40]] },
  cdc: { label: 'CDC ProTour (Nordamerika)', avgTop: 88, players: [
    ['Danny Lauby', 'US', 33], ['Danny Baggish', 'US', 42], ['Jeff Smith', 'CA', 50], ['Matt Campbell', 'CA', 36], ['Adam Sevada', 'US', 40], ['Fred Krueger', 'US', 40],
    ['Brayden Hall', 'CA', 22], ['David Cameron', 'CA', 56], ['Dawson Murschell', 'CA', 30], ['Leonard Gates', 'US', 55], ['Alex Spellman', 'US', 37], ['Jules van Dongen', 'US', 35], ['Stowe Buntz', 'US', 46]] },
  dpa: { label: 'DPA ProTour (Australien)', avgTop: 87, players: [
    ['Simon Whitlock', 'AU', 56], ['Joe Comito', 'AU', 44], ['Raymond Smith', 'AU', 46], ['Mal Cuming', 'AU', 49], ['Tim Pusey', 'AU', 33],
    ['Gordon Mathers', 'AU', 44], ['Corey Cadby', 'AU', 30], ['Brody Klinge', 'AU', 33], ['James Bailey', 'AU', 56]] },
  dpnz: { label: 'DPNZ ProTour (Neuseeland)', avgTop: 86, players: [
    ['Haupai Puha', 'NZ', 40], ['Ben Robb', 'NZ', 37], ['Mark Cleaver', 'NZ', 58], ['Cody Harris', 'NZ', 40],
    ['Jonny Tata', 'NZ', 33], ['Warren Parry', 'NZ', 61], ['Darren Herewini', 'NZ', 34], ['Craig Caldwell', 'NZ', 42]] },
  nb: { label: 'Nordic & Baltic ProTour', avgTop: 88, players: [
    ['Daniel Larsson', 'SE', 44], ['Dennis Nilsson', 'SE', 49], ['Andreas Harrysson', 'SE', 50], ['Johan Engström', 'SE', 49], ['Niels Heinsøe', 'DK', 56],
    ['Benjamin Reus', 'DK', 27], ['Vladimir Andersen', 'DK', 36], ['Marko Kantele', 'FI', 57], ['Teemu Harju', 'FI', 33]] },
  // Version 182: Osteuropa-Pool nach Nutzerliste (50 Spieler): Ø = Mitte der angegebenen Spanne, je Match ± 8 (avgRange); Tourcard-Holder
  // (Tytus Kanik, Pero Ljubić, Filip Bereza) und Dev-Tour-Spieler (Milan Biro, Peter Kelemen) nicht doppelt; Michal Ondo (alt) bleibt (Ø 81 geschätzt)
  ee: { label: 'Osteuropa (ET-/WM-Qualifier)', avgTop: 96.5, exact: true, players: [
    ['Boris Krčmar', 'HR', 46, 96.5, [88.5, 104.5]], ['Krzysztof Kciuk', 'PL', 45, 90, [82, 98]], ['András Borbély', 'HU', null, 90, [82, 98]], ['Petr Tous', 'CZ', null, 89.5, [81.5, 97.5]],
    ['David Pisek', 'CZ', null, 89, [81, 97]], ['Romeo Grbavac', 'HR', null, 88.5, [80.5, 96.5]], ['Mladen Radosavljević', 'RS', null, 87, [79, 95]], ['László Kádár', 'RO', null, 86, [78, 94]],
    ['Zvonimir Lešić', 'HR', null, 86, [78, 94]], ['Dominik Moravčík', 'SK', null, 86, [78, 94]], ['Patrik Kovács', 'HU', 29, 86, [78, 94]], ['György Jehirszki', 'HU', null, 85, [77, 93]],
    ['Valters Melderis', 'LV', null, 84, [76, 92]], ['Petr Křivka', 'CZ', 35, 84, [76, 92]], ['Michal Smejda', 'CZ', null, 84, [76, 92]], ['Andrei Mladen', 'RO', null, 83, [75, 91]],
    ['Danijel Bartolić', 'HR', null, 83, [75, 91]], ['Denis Duh', 'SI', null, 83, [75, 91]], ['Eduard Szabó', 'HU', null, 83, [75, 91]], ['Zsolt Bai', 'HU', null, 82, [74, 90]],
    ['Jiří Brejcha', 'CZ', 40, 82, [74, 90]], ['Kryštof Vaculík', 'CZ', null, 82, [74, 90]], ['Mario Čegir', 'HR', null, 82, [74, 90]], ['Stefan Trbojević', 'RS', null, 82, [74, 90]],
    ['Rok Bahor', 'SI', null, 81, [73, 89]], ['Mario Pilipović', 'HR', null, 81, [73, 89]], ['Marcel Cristescu', 'RO', null, 81, [73, 89]], ['Nándor Major', 'HU', 35, 81, [73, 89]],
    ['Roman Fialka', 'SK', null, 80, [72, 88]], ['Dalibor Smolík', 'CZ', null, 80, [72, 88]], ['Aleš Bašić', 'BA', null, 80, [72, 88]], ['Vojtěch Krayzel', 'CZ', null, 80, [72, 88]],
    ['Alexandru Stoian', 'RO', null, 79, [71, 87]], ['Daniel Racoveanu', 'RO', null, 79, [71, 87]], ['Filip Maňák', 'CZ', null, 79, [71, 87]], ['Jan Vácha', 'CZ', null, 79, [71, 87]],
    ['Luka Matković', 'HR', null, 79, [71, 87]], ['Tomáš Mikulka', 'CZ', null, 78, [70, 86]], ['Darko Iskra', 'HR', null, 78, [70, 86]], ['Levente Sárai', 'HU', null, 78, [70, 86]],
    ['Patrik Pondela', 'SK', null, 78, [70, 86]], ['Gergely Lakatos', 'HU', null, 77, [69, 85]], ['Luka Marinić', 'HR', null, 77, [69, 85]], ['Tomasz Kozłowski', 'PL', null, 77, [69, 85]],
    ['Uroš Janković', 'RS', null, 77, [69, 85]], ['Michal Ondo', 'SK', 40, 81]] },
  // Ab hier mit festem Ø (4. Wert, Nutzerangabe): je Karriere zufällig ±15 % Spielraum (SECONDARY_SPREAD); Alter unbekannt (null) → 25–45
  cdlc: { label: 'CDLC Tour (Karibik & Lateinamerika)', players: [
    ['Jesus Salate', 'AR', 43, 88], ['Rashad Sweeting', 'BS', 35, 85], ['Norman Madhoo', 'GY', 61, 80], ['James Walklin', 'TT', 48, 79],
    ['Romero Cartwright', 'BS', 48, 75], ['Joshua Balfour', 'TT', 42, 72], ['Sudesh Fitzgerald', 'GY', 39, 70]] },
  africa: { label: 'African Darts Group', players: [
    ['David Munyua', 'KE', 30, 85], ['Peter Wachiuri', 'KE', 39, 84], ['Patrick Ocheng', 'UG', 45, 81], ['Pascal Wanjala', 'KE', 30, 77],
    ['Evans Njuguna', 'KE', 49, 76], ['Charles Kausi', 'KE', 36, 75], ['Okalany Clegg', 'UG', 34, 75]] },
};
