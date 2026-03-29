<!-- copilot/plans/todo/backend-role-owner-hardening-remediation/reviewing/incident-closure-checklist.md -->
# Incident Closure Verification Checklist

**Incident:** 9 privilege-escalation vulnerabilities discovered in security audit 2026-03-12
**Plan:** Backend Role & Owner Hardening Remediation
**Target Completion:** 2026-03-14

---

## Vulnerability Closure Matrix

| # | Collection/Operation | Vulnerability | Fix Type | Fix Applied | DENY Test | ALLOW Test | Status |
|---|---|---|---|---|---|---|---|
| 1 | `/subjects` create | Student can create subject | Role check | [ ] | [ ] | [ ] | [ ] |
| 2 | `/subjects` update | Student can update metadata | Role check | [ ] | [ ] | [ ] | [ ] |
| 3 | `/subjects/.../topics` write | Student can write topics | Role check | [ ] | [ ] | [ ] | [ ] |
| 4 | `/topics` create | Student can create root topic | Role check | [ ] | [ ] | [ ] | [ ] |
| 5 | `/topics` update | Student can update root topic | Role check | [ ] | [ ] | [ ] | [ ] |
| 6 | `/documents` create | Student can create document | Role check | [ ] | [ ] | [ ] | [ ] |
| 7 | `/documents` update | Student can update document | Role check | [ ] | [ ] | [ ] | [ ] |
| 8 | `/quizzes` create | Student can create quiz | Role check | [ ] | [ ] | [ ] | [ ] |
| 9 | `/quizzes` update | Student can update quiz | Role check | [ ] | [ ] | [ ] | [ ] |
| 10 | `/exams` create | Student can create exam | Role check | [ ] | [ ] | [ ] | [ ] |
| 11 | `/exams` update | Student can update exam | Role check | [ ] | [ ] | [ ] | [ ] |
| 12 | `/quiz_results` write | Student can modify grade | Ownership + role check | [ ] | [ ] | [ ] | [ ] |
| 13 | `/subjectInviteCodes` create | Non-owner creates codes | Ownership validation | [ ] | [ ] | [ ] | [ ] |
| 14 | `/shortcuts` create | `\|\| true` bypass | Remove fallback | [ ] | [ ] | [ ] | [ ] |
| 15 | `sharedWithUids` | Arbitrary UID injection | Field validation | [ ] | [ ] | [ ] | [ ] |

---

## Pre-Implementation Verification

- [ ] All 5 phases documented in `phases/` folder
- [ ] Phase 1 audit complete (role/owner requirements mapped)
- [ ] Phase 2 fixes identified with line numbers
- [ ] Phase 3 fixes identified with code examples
- [ ] Phase 4 test cases designed
- [ ] Phase 5 validation gates defined

---

## Post-Implementation Verification

### Syntax & Formatting
- [ ] `npm run lint firestore.rules` passes
- [ ] No syntax errors in rules
- [ ] File formatting consistent

### Test Execution
- [ ] `npm run test:rules` executes without timeout
- [ ] Test output shows 21+ passing tests
- [ ] No WARN or FAIL messages
- [ ] All storage rules tests (8) passing
- [ ] All existing firestore rules tests (13+) passing
- [ ] All new adversarial tests (9+) passing

### Code Review
- [ ] All `!isStudentRole()` guards added to sensitive operations
- [ ] No `|| true` or `|| false` bypass conditions remain
- [ ] `sharedWithUids` validation added where applicable
- [ ] Ownership checks enforced on invite codes
- [ ] Quiz results have role + ownership validation

### Regression Testing
- [ ] `npm run test` (unit tests) all passing
- [ ] No new test failures introduced
- [ ] Authorized flows (admin/teacher) still work
- [ ] Institutional boundaries preserved

### Security Review
- [ ] No hardcoded user IDs or test data left in rules
- [ ] All dynamic role checks use `currentUserRole()` and `currentUserInstitutionId()`
- [ ] Cross-tenant vulnerability audit passed
- [ ] No new attack vectors introduced by fixes

---

## File Changes Verification

| File | Changes | Verified |
|---|---|---|
| `firestore.rules` | 15 vulnerabilities fixed | [ ] |
| `tests/rules/firestore.rules.test.js` | 9+ adversarial tests added | [ ] |
| `storage.rules` | No changes (already fixed) | ✅ N/A |
| `tests/rules/storage.rules.test.js` | No changes (already fixed) | ✅ N/A |

---

## Manual Verification Tasks

### Task 1: Verify No Student Privilege Escalation
```javascript
// Manually test in Firebase emulator:
1. Sign in as student
2. Try to create subject → DENIED ✓
3. Try to create topic → DENIED ✓
4. Try to create quiz → DENIED ✓
5. Try to modify quiz result → DENIED ✓
```

- [ ] All student escalation attempts blocked

### Task 2: Verify Teacher Flows Still Work
```javascript
// Manually test as teacher:
1. Create subject → ALLOWED ✓
2. Create topic within subject → ALLOWED ✓
3. Create quiz → ALLOWED ✓
4. Modify student's quiz result → ALLOWED ✓
5. Create invite code → ALLOWED ✓
```

- [ ] All teacher operations work as expected

### Task 3: Verify Admin Flows Still Work
```javascript
// Manually test as admin:
1. Manage all subjects → ALLOWED ✓
2. Manage all users → ALLOWED ✓
3. Modify any resource in any institution → ALLOWED ✓
```

- [ ] Admin operations unrestricted

### Task 4: Verify Multi-Tenant Isolation
```javascript
// Verify cross-institution attempts:
1. Student in Inst-A tries to access Inst-B subject → DENIED ✓
2. Teacher in Inst-A tries to create content in Inst-B → DENIED ✓
3. Institution boundary checks comprehensive ✓
```

- [ ] Tenant isolation maintained

---

## Approval Sign-Off

| Role | Name | Date | Status |
|---|---|---|---|
| Security Lead | — | — | [ ] |
| Backend Lead | — | — | [ ] |
| QA Lead | — | — | [ ] |

---

## Phase 08 Unblocking Conditions

All of the following MUST be true:

- [ ] ✅ All 15 vulnerabilities have fixes applied to firestore.rules
- [ ] ✅ All 9+ adversarial DENY tests pass (`npm run test:rules`)
- [ ] ✅ All existing tests still pass (regression maintained)
- [ ] ✅ No new security issues identified
- [ ] ✅ No `|| true` bypass conditions remain
- [ ] ✅ This checklist signed off by all required roles
- [ ] ✅ Incident closure report finalized

**Only when ALL boxes checked:** Phase 08 rollout can proceed

---

## Sign-Off

- Incident Status: [ ] OPEN / [ ] CLOSED
- Resolution Date: _______________
- Approved For Phase 08 Rollout: [ ] YES / [ ] NO

