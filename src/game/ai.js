// src/game/ai.js
// Claude API Integration für dynamische Ereignistexte
// Referenz: docs/API_SPEC.md

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL   = 'claude-sonnet-4-20250514';

const SEASONS_DE = ['Frühling', 'Sommer', 'Herbst', 'Winter'];

// === API KEY MANAGEMENT ===
export function getApiKey() {
  return localStorage.getItem('kaiser_api_key') || '';
}

export function saveApiKey(key) {
  localStorage.setItem('kaiser_api_key', key.trim());
}

export function hasApiKey() {
  return !!getApiKey();
}

// === PROMPT BUILDER ===
function buildEventPrompt(event, gameState) {
  const season = SEASONS_DE[(gameState.round - 1) % 4];

  return `Du bist der Hofchronist eines mittelalterlichen Königreichs und schreibst im Stil einer alten Chronik.

AKTUELLER SPIELSTAND:
- Jahr: ${gameState.round} von 20 · Jahreszeit: ${season}
- Bevölkerung: ${gameState.population} Seelen · Zufriedenheit: ${gameState.satisfaction}%
- Schatzkammer: ${gameState.gold} Goldstücke · Getreide: ${gameState.grain} Scheffel
- Soldaten: ${gameState.soldiers} Mann · Gebiete: ${gameState.land}

EREIGNIS: ${event.title}
KONTEXT: ${event.contextHint}

Schreibe GENAU 2 dramatische Sätze auf Deutsch (max. 55 Wörter gesamt):
- Mittelalterlicher Stil ("Des Kaisers Reich...", "Das Volk...")
- Nimm konkret Bezug auf den Spielstand (Zahlen wenn sinnvoll)
- Kein Markdown, kein JSON – nur reiner Text
- Ende mit einem kurzen Hinweis auf die Konsequenz`;
}

function buildAdvisorPrompt(gameState) {
  const season = SEASONS_DE[(gameState.round - 1) % 4];
  const dringlickeit = gameState.satisfaction < 30 ? 'DRINGEND und warnend' : 'weise und ruhig';

  return `Du bist ein weiser Hofberater. Ton: ${dringlickeit}.

Spielstand: Jahr ${gameState.round}/20, ${season}
Pop: ${gameState.population} | Gold: ${gameState.gold} | Getreide: ${gameState.grain}
Soldaten: ${gameState.soldiers} | Zufriedenheit: ${gameState.satisfaction}%
Feindstärke: ${gameState.enemyStrength}

Gib genau EINEN Rat (max. 18 Wörter) im mittelalterlichen Stil. Nur Text, kein Markdown.`;
}

// === API CALLS ===

let lastCallTime = 0;
const RATE_LIMIT_MS = 2000;

async function apiCall(prompt, maxTokens = 120) {
  const key = getApiKey();
  if (!key) return null;

  // Rate limiting
  const now = Date.now();
  if (now - lastCallTime < RATE_LIMIT_MS) {
    await new Promise(r => setTimeout(r, RATE_LIMIT_MS - (now - lastCallTime)));
  }
  lastCallTime = Date.now();

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error(`API Error ${response.status}:`, err);
      return null;
    }

    const data = await response.json();
    return data.content?.[0]?.text?.trim() || null;

  } catch (err) {
    console.error('Claude API Fehler:', err);
    return null;
  }
}

// Ereignistext generieren (mit Fallback)
export async function generateEventText(event, gameState) {
  if (!hasApiKey()) return event.fallbackText;

  const text = await apiCall(buildEventPrompt(event, gameState), 150);
  return text || event.fallbackText;
}

// Berater-Text generieren (mit Fallback)
export async function generateAdvisorText(gameState, fallbackFn) {
  if (!hasApiKey()) return fallbackFn(gameState);

  const text = await apiCall(buildAdvisorPrompt(gameState), 60);
  return text || fallbackFn(gameState);
}

// API Key testen
export async function testApiKey(key) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hallo' }]
      })
    });
    return response.ok;
  } catch {
    return false;
  }
}
