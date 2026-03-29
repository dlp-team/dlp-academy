// copilot/explanations/codebase/firestore.rules.md

## Changelog
### 2026-03-29: Notifications access policy added
- Added explicit `notifications` collection rules to avoid implicit deny for realtime reads.
- Access model:
  - Global admin: full access.
  - User: can read/create/update/delete own notifications where `userId == request.auth.uid`.
  - Institution admin: can manage notifications scoped to own `institutionId`.

### 2026-03-09: Admin and institution-boundary hardening
- Tightened `institution_invites` security boundaries:
  - `list` now restricted to global admins or institution admins within matching institution,
  - `delete` institution path now requires institution admin role for same-institution deletion.
- Tightened non-admin write requirements on key collections:
  - `folders`, `topics`, `documents`, and `quizzes` now require `request.resource.data.institutionId` to match current user institution for non-admin create/update paths.

## Overview
`firestore.rules` defines role-aware and institution-scoped access control for app collections.

## Notes
- Global admins preserve bypass behavior where intended.
- New constraints reduce legacy owner-only bypasses for writes lacking institution scoping.
