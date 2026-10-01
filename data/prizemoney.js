// Preisgeld in € (realistisch skaliert, gerundet). Platzierungs-Schlüssel:
// W = Sieger, F = Finalist, SF, QF, L16, L32, L64, L128
export const PRIZES = {
  // Lokal: Sieger zufällig 50–200 €, Rest anteilig
  local: { winMin: 50, winMax: 200, shares: { F: 0.4, SF: 0.2 } },
  // Challenge/Development Tour je Turnier (Näherungswerte, £ → €)
  challenge: { W: 3500, F: 1750, SF: 900, QF: 600, L16: 350, L32: 175 },
  dev:       { W: 2800, F: 1400, SF: 750, QF: 500, L16: 300, L32: 150 },
  youth:     { W: 12000, F: 6000, SF: 3000, QF: 1500, L16: 750, L32: 400 },
  qschool:   {},
  // Pro Tour je Turnier (2025er Werte £ → € gerundet). ET: L64 = Verlierer der 1. Runde (Letzte 48)
  pc:        { W: 17500, F: 11500, SF: 6000, QF: 4000, L16: 3000, L32: 1750, L64: 1150 },
  et:        { W: 35000, F: 14000, SF: 10000, QF: 7000, L16: 4500, L32: 3000, L64: 1500 },
  etq:       {},
};
