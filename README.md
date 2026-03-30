# Kaiser – Das Königreich 🏰

> Mittelalter-Strategiespiel inspiriert vom C64-Klassiker "Kaiser"
> Entwickelt mit Claude Code · NeuralNautic

## ⚡ Schnellstart

### Option A – Direkt im Browser öffnen (kein Build)
```bash
open index.html
# oder einfach Doppelklick auf index.html
```

### Option B – Mit Vite Dev Server (empfohlen für Entwicklung)
```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## 📁 Projektstruktur

```
kaiser-game/
├── CLAUDE.md           ← Haupt-Instruktionen für Claude Code (immer zuerst lesen!)
├── index.html          ← Vollständiges Spiel (standalone, kein Build nötig)
├── karte.png           ← Königreichskarte (Gemini-Illustration)
├── package.json        ← Vite-Setup
├── src/
│   └── game/
│       ├── state.js    ← Spielzustand
│       ├── engine.js   ← Spiellogik & Formeln
│       ├── events.js   ← Ereignissystem
│       └── ai.js       ← Claude API Integration
└── docs/
    ├── GAMEDESIGN.md   ← Vollständige Spielmechanik-Spezifikation
    ├── VISUAL_SPEC.md  ← Design-System & CSS-Variablen
    ├── API_SPEC.md     ← Claude API Integration
    └── FORMULAS.md     ← Alle Berechnungsformeln
```

---

## 🎮 Spielprinzip

Du regierst ein mittelalterliches Königreich über **20 Jahre (Runden)**.

**Ressourcen:** Gold · Getreide · Bevölkerung · Soldaten · Gebiete

**Entscheidungen pro Runde:**
- Steuersatz (0–60%) → Einnahmen vs. Zufriedenheit
- Getreideverteilung → Volksversorgung vs. Vorrat
- Getreideverkauf → Getreide gegen Gold tauschen (Marktpreis variiert)
- Anbaufläche → Ernteertrag
- Rekrutierung → Militärkosten
- Gebäudebau → Langzeitboni
- Wohnviertel kaufen → Bevölkerungsgrenze erhöhen

**Ziel:** 20 Runden überleben und möglichst hohe Punktzahl erreichen.

**G&V-Bilanz** – nach jeder Runde siehst du eine detaillierte Gewinn- & Verlustrechnung mit Steuereinnahmen, Ernteertrag, Getreideverteilung, Rekrutierungskosten, Sold und Ereigniseffekten.

---

## 🤖 Claude API (KI-Narration)

Das Spiel funktioniert ohne API Key mit statischen Ereignistexten.  
Mit API Key generiert Claude dynamische, mittelalterliche Ereignisnarration.

**API Key eingeben:** Im Spiel rechts unten → "KI-Narration" → Key eingeben → Speichern

---

## 🛠 Für Claude Code: Weiterentwicklung

Wenn du das Spiel erweiterst, lies zuerst **CLAUDE.md** – dort steht alles drin.

### Häufige Erweiterungen

**Neue Ereignisse hinzufügen** → `src/game/events.js`
```javascript
{
  id: 'meine_id',
  chance: 0.07,
  icon: '🌟',
  title: 'Mein Ereignis',
  bad: false,
  effect: (state) => { state.gold += 50; },
  fallback: 'Ein tolles Ereignis ist eingetreten.',
  contextHint: 'great event happened in the kingdom',
}
```

**Neue Gebäude** → `src/game/engine.js` → `BUILDINGS`

**Karte** → `karte.png` (Gemini-Illustration) + Badge-Overlays in `index.html`
Conquest-Badges erscheinen automatisch wenn `state.land` Schwellwerte erreicht.

**Neue Formeln** → `src/game/engine.js`  
Dokumentieren in: `docs/FORMULAS.md`

---

## 🎨 Design-Prinzipien (nicht ändern!)

- Pergament-Hintergrund: `#f4e4c1`
- Fonts: Cinzel Decorative / Cinzel / IM Fell English
- Gold-Akzente: `#c9a227` / `#f0c040`
- Karte: `karte.png` (Gemini-Illustration, muss im gleichen Ordner wie `index.html` liegen)

---

## 📊 Score-Berechnung

```
Score = population×0.5 + gold×0.2 + satisfaction×15 + land×60 + soldiers×2
```

| Score | Titel |
|-------|-------|
| 2000+ | Legendärer Herrscher |
| 1500+ | Großer Kaiser |
| 1000+ | Guter König |
| 500+  | Durchschnittlicher Herrscher |
| <500  | Schlechter Kaiser |

---

*Built with ❤️ and Claude Code · NeuralNautic · Berlin*
