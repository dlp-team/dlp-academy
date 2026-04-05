<!-- copilot/explanations/temporal/home/phase-01-modal-foundation-block-f-2026-04-05.md -->
# Phase 01 Block F - Home Subject Modal Shell Unification

## Context
To keep Phase 01 momentum after Subject/Admin migrations, remaining low-risk Home modal shells were unified under `BaseModal`.

## Previous State
- `SubjectModal` and `EditSubjectModal` had inline duplicated shell/backdrop markup.

## New State
- Both Home subject modals now use `BaseModal`.
- Existing form behavior, selectors, and submit handlers remain unchanged.
- Added focused regression tests for backdrop close behavior.

## Validation
- Added `tests/unit/pages/home/HomeSubjectModals.test.jsx`.
- Re-ran BaseModal and SubjectForm regression tests.
- Typecheck passed.

## Next in Phase 01
- Continue migrating remaining duplicate-shell modal surfaces.
- Prepare broader Phase 01 validation sweep for closure readiness.
