<!-- copilot/plans/finished/autopilot-platform-hardening-and-completion/working/dependency-map-and-assumptions-2026-03-30.md -->
# Dependency Map and Assumptions (2026-03-30)

## Core Dependencies
- Frontend: React + Vite route/component modules.
- Backend access: Firebase Auth + Firestore security rules.
- Validation: Vitest, Playwright (where applicable), lint/type tooling.

## Dependency Hotspots
1. Role-based logic crossing `Home`, `Profile`, `TeacherDashboard`, and Firestore rules.
2. Shared utilities and hooks that may impact multiple pages when centralized.
3. Responsive layout changes that can affect interaction models across routes.
4. Incremental TypeScript migration requiring import boundary stability.

## Assumptions
- Previously validated reliability and security fixes remain stable and are treated as baseline.
- Existing tests are sufficient as guard rails for touched modules plus net-new tests per feature.
- No deployment commands are executed from this agent workflow.
- Plan execution remains lossless: preserve behavior outside explicit scope.

## Open Risks to Monitor
- Hidden coupling between dashboard/profile hooks and role utilities.
- Responsive fixes introducing desktop regressions.
- TypeScript tranche creating noisy cross-module refactor pressure.
- Incomplete workflow tests missing edge-case branches.

## Mitigation Notes
- Keep changes phase-scoped and test-backed.
- Run quality gates at each phase boundary.
- Record every significant preservation guarantee in lossless reports.
