# FORMULAS.md – Alle Spielberechnungen

## Schnellreferenz

| Berechnung | Formel |
|-----------|--------|
| Steuereinnahmen | `floor(population × taxRate% × 2.5)` |
| Markt-Bonus | `+20% auf Steuereinnahmen` |
| Ernte (base) | `land × farmingIntensity × 0.8` |
| Ernte × Saison | `× [1.0, 1.3, 1.6, 0.3]` (Frühling–Winter) |
| Getreidespeicher | `× 1.2 auf Ernte` |
| Soldatenunterhalt | `floor(soldiers × 2)` Gold/Runde |
| Militärlager | `-20% auf Unterhalt und Rekrutierungskosten` |
| Rekrutierungskosten | `recruit × 15` Gold |
| Bevölkerungswachstum | `floor(pop × 0.03 × (satisfaction/80))` |
| Bevölkerungstod | `floor(pop × 0.05)` wenn satisfaction < 30 |
| Score | `floor(pop×0.5 + gold×0.2 + sat×15 + land×60 + soldiers×2)` |

---

## 1. Steuereinnahmen

```
taxIncome = floor(population × (taxRate / 100) × 2.5)

Beispiel:
  population = 200, taxRate = 25%
  taxIncome = floor(200 × 0.25 × 2.5) = floor(125) = 125 Gold

Mit Markt (+20%):
  taxIncome × 1.2 = 150 Gold

Auswirkung auf Zufriedenheit:
  taxRate > 50% → -12 Zufriedenheit
  taxRate > 40% → -(taxRate - 40) × 0.6
  taxRate < 10% → +4 Zufriedenheit
```

---

## 2. Getreideernte

```
Saisonfaktoren (Runde mod 4):
  0 = Frühling → × 1.0
  1 = Sommer   → × 1.3
  2 = Herbst   → × 1.6  ← Beste Ernte!
  3 = Winter   → × 0.3  ← Kaum Ernte

harvest = floor(land × farmingIntensity × 0.8 × seasonFactor × granaryFactor)

Beispiel (Herbst, 3 Gebiete, 40% Anbau, kein Speicher):
  harvest = floor(3 × 40 × 0.8 × 1.6 × 1.0) = floor(153.6) = 153 Getreide/Runde

Mit Getreidespeicher:
  harvest = floor(3 × 40 × 0.8 × 1.6 × 1.2) = floor(184.3) = 184 Getreide/Runde
```

---

## 3. Getreide-Bilanz

```
grainBalance = harvest - grainDistribution

Wenn grainBalance < 0:
  → Getreidevorrat schrumpft
  → Bei grain < 0: Hungersnot

Getreide pro Person:
  grainPerPerson = grainDistribution / population

Auswirkung auf Zufriedenheit:
  < 0.5 → -18 Zufriedenheit  (KRITISCH)
  < 0.8 → -7 Zufriedenheit   (Knapp)
  < 1.2 → +1 Zufriedenheit   (Normal)
  < 1.5 → +3 Zufriedenheit   (Gut)
  ≥ 1.5 → +6 Zufriedenheit   (Üppig)
```

---

## 4. Zufriedenheit (Gesamt-Delta)

```
satisfactionDelta = 
  grainEffect          (-18 bis +6)
  + taxEffect          (-12 bis +4)
  + churchBonus        (+5 wenn hasChurch)
  + militaryEffect     (-3 wenn Soldaten < 5% Pop / -2 wenn > 30% Pop)

Clamp: satisfactionDelta ∈ [-25, +20]
Clamp: satisfaction      ∈ [0, 100]

Niederlage-Trigger:
  satisfaction < 10 für 3 aufeinanderfolgende Runden → Revolte
```

---

## 5. Bevölkerungsentwicklung

```
growthRate = 0.03 × (satisfaction / 80)

growth = floor(population × growthRate)
deaths = satisfaction < 30 ? floor(population × 0.05) : 0

newPopulation = population + growth - deaths

Minimum: 10 Einwohner

Beispiele:
  Pop=200, sat=65: growth = floor(200 × 0.03 × 0.8125) = floor(4.875) = 4
  Pop=200, sat=20: growth = 0, deaths = floor(200 × 0.05) = 10
```

---

## 6. Soldatenunterhalt

```
upkeep = floor(soldiers × 2)
Mit Militärlager: upkeep = floor(soldiers × 2 × 0.8)

Rekrutierungskosten:
  costPerSoldier = 15 Gold
  Mit Militärlager: costPerSoldier = floor(15 × 0.8) = 12 Gold
  totalCost = recruit × costPerSoldier
```

---

## 7. Kampfsystem

```
attackPower = soldiers × wallBonus + random(0–30)
  wallBonus = 1.2 wenn hasWalls, sonst 1.0

defenseThreshold = enemyStrength × 0.8

SIEG wenn attackPower > defenseThreshold:
  land += 1
  enemyStrength = max(30, enemyStrength - 35)
  soldierLosses = floor(soldiers × 0.15)
  goldPlunder = 80 + random(0–80)

NIEDERLAGE:
  soldierLosses = floor(soldiers × 0.35)
  satisfaction -= 12

Feind-Wachstum pro Runde:
  enemyStrength += 5 + random(0–8)
```

---

## 8. Gebäudekosten & Effekte

```
Marktplatz      200 Gold → Steuereinnahmen ×1.2
Getreidespeicher 150 Gold → Ernte ×1.2
Militärlager    180 Gold → Rekrut./Unterhalt ×0.8
Kathedrale      250 Gold → +5 Zufriedenheit/Runde
Stadtmauern     300 Gold → Räuber ×0.5, Angriff ×1.2
```

---

## 9. Ereignis-Wahrscheinlichkeiten

```
Ereignisse pro Runde:
  ~70% Wahrscheinlichkeit für ein Ereignis gesamt
  (Kumulierte Chancen aller Events)

Einzelne Chancen:
  Dürre          12%
  Reiche Ernte   12%
  Räuber         10%
  Handelskäravan 10%
  Seuche          8%
  Volksfest       8%
  Großbrand       7%
  Erzfund         7%
  Überschwemmung  6%
  Siedler         6%
  Aufstand        6% (nur wenn satisfaction < 35)
  Bündnis         5%
```

---

## 10. Score-Berechnung

```
score = floor(
  population  × 0.5  +
  gold        × 0.2  +
  satisfaction × 15  +
  land        × 60   +
  soldiers    × 2
)

Beispiel (gutes Spiel nach 20 Runden):
  pop=350, gold=800, sat=75, land=5, sol=80
  score = floor(175 + 160 + 1125 + 300 + 160) = 1920

Score-Bewertung:
  < 500  → "Schlechter Kaiser"
  500–999 → "Durchschnittlicher Herrscher"
  1000–1499 → "Guter König"
  1500–1999 → "Großer Kaiser"
  ≥ 2000   → "Legendärer Herrscher"
```

---

## 11. Balance-Tabelle (Zielwerte für normales Spiel)

| Runde | Gold | Getreide | Pop | Soldaten | Zufriedenheit |
|-------|------|----------|-----|----------|---------------|
| 1     | 500  | 800      | 200 | 30       | 65%           |
| 5     | 600  | 700      | 220 | 45       | 60%           |
| 10    | 500  | 600      | 260 | 60       | 55%           |
| 15    | 400  | 500      | 300 | 80       | 50%           |
| 20    | 300  | 400      | 350 | 100      | 55%           |

*Notiz: Das Spiel soll herausfordernd aber nicht unmöglich sein.*
*Typische Spielzeit: 15–25 Minuten.*
