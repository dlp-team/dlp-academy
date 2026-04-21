# Architecture Index — Institution Lifecycle Health Protocol

> **Last Updated:** 2026-04-21

This document is the navigation hub for all architecture documents in the ILHP system. Each architecture covers one domain of the platform with exhaustive code-level precision.

---

## Dependency Order

Architecture documents must be understood in sequential order — each domain depends on the ones before it. A failure in an early architecture **blocks** all downstream ones.

```
01-auth-signup-login
    └── 02-institution-provisioning
            └── 03-teacher-management
            │       └── 05-subject-creation
            │               └── 06-class-teacher-assignment
            │                       └── 07-content-management
            └── 04-student-management
                    └── 07-content-management (student access)
                            └── 08-permission-boundaries (cross-cuts all)
```

---

## Architecture Documents

### [01 — Authentication & Sign-In Flows](architectures/01-auth-signup-login.md)
**Domain:** User registration, login, email verification, Google OAuth, session persistence, password reset  
**Files:** `useRegister.ts`, `useLogin.ts`, `Login.tsx`, `Register.tsx`, `EmailVerificationPage.tsx`, `firebase/config.ts`, `accessCodeService.ts`  
**Critical Gate:** All other architectures depend on this. If authentication is broken, nothing else can be tested.

---

### [02 — Institution Provisioning](architectures/02-institution-provisioning.md)
**Domain:** Global admin creates institution, institution document structure, invite system, institution admin dashboard access  
**Files:** `AdminDashboard.tsx`, `adminInstitutionBatchQueueUtils.ts`, `InstitutionAdminDashboard.tsx`, `useInstitutionBranding.ts`  
**Critical Gate:** Blocks architectures 03, 04, 05, 06, 07.

---

### [03 — Teacher Management & Onboarding](architectures/03-teacher-management.md)
**Domain:** Teacher invitation flow, teacher signup with invite code, teacher role validation, teacher dashboard access, teacher permissions  
**Files:** `useUsers.ts`, `InstitutionAdminDashboard.tsx`, `permissionUtils.ts`  
**Depends On:** 01, 02

---

### [04 — Student Management & Onboarding](architectures/04-student-management.md)
**Domain:** Student invitation or institutional code signup, student profile, student enrollment in subjects, student dashboard  
**Files:** `useRegister.ts`, `useUsers.ts`, Firestore `users` + `subjects` collections  
**Depends On:** 01, 02

---

### [05 — Subject & Course Creation](architectures/05-subject-creation.md)
**Domain:** Subject document creation, atomic invite code generation, subject settings, lifecycle policies, subject visibility and scoping  
**Files:** `useSubjects.ts`, `subjectAccessUtils.ts`, `subjectValidation.ts`, `institutionPolicyUtils.ts`  
**Depends On:** 01, 02, 03

---

### [06 — Class & Teacher Assignment](architectures/06-class-teacher-assignment.md)
**Domain:** Class document creation, assigning teachers to subjects, linking classes to subjects, student enrollment via classes  
**Files:** `classes` Firestore collection, `InstitutionAdminDashboard` organization tab, `useUsers.ts`  
**Depends On:** 01, 02, 03, 04, 05

---

### [07 — Content Management](architectures/07-content-management.md)
**Domain:** Topic creation, resource upload (documents/materials), quiz creation and lifecycle, topic hierarchy, cascade deletion  
**Files:** `useSubjectManager.ts`, `topicDeletionUtils.ts`, Firestore subcollections `topics/`, `materials/`, `documents/`, `quizzes/`  
**Depends On:** 01, 02, 03, 05

---

### [08 — Permission Boundaries & Multi-Tenant Isolation](architectures/08-permission-boundaries.md)
**Domain:** Role-based access enforcement, multi-tenant data scoping, Firestore rules validation, cross-institution isolation, security regression tests  
**Files:** `permissionUtils.ts`, `securityUtils.ts`, `firestore.rules`, all Firestore collections  
**Depends On:** All architectures (cross-cutting concern)

---

## Architecture Health Status

| # | Architecture | Last Reviewed | Code Changes Since Review | Status |
|---|---|---|---|---|
| 01 | Auth & Sign-In | 2026-04-21 | — | ✅ Current |
| 02 | Institution Provisioning | 2026-04-21 | — | ✅ Current |
| 03 | Teacher Management | 2026-04-21 | — | ✅ Current |
| 04 | Student Management | 2026-04-21 | — | ✅ Current |
| 05 | Subject Creation | 2026-04-21 | — | ✅ Current |
| 06 | Class & Teacher Assignment | 2026-04-21 | — | ✅ Current |
| 07 | Content Management | 2026-04-21 | — | ✅ Current |
| 08 | Permission Boundaries | 2026-04-21 | — | ✅ Current |

> When code changes affect any domain, update the corresponding architecture document and set its row to `⚠️ Needs Update` until reviewed.
