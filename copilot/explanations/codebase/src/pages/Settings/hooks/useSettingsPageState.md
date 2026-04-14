# useSettingsPageState.ts

## Overview
- **Source file:** `src/pages/Settings/hooks/useSettingsPageState.ts`
- **Last documented:** 2026-04-14
- **Role:** Custom hook with stateful/business logic for this page area.

## Responsibilities
- Manages local UI state and interaction flow.
- Executes side effects tied to lifecycle or dependency changes.
- Handles user events and triggers updates/actions.
- Interacts with Firebase/Firestore services for data operations.

## Exports
- `default function useSettingsPageState`

## Main Dependencies
- `react`
- `firebase/firestore`

## Changelog
### 2026-04-14
- Added `notifications.newContent` default setting so new-content toggle state is stable even for profiles that predate this field.

### 2026-04-07
- Added `headerThemeSliderEnabled` to settings state and snapshot synchronization.
- Added compatibility fallback reads from `settings.*` fields for theme and slider preference values.

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
