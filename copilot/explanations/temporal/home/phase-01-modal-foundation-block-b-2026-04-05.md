<!-- copilot/explanations/temporal/home/phase-01-modal-foundation-block-b-2026-04-05.md -->
# Phase 01 Block B - Shared Modal Adoption for Folder Flow

## Context
After Block A introduced `BaseModal`, Block B targeted the first higher-complexity modal (`FolderDeleteModal`) and expanded the shared contract for dirty-state interception.

## Previous State
- `FolderDeleteModal` had duplicated overlay shell structure in two separate branches (main + confirmation screens).
- `BaseModal` did not yet expose a close-guard contract for dirty-state interception workflows.

## New State
- `BaseModal` now supports:
  - `onBeforeClose(reason)` to allow/block close,
  - `onBlockedCloseAttempt(reason)` to react when close is blocked,
  - `rootStyle` for top-offset constrained modal shells.
- `FolderDeleteModal` now uses `BaseModal` in both branches while preserving behavior:
  - main selection backdrop closes modal,
  - confirmation backdrop returns to the main selection screen.

## Validation
- Expanded `BaseModal` unit tests for close interception behavior.
- Added `FolderDeleteModal` unit tests for screen-flow and delete path behavior.
- Re-ran nearby confirmation tests and TypeScript typecheck.

## Next in Phase 01
- Adopt dirty-state close interception in a form-based modal flow.
- Continue migrating admin-facing modal surfaces to `BaseModal` with lossless checks.
