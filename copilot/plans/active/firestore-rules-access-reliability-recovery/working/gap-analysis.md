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
- Current status: partially covered with new fixture-aware e2e drag capability assertions; no deny regression reproduced yet.
- Next actions:
  1. Ensure designated shared-folder fixture is accessible for both editor/viewer role paths in test data.
  2. Add explicit e2e steps for editor drag/drop mutation success (state change assertion).
  3. Add explicit e2e steps for viewer drag/drop mutation denial (no state change assertion).
  4. Add explicit e2e checks for delete action availability/denial by role.
  5. Map any observed failure to exact rules predicates and resource path.

## Decision
- Continue with Phase 03 only for changes supported by reproduced failures and test evidence.
- Avoid broad rule loosening until GAP-003 has concrete reproducible evidence.
