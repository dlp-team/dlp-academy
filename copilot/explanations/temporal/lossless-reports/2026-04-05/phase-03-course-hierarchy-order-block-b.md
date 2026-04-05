<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/phase-03-course-hierarchy-order-block-b.md -->
# Lossless Report - Phase 03 Course Hierarchy Order Block B

## 1. Requested Scope
- Add a settings section to manage institution course hierarchy order (non-duplicated and draggable).
- Persist hierarchy order so automatic transfer/promotion can use it.
- Apply deterministic default ordering heuristics aligned to Spanish academic naming patterns.
- Keep existing period-default course-creation behavior validated.

## 2. Explicitly Preserved Out-of-Scope Behavior
- No changes to transfer apply/rollback handlers; only dry-run mapping logic was extended.
- No changes to Users tab or customization-tab behavior.
- No destructive rewrites of institution settings payloads; writes remain merge-safe via existing update flow.

## 3. Touched Files
- [src/utils/coursePromotionOrderUtils.ts](src/utils/coursePromotionOrderUtils.ts)
- [src/pages/InstitutionAdminDashboard/hooks/useInstitutionSettings.ts](src/pages/InstitutionAdminDashboard/hooks/useInstitutionSettings.ts)
- [src/pages/InstitutionAdminDashboard/components/settings/CoursePromotionOrderEditor.tsx](src/pages/InstitutionAdminDashboard/components/settings/CoursePromotionOrderEditor.tsx)
- [src/pages/InstitutionAdminDashboard/components/SettingsTabContent.tsx](src/pages/InstitutionAdminDashboard/components/SettingsTabContent.tsx)
- [functions/security/coursePromotionOrderUtils.js](functions/security/coursePromotionOrderUtils.js)
- [functions/security/transferPromotionDryRunHandler.js](functions/security/transferPromotionDryRunHandler.js)
- [tests/unit/pages/institution-admin/useInstitutionSettings.automation.test.jsx](tests/unit/pages/institution-admin/useInstitutionSettings.automation.test.jsx)
- [tests/unit/functions/transfer-promotion-dry-run-handler.test.js](tests/unit/functions/transfer-promotion-dry-run-handler.test.js)
- [tests/unit/utils/coursePromotionOrderUtils.test.js](tests/unit/utils/coursePromotionOrderUtils.test.js)

## 4. Per-File Verification
- Settings hook now loads active institution courses, derives non-duplicated labels, merges persisted order, and persists normalized `courseLifecycle.coursePromotionOrder`.
- Settings UI now exposes drag-and-drop ordering plus arrow-control fallback with Spanish guidance.
- Backend dry-run promote mode now resolves destination course names from configured hierarchy order and keeps safe fallback when destination is missing.
- Deterministic tests validate utility heuristics, hook persistence/merge logic, and dry-run mapping behavior.
- Existing CreateCourseModal period-default behavior was revalidated without code regressions.

## 5. Risks and Checks
- Risk: promotion mapping could become non-deterministic when labels contain ordinals.
  - Check: added ordinal-aware level parsing (`1º`, `2º`, etc.) and utility tests.
- Risk: configured order could drift from active course set.
  - Check: merge utility always reconciles persisted order with currently active labels and appends missing entries deterministically.

## 6. Validation Summary
- Focused tests:
  - `npm run test -- tests/unit/pages/institution-admin/useInstitutionSettings.automation.test.jsx tests/unit/functions/transfer-promotion-dry-run-handler.test.js tests/unit/utils/coursePromotionOrderUtils.test.js` -> PASS.
- Broader impacted suite:
  - `npm run test -- tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.jsx tests/unit/pages/institution-admin/useInstitutionSettings.automation.test.jsx tests/unit/functions/transfer-promotion-dry-run-handler.test.js tests/unit/functions/transfer-promotion-apply-handler.test.js tests/unit/functions/transfer-promotion-roundtrip.test.js tests/unit/utils/coursePromotionOrderUtils.test.js` -> PASS.
- Period-default regression checks:
  - `npm run test -- tests/unit/pages/institution-admin/CreateCourseModal.periodSchedule.test.jsx tests/unit/pages/institution-admin/CreateCourseModal.academicYear.test.jsx` -> PASS.
- Static checks:
  - `npm run lint` -> PASS.
  - `npx tsc --noEmit` -> PASS.
