# Architecture 04 — Student Management & Onboarding

> **Protocol:** ILHP v1.0.0 | **Domain:** Student Lifecycle  
> **Last Reviewed:** 2026-04-21 | **Status:** ✅ Current  
> **Depends On:** 01 (Auth), 02 (Institution Provisioning)  
> **Blocks:** 06 (Class Assignment), 07 (Content Access)

---

## 1. Scope

This architecture covers the complete lifecycle of a student in DLP Academy:
- Student registration via institutional access code
- Student profile creation
- Student role validation and capability restrictions
- Student visibility in institution admin panel
- Student access to subjects (via class enrollment or direct invite codes)
- Student dashboard and content access
- Student deletion

---

## 2. Files Involved

| File | Purpose |
|------|---------|
| `src/pages/Auth/hooks/useRegister.ts` | Student registration with institutional code |
| `src/pages/InstitutionAdminDashboard/hooks/useUsers.ts` | Student listing, deletion in admin panel |
| `src/utils/permissionUtils.ts` | Role checks (`isStudentRole`, `hasRequiredRoleAccess`) |
| `src/pages/StudentDashboard/` | Student-specific dashboard view |
| `firestore.rules` | Student access rules across all collections |
| `tests/e2e/home-sharing-roles.spec.ts` | Role-based access e2e tests |

---

## 3. Student Registration Flow

### 3.1 Institutional Code Registration

Students register using the institutional access code (not a personal invite). This is Path B from Architecture 01.

```typescript
// useRegister.ts:
// User selects userType: 'student'
// User enters verificationCode: 'LIA-TEST-2026'

// Cloud Function call:
const result = await validateInstitutionalAccessCode({ code: verificationCode })
// Returns: { institutionId: string, role: 'student' }
// OR if code maps to a teacher invite: { role: 'teacher' }
```

**Critical Observation:** The Cloud Function determines the role. For an institutional code, it should always return `role: 'student'` unless the code is scoped to teachers. Verify what role the function returns for the `LIA-TEST-2026` code.

### 3.2 Student User Document

```typescript
{
  uid: user.uid,
  firstName: 'Estudiante',
  lastName: 'Uno Test',
  displayName: 'Estudiante Uno Test',
  email: 'lia-student-1@prueba.dlp-test.internal',
  role: 'student',
  institutionId: '{correctInstitutionId}',
  createdAt: serverTimestamp(),
  settings: { theme: 'system', language: 'es', viewMode: 'grid' }
}
```

**Firestore Rule at Student Create:**
```firestore
// users/{uid} create:
// - request.resource.data.role == 'student'  ← or teacher/institutionadmin, NOT admin
// - request.auth.uid == uid
// The rule cannot verify the institutionId against the Cloud Function result
//   → This is a trust boundary: the client sets institutionId from the CF result
//   → A malicious client could set institutionId to any value
// Risk: Student self-assigns to a different institution
// Mitigation needed: Firestore rule should cross-check the invite/code document
```

---

## 4. Student Role Permissions

### 4.1 What Students CANNOT Do

```typescript
// permissionUtils.ts — ROLE_RANK['student'] === 0 (lowest)
```

| Action | Allowed |
|--------|---------|
| Create subjects | ❌ (Firestore rule: `isStudentRole()` → deny create on subjects) |
| Edit any subject | ❌ |
| Delete any subject | ❌ |
| Create topics | ❌ |
| Upload documents or materials | ❌ |
| Create quizzes | ❌ |
| Access institution admin dashboard | ❌ |
| Invite other users | ❌ |
| View users in their institution | ❌ |
| Read other students' quiz results | ❌ |

### 4.2 What Students CAN Do

| Action | Allowed |
|--------|---------|
| View subjects they are enrolled in | ✅ |
| View topics in their subjects | ✅ |
| View documents and materials | ✅ |
| Take quizzes | ✅ |
| View their own quiz results | ✅ |
| Self-enroll in a subject via invite code | ✅ (if `inviteCodeEnabled: true` and same institution) |
| Update their own profile settings | ✅ |

### 4.3 Student Subject Enrollment via Invite Code

```typescript
// Firestore rule (canStudentJoinSubjectByInvite):
// - isStudentRole()
// - sameInstitution(subject data)
// - subject.inviteCodeEnabled == true
// - Student adds self to:
//     sharedWithUids: arrayUnion(user.uid)
//     enrolledStudentUids: arrayUnion(user.uid)
```

**Critical Audit Check:** Can a student enroll in a subject from another institution by knowing the invite code? The `sameInstitution()` check in Firestore rules must prevent this. **Test this boundary explicitly in Phase 8 (step 8.12).**

---

## 5. Student Visibility in Institution Admin Panel

```typescript
// useUsers.ts — student query:
query(
  collection(db, 'users'),
  where('institutionId', '==', institutionId),
  where('role', '==', 'student'),
  limit(25)
)
```

Same pagination concern as teachers (Architecture 03). Only 25 students per page.

**Audit Check:** After all 5 test students register, verify they appear in the institution admin Users tab under the students section.

---

## 6. Student Access to Content

### 6.1 Via Class Enrollment (Primary Path)

Students are added to classes by the institution admin. Classes are linked to subjects. When a student is in a class, they can access all subjects linked to that class.

```typescript
// Subject access check involves:
// 1. Direct: subject.enrolledStudentUids contains student.uid
// 2. Via class: subject.classIds contains a classId that has student.uid in studentIds
```

**Critical Firestore Rule:**
```firestore
// subjects/{subjectId} read:
// Allow if:
//   - isOwner (subject.ownerId == uid)
//   - isEditor (subject.editorUids contains uid)
//   - isViewer (subject.viewerUids contains uid)
//   - isEnrolledStudent (subject.enrolledStudentUids contains uid)
//   - isInLinkedClass — does the rule check classIds? Or is this only app-level?
```

**Critical Risk:** If the Firestore rule for subject read only checks `enrolledStudentUids` and NOT class membership, students added to a class but not directly in `enrolledStudentUids` will be denied access at the Firestore level even if the app-level logic shows them the subject.

**Audit Check (Phase 6, step 6.13):** After adding Student 1 to Clase A Test (which is linked to Matemáticas Test), verify Student 1 can actually READ the `subjects/{id}` document via Firestore (not just see it in the UI — the UI may show subjects from cached queries).

### 6.2 Via Direct Invite Code (Secondary Path)

Student self-enrolls using the subject invite code. This adds them to `enrolledStudentUids` directly.

### 6.3 Topic and Content Access

```typescript
// topics/{topicId} read:
// Allow if user can read the parent subject
// (Firestore rule should inherit subject access check)
```

**Audit Check:** A student who is enrolled in a subject can read its topics. A student NOT enrolled cannot — even if they know the topic's document ID.

---

## 7. Student Quiz Interaction

### 7.1 Taking a Quiz

```typescript
// Quiz taking:
// Read: topics/{topicId}/quizzes/{quizId} — allowed for enrolled students
// Write quiz result: topics/{topicId}/quiz_results/{resultId}
// Result must have: uid: student.uid, quizId, answers, score, completedAt
```

**Firestore Rule to Verify:**
```firestore
// topics/{topicId}/quiz_results/{resultId} create:
// - request.auth.uid == request.resource.data.uid (student can only submit own results)
// - Student is enrolled in parent subject
// topics/{topicId}/quiz_results/{resultId} read:
// - Student reads own results only (uid == request.auth.uid)
// - Teacher/admin reads all results for their subject
```

**Critical Risk:** Can a student read other students' quiz results? Verify the Firestore rule on `quiz_results` restricts reads to own UID or teacher/admin only.

---

## 8. Known Failure Modes Summary

| ID | Failure | Severity | Trigger | Detection |
|----|---------|----------|---------|-----------|
| SM-01 | Student self-assigns to wrong institution via malicious client write | HIGH | Client overrides institutionId from CF result | Firestore rule trust boundary |
| SM-02 | Student can access subjects via class but Firestore rule denies (UI/DB mismatch) | CRITICAL | Firestore rule checks `enrolledStudentUids` only, not class membership | Students see subject in UI but get permission error loading content |
| SM-03 | Student can enroll in subject from different institution | CRITICAL | `sameInstitution()` not checked on invite code enrollment | Data leaks across institutions |
| SM-04 | Student can read other students' quiz results | HIGH | `quiz_results` Firestore rule missing UID filter | Privacy breach |
| SM-05 | Student not visible in admin panel (role casing mismatch) | MEDIUM | `role` stored as `'Student'` not `'student'` | Query misses students |
| SM-06 | Student can create content if enrolled in subject (UI allows but should not) | HIGH | Missing role check in content creation UI | Student POSTs to topics/documents |

---

## 9. Manual Check Sequence

Refer to **Phase 4** in [MASTER_CHECKLIST.md](../MASTER_CHECKLIST.md).

---

## 10. Automated Test Coverage

| Test File | Coverage |
|-----------|---------|
| `tests/e2e/home-sharing-roles.spec.ts` | Role-based home page access |
| `tests/e2e/auth.spec.ts` | Student signup |
| `tests/unit/utils/permissionUtils.test.ts` | Student role checks |

**Coverage Gaps:**
- No test for cross-institution invite code enrollment attempt
- No test for student attempting to write to `topics/` subcollections
- No test for student reading another student's `quiz_results`
- No test for `isInLinkedClass` check in Firestore rules vs. actual class enrollment

---

## 11. Validation Criteria

| Criterion | Method |
|-----------|--------|
| User doc has `role: 'student'` | Firestore query |
| User doc has correct `institutionId` | Firestore query |
| Student appears in admin Users tab | UI check |
| Student home page shows enrolled subjects only | UI check |
| Student cannot navigate to `/admin-dashboard` | Route redirect check |
| Student can take quiz and result is saved | Firestore subcollection check |
| Student cannot create subject (UI gate absent) | UI check |
| Student cannot create subject (Firestore rule denies) | Emulated Firestore test |

---

## 12. Security Boundary Analysis

| Boundary | Risk | Mitigation |
|---------|------|-----------|
| Student self-enrollment | Cross-institution enrollment via stolen code | `sameInstitution()` in Firestore invite code rule |
| Quiz result writes | Student submits results for another student's UID | Firestore rule: uid in result must match `request.auth.uid` |
| Content read access | Student reads unenrolled subject content | Firestore subject read rule must check enrollment |
| Role elevation | Student sets own role to teacher | Firestore rule: cannot update own role after creation |
| `institutionId` manipulation | Student assigns self to institution they chose | CF result should be trusted source; Firestore cross-check ideal |
