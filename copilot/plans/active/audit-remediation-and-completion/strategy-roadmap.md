<!-- copilot/plans/active/audit-remediation-and-completion/strategy-roadmap.md -->

# Strategy Roadmap: Audit Remediation & Completion

**Start Date:** April 1, 2026 | **Target Completion:** April 7, 2026 | **Status:** ACTIVE

## Phase Execution Timeline

```
WEEK OF APRIL 1-7, 2026

Day 1 (Apr 1):
  ├─ Phase 01: Type Safety & App.tsx Refactoring           [0-2h]  → ✅ COMPLETED
  └─ Phase 02: Console & Dead Code Cleanup                 [2-4h]  → ✅ COMPLETED (partial scope accepted)

Day 2 (Apr 2):
  ├─ Phase 03: Subject Data Structure Implementation        [6-8h]  → ✅ COMPLETED
  └─ Phase 04: Subject Access Query Redesign               [4-6h]  → ✅ COMPLETED

Day 3 (Apr 3):
  ├─ Phase 05: Large Component Splitting (Home.tsx)        [6-8h]  → ✅ COMPLETED
  └─ Phase 06: Large Component Splitting (AdminDashboard)  [4-6h]  → ✅ COMPLETED

Day 4 (Apr 4):
  ├─ Phase 07: Integration Tests & Workflow Coverage       [8-10h] → ✅ COMPLETED
  └─ Phase 08: Architecture Documentation                  [4-6h]  → ✅ COMPLETED

Day 5 (Apr 5):
  ├─ Phase 09: Teacher Subject Creation Permissions        [6-8h]  → 📋 TODO
  └─ Phase 10: Subject Completion Tracking (UI + Data)     [6-8h]  → 📋 TODO

Day 6-7 (Apr 6-7):
  ├─ Phase 11: Final Validation & Lossless Review          [4-6h]  → 📋 TODO
  └─ Phase 12: Closure & Finalization                      [2-3h]  → 📋 TODO
```

---

## Phase Details (Source of Truth)

### Phase 01: Type Safety & App.tsx Refactoring
**Status:** ✅ COMPLETED
**Owner:** DLP_Architect
**Duration:** 0-2 hours
**Priority:** 🔴 CRITICAL

**Objective:** Remove excessive `any` type casts in App.tsx that bypass TypeScript safety. Create proper prop interfaces for all pages.

**Key Changes:**
- App.tsx lines 40-59: Replace `const HomePage: any = Home;` pattern with proper TypeScript generics and component types
- Add `ComponentPageProps` interface definition
- Validate all page component imports use strict typing
- Enable TypeScript strict mode in tsconfig.json

**Validation:**
```bash
npm run lint                    # Must pass with 0 errors
npx tsc --noEmit              # Must have 0 type errors
npm run test                   # Baseline tests pass
```

**Risks:** None - isolated changes
**Rollback:** Revert App.tsx and tsconfig.json only

---

### Phase 02: Console & Dead Code Cleanup
**Status:** ⏳ IN PROGRESS
**Owner:** DLP_Architect
**Duration:** 2-4 hours
**Priority:** 🟡 HIGH

**Objective:** Remove production console statements and delete dead/copy code files.

**Key Changes:**
- Remove console.log/warn/error from:
  - src/hooks/useShortcuts.tsx (lines 437, 492, 520, 531, 537, 552, 571, 613)
  - src/components/layout/Header.tsx
  - Other hook files with debug statements
- Delete dead files:
  - src/pages/Content/StudyGuideEditorcopy.tsx
  - src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard copy.tsx
  - Other .copy or .backup files

**Validation:**
```bash
npm run lint                    # ESLint must pass
grep -r "console\." src/ --include="*.tsx" --include="*.ts"  # Must return 0
npm run test                   # All tests pass
```

**Risks:** None - search/replace operations only
**Rollback:** git checkout -- src/

---

### Phase 03: Subject Data Structure Implementation
**Status:** 📋 TODO
**Owner:** DLP_Architect
**Duration:** 6-8 hours
**Priority:** 🔴 CRITICAL

**Objective:** Implement mandatory subject schema evolution: add course, classId, enrolledStudentUids, inviteCode fields.

**Key Changes:**
- Update Firestore schema:
  - Add `course` (required): "Primary", "Secondary", "University"
  - Add `classId` (optional): Links to specific cohort for bulk access
  - Add `enrolledStudentUids` (array, default []): Individual student UIDs for invite code access
  - Add `inviteCode` (unique string): Auto-generated on subject creation
- Create migration script to backfill existing subjects with defaults
- Update subject creation flow in useSubjects.ts and page handlers
- Create Firestore indexes for new queryable fields

**Validation:**
```bash
firebase emulators:exec --only firestore "npm run test:rules"  # Rules tests pass with new fields
npm run test                   # Unit tests pass
# Load test with emulator: create 100+ subjects, verify indexes work
```

**Risks:** CRITICAL - Data migration risk; rollback requires restore
**Mitigation:** Test on emulator first, create backup, gradual rollout

---

### Phase 04: Subject Access Query Redesign
**Status:** 📋 TODO
**Owner:** DLP_Architect
**Duration:** 4-6 hours
**Priority:** 🔴 CRITICAL

**Objective:** Migrate subject queries from single-condition to OR-based logic:
- Teachers: `ownerId === userUid`
- Students (standard): `classId === userClassId`
- Students (guest): `ownerId === undefined AND enrolledStudentUids.includes(userUid)`

**Key Changes:**
- Update useSubjects.ts: Replace single `where()` clause with conditional logic
- Update useShortcuts.ts: Apply same OR-based access pattern
- Update subjectAccessUtils.ts: Create centralized access check function
- Update Firestore rules: Reflect new access vectors
- Create test suite for all three access patterns

**Validation:**
```bash
npm run test -- subjectAccessUtils.test.ts  # All 3 access vectors pass
npm run test:rules                          # Subject rules tests pass
npm run test                                # Full suite passes
```

**Risks:** HIGH - Query logic affects all subject access; potential for access regressions
**Mitigation:** Comprehensive test coverage before deployment

---

### Phase 05: Large Component Splitting (Home.tsx)
**Status:** ✅ COMPLETED
**Owner:** DLP_Architect
**Duration:** 6-8 hours
**Priority:** 🔴 CRITICAL

**Objective:** Split Home.tsx (950+ lines) into focused, maintainable modules per [ToDivide.md](../../ToDivide.md).

**Key Changes:**
- Extract `useHomeHandlers.ts`: All event handlers (drag, drop, rename, delete, etc.)
- Extract `useHomeState.ts`: All state management and initialization
- Extract `HomeModals.tsx`: Modal component tree (NewFolderModal, RenameFolderModal, etc.)
- Extract `HomeLo ader.tsx`: Loading and error boundary logic
- Extract `HomeMainContent.tsx`: Main grid/list UI rendering
- Home.tsx becomes: 300 lines coordinator that imports and composes above pieces
- Update imports in test files

**Validation:**
```bash
npm run lint                    # 0 errors
npx tsc --noEmit              # 0 type errors
npm run test -- Home          # Home + component tests pass
npm run dev                   # Home page renders identically
```

**Risks:** HIGH - Refactoring complexity
**Mitigation:** Lossless protocol; line-by-line verification; frequent commits

---

### Phase 06: Large Component Splitting (AdminDashboard)
**Status:** ✅ COMPLETED
**Owner:** DLP_Architect
**Duration:** 4-6 hours
**Priority:** 🟡 HIGH

**Objective:** Split AdminDashboard.tsx into coordinator-focused modules per [ToDivide.md](../../ToDivide.md) and stabilize related page workflows.

**Key Changes:**
- AdminDashboard.tsx → Extract: institution/users table rows, filters, form panel, and submit/pagination utilities
- AdminDashboard.tsx → Keep coordinator-focused tab composition and action routing
- Keep main components as coordinators
- Update all imports and tests

**Progress Snapshot (Apr 1):**
- AdminDashboard: extracted reusable table rows, filters components, institution form panel, and several utilities (email parsing, users/institutions filtering, pagination query, pagination response-state, confirm copy, role constants, institution form state, invite-sync, payload, validation).
- Expanded targeted admin regression suite to cover extracted modules with passing consolidated runs.

**Validation:**
```bash
npm run lint                    # 0 errors
npx tsc --noEmit              # 0 type errors
npm run test                   # All tests pass
npm run dev                   # Pages render identically
```

**Risks:** MEDIUM - Similar to Phase 5
**Rollback:** Revert split files and restore originals

---

### Phase 07: Integration & Page-Level Tests
**Status:** ✅ COMPLETED
**Owner:** DLP_Architect
**Duration:** 8-10 hours
**Priority:** 🟡 HIGH

**Objective:** Add integration/page-level test coverage for key workflows (currently ~5% coverage).

**Key Changes:**
- Added deterministic AdminDashboard page-level confirmation workflow coverage.
- Added deterministic StudyGuide page-level navigation workflow coverage (TOC and keyboard progression).
- Added deterministic invite security and governance coverage in hook and rules layers.

**Validation:**
```bash
npm run test                   # Full suite passes (target 60%+ coverage)
npm run test -- --coverage   # Generate coverage report
npm run lint                  # 0 errors
```

**Risks:** MEDIUM - New test logic must accurately reflect behavior
**Rollback:** Delete new test files if issues found

---

### Phase 08: Architecture Documentation
**Status:** ✅ COMPLETED
**Owner:** DLP_Architect
**Duration:** 4-6 hours
**Priority:** 🟡 HIGH

**Objective:** Document multi-tenancy, permission model, data flow, and component architecture.

**Key Changes:**
- Create: `copilot/explanations/codebase/ARCHITECTURE.md` (system overview, data model, permission matrix)
- Create: `copilot/explanations/codebase/FIRESTORE_SCHEMA.md` (collections, fields, indexes, access patterns)
- Create: `copilot/explanations/codebase/MULTI_TENANCY.md` (institutionId scoping, role-based access, data isolation)
- Update: `README.md` with quick-start and architecture links
- Create: CONTRIBUTING.md with development guidelines

**Validation:**
Manual review - architecture should be clear to new contributor reading docs

**Risks:** LOW - Documentation only

---

### Phase 09: Teacher Subject Creation Permissions
**Status:** 📋 TODO
**Owner:** DLP_Architect
**Duration:** 6-8 hours
**Priority:** 🟡 HIGH

**Objective:** Allow teachers to create subjects without institution admin approval (configurable per institution).

**Key Changes:**
- Add institution setting: `allowTeacherAutonomousSubjectCreation` (boolean, default true)
- Update permissionUtils.ts: Check setting before restricting teacher creation
- Update subject creation flow: Teachers can now create and immediately assign to their students
- Update InstitutionAdminDashboard: Add toggle for this setting
- Update Firestore rules: Allow teacher writes to subjects collection based on setting

**Validation:**
```bash
npm run test:rules -- subject-creation  # New rules tests pass
npm run test                            # All tests pass
# Emulator test: Teacher creates subject without admin approval
```

**Risks:** MEDIUM - Permission logic affects security posture
**Mitigation:** Rules tests validate; lossless protocol maintained

---

### Phase 10: Subject Completion Tracking
**Status:** 📋 TODO
**Owner:** DLP_Architect
**Duration:** 6-8 hours
**Priority:** 🟡 HIGH

**Objective:** Implement subject completion state tracking (completedSubjects array in user profile + UI tabs).

**Key Changes:**
- Update user document schema: Add `completedSubjects: string[]` array
- Update subject view: Add "Mark as Complete" action
- Update Home/Dashboard: Split subjects into "Active" + "History" tabs
- Update query logic: Filter active vs. completed based on user.completedSubjects
- Create UI component: CompletedSubjectsList (read-only, past tense labels)

**Validation:**
```bash
npm run test                   # All tests pass
npm run dev                   # Manually test: mark subject complete, verify tabs
```

**Risks:** MEDIUM - UI state management must be correct
**Rollback:** Remove completedSubjects field and revert filtering

---

### Phase 11: Final Validation & Lossless Review
**Status:** 📋 TODO
**Owner:** DLP_Architect
**Duration:** 4-6 hours
**Priority:** 🔴 CRITICAL

**Objective:** Comprehensive validation that all phases completed, no regressions, and lossless protocol maintained.

**Key Activities:**
- Run full test suite: `npm run test && npm run lint && npx tsc --noEmit`
- Run rules tests: `npm run test:rules`
- Manual smoke test: All pages load, key flows work identically to pre-plan behavior
- Verify all imports resolved and no TypeErrors
- Create lossless report: `copilot/explanations/temporal/lossless-reports/audit-remediation-2026-04-01.md`
- Review all Git commits for adherence to protocol

**Validation Commands:**
```bash
npm run test                   # Must pass
npm run lint                  # Must pass
npx tsc --noEmit              # Must pass
npm run test:rules            # Must pass
npm run build                 # Must produce dist/
```

**Success Criteria:**
- [ ] All CRITICAL audit items resolved
- [ ] All HIGH audit items resolved
- [ ] Zero ESLint/type errors
- [ ] Zero test failures
- [ ] Zero regressions (all prior functionality preserved)
- [ ] Lossless report complete and comprehensive
- [ ] Git history clean and logical

---

### Phase 12: Closure & Finalization
**Status:** 📋 TODO
**Owner:** DLP_Architect
**Duration:** 2-3 hours
**Priority:** 🔴 CRITICAL

**Objective:** Move plan to finished, create transition artifacts, and close out.

**Key Activities:**
- Move plan to `copilot/plans/finished/audit-remediation-and-completion/`
- Create `reviewing/PLAN_COMPLETION_SUMMARY.md` with execution stats
- Update `copilot/explanations/codebase/` with changelog entries for all modified files
- Create transition summary: what was completed, residual risks, follow-up tasks
- Final Git commit and push to feature branch

**Transition Artifacts:**
- `reviewing/PLAN_COMPLETION_SUMMARY.md`: Execution timeline, files touched, test results
- `reviewing/RESIDUAL_RISKS.md`: Known unknowns, follow-up work, recommendations
- `reviewing/CLOSURE_CHECKLIST.md`: Final verification that all success criteria met

---

## Dependency Map

```
Phase 01 (Type Safety)
   ↓
Phase 02 (Cleanup)
   ↓
Phase 03 (Data Structure)  ←→ Phase 05 (Component Splitting)  ← Parallel
   ↓                             ↓
Phase 04 (Query Design)    Phase 06 (More Splitting)  ← Parallel
   ↓                             ↓
Phase 07 (Tests) ←←←←←──────────┘
   ↓
Phase 08 (Documentation)
   ↓
Phase 09 (Permissions)  ←→ Phase 10 (Completion Tracking)  ← Parallel
   ↓
Phase 11 (Validation)
   ↓
Phase 12 (Closure)
```

---

## Execution Metrics (Track Live)

| Phase | Status | Duration | Files Changed | Tests Added | Blockers |
|-------|--------|----------|---------------|-------------|----------|
| 01    | ✅ DONE   | 0.5h   | 2             | 0           | None    |
| 02    | ⏳ DOING  | 2.5h   | 8             | 0           | None    |
| 03    | 📋 TODO   | 7h     | 6             | 3           | None    |
| 04    | 📋 TODO   | 5h     | 4             | 8           | Phase 03 |
| 05    | ✅ DONE   | 7h     | 7             | 6           | None |
| 06    | ✅ DONE   | 5h     | 9             | 5           | None |
| 07    | ✅ DONE   | 9h     | 11            | 16          | None |
| 08    | ✅ DONE   | 5h     | 5             | 0           | None |
| 09    | 📋 TODO   | 7h     | 6             | 4           | Phase 03 |
| 10    | 📋 TODO   | 7h     | 8             | 6           | Phase 09 |
| 11    | 📋 TODO   | 5h     | 1             | 0           | Phase 10 |
| 12    | 📋 TODO   | 2.5h   | 3             | 0           | Phase 11 |

**Total Estimated:** 70 hours | **Files:** 65 | **Tests Added:** 45

---

## Status Sync (Updated Daily)

**Last Updated:** April 1, 2026 @ 20:08 UTC
**Current Focus:** Phase 09 (Teacher Subject Creation Permissions)
**Blockers:** None
**On Track:** YES ✅
**Risk Level:** LOW 🟢

---

## Quick Reference Links

- 📄 README: `copilot/plans/active/audit-remediation-and-completion/README.md`
- 📊 This Roadmap: `copilot/plans/active/audit-remediation-and-completion/strategy-roadmap.md`
- 🔍 Audit Report: Explore agent output (embedded in conversation)
- 📋 Original Audit Issues: `copilot/explanations/codebase/AUDIT_FINDINGS_2026_04_01.md` (to be created)
- 🔐 Related Security Plan: `copilot/plans/active/firestore-rules-access-reliability-recovery/`
