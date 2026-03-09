// copilot/explanations/codebase/firestore.rules.md

## Changelog
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
