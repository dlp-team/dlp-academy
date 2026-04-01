# HomeBulkActionFeedback.tsx

## Overview
- **Source file:** `src/pages/Home/components/HomeBulkActionFeedback.tsx`
- **Last documented:** 2026-04-01
- **Role:** Presentational feedback banner for Home bulk-action result messaging.

## Responsibilities
- Renders nothing when feedback message is empty.
- Applies tone-specific style contracts for `success`, `warning`, and `error` outcomes.
- Falls back safely to success styling for unknown tone values.

## Exports
- `default HomeBulkActionFeedback`

## Main Dependencies
- `react`

## Changelog
- 2026-04-01: Created component by extracting inline bulk-action feedback JSX from `Home.tsx` to keep coordinator orchestration focused and reduce duplicated tone class logic.
