<!-- copilot/explanations/temporal/lossless-reports/2026-04-02/phase-04-preview-and-policy-matrix-slice-02.md -->

# Lossless Report - Phase 04 Slice 02 (Exact Preview + Policy Matrix)

## Requested Scope
1. Implement exact-app customization preview architecture for institution admin.
2. Execute policy-toggle enforcement verification matrix and patch mismatches if detected.

## Preserved Behaviors
- Palette extraction flow remains preview-only until explicit save.
- `previewPaletteApply` still updates preview form colors without auto-persisting.
- Existing role toggle (`docente` / `estudiante`) and viewport toggle controls remain available.
- Save/reset flow in customization editor remains explicit and unchanged.
- Existing user-tab pagination and policy-save workflows remain unchanged.

## Touched Files
- `src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx`
- `src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx` (new)
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/README.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/strategy-roadmap.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/phases/phase-04-institution-admin-dashboard-upgrades.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/subplans/subplan-03-institution-admin-dashboard-upgrades.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/working/execution-log-2026-04-02.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/reviewing/verification-checklist-2026-04-02.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/CustomizationTab.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.md` (new)

## Per-File Verification Notes
- `InstitutionCustomizationMockView.tsx`
  - Migrated preview rendering from static mock cards to exact Home-surface adapter.
  - Verified role toggle text remains present (`Panel docente` / `Panel estudiante`) for continuity and tests.
- `CustomizationHomeExactPreview.tsx`
  - Reuses `HomeControls` and `HomeContent` with isolated static mock data and no-op mutating handlers.
  - Applies live Home CSS variables from editor colors, including active-token visual emphasis.
  - Keeps preview deterministic with no Firestore/Auth coupling.

## Policy Matrix Execution
Validated with focused automated suites:
1. Dynamic code requirement flow:
   - `tests/unit/hooks/useRegister.test.js`
2. Teacher autonomous subject creation toggle:
   - `tests/unit/hooks/useSubjects.test.js`
3. Teacher class/student assignment restriction flow:
   - `tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx`
4. Teacher delete-with-students restriction:
   - `tests/unit/hooks/useSubjects.test.js`
5. Institution-admin policy panel save/wiring:
   - `tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx`

Result: no mismatches detected in this matrix run; no policy hotfix required for this slice.

## Validation Summary
- `npm run test -- tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> PASS (3 tests)
- `npm run test -- tests/unit/hooks/useSubjects.test.js tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx tests/unit/hooks/useRegister.test.js tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx` -> PASS (54 tests)
- `npx tsc --noEmit` -> PASS
- `npm run lint` -> PASS (warnings only in unrelated `src/pages/Content/*` files)
- `get_errors` on touched source files -> clean
