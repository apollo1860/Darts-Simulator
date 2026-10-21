# New Star Darts (ehem. Darts Career) – Projektgedächtnis

Karrierespiel für Darts im Stil von New Star Soccer (vorher: FIFA-artiger Karrieremodus). Browserspiel, kein Backend, läuft lokal (per lokalem Webserver) und auf GitHub Pages.
Immer zuerst `STATUS.md` lesen (Phasenstand, Annahmen, Bugs). Pro Sitzung genau **eine Phase**. Am Phasenende: testen (`node tests/run.mjs`), `STATUS.md` updaten, committen.

## 🌟 NEW STAR DARTS – Umbau (ab Okt. 2026, Nutzerwunsch)
Das Spiel wird zu **New Star Darts**: Karrierespiel nach dem Vorbild *New Star Soccer* (Funktionsweise + Design nach Nutzer-Screenshots,
eigene Grafiken). Die Simulation (Tour, Majors, Qualifikationen, KI-Welt, Wurfmodell, Ranglisten) bleibt im Hintergrund erhalten.
**Version** (`APP_VERSION` in `js/nsd.js`, rechts oben im Titelbildschirm): **bei jedem Push um 1 erhöhen** (Nutzerwunsch, ab Version 8).
Etappenweise Umsetzung (eine Etappe pro Sitzung):
1. **Grundgerüst & Design** ✅ – Rahmen, Titel, Spielstände, Optionen, Willkommen, Profil erstellen, Status, Fähigkeit, Leben, Liga.
2. **Spielen** ✅ – Wochenablauf, DartConnect-Liveticker mit Schlüsselmomenten, Kreis-Zielmechanik, Energie-Regeln, Match-Note, News-Seite.
3. **Fähigkeit** ✅ – Trainings-Minispiele + Einstufung, Getränke-Shop, Darts-Shop.
4. **Leben** ✅ – Beziehungen, Lebens-Ereignisse (Karten), Lifestyle-Shop (Kauf), Erfolge.
5. **Karriere-Rahmen** ✅ – Star-Status-Fortschritt, Ziele, wöchentliches Update, Manager/Fitnesstrainer, Sponsor-Verhandlung (Höher/Niedriger), Interview, Saisonbericht, Auszeichnungen.
6. **Liga** ✅ – Ranglisten in ★, Spielplan, Kartenverlust/„Last Chance“, alte Screens entfernen.
   - Liga: PDC-/Pro-Tour-OOM in ★ + Premier-League-Tabelle; Spielplan (`calendar` = schedule.js: alle Wochen mit offen/nicht qualifiziert/Ergebnis), Titelträger (`tour` = titles.js, nur Tour-Turniere), Statistik (`stats` = nstats.js).
   - Kartenverlust (`yearEnd`): `state.lastChance = {year}` → Q-School in KW 2 ist dann sichtbar/spielbar (`nsdBlocked` in calendar.js); nach KW 2 ohne Karte (`lastChanceCheck`) → `state.ended` → Screen `careerEnd` (= nend.js).
   - Alte Darts-Career-UI (js/ui/screens, matchUI, level, interview) entfernt; alte Logikmodule bleiben für die Hintergrund-Simulation/Tests.

### Version 7 – Feedback-Runde (gilt vor älteren Angaben unten)
- **Start**: Saison 2026, KW 3 (direkt nach der Q-School; `NSD_START`), 15 ★ (ab Version 17), Alter 16–60 (`START_AGES`), Erfahrung mind. +3. Welt = 128 Holder laut Nutzerliste (data/players.js: T = Top 64 + X = letztes Kartenjahr → Karte bis 2026; N1–4 bis 2026, Q-School 2026 bis 2027; `createWorld(rng, 2026)`). Top 64 am Saisonende → +1 Jahr, sonst Verlust (außer Karte läuft noch).
- **Winmau World Masters** (KW 5, 32er-Feld = Top 24 PDC + 8 Qualifikanten): **Vorrunde** `masters-q` (Kategorie `mastersq`, Zusatz-Event KW 4, kein Preisgeld): Holder ab Platz 57 + je Beste der Nebentouren (CT/Dev Top 2 ohne Karte, Nordic & Baltic, Asien, Nordamerika, Australien, Neuseeland, Frauen) + 4 JDC-Talente (Dev ≤ 18) in 32 Gruppen (jeder gegen jeden, `buildPrelimRounds`), Gruppensieger → K.-o. (Letzte 64) gegen die gesetzten Plätze 25–56 (`prelimKoMatches`), nach Letzte 64/32/16 bleiben 8 → `qual.mastersQ`. Alle Vorrunden-Partien Best of 5 Sets (Satz Best of 3 Legs). Fehlen Qualifikanten, rücken Platz 25 ff. nach.
- **Fähigkeit → Attribut** = 87,5 + 12,5/60 × Fähigkeit. Rechenfehler eigener Würfe `ce` = 0,07 − 0,0012 × Rechnen (Sim) bzw. 0,15 − 0,0025 × Rechnen (Zielvorschlag im Liveticker); falsche Doppel oft D13/D11/D5/D17/D19. Selbstvertrauen wirkt im Tour-Modus halb so stark.
- **Liveticker**: Werfen/Stopp über den großen grünen Knopf in der unteren Leiste (Pause/Tempo/Beenden während des Zielens ausgeblendet); y-Linie ×0,8 Tempo, Grundtempo 0,8 − 0,004 × Fokus; Kreis 17 − 0,2 × Fähigkeit. Zoom-Hilfe per Schalter „🔍 Zoom“ direkt am Board (Standard aus, gemerkt in `js/ui/nsd/settings.js`): an = Viertel (200 mm) um das Ziel. Star-Status-Balken `starMeter` (frame.js) wächst seit `player.starSeen` an (`animateMeters` nach jedem Render). Gegnerstand wird beim eigenen Wurf angezeigt. Gegner am Board nur bei Matchdarts (rot, „GEGNER WIRFT“). Zusätzlich max. eine Scoring-Aufnahme je Leg (35 %, Rest > 170). Nachnamen mit Zusätzen (`surname`: „Olde Kalter“, „van Gerwen“).
- **Partie-Übersicht**: Gegner-Ø als Spanne ±15 %, keine eigenen Fähigkeitswerte.
- **Star-Status**: Balken `starNeed` = 100 × 1,04^(Stufe−1); Gewinne wachsen nur noch +1 %/Stufe (Titel, Interview ebenso) → jede Stufe deutlich schwerer. Sieg × `rankBonus` (Gegner Platz 1 ×1,6 … ab 100 ×1). Niederlage bis Status 10: +1–3 % des Balkens (nicht bei Ø < 85 oder zu null); Note > 6,0: kleines Plus.
- **Zufriedenheit**: Start 30, nähert sich wöchentlich nur zu 8 % dem Ziel 15 + 0,4·Lifestyle + Freundin (6 + 0,1·Beziehung) + 0,2·Ø aller Beziehungen + Selbstvertrauen; Titel +3, Major-Titel +10.
- **Fans**: Match +1 nur ab Note 6, +1 ab 8,5; automatische Zuwächse (Matches, Titel, Interviews, Ereignisse) über `addFans` × (1 − Fans/100)² (mind. 5 %) – 100 % nur für echte Stars.
- **Lifestyle-Shop** (`data/lifestyle.js`, Liste vom Nutzer): 22 Gegenstände (Dartscheibe 5 … Büchse der Pandora 750), 22 Fahrzeuge (LimePrime-Abo 2 … Düsenjäger 1.250), 18 Immobilien (Hundehütte 2 … Burj Khalifa 10.000 Basis-★), je Kategorie aufsteigend. Lifestyle-Punkte ∝ Preis^0,4, ganzer Shop = 100; Immobilien-Erholung 2 … 18 %.
- **Fitnesstrainer**: Festpreis-Pakete (`trainerOffers`): 3 Angebote mit zufälligem Namen/Titel, Erholung 4–20 %, Dauer 4–12 Wochen, Preis ≈ Erholung × Wochen × 0,08 × Status-Faktor (z. B. ~5 ★ für 6 Wochen); alle 12 Wochen neue Angebote; Paket läuft nach Ablauf aus (`player.fitness = {regen, until}`).
- **Beziehungen pflegen** (Leben → Antippen): zufällige Aktion aus `REL_ACTIONS`; Fans/Manager/Sponsoren 60 % Energie, Freundin Geschenk 4 Basis-★; immer +6. Manager/Trainer-Namen je Spielstand zufällig (`nameTeam`).
- **Ereignisse**: Beziehungen ±1/2 (gekappt), Auftritte/Feiern kosten 60 % Energie (sonst gesperrt). Frau einladen: Chance aus Lifestyle + Status (`meetChance`, 8–75 %), sonst ausgelacht (Fans −1). Getränke füllen Energie auf 100 %.
- **Minispiele**: frühe Level sehr leicht (Kreis/Linien skaliert). Fokus: 2 s offen, dann umgedreht und sichtbar gemischt (`memorySwaps` 1 → 16, Tempo steigt), **ein** Paar reicht: 0/1/2 Fehler → 3/2/1 Sterne. Abbau ab 30: Formverlust-Schwelle 9 → 3 Wochen (60 J.), Chance 35 → 70 %.
- **Meilensteine** (133, `data/achievements.js`, Screen `achievements`): 8 Bereiche; „Am Board“ nur selbst geworfen (`state.selfStats` aus `liveHumanDart`), Zähler `state.mstats`, `state.flags`. Kein Geld, nur kleines Star-Status-Plus (`msStarPoints` = Gewicht/5, 1–10 Punkte). Einblendung im NSS-Stil über der unteren Leiste – links Stern mit Haken, rechts der Text (`js/ui/nsd/msToast.js`, Warteschlange `state.msQueue`, Tippen schließt, sonst 3 s).
- **UK Open** (Version 10, `buildUkOpenRounds`/`ukOpenMatches` in bracket.js, `inst.ukEntry`): 160 = alle Holder nach PDC-Rang + Top 8 CT/Dev-OOM (Vorjahr) + Riley's-Amateure; Einstieg R1 ab Platz 97, R2 65–96, R3 33–64, R4 Top 32; ab R4 freie Auslosung je Runde. Plätze L160/L128/L96 (`round.place`).
- **Grand Slam** (`gsDirect` in majors.js, `qual.gsDirect`/`gsqSurvivors`): TV-Finalisten 12 Monate (`champions[].runnerUp`) + meiste PC/ET-Titel (max. 16), Jugend-Weltmeister, Top 2 CT, Top 2 Women's Series; Rest über `gs-quali` (KW 45, fmt `gsq`, `gsQualSlots`). **PC Finals**: Top 64 der OOM `pco` (nur Players Championships). Ab Version 30 sind `protour`, `eto`, `pco` 2-Jahres-Ranglisten mit Startwerten (`seedRankings`).
- **WM** (Version 13, `wmDirect`): Top 40 PDC + 40 Pro Tour, Jugend-Weltmeister, Dev/CT-OOM Platz 2–4 (ohne Karte), Women's Series Platz 2–5, 21 Qualifier `WM_QUALIFIERS` (22 Plätze; Asian Championship 2; UK & IRE mit Holdern, `holders: true`; Sieger fehlen in späteren Qualifiern), danach Touren ohne bereits Qualifizierte: Asian Tour 5, PDCNB 2, CDC bester US/CA, ADA 1, DPNZ 1 (`secondaryOrder`); Rest Tour Card Holder Qualifier (`wm-quali`, Soll 4). Ältere Angaben unten (17 Qualifier, wm-qs) sind überholt.
- **World Cup** (Version 15, KW 24, `wcTeams`/`WC_NATIONS` in majors.js): 40 Nationen à 2 (beste aus allen Pools, sonst `addAmateurs`), Doppel: `attrsOf` liefert für Teams die Liste der Mitglieder (Bester zuerst), `simulateMatch` und Liveticker (`liveThrower`/`liveAttrs`, Wechsel je Aufnahme, Bester beginnt jedes Leg); Format Gruppe Bo7, AF–HF Bo15, Finale Bo19; Top 4 → Achtelfinale (`prelimSeeds`), 36 in 12 Dreiergruppen (`buildPrelimRounds(…, 16, 'Gruppenphase · Spieltag')`, `prelimKoMatches`), Platz G2/G3 (`groupPlace(…, adv = 1)`), keine OOM.
- **Version 18**: `player.freePoints` (+1 je Star-Stufe in `addStarProgress`, `spendSkillPoint`); `matchRating(…, oppAvg)` wohlwollend (Ø ≥ 90 / besser als Gegner → ≥ 6); Sponsoren: Angebot `{perWeek, win, s180, major, card 1–10, steps, mood, annoyed}`, `negotiate` (max. `NEGO_MAX` 5, +`NEGO_STEP` 8 %), `offerTerms`, Prämien `sponsorMatchPay` nach jedem eigenen Match.
- **Editor** (Version 22, Screen `editor`, `EDIT_FIELDS`/`applyEdits`/`setSkill` in nsd.js): Spielstand-Werte direkt setzen; Zugang 🛠️ im Status-Pager und in den Optionen.
- **Zubehör-Shop** (Version 24, `data/accessories.js`, Screen `accessories` über Status → Shop): Boost auf Fähigkeiten für n eigene Matches (`shopOffers` je 12 Wochen neu aus Namenspools, `state.shop`, `buyAccessory`, `player.boosts`, `boostBonus` in `skillBonus`, `useBoosts` nach jedem eigenen Match). Lifestyle-Shop nur noch über Leben.
- **Arena-Look** (Version 31): `.bg-green` = dunkle Bühne (Klassenname historisch), Dach = Lichttraverse, `.nsd-rail` = LED-Bande, `.nsd-grass` = Bühnenboden mit Oche. Shop-Grafiken `flightIcon(tier)`/`barrelIcon()` in frame.js. Menüpunkt `league` heißt „Ranglisten“.
- **Layout & Artikel** (Version 32): `.nsd` immer 100dvh, `.nsd-main` scrollt (untere Leiste fix). Website-Artikel `js/articles.js` (`titleArticle`, `finalArticle`, `wmTicketArticle`, `rankArticle` mit `flags.rankArticle`, `nineArticle`, `starArticle`, `cardArticle`, `plArticle`) → `state.articles` + News-Typ `article`; Screen `news` mit `{article:true, back}` zeigt die Warteschlange (✔ = nächster), `continueWeek` in weekly.js.
- **Buttons** (Version 33): Weiter/✔/Zurück immer über `arrowIcon(left?)`/`checkIcon()` aus frame.js (SVG), nie Emoji.
- **Startliste & 2-Jahres-OOM** (Version 34): `START_OOM_2026` (95 Plätze, ★ = Tsd. £) → `seedRankings`; `moneyOf` für `years: 2`: Jahr + Vorjahr + Vor-Vorjahr × `oldYearWeight` (KW 3 = 1 … KW 52 = 0). Bei Gleichstand steht der Spieler hinten. Shop-Grafiken: `js/ui/nsd/art/` (`lifeArt(id)`; `art(id, viewBox, draw)` mit `lin`/`rad`-Verläufen, BOX 100×100, WIDE 160×100).
- **European Tour wie echt** (Version 35): Preise `STAR_PRIZE_FIXED.et` (W 35, F 15, SF 10, QF 8, L16 5, L32 3,5, L64/„Letzte 48“ 2), Absagen `etWithdrawn` (6 %), Runde 1 „Letzte 48“.
- **App-Icon**: `img/` (icon-192/512, apple-touch-icon, favicon-32) + `manifest.webmanifest`, eingebunden in index.html. Neues Logo: Datei in `img/` ersetzen (gleiche Namen/Größen).

### Festgelegte Regeln
- **Start**: Profil (Vorname, Nachname, Nation, Alter 16–30, Wurfhand; nur männlich, keine Bonuspunkte). Direkt **mit Tourcard** (2 Jahre), nominell einer der Schwächsten. Kein Lokal/DDV/WDF/Q-School/CT/Dev/HNQ/WM-Regional (`NSD_BLOCKED`, `state.mode = 'nsd'`).
- **Fähigkeiten 0–60**: Scoring, Finishing, Fokus, Rechnen = je 20 Trainingslevel × max. 3 Punkte (`player.skills[key][level]`). **Mental** nicht trainierbar = Star-Status (max. 60). Umrechnung für die Match-Engine: Attribut = 85 + 0,25 × Fähigkeit (`syncAttrs`, 0 ≈ knapp unter dem schwächsten Holder ~87, 60 = Weltspitze 100).
- **Training (Minispiele)**: kostet > 50 % Energie (55 %); 3 Versuche (Erfolg im 1./2./3. → +3/+2/+1), Level beliebig oft wiederholbar bis 3 Punkte; 3 Fehlversuche = nur Energieverlust.
  - Scoring: 1 Aufnahme, Mindestpunktzahl steigt je Level (L1 ≈ 40 … L20 ≥ 140). Finishing: je Level anderes Doppel, 3 Darts; Linien minimal schneller je Level.
  - Fokus: Memory 4×4 mit Darts-Grafiken, Vorderseiten erst sichtbar, dann umgedreht (4 Rückseitenfarben, zufällig), 3 Herzen. Rechnen: Finish-Kombination auf der Scheibe antippen (z. B. 72 = T20 + D6), L1–5 ohne Zeit, dann kürzer bis 8 s in L20.
  - Einstufung nach Profilerstellung: jedes Minispiel einmal Level 1 ohne Energie → Startwerte.
  - Formverlust: ab 9 Wochen ohne Training einer Fähigkeit kann 1 Punkt verloren gehen (ab Woche 13: 2 …), immer der letzte Stern des höchsten Levels; Vorwarnung + Mitteilung.
- **Match**: alles im DartConnect-Liveticker; **Schlüsselmomente selbst werfen** (Matchdarts, eigene Checks ab 61, Entscheidungslegs, Breaks). Zielmechanik: zwei Linien wie gehabt, mittig ein halbtransparenter **Kreis** – darin landet der Dart zufällig; höhere Fähigkeiten = kleinerer Kreis. **Energie < 20 %**: kein Selbstwerfen mehr, Aufnahmen immer schlechter.
- **Star-Status 1–100**: wächst durch Matchsiege (Stufe 1: ≈ 10–15 % je Sieg; Zu-null/hoher Average mehr) und gute Interviews; Niederlage = leichter Abzug (deutlich verloren = mehr, nie 1:1), nie unter die erreichte Stufe; je Stufe schwerer (`starNeed`).
- **Sterne-Geld ★**: Status 1: 1 Bier = 1 ★. Preisgelder **und** Preise × Status-Faktor (+5 %/Stufe, `starFactor`). Basis-Sieg: PC 20, WS 30, ET 40, World Cup 60, Masters 100, UK Open 120, WGP/EC/PCF 150, Grand Slam 200, Matchplay 250, PL 15 (Spieltag)/250, **WM 500**; Runden F 50 %, HF 25 %, VF 12 %, L16 6 %, L32 4 %, L64 2 %, erstes Match verloren = 0. Ranglisten in ★ (alle Spieler wie mit eigenem Status).
- **Umsetzung Etappe 2** (`nsd.js` + Tour-Modus-Zweige in `tournaments.js`/`season.js`):
  - Schlüsselmoment (`keyMoment`, zu Beginn einer eigenen Aufnahme): Matchdarts > Entscheidungsleg (jede Aufnahme) > Break-Chance (Gegner hat Anwurf, Rest ≤ 170) > Check ab 61. Zielen: `aimParams`/`circleParams` (Kreisradius 20 − 0,22 × Scoring- bzw. Finishing-Äquivalent, mind. 5 mm, × Druck/Ausdauer; Linien-Amplitude/-Tempo aus Fokus), Dart gleichverteilt im Kreis (`landInCircle`), Wurf `liveHumanDart`. Gegner-Matchdarts und 180er im Anflug Dart für Dart auf der Scheibe.
  - Energie: Match −(2 + 0,4 × Legs), Woche +40 (`ENERGY_WEEK`). Unter 20 %: kein Selbstwerfen, Malus (20 − E + 0,4 × Leg-Nr.) × 0,9 auf Scoring/Finishing/Fokus (`energyMalus` in `attrsOf`). Lampenfieber und alte Nebensysteme (XP, Ermüdung, Formtiefs, Sponsoren alt, Wohnen, einmalige Kosten, Zufallsereignisse, Meilensteine, Interviews alt) ruhen im Tour-Modus.
  - Star-Status: Sieg 12 × (zu null ×1,4) × Average-Faktor (0,75–1,4) × Gegnerstärke (0,85–1,5) × Turniergewicht (PC 1, ET 1,15, WS 1,2, PL 1,3, Major 1,4, WM 1,6) × (1 + 0,03 × (Stufe − 1)); Niederlage −(1 + 3 × (1 − Legs/(to−1))) × Stufenfaktor; Titel +25 × Gewicht. Balken `starNeed` = 100 × 1,03^(Stufe−1). Stufenaufstieg → Mental +1 (`syncAttrs`), News.
  - Note 1–10 (`matchRating`: Average, Checkout-%, 180er, Ergebnis), Fans +1 (Sieg), +1 bei Note ≥ 8, −1 bei Niederlage mit Note < 4; Titel +3 (Major +5).
  - ★: `inst.prizes = starPrizeTable(fmt)` für alle Spieler (Ranglisten in Basis-★, Startwerte € ÷ 1.000), Auszahlung `starPayout` = Basis × `starFactor` (mind. 1 ★), ohne gewonnenes Match 0. Keine Reisekosten im Tour-Modus. `results[].stars`, `inst.stars`, `inst.star` (Status-Summe).
- **Getränke**: Bier (Energie), Schnaps (Energie + Fähigkeit), Wodka (Energie + Fähigkeit + Beziehung +1); Basis 1/3/5 ★.
- **Umsetzung Etappe 3** (`skilltrain.js`, `data/gear.js`, Screens `trainlevels`, `minigame`, `placement`, `practice`, `drinks`, `darts`):
  - Level L offen, wenn L = 1 oder L−1 ≥ 1 Stern; bestes Ergebnis zählt (`finishTraining`), Training setzt `player.idle[key]` = 0. Energie ≥ 55 % nötig (`canTrain`/`startTraining`).
  - Scoring: Mindestpunkte 40 + (L−1)·100/19; Finishing: `FIN_TARGETS` (L20 = Bull); Kreis/Linien wie im Match aus der aktuellen Fähigkeit (`trainAim`, Linien +1,5 %/Level). Fokus: Vorschau 8 s → 2,5 s, 8 Paare (Emoji), Rückseiten zufällig aus 4 Farben, Fehler = Herz; Sterne = übrige Herzen. Rechnen: Zahl aus `calcRange` (L1 2–40 … L20 100–170, immer checkbar), Schema-Scheibe mit gleich breiten Ringen zum Antippen, `validFinish`, Zeit `calcTime`.
  - Einstufung: Intro → `placement` (jede Fähigkeit Level 1, ohne Energie, Kreis wie Fähigkeit 0) → `player.assessed`. Freies Training im Titelmenü (`practice`, ohne Karriere, keine Wirkung).
  - Formverlust (`decayWeek` in `nextWeek`): Warnung ab 7 Wochen, ab 9 Wochen je Woche 35 % Chance auf −1 (ab 13: −2, je 4 Wochen +1), immer letzter Stern des höchsten Levels.
  - Getränke (`DRINKS`): Bier +20 % Energie, Schnaps +25 % + Rausch +2, Wodka +30 % + Rausch +3 + niedrigste bestehende Beziehung +1. Rausch (`player.buzz`) = Bonuspunkte auf alle trainierbaren Fähigkeiten bis Wochenende (`soberUp`). Darts (`DARTS`, 10–350 ★): dauerhafter Bonus solange ausgerüstet (`player.gear`, `player.darts`). Bonus über `skillEffective` (max. 60) in `syncAttrs`, nie auf Mental.
- **Beziehungen**: Manager, Fans, Freundin, Sponsoren (+ Zufriedenheit, Lifestyle). **Team**: Manager (Agent, Provision), Fitnesstrainer (Energie-Erholung). Kein Casino.
- **Lifestyle-Shop**: Gegenstände, Fahrzeuge, Immobilien einmalig kaufen (statt Jahresmiete).
- **Umsetzung Etappe 5** (`js/career.js`, `data/team.js`, Screens `team` (= nteam), `sponsors` (= nsponsors), `goals`, `weekly`, `season`, `interview`):
  - Manager (`MANAGERS`, Stufe 2/3 ab Star-Status 10/30 oder PDC Top 64/16): Provision 10/15/20 % auf Preisgeld (`inst.cut`), Sponsor-Angebote 22/32/45 %/Woche (ohne Manager 6 %) und Betrag ×1/1,3/1,7; Beziehung startet bei 50, Titel +4, Interviews ±, Saisonziele (n·8 − 10), zufällig −1; bei 0 Kündigung. `state.team = {manager, trainer}`.
  - Fitnesstrainer: seit Version 7.3 Festpreis-Pakete mit wechselnden Angeboten (siehe Version 7 oben).
  - Sponsoren (`state.nsdSponsors = {active, offer}`): 1 Vertrag je Platz (4), Wochenzahlung; Angebot 3 Wochen gültig, Betrag aus Status/Fans/Rang (`sponsorBase`) × Status-Faktor. Verhandlung Höher/Niedriger (`negotiate`): Treffer +15 % (max. 5 = +75 %), Fehler −10 % und Ende; jederzeit annehmen/ablehnen.
  - Saisonziele (`setGoals`, KW 1 + Karrierestart): PDC-Rang (×0,8, außerhalb Top 64 mind. 64; sonst ×0,7), Matchsiege (Vorjahr + 4, mind. 8), Turnierergebnis (Vorjahresbestes + 1 Runde, mind. Letzte 32). Abrechnung im Saisonbericht: 15/10/10 Basis-★ + 10 Star-Punkte je Ziel.
  - Interview (`maybeInterviewNsd`): nach jedem Titel und nach Finale/Halbfinale außerhalb der Pro Tour; 3 Fragen, bescheiden (+1 Fan, +3 Status) / selbstbewusst (+1–2, +4–6) / großspurig (Risiko: +4/+9 oder −3/0).
  - Wochen-Update (`weekly`, nach „Weiter“: Energie, Sponsoren, Trainer, Neuigkeiten), Saisonbericht (`seasonReport` vor `yearEnd`: Bilanz, Ziele, Auszeichnungen Spieler/Pro-Tour-Spieler/Newcomer des Jahres + Fan-Liebling ab 75 Fans; eigene Auszeichnung → ★ + 30 Status-Punkte).- **Umsetzung Etappe 4** (`js/life.js`, `data/lifestyle.js`, `data/lifeevents.js`, `data/achievements.js`, Screens `lifestyle`, `lifeevent`, `achievements`, `life`):
  - Shop (`LIFESTYLE`, 14 Artikel, 8–4.200 Basis-★): Lifestyle-Punkte (Summe, max. 100 → `player.lifestyle`), Zufriedenheit sofort, Immobilien Erholung +5/10/15/20 % pro Woche (beste zählt, `homeRegen`). Besitz `player.owned`.
  - Wöchentliche Erholung `weeklyEnergy` = 40 + beste Immobilie + (Zufriedenheit − 50)/5. Zufriedenheit nähert sich wöchentlich zu 20 % dem Ziel 35 + 0,3·Lifestyle + Freundin (5 + 0,15·Beziehung) + 0,1·Fans + 1,5·Selbstvertrauen (`lifeWeek`).
  - Ereignis-Karten (`LIFE_EVENTS`, 18 Stück mit Bedingungen): 35 %/Woche, nie zweimal hintereinander, offen in `state.lifeEvent` bis entschieden (Hub-Hinweis, „Spielen“/„Weiter“ führen zuerst dorthin). Optionen mit Effekten (Energie, Zufriedenheit, Fans, Freundin, ★, Trainingsrückstand, Zufallsausgang).
  - Freundin: über Ereignis „meet“ (60 %), Name in `player.partnerName`, Beziehung −1/Woche, bei 0 Trennung; im Leben-Screen Geschenk (4 Basis-★, +5) oder Schluss machen. Manager/Sponsoren-Beziehungen folgen in Etappe 5.
  - Erfolge (`ACHIEVEMENTS`, 26): einmalig, Belohnung in ★ × Status-Faktor, geprüft wöchentlich, nach Käufen/Ereignissen und Turnieren (`checkAchievements`), gespeichert in `state.achievements`. **Tourcard verloren** → „Last Chance“-Event, sonst Karriereende.

### Oberfläche (js/ui/nsd/)
- `frame.js`: Rahmen (Glasdach, Pixel-Zuschauer oben/unten aus `crowd.js` per Canvas, Geländer), `titleBand`, `darkBar`, `meter` (grüne/rote/graue Glanzbalken mit Icon), `header` (✖ Menü · Name · ? Hilfe), `bar` (untere Leiste, 4 Spalten, `wide` = 2), `card` (Vollbild-Text + ✔), Icons `starIcon`/`heartIcon`/`coin`, `bindHead`.
- `css/nsd.css`: Schrift Jost (Logo Anton), graue Glanz-Buttons, dunkle Leisten, grüner Rasen (`bg-green`), Tabellen (`.nsd-table`, Zone blau, eigene Zeile grün), Modals im NSD-Look (`body.nsd-on`). Max. 480 px breit (Handy-Hochformat).
- Router: Screen-Module mit `export const nsd = true` werden randlos gerendert (`.nsd-root`). Screens: `title` (= `menu`), `slots`, `options`, `welcome`, `newprofile`, `intro`, `hub` (= Status), `skills`, `life`, `league`, `week` (= `tourweek.js`: Turniere der Woche, Melden, Weiter), `event` (= `tourevent.js`: Lobby VS, Spielen/Simulieren, Ausgeschieden, Ergebnis), `live` (DartConnect-Liveticker + Zielmechanik), `matchstats` (Spielbericht, Note), `news` (= `newsfeed.js`, Darts News; `{flash:true}` = Schlagzeile als Browser-Karte, nach Titeln), `trainlevels` ({key}), `minigame` ({key, level, mode: train|placement|practice, step}), `placement` ({step}), `practice`, `drinks`, `darts`, `lifestyle`, `lifeevent` ({back} bzw. {result}), `achievements`, `goals`, `weekly`, `season`, `interview`, `team`, `sponsors`, `calendar`, `tour`, `stats`, `careerEnd`. Es gibt nur noch NSD-Screens.
- Speicher-Schlüssel `newStarDarts.slot.N` (alte Darts-Career-Stände werden nicht übernommen).

## Arbeitsregeln
- Alles auf Deutsch (UI, Texte, knappe Kommentare).
- Chirurgische Edits, keine Komplett-Rewrites. Kurze Rückmeldungen.
- Unklar → sinnvollen Standard wählen, in `STATUS.md` unter „Annahmen“ notieren.
- Reines HTML/CSS/JS (ES-Module), keine Build-Tools, keine Abhängigkeiten.
- Logikmodule (`js/*.js` außer `main.js`, `matchUI.js`, `js/ui/**`) sind DOM-frei → in Node testbar.
- Zufall nur über `js/rng.js` (seedbar, Zustand liegt im Spielstand `state.rng`).

## Dateistruktur
```
index.html            Einstieg, lädt js/main.js; App-Icon/Manifest (img/, manifest.webmanifest)
css/base.css          Design-Tokens, Reset, Typo, Layout
css/components.css    Button, Kachel, Karte (FUT), Tabelle, Modal, Toast, Bracket, Kalender
js/main.js            Bootstrap + Router (app.go(screen, params)), Auto-Save
js/rng.js             RNG (mulberry32) mit Zustand {s}
js/util.js            Formatierung (€, Zahlen de-DE), Datum/KW, esc()
js/state.js           Neue Karriere, Speicher-Slots (localStorage), Export/Import JSON
js/player.js          Perzentil-Attribute (sco/fin/men/foc/cal), Erfahrung (exp −4…+10), Average-Kurve, XP, calcError()
js/training.js        Wochenplan: Training/Ruhetag/Sponsortermin/Exhibition (1 pro Woche), Formverlust, Ermüdung
js/decisions.js       Checkout-Entscheidungen im DartConnect (Wege, geschätzte Chancen, gewählter Weg)
js/world.js           KI-Welt (Tiers, Tourcards), Ruhestand/Nachwuchs/Entwicklung (developWorld), updateTiers
js/calendar.js        Wochenkalender, Events pro Woche, advanceWeek (Datum/Alter)
js/season.js          nextWeek(): KI-Turniere der Woche, Jahresabschluss (Tourcards, Kartenverlust), News
js/bracket.js         K.-o.-Baum: Setzliste, Freilose, Rundennamen, Platzierungen; Gruppenphase (Grand Slam)
js/majors.js          Majors/WS/PL: Qualifikation + Felder (state.qual), World-Cup-Teams, Premier-League-Tabelle
js/tournaments.js     Berechtigung, Meldung, Feld/Setzliste, Mehrfach-Events (sub), Preisgeld/OOM, KI-Hintergrundturniere
js/matchEngine.js     Schnelle Simulation (Aufnahme-basiert), für Sim-Modus + alle KI-Hintergrundmatches
js/board.js           Scheibengeometrie (mm), scoreAt(), targetPoint(), Checkout-Wege, suggestTarget()
js/matchState.js      Dartgenauer Match-Zustand (Bust, Double-Out, Legs/Sets, Stats) – serialisierbar
js/throwModel.js      KI-Dart (Gauß um Ziel, σ aus Attributen), Parameter fürs manuelle Zielen, wave()
js/rankings.js        Order of Merits: addMoney(), orderOfMerit(), rankOf()
js/finance.js         Kontostand, Buchungen, Kosten pro Event
js/sponsors.js        Sponsoren: Angebote (alle 4 Wochen), Verträge, Zahlungen, Kündigung, Ablauf
js/history.js         Statistik-Archiv: Saisonbilanzen, Titel, Bestergebnisse, Höchstplatzierungen
js/news.js            Nachrichten-Feed
js/staff.js           Team: Manager (Provision in finance.book, Sponsor-/Gagen-Boni, Exhibition-Einladungen), Trainer (1 Jahr, XP-Faktor)
js/form.js            Bühne (Erfahrung zählt in Majors/gegen Top 16) + Selbstvertrauen/Momentum
js/rival.js           Rivale: Erzeugung, gezielt in lokale/DDV/WDF-Felder, Duelle/Bilanz, hält mit (Jahresende)
js/mishaps.js         Zufallsereignisse (Finger, Schule ≤ 18, Zahn, Rücken, Erkältung, Magen-Darm)
js/milestones.js      Meilensteine (einmalig, Extra-XP; Match-, Titel- und Ranglisten-Meilensteine)
js/interviews.js      Interviews nach Majors (Floskel-Memory 5×5, Belohnung XP + Clutch)
js/nsd.js             New Star Darts: Spielermodell (Fähigkeiten 0–60, Star-Status, Energie, ★, Getränke, Beziehungen), newNsdCareer, syncAttrs, ★-Preistabellen, Energie-/Status-/Noten-Regeln
js/skilltrain.js      New Star Darts: Training/Minispiel-Parameter, Einstufung, Formverlust, Getränke, Darts-Shop
data/secondary.js     Nebentouren (Women's Series, Asian Tour, CDC, DPA, DPNZ, Nordic & Baltic, Osteuropa): je Top 8 der Vorjahres-OOM, Ø-Basis; Spieler tier 'secondary' (IDs S…, `circuit`), `secondaryOrder(state, circuit, year)` = Jahres-OOM; Spieler mit 4. Wert = fester Nutzer-Ø × (1 ± `SECONDARY_SPREAD` 15 %) je Karriere (cdlc, africa)
data/gear.js          Getränke und Darts (Preise in Basis-★, Boni)
js/career.js          New Star Darts: Manager, Fitnesstrainer, Sponsoren (Höher/Niedriger), Saisonziele, Interview, Saisonbericht, Auszeichnungen
data/team.js          Manager, Fitnesstrainer, Interview-Fragen
js/life.js            New Star Darts: Lifestyle-Shop, Zufriedenheit, Erholung, Ereignis-Karten, Freundin, Erfolge
data/lifestyle.js     Lifestyle-Artikel · data/lifeevents.js Ereignis-Karten · data/achievements.js Erfolge
js/ui/nsd/            NSD-Oberfläche: frame.js (Bausteine), crowd.js (Pixel-Zuschauer), screens/*.js
css/nsd.css           NSD-Design
js/home.js            Wohnen & Auto: Auszug mit 18, Jahresmiete, Wohnungs-Effekte, Auto (Reiserabatt, Wartung)
js/slump.js           Formtiefs: Auslöser (Niederlagenserie, Blamage, Abheben, Ausgebrannt, Privates), Malus, Ende
js/expenses.js        Einmalige Kosten bei hohem Vermögen (Chance steigt mit dem Kontostand)
js/distractions.js    Störmomente in der DartConnect-Simulation (planen, Chancen, auswerten)
js/ui/components.js   Toast, Modal, Spielerkarte, Tabelle, Header
js/ui/boardSvg.js     Dartscheibe als SVG (Liveticker, Minispiele)
data/nations.js       Nationen + Flaggen
data/players.js       Spielerlisten: TOUR_TOP64 / TOUR_EXPIRING / TOUR_NEW_2026 (=128), Challenge 92 (62 Nutzerliste + 30 fiktiv), Dev 98 (Nutzerliste), Lokal 50
data/names.js         Vor-/Nachnamen je Namensraum (DE, NL, EN, PL, CZ, HU, NORD, BALT, FR, IB, IT, GR, BALK, JP, CN, IN, PH, LA, AF), randomName(rng, nation)
data/regions.js       16 Bundesländer mit Städten (lokale Turniere)
data/distractions.js  Störmoment-Situationen mit je 2 Optionen
data/staff.js         Manager (3 Stufen) und Trainer (3 Stufen), Exhibition-Orte
data/interviews.js    Interview-Floskeln
data/sponsors.js      Fiktive Sponsoren (3 Stufen), Vertragsplätze, Vertragsarten
data/tournaments.js   Jahreskalender (KW-basiert), Kategorien, Formate
data/prizemoney.js    Preisgeldtabellen in €
tests/run.mjs         Node-Tests (Regeln, Checkouts, Turnierablauf, Live-Match)
tests/*.mjs           Kalibrierung: calib (Sim), fitSigma/calibDarts (KI-Darts), humanSim (manuell), season, nsdCareer (Bot spielt N Saisons New Star Darts: `node tests/nsdCareer.mjs 6 1 0.6`)
```
Start lokal: `python3 -m http.server` im Projektordner → http://localhost:8000 (ES-Module laufen nicht über file://).

## Datenmodell (Spielstand `state`)
```
version, slot, savedAt, rng:{s}, date:{year, week}
player: {id:'P', name, nation, region (Bundesland), hand, age, attrs:{sco,fin,men,foc,cal}, exp, clutch, level (1–100), xp (Rest im Level), xpTotal, pointsEarned, points,
         tour:'none'|'tour', cardUntil (letzte gültige Saison), qschoolYear (→ CT/Dev-Berechtigung), avgReal, everTourcard}
world:  {version:3, nextId, players:{id:{id,name,nation,age,avg,tier,cardUntil,cardVia,attrs,exp}}}   cardVia = Herkunft der Karte (auch player.cardVia)   tier: tour|challenge|dev|ddv|local
        Fiktive Spieler (L, V, F, G, A, letzte 30 C = CT_FICTIONAL, Rivale) bekommen bei jeder neuen Karriere zufällige, zur Nation passende Namen (`randomName`); echte Spieler (T, X, N, C, D) bleiben.
        IDs: A=fiktive Amateure für Qualifier (tier amateur), R1=Rivale (rival:true), F=schwacher fiktiver CT/Dev-Pool, T=Top64, X=Karte Ende 2026 verloren, N=neu 2026, C=Challenge, D=Dev, V=DDV-Pool (63), L=lokal, G=generierte Talente
rankings:{seeded, years:{[year]:{challenge|dev|pdc|protour|eto|ws:{[id]:€}}}}   (2025/2026 = Startwerte PDC; eto/ws versteckt)
qual:   {[year]:{[eventId]:[Feld], wmAuto, wmqSurvivors, wcTeams}}   Felder ab Event-Woche fixiert
pl:     {[year]:{players:[8], points, legs, nights}}
week.extras: [eventIds]  Zusatz-Events der Woche (Premier League)
finance:{balance, tx:[{year,week,text,amount,cat}]}
week:   {played:bool, eventId}         aktuelle Woche
activeEvent: Turnier-Instanz oder null: {eventId, cat, sub/count (Teil-Turnier), rounds[{name,remaining,format,matches[{a,b,winner,score,bye}]}],
         stopAt (Q-School 4, ET-Quali 32), isQualifier, cards, oom:[Typen], place ('W','F',…,'CARD','QUAL','NQ'), hasNext, survivors, clutch,
         live:{m,me,mods:[{side,mult,visits}],dist:{id,atVisit,who,done}|null}|null}
champions:{[year]:[{week,eventId,name,cat,id,who,nation}]}  Sieger aller Turniere ab Karrierestart (ohne Lokal/Q-School/Quali/PL-Spieltage)
news:[{year,week,type,title,text}], results:[{year,week,eventId,name,cat,place,prize}]
stats:  {career:{...}, seasons:{[year]:{...}}}
training:{progress:{[attr]:0..1}, idle, sessions, lost}   week.activity = train|rest|sponsor|exhibition, week.trained = Attribut
player.levelSeen (zuletzt gefeiertes Level), player.fatigue 0–100, player.momentum −10…10, player.prep {key,bonus,weeks}, state.lastTrained;  live.route = {start, darts} (gewählter Checkout-Weg), live.coDec = {left, asked}
milestones:{[id]:{year,week}}, exOffer:{fee,city,until}|null, week.blocked (Ausfall), week.playCount (gewählte Turnieranzahl), hnq:{etId,year}
rival:{id,w,l,meetings:[{year,week,event,round,won,score}]}
player.slump {id,icon,label,weeks,malus}|null, player.lossStreak, player.home {id,year,week}|null (null = Elternhaus), player.car {id,paid,year}|null, player.proMatches (Lampenfieber), moveOut:{year,week,notified}
staff:{manager:{…,cut,since,paid}|null, coach:{…,xp,until}|null, gigs:[{id,kind,city,fee,until}]}, interview:{event,place,tiles,seq}|null
sponsors:{active:[{name,slot,type,amount,years,start,until,paid}], offers:[{…,expires}], total}, ended:bool
archive:{seasons:{[year]:{…}}, titles:[], bests:{[key]:{place,year}}, peak:{pdc|challenge|dev:{rank,year,week}}}
```
Speicher: `localStorage['dartsCareer.slot.N']` (N=1..3), Auto-Save nach jeder Woche und nach jedem Turnier.

## Spielregeln (Kurzfassung Spezifikation)
- **Start**: Jahr 2027, KW 1, **Alter wählbar 16–30** (`START_AGES`; Erfahrung `startExp` = −4 + 1 je 2 Jahre über 16, max. +3; Rivale gleich alt), Budget 5.000 €, keine Tourcard, Bundesland wählbar (bei Nation DE). Alle Attribute 60 + **25 Bonuspunkte** frei verteilbar bei der Erstellung (1 Punkt = +1, max. 85 je Attribut; Start erst wenn alle verteilt; `startAttrs(bonus)`), Erfahrung je nach Alter.
- **Attribute** (1–100) sind **Perzentile**: „stärker als X von 100 Dartspielern“ – nicht der Average.
  - Scoring (sco) → Average über Kurve `AVG_CURVE` (40→53, 60→65, 80→79, 90→89, 95→95, 99→103, 100→106 Ø).
  - Finishing (fin) → Checkout-Basis 6 % + 0,37 %·fin (60 → 28 %, 100 → 43 %).
  - Mental (men) → Druck bei Matchdarts/Entscheidungslegs. Fokus (foc) → Konstanz, Tagesform, Ausdauer, Störmomente.
  - Rechnen (cal) → Fehlerquote `calcError` = (100 − cal)·0,3 % (60 → 12 %): Stelldarts auf Bogey-Zahlen (159/162/163/165/166/168/169), falsches Doppel (Bust/kaputter Rest), falsche Wege (Checkout-Chance × (1 − 0,6·ce)). Dart-Modell: `maybeMiscalc` in throwModel. Stat `bogey` (Aufnahmen, die auf Bogey enden), im DartConnect mit ⚠ markiert. Rechnen 40 vs 95 ≈ 40 % Siegchance.
  - Gesamt = 0,36·sco + 0,27·fin + 0,13·men + 0,13·foc + 0,11·cal.
- **Erfahrung** (exp, −4 … +10): Clutch-Faktor. Matchdarts: Sim-Checkout × (… + 0,025·exp); Dart-Modell σ × (1 − 0,025·exp); Entscheidungsleg-Scoring ±0,6 %/Stufe. +10 vs −4 bei gleichen Werten ≈ 60 % Siegchance. Wächst über Clutch-Punkte (Match 2, Entscheidungsleg +3, gewonnen +3, × Kategoriefaktor); Schwellen `EXP_STEPS`. KI: nach Ebene/Alter, jährlich +1 (Chance).
- **XP/Training**: Match 10, Sieg +15, +6 je Runde (max 6), Titel/Karte +40, **Teilnahme +45**, × Faktor (lokal 0,55, DDV 1,4, CT/Dev/Q 1, PC/ET 1,5, Majors 2). **Level 1–100** (Start Level 1, 0 XP): Aufstieg L → L+1 kostet `xpForLevel(L)` = 50·L·(1 + 2·((L−1)/99)²) XP (gerundet auf 10: 50, 100, 150 … L50 ≈ 3.750, L99 = 14.650; Summe bis L100 ≈ 491 Tsd.), je Aufstieg **steigend 1 → 7 Attributpunkte** (`pointsForLevel`: Level 2–4: 1, 5–8: 2, 9–14: 3, 15–25: 4, 26–40: 5, 41–60: 6, 61–100: 7; Summe bis L20 = 53, bis L50 = 208, bis L100 = 548). Kosten je Stufe: 1 (<70), 2 (70–84), 3 (85–94), 4 (≥95). Training direkt nach jedem Turnier (Panel im Turnier-Screen) oder im Profil.
- **Training** (`training.js`): 1 Einheit pro Woche (zusätzlich zum Event, kostenlos) auf ein Attribut. Bringt (a) **XP** = 3 % von `xpForLevel(level)` × Qualität (0,7/1/1,3), mind. 10 (`trainingXp`); (b) **Turniervorbereitung** `player.prep = {key, bonus:3, weeks:2}` → +3 auf das Attribut in `perf` für Turniere dieser + nächster Woche; (c) langsamen Dauer-Fortschritt: +1 nach 5 × Attributkosten Einheiten (60 → 5, 75 → 10, 90 → 15, 95+ → 20). **Jedes Attribut mind. 1× in 6 Wochen trainieren** (`training.idleBy` je Attribut, `DECAY_AFTER` 6): ab 6 Wochen ohne Training pro Woche Risiko 25 % (+10 %/Woche, max. 60 %) auf −1 bei genau diesem Attribut (nicht unter 50). Reihum trainieren (5 Attribute, 1 Einheit/Woche) verhindert jeden Verlust. Warnung ab 5 Wochen (Wochenplan je Attribut, Hub-Kachel); „⏭ Nächstes Event“ trainiert automatisch das am längsten liegengelassene Attribut (`mostOverdue`). Bot-Balancing: mit Training Tourcard nach ~7–8 Saisons (seit steigenden Level-Punkten); ohne Training Stagnation bei Gesamt ~67–70.
- **Wochenplan**: genau EINE Aktivität pro Woche (zusätzlich zum Turnier): Training · Ruhetag (Ermüdung −30) · Sponsortermin (nur mit aktivem Vertrag; je Sponsor 4 % Jahresgehalt / 60 % Antrittsgeld / 30 % Bonus, mind. 150 €) · Exhibition **nur auf Angebot** (`state.exOffer`, ab Tourcard, 30 %/Woche, 2 Wochen gültig; Gage = (400 + 60·Level) × Manager-Faktor × 0,8–1,2; XP = 5 % des Level-Bedarfs, +3 Clutch, Ermüdung +20).
- **Ermüdung** (player.fatigue 0–100): +4 je gespieltem Match +4 Reise (nicht lokal), −10 pro Woche. **Erholung kaufen** (Wochenplan, zusätzlich zur Aktivität, je 1× pro Woche): Sauna −10 %, Massage −15 %, Preis 50–100 € (je Woche fest, `recoveryPrice`); `week.recovery`. Über 30 %: Leistung sinkt linear bis 100 % (−6 Scoring, −8 Fokus, −4 Finishing; nur in `perf`).
- **Sprung** „⏭ Nächstes Event“ (`jumpToNextEvent`): überspringt Wochen bis zu einem spielbaren Nicht-Lokal-Event (max. 20), trainiert dabei automatisch (zuletzt trainiertes bzw. schwächstes Attribut); 0 Wochen, wenn diese Woche schon eins ansteht.
- **Kalender**: ISO-KW 1–52 (KW 53 wird übersprungen). Pro Woche max. ein Event. „Weiter“ → nächste Woche.
- **Kosten**: Anmeldegebühr 25 € (Q-School, Challenge, Dev). Reise: England/UK 600 €, Deutschland 250 €, sonst 400 €. Lokal: kostenlos, keine Reise. Melden nur bei genug Budget. **Preisniveau** steigt mit dem Level: × (1 + 1 % · (Level − 1)), auf 5 € gerundet (`priceFactor`/`levelPrice` in finance.js) für Reise, Sauna/Massage, Wohnung und Auto; **Startgebühren bleiben immer 25 €** (nur Q-School/CT/Dev/DDV/HNQ; PC, ET und Majors ohne Gebühr); Anzeige im Finanz-Screen.
- **Lokale Turniere**: jede Woche außer KW 52, nur im eigenen Bundesland (Städte aus `data/regions.js`), 16 Spieler, immer best of 5 (first to 3, auch im Finale) (fiktiv, nur Deutsche, Listenwert − `LOCAL_SHIFT` 6 → Ø 54–74), Siegprämie zufällig 50–200 €, Finalist 40 %, Halbfinale 20 %.
- **DDV-Ranglistenturniere**: 4 pro Jahr (KW 9, 20, 33, 44), nur ohne Tourcard, 64 Spieler (DDV-Pool ~66–88 Ø), Gebühr 25 € + Reise DE 250 €, Preisgeld Sieg 350 €, Finale 100 €, XP-Faktor 1,4.
- **WDF-Opens** (Kategorie `wdf`, nur ohne Tourcard): 17 Events nach WDF-Kalender 2026, max. 1 pro Woche (KW 3 Las Vegas … KW 47 Czech Open; Liste `WDF` in data/tournaments.js), Kategorie Platinum/Gold (128er-Feld) bzw. Silver/Bronze (64). Feld = zufällige Auswahl aus Spielern ohne Karte + DDV-Pool, keine Setzliste, first to 4, ab Viertelfinale 5, Finale 6. Preisgeld: Sieg 1.000–2.500 € (Band je Kategorie: Platinum 2.200–2.500, Gold 1.700–2.200, Silver 1.300–1.700, Bronze 1.000–1.300; je Event+Jahr fest, `wdfPrize`), Finale 500, HF 250, VF 100 €. Keine Gebühr; Reise Europa 400 €, Übersee 1.000 €. **XP-Boost** zufällig ×1,2–1,6 je Turnier (`inst.xpBoost`, 0,05-Schritte, ersetzt den Kategoriefaktor für XP + Clutch), keine OOM; KI-Ausgaben laufen im Hintergrund (Titelträger).
- **Tour-Struktur (Phase 3 umgesetzt)**:
  - Tourcard gilt 2 Jahre. Am Saisonende: PDC-OOM Top 64 → `cardUntil = max(cardUntil, Jahr+1)` (+1 Jahr); auslaufend und außerhalb Top 64 → Verlust.
  - Start 2027: 2026er Top 64 (bis 2027) + 33 Neue 2026 (Q-School 2026 + CT/Dev 2025, bis 2027) + je Top 2 CT/Dev 2026 (= Listenplatz 1–2: Hunt, Coulson / Drayton, Beeton; bis 2028) = 101 Karten; 31 Holder im zweiten Kartenjahr verlieren die Karte → Q-School.
  - Q-School KW 2: UK (Milton Keynes, Nationen UK/IRL/AUS/USA…) und EU (Kalkar, Rest). Je 4 Tage, jeder Tag K.-o. ohne Setzliste, first to 5; wer das Halbfinale erreicht (letzte 4) → Tourcard bis Ende Folgejahr. Kartengewinner fehlen an späteren Tagen. Teilnahme → CT-Berechtigung für das Jahr. **Dev Tour braucht keine Q-School**: ohne Tourcard offen für alle bis 23.
  - **Anzahl wählbar** (`pick: true` bei CT/Dev/HNQ): bei der Meldung 1–max Turniere, Gebühr 25 € je gespieltem Turnier (`eventCost(ev, n)`, `week.playCount`); die übrigen laufen im Hintergrund.
  - **Host-Nation-Qualifier** (`hnq`, Woche vor jedem ET-Event, Land = ET-Land): nur ohne Tourcard und Nation = Gastgeberland (Deutsche → 7 deutsche ET-Events), bis zu 4 Turniere (Feld 64: Spieler ohne Karte/DDV/lokal dieser Nation ohne bisherige HNQ-Sieger, first to 4, Finale 5, kein Preisgeld). Jedes der 4 Turniere vergibt 1 Platz im ET-Hauptfeld (auch im Hintergrund); zu wenige Spieler der Nation (< 36) → **fiktive Amateure** (`addAmateurs`, tier 'amateur', IDs A…, Ø 58–72, nur in HNQ/Regional-Qualifiern, keine Entwicklung), ebenso Nordic & Baltic/Osteuropa (mind. 8 Kandidaten); eigener Sieg → Hauptfeld, restliche Gebühren werden erstattet.
  - Challenge Tour: 5 Wochenenden × **5 Turniere** (KW 11/19/29/37/42; Dev KW 14/22/32/39/43; `TOUR_WEEKEND_EVENTS`), Feld = alle ohne Karte (Challenge+Dev) + Spieler, Setzliste nach CT-OOM, Freilose. Modus: Challenge durchgehend Best of 9 (first to 5), Dev Best of 7 (first to 4), ab Viertelfinale Bo9. Dev Tour analog nur ≤ 23 (ohne Q-School-Pflicht). Preisgeld je Turnier (beide): Sieg 3.000, F 2.000, HF 1.000, VF 750, L16 350, L32 250, L64 100 €. Dev-Niveau 4 Ø unter CT (Dev-Liste abgesenkt, außer `DEV_AT_CT_LEVEL`); schwacher fiktiver Pool F1–F90 (50 Dev 64–72 Ø, 40 CT 68–75 Ø, `addWeakPool`); Pool-Obergrenze ohne Karte 300; neue Talente 70–82 Ø. Youth-WM (KW 45) zählt nicht zur OOM.
  - KI-Events laufen im Hintergrund (season.nextWeek → simulateWeekAI), Preisgeld → OOM.
  - Jahresende: CT-OOM Top 2 + Dev-OOM Top 2 (ohne Karte, Preisgeld > 0) → Karte bis Jahr+2. PDC-OOM-Rang ≤ 64 → Karte +1 Jahr, auslaufend außerhalb → Verlust → Challenge. Danach developWorld: Stärke nach Alter (jung +, alt −), Ruhestand ab 45 (tier 'retired', bleibt für Historie), jährlich ≥ 12 Talente (16–18 J.), Dev-Pool ~90; Pool ohne Karte max. 200 (schwächste Challenge-Spieler ab 26 hören auf). Neujahr: Alter +1, Dev ab 24 → Challenge.
  - Tourcard-Holder nicht auf Challenge; Dev Tour nur Holder ≤ 23 außerhalb der PDC-Top-64 (`devHolders`, auch du – ohne Q-School-Pflicht). Dev-OOM-Karten gehen nur an Spieler ohne Karte.
- **Pro Tour (Phase 4 umgesetzt)**, nur mit Tourcard:
  - Players Championships: 15 Doppel-Blöcke (30 Turniere), Feld = bis 128 Tour-Holder nach PDC-OOM, freie Auslosung, Best of 11 (first to 6), Halbfinale Bo13, Finale Bo15. Preisgeld 17.500 € Sieg … 1.150 € Letzte 64.
  - European Tour: 14 Events, Feld 48 (`etEntrants`): **Top 16 PDC** (gesetzt, Freilos in Runde 1) + **Top 16 Pro Tour OOM** (ohne die Gesetzten) + **10 TCHQ** + **4 HNQ** (je HNQ-Turnier 1 Platz) + je 1 **Nordic & Baltic** / **Osteuropa** (`ET_REGIONS`, Spieler ohne Karte, nur Hintergrund) – fehlende Plätze per Pro-Tour-Rangliste aufgefüllt. first to 6, HF 7, F 8. Preisgeld 35.000 € … 1.500 € (Letzte 48). Ergebnisse der Qualifier in `qual[year].et[etId] = {tchq, hnq}`.
  - **Tour Card Holder Qualifier** (`etq-N`, Kategorie `etq`, Zusatz-Event): in der Woche des letzten PC-Blocks vor dem ET-Event, für alle Holder ohne direktes Ticket (`etDirect`), freie Auslosung in 10 Sektionen (`sections` in buildRounds) → 10 Qualifikanten, kein Preisgeld; Kosten nach dem PC-Block nur eine Übernachtung extra (`ETQ_NIGHT` 150 € × Preisniveau), sonst normale Reise.
  - Preisgeld PC/ET → PDC OOM (2 Jahre) + Pro Tour OOM (1 Jahr). Startwerte: Saisons 2025/2026 vorbelegt (Top 64 ≈ 2,8 Mio. € · Rang^−0,8; übrige 2026er Holder 12–150 Tsd. €).
  - PC/ET laufen ohne Spieler im Hintergrund (AI_CATS) → Top-64-Entscheidung am Jahresende nach echtem Preisgeld.
- **Majors & Events (Phase 5 umgesetzt)** – Feld wird in der Event-Woche aus den Ranglisten berechnet (`majors.js`); wer qualifiziert ist und nicht meldet, wird durch einen Nachrücker ersetzt (PL/World Cup: automatisch mitgespielt).
  - Masters (KW 5): Top 24 PDC, Top 8 Freilos. UK Open (KW 10): alle Holder + Top 32 CT-OOM (auch du ohne Karte), Setzliste nach PDC.
  - World Matchplay (KW 29) & World Grand Prix (KW 40, Sätze; Double-In vereinfacht weggelassen): Top 16 PDC + Top 16 Pro Tour.
  - European Championship (KW 42): Top 32 der ET-Wertung (Preisgeld ET-Hauptfelder). PC Finals (KW 48): Top 64 Pro Tour.
  - Grand Slam (KW 46): Top 16 PDC + 8 Pro Tour + Top 2 CT + Top 2 Dev + 4 Pro Tour; 4 Töpfe → 8 Gruppen à 4 (first to 5), Top 2 → Achtelfinale (A1–B2 …). G3/G4 Preisgeld.
  - **WM (KW 51–52, Sätze, 128)** – `wmDirect` in majors.js: Top 40 PDC (Top 32 gesetzt) + 40 Pro Tour (ohne die Top 40, rücken nach) + Jugend-Weltmeister (Youth-WM KW 45, `qual.wmYouth`) + Top 3 Dev-OOM + Top 3 CT-OOM + Sieger WM-Qualifier Q-School + **17 internationale Qualifier** (`WM_QUALIFIERS`, Kategorie `wmreg`, KW 47, Frauen KW 44; 35 Plätze: Europa 10 = Super League DE/AT/CH, Westeuropa NL/BE, Mittelmeer, Südosteuropa, Tschechien, Polen, Ungarn je 1 + Nordic & Baltic 3; Asien & Ozeanien 14 = Asian Tour/Championship 7, Japan/China/Indien je 1, AUS/NZ 4; Amerika & Afrika 7 = CDC 4, CDLC 1, Afrika 2; Frauen 4 = fiktive Spielerinnen, nur Hintergrund). Spielbar nur ohne Tourcard für die eigene Region (andere ausgeblendet, `shownTo`), Gebühr 25 €, Übersee-Reise 1.000 €; zu wenige Spieler → fiktive Amateure. Ergebnisse `qual.wmReg[key]`. Doppelt Qualifizierte rücken nicht nach → mehr Plätze für den **Tour Card Holder Qualifier** (`wm-quali`, KW 49, Last Chance für alle Holder ohne WM-Platz, Restplätze = 128 − direkte, Sektionen = Plätze, `wmTchqSlots`; aktuell meist 5).
  - World Cup (KW 24): je Nation die 2 Besten (Tour + Challenge), Team-Werte = Durchschnitt, Preisgeld je Team (dein Anteil 50 %), keine OOM.
  - World Series (8 Events): Top 8 PDC + 8 Qualifikanten (PDC 9–64 zugelost); Finals: Top 24 WS-Wertung. Keine PDC-OOM.
  - Premier League: Top 8 PDC zu Saisonbeginn, 16 Spieltage (KW 6–21) als **Zusatz-Event** (zählt nicht als Wochen-Event), K.-o. first to 6, Punkte 5/3/2/2; Play-offs KW 22 (Top 4). Keine OOM.
  - Majors-Preisgeld → PDC OOM (nicht Pro Tour). Alle Majors laufen im Hintergrund (AI_CATS).
- **Team** (`staff.js`): **Manager** ab erster Tourcard (Stufe 2 ab Top 64, Stufe 3 ab Top 16): Provision 10/15/20 % auf alle Einnahmen (Preisgeld, Sponsoren, Exhibitions; zentral in `book`), dafür Sponsor-Angebotschance 75/90/100 % (statt 60 %), Beträge +10/25/45 %, mehr offene Angebote, Exhibition-Gagen ×1,2/1,5/2 und **Exhibition-Einladungen** (20/30/40 % pro Woche, zusätzlich zum Wochenplan, reines Klick-Event: Gage, XP, Clutch +2, Ermüdung +15). **Trainer**: Einmalzahlung 1.500/6.000/18.000 € für 52 Wochen → alle XP ×1,1/1,2/1,3 und schnellerer Trainingsfortschritt.
- **Bühne** (`form.js`): in Majors/WS/PL (Faktor 1, ab Viertelfinale 1,5) und gegen PDC-Top-16 (0,7) zählt Erfahrung: ±0,5 × Faktor je Stufe über/unter +3 auf Scoring, Finishing, Mental (beide Seiten, in `attrsOf`). Anzeige „🎭“ im DartConnect.
- **Lampenfieber** (`form.js`, `player.proMatches`): in Profi-Events (PC/ET/Majors/WS/PL) −5 Scoring/Finishing/Mental, −3 Fokus, linear abgebaut über die ersten 60 Profi-Matches (≈ erstes Tour-Jahr); nur eigener Spieler (`attrsOf`), Anzeige „😰“ im DartConnect. Alte Spielstände mit Karte: kein Lampenfieber.
- **Selbstvertrauen** (`player.momentum` −10…10): Sieg +1 (gegen Stärkere/Top 16 +1,5), Niederlage −1 (gegen Schwächere −1,5, gegen Stärkere −0,4), lokal ×¼; Titel (nicht lokal) +3; wöchentlich −20 % und 0,3 (negativ 0,6) Richtung 0. Ab ±3: ±1,5/±3/±4 auf Scoring, Finishing, Fokus (`perf`). Anzeige im Hub-Kopf, Profil, DartConnect (🔥/🥶).
- **Interviews** nach Majors (außer WM-Quali), PL-Play-offs, WS-Finals: Chance Sieg 100 %, Finale 80 %, HF 60 %, VF 40 %, sonst 25 %. 25 Floskeln im 5×5-Raster, 4–5 (Sieg 6) leuchten nacheinander grün auf, dann in Reihenfolge antippen; richtig → XP (12 % Level-Bedarf × Länge/5, mind. 30, × Trainer) + 3 Clutch je Floskel; ein Fehler beendet es. Anfrage verfällt nach der Woche.
- **Rivale** (`rival.js`): beim Karrierestart ein gleichaltriges Talent gleicher Nation (Name aus Namenspool), Stärke ≈ dein Gesamtwert (+0–1,5 Ø), Tier Dev/Challenge wie alle ohne Karte (spielt CT/Dev/Q-School im Hintergrund, kann Karten gewinnen, hört nie wegen Pool-Grenze auf). Kommt gezielt ins Feld: lokal 40 %, DDV 80 %, WDF 50 % (nur ohne Karte). Duell → Bilanz, News, Selbstvertrauen +1 (Sieg) / −0,5 (Niederlage) zusätzlich; Banner „⚔️ Rivalen-Duell“ im DartConnect. Titel/Tourcard des Rivalen → News. Jahresende: zieht 50 % Richtung deines Niveaus (Ø aus Gesamtwert) ± Zufall + Saisonduell-News. Screen 'rival' (Vergleich, Duelle), Hub-Kachel.
- **Wohnen & Auto** (`home.js`, Screen 'home', Hub-Kachel): Mit 18 Auszug – zufällige Woche im Jahr (`state.moveOut`) → News + Hub-Hinweis, 2 Wochen Zeit, sonst automatisch Studentenwohnheim. Jahresmiete komplett bei Einzug und jedes Jahr in KW 1 (zu teuer → günstigste bezahlbare Wohnung): Wohnheim 200 € (fix; Erholung −2/Woche, Selbstvertrauen −0,2/Woche, −1 auf alle Attribute in `perf`), WG 400 € (neutral), 1-Zimmer 1.000 € (+2 / +0,2), Haus 15.000 € (+4 / +0,4), Villa 50.000 € (+6 / +0,6); außer Wohnheim × Preisniveau. Umziehen jederzeit (keine Erstattung). **Auto** ab 18: Kleinwagen 4.000 € (Reise −5 %, Wartung 400 €/Jahr), Mittelklasse 15.000 € (−10 %, 900 €), Oberklasse 45.000 € (−15 %, 2.000 €), Preise/Wartung × Preisniveau, Wartung in KW 1; Wechsel → altes Auto für 30 % des Kaufpreises in Zahlung. Rabatt über `travelMult` → `eventCost`.
- **Formtiefs** (`slump.js`, `player.slump`): −malus (1,5–3) auf Scoring, Finishing, Fokus in `perf` für 2–4 Wochen. Auslöser: 4 Niederlagen in Folge (nicht lokal) → Niederlagenserie; Niederlage gegen Gesamt ≥ 8 schwächer → Selbstvertrauen −1,5 + 30 % „Kopfsache“; wöchentlich: Ermüdung ≥ 75 → 25 % „Ausgebrannt“, Selbstvertrauen ≥ 7 → 8 % „Abgehoben“, sonst 2,5 % privat (Liebeskummer, Ärger im Umfeld, Wurfprobleme, neue Darts, Schlafprobleme). Nur eins gleichzeitig. Ende: Wochen laufen ab, Ruhetag −1 Woche, Titel (nicht lokal) beendet sofort. Anzeige Hub + DartConnect.
- **Einmalige Kosten** (`expenses.js`, Kategorie `misc`): ab 10.000 € Kontostand pro Woche Chance 3 % + 3 %·log10(Kontostand/10 Tsd.) (100 Tsd. → 6 %, max. 12 %). Kleine Posten fix × Preisniveau (Bußgeld, Zahnarzt, Equipment, Feier, Autoreparatur nur mit Auto, Wasserschaden nur mit Wohnung, Anwalt ab 40 Tsd.), größere als Anteil vom Kontostand (Familie 2–6 %, Charity 1–3 %, Steuer 6–12 % ab 50 Tsd., Fehlinvestition 4–12 % ab 80 Tsd.).
- **Zufallsereignisse** (`mishaps.js`, zu Wochenbeginn, 7 %): 75 % Trainingsrückschlag (Fortschritt von 1–2 Attributen −30…60 %-Punkte), 25 % Ausfall → `week.blocked`, alle Turniere der Woche gesperrt (Hinweis im Hub). „Schulische Verpflichtungen“ nur bis 18.
- **Meilensteine** (`milestones.js`, je einmal, XP × Trainer): Erster Sieg 30, erste 180 50, erster lokaler Titel 80, 12-/11-/10-Darter 120/250/500, Match mit 100er/110er Ø 300/800, erster WDF-/Dev-/CT-Titel 300/350/400, erstmals PDC Top 64/32/16 600/1.000/1.600, erster Pro-Tour-Titel 1.200, erster Major-Titel 3.000. Liste im Profil.
- **Rankings**: PDC OOM (rollierend 2 Jahre), Pro Tour OOM, Challenge OOM, Dev OOM, Premier-League-Tabelle.
- **Sponsoren (Phase 6 umgesetzt)**: erst nach erster Tourcard. 4 Plätze (Darts-Ausrüster, Trikot, Getränk, Partner), je einer aktiv. Angebote alle 4 Wochen (60 %, max. 3 offen, 6 Wochen gültig). Marktwert = 250.000 € · PDC-Rang^−1,1 (+2 % je Titel, 600–400.000 €). Typen: Jahresgehalt (quartalsweise KW 1/14/27/40, erste Rate bei Unterschrift), Antrittsgeld je Profi-Turnier, Erfolgsbonus ab Halbfinale (Titel ×3). Laufzeit 1–3 Jahre (Top 16 bis 3, Top 64 bis 2), Sponsorstufe nach Rang. Kündigung jederzeit ohne Kosten.

## Match-Engine
- Format: `{legs:n}` = first to n Legs; `{sets:s, legs:l}` = first to s Sets, je first to l Legs. 501, Double Out.
- Simulation aufnahmebasiert: Scoring-Aufnahme ~ Normal(avg·Form, sd(con)), 180er-Chance aus avg; Finish-Bereich (≤170, keine Bogey-Zahlen) mit Wahrscheinlichkeit aus Checkout-Basis × Restpunkt-Faktor; ≤50 dartgenau auf Doppel.
- Stats: Average (Punkte/Darts·3), 180er, 140+, 100+, Checkout-% (Treffer/Doppelversuche), höchstes Finish.
- **Spielmodi im Turnier**: 📺 DartConnect (Screen 'watch', Zuschauen mit Störmomenten) und ⚡ Schnellsimulation (sofort). Manueller Modus vorerst deaktiviert.
- **Checkout-Entscheidungen** (nur DartConnect, `decisions.js`): vor einer eigenen Aufnahme auf 41–170 (kein Bogey) mit 30 % Chance, max. 2 je Match. immer **3 Wege** (`alternativeRoutes`, sonst keine Entscheidung) in gemischter Reihenfolge, angezeigt **nur die Wege**. Ausgang steht fest (`buildOptions`, Skript in `live.route.script`, `scriptedHit`): bester Weg (höchste Monte-Carlo-Chance mit eigenen Werten) → **Check**; zweiter → **sauber runtergespielt** (Stelldarts sitzen, Doppel-Darts daneben → Rest = Doppel ≤ 40; Bull-Rest wird per Single auf ein Doppel gestellt); dritter → **sehr schlechte Aufnahme** (kleinere Nachbar-Singles, Doppel daneben → krummer Rest oder Bust). „★ Empfohlen“ (= Check-Weg) ab Rechnen 75.
- **Schaltungen ans Board** (nur DartConnect, `boardCall`): Dartscheibe als Overlay, Darts einzeln (1,1 s) mit Zielfeld und Treffer (`liveDartStep`) bei: jedem Matchdart (beide Seiten, ≤ 170, kein Bogey), eigenem gewählten Checkout-Weg, großen Finishes 61–170 (35 %), und wenn die ersten 2 Darts T20/T19/T18 sind (180 im Anflug, `isBigTreble`). Banner gold = gut für dich, rot = gut für den Gegner.
- **Störmomente** (nur DartConnect, vor einer eigenen Aufnahme): Wahrscheinlichkeit je Match lokal 50 %, DDV 35 %, sonst 25 %. Situationen je Ebene (Quatschen/Handy nur lokal; Zwischenruf/Zeitspiel DDV+Pro; Auspfeifen nur Pro). 2 Optionen: sicher (höhere Chance, kleiner Effekt) vs. riskant (niedrige Chance, großer Effekt). Chance = base + (Attribut−60)·0,6 % + Erfahrung·1,5 % (10–92 %). Effekt = Streuungs-Multiplikator für n Aufnahmen (eigene oder gegnerische Seite), Anzeige 😤/🔥 im Scoreboard.
- **Manueller Modus** (`matchUI.js`, deaktiviert – Parameter noch auf alter Attribut-Skala): Ziel wählen (Tippen auf Scheibe / Chips, Standard = `suggestTarget`: T20 bzw. Checkout-Weg) → „Werfen“ → vertikale Linie (x) stoppen → horizontale Linie (y) stoppen → Treffer = Schnittpunkt + Gauß-Reststreuung. Bedienung: Tippen, Button oder Leertaste.
  - Linienposition = Ziel + amp·wave(Startphase + t·freq), t aus `performance.now()` → frameunabhängig. amp = 66 − 0,48·sco (mm), freq = 0,75 + 0,6·(1 − sco/99) Hz (y-Linie ×1,13), Reststreuung = 12 − 0,085·con mm.
  - (Hinweis: KI-Attribute haben 1 Nachkommastelle für feine Auflösung an der Spitze; Anzeige gerundet. Tagesform-σ = 0,055 − 0,0003·foc.)
  - Doppel/Bull als Ziel: amp & Streuung × (1,3 − fin/200). Druck (Entscheidungsleg, Doppel-Finish, Match-Dart) × (1 + Last·(1 − ner/99)·1,6). Ausdauer: ab Leg 9 leicht steigend.
- **Gegner-KI** (live): dartgenau, Ziel = `suggestTarget`, Streuung σ je Achse aus Average-Tabelle (`SIGMA_TABLE`, kalibriert mit `tests/fitSigma.mjs`), Doppel-σ aus Checkout-Basis (analytisch). Gleiche Druck-/Ausdauerfaktoren.
- **Schnellsimulation** (`js/ui/screens/watch.js`, Screen 'watch'): DartConnect-Stil, 1 Aufnahme alle 1,5 s (`VISIT_MS`), dartgenaue KI für beide Seiten. Eigener Spieler links; je Spieler Rest groß, daneben rot Leg-Average, weiß Gesamt-Average; Liste aller Aufnahmen des Legs mit Aufnahme-Nr. in der Mitte, Pfeil = wer dran ist, Punkt = Anwurf. Pause / Selbst spielen / Sofort beenden. Nutzt `inst.live` → jederzeit zwischen Zuschauen und Selbstspielen wechselbar.
- **Rest simulieren**: Live-Match wird dartgenau mit KI-Modell für beide Seiten beendet (`simulateLiveRest`). Live-Match wird nach jeder Aufnahme gespeichert und kann fortgesetzt werden.

## Designsystem (FIFA-Look)
- Tokens in `css/base.css` (`--bg`, `--panel`, `--cyan`, `--green`, `--gold`, `--red`, …). Dunkler Blau/Schwarz-Verlauf, Neon-Akzente.
- Überschriften: Saira Condensed, kursiv, Großbuchstaben (`.h-display`). Text: Inter/Systemschrift.
- Schräge Kanten per `clip-path` (`.skew-edge`), Glas-Kacheln (`.tile`), Kachel-Raster `.tile-grid` (responsive).
- Komponenten: `.btn` (`.btn-primary/.btn-ghost/.btn-gold`), `.tile`, `.fut-card`, `.table`, Modal (`ui.modal()`), Toast (`ui.toast()`), `.tag-<kategorie>`.
- Währung immer `fmtEUR()` (de-DE). Kein Walk-on.
