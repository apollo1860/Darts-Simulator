# STATUS – Darts Career

## Phasen
- [x] **Phase 1 – Gerüst & Hub** (Dateistruktur, Designsystem, Charaktererstellung, State/Speichern, Wochenkalender, Hub, Finanzen, Platzhalter-Spielerdaten, lokale Turniere per Simulation)
- [x] **Phase 2 – Match-Engine** (manuelles Spiel mit Scheibe/Zielkreuz, Scoreboard, Gegner-KI, „Rest simulieren“, Balancing)
- [x] **Phase 3 – Unterbau-Tour** (echte Spielerdaten, Q-School, Challenge/Dev Tour + OOM, Altersregel, Tourcards, Jahreswechsel/KI-Entwicklung)
- [ ] Phase 4 – Pro Tour (Tourcard 2 Jahre/Top 64, Players Championships, European Tour, Rankings, Preisgeld)
- [x] **Phase 5 – Majors & Events** (WM, UK Open, Masters, Matchplay, Grand Prix, Grand Slam, PC Finals, World Cup, Premier League, World Series)
- [x] **Phase 6 – Sponsoren & Politur** (Sponsoren, Statistik-Archive, Animationen, Balancing, README final)

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
- Echte Namen: 128 Tourcard-Holder 2026, 92 Challenge- (62 Nutzerliste CT-OOM + 30 fiktive Europäer) und 98 Dev-Spieler (Nutzerliste Dev-OOM), 50 fiktive Amateure.
- Q-School (UK/EU, 4 Tage, 4 Karten/Tag/Standort), Challenge Tour + Development Tour (je 24 Turniere, Doppel-Wochenenden), Youth-WM – selbst spielbar (alle 3 Match-Modi) oder im Hintergrund simuliert.
- Ranglisten CT-OOM / Dev-OOM mit Tourcard-Linie, Rang im Hub. News: Q-School-Karten, OOM-Stand nach jedem Wochenende, Saisonbilanz.
- Jahreswechsel: Tourcards für CT/Dev Top 2, Kartenverlust außerhalb Top 64, Dev-Altersgrenze 23, KI-Entwicklung, Ruhestand, generierte Talente.
- Große Felder: Setzliste + Freilose; Turnierbaum ab den letzten 32, „Dein Weg“ mit allen eigenen Matches.
- Balancing (tests/career.mjs, einfacher Bot): Tourcard nach ~4–5 Saisons (Alter 21–23, Ziel-Ø ~90).
- 15 Node-Tests; 3 KI-Saisons in ~0,2 s, Spielstand ~70 KB.

## Umbau nach Phase 4 (Nutzerwunsch, vor Phase 5)
- „Selbst spielen“ ausgeblendet; im Turnier: 📺 DartConnect (mit Störmomenten) oder ⚡ Schnellsimulation.
- Neue Attribute Scoring/Finishing/Mental/Fokus als Perzentile (Start 60 = ~65 Ø) + Erfahrung −4…+10 (Clutch).
- Lokale Turniere: 16 Spieler, nur im eigenen Bundesland. 4 DDV-Ranglistenturniere/Jahr (64 Spieler, mehr XP).
- Training-Panel direkt nach jedem Turnier; Teilnahme-XP sorgt dafür, dass man sich anfangs nach fast jedem Turnier verbessert.
- Störmomente mit 2 Entscheidungen und sichtbarer Erfolgschance (7 Situationen, je nach Turnierebene).
- Balancing (tests/career.mjs, Bot verteilt Punkte gleichmäßig): Tourcard nach ~5–6 Saisons, nach 8 Saisons PDC-Platz ~20–40, Erfahrung +9.
- Spielstand-Migration v5: alte Attribute → Perzentile, Welt v3 (Erfahrung, DDV-Pool), Bundesland-Standard NRW.

## Stand Phase 4
- Players Championships (30 Turniere, Doppel-Blöcke) und European Tour (14 Events mit Qualifikation → 48er-Hauptfeld, Top 16 gesetzt) spielbar in allen Match-Modi und im Hintergrund simuliert.
- PDC OOM (2 Jahre, mit Startwerten 2025/2026) und Pro Tour OOM werden mit Preisgeld gefüllt; Top 64 am Jahresende nach Geld. Rang im Hub und in den News nach jedem Pro-Tour-Wochenende.
- News: Pro-Tour-Sieger der Woche, eigene Quali-Ergebnisse.
- Check Saison 2027: Pro-Tour-Spitze Littler (~0,5 Mio. €), van Veen, Rock, MvG …; Grenze Platz 64 ≈ 100 Tsd. €; ~28 Kartenverluste.
- Balancing (tests/career.mjs): Bot holt Tourcard nach 4–6 Saisons und hält sich danach auf PDC-Platz ~30–60.
- 17 Node-Tests; 3 Saisons inkl. Pro Tour ~0,6 s, Spielstand ~85 KB.

## Stand Phase 5
- Alle Majors, World Series, World Cup und Premier League spielbar (DartConnect/Schnellsimulation) und im Hintergrund simuliert; Qualifikation aus PDC-/Pro-Tour-/ET-/CT-/Dev-/WS-Wertungen, Eignung im Wochen-Screen mit Grund („Top 24 der PDC OOM (du: Platz 87)“).
- Grand Slam mit Gruppenphase + Tabellen, World Cup mit Zweierteams, Premier League als Zusatz-Event mit Tabelle (Ranglisten → Tab „Premier League“), WM mit 128 Spielern in Sätzen inkl. WM-Quali.
- Check Saison 2027 (Hintergrund): Littler gewinnt WM, Masters, UK Open, Matchplay, EC, PL; van Veen WGP/PCF; Feldgrößen stimmen (24/160/32/32/32/32/64/48/128); ganze Saison ~0,35 s.
- Ruheständler bleiben als 'retired' erhalten (Namen in alten Tabellen).
- 22 Node-Tests.

## Stand Phase 6
- Sponsorensystem komplett (Screen mit 4 Vertragsplätzen, Angeboten, Kündigung; Zahlungen in den Finanzen; Hub-Badge für neue Angebote).
- Statistik-Archiv: Saison-Archiv (Status, Rang, OVR, Erfahrung, Ø, Titel, Preisgeld), Titelliste, Bestergebnisse je Event/Serie, Höchstplatzierungen.
- Karriereende-Bilanz um Major-Titel, beste PDC-Platzierung, Sponsoreinnahmen, Erfahrung und Titelliste erweitert.
- Animationen: Konfetti + Gold-Panel bei Titel/Tourcard; Toasts stapeln sich nicht mehr.
- Balancing: KI-Attribute mit Nachkommastelle, mehr Tagesform-Streuung, Littler 102,5 Ø → Titel verteilen sich (Littler 2–6 pro Saison statt fast alle).
- Bugfixes: Gruppen-Aus-Platzierung, Ruheständler bleiben erhalten, Bestplatzierung ignoriert Quali-Ergebnisse, automatische PL-Spieltage erscheinen in der Historie.
- README final (Hinweis „nur private Nutzung, echte Namen“). 23 Node-Tests.

## Erweiterung nach Phase 6 (Nutzerwunsch)
- Neues Attribut **Rechnen**: niedrige Werte → öfter Bogey-Reste, falsche Doppel/Wege, Busts; in beiden Simulationen und für KI. Bogey-Reste als Statistik und ⚠ im DartConnect-Scoreboard.
- **Wöchentliches Training** (Hub-Kachel, eigener Screen): 1 Einheit/Woche, Fortschrittsbalken je Attribut; ohne regelmäßiges Training Formverlust (Warnung ab 2 Wochen Pause).
- Migration v6 (Rechnen: Spieler 60, KI ≈ Scoring). 25 Node-Tests.

- Charaktererstellung: 25 Bonuspunkte frei auf die 5 Attribute verteilen (+/−, „Gleichmäßig“, „Zurücksetzen“, Live-Karte).

- **Checkout-Entscheidungen** im DartConnect: gelegentlich Wegwahl bei 41–170 Rest mit geschätzten Chancen (Genauigkeit/Empfehlung über Rechnen).
- **Wochenplan** statt reinem Training: Training, Ruhetag, Sponsortermin oder Exhibition – nur eins pro Woche. Neue **Ermüdung** durch Turniere (Leistungsabzug ab 30 %). **„⏭ Nächstes Event“** springt über leere Wochen (mit Auto-Training). 27 Node-Tests.
- **Echte Spielerlisten** (Tourcard-Holder inkl. Herkunft, Dev Tour, Challenge Tour) vom Nutzer übernommen; Kartenregel Top 64 → +1 Jahr; Holder ≤ 23 außerhalb Top 64 spielen Dev Tour.
- **Tour-Seite** (🎫 im Hub): Tourcard-Holder mit „Karte bis“ + Herkunft (Filter: läuft aus, Top 64, Q-School, CT/Dev) und Titelträger (aktueller Sieger je Major/WS/PL/Youth-WM + Siegerliste aller Turniere je Saison). Startalter 16.
- **Level-System** (Nutzerwunsch): Level 1–100, 50 XP für Level 2, 100 für Level 3 …, Kurve wird zum Ende steiler (bis 14.650 XP je Level); je Level 5 Attributpunkte. Profil zeigt Level + Fortschritt, Turnierende XP-Balken, News „⬆️ Level N“. Migration v7: Level aus Gesamt-XP, schon verdiente Punkte bleiben. Bot: Level 17 nach Saison 1, ~51 nach 8 Saisons.
- Fix: Dev-Pool lief nach ~7 Saisons leer (Absturz in Dev-Turnieren), weil der große Pool ohne Karte keine Talente mehr bekam → jährlicher Nachwuchs + Obergrenze 200.
- Lokale Gegner schwächer (Nutzerwunsch): −6 Ø (jetzt 54–74 statt 60–80). Frischer Spieler ohne Training: Turniersiege lokal ~3 % → ~18 %, Aus in Runde 1 50 % → 36 %. Migration v8 für bestehende Spielstände.
- **Training aufgewertet** (Empfehlung umgesetzt): jede Einheit gibt XP (3 % des Level-Bedarfs, wächst mit) + Turniervorbereitung +3 auf das trainierte Attribut für diese und nächste Woche; Formverlust milder (ab 4 Wochen, 10–30 %). Exhibition-XP skaliert ebenfalls (5 %). Bot: Training ≈ +25–30 % XP (2030: 52k statt 40k), Level 64 statt 54 nach 8 Saisons.
- **Großes Paket (Nutzerwunsch)**: Team-Screen mit Manager (3 Stufen, Provision 10–20 %, mehr/bessere Sponsoren, Exhibition-Einladungen als Klick-Event) und Trainer (Einmalzahlung, 1 Jahr, +10–30 % XP); Erfahrung zählt auf der großen Bühne (Majors, gegen Top 16); Selbstvertrauen/Momentum mit Anzeige; Gegner-Matchdarts Wurf für Wurf auf der Dartscheibe; Interviews nach Majors (Floskel-Memory). 34 Node-Tests.

## Mögliche nächste Schritte
- Manuellen Modus auf Perzentil-Attribute kalibrieren und wieder freischalten.
- Echte Spielerdaten prüfen/ergänzen (siehe „Unsichere Angaben“).
- Mehr Störmoment-Situationen, Interviews/Pressekonferenzen, Rivalitäten.

## Annahmen
- Manager-Provision 10/15/20 % (übliche Spanne im Sport); Freischaltung nach Tourcard/Top 64/Top 16. Exhibition-Einladungen kommen zusätzlich zum Wochenplan (Ermüdung +15). Trainerpreise 1.500/6.000/18.000 €.
- Bühnen-Effekt symmetrisch um Erfahrung +3 (typischer Tour-Profi): Neuling (−4) auf großer Bühne ≈ −5 Punkte, Veteran (+10) ≈ +5. Momentum lokal nur ¼, damit Kneipenturniere keinen Dauer-Lauf erzeugen (Bot: meist „Normal“, Phasen mit Selbstvertrauen).
- Matchdart-Scheibe erscheint für die ganze Aufnahme, sobald der Gegner auf einem Match-Finish steht (auch wenn zuerst gestellt wird).
- Level-Kurve: 50·L·(1 + 2·((L−1)/99)²) XP – erfüllt 50/100 aus dem Wunsch, ab Mitte deutlich steiler. Frühe Saisons etwas schneller als das alte Punktesystem (Saison 1 ≈ 80 statt 55 Punkte), ab Saison 4 gleich, danach langsamer.
- Beobachtung: Bot (spielt aus Geldmangel viel lokal) bekommt mit der stärkeren echten CT/Dev-Welt erst nach 8+ Saisons eine Karte – Balancing ggf. nachziehen.
- Startalter 16 (Nutzerwunsch). Titelträger werden ab Karrierestart 2027 erfasst (2026er Sieger nicht hinterlegt). Herkunft 2026: Bellmont/Labanauskas = CT 2025, Greaves/Bates = Dev 2025 (Zuordnung geschätzt). Alte Spielstände: Herkunft „–“, bis neue Karten vergeben werden.
- **Wochenplan**: Exhibition/Sponsortermin-Beträge und Ermüdungswerte sind Balancing-Werte (js/training.js). Auto-Training beim Sprung, damit Überspringen keinen Formverlust erzeugt.
- **Rechnen/Training**: Formverlust widerspricht bewusst der ursprünglichen Regel „nie schlechter“ (Nutzerwunsch); Alterungsverlust gibt es weiterhin nicht. KI trainiert implizit (Entwicklung nach Alter), hat keinen Formverlust.
- **Phase 6**: Sponsorennamen fiktiv. Jahresgehalt-Raten auch für das laufende Jahr ab Unterschrift (Antrittsrate = 1 Quartal). Premier-League-Spieltagssiege zählen nicht als Titel (nur Bestergebnis).
- **Phase 5**: Qualifikationsregeln vereinfacht (siehe CLAUDE.md). World Grand Prix ohne Double-In. WM komplett im alten Jahr (KW 51–52), Preisgeld zählt fürs laufende Jahr. Premier-League-Spieltage brauchen keine Woche, kosten aber Reise; Bonus 12.000 € pro Tagessieg, Play-offs 300.000 € Sieg. PL-, WS- und World-Cup-Geld zählt nicht zur PDC OOM. WS-Qualifikanten = zugeloste Tour-Spieler (PDC 9–64). „International“-WM-Plätze = stärkste Spieler ohne Karte (inkl. DDV-Pool).
- **Umbau**: Perzentil→Average-Kurve geschätzt (60 ≈ 65 Ø). Erfahrungsstufen-Schwellen, XP-Werte und Störmoment-Chancen/Effekte sind Balancing-Werte (data/distractions.js, js/player.js) – leicht anpassbar.
- DDV-Turniere gibt es unabhängig von der Nation (auch für Nicht-Deutsche), Reise immer Deutschland-Tarif. Für Nicht-DE-Spieler gibt es kein Bundesland; lokale Turniere nutzen dann die Städteliste der Nation.
- Störmomente nur, wenn der Spieler wirft, max. 1 pro Match; nicht in der Schnellsimulation.
- **Phase 4**: PC-Auslosung frei (ohne Setzliste); bei mehr als 128 Holdern spielen die 128 bestplatzierten der PDC OOM. ET ohne Host-Nation-/Associate-Qualifier: alle 32 Quali-Plätze gehen an Tour-Holder. Keine Teilnahmegebühren auf der Pro Tour, nur Reisekosten (ET-Quali + Hauptfeld = eine Reise).
- PDC-OOM-Startwerte 2025/2026 sind synthetisch (Kurve nach Listenplatz), nicht die echten Beträge.
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
- **Tourcard-Holder 2026: vom Nutzer geliefert** inkl. Herkunft: Top 64 (inkl. Michael Mansell auf 46), 31 im zweiten Kartenjahr (laufen Ende 2026 aus → Q-School), 4 CT/Dev 2025 + 29 Q-School 2026 (Karte bis 2027). Nationen, Alter, Averages geschätzt.
- Kartenregel (Nutzer): Tourcard gilt 2 Jahre; Top 64 der PDC OOM am Saisonende → +1 Jahr (bis Ende Folgejahr). Top 64 2026 starten daher mit Karte bis 2027.
- (alt) Websuche lief, aber Wikipedia/dartsnews/fandom sind im Container gesperrt → nur Suchzusammenfassungen. **Gesichert**: OOM-Top 17 (Anfang 2026), Q-School-2026-Gewinner (UK + EU), Stefan Bellmont (CT 2025), Beau Greaves (Dev 2025 Platz 2), Abgänge (de Sousa, Campbell, Jim Williams, Slevin, Klaasen, Lennon, Harrysson).
- **Aus Gedächtnis/ungeprüft**: OOM-Plätze 18–64 und Reihenfolge, Liste `TOUR_EXPIRING` (wer 2026 eine Karte hatte, aber nicht Top 64 ist) inkl. Keegan Brown, Matthew Dennant, Damian Mol, Leighton Bennett, Ben Robb, Jules van Dongen; „Samuel Price“ (Q-School UK 2026, Name laut Suche); „Marvin Kraft“ (Suche nennt auch „Martin Kraft“).
- Alle Altersangaben und Averages sind Schätzungen. Challenge-Liste vom Nutzer (Plätze 1–75); Stärke 91 Ø − 0,14/Platz; 13 Spieler stehen auch auf der Dev-Liste → nur als Dev-Spieler geführt (spielen CT mit, Average = max). Gruppe „schlecht“: 30 fiktive Europäer (66–72 Ø). Alte CT-Namen (de Sousa, Klaasen, Jim Williams …) entfernt. Start-Karten CT/Dev 2026 = Listenplatz 1–2 (Hunt, Coulson, Drayton, Beeton). Dev-Liste vom Nutzer (98 ohne Karte + 13 Holder); Stärke aus Platz (1 → 90 Ø, −0,16/Platz; „schlecht“ 285+ ≈ 72–76), Nationen/Alter geschätzt. Holder in der Dev-Liste auf 21–23 Jahre gesetzt. Dylan Slevin/Lewy Williams von Challenge → Dev (Ersatz in CT fiktiv: Thijs Hoogland, Marcel Brandt).
- Regel: Tourcard-Holder ≤ 23 außerhalb der PDC-Top-64 dürfen zusätzlich Dev Tour spielen (KI + Spieler).
- Exakte PDC-Termine/Orte 2027 (noch nicht veröffentlicht) – angenähert an 2025/2026.
- Preisgeld-Tabellen in `data/prizemoney.js` für CT/Dev/PC/ET sind Näherungswerte (noch nicht aktiv).

## Bekannte Bugs / Offene Punkte
- Manueller Modus (`matchUI.js`) deaktiviert; `manualParams` nutzt noch die alte Attribut-Skala → vor Reaktivierung neu kalibrieren (tests/humanSim.mjs).
- Google Fonts werden online geladen; offline greift die Systemschrift (Arial Narrow/Roboto Condensed).
- Manuell bei perfektem Timing sehr starke Spieler (Attribute 95) erreichen ~114 Ø – bewusst als Skill-Belohnung; ggf. in Phase 6 nachjustieren.
- Gegner-Wurftempo fest (0,52 s/Dart); Option „schnell“ evtl. in Phase 6.
- Balancing lokal: Start-Spieler (Scoring 40–45) gewinnt im ersten Jahr selten ein lokales Turnier, wenn er keine Punkte verteilt. Feinschliff in Phase 2/6.
