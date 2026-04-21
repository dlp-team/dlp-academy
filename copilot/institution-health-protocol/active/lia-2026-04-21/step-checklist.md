# Step Checklist — LIA 2026-04-21

> **LIA Instance:** `lia-2026-04-21` | **Executor:** *(fill in)*  
> **Source:** Instantiated from `templates/lia-instance-template/step-checklist.md`  
> **Instructions:** Mark each step as you complete it. Log failures in `logs/failures.md`.

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

| # | Status | Step | Tags |
|---|--------|------|------|
| 0.1 | ⬜ | **Build compiles without errors:** `npm run build` exits 0 | `[AUTO]` `[CRITICAL]` |
| 0.2 | ⬜ | **No TypeScript errors:** `npx tsc --noEmit` exits 0 | `[AUTO]` `[CRITICAL]` |
| 0.3 | ⬜ | **Lint passes:** `npm run lint` 0 errors | `[AUTO]` `[CRITICAL]` |
| 0.4 | ⬜ | **Unit tests pass:** `npm run test` all green | `[AUTO]` `[CRITICAL]` |
| 0.5 | ⬜ | **Firebase emulator running** or staging target confirmed | `[MANUAL]` `[CRITICAL]` |
| 0.6 | ⬜ | **Environment variables present:** `.env`/`.env.local` has all `VITE_*` keys | `[MANUAL]` `[CRITICAL]` |
| 0.7 | ⬜ | **No leftover test data:** Firestore has no prior `Academia de Prueba DLP` institution | `[HYBRID]` `[CRITICAL]` |
| 0.8 | ⬜ | **No leftover Auth users:** No `lia-*` accounts from prior runs | `[HYBRID]` `[CRITICAL]` |
| 0.9 | ⬜ | **App loads in browser:** `localhost:5173` loads without console errors | `[MANUAL]` `[CRITICAL]` |
| 0.10 | ⬜ | **Complete environment-snapshot.md** before starting | `[MANUAL]` `[CRITICAL]` |

**Phase 0 Result:** ⬜ PASS / ❌ FAIL

---

## PHASE 1 — Institution Provisioning (Global Admin)

| # | Status | Step |
|---|--------|------|
| 1.1 | ⬜ | Global admin logs in successfully |
| 1.2 | ⬜ | Admin dashboard renders |
| 1.3 | ⬜ | Create institution: "Academia de Prueba DLP" |
| 1.4 | ⬜ | Institution doc created in Firestore with correct fields |
| 1.5 | ⬜ | Institution appears in admin institution list |
| 1.6 | ⬜ | Create direct institutionadmin invite for `admin.lia.20260421@dlptest.dev` |
| 1.7 | ⬜ | Invite doc exists in `institution_invites` with `role: 'institutionadmin'` |
| 1.8 | ⬜ | Create institutional access code |
| 1.9 | ⬜ | Access code doc in Firestore with `type: 'institutional'`, 8-char code |
| 1.10 | ⬜ | Code is valid: 8 chars, only from alphabet (no I, O, 0, 1) |

**Phase 1 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## PHASE 2 — Institution Admin Onboarding

| # | Status | Step |
|---|--------|------|
| 2.1 | ⬜ | Register with invite: `admin.lia.20260421@dlptest.dev` |
| 2.2 | ⬜ | Firestore user doc created at `users/{uid}` |
| 2.3 | ⬜ | `role === 'institutionadmin'` |
| 2.4 | ⬜ | `institutionId` matches test institution |
| 2.5 | ⬜ | Invite doc deleted after use (or marked used) |
| 2.6 | ⬜ | Redirected to email verification page |
| 2.7 | ⬜ | Institution admin login succeeds |
| 2.8 | ⬜ | Institution admin dashboard loads |
| 2.9 | ⬜ | Users tab renders (teacher + student sections) |
| 2.10 | ⬜ | Settings tab renders with policy toggles |
| 2.11 | ⬜ | Customization tab renders with branding controls |
| 2.12 | ⬜ | Update institution display name, save and persist |
| 2.13 | ⬜ | Branding/colors applied in UI after save |
| 2.14 | ⬜ | Enable teacher subject creation policy, save and persist |

**Phase 2 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## PHASE 3 — Teacher Management

| # | Status | Step |
|---|--------|------|
| 3.1 | ⬜ | Institution admin creates teacher invite for `teacher1.lia.20260421@dlptest.dev` |
| 3.2 | ⬜ | Teacher invite doc in Firestore with `role: 'teacher'` |
| 3.3 | ⬜ | Create second teacher invite for `teacher2.lia.20260421@dlptest.dev` |
| 3.4 | ⬜ | Teacher 1 registers with invite |
| 3.5 | ⬜ | Teacher 1 user doc: `role === 'teacher'`, correct `institutionId` |
| 3.6 | ⬜ | Teacher 2 registers with invite |
| 3.7 | ⬜ | Teacher 2 user doc: `role === 'teacher'`, correct `institutionId` |
| 3.8 | ⬜ | Both teachers visible in institution admin Users tab (teacher list) |
| 3.9 | ⬜ | Teacher 1 login succeeds |
| 3.10 | ⬜ | Teacher 1 blocked from institution admin dashboard (route guard) |
| 3.11 | ⬜ | Teacher 2 login succeeds |
| 3.12 | ⬜ | Teacher 2 blocked from institution admin dashboard (route guard) |

**Phase 3 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## PHASE 4 — Student Management

| # | Status | Step |
|---|--------|------|
| 4.1 | ⬜ | Institution admin views institutional access code |
| 4.2 | ⬜ | Student 1 registers using institutional access code |
| 4.3 | ⬜ | Student 1 user doc: `role === 'student'`, correct `institutionId` |
| 4.4 | ⬜ | Student 2 registers using institutional access code |
| 4.5 | ⬜ | Student 3 registers using institutional access code |
| 4.6 | ⬜ | Student 4 registers using institutional access code |
| 4.7 | ⬜ | Student 5 registers using institutional access code |
| 4.8 | ⬜ | All 5 students visible in institution admin Users tab (student list) |
| 4.9 | ⬜ | Student 1 login succeeds |
| 4.10 | ⬜ | Student 1 blocked from institution admin dashboard |
| 4.11 | ⬜ | Student 1 home page shows no subjects yet |

**Phase 4 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## PHASE 5 — Subject Creation

| # | Status | Step |
|---|--------|------|
| 5.1 | ⬜ | Teacher 1 creates Subject A: "Matemáticas I" |
| 5.2 | ⬜ | Subject A created in Firestore with correct `ownerId`, `institutionId` |
| 5.3 | ⬜ | Invite code created atomically in `subjectInviteCodes` |
| 5.4 | ⬜ | Code format valid (8 chars, correct alphabet) |
| 5.5 | ⬜ | Subject A visible on Teacher 1's home page |
| 5.6 | ⬜ | Teacher 2 creates Subject B: "Historia Universal" |
| 5.7 | ⬜ | Subject B created in Firestore with correct owner |
| 5.8 | ⬜ | Subject A NOT visible on Teacher 2's home page |
| 5.9 | ⬜ | Subject B NOT visible on Teacher 1's home page |
| 5.10 | ⬜ | Both subjects visible on institution admin's subject view |
| 5.11 | ⬜ | Disable teacher subject creation policy |
| 5.12 | ⬜ | Teacher 1 cannot create another subject (blocked by policy) |
| 5.13 | ⬜ | Re-enable teacher subject creation policy |

**Phase 5 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## PHASE 6 — Class & Teacher Assignment

| # | Status | Step |
|---|--------|------|
| 6.1 | ⬜ | Institution admin creates Class A: "1ro Secundaria A" |
| 6.2 | ⬜ | Class A doc in Firestore with correct `institutionId` |
| 6.3 | ⬜ | Institution admin creates Class B: "1ro Secundaria B" |
| 6.4 | ⬜ | Add Students 1–4 to Class A |
| 6.5 | ⬜ | Class A `studentIds` contains all 4 students |
| 6.6 | ⬜ | Add Student 5 to Class A AND Class B |
| 6.7 | ⬜ | Assign Teacher 1 to Class A |
| 6.8 | ⬜ | Assign Teacher 2 to Class B |
| 6.9 | ⬜ | Link Class A to Subject A |
| 6.10 | ⬜ | Link Class B to Subject B |
| 6.11 | ⬜ | Class A students can now access Subject A |
| 6.12 | ⬜ | Class A students CANNOT access Subject B |
| 6.13 | ⬜ | Student 5 (in both classes) can access both subjects |
| 6.14 | ⬜ | Student not in any class sees no subjects on home |
| 6.15 | ⬜ | Teacher 1 sees Subject A but not Subject B |
| 6.16 | ⬜ | Teacher 2 sees Subject B but not Subject A |

**Phase 6 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## PHASE 7 — Content Management

| # | Status | Step |
|---|--------|------|
| 7.1 | ⬜ | Teacher 1 opens Subject A and creates Topic 1: "Álgebra Lineal" |
| 7.2 | ⬜ | Topic doc created in Firestore; `topicCount` incremented on Subject A |
| 7.3 | ⬜ | Teacher 1 creates Topic 2: "Geometría Euclidiana" |
| 7.4 | ⬜ | Teacher 1 uploads a PDF document to Topic 1 |
| 7.5 | ⬜ | Document file in Firebase Storage; doc in `topics/{id}/documents/` |
| 7.6 | ⬜ | Teacher 1 creates a quiz on Topic 1 (min. 3 questions) |
| 7.7 | ⬜ | Quiz and questions saved in Firestore subcollection |
| 7.8 | ⬜ | Student 1 (enrolled via Class A) opens Subject A |
| 7.9 | ⬜ | Student 1 sees Topic 1 and Topic 2 |
| 7.10 | ⬜ | Student 1 opens Topic 1, views document |
| 7.11 | ⬜ | Student 1 takes quiz, submits answers |
| 7.12 | ⬜ | Quiz result saved in `quiz_results` with correct `uid` |
| 7.13 | ⬜ | Student 1 cannot edit/delete content (read-only UI) |
| 7.14 | ⬜ | Teacher 2 (not enrolled in Subject A) cannot access Subject A topics |
| 7.15 | ⬜ | Student 2 (enrolled via Class A) sees same content as Student 1 |
| 7.16 | ⬜ | Student 2 cannot see Student 1's quiz result |
| 7.17 | ⬜ | Teacher 1 can see both students' quiz results |

**Phase 7 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## PHASE 8 — Permission Boundaries

| # | Status | Step |
|---|--------|------|
| 8.1 | ⬜ | Student UI: no subject creation button visible |
| 8.2 | ⬜ | [EMULATOR] Cross-institution subject read denied by Firestore rule |
| 8.3 | ⬜ | Teacher route guard: cannot access institution admin dashboard |
| 8.4 | ⬜ | [EMULATOR] Teacher cannot write to `institutions/{id}` |
| 8.5 | ⬜ | [EMULATOR] InstitutionAdmin cannot set `role: 'admin'` on a user |
| 8.6 | ⬜ | [EMULATOR] InstitutionAdmin user query scoped to own institution |
| 8.7 | ⬜ | [EMULATOR] Cross-institution subject → class assignment denied |
| 8.8 | ⬜ | [EMULATOR] Unauthenticated Firestore reads denied on all collections |
| 8.9 | ⬜ | [EMULATOR] User create with `role: 'admin'` denied |
| 8.10 | ⬜ | Used invite code cannot be reused for second registration |
| 8.11 | ⬜ | Invite code atomic collision retry works (no duplicate codes) |
| 8.12 | ⬜ | [EMULATOR] Cross-institution invite code enrollment denied |

**Phase 8 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## PHASE 9 — Baseline Verification & Cleanup

| # | Status | Step |
|---|--------|------|
| 9.1 | ⬜ | Update `working-features-baseline.md` column `lia-2026-04-21` with all ✅ |
| 9.2 | ⬜ | All new security findings added to `logs/security-findings.md` |
| 9.3 | ⬜ | All security findings synced to global `logs/security-risks-registry.md` |
| 9.4 | ⬜ | All failures added to `logs/failures.md` |
| 9.5 | ⬜ | All functional failures synced to global `logs/known-issues.md` |
| 9.6 | ⬜ | Any regressions added to global `logs/regression-history.md` |
| 9.7 | ⬜ | `findings.md` summary section completed with overall result |
| 9.8 | ⬜ | Test institution data cleaned from Firestore |
| 9.9 | ⬜ | Test Auth users cleaned |
| 9.10 | ⬜ | Move this LIA folder from `active/` to `finished/` |

**Phase 9 Result:** ⬜ PASS / ❌ FAIL

---

## PHASE 10 — UX Deep Analysis & Feature Gap Audit

### A — Institution Admin Perspective

| # | Status | Step |
|---|--------|------|
| 10.1 | ⬜ | Dashboard discoverability: every action reachable within 2 clicks? Log dead-ends. |
| 10.2 | ⬜ | Settings clarity: policy toggles clearly labeled with impact described? |
| 10.3 | ⬜ | User management usability: invite/find/remove flow clear? Bulk management possible? |
| 10.4 | ⬜ | Feedback on actions: visual confirmation after saving settings, inviting users? |
| 10.5 | ⬜ | Missing admin features: log any expected feature that doesn't exist as GAP item |

### B — Teacher Perspective

| # | Status | Step |
|---|--------|------|
| 10.6 | ⬜ | Subject creation: intuitive? Invite code immediately visible after creation? |
| 10.7 | ⬜ | Content organization: topics reorderable? Clear at 10+ topics? |
| 10.8 | ⬜ | Quiz builder: smooth? Questions editable after save? Preview available? |
| 10.9 | ⬜ | Student progress: can teacher easily see who completed quizzes and scores? |
| 10.10 | ⬜ | Missing teacher features: log any expected feature as GAP item |

### C — Student Perspective

| # | Status | Step |
|---|--------|------|
| 10.11 | ⬜ | First-time enrollment: enrollment flow clear? Access code UX explained? |
| 10.12 | ⬜ | Subject home clarity: clear what to do next after enrolling? |
| 10.13 | ⬜ | Quiz experience: clear how to start/submit? Result shown? Review possible? |
| 10.14 | ⬜ | Document access: viewing/downloading intuitive? File types handled gracefully? |
| 10.15 | ⬜ | Missing student features: log any expected feature as GAP item |

### D — Adversarial / Hacker Perspective

| # | Status | Step |
|---|--------|------|
| 10.16 | ⬜ | Direct Firestore write as student to `subjects/` — rule must deny |
| 10.17 | ⬜ | Replay used invite with different email — must fail |
| 10.18 | ⬜ | Navigate directly to `/institution-admin/dashboard` as student — must redirect |
| 10.19 | ⬜ | Read cross-institution subject doc by known ID — Firestore must deny |
| 10.20 | ⬜ | Inspect JWT token — no access codes or credentials in plain text |
| 10.21 | ⬜ | Access Firebase Storage URL without authentication — Storage rules must block |
| 10.22 | ⬜ | Self-escalation: update own `role` to `institutionadmin` — Firestore must deny |

### E — Gap Analysis Summary

| # | Status | Step |
|---|--------|------|
| 10.23 | ⬜ | Compile all GAP items into `findings.md` with: description, role, priority |
| 10.24 | ⬜ | Identify top 3 most impactful gaps as "Recommended Next Features" in `findings.md` |
| 10.25 | ⬜ | Architecture update check: if any behavior differed from architectures, update docs |

**Phase 10 Result:** ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## Overall LIA Result

| Phase | Result |
|-------|--------|
| Phase 0 — Pre-Flight | ⬜ |
| Phase 1 — Institution Provisioning | ⬜ |
| Phase 2 — Institution Admin Onboarding | ⬜ |
| Phase 3 — Teacher Management | ⬜ |
| Phase 4 — Student Management | ⬜ |
| Phase 5 — Subject Creation | ⬜ |
| Phase 6 — Class & Teacher Assignment | ⬜ |
| Phase 7 — Content Management | ⬜ |
| Phase 8 — Permission Boundaries | ⬜ |
| Phase 9 — Baseline & Cleanup | ⬜ |
| Phase 10 — UX & Feature Gap Audit | ⬜ |
| **OVERALL** | ⬜ |
