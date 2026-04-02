<!-- copilot/plans/finished/backend-role-owner-hardening-remediation/phases/phase-1-audit.md -->
# Phase 1: In-Depth Audit — Role & Owner Requirements Mapping

**Duration:** 30 min (informational, no code changes)
**Objective:** Map every Firestore collection/subcollection to required role + owner authorization checks

---

## Complete Collection Analysis

### ✅ VERDICT: PASS (`/users/{userId}`)
```
Collection: /users/{userId}
Operations:
  - read: Any signed-in user (own profile always readable)
  - create: Self-creation only (request.auth.uid == userId) ✅
  - update: Self-update (no role/institutionId change) + admin/institution-admin manage ✅
  - delete: Self-delete or global admin ✅

Current implementation: ✅ CORRECT
Required role: N/A (self-service, admin override)
Vulnerability: None

Fix needed: None
```

---

### 🚫 FAIL: `/subjects/{subjectId}` — STUDENT CAN CREATE
```
Collection: /subjects/{subjectId}
Operations:
  - create: ❌ VULNERABLE — No role check
  - read: ✅ OK (comprehensive checks)
  - update: ⚠️ PARTIAL — Uses canWriteResource() which includes students
  - delete: ✅ OK (owner/admin only)

Current rules:
  allow create: if isSignedIn()
    && (
      isGlobalAdmin()
      || (currentUserInstitutionId() != null 
          && request.resource.data.institutionId == currentUserInstitutionId())
      || request.resource.data.ownerId == request.auth.uid
    )

PROBLEM: "Same institution" check allows ANY institution member (including students)

Required: Teacher or above can create subjects
Fix: Add !isStudentRole() to create condition
Fix: Update rule uses canWriteResource() which needs role check

Test case (DENY):
  - Student in same institution creates subject → Should DENY
  - Teacher in same institution creates subject → Should ALLOW
```

---

### 🚫 FAIL: `/subjects/{subjectId}/topics/{topicId}` (Subcollection) — NO ROLE CHECK
```
Collection: /subjects/{subjectId}/topics/{topicId}
Operations:
  - read: ⚠️ INSTITUTIONAL — No role check
  - write: ⚠️ INSTITUTIONAL — No role check

Current rules:
  allow read, write: if isSignedIn()
    && (isGlobalAdmin() || subjectInstitutionMatches(subjectId))

PROBLEM: Any institution member (student) can write

However: subjectInstitutionMatches() only checks institutional boundary.
  Students are institution members → Rule passes

Required: Should be teacher+ only, OR should check `!isStudentRole()`
Fix: Add !isStudentRole() to write operations (read can stay broad)

Test case (DENY):
  - Student writes to /subjects/X/topics/Y → Should DENY
```

---

### ✅ VERDICT: PASS (`/folders/{folderId}`)
```
Collection: /folders/{folderId}
Operations:
  - create: ✅ CORRECT — has !isStudentRole()
  - read: ✅ CORRECT — has !isStudentRole()
  - update: ✅ CORRECT — has !isStudentRole()
  - delete: ✅ CORRECT — has !isStudentRole()

Current implementation: ✅ CORRECT (asymmetrically protected compared to other collections)

Vulnerability: None (this is the REFERENCE for how other collections should be protected)
```

---

### 🚫 FAIL: `/topics/{topicId}` (Root) — STUDENT CAN CREATE
```
Collection: /topics/{topicId}
Operations:
  - create: ❌ VULNERABLE — No role check
  - read: ✅ OK
  - update: ❌ VULNERABLE — No role check
  - delete: ✅ OK (owner/admin)

Current rules:
  allow create: if isSignedIn()
    && (isGlobalAdmin() || (insti check && subject ref check))

PROBLEM: No !isStudentRole() guard on creation

Required: Teacher or above can create root topics
Fix: Add !isStudentRole() to create/update conditions

Test case (DENY):
  - Student creates root topic → Should DENY
```

---

### 🚫 FAIL: `/documents/{documentId}` (Root) — STUDENT CAN CREATE
```
Collection: /documents/{documentId}
Operations:
  - create: ❌ VULNERABLE — No role check
  - read: ✅ OK
  - update: ❌ VULNERABLE — No role check
  - delete: ✅ OK (owner/admin)

Current rules: Same pattern as topics (no role check)

Required: Teacher or above
Fix: Add !isStudentRole()

Test case (DENY):
  - Student creates document → Should DENY
```

---

### ⚠️ PARTIAL FAIL: `/resumen/{resumenId}` (Root) — AMBIGUOUS
```
Collection: /resumen/{resumenId}
Operations:
  - create: ⚠️ AMBIGUOUS

Current rules:
  allow create: if isSignedIn()
    && (isGlobalAdmin() || topicCheck || request.resource.data.ownerId == request.auth.uid)

AMBIGUITY: Is resumen "student-generated" or "teacher-published"?
  - If teacher-published: Should add !isStudentRole() somewhere in institution path
  - If student-personal: Can stay owner-only (current model)

Decision: Keep as-is (owner-only in current data model is OK for student personal summaries)
However: Institution-level resumen creation should be teacher+ only

Fix: No change required (owner-only pattern is acceptable)
```

---

### 🚫 FAIL: `/quizzes/{quizId}` (Root) — STUDENT CAN CREATE
```
Collection: /quizzes/{quizId}
Operations:
  - create: ❌ VULNERABLE — No role check
  - read: ✅ OK
  - update: ❌ VULNERABLE — No role check
  - delete: ✅ OK (owner/admin)

Current rules: No role check on create/update

Required: Teacher or above
Fix: Add !isStudentRole()

Test case (DENY):
  - Student creates quiz → Should DENY
```

---

### 🚫 FAIL: `/exams/{examId}` (Root) — STUDENT CAN CREATE
```
Collection: /exams/{examId}
Operations:
  - create: ❌ VULNERABLE — No role check
  - update: ❌ VULNERABLE — No role check
  - delete: ✅ OK

Current rules: No role check

Required: Teacher or above
Fix: Add !isStudentRole()

Test case (DENY):
  - Student creates exam → Should DENY
```

---

### 🚫 FAIL: `/quiz_results/{resultId}` (Subcollection) — NO OWNERSHIP CHECK
```
Collection: /subjects/{subjectId}/topics/{topicId}/quiz_results/{resultId}
Operations:
  - read: ⚠️ INSTITUTIONAL — No student/teacher distinction
  - write: ⚠️ INSTITUTIONAL — Student can modify own result

Current rules:
  allow read, write: if isSignedIn()
    && (isGlobalAdmin() || subjectInstitutionMatches(subjectId))

PROBLEM: Any institution member (student) can WRITE any result
  → Student can modify their grade

Required: 
  - Teacher/admin can read/write all results in subject
  - Student can read own result only, cannot write
  
Fix: Add role + ownership validation on write

Test case (DENY):
  - Student modifies their own quiz_results score → Should DENY
  - Teacher modifies student's quiz_results → Should ALLOW
```

---

### 🚫 FAIL: `/subjectInviteCodes/{inviteCodeKey}` — NO SUBJECT OWNERSHIP CHECK
```
Collection: /subjectInviteCodes/{inviteCodeKey}
Operations:
  - create: ⚠️ PARTIAL — createdBy == uid check, but no subject owner validation
  - read: ✅ OK (institution check)
  - update, delete: ✅ DENY (correct)

Current rules:
  allow create: if isSignedIn()
    && request.resource.data.createdBy == request.auth.uid  ← Only checks creator equals self
    && (isGlobalAdmin() || institution check)

PROBLEM: Student can create invite code for subject they don't own
  → Student creates invite code for teacher's subject → Teacher cannot control invites

Required: Only subject owner/teacher can create invite codes for subject
Fix: Validate createdBy owns the subject (or is teacher in institution for subject)

Test case (DENY):
  - Student creates invite code for another teacher's subject → Should DENY
  - Teacher creates invite code for own subject → Should ALLOW
```

---

### ⚠️ COMPLEX: `/shortcuts/{shortcutId}` — `|| true` BYPASS
```
Collection: /shortcuts/{shortcutId}
Operations:
  - create: ⚠️ VULNERABLE — || true fallback allows unvalidated shortcuts

Current rules:
  allow create: if isSignedIn()
    && validShortcutCreatePayload()
    && (
      request.resource.data.ownerId == request.auth.uid  ← Normal case: owner creates shortcut
      || (
        request.resource.data.ownerId != request.auth.uid
        && isTargetOwnerForCreate()
        && (
          targetSharedWithShortcutOwner()
          || true  ← 🚫 DANGEROUS: Allows ANY shortcut to ANY target
        )
      )
    )

PROBLEM: The || true allows creating shortcut for resource user doesn't have access to

Example attack:
  User A creates shortcut with ownerId=UserB, targetId=PrivateSubject
  → Shortcut creation succeeds even though UserB doesn't have access to PrivateSubject

Required: Remove the || true and enforce actual sharing validation
Fix: Require targetSharedWithShortcutOwner() OR isTargetOwnerForCreate()

Test case (DENY):
  - User creates shortcut for unshared/unowned target → Should DENY
```

---

### ✅ VERDICT: PASS (`/shortcuts/{shortcutId}` read/delete)
```
Read logic checks ownership + target ownership ✅
Delete logic checks ownership + target ownership ✅
```

---

### ✅ VERDICT: PASS (`/classes/{classId}`)
```
Operations:
  - create: Admin/institution-admin only ✅
  - read: Same institution ✅
  - update/delete: Admin/institution-admin only ✅

No role escalation possible
Vulnerability: None
```

---

### ✅ VERDICT: PASS (`/subject_class_requests/{requestId}`)
```
Operations:
  - create: Admin/institution-admin/teacher ✅ (good role check)
  - read: Admin/institution-admin or owner ✅
  - update/delete: Admin/institution-admin only ✅

No role escalation possible
Vulnerability: None
```

---

### ✅ VERDICT: PASS (`/courses/{courseId}`)
```
Operations:
  - create: Admin or same institution ⚠️ (broad) but no escalation risk
  - read: Same institution ✅
  - update/delete: Admin or same institution ✅

Vulnerability: None
```

---

### ✅ VERDICT: PASS (`/institutions/{institutionId}`)
```
Operations:
  - create/write: Admin only ✅
  - read: Signed-in (public read OK)  ✅
  - update: Institution manager only ✅
  - delete: Admin only ✅

No role escalation possible (institution field controls access)
Vulnerability: None
```

---

### ✅ VERDICT: PASS (`/institution_invites/{inviteId}`)
```
Operations:
  - create: Admin only OR institution-admin for own institution (limited to teacher role invites) ✅
  - read: Public (correct—code-based access)
  - delete: Owner, institution-admin, or user with email ✅

Role escalation prevented: Institution admin cannot create admin invites
Vulnerability: None
```

---

## Vulnerability Summary

| # | Collection | Operation | Vulnerability | Severity | Fix |
|---|---|---|---|---|---|
| 1 | `/subjects/{id}` | create | No `!isStudentRole()` | HIGH | Add role check |
| 2 | `/subjects/{id}` | update | `canWriteResource()` allows students | HIGH | Add explicit role check |
| 3 | `/subjects/.../topics/{id}` | write | No role check | HIGH | Add `!isStudentRole()` |
| 4 | `/topics/{topicId}` | create | No role check | HIGH | Add `!isStudentRole()` |
| 5 | `/topics/{topicId}` | update | No role check | HIGH | Add `!isStudentRole()` |
| 6 | `/documents/{id}` | create | No role check | HIGH | Add `!isStudentRole()` |
| 7 | `/documents/{id}` | update | No role check | HIGH | Add `!isStudentRole()` |
| 8 | `/quizzes/{id}` | create | No role check | HIGH | Add `!isStudentRole()` |
| 9 | `/quizzes/{id}` | update | No role check | HIGH | Add `!isStudentRole()` |
| 10 | `/exams/{id}` | create | No role check | HIGH | Add `!isStudentRole()` |
| 11 | `/exams/{id}` | update | No role check | HIGH | Add `!isStudentRole()` |
| 12 | `/quiz_results/{id}` | write | No ownership check; student can modify | MEDIUM | Add ownership + role check |
| 13 | `/subjectInviteCodes/{id}` | create | No subject owner validation | HIGH | Validate subject ownership |
| 14 | `/shortcuts/{id}` | create | `\|\| true` bypass | MEDIUM-HIGH | Remove bypass condition |
| 15 | `/subjects/{id}` | create | `sharedWithUids` not validated | MEDIUM-HIGH | Server-control field |

---

## Required Function Fixes

### 1. `canWriteResource()` Needs Role Check
**Current:**
```firestore
function canWriteResource(data) {
  return isGlobalAdmin()
    || sameInstitution(data)
    || (!hasInstitutionField(data) && isOwnerData(data));
}
```

**Problem:** `sameInstitution(data)` returns true for any institution member, including students

**Options:**
- Option A: Add role check inside function
- Option B: Add role check at call site (more explicit)

**Decision:** Add role check at call sites for maximum clarity

---

## Next Step

→ Proceed to **Phase 2: Priority 1 — Role-Based Access Control Hardening** (phase-2-priority1-fixes.md)
