<!-- copilot/plans/archived/audit-remediation-and-completion-inreview-duplicate-2026-04-02/README.md -->

# Audit Remediation & Platform Completion Plan

## Problem Statement
DLP Academy has reached a development inflection point: core features work, but technical debt, incomplete critical features, and unimplemented data model changes block scalability and maintainability. A comprehensive audit (April 1, 2026) revealed 5 critical, 12 high-priority, and multiple medium-priority issues across architecture, type safety, testing, security, and product features.

**Key Blockers:**
1. Core subject data model incomplete (missing course, classId, enrolledStudentUids, inviteCode fields)
2. Subject access queries designed for single condition, not OR-based multi-role logic
3. Large components (Home.tsx: 950L, AdminDashboard.tsx: 955L, StudyGuide.tsx: 1387L) unmaintainable
4. Type safety compromised by excessive `any` casts in App.tsx and hooks
5. Integration/page-level test coverage <5%; unit coverage ~25%
6. Architecture and multi-tenancy patterns undocumented
7. Firestore rules security hardening in active review (separate plan)

## Scope

### ✅ IN SCOPE
- **Phase 1:** Remove `any` type casts and enforce type safety (App.tsx migration)
- **Phase 2:** Clean technical debt (console.log removal, dead code cleanup)
- **Phase 3:** Implement critical data model changes (subject schema + migration)
- **Phase 4:** Refactor subject access queries to OR-based logic
- **Phase 5:** Split large components (Home, AdminDashboard, StudyGuide)
- **Phase 6:** Continue large component splitting and modular cleanup (AdminDashboard focus)
- **Phase 7:** Add integration/page-level tests for key workflows
- **Phase 8:** Architecture documentation (multi-tenancy, permission model, data flow)
- **Phase 9:** Teacher subject creation permission flow (configurable institution setting)
- **Phase 10:** Subject completion tracking (completedSubjects array + UI tabs)
- **Phase 11:** Final validation and lossless review
- **Phase 12:** Closure and finalization

### ❌ OUT OF SCOPE
- Firestore rules security hardening (active plan: `copilot/plans/active/firestore-rules-access-reliability-recovery/`)
- Test suite stabilization (active plan: `copilot/plans/inReview/test-suite-stability-and-skip-remediation/`)
- Autopilot platform completion (inReview plan: `copilot/plans/inReview/autopilot-platform-hardening-and-completion/`)
- Visual redesign or UX overhaul (only responsive/a11y fixes)
- Performance profiling and optimization (separate future work)
- Broad refactors unrelated to identified gaps

## Current Status
- **Lifecycle:** `inReview` (moved from `active` on 2026-04-01)
- **Created:** April 1, 2026
- **Estimated Duration:** 5-7 days (2 parallel tracks where possible)
- **Execution Team:** DLP_Architect (autopilot agent)
- **Validation:** Lossless reports per phase, final comprehensive review before closure

## Key Decisions and Assumptions
1. **Type Safety First:** Removing `any` types enables safe refactoring downstream
2. **Lossless Preservation:** All product behavior untouched except where explicitly required (per lossless-change-protocol)
3. **Parallel Execution:** Phases 2-3 and 5-7 can run in parallel with coordination
4. **Git Workflow:** All changes on feature branch `feature/audit-remediation-2026-04-01`, regular commits per logical block
5. **Validation Gates:** Each phase includes specific validation commands (`npm run test`, `npm run lint`, etc.)
6. **Documentation Priority:** Explanation files updated as work progresses; lossless reports created per protocol

## Success Criteria (DoD)

## Review Log: Finished Phases (as of 2026-04-01)

### Phase 01: Type Safety & App.tsx Refactoring
- No missing items identified; all objectives and validation steps appear complete.

### Phase 03: Subject Data Enforcement & Consistency
- Residual Phase 03 items were completed in this execution slice:
	- [x] Dedicated student join-via-invite coverage added (rules + hook behavior assertion).
	- [x] Firestore rules now enforce class-to-institution alignment for `subjects.classId` on create/update.
	- [x] Rules coverage added for same-institution class assignment allow and cross-institution deny paths.
	- [x] Access-vector coverage added for teacher ownership plus student class/invite vectors in `useSubjects`.

### Phase 04: Subject Access Query Redesign
- Additional scenario tests for class/enrollment vectors recommended (see Phase 07 for coverage plan)

### Phase 05: Home Modularization
- No missing items identified; regression tests for modularization present.

### Phase 06: AdminDashboard Modularization
- No missing items identified; regression tests for extracted components/utilities present.

### Phase 07: Invite Security Test Coverage
- No missing items identified; all planned tests and validations present.

### Phase 08: Architecture Documentation
- No missing items identified; deliverables and validation steps complete.

### Phase 09: Teacher Subject Creation Permissions
- Completed in this execution slice.
- Delivered:
	- institution-level teacher policy flag (`allowTeacherAutonomousSubjectCreation`) with default-enabled behavior,
	- Home/UI policy-aware guard behavior,
	- hook-level enforcement with explicit teacher-facing denial message,
	- Firestore rules enforcement,
	- targeted unit and rules regression coverage.

### Phase 10: Subject Completion Tracking
- Completed in this execution slice.
- Delivered:
	- user-level completion state API in `useSubjects` (`completedSubjectIds` + `setSubjectCompletion`),
	- new Home tab mode `Historial` and completion-aware subject filtering,
	- active Home views now hide completed subjects while history shows completed-only entries,
	- completion toggles in both grid and list subject action menus,
	- focused unit coverage for hook-level completion state and Home active/history filtering.

### Phase 11: Final Validation & Lossless Review
- Completed in this execution slice.
- Completed validation gates:
	- `npm run lint` (0 errors, 4 existing warnings),
	- `npx tsc --noEmit` (pass),
	- `npm run test` (pass),
	- `npm run test:rules` (pass, `49/49`),
	- `npm run build` (pass).
- Additional smoke verification:
	- `npx playwright test tests/e2e/bin-view.spec.js tests/e2e/home-sharing-roles.spec.js` (6 passed, 2 skipped).
- Remaining:
	- phase-12 closure artifacts and lifecycle transition.

### Phase 12: Closure & Finalization
- In progress in this execution slice.
- Created closure artifact set under `reviewing/`:
	- `PLAN_COMPLETION_SUMMARY.md`,
	- `RESIDUAL_RISKS.md`,
	- `CLOSURE_CHECKLIST.md`.
- Residual phase-review blockers from Phase 03 are now remediated and validated.
- Lifecycle transition to `finished` is now unblocked.
- [ ] Lossless reports created for each phase
- [ ] Git history clean with logical commits

## Plan Artifacts
- `strategy-roadmap.md` - Phase sequencing, dependencies, status tracking (source of truth)
- `phases/` - One file per phase with objectives, changes, risks, validation commands
- `reviewing/` - Verification checklists and final closure artifacts
- `working/` - Assumptions, dependencies, operational notes

## Related Plans
- 🔴 **Active:** `firestore-rules-access-reliability-recovery/` - Security hardening (separate track)
- 🟡 **InReview:** `test-suite-stability-and-skip-remediation/` - Test stabilization (baseline complete)
- 🟡 **InReview:** `autopilot-platform-hardening-and-completion/` - Broader platform work (finished)

## Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Broken imports during refactoring | Major | Medium | Use lossless protocol; validate all imports after each phase |
| Type safety migration breaks tests | Major | Low | Test after each type change; use TypeScript compiler checks |
| Large dataset issues with new query logic | Critical | Medium | Load-test queries with 1000+ subjects before deployment |
| Git merge conflicts with other plans | Medium | Low | Coordinate with firestore-rules plan; use feature branch discipline |
| Incomplete data migration (old → new schema) | Critical | Low | Create rollback script; test migration on emulator first |

## Rollback Strategy
1. **Pre-Execution:** Tag current main as `pre-audit-remediation-2026-04-01`
2. **During Phases:** Commit after each phase to feature branch; cherry-pick if needed
3. **Full Rollback:** `git reset --hard pre-audit-remediation-2026-04-01` (on main only after approval)
4. **Data Rollback:** Firestore restore from backup if schema migration fails

## Next Steps
→ **NEXT EXECUTION TARGET:** Phase 12 - Closure & Finalization
→ Keep plan lifecycle transition pending until phase-12 artifacts are fully created
