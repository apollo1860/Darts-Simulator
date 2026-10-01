// Preisgeld in € (realistisch skaliert, gerundet). Platzierungs-Schlüssel:
// W = Sieger, F = Finalist, SF, QF, L16, L32, L64, L128
export const PRIZES = {
  // Lokal: Sieger zufällig 50–200 €, Rest anteilig
  local: { winMin: 50, winMax: 200, shares: { F: 0.4, SF: 0.2 } },
  // Ab Phase 3/4 (Näherungswerte, noch nicht aktiv)
  challenge: { W: 3500, F: 1800, SF: 900, QF: 500, L16: 300, L32: 150 },
  dev:       { W: 3500, F: 1800, SF: 900, QF: 500, L16: 300, L32: 150 },
  pc:        { W: 17500, F: 11500, SF: 6000, QF: 4500, L16: 3000, L32: 2000, L64: 1200 },
  et:        { W: 35000, F: 14000, SF: 11500, QF: 7000, L16: 4500, L32: 3000, L48: 2000 },
};
