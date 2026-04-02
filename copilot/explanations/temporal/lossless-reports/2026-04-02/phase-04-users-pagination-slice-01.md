<!-- copilot/explanations/temporal/lossless-reports/2026-04-02/phase-04-users-pagination-slice-01.md -->
# Lossless Report - Phase 04 Users Pagination Slice 01

## Requested Scope
- Continue plan execution into Phase 04 after Phase 03 retention work.
- Add pagination for large institution-admin teachers/students lists to reduce expensive full-list requests.

## Preserved Behaviors
- Existing invite removal confirmation modal behavior remains unchanged.
- Existing policy form editing and save flow remains unchanged.
- Existing teacher/student navigation row-click behavior remains unchanged.

## Implemented Changes
1. `useUsers` pagination state:
   - Added page size constant (`25`) and per-tab cursor state (`lastVisible`, `hasMore`).
   - Initial list reads now use limited queries.
   - Added `handleLoadMoreUsers` with `startAfter(cursor)`.
2. `UsersTabContent` UI:
   - Added `Cargar más profesores` and `Cargar más alumnos` controls.
   - Added loading state feedback while next page is loading.
   - Kept search filtering behavior over currently loaded rows.
3. `InstitutionAdminDashboard` wiring:
   - Updated `useUsers` invocation to pass `loadAllUsers` only when organization tab is active.
   - Reduced unnecessary full-list teacher/student fetches for non-organization tab sessions.
4. Tests:
   - Updated `UsersTabContent.removeAccessConfirm.test.jsx` props for pagination contract.
   - Added regression test for load-more callback wiring.

## Touched Files
- `src/pages/InstitutionAdminDashboard/hooks/useUsers.ts`
- `src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx`
- `src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx`
- `tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx`

## Validation Summary
- `get_errors` on touched files: clean.
- `npm run test -- tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx tests/unit/pages/institution-admin/ClassesCoursesSection.deleteConfirm.test.jsx`: passed (9 tests).
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed with pre-existing warnings only (no new errors).

## Residual / Next Slice
- Implement exact customization preview architecture.
- Validate policy-toggle enforcement matrix end-to-end and patch mismatches.
