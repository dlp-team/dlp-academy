# useHomeLogic.js

## Changelog
### 2026-03-09: Exposed bin restore helpers for keyboard undo
- Added `getTrashedSubjects` and `restoreSubject` passthroughs from `useSubjects`.
- Preserves existing Home logic contracts while enabling Ctrl+Z restore fallback in keyboard flows.

## Overview
- **Source file:** `src/pages/Home/hooks/useHomeLogic.js`
- **Last documented:** 2026-02-24
- **Role:** Custom hook with stateful/business logic for this page area.

## Responsibilities
- Handles user events and triggers updates/actions.
- Participates in navigation/routing behavior.

## Exports
- `const useHomeLogic`

## Main Dependencies
- `react-router-dom`
- `../../../hooks/useSubjects`
- `../../../hooks/useFolders`
- `../../../hooks/useShortcuts`
- `../../../hooks/useUserPreferences`
- `../../../utils/folderUtils`
- `./useHomeState`
- `./useHomeHandlers`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
