# Master Checklist — Institution Lifecycle Health Protocol

> **Protocol:** ILHP v1.0.0 | **For Use In:** Each Lifecycle Integrity Audit (LIA)  
> **This file is the TEMPLATE.** Copy to `active/lia-YYYY-MM-DD/step-checklist.md` before marking steps.
>
> ⚠️ **LIAs are READ-ONLY by default.** Observe, test, and log. Do NOT make code changes during a LIA unless **Implementation Mode** is explicitly enabled for the run. At Phase 9, every finding must result in a proposed plan or architecture — not a direct fix.

---

## Step Status Legend

| Symbol | Meaning |
|--------|---------|
| `⬜` | Not started |
| `🔄` | In progress |
| `✅` | Passed |
| `❌` | **FAILED (BLOCKING)** |
| `⚠️` | Passed with issues (log to failures.md) |
| `⏭️` | Skipped (document reason) |

## Classification Tags

`[AUTO]` = Automated test covers this &nbsp; `[MANUAL]` = Human UI action required &nbsp; `[HYBRID]` = Human triggers, Copilot/Firestore validates

`[CRITICAL]` = Blocking if fails &nbsp; `[HIGH]` = Major impact &nbsp; `[MEDIUM]` = Degraded experience &nbsp; `[LOW]` = Minor issue

---

---

## PHASE 0 — Pre-Flight Checks

> All items in this phase are **blocking**. Do NOT proceed to Phase 1 if any fail.

| # | Status | Step | Tags |
|---|--------|------|------|
| 0.1 | ⬜ | **Build compiles without errors:** Run `npm run build` and verify zero errors | `[AUTO]` `[CRITICAL]` |
| 0.2 | ⬜ | **No TypeScript errors:** Run `npx tsc --noEmit` and verify clean output | `[AUTO]` `[CRITICAL]` |
| 0.3 | ⬜ | **Lint passes:** Run `npm run lint` with 0 errors | `[AUTO]` `[CRITICAL]` |
| 0.4 | ⬜ | **Unit test suite passes:** Run `npm run test` and verify all tests green | `[AUTO]` `[CRITICAL]` |
| 0.5 | ⬜ | **Firebase emulator is running** (or staging target is confirmed): Verify emulator UI accessible at `http://127.0.0.1:4000` OR confirm correct Firebase project target | `[MANUAL]` `[CRITICAL]` |
| 0.6 | ⬜ | **Environment variables present:** Verify `.env` (or `.env.local`) contains all required `VITE_*` keys, `VITE_USE_EMULATORS` set correctly | `[MANUAL]` `[CRITICAL]` |
| 0.7 | ⬜ | **No leftover test data:** Verify Firestore has no `Academia de Prueba DLP` institution document from a previous LIA run | `[HYBRID]` `[CRITICAL]` |
| 0.8 | ⬜ | **No leftover Auth users:** Verify Firebase Auth has no `lia-admin@`, `lia-teacher-*`, or `lia-student-*` accounts from previous runs | `[HYBRID]` `[CRITICAL]` |
| 0.9 | ⬜ | **App runs in browser:** Navigate to `http://localhost:5173` (or configured port) and verify app loads without console errors | `[MANUAL]` `[CRITICAL]` |
| 0.10 | ⬜ | **Complete environment-snapshot.md:** Record git branch, commit hash, Firebase target, and date before starting | `[MANUAL]` `[CRITICAL]` |

---

## PHASE 1 — Institution Provisioning (Global Admin)

> **Prerequisite:** Global admin account exists and is confirmed working. Phase 0 must be 100% complete.

| # | Status | Step | Tags |
|---|--------|------|------|
| 1.1 | ⬜ | **Global admin login:** Navigate to `/login`. Log in with global admin credentials. Verify redirect to admin dashboard (`/admin` or `/admin-dashboard`). Verify role shows as `admin`. | `[MANUAL]` `[CRITICAL]` |
| 1.2 | ⬜ | **Admin dashboard renders:** Verify institutions list loads, search and pagination work, no console errors | `[MANUAL]` `[HIGH]` |
| 1.3 | ⬜ | **Create institution — form validation:** Attempt to submit empty form. Verify required field errors appear. | `[MANUAL]` `[MEDIUM]` |
| 1.4 | ⬜ | **Create institution — successful creation:** Fill form per [TEST_INSTITUTION_SPEC.md](../TEST_INSTITUTION_SPEC.md). Submit and verify institution appears in list. | `[MANUAL]` `[CRITICAL]` |
| 1.5 | ⬜ | **Verify institution document in Firestore:** Check `institutions/{id}` has correct fields: `name`, `domain`, `type`, `city`, `country`, `timezone`, `enabled: true`, `createdAt`. | `[HYBRID]` `[CRITICAL]` |
| 1.6 | ⬜ | **Create institution admin invite:** Create a direct invite for `lia-admin@prueba.dlp-test.internal` with role `institutionadmin`. | `[MANUAL]` `[CRITICAL]` |
| 1.7 | ⬜ | **Verify invite document in Firestore:** Check `institution_invites/{id}` has `email`, `role: 'institutionadmin'`, `institutionId`, `invitedAt`. | `[HYBRID]` `[CRITICAL]` |
| 1.8 | ⬜ | **Create institutional access code:** In the institution's invite code section, create code `LIA-TEST-2026`. | `[MANUAL]` `[CRITICAL]` |
| 1.9 | ⬜ | **Verify institutional code document in Firestore:** Check `institution_invites/LIA-TEST-2026` (or `{institutionId}_LIA-TEST-2026`) has `type: 'institutional'` and correct `institutionId`. | `[HYBRID]` `[CRITICAL]` |
| 1.10 | ⬜ | **Global admin logout:** Log out cleanly. Verify redirect to login page. Verify protected routes are inaccessible after logout. | `[MANUAL]` `[HIGH]` |

---

## PHASE 2 — Institution Admin Onboarding

> **Prerequisite:** Phase 1 complete. Institution and institution admin invite exist.

| # | Status | Step | Tags |
|---|--------|------|------|
| 2.1 | ⬜ | **Navigate to registration:** Go to `/register`. Verify page loads with user type selection. | `[MANUAL]` `[HIGH]` |
| 2.2 | ⬜ | **Registration form validation:** Attempt to submit empty form. Verify all required field errors. | `[MANUAL]` `[MEDIUM]` |
| 2.3 | ⬜ | **Register institution admin:** Fill form with spec data. Select user type `admin` (or `institutionadmin`). Enter invite code for `lia-admin@prueba.dlp-test.internal`. Submit. | `[MANUAL]` `[CRITICAL]` |
| 2.4 | ⬜ | **Invite code validation (Cloud Function):** Verify `validateInstitutionalAccessCode` Cloud Function is called. No timeout or cold-start error. | `[HYBRID]` `[CRITICAL]` |
| 2.5 | ⬜ | **Firebase Auth user created:** Verify user account exists in Firebase Auth with correct email and displayName. | `[HYBRID]` `[CRITICAL]` |
| 2.6 | ⬜ | **User document created in Firestore:** Check `users/{uid}` has `role: 'institutionadmin'`, `institutionId: {correctId}`, `email`, `firstName`, `lastName`, `createdAt`. | `[HYBRID]` `[CRITICAL]` |
| 2.7 | ⬜ | **Email verification redirect:** Verify user is redirected to `/verify-email?registered=true`. Verify page renders correctly. | `[MANUAL]` `[HIGH]` |
| 2.8 | ⬜ | **Email verification guard (if enforced):** If email verification is required before dashboard access, test that unverified user cannot access protected routes. | `[MANUAL]` `[MEDIUM]` |
| 2.9 | ⬜ | **Institution admin login after verification:** Log in as `lia-admin@prueba.dlp-test.internal`. | `[MANUAL]` `[CRITICAL]` |
| 2.10 | ⬜ | **Institution admin dashboard access:** Verify redirect to institution admin dashboard (not global admin). Verify correct institution name displays. | `[MANUAL]` `[CRITICAL]` |
| 2.11 | ⬜ | **Dashboard tabs render:** Verify all tabs load: Users, Organization, Settings, Customization. No console errors. | `[MANUAL]` `[HIGH]` |
| 2.12 | ⬜ | **Settings tab — institution policy configuration:** Set `allowTeacherAutonomousSubjectCreation: true` and `canDeleteSubjectsWithStudents: false`. Save. | `[MANUAL]` `[HIGH]` |
| 2.13 | ⬜ | **Verify settings saved in Firestore:** Check `institutions/{id}.accessPolicies` has correct values after save. | `[HYBRID]` `[HIGH]` |
| 2.14 | ⬜ | **Customization tab — branding setup:** Set primary color `#1e40af`, secondary color `#10b981`, institution display name `Academia LIA Test`. Save. | `[MANUAL]` `[MEDIUM]` |
| 2.15 | ⬜ | **Verify customization in Firestore:** Check `institutions/{id}.customization` has correct color and display name values. | `[HYBRID]` `[MEDIUM]` |
| 2.16 | ⬜ | **Branding applied in UI:** Reload the institution admin dashboard. Verify institution display name and primary color appear in the header/theme. | `[MANUAL]` `[MEDIUM]` |
| 2.17 | ⬜ | **Access code management — view existing code:** In the Users tab, verify the institutional access code `LIA-TEST-2026` is visible (or its masked/partial form). | `[MANUAL]` `[MEDIUM]` |

---

## PHASE 3 — Teacher Management & Onboarding

> **Prerequisite:** Phase 2 complete. Institution admin is logged in.

| # | Status | Step | Tags |
|---|--------|------|------|
| 3.1 | ⬜ | **Invite Teacher A:** In Users tab, enter `lia-teacher-a@prueba.dlp-test.internal` and send invite. | `[MANUAL]` `[CRITICAL]` |
| 3.2 | ⬜ | **Verify Teacher A invite in Firestore:** Check `institution_invites` has doc with `email`, `role: 'teacher'`, `institutionId`. | `[HYBRID]` `[CRITICAL]` |
| 3.3 | ⬜ | **Invite Teacher B:** Same as 3.1 for `lia-teacher-b@prueba.dlp-test.internal`. | `[MANUAL]` `[CRITICAL]` |
| 3.4 | ⬜ | **Verify Teacher B invite in Firestore.** | `[HYBRID]` `[CRITICAL]` |
| 3.5 | ⬜ | **Teacher A registration:** In a new browser session, register as `lia-teacher-a@prueba.dlp-test.internal`. Use the institutional invite flow. | `[MANUAL]` `[CRITICAL]` |
| 3.6 | ⬜ | **Verify Teacher A user document:** Check `users/{uid}` has `role: 'teacher'`, `institutionId: {correctId}`, correct email and name. | `[HYBRID]` `[CRITICAL]` |
| 3.7 | ⬜ | **Teacher A login and dashboard access:** Login as Teacher A. Verify redirect to teacher dashboard or home. Verify no admin dashboard access. | `[MANUAL]` `[CRITICAL]` |
| 3.8 | ⬜ | **Teacher A cannot access institution admin dashboard:** Navigate directly to `/admin-dashboard` or institution admin path. Verify access denied / redirect. | `[MANUAL]` `[CRITICAL]` |
| 3.9 | ⬜ | **Teacher B registration and verification:** Repeat steps 3.5-3.7 for Teacher B. | `[MANUAL]` `[CRITICAL]` |
| 3.10 | ⬜ | **Teachers visible in institution admin Users tab:** Log back in as institution admin. Verify both teachers appear in the institution's teacher list. | `[MANUAL]` `[HIGH]` |
| 3.11 | ⬜ | **Teacher deletion (validation only):** Verify the delete option is available for a teacher in the Users tab (do NOT delete — only validate UI control exists). | `[MANUAL]` `[MEDIUM]` |

---

## PHASE 4 — Student Management & Onboarding

> **Prerequisite:** Phase 2 complete. Institutional access code `LIA-TEST-2026` exists.

| # | Status | Step | Tags |
|---|--------|------|------|
| 4.1 | ⬜ | **Student 1 registration via institutional code:** Register `lia-student-1@prueba.dlp-test.internal` using code `LIA-TEST-2026`. | `[MANUAL]` `[CRITICAL]` |
| 4.2 | ⬜ | **Verify Student 1 user document:** Check `users/{uid}` has `role: 'student'`, `institutionId: {correctId}`. | `[HYBRID]` `[CRITICAL]` |
| 4.3 | ⬜ | **Student 1 login and home page access:** Login as Student 1. Verify home page loads. Verify no admin or teacher-specific UI elements are visible. | `[MANUAL]` `[CRITICAL]` |
| 4.4 | ⬜ | **Student 1 cannot access institution admin or teacher dashboard.** | `[MANUAL]` `[CRITICAL]` |
| 4.5 | ⬜ | **Register Students 2–5:** Repeat 4.1-4.2 for all 5 students. | `[MANUAL]` `[CRITICAL]` |
| 4.6 | ⬜ | **All students visible in institution admin Users tab:** Log in as institution admin. Verify all 5 students appear in the student list. | `[MANUAL]` `[HIGH]` |
| 4.7 | ⬜ | **Student profile completeness:** Verify each student profile has firstName, lastName, displayName, email, role, institutionId, createdAt, settings. | `[HYBRID]` `[HIGH]` |

---

## PHASE 5 — Subject & Course Creation

> **Prerequisite:** Phase 3 complete. Both teachers are registered and logged in.

| # | Status | Step | Tags |
|---|--------|------|------|
| 5.1 | ⬜ | **Teacher A creates Matemáticas Test:** Login as Teacher A. Use subject creation form. Fill all required fields per spec. Submit. | `[MANUAL]` `[CRITICAL]` |
| 5.2 | ⬜ | **Verify Matemáticas Test subject document:** Check `subjects/{id}` has `name`, `course`, `ownerId: teacherA.uid`, `institutionId: {correctId}`, `inviteCode` (8 chars), `inviteCodeEnabled: true`, `createdAt`. | `[HYBRID]` `[CRITICAL]` |
| 5.3 | ⬜ | **Verify invite code collision prevention:** Check `subjectInviteCodes` collection has document for the generated code. Confirms atomic transaction ran. | `[HYBRID]` `[HIGH]` |
| 5.4 | ⬜ | **Teacher B creates Ciencias Test:** Login as Teacher B. Repeat steps 5.1-5.3. | `[MANUAL]` `[CRITICAL]` |
| 5.5 | ⬜ | **Institution admin creates Historia Test:** Login as institution admin. Verify institution admin can create subjects. Create Historia Test. | `[MANUAL]` `[CRITICAL]` |
| 5.6 | ⬜ | **Subject invite code is unique:** Verify the three subjects have different invite codes. | `[HYBRID]` `[HIGH]` |
| 5.7 | ⬜ | **Subject visible on home page for creator:** Each teacher/admin sees their created subject on their home page. | `[MANUAL]` `[HIGH]` |
| 5.8 | ⬜ | **Subject validation — duplicate name guard:** Attempt to create a second subject named `Matemáticas Test` as Teacher A. Verify validation error appears (if uniqueness is enforced). | `[MANUAL]` `[MEDIUM]` |
| 5.9 | ⬜ | **Subject invite code rotation (if UI available):** In subject settings, verify invite code rotation interval is configurable and saving works. | `[MANUAL]` `[MEDIUM]` |
| 5.10 | ⬜ | **Teacher cannot create subject if institution policy disables it:** Change institution policy to `allowTeacherAutonomousSubjectCreation: false`. Verify Teacher A gets a permission error on subject creation. Reset policy to `true` after. | `[HYBRID]` `[HIGH]` |

---

## PHASE 6 — Class & Teacher Assignment

> **Prerequisite:** Phase 5 complete. All subjects exist.

| # | Status | Step | Tags |
|---|--------|------|------|
| 6.1 | ⬜ | **Create Clase A Test:** Log in as institution admin. In Organization tab, create class `Clase A Test`. | `[MANUAL]` `[CRITICAL]` |
| 6.2 | ⬜ | **Verify Clase A document in Firestore:** Check `classes/{id}` has `name`, `institutionId`, `status: 'active'`, `studentIds: []`. | `[HYBRID]` `[CRITICAL]` |
| 6.3 | ⬜ | **Create Clase B Test:** Repeat for `Clase B Test`. | `[MANUAL]` `[CRITICAL]` |
| 6.4 | ⬜ | **Assign Teacher A to Matemáticas Test subject:** Link `lia-teacher-a` as owner/editor of Matemáticas Test if not already the owner. | `[MANUAL]` `[HIGH]` |
| 6.5 | ⬜ | **Link Matemáticas Test to Clase A Test:** In subject settings or organization tab, assign `classId` / `classIds: [claseAId]` to Matemáticas Test. | `[MANUAL]` `[CRITICAL]` |
| 6.6 | ⬜ | **Verify classIds on Matemáticas Test:** Check `subjects/{id}.classIds` contains Clase A's ID. | `[HYBRID]` `[CRITICAL]` |
| 6.7 | ⬜ | **Link Ciencias Test to Clase B Test.** | `[MANUAL]` `[CRITICAL]` |
| 6.8 | ⬜ | **Link Historia Test to both classes.** | `[MANUAL]` `[HIGH]` |
| 6.9 | ⬜ | **Add Students 1 and 2 to Clase A Test:** In organization tab, add students S1, S2 (and S5) to Clase A. | `[MANUAL]` `[CRITICAL]` |
| 6.10 | ⬜ | **Verify studentIds in Clase A:** Check `classes/{claseAId}.studentIds` contains UIDs of S1, S2. | `[HYBRID]` `[CRITICAL]` |
| 6.11 | ⬜ | **Add Students 3 and 4 to Clase B Test.** | `[MANUAL]` `[CRITICAL]` |
| 6.12 | ⬜ | **Add Student 5 to both classes.** | `[MANUAL]` `[HIGH]` |
| 6.13 | ⬜ | **Student access via class enrollment:** Login as Student 1 (in Clase A). Verify Matemáticas Test appears in their subjects. Verify Ciencias Test (Clase B only) does NOT appear. | `[MANUAL]` `[CRITICAL]` |
| 6.14 | ⬜ | **Student 5 sees subjects from both classes.** | `[MANUAL]` `[HIGH]` |
| 6.15 | ⬜ | **Student self-enrollment via invite code:** Login as Student 3. Manually enter the Historia Test invite code. Verify student is added to `subjects/{id}.enrolledStudentUids`. | `[MANUAL]` `[HIGH]` |

---

## PHASE 7 — Content Management

> **Prerequisite:** Phase 6 complete. Subjects are set up with classes.

| # | Status | Step | Tags |
|---|--------|------|------|
| 7.1 | ⬜ | **Teacher A navigates to Matemáticas Test:** Verify subject page loads with topics list (empty initially). | `[MANUAL]` `[HIGH]` |
| 7.2 | ⬜ | **Teacher A creates Topic 1 — Álgebra Básica:** Fill name and any required fields. Submit. | `[MANUAL]` `[CRITICAL]` |
| 7.3 | ⬜ | **Verify topic document in Firestore:** Check `topics/{id}` has `name`, `number: '01'`, `order: 1`, `subjectId`, `ownerId`, `institutionId`, `status: 'active'` (or `'generating'`). | `[HYBRID]` `[CRITICAL]` |
| 7.4 | ⬜ | **Verify subject topicCount incremented:** Check `subjects/{subjectId}.topicCount` is now `1`. | `[HYBRID]` `[HIGH]` |
| 7.5 | ⬜ | **Topic navigation:** Click Topic 1 from subject page. Verify topic detail page loads with subcollections (materials, documents, quizzes). | `[MANUAL]` `[HIGH]` |
| 7.6 | ⬜ | **Upload document resource to Topic 1:** Upload a test file. Verify it appears in documents subcollection. | `[MANUAL]` `[HIGH]` |
| 7.7 | ⬜ | **Verify document in Firestore subcollection:** Check `topics/{topicId}/documents/{docId}` has correct fields. | `[HYBRID]` `[HIGH]` |
| 7.8 | ⬜ | **Create quiz in Topic 1:** Create a quiz with 3 questions. Save. | `[MANUAL]` `[HIGH]` |
| 7.9 | ⬜ | **Verify quiz in Firestore subcollection:** Check `topics/{topicId}/quizzes/{quizId}` has correct fields and questions array. | `[HYBRID]` `[HIGH]` |
| 7.10 | ⬜ | **Teacher A creates Topic 2 — Geometría.** | `[MANUAL]` `[HIGH]` |
| 7.11 | ⬜ | **Verify topic order and numbering:** Topic 1 = `number: '01'`, Topic 2 = `number: '02'`. Order values are correct. | `[HYBRID]` `[MEDIUM]` |
| 7.12 | ⬜ | **Teacher B creates Topic 1 in Ciencias Test.** | `[MANUAL]` `[HIGH]` |
| 7.13 | ⬜ | **Student accesses topic content:** Login as Student 1. Navigate to Matemáticas Test → Topic 1. Verify document and quiz are visible (read-only). | `[MANUAL]` `[CRITICAL]` |
| 7.14 | ⬜ | **Student takes quiz:** Student 1 starts the quiz in Topic 1. Answers all 3 questions. Submits. Verify result is saved to `quiz_results` subcollection. | `[MANUAL]` `[HIGH]` |
| 7.15 | ⬜ | **Student cannot edit content:** Verify no edit/delete controls are visible for Student 1 on topics, documents, or quizzes. | `[MANUAL]` `[CRITICAL]` |
| 7.16 | ⬜ | **Content not visible to uninvited students:** Login as Student 3 (not in Clase A). Verify Matemáticas Test is NOT accessible. | `[MANUAL]` `[CRITICAL]` |

---

## PHASE 8 — Permission Boundary Validation

> **Prerequisite:** All previous phases complete. Tests isolation and access control.

| # | Status | Step | Tags |
|---|--------|------|------|
| 8.1 | ⬜ | **Student cannot create subjects:** Login as Student 1. Attempt to navigate to subject creation. Verify UI control is absent and direct route is blocked. | `[MANUAL]` `[CRITICAL]` |
| 8.2 | ⬜ | **Student cannot access Firestore subjects of other institution directly:** Attempt `GET /subjects?institutionId=otherInstitutionId` (emulated). Firestore rules should deny. | `[HYBRID]` `[CRITICAL]` |
| 8.3 | ⬜ | **Teacher cannot access institution admin dashboard.** Already checked in 3.8 — re-verify as final cross-check. | `[MANUAL]` `[CRITICAL]` |
| 8.4 | ⬜ | **Teacher cannot modify institution settings:** Attempt direct Firestore write to `institutions/{id}.accessPolicies` as teacher. Verify Firestore rules deny. | `[HYBRID]` `[CRITICAL]` |
| 8.5 | ⬜ | **Institution admin cannot promote user to global admin:** In Firestore or via UI, attempt to set `role: 'admin'` on a user. Verify Firestore rules deny. | `[HYBRID]` `[CRITICAL]` |
| 8.6 | ⬜ | **Institution admin cannot see other institution's data:** Log in as institution admin. Attempt to query `users` where `institutionId != ownInstitutionId`. Verify empty result. | `[HYBRID]` `[CRITICAL]` |
| 8.7 | ⬜ | **Cross-institution subject access denied:** Attempt to add a subject from Institution A to a user in Institution B. Verify Firestore rules deny. | `[HYBRID]` `[CRITICAL]` |
| 8.8 | ⬜ | **Unauthenticated user cannot read any protected Firestore collection:** Test `subjects`, `users`, `topics` reads without auth token. Firestore rules must deny. | `[HYBRID]` `[CRITICAL]` |
| 8.9 | ⬜ | **Role field cannot be set to admin/institutionadmin via client signup:** In `firestore.rules`, the users create rule prevents `role` being set to `admin` or `institutionadmin` from the client side. Verify this is enforced. | `[HYBRID]` `[CRITICAL]` |
| 8.10 | ⬜ | **Deleted invite cannot be reused:** After Teacher A signed up consuming their invite, verify the invite document is deleted (or marked used). Attempt signup with same invite data — must fail. | `[HYBRID]` `[HIGH]` |
| 8.11 | ⬜ | **Subject invite code uniqueness enforced atomically:** Attempt to simultaneously create two subjects that would generate the same invite code (simulate race condition in tests). Verify only one succeeds. | `[AUTO]` `[HIGH]` |
| 8.12 | ⬜ | **Student cannot enroll in subject from another institution:** Attempt to use an invite code from a different institution's subject. Verify enrollment denied by Firestore rules (`sameInstitution` check). | `[HYBRID]` `[CRITICAL]` |

---

## PHASE 9 — Regression Baseline

> Final phase: document the confirmed-working baseline for cross-run comparison.

| # | Status | Step | Tags |
|---|--------|------|------|
| 9.1 | ⬜ | **Update global logs — working-features-baseline.md:** Log each phase that passed with today's date. | `[MANUAL]` — |
| 9.2 | ⬜ | **Update global logs — security-risks-registry.md:** Log any security findings from Phase 8. | `[MANUAL]` — |
| 9.3 | ⬜ | **Update global logs — regression-history.md:** If any step failed that previously passed, log as regression. | `[MANUAL]` — |
| 9.4 | ⬜ | **Update global logs — known-issues.md:** Log any non-blocking issues discovered (⚠️ items). | `[MANUAL]` — |
| 9.5 | ⬜ | **Propose actions:** For every failure, issue, and security risk found, create a proposed plan (small scope) or proposed architecture (large/security-critical) in `copilot/plans/todo/` or `copilot/architectures/todo/`. Log each proposal link and priority in `findings.md` under "Proposed Actions". | `[MANUAL]` — |
| 9.6 | ⬜ | **Archive LIA instance:** Move `active/lia-YYYY-MM-DD/` to `finished/`. | `[MANUAL]` — |
| 9.7 | ⬜ | **Cleanup test data per TEST_INSTITUTION_SPEC.md cleanup procedure.** | `[MANUAL]` — |

---

## PHASE 10 — UX Deep Analysis & Feature Gap Audit

> **This phase requires adopting four distinct mindsets.** Do not skim. This is the most qualitative phase but equally important — it surfaces what the platform is missing before real users notice.

### A — Institution Admin Perspective

Revisit the dashboard with fresh eyes as if you are a first-time institution admin.

| # | Status | Step | Tags |
|---|--------|------|------|
| 10.1 | ⬜ | **Dashboard discoverability:** Is every action an institution admin needs reachable within 2 clicks? Note any navigation dead-ends. | `[MANUAL]` `[MEDIUM]` |
| 10.2 | ⬜ | **Settings clarity:** Are all policy toggles clearly labeled and described? Is the impact of enabling/disabling each one obvious? | `[MANUAL]` `[MEDIUM]` |
| 10.3 | ⬜ | **User management usability:** Is it clear how to invite, find, and remove users? Is bulk management possible? If not, log as gap. | `[MANUAL]` `[MEDIUM]` |
| 10.4 | ⬜ | **Feedback on actions:** After saving settings, is there visual confirmation? After inviting a teacher, is there confirmation? | `[MANUAL]` `[LOW]` |
| 10.5 | ⬜ | **Missing admin features:** List any feature an institution admin would reasonably expect but does not exist (e.g., bulk invite, export users, class roster view, audit log). Log in `findings.md` as GAP items. | `[MANUAL]` `[HIGH]` |

### B — Teacher Perspective

Revisit the teaching workflow from scratch.

| # | Status | Step | Tags |
|---|--------|------|------|
| 10.6 | ⬜ | **Subject creation flow:** Is it intuitive? Are all required fields clear? Is the invite code immediately visible after creation? | `[MANUAL]` `[MEDIUM]` |
| 10.7 | ⬜ | **Content organization:** Can topics be reordered? Is the structure clear for a teacher managing 10+ topics? | `[MANUAL]` `[MEDIUM]` |
| 10.8 | ⬜ | **Quiz builder usability:** Is the quiz creation experience smooth? Can questions be edited after saving? Can the quiz be previewed before publishing? | `[MANUAL]` `[HIGH]` |
| 10.9 | ⬜ | **Student progress visibility:** Can the teacher see which students have taken the quiz and their scores? Is this easy to find? | `[MANUAL]` `[HIGH]` |
| 10.10 | ⬜ | **Missing teacher features:** List any feature a teacher would expect but is missing (e.g., grade book, attendance, lesson calendar, notifications to students). Log as GAP items. | `[MANUAL]` `[HIGH]` |

### C — Student Perspective

Navigate as a student encountering the platform for the first time.

| # | Status | Step | Tags |
|---|--------|------|------|
| 10.11 | ⬜ | **First-time enrollment experience:** Is it clear how to join a subject? Is the access code flow explained? | `[MANUAL]` `[HIGH]` |
| 10.12 | ⬜ | **Subject home clarity:** After enrolling, is it clear what to do next? Are topics organized logically? | `[MANUAL]` `[MEDIUM]` |
| 10.13 | ⬜ | **Quiz experience:** Is it clear how to start and submit a quiz? Is the result shown after submission? Can the student review their answers? | `[MANUAL]` `[HIGH]` |
| 10.14 | ⬜ | **Document access:** Is downloading/viewing documents intuitive? Are file types handled gracefully? | `[MANUAL]` `[MEDIUM]` |
| 10.15 | ⬜ | **Missing student features:** List any feature a student would expect but is missing (e.g., progress tracking, personal notes, quiz retry, bookmark topics). Log as GAP items. | `[MANUAL]` `[HIGH]` |

### D — Adversarial / Hacker Perspective

Attempt to break the application. Use the Firestore emulator, browser dev tools, and direct API calls.

| # | Status | Step | Tags |
|---|--------|------|------|
| 10.16 | ⬜ | **Attempt direct Firestore write as student:** Use Firebase JS SDK directly to write to `subjects/` with `role: 'teacher'`. Verify denial. | `[HYBRID]` `[CRITICAL]` |
| 10.17 | ⬜ | **Intercept and replay invite:** Register once with an invite. Attempt a second registration with the same invite code but a different email. | `[MANUAL]` `[HIGH]` |
| 10.18 | ⬜ | **Direct URL navigation (route bypass):** Manually navigate to `/institution-admin/dashboard` as a student. Route guard must redirect. | `[MANUAL]` `[CRITICAL]` |
| 10.19 | ⬜ | **Guess subject document ID:** Obtain a subject document ID from Institution A. Attempt to read it while authenticated as a user from Institution B. | `[HYBRID]` `[CRITICAL]` |
| 10.20 | ⬜ | **JWT token inspection:** Verify that the JWT token does not contain the institution access code or any plain-text credential. | `[MANUAL]` `[HIGH]` |
| 10.21 | ⬜ | **Storage URL bypass:** Obtain a Firebase Storage URL for a document. Attempt to access it without authentication (incognito window). Verify Storage rules block it. | `[MANUAL]` `[HIGH]` |
| 10.22 | ⬜ | **Self-escalation attempt:** As a teacher, use the Firebase console or SDK to update your own `users/{uid}.role` to `institutionadmin`. Verify Firestore rule denies. | `[HYBRID]` `[CRITICAL]` |

### E — Feature Gap Analysis Summary

After completing all four perspectives above:

| # | Status | Step | Tags |
|---|--------|------|------|
| 10.23 | ⬜ | **Compile all GAP items** from steps 10.5, 10.10, 10.15 into the `findings.md` "Feature Gaps" section with: description, affected role, priority estimate (High/Medium/Low). | `[MANUAL]` — |
| 10.24 | ⬜ | **Prioritize top 3 gaps:** Based on impact to real users, select the 3 most impactful missing features and note them in `findings.md` as "Recommended Next Features". | `[MANUAL]` — |
| 10.25 | ⬜ | **Architecture update check:** Review each architecture doc that was exercised in this LIA. If code behavior differed from what the architecture described, update the architecture document. | `[MANUAL]` — |



---

## Summary Scorecard

Fill this out at the end of the LIA:

| Phase | Total Steps | ✅ Passed | ❌ Failed | ⚠️ Issues | ⏭️ Skipped |
|-------|------------|---------|---------|---------|---------|
| Phase 0 — Pre-Flight | 10 | | | | |
| Phase 1 — Institution Provisioning | 10 | | | | |
| Phase 2 — Institution Admin Onboarding | 17 | | | | |
| Phase 3 — Teacher Management | 11 | | | | |
| Phase 4 — Student Management | 7 | | | | |
| Phase 5 — Subject Creation | 10 | | | | |
| Phase 6 — Class Assignment | 15 | | | | |
| Phase 7 — Content Management | 16 | | | | |
| Phase 8 — Permission Boundaries | 12 | | | | |
| Phase 9 — Regression Baseline | 6 | | | | |
| Phase 10 — UX & Feature Gap Audit | 25 | | | | |
| **TOTAL** | **139** | | | | |

**Overall Result:** ⬜ Pending / ✅ Pass / ❌ Fail
