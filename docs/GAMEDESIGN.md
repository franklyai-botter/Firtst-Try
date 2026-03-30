# GAMEDESIGN.md – Kaiser Spielmechanik-Spezifikation

## 1. Spielzustand (State-Objekt)

```javascript
const INITIAL_STATE = {
  // Meta
  round: 1,
  maxRounds: 20,
  gameOver: false,
  victory: false,
  lowSatisfactionStreak: 0,  // Für Niederlage-Bedingung

  // Ressourcen
  gold: 500,
  grain: 800,
  population: 200,
  soldiers: 30,
  land: 3,             // Anzahl kontrollierter Gebiete
  satisfaction: 65,    // 0–100

  // Gegner
  enemyStrength: 80,   // Wächst jede Runde

  // Gebäude (Booleans)
  hasMarket: false,    // +20% Steuereinnahmen
  hasGranary: false,   // +20% Ernte
  hasMilitaryCamp: false,  // Rekrutierungskosten -20%
  hasChurch: false,    // +5 Zufriedenheit/Runde

  // Spieler-Entscheidungen (werden per Slider gesetzt)
  decisions: {
    taxRate: 20,         // 0–60%
    grainDistribution: 150,  // Getreide pro Runde verteilt
    farmingIntensity: 40,    // % der Bevölkerung in der Landwirtschaft
    recruit: 5,          // Neue Soldaten diese Runde
  },

  // History (für Charts/Advisor)
  history: [],         // Array von State-Snapshots

  // Deltas (letzte Runde)
  deltas: {
    gold: 0, grain: 0, population: 0, soldiers: 0, land: 0
  },

  // Gebäudeliste (für Anzeige)
  buildings: ['Burg', 'Felder (3)'],
};
```

---

## 2. Rundenberechnung (engine.js)

### Reihenfolge der Berechnung

```
1. Steuereinnahmen berechnen
2. Getreideernte berechnen
3. Getreideverteilung abziehen
4. Rekrutierungskosten abziehen
5. Soldatenunterhalt abziehen
6. Zufriedenheit aktualisieren
7. Bevölkerungswachstum berechnen
8. Gegnerstärke erhöhen
9. Zufallsereignis auslösen
10. Deltas speichern
11. Rundenhistorie speichern
12. Niederlage/Sieg prüfen
```

### 2.1 Steuereinnahmen

```javascript
function calculateTaxIncome(state) {
  const base = Math.floor(state.population * (state.decisions.taxRate / 100) * 2.5);
  const marketBonus = state.hasMarket ? Math.floor(base * 0.2) : 0;
  return base + marketBonus;
}
```

### 2.2 Getreideernte

```javascript
// Saisonmultiplikatoren (Runde mod 4)
const SEASON_MULTIPLIERS = {
  0: 1.0,   // Frühling – Aussaat
  1: 1.3,   // Sommer – Wachstum
  2: 1.6,   // Herbst – Haupternte
  3: 0.3,   // Winter – Kaum Ernte
};

function calculateHarvest(state) {
  const season = (state.round - 1) % 4;
  const multiplier = SEASON_MULTIPLIERS[season];
  const granaryBonus = state.hasGranary ? 1.2 : 1.0;
  const base = state.land * state.decisions.farmingIntensity * 0.8;
  return Math.floor(base * multiplier * granaryBonus);
}
```

### 2.3 Zufriedenheit

```javascript
function calculateSatisfactionDelta(state) {
  let delta = 0;

  // Getreideversorgung (wichtigster Faktor)
  const grainPerPerson = state.decisions.grainDistribution / Math.max(1, state.population);
  if (grainPerPerson < 0.5)      delta -= 18;
  else if (grainPerPerson < 0.8) delta -= 7;
  else if (grainPerPerson < 1.2) delta += 1;
  else if (grainPerPerson >= 1.5) delta += 6;
  else                            delta += 3;

  // Steuern
  if (state.decisions.taxRate > 50)      delta -= 12;
  else if (state.decisions.taxRate > 40) delta -= Math.floor((state.decisions.taxRate - 40) * 0.6);
  else if (state.decisions.taxRate < 10) delta += 4;

  // Kirche
  if (state.hasChurch) delta += 5;

  // Sicherheit (Soldaten)
  const soldierRatio = state.soldiers / Math.max(1, state.population);
  if (soldierRatio < 0.05) delta -= 3;  // Kaum Schutz
  else if (soldierRatio > 0.3) delta -= 2;  // Zu militaristisch

  return Math.max(-25, Math.min(20, delta));  // Clamp
}
```

### 2.4 Bevölkerungswachstum

```javascript
function calculatePopulationChange(state) {
  const growthRate = 0.03 * (state.satisfaction / 80);
  const growth = Math.floor(state.population * growthRate);
  const deaths = state.satisfaction < 30 
    ? Math.floor(state.population * 0.05) 
    : 0;
  return growth - deaths;
}
```

### 2.5 Soldatenunterhalt

```javascript
function calculateSoldierUpkeep(state) {
  const baseCost = Math.floor(state.soldiers * 2);  // 2 Gold pro Soldat
  const campDiscount = state.hasMilitaryCamp ? 0.8 : 1.0;
  return Math.floor(baseCost * campDiscount);
}
```

### 2.6 Rekrutierung

```javascript
function processRecruitment(state) {
  const campDiscount = state.hasMilitaryCamp ? 0.8 : 1.0;
  const costPerSoldier = Math.floor(15 * campDiscount);
  const totalCost = state.decisions.recruit * costPerSoldier;
  
  if (state.gold >= totalCost) {
    state.gold -= totalCost;
    state.soldiers += state.decisions.recruit;
  } else {
    // Rekrutiere so viele wie möglich
    const affordable = Math.floor(state.gold / costPerSoldier);
    state.gold -= affordable * costPerSoldier;
    state.soldiers += affordable;
  }
}
```

---

## 3. Ereignissystem

### 3.1 Ereignis-Typen

```javascript
const EVENTS = [
  // NEGATIVE EREIGNISSE
  {
    id: 'drought',
    chance: 0.12,
    icon: '🌧',
    title: 'Dürre',
    category: 'natural',
    bad: true,
    effect: (state) => {
      state.grain = Math.max(0, state.grain - 150);
      state.satisfaction -= 8;
    },
    // Wird an Claude API als Kontext übergeben für Ereignistext
    contextHint: 'severe drought destroyed crops',
  },
  {
    id: 'bandits',
    chance: 0.10,
    icon: '🗡',
    title: 'Räuber',
    category: 'military',
    bad: true,
    effect: (state) => {
      const stolen = Math.floor(state.gold * 0.15);
      state.gold = Math.max(0, state.gold - stolen);
      state.satisfaction -= 5;
    },
    contextHint: 'bandits raided trade routes',
    // Gegenmittel: Soldaten reduzieren Wahrscheinlichkeit
    mitigatedBy: (state) => state.soldiers > 50 ? 0.5 : 1.0,
  },
  {
    id: 'plague',
    chance: 0.08,
    icon: '🤒',
    title: 'Seuche',
    category: 'natural',
    bad: true,
    effect: (state) => {
      state.population = Math.max(10, state.population - 30);
      state.satisfaction -= 15;
    },
    contextHint: 'deadly plague spread through the kingdom',
  },
  {
    id: 'fire',
    chance: 0.07,
    icon: '🔥',
    title: 'Großbrand',
    category: 'disaster',
    bad: true,
    effect: (state) => {
      state.grain = Math.max(0, state.grain - 250);
    },
    contextHint: 'fire burned grain stores',
  },
  {
    id: 'flood',
    chance: 0.06,
    icon: '🌊',
    title: 'Überschwemmung',
    category: 'natural',
    bad: true,
    effect: (state) => {
      state.grain = Math.max(0, state.grain - 100);
      state.land = Math.max(1, state.land - 1);
    },
    contextHint: 'floods destroyed farmland',
  },
  {
    id: 'rebellion',
    chance: 0.06,
    icon: '⚔️',
    title: 'Aufstand',
    category: 'political',
    bad: true,
    // Nur wenn Zufriedenheit < 35
    condition: (state) => state.satisfaction < 35,
    effect: (state) => {
      state.population = Math.max(10, state.population - 20);
      state.gold = Math.max(0, state.gold - 100);
      state.satisfaction -= 20;
    },
    contextHint: 'peasant rebellion broke out',
  },

  // POSITIVE EREIGNISSE
  {
    id: 'good_harvest',
    chance: 0.12,
    icon: '✨',
    title: 'Reiche Ernte',
    category: 'natural',
    bad: false,
    effect: (state) => {
      state.grain += 200;
      state.satisfaction += 7;
    },
    contextHint: 'exceptional harvest blessed the kingdom',
  },
  {
    id: 'caravan',
    chance: 0.10,
    icon: '🐫',
    title: 'Handelskäravan',
    category: 'economic',
    bad: false,
    effect: (state) => {
      const bonus = state.hasMarket ? 180 : 120;
      state.gold += bonus;
      state.satisfaction += 4;
    },
    contextHint: 'wealthy trading caravan arrived from the east',
  },
  {
    id: 'festival',
    chance: 0.08,
    icon: '🎉',
    title: 'Volksfest',
    category: 'social',
    bad: false,
    effect: (state) => {
      state.satisfaction = Math.min(100, state.satisfaction + 15);
    },
    contextHint: 'spontaneous festival lifted spirits',
  },
  {
    id: 'ore_discovery',
    chance: 0.07,
    icon: '⛏',
    title: 'Erzfund',
    category: 'economic',
    bad: false,
    effect: (state) => {
      state.gold += 100;
    },
    contextHint: 'miners discovered rich ore veins',
  },
  {
    id: 'immigrants',
    chance: 0.06,
    icon: '🚶',
    title: 'Siedler',
    category: 'social',
    bad: false,
    effect: (state) => {
      state.population += 25;
      state.satisfaction += 3;
    },
    contextHint: 'settlers from distant lands swelled the population',
  },
  {
    id: 'alliance',
    chance: 0.05,
    icon: '🤝',
    title: 'Bündnis',
    category: 'political',
    bad: false,
    effect: (state) => {
      state.gold += 80;
      state.soldiers += 10;
      state.satisfaction += 5;
    },
    contextHint: 'neighboring kingdom offered military alliance',
  },
];
```

### 3.2 Ereignis-Auswahl

```javascript
function rollEvent(state) {
  const eligible = EVENTS.filter(ev => {
    // Bedingungsprüfung
    if (ev.condition && !ev.condition(state)) return false;
    return true;
  });

  // Gewichtete Zufallsauswahl mit Milderungsfaktoren
  let roll = Math.random();
  let cumulative = 0;

  for (const ev of eligible) {
    const mitigator = ev.mitigatedBy ? ev.mitigatedBy(state) : 1.0;
    const adjustedChance = ev.chance * mitigator;
    cumulative += adjustedChance;
    if (roll < cumulative) return ev;
  }

  return null;  // Keine Ereignis diese Runde
}
```

---

## 4. Gebäude-System

```javascript
const BUILDINGS = {
  market: {
    id: 'market',
    name: 'Marktplatz',
    icon: '🏪',
    cost: { gold: 200 },
    effect: 'Steuereinnahmen +20%',
    requires: null,
  },
  granary: {
    id: 'granary',
    name: 'Getreidespeicher',
    icon: '🏚',
    cost: { gold: 150 },
    effect: 'Ernte +20%',
    requires: null,
  },
  militaryCamp: {
    id: 'militaryCamp',
    name: 'Militärlager',
    icon: '⚔️',
    cost: { gold: 180 },
    effect: 'Rekrutierungskosten -20%',
    requires: null,
  },
  church: {
    id: 'church',
    name: 'Kathedrale',
    icon: '⛪',
    cost: { gold: 250 },
    effect: 'Zufriedenheit +5/Runde',
    requires: null,
  },
  walls: {
    id: 'walls',
    name: 'Stadtmauern',
    icon: '🏰',
    cost: { gold: 300 },
    effect: 'Räuberereignisse -50%, Angriffsstärke +20%',
    requires: null,
  },
};
```

---

## 5. Kampfsystem

```javascript
function attackEnemy(state) {
  const wallBonus = state.hasWalls ? 1.2 : 1.0;
  const attackPower = (state.soldiers * wallBonus) + Math.floor(Math.random() * 30);
  const defenseThreshold = state.enemyStrength * 0.8;

  if (attackPower > defenseThreshold) {
    // SIEG
    state.land += 1;
    state.enemyStrength = Math.max(30, state.enemyStrength - 35);
    const losses = Math.floor(state.soldiers * 0.15);
    state.soldiers = Math.max(0, state.soldiers - losses);
    state.gold += 80 + Math.floor(Math.random() * 80);
    return { victory: true, losses };
  } else {
    // NIEDERLAGE
    const losses = Math.floor(state.soldiers * 0.35);
    state.soldiers = Math.max(0, state.soldiers - losses);
    state.satisfaction -= 12;
    return { victory: false, losses };
  }
}
```

---

## 6. Sieg/Niederlage

```javascript
function checkEndConditions(state) {
  // NIEDERLAGE – sofort
  if (state.population <= 0) {
    return { over: true, victory: false, reason: 'population_zero' };
  }
  if (state.grain <= 0 && state.satisfaction < 15) {
    return { over: true, victory: false, reason: 'famine' };
  }

  // Niederlage durch anhaltende Unzufriedenheit
  if (state.satisfaction < 10) {
    state.lowSatisfactionStreak = (state.lowSatisfactionStreak || 0) + 1;
    if (state.lowSatisfactionStreak >= 3) {
      return { over: true, victory: false, reason: 'rebellion_victory' };
    }
  } else {
    state.lowSatisfactionStreak = 0;
  }

  // SIEG
  if (state.round > state.maxRounds) {
    const score = calculateScore(state);
    return { over: true, victory: true, score, reason: 'survived' };
  }

  return { over: false };
}

function calculateScore(state) {
  return Math.floor(
    state.population * 0.5 +
    state.gold * 0.2 +
    state.satisfaction * 15 +
    state.land * 60 +
    state.soldiers * 2
  );
}
```

---

## 7. Advisor-System (Hofchronist)

Der Berater analysiert den Spielzustand und gibt kontextabhängige Hinweise:

```javascript
const ADVISOR_RULES = [
  { condition: s => s.satisfaction > 85, text: 'Das Volk liebt Euch. Die Äcker blühen, die Kinder lachen.' },
  { condition: s => s.satisfaction < 25, text: '⚠️ Achtung! Das Volk murrt laut. Eine Revolte könnte ausbrechen!' },
  { condition: s => s.grain < 200, text: 'Die Kornkammern leeren sich. Mehr Anbau oder Handel ist nötig!' },
  { condition: s => s.gold < 80, text: 'Die Staatskasse ist fast leer. Erhöht die Steuern oder baut einen Markt.' },
  { condition: s => s.enemyStrength > 160, text: 'Unsere Spione melden: Der Feind rüstet massiv auf!' },
  { condition: s => s.round > 16, text: `Noch ${20 - s.round + 1} Jahre bis Ihr in die Annalen eingeht.` },
  { condition: s => s.soldiers < 15, text: 'Unsere Verteidigung ist kritisch schwach. Sofort rekrutieren!' },
  { condition: s => s.hasMarket === false && s.gold > 300, text: 'Ein Markt würde Eure Einnahmen erheblich steigern.' },
  { condition: s => s.decisions.taxRate > 45, text: 'Die Steuerlast drückt das Volk. Bedenkt die Folgen.' },
  { condition: s => (s.round - 1) % 4 === 2, text: 'Der Herbst ist die beste Zeit für die Ernte. Nutzt sie!' },
  { condition: s => (s.round - 1) % 4 === 3, text: 'Im Winter ist kaum Ernte zu erwarten. Spart Getreide!' },
];

function getAdvisorText(state) {
  const relevant = ADVISOR_RULES.filter(r => r.condition(state));
  if (relevant.length === 0) return 'Das Reich gedeiht unter Eurer weisen Herrschaft.';
  return relevant[Math.floor(Math.random() * relevant.length)].text;
}
```

---

## 8. Scoring & Highscore

```javascript
// Highscores in localStorage
const HIGHSCORE_KEY = 'kaiser_highscores';

function saveHighscore(name, score, rounds) {
  const scores = getHighscores();
  scores.push({ name, score, rounds, date: new Date().toISOString() });
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem(HIGHSCORE_KEY, JSON.stringify(scores.slice(0, 10)));
}

function getHighscores() {
  return JSON.parse(localStorage.getItem(HIGHSCORE_KEY) || '[]');
}
```
