<!-- copilot/explanations/codebase/tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.md -->
# ClassesCoursesSection.transferPromotionDryRun.test.jsx

## Overview
- Source file: `tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.jsx`
- Last documented: 2026-04-04
- Role: Regression coverage for transfer/promotion dry-run trigger wiring in organization tab.

## Coverage
- Verifies the toolbar action `Simular traslado/promoción` opens the modal path.
- Verifies modal dry-run execution delegates to `runTransferPromotionDryRunPreview` from `useClassesCourses`.
- Verifies modal apply action delegates to `applyTransferPromotionDryRunPlan` from `useClassesCourses`.
