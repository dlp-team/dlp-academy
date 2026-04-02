<!-- copilot/explanations/codebase/src/services/shortcutMoveRequestService.md -->
# shortcutMoveRequestService.ts

## Changelog
### 2026-04-02
- Added `createShortcutMoveRequest` callable wrapper.
- Added `resolveShortcutMoveRequest` callable wrapper.
- Added client-side normalization/validation guards:
  - `shortcutType` must be `subject` or `folder`.
  - `resolution` must be `approved` or `rejected`.
- Centralized callable names to avoid string duplication across Home and notification flows.

## Overview
- **Source file:** `src/services/shortcutMoveRequestService.ts`
- **Role:** Frontend callable integration layer for shortcut move request lifecycle.

## Exports
- `createShortcutMoveRequest`
- `resolveShortcutMoveRequest`

## Notes
- Keeps Home drag/drop and notifications modules free from direct callable setup details.
- Normalizes request payload casing before network calls.
