# Architecture 03 — Teacher Management & Onboarding

> **Protocol:** ILHP v1.0.0 | **Domain:** Teacher Lifecycle  
> **Last Reviewed:** 2026-04-21 | **Status:** ✅ Current  
> **Depends On:** 01 (Auth), 02 (Institution Provisioning)  
> **Blocks:** 05 (Subject Creation), 06 (Class Assignment), 07 (Content Management)

---

## 1. Scope

This architecture covers the full lifecycle of a teacher in DLP Academy:
- Institution admin invites a teacher
- Teacher registers using the invite
- Teacher's role and institution assignment
- Teacher's access rights and restrictions
- Teacher visibility in institution admin panel
- Teacher deletion
- Teacher dashboard and subject creation capability

---

## 2. Files Involved

| File | Purpose |
|------|---------|
| `src/pages/InstitutionAdminDashboard/hooks/useUsers.ts` | Teacher invitation, listing, deletion |
| `src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx` | Users tab hosting teacher management UI |
| `src/pages/Auth/hooks/useRegister.ts` | Teacher registration with invite code |
| `src/utils/permissionUtils.ts` | Role checks (`isTeacherRole`, `hasRequiredRoleAccess`) |
| `src/utils/institutionPolicyUtils.ts` | Policy checks (e.g., teacher subject creation permission) |
| `firestore.rules` | `users`, `institution_invites`, `subjects` rules for teacher role |
| `tests/unit/utils/permissionUtils.test.ts` | Permission utility unit tests |

---

## 3. Teacher Invitation Flow

### 3.1 Invite Creation

**File:** `useUsers.ts` — `handleAddUser(email: string)`

```typescript
// Validation:
// 1. Check email format (regex or basic check)
// 2. Check if email already invited (query institution_invites)
// 3. Check if email already registered as a user in this institution

// Create invite document:
await addDoc(collection(db, 'institution_invites'), {
  email: email.trim().toLowerCase(),
  role: 'teacher',
  institutionId: effectiveInstitutionId,
  invitedAt: serverTimestamp()
})
```

**Failure Mode — Duplicate Invite:** If a teacher is invited twice, two `institution_invites` documents exist for the same email. `useRegister.ts` fetches invite by document ID, not by email query. If the teacher enters a specific invite ID, only one is consumed. The other remains dangling.

**Failure Mode — Email Already Registered:** If the invited email belongs to an existing user in another institution, the invite should be blocked or clearly flagged. Verify the check exists and is enforced.

**Failure Mode — Missing `institutionId` on invite:** If `effectiveInstitutionId` is `null` at time of invite creation, the teacher will have `institutionId: null` after registration. They can log in but will see no institution data and will be effectively locked out.

### 3.2 Invite Visibility

After creating the invite, the teacher should appear in a "pending invites" section of the Users tab, OR the invite email should trigger an external notification.

**Audit Check:** After creating the invite, is there any UI feedback showing the invite was sent? Is there a way to resend or cancel the invite?

---

## 4. Teacher Registration Flow

Same base flow as Architecture 01 (useRegister.ts), but with `role: 'teacher'` resolved from the invite.

### 4.1 Invite Lookup for Teacher

```typescript
// useRegister.ts — Path A (direct invite):
const inviteRef = doc(db, 'institution_invites', inviteId)
const inviteSnap = await getDoc(inviteRef)

// If invite.type !== 'institutional':
// → validate invite.email === entered email (exact match, case-sensitive after normalization)
// → resolve role: invite.role ('teacher')
// → resolve institutionId: invite.institutionId
```

**Critical Failure Mode — Email Case Mismatch:** Invite is created with `email: 'teacher@school.com'`. User registers with `TEACHER@school.com`. The email comparison must be case-insensitive (both normalized to lowercase). If not, validation fails.

Verify: in `useRegister.ts`, is the entered email normalized to lowercase before comparing against `invite.email`?

### 4.2 Firestore User Document for Teacher

```typescript
{
  uid: user.uid,
  firstName: 'Profesora',
  lastName: 'García Test',
  displayName: 'Profesora García Test',
  email: 'lia-teacher-a@prueba.dlp-test.internal',
  role: 'teacher',                          // ← from invite
  institutionId: '{correctInstitutionId}',  // ← from invite
  createdAt: serverTimestamp(),
  settings: { theme: 'system', language: 'es', viewMode: 'grid' }
}
```

**Firestore Rule Enforcement at Create:**
```firestore
// users/{uid} create:
// - Only self (request.auth.uid == uid)
// - role must be in ['student', 'teacher', 'institutionadmin'] — not 'admin'
// - Cannot self-assign a role higher than what the invite grants
//   (The rule trusts the invite validation in useRegister.ts — this is a trust boundary)
```

**Risk:** The Firestore rule does not verify that the `role` value in the user document matches what the invite says. It only checks the role is not `admin`. A malicious user could theoretically set `role: 'institutionadmin'` in the write payload even if their invite says `teacher`. Verify the Firestore rule explicitly checks the role value against the invite document.

---

## 5. Teacher Role Permissions

### 5.1 Role Hierarchy Value

```typescript
// permissionUtils.ts
ROLE_RANK = {
  student: 0,
  teacher: 1,
  institutionadmin: 2,
  admin: 3
}
```

### 5.2 What Teachers Can Do

| Action | Allowed |
|--------|---------|
| Create subjects (if policy allows) | ✅ |
| Edit own subjects | ✅ |
| Delete own subjects (without students if policy enforced) | ✅ / ❌ depends on policy |
| View and manage own topics and content | ✅ |
| Create quizzes | ✅ |
| Invite students to subjects (via invite code) | ✅ |
| View students in own subjects | ✅ |
| View institution admin dashboard | ❌ |
| Invite other teachers | ❌ |
| Modify institution settings | ❌ |
| Access other institution's data | ❌ |

### 5.3 Subject Creation Gate

```typescript
// institutionPolicyUtils.ts
export function canTeacherCreateSubject(institution: Institution): boolean {
  return institution.accessPolicies?.teachers
    ?.allowTeacherAutonomousSubjectCreation ?? false
}
```

If this returns `false`, the UI must hide the subject creation button AND the Firestore rule must also deny the create.

**Audit Check:** Does the Firestore `subjects` create rule also check this policy? Or does it only rely on the UI gate? A Firestore-only check or a UI-only check is weaker than both.

---

## 6. Teacher Visibility in Institution Admin Panel

```typescript
// useUsers.ts — teacher query:
query(
  collection(db, 'users'),
  where('institutionId', '==', institutionId),
  where('role', '==', 'teacher'),
  limit(25)
)
```

**Pagination Note:** Only 25 teachers loaded initially. If institution has more, pagination must work.

**Audit Check:**
1. After Teacher A and B register, log into institution admin dashboard
2. Navigate to Users tab → Teachers section
3. Both teachers must appear
4. Teacher display should show: displayName, email, role badge

**Failure Mode:** `role` field in Firestore is stored differently than what the query expects. For example, if a teacher was registered with `role: 'Teacher'` (wrong casing) instead of `role: 'teacher'` (lowercase), the query will miss them. Verify role normalization is applied at write time.

---

## 7. Teacher Deletion

**File:** `useUsers.ts`

```typescript
// Deletion flow:
// 1. Remove user document from users/{uid}
// 2. May need to orphan or reassign teacher's subjects
// 3. Remove from institution's admin list if applicable

// Firestore rule for users/{uid} delete:
// Only global admin OR institutionadmin of same institution
```

**Critical Failure Mode — Orphaned Subjects:** If a teacher is deleted but their subjects remain with `ownerId: deletedTeacherUid`, those subjects become inaccessible to any teacher. Only the institution admin (or global admin) could manage them. The deletion flow must handle this.

**Audit Check:** Verify the deletion UI shows a confirmation dialog. Verify the institution admin cannot accidentally delete the wrong user.

---

## 8. Known Failure Modes Summary

| ID | Failure | Severity | Trigger | Detection |
|----|---------|----------|---------|-----------|
| TM-01 | Teacher invite created with `null` institutionId | CRITICAL | `effectiveInstitutionId` not resolved | Teacher registers with no institution |
| TM-02 | Email case mismatch in invite validation | HIGH | User enters different case than invited | Registration fails with cryptic error |
| TM-03 | Duplicate invite docs not cleaned up | MEDIUM | Multiple invites for same email | Dangling invite docs in Firestore |
| TM-04 | Teacher role can be elevated to `institutionadmin` at client | HIGH | Malicious payload in useRegister.ts write | Firestore rule must explicitly check |
| TM-05 | Teacher not visible in admin panel (role casing mismatch) | HIGH | `role` stored with wrong casing | Query misses teachers |
| TM-06 | Orphaned subjects after teacher deletion | HIGH | No reassignment logic on delete | Subjects inaccessible to institution |
| TM-07 | Teacher can create subjects when policy disables it | HIGH | Firestore rule doesn't check institution policy | Teacher bypasses UI gate via direct Firestore write |

---

## 9. Manual Check Sequence

Refer to **Phase 3** in [MASTER_CHECKLIST.md](../MASTER_CHECKLIST.md).

---

## 10. Automated Test Coverage

| Test File | Coverage |
|-----------|---------|
| `tests/unit/utils/permissionUtils.test.ts` | Role rank comparison, hasRequiredRoleAccess |
| `tests/e2e/auth.spec.ts` | Teacher signup flow |
| `tests/e2e/admin-guardrails.spec.ts` | Teacher access restrictions |

**Coverage Gaps:**
- No test for duplicate teacher invite handling
- No test for teacher role elevation attempt via malicious payload
- No test for teacher deletion and subject orphan behavior
- No test for teacher visibility query when role casing is inconsistent

---

## 11. Validation Criteria

| Criterion | Method |
|-----------|--------|
| Invite document created | `institution_invites` Firestore query |
| Invite has `role: 'teacher'` and `institutionId` | Direct doc check |
| After registration: `users/{uid}.role === 'teacher'` | Firestore query |
| After registration: `users/{uid}.institutionId` is correct | Firestore query |
| Teacher appears in institution admin Users tab | UI check |
| Teacher cannot access `/institution-admin-dashboard` | Browser redirect check |
| Invite document deleted after use | `institution_invites/{id}` no longer exists |
| Teacher can create a subject (if policy allows) | UI action + Firestore verify |

---

## 12. Security Boundary Analysis

| Boundary | Risk | Mitigation |
|---------|------|-----------|
| Teacher creates own invite | Teacher should not create invites for others | Firestore rule: only institutionadmin/admin can write to `institution_invites` |
| Teacher sets own `institutionId` | Teacher could self-assign to a different institution | Firestore rule: user doc create institutionId must match invite's institutionId |
| Teacher reads another institution's users | Data leak | `sameInstitution()` in Firestore rules on `users/` read |
| Teacher impersonates `institutionadmin` | Privilege escalation | Firestore rule: role at create cannot exceed what invite grants |
