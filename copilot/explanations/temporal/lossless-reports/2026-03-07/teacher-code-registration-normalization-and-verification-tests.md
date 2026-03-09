# Lossless Change Report - Teacher Code Registration Normalization and Verification Tests

## Requested Scope
- Summarize/update the teacher registration code process and confirm it works.
- Set up tests that verify the code path works.

## Preserved Behavior Commitments
- No changes to institutional code generation format (still 6-char uppercase hex).
- No changes to role assignment logic for institutional invites (teacher role).
- No changes to Firestore collection/model shape for `institution_invites`.

## Files Touched
- `src/pages/Auth/hooks/useRegister.js`
- `src/utils/securityUtils.js`
- `tests/unit/hooks/useRegister.test.js`
- `tests/unit/utils/securityUtils.test.js`
- `copilot/explanations/codebase/src/pages/Auth/hooks/useRegister.md`
- `copilot/explanations/codebase/src/utils/securityUtils.md`

## Implementation Details
### `src/pages/Auth/hooks/useRegister.js`
- Normalized verification code input with `.trim().toUpperCase()` before invite lookup.
- Applied same normalization before direct-invite deletion path.
- Outcome: lowercase user input now resolves uppercase code documents in `institution_invites`.

### `src/utils/securityUtils.js`
- Added optional `currentTimeMs` argument to `generateDynamicCode`.
- Default remains `Date.now()`, so runtime behavior is unchanged.
- Outcome: deterministic process verification from known inputs (institutionId, time, interval).

### `tests/unit/hooks/useRegister.test.js`
- Extended firestore mocks to include `getDoc` and `deleteDoc`.
- Added teacher registration test proving lowercase input is normalized and looked up as uppercase.

### `tests/unit/utils/securityUtils.test.js`
- Added tests for deterministic output in same window.
- Added tests confirming output changes when rotation window changes.
- Added reproducible verification test for fixed timestamp inputs.

## Validation
- Static diagnostics (`get_errors`) on touched source and test files: no errors.
- Targeted tests executed:
  - `npm run test -- tests/unit/hooks/useRegister.test.js tests/unit/utils/securityUtils.test.js`
  - Result: 2/2 test files passed, 6/6 tests passed.

## Process Summary (Confirmed)
- Teacher code on institution-admin side is generated from:
  - `institutionId`, `role` (`teacher`), and `rotationIntervalHours`.
- Teacher registration validates by reading `institution_invites/{CODE}`.
- Stored code IDs are uppercase; normalization is now enforced on register input, preventing false invalid/expired errors from casing differences.
- Deterministic verification function is now testable for any given time window via `generateDynamicCode(..., currentTimeMs)`.
