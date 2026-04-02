<!-- copilot/explanations/codebase/functions/index.md -->

# functions/index.js

## Overview
- Source file: functions/index.js
- Role: Cloud Functions entrypoint for institutional access-code flows and backend security helpers.

## Changelog
### 2026-04-02
- Added callable function `syncCurrentUserClaims`.
- `syncCurrentUserClaims` behavior:
  - requires authenticated caller,
  - reads `users/{uid}` profile,
  - normalizes role claim (`admin`, `institutionadmin`, `teacher`, `student`),
  - normalizes `institutionId` claim,
  - preserves non-role legacy custom claims while replacing stale `role` and `institutionId` claims.
- Purpose: keep Firebase Auth token claims aligned with Firestore user profile so Storage rules can evaluate tenant/role access deterministically.

  ### 2026-04-02 (Shortcut Move Request Workflow)
  - Added callable `createShortcutMoveRequest`:
    - validates authenticated shortcut owner, shortcut target/type integrity, and shared target folder constraints,
    - prevents duplicate pending requests for same requester + shortcut + target folder,
    - persists `shortcutMoveRequests/{requestId}` with normalized metadata,
    - emits owner in-app notification and optional mail queue entry.
  - Added callable `resolveShortcutMoveRequest`:
    - restricts resolution to target-folder owner or admins,
    - enforces one-way status transitions from `pending` -> `approved|rejected`,
    - on approve, moves original subject/folder into target shared folder and synchronizes inherited sharing,
    - emits requester notification and optional requester mail queue entry.
  - Added helper utilities for request-id normalization, chunked batch commits, folder subtree traversal, and cycle prevention checks.
