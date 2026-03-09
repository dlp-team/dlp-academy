# Home.jsx

## Overview
- **Source file:** `src/pages/Home/Home.jsx`
- **Last documented:** 2026-02-24
- **Role:** Page-level or feature-level module that orchestrates UI and logic.

## Responsibilities
- Manages local UI state and interaction flow.
- Executes side effects tied to lifecycle or dependency changes.
- Handles user events and triggers updates/actions.
- Participates in navigation/routing behavior.

## Exports
- `default Home`

## Main Dependencies
- `react`
- `lucide-react`
- `react-router-dom`
- `./hooks/useHomeLogic`
- `../../hooks/useFolders`
- `./hooks/useHomePageState`
- `./hooks/useHomePageHandlers`
- `../../components/layout/Header`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.

## Changelog
- **2026-03-09:** Extended Home keyboard orchestration to consume and pass `getCardVisualState` into `HomeContent`, enabling copy/cut visual feedback without moving behavior logic back into `Home.jsx`.
- **2026-03-09:** Refactored keyboard shortcut logic out of `Home.jsx` into `useHomeKeyboardShortcuts`, keeping `Home` orchestration-only and fixing the prior initialization-order runtime error.
- **2026-03-09:** Wired Ctrl+C/X/V/Z into `Home` using `useKeyShortcuts` for folder clipboard flows: copy creates shortcut references on paste, cut moves folders on paste, and undo reverts the latest keyboard-applied action. Added inline Spanish status text and guardrails for permissions/typing fields.
- **2026-03-07:** Removed `OnboardingWizard` mount from `Home` render path to stop onboarding prompts for authenticated users in the current registration/login model.
- **2026-03-06:** Updated `BinView` integration to pass `layoutMode` in addition to `cardScale`, so trash section follows the same grid/list contracts as the other Home tabs.
