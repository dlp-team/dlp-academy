# Step Checklist — LIA 2026-04-26

> **LIA Instance:** `lia-2026-04-26` | **Executor:** *(fill in)*  
> **Source:** Copied from `MASTER_CHECKLIST.md` — do NOT edit the master.  
> **Instructions:** Mark each step as you complete it. Log failures in `logs/failures.md`.

---

## ⏸️ PAUSE CHECKPOINT PROTOCOL (MANDATORY)

> **Every time you stop working on this LIA mid-run — whether closing VS Code, stopping the emulator, or ending the session — you MUST export the emulator state FIRST.**

**Before stopping:**
```bash
firebase emulators:export emulator-data/lia-sessions/lia-2026-04-26-pause
```

**When resuming:**
```bash
firebase emulators:start --import=emulator-data/lia-sessions/lia-2026-04-26-pause
```

> ⚠️ If you forget to export before stopping, all emulator data (users, Firestore docs, Storage files) is permanently lost. You must restart from Phase 1.

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

---

## PHASE 0 — Pre-Flight Checks

> All items in this phase are **blocking**. Do NOT proceed to Phase 1 if any fail.

| # | Status | Step | Tags |
|---|--------|------|------|
| 0.1 | ⬜ | **Build compiles without errors:** Run `npm run build` and verify zero errors | `[AUTO]` `[CRITICAL]` |
| 0.2 | ⬜ | **No TypeScript errors:** Run `npx tsc --noEmit` and verify clean output | `[AUTO]` `[CRITICAL]` |
| 0.3 | ⬜ | **Lint passes:** Run `npm run lint` with 0 errors | `[AUTO]` `[CRITICAL]` |
| 0.4 | ⬜ | **Unit test suite passes:** Run `npm run test` and verify all tests green | `[AUTO]` `[CRITICAL]` |
| 0.5 | ⬜ | **Firebase emulator is running:** Verify emulator UI accessible at `http://127.0.0.1:4000` | `[MANUAL]` `[CRITICAL]` |
| 0.6 | ⬜ | **Environment variables present:** Verify `.env`/`.env.local` has all `VITE_*` keys, `VITE_USE_EMULATORS` set correctly | `[MANUAL]` `[CRITICAL]` |
| 0.7 | ⬜ | **No leftover test data:** Verify Firestore has no `Academia DLP Test` institution from a prior run | `[HYBRID]` `[CRITICAL]` |
| 0.8 | ⬜ | **No leftover Auth users:** Verify Firebase Auth has no `lia-*` accounts from prior runs | `[HYBRID]` `[CRITICAL]` |
| 0.9 | ⬜ | **App runs in browser:** Navigate to `http://localhost:5173` and verify app loads without console errors | `[MANUAL]` `[CRITICAL]` |
| 0.10 | ⬜ | **Complete environment-snapshot.md:** Record git branch, commit hash, Firebase target, and date before starting | `[MANUAL]` `[CRITICAL]` |
| 0.11 | ⬜ | **Open live pages in VSCode:** Open the DLP web app (`http://localhost:5173`) and Firebase Emulator UI (`http://127.0.0.1:4000`) via VSCode Simple Browser (Ctrl+Shift+P → "Simple Browser: Show") or external browser. Confirm both accessible. | `[MANUAL]` `[HIGH]` |

**Phase 0 Result:** ⬜ PASS / ❌ FAIL

---

## PHASE 1 — Institution Provisioning (Global Admin)

> **Prerequisite:** Phase 0 complete.

| # | Status | Step | Tags |
|---|--------|------|------|
| 1.1 | ⬜ | **Global admin login:** Log in with global admin credentials. Verify redirect to admin dashboard. | `[MANUAL]` `[CRITICAL]` |
| 1.2 | ⬜ | **Admin dashboard renders:** Institutions list loads, search and pagination work, no console errors | `[MANUAL]` `[HIGH]` |
| 1.3 | ⬜ | **Create institution — form validation:** Attempt to submit empty form. Verify required field errors appear. | `[MANUAL]` `[MEDIUM]` |
| 1.4 | ⬜ | **Create institution — successful creation:** Fill form. Submit and verify institution appears in list. | `[MANUAL]` `[CRITICAL]` |
| 1.5 | ⬜ | **Verify institution document in Firestore:** Check `institutions/{id}` has correct fields: `name`, `domain`, `type`, `city`, `country`, `timezone`, `enabled: true`, `createdAt`. | `[HYBRID]` `[CRITICAL]` |
| 1.6 | ⬜ | **Create institution admin invite:** Create a direct invite for `lia-admin@prueba.dlp-test.internal` with role `institutionadmin`. | `[MANUAL]` `[CRITICAL]` |
| 1.7 | ⬜ | **Verify invite document in Firestore:** Check `institution_invites/{id}` has `email`, `role: 'institutionadmin'`, `institutionId`, `invitedAt`. | `[HYBRID]` `[CRITICAL]` |
| 1.8 | ⬜ | **Create institutional access code:** Create code `LIA-TEST-2026` in the institution's invite code section. | `[MANUAL]` `[CRITICAL]` |
| 1.9 | ⬜ | **Verify institutional code document in Firestore:** Check code doc has `type: 'institutional'` and correct `institutionId`. | `[HYBRID]` `[CRITICAL]` |
| 1.10 | ⬜ | **Global admin logout:** Log out cleanly. Verify redirect to login page. | `[MANUAL]` `[HIGH]` |

**Phase 1 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## PHASE 2 — Institution Admin Onboarding

> **Prerequisite:** Phase 1 complete.

| # | Status | Step | Tags |
|---|--------|------|------|
| 2.1 | ⬜ | **Navigate to registration:** Go to `/register`. Verify page loads with user type selection. | `[MANUAL]` `[HIGH]` |
| 2.2 | ⬜ | **Registration form validation:** Attempt to submit empty form. Verify all required field errors. | `[MANUAL]` `[MEDIUM]` |
| 2.3 | ⬜ | **Register institution admin:** Fill form. Enter invite code for `lia-admin@prueba.dlp-test.internal`. Submit. | `[MANUAL]` `[CRITICAL]` |
| 2.4 | ⬜ | **Invite code validation (Cloud Function):** Verify `validateInstitutionalAccessCode` called. No timeout or cold-start error. | `[HYBRID]` `[CRITICAL]` |
| 2.5 | ⬜ | **Firebase Auth user created:** Verify user account exists in Firebase Auth. | `[HYBRID]` `[CRITICAL]` |
| 2.6 | ⬜ | **User document created in Firestore:** Check `users/{uid}` has `role: 'institutionadmin'`, `institutionId`, `email`, `firstName`, `lastName`, `createdAt`. | `[HYBRID]` `[CRITICAL]` |
| 2.7 | ⬜ | **Email verification redirect:** Verify user is redirected to `/verify-email?registered=true`. | `[MANUAL]` `[HIGH]` |
| 2.8 | ⬜ | **Email verification guard (if enforced):** Verify unverified user cannot access protected routes. | `[MANUAL]` `[MEDIUM]` |
| 2.9 | ⬜ | **Institution admin login after verification:** Log in as `lia-admin@prueba.dlp-test.internal`. | `[MANUAL]` `[CRITICAL]` |
| 2.10 | ⬜ | **Institution admin dashboard access:** Verify redirect to institution admin dashboard. Verify correct institution name displays. | `[MANUAL]` `[CRITICAL]` |
| 2.11 | ⬜ | **Dashboard tabs render:** Verify all tabs load: Users, Organization, Settings, Customization. No console errors. | `[MANUAL]` `[HIGH]` |
| 2.12 | ⬜ | **Settings tab — institution policy configuration:** Set `allowTeacherAutonomousSubjectCreation: true`. Save. | `[MANUAL]` `[HIGH]` |
| 2.13 | ⬜ | **Verify settings saved in Firestore:** Check `institutions/{id}.accessPolicies` has correct values after save. | `[HYBRID]` `[HIGH]` |
| 2.14 | ⬜ | **Customization tab — branding setup:** Set primary color `#1e40af`, secondary color `#10b981`, institution display name `Academia LIA Test`. Save. | `[MANUAL]` `[MEDIUM]` |
| 2.15 | ⬜ | **Verify customization in Firestore:** Check `institutions/{id}.customization` has correct values. | `[HYBRID]` `[MEDIUM]` |
| 2.16 | ⬜ | **Branding applied in UI:** Reload. Verify institution display name and primary color appear in header/theme. | `[MANUAL]` `[MEDIUM]` |
| 2.17 | ⬜ | **Access code management — view existing code:** Verify the institutional access code `LIA-TEST-2026` is visible in the Users tab. | `[MANUAL]` `[MEDIUM]` |

**Phase 2 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

### PHASE 2B — Institution Admin Deep Feature Audit

> Steps that test features not yet implemented must be logged as **GAP items** in `findings.md` — not as failures unless `[CRITICAL]`.

| # | Status | Step | Tags |
|---|--------|------|------|
| 2.18 | ⬜ | **Organization tab renders:** Verify the Organization tab is accessible and shows class management controls. | `[MANUAL]` `[HIGH]` |
| 2.19 | ⬜ | **Pending teacher invites list:** In Users → Profesores, verify pending invites are distinguishable from active teachers ("Pendiente"). If absent, log as GAP. | `[MANUAL]` `[MEDIUM]` |
| 2.20 | ⬜ | **Cancel pending invite:** Attempt to cancel a pending teacher invite. Verify invite doc deleted. If UI absent, log as GAP. | `[MANUAL]` `[MEDIUM]` |
| 2.21 | ⬜ | **Remove teacher from institution:** Verify institution admin can remove a teacher via Users tab. If absent, log as GAP. | `[MANUAL]` `[HIGH]` |
| 2.22 | ⬜ | **Remove student from institution:** Verify same removal capability for students. If absent, log as GAP. | `[MANUAL]` `[HIGH]` |
| 2.23 | ⬜ | **Regenerate institutional access code:** Trigger regeneration. Verify new code issued (8 chars, no I/O/0/1), old code fails. Verify Firestore updated. | `[HYBRID]` `[HIGH]` |
| 2.24 | ⬜ | **Disable institutional access code:** Disable the code. Attempt student registration with it — must fail. Re-enable. If UI absent, log as GAP. | `[MANUAL]` `[MEDIUM]` |
| 2.25 | ⬜ | **Settings — all policy toggles save and persist:** Toggle every available policy. Reload. Verify all states persist in Firestore `accessPolicies`. | `[HYBRID]` `[HIGH]` |
| 2.26 | ⬜ | **Settings — academic calendar configuration:** Verify calendar settings (start/end date, term labels). Test save. If absent, log as GAP. | `[MANUAL]` `[MEDIUM]` |
| 2.27 | ⬜ | **Settings — automation settings:** Verify automation options present. Test save. If absent, log as GAP. | `[MANUAL]` `[MEDIUM]` |
| 2.28 | ⬜ | **Settings — granular teacher permissions:** Verify individual teacher permissions configurable. If absent, log as GAP. | `[MANUAL]` `[MEDIUM]` |
| 2.29 | ⬜ | **Customization — logo upload:** Upload institution logo. Verify Storage upload + preview. If absent, log as GAP. | `[MANUAL]` `[MEDIUM]` |
| 2.30 | ⬜ | **Customization — live color preview:** Verify changing colors shows real-time preview without save-reload. | `[MANUAL]` `[HIGH]` |
| 2.31 | ⬜ | **Customization — save and full-reload persistence:** After saving, hard-reload. Verify custom colors and name persist. Check Firestore. | `[HYBRID]` `[HIGH]` |
| 2.32 | ⬜ | **Customization — student-facing theme application:** Login as student. Verify institution's custom branding appears on student home. | `[MANUAL]` `[HIGH]` |
| 2.33 | ⬜ | **Customization — reset to defaults:** Verify "reset branding" option exists. If absent, log as GAP. | `[MANUAL]` `[LOW]` |
| 2.34 | ⬜ | **User search and filter:** Search for user by name/email in Users tab. Verify filtering works. If absent, log as GAP. | `[MANUAL]` `[MEDIUM]` |
| 2.35 | ⬜ | **Bulk user management:** Verify bulk operations available (select multiple, bulk deactivate). If absent, log as GAP. | `[MANUAL]` `[LOW]` |
| 2.36 | ⬜ | **Audit / activity log:** Verify admin activity log accessible. If absent, log as GAP. | `[MANUAL]` `[LOW]` |
| 2.37 | ⬜ | **User profile detail view:** Click a user. Verify detail view opens with role, institution, email, join date, status. If absent, log as GAP. | `[MANUAL]` `[MEDIUM]` |

**Phase 2B Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## PHASE 3 — Teacher Management & Onboarding

> **Prerequisite:** Phase 2 complete.

| # | Status | Step | Tags |
|---|--------|------|------|
| 3.1 | ⬜ | **Invite Teacher A:** Send invite to `lia-teacher-a@prueba.dlp-test.internal`. | `[MANUAL]` `[CRITICAL]` |
| 3.2 | ⬜ | **Verify Teacher A invite in Firestore:** `institution_invites` has doc with `role: 'teacher'`, `institutionId`. | `[HYBRID]` `[CRITICAL]` |
| 3.3 | ⬜ | **Invite Teacher B:** Same for `lia-teacher-b@prueba.dlp-test.internal`. | `[MANUAL]` `[CRITICAL]` |
| 3.4 | ⬜ | **Verify Teacher B invite in Firestore.** | `[HYBRID]` `[CRITICAL]` |
| 3.5 | ⬜ | **Teacher A registration:** Register as `lia-teacher-a@prueba.dlp-test.internal` using institutional invite flow. | `[MANUAL]` `[CRITICAL]` |
| 3.6 | ⬜ | **Verify Teacher A user document:** `users/{uid}` has `role: 'teacher'`, `institutionId`, correct email and name. | `[HYBRID]` `[CRITICAL]` |
| 3.7 | ⬜ | **Teacher A login and dashboard access:** Login. Verify redirect to teacher home. No admin dashboard access. | `[MANUAL]` `[CRITICAL]` |
| 3.8 | ⬜ | **Teacher A cannot access institution admin dashboard:** Navigate directly. Verify access denied / redirect. | `[MANUAL]` `[CRITICAL]` |
| 3.9 | ⬜ | **Teacher B registration and verification:** Repeat 3.5-3.7 for Teacher B. | `[MANUAL]` `[CRITICAL]` |
| 3.10 | ⬜ | **Teachers visible in institution admin Users tab:** Both teachers appear in institution's teacher list. | `[MANUAL]` `[HIGH]` |
| 3.11 | ⬜ | **Teacher deletion control visible (validation only):** Verify delete option available in Users tab (do NOT delete). | `[MANUAL]` `[MEDIUM]` |

**Phase 3 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## PHASE 4 — Student Management & Onboarding

> **Prerequisite:** Phase 2 complete. Access code `LIA-TEST-2026` exists.

| # | Status | Step | Tags |
|---|--------|------|------|
| 4.1 | ⬜ | **Student 1 registration via institutional code:** Register `lia-student-1@prueba.dlp-test.internal` using `LIA-TEST-2026`. | `[MANUAL]` `[CRITICAL]` |
| 4.2 | ⬜ | **Verify Student 1 user document:** `users/{uid}` has `role: 'student'`, `institutionId`. | `[HYBRID]` `[CRITICAL]` |
| 4.3 | ⬜ | **Student 1 login and home page access:** Login. Verify home page. No admin/teacher UI visible. | `[MANUAL]` `[CRITICAL]` |
| 4.4 | ⬜ | **Student 1 cannot access admin or teacher dashboard.** | `[MANUAL]` `[CRITICAL]` |
| 4.5 | ⬜ | **Register Students 2–5:** Repeat 4.1-4.2 for all 5 students. | `[MANUAL]` `[CRITICAL]` |
| 4.6 | ⬜ | **All students visible in institution admin Users tab:** All 5 students appear in student list. | `[MANUAL]` `[HIGH]` |
| 4.7 | ⬜ | **Student profile completeness:** Verify each student profile has firstName, lastName, email, role, institutionId, createdAt. | `[HYBRID]` `[HIGH]` |

**Phase 4 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## PHASE 5 — Subject & Course Creation

> **Prerequisite:** Phase 3 complete.

| # | Status | Step | Tags |
|---|--------|------|------|
| 5.1 | ⬜ | **Teacher A creates Matemáticas Test:** Login as Teacher A. Use subject creation form. Submit. | `[MANUAL]` `[CRITICAL]` |
| 5.2 | ⬜ | **Verify Matemáticas Test subject document:** `subjects/{id}` has `name`, `ownerId: teacherA.uid`, `institutionId`, `inviteCode` (8 chars), `inviteCodeEnabled: true`, `createdAt`. | `[HYBRID]` `[CRITICAL]` |
| 5.3 | ⬜ | **Verify invite code collision prevention:** `subjectInviteCodes` has doc for the generated code. | `[HYBRID]` `[HIGH]` |
| 5.4 | ⬜ | **Teacher B creates Ciencias Test:** Login as Teacher B. Repeat 5.1-5.3. | `[MANUAL]` `[CRITICAL]` |
| 5.5 | ⬜ | **Institution admin creates Historia Test:** Login as institution admin. Verify institution admin can create subjects. Create Historia Test. | `[MANUAL]` `[CRITICAL]` |
| 5.6 | ⬜ | **Subject invite codes are unique:** Three subjects have different invite codes. | `[HYBRID]` `[HIGH]` |
| 5.7 | ⬜ | **Subject visible on home page for creator:** Each teacher/admin sees their created subject on home page. | `[MANUAL]` `[HIGH]` |
| 5.8 | ⬜ | **Subject validation — duplicate name guard:** Attempt to create a second "Matemáticas Test" as Teacher A. Verify validation error (if uniqueness enforced). | `[MANUAL]` `[MEDIUM]` |
| 5.9 | ⬜ | **Subject invite code rotation (if UI available):** In subject settings, verify invite code rotation is configurable. | `[MANUAL]` `[MEDIUM]` |
| 5.10 | ⬜ | **Teacher cannot create subject if institution policy disables it:** Change policy to `allowTeacherAutonomousSubjectCreation: false`. Verify Teacher A gets permission error. Reset policy after. | `[HYBRID]` `[HIGH]` |
| 5.11 | ⬜ | **Subject settings page accessible:** Navigate to subject settings/edit view. Verify name, description, invite code, visibility settings are accessible. | `[MANUAL]` `[HIGH]` |
| 5.12 | ⬜ | **Edit subject name and description:** Update name/description. Save. Verify Firestore `subjects/{id}` updated and home page reflects change. | `[MANUAL]` `[MEDIUM]` |
| 5.13 | ⬜ | **Subject invite code enable/disable:** Toggle invite code off. Attempt student self-enrollment — must fail. Re-enable. Verify enrollment works again. | `[MANUAL]` `[HIGH]` |
| 5.14 | ⬜ | **Subject invite code rotation:** Rotate (regenerate) the invite code. Verify old code invalidated. New code follows 8-char format. `subjectInviteCodes` updated atomically. | `[HYBRID]` `[HIGH]` |
| 5.15 | ⬜ | **Subject folder/section creation (if applicable):** Verify topics can be organized into folders/sections. Attempt to create "Unidad 1". If absent, log as GAP. | `[MANUAL]` `[MEDIUM]` |
| 5.16 | ⬜ | **Subject visibility to institution admin:** Verify institution admin sees ALL subjects across all teachers within their institution — not just own. | `[MANUAL]` `[HIGH]` |
| 5.17 | ⬜ | **Subject archive/deactivation:** Verify if subject can be archived without deleting. Verify archived subjects hidden from students. If absent, log as GAP. | `[MANUAL]` `[HIGH]` |
| 5.18 | ⬜ | **Subject deletion — enrolled students behavior:** Attempt to delete a subject with enrolled students. Verify system prevents or warns. Log actual behavior. | `[MANUAL]` `[HIGH]` |
| 5.19 | ⬜ | **Enrolled students list in subject:** Verify teacher can see enrolled students list from subject page/settings. If absent, log as GAP. | `[MANUAL]` `[MEDIUM]` |
| 5.20 | ⬜ | **Subject course metadata:** Verify subjects support course-level metadata (level, code, credits, year). If absent, log as GAP. | `[MANUAL]` `[LOW]` |

**Phase 5 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## PHASE 6 — Class & Teacher Assignment

> **Prerequisite:** Phase 5 complete.

| # | Status | Step | Tags |
|---|--------|------|------|
| 6.1 | ⬜ | **Create Clase A Test:** Log in as institution admin. In Organization tab, create class `Clase A Test`. | `[MANUAL]` `[CRITICAL]` |
| 6.2 | ⬜ | **Verify Clase A document in Firestore:** `classes/{id}` has `name`, `institutionId`, `status: 'active'`, `studentIds: []`. | `[HYBRID]` `[CRITICAL]` |
| 6.3 | ⬜ | **Create Clase B Test.** | `[MANUAL]` `[CRITICAL]` |
| 6.4 | ⬜ | **Link Matemáticas Test to Clase A Test.** | `[MANUAL]` `[CRITICAL]` |
| 6.5 | ⬜ | **Verify classIds on Matemáticas Test:** `subjects/{id}.classIds` contains Clase A's ID. | `[HYBRID]` `[CRITICAL]` |
| 6.6 | ⬜ | **Link Ciencias Test to Clase B Test.** | `[MANUAL]` `[CRITICAL]` |
| 6.7 | ⬜ | **Link Historia Test to both classes.** | `[MANUAL]` `[HIGH]` |
| 6.8 | ⬜ | **Add Students 1, 2, 5 to Clase A Test.** | `[MANUAL]` `[CRITICAL]` |
| 6.9 | ⬜ | **Verify studentIds in Clase A:** `classes/{claseAId}.studentIds` contains UIDs of S1, S2, S5. | `[HYBRID]` `[CRITICAL]` |
| 6.10 | ⬜ | **Add Students 3, 4, 5 to Clase B Test.** | `[MANUAL]` `[CRITICAL]` |
| 6.11 | ⬜ | **Student access via class enrollment:** Login as Student 1 (Clase A). Verify Matemáticas Test appears. Ciencias Test (Clase B only) does NOT appear. | `[MANUAL]` `[CRITICAL]` |
| 6.12 | ⬜ | **Student 5 sees subjects from both classes.** | `[MANUAL]` `[HIGH]` |
| 6.13 | ⬜ | **Student self-enrollment via invite code:** Login as Student 3. Enter Historia Test invite code. Verify enrollment succeeds. | `[MANUAL]` `[HIGH]` |
| 6.14 | ⬜ | **Student not in any class sees no subjects.** | `[MANUAL]` `[HIGH]` |
| 6.15 | ⬜ | **Teacher A sees Matemáticas Test but not Ciencias Test.** | `[MANUAL]` `[HIGH]` |
| 6.16 | ⬜ | **Teacher B sees Ciencias Test but not Matemáticas Test.** | `[MANUAL]` `[HIGH]` |
| 6.17 | ⬜ | **Class rename:** Rename "Clase A Test" to "Clase A — Editada". Verify updated in Firestore and admin Organization tab. | `[MANUAL]` `[MEDIUM]` |
| 6.18 | ⬜ | **Remove student from class:** Remove Student 2 from Clase A. Verify `classes/{claseAId}.studentIds` no longer contains Student 2's UID. | `[HYBRID]` `[HIGH]` |
| 6.19 | ⬜ | **Removed student loses subject access:** After removing Student 2 from Clase A, login as Student 2. Verify Matemáticas Test no longer appears. | `[MANUAL]` `[CRITICAL]` |
| 6.20 | ⬜ | **Class roster view:** Verify admin can view full student roster per class. If absent, log as GAP. | `[MANUAL]` `[MEDIUM]` |
| 6.21 | ⬜ | **Subject-to-class unlink:** Unlink Ciencias Test from Clase B. Verify students in Clase B lose access. | `[MANUAL]` `[HIGH]` |
| 6.22 | ⬜ | **Assign multiple subjects to one class:** Link Matemáticas Test and Historia Test to Clase A simultaneously. Verify students in Clase A see both. | `[MANUAL]` `[HIGH]` |
| 6.23 | ⬜ | **Class deletion:** Delete Clase B Test. Verify class doc removed. Students still exist as users. | `[MANUAL]` `[HIGH]` |
| 6.24 | ⬜ | **Class deletion — linked subject cleanup:** After deleting Clase B, verify Ciencias Test's `classIds` no longer contains Clase B's ID. | `[HYBRID]` `[HIGH]` |
| 6.25 | ⬜ | **Teacher class visibility:** Login as Teacher A. Verify Teacher A can see which classes are linked to their subjects. If absent, log as GAP. | `[MANUAL]` `[MEDIUM]` |
| 6.26 | ⬜ | **Transfer student between classes:** Move Student 3 from Clase B to Clase A. Verify Firestore `studentIds` updated in both. Student 3's accessible subjects update. | `[MANUAL]` `[HIGH]` |
| 6.27 | ⬜ | **Bulk add students to class (if available):** Verify bulk student import/add option exists. If absent, log as GAP. | `[MANUAL]` `[LOW]` |

**Phase 6 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## PHASE 7 — Content Management

> **Prerequisite:** Phase 6 complete.

| # | Status | Step | Tags |
|---|--------|------|------|
| 7.1 | ⬜ | **Teacher A navigates to Matemáticas Test:** Verify subject page loads with topics list (empty initially). | `[MANUAL]` `[HIGH]` |
| 7.2 | ⬜ | **Teacher A creates Topic 1 — Álgebra Básica:** Fill required fields. Submit. | `[MANUAL]` `[CRITICAL]` |
| 7.3 | ⬜ | **Verify topic document in Firestore:** `topics/{id}` has `name`, `number: '01'`, `order: 1`, `subjectId`, `ownerId`, `institutionId`. | `[HYBRID]` `[CRITICAL]` |
| 7.4 | ⬜ | **Verify subject topicCount incremented:** `subjects/{subjectId}.topicCount` is now `1`. | `[HYBRID]` `[HIGH]` |
| 7.5 | ⬜ | **Topic navigation:** Click Topic 1 from subject page. Verify topic detail page loads. | `[MANUAL]` `[HIGH]` |
| 7.6 | ⬜ | **Upload document resource to Topic 1:** Upload a test file. Verify it appears in documents subcollection. | `[MANUAL]` `[HIGH]` |
| 7.7 | ⬜ | **Verify document in Firestore subcollection:** `topics/{topicId}/documents/{docId}` has correct fields. | `[HYBRID]` `[HIGH]` |
| 7.8 | ⬜ | **Create quiz in Topic 1:** Create quiz with 3 questions. Save. | `[MANUAL]` `[HIGH]` |
| 7.9 | ⬜ | **Verify quiz in Firestore subcollection:** `topics/{topicId}/quizzes/{quizId}` has correct fields and questions array. | `[HYBRID]` `[HIGH]` |
| 7.10 | ⬜ | **Teacher A creates Topic 2 — Geometría.** | `[MANUAL]` `[HIGH]` |
| 7.11 | ⬜ | **Verify topic order and numbering:** Topic 1 = `number: '01'`, Topic 2 = `number: '02'`. | `[HYBRID]` `[MEDIUM]` |
| 7.12 | ⬜ | **Teacher B creates Topic 1 in Ciencias Test.** | `[MANUAL]` `[HIGH]` |
| 7.13 | ⬜ | **Student accesses topic content:** Login as Student 1. Navigate to Matemáticas Test → Topic 1. Document and quiz visible (read-only). | `[MANUAL]` `[CRITICAL]` |
| 7.14 | ⬜ | **Student takes quiz:** Student 1 starts and submits the quiz. Result saved to `quiz_results` subcollection. | `[MANUAL]` `[HIGH]` |
| 7.15 | ⬜ | **Student cannot edit content:** No edit/delete controls visible for Student 1. | `[MANUAL]` `[CRITICAL]` |
| 7.16 | ⬜ | **Content not visible to uninvited students:** Login as Student 3 (not in Clase A). Verify Matemáticas Test NOT accessible. | `[MANUAL]` `[CRITICAL]` |

**Phase 7 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## PHASE 8 — Permission Boundary Validation

> **Prerequisite:** All previous phases complete.

| # | Status | Step | Tags |
|---|--------|------|------|
| 8.1 | ⬜ | **Student cannot create subjects:** Login as Student 1. UI control absent, direct route blocked. | `[MANUAL]` `[CRITICAL]` |
| 8.2 | ⬜ | **Student cannot read cross-institution subjects:** Attempt read of subject with different `institutionId`. Firestore rules deny. | `[HYBRID]` `[CRITICAL]` |
| 8.3 | ⬜ | **Teacher cannot access institution admin dashboard (re-verify).** | `[MANUAL]` `[CRITICAL]` |
| 8.4 | ⬜ | **Teacher cannot modify institution settings:** Attempt direct Firestore write to `institutions/{id}.accessPolicies` as teacher. Rules deny. | `[HYBRID]` `[CRITICAL]` |
| 8.5 | ⬜ | **Institution admin cannot promote user to global admin:** Attempt to set `role: 'admin'`. Firestore rules deny. | `[HYBRID]` `[CRITICAL]` |
| 8.6 | ⬜ | **Institution admin cannot see other institution's data:** Query `users` where `institutionId != ownId`. Verify empty result. | `[HYBRID]` `[CRITICAL]` |
| 8.7 | ⬜ | **Cross-institution subject access denied:** Attempt to add subject from Institution A to user in Institution B. Firestore rules deny. | `[HYBRID]` `[CRITICAL]` |
| 8.8 | ⬜ | **Unauthenticated reads denied on all collections:** Test `subjects`, `users`, `topics` without auth token. All deny. | `[HYBRID]` `[CRITICAL]` |
| 8.9 | ⬜ | **Role field cannot be set to admin/institutionadmin via client:** Verify Firestore rule prevents client-side `role: 'admin'` on user create. | `[HYBRID]` `[CRITICAL]` |
| 8.10 | ⬜ | **Used invite code cannot be reused:** After Teacher A signed up, attempt signup with same invite data. Must fail. | `[HYBRID]` `[HIGH]` |
| 8.11 | ⬜ | **Subject invite code uniqueness enforced atomically.** | `[AUTO]` `[HIGH]` |
| 8.12 | ⬜ | **Student cannot enroll in subject from another institution via invite code.** | `[HYBRID]` `[CRITICAL]` |

**Phase 8 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## PHASE 9 — Regression Baseline

| # | Status | Step | Tags |
|---|--------|------|------|
| 9.1 | ⬜ | **Update global logs — working-features-baseline.md:** Log each phase that passed with today's date. | `[MANUAL]` — |
| 9.2 | ⬜ | **Update global logs — security-risks-registry.md:** Log any security findings from Phase 8. | `[MANUAL]` — |
| 9.3 | ⬜ | **Update global logs — regression-history.md:** Log any regressions vs prior run. | `[MANUAL]` — |
| 9.4 | ⬜ | **Update global logs — known-issues.md:** Log any non-blocking ⚠️ items. | `[MANUAL]` — |
| 9.5 | ⬜ | **Propose actions:** For every failure, issue, and security risk, create a proposed plan or architecture in `copilot/plans/todo/` or `copilot/architectures/todo/`. Log links in `findings.md`. | `[MANUAL]` — |
| 9.6 | ⬜ | **Archive LIA instance:** Move `active/lia-2026-04-26/` to `finished/`. | `[MANUAL]` — |
| 9.7 | ⬜ | **Export emulator snapshot BEFORE cleanup:** `firebase emulators:export emulator-data/lia-snapshots/lia-2026-04-26`. Verify folder created with `auth_export/`, `firestore_export/`, `storage_export/`. This enables LIA v2. | `[MANUAL]` `[HIGH]` |
| 9.8 | ⬜ | **Cleanup test data per TEST_INSTITUTION_SPEC.md cleanup procedure.** | `[MANUAL]` — |

**Phase 9 Result:** ⬜ PASS / ❌ FAIL

---

## PHASE 10 — UX Deep Analysis & Feature Gap Audit

### A — Institution Admin Perspective

| # | Status | Step | Tags |
|---|--------|------|------|
| 10.1 | ⬜ | **Dashboard discoverability:** Every action reachable within 2 clicks? Note navigation dead-ends. | `[MANUAL]` `[MEDIUM]` |
| 10.2 | ⬜ | **Settings clarity:** Policy toggles clearly labeled and described? Impact obvious? | `[MANUAL]` `[MEDIUM]` |
| 10.3 | ⬜ | **User management usability:** Clear how to invite, find, remove users? Bulk management possible? | `[MANUAL]` `[MEDIUM]` |
| 10.4 | ⬜ | **Feedback on actions:** Visual confirmation after saving settings / inviting users? | `[MANUAL]` `[LOW]` |
| 10.5 | ⬜ | **Missing admin features:** Log any expected feature that doesn't exist as GAP item. | `[MANUAL]` `[HIGH]` |

### B — Teacher Perspective

| # | Status | Step | Tags |
|---|--------|------|------|
| 10.6 | ⬜ | **Subject creation flow:** Intuitive? Invite code immediately visible after creation? | `[MANUAL]` `[MEDIUM]` |
| 10.7 | ⬜ | **Content organization:** Topics reorderable? Clear at 10+ topics? | `[MANUAL]` `[MEDIUM]` |
| 10.8 | ⬜ | **Quiz builder usability:** Smooth? Questions editable after save? Preview available? | `[MANUAL]` `[HIGH]` |
| 10.9 | ⬜ | **Student progress visibility:** Can teacher see who completed quizzes and scores? | `[MANUAL]` `[HIGH]` |
| 10.10 | ⬜ | **Missing teacher features:** Log any expected feature as GAP item. | `[MANUAL]` `[HIGH]` |

### C — Student Perspective

| # | Status | Step | Tags |
|---|--------|------|------|
| 10.11 | ⬜ | **First-time enrollment experience:** Clear how to join a subject? Access code flow explained? | `[MANUAL]` `[HIGH]` |
| 10.12 | ⬜ | **Subject home clarity:** After enrolling, clear what to do next? Topics organized logically? | `[MANUAL]` `[MEDIUM]` |
| 10.13 | ⬜ | **Quiz experience:** Clear how to start and submit? Result shown? Can student review answers? | `[MANUAL]` `[HIGH]` |
| 10.14 | ⬜ | **Document access:** Downloading/viewing intuitive? File types handled gracefully? | `[MANUAL]` `[MEDIUM]` |
| 10.15 | ⬜ | **Missing student features:** Log any expected feature as GAP item. | `[MANUAL]` `[HIGH]` |

### D — Adversarial / Hacker Perspective

| # | Status | Step | Tags |
|---|--------|------|------|
| 10.16 | ⬜ | **Attempt direct Firestore write as student to `subjects/`.** Verify denial. | `[HYBRID]` `[CRITICAL]` |
| 10.17 | ⬜ | **Intercept and replay invite:** Register twice with same invite code but different email. | `[MANUAL]` `[HIGH]` |
| 10.18 | ⬜ | **Direct URL navigation (route bypass):** Navigate to `/institution-admin/dashboard` as student. Route guard must redirect. | `[MANUAL]` `[CRITICAL]` |
| 10.19 | ⬜ | **Guess subject document ID:** Attempt to read Institution A's subject while authenticated as Institution B user. | `[HYBRID]` `[CRITICAL]` |
| 10.20 | ⬜ | **JWT token inspection:** Verify JWT does not contain access code or plain-text credentials. | `[MANUAL]` `[HIGH]` |
| 10.21 | ⬜ | **Storage URL bypass:** Obtain Storage URL. Access without auth (incognito). Storage rules must block. | `[MANUAL]` `[HIGH]` |
| 10.22 | ⬜ | **Self-escalation attempt:** As teacher, attempt to set own `role` to `institutionadmin`. Firestore must deny. | `[HYBRID]` `[CRITICAL]` |

### E — Feature Gap Analysis Summary

| # | Status | Step | Tags |
|---|--------|------|------|
| 10.23 | ⬜ | **Compile all GAP items** from steps 10.5, 10.10, 10.15 into `findings.md` "Feature Gaps" section. | `[MANUAL]` — |
| 10.24 | ⬜ | **Prioritize top 3 gaps:** Select 3 most impactful missing features. Note in `findings.md` as "Recommended Next Features". | `[MANUAL]` — |
| 10.25 | ⬜ | **Architecture update check:** If code behavior differed from architecture docs exercised in this LIA, update them. | `[MANUAL]` — |

**Phase 10 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## Overall LIA Result

| Phase | Result |
|-------|--------|
| Phase 0 — Pre-Flight | ⬜ |
| Phase 1 — Institution Provisioning | ⬜ |
| Phase 2 — Institution Admin Onboarding | ⬜ |
| Phase 2B — Institution Admin Deep Audit | ⬜ |
| Phase 3 — Teacher Management | ⬜ |
| Phase 4 — Student Management | ⬜ |
| Phase 5 — Subject Creation + Deep | ⬜ |
| Phase 6 — Class Assignment + Deep | ⬜ |
| Phase 7 — Content Management | ⬜ |
| Phase 8 — Permission Boundaries | ⬜ |
| Phase 9 — Regression Baseline | ⬜ |
| Phase 10 — UX & Feature Gap Audit | ⬜ |
| **OVERALL** | ⬜ |

## Summary Scorecard

| Phase | Total Steps | ✅ Passed | ❌ Failed | ⚠️ Issues | ⏭️ Skipped |
|-------|------------|---------|---------|---------|---------|
| Phase 0 | 11 | | | | |
| Phase 1 | 10 | | | | |
| Phase 2 | 17 | | | | |
| Phase 2B | 20 | | | | |
| Phase 3 | 11 | | | | |
| Phase 4 | 7 | | | | |
| Phase 5 | 20 | | | | |
| Phase 6 | 27 | | | | |
| Phase 7 | 16 | | | | |
| Phase 8 | 12 | | | | |
| Phase 9 | 8 | | | | |
| Phase 10 | 25 | | | | |
| **TOTAL** | **184** | | | | |
