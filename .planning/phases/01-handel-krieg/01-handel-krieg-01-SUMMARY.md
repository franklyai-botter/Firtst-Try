---
phase: 01-handel-krieg
plan: 01
subsystem: wirtschaft-diplomatie
tags: [grain-buy, diplomacy, smoke-tests]
key-files:
  modified:
    - index.html
decisions:
  - "GRAIN_BUY_PRICES = [1.3, 1.6, 2.0, 2.6] — sell price x1.3, rounded to 1 decimal, seasonal markup"
  - "buyGrainNow() follows buildBuilding() pattern: validate -> mutate state -> showModal -> saveState -> updateUI"
  - "No state.decisions key added for grain buy (ephemeral slider UI state only)"
  - "updateFactionUI() was already fully implemented — no changes needed for diplomacy panel"
metrics:
  duration: "~5 minutes"
  completed: "2026-03-31"
  tasks_completed: 5
  files_modified: 1
---

# Phase 1 Plan 01: Handel & Krieg UI Summary

## One-liner

Grain buy slider + GRAIN_BUY_PRICES constant added to Wirtschaft section; diplomacy panel confirmed fully wired; all 6 Playwright smoke tests pass.

## What Was Changed

### Task 1: GRAIN_BUY_PRICES constant (line 886)

Inserted after `GRAIN_SELL_PRICES` at line 885:

```javascript
const GRAIN_BUY_PRICES = [1.3, 1.6, 2.0, 2.6];
```

Seasonal buy prices with ~1.3x markup over sell prices.

### Task 2: Grain buy slider + button HTML (lines 784–799)

Inserted a new `slider-row` div before the closing `</div>` of the Wirtschaft action-section. Contains:
- `#grain-buy-display` — shows selected quantity
- `#grain-buy-slider` — range input 0–500 step 50
- `#grain-buy-hint` — shows cost preview
- `#btn-buy-grain` — triggers `buyGrainNow()`

### Task 3: JS functions (lines 1366–1398)

Inserted `onGrainBuySlider()` and `buyGrainNow()` between `updateFactionUI()` and `buildBuilding()`.

- `onGrainBuySlider(rawVal)`: updates display, calculates seasonal cost, disables button when gold < cost or amount = 0
- `buyGrainNow()`: validates gold, mutates state (gold -= cost, grain += amount), resets slider, shows success/error modal, calls saveState() + updateUI()

### Task 4: Diplomacy panel verification (read-only)

Confirmed all 4 patterns already present:
- `attackFaction` — defined at line 1273, wired in updateFactionUI() buttons
- `formAlliance` — defined at line 1303, wired in updateFactionUI() buttons
- `sendTribute` — defined at line 1314, wired
- `declareWar` — defined at line 1326, wired
- `updateFactionUI()` called from `updateUI()` (already wired)

No code changes required.

### Task 5: Playwright smoke tests

All 6 tests passed:
- Seite lädt ohne JS-Fehler
- Startbildschirm ist sichtbar
- Namensfeld und Buttons vorhanden
- Leerer Name → Startbildschirm bleibt offen
- Spiel startet nach Namenseingabe
- Runde beenden funktioniert

## Deviations from Plan

None — plan executed exactly as written.

Task 2 inserted 16 new lines which shifted subsequent line numbers as predicted by the plan. The plan accounted for this and instructed using grep to find the new position of `buildBuilding` before Task 3, which was done correctly (found at line 1366 post-shift).

## Acceptance Criteria Status

- [x] `grep -c "GRAIN_BUY_PRICES" index.html` returns 2 (definition + usage in onGrainBuySlider)
- [x] `grep -c "grain-buy-slider" index.html` returns 2 (HTML id + JS getElementById)
- [x] `grep -c "function buyGrainNow" index.html` returns 1
- [x] `grep -c "function onGrainBuySlider" index.html` returns 1
- [x] `npx playwright test tests/smoke.spec.js` — 6 passed, 0 failed

## Self-Check: PASSED

- index.html modified: confirmed
- GRAIN_BUY_PRICES constant: line 886
- grain-buy-slider HTML: line 789
- buyGrainNow function: line 1378
- onGrainBuySlider function: line 1366
- All 6 smoke tests: PASSED
