# ViewResource.jsx

## Overview
- **Source file:** `src/pages/ViewResource/ViewResource.jsx`
- **Last documented:** 2026-02-24
- **Role:** Page-level or feature-level module that orchestrates UI and logic.

## Responsibilities
- Handles user events and triggers updates/actions.
- Participates in navigation/routing behavior.

## Exports
- `default ViewResource`

## Main Dependencies
- `react`
- `react-router-dom`
- `lucide-react`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.

## Changelog
### 2026-03-31
- Added deterministic iframe viewer states (`loading`, `error`, `ready`) for resource previews.
- Added timeout-backed fallback to surface explicit error feedback when embedded preview does not resolve.
- Added inline recovery actions in error state: retry embedded viewer and direct download fallback.
