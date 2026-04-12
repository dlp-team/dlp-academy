<!-- copilot/explanations/codebase/tests/unit/components/BinSelectionOverlay.test.md -->
# BinSelectionOverlay.test.jsx

## Overview
- **Source file:** `tests/unit/components/BinSelectionOverlay.test.jsx`
- **Last documented:** 2026-04-05
- **Role:** Verifies deterministic overlay behavior for Bin selected-card focus and action panel timing.

## Coverage
- Returns `null` when the selected-card reference is missing.
- Ensures the overlay backdrop renders without blur classes and still closes on click.
- Verifies panel renders immediately with softened backdrop opacity classes.
- Confirms panel placement top-clamping near viewport bottom edge.
- Verifies overlay readiness callback emits once after card-measure initialization.

## Changelog
### 2026-04-12
- Added one-time `onOverlayReady` callback assertion to lock parent/overlay readiness handshake used for grid press-state flicker prevention.

### 2026-04-08
- Updated overlay assertions to the no-delay panel behavior introduced in Phase 03.
- Added explicit backdrop class checks for softened light/dark opacity tokens.

### 2026-04-05
- Updated tests for the typed `item` overlay contract and staged panel reveal.
- Added fake-timer + `act(...)` cleanup for deterministic, warning-free assertions.
