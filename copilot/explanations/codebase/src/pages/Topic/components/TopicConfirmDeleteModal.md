<!-- copilot/explanations/codebase/src/pages/Topic/components/TopicConfirmDeleteModal.md -->
# TopicConfirmDeleteModal.jsx

## Overview
- **Source file:** `src/pages/Topic/components/TopicConfirmDeleteModal.jsx`
- **Last documented:** 2026-03-30
- **Role:** Reusable Topic-local confirmation modal for destructive actions.

## Responsibilities
- Displays a standardized warning surface for delete confirmations.
- Shows action-specific title/description/CTA text from `confirmDialog` state.
- Disables close/confirm interactions while deletion is in progress.

## Exports
- `default TopicConfirmDeleteModal`

## Main Dependencies
- `react`
- `lucide-react`

## Changelog
### 2026-03-30
- Added as the in-page replacement for browser confirm dialogs in Topic workflows.
- Supports file, quiz, and topic deletion confirmation with loading-safe controls.
