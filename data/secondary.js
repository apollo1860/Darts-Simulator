// Nebentouren der PDC (Spieler ohne Tourcard): Top 8 der Order of Merit 2025 + Namen der WM-Qualifikanten 2026 (Reihenfolge = Platz).
// Zusammengestellt aus Claudes Wissen (Stand ~2025); Nation und Alter seit Version 95 aus der geprüften Nutzerliste (Stichtag 01.01.2026). Tourcard-Holder 2026 sind ausgenommen.
// Format je Spieler: [Name, Nation, Alter Anfang 2026]; Average wird aus dem Platz geschätzt (avgTop … avgTop − 7).
export const SECONDARY_SPREAD = 0.15;
export const SECONDARY = {
  women: { label: "PDC Women's Series", avgTop: 84, woman: true, players: [
    ['Fallon Sherrock', 'ENG', 31], ['Noa-Lynn van Leuven', 'NL', 29], ['Lisa Ashton', 'ENG', 55], ['Mikuru Suzuki', 'JP', 43],
    ['Gemma Hayter', 'ENG', 32], ['Vicky Pruim', 'SE', 51], ['Aileen de Graaf', 'NL', 35], ['Robyn Byrne', 'IRL', 28], ['Lorraine Winstanley', 'ENG', 50]] },
  asia: { label: 'PDC Asian Tour', avgTop: 89, players: [
    ['Paolo Nebrida', 'PH', 31], ['Ryuta Arihara', 'JP', 37], ['Lourence Ilagan', 'PH', 47], ['Christian Perez', 'PH', 43], ['Xiaochen Zong', 'CN', 35],
    ['Haruki Muramatsu', 'JP', 48], ['Alexis Toylo', 'PH', 33], ['Paul Lim', 'SG', 71], ['Lok Yin Lee', 'HK', 24], ['Ryusei Azemoto', 'JP', 30],
    ['Man Lok Leung', 'HK', 26], ['Tomoya Goto', 'JP', 29], ['Motomu Sakai', 'JP', 28], ['Kam Weng Chen', 'MO', 32], ['Nitin Kumar', 'IN', 40]] },
  cdc: { label: 'CDC ProTour (Nordamerika)', avgTop: 88, players: [
    ['Danny Lauby', 'US', 33], ['Danny Baggish', 'US', 39], ['Jeff Smith', 'CA', 50], ['Matt Campbell', 'CA', 36], ['Adam Sevada', 'US', 40], ['Fred Krueger', 'US', 40],
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
  ee: { label: 'Osteuropa (ET-/WM-Qualifier)', avgTop: 87, players: [
    ['Krzysztof Kciuk', 'PL', 45], ['Radek Szagański', 'PL', 46], ['Patrik Kovács', 'HU', 29], ['Nándor Major', 'HU', 35],
    ['Boris Krčmar', 'HR', 46], ['Jiří Brejcha', 'CZ', 40], ['Petr Křivka', 'CZ', 35], ['Michal Ondo', 'SK', 40]] },
  // Ab hier mit festem Ø (4. Wert, Nutzerangabe): je Karriere zufällig ±15 % Spielraum (SECONDARY_SPREAD); Alter unbekannt (null) → 25–45
  cdlc: { label: 'CDLC Tour (Karibik & Lateinamerika)', players: [
    ['Jesus Salate', 'AR', 43, 88], ['Rashad Sweeting', 'BS', 35, 85], ['Norman Madhoo', 'GY', 61, 80], ['James Walklin', 'TT', 48, 79],
    ['Romero Cartwright', 'BS', 48, 75], ['Joshua Balfour', 'TT', 42, 72], ['Sudesh Fitzgerald', 'GY', 39, 70]] },
  africa: { label: 'African Darts Group', players: [
    ['David Munyua', 'KE', 30, 85], ['Peter Wachiuri', 'KE', 39, 84], ['Patrick Ocheng', 'UG', 45, 81], ['Pascal Wanjala', 'KE', 30, 77],
    ['Evans Njuguna', 'KE', 49, 76], ['Charles Kausi', 'KE', 36, 75], ['Okalany Clegg', 'UG', 34, 75]] },
};
