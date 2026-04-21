# Architecture 08 — Permission Boundaries & Multi-Tenant Isolation

> **Protocol:** ILHP v1.0.0 | **Domain:** Security & Permissions (Cross-Cutting)  
> **Last Reviewed:** 2026-04-21 | **Status:** ✅ Current  
> **Depends On:** All architectures (cross-cutting concern)  
> **Blocks:** Nothing (validation layer — applies to all other architectures)

---

## 1. Scope

This is the **security validation architecture** for the entire platform. It does not describe a feature — it describes the boundaries, rules, and checks that must hold true regardless of what feature is being used. Every LIA must execute Phase 8 of the Master Checklist to validate these boundaries have not been broken.

Covers:
- Role hierarchy enforcement (all 4 roles)
- Multi-tenant data isolation (Firestore rules `sameInstitution()`)
- Privilege escalation prevention
- Cross-institution data access prevention
- Unauthenticated access prevention
- Client-side bypass scenarios (direct Firestore writes)
- Invite code security (reuse prevention, cross-institution)
- Student data privacy (quiz results, personal data)

---

## 2. Files Involved

| File | Purpose |
|------|---------|
| `src/utils/permissionUtils.ts` | Client-side permission checks (UI gates) |
| `src/utils/securityUtils.ts` | Security helpers |
| `firestore.rules` | Server-side enforcement (authoritative) |
| `storage.rules` | Firebase Storage access control |
| `tests/rules/` | Firestore rules unit tests |
| `tests/e2e/admin-guardrails.spec.ts` | Admin access restriction e2e tests |
| `tests/e2e/home-sharing-roles.spec.ts` | Role-based access e2e tests |

---

## 3. Role Hierarchy

```typescript
// permissionUtils.ts
const ROLE_RANK = {
  student: 0,        // Read-only enrolled content
  teacher: 1,        // Create/manage own content
  institutionadmin: 2,  // Manage institution users, settings, all subjects
  admin: 3           // Global — full access to everything
}
```

**Firestore Role String Values (must be exact):**
- `'student'`
- `'teacher'`
- `'institutionadmin'` (lowercase, no space, no hyphen)
- `'admin'`

**Critical Risk:** Any inconsistency in role string casing (e.g., `'Teacher'`, `'InstitutionAdmin'`) will cause:
- Firestore rules to fail the role check → access denied unexpectedly
- Client-side ROLE_RANK lookup to return `undefined` → rank comparison fails
- User list queries to miss users (query uses exact string match)

---

## 4. Firestore Rules Architecture

### 4.1 Core Helper Functions

```firestore
// Read current user's role from users collection:
function currentUserRole() {
  return get(/databases/{database}/documents/users/{request.auth.uid}).data.role
}

// Read current user's institutionId:
function currentUserInstitutionId() {
  return get(/databases/{database}/documents/users/{request.auth.uid}).data.institutionId
}

// Role checks:
function isGlobalAdmin() { return currentUserRole() == 'admin' }
function isInstitutionAdmin() { return currentUserRole() == 'institutionadmin' }
function isTeacherRole() { return currentUserRole() == 'teacher' }
function isStudentRole() { return currentUserRole() == 'student' }

// Multi-tenant isolation:
function sameInstitution(data) {
  return currentUserInstitutionId() != null 
    && data.institutionId == currentUserInstitutionId()
}

// Minimum role check:
function hasMinimumRole(minRole) {
  return ROLE_RANK[currentUserRole()] >= ROLE_RANK[minRole]
  // NOTE: ROLE_RANK may not be defined in Firestore rules the same way as client
  //       Verify how minimum role is implemented in actual rules file
}
```

**Performance Note:** `currentUserRole()` and `currentUserInstitutionId()` both perform `get()` calls that read from the `users` collection. Each call in a rule evaluation counts toward Firestore reads. In complex rules with multiple permission checks, this can result in many redundant reads. Verify if the rules cache these calls or if they are repeated.

### 4.2 Key Permission Boundaries Per Collection

#### `users/{uid}`

```
CREATE:
  - Only self (request.auth.uid == uid)
  - role must NOT be 'admin' (client cannot self-assign global admin)
  - institutionId must match what the invite code resolved (trust boundary — not verified by rule against invite doc)

READ:
  - Self (own profile)
  - Global admin (any user)
  - InstitutionAdmin (users in same institution only)
  - Teachers cannot read other users' profiles (only own)

UPDATE:
  - Self: only name/settings fields (cannot change own role or institutionId)
  - InstitutionAdmin: can update user role within their institution (cannot promote to admin or institutionadmin)
  - Teachers: can update student badges only
  - GlobalAdmin: full update

DELETE:
  - GlobalAdmin or InstitutionAdmin of same institution
```

**Critical Check: Role Promotion Attack Vector**

Can an institutionadmin promote a user to `admin`?
```firestore
// users/{uid} update — must verify:
// If updater is institutionadmin:
//   - Cannot set role to 'admin'
//   - Cannot set role to 'institutionadmin' (cannot create more admins)
//   - Cannot change institutionId to different institution
```

**Audit Check (Phase 8, step 8.5):** In emulator, simulate an `updateDoc` to `users/{uid}` with `{role: 'admin'}` while authenticated as institutionadmin. Verify Firestore denies this write.

---

#### `subjects/{subjectId}`

```
CREATE:
  - Not students
  - Same institution (if institution-scoped subject)
  - If teacher: must check institution policy (allowTeacherAutonomousSubjectCreation)

READ:
  - Owner (ownerId)
  - Editors (editorUids)
  - Viewers (viewerUids)
  - Enrolled students (enrolledStudentUids)
  - InstitutionAdmin of same institution
  - GlobalAdmin

UPDATE:
  - Owner
  - Editor
  - InstitutionAdmin of same institution

DELETE:
  - Owner
  - InstitutionAdmin of same institution
  - Must check canDeleteSubjectsWithStudents policy
```

**Critical Cross-Institution Check:**
Can a user from Institution A read subjects from Institution B if they know the document ID?

```firestore
// subjects/{subjectId} read MUST deny:
// - Any user where data.institutionId != user.institutionId
//   UNLESS user is in owner/editor/viewer lists
//   UNLESS user is global admin
```

**Audit Check (Phase 8, step 8.2):** With emulator, attempt to read a subject from Institution B while authenticated as a user from Institution A (not in the subject's access lists). Rule must deny.

---

#### `institution_invites/{inviteId}`

```
CREATE:
  - InstitutionAdmin of the institutionId on the invite doc
  - GlobalAdmin

READ:
  - Self (if email matches)
  - InstitutionAdmin of same institution
  - GlobalAdmin

DELETE:
  - Auto-deleted after use (client-side cleanup)
  - Admins can delete
```

**Critical Security Check:** Can any authenticated user CREATE an invite document and give themselves `role: 'institutionadmin'` or `role: 'teacher'`?

```firestore
// institution_invites create:
// MUST require isInstitutionAdmin() OR isGlobalAdmin()
// Student and teacher MUST NOT be able to create invites
```

**Audit Check (Phase 8, step 8.9):** Simulate a create write to `institution_invites` while authenticated as a student. Firestore rule must deny.

---

#### `classes/{classId}`

```
CREATE:
  - InstitutionAdmin of same institution
  - GlobalAdmin

READ:
  - InstitutionAdmin of same institution
  - Teachers in same institution (to see their assigned classes)
  - GlobalAdmin

UPDATE:
  - InstitutionAdmin of same institution (student management)
  - GlobalAdmin

DELETE:
  - InstitutionAdmin of same institution
  - GlobalAdmin
```

**Critical Check:** Can a teacher add themselves to a class by modifying `studentIds`? Or worse, can a student add themselves to a class?

---

#### `topics/{topicId}`

```
CREATE:
  - Non-students in same institution as parent subject
  - Specifically: teacher who owns or edits the subject

READ:
  - Anyone who can read the parent subject (subject access check must propagate)

UPDATE:
  - Owner/editor of parent subject

DELETE:
  - Owner/editor of parent subject
  - InstitutionAdmin of same institution
```

**Critical Implementation Gap:** Firestore rules cannot perform cross-collection joins in a single check. To verify that a student can read `topics/{topicId}`, the rule must check if the student is in `subjects/{topics.subjectId}.enrolledStudentUids`. This requires a `get()` call on the subject document.

Verify the `topics` read rule actually performs this subject-level enrollment check.

---

#### `topics/{topicId}/quiz_results/{resultId}`

This is the highest-risk subcollection from a privacy standpoint.

```
CREATE:
  - Only students enrolled in parent subject
  - request.resource.data.uid MUST equal request.auth.uid

READ:
  - Student reads ONLY their own (data.uid == request.auth.uid)
  - Teacher/admin reads all for their institution's subjects

DELETE:
  - GlobalAdmin
  - InstitutionAdmin
  - NOT by the student who created it (results must be immutable)
```

---

## 5. Unauthenticated Access

```firestore
// Top-level rule:
// If request.auth == null → deny ALL reads and writes across ALL collections
```

**Audit Check (Phase 8, step 8.8):** Using the Firebase emulator REST API, attempt unauthenticated reads on `subjects/`, `users/`, `topics/`. All must return 403 or PERMISSION_DENIED.

---

## 6. Security Risks Summary (All Architectures)

This section consolidates all security risks identified across all 8 architectures for the global `security-risks-registry.md`.

| ID | Risk | Collection/Feature | Severity | Architecture Ref |
|----|------|-------------------|----------|-----------------|
| SEC-01 | Role field set to `admin` client-side during signup | `users` create | CRITICAL | 01 |
| SEC-02 | Invite not deleted after use → reusable | `institution_invites` | HIGH | 01 |
| SEC-03 | Student can set arbitrary `institutionId` during registration | `users` create | HIGH | 04 |
| SEC-04 | InstitutionAdmin promotes user to `admin` | `users` update | CRITICAL | 08 |
| SEC-05 | Teacher creates subject bypassing institution policy | `subjects` create | HIGH | 05 |
| SEC-06 | Student enrolls in subject from different institution | `subjects` update | CRITICAL | 04, 05 |
| SEC-07 | Student reads another student's quiz_results | `quiz_results` read | HIGH | 07 |
| SEC-08 | Student submits quiz_result attributed to another UID | `quiz_results` create | CRITICAL | 07 |
| SEC-09 | Cross-institution subject read (direct document ID) | `subjects` read | CRITICAL | 08 |
| SEC-10 | Teacher or student creates invite for self-promotion | `institution_invites` create | HIGH | 03, 08 |
| SEC-11 | Unauthenticated Firestore read on any collection | All | CRITICAL | 08 |
| SEC-12 | `sameInstitution()` fails for user with `null` institutionId | All institution-scoped | CRITICAL | 02 |
| SEC-13 | Google OAuth domain auto-assigns wrong institution | `users` create | HIGH | 01 |
| SEC-14 | Storage file accessible without subject enrollment | Firebase Storage | HIGH | 07 |
| SEC-15 | Class archived but students retain subject access | `classes`, `subjects` | MEDIUM | 06 |
| SEC-16 | Orphaned Firebase Auth account (no Firestore user doc) | Firebase Auth | HIGH | 01 |
| SEC-17 | Institutional code has no `type: 'institutional'` field | `institution_invites` | HIGH | 02 |

---

## 7. LIA Phase 8 Execution Guide

Each Phase 8 step maps to a specific security check:

| Step | Security Risk Tested |
|------|---------------------|
| 8.1 | Student route guards (UI-level) |
| 8.2 | Cross-institution subject read (SEC-09) |
| 8.3 | Teacher route guard (repeat of Phase 3 final check) |
| 8.4 | Teacher cannot modify institution settings |
| 8.5 | InstitutionAdmin cannot promote to admin (SEC-04) |
| 8.6 | InstitutionAdmin cross-institution user query |
| 8.7 | Cross-institution subject assignment |
| 8.8 | Unauthenticated Firestore access (SEC-11) |
| 8.9 | Role field client-side manipulation (SEC-01) |
| 8.10 | Used invite reuse prevention (SEC-02) |
| 8.11 | Invite code collision atomicity |
| 8.12 | Cross-institution invite code enrollment (SEC-06) |

---

## 8. Known Failure Modes Summary

| ID | Failure | Severity | Trigger |
|----|---------|----------|---------|
| PB-01 | Firestore rule allows `admin` role on client create | CRITICAL | Missing role check in users create rule |
| PB-02 | `sameInstitution()` returns true for null institutionId users | CRITICAL | Null check fails in rule function |
| PB-03 | Rule performs redundant get() calls → performance issue | LOW | Complex rules with multiple role checks |
| PB-04 | Client-side permission check differs from Firestore rule | HIGH | Role normalization mismatch |
| PB-05 | Storage rules allow reads without enrollment check | HIGH | Overly permissive storage.rules |

---

## 9. Automated Test Coverage

| Test File | Coverage |
|-----------|---------|
| `tests/rules/` | Firestore rules unit tests (if present) |
| `tests/e2e/admin-guardrails.spec.ts` | Admin access restrictions |
| `tests/e2e/home-sharing-roles.spec.ts` | Role-based subject access |
| `tests/unit/utils/permissionUtils.test.ts` | Client-side permission utility checks |

**Coverage Gaps:**
- Rules tests in `tests/rules/` — verify they cover ALL 17 SEC-* risks above
- No test for `null` institutionId behavior in `sameInstitution()` rule function
- No test for unauthenticated REST API reads
- No test for cross-institution quiz_results read attempt
- No test for direct Firestore write to create self-promoting invite

---

## 10. Validation Criteria

| Criterion | Method |
|-----------|--------|
| Student cannot create subjects | Firestore emulated write test |
| Student cannot access other institution's subjects | Firestore emulated read test |
| InstitutionAdmin cannot promote to admin | Firestore emulated write test |
| Unauthenticated reads denied on all collections | Firestore REST API test |
| Invite code reuse prevented | Attempt second signup with consumed invite |
| Cross-institution invite code enrollment denied | Use Institution A code while logged into Institution B |
| Student reads only own quiz results | Firestore query with student auth |

---

## 11. Security Boundary Summary

This architecture is the final verification layer. If all previous architectures pass their LIA checks but Phase 8 finds a violation, the platform has a security regression. Security regressions are categorized as **CRITICAL** by default regardless of apparent exploitability.

The `logs/security-risks-registry.md` global log must be updated with every finding from Phase 8, even if the risk is known and mitigated.
