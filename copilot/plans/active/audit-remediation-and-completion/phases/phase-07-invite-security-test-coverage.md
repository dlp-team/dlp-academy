<!-- copilot/plans/active/audit-remediation-and-completion/phases/phase-07-invite-security-test-coverage.md -->

# Phase 07: Invite Security Test Coverage

**Duration:** 2-3 hours | **Priority:** 🟡 HIGH | **Status:** ✅ COMPLETED

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

### Page-level workflow tests
File: `tests/unit/pages/content/StudyGuide.navigation.test.jsx`
- Added: deterministic Table-of-Contents navigation coverage for section jump behavior.
- Added: deterministic keyboard-arrow navigation coverage for section progression behavior.

File: `tests/unit/pages/content/StudyGuide.fallback.test.jsx`
- Re-validated fallback and partial-guide states alongside new navigation workflow coverage.

## Validation
- `npm run test`: 71/71 files passed, 387/387 tests passed.
- `npm run test:rules`: 2/2 files passed, 47/47 tests passed.
- `npm run test -- tests/unit/pages/admin tests/unit/pages/home tests/unit/pages/content`: 31/31 files passed, 77/77 tests passed.
- `npm run lint`: 0 errors (only pre-existing warnings in unrelated files).

## Notes
- This slice directly validates the security/privacy controls requested for subject invite workflows.
- Firestore least-privilege posture is explicitly tested for enumeration prevention.
