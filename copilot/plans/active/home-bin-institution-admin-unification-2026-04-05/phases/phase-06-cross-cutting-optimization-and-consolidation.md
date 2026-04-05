<!-- copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/phases/phase-06-cross-cutting-optimization-and-consolidation.md -->
# Phase 06 - Cross-Cutting Optimization and Consolidation

## Status
- IN_PROGRESS

## Objective
Execute mandatory final optimization across all touched files to reduce duplication, improve maintainability, and preserve behavior.

## Required Checklist
- Centralize repeated logic into shared hooks/utils/components where justified.
- Split oversized files with clear single-responsibility boundaries.
- Improve naming and structure readability without behavior drift.
- Apply safe performance improvements where measurable.
- Run lint and resolve issues related to touched scope.
- Re-run impacted tests after optimization edits.

## Validation Gate
- No duplicated active logic paths for modal/selection/rendering concerns.
- Touched files remain lossless vs requested behavior.
- npm run lint passes for impacted scope.
- Impacted test suite passes after optimization.

## Exit Criteria
- Optimization evidence is documented and implementation remains behaviorally stable.

## Progress Log
- 2026-04-05 - Block A completed
	- Extracted users-tab delete-feedback message mapping into shared utility:
		- [src/pages/InstitutionAdminDashboard/utils/userDeletionFeedback.ts](src/pages/InstitutionAdminDashboard/utils/userDeletionFeedback.ts)
	- Simplified users-tab component by delegating success/error message generation to shared utility:
		- [src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx](src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx)
	- Added deterministic unit coverage for centralized feedback contract:
		- [tests/unit/pages/institution-admin/userDeletionFeedback.test.js](tests/unit/pages/institution-admin/userDeletionFeedback.test.js)
	- Validation evidence:
		- `npm run test -- tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.jsx tests/unit/pages/institution-admin/UsersTabContent.deleteUserGuard.test.jsx tests/unit/pages/institution-admin/userDeletionGuard.test.js tests/unit/pages/institution-admin/userDeletionFeedback.test.js` (PASS)
		- `npm run lint` (PASS)
		- `npx tsc --noEmit` (PASS)
