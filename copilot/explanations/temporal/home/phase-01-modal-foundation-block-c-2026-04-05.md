<!-- copilot/explanations/temporal/home/phase-01-modal-foundation-block-c-2026-04-05.md -->
# Phase 01 Block C - First Form Flow with Dirty-Close Interception

## Context
Phase 01 required dirty-state close interception to be adopted in at least one form-heavy modal flow. `FolderManager` was selected as the first production adopter.

## Previous State
- `FolderManager` had local shell markup and partial close-guard behavior.
- Backdrop close was guarded, but shell behavior was not centralized through the shared modal primitive.

## New State
- `FolderManager` now uses `BaseModal` for the shell structure.
- Close requests now follow a unified guard path:
  - backdrop close via `onBeforeClose`,
  - header close button,
  - footer cancel button.
- Added `canCloseSharingModal` utility for deterministic reasoned close decisions.

## Why This Is Lossless
- Existing sharing operation flows and confirmation overlays were preserved.
- Existing final success-close behavior remained unchanged.
- Only close-decision wiring and shell reuse were changed.

## Validation
- Added deterministic utility tests for close-guard reason mapping.
- Re-ran modal regression tests and typecheck.

## Next in Phase 01
- Apply the same guarded interception pattern to additional form modals.
- Continue admin-facing modal migration to the shared foundation.
