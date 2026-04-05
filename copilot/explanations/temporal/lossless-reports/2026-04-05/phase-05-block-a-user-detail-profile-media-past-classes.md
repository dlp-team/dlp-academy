<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/phase-05-block-a-user-detail-profile-media-past-classes.md -->
# Lossless Report - Phase 05 Block A (User Detail Profile Media and Past Classes)

## 1. Requested Scope
- Continue active plan execution and move into Phase 05 implementation.
- Deliver first user-detail fidelity block covering:
  - profile-photo reliability fallback,
  - emoji-free role badge rendering,
  - dedicated past-classes section for archived rows.

## 2. Explicitly Preserved Out-of-Scope Behavior
- No user-deletion mutation logic added yet.
- No Users-tab destructive action changes in this block.
- No backend/functions/rules updates.
- No cross-tenant query broadening; existing institution-scoped reads preserved.

## 3. Touched Files
- [src/pages/InstitutionAdminDashboard/components/UserDetailView.tsx](src/pages/InstitutionAdminDashboard/components/UserDetailView.tsx)
- [tests/unit/pages/institution-admin/UserDetailView.studentCourseLinks.test.jsx](tests/unit/pages/institution-admin/UserDetailView.studentCourseLinks.test.jsx)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/README.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/README.md)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/strategy-roadmap.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/strategy-roadmap.md)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/phases/phase-04-customization-preview-parity.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/phases/phase-04-customization-preview-parity.md)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/phases/phase-05-user-management-profile-media-and-past-classes.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/phases/phase-05-user-management-profile-media-and-past-classes.md)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/working/phase-04-preview-parity-kickoff.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/working/phase-04-preview-parity-kickoff.md)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/working/phase-05-users-profile-history-kickoff.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/working/phase-05-users-profile-history-kickoff.md)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/user-updates.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/user-updates.md)
- [copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/UserDetailView.md](copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/UserDetailView.md)
- [copilot/explanations/codebase/tests/unit/pages/institution-admin/UserDetailView.studentCourseLinks.test.md](copilot/explanations/codebase/tests/unit/pages/institution-admin/UserDetailView.studentCourseLinks.test.md)

## 4. Per-File Verification
- [src/pages/InstitutionAdminDashboard/components/UserDetailView.tsx](src/pages/InstitutionAdminDashboard/components/UserDetailView.tsx)
  - Added resilient photo URL resolution and load-error fallback to initials.
  - Replaced emoji role badges with icon-based badge labels.
  - Split related class rows into active vs archived sections and added `Clases pasadas` panel.
- [tests/unit/pages/institution-admin/UserDetailView.studentCourseLinks.test.jsx](tests/unit/pages/institution-admin/UserDetailView.studentCourseLinks.test.jsx)
  - Preserved existing student course-link mutation coverage.
  - Added coverage for:
    - photo error fallback,
    - archived class section rendering for student,
    - archived class section + emoji-free role badge for teacher.

## 5. Risks and Checks
- Risk: profile image failure loop or stale fallback state.
  - Check: reset image error state when viewed user or profile URL changes.
- Risk: archived rows still leaking into active section.
  - Check: explicit row partitioning by `status === 'archived'` and dedicated rendering list.
- Risk: role label regressions due iconized badge changes.
  - Check: deterministic test asserts text label remains and emoji markers are absent.

## 6. Validation Summary
- Diagnostics:
  - `get_errors` clean for touched source and test files.
- Targeted regression tests:
  - `npm run test -- tests/unit/pages/institution-admin/UserDetailView.studentCourseLinks.test.jsx` -> PASS.
- Static gates:
  - `npm run lint` -> PASS.
  - `npx tsc --noEmit` -> PASS.


