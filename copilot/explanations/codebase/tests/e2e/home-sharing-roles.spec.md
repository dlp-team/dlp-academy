// copilot/explanations/codebase/tests/e2e/home-sharing-roles.spec.md

## Changelog
### 2026-04-03: Seeding hook timeout stabilization
- Added bounded, best-effort wrapper for shared fixture seeding/reset in `beforeAll` and `beforeEach`.
- Prevents optional admin-fixture prep latency from failing role-visibility tests before assertions run.

### 2026-04-01: Shared-folder drag/drop deterministic hardening
- Refined folder selectors to heading-based exact matching for source/target cards.
- Added modal-aware confirmation handling for share/unshare prompts triggered by folder moves.
- Added bounded retry logic and synthetic drag/drop fallback to reduce intermittent native drag event misses.
- Added backend parentId verification via admin Firestore when available, with UI fallback when admin context is absent.

## Overview
This suite validates role-specific behavior in shared home contexts (owner, editor, viewer), including creation permissions, drag/drop move behavior, and visibility restrictions.

## Notes
- Uses seeded shared folder fixtures and optional Firebase Admin verification to assert persisted move outcomes.
- Keeps viewer safety assertions intact while hardening editor move determinism.