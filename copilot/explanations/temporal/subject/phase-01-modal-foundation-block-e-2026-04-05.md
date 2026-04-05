<!-- copilot/explanations/temporal/subject/phase-01-modal-foundation-block-e-2026-04-05.md -->
# Phase 01 Block E - SubjectFormModal Shell and Close Guard Unification

## Context
After unifying Home and admin modal surfaces, Phase 01 extended dirty-close interception to another form-heavy flow: `SubjectFormModal`.

## Previous State
- `SubjectFormModal` had inline shell/backdrop implementation.
- Dirty-close handling existed but was not routed through the shared modal foundation.

## New State
- Migrated shell to `BaseModal`.
- Reused `canCloseSharingModal` to evaluate close requests.
- Unified close triggers:
  - backdrop,
  - header close button,
  - footer cancel button.

## Why This Is Lossless
- Existing domain logic (periods, sharing, classes, transfer/unshare workflows) remained unchanged.
- Existing discard-confirm and pending-action overlays remained intact.

## Validation
- Re-ran existing SubjectForm tests for period schedule and classes-load error handling.
- Re-ran shared close-guard and modal base tests.
- Typecheck passed.

## Next in Phase 01
- Continue migrating remaining modal surfaces with duplicated shells.
- Prepare broader validation sweep and Phase 01 closure checklist.
