---
tags: [harness, gsd, neurawork, claude-code, architektur]
erstellt: 2026-08-03
typ: analyse
---

# Harness-Vergleich: GSD × neurawork-cc-harness

> [!info] Quellen
> - **Harness A:** GSD (Get Shit Done) — `open-gsd/gsd-core`, bei Frank installiert als ~60 `gsd-*` Skills
> - **Harness B:** neurawork-cc-harness — `neurawork-git/howtobuildsoftware2026` (Fork: `franklyai-botter`)
> - Grafiken: [[GSD-Harness.excalidraw]] · [[Neurawork-Harness.excalidraw]] · [[Harness-Kombi.excalidraw]]

## Die zwei Philosophien (der eigentliche Kern)

| | GSD | neurawork-cc-harness |
|---|---|---|
| **Rolle** | Workflow-Motor (innerer Loop) | Wissens- & Governance-Schicht (äußerer Loop) |
| **Kontext-These** | So **wenig** Kontext wie möglich pro Lauf — frische Executor-Subagents, Anti "Context Rot" | So **viel** (destillierter) Kontext wie nötig — Wiki-Reinjection beim Session-Start |
| **Gedächtnis** | `.planning/` (STATE.md, CONTEXT.md, SUMMARYs) | `knowledge-base/`, CLAUDE.md, `compliance-base/` |
| **Trigger** | Mensch ruft Phasen-Skills auf | Hooks: SessionStart (6h-Gate), PostToolUse |
| **Einheit** | Phase / Meilenstein | Session / Repo-Lebenszeit |

## Wo sie sich verhaken ⚠️

1. **Doppelte Wahrheit** — GSD schreibt Entscheidungen nach `.planning/` (STATE.md, SUMMARY.md), der knowledge-compiler destilliert dieselben Entscheidungen ins Wiki. Ändert GSD in Phase 3 eine Entscheidung, injiziert das Wiki beim nächsten Session-Start die **alte** Version zurück.
2. **Fresh Context vs. Reinjection** — GSDs Kernversprechen (jeder Executor startet leer) wird vom SessionStart-Hook direkt unterlaufen: Wiki-Injection füllt genau den Kontext, den GSD sauber halten will — schlimmstenfalls mit veraltetem Wissen.
3. **Hook-Feuer zur Unzeit** — das 6h-Gate kennt keine Phasengrenzen: Kompilierung kann mitten in einer Execute-Wave anspringen und dokumentiert dann **halbfertige** Arbeit als "Wissen".
4. **PostToolUse bremst atomare Commits** — Compliance-Validierung bei jedem Write kollidiert mit GSDs Takt (1 Task = 1 Commit, parallele Waves).
5. **CLAUDE.md-Schreibkonflikt** — claudemd-lerner editiert CLAUDE.md in place, während GSD-Planner und Executors gleichzeitig darauf als stabile Regelbasis bauen.
6. **Ressourcen-Konkurrenz** — ~30 parallele Compliance-Agents + GSD-Executor-Waves = Token-/Rate-Limit-Gedränge.

## Die Kombi, die Sinn macht ✅

**Prinzip: GSD besitzt die Phase, neurawork besitzt die Phasengrenze.**

1. **Single Writer:** `.planning/` gehört GSD — lerner & compiler lesen nur.
2. **Übergabepunkt = Ship:** `/kc-compile` + `/cl-update` laufen nach `gsd-ship` (Ship-Hook), nicht per 6h-Timer. Quelle: SUMMARY.md + Session-Logs der abgeschlossenen Phase.
3. **Compliance als Gate, nicht als Bremse:** `/co-validate .planning/phases/<n>/PLAN.md` zwischen plan-phase und execute-phase. PostToolUse aus.
4. **Reinjection dosiert:** nur der destillierte Index, nur in Discuss/Plan — **nie** in Executor-Subagents.
5. **CLAUDE.md-Änderungen als Diff-Vorschlag** (Review), nie auto-merge.

> [!tip] Merksatz
> GSD entscheidet, **was in den Kontext kommt** (so wenig wie möglich).
> neurawork entscheidet, **was davon überlebt** (so viel wie nötig).

## Wann die Kombi KEINEN Sinn macht ❌

- **Kleine Solo-Projekte** (z. B. Kaiser): GSD allein reicht — SUMMARY.md ist schon das Gedächtnis. Der Overhead (Hooks, Wiki, 30 Agents) frisst mehr als er bringt.
- **Beide Harnesses gleichzeitig als "Source of Truth"** — genau dann verhaken sie sich (siehe oben).
- **Compliance-Compiler ohne Compliance-Pflicht** — GDPR/SOC2/ISO27001-Kataloge für ein Browser-Spiel sind totes Gewicht.

**Lohnt ab:** mehreren Repos/Teams · Kundenprojekten mit Compliance-Pflichten (NeuralNautic!) · wenn CLAUDE.md-Pflege real liegen bleibt.
