// src/game/engine.js
// Spiellogik – Rundenberechnung und alle Formeln
// Referenz: docs/FORMULAS.md

import { createSnapshot } from './state.js';
import { rollEvent } from './events.js';

// === SAISON ===
const SEASONS = ['🌱 Frühling', '☀️ Sommer', '🍂 Herbst', '❄️ Winter'];
const SEASON_MULTIPLIERS = [1.0, 1.3, 1.6, 0.3];

export function getSeason(round) {
  return SEASONS[(round - 1) % 4];
}

export function getSeasonIndex(round) {
  return (round - 1) % 4;
}

// === HAUPTBERECHNUNG (pro Runde) ===
export function processTurn(state) {
  // Snapshot vor der Runde für Deltas
  const before = {
    gold: state.gold,
    grain: state.grain,
    population: state.population,
    soldiers: state.soldiers,
    land: state.land,
    satisfaction: state.satisfaction,
  };

  // 1. Steuereinnahmen
  const taxIncome = calculateTaxIncome(state);
  state.gold += taxIncome;

  // 2. Getreideernte
  const harvest = calculateHarvest(state);
  state.grain += harvest;

  // 3. Getreideverteilung abziehen
  state.grain = Math.max(0, state.grain - state.decisions.grainDistribution);

  // 4. Rekrutierung
  processRecruitment(state);

  // 5. Soldatenunterhalt
  const upkeep = calculateSoldierUpkeep(state);
  state.gold = Math.max(0, state.gold - upkeep);

  // 6. Zufriedenheit
  const satDelta = calculateSatisfactionDelta(state);
  state.satisfaction = Math.max(0, Math.min(100, state.satisfaction + satDelta));

  // 7. Bevölkerung
  const popChange = calculatePopulationChange(state);
  state.population = Math.max(10, state.population + popChange);

  // 8. Gegner wird stärker
  state.enemyStrength += 5 + Math.floor(Math.random() * 8);

  // 9. Zufallsereignis
  const event = rollEvent(state);

  // 10. Deltas berechnen
  state.deltas = {
    gold: state.gold - before.gold,
    grain: state.grain - before.grain,
    population: state.population - before.population,
    soldiers: state.soldiers - before.soldiers,
    land: state.land - before.land,
    satisfaction: state.satisfaction - before.satisfaction,
  };

  // 11. History
  state.history.push(createSnapshot(state));

  // 12. Runde erhöhen
  state.round += 1;

  // 13. Niederlage/Sieg prüfen
  const endResult = checkEndConditions(state);

  return { event, endResult, harvest, taxIncome, upkeep };
}

// === STEUEREINNAHMEN ===
export function calculateTaxIncome(state) {
  const base = Math.floor(state.population * (state.decisions.taxRate / 100) * 2.5);
  const marketBonus = state.hasMarket ? Math.floor(base * 0.2) : 0;
  return base + marketBonus;
}

// === GETREIDEERNTE ===
export function calculateHarvest(state) {
  const season = getSeasonIndex(state.round);
  const multiplier = SEASON_MULTIPLIERS[season];
  const granaryFactor = state.hasGranary ? 1.2 : 1.0;
  const base = state.land * state.decisions.farmingIntensity * 0.8;
  return Math.floor(base * multiplier * granaryFactor);
}

// === ZUFRIEDENHEIT ===
export function calculateSatisfactionDelta(state) {
  let delta = 0;

  // Getreideversorgung (wichtigster Faktor)
  const grainPerPerson = state.decisions.grainDistribution / Math.max(1, state.population);
  if (grainPerPerson < 0.5)       delta -= 18;
  else if (grainPerPerson < 0.8)  delta -= 7;
  else if (grainPerPerson < 1.2)  delta += 1;
  else if (grainPerPerson < 1.5)  delta += 3;
  else                             delta += 6;

  // Steuern
  if (state.decisions.taxRate > 50)       delta -= 12;
  else if (state.decisions.taxRate > 40)  delta -= Math.floor((state.decisions.taxRate - 40) * 0.6);
  else if (state.decisions.taxRate < 10)  delta += 4;

  // Gebäude-Boni
  if (state.hasChurch) delta += 5;

  // Militär-Balance
  const soldierRatio = state.soldiers / Math.max(1, state.population);
  if (soldierRatio < 0.05) delta -= 3;   // Zu wenig Schutz
  else if (soldierRatio > 0.3) delta -= 2; // Zu militaristisch

  return Math.max(-25, Math.min(20, delta));
}

// === BEVÖLKERUNG ===
export function calculatePopulationChange(state) {
  const growthRate = 0.03 * (state.satisfaction / 80);
  const growth = Math.floor(state.population * growthRate);
  const deaths = state.satisfaction < 30
    ? Math.floor(state.population * 0.05)
    : 0;
  return growth - deaths;
}

// === SOLDATEN-UNTERHALT ===
export function calculateSoldierUpkeep(state) {
  const base = Math.floor(state.soldiers * 2);
  const campDiscount = state.hasMilitaryCamp ? 0.8 : 1.0;
  return Math.floor(base * campDiscount);
}

// === REKRUTIERUNG ===
export function processRecruitment(state) {
  const campDiscount = state.hasMilitaryCamp ? 0.8 : 1.0;
  const costPerSoldier = Math.floor(15 * campDiscount);
  const totalCost = state.decisions.recruit * costPerSoldier;

  if (state.gold >= totalCost) {
    state.gold -= totalCost;
    state.soldiers += state.decisions.recruit;
  } else {
    // So viele wie möglich
    const affordable = Math.floor(state.gold / costPerSoldier);
    state.gold -= affordable * costPerSoldier;
    state.soldiers += affordable;
  }
}

// === KAMPFSYSTEM ===
export function attackEnemy(state) {
  const wallBonus = state.hasWalls ? 1.2 : 1.0;
  const attackPower = (state.soldiers * wallBonus) + Math.floor(Math.random() * 30);
  const defenseThreshold = state.enemyStrength * 0.8;

  if (attackPower > defenseThreshold) {
    // SIEG
    const losses = Math.floor(state.soldiers * 0.15);
    const plunder = 80 + Math.floor(Math.random() * 80);
    state.land += 1;
    state.enemyStrength = Math.max(30, state.enemyStrength - 35);
    state.soldiers = Math.max(0, state.soldiers - losses);
    state.gold += plunder;
    state.buildings.push(`🏴 Gebiet ${state.land}`);
    return { victory: true, losses, plunder };
  } else {
    // NIEDERLAGE
    const losses = Math.floor(state.soldiers * 0.35);
    state.soldiers = Math.max(0, state.soldiers - losses);
    state.satisfaction = Math.max(0, state.satisfaction - 12);
    return { victory: false, losses, plunder: 0 };
  }
}

// === GEBÄUDE BAUEN ===
export const BUILDINGS = {
  market:       { cost: 200, flag: 'hasMarket',       name: '🏪 Marktplatz',      effect: 'Steuereinnahmen +20%' },
  granary:      { cost: 150, flag: 'hasGranary',      name: '🏚 Getreidespeicher', effect: 'Ernte +20%' },
  militaryCamp: { cost: 180, flag: 'hasMilitaryCamp', name: '⚔️ Militärlager',    effect: 'Rekrut./Unterhalt -20%' },
  church:       { cost: 250, flag: 'hasChurch',       name: '⛪ Kathedrale',       effect: 'Zufriedenheit +5/Runde' },
  walls:        { cost: 300, flag: 'hasWalls',        name: '🏰 Stadtmauern',     effect: 'Räuber -50%, Angriff +20%' },
};

export function buildBuilding(state, buildingId) {
  const building = BUILDINGS[buildingId];
  if (!building) return { success: false, reason: 'Unbekanntes Gebäude.' };
  if (state[building.flag]) return { success: false, reason: 'Bereits vorhanden.' };
  if (state.gold < building.cost) return { success: false, reason: `Nicht genug Gold. Benötigt: ${building.cost}.` };

  state.gold -= building.cost;
  state[building.flag] = true;
  state.buildings.push(building.name);

  return { success: true, building };
}

// === SIEG/NIEDERLAGE ===
export function checkEndConditions(state) {
  // Sofortige Niederlage
  if (state.population <= 0) {
    return { over: true, victory: false, reason: 'population_zero',
      message: 'Alle Einwohner sind gestorben. Das Reich ist gefallen.' };
  }
  if (state.grain <= 0 && state.satisfaction < 15) {
    return { over: true, victory: false, reason: 'famine',
      message: 'Das Volk verhungert. Eine Revolte beendet Eure Herrschaft.' };
  }

  // Anhaltende Unzufriedenheit
  if (state.satisfaction < 10) {
    state.lowSatisfactionStreak = (state.lowSatisfactionStreak || 0) + 1;
    if (state.lowSatisfactionStreak >= 3) {
      return { over: true, victory: false, reason: 'rebellion',
        message: 'Das Volk hat sich erhoben. Eure Herrschaft ist beendet.' };
    }
  } else {
    state.lowSatisfactionStreak = 0;
  }

  // Sieg
  if (state.round > state.maxRounds) {
    const score = calculateScore(state);
    const title = getScoreTitle(score);
    return { over: true, victory: true, score, title,
      message: `Nach 20 Jahren weiser Herrschaft geht Euer Name in die Annalen ein!` };
  }

  return { over: false };
}

// === SCORE ===
export function calculateScore(state) {
  return Math.floor(
    state.population * 0.5 +
    state.gold * 0.2 +
    state.satisfaction * 15 +
    state.land * 60 +
    state.soldiers * 2
  );
}

export function getScoreTitle(score) {
  if (score >= 2000) return 'Legendärer Herrscher';
  if (score >= 1500) return 'Großer Kaiser';
  if (score >= 1000) return 'Guter König';
  if (score >= 500)  return 'Durchschnittlicher Herrscher';
  return 'Schlechter Kaiser';
}

// === ADVISOR ===
const ADVISOR_RULES = [
  { condition: s => s.satisfaction > 85, text: 'Das Volk liebt Euch. Die Äcker blühen, die Kinder lachen.' },
  { condition: s => s.satisfaction < 25, text: '⚠️ Das Volk murrt gefährlich laut. Eine Revolte droht!' },
  { condition: s => s.grain < 200,       text: 'Die Kornkammern leeren sich bedrohlich schnell!' },
  { condition: s => s.gold < 80,         text: 'Die Staatskasse ist fast leer. Steuern erhöhen!' },
  { condition: s => s.enemyStrength > 160, text: 'Unsere Spione warnen: Der Feind rüstet massiv auf!' },
  { condition: s => s.round > 16,        text: `Noch ${21 - s.round} Jahre bis Ihr in die Annalen eingeht.` },
  { condition: s => s.soldiers < 15,     text: 'Unsere Verteidigung ist kritisch schwach!' },
  { condition: s => !s.hasMarket && s.gold > 300, text: 'Ein Markt würde Eure Einnahmen erheblich steigern.' },
  { condition: s => s.decisions.taxRate > 45, text: 'Die Steuerlast erdrückt das Volk. Senkt die Abgaben.' },
  { condition: s => getSeasonIndex(s.round) === 2, text: 'Herbst – die beste Ernte! Maximiert den Anbau.' },
  { condition: s => getSeasonIndex(s.round) === 3, text: 'Winter – kaum Ernte. Spart Getreide!' },
];

export function getAdvisorText(state) {
  const relevant = ADVISOR_RULES.filter(r => r.condition(state));
  if (relevant.length === 0) return 'Das Reich gedeiht unter Eurer weisen Herrschaft.';
  return relevant[Math.floor(Math.random() * relevant.length)].text;
}
