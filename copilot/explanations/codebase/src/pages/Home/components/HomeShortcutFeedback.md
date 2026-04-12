<!-- copilot/explanations/codebase/src/pages/Home/components/HomeShortcutFeedback.md -->

# HomeShortcutFeedback.tsx

## Overview
- **Source file:** `src/pages/Home/components/HomeShortcutFeedback.tsx`
- **Last documented:** 2026-04-01
- **Role:** Focused presentation component for keyboard shortcut feedback messages on Home page.

## Responsibilities
- Renders nothing when there is no feedback.
- Renders bottom-left floating shortcut feedback using shared `NotificationToast` styles.
- Keeps feedback markup outside `Home.tsx` to reduce coordinator complexity.

## Exports
- `default HomeShortcutFeedback`

## Main Dependencies
- `react`
- `lucide-react`
- `src/components/ui/NotificationToast.tsx`

## Changelog
- 2026-04-12: Migrated shortcut feedback from inline page banner to unified floating toast surface (bottom-left), aligned with centralized notification design system.
