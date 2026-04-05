<!-- copilot/plans/inReview/home-bin-institution-admin-unification-2026-04-05/working/phase-03-settings-and-automation-kickoff.md -->
# Phase 03 Working Note - Settings and Automation Kickoff

## Status
- COMPLETED

## Block Tracking
- Block A (2026-04-05): COMPLETED
- Block B (2026-04-05): COMPLETED

## Block A Scope
- Institution-level automation toggles in settings hook + UI.
- Organization transfer tool gating from institution toggle state.
- Callable deny-path enforcement for transfer dry-run/apply when disabled.

## Block A Validation Evidence
- `npm run test -- tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.jsx tests/unit/pages/institution-admin/useInstitutionSettings.automation.test.jsx tests/unit/functions/transfer-promotion-dry-run-handler.test.js tests/unit/functions/transfer-promotion-apply-handler.test.js tests/unit/functions/transfer-promotion-roundtrip.test.js` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Block B Scope (Completed)
- Added settings-side drag-and-drop course hierarchy editor with non-duplicated labels.
- Added deterministic default ordering heuristics aligned to Spanish academic naming patterns.
- Persisted hierarchy in `courseLifecycle.coursePromotionOrder` through institution settings save flow.
- Wired transfer dry-run promote mode to resolve destination course names using configured hierarchy.

## Block B Validation Evidence
- `npm run test -- tests/unit/pages/institution-admin/useInstitutionSettings.automation.test.jsx tests/unit/functions/transfer-promotion-dry-run-handler.test.js tests/unit/utils/coursePromotionOrderUtils.test.js` (PASS)
- `npm run test -- tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.jsx tests/unit/pages/institution-admin/useInstitutionSettings.automation.test.jsx tests/unit/functions/transfer-promotion-dry-run-handler.test.js tests/unit/functions/transfer-promotion-apply-handler.test.js tests/unit/functions/transfer-promotion-roundtrip.test.js tests/unit/utils/coursePromotionOrderUtils.test.js` (PASS)
- `npm run test -- tests/unit/pages/institution-admin/CreateCourseModal.periodSchedule.test.jsx tests/unit/pages/institution-admin/CreateCourseModal.academicYear.test.jsx` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

