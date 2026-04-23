# 02 — User Roles and Access

---

## Role Hierarchy

```
Global Admin (admin)
  └── Institution Admin (institutionadmin)
        ├── Teacher (teacher)
        └── Student (student)
```

Each role is strictly scoped. Higher roles do not automatically get access to lower-role features — they get their own dedicated interfaces.

---

## 1. Global Admin (`admin`)

### Who They Are
The platform owner(s). There is typically one or a small number of global admins who manage the DLP Academy platform itself.

### What They Can Do
- Create, edit, and delete institutions
- Set global access codes for institutions
- Create institution admin invites (direct email invites)
- View all institutions and their status
- Manage platform-level configuration

### What They CANNOT Do
- See content created by teachers or students
- Interfere with institution-level settings directly
- Access institution-admin dashboard panels

### How They Log In
- Email/password
- Must have `role: 'admin'` in Firestore `users` collection

### UI Entry Point
- `/admin-dashboard` or equivalent global admin panel

---

## 2. Institution Admin (`institutionadmin`)

### Who They Are
The administrator of a specific institution. Each institution has at least one institution admin. They are invited by the Global Admin.

### What They Can Do
- Invite teachers (direct email invites)
- Manage the institutional access code for students
- View and manage all users in their institution (teachers + students)
- Remove users from the institution
- Cancel pending invites
- Create and manage classes (groups of students)
- Assign teachers to classes
- Link subjects to classes
- Configure institution-level policies:
  - Teacher subject creation permissions
  - Academic calendar settings
  - Automation settings (e.g., auto-enroll on class assignment)
- Customize institution branding (logo, colors, display name)
- View all subjects in their institution (regardless of teacher)
- Export student/teacher data (if implemented)

### What They CANNOT Do
- Create global admin accounts
- Set their own role to `admin`
- Access or modify data from other institutions
- Modify individual students' quiz results or grades

### How They Join
- Invited via direct email invite from Global Admin
- Register at `/register` using the invite code
- Must verify email
- Must be promoted to `institutionadmin` role (currently done via Global Admin dashboard — see ISSUE in architecture docs)

### UI Entry Point
- `/institution-admin-dashboard`

---

## 3. Teacher (`teacher`)

### Who They Are
Academic staff at an institution. Invited by the Institution Admin.

### What They Can Do
- Create and manage their own subjects (if policy allows)
- Organize subjects into topics
- Upload documents (PDFs, files) to topics
- Create quizzes with multiple questions
- View enrolled students in their subjects
- See student quiz results and performance
- Share subjects via invite codes (self-enrollment)
- Edit and delete their own content

### What They CANNOT Do
- Access the institution admin dashboard
- Invite other teachers or students
- Modify other teachers' subjects
- Change institution settings or branding
- See data from other institutions

### How They Join
- Invited via direct email invite from Institution Admin
- Register at `/register` using the invite code
- Must verify email

### UI Entry Point
- `/home` with teacher panel showing their subjects

---

## 4. Student (`student`)

### Who They Are
Learners enrolled at an institution. They join via institutional access code.

### What They Can Do
- Access subjects assigned to their class(es)
- Self-enroll in subjects via subject invite codes (if enabled by teacher)
- View topics and their content (documents, quizzes)
- View uploaded documents
- Take quizzes
- See their own quiz results
- View their personal profile and settings

### What They CANNOT Do
- Create subjects, topics, or any content
- See other students' quiz results
- Access teacher or admin interfaces
- Modify any Firestore data directly (Firestore rules enforce this)
- Enroll in subjects from another institution

### How They Join
- Register at `/register` using the institution's access code
- Must verify email

### UI Entry Point
- `/home` with student panel showing enrolled subjects

---

## Role Enforcement Points

### 1. Firebase Authentication
- Email/password authentication
- Email verification required before accessing protected routes

### 2. Firestore Security Rules
- Every document read/write is validated against the user's `role` and `institutionId`
- Students cannot write to `subjects`, `topics`, or `users` (others' docs)
- Cross-institution data access is blocked at the Firestore rules level
- Role escalation (setting own role to admin) is blocked by rules

### 3. React Route Guards
- Protected routes check active role before rendering
- Unauthorized route access redirects to `/home`
- Role mismatch triggers redirect and console warning

### 4. UI-Level Enforcement
- Create/edit/delete controls are hidden from users without permission
- Student home page does not show subject creation UI
- Teacher home page does not show admin controls

---

## Role Assignment Rules

| Action | Who Can Do It |
|--------|--------------|
| Set `role: 'admin'` | Nobody via client — Firestore rules block it |
| Set `role: 'institutionadmin'` | Global Admin only, via admin dashboard |
| Set `role: 'teacher'` | Institution Admin, via teacher invite |
| Set `role: 'student'` | Self-registration with valid access code |
| Promote teacher → institutionadmin | Global Admin only |
| Demote users | Not currently implemented |

---

## Last Updated

*2026-04-23 — Initial creation*
