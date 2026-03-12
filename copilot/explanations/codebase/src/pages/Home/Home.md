# Home.jsx

## Changelog
- **2026-03-12:** Shared-scope filter is now forced to enabled in `shared` tab context and the shared-scope toggle is hidden there, preventing accidental exclusion of “shared with me” items from the shared page.

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
- **2026-03-06:** Updated `BinView` integration to pass `layoutMode` in addition to `cardScale`, so trash section follows the same grid/list contracts as the other Home tabs.
git 