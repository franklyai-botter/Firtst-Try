# NEURAL MANAGER – Der KI-Agentur-Manager
## Game-Design-Plan (v0.2 – Diskussionsgrundlage)

> Arbeitstitel: **NEURAL MANAGER**. Ein Manager-Spiel im Stil klassischer
> Fußballmanager – aber statt eines Fußballvereins führst du eine **KI-Agentur**.
>
> **Primärzweck (seit v0.2): Kunden-Explainer.** Das Spiel erklärt Kunden
> interaktiv, was eine KI-Agentur macht – in einer geführten Partie von
> ~10–15 Minuten (12 Spielwochen) mit Abschlussbericht und Kontakt-CTA.
> Der spielbare One-Shot-Prototyp liegt unter `ai-manager/index.html`.
> Offene Punkte für Frank stehen ganz unten.

---

## 1. Vision & Elevator Pitch

**„Spiel dich durch das, was wir wirklich tun."**

Der Kunde gründet eine kleine KI-Agentur. Seine „Spieler" sind KI-Agenten
(Modelle mit Stärkenprofilen und Macken). Seine „Spiele" sind Kundenaufträge.
Statt einer fiktiven Liga gibt es das, was es wirklich gibt: **einen Markt** –
Mitbewerber schnappen sich liegengelassene Aufträge, Reputation öffnet
größere Kundensegmente, und jede Spielmechanik wird per **💡 Insight** auf
die echte Agentur-Arbeit gemappt („Genau so wählen wir das Modell für Ihren
Use Case"). Nach 12 Wochen: **Abschlussbericht + CTA** („Sprechen wir über
Ihren Use Case") – danach freies Weiterspielen.

**Wichtige Design-Entscheidung (v0.2):** Keine Ligen, kein Auf-/Abstieg –
das war Fußball-Fiktion. Stattdessen **Wirtschaftssimulation**:
Markt-Ranking nach Umsatz, Kundensegmente mit Reputations-Schwellen,
Konkurrenz als ökonomischer Druck (kein Zwangsabstieg).

**Referenzen / Vorgehensmodell:**
- Struktur & Rundenlogik: unser bestehendes KAISER-Spiel (Runden, Events, localStorage, One-File-SPA)
- Ton & Branding: neuralnautic.org und Kaivera *(beide Seiten waren aus der
  Cloud-Umgebung nicht abrufbar – Farbwelt/Branding gleichen wir gemeinsam an;
  der Prototyp nutzt ein neutrales Dark-Neural-Theme; Agenturname & CTA-Link
  sind im `BRAND`-Objekt am Dateianfang konfigurierbar)*
- Genre-Vorbilder: Football Manager (Tiefe), Game Dev Tycoon (Loop), Serious Games (Didaktik)

---

## 2. Kern-Gameplay-Loop (1 Runde = 1 Woche)

```
┌────────────────────────────────────────────────────────┐
│ 1. AUFTRÄGE sichten      → 4–6 Angebote je nach Segment│
│ 2. TEAM aufstellen       → Agenten den Jobs zuweisen   │
│ 3. TRAINING planen       → 1 Agent pro Woche (Basis)   │
│ 4. RECRUITING checken    → Scouting, Kauf, Abgabe      │
│ 5. INFRASTRUKTUR         → GPU-Cluster, Slots, Kosten  │
│ 6. WOCHE SIMULIEREN      → Ergebnisse, Event, Ranking  │
└────────────────────────────────────────────────────────┘
```

- **Quartal = 4 Wochen.** Am Quartalsende: Quartalsbericht (Markt-Platz,
  Marktanteil, Umsatz) + Segment-Check (Aufstieg bei genug Reputation).
- **Geführte Partie = 12 Wochen (3 Quartale)** → Abschlussbericht + CTA.
  Danach läuft das Spiel als freies Endlosspiel weiter.

---

## 3. Die Erfolgskette (Core Progression)

```
Auftrag gewonnen
   → Credits + Reputation + Agenten-XP
      → bessere Aufträge werden freigeschaltet (Rep-Gates)
         → mehr Einnahmen → besserer Kader + Infrastruktur
            → höhere Erfolgsquote → Reputations-Schwelle erreicht
               → NEUES KUNDENSEGMENT erschlossen
                  → größere Kunden, stärkere Mitbewerber, neue Events
                     → ... bis Forschung & Frontier
```

**Verzahnung nach unten:** Misserfolge kosten Reputation und Moral,
liegengelassene Aufträge füttern die Konkurrenz, 2 Wochen zahlungsunfähig
= Insolvenz (Game Over).

---

## 4. Markt, Kundensegmente & Ranking (statt Ligen)

| Segment | Rep-Schwelle | Auftragsniveau | Beispiel-Kunden |
|---------|--------------|----------------|-----------------|
| **Lokale Kunden** | Start | Websites, Chatbots | Pizzeria, Handwerker |
| **Startups** | 32 | Automatisierung, Apps | FinTech, EdTech |
| **Mittelstand** | 50 | Datenpipelines, Analysen | Maschinenbau, Logistik |
| **Enterprise** | 68 | Konzern-Projekte | DAX, Behörden |
| **Forschung & Frontier** | 85 | Forschung, Benchmarks | Labs, Raumfahrt |

- **Markt-Ranking:** Tabelle nach **Quartalsumsatz** (du + 7 simulierte
  Mitbewerber), inkl. Marktanteil in %. Rein informativ + Motivations-Anker.
- **Konkurrenzdruck statt Abstieg:** Aufträge, die du nicht annimmst,
  gehen sichtbar an Mitbewerber. Es gibt keinen Zwangsabstieg – nur
  wirtschaftliche Konsequenzen (weniger Umsatz, Insolvenzrisiko).
- **Segment-Aufstieg** über Reputations-Schwellen am Quartalsende –
  Referenzen öffnen größere Kunden (so funktioniert der Markt wirklich).
- **Optional (Phase 3):** Benchmark-Wettbewerbe als reales Ranking-Element
  der KI-Branche (Leaderboards existieren ja tatsächlich).

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
| **Stabilität** | Fehler-/Desaster-Risiko senken |

### 5.2 Archetypen (= Positionen)
- **Generalist**, **Code-Spezialist**, **Kreativ-Modell**, **Daten-Analyst**, **Rechercheur**
- Passt der Archetyp zur Auftragskategorie → **Synergie-Bonus**.
- *Didaktik: entspricht der realen Modell-/Tool-Auswahl pro Use Case.*

### 5.3 Zustand & Persönlichkeit
- **Level 1–30 + XP:** Level-Up = Attributspunkte (Schwerpunkt je Archetyp)
- **Zustand:** Arbeiten −, Pause +. Unter 30 % droht **Überhitzung** (Ausfall 1–2 Wochen)
- **Moral:** Siege +, Pleiten −, Events ±. Wirkt direkt auf Leistung.
- **Traits:** *Workaholic*, *Diva*, *Halluzinator*, *Präzise*, *Wunderkind*, *Effizient*
- **Gehalt & Marktwert:** Marktwert steigt mit Level/Erfolgen.

---

## 6. Manager-Progression (dein eigenes Level)

Manager-XP durch Wochen, Erfolge und Segment-Aufstiege. Jedes Level = 1 Skillpunkt:

| Skill | Effekt pro Stufe (max. 5) |
|-------|---------------------------|
| **Scouting** | Bessere Agenten im Recruiting, mehr Angebote |
| **Trainingslehre** | +Trainingseffekt, ab Stufe 3: 2. Trainingsslot |
| **Verhandlung** | +% Auftragsvergütung, −% Kaufpreise |
| **Finanzen** | −% Fixkosten |

---

## 7. Wirtschaft

- **Credits** = Währung. Einnahmen: Aufträge, Agenten-Verkäufe.
- **Ausgaben:** Gehälter, Energie (Compute-Stufe × Faktor), Bürokosten
  (Segment), Training, Recruiting, Cluster-Ausbau.
- **Reputation (0–100):** schaltet Auftragsqualität und Segmente frei.
- **Compute (GPU-Cluster 1–5):** bestimmt Arbeits-Slots. *Didaktik:
  Infrastruktur-Dimensionierung.*
- **Insolvenzregel:** Credits < 0 am Wochenende → Mahnung; 2× in Folge → Game Over.

---

## 8. Didaktik-Ebene (der Explainer-Kern)

1. **💡 Insights:** Beim ersten Auftreten einer Mechanik erscheint einmalig
   eine Erklärung, was sie in der echten Arbeit bedeutet:
   - Agenten-Zuweisung → Modell-/Tool-Auswahl pro Use Case
   - Training → Fine-Tuning, Prompt-Engineering, Evaluation
   - Desaster → Qualitätssicherung, Human-in-the-Loop
   - Cluster-Ausbau → Infrastruktur & Kosten dimensionieren
2. **Abschlussbericht (Woche 12):** Ergebnis-KPIs + Mapping-Liste
   („Und genau das machen wir wirklich") + **CTA-Button** (konfigurierbar
   über `BRAND.ctaUrl`) + Option „Weiterspielen (freies Spiel)".
3. **Events** transportieren Branchenrealität (GPU-Ausfall, Abwerbeversuch,
   Investor, Strompreise …). Später: dynamische Texte via Claude API.

---

## 9. UI-Konzept (One-Shot-Prototyp)

```
┌──────────────────────────────────────────────────────────┐
│ HEADER: Logo · Segment-Badge · Woche x/12 · Quartal ·    │
│         Credits · Rep · Slots · Manager-Lv · ▶ WOCHE SIM │
├──────────────────────────────────────────────────────────┤
│ TABS: Zentrale │ Aufträge │ Team & Training │            │
│       Recruiting │ Markt & Ranking                       │
├──────────────────────────────────────────────────────────┤
│  [Karten-Layout, dunkles Neural-Theme]                   │
└──────────────────────────────────────────────────────────┘
+ Wochenreport, 💡-Insights, Event-Modals mit Entscheidungen,
+ Quartalsbericht, Abschlussbericht mit CTA, Game-Over-Screen
```

**Theme (austauschbar über CSS-Variablen):** Dark Navy `#0b1020`,
Panel `#141b31`, Akzent Cyan `#22d3ee`, Sekundär Violett `#a78bfa`.
Fonts: Space Grotesk / IBM Plex Mono (mit System-Fallback). Alles SVG/CSS.

---

## 10. Technik

- **One-Shot:** eine einzige `ai-manager/index.html` – Vanilla JS, kein Build,
  läuft per Doppelklick und via GitHub Pages
  (`https://franklyai-botter.github.io/Firtst-Try/ai-manager/`).
- **Konfiguration:** `BRAND`-Objekt (Agenturname, CTA-Text, CTA-URL) und
  CSS-Variablen am Dateianfang – fürs Einbetten auf der Agentur-Webseite.
- **State:** zentrales `state`-Objekt, `localStorage`-Key `aimanager_save_v2`.
- **Tests:** Playwright-Smoke-Tests in `tests/ai-manager.spec.js`.

---

## 11. Roadmap

| Phase | Inhalt | Status |
|-------|--------|--------|
| **1 – One-Shot** | Spielbarer Prototyp: Markt-Loop, Segmente, Agenten, Recruiting, Training, Events, Insights, Abschlussbericht + CTA, Save | ✅ liegt bei |
| **2 – Branding & Feintuning** | Farben/Logo der Agentur, CTA-Ziel, Texte (Sie/Du), Balancing, mehr Events | offen |
| **3 – Tiefe** | Benchmark-Wettbewerbe, Verträge mit Laufzeit, Sponsoren/Investoren-Strang, Agent-Historie | offen |
| **4 – KI-Events** | Claude API für dynamische Event-/Kundentexte (wie KAISER) | offen |
| **5 – Bilder/Polish** | Agenten-Avatare, Sound, Mobile-Feinschliff, Analytics (Spielt jemand bis zum CTA?) | offen |

---

## 12. Offene Fragen an Frank (gehen wir gemeinsam durch)

1. **Branding:** Farben/Logo/Screenshots von neuralnautic.org & Kaivera
   (aus der Cloud-Umgebung nicht erreichbar) → dann ziehe ich das Theme um.
2. **CTA-Ziel:** Wohin soll der Abschluss-Button führen? (Kontaktformular,
   Calendly, Mail?) Aktuell Platzhalter `https://neuralnautic.org`.
3. **Ansprache:** Aktuell „Du" (Spiel-Konvention). Für Enterprise-Kunden
   lieber „Sie"? Betrifft alle UI-Texte.
4. **Spieldauer:** 12 Wochen ≈ 10–15 Min. Kürzer (8) für Messen/Landingpage
   oder länger (16) für mehr Tiefe?
5. **Einbettung:** Eigene Unterseite, iFrame auf der Agentur-Seite, oder
   Standalone-Link zum Verschicken?
6. **Insolvenz:** Für einen Kunden-Explainer evtl. zu frustrierend –
   stattdessen „Investor rettet dich einmalig"?
7. **Agenten-Namen:** Frei erfunden (aktuell) oder auf eure echten
   Services/Produkte gemappt?
