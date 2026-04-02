<!-- copilot/plans/finished/institution-governance-and-academic-lifecycle-overhaul/phases/phase-04-institution-admin-dashboard-upgrades.md -->

# Phase 04 - Institution Admin Dashboard Upgrades

## Status
- COMPLETED

## Objective
Upgrade institution administration capabilities with a reliable preview experience, scalable user-list performance, and strict policy behavior.

## Scope
1. Customization preview exact-app replica strategy and implementation.
2. Pagination or cursor-based batching for large student/teacher lists.
3. Policy toggle enforcement verification for:
   - dynamic code requirement,
   - teacher subject creation without admin approval,
   - teacher class/student assignment without admin approval,
   - teacher subject deletion with associated students without admin approval.

## Files Expected
- `src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.jsx`
- `src/pages/InstitutionAdminDashboard/components/**`
- `src/pages/InstitutionAdminDashboard/hooks/useCustomization.ts`
- `src/utils/institutionPolicyUtils.js`
- Related tests in `tests/unit/**` and `tests/e2e/**`

## Risks
- Preview implementation drift from real Home behavior.
- Policy toggles affecting unintended workflows.

## Validation Gate
- Preview reflects real app structure and theme behavior.
- Large user lists reduce request load and remain usable.
- Policy toggles produce deterministic allow/deny behavior.

## Rollback
- Feature-flag preview mode and pagination entrypoints when feasible.

## Completion Notes
- Slice 01 completed (2026-04-02):
   - Added cursor-based pagination for institution-admin teachers/students user tables in `useUsers` (`limit + startAfter`).
   - Added `Cargar más` controls in `UsersTabContent` with loading state and callback wiring.
   - Deferred full teachers/students fetches used by organization workflows via `loadAllUsers` flag, so heavy reads run only when needed.
   - Added/updated unit coverage in `UsersTabContent.removeAccessConfirm.test.jsx` for pagination action wiring.
- Slice 02 completed (2026-04-02):
   - Replaced static card mock in `InstitutionCustomizationMockView` with exact Home-surface preview powered by isolated local mock data.
   - Added reusable preview adapter `components/customization/CustomizationHomeExactPreview.tsx` that reuses `HomeControls` and `HomeContent` with deterministic mock state.
   - Preserved existing editor workflow (`previewPaletteApply`, role toggle, viewport toggle, explicit save action) while upgrading preview parity.
   - Executed policy-toggle enforcement matrix across dynamic-code flow and teacher policy controls (creation, class assignment request path, deletion constraints) with no mismatches requiring code changes.

## Final Validation Evidence
- `npm run test -- tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (pass, 3 tests)
- `npm run test -- tests/unit/hooks/useSubjects.test.js tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx tests/unit/hooks/useRegister.test.js tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx` (pass, 54 tests)
- `npx tsc --noEmit` (pass)
- `npm run lint` (pass, warnings only outside scope)
- `get_errors` on touched files (clean)

