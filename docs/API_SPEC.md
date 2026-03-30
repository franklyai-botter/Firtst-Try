# API_SPEC.md – Claude API Integration

## Übersicht

Die Claude API wird genutzt um **dynamische, narrative Ereignistexte** zu generieren.
Jede Runde kann ein Ereignis auftreten – statt statischer Texte generiert Claude
kontextabhängige, mittelalterliche Beschreibungen.

---

## API-Setup

```javascript
// src/game/ai.js

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL   = 'claude-sonnet-4-20250514';  // Immer Sonnet 4

// API Key: Wird vom Nutzer im UI eingegeben und in localStorage gespeichert
// NIEMALS hardcoden!
function getApiKey() {
  return localStorage.getItem('kaiser_api_key') || '';
}
```

---

## Prompt-Template für Ereignistexte

```javascript
function buildEventPrompt(event, gameState) {
  const season = ['Frühling', 'Sommer', 'Herbst', 'Winter'][(gameState.round - 1) % 4];
  
  return `Du bist der Hofchronist eines mittelalterlichen Königreichs und schreibst im Stil einer alten Chronik.

AKTUELLER SPIELSTAND:
- Jahr: ${gameState.round} von 20
- Jahreszeit: ${season}
- Bevölkerung: ${gameState.population} Seelen
- Gold in der Schatzkammer: ${gameState.gold} Goldstücke
- Getreidevorrat: ${gameState.grain} Scheffel
- Soldaten: ${gameState.soldiers} Mann
- Zufriedenheit des Volkes: ${gameState.satisfaction}%
- Kontrollierte Gebiete: ${gameState.land}

EREIGNIS: ${event.title}
KONTEXT: ${event.contextHint}

Schreibe GENAU 2 Sätze (max. 60 Wörter) auf Deutsch:
- Mittelalterlicher, dramatischer Stil ("Des Kaisers Reich...", "Das Volk...")
- Konkret auf den aktuellen Spielstand bezogen (erwähne Zahlen wenn passend)
- Keine Erklärungen, nur narrativer Text
- Kein Markdown, kein JSON - nur reiner Text`;
}
```

---

## API-Call Implementierung

```javascript
async function generateEventText(event, gameState) {
  const apiKey = getApiKey();
  
  // Fallback wenn kein API Key
  if (!apiKey) {
    return event.fallbackText || 
      `${event.title}: Das Ereignis erschüttert das Reich.`;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: buildEventPrompt(event, gameState)
        }]
      })
    });

    if (!response.ok) {
      console.error('API Error:', response.status);
      return event.fallbackText;
    }

    const data = await response.json();
    return data.content?.[0]?.text?.trim() || event.fallbackText;

  } catch (err) {
    console.error('Claude API Fehler:', err);
    return event.fallbackText;
  }
}
```

---

## Advisor-Text Generierung (Optional)

```javascript
function buildAdvisorPrompt(gameState) {
  return `Du bist ein weiser Hofberater in einem mittelalterlichen Königreich.

SPIELSTAND:
- Runde: ${gameState.round}/20, Jahreszeit: ${['Frühling','Sommer','Herbst','Winter'][(gameState.round-1)%4]}
- Bevölkerung: ${gameState.population}, Zufriedenheit: ${gameState.satisfaction}%
- Gold: ${gameState.gold}, Getreide: ${gameState.grain}
- Soldaten: ${gameState.soldiers}, Feindstärke: ${gameState.enemyStrength}

Gib genau EINEN kurzen Rat (max. 20 Wörter) im Stil eines mittelalterlichen Beraters.
Sei konkret und bezug auf den Spielstand. Kein Markdown.`;
}

async function generateAdvisorText(gameState) {
  const apiKey = getApiKey();
  if (!apiKey) return getLocalAdvisorText(gameState);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 60,
        messages: [{ role: 'user', content: buildAdvisorPrompt(gameState) }]
      })
    });
    const data = await response.json();
    return data.content?.[0]?.text?.trim() || getLocalAdvisorText(gameState);
  } catch {
    return getLocalAdvisorText(gameState);
  }
}
```

---

## API Key UI-Komponente

```javascript
// Kleines Settings-Panel im Spiel
function renderApiKeyInput() {
  return `
    <div class="api-key-section">
      <div class="action-section-title">🤖 KI-Narration</div>
      <input 
        type="password" 
        id="api-key-input"
        placeholder="Anthropic API Key..."
        value="${getApiKey()}"
        style="..." 
      />
      <button onclick="saveApiKey()">Speichern</button>
      <div class="api-status" id="api-status">
        ${getApiKey() ? '✅ KI-Narration aktiv' : '⭕ Statische Texte (kein Key)'}
      </div>
    </div>
  `;
}

function saveApiKey() {
  const key = document.getElementById('api-key-input').value.trim();
  localStorage.setItem('kaiser_api_key', key);
  document.getElementById('api-status').textContent = 
    key ? '✅ KI-Narration aktiv' : '⭕ Statische Texte';
}
```

---

## Fallback-Texte (wenn kein API Key)

```javascript
// In events.js – jedes Event braucht einen Fallback
const EVENT_FALLBACKS = {
  drought:      'Wochenlanger Regen versumpft die Felder. Die Ernte fällt erschreckend mager aus.',
  bandits:      'Eine Bande Wegelagerer überfällt die Handelswagen. Gold geht verloren.',
  plague:       'Eine mysteriöse Krankheit greift um sich. Viele Bürger erkranken und sterben.',
  fire:         'Ein verheerender Brand zerstört Teile der Ernte und hüllt die Stadt in Rauch.',
  flood:        'Reißende Fluten überströmen die Felder und vernichten Anbauflächen.',
  rebellion:    'Das unterdrückte Volk erhebt sich. Straßenkämpfe erschüttern das Reich.',
  good_harvest: 'Die Götter sind wohlgesonnen! Die Ernte ist außergewöhnlich reichhaltig.',
  caravan:      'Eine reiche Karawane aus dem Osten tauscht edle Waren gegen klingende Münze.',
  festival:     'Ein spontanes Volksfest bricht aus. Gelächter und Musik erfüllen das Reich.',
  ore_discovery:'Bergleute entdecken eine reiche Erzader tief in den Eisengebirgen.',
  immigrants:   'Siedler aus fernen Landen suchen Schutz unter Eurem Banner.',
  alliance:     'Ein Botschafter des Nachbarkönigreichs überbringt ein Bündnisangebot.',
};
```

---

## Rate Limiting & Fehlerbehandlung

```javascript
// Verhindert zu viele API Calls
let lastApiCall = 0;
const MIN_INTERVAL = 2000;  // 2 Sekunden Mindestabstand

async function throttledApiCall(prompt) {
  const now = Date.now();
  if (now - lastApiCall < MIN_INTERVAL) {
    await new Promise(r => setTimeout(r, MIN_INTERVAL - (now - lastApiCall)));
  }
  lastApiCall = Date.now();
  return generateEventText(prompt);
}

// Fehlertypen
const API_ERRORS = {
  401: 'Ungültiger API Key. Bitte überprüfen.',
  429: 'Rate Limit erreicht. Bitte warten.',
  500: 'Server-Fehler. Statische Texte werden verwendet.',
};
```
