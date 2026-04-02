<!-- copilot/explanations/temporal/lossless-reports/2026-04-02/phase-03-institution-admin-bin-lifecycle-slice-03.md -->
# Lossless Report - Phase 03 Institution Admin Bin Lifecycle Slice 03

## Requested Scope
- Continue Phase 03 implementation after nested folder bin slice.
- Implement institution-admin course/class paper-bin lifecycle.
- Add typed-name destructive confirmation for permanent delete paths.

## Preserved Behaviors
- Existing course/class create and update flows remain unchanged.
- Existing in-page confirmation modal pattern remains the single confirmation surface (no `window.confirm`).
- Course/class list and detail navigation behavior remains intact outside bin tab.

## Implemented Changes
1. Hook lifecycle implementation (`useClassesCourses`):
   - Added active vs trashed split state for courses/classes.
   - Converted delete handlers to soft-delete lifecycle metadata (`status`, `trashedAt`, `trashedByUid`).
   - Added restore handlers for course/class.
   - Added permanent delete handlers for course/class with linked class cleanup on course delete.
2. Institution admin bin UI (`ClassesCoursesSection`):
   - Added `Papelera` tab in toolbar.
   - Added trashed courses/classes rendering blocks with empty state and lifecycle metadata date formatting.
   - Added restore action buttons and permanent-delete entry points from bin.
   - Added typed-name input in confirmation dialog for permanent delete only.
   - Preserved trash confirmation copy and behavior for standard move-to-bin actions.
3. Regression tests:
   - Updated existing delete-confirm tests for move-to-bin copy.
   - Added restore-from-bin test.
   - Added exact typed-name gate test for permanent delete.

## Touched Files
- `src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.ts`
- `src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx`
- `tests/unit/pages/institution-admin/ClassesCoursesSection.deleteConfirm.test.jsx`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.md`
- `copilot/explanations/codebase/tests/unit/pages/institution-admin/ClassesCoursesSection.deleteConfirm.test.md`

## Validation Summary
- `get_errors` on touched source/test files: clean.
- `npm run test -- tests/unit/pages/institution-admin/ClassesCoursesSection.deleteConfirm.test.jsx`: passed (5 tests).
- `npm run test -- tests/unit/hooks/useFolders.test.js tests/unit/pages/institution-admin/ClassesCoursesSection.deleteConfirm.test.jsx`: passed (31 tests).
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed with pre-existing warnings only (no new errors).

## Residual / Next Slice
- Validate and document 15-day retention execution path for Phase 03 closure evidence.
