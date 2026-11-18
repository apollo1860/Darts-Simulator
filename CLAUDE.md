# New Star Darts – Projektgedächtnis

Darts-Karrierespiel im Stil von *New Star Soccer* (eigene Grafiken), reines Browserspiel ohne Backend – läuft lokal über einen Webserver und auf GitHub Pages.
Im Hintergrund läuft eine vollständige Tour-Simulation (KI-Welt, alle PDC-Turniere, Qualifikationen, Ranglisten, Wurfmodell).
Historie und Detail-Annahmen aller Versionen: **`STATUS.md`** (vor größeren Änderungen lesen). Dieses Dokument beschreibt den **aktuellen Stand**.

## Arbeitsregeln
- Alles auf Deutsch (UI, Texte, knappe Kommentare). Kurze Rückmeldungen, chirurgische Edits statt Komplett-Rewrites.
- Reines HTML/CSS/JS (ES-Module), keine Build-Tools, keine Abhängigkeiten. Start lokal: `python3 -m http.server` → http://localhost:8000.
- Logikmodule (`js/*.js` außer `main.js`, alles außer `js/ui/**`) sind DOM-frei und in Node testbar.
- Zufall nur über `js/rng.js` (seedbar, Zustand im Spielstand `state.rng`); feste Würfe je Objekt über `hashSeed(...)`.
- **Version** `APP_VERSION` in `js/nsd.js` (rechts oben im Titelbildschirm): **bei jedem Push um 1 erhöhen**.
- Nach jeder Änderung: `node tests/run.mjs` (muss grün sein), `STATUS.md` (neuer Versionseintrag oben) und bei neuen Regeln diese Datei aktualisieren, dann committen.
- Unklar → sinnvollen Standard wählen und in `STATUS.md` als Annahme notieren.
- Alles muss auf ein Handy-Hochformat passen (max. 480 px breit; Spielbericht/Interview ohne Scrollen, geprüft 390×664).

## Technik
```
index.html              Einstieg (lädt js/main.js), App-Icon/Manifest (img/, manifest.webmanifest)
css/base.css            Tokens, Reset · css/components.css Modal/Toast/Tabellen · css/nsd.css NSD-Design
js/main.js              Bootstrap, Router app.go(screen, params), Auto-Save, Update-Hinweis (checkUpdate)
js/state.js             Neue Welt/Karriere (newCareer = Basis), Speicher-Slots, Import/Export, migrate (alte Spielstände)
js/nsd.js               Spielermodell: Fähigkeiten, Star-Status, Energie, Note, Fans, ★-Preise, Nervosität, reale Spieler, Editor
js/skilltrain.js        Training/Minispiele, Einstufung, Formverlust + Altersabbau, Getränke, Darts-/Zubehör-Shop
js/career.js            Manager, Fitnesstrainer, Sponsoren, Interviews, Dilemmas, Saisonziele, Saisonbericht, Auszeichnungen
js/life.js              Lifestyle-Shop, Wartung, Zufriedenheit, Erholung, Ereignis-Karten, Partner/Hochzeit, Meilensteine
js/injury.js            Verletzungen (Rücken/Kopf/Zahn, schwere Rückenschmerzen = Ausfall-Woche)
js/season.js            nextWeek(): Hintergrundturniere, Jahreswechsel (Tourcards, Entwicklung, Rücktritte), News
js/tournaments.js       Berechtigung, Meldung, Felder, Runden, Preisgeld/OOM, Live-Match (Szenen, Zielen), KI-Hintergrundturniere
js/majors.js            Felder/Qualifikation der Majors, World Series, World Cup, Premier League, Grand Slam, WM
js/bracket.js           K.-o.-Bäume, Gruppen, Vorrunden, UK Open · js/calendar.js Wochenkalender, Sperren (nsdBlocked)
js/rankings.js          Order of Merits (2-Jahres-Wertung exakt je Turnier), pruneSave (alte Jahre löschen)
js/world.js             KI-Welt, Nebentouren, Entwicklung/Ruhestand/Nachwuchs (developWorld, developSecondary)
js/matchEngine.js       Schnellsimulation (aufnahmebasiert) · js/matchState.js dartgenauer Match-Zustand
js/throwModel.js        KI-Dart (σ aus Average), Zielkreis/Linien fürs eigene Werfen · js/board.js Scheibe, Checkouts
js/obstruction.js       Einsteckwinkel, verbaute Felder, Bouncer, Robin Hood · js/moments.js Spielmomente
js/articles.js          Zeitungsartikel · js/news.js Feed · js/history.js Titel/Bilanzen · js/form.js Bühne/Selbstvertrauen
js/player.js            Attribute (Perzentile), Average-Kurve · js/rival.js Rivale · js/decisions.js Checkout-Skripte
js/finance.js           Kostenfunktionen (nur Altmodus/Tests) · js/util.js Formatierung · js/rng.js Zufall
js/ui/nsd/              Oberfläche: frame.js (Bausteine), crowd.js, relbars.js, msToast.js, settings.js, art/ (Shop-Grafiken), screens/
data/                   players, secondary (Nebentouren), tournaments (Kalender/Formate), gear, accessories, lifestyle, lifeevents,
                        achievements, team, talk/talkmore/talkloss (Interviews), dilemmas, moments, sponsorsreal, controversial, names, nations, regions, prizemoney
tests/run.mjs           Regressionstests (Node) · tests/nsdCareer.mjs Bot spielt N Saisons (`node tests/nsdCareer.mjs 6 1 0.6`) · weitere Kalibrierskripte
```
- Router: Screen-Module mit `export const nsd = true`; Screens u. a. `title`, `slots`, `newprofile`, `intro`, `placement`, `hub` (Status), `skills`, `trainlevels`, `minigame`, `life`, `lifestyle`, `lifeevent`, `dilemma`, `league`, `calendar`, `tour` (Titelträger), `stats`, `week`, `event` (Lobby), `live`, `matchstats`, `interview`, `weekly`, `season`, `goals`, `team`, `sponsors`, `accessories`, `drinks`, `darts`, `achievements`, `news`, `editor`, `careerEnd`.
- Speicher: `localStorage['newStarDarts.slot.N']`, Auto-Save nach jeder Woche/jedem Turnier. **Spielstand klein halten** (`pruneSave`): Preisgeld nur 3 Jahre, Titelträger und Felder (`state.qual`) nur Vorjahr + aktuelles Jahr.
- Buttons Weiter/✔/Zurück immer über `arrowIcon()`/`checkIcon()` (SVG), nie Emoji. **Icons generell eigene SVGs statt Emojis** (Nutzerwunsch): `icon(name)` aus `js/ui/nsd/icons.js` (in Screens als `nicon` importiert; neue Icons dort im Stil der NSS-Vorlage ergänzen: realistische Clip-Art, weicher Glanz, dünne farbverwandte Konturen). Emojis in Texten/Daten werden automatisch über `js/ui/nsd/emoji.js` (`EMOJI`-Zuordnung, MutationObserver) zu Icons – neue Emojis dort zuordnen (Lifestyle-Emojis ohne Icon → kleine Shop-Grafik). Fans = jubelnde Silhouetten (`fans`), kein Schal. **Flaggen bleiben Emojis.**

## Start & Welt
- Saison 2026, KW 3 (nach der Q-School), 8 ★ (`START_STARS`), Alter 16–60. Eigener Spieler startet mit 2-Jahres-Tourcard, nominell einer der Schwächsten.
- **Realer Spieler** wählbar (`realPlayers`/`newRealCareer`): übernimmt Daten/Ranglistenplätze des KI-Spielers; ohne hinterlegtes Alter frei wählbar; ohne Tourcard → 2-Jahres-Karte (`state.openTour`, kein Karriereende bei Kartenverlust); Spielerinnen (`player.woman`, Partner-Texte über `partnerText`/`relLabelOf`). Startwerte aus dem Average (`realStartFor`).
- Welt: 128 Tourcard-Holder (Nutzerlisten in data/players.js), Challenge/Dev-Pool, JDC-Talente, ehemalige Holder (IDs `K…`), Nebentouren (data/secondary.js: Women's Series, Asien, CDC, DPA, DPNZ, Nordic & Baltic, Osteuropa, CDLC, Polen, China, Indien, Afrika, Südliches Afrika; einzelne zusätzlich Challenge Tour, bis 23 auch Dev Tour, über `SEC_ALSO_CT`); DDV-Super-League-Spieler (`SUPER_LEAGUE`) in CT/Dev. Bei neuen Spielerlisten: bestehende Spieler behalten ihren bisherigen Ø (Nutzerregel), Doppelungen über `normName` vermeiden. Exakte Averages wo vorgegeben; `avgRange` (5. Wert) = je Match zufälliger Average aus der Spanne (Silvia Lindner 52–75; Beau Greaves Ø 95, 85–105 über `TOUR_AVG_RANGE`, als Holderin immer im Women's-Series-Feld).
- Jahreswechsel: Top 64 PDC → Karte +1 Jahr, auslaufend außerhalb → Verlust (eigener Spieler: „Last Chance“ Q-School KW 2, sonst Karriereende). CT/Dev-OOM Top 2 ohne Karte → Karte. KI entwickelt sich nach Alter + seltene Durchbruch-/Einbruchjahre; Ruhestand ab 45 (Top 24 PDC erst über 65). Rücktritte aller (ehemaligen) Tourcard-Spieler als News in KW 1.

## Woche & Energie
- „Weiter“ → `nextWeek`: Hintergrundturniere, Wochen-Update (Energie, Sponsoren, News), Ereignisse.
- Energie: Woche +40 + Immobilie + Fitnesstrainer + Zufriedenheits-Anteil (`weeklyEnergy`). Match −(3 + 1 × Legs) %, max. 30 %, Floor-Turniere × 0,75; Einsatz 1–3 Herzen im Liveticker (1 ❤: Energie × 0,3, kaum Szenen, simulierte Aufnahmen −5…−10 Ø). Unter 20 %: kein Selbstwerfen, wachsender Malus. Training kostet 55 %. Getränke füllen auf 100 %.
- **Verletzungen** (`js/injury.js`): ~5 %/Woche (+3 % bei Energie < 30 %, + ab 35 Jahren, × 0,7 mit Fitnesstrainer, 4 Wochen Abklingzeit); sofort −50 % Energie, 1–2 Wochen, Erholung × 0,4, Attribut-Abzug (Ø ≈ −3…−5), größerer Zielkreis/schnelleres Zielkreuz. **Schwere Rückenschmerzen** (18 % der Rückenverletzungen): `state.week.blocked` – keine Turniere der Woche; Premier League kampflos (Freilos für den Gegner), World Cup mit Nachrücker.

## Fähigkeiten & Training
- Scoring, Finishing, Fokus, Rechnen 0–60 (je 20 Level × 3 Sterne, `player.skills`); Mental = Star-Status (max. 60). Attribut = 87,5 + 12,5/60 × Fähigkeit; Scoring 83 + 17/60 × Fähigkeit (0 Punkte = Start-Ø ≈ 82).
- Minispiele je Level (Kreis/Linien exakt wie im Match), Einstufung nach Profilerstellung, freies Training im Titelmenü. Fokus-Memory: verdeckt, „Los“ = 3 s aufdecken, dann L1 3 … L20 24 schnelle Tausche, 8 Darts-Symbole (Icons), ein Paar finden. Rechnen: immer 20 s, Bereiche je Level nach Nutzertabelle (`CALC_LEVELS`), bei L7/8/9/10/11/14/17 steckt der erste Dart schon (auf der Scheibe sichtbar), Rückgängig-Knopf.
- Boni: Darts (dauerhaft), Zubehör-Boosts (n Matches), Rausch (Schnaps/Wodka bis Wochenende), freie Punkte (+1 je Star-Stufe).
- **Formverlust**: ohne Training einer Fähigkeit ab 9 Wochen Punktverlust; ab 30 sinkt die Frist bis 45 auf 3 Wochen, Chance 35 → 70 %.
- **Altersabbau** (Jahreswechsel, `ageDeclineYear`): ab 33 je Fähigkeit −1 (33–35), −2 (36–39), −3 (40–44), −4 (ab 45), zurücktrainierbar.

## Star-Status, Note, Fans
- Star-Status 1–100, Balken `starNeed` = 100 × 1,04^(Stufe−1); Sieg nach Gegnerrang, Average, Ergebnis, Turniergewicht; Titel-Bonus `titleStarBonus` (Major ×2,5, Matchplay ×4, WM ×8). **Ab Top 16 gedämpft** (`topSlow`: Top 16 × 0,7, Top 8 × 0,55, Top 3 × 0,45).
- **Note** (`matchRating`): 6 + (Ø − erwarteter Ø)/5 + (Checkout − erwartet) × 6 + 180er + Sieg/Niederlage + Leg-Differenz; Erwartung steigt bis Stufe 46 (Ø 85 → 99, Checkout 33 → 43 %, `rateRef`). Sieg ≥ 5,5.
- **Fans je Match** (`fansAfterMatch`): Note > 7,0 +1 (≥ 8,5 +2), 6,1–7,0 ±0, ≤ 6,0 −1 (nach einem Sieg nie Verlust). Sonstige Zuwächse über `addFans` (gebremst mit (1 − Fans/100)²).
- **Titel-Fans** (`titleFans`): Floor 3, ET/WS 5, PL-Play-offs/Major 10, Matchplay 14 (gebremst nur mit (1 − Fans/100)); **WM-Titel: halber Abstand zu 100, mind. +15**.
- Nervosität (`nervesOf`): Top-8-Gegner, Anfänger (Status 1–5), große Bühne, Paulke-Interview; baut sich über Mental ab; zittrige Hand und schnelleres Zielkreuz im Liveticker.

## Sterne-Geld ★
- 1 ★ = 1.000 £ der echten PDC-Preisgelder 2026 (`STAR_PRIZE_WIN`/`STAR_PRIZE_FIXED`); Auszahlung × `starFactor` (+5 %/Stufe), Ranglisten in Basis-★. Preise × `priceFactor` (+25 %/Stufe, × 1,25), Getränke über `drinkFactor` (Bier Status 40 = 120 ★), Lifestyle fest.

## Turniere
- Kalender 2026 in data/tournaments.js; Floor (`FLOOR_CATS`/`isFloor`: PC, Qualifier, Nebentouren) vs. Bühne.
- Players Championships (30), European Tour (48er-Feld, TCHQ/HNQ/Regionen), Development Tour (bis 23, außerhalb Top 64, 1–5 Turniere je Wochenende), Challenge Tour/Q-School nur mit `openTour`/Last Chance, Women's Series (nur Spielerinnen außerhalb Top 64), WDF (ohne Tourcard).
- Majors: Masters (+ Vorrunde), UK Open (160), World Matchplay (Two clear legs), World Grand Prix (Double-in), European Championship, Grand Slam (48, Gruppensieger → Achtelfinale), PC Finals, WM (128, Sätze), World Cup (Doppel, Nationen-Teams), World Series (8 Einladungen + 8 Regionale), Premier League (Top 8, 16 Spieltage + Play-offs, automatisch mitgespielt).
- Preisgeld immer gezahlt; Ranglisten: PDC, Pro Tour, PC, ET (2-Jahres, exakt je Turnier), CT/Dev/WoS (1 Jahr).

## Match & Liveticker (`live.js`, tournaments.js)
- DartConnect-Ansicht; **Spielszenen** wirfst du selbst: Matchdarts, Entscheidungsleg, Break, Checks ab 61, mind. eine Szene je Leg, 9-Darter-/170-Szenen extra, Double-in-Einstieg (75 %). Lange Formate gedrosselt (`paced`).
- Checkvorschläge: mit 3 Darts PDC-Checkout-Tabelle 99–170 (`PDC_TABLE`, board.js), sonst kürzester Weg; Scoring-Pläne für bestimmte Reste > 170 (`SCORE_PLAN`, z. B. 265 T19, 302 T18, 232 T19 → Bull); Pläne erst ab Rechnen 40 (`PLAN_CE`); schwaches Rechnen → Vorschlag manchmal falsch, typisch um 10/20 Punkte verrechnet (`miscalcTarget`, 32 → D11).
- Zielen: zwei Linien + Kreis (`circleRadius`, Tempo steigt bei jedem Richtungswechsel), Zoom-Schalter, TV-Spielstandsanzeige.
- Kein Ticker-Logbuch (Leg/Break/180-Kommentare) – Hinweise nur als Toast.
- Effekte: Druck, Nervosität, Verletzung, Spielmomente (2 Optionen, 50/50), verbaute Felder/Einsteckwinkel, Bouncer (je Dart-Modell), Robin Hood (je Flight).
- Spielbericht: Statistik-Seite + Bewertungs-Seite (Note, Beziehungen, Star-Status, Energie mit Veränderung).

## Leben & Karriere-Rahmen
- Beziehungen: Manager, Fans, Partner(in), Sponsoren; Zufriedenheit, Lifestyle. Lifestyle-Shop (Gegenstände, Fahrzeuge, Immobilien; Wartung/„marode“), Ereignis-Karten, Dilemmas alle 3–7 Wochen, Hochzeit/Scheidung, Fahrzeug leihen, Meilensteine (139, u. a. Triple Crown, Clean Sweep = alle 8 Ranglisten-Majors + Premier League + World Cup in einem Jahr, 50 Wochen auf Platz 1 über `mstats.weeksNo1`).
- Manager (3 Stufen, Provision, Sponsor-Angebote), Fitnesstrainer (Pakete), Sponsoren (echte Marken nach Branchen, max. 5, Verhandlung Höher/Niedriger, umstrittene Sponsoren), Saisonziele, Saisonbericht + Auszeichnungen.
- Interviews nur nach Bühnen-Turnieren (Sieg/Finale/Halbfinale; nie nach PC/Floor) und vor jeder WM mit Elmar Paulke; je Antwort Wirkung auf eine Partei.
- Zeitungsartikel (Titel, Finale, WM-Ticket, Rangliste, 9-Darter, Premier-League-Aufstellung u. a.).

## Altmodus
`newCareer` (state.js) erzeugt Welt und Grundspieler; New Star Darts setzt darauf (`state.mode = 'nsd'`). Die alten Darts-Career-Nebensysteme (XP/Level-Wochenplan, Wohnen, Formtiefs, alte Sponsoren/Team/Interviews, Zufallsereignisse, Störmomente) wurden in Version 164 entfernt; nur noch Reste in finance.js/player.js für Tests der Tour-Simulation.
