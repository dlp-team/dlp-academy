# StatsSidebar.jsx

## Overview
- **Source file:** `src/pages/Profile/components/StatsSidebar.jsx`
- **Last documented:** 2026-02-24
- **Role:** Reusable UI component consumed by the parent page/module.

## Responsibilities
- Manages local UI state and interaction flow.
- Handles user events and triggers updates/actions.

## Exports
- `default StatsSidebar`

## Main Dependencies
- `react`
- `lucide-react`
- `./MiniStatsChart`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.

## Changelog
### 2026-03-30
- Removed external `BADGE_CATALOG` export and kept catalog internal to comply with hot-reload/lint constraints.
- Added `showBadges` prop so teacher profile sidebar can show chart-only mode without student badge UI.
