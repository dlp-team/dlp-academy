<!-- copilot/explanations/codebase/src/pages/Home/utils/binViewUtils.md -->
# binViewUtils.ts

## Overview
- **Source file:** `src/pages/Home/utils/binViewUtils.ts`
- **Last documented:** 2026-04-02
- **Role:** Presentation helpers for Home bin countdown/urgency behavior.

## Responsibilities
- Exposes retention-day constants used by bin UI copy and tests.
- Converts trash timestamp values into `Date` for display.
- Computes remaining milliseconds/days before auto-deletion.
- Maps remaining days to urgency text color classes.
- Provides deterministic bin sort modes and comparators (urgency +/- and alphabetic +/-).

## Main Dependencies
- `../../../utils/trashRetentionUtils`

## Changelog
- 2026-04-02: Added `BIN_SORT_MODES`, default sort mode, and reusable `compareBinItems`/`sortBinItems` helpers to centralize bin ordering behavior.
- 2026-04-02: Migrated retention math to shared `trashRetentionUtils` helpers to keep day/expiry behavior consistent across Home and institution-admin bin flows.
