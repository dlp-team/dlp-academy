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
