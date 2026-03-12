<!-- copilot/explanations/temporal/security-audit-incident-2026-03-12.md -->
# Security Audit Incident — 2026-03-12

## Executive Summary
**A comprehensive post-implementation security audit of `firestore.rules` and `storage.rules` revealed 9 critical/high-severity privilege-escalation vulnerabilities that were NOT caught by the current test suite.** The vulnerabilities allow students to create subjects, modify quiz results, upload documents, and bypass role-based access controls within their institution.

**Status:** Incident opened. Immediate remediation required before any production rollout of Phase 08.

**Impact Assessment:** 
- Users affected: Multiple role-based permissions affected (students should not be teachers)
- Tenant impact: Same-institution cross-role escalation (multi-tenant isolation holds)
- Production risk: If rules are deployed as-is, students could forge academic records

---

## Vulnerability Summary

| # | Title | Severity | Collection | Root Cause | Test Coverage |
|---|---|---|---|---|---|
| 1 | Student Privilege Escalation — Subject Creation | HIGH | `/subjects/{subjectId}` | No `!isStudentRole()` check on create | ❌ No |
| 2 | Student Privilege Escalation — Topic/Content Write (Subcollection) | HIGH | `/subjects/.../topics/`, `/quizzes/`, `/documents/`, etc. | No role check; only institution check via `subjectInstitutionMatches()` | ❌ No |
| 3 | Student Privilege Escalation — Root Content Creation | HIGH | `/topics/`, `/documents/`, `/resumen/`, `/quizzes/`, `/exams/` | No role validation on create | ❌ No |
| 4 | Unvalidated `sharedWithUids` Field | MEDIUM-HIGH | `/subjects/`, `/folders/`, `/shortcuts/` | No validation that only owner can set sharing. Allows arbitrary UIDs. | ❌ No |
| 5 | Unsafe "Atomic" Shortcut Share — `\|\| true` Bypass | MEDIUM-HIGH | `/shortcuts/{shortcutId}` | Trailing `\|\| true` allows creation without verifying target sharing | ❌ No |
| 6 | Subject Invite Code Over-Permissioning | HIGH | `/subjectInviteCodes/{inviteCodeKey}` | No validation that creator owns/manages the subject | ❌ No |
| 7 | Student-Modifiable Subject Metadata | MEDIUM-HIGH | `/subjects/{subjectId}` update | `canWriteResource()` includes `sameInstitution()` which matches students | ❌ No |
| 8 | Folders — Structure OK | ✅ GOOD | `/folders/` | Correctly has `!isStudentRole()` — asymmetrically protected | N/A |
| 9 | Quiz Results — Student Self-Modification | MEDIUM | `/subjects/.../topics/.../quiz_results/` | No ownership/teacher role check on update | ❌ No |

---

## Why Tests Passed Despite Vulnerabilities

The current test suite (`tests/rules/firestore.rules.test.js`, `tests/rules/storage.rules.test.js`) covers **happy-path authorized scenarios only**:

**Current tests:**
- ✅ Admin can read/write subjects
- ✅ Institution admin can manage their institution
- ✅ Teacher can create subjects
- ✅ Cross-tenant reads denied

**Missing tests (CRITICAL GAPS):**
- ❌ Student attempts to create subject → should DENY
- ❌ Student attempts to write topic → should DENY
- ❌ Student attempts to modify quiz results → should DENY
- ❌ Student attempts to create root-level documents → should DENY
- ❌ User attempts to set arbitrary `sharedWithUids` → should DENY or be server-controlled
- ❌ User attempts to create shortcut for unshared target → should DENY (not `|| true`)

**Root Cause:** The test suite was designed to validate that **hardening didn't break authorized flows**, not to validate that **unauthorized flows are correctly blocked**. Student adversarial scenarios were never included in the test matrix.

---

## Evidence & Proof of Concept

### PoC #1: Student Creates Subject

**Setup:**
- User: `student-1` with role `student`, institution `inst-1`

**Attack:**
```javascript
// Student writes directly to Firestore
db.collection('subjects').add({
  course: 'Advanced Hacking 101',
  inviteCode: 'HACK123',
  enrolledStudentUids: [],
  institutionId: 'inst-1',
  ownerId: 'student-1'  // Student claims ownership
})
```

**Rules evaluation:**
```firestore
allow create: if isSignedIn()  // ✅ true
  && (
    isGlobalAdmin()  // ❌ false
    || (
      currentUserInstitutionId() != null  // ✅ 'inst-1'
      && request.resource.data.institutionId == currentUserInstitutionId()  // ✅ true
    )  // ✅ CONDITION MET — NO ROLE CHECK
    || request.resource.data.ownerId == request.auth.uid
  );
```

**Result:** ✅ **Write succeeds.** Student owns a subject and can:
- Invite other students to the subject
- Create topics/lessons
- Create and modify quizzes
- Assign grades

---

### PoC #2: Student Modifies Quiz Results

**Setup:**
- Student took a quiz, scored 45/100
- Quiz result stored at: `/subjects/subject-123/topics/topic-456/quiz_results/result-789`

**Attack:**
```javascript
db.collection('subjects').doc('subject-123')
  .collection('topics').doc('topic-456')
  .collection('quiz_results').doc('result-789')
  .update({ score: 100 })
```

**Rules evaluation:**
```firestore
match /quiz_results/{resultId} {
  allow read, write: if isSignedIn()  // ✅ true
    && (
      isGlobalAdmin()  // ❌ false
      || subjectInstitutionMatches(subjectId)  // ✅ true (checks subject is in student's institution)
    );  // ✅ WRITE ALLOWED — NO OWNERSHIP/ROLE CHECK
}
```

**Result:** ✅ **Update succeeds.** Student's grade is now forged.

---

### PoC #3: Arbitrary sharedWithUids Injection

**Setup:**
- Teacher-A tries to prevent Student-B from seeing their subject
- Student-B discovers they CAN add themselves to `sharedWithUids` on resource creation

**Attack:**
```javascript
db.collection('subjects').add({
  course: 'Secret Teacher Notes',
  inviteCode: 'SECRET123',
  ownerId: 'teacher-a',
  institutionId: 'inst-1',
  sharedWithUids: ['student-b']  // Student-B adds themselves without authorization
})
```

**Rules evaluation:**
```firestore
allow create: if isSignedIn()
  && ...
  && request.resource.data.keys().hasAll(['course', 'inviteCode', 'enrolledStudentUids'])
  // NO VALIDATION OF sharedWithUids — can contain any UID(s)
```

**Later read by student-b:**
```firestore
allow read: if isSignedIn()
  && (
    canReadResource(resource.data)
    || (resource.data.keys().hasAny(['sharedWithUids']) 
        && request.auth.uid in resource.data.sharedWithUids)  // ✅ Condition met
  );
```

**Result:** ✅ **Injection succeeds.** Student reads resources they never were authorized to access.

---

## Verification Checklist Assessment

The plan's `verification-checklist.md` claims:

| Claim | Plan Language | Audit Finding | Status |
|---|---|---|---|
| [x] Role escalation writes denied | "Role escalation writes denied from non-admin actors" | Students CAN create subjects, topics, documents (HIGH severity) | ❌ **FALSE** |
| [x] Tenant-escape attempts denied | "Tenant-escape attempts denied for all roles" | Students can escalate roles WITHIN same tenant (privilege escalation across roles) | ⚠️ **PARTIAL** |
| [ ] All Firestore collections covered by ... tests | Unchecked | Student adversarial scenarios never tested | ❌ **INCOMPLETE** |
| [ ] Authorized CRUD flows validated ... for all critical roles | Unchecked | No student DENY flows validated | ❌ **INCOMPLETE** |
| [ ] Server-controlled fields cannot be overwritten | Unchecked | `sharedWithUids`, `enrolledStudentUids` can be set arbitrarily | ❌ **FALSE** |

**Verdict:** ❌ **The verification checklist claims are FALSE. The rules are NOT adequately hardened before rollout.**

---

## Immediate Remediation Required

### Priority 1: Add Role Checks (CRITICAL)

**Files to patch:**
1. `/subjects/{subjectId}` create/update
2. `/subjects/{subjectId}/topics/{topicId}` read/write
3. `/topics/{topicId}`, `/documents/{documentId}`, `/resumen/{resumenId}`, `/quizzes/{quizId}`, `/exams/{examId}` create
4. `/quiz_results/{resultId}` updates

**Pattern:**
```diff
- allow create: if isSignedIn() && (isGlobalAdmin() || sameInstitution(...))
+ allow create: if isSignedIn() && !isStudentRole() && (isGlobalAdmin() || sameInstitution(...))
```

### Priority 2: Validate sharedWithUids (HIGH)

**Pattern:**
```diff
- allow create: if isSignedIn() && (...)
+ allow create: if isSignedIn() 
+   && (...)
+   && (
+     !request.resource.data.keys().hasAny(['sharedWithUids'])
+     || request.resource.data.sharedWithUids is list
+   )
```

### Priority 3: Subject Invite Code Ownership Check (HIGH)

**Pattern:**
```diff
+ && exists(/databases/$(database)/documents/subjects/$(request.resource.data.subjectId))
+ && (
+   get(/databases/$(database)/documents/subjects/$(request.resource.data.subjectId)).data.ownerId == request.auth.uid
+   || get(/databases/$(database)/documents/subjects/$(request.resource.data.subjectId)).data.uid == request.auth.uid
+ )
```

### Priority 4: Fix Shortcuts `|| true` Bypass (MEDIUM-HIGH)

**Current:**
```firestore
&& (
  request.resource.data.ownerId == request.auth.uid
  || (
    request.resource.data.ownerId != request.auth.uid
    && isTargetOwnerForCreate()
    && (
      targetSharedWithShortcutOwner()
      || true  // 🚨 REMOVES ALL SECURITY
    )
  )
);
```

**Fixed:**
```firestore
&& (
  request.resource.data.ownerId == request.auth.uid
  || (
    request.resource.data.ownerId != request.auth.uid
    && isTargetOwnerForCreate()
    && targetSharedWithShortcutOwner()  // REQUIRE actual sharing
  )
);
```

---

## Next Steps

1. **Open remediation plan** in `copilot/plans/` as `backend-security-privilege-escalation-fixes`
2. **Create comprehensive test suite** for: student denies, invite ownership, sharing validation, field controls
3. **Apply fixes** to `firestore.rules` with lossless verification
4. **Re-run full audit** with new test coverage
5. **Update Phase 08 checklist** with corrected verification
6. **DO NOT DEPLOY** until audit passes with zero HIGH/CRITICAL findings

---

## Record-Keeping

**Audit Timestamp:** 2026-03-12 @ time of phase-08 gate completion  
**Triggered by:** User security concern follow-up question  
**Scope:** All Firestore and Storage rules  
**Findings Count:** 9 (7 HIGH/MEDIUM-HIGH, 2 GOOD, existing tests insufficient)  
**Status:** Open — Awaiting remediation
