# BinView.jsx

## Overview
- **Source file:** `src/pages/Home/components/BinView.jsx`
- **Last documented:** 2026-03-06
- **Role:** Renders trash contents (paper bin) with restore/permanent-delete actions and content preview.

## Responsibilities
- Loads trashed subjects and removes expired entries automatically.
- Supports both `grid` and `list` layouts using the same contracts as Home tabs.
- Applies `cardScale` via responsive grid min-width and list item scale.
- Shows selection side panel with restore/delete and preview actions.
- Displays urgency countdown and sorts cards by time remaining.

## Exports
- `default BinView`

## Main Dependencies
- `react`
- `lucide-react`
- `firebase/firestore`
- `../../../hooks/useSubjects`
- `../../../components/modules/SubjectCard/SubjectCard`
- `../../../components/modules/ListViewItem`

## Changelog
- **2026-03-06:** Rebuilt bin rendering to align with Home structure: fixed `grid/list` behavior, fixed `cardScale`, stabilized click-to-select side panel, and disabled hover-shift behavior in SubjectCard for this view (`filterOverlayOpen={true}`).
- **2026-03-06:** Improved desktop UX with side panel anchored to selected card (dynamic left/right placement), extracted reusable bin date/urgency helpers to `binViewUtils.js`, and added E2E + unit tests for bin behavior.
