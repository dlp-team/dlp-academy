<!-- copilot/explanations/temporal/lossless-reports/2026-04-02/phase-05-academic-year-governance-slice-01.md -->

# Lossless Report - Phase 05 Slice 01 (Academic-Year Governance Baseline)

## Requested Scope
1. Start Phase 05 by enforcing academic-year governance in institution admin classes/courses flows.
2. Establish course-owned academic year as canonical source and class derivation behavior.
3. Add deterministic tests for new academic-year validation/derivation behaviors.

## Preserved Behaviors
- Existing course/class CRUD flow, trash lifecycle, and delete confirmation interactions remain unchanged.
- Teacher/student picker behavior in class creation/detail remains unchanged.
- Existing Institution Admin navigation and tab behavior remain unchanged.
- Existing retention and bin automation behavior in `useClassesCourses` remains unchanged.

## Touched Files
- `src/pages/InstitutionAdminDashboard/components/classes-courses/academicYearUtils.ts` (new)
- `src/pages/InstitutionAdminDashboard/components/classes-courses/AcademicYearPicker.tsx` (new)
- `src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.tsx`
- `src/pages/InstitutionAdminDashboard/modals/CreateClassModal.tsx`
- `src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.ts`
- `src/pages/InstitutionAdminDashboard/components/classes-courses/CourseDetail.tsx`
- `src/pages/InstitutionAdminDashboard/components/classes-courses/ClassDetail.tsx`
- `src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx`
- `tests/unit/pages/institution-admin/academicYearUtils.test.js` (new)
- `tests/unit/pages/institution-admin/CreateClassModal.academicYear.test.jsx` (new)
- `tests/unit/pages/institution-admin/CreateCourseModal.academicYear.test.jsx` (new)
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/README.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/strategy-roadmap.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/phases/phase-05-academic-year-governance-and-courses-ux-overhaul.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/subplans/subplan-04-academic-year-and-courses-lifecycle.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/working/execution-log-2026-04-02.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/reviewing/verification-checklist-2026-04-02.md`

## Per-File Verification Notes
- `academicYearUtils.ts`:
  - Added strict `YYYY-YYYY` parsing/normalization and consecutive-year validation.
  - Implemented default-year logic requested by phase spec (Jul-Dec vs Jan-Jun).
  - Added bounded selector range generator (`-20` to `+10`).
- `AcademicYearPicker.tsx`:
  - Added reusable text + picker UI with selectable year chips and "Usar año actual" action.
- `CreateCourseModal.tsx`:
  - Added mandatory academic-year field with strict format gate before submit.
- `CreateClassModal.tsx`:
  - Removed free-form academic-year input.
  - Class creation now derives year from selected course with deterministic fallback for legacy invalid records.
- `useClassesCourses.ts`:
  - Normalizes academic year on create/update.
  - Propagates updated course year to linked classes.
  - Derives class year from linked course when class payload does not provide valid year.
- `CourseDetail.tsx`:
  - Added canonical academic-year inline editor with strict validation.
  - Surfaced year in header and stats.
- `ClassDetail.tsx`:
  - Removed direct year editing and switched to course-derived display model.
  - Identifier save now carries derived year coherence updates.
- `ClassesCoursesSection.tsx`:
  - Added defensive validation for course/class create handlers.

## Validation Summary
- `get_errors` on all touched source and test files -> clean.
- Focused tests:
  - `npm run test -- tests/unit/pages/institution-admin/academicYearUtils.test.js tests/unit/pages/institution-admin/CreateClassModal.academicYear.test.jsx tests/unit/pages/institution-admin/CreateCourseModal.academicYear.test.jsx` -> PASS (7 tests).
- `npm run lint` -> PASS with pre-existing warnings only in unrelated `src/pages/Content/*` files.
- `npx tsc --noEmit` -> PASS.

## Residual Risks
- Legacy courses without academic year now fall back on class creation; a later migration pass may still be useful to normalize historical course documents.
- Home-side Phase 05 requirements (year filters/collapsibles/history-tab removal/role indicators) remain pending for next slices.
