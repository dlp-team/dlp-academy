// copilot/explanations/codebase/tests/unit/components/BinView.listPressState.test.md

## Changelog
### 2026-04-12: Added sibling-stability regression coverage
- Extended fixture to multiple list rows and asserted non-selected siblings do not receive brightness/saturation dimming when pressing one item outside selection mode.

### 2026-04-09: New list pressed-state parity test
- Added focused unit coverage to ensure selected list items in `BinView` apply the same pressed-state shell treatment as grid mode (`scale-[1.01]` + elevated shadow) when selection mode is not active.

## Overview
Regression test for list-mode pressed visual parity in bin view.

## Coverage Highlights
- Mocks trash data hooks and lightweight list item rendering.
- Verifies class-level pressed-state styling on selected list wrappers.
- Verifies non-selected list siblings keep stable visual classes outside selection mode.
