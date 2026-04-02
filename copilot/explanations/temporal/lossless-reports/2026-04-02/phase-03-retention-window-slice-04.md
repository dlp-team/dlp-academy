<!-- copilot/explanations/temporal/lossless-reports/2026-04-02/phase-03-retention-window-slice-04.md -->
# Lossless Report - Phase 03 Retention Window Slice 04

## Requested Scope
- Continue after institution-admin bin lifecycle implementation.
- Validate and implement 15-day retention execution path for bin-first deletion architecture.

## Preserved Behaviors
- Existing restore and manual permanent-delete actions remain unchanged.
- Existing bin selection flows and confirmation modals remain the same interaction model.
- Existing out-of-scope lint warnings remain untouched.

## Implemented Changes
1. Shared retention utilities:
   - Added `src/utils/trashRetentionUtils.ts` for canonical 15-day retention constants and expiration helpers.
   - Migrated Home bin helper math (`binViewUtils`) to shared retention utility.
2. Home bin retention enforcement:
   - `BinView.loadTrashedItems` now purges expired trashed items on load:
     - expired top-level trashed folders,
     - expired trashed subjects not already covered by an expired root folder purge.
   - Added one-pass recursion guard to avoid repeated purge loops.
3. Institution-admin retention enforcement:
   - `useClassesCourses.fetchAll` now purges expired trashed courses/classes.
   - Expired trashed course purge includes linked class cleanup.
   - Bin rows now display retention countdown text.
4. Tests:
   - Added `tests/unit/utils/trashRetentionUtils.test.js`.
   - Revalidated `tests/unit/pages/home/binViewUtils.test.js`.
   - Revalidated `tests/unit/pages/institution-admin/ClassesCoursesSection.deleteConfirm.test.jsx`.

## Touched Files
- `src/utils/trashRetentionUtils.ts`
- `src/pages/Home/utils/binViewUtils.ts`
- `src/pages/Home/components/BinView.tsx`
- `src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.ts`
- `src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx`
- `tests/unit/utils/trashRetentionUtils.test.js`
- `tests/unit/pages/home/binViewUtils.test.js`
- `tests/unit/pages/institution-admin/ClassesCoursesSection.deleteConfirm.test.jsx`

## Validation Summary
- `get_errors` on touched files: clean.
- `npm run test -- tests/unit/utils/trashRetentionUtils.test.js tests/unit/pages/home/binViewUtils.test.js tests/unit/pages/institution-admin/ClassesCoursesSection.deleteConfirm.test.jsx`: passed (12 tests).
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed with pre-existing warnings only (no new errors).

## Residual / Next Slice
- Consolidate Phase 03 behavior matrix and transition package for phase close gate.
