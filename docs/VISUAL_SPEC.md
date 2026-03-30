# VISUAL_SPEC.md – Visuelles Design-System

## 1. Farbpalette (CSS Custom Properties)

```css
:root {
  /* Pergament-Töne */
  --parchment:        #f4e4c1;   /* Haupt-Hintergrund */
  --parchment-dark:   #e8d5a3;   /* Dunklere Panels */
  --parchment-shadow: #c9a96e;   /* Borders, Schatten */

  /* Tinten */
  --ink:              #2c1810;   /* Haupttext */
  --ink-light:        #5c3d2e;   /* Sekundärtext */

  /* Gold (Primärfarbe für Interaktion) */
  --gold:             #c9a227;
  --gold-bright:      #f0c040;

  /* Statusfarben */
  --red:              #8b1a1a;
  --red-bright:       #c0392b;
  --green:            #2d6a2d;
  --green-bright:     #4caf50;
  --blue:             #1a3a5c;
  --blue-bright:      #2980b9;

  /* Stein / Neutral */
  --stone:            #7a6a5a;
  --stone-light:      #a09080;

  /* Hintergrund (außerhalb der Panels) */
  --bg-dark:          #1a0f05;
}
```

---

## 2. Typografie

```css
/* Google Fonts Import */
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;700;900&family=IM+Fell+English:ital@0;1&display=swap');

/* Verwendung */
.display-font    { font-family: 'Cinzel Decorative', serif; }   /* Titel, Logo */
.heading-font    { font-family: 'Cinzel', serif; }              /* Überschriften, Labels */
.body-font       { font-family: 'IM Fell English', serif; }     /* Fließtext, Ereignisse */

/* Schriftgrößen-Skala */
--fs-xl:    2.8rem;   /* Spieltitel */
--fs-lg:    1.4rem;   /* Modal-Titel */
--fs-md:    1.0rem;   /* Ressourcenwerte */
--fs-base:  0.85rem;  /* Fließtext */
--fs-sm:    0.75rem;  /* Labels */
--fs-xs:    0.6rem;   /* Mikro-Labels */
```

---

## 3. Layout-Grid

```
Desktop (>1200px):
┌──────────────────────────────────────────────────────────┐
│                    TITEL-BANNER                          │
├──────────────┬───────────────────────────┬───────────────┤
│   RESSOURCEN │         KARTE             │   AKTIONEN    │
│   (260px)    │      (flexibel)           │   (240px)     │
│              │                           │               │
│  Runde/Jahr  │  SVG-Karte (600x420)      │  Steuern      │
│  Gold        │                           │  Getreide     │
│  Getreide    │  Legende                  │  Rekrutierung │
│  Bevölk.     │                           │               │
│  Soldaten    │  Ereignisbox              │  Gebäude      │
│  Gebiete     │                           │               │
│              │                           │  Runde enden  │
│  Zufrieden.  │                           │               │
│  Berater     │                           │  Gebäudeliste │
└──────────────┴───────────────────────────┴───────────────┘

Tablet (768–1200px):
Karte oben, Panels darunter nebeneinander

Mobile (<768px):
Alles gestapelt, Karte kompakter
```

---

## 4. Panel-Komponente (Basis-Style)

```css
.panel {
  background: var(--parchment);
  background-image: url("data:image/svg+xml,...");  /* Noise-Textur */
  border: 3px solid var(--parchment-shadow);
  border-radius: 4px;
  box-shadow:
    inset 0 0 30px rgba(139, 90, 30, 0.15),
    0 4px 20px rgba(0,0,0,0.6),
    0 0 0 1px #7a4a0044;
  position: relative;
  overflow: hidden;
}

/* Innerer Rahmen (dekorativ) */
.panel::before {
  content: '';
  position: absolute;
  inset: 6px;
  border: 1px solid rgba(139, 90, 30, 0.3);
  pointer-events: none;
  border-radius: 2px;
}

.panel-title {
  font-family: 'Cinzel', serif;
  font-size: 0.75rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--ink-light);
  text-align: center;
  padding: 10px 12px 6px;
  border-bottom: 1px solid var(--parchment-shadow);
  background: linear-gradient(180deg, rgba(139,90,30,0.1) 0%, transparent 100%);
}
```

---

## 5. SVG-Karte – Design-Spezifikation

### Regionen und Farben

| Region | Füllung | Bedeutung |
|--------|---------|-----------|
| Spieler-Reich | `#6a9a4a` (Gras) | Eigene kontrollierte Gebiete |
| Farmland | `url(#farmPattern)` | Ackerflächen mit Linienmuster |
| Wald | `url(#forestPattern)` | Baumkronen-Muster |
| Berge | `url(#mountainGrad)` | Grau-Gradient mit Schnee |
| Feinde | `#8b1a1a` (Dunkelrot) | Feindliche Territorien |
| Verbündete | `#1a5c8b` (Dunkelblau) | Alliierte Königreiche |
| Neutral | `#8a7a6a` (Stein) | Unbeanspruchte Gebiete |
| Wasser | `#4a8fa8` (Blau) | Seen, Flüsse, Ozean |

### Pflicht-Elemente auf der Karte

```
✅ Kompassrose (Südost-Ecke)
✅ Maßstabsleiste
✅ Latein-Inschrift (z.B. "Tabula Regni Kaiseris · Anno Domini MCCXLII")
✅ Goldener Doppelrahmen
✅ Eckornamente (✦)
✅ Fluss (mit Beschriftung)
✅ Straßennetz (gestrichelt)
✅ Hauptstadt (Burgzeichnung)
✅ Dörfer (Hauszeichnungen)
✅ Feindliche Festung
✅ Verbündete Stadt
✅ Kloster/neutrales Gebäude
```

### Hover-Verhalten

```css
.region {
  cursor: pointer;
  transition: filter 0.2s;
}
.region:hover {
  filter: brightness(1.3) saturate(1.4);
}
.region.selected {
  filter: brightness(1.4) saturate(1.6);
  stroke-width: 3 !important;
}
```

### Tooltip-Inhalte pro Region

```javascript
const REGION_TOOLTIPS = {
  'region-nord':      { name: 'Nordmark',      info: '🌾 Getreideanbau · Dein Reich' },
  'region-west':      { name: 'Westwald',       info: '🌲 Holzlieferant · Dein Reich' },
  'region-center':    { name: 'Herzland',       info: '👑 Kerngebiet · Dein Reich' },
  'region-farm':      { name: 'Ährental',       info: '🌾 Fruchtbares Ackerland · Dein Reich' },
  'region-mountains': { name: 'Eisengebirge',   info: '⛏ Erzabbau · Neutral (Eroberbar)' },
  'region-enemy1':    { name: 'Schattenlande',  info: '💀 Feindliches Territorium' },
  'region-enemy2':    { name: 'Dunkelhain',     info: '💀 Feindliches Territorium' },
  'region-ally':      { name: 'Sonnengefilde',  info: '🤝 Verbündetes Königreich' },
};
```

---

## 6. Buttons

```css
/* Primär (Gold-Style) */
.btn-primary {
  background: linear-gradient(135deg, #3a2000, #6a3a00, #3a2000);
  color: var(--gold-bright);
  border: 2px solid var(--gold);
  font-family: 'Cinzel', serif;
  letter-spacing: 2px;
  text-transform: uppercase;
  box-shadow: 0 0 10px rgba(201,162,39,0.3);
  animation: pulse-glow 3s infinite;
}

/* Gefahr (Rot-Style für Angriff) */
.btn-danger {
  background: linear-gradient(135deg, #3a0000, #6a1010, #3a0000);
  color: #f08080;
  border: 2px solid var(--red);
}

/* Deaktiviert */
.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  animation: none;
}
```

---

## 7. Animationen

```css
/* Goldenes Pulsieren für CTAs */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 10px rgba(201,162,39,0.3); }
  50%       { box-shadow: 0 0 20px rgba(201,162,39,0.6); }
}

/* Einblenden für Ereignisbox */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Flackern für Game-Over-Titel */
@keyframes flicker {
  0%, 100% { opacity: 1; }
  92%      { opacity: 1; }
  93%      { opacity: 0.6; }
  94%      { opacity: 1; }
}

/* Warnblinken für kritische Zustände */
@keyframes warnFlash {
  0%, 100% { background: var(--parchment); }
  50%      { background: #f8d0b0; }
}

/* Aufsteigen (Rauch/Feuer auf Karte) */
@keyframes rise {
  0%   { transform: translateY(0) scale(1); opacity: 0.8; }
  100% { transform: translateY(-12px) scale(1.5); opacity: 0; }
}
```

---

## 8. Zufriedenheitsbalken

```css
/* Farbverlauf: Rot → Gold → Grün */
.sat-bar-fill {
  background: linear-gradient(90deg,
    var(--red-bright),    /* 0% */
    var(--gold),          /* 50% */
    var(--green-bright)   /* 100% */
  );
  background-size: 200% 100%;
  /* background-position wird dynamisch gesetzt basierend auf Zufriedenheit */
}
```

---

## 9. Modal

```css
.modal {
  background: var(--parchment);
  border: 3px solid var(--parchment-shadow);
  border-radius: 6px;
  padding: 30px 36px;
  max-width: 480px;
  box-shadow:
    0 0 60px rgba(0,0,0,0.8),
    inset 0 0 40px rgba(139,90,30,0.1);
}

/* Innerer Dekor-Rahmen */
.modal::before {
  content: '';
  position: absolute;
  inset: 10px;
  border: 1px solid rgba(139,90,30,0.25);
}

/* Gutes Ereignis */
.modal-title.good { color: var(--green); }
/* Schlechtes Ereignis */
.modal-title.bad  { color: var(--red); }
```

---

## 10. Ressourcen-Zeile

```css
.resource-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: rgba(139, 90, 30, 0.06);
  border: 1px solid rgba(139, 90, 30, 0.2);
  border-radius: 3px;
  margin-bottom: 4px;
  transition: background 0.2s;
}

.resource-row:hover {
  background: rgba(139, 90, 30, 0.12);
}

/* Delta-Farben */
.res-delta.pos { color: var(--green); }
.res-delta.neg { color: var(--red-bright); }
.res-delta     { color: var(--stone); }  /* Neutral */
```

---

## 11. Noise-Textur (Pergament-Effekt)

```css
/* Als Data-URI eingebettet – keine externe Datei nötig */
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");
```

---

## 12. Responsiveness

```css
/* Desktop: 3-Spalten-Grid */
@media (min-width: 1200px) {
  .game-container {
    grid-template-columns: 260px 1fr 240px;
  }
}

/* Tablet: Karte oben, 2 Panels unten */
@media (max-width: 1200px) and (min-width: 768px) {
  .game-container {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
  }
  .map-panel { grid-column: 1 / -1; }
}

/* Mobile: Alles gestapelt */
@media (max-width: 768px) {
  .game-container { grid-template-columns: 1fr; }
  .title-banner h1 { font-size: 1.8rem; }
}
```
