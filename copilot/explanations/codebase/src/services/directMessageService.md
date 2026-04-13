<!-- copilot/explanations/codebase/src/services/directMessageService.md -->
# directMessageService.ts

## Overview
- Source file: `src/services/directMessageService.ts`
- Last documented: 2026-04-13
- Role: Service-layer write path for same-institution direct messages with backend-triggered notification fan-out.

## Responsibilities
- Validates sender/recipient/message payload constraints.
- Enforces same-institution recipient validation through `users/{uid}` lookup.
- Persists direct messages to `directMessages` collection with `participants` and `conversationKey` metadata.
- Uploads message attachments to Storage with conversation-scoped paths and stores attachment metadata on message docs.
- Persists optional subject/resource reference metadata to support route-aware chat references.
- Leaves `direct_message` notification generation to backend trigger logic in Cloud Functions.

## Main Dependencies
- `firebase/firestore`
- `firebase/storage`
- `src/firebase/config.ts`

## Exports
- `DIRECT_MESSAGE_ATTACHMENT_LIMITS`
- `sendDirectMessage`

## Changelog
- 2026-04-13: Expanded `subjectReference` normalization to persist `selectionSnippet` and `selectionType` for exact-context reference rendering in chat threads.
- 2026-04-13: Added attachment upload support (`image`, `pdf`, office/text formats) with per-conversation Storage paths and metadata persistence.
- 2026-04-13: Added optional `subjectReference` payload normalization and persistence for exact academic-content linking from chat.
- 2026-04-13: Added attachment limits export (`DIRECT_MESSAGE_ATTACHMENT_LIMITS`) for UI-level validation alignment.
- 2026-04-13: Added `participants` + `conversationKey` message metadata to support indexed/paginated query patterns.
- 2026-04-13: Removed client-side direct-message notification writes; notification creation now happens server-side through functions trigger.
- 2026-04-12: Added initial same-institution direct-message creation flow with notification upsert integration.
