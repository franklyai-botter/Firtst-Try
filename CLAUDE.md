# KAISER – Das Königreich
## Master-Instruktionsdatei für Claude Code

> Diese Datei ist die **einzige Quelle der Wahrheit** für das Projekt.
> Claude Code liest sie bei jedem Start. Alle Entscheidungen orientieren sich hieran.

---

## 🎯 Projektziel

Baue ein vollständiges, browser-basiertes Mittelalter-Strategiespiel inspiriert vom C64-Klassiker **"Kaiser"**.
Das Spiel läuft als **Single-Page-Application** ohne Backend – reines HTML/CSS/JS oder React.

**Primäre Deliverable:** Eine einzelne `index.html` (oder React-Build) die man direkt im Browser öffnen kann.

---

## 🏗 Tech Stack

```
Framework:   Vanilla HTML/CSS/JS  ODER  React + Vite (bevorzugt für Komponentenstruktur)
Styling:     Tailwind CSS via CDN  ODER  Custom CSS (mittelalterliches Theme)
KI-Events:   Anthropic Claude API  (claude-sonnet-4-20250514)
Fonts:       Google Fonts – Cinzel Decorative, Cinzel, IM Fell English
Grafik:      SVG (inline, keine externen Bild-Abhängigkeiten)
Storage:     localStorage (Spielstand speichern/laden)
```

**Kein Backend erforderlich.** Alle API-Calls gehen direkt vom Browser an api.anthropic.com.

---

## 📁 Projektstruktur

```
kaiser-game/
├── CLAUDE.md                  ← Diese Datei (nicht löschen!)
├── index.html                 ← Entry Point
├── package.json               ← Falls React/Vite genutzt wird
├── src/
│   ├── main.js                ← App-Einstieg
│   ├── game/
│   │   ├── state.js           ← Gesamter Spielzustand (Single Source of Truth)
│   │   ├── engine.js          ← Spiellogik (Rundenberechnung, Formeln)
│   │   ├── events.js          ← Ereignis-Definitionen + Zufallssystem
│   │   ├── ai.js              ← Claude API Integration
│   │   └── storage.js         ← localStorage save/load
│   ├── components/
│   │   ├── Map.js             ← SVG-Karte (interaktiv)
│   │   ├── ResourcePanel.js   ← Linkes Panel (Ressourcen, Runde, Zufriedenheit)
│   │   ├── ActionPanel.js     ← Rechtes Panel (Slider, Buttons)
│   │   ├── EventBox.js        ← Ereignisanzeige auf der Karte
│   │   ├── Modal.js           ← Popup für Ereignisse
│   │   └── GameOver.js        ← End-Screen
│   ├── styles/
│   │   ├── main.css           ← Basis-Styles, CSS-Variablen
│   │   ├── panels.css         ← Panel-Komponenten
│   │   ├── map.css            ← Karten-spezifische Styles
│   │   └── animations.css     ← Animationen, Transitions
│   └── assets/
│       └── svg/
│           ├── map.svg        ← Haupt-Karte (exportiert aus map-design.svg)
│           └── icons.svg      ← Icon-Sprite
├── docs/
│   ├── GAMEDESIGN.md          ← Spielmechanik-Spezifikation (diese Datei lesen!)
│   ├── VISUAL_SPEC.md         ← Visuelles Design-System
│   ├── API_SPEC.md            ← Claude API Integration Details
│   └── FORMULAS.md            ← Alle Berechnungsformeln
└── public/
    └── favicon.ico
```

---

## ⚡ Schnellstart für Claude Code

Wenn du dieses Projekt aufnimmst, tue folgendes **in dieser Reihenfolge**:

1. **Lies alle Dateien in `/docs/`** – besonders `GAMEDESIGN.md` und `FORMULAS.md`
2. **Schau dir `src/game/state.js`** an – das ist die Grundlage für alles
3. **Baue von innen nach außen:**
   - Zuerst `state.js` + `engine.js` (Logik, testbar)
   - Dann `Map.js` (SVG, visuell wichtigster Teil)
   - Dann Panels
   - Zuletzt `ai.js` (Claude API)
4. **Teste nach jeder Komponente** im Browser
5. **Kein Feature gilt als fertig** bis es in `index.html` sichtbar und klickbar ist

---

## 🎮 Spielübersicht (Kurzfassung)

| Parameter | Wert |
|-----------|------|
| Rundenanzahl | 20 Runden (= 20 Jahre) |
| Spieler | 1 (vs. KI-Gegner) |
| Siegbedingung | 20 Runden überleben + Score |
| Niederlage | Bevölkerung = 0 ODER Zufriedenheit < 10% für 3 Runden |

**Ressourcen:** Gold · Getreide · Bevölkerung · Soldaten · Gebiete

**Entscheidungen pro Runde:** Steuersatz · Getreideverteilung · Anbaufläche · Rekrutierung · Gebäudebau

→ Vollständige Spezifikation: `docs/GAMEDESIGN.md`

---

## 🎨 Design-Prinzipien (NICHT verhandeln)

1. **Pergament-Ästhetik** – Hintergrund immer `#f4e4c1`, niemals weiß oder grau
2. **Cinzel / IM Fell English** – Keine anderen Schriftarten für UI-Texte
3. **Gold-Akzente** – `#c9a227` / `#f0c040` für alle interaktiven Elemente
4. **SVG-Karte** ist das visuelle Herzstück – immer zentriert, immer groß
5. **Kein Material Design, kein Bootstrap-Look** – das ist ein Mittelalter-Spiel

→ Vollständige Specs: `docs/VISUAL_SPEC.md`

---

## 🤖 Claude API Nutzung

```javascript
// Modell: IMMER claude-sonnet-4-20250514
// API Key: Kommt aus ENV oder wird im UI eingegeben
// Zweck: Dynamische Ereignistexte pro Runde

const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 150,
    messages: [{ role: 'user', content: buildEventPrompt(gameState) }]
  })
});
```

→ Vollständige Integration: `docs/API_SPEC.md`

---

## ✅ Definition of Done

Ein Feature ist **fertig** wenn:
- [ ] Es funktioniert im Browser (Chrome + Firefox)
- [ ] Es folgt dem Design-System aus `VISUAL_SPEC.md`
- [ ] Es ist in `state.js` korrekt abgebildet
- [ ] Keine JavaScript-Fehler in der Konsole
- [ ] Mobile-Ansicht nicht komplett kaputt (Tablet reicht)

---

## 🚫 Was Claude Code NICHT tun soll

- Kein TypeScript (hält einfach, JS reicht)
- Keine externen Bild-Dateien (alles SVG inline)
- Kein komplexes State-Management (kein Redux etc.)
- Keine Test-Frameworks installieren
- API-Key niemals hardcoden – immer aus `localStorage` oder ENV

---

## 📝 Notizen für den Entwickler (Frank)

- Das Prototyp-HTML liegt in `docs/prototype.html` als visuelle Referenz
- Die SVG-Karte ist bereits fertig designed – wiederverwendbar
- Farbpalette und Formeln sind bereits definiert und getestet
- Claude API ist bereits in der Architektur eingeplant
