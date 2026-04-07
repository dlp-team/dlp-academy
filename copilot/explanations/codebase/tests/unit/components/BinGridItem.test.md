<!-- copilot/explanations/codebase/tests/unit/components/BinGridItem.test.md -->
# BinGridItem.test.jsx

## Overview
- **Source file:** `tests/unit/components/BinGridItem.test.jsx`
- **Last documented:** 2026-04-04
- **Role:** Regression coverage for Phase 08 bin selection parity and dimming behavior.

## Coverage
- Selected bin cards reuse shared ring visuals (`ring-4` + indigo ring token).
- Unselected subject cards dim with brightness/saturation classes when any selection exists.
- Folder cards use softer dimming values to preserve readability (no opacity fallback).

## Changelog
### 2026-04-07
- Updated subject dimming assertions to match softened bin selection fade values while keeping folder-legibility checks unchanged.

### 2026-04-04
- Added initial focused suite for `BinGridItem` selection/dimming semantics.
