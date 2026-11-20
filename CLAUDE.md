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
                        achievements, team, walkons.txt (Walk-on-Songs), talk/talkmore/talkloss (Interviews), dilemmas, moments, sponsorsreal, controversial, names, nations, regions, prizemoney
tests/run.mjs           Regressionstests (Node) · tests/nsdCareer.mjs Bot spielt N Saisons (`node tests/nsdCareer.mjs 6 1 0.6`) · weitere Kalibrierskripte
```
- Router: Screen-Module mit `export const nsd = true`; Screens u. a. `title`, `slots`, `newprofile`, `intro`, `placement`, `hub` (Status), `skills`, `trainlevels`, `minigame`, `life`, `lifestyle`, `lifeevent`, `dilemma`, `league`, `calendar`, `tour` (Titelträger), `stats`, `week`, `event` (Lobby), `live`, `matchstats`, `interview`, `weekly`, `season`, `goals`, `team`, `sponsors`, `accessories`, `drinks`, `drinkbonus`, `walkon`, `darts`, `achievements`, `news`, `editor`, `careerEnd`.
- Speicher: `localStorage['newStarDarts.slot.N']`, Auto-Save nach jeder Woche/jedem Turnier. **Spielstand klein halten** (`pruneSave`): Preisgeld nur 3 Jahre, Titelträger und Felder (`state.qual`) nur Vorjahr + aktuelles Jahr, Platzierungen aller Spieler (`state.placements`, Ranglisten-Pop-up) aktuelles Jahr + Vorjahr.
- Buttons Weiter/✔/Zurück immer über `arrowIcon()`/`checkIcon()` (SVG), nie Emoji. **Icons generell eigene SVGs statt Emojis** (Nutzerwunsch): `icon(name)` aus `js/ui/nsd/icons.js` (in Screens als `nicon` importiert; neue Icons dort im Stil der NSS-Vorlage ergänzen: realistische Clip-Art, weicher Glanz, dünne farbverwandte Konturen). Emojis in Texten/Daten werden automatisch über `js/ui/nsd/emoji.js` (`EMOJI`-Zuordnung, MutationObserver) zu Icons – neue Emojis dort zuordnen (Lifestyle-Emojis ohne Icon → kleine Shop-Grafik). Fans = jubelnde Silhouetten (`fans`), kein Schal. **Flaggen bleiben Emojis.**

## Start & Welt
- Saison 2026, KW 3 (nach der Q-School), 8 ★ (`START_STARS`), Alter 16–60. Eigener Spieler startet mit 2-Jahres-Tourcard, nominell einer der Schwächsten. **Immer genau 128 Holder**: ohne vorhandene KI-Karte verliert Stephen Rosney seine (`keep128`); nach jeder Q-School höchstens 128 (Tageskarten nur bei freien Plätzen, Überschuss → `trimTo128`).
- **Realer Spieler** wählbar (`realPlayers`/`newRealCareer`): übernimmt Daten/Ranglistenplätze des KI-Spielers; ohne hinterlegtes Alter frei wählbar; ohne Tourcard → 2-Jahres-Karte (`state.openTour`, kein Karriereende bei Kartenverlust); Spielerinnen (`player.woman`, Partner-Texte über `partnerText`/`relLabelOf`). Startwerte aus dem Average (`realStartFor`).
- Welt: 128 Tourcard-Holder (Nutzerlisten in data/players.js), Challenge/Dev-Pool, JDC-Talente, ehemalige Holder (IDs `K…`), Nebentouren (data/secondary.js: Women's Series, Asien, CDC, DPA, DPNZ, Nordic & Baltic, Osteuropa, CDLC, Polen, China, Indien, Afrika, Südliches Afrika; einzelne zusätzlich Challenge Tour, bis 23 auch Dev Tour, über `SEC_ALSO_CT`, Q-School EU über `SEC_QSCHOOL`); PDC-Super-League-Spieler (`SUPER_LEAGUE`) in CT/Dev. Bei neuen Spielerlisten: bestehende Spieler behalten ihren bisherigen Ø (Nutzerregel), Doppelungen über `normName` vermeiden. ID-Präfixe nicht doppelt vergeben (Nachwuchs `Y…`, Super League `G…`). Exakte Averages wo vorgegeben; `avgRange` (5. Wert) = je Match zufälliger Average aus der Spanne (Silvia Lindner 52–75; Beau Greaves Ø 95, 85–105 über `TOUR_AVG_RANGE`, als Holderin immer im Women's-Series-Feld).
- PDC-OOM enthält auch Spieler ohne Karte mit Preisgeld (wie echt; Holder mit grünem Punkt). Klick auf einen Spieler → Pop-up (Nation, Alter, Tourcard in Folge `tourSince`, Startwerte aus `TOUR_SINCE` in data/players.js, Platzierungen des Jahres und des Vorjahres). Jahreswechsel: Top 64 PDC → Karte +1 Jahr (ohne Karte in den Top 64 → neue 2-Jahres-Karte), auslaufend außerhalb → Verlust (eigener Spieler: „Last Chance“ Q-School KW 2, sonst Karriereende). CT/Dev-OOM Top 2 ohne Karte → Karte. KI entwickelt sich nach Alter + seltene Durchbruch-/Einbruchjahre, Gesamtniveau jährlich zur Hälfte auf die Startverteilung normiert (`normalizePros`, keine Inflation) (JDC-Talente: Potenzial als Grenze, bis 23 per Durchbruch selten bis +10 darüber); Ruhestand ab 45 (Top 24 PDC erst über 65). Rücktritte aller (ehemaligen) Tourcard-Spieler als News in KW 1.

## Woche & Energie
- „Weiter“ → `nextWeek`: Hintergrundturniere, Wochen-Update (Energie, Sponsoren, News), Ereignisse.
- Energie: Woche +40 + Immobilie + Fitnesstrainer + Zufriedenheits-Anteil (`weeklyEnergy`). Match −(3 + 1 × Legs) %, max. 30 %, Floor-Turniere × 0,75; Einsatz 1–3 Herzen im Liveticker (1 ❤: Energie × 0,3, kaum Szenen, simulierte Aufnahmen −5…−10 Ø). Unter 20 %: kein Selbstwerfen, wachsender Malus. Training kostet 55 %; mitten im Turnier (noch nicht ausgeschieden, `inTournament`) kein Training und keine Beziehungspflege. Getränke füllen auf 100 %; zu viel in einer KW (zufällige Grenze 4–10) → nächste KW verkatert (−20 auf alle trainierbaren Fähigkeiten, `p.hangover`; vorher kein Hinweis).
- **Verletzungen** (`js/injury.js`): ~5 %/Woche (+3 % bei Energie < 30 %, + ab 35 Jahren, × 0,7 mit Fitnesstrainer, 4 Wochen Abklingzeit); sofort −50 % Energie, 1–2 Wochen, Erholung × 0,4, Attribut-Abzug (Ø ≈ −3…−5), größerer Zielkreis/schnelleres Zielkreuz. **Schwere Rückenschmerzen** (18 % der Rückenverletzungen): `state.week.blocked` – keine Turniere der Woche; Premier League kampflos (Freilos für den Gegner), World Cup mit Nachrücker.

## Fähigkeiten & Training
- Scoring, Finishing, Fokus, Rechnen 0–60 (je 20 Level × 3 Sterne, `player.skills`); Mental = Star-Status (max. 60). Attribut = 87,5 + 12,5/60 × Fähigkeit; Scoring 83 + 17/60 × Fähigkeit (0 Punkte = Start-Ø ≈ 82).
- Minispiele je Level (Kreis/Linien exakt wie im Match), Einstufung nach Profilerstellung, freies Training im Titelmenü. Fokus-Memory: verdeckt, „Los“ = 3 s aufdecken, dann L1 3 … L20 24 schnelle Tausche, 8 Darts-Symbole (Icons), ein Paar finden. Rechnen: immer 20 s, Bereiche je Level nach Nutzertabelle (`CALC_LEVELS`), bei L7/8/9/10/11/14/17 steckt der erste Dart schon (auf der Scheibe sichtbar), Rückgängig-Knopf.
- Training-Bildschirm: Knopf „Winkel“ zeigt den eigenen Einsteckwinkel (Seitenansicht + Wirkung, `js/ui/nsd/angle.js`); Umstellen nur mit voller Energie, kostet 100 % (`changeAngle`).
- Boni: Darts (dauerhaft), Zubehör-Boosts (n Matches), Getränke (Bier = Energie; Weinschorle = Energie + dauerhaft +1 Punkt auf wählbare Fähigkeit; Schnaps = Energie + dauerhaft +4–5 auf wählbare Beziehung; Auswahl `drinkbonus`), freie Punkte (+1 je Star-Stufe).
- **Formverlust**: ohne Training einer Fähigkeit ab 9 Wochen Punktverlust; ab 30 sinkt die Frist bis 45 auf 3 Wochen, Chance 35 → 70 %.
- **Altersabbau** (Jahreswechsel, `ageDeclineYear`): ab 33 je Fähigkeit −1 (33–35), −2 (36–39), −3 (40–44), −4 (ab 45), zurücktrainierbar.

## Star-Status, Note, Fans
- Star-Status 1–100, Balken `starNeed` = 100 × 1,04^(Stufe−1); Sieg nach Gegnerrang, Average, Ergebnis, Turniergewicht; Titel-Bonus `titleStarBonus` (Major ×2,5, Matchplay ×4, WM ×8). **Ab Top 16 gedämpft** (`topSlow`: Top 16 × 0,7, Top 8 × 0,55, Top 3 × 0,45).
- **Note** (`matchRating`): 6 + (Ø − erwarteter Ø)/5 + (Checkout − erwartet) × 6 + 180er + Sieg/Niederlage + Leg-Differenz; Erwartung steigt bis Stufe 46 (Ø 85 → 99, Checkout 33 → 43 %, `rateRef`). Sieg ≥ 5,5.
- **Fans je Match** (`fansAfterMatch`, `addMatchFans`): Note > 7,0 +1, ≥ 8,0 +2, ≥ 8,5 +3, ≥ 9,0 +4, ≥ 9,5 +5 (Bühne × 2, Floor × 0,75), 6,1–7,0 ±0, ≤ 6,0 −1 (nach einem Sieg nie Verlust). **Manager/Sponsoren je Match** (`relAfterMatch`): ≥ 8,0 +1, ≥ 9,0 +2, ≥ 9,5 +3, Niederlage ≤ 4,0 −1. Sonstige Zuwächse über `addFans` (gebremst mit (1 − Fans/100)²).
- **Titel-Fans** (`titleFans`): Floor 3, ET/WS 5, PL-Play-offs/Major 10, Matchplay 14 (gebremst nur mit (1 − Fans/100)); **WM-Titel: halber Abstand zu 100, mind. +15**.
- Nervosität (`nervesOf`): Top-8-Gegner, Anfänger (Status 1–5), große Bühne, Paulke-Interview; baut sich über Mental ab; zittrige Hand, schnelleres Zielkreuz und Treffer eher am Kreisrand (`nerveEdge`) im Liveticker.

## Sterne-Geld ★
- 1 ★ = 1.000 £ der echten PDC-Preisgelder 2026 (`STAR_PRIZE_WIN`/`STAR_PRIZE_FIXED`); Auszahlung × `starFactor` (+5 %/Stufe), Ranglisten in Basis-★. Preise × `priceFactor` (+25 %/Stufe, × 1,25), Getränke über `drinkFactor` × 1,25, Bier zusätzlich × (1 + 0,5 % je Stufe) (`drinkPrice`/`statusStep`, Bier Status 40 = 179 ★), Lifestyle fest; Wartung mit steigendem Status häufiger (`repairWeeks`: Status 1 12–16 Wochen, Status 40 7–10).

## Turniere
- Kalender 2026 in data/tournaments.js; Floor (`FLOOR_CATS`/`isFloor`: PC, Qualifier, Nebentouren) vs. Bühne.
- Players Championships (30), European Tour (48er-Feld, TCHQ/HNQ/Regionen), Development Tour (bis 23, außerhalb Top 64, 1–5 Turniere je Wochenende), Challenge Tour/Q-School nur mit `openTour`/Last Chance, Women's Series (nur Spielerinnen außerhalb Top 64), WDF (ohne Tourcard).
- Majors: Masters (+ Vorrunde: Holder ab Platz 25 + Top 8 Vorjahr (ohne Tourcard) von CT/Dev, je Top 4 (ohne Tourcard) von WoS/Nebentouren/ADG + 4 JDC, ohne Nachrücker → 32 Vierer-/vereinzelt Dreiergruppen, Platz 25–56 im K.-o. nach Setzliste; 2026 aus den echten OOMs 2025 `OOM_2025`; 32er-K.-o., Top 16 gesetzt, Sätze à Best of 3 Legs: Bo5/Bo7/Bo7/Bo9/Bo11), UK Open (160), World Matchplay (Two clear legs), World Grand Prix (Double-in), European Championship, Grand Slam (48, Gruppensieger → Achtelfinale), PC Finals, WM (128, Sätze; Gruppe A Top 32 gesetzt, B Platz 33–64, C übrige 64 – Runde 1 nur A–C/B–C, Rangliste nach den PC Finals eingefroren), World Cup (Doppel, Nationen-Teams), World Series (8 Einladungen + 8 Regionale), Premier League (Top 8, 16 Spieltage à K.-o. Bo11, Punkte 5/3/2; Paarungen Spieltag 1–7 jeder gegen jeden, 9–15 wiederholt, 8/16 nach Tabelle `plPairs`; Tabelle: Punkte → Spieltagssiege → Matchsiege; Play-offs 1–4/2–3 Bo19, Finale Bo21; automatisch mitgespielt).
- Preisgeld immer gezahlt; Ranglisten: PDC, Pro Tour, PC, ET (2-Jahres, exakt je Turnier), CT/Dev/WoS (1 Jahr).

## Match & Liveticker (`live.js`, tournaments.js)
- DartConnect-Ansicht; **Spielszenen** wirfst du selbst: Matchdarts, Entscheidungsleg, Break, Checks ab 61, mind. eine Szene je Leg, 9-Darter-/170-Szenen extra, Double-in-Einstieg (75 %). Lange Formate gedrosselt (`paced`); WM in knapper Schlussphase (≤ 1 Satz Unterschied, einer 1 Satz vor dem Sieg, `wmClutch`) mehr Szenen (bis 2 Board-Momente + 2 Scoring-Aufnahmen je Leg).
- Checkvorschläge: mit 3 Darts PDC-Checkout-Tabelle 99–170 (`PDC_TABLE`, board.js), sonst kürzester Weg; Scoring-Pläne für bestimmte Reste > 170 (`SCORE_PLAN`, z. B. 265 T19, 302 T18, 232 T19 → Bull); Pläne erst ab Rechnen 40 (`PLAN_CE`); schwaches Rechnen → Vorschlag manchmal falsch, typisch um 10/20 Punkte verrechnet (`miscalcTarget`, 32 → D11).
- Zielen: zwei Linien + Kreis (`circleRadius` × 1,15 `MATCH_CIRCLE`, auch im Training; Bull im Match nochmals × 1,25 `BULL_CIRCLE`; Tempo steigt bei jedem Richtungswechsel), Zoom-Schalter, TV-Spielstandsanzeige.
- Kein Ticker-Logbuch (Leg/Break/180-Kommentare) – Hinweise nur als Toast.
- Effekte: Druck, Nervosität, Verletzung, Spielmomente (2 Optionen, 50/50), Einsteckwinkel −60…60° mit Abprallern (Dart im Schatten eines steckenden Darts rutscht knapp hinter dessen Spitze; symmetrisch: Flight oben = „anwerfen“ über T20, Flight unten = „drauflegen“ unter T20, je gleich stark; `deflect`), Bouncer (je Dart-Modell), Robin Hood (je Flight).
- Lobby: Bilanz gegen den Gegner (`state.h2h`, auch im Ranglisten-Pop-up), Formkurve letzte 5 (`state.form` neueste zuerst gespeichert, angezeigt neuestes rechts; auch im Status), Spitzname (`player.nick`, Profilerstellung; Lobby, Artikel).
- Turnier-Lobby: Turnierbaum aller Runden (K.-o. mit festem Baum) zum Durchblättern; ausgeschieden → „Nächste Runde“ Klick für Klick oder „Turnier beenden“ (Sieger dann als News).
- Spielbericht: Statistik-Seite + Bewertungs-Seite (Note, Beziehungen, Star-Status, Energie mit Veränderung).

## Leben & Karriere-Rahmen
- Beziehungen: Manager, Fans, Partner(in), Sponsoren; Zufriedenheit, Lifestyle. **Vernachlässigung** (`neglectWeek`, career.js): Freundin/Fans/Manager/Sponsoren (mit Vertrag; bei 0 kündigt der schwächste) länger als 6 Wochen ohne Pflege-Aktion → wachsender Wochenabzug (0,5 je Woche, max. 3) + sinkende Obergrenze (100 − 2/Woche, mind. 50), Zuwächse nur halb (`relCap`, `NEGLECT_GAIN` in `addRel`); Pflege (`careRel`) setzt zurück. **Unter 25** (`lowRelWeek`): je Woche Chance auf Trennung/Manager-Kündigung/Ausstieg des schwächsten Sponsors, linear 0 % (25) → 20 % (0). Lifestyle-Shop (Gegenstände, Fahrzeuge, Immobilien; Wartung/„marode“), Ereignis-Karten (u. a. Shoppingtour: Ja → Lifestyle-Shop, Kauf +4 / ohne Kauf −6, Nein −3, am Ende −5 % Energie je Kauf – ohne Hinweis; Unfälle: Scoring/Finishing −1…2, ohne Fahrzeug Haushalt, mit Fahrzeug Fahrzeugunfall, danach 1 KW keine Turniere außer Majors/WS/PL/Major-Qualifier `majorPath` – Ausnahme wird nicht erwähnt), Dilemmas alle 3–7 Wochen, Urlaub (Leben-Screen, 1×/Jahr, in der KW kein Training/keine Turniere, nie in Major-Wochen, danach 4 Wochen +25 % Erholung), Hochzeit/Scheidung, Fahrzeug leihen, Walk-on-Song (Profilerstellung ohne Fan-Wirkung, danach Leben-Screen → `walkon`, Liste `data/walkons.txt` erst dort geladen, jeder Wechsel 50/50 Fans +2–4 / −2–4, frühestens alle 4 Wochen, Anzeige in der Lobby nur auf der Bühne), Meilensteine (139, u. a. Triple Crown, Clean Sweep = alle 8 Ranglisten-Majors + Premier League + World Cup in einem Jahr, 50 Wochen auf Platz 1 über `mstats.weeksNo1`).
- Manager (3 Stufen + Luxus-Manager ab Star-Status 40 als Angebot: nur Weltmarken, Fans +1/Woche; Provision, Sponsor-Angebote – Beziehung wirkt auf Häufigkeit × 0,4–1,6 und Höhe × 0,85–1,15, 50 = neutral, `mgrOfferChance`/`mgrOfferPay`), Fitnesstrainer (Pakete), Sponsoren (echte Marken nach Branchen, max. 5, Verhandlung Höher/Niedriger, umstrittene Sponsoren), Saisonziele, Saisonbericht + Auszeichnungen (eigene in `archive.awards`). Statistik-Screen mit „Ansicht ändern“: Zahlen ↔ Titel & Ehrungen.
- Interviews nur nach Bühnen-Turnieren (Sieg immer, Finale 60 %, Halbfinale 35 % `IV_CHANCE`; nie nach PC/Floor; je 1–3 Fragen, meist 2 `ivCount`) und vor jeder WM mit Elmar Paulke (fest 3 Fragen); je Antwort Wirkung auf eine Partei.
- Zeitungsartikel (Titel, Finale, WM-Ticket, Rangliste, 9-Darter, Premier-League-Aufstellung u. a.).
- News: jede fixe WM-Qualifikation außer Top 40 PDC/Pro Tour (Qualifier, Youth-WM, nach den PC Finals Tour-Plätze CT/Dev/WoS/Nebentouren, TCHQ; `wmAnnounce`).

## Altmodus
`newCareer` (state.js) erzeugt Welt und Grundspieler; New Star Darts setzt darauf (`state.mode = 'nsd'`). Die alten Darts-Career-Nebensysteme (XP/Level-Wochenplan, Wohnen, Formtiefs, alte Sponsoren/Team/Interviews, Zufallsereignisse, Störmomente) wurden in Version 164 entfernt; nur noch Reste in finance.js/player.js für Tests der Tour-Simulation.
