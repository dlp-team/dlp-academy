<!-- copilot/plans/active/audit-remediation-and-completion/README.md -->

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
- **Phase 6:** Add integration/page-level tests for key workflows
- **Phase 7:** Architecture documentation (multi-tenancy, permission model, data flow)
- **Phase 8:** Teacher subject creation permission flow (configurable institution setting)
- **Phase 9:** Subject completion tracking (completedSubjects array + UI tabs)
- **Phase 10:** Final validation, lossless review, and closure

### ❌ OUT OF SCOPE
- Firestore rules security hardening (active plan: `copilot/plans/active/firestore-rules-access-reliability-recovery/`)
- Test suite stabilization (active plan: `copilot/plans/inReview/test-suite-stability-and-skip-remediation/`)
- Autopilot platform completion (inReview plan: `copilot/plans/inReview/autopilot-platform-hardening-and-completion/`)
- Visual redesign or UX overhaul (only responsive/a11y fixes)
- Performance profiling and optimization (separate future work)
- Broad refactors unrelated to identified gaps

## Current Status
- **Lifecycle:** `active` → immediately begin Phase 1
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
- [ ] All CRITICAL audit items resolved (type safety, data model, test coverage gap addressed)
- [ ] All HIGH audit items resolved (console cleanup, dead code, component complexity)
- [ ] Zero regressions: all existing tests pass + new tests added
- [ ] Zero ESLint/type errors
- [ ] Architecture documentation complete
- [ ] All phases validated per roadmap
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
→ **IMMEDIATELY EXECUTE** Phase 1: Type Safety & App.tsx Refactoring (0.5 days)
→ Continue through Phase 10 with validation gates between each phase
