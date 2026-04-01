<!-- copilot/plans/active/audit-remediation-and-completion/phases/phase-07-invite-security-test-coverage.md -->

# Phase 07: Invite Security Test Coverage

**Duration:** 2-3 hours | **Priority:** 🟡 HIGH | **Status:** ✅ COMPLETED (slice)

## Objective
Add deterministic coverage for recent invite-code security/privacy behavior to ensure regressions are blocked.

## Implemented Tests

### Unit tests (`useSubjects`)
File: `tests/unit/hooks/useSubjects.test.js`
- Added: rejects join when `inviteCodeEnabled` is false.
- Added: rejects join when invite code is expired by rotation interval.

### Firestore rules tests
File: `tests/rules/firestore.rules.test.js`
- Added: denies invalid invite governance updates (`inviteCodeEnabled` wrong type, rotation interval out-of-range).
- Added: allows valid invite governance updates (bool + valid interval + timestamp).
- Added: denies `subjectInviteCodes` list enumeration and allows direct `get` by ID.

## Validation
- `npm run test`: 71/71 files passed, 387/387 tests passed.
- `npm run test:rules`: 2/2 files passed, 47/47 tests passed.
- `npm run lint`: 0 errors (only pre-existing warnings in unrelated files).

## Notes
- This slice directly validates the security/privacy controls requested for subject invite workflows.
- Firestore least-privilege posture is explicitly tested for enumeration prevention.
