<!-- copilot/explanations/codebase/src/pages/Home/hooks/useHomePageState.md -->
# useHomePageState.js

## Overview
- **Source file:** `src/pages/Home/hooks/useHomePageState.js`
- **Last documented:** 2026-02-24
- **Role:** Custom hook with stateful/business logic for this page area.

## Responsibilities
- Manages local UI state and interaction flow.
- Executes side effects tied to lifecycle or dependency changes.
- Interacts with Firebase/Firestore services for data operations.

## Exports
- `const useHomePageState`

## Main Dependencies
- `react`
- `firebase/firestore`
- `../../../firebase/config`
- `../../../utils/stringUtils`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.

## Changelog
- **2026-04-02:** Removed `history` from restored/persisted allowed Home modes so stale saved preferences now fall back safely to supported modes.
- **2026-04-01:** Added `history` to allowed persisted view modes so the new `Historial` tab restores correctly after reload/navigation.
- **2026-03-30:** Removed browser alert from folder auto-cleaner side effect and switched to optional `onHomeFeedback` callback so the page can display inline success/error text.
- **2026-03-06:** Added `bin` to allowed persisted view modes during restore, fixing reload fallback that forced users out of the paper bin tab.
