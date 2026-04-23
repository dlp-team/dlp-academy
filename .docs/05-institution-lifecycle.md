# 05 — Institution Lifecycle

> This document describes the full lifecycle of an institution in DLP Academy — from provisioning by the Global Admin to full daily operational use.

---

## Stage 0: Platform Prerequisites

Before any institution can be created, the following must exist:
- Global admin account in Firebase Auth with `role: 'admin'` in Firestore
- Firebase project configured with Auth, Firestore, and Storage enabled
- App deployed and accessible at a URL

---

## Stage 1: Institution Provisioning (Global Admin)

**Actor:** Global Admin  
**Duration:** Minutes  
**Firestore writes:** `institutions/{id}`, `institution_invites/{inviteId}`

### Steps
1. Global Admin creates institution document in Firestore via admin dashboard
2. Required fields: `name`, `domain`, `type`, `city`, `country`, `timezone`, `enabled: true`, `createdAt`
3. Global Admin creates a direct invite for the institution admin email
4. Invite document in `institution_invites/{id}` with: `email`, `role: 'institutionadmin'`, `institutionId`, `invitedAt`
5. Global Admin sets institutional access code (e.g., `DLPTEST8`)
6. Access code stored in `institution_invites/{code}` with `type: 'institutional'`, `institutionId`

### Result
Institution is provisioned and ready for the institution admin to onboard.

---

## Stage 2: Institution Admin Onboarding

**Actor:** Institution Admin (new)  
**Duration:** 10–30 minutes  
**Firestore writes:** `users/{uid}`, updates to `institution_invites` (delete invite)

### Steps
1. Institution admin receives invite code out-of-band (email)
2. Registers at `/register` with the invite code
3. Firestore user doc created with `role: 'teacher'` (safe-role capping, then promoted by Global Admin)
4. Email verified
5. Institution admin logs in and accesses institution admin dashboard

### Configuration Steps (Institution Admin)
1. **Branding:** Sets institution display name, primary/secondary colors, optional logo
2. **Policies:** Configures settings:
   - `allowTeacherAutonomousSubjectCreation`
   - Academic calendar parameters
   - Automation rules
   - Teacher permission levels
3. **Access code:** Verifies or regenerates the institutional access code

### Result
Institution is configured. Ready to invite teachers and students.

---

## Stage 3: Teacher Onboarding

**Actor:** Institution Admin (inviting), Teacher (registering)  
**Duration:** 5–10 minutes per teacher  
**Firestore writes:** `institution_invites/{id}`, `users/{uid}`

### Steps
1. Institution admin creates teacher invite (direct email)
2. Teacher receives invite code out-of-band
3. Teacher registers at `/register` with invite code
4. Teacher doc created with `role: 'teacher'`, `institutionId`
5. Teacher email verified
6. Teacher logs in — lands on home page

### Result
Teachers are onboarded and ready to create subjects.

---

## Stage 4: Student Onboarding

**Actor:** Students (self-registering)  
**Duration:** 2–5 minutes per student  
**Firestore writes:** `users/{uid}`

### Steps
1. Student receives institutional access code out-of-band
2. Student registers at `/register` with the code
3. Student doc created with `role: 'student'`, `institutionId`
4. Student email verified
5. Student logs in — sees home page (no subjects yet until assigned to a class)

### Result
Students are registered. They await class assignment to access subjects.

---

## Stage 5: Academic Setup (Classes + Subjects)

**Actor:** Institution Admin (classes) + Teachers (subjects)  
**Duration:** 30–60 minutes for initial setup  
**Firestore writes:** `classes/{id}`, `subjects/{id}`, `subjectInviteCodes/{code}`

### Subject Creation (Teacher)
1. Teacher creates subject with name, description
2. Subject doc created with `ownerId`, `institutionId`, `inviteCode`
3. Invite code atomically registered in `subjectInviteCodes`

### Class Creation (Institution Admin)
1. Admin creates class (e.g., "1ro Secundaria A")
2. Class doc created with `institutionId`, `name`, `status: 'active'`, `studentIds: []`
3. Admin adds students to the class → `studentIds` updated
4. Admin links subject to class → `subjects/{id}.classIds` updated
5. Students in the class can now see the linked subject on their home page

### Result
Academic structure is in place. Students can access their assigned subjects.

---

## Stage 6: Active Use (Daily Operations)

### Teacher Daily Tasks
- Adds new topics to their subjects
- Uploads documents to topics
- Creates/edits quizzes
- Reviews student performance on quizzes

### Student Daily Tasks
- Accesses their subjects and reads new topics
- Views and downloads documents
- Takes quizzes
- Checks their results

### Institution Admin Daily Tasks
- Monitors user activity (invites, new students)
- Manages class assignments when students join or change classes
- Updates branding or policies as needed
- Handles teacher/student removal if needed

---

## Stage 7: Institution Maintenance

### User Management
- Adding new teachers: create new invites
- Adding new students: share access code (or update it if compromised)
- Removing a user: deactivate/remove via Users tab (when feature is available)
- Class updates: add/remove students, reassign teachers, link new subjects

### Content Maintenance
- Archiving old subjects at end of academic period
- Clearing test data before new academic year

### Security Maintenance
- Regenerate institutional access code periodically
- Review Firestore rules after any schema change
- Monitor for unusual access patterns

---

## Stage 8: Institution Decommission

When an institution is no longer active:
1. Global Admin disables institution (`enabled: false`)
2. All users lose access to institution resources
3. Data is retained for compliance/archival purposes
4. Eventually cleaned up per data retention policy

---

## Key Data Dependencies

```
institutions/{id}
  ↓
  ├── institution_invites (invite codes for teachers/students)
  ├── users/{uid} (all users with institutionId)
  ├── classes/{classId} (class groups, studentIds, linked subjects)
  └── subjects/{id} (classIds, enrolledStudentUids, ownerId)
        └── topics/{topicId}
              ├── documents/{docId}
              └── quizzes/{quizId}
                    └── quiz_results/{resultId}
```

---

## Last Updated

*2026-04-23 — Initial creation*
