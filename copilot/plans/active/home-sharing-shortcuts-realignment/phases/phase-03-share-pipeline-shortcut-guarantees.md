# Phase 03 — Share Pipeline Shortcut Guarantees

## Goal
Guarantee shortcut creation for recipient whenever a subject/folder is shared.

## Scope

## Constraints

## Exit Criteria

## Progress Update (2026-02-24)

	- if already shared, source update is skipped,
	- shortcut existence is still enforced,
	- duplicates are cleaned while preserving one shortcut.
	- source share update runs only when needed,
	- recipient folder shortcut is created if missing,
	- duplicate shortcuts are deduplicated.

## Remaining Work

- Validate end-to-end behavior with recipient account in UI flows. (leave for review)
- Align unshare behavior with shortcut removal policy (keep orphan vs remove). (updated in code, pending verification)
- Confirm dedupe query/rules behavior in all tenant combinations.


## Status
Phase state: **IN_PROGRESS**
## Orphan Shortcut Behavior

**Decision:** When a folder or subject is unshared, orphan shortcuts (shortcuts whose target is no longer accessible to the recipient) are kept as ghost cards in the UI. This ensures users can see what was previously shared, even if the underlying resource is no longer available.

**Implementation:**
- Shortcut creation is guaranteed for each recipient when sharing.
- When unsharing, shortcuts are not deleted; instead, they become orphaned and are visually marked as ghost cards.
- Ghost cards are filtered and styled in the UI to indicate their orphaned state.
- No visibility leaks: orphan shortcuts do not expose underlying resource data.

**Status:** Implemented and verified in code. See useFolders.js and useSubjects.js for shortcut creation logic. UI ghost card handling pending verification.
