# Implementation Plan – Abgleich mit C64-Original
*Quelle: Let's Play Transcript (16 Min.) – Kaiser (1984, Ariola/CDC)*

---

## Was das Transcript lehrt (Original-Mechaniken)

Das Transcript zeigt 7 kritische Mechaniken, die im aktuellen Design **fehlen oder falsch** sind.

---

## Phase 1 – Kritische Gameplay-Fixes

### 1.1 Getreideverfall (FEHLT komplett)

**Was das Original macht:**
> "8% ihrer Konserven sind verfault" / "30% verfault" / "40% verfault"

Jedes Jahr fault ein zufälliger Anteil der Getreidereserven. Das ist der wichtigste Druck-Mechanismus – man kann nicht einfach Getreide horten.

**Zu implementieren in `engine.js`:**
```js
function applyGrainSpoilage(state) {
  const spoilageRate = 0.10 + Math.random() * 0.35; // 10–45%
  const spoiled = Math.floor(state.grain * spoilageRate);
  state.grain = Math.max(0, state.grain - spoiled);
  return { spoiled, rate: Math.round(spoilageRate * 100) };
}
```
- Aufruf: **vor** der Verteilung am Rundenanfang
- Anzeige: "X% Ihrer Reserven sind verfault" als Rundentext

---

### 1.2 Getreideverteilung als Pflicht-Prozentsatz (FALSCH)

**Was das Original macht:**
> "Sie müssen zwischen 20% und 80% ihrer Reserven an ihr Volk ausgeben"

Die Verteilung ist **kein absoluter Schieberegler**, sondern ein Prozentsatz der verbleibenden Reserven. Minimum 20%, Maximum 80% – erzwungen.

**Fix in `state.js`:**
```js
decisions: {
  grainDistributionPct: 50,  // 20–80 (Prozent der Reserven)
  // grainDistribution: 150  ← löschen
}
```

**Fix in `engine.js`:**
```js
const distributed = Math.floor(state.grain * (state.decisions.grainDistributionPct / 100));
state.grain -= distributed;
```

**UI:** Schieberegler 20–80%, anzeigen: "verteile X Maß (Y% der Reserven)"

---

### 1.3 Mehrfach-Gebäude statt Booleans (FALSCH)

**Was das Original macht:**
> "2 Marktplätze und 4 Kornmühlen" / "Verhältnis 1 Markt zu 2 Mühlen"

Gebäude sind **zählbar**, nicht nur ein/aus. Märkte und Mühlen kann man mehrfach bauen. Erträge skalieren mit der Anzahl.

**Fix in `state.js`:**
```js
buildings: {
  markets: 0,        // Marktplätze (kosten je 200 Thaler)
  mills: 0,          // Kornmühlen (kosten je 150 Thaler)
  walls: false,      // Stadtmauer (einmalig, 300 Thaler)
  church: false,     // Kathedrale (einmalig, 250 Thaler)
  palace: 0,         // Schloss-Ausbaustufen (kostspielig)
  military: false,   // Militärlager (einmalig, 180 Thaler)
},
// hasMarket, hasGranary, hasMilitaryCamp, hasChurch ← alle entfernen
```

**Einnahmen skalieren:**
```js
const marketIncome  = state.buildings.markets * Math.floor(state.population * 0.8);
const millIncome    = state.buildings.mills   * Math.floor(state.land * 12);
```

**Optimales Verhältnis:** 1 Markt : 2 Mühlen → Advisor-Hinweis wenn Ratio falsch

---

### 1.4 Dreistufiges Steuersystem (FALSCH)

**Was das Original macht:**
> "25% Mehrwertsteuer" / "10% Einkommenssteuer" / "Justiz: bescheiden"

Drei getrennte Steuerhebel, alle beeinflussen Einnahmen UND Zufriedenheit unterschiedlich.

**Fix in `state.js`:**
```js
decisions: {
  vatRate: 25,          // Mehrwertsteuer 10–40% (Haupteinnahme, hoher Zufriedenheits-Malus)
  incomeTaxRate: 10,    // Einkommenssteuer 0–20% (mittlerer Effekt)
  justice: 'gering',   // 'gering' | 'bescheiden' | 'streng' (Einnahmen vs. Zufriedenheit)
}
```

**Steuerformel:**
```js
const vatIncome    = Math.floor(state.population * state.decisions.vatRate * 0.4);
const incomeTax    = Math.floor(state.population * state.decisions.incomeTaxRate * 0.2);
const justiceBonus = { gering: 0, bescheiden: 15, streng: 40 }[state.decisions.justice];
const taxIncome    = vatIncome + incomeTax + justiceBonus;

// Zufriedenheits-Effekte
const vatEffect    = state.decisions.vatRate > 35 ? -10 : state.decisions.vatRate > 25 ? -4 : 0;
const justiceEffect = { gering: +5, bescheiden: 0, streng: -8 }[state.decisions.justice];
```

---

### 1.5 Spielskala anpassen

**Was das Original zeigt:**
- Start: 15.000 Thaler, Getreide in 10.000er-Mengen, Land in Hektar
- Armee: pauschal 60 Thaler Unterhalt (nicht pro Soldat linear)
- Landpreis: schwankt (70 Thaler / 24 Thaler je nach Jahr)

**Fix in `state.js`:**
```js
gold: 15000,          // war: 500
grain: 5000,          // war: 800 (nach 8% Verfall: ~4600)
population: 200,      // bleibt
soldiers: 30,         // bleibt
land: 1000,           // war: 3 (jetzt in Hektar)
year: 1701,           // war: round: 1
```

**Landpreis-Schwankung:**
```js
state.landPrice = 40 + Math.floor(Math.random() * 60); // 40–100 Thaler/ha je Runde
```

---

## Phase 2 – Spielstart & Titelaufstieg

### 2.1 Startbildschirm

**Was das Original zeigt:**
> Name eingeben, männlich/weiblich, dann direkt ins Spiel

**Zu implementieren:**
- Eingabe: Spielername (Text)
- Auswahl: Geschlecht (für Anrede im Spieltext)
- Starttitel: "Baron/Baronin von [Name]"

### 2.2 Titelaufstiegssystem

**Was das Original zeigt:**
> "Ein neuer Titel wird verliehen – Baudame/Baudames von Preußen" (bei ~1712)

Titel steigen mit Score/Territorium:

| Titel (m/w)               | Bedingung             |
|---------------------------|-----------------------|
| Baron / Baronin           | Start                 |
| Graf / Gräfin             | land > 2000 ha        |
| Herzog / Herzogin         | land > 5000 ha        |
| König / Königin           | land > 10000 ha       |
| Kaiser / Kaiserin         | land > 20000 ha + 20J |

- Anzeige: Popup + Fanfare-Animation bei Aufstieg
- Hochzeitswinken-Easter-Egg: Geste der Queen bei Titelaufstieg (Transcript: "wie die Queen")

---

## Phase 3 – UI-Fixes aus dem Transcript

### 3.1 Kartenansicht

**Was das Original zeigt:**
- Links: 3 Goldsäcke (= Vermögen-Indikator, nicht Zahl)
- Mitte: Territorium farbig
- Rechts: Bevölkerungs-Figuren (1–4 Männchen je Bevölkerungsstufe)
- Gebäude als Pixelgrafiken auf der Karte platziert (Häuschen für Märkte, Mühlen)

**Zu implementieren:**
- Goldsack-Anzeige: 1-3 SVG-Säcke je nach Gold-Bereich
- Bevölkerungs-Figuren: 1-5 SVG-Figuren
- Gebäude-Counter auf der Karte: "🏪 ×2  🏭 ×4"

### 3.2 Rundentext

**Was das Original zeigt:** Statusmeldungen im Stil:
> "Gutes Wetter, Reiche Ernte" / "Hungersnot droht!" / "Regen, schlechte Ernte"

Format der Rundenauswertung:
```
[Wetterereignis]
X Einwohner wurden heuer geboren
Y Einwohner starben
Z Einwanderer kamen dazu
Märkte verdienten: X Thaler
Mühlen erwirtschafteten: Y Thaler
Armee-Unterhalt: 60 Thaler
Staatseinnahmen: Z Thaler
```

---

## Phase 4 – Balancing & Tests

| Test | Ziel |
|------|------|
| Runde 1–5 | Spieler überlebt ohne Schulden |
| Runde 10 | Mindestens 2 Märkte + 4 Mühlen möglich |
| Runde 20 | Titelaufstieg zu König realistisch |
| Getreideverfall | Erzeugt Kaufdruck, aber nicht unmöglich |
| Steuern auf Max | Zufriedenheit fällt deutlich aber nicht sofort kritisch |

---

## Implementierungsreihenfolge

```
1. state.js       → Skala, Gebäude-Counter, Steuervariablen, year statt round
2. engine.js      → Verfall, %-Verteilung, Dreisteuersystem, skalierte Einnahmen
3. index.html     → Drei Tax-Schieberegler, Gebäude-Kaufbuttons mit Zähler
4. Kartenansicht  → Goldsäcke, Figuren, Gebäude-Counter
5. Startscreen    → Name + Geschlecht
6. Titelaufstieg  → Bedingungen + Popup
```

---

## Was NICHT geändert wird

- Ereignissystem (GAMEDESIGN.md §3) bleibt unverändert
- Sieg/Niederlage-Logik (GAMEDESIGN.md §6) bleibt
- Pergament-Design (VISUAL_SPEC.md) bleibt
- Claude API für Ereignistexte (API_SPEC.md) bleibt
