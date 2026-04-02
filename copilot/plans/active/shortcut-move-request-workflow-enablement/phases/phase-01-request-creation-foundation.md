<!-- copilot/plans/active/shortcut-move-request-workflow-enablement/phases/phase-01-request-creation-foundation.md -->
# Phase 01 - Request Creation Foundation

## Status
- COMPLETED

## Objective
Implement a callable-backed shortcut move-request creation flow from Home modal confirmation.

## Deliverables
- `functions/index.js`: `createShortcutMoveRequest` callable.
- `src/services/shortcutMoveRequestService.ts`: frontend callable wrapper.
- `src/pages/Home/hooks/useHomePageHandlers.ts`: wire modal confirm to callable.
- Owner notification creation on request submit:
  - `notifications` collection entry,
  - `mail` queue entry for extension-based email sending.

## Validation Gate
- Request document created with required fields.
- Duplicate pending requests are prevented for same shortcut + target folder.
- Home flow returns success/error feedback with no placeholder logs.

