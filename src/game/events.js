// src/game/events.js
// Alle Spielereignisse mit Effekten und Fallback-Texten

export const EVENTS = [
  // ── NEGATIVE ──────────────────────────────────────────
  {
    id: 'drought',
    chance: 0.12,
    icon: '🌧',
    title: 'Dürre',
    category: 'natural',
    bad: true,
    condition: null,
    mitigatedBy: null,
    effect: (state) => {
      state.grain = Math.max(0, state.grain - 150);
      state.satisfaction -= 8;
    },
    contextHint: 'severe drought destroyed crops and dried up rivers',
    fallbackText: 'Wochenlanger Regen versumpft die Felder. Die Ernte fällt erschreckend mager aus und das Volk hungert.',
  },
  {
    id: 'bandits',
    chance: 0.10,
    icon: '🗡',
    title: 'Räuber',
    category: 'military',
    bad: true,
    condition: null,
    mitigatedBy: (state) => state.hasWalls ? 0.3 : state.soldiers > 50 ? 0.5 : 1.0,
    effect: (state) => {
      const stolen = Math.floor(state.gold * 0.15);
      state.gold = Math.max(0, state.gold - stolen);
      state.satisfaction -= 5;
    },
    contextHint: 'bandits raided trade routes and attacked merchants',
    fallbackText: 'Eine Bande Wegelagerer überfällt die Handelswagen auf der Reichsstraße. Gold und Waren gehen verloren.',
  },
  {
    id: 'plague',
    chance: 0.08,
    icon: '🤒',
    title: 'Seuche',
    category: 'natural',
    bad: true,
    condition: null,
    mitigatedBy: null,
    effect: (state) => {
      state.population = Math.max(10, state.population - 30);
      state.satisfaction -= 15;
    },
    contextHint: 'deadly plague swept through the kingdom killing many',
    fallbackText: 'Eine mysteriöse Krankheit greift um sich. Die Toten werden in Massengräbern beerdigt. Das Volk lebt in Angst.',
  },
  {
    id: 'fire',
    chance: 0.07,
    icon: '🔥',
    title: 'Großbrand',
    category: 'disaster',
    bad: true,
    condition: null,
    mitigatedBy: null,
    effect: (state) => {
      state.grain = Math.max(0, state.grain - 250);
    },
    contextHint: 'devastating fire burned grain stores and barns',
    fallbackText: 'Ein verheerender Brand zerstört die Getreidespeicher. Die Flammen fressen sich durch die hölzernen Scheunen.',
  },
  {
    id: 'flood',
    chance: 0.06,
    icon: '🌊',
    title: 'Überschwemmung',
    category: 'natural',
    bad: true,
    condition: null,
    mitigatedBy: null,
    effect: (state) => {
      state.grain = Math.max(0, state.grain - 100);
      state.land = Math.max(1, state.land - 1);
    },
    contextHint: 'devastating floods destroyed farmland and villages',
    fallbackText: 'Der Silberbach tritt über die Ufer. Ackerland versinkt im Schlamm, ein Gebiet geht verloren.',
  },
  {
    id: 'rebellion',
    chance: 0.06,
    icon: '⚔️',
    title: 'Bauernaufstand',
    category: 'political',
    bad: true,
    condition: (state) => state.satisfaction < 35,
    mitigatedBy: (state) => state.soldiers > 60 ? 0.3 : 1.0,
    effect: (state) => {
      state.population = Math.max(10, state.population - 20);
      state.gold = Math.max(0, state.gold - 100);
      state.satisfaction -= 20;
    },
    contextHint: 'peasant rebellion broke out causing chaos',
    fallbackText: 'Das unterdrückte Volk erhebt sich mit Sensen und Fackeln. Straßenkämpfe erschüttern die Hauptstadt.',
  },
  {
    id: 'harsh_winter',
    chance: 0.05,
    icon: '🌨',
    title: 'Harter Winter',
    category: 'natural',
    bad: true,
    condition: (state) => (state.round - 1) % 4 === 3,  // Nur im Winter
    mitigatedBy: null,
    effect: (state) => {
      state.grain = Math.max(0, state.grain - 80);
      state.population = Math.max(10, state.population - 10);
      state.satisfaction -= 6;
    },
    contextHint: 'unusually harsh winter brought famine and cold',
    fallbackText: 'Der härteste Winter seit Menschengedenken. Alte und Schwache sterben, das Getreide schwindet.',
  },

  // ── POSITIVE ──────────────────────────────────────────
  {
    id: 'good_harvest',
    chance: 0.12,
    icon: '✨',
    title: 'Reiche Ernte',
    category: 'natural',
    bad: false,
    condition: null,
    mitigatedBy: null,
    effect: (state) => {
      const bonus = state.hasGranary ? 250 : 200;
      state.grain += bonus;
      state.satisfaction += 7;
    },
    contextHint: 'exceptional harvest blessed the kingdom with abundance',
    fallbackText: 'Die Götter sind wohlgesonnen! Volle Scheunen, lachende Bauern – die Ernte übertrifft alle Erwartungen.',
  },
  {
    id: 'caravan',
    chance: 0.10,
    icon: '🐫',
    title: 'Handelskäravan',
    category: 'economic',
    bad: false,
    condition: null,
    mitigatedBy: null,
    effect: (state) => {
      const bonus = state.hasMarket ? 180 : 120;
      state.gold += bonus;
      state.satisfaction += 4;
    },
    contextHint: 'wealthy trading caravan arrived bringing exotic goods',
    fallbackText: 'Eine reiche Karawane aus dem fernen Osten trifft ein. Exotische Waren beleben den Markt und füllen die Kassen.',
  },
  {
    id: 'festival',
    chance: 0.08,
    icon: '🎉',
    title: 'Volksfest',
    category: 'social',
    bad: false,
    condition: null,
    mitigatedBy: null,
    effect: (state) => {
      state.satisfaction = Math.min(100, state.satisfaction + 15);
    },
    contextHint: 'spontaneous festival lifted the spirits of the people',
    fallbackText: 'Ein spontanes Volksfest bricht aus! Musik, Tanz und Gelächter erfüllen das ganze Reich.',
  },
  {
    id: 'ore_discovery',
    chance: 0.07,
    icon: '⛏',
    title: 'Erzfund',
    category: 'economic',
    bad: false,
    condition: null,
    mitigatedBy: null,
    effect: (state) => {
      state.gold += 100;
    },
    contextHint: 'miners discovered rich ore veins in the mountains',
    fallbackText: 'Bergleute entdecken eine reiche Erzader tief in den Eisengebirgen. Die Schmelzhütten arbeiten Tag und Nacht.',
  },
  {
    id: 'immigrants',
    chance: 0.06,
    icon: '🚶',
    title: 'Neue Siedler',
    category: 'social',
    bad: false,
    condition: null,
    mitigatedBy: null,
    effect: (state) => {
      state.population += 25;
      state.satisfaction += 3;
    },
    contextHint: 'settlers from distant lands swelled the population',
    fallbackText: 'Flüchtlinge aus fernen, kriegsgeplagten Landen suchen Schutz. Das Reich wächst um viele neue Seelen.',
  },
  {
    id: 'alliance',
    chance: 0.05,
    icon: '🤝',
    title: 'Bündnisangebot',
    category: 'political',
    bad: false,
    condition: null,
    mitigatedBy: null,
    effect: (state) => {
      state.gold += 80;
      state.soldiers += 10;
      state.satisfaction += 5;
    },
    contextHint: 'neighboring kingdom offered military alliance and aid',
    fallbackText: 'Ein Gesandter des Nachbarkönigs überbringt ein Bündnisangebot – Gold, Krieger und gegenseitiger Beistand.',
  },
  {
    id: 'monastery_donation',
    chance: 0.04,
    icon: '⛪',
    title: 'Klosterspende',
    category: 'social',
    bad: false,
    condition: null,
    mitigatedBy: null,
    effect: (state) => {
      state.grain += 80;
      state.satisfaction += 8;
    },
    contextHint: 'local monastery donated food and blessed the people',
    fallbackText: 'Das Kloster St. Hubertus öffnet seine Speicher für das Volk. Mönche verteilen Brot und Suppe.',
  },
];

// === EREIGNIS-AUSWAHL ===
export function rollEvent(state) {
  const eligible = EVENTS.filter(ev => {
    if (ev.condition && !ev.condition(state)) return false;
    return true;
  });

  const roll = Math.random();
  let cumulative = 0;

  for (const ev of eligible) {
    const mitigator = ev.mitigatedBy ? ev.mitigatedBy(state) : 1.0;
    const adjustedChance = ev.chance * mitigator;
    cumulative += adjustedChance;
    if (roll < cumulative) {
      // Ereignis anwenden
      ev.effect(state);
      return ev;
    }
  }

  return null;  // Keine Ereignis
}
