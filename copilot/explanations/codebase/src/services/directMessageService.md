<!-- copilot/explanations/codebase/src/services/directMessageService.md -->
# directMessageService.ts

## Overview
- Source file: `src/services/directMessageService.ts`
- Last documented: 2026-04-12
- Role: Service-layer write path for same-institution direct messages and recipient notification fan-out.

## Responsibilities
- Validates sender/recipient/message payload constraints.
- Enforces same-institution recipient validation through `users/{uid}` lookup.
- Persists direct messages to `directMessages` collection.
- Creates recipient-facing notification (`direct_message`) with sender identity metadata.

## Main Dependencies
- `firebase/firestore`
- `src/firebase/config.ts`

## Exports
- `sendDirectMessage`

## Changelog
- 2026-04-12: Added initial same-institution direct-message creation flow with notification upsert integration.
