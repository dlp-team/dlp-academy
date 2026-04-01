# useHomeState.js

## Changelog
### 2026-04-01: Completion-aware active/history subject grouping
- Added `completedSubjectIds` input support and completion-ID normalization that works for source subjects and shortcut entries (`targetId`).
- Added `history` Home mode grouping (`Historial`) that renders completed subjects only.
- Active Home groupings now exclude completed subjects by default.
- Search grouping now respects active/history completion scope.

## Overview
- **Source file:** `src/pages/Home/hooks/useHomeState.js`
- **Last documented:** 2026-02-24
- **Role:** Custom hook with stateful/business logic for this page area.

## Responsibilities
- Manages local UI state and interaction flow.
- Executes side effects tied to lifecycle or dependency changes.

## Exports
- `const useHomeState`

## Main Dependencies
- `react`
- `../../../utils/stringUtils`
- `../../../hooks/useShortcuts`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
