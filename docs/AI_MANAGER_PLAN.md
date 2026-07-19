# NEURAL MANAGER – Der KI-Agentur-Manager
## Game-Design-Plan (v0.1 – Diskussionsgrundlage)

> Arbeitstitel: **NEURAL MANAGER**. Ein Manager-Spiel im Stil klassischer
> Fußballmanager – aber statt eines Fußballvereins führst du eine **KI-Agentur**:
> Du scoutest, trainierst und verkaufst KI-Agenten, nimmst Aufträge an,
> kämpfst dich durch Ligen nach oben und baust ein Imperium auf.
>
> Dieses Dokument ist die Diskussionsgrundlage. Der spielbare One-Shot-Prototyp
> liegt unter `ai-manager/index.html`. Offene Punkte für Frank stehen ganz unten.

---

## 1. Vision & Elevator Pitch

**„Football Manager trifft Silicon Valley."**

Du gründest eine kleine KI-Agentur in der Garage. Deine „Spieler" sind
KI-Agenten (Modelle mit Persönlichkeit, Stärken und Macken). Deine „Spiele"
sind Kundenaufträge und Benchmark-Wettbewerbe. Deine „Liga" ist der Markt:
von der **Garagen-Liga** bis zur **Frontier-Liga**, in der die großen Labs
spielen. Wer 3 Saisons schlampt, steigt ab. Wer liefert, steigt auf – mit
größeren Kunden, teureren Agenten und härterer Konkurrenz.

**Referenzen / Vorgehensmodell:**
- Struktur & Rundenlogik: unser bestehendes KAISER-Spiel (Runden, Events, localStorage, One-File-SPA)
- Ton & Branding: neuralnautic.org und Kaivera *(Anmerkung: beide Seiten waren
  aus der Cloud-Umgebung nicht abrufbar – Farbwelt/Branding gleichen wir im
  nächsten Schritt gemeinsam an; der Prototyp nutzt ein neutrales
  Dark-Neural-Theme mit konfigurierbaren CSS-Variablen)*
- Genre-Vorbilder: Football Manager (Tiefe), Anstoss (Charme), Game Dev Tycoon (Loop)

---

## 2. Kern-Gameplay-Loop (1 Runde = 1 Woche)

```
┌────────────────────────────────────────────────────────┐
│ 1. AUFTRÄGE sichten      → 4–6 Angebote je nach Liga   │
│ 2. TEAM aufstellen       → Agenten den Jobs zuweisen   │
│ 3. TRAINING planen       → 1 Agent pro Woche (Basis)   │
│ 4. MARKT checken         → Scouting, Kauf, Verkauf     │
│ 5. INFRASTRUKTUR         → GPU-Cluster, Slots, Kosten  │
│ 6. WOCHE SIMULIEREN      → Ergebnisse, Event, Tabelle  │
└────────────────────────────────────────────────────────┘
```

- **Saison = 10 Spieltage** (Wochen). Danach: Auf-/Abstieg, Saisonbonus, neue Saison.
- Ein kompletter Aufstieg von Liga 5 → Liga 1 dauert im Idealfall 4 Saisons
  (~40 Runden) – realistisch 6–8, weil man zwischendurch Kader und
  Infrastruktur aufbauen muss.

---

## 3. Die Erfolgskette (Core Progression)

Die zentrale Motivationsschleife – jede Stufe füttert die nächste:

```
Auftrag gewonnen
   → Credits + Reputation + Liga-Punkte + Agenten-XP
      → bessere Aufträge werden freigeschaltet (Rep-Gates)
         → mehr Einnahmen → besserer Kader + Infrastruktur
            → höhere Erfolgsquote → Tabellenspitze
               → AUFSTIEG in die nächste Liga
                  → neue Kunden, neue Agenten-Klassen, neue Events
                     → ... bis zum Frontier-Titel („AGI-Pokal")
```

**Verzahnung nach unten:** Misserfolge kosten Reputation und Moral, Pleiten
kosten Agenten (Abwerbung), 2 Wochen zahlungsunfähig = Insolvenz (Game Over).

---

## 4. Ligen & Aufstieg

| Tier | Liga | Teams | Auftragsniveau | Beispiel-Kunden |
|------|------|-------|----------------|-----------------|
| 5 | **Garagen-Liga** | 8 | Websites, Chatbots | Pizzeria, Handwerker |
| 4 | **Startup-Liga** | 8 | Automatisierung, Apps | Startups, Agenturen |
| 3 | **Growth-Liga** | 8 | Datenpipelines, Fintech | Mittelstand |
| 2 | **Enterprise-Liga** | 8 | Konzern-Projekte | DAX, Behörden |
| 1 | **Frontier-Liga** | 8 | Forschung, Benchmarks | Big Tech, Labs |

- **Punkte:** Jeder Auftrag hat einen Liga-Punktwert (1–4). Konkurrenten
  erspielen ihre Punkte simuliert (Stärkerating + Zufall).
- **Saisonende:** Platz 1–2 steigen auf, Platz 7–8 steigen ab.
- **Meisterschaft:** Platz 1 gibt Prämie + Trophäe. Frontier-Meister = Endgame-Ziel.
- Höhere Ligen: höhere Fixkosten (Büro, Compliance), teurere Gehälter,
  aber deutlich fettere Aufträge.

---

## 5. Agenten (die „Spieler")

### 5.1 Attribute (0–100)
| Attribut | Wirkt auf |
|----------|-----------|
| **Logik** | Analyse-, Daten-, Finanz-Aufträge |
| **Kreativität** | Design-, Content-, Marketing-Aufträge |
| **Code** | Entwicklungs- und Automatisierungs-Aufträge |
| **Wissen** | Recherche-, Beratungs-Aufträge |
| **Tempo** | Deadline-Boni, Multi-Auftrag-Fähigkeit (später) |
| **Stabilität** | Fehler-/Katastrophenrisiko senken |

### 5.2 Archetypen (= Positionen)
- **Generalist** (ausgewogen), **Code-Spezialist**, **Kreativ-Modell**,
  **Daten-Analyst**, **Rechercheur**
- Passt der Archetyp zur Auftragskategorie → **Synergie-Bonus**.

### 5.3 Zustand & Persönlichkeit
- **Level 1–30 + XP:** Level-Up = Attributspunkte (Schwerpunkt je Archetyp)
- **Zustand (Kondition):** Arbeiten −, Pause +. Unter 30 % droht **Überhitzung**
  (Ausfall 1–2 Wochen) – das Pendant zur Verletzung im Fußballmanager.
- **Moral:** Siege +, Pleiten −, Events ±. Wirkt direkt auf Leistung.
- **Traits** (je 1 pro Agent): z. B. *Workaholic* (Zustand sinkt langsamer),
  *Diva* (Moral schwankt stark), *Halluzinator* (kleines Katastrophenrisiko,
  dafür billig), *Präzise* (+Stabilität), *Wunderkind* (schnellere XP)
- **Gehalt & Marktwert:** Marktwert steigt mit Level/Erfolgen → Verkaufserlöse.

---

## 6. Manager-Progression (dein eigenes Level)

Du selbst sammelst **Manager-XP** (Wochen, Erfolge, Titel) und steigst im
Level auf. Jedes Level gibt **1 Skillpunkt** für den Skilltree:

| Skill | Effekt pro Stufe (max. 5) |
|-------|---------------------------|
| **Scouting** | Bessere Agenten im Markt, mehr Angebote |
| **Trainingslehre** | +Trainingseffekt, ab Stufe 3: 2. Trainingsslot |
| **Verhandlung** | +% Auftragsvergütung, −% Kaufpreise |
| **Finanzen** | −% Fixkosten, Kreditlinie ohne Strafzins |

→ Klassisches „Ich werde als Manager besser, nicht nur mein Kader"-Gefühl.

---

## 7. Wirtschaft

- **Credits** = Währung. Einnahmen: Aufträge, Verkäufe, Prämien, Sponsoren (später).
- **Ausgaben:** Gehälter (wöchentlich), Energie (Compute-Level × Faktor),
  Büro/Liga-Fixkosten, Training, Transfers, Upgrades.
- **Reputation (0–100):** schaltet Auftragsqualität frei, wirkt auf
  Sponsoren/Investoren-Events. Sinkt bei Katastrophen.
- **Compute (GPU-Cluster Stufe 1–5):** bestimmt **Arbeits-Slots**
  (wie viele Agenten pro Woche eingesetzt werden können). Upgrade = teuer,
  laufende Energiekosten steigen. Der „Stadionausbau" des Spiels.
- **Insolvenzregel:** Credits < 0 am Wochenende → Mahnung; 2× in Folge → Game Over.

---

## 8. Aufträge & Simulation

- Pro Woche 4–6 generierte Angebote (Kategorie, Schwierigkeit, Anforderungsprofil
  aus 2–3 Attributen, Vergütung, Rep, Liga-Punkte).
- Bis zu **3 Agenten pro Auftrag**. Teamstärke = gewichtete Attributsumme
  × Zustand × Moral × Synergie.
- **Erfolgschance** = 50 + (Teamstärke − Schwierigkeit) × Faktor, geklemmt auf 5–95 %.
- Vier Ausgänge: **Glanzleistung** (Bonus), **Erfolg**, **Fehlschlag**
  (halbe Rep-Strafe), **Desaster** (Rep-Verlust, Vertragsstrafe) –
  Stabilität senkt das Desaster-Risiko.
- **Events:** 1 Zufallsereignis pro Woche (GPU-Ausfall, Hype-Welle,
  Abwerbeversuch mit Entscheidung, Open-Source-Durchbruch, Strompreise, …).
  Später: dynamische Eventtexte über die Claude API (wie bei KAISER geplant).

---

## 9. UI-Konzept (One-Shot-Prototyp)

```
┌──────────────────────────────────────────────────────────┐
│ HEADER: Logo · Liga-Badge · S1/W3 · Credits · Rep ·      │
│         Compute · Manager-Level (XP-Bar) · ▶ WOCHE SIM   │
├──────────────────────────────────────────────────────────┤
│ TABS: Zentrale │ Aufträge │ Team │ Training │ Markt │Liga│
├──────────────────────────────────────────────────────────┤
│  [Tab-Inhalt: Karten-Layout, dunkles Neural-Theme]       │
└──────────────────────────────────────────────────────────┘
+ Wochenreport-Modal, Event-Modals mit Entscheidungen,
+ Saisonende-Screen (Auf-/Abstieg), Game-Over-Screen
```

**Theme (v0.1, austauschbar über CSS-Variablen):** Dark Navy `#0b1020`,
Panel `#141b31`, Akzent Cyan `#22d3ee`, Sekundär Violett `#a78bfa`,
Erfolg `#34d399`, Gefahr `#f87171`. Fonts: Space Grotesk / Inter (mit
System-Fallback). Alles SVG/CSS, keine Bild-Dateien – Bilder rüsten wir
nach, sobald wir sie konfigurieren.

---

## 10. Technik

- **One-Shot:** eine einzige `ai-manager/index.html` – Vanilla JS, kein Build,
  läuft per Doppelklick und via GitHub Pages
  (`https://franklyai-botter.github.io/Firtst-Try/ai-manager/`).
- **State:** ein zentrales `state`-Objekt, `localStorage`-Key `aimanager_save`
  (Autosave nach jeder Woche).
- **Tests:** Playwright-Smoke-Test in `tests/ai-manager.spec.js`
  (lädt Seite, gründet Agentur, simuliert Woche, prüft auf JS-Fehler).
- **Später (Phase 3+):** Aufteilung in Module wie bei KAISER
  (`state/engine/events/ai/storage`), Claude API für Event-Texte.

---

## 11. Roadmap

| Phase | Inhalt | Status |
|-------|--------|--------|
| **1 – One-Shot** | Spielbarer Prototyp: Loop, Ligen, Agenten, Markt, Training, Events, Save | ✅ liegt bei |
| **2 – Feintuning** | Balancing, Branding (deine Farben/Logos), mehr Events, Trait-Ausbau | offen |
| **3 – Tiefe** | Sponsoren, Verträge mit Laufzeit, Benchmark-Pokal (Cup-Modus), Agent-Historie | offen |
| **4 – KI-Events** | Claude API für dynamische Event-/Kundentexte (wie KAISER) | offen |
| **5 – Bilder/Polish** | Agenten-Avatare, Liga-Logos, Sound, Mobile-Feinschliff | offen |

---

## 12. Offene Fragen an Frank (gehen wir gemeinsam durch)

1. **Branding:** Schick mir Farben/Screenshots von neuralnautic.org & Kaivera
   (aus der Cloud-Umgebung nicht erreichbar) – dann ziehe ich das Theme um.
2. **Ton:** Eher ernst/clean (SaaS-Look) oder augenzwinkernd/satirisch
   (Silicon-Valley-Parodie)? Der Prototyp ist aktuell „clean mit Augenzwinkern".
3. **Saisonlänge:** 10 Wochen pro Saison okay, oder lieber 14–16 für mehr Tiefe?
4. **Schwierigkeit:** Insolvenz als hartes Game Over behalten oder
   „Investor rettet dich einmalig gegen Anteile"?
5. **Agenten-Namen:** Frei erfunden (aktuell) oder Anspielungen auf echte
   Modelle/Firmen (Parodie-Namen)?
6. **Cup-Wettbewerb** (Benchmark-Pokal quer durch alle Ligen) schon in Phase 2?
7. **Sprache:** Alles Deutsch (aktuell) oder zweisprachig DE/EN?
