// Preisgeld in € (realistisch skaliert, gerundet). Platzierungs-Schlüssel:
// W = Sieger, F = Finalist, SF, QF, L16, L32, L64, L128
export const PRIZES = {
  // Lokal: Sieger zufällig 50–200 €, Rest anteilig
  local: { winMin: 50, winMax: 200, shares: { F: 0.4, SF: 0.2 } },
  ddv:       { W: 1000, F: 500, SF: 250, QF: 125, L16: 60 },
  // Challenge/Development Tour je Turnier (Näherungswerte, £ → €)
  challenge: { W: 3500, F: 1750, SF: 900, QF: 600, L16: 350, L32: 175 },
  dev:       { W: 2800, F: 1400, SF: 750, QF: 500, L16: 300, L32: 150 },
  youth:     { W: 12000, F: 6000, SF: 3000, QF: 1500, L16: 750, L32: 400 },
  qschool:   {},
  // Pro Tour je Turnier (2025er Werte £ → € gerundet). ET: L64 = Verlierer der 1. Runde (Letzte 48)
  pc:        { W: 17500, F: 11500, SF: 6000, QF: 4000, L16: 3000, L32: 1750, L64: 1150 },
  et:        { W: 35000, F: 14000, SF: 10000, QF: 7000, L16: 4500, L32: 3000, L64: 1500 },
  etq:       {},
  // Majors & Events (Phase 5, £ → € gerundet). G3/G4 = Gruppendritter/-vierter
  masters:   { W: 70000, F: 35000, SF: 23000, QF: 15000, L16: 10000, L32: 6000 },
  ukopen:    { W: 120000, F: 50000, SF: 25000, QF: 18000, L16: 12000, L32: 6000, L64: 3500, L128: 1800 },
  matchplay: { W: 935000, F: 470000, SF: 235000, QF: 117000, L16: 58000, L32: 41000 },
  wgp:       { W: 140000, F: 70000, SF: 47000, QF: 29000, L16: 17500, L32: 11500 },
  ec:        { W: 140000, F: 70000, SF: 47000, QF: 29000, L16: 17500, L32: 11500 },
  gsod:      { W: 175000, F: 82000, SF: 58000, QF: 29000, L16: 15000, G3: 11700, G4: 5800 },
  pcf:       { W: 140000, F: 70000, SF: 35000, QF: 17500, L16: 12000, L32: 8000, L64: 4000 },
  wmq:       {},
  wm:        { W: 1170000, F: 470000, SF: 235000, QF: 117000, L16: 70000, L32: 41000, L64: 29000, L128: 17500 },
  ws:        { W: 23000, F: 11700, SF: 7000, QF: 4700, L16: 2300 },
  wsf:       { W: 35000, F: 17500, SF: 11700, QF: 7000, L16: 4700, L32: 2300 },
  wcod:      { W: 94000, F: 47000, SF: 28000, QF: 18000, L16: 9400, L32: 5800 },     // je Team (wird geteilt)
  pln:       { W: 12000 },                                                            // Tagessieger-Bonus
  plf:       { W: 300000, F: 150000, SF: 100000 },
};
