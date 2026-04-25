# 03 — Feature Requirements

> This document describes all features that DLP Academy must have, along with how they must work. Features marked **[EXISTS]** are implemented. Features marked **[PLANNED]** are in scope but not yet built. Features marked **[IDEA]** are aspirational and not committed.

---

## 1. Authentication & Onboarding

### 1.1 Email/Password Registration
- **[EXISTS]** Users register with email, password, first name, last name
- **[EXISTS]** Registration requires an invite code (teacher) or access code (student)
- **[EXISTS]** Email verification is required before accessing the app
- **[EXISTS]** Unverified users are redirected to `/verify-email`
- The registration form must validate all fields and show clear error messages

### 1.2 Login
- **[EXISTS]** Email/password login
- **[EXISTS]** Redirect to appropriate home page based on role after login
- **[EXISTS]** Session persists across browser sessions (Firebase Auth persistence)
- **[PLANNED]** Password reset flow via email

### 1.3 Logout
- **[EXISTS]** Clean logout that clears session and redirects to login
- After logout, all protected routes must be inaccessible

### 1.4 Email Verification
- **[EXISTS]** Firebase Auth email verification
- **[EXISTS]** Unverified users cannot proceed past the verification page
- **[PLANNED]** Resend verification email button

---

## 2. Institution Management (Global Admin)

### 2.1 Institution Creation
- **[EXISTS]** Global admin can create institutions with: name, domain, type, city, country, timezone
- **[EXISTS]** Institution appears in global admin institution list immediately
- Institution must have `enabled: true` by default on creation

### 2.2 Institution Admin Invite
- **[EXISTS]** Global admin can create direct email invites for institution admins
- **[EXISTS]** Invite code is single-use and expires after use
- Invite code must not be reusable

### 2.3 Institution Access Code
- **[EXISTS]** Each institution has a unique 8-character access code for student self-registration
- **[EXISTS]** Code uses the safe alphabet (no I, O, 0, 1)
- **[PLANNED]** Institution admin can regenerate the code (invalidating the old one)
- **[PLANNED]** Institution admin can disable/enable self-registration

---

## 3. Institution Admin Dashboard

### 3.1 Users Tab
- **[EXISTS]** View all teachers in the institution (Profesores section)
- **[EXISTS]** View all students in the institution (Alumnos section)
- **[EXISTS]** Create teacher invites (direct email)
- **[EXISTS]** View institutional access code for students
- **[PLANNED]** View pending (unaccepted) invites separately from active users
- **[PLANNED]** Cancel pending invite before it is used
- **[PLANNED]** Remove/deactivate a teacher from the institution
- **[PLANNED]** Remove/deactivate a student from the institution
- **[PLANNED]** Search/filter users by name or email
- **[PLANNED]** Regenerate institutional access code
- **[PLANNED]** Disable institutional access code
- **[IDEA]** Bulk user management (select multiple, bulk deactivate, bulk export)
- **[IDEA]** Audit/activity log of admin actions

### 3.2 Organization Tab (Classes)
- **[EXISTS]** View all classes in the institution
- **[EXISTS]** Create a class with a name
- **[EXISTS]** Add students to a class
- **[EXISTS]** Assign teacher(s) to a class
- **[EXISTS]** Link subjects to a class
- **[PLANNED]** Rename a class
- **[PLANNED]** Remove a student from a class
- **[PLANNED]** View class roster (full student list per class)
- **[PLANNED]** Unlink a subject from a class
- **[PLANNED]** Delete a class
- **[PLANNED]** Transfer a student between classes
- **[IDEA]** Bulk add students to a class (CSV upload or multi-select)
- **[IDEA]** Class student count display in the admin view

### 3.3 Settings Tab
- **[EXISTS]** Toggle: allow teachers to create subjects without approval
- **[EXISTS]** Academic calendar section (visible in Settings)
- **[EXISTS]** Automations section (visible in Settings)
- **[EXISTS]** Teacher permissions section
- All policy settings must save to Firestore `institutions/{id}.accessPolicies`
- All policy settings must persist after page reload
- **[PLANNED]** Academic calendar: set start/end date, period/term labels
- **[PLANNED]** Automation: auto-enroll students in subject when assigned to class
- **[PLANNED]** Teacher permissions: granular options (create quizzes, view all grades, etc.)

### 3.4 Customization Tab (Personalización)
- **[EXISTS]** Set institution display name
- **[EXISTS]** Set primary color and secondary color
- **[EXISTS]** Live preview iframe that updates in real-time as colors change
- **[EXISTS]** Save branding — persists in Firestore `institutions/{id}.customization`
- **[EXISTS]** Custom branding applied to dashboard header after save
- **[PLANNED]** Logo upload (upload to Firebase Storage, URL stored in Firestore)
- **[PLANNED]** Student-facing pages also apply the institution's branding
- **[PLANNED]** Reset branding to platform defaults

---

## 4. Teacher Features

### 4.1 Subject Creation
- **[EXISTS]** Teacher can create a subject with: name, optional description, subject code
- **[EXISTS]** Subject invite code auto-generated on creation (8 chars, safe alphabet)
- **[EXISTS]** Invite code stored atomically in `subjectInviteCodes` collection (collision prevention)
- **[EXISTS]** Subject appears on teacher's home page immediately after creation
- Subject creation can be blocked by institution policy

### 4.2 Subject Management
- **[EXISTS]** Teacher can view their subjects on home page
- **[PLANNED]** Edit subject name and description after creation
- **[PLANNED]** Enable/disable subject invite code
- **[PLANNED]** Rotate (regenerate) subject invite code
- **[PLANNED]** Archive/deactivate subject (hide from students without deleting)
- **[PLANNED]** Delete subject (with confirmation; must handle enrolled students)
- **[PLANNED]** View list of enrolled students
- **[IDEA]** Subject-level settings page (dedicated settings UI)
- **[IDEA]** Subject metadata: academic level, course code, credits, academic year

### 4.3 Topic Management
- **[EXISTS]** Teacher can create topics inside a subject
- **[EXISTS]** Topics are numbered and ordered (01, 02, ...)
- **[EXISTS]** Topic count on subject is incremented when a topic is created
- **[PLANNED]** Reorder topics via drag-and-drop or up/down controls
- **[PLANNED]** Edit topic name after creation
- **[PLANNED]** Delete a topic (with confirmation; must handle documents and quizzes)
- **[IDEA]** Folder/section organization for topics within a subject

### 4.4 Document Management
- **[EXISTS]** Teacher can upload documents to a topic
- **[EXISTS]** Documents stored in Firebase Storage
- **[EXISTS]** Document metadata stored in `topics/{topicId}/documents/`
- **[PLANNED]** Edit document name/description
- **[PLANNED]** Delete document
- **[PLANNED]** Preview document in-browser (PDF viewer)
- **[IDEA]** Support for multiple document types (PDF, video, link, image)

### 4.5 Quiz Management
- **[EXISTS]** Teacher can create a quiz inside a topic with multiple questions
- **[EXISTS]** Quiz stored in Firestore subcollection `topics/{topicId}/quizzes/`
- **[EXISTS]** Teacher can see quiz results from students
- **[PLANNED]** Edit questions after quiz creation
- **[PLANNED]** Preview quiz before publishing
- **[PLANNED]** Delete a quiz
- **[IDEA]** Multiple question types (multiple choice, true/false, short answer)
- **[IDEA]** Quiz time limit
- **[IDEA]** Quiz retry policy (how many times a student can take it)

---

## 5. Student Features

### 5.1 Subject Enrollment
- **[EXISTS]** Students enrolled in classes gain access to class-linked subjects
- **[EXISTS]** Students can self-enroll in a subject using the subject invite code
- **[PLANNED]** Students see clear onboarding when they have no subjects yet
- **[PLANNED]** Self-enrollment flow is clearly explained in the UI (not hidden)

### 5.2 Content Access
- **[EXISTS]** Students can view topics inside their enrolled subjects
- **[EXISTS]** Students can view/download documents in topics
- **[EXISTS]** Students cannot edit or delete any content (read-only UI)
- **[EXISTS]** Content from subjects not in their class is inaccessible

### 5.3 Quiz Experience
- **[EXISTS]** Students can take quizzes in their enrolled subjects
- **[EXISTS]** Quiz result saved in Firestore `quiz_results` with correct UID
- **[EXISTS]** Student cannot see other students' quiz results
- **[PLANNED]** Result is shown immediately after submission
- **[PLANNED]** Student can review their answers after submission
- **[IDEA]** Quiz retry (subject to teacher's policy)
- **[IDEA]** Progress tracking across all topics in a subject

---

## 6. Multi-Tenancy & Security

### 6.1 Data Isolation
- **[EXISTS]** All Firestore queries are scoped by `institutionId`
- **[EXISTS]** Firestore rules block cross-institution reads and writes
- **[EXISTS]** Students cannot read subjects from another institution
- **[EXISTS]** Teachers cannot modify another institution's data

### 6.2 Role Enforcement
- **[EXISTS]** Firestore rules prevent client-side role escalation
- **[EXISTS]** Route guards redirect unauthorized role access
- **[EXISTS]** UI controls are hidden for unauthorized roles

### 6.3 Invite Security
- **[EXISTS]** Invite codes are single-use
- **[EXISTS]** Used invite docs are deleted after use
- **[PLANNED]** Invite codes expire after a configurable period
- **[PLANNED]** Cross-institution invite enrollment is blocked (Firestore rules)

---

## Last Updated

*2026-04-23 — Initial creation*
