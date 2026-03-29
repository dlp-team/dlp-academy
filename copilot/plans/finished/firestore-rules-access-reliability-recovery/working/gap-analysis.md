# Gap Analysis (Phase 02)

## Confirmed Gaps

### GAP-001: `institution_invites` delete predicate runtime fragility
- Symptom: Runtime evaluation error (`Property email is undefined on object`) observed during rules tests.
- Root cause: delete branch compared `request.auth.token.email` with `resource.data.email` without guarding key existence.
- Fix applied:
  - Guard `request.auth.token` email claim presence.
  - Guard invite `email` field presence before comparison.
- Validation:
  - `npm run test:rules` passes.
  - Added regression test: delete allowed for institution admin even when invite has no email field; teacher still denied.
- Risk status: mitigated.

### GAP-004: legacy subject move/update denied by strict creation-field guard
- Symptom: `useFolders.js` move flow failed with `FirebaseError: Missing or insufficient permissions` during `updateDoc(subject)`.
- Root cause: subject update rule required `course`, `inviteCode`, and `enrolledStudentUids` on all updates; legacy/shared docs missing those fields could not be moved.
- Fix applied:
  - Subject update rule now enforces those fields only when present on update payload.
  - Creation path remains strict (required fields still enforced on create).
- Validation:
  - Added rules regression test: allows folder move update for legacy subject docs missing creation-era fields.
  - `npm run test:rules` now passes `41/41`.
- Risk status: resolved.

## Resolved Non-Rule Blockers

### GAP-002: editor e2e login blocker
- Symptom: editor-role specs timed out waiting for `/home`.
- Root cause: credentials in `.env` were invalid/truncated due hash/comment parsing.
- Resolution: corrected `.env` password handling.
- Validation:
  - `tests/e2e/home-sharing-roles.spec.js` and `tests/e2e/admin-guardrails.spec.js` now pass.
- Classification: fixture/env issue, not firestore rules defect.

## Remaining Investigation Targets

### GAP-003: intermittent drag/drop and delete denies in shared contexts (user-reported)
- Current status: addressed in current validation slice.
  - Viewer denial path has explicit e2e assertion (redirect-to-home OR zero-draggable cards).
  - Editor shared-folder drag-drop mutation path passes with state-change assertion.
  - Editor shared-folder create/delete mutation flow runs successfully in e2e.
- Next actions:
  1. Re-run broader e2e batch to confirm no regressions outside focused shared-role suite.
  2. If new failures appear, map them to exact rules predicates and apply minimal fixes.

## Decision
- Continue with Phase 03 only for changes supported by reproduced failures and test evidence.
- Avoid broad rule loosening until GAP-003 has concrete reproducible evidence.
