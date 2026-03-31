<!-- copilot/explanations/codebase/tests/unit/hooks/useHomeLogic.test.md -->
# useHomeLogic.test.js

## Overview
- **Source file:** `tests/unit/hooks/useHomeLogic.test.js`
- **Last documented:** 2026-04-01
- **Role:** Validates composed-hook contract for `useHomeLogic`, especially role-derived flags and exposed shortcut/share functions.

## Coverage
- Ensures student-like roles pass `studentShortcutTagOnlyMode` into `useHomeHandlers`.
- Ensures returned API exposes folder/subject share handlers and shortcut actions from composed dependencies.
- Ensures `resolvedShortcuts` is surfaced from Home state composition.

## Changelog
### 2026-04-01
- Added explanation entry for new test mirror file.
- Updated test mocks to current module paths (`src/hooks/useHomeState` and `src/hooks/useHomeHandlers`) so contract assertions run against the active hook topology.
