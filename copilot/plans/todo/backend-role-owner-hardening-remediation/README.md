<!-- copilot/plans/todo/backend-role-owner-hardening-remediation/README.md -->
# Backend Role & Owner Hardening Remediation Plan

## 🚨 Status: ACTIVE — SECURITY CRITICAL

**Decision Level:** Critical Security Remediationremaps
**Start Date:** 2026-03-12
**Target Completion:** 2026-03-14
**Blocker:** Phase 08 (production rollout) cannot proceed until this plan is 100% complete and validated

---

## Problem Statement

Post-implementation security audit (2026-03-12) identified **9 critical/high-severity privilege-escalation vulnerabilities** in `firestore.rules` that allow students to:
- Create subjects (teacher-level operation)
- Modify quiz results (forging grades)
- Write to topics/documents (content creation)
- Inject arbitrary users into `sharedWithUids`
- Bypass ownership checks via `|| true` in shortcuts

**Root Cause:** Authorization rules check institutional boundaries but **do not validate role-based restrictions** for sensitive mutations. Test suite covered only happy-path authorized scenarios, never tested STUDENT denial flows.

**Impact:** Students can escalate to teacher/admin capabilities within their institution, forge academic records, and access unauthorized resources.

---

## Success Criteria

✅ **All 9 vulnerabilities fixed and validated**
✅ **Role-based DENY tests pass (students cannot escalate)**
✅ **Ownership validation enforced on all sensitive fields**
✅ **sharedWithUids immutable/server-controlled**
✅ **No `|| true` bypass conditions remain**
✅ **Full regression suite passes (existing authorized flows still work)**
✅ **Phase 08 unblocked and ready to proceed**

---

## High-Level Approach

### Phase 1: In-Depth Audit (Scope Definition)
- Deep analysis of all 26 firestore collections/subcollections
- Map role + ownership requirements for each operation
- Identify all places students should be denied write access
- Document existing role checks and gaps

### Phase 2: Priority-1 Rules Fixes (Role-Based DENY)
- Add `!isStudentRole()` guards to all subject/content write paths
- Fix `canWriteResource()` to reject student writes (was allowing institution members)
- Add role checks to invite code creation
- Block student root-level document creation

### Phase 3: Priority-2 Field Validation (Ownership & Immutability)
- Validate `sharedWithUids` is server-controlled (only owner/admin can set)
- Validate `enrolledStudentUids` immutability
- Remove `|| true` fallback from shortcuts
- Add ownership checks to quiz result updates

### Phase 4: Adversarial Test Suite Expansion
- Add DENY test cases for every student escalation vector
- Test unauthorized field modifications
- Test cross-role permission boundaries
- Verify all 9 findings covered

### Phase 5: Validation & Closure
- All tests passing (21 storage + 13+ firestore + new adversarial)
- Full regression validation
- Create incident closure report
- Unblock Phase 08 rollout

---

## Artifacts Created

- **strategy-roadmap.md** — Detailed phased execution strategy
- **phases/phase-1-audit.md** — Complete role/owner requirements mapping
- **phases/phase-2-priority1-fixes.md** — Role-based access control hardening
- **phases/phase-3-priority2-validation.md** — Field immutability & ownership
- **phases/phase-4-test-suite. md** — Adversarial test case design
- **phases/phase-5-validation.md** — Closure and Phase 08 unblocking
- **reviewing/incident-closure-checklist.md** — Pre-closure validation gates
- **DEEP-AUDIT.md** — Comprehensive pre-implementation analysis

---

## Risk Assessment

| Risk | Mitigation |
|---|-|
| Breaking authorized flows | Full regression testing (test all modes: admin, teacher, student) |
| Incomplete remediation | Adversarial test matrix ensures all 9 findings have tests |
| Reintroduction of bugs | Incident closure checklist required before unblocking Phase 08 |

---

## Timeline

- **Phase 1 (Audit):** 30 min
- **Phase 2 (Priority 1 fixes):** 45 min
- **Phase 3 (Priority 2 validation):** 45 min
- **Phase 4 (Test suite):** 60 min
- **Phase 5 (Validation):** 30 min
- **Total:** ~3.5 hours (estimated)

---

## Phase Execution Order (SEQUENTIAL — Do Not Skip)

1. ✅ Phase 1: Audit — Define exact scope and requirements
2. ⏭ Phase 2: Role checks — Fix allow/create rules
3. ⏭ Phase 3: Field validation — Harden ownership & immutability
4. ⏭ Phase 4: Adversarial tests — Validate denies work
5. ⏭ Phase 5: Validation — Closure and Phase 08 unblocking

---

## Current State (Pre-Execution)

- `firestore.rules`: Contains 9 vulnerabilities, 0 fixes applied
- `tests/rules/firestore.rules.test.js`: 13/13 tests pass (happy-path only)
- Test coverage: Administrator flows ✅, Teacher flows ✅, Student DENY flows ❌
- Production readiness: ❌ BLOCKED (incident open)

---

## Success Metrics (Closure Gate)

- [ ] All 9 vulnerabilities have verified fixes in firestore.rules
- [ ] Adversarial test suite passes (all student DENY flows blocked)
- [ ] Full regression suite passes (authorized flows still work)
- [ ] `npm run test:rules` returns 21+ passing tests
- [ ] No new security issues identified in final audit
- [ ] Incident closure report generated
- [ ] Phase 08 unblocked for production deployment

---

## Notes

- **No scope drift:** Changes are LIMITED to fixing identified vulnerabilities
- **Lossless changes:** All fixes are surgical; existing authorized flows preserved
- **Documentation:** All changes documented in incident closure report
- **Approval:** Requires final verification against incident closure checklist

---

## Next Step

→ Proceed to **Phase 1: In-Depth Audit** (see `phases/phase-1-audit.md`)
