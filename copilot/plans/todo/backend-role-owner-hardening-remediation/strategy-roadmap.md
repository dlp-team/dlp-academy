<!-- copilot/plans/todo/backend-role-owner-hardening-remediation/strategy-roadmap.md -->
# Strategy & Roadmap — Backend Role & Owner Hardening Remediation

## Executive Overview

This plan remediates **9 privilege-escalation vulnerabilities** discovered in post-implementation security audit. All vulnerabilities allow students to escalate to teacher/admin capabilities or modify protected data within their institution.

**Remediation Strategy:** Surgical application of role-based DENY rules + ownership validation on all sensitive paths, followed by comprehensive adversarial testing to ensure unauthorized flows are actually blocked.

---

## Foundational Security Model

### Role Hierarchy
```
admin
  ↓ (superset of)
institutionadmin  
  ↓ (superset of)
teacher
  ↓ (superset of)
student
```

### Protected Operations (Students MUST BE DENIED)
| Operation | Required Role | Current Check | Status |
|---|---|---|---|
| Create subject | teacher+ | None (institution only) | 🚫 FAIL |
| Create topic (root) | teacher+ | None (institution only) | 🚫 FAIL |
| Create document (root) | teacher+ | None (institution only) | 🚫 FAIL |
| Create resumen (root) | teacher+ | None (institution only) | 🚫 FAIL |
| Create quiz (root) | teacher+ | None (institution only) | 🚫 FAIL |
| Create exam (root) | teacher+ | None (institution only) | 🚫 FAIL |
| Modify quiz_results | teacher+ | None (institution only) | 🚫 FAIL |
| Modify subject metadata | teacher+ | `canWriteResource()` which includes students | 🚫 FAIL |
| Create invite code for subject | teacher+ | None  (institution only) | 🚫 FAIL |

### Server-Controlled Fields (Cannot Be Set by Clients)
| Field | Collections | Current | Fix |
|---|---|---|---|
| `sharedWithUids` | subjects, folders, shortcuts | Client can set arbitrarily | Validate on create/update: only owner/admin can set |
| `enrolledStudentUids` | subjects | Client can set | Keep as-is (students usually auto-enroll) |
| `ownerId` | All | Validated (cannot change) | ✅ OK |

### Ownership Models
1. **Single Owner:** `ownerId == request.auth.uid` or `userId == request.auth.uid`
2. **Institutional Boundary:** `institutionId == currentUserInstitutionId()`
3. **Hierarchical Ownership:** Resource owner OR folder owner (cascade)
4. **Shared Access:** `request.auth.uid in resource.data.sharedWithUids` (for explicitly shared resources only)

---

## Phase 1: In-Depth Audit (Detailed Collection Analysis)

**Objective:** Map every firestore collection/subcollection to required role + owner checks

**Scope:** 
- `/users/` — User profiles
- `/subjects/`, `/subjects/.../topics/` — Subject hierarchy  
- `/topics/`, `/documents/` — Root content collections
- `/resumen/`, `/quizzes/`, `/exams/` — Content variants
- `/quiz_results/`, `/quizzes/.../quiz_results/` — Result data
- `/folders/` — Folder organization
- `/shortcuts/` — Bookmarks/links
- `/subjectInviteCodes/` — Invite management
- `/classes/`, `/courses/`, `/subject_class_requests/` — Class management
- `/institutions/`, `/institution_invites/` — Institution management

**Output:** Detailed role/owner requirements matrix (see phase-1-audit.md)

---

## Phase 2: Priority 1 — Role-Based Access Control Hardening

**Objective:** Add `!isStudentRole()` guards to all student-sensitive write paths

### Fix Pattern (ALL student-write-blocked operations):
```firestore
// BEFORE (vulnerable):
allow create: if isSignedIn() && (
  isGlobalAdmin() || (
    currentUserInstitutionId() != null &&
    request.resource.data.institutionId == currentUserInstitutionId()
  )
);

// AFTER (hardened):
allow create: if isSignedIn() && !isStudentRole() && (
  isGlobalAdmin() || (
    currentUserInstitutionId() != null &&
    request.resource.data.institutionId == currentUserInstitutionId()
  )
);
```

### Collections to Fix:
1. **`/subjects/{subjectId}` create** — Add `!isStudentRole()`
   - Reason: Students should not be able to create their own subjects
   - Test: Student creates subject → DENY

2. **`/subjects/{subjectId}` update** — Add `!isStudentRole()` to `canWriteResource()` path
   - Reason: `canWriteResource()` returns true for any institution member (including students)
   - Fix: Make role check explicit in update condition

3. **`/subjects/.../topics/` (subcollection read, write)** — Add role check
   - Reason: Currently only checks `subjectInstitutionMatches()`
   - Fix: Ensure students cannot create topics as teachers

4. **`/topics/{topicId}` create** — Add `!isStudentRole()`
   - Reason: Root-level topic creation is teacher operation
   - Test: Student creates root topic → DENY

5. **`/documents/{documentId}` create** — Add `!isStudentRole()`
   - Reason: Students should not create documents for entire institution
   - Test: Student creates document → DENY

6. **`/resumen/{resumenId}` create** — Add role check or leave owner-only
   - Reason: AI-generated summaries should be teacher/student-owned, not institutional
   - Test: Student creates resumen → OK if owner-only, DENY if institutional write

7. **`/quizzes/{quizId}` create** — Add `!isStudentRole()`
   - Reason: Quiz creation is teacher responsibility
   - Test: Student creates quiz → DENY

8. **`/exams/{examId}` create** — Add `!isStudentRole()`
   - Reason: Exam creation is teacher responsibility
   - Test: Student creates exam → DENY

9. **`/subjectInviteCodes/{inviteCodeKey}` create** — Add ownership validation
   - Reason: Only subject owner/teacher should create invite codes
   - Fix: Validate `createdBy` owns the subject OR is teacher in institution

### Implementation Details:
- Modify `canWriteResource()` function to include role check: `!isStudentRole()`
- OR add inline conditions on each sensitive path
- Ensure `isStudentRole()` function is working correctly

---

## Phase 3: Priority 2 — Field Immutability & Ownership Validation

**Objective:** Ensure server-controlled fields cannot be manipulated and ownership is always validated

### Fix #1: `sharedWithUids` Immutability
```firestore
// Validate on CREATE: can only be set by owner or if empty
&& (!request.resource.data.keys().hasAny(['sharedWithUids']) 
    || request.resource.data.sharedWithUids == [] 
    || (isGlobalAdmin() || resource.data.ownerId == request.auth.uid))

// Validate on UPDATE: cannot modify shared list after creation
&& request.resource.data.sharedWithUids == resource.data.sharedWithUids
```

### Fix #2: Remove `|| true` from Shortcuts
```firestore
// BEFORE (vulnerable):
&& (
  targetSharedWithShortcutOwner()
  || (
    true  // ← DANGEROUS BYPASS
  )
)

// AFTER (fixed):
&& targetSharedWithShortcutOwner()  // Must validate actual sharing
```

### Fix #3: Quiz Results Ownership Check
```firestore
// Add ownership/role validation:
match /quiz_results/{resultId} {
  allow read, write: if isSignedIn()
    && (
      isGlobalAdmin() 
      || subjectInstitutionMatches(subjectId)
      && (
        // Teacher/admin can modify any result
        (isTeacherRole() || isInstitutionAdmin())
        // Student can only modify their own result
        || (isStudentRole() && resource.data.studentId == request.auth.uid)
      )
    );
}
```

### Fix #4: Subject Metadata Update Validation
```firestore
// Ensure update is from owner or teacher, not any institution member:
allow update: if isSignedIn() && !isStudentRole()
  && (
    isGlobalAdmin()
    || resource.data.ownerId == request.auth.uid
    || (
      isTeacherRole()
      && resource.data.institutionId == currentUserInstitutionId()
    )
  );
```

---

## Phase 4: Adversarial Test Suite Expansion

**Objective:** Create comprehensive test coverage for all 9 vulnerabilities with explicit DENY validations

### Test Matrix:
| Vulnerability | Test Case | Expected Result |
|---|---|---|
| 1. Student Subject Creation | Student attempts `subjects.add({...})` | ❌ DENY |
| 2. Student Topic Write | Student attempts topic subcollection write | ❌ DENY |
| 3. Student Root Content | Student attempts root-level document/topic create | ❌ DENY |
| 4. Arbitrary sharedWithUids | Unit attempt to inject UID in sharedWithUids array | ❌ DENY or immutable |
| 5. Shortcut || true Bypass | User creates shortcut without target sharing | ❌ DENY |
| 6. Invite Code Over-Perm | Non-subject-owner creates invite code | ❌ DENY |
| 7. Student Subject Metadata | Student updates subject.course field | ❌ DENY |
| 8. Folders Structure | Student attempts to create/modify folder (should pass `!isStudentRole()` guard) | ❌ DENY on create |
| 9. Quiz Result Tampering | Student modifies their quiz result score | ❌ DENY (or allow self-read only) |

### Test Code Pattern:
```javascript
it('Student CANNOT create subject', async () => {
  const studentToken = await auth.signInWithEmailAndPassword(
    'student@test.edu', 'password'
  );
  const studentDb = initializeTestingApp({ uid: studentToken.uid, role: 'student' });
  
  await expect(
    studentDb.collection('subjects').add({
      course: 'Hacked Subject',
      institutionId: INSTITUTION_ID,
      inviteCode: 'HACK123',
      enrolledStudentUids: []
    })
  ).toDeny('Only teachers and above can create subjects');
});
```

---

## Phase 5: Validation & Closure

**Objective:** Ensure all fixes work, regression suite passes, and Phase 08 can proceed

### Validation Checklist:
1. All Priority 1 fixes applied to firestore.rules
2. All Priority 2 fixes applied (sharedWithUids, shortcuts, quiz_results, subject metadata)
3. New adversarial test suite covers all 9 findings
4. `npm run test:rules` passes all tests (21+ total)
5. `npm run test` passes all unit tests (regression)
6. No new security issues identified
7. Incident closure report generated
8. Phase 08 unblocked

---

## File Changes Required

| File | Changes | Lines |
|---|---|---|
| `firestore.rules` | Add role checks + field validation | ~40-50 |
| `tests/rules/firestore.rules.test.js` | Add adversarial test suite (9+ tests) | ~150-200 |
| Incident closure report (new) | Evidence + validation results | ~50-100 |

---

## Success Criteria (Gate Requirements)

✅ All 9 vulnerabilities fixed and tested
✅ Student DENY test cases pass (explicitly verify denial works)
✅ Regression suite passes (authorized flows unchanged)
✅ Zero new security findings
✅ No `|| true` or other bypass conditions remain
✅ Phase 08 unblocked for production rollout

---

## Rollback Strategy

If critical regression discovered during Phase 4:
1. Revert firestore.rules to last known-good state
2. Document regression in incident report
3. Return to Phase 2 for targeted fix
4. Re-run all tests

---

## Execution Timeline

| Phase | Duration | Blocker |
|---|---|---|
| 1. Audit | 30 min | None (informational) |
| 2. Priority 1 fixes | 45 min | Phase 1 complete |
| 3. Priority 2 fixes | 45 min | Phase 2 tests passing |
| 4. Test suite | 60 min | Phase 3 fixes applied |
| 5. Validation | 30 min | Phase 4 tests Green |

**Total:** ~3.5 hours
**Start:** Immediately after plan approval  
**End:** When Phase 5 validation gates all pass

---

## Next Steps

1. ✅ Read phase 1-5 detailed artifacts (phases/*.md)
2. Execute Phase 1: In-Depth Audit
3. Execute Phase 2: Role-Based Access Control Hardening
4. Execute Phase 3: Field Immutability & Ownership
5. Execute Phase 4: Adversarial Test Suite
6. Execute Phase 5: Validation & Closure
