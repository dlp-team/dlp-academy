<!-- copilot/explanations/temporal/lossless-reports/2026-03-06/residual-rules-join-invite-and-dnd-matrix.md -->
# Lossless Change Report - Residual Coverage + DnD Matrix Expansion

## Requested Scope
- Execute residual work:
  - add Firestore rules executable tests,
  - implement missing join-by-subject-invite runtime flow and tests.
- Then assess and improve drag/drop + shared shortcut + confirmation overlay coverage.

## Behaviors Preserved
- Existing subject creation/update/share behavior remains unchanged.
- Existing drag/drop implementations were not modified; only test coverage expanded.
- Default `npm run test` behavior remains unit-test only.

## Touched Files
- `src/hooks/useSubjects.js`
- `tests/unit/hooks/useSubjects.test.js`
- `tests/rules/firestore.rules.test.js`
- `tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`
- `package.json`
- `package-lock.json`
- `copilot/explanations/codebase/src/hooks/useSubjects.md`

## File-by-File Verification
### `src/hooks/useSubjects.js`
- Added `joinSubjectByInviteCode(inviteCodeInput)`.
- Validates code + auth context.
- Resolves invite reservation key and linked subject.
- Enforces institution compatibility and trashed-subject guard.
- Short-circuits on already-joined users.
- Applies membership update and shortcut upsert for first-time joins.

### `tests/unit/hooks/useSubjects.test.js`
- Added join flow tests:
  - successful join path,
  - invalid/missing code path,
  - already-joined short-circuit path.

### `tests/rules/firestore.rules.test.js`
- Added rules suite with allow/deny assertions for:
  - subject create schema constraints,
  - `subjectInviteCodes` create/read restrictions,
  - immutable invite reservation behavior.

### `tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`
- Added DnD + overlay confirmation coverage for:
  - breadcrumb folder shortcut drop into shared target (owner request overlay),
  - breadcrumb shared-mismatch folder merge callback,
  - promote-subject unshare overlay preserve callback.

### `package.json` / `package-lock.json`
- Added `@firebase/rules-unit-testing` dev dependency.
- Added scripts:
  - `test:rules`
  - `test:rules:unit`

## Validation Summary
- Focused hook coverage:
  - `npm run test:unit -- tests/unit/hooks/useSubjects.test.js tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`
  - Result: passed.
- Full unit suite:
  - `npm run test`
  - Result: `19/19` files, `94/94` tests passed.
- Diagnostics:
  - `get_errors` on touched source/tests/config files: no errors.

## Execution Blockers
- `npm run test:rules` failed because Java runtime is not available on PATH in this machine.
- The rules tests are implemented and ready; they will execute once Java is installed.

## Remaining Risk Notes
- Drag/drop + shared overlay coverage is now broader but still not mathematically exhaustive across every branch permutation.
- There are still no component-level tests for visual modal/overlay rendering interactions in Home; current coverage remains behavior-focused at hook level.
