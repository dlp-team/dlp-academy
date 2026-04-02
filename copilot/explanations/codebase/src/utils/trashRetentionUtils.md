<!-- copilot/explanations/codebase/src/utils/trashRetentionUtils.md -->
# trashRetentionUtils.ts

## Overview
- **Source file:** `src/utils/trashRetentionUtils.ts`
- **Last documented:** 2026-04-02
- **Role:** Shared trash-retention utility layer for timestamp normalization, remaining-time calculations, and expiration checks.

## Responsibilities
- Defines canonical trash retention window constants (`15` days).
- Normalizes Firestore timestamps, `Date`, millis, and ISO strings into epoch milliseconds.
- Computes remaining retention time and day buckets.
- Determines if a trashed entity is expired under retention rules.

## Exports
- `TRASH_RETENTION_DAYS`
- `TRASH_RETENTION_MS`
- `toTrashTimestampMs(...)`
- `getTrashRemainingMs(...)`
- `getTrashDaysRemaining(...)`
- `isTrashRetentionExpired(...)`

## Changelog
- 2026-04-02: Added shared retention helper to centralize 15-day trash semantics used by Home bin and institution-admin lifecycle hooks.
