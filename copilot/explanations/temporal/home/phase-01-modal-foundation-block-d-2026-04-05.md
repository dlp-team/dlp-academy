<!-- copilot/explanations/temporal/home/phase-01-modal-foundation-block-d-2026-04-05.md -->
# Phase 01 Block D - Admin Modal Migration (Sudo)

## Context
After Blocks A-C established `BaseModal` and close-guard wiring, Phase 01 continued with an admin-facing security modal migration.

## Previous State
- `SudoModal` had duplicated shell/backdrop layout inline.
- Submit-time close lock relied on local `handleClose` checks.

## New State
- `SudoModal` now uses `BaseModal` for shell rendering.
- Submit-time close lock is preserved with dual safeguards:
  - `handleClose` early-return when submitting,
  - `onBeforeClose={() => !isSubmitting}` for backdrop close interception.

## Why This Is Lossless
- Authentication and submit flow logic stayed intact.
- User-facing error copy and form behavior remained unchanged.
- Existing tests for wrong-password and successful reauth continue to pass.

## Next in Phase 01
- Continue remaining modal-surface migrations.
- Expand dirty-state close interception to additional form modals.
