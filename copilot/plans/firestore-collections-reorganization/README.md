# Firestore Collections Reorganization Plan

This directory tracks the Firestore/permissions reorganization work for subjects, folders, and shortcuts.

## Recovered Context (Session Reconstruction)

These notes were reconstructed from the implementation session after some tracking files were overwritten.

- Share flow now creates a shortcut for the shared user (recipient-facing access model).
- Non-owner visibility moved toward shortcut-first behavior.
- Shortcut move behavior updated so drag/drop does not create duplicate shortcuts.
- Duplicate shortcut cleanup logic exists when more than one shortcut is found for the same target.
- Orphan behavior was discussed/implemented so non-working shortcuts can be shown when original target disappears or access is revoked.
- Firestore rules were iterated to allow the share flow while preserving ownership for update/delete.
- A major debug session identified that shortcut query read permissions caused a false share failure after the subject update succeeded.

## Current Status

- Completed phases: 00, 01, 02 architecture, 02 fixes, 03.
- Planned phases: 04, 05, 06, 07.
- Debug protocol is documented at `copilot/protocols/debug-in-depth-protocol.md`.

## Planning Rules

1. `copilot/plans/strategy-roadmap.md` is the source of truth for sequencing and phase status.
2. Every phase marked IN_PROGRESS or COMPLETED must have a corresponding phase document.
3. Phase docs must capture scope, rationale, implementation summary, affected systems, and follow-ups.
4. When a phase status changes, update both roadmap and phase document.

## Important Session Outcome

The share pipeline failure was traced to Step 5 (querying existing shortcuts) due to read permissions on `/shortcuts` for the sharer. Rules were updated so the owner of the referenced subject/folder can read relevant shortcuts, enabling the dedupe query during share.
