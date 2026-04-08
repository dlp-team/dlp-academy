<!-- copilot/explanations/codebase/tests/unit/components/UndoActionToast.test.md -->
# UndoActionToast.test.jsx

## Overview
- **Source file:** `tests/unit/components/UndoActionToast.test.jsx`
- **Last documented:** 2026-04-08
- **Role:** Deterministic unit coverage for the reusable undo toast component.

## Covered Behavior
- Does not render when `message` is empty.
- Renders message, default action label, and close button accessibility label.
- Invokes both `onAction` and `onClose` callbacks when controls are activated.

## Validation
- Included in focused suite:
  - `npm run test:unit -- tests/unit/components/UndoActionToast.test.jsx`
