# Standardized Test Institution Specification

> **Version:** 1.0.0 | **Protocol:** Institution Lifecycle Health Protocol (ILHP)

Every Lifecycle Integrity Audit (LIA) runs against the **exact same standardized fictional institution** defined in this document. Using a fixed spec ensures that run #3 and run #7 are directly comparable — same shape, same data, different date.

**NEVER use real user data, real institution names, or real email addresses.**

---

## Institution Identity

| Field | Value |
|-------|-------|
| **Name** | Academia de Prueba DLP |
| **Type** | `academy` |
| **City** | Madrid |
| **Country** | España |
| **Timezone** | `Europe/Madrid` |
| **Domain** | `prueba.dlp-test.internal` |
| **Domains Array** | `["prueba.dlp-test.internal"]` |
| **Enabled** | `true` |
| **Institutional Access Code** | `LIA-TEST-2026` (regenerated each run) |

> **Note:** The `prueba.dlp-test.internal` domain is fictional and will not match any real emails. This is intentional — Google OAuth domain-matching should NOT resolve this institution for any real Google account.

---

## Test Users

### Global Admin (pre-existing, not created during LIA)
| Field | Value |
|-------|-------|
| **Email** | *(Use the existing configured global admin account)* |
| **Role** | `admin` |
| **Purpose** | Creates the institution and institution admin invite |

---

### Institution Administrator
| Field | Value |
|-------|-------|
| **Email** | `lia-admin@prueba.dlp-test.internal` |
| **First Name** | `Admin` |
| **Last Name** | `LIA Test` |
| **Display Name** | `Admin LIA Test` |
| **Role** | `institutionadmin` |
| **Password** | *(Set during registration — use environment-snapshot.md to record securely)* |
| **Invite Type** | Direct invite from global admin (`institution_invites` doc with `role: 'institutionadmin'`) |

---

### Teacher A
| Field | Value |
|-------|-------|
| **Email** | `lia-teacher-a@prueba.dlp-test.internal` |
| **First Name** | `Profesora` |
| **Last Name** | `García Test` |
| **Display Name** | `Profesora García Test` |
| **Role** | `teacher` |
| **Invited By** | Institution Admin |
| **Subjects Owns** | Matemáticas Test |
| **Class** | Clase A Test |

---

### Teacher B
| Field | Value |
|-------|-------|
| **Email** | `lia-teacher-b@prueba.dlp-test.internal` |
| **First Name** | `Profesor` |
| **Last Name** | `Martínez Test` |
| **Display Name** | `Profesor Martínez Test` |
| **Role** | `teacher` |
| **Invited By** | Institution Admin |
| **Subjects Owns** | Ciencias Test |
| **Class** | Clase B Test |

---

### Students (5 total)

| # | Email | First Name | Last Name | Class |
|---|-------|-----------|----------|-------|
| S1 | `lia-student-1@prueba.dlp-test.internal` | Estudiante | Uno Test | Clase A Test |
| S2 | `lia-student-2@prueba.dlp-test.internal` | Estudiante | Dos Test | Clase A Test |
| S3 | `lia-student-3@prueba.dlp-test.internal` | Estudiante | Tres Test | Clase B Test |
| S4 | `lia-student-4@prueba.dlp-test.internal` | Estudiante | Cuatro Test | Clase B Test |
| S5 | `lia-student-5@prueba.dlp-test.internal` | Estudiante | Cinco Test | Both (shared subject) |

All students have `role: 'student'` and sign up using the institutional access code `LIA-TEST-2026`.

---

## Subjects

| # | Name | Owner | Class | Color | Course |
|---|------|-------|-------|-------|--------|
| Sub-1 | Matemáticas Test | Teacher A | Clase A Test | `from-blue-400 to-blue-600` | `Test Course LIA` |
| Sub-2 | Ciencias Test | Teacher B | Clase B Test | `from-green-400 to-green-600` | `Test Course LIA` |
| Sub-3 | Historia Test | Institution Admin | Clase A + B | `from-yellow-400 to-yellow-600` | `Test Course LIA` |

---

## Classes

| # | Name | Teacher | Students | Linked Subjects |
|---|------|---------|----------|-----------------|
| C-1 | Clase A Test | Teacher A | S1, S2, S5 | Matemáticas Test, Historia Test |
| C-2 | Clase B Test | Teacher B | S3, S4, S5 | Ciencias Test, Historia Test |

---

## Content Per Subject

### Matemáticas Test (Teacher A)
- **Topic 1:** Álgebra Básica (with 1 document resource + 1 quiz with 3 questions)
- **Topic 2:** Geometría (with 1 material resource)

### Ciencias Test (Teacher B)
- **Topic 1:** El Sistema Solar (with 1 document resource)

### Historia Test (Institution Admin)
- **Topic 1:** La Edad Media (created but empty — tests empty state)

---

## Institution Branding (Applied by Institution Admin)

| Setting | Value |
|---------|-------|
| **Institution Display Name** | `Academia LIA Test` |
| **Primary Color** | `#1e40af` (deep blue) |
| **Secondary Color** | `#10b981` (emerald) |
| **Logo** | Upload test logo: `tests/mock/test-logo.png` (if exists) or skip |

---

## Institution Policies (Applied by Institution Admin)

| Policy | Value |
|--------|-------|
| `allowTeacherAutonomousSubjectCreation` | `true` |
| `canDeleteSubjectsWithStudents` | `false` |

---

## Cleanup Procedure

After the LIA completes, the following must be removed:

1. **Firebase Auth:** Delete all 8 test user accounts (admin, 2 teachers, 5 students)
2. **Firestore `users/`:** Delete all 7 created user documents (not global admin)
3. **Firestore `institutions/`:** Delete `Academia de Prueba DLP` document
4. **Firestore `institution_invites/`:** Delete all invites created for this institution
5. **Firestore `subjects/`:** Delete all 3 test subjects
6. **Firestore `topics/`:** Delete all topics under test subjects
7. **Firestore `subjectInviteCodes/`:** Delete codes for test subjects
8. **Firestore `classes/`:** Delete Clase A Test and Clase B Test
9. **Storage:** Delete any uploaded files from test institution

> If running on emulator: restart emulator to wipe state automatically.

---

## Audit Run ID Convention

Each LIA instance is named: `lia-YYYY-MM-DD`  
Example: `lia-2026-04-21`

If multiple LIAs are run on the same date, suffix with `-2`, `-3`, etc.
