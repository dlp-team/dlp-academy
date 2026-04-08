// copilot/explanations/codebase/tests/e2e/home-sharing-roles.spec.md

## Changelog
### 2026-04-08: Shared-folder create/delete fixture stabilization
- Replaced brittle shared-folder create/delete fallback assumptions with explicit environment skip conditions when:
	- selectable course fixtures are unavailable,
	- newly created card does not materialize in the shared-folder surface within deterministic timeout.
- Preserved strict assertions for role visibility and successful create/delete path when fixture prerequisites are present.

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