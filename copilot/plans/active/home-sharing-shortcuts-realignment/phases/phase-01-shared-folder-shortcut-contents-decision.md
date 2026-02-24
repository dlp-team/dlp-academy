# Phase 01 — Shared-Folder Shortcut Contents Decision

## Goal
Choose and lock the implementation strategy for how a folder shortcut exposes descendants.

## Decision Options

### Option A: Recursive materialized shortcuts
- Create shortcuts for descendants (folders/subjects) under the shared root.
- Best when per-descendant independent shortcut behavior is mandatory from day one.
- Tradeoff: significant write volume, dedupe complexity, cleanup burden.

### Option B: Single root shortcut with live projection
- Create one shortcut to the shared folder root; derive descendants dynamically from source hierarchy.
- Best for deterministic, low-write, low-drift behavior.
- Tradeoff: per-descendant independent shortcut operations need explicit future design.

## Recommended Start
- Start with **Option B** for this realignment.

## Required Acceptance Before Phase 02
- The selected option is documented in roadmap and implementation notes.
- Data contract for manual/list/tree/grid is explicit for shortcut descendants.
- Share flow responsibilities are clear (what is written at share time vs derived at read time).

## Exit Criteria
- Decision frozen and signed off; downstream phases can implement without ambiguity.
