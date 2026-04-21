# Architecture 05 — Subject & Course Creation

> **Protocol:** ILHP v1.0.0 | **Domain:** Subject Lifecycle  
> **Last Reviewed:** 2026-04-21 | **Status:** ✅ Current  
> **Depends On:** 01 (Auth), 02 (Institution Provisioning), 03 (Teacher Management)  
> **Blocks:** 06 (Class Assignment), 07 (Content Management)

---

## 1. Scope

This architecture covers the complete lifecycle of subjects (courses) in DLP Academy:
- Subject creation by teacher or institution admin
- Atomic invite code generation (collision-safe)
- Subject scoping to institution and owner
- Subject settings: invite code, lifecycle policy, color/icon
- Subject visibility on home page
- Policy enforcement for teacher autonomous creation
- Subject deletion and post-course lifecycle

---

## 2. Files Involved

| File | Purpose |
|------|---------|
| `src/hooks/useSubjects.ts` | Subject CRUD operations, invite code generation, atomic creation |
| `src/utils/subjectAccessUtils.ts` | Access payload normalization, invite code generation algorithm |
| `src/utils/subjectValidation.ts` | Subject uniqueness checks |
| `src/utils/institutionPolicyUtils.ts` | `canTeacherCreateSubject()` policy gate |
| `src/utils/subjectPeriodLifecycleUtils.ts` | Academic year post-course policies |
| `firestore.rules` | `subjects` and `subjectInviteCodes` collection rules |
| `tests/unit/hooks/useSubjects.test.ts` | Subject hook unit tests |
| `tests/e2e/home-subject-crud.spec.ts` | Subject creation/edit/delete e2e tests |

---

## 3. Subject Document Structure (Firestore: `subjects` collection)

```typescript
{
  id: string,               // Auto-generated Firestore document ID

  // Core Identity
  name: string,             // "Matemáticas Test"
  course: string,           // REQUIRED: "Test Course LIA"
  level?: string,
  grade?: string,

  // Ownership & Scope
  ownerId: string,          // user.uid of creating teacher/admin
  uid?: string,             // Legacy field (same as ownerId)
  institutionId: string | null,  // null only for personal (non-institution) subjects

  // Invite System
  inviteCode: string,               // 8-char random string
  inviteCodeEnabled: boolean,       // Default: true
  inviteCodeRotationIntervalHours: number,  // 1-168, default 24
  inviteCodeLastRotatedAt: Timestamp,

  // Student Access
  enrolledStudentUids: string[],    // Direct UID enrollment
  sharedWithUids: string[],         // Also includes enrolled students
  classIds: string[],               // Linked class documents
  classId?: string,                 // Legacy single class

  // Sharing (Editor/Viewer model)
  editorUids?: string[],
  viewerUids?: string[],
  sharedWith?: Array<{ uid, email, role, canEdit }>,  // Legacy sharing

  // Presentation
  color: string,            // "from-blue-400 to-blue-600"
  icon: string,
  tags?: string[],
  cardStyle: 'default' | 'modern',
  modernFillColor?: string,

  // Lifecycle
  status?: 'active' | 'trashed',
  postCoursePolicy?: 'delete' | 'retain_all_no_join' | 'retain_teacher_only',

  // Metadata
  topicCount?: number,      // Incremented with each topic creation
  isShared?: boolean,
  createdAt: Timestamp,
  updatedAt?: Timestamp
}
```

---

## 4. Subject Creation Flow — Critical Path

### 4.1 Policy Gate Check

```typescript
// Before showing/executing create:
const institution = useInstitutionData()
const canCreate = canTeacherCreateSubject(institution)

// institutionPolicyUtils.ts:
export function canTeacherCreateSubject(institution): boolean {
  return institution.accessPolicies?.teachers
    ?.allowTeacherAutonomousSubjectCreation ?? false
}
```

**Critical Check:** The UI gate hides the creation button. But does the Firestore rule ALSO enforce this? If only the UI enforces it, a teacher with a Firestore client library can bypass the UI and write a subject document directly.

**Expected Firestore Rule (to verify):**
```firestore
// subjects/{subjectId} create:
// Allow if:
//   - isGlobalAdmin()
//   - isInstitutionAdmin() AND sameInstitution(request.resource.data)
//   - isTeacherRole()
//     AND sameInstitution(request.resource.data)
//     AND (canTeacherCreateSubjectForInstitution() OR not institution-scoped)
```

**Audit Check:** Can the policy enforcement be tested via Firestore rules tests (`tests/rules/`)? Verify a test exists for this scenario.

### 4.2 Payload Normalization

```typescript
// subjectAccessUtils.ts — normalizeSubjectAccessPayload(payload, user, institution):
{
  name: payload.name.trim(),
  course: payload.course,                  // REQUIRED — fails if absent
  institutionId: user.institutionId,       // Always scoped to user's institution
  ownerId: user.uid,
  enrolledStudentUids: payload.enrolledStudentUids ?? [],
  sharedWithUids: payload.sharedWithUids ?? [],
  classIds: payload.classIds ?? [],
  color: payload.color ?? 'from-blue-400 to-blue-600',
  icon: payload.icon ?? 'book',
  cardStyle: payload.cardStyle ?? 'default',
  inviteCodeEnabled: payload.inviteCodeEnabled ?? true,
  inviteCodeRotationIntervalHours: payload.inviteCodeRotationIntervalHours ?? 24
}
```

**Failure Mode:** `course` field is required by the data structure but may not be validated in the form before submission. If `course` is an empty string, the subject is created with an empty course — this could affect class assignment and display later.

### 4.3 Invite Code Generation Algorithm

```typescript
// subjectAccessUtils.ts:
const INVITE_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
// (Note: no I, O, 0, 1 to avoid visual confusion)

function generateInviteCode(length = 8): string {
  return Array.from({ length }, () => 
    INVITE_CODE_ALPHABET[Math.floor(Math.random() * INVITE_CODE_ALPHABET.length)]
  ).join('')
}
```

Code space: 32^8 = 1,099,511,627,776 possible codes. Collision probability is very low but handled with retry logic.

### 4.4 Atomic Transaction (Collision-Safe Creation)

```typescript
// useSubjects.ts — addSubject():
await runTransaction(db, async (transaction) => {
  let attempts = 0
  let code = generateInviteCode()
  
  // Up to 10 collision retries
  while (attempts < 10) {
    const codeRef = doc(db, 'subjectInviteCodes', `${institutionId}_${code}`)
    const codeSnap = await transaction.get(codeRef)
    
    if (!codeSnap.exists()) break  // Code is available
    code = generateInviteCode()    // Collision: regenerate
    attempts++
  }
  
  if (attempts >= 10) throw new Error('Failed to generate unique invite code')
  
  // Atomic writes:
  const subjectRef = doc(collection(db, 'subjects'))
  transaction.set(subjectRef, {
    ...normalizedPayload,
    inviteCode: code,
    createdAt: serverTimestamp()
  })
  
  transaction.set(codeRef, {
    subjectId: subjectRef.id,
    institutionId,
    createdAt: serverTimestamp()
  })
})
```

**Critical Observations:**
1. The transaction is atomic — subject and code doc are created together or not at all
2. Up to 10 retries for collision — with 1 trillion code space, this should never be needed in practice
3. The code document ID is `{institutionId}_{code}` — this means the same code string could exist for different institutions (they have different document IDs), which is correct behavior
4. Firestore `subjectInviteCodes` must deny student-accessible reads except for the joining flow

**Failure Mode:** Transaction exceeds Firestore's max transaction time → throws error. The UI must catch and surface this. Verify the error handling in `useSubjects.ts`.

---

## 5. Subject Visibility

### 5.1 Teacher's Own Subjects

Subjects appear on the home page when:
- `subject.ownerId === user.uid` OR
- `subject.editorUids` contains user.uid OR  
- `subject.viewerUids` contains user.uid OR
- `subject.institutionId === user.institutionId` (institution-wide visibility, depending on rules)

**Audit Check:** After Teacher A creates Matemáticas Test, does it appear on Teacher A's home page immediately (optimistic update)? Does it appear after refresh?

### 5.2 Institution Admin's View

Institution admin can see subjects created within their institution (all of them, not just their own). The Firestore rule must allow this read.

---

## 6. Subject Invite Code Rotation

```typescript
// Subject invite codes auto-rotate based on inviteCodeRotationIntervalHours
// Rotation triggered when: current time > inviteCodeLastRotatedAt + interval
// On rotation:
//   1. Generate new code
//   2. Atomic transaction: delete old subjectInviteCodes doc + create new one + update subject
```

**Audit Check:** Test that after rotation, the old code no longer works for enrollment. Test that the new code does.

---

## 7. Subject Deletion

```typescript
// Deletion rules:
// canDeleteSubjectsWithStudents: false → cannot delete if subject has enrolledStudentUids.length > 0
// This is enforced by: institutionPolicyUtils.canDeleteSubjectWithStudents(institution, subject)
```

**Audit Check (Phase 5, step 5.10):** With `canDeleteSubjectsWithStudents: false` and students enrolled, verify teacher cannot delete the subject via UI. Verify Firestore rule also denies this write.

---

## 8. Known Failure Modes Summary

| ID | Failure | Severity | Trigger | Detection |
|----|---------|----------|---------|-----------|
| SC-01 | Transaction failure (subject + invite code not created) | CRITICAL | Network drop during transaction | No subject appears, error in console |
| SC-02 | `course` field empty — subject created without required data | MEDIUM | Missing form validation | Class assignment UI may break later |
| SC-03 | Policy gate UI-only (Firestore doesn't enforce it) | HIGH | Teacher writes subject via direct Firestore client | Subject created bypassing policy |
| SC-04 | Invite code collision after 10 retries | LOW | Extreme load / many subjects in institution | Generic error, no retry guidance |
| SC-05 | Old invite code still works after rotation | HIGH | Rotation logic doesn't delete old code atomically | Students join with expired code |
| SC-06 | Subject not visible after creation (home page stale) | MEDIUM | Cache not invalidated after addSubject | Teacher doesn't see own new subject |
| SC-07 | `subjectInviteCodes` doc with different casing | HIGH | Code stored in wrong case format | Invite code lookups fail |

---

## 9. Manual Check Sequence

Refer to **Phase 5** in [MASTER_CHECKLIST.md](../MASTER_CHECKLIST.md).

---

## 10. Automated Test Coverage

| Test File | Coverage |
|-----------|---------|
| `tests/unit/hooks/useSubjects.test.ts` | Subject hook logic |
| `tests/e2e/home-subject-crud.spec.ts` | Subject CRUD in UI |
| `tests/rules/` | Firestore rules for subjects (verify if exists) |

**Coverage Gaps:**
- No test for `course` field being empty on creation
- No test for invite code rotation atomicity (old code invalidated)
- No test for `canDeleteSubjectsWithStudents` Firestore rule enforcement
- No test for race condition in invite code generation (concurrent creates)

---

## 11. Validation Criteria

| Criterion | Method |
|-----------|--------|
| Subject document created | Firestore `subjects/{id}` query |
| `inviteCode` is 8 characters, correct alphabet | Direct field check |
| `subjectInviteCodes/{institutionId}_{code}` exists | Firestore query |
| `ownerId` matches creating user's UID | Field comparison |
| `institutionId` matches institution | Field comparison |
| Subject appears on creator's home page | UI check |
| Invite code is unique across all subjects | Query for duplicate codes |
| Policy gate blocks teacher when disabled | UI + Firestore test |

---

## 12. Security Boundary Analysis

| Boundary | Risk | Mitigation |
|---------|------|-----------|
| Invite code guessing | 32^8 space makes brute force impractical | Also `sameInstitution()` check on enrollment |
| Teacher bypasses creation policy | Direct Firestore write | Firestore rule must also enforce institution policy |
| Subject created in wrong institution | `institutionId` set to different value | Rule must verify `institutionId == currentUserInstitutionId()` |
| Invite code reuse after expiry | Student uses old rotated code | Rotation must atomically remove old code from `subjectInviteCodes` |
| Deletion with enrolled students | Data integrity risk | `canDeleteSubjectsWithStudents` policy + Firestore rule check |
