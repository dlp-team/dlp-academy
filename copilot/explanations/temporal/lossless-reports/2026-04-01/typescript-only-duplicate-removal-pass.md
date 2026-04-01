<!-- copilot/explanations/temporal/lossless-reports/2026-04-01/typescript-only-duplicate-removal-pass.md -->
# Lossless Report - TypeScript-Only Duplicate Removal Pass

Date: 2026-04-01

## Requested Scope
- Remove `.jsx` and `.js` files that have `.tsx`/`.ts` equivalents.
- Ensure working imports target TypeScript modules (no extension-forced `.jsx`/`.js` in `src`).
- Confirm high-priority duplicates are gone (`Exam`, `StudyGuide`, Institution Admin classes/courses helpers).

## Implementation Summary
1. Replaced explicit extension imports with extensionless module imports in affected files:
- `src/main.tsx`
- `src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx`
- `src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.tsx`
- `src/pages/InstitutionAdminDashboard/modals/CreateClassModal.tsx`
- `src/pages/InstitutionAdminDashboard/components/classes-courses/CourseDetail.tsx`
- `src/pages/InstitutionAdminDashboard/components/classes-courses/ClassDetail.tsx`
- `tests/unit/pages/institution-admin/ClassesCoursesSection.deleteConfirm.test.jsx`

2. Removed duplicate JS/JSX counterparts where TS/TSX files exist (including `Exam.jsx`, `StudyGuide.jsx`, `Shared.jsx`, `useClassesCourses.js`, and the rest of the duplicate list).

3. Normalized touched TS/TSX file header path comments to match actual TS/TSX filenames.

## Verification Evidence
### Duplicate inventory and source counts
- `SRC_JSX_COUNT=0`
- `SRC_JS_COUNT=1`
- `SRC_DUPLICATE_PAIRS=0`
- Remaining JS file in `src`: `src/hooks/useShortcuts.js` (no `.ts` counterpart, therefore not a duplicate).

### Import scan
- No explicit `.jsx` or `.js` import specifiers found in `src/**`.
- Test-side explicit `.js` specifiers only remain for `functions/security/*.js` tests (intended Node/Functions JS modules).

### Diagnostics
- `get_errors` clean for all touched application/test files in this pass.

### Quality gates
- `npm run lint`: pass
- `npx tsc --noEmit`: pass
- `npm run build`: pass
- `npm run test`: pass (`71/71` files, `385/385` tests)

## Preserved Behaviors
- No runtime feature logic changed in this pass; changes were limited to module resolution paths, duplicate file removal, and header comment normalization.
- Institution Admin classes/courses flows preserved (validated by diagnostics and existing test suite).
- Content flows preserved with TypeScript sources as canonical implementation files.

## Touched Files
- `src/main.tsx`
- `src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx`
- `src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.tsx`
- `src/pages/InstitutionAdminDashboard/modals/CreateClassModal.tsx`
- `src/pages/InstitutionAdminDashboard/components/classes-courses/CourseDetail.tsx`
- `src/pages/InstitutionAdminDashboard/components/classes-courses/ClassDetail.tsx`
- `tests/unit/pages/institution-admin/ClassesCoursesSection.deleteConfirm.test.jsx`
