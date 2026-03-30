// src/game/state.js
// SINGLE SOURCE OF TRUTH – Gesamter Spielzustand
// Alle anderen Module importieren von hier

export const INITIAL_STATE = {
  // === META ===
  round: 1,
  maxRounds: 20,
  gameOver: false,
  victory: false,
  lowSatisfactionStreak: 0,

  // === RESSOURCEN ===
  gold: 500,
  grain: 800,
  population: 200,
  soldiers: 30,
  land: 3,
  satisfaction: 65,

  // === GEGNER ===
  enemyStrength: 80,

  // === GEBÄUDE ===
  hasMarket: false,
  hasGranary: false,
  hasMilitaryCamp: false,
  hasChurch: false,
  hasWalls: false,

  // === SPIELER-ENTSCHEIDUNGEN (Slider-Werte) ===
  decisions: {
    taxRate: 20,           // 0–60%
    grainDistribution: 150, // Getreide verteilt pro Runde
    farmingIntensity: 40,  // % Anbaufläche
    recruit: 5,            // Neue Soldaten
  },

  // === HISTORY (für Charts) ===
  history: [],

  // === DELTAS (letzte Runde) ===
  deltas: {
    gold: 0,
    grain: 0,
    population: 0,
    soldiers: 0,
    land: 0,
    satisfaction: 0,
  },

  // === GEBÄUDE-LISTE (für Anzeige) ===
  buildings: ['🏰 Burg', '🌾 Felder (3)'],
};

// Erstelle eine tiefe Kopie des Initialzustands
export function createInitialState() {
  return JSON.parse(JSON.stringify(INITIAL_STATE));
}

// Spielzustand speichern
export function saveState(state) {
  try {
    localStorage.setItem('kaiser_state', JSON.stringify(state));
  } catch (e) {
    console.warn('Spielstand konnte nicht gespeichert werden:', e);
  }
}

// Spielzustand laden
export function loadState() {
  try {
    const saved = localStorage.getItem('kaiser_state');
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (e) {
    console.warn('Spielstand konnte nicht geladen werden:', e);
    return null;
  }
}

// Spielzustand löschen
export function clearState() {
  localStorage.removeItem('kaiser_state');
}

// Snapshot für History
export function createSnapshot(state) {
  return {
    round: state.round,
    gold: state.gold,
    grain: state.grain,
    population: state.population,
    soldiers: state.soldiers,
    satisfaction: state.satisfaction,
    land: state.land,
  };
}
