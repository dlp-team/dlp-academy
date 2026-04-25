# Step Checklist — LIA v2 YYYY-MM-DD

> **LIA Instance:** `lia-v2-YYYY-MM-DD` | **Executor:** [EXECUTOR]  
> **Source Snapshot:** `emulator-data/lia-snapshots/[SOURCE-LIA-ID]/`  
> **Instructions:** Mark each step as you complete it. Log failures in `logs/failures.md`. Log every step in `logs/live-run-log.md`.

---

## ⏸️ PAUSE CHECKPOINT PROTOCOL (MANDATORY)

> **Every time you stop working on this LIA mid-run, export the emulator state FIRST.**

**Before stopping:**
```bash
firebase emulators:export emulator-data/lia-sessions/lia-v2-YYYY-MM-DD-pause
```

**When resuming:**
```bash
firebase emulators:start --import=emulator-data/lia-sessions/lia-v2-YYYY-MM-DD-pause
```

> ⚠️ If you forget to export, all in-progress emulator data is lost. You can restart by re-loading the original source snapshot at `emulator-data/lia-snapshots/[SOURCE-LIA-ID]/`, but any changes made during this run will be gone.

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

## PHASE 0 — Pre-Flight + Snapshot Load

> All items blocking. Do NOT proceed if any fail.

| # | Status | Step | Tags |
|---|--------|------|------|
| 0.1 | ⬜ | **Identify source snapshot:** Confirm which LIA v1 snapshot to use from `emulator-data/lia-snapshots/`. Record in `environment-snapshot.md`. | `[MANUAL]` `[CRITICAL]` |
| 0.2 | ⬜ | **Start emulator with snapshot:** Run `firebase emulators:start --import=emulator-data/lia-snapshots/[SOURCE-LIA-ID]`. Verify emulator UI loads at `http://127.0.0.1:4000`. | `[MANUAL]` `[CRITICAL]` |
| 0.3 | ⬜ | **Open DLP web app + Emulator UI in VSCode:** Open `http://localhost:5173` (DLP web app) and `http://127.0.0.1:4000` (Firebase Emulator UI) via VSCode Simple Browser (Ctrl+Shift+P → "Simple Browser: Show") or external browser. Confirm both accessible. | `[MANUAL]` `[HIGH]` |
| 0.4 | ⬜ | **App loads without console errors:** Navigate to `http://localhost:5173`, verify app renders correctly. Open browser console and confirm no critical errors. | `[MANUAL]` `[CRITICAL]` |
| 0.5 | ⬜ | **Build compiles:** Run `npm run build` and verify zero errors. | `[AUTO]` `[CRITICAL]` |
| 0.6 | ⬜ | **No TypeScript errors:** Run `npx tsc --noEmit` and verify clean output. | `[AUTO]` `[CRITICAL]` |
| 0.7 | ⬜ | **Unit tests pass:** Run `npm run test` and verify all green. | `[AUTO]` `[CRITICAL]` |
| 0.8 | ⬜ | **Log LIA STARTED in live-run-log.md:** Add first entry to `logs/live-run-log.md` with timestamp, executor, and snapshot reference. | `[MANUAL]` `[CRITICAL]` |
| 0.9 | ⬜ | **Complete environment-snapshot.md:** Record git branch, build version, snapshot path, emulator state. | `[MANUAL]` `[CRITICAL]` |

**Phase 0 Result:** ⬜ PASS / ❌ FAIL

---

## PHASE 1 — Snapshot Integrity Check

> Verify the imported snapshot contains all expected data from the source LIA v1 run.

| # | Status | Step | Tags |
|---|--------|------|------|
| 1.1 | ⬜ | **Institution exists in Firestore:** Query `institutions` collection. Verify test institution document is present with correct `name`, `institutionId`, `customization`, `accessPolicies`. | `[HYBRID]` `[CRITICAL]` |
| 1.2 | ⬜ | **All users present:** Verify Firestore `users` collection contains institution admin, both teachers, and all 5 students from the source LIA run. | `[HYBRID]` `[CRITICAL]` |
| 1.3 | ⬜ | **Institution admin login works:** Log in as the institution admin from the source LIA run. Verify dashboard loads correctly. | `[MANUAL]` `[CRITICAL]` |
| 1.4 | ⬜ | **Teacher 1 login works:** Log in as Teacher 1. Verify home page loads with correct subjects (if any were created in v1 run). | `[MANUAL]` `[CRITICAL]` |
| 1.5 | ⬜ | **Student 1 login works:** Log in as Student 1. Verify home page loads with correct subjects (if enrolled). | `[MANUAL]` `[CRITICAL]` |
| 1.6 | ⬜ | **Subjects present (if created in source LIA):** Verify all subjects created during the source LIA run appear in Firestore `subjects` collection. | `[HYBRID]` `[HIGH]` |
| 1.7 | ⬜ | **Classes present (if created in source LIA):** Verify all classes created during the source LIA run appear in Firestore `classes` collection with correct `studentIds`. | `[HYBRID]` `[HIGH]` |
| 1.8 | ⬜ | **Log Phase 1 complete in live-run-log.md.** | `[MANUAL]` — |

**Phase 1 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## PHASE 2 — Institution Admin Deep Feature Audit

> Focus: test all institution admin options not thoroughly covered in LIA v1. Log missing features as GAPs.

| # | Status | Step | Tags |
|---|--------|------|------|
| 2.1 | ⬜ | **Pending invites management:** In Users tab, check for pending teacher invites. If any present, attempt to cancel one. Verify invite doc deleted. If UI absent, log as GAP. | `[MANUAL]` `[MEDIUM]` |
| 2.2 | ⬜ | **Regenerate institutional access code:** Trigger access code regeneration. Verify new code is valid (8 chars, safe alphabet). Verify old code fails student registration. | `[MANUAL]` `[HIGH]` |
| 2.3 | ⬜ | **Disable institutional access code:** If option exists, disable the code. Attempt student registration — must fail. Re-enable. | `[MANUAL]` `[MEDIUM]` |
| 2.4 | ⬜ | **Remove teacher from institution:** Attempt to remove Teacher 2 via Users tab. Verify Firestore updated. Verify Teacher 2 can no longer access dashboard. If absent, log as GAP. | `[MANUAL]` `[HIGH]` |
| 2.5 | ⬜ | **Remove student from institution:** Attempt to remove Student 5 via Users tab. Verify Firestore updated. If absent, log as GAP. | `[MANUAL]` `[HIGH]` |
| 2.6 | ⬜ | **All policy toggles save and persist:** Toggle ALL available policies in Settings tab. Reload. Verify all saved in `institutions/{id}.accessPolicies`. | `[HYBRID]` `[HIGH]` |
| 2.7 | ⬜ | **Academic calendar settings:** Test save and persistence of academic calendar fields. If absent, log as GAP. | `[MANUAL]` `[MEDIUM]` |
| 2.8 | ⬜ | **Automation settings:** Test save and persistence. If absent, log as GAP. | `[MANUAL]` `[MEDIUM]` |
| 2.9 | ⬜ | **Logo upload:** Attempt to upload a logo image. Verify Firebase Storage upload + preview. If absent, log as GAP. | `[MANUAL]` `[MEDIUM]` |
| 2.10 | ⬜ | **Student-facing branding application:** Log in as a student. Verify institution's custom colors and name appear in student home. | `[MANUAL]` `[HIGH]` |
| 2.11 | ⬜ | **User search:** Search for a user by name/email in Users tab. Verify filtering works. If absent, log as GAP. | `[MANUAL]` `[MEDIUM]` |
| 2.12 | ⬜ | **User profile detail view:** Click a user in Users tab. Verify detail view opens with role, email, join date. If absent, log as GAP. | `[MANUAL]` `[MEDIUM]` |
| 2.13 | ⬜ | **Log Phase 2 complete in live-run-log.md.** | `[MANUAL]` — |

**Phase 2 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## PHASE 3 — Teacher Advanced Workflow

> Focus: subject management, invite code operations, content editing.

| # | Status | Step | Tags |
|---|--------|------|------|
| 3.1 | ⬜ | **Edit subject name:** Navigate to subject settings. Edit name and description. Save. Verify Firestore updated and home page reflects change. | `[MANUAL]` `[MEDIUM]` |
| 3.2 | ⬜ | **Subject invite code enable/disable:** Toggle invite code off. Attempt student enrollment — must fail. Toggle back on. | `[MANUAL]` `[HIGH]` |
| 3.3 | ⬜ | **Subject invite code rotation:** Rotate the invite code. Verify old code fails, new code works. Verify `subjectInviteCodes` updated atomically. | `[HYBRID]` `[HIGH]` |
| 3.4 | ⬜ | **Enrolled students list:** Verify teacher can see all enrolled students in a subject. If absent, log as GAP. | `[MANUAL]` `[MEDIUM]` |
| 3.5 | ⬜ | **Topic reordering (if available):** Attempt to reorder topics within a subject. Verify order persists after reload. If absent, log as GAP. | `[MANUAL]` `[MEDIUM]` |
| 3.6 | ⬜ | **Edit existing document:** Update the name/description of a previously uploaded document. Save. Verify Firestore updated. If absent, log as GAP. | `[MANUAL]` `[MEDIUM]` |
| 3.7 | ⬜ | **Delete document:** Delete a document from a topic. Verify doc removed from Firestore AND file removed from Firebase Storage. | `[HYBRID]` `[HIGH]` |
| 3.8 | ⬜ | **Edit quiz after creation:** Edit a quiz question. Save. Verify Firestore updated. If absent, log as GAP. | `[MANUAL]` `[HIGH]` |
| 3.9 | ⬜ | **Quiz preview:** Preview the quiz as if a student would see it. If absent, log as GAP. | `[MANUAL]` `[MEDIUM]` |
| 3.10 | ⬜ | **Student quiz result visibility for teacher:** Teacher views all students' quiz results in a topic. Verify correct data shown. | `[MANUAL]` `[HIGH]` |
| 3.11 | ⬜ | **Log Phase 3 complete in live-run-log.md.** | `[MANUAL]` — |

**Phase 3 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## PHASE 4 — Student Advanced Workflow

> Focus: quiz experience, progress visibility, enrollment edge cases.

| # | Status | Step | Tags |
|---|--------|------|------|
| 4.1 | ⬜ | **Quiz result shown after submission:** Student submits quiz. Verify result (score, correct answers) is displayed immediately after submission. | `[MANUAL]` `[HIGH]` |
| 4.2 | ⬜ | **Quiz answer review:** After submission, verify student can review which questions they got right/wrong. If absent, log as GAP. | `[MANUAL]` `[HIGH]` |
| 4.3 | ⬜ | **Student cannot see other students' results:** Login as Student 2. Verify Student 2 cannot see Student 1's quiz result. | `[HYBRID]` `[CRITICAL]` |
| 4.4 | ⬜ | **Self-enrollment via invite code:** Login as a student NOT enrolled in a subject. Enter the subject invite code on home page. Verify enrollment succeeds and subject appears. | `[MANUAL]` `[HIGH]` |
| 4.5 | ⬜ | **Enrollment UX clarity:** Is the process for self-enrolling clearly visible on the student home page? If not, log as GAP. | `[MANUAL]` `[MEDIUM]` |
| 4.6 | ⬜ | **Document viewing experience:** Student opens a document. Verify it loads correctly (PDF viewer or download). Log any broken file types. | `[MANUAL]` `[MEDIUM]` |
| 4.7 | ⬜ | **Subject home organization:** Is the topic list clearly organized? Are topics numbered? Is new content easy to find? Log UX observations. | `[MANUAL]` `[MEDIUM]` |
| 4.8 | ⬜ | **Log Phase 4 complete in live-run-log.md.** | `[MANUAL]` — |

**Phase 4 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## PHASE 5 — Class Management Deep Testing

> Focus: class operations not fully covered in LIA v1.

| # | Status | Step | Tags |
|---|--------|------|------|
| 5.1 | ⬜ | **Rename class:** Rename a class. Verify updated in Firestore and admin view. | `[MANUAL]` `[MEDIUM]` |
| 5.2 | ⬜ | **Remove student from class:** Remove Student 2 from their class. Verify `studentIds` updated. Verify Student 2 loses subject access. | `[MANUAL]` `[CRITICAL]` |
| 5.3 | ⬜ | **Class roster view:** Verify admin can see full student roster per class. If absent, log as GAP. | `[MANUAL]` `[MEDIUM]` |
| 5.4 | ⬜ | **Subject-to-class unlink:** Unlink a subject from a class. Verify students in the class lose access. | `[MANUAL]` `[HIGH]` |
| 5.5 | ⬜ | **Multiple subjects per class:** Link 2+ subjects to a class. Verify all show for enrolled students. | `[MANUAL]` `[HIGH]` |
| 5.6 | ⬜ | **Class deletion:** Delete a class. Verify Firestore cleanup. Verify students not deleted. | `[MANUAL]` `[HIGH]` |
| 5.7 | ⬜ | **Transfer student between classes:** Move a student from class A to class B. Verify subject access updates. | `[MANUAL]` `[HIGH]` |
| 5.8 | ⬜ | **Log Phase 5 complete in live-run-log.md.** | `[MANUAL]` — |

**Phase 5 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## PHASE 6 — Permission Edge Cases & Adversarial Testing

> Active security testing. Use Firestore emulator REST API and browser dev tools.

| # | Status | Step | Tags |
|---|--------|------|------|
| 6.1 | ⬜ | **Student Firestore write to subjects/ denied:** Use Firebase JS SDK as student to write to `subjects/`. Verify Firestore rules deny. | `[HYBRID]` `[CRITICAL]` |
| 6.2 | ⬜ | **Student Firestore read of other institution's subject denied:** Attempt to read a subject doc where `institutionId` differs from student's. Verify denied. | `[HYBRID]` `[CRITICAL]` |
| 6.3 | ⬜ | **Teacher cannot write to institutions/ collection:** Attempt `update institutions/{id}` as teacher. Verify denied. | `[HYBRID]` `[CRITICAL]` |
| 6.4 | ⬜ | **Self-escalation attempt:** As teacher, attempt to update own `users/{uid}.role` to `institutionadmin`. Verify Firestore rules deny. | `[HYBRID]` `[CRITICAL]` |
| 6.5 | ⬜ | **Used invite code cannot be replayed:** Attempt to register a new user using an already-consumed invite code. Verify denied. | `[HYBRID]` `[HIGH]` |
| 6.6 | ⬜ | **Unauthenticated Firestore reads denied:** Make Firestore read requests without auth token. All protected collections must deny. | `[HYBRID]` `[CRITICAL]` |
| 6.7 | ⬜ | **Route guard: student to admin page:** Navigate directly to `/institution-admin-dashboard` as student. Verify redirect. | `[MANUAL]` `[CRITICAL]` |
| 6.8 | ⬜ | **JWT inspection:** Decode the auth token. Verify no access codes or passwords are in the payload. | `[MANUAL]` `[HIGH]` |
| 6.9 | ⬜ | **Storage URL without auth:** Get a Firebase Storage file URL. Access it in an incognito window (no auth). Verify Storage rules block it. | `[MANUAL]` `[HIGH]` |
| 6.10 | ⬜ | **Log Phase 6 complete in live-run-log.md.** | `[MANUAL]` — |

**Phase 6 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## PHASE 7 — UX Gap Analysis

> Adopt all four mindsets: Institution Admin, Teacher, Student, Attacker. See MASTER_CHECKLIST.md Phase 10 for detailed steps.

| # | Status | Step | Tags |
|---|--------|------|------|
| 7.1 | ⬜ | **Institution Admin UX:** Dashboard discoverability, settings clarity, user management ease. Log all GAPs. | `[MANUAL]` `[HIGH]` |
| 7.2 | ⬜ | **Teacher UX:** Subject creation, content organization, quiz builder, student progress visibility. Log all GAPs. | `[MANUAL]` `[HIGH]` |
| 7.3 | ⬜ | **Student UX:** First-time enrollment clarity, subject home, quiz experience, document access. Log all GAPs. | `[MANUAL]` `[HIGH]` |
| 7.4 | ⬜ | **Attacker UX:** Active adversarial attempts. Already covered in Phase 6 — cross-reference findings. | `[MANUAL]` `[CRITICAL]` |
| 7.5 | ⬜ | **Compile all GAPs:** Gather all GAP items from Phases 2–7 into `findings.md` "Feature Gaps" section. | `[MANUAL]` — |
| 7.6 | ⬜ | **Prioritize top 3 gaps:** Select 3 most impactful gaps as "Recommended Next Features". | `[MANUAL]` — |
| 7.7 | ⬜ | **Log Phase 7 complete in live-run-log.md.** | `[MANUAL]` — |

**Phase 7 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## PHASE 8 — Regression Check vs Source LIA

| # | Status | Step | Tags |
|---|--------|------|------|
| 8.1 | ⬜ | **Compare findings with source LIA:** Open source LIA's `findings.md`. Verify any previously identified failures are now fixed (if applicable). If any regression found, log in global `regression-history.md`. | `[MANUAL]` — |
| 8.2 | ⬜ | **Update global logs:** Update `working-features-baseline.md` for this run. Sync new security findings to `security-risks-registry.md`. | `[MANUAL]` — |
| 8.3 | ⬜ | **Propose actions:** For every new failure/GAP found, create proposed plan or architecture. Log in `findings.md` under "Proposed Actions". | `[MANUAL]` — |
| 8.4 | ⬜ | **Archive LIA v2 instance:** Move `active/lia-v2-YYYY-MM-DD/` to `finished/`. | `[MANUAL]` — |
| 8.5 | ⬜ | **Log LIA COMPLETE in live-run-log.md.** | `[MANUAL]` `[CRITICAL]` |

**Phase 8 Result:** ⬜ PASS / ❌ FAIL

---

## Overall LIA v2 Result

| Phase | Result |
|-------|--------|
| Phase 0 — Pre-Flight + Snapshot Load | ⬜ |
| Phase 1 — Snapshot Integrity | ⬜ |
| Phase 2 — Institution Admin Deep Audit | ⬜ |
| Phase 3 — Teacher Advanced Workflow | ⬜ |
| Phase 4 — Student Advanced Workflow | ⬜ |
| Phase 5 — Class Management Deep | ⬜ |
| Phase 6 — Permission Edge Cases | ⬜ |
| Phase 7 — UX Gap Analysis | ⬜ |
| Phase 8 — Regression Check | ⬜ |

**Overall Result:** ⬜ Pending / ✅ Pass / ❌ Fail
