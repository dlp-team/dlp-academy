<!-- copilot/plans/inReview/home-bin-institution-admin-unification-2026-04-05/phases/phase-03-institution-admin-settings-and-automation-controls.md -->
# Phase 03 - Institution Admin Settings and Automation Controls

## Status
- COMPLETED

## Objective
Expand Institution Admin settings to manage academic periods, course-order progression, and automation feature toggles.

## Deliverables
- Settings controls for ordinary/extraordinary period start/end defaults.
- Course hierarchy management section:
  - non-duplicated institution course list,
  - drag-and-drop reorder flow,
  - persisted order used by automatic transfer logic,
  - default ordering heuristics aligned to Spanish academic naming patterns.
- Global automation-tool enable/disable toggles at institution scope.
- Course-creation flow integration so period defaults auto-populate.

## Security and Data Integrity Constraints
- Tenant-safe writes scoped to institution context.
- Least-privilege checks for settings mutation.
- Backward-compatible defaults for institutions missing new fields.
- Avoid destructive rewrites of existing settings payloads.

## Validation Gate
- Deterministic tests for settings read/write paths and default propagation.
- Edge-case checks for duplicate/unknown course labels.
- Manual verification of drag ordering persistence and retrieval.
- Lint/typecheck pass.

## Exit Criteria
- Institution admins can safely configure periods, ordering, and tool toggles with stable persisted behavior.

## Kickoff Notes (2026-04-05)
- Phase 02 closed with stable Home/Bin baseline and clean validation gates.
- Phase 03 starts with a low-risk settings-first slice:
  1. introduce institution-scoped automation toggle persistence,
  2. gate transfer tooling from organization tab,
  3. enforce toggle deny-path server-side in callable handlers.

## Progress Log
- 2026-04-05 - Block A completed
  - Added institution automation toggle normalization/persistence in [src/pages/InstitutionAdminDashboard/hooks/useInstitutionSettings.ts](src/pages/InstitutionAdminDashboard/hooks/useInstitutionSettings.ts).
  - Added settings controls in [src/pages/InstitutionAdminDashboard/components/SettingsTabContent.tsx](src/pages/InstitutionAdminDashboard/components/SettingsTabContent.tsx):
    - `Habilitar simulación y aplicación de traslados/promociones`,
    - `Habilitar automatización de ciclo de vida de asignaturas`.
  - Wired automation settings down into organization workflows from [src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx](src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx) to [src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx](src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx).
  - Added transfer-tool UI gating (disabled trigger + contextual warning) and modal-mount guard in [src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx](src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx).
  - Added server-side automation helper [functions/security/institutionAutomationSettings.js](functions/security/institutionAutomationSettings.js) and enforced deny-path in:
    - [functions/security/transferPromotionDryRunHandler.js](functions/security/transferPromotionDryRunHandler.js)
    - [functions/security/transferPromotionApplyHandler.js](functions/security/transferPromotionApplyHandler.js)
  - Added deterministic test coverage:
    - [tests/unit/pages/institution-admin/useInstitutionSettings.automation.test.jsx](tests/unit/pages/institution-admin/useInstitutionSettings.automation.test.jsx)
    - [tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.jsx](tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.jsx)
    - [tests/unit/functions/transfer-promotion-dry-run-handler.test.js](tests/unit/functions/transfer-promotion-dry-run-handler.test.js)
    - [tests/unit/functions/transfer-promotion-apply-handler.test.js](tests/unit/functions/transfer-promotion-apply-handler.test.js)
    - [tests/unit/functions/transfer-promotion-roundtrip.test.js](tests/unit/functions/transfer-promotion-roundtrip.test.js)
  - Validation evidence:
    - `npm run test -- tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.jsx tests/unit/pages/institution-admin/useInstitutionSettings.automation.test.jsx tests/unit/functions/transfer-promotion-dry-run-handler.test.js tests/unit/functions/transfer-promotion-apply-handler.test.js tests/unit/functions/transfer-promotion-roundtrip.test.js` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)

- 2026-04-05 - Block B completed
  - Added non-duplicated, drag-and-drop course hierarchy ordering in settings:
    - [src/pages/InstitutionAdminDashboard/components/settings/CoursePromotionOrderEditor.tsx](src/pages/InstitutionAdminDashboard/components/settings/CoursePromotionOrderEditor.tsx)
    - [src/pages/InstitutionAdminDashboard/components/SettingsTabContent.tsx](src/pages/InstitutionAdminDashboard/components/SettingsTabContent.tsx)
  - Added deterministic course-order utilities and persistence integration:
    - [src/utils/coursePromotionOrderUtils.ts](src/utils/coursePromotionOrderUtils.ts)
    - [src/pages/InstitutionAdminDashboard/hooks/useInstitutionSettings.ts](src/pages/InstitutionAdminDashboard/hooks/useInstitutionSettings.ts)
  - Added transfer dry-run promotion mapping support based on configured course hierarchy:
    - [functions/security/coursePromotionOrderUtils.js](functions/security/coursePromotionOrderUtils.js)
    - [functions/security/transferPromotionDryRunHandler.js](functions/security/transferPromotionDryRunHandler.js)
  - Revalidated period-default course creation integration in:
    - [tests/unit/pages/institution-admin/CreateCourseModal.periodSchedule.test.jsx](tests/unit/pages/institution-admin/CreateCourseModal.periodSchedule.test.jsx)
    - [tests/unit/pages/institution-admin/CreateCourseModal.academicYear.test.jsx](tests/unit/pages/institution-admin/CreateCourseModal.academicYear.test.jsx)
  - Added/updated deterministic coverage:
    - [tests/unit/pages/institution-admin/useInstitutionSettings.automation.test.jsx](tests/unit/pages/institution-admin/useInstitutionSettings.automation.test.jsx)
    - [tests/unit/functions/transfer-promotion-dry-run-handler.test.js](tests/unit/functions/transfer-promotion-dry-run-handler.test.js)
    - [tests/unit/utils/coursePromotionOrderUtils.test.js](tests/unit/utils/coursePromotionOrderUtils.test.js)
  - Validation evidence:
    - `npm run test -- tests/unit/pages/institution-admin/useInstitutionSettings.automation.test.jsx tests/unit/functions/transfer-promotion-dry-run-handler.test.js tests/unit/utils/coursePromotionOrderUtils.test.js` (PASS)
    - `npm run test -- tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.jsx tests/unit/pages/institution-admin/useInstitutionSettings.automation.test.jsx tests/unit/functions/transfer-promotion-dry-run-handler.test.js tests/unit/functions/transfer-promotion-apply-handler.test.js tests/unit/functions/transfer-promotion-roundtrip.test.js tests/unit/utils/coursePromotionOrderUtils.test.js` (PASS)
    - `npm run test -- tests/unit/pages/institution-admin/CreateCourseModal.periodSchedule.test.jsx tests/unit/pages/institution-admin/CreateCourseModal.academicYear.test.jsx` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)

## Phase 03 Closure Summary (2026-04-05)
- Deliverables achieved:
  - institution default period controls are active and validated in course-creation flow,
  - institution course hierarchy ordering is non-duplicated, draggable, and persisted,
  - promotion dry-run now resolves destination course names using configured hierarchy order,
  - automation toggles and server-side enforcement for transfer tooling remain active.
- Exit criteria satisfied with deterministic test coverage and static checks passing.

