# STATUS – Darts Career

## Phasen
- [x] **Phase 1 – Gerüst & Hub** (Dateistruktur, Designsystem, Charaktererstellung, State/Speichern, Wochenkalender, Hub, Finanzen, Platzhalter-Spielerdaten, lokale Turniere per Simulation)
- [ ] Phase 2 – Match-Engine (manuelles Spiel mit Scheibe/Zielkreuz, Scoreboard, „Rest simulieren“, Balancing)
- [ ] Phase 3 – Unterbau-Tour (echte Spielerdaten, Q-School, Challenge/Dev Tour + OOM, Altersregel, Tourcards, Jahreswechsel/KI-Entwicklung)
- [ ] Phase 4 – Pro Tour (Tourcard 2 Jahre/Top 64, Players Championships, European Tour, Rankings, Preisgeld)
- [ ] Phase 5 – Majors & Events (WM, UK Open, Masters, Matchplay, Grand Prix, Grand Slam, PC Finals, World Cup, Premier League, World Series)
- [ ] Phase 6 – Sponsoren & Politur (Sponsoren, Statistik-Archive, Animationen, Balancing, README final)

## Stand Phase 1
- Spielbar: Neue Karriere → Hub → Woche → lokales Turnier melden → Runde für Runde simulieren (FUT-Karten-Vorschau, Ergebnis-Modal mit Stats) → Bracket → Preisgeld/XP → „Weiter“.
- Kalender zeigt das komplette Jahr (alle Kategorien); nicht implementierte Events sind ausgegraut mit Grund („Ab Phase X“, „Tourcard nötig“ …) und Kostenanzeige.
- Speicher: 3 Slots, Auto-Save nach jeder Woche/Runde, Export/Import JSON, Fortsetzen im Menü.
- Profil: Attributpunkte verteilen, XP-Balken. Statistiken, Finanzen, Neuigkeiten, Ranglisten (vorläufig nach Stärke), Karriereende mit Bilanz.
- Tests: `node tests/run.mjs` (Logik), `node tests/calib.mjs` (Engine-Kalibrierung), `node tests/season.mjs [seed]` (3-Jahres-Balancing nur lokal).

## Nächste Schritte (Phase 2)
- `js/matchUI.js`: SVG-Scheibe, Zielwahl (Standard T20, Checkout-Vorschlag), Linien vertikal/horizontal per rAF + Delta-Time, Streuung aus Attributen, Trefferlogik inkl. Bust/Double-Out.
- Gegner-KI dartgenau (Gauß um Ziel, Sigma aus Attributen). Scoreboard FIFA-Stil.
- „Rest simulieren“: `simulateMatch` um Startzustand (Legs/Sets/Rest) erweitern.
- Button „Selbst spielen“ in `js/ui/screens/event.js` freischalten (`MANUAL_AVAILABLE`).

## Annahmen
- Kalender nutzt ISO-KW 1–52, KW 53 wird übersprungen. WM in KW 51–52 (Finale Anfang Januar nicht separat).
- Kalender 2027 frei nach PDC-Muster (Termine/Orte angenähert): PC 15 Doppel-Blöcke, ET 14 Events, CT/Dev je 12 Wochenenden à 2 Turniere, Q-School UK (Milton Keynes) + EU (Kalkar) beide KW 2.
- Doppel-Events (PC, CT, Dev) zählen als *ein* Wochen-Event; Anmeldegebühr 25 € **je Turnier** (CT-Doppel = 50 €, Q-School 4 Tage = 100 €).
- Reisekosten richten sich nach dem Land des Events (UK-Landesteile = England-Tarif), unabhängig vom Heimatland.
- Lokale Turniere: jede Woche außer KW 52; Ort aus Städteliste der eigenen Nation; 32er-Feld; Ft3 bis VF, HF Ft4, Finale Ft5; Preisgeld Sieger 50–200 € (10er-Schritte), Finale 40 %, Halbfinale 20 %. Keine Reisekosten.
- Gegner im lokalen Turnier: zufällige 31 aus den 50 fiktiven Amateuren (unabhängig von der eigenen Nation).
- XP: Match 10, Sieg +16, +6 je Runde, Titel +50, × Kategoriefaktor (lokal 0,8 … Major 2). Punktschwelle 60 + 8·(verdiente Punkte). Attributkosten 1/2/3 Punkte (<60 / 60–79 / ≥80).
- Attribut→Leistung: Average = 30 + 0,77·Scoring; Checkout-Basis = 12 % + 0,33 %·Doppelquote.
- Spielerdaten Tour/Challenge/Dev sind Platzhalter („Tourspieler 001“ …). Echte Namen in Phase 3.

## Unsichere Angaben (bei echten Daten prüfen)
- Exakte PDC-Termine/Orte 2027 (noch nicht veröffentlicht) – angenähert an 2025/2026.
- Preisgeld-Tabellen in `data/prizemoney.js` für CT/Dev/PC/ET sind Näherungswerte (noch nicht aktiv).

## Bekannte Bugs / Offene Punkte
- Google Fonts werden online geladen; offline greift die Systemschrift (Arial Narrow/Roboto Condensed).
- Balancing lokal: Start-Spieler (~62 Ø) gewinnt im ersten Jahr selten ein lokales Turnier, wenn er keine Punkte verteilt. Feinschliff in Phase 2/6.
