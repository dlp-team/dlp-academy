<!-- copilot/explanations/codebase/src/utils/directMessageUtils.md -->
# directMessageUtils.ts

## Overview
- Source file: `src/utils/directMessageUtils.ts`
- Last documented: 2026-04-12
- Role: Deterministic helpers for conversation identity, participant resolution, timestamp normalization, and subject linkage checks.

## Responsibilities
- Generates stable bidirectional conversation keys with `buildConversationKey`.
- Resolves the counterpart participant uid for a message relative to the current user.
- Normalizes Firestore timestamp-like values to milliseconds for sorting.
- Validates whether a user is linked to a subject through owner/shared/enrollment fields.

## Exports
- `buildConversationKey(uidA, uidB)`
- `resolveConversationParticipantUid(message, currentUid)`
- `timestampToMillis(value)`
- `isUserLinkedToSubject(subjectData, uid)`

## Changelog
- 2026-04-12: Added first version to support the new Messages hub conversation and academic-context derivation logic.