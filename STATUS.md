# STATUS – Darts Career

## Phasen
- [x] **Phase 1 – Gerüst & Hub** (Dateistruktur, Designsystem, Charaktererstellung, State/Speichern, Wochenkalender, Hub, Finanzen, Platzhalter-Spielerdaten, lokale Turniere per Simulation)
- [x] **Phase 2 – Match-Engine** (manuelles Spiel mit Scheibe/Zielkreuz, Scoreboard, Gegner-KI, „Rest simulieren“, Balancing)
- [x] **Phase 3 – Unterbau-Tour** (echte Spielerdaten, Q-School, Challenge/Dev Tour + OOM, Altersregel, Tourcards, Jahreswechsel/KI-Entwicklung)
- [ ] Phase 4 – Pro Tour (Tourcard 2 Jahre/Top 64, Players Championships, European Tour, Rankings, Preisgeld)
- [ ] Phase 5 – Majors & Events (WM, UK Open, Masters, Matchplay, Grand Prix, Grand Slam, PC Finals, World Cup, Premier League, World Series)
- [ ] Phase 6 – Sponsoren & Politur (Sponsoren, Statistik-Archive, Animationen, Balancing, README final)

## Stand Phase 1
- Spielbar: Neue Karriere → Hub → Woche → lokales Turnier melden → Runde für Runde simulieren (FUT-Karten-Vorschau, Ergebnis-Modal mit Stats) → Bracket → Preisgeld/XP → „Weiter“.
- Kalender zeigt das komplette Jahr (alle Kategorien); nicht implementierte Events sind ausgegraut mit Grund („Ab Phase X“, „Tourcard nötig“ …) und Kostenanzeige.
- Speicher: 3 Slots, Auto-Save nach jeder Woche/Runde, Export/Import JSON, Fortsetzen im Menü.
- Profil: Attributpunkte verteilen, XP-Balken. Statistiken, Finanzen, Neuigkeiten, Ranglisten (vorläufig nach Stärke), Karriereende mit Bilanz.
- Tests: `node tests/run.mjs` (Logik), `node tests/calib.mjs` (Engine-Kalibrierung), `node tests/season.mjs [seed]` (3-Jahres-Balancing nur lokal).

## Stand Phase 2
- Im Turnier pro Match wählbar: **Simulieren** (schnell, aufnahmebasiert) oder **🎯 Selbst spielen**.
- Manuelles Spiel: SVG-Scheibe mit Zielkreuz + markiertem Zielfeld, Ziel per Tippen oder Chips (Checkout-Weg wird vorgeschlagen), zwei Linien nacheinander stoppen (Tippen/Button/Leertaste), Pfeil-Markierungen, Bust-/Leg-/Satz-Banner, „Nerven!“-Hinweis bei Druck.
- Linien per requestAnimationFrame, Position aus Absolutzeit (gemessen: konstant 16,7 ms/Frame, keine Ruckler).
- Scoreboard: Rest, Legs (Sätze), Live-Average, letzte Aufnahme, aktiver Spieler, „Entscheidung“-Hinweis.
- **Schnellsimulation** (Wunsch Nutzer, DartConnect-Optik): alle Aufnahmen sichtbar, 1 Aufnahme = 1,5 s, rot Leg-Average / weiß Gesamt-Average beim Namen; Pause, „Selbst spielen“ (Wechsel mitten im Match), „Sofort beenden“. Im Turnier jetzt 3 Optionen: Selbst spielen · Schnellsimulation · Sofort.
- Gegner wirft automatisch dartgenau. „Rest simulieren“ jederzeit. Zurück/Neuladen → „Match fortsetzen“.
- Checkout-Wege 2–170 berechnet (z. B. 170 T20 T20 Bull, 81 T19 D12, 41 9 D16), Bogey-Zahlen ohne Weg.
- Kalibrierung KI-Darts: Ziel-Ø 45/62/80/100/106 → gemessen 44/63/80/100/106.
- Manuell (Mensch mit ±50 ms Reaktion): Attribute 42 → Ø ~56, 70 → ~83, 95 → ~114; mit ±75 ms deutlich schwächer.

## Stand Phase 3
- Echte Namen: 128 Tourcard-Holder 2026, 50 Challenge-, 50 Dev-Spieler (12 real + 38 fiktiv), 50 fiktive Amateure.
- Q-School (UK/EU, 4 Tage, 4 Karten/Tag/Standort), Challenge Tour + Development Tour (je 24 Turniere, Doppel-Wochenenden), Youth-WM – selbst spielbar (alle 3 Match-Modi) oder im Hintergrund simuliert.
- Ranglisten CT-OOM / Dev-OOM mit Tourcard-Linie, Rang im Hub. News: Q-School-Karten, OOM-Stand nach jedem Wochenende, Saisonbilanz.
- Jahreswechsel: Tourcards für CT/Dev Top 2, Kartenverlust außerhalb Top 64, Dev-Altersgrenze 23, KI-Entwicklung, Ruhestand, generierte Talente.
- Große Felder: Setzliste + Freilose; Turnierbaum ab den letzten 32, „Dein Weg“ mit allen eigenen Matches.
- Balancing (tests/career.mjs, einfacher Bot): Tourcard nach ~4–5 Saisons (Alter 21–23, Ziel-Ø ~90).
- 15 Node-Tests; 3 KI-Saisons in ~0,2 s, Spielstand ~70 KB.

## Nächste Schritte (Phase 4)
- Pro Tour: Players Championships (128er Feld, alle Tourcard-Holder) + European Tour (Qualifikation: Top 16 gesetzt, Rest über Tour-Card-Holder-Qualifier/Pro-Tour-OOM), Formate/Preisgelder in `data/tournaments.js` / `data/prizemoney.js`.
- PDC OOM (2 Jahre rollierend) + Pro Tour OOM mit Geld befüllen (KI-Hintergrund für PC/ET in `AI_CATS`); dann entscheidet echtes Preisgeld über Top 64 (statt Spielstärke).
- Startwerte der PDC OOM 2027: Basis-Preisgeld aus Reihenfolge `TOUR_TOP64` vorbelegen (Jahre 2025/2026), sonst wäre die erste OOM leer.
- `IMPLEMENTED_PHASE = 4`.

## Annahmen
- **Phase 3**: Q-School ohne Setzliste, nur Spieler ohne Karte (Pools ~60–75 je Standort, real ~400). Gebühr 4 × 25 € wird bei Meldung komplett fällig, auch bei Kartengewinn an Tag 1.
- Challenge/Dev-Turniere: first to 5, Finale first to 6; Preisgeld CT 3.500 € Sieg … 175 € Letzte 32, Dev 2.800 € … 150 €, Youth-WM 12.000 € (zählt nicht zur OOM).
- Bis Phase 4 hat die PDC OOM kein Preisgeld → „Top 64“ am Jahresende = 64 stärkste Tour-Spieler. Folge: der eigene Spieler verliert eine auslaufende Karte, wenn er nicht zu den 64 stärksten gehört.
- Tourgröße schwankt (Q-School vergibt fest 32 Karten): ca. 125–140 Holder.
- XP großzügiger als in Phase 1 (Schwelle 50 + 3·n), damit eine Tourcard in einigen Saisons erreichbar ist.
- Kalender nutzt ISO-KW 1–52, KW 53 wird übersprungen. WM in KW 51–52 (Finale Anfang Januar nicht separat).
- Kalender 2027 frei nach PDC-Muster (Termine/Orte angenähert): PC 15 Doppel-Blöcke, ET 14 Events, CT/Dev je 12 Wochenenden à 2 Turniere, Q-School UK (Milton Keynes) + EU (Kalkar) beide KW 2.
- Doppel-Events (PC, CT, Dev) zählen als *ein* Wochen-Event; Anmeldegebühr 25 € **je Turnier** (CT-Doppel = 50 €, Q-School 4 Tage = 100 €).
- Reisekosten richten sich nach dem Land des Events (UK-Landesteile = England-Tarif), unabhängig vom Heimatland.
- Lokale Turniere: jede Woche außer KW 52; Ort aus Städteliste der eigenen Nation; 32er-Feld; Ft3 bis VF, HF Ft4, Finale Ft5; Preisgeld Sieger 50–200 € (10er-Schritte), Finale 40 %, Halbfinale 20 %. Keine Reisekosten.
- Gegner im lokalen Turnier: zufällige 31 aus den 50 fiktiven Amateuren (unabhängig von der eigenen Nation).
- XP: Match 10, Sieg +16, +6 je Runde, Titel +50, × Kategoriefaktor (lokal 0,8 … Major 2). Punktschwelle 60 + 8·(verdiente Punkte). Attributkosten 1/2/3 Punkte (<60 / 60–79 / ≥80).
- Kein vorgegebener Start-Average (Wunsch Nutzer): Karte/Hub/Profil zeigen den gespielten Karriere-Average (`player.avgReal`). Gegner zeigen ihren Daten-Average.
- Attribut→Engine-Leistung intern: 30 + 0,77·Scoring; Checkout-Basis = 12 % + 0,33 %·Doppelquote.
- Manuelles Spiel: y-Linie läuft 13 % schneller als x-Linie; Startphase zufällig (kein Auswendiglernen). Ziel-Tippen rastet auf die Feldmitte ein (Single → äußeres Single-Feld).
- KI im Hintergrund nutzt weiter die schnelle Aufnahme-Simulation; Live-Gegner nutzen das dartgenaue Modell. Checkout-% liegt dartgenau etwas niedriger (realistischer) als in der Schnellsimulation.
- Checkout-% zählt jeden Dart mit Rest ≤ 40 (gerade) bzw. 50 als Doppelversuch.

## Unsichere Angaben (bei echten Daten prüfen)
- Websuche lief, aber Wikipedia/dartsnews/fandom sind im Container gesperrt → nur Suchzusammenfassungen. **Gesichert**: OOM-Top 17 (Anfang 2026), Q-School-2026-Gewinner (UK + EU), Stefan Bellmont (CT 2025), Beau Greaves (Dev 2025 Platz 2), Abgänge (de Sousa, Campbell, Jim Williams, Slevin, Klaasen, Lennon, Harrysson).
- **Aus Gedächtnis/ungeprüft**: OOM-Plätze 18–64 und Reihenfolge, Liste `TOUR_EXPIRING` (wer 2026 eine Karte hatte, aber nicht Top 64 ist) inkl. Keegan Brown, Matthew Dennant, Damian Mol, Leighton Bennett, Ben Robb, Jules van Dongen; „Samuel Price“ (Q-School UK 2026, Name laut Suche); „Marvin Kraft“ (Suche nennt auch „Martin Kraft“).
- Alle Altersangaben und Averages sind Schätzungen. Challenge-Liste = bekannte Spieler ohne Karte (Stand ungeprüft). Dev-Liste: 12 reale Nachwuchsnamen (Alter geschätzt) + 38 fiktive Talente.
- Exakte PDC-Termine/Orte 2027 (noch nicht veröffentlicht) – angenähert an 2025/2026.
- Preisgeld-Tabellen in `data/prizemoney.js` für CT/Dev/PC/ET sind Näherungswerte (noch nicht aktiv).

## Bekannte Bugs / Offene Punkte
- Google Fonts werden online geladen; offline greift die Systemschrift (Arial Narrow/Roboto Condensed).
- Manuell bei perfektem Timing sehr starke Spieler (Attribute 95) erreichen ~114 Ø – bewusst als Skill-Belohnung; ggf. in Phase 6 nachjustieren.
- Gegner-Wurftempo fest (0,52 s/Dart); Option „schnell“ evtl. in Phase 6.
- Balancing lokal: Start-Spieler (Scoring 40–45) gewinnt im ersten Jahr selten ein lokales Turnier, wenn er keine Punkte verteilt. Feinschliff in Phase 2/6.
