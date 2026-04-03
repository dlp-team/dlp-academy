<!-- copilot/explanations/temporal/lossless-reports/2026-04-03/phase-03-course-label-disambiguation-and-subject-class-year-filtering.md -->
# Lossless Review Report

- Timestamp: 2026-04-03 local
- Task: Phase 03 slice - course label disambiguation and subject class-year filtering
- Request summary: Start Phase 03 by reducing duplicate course-name ambiguity and limiting subject class assignment candidates to the subject academic year.

## 1) Requested scope
- Add clearer course labels where duplicate course names across academic years appear.
- Add academic-year grouped/collapsible organization for courses and classes.
- Add start/end academic-year range filtering for organization views.
- Keep class academic year linkage behavior intact.
- Restrict subject classes-tab class candidates to same academic year as the edited subject.

## 2) Out-of-scope preserved
- No Firestore rules or backend functions changed.
- No notifications, lifecycle automation, or bin-mode logic changed in this slice.

## 3) Touched source/test files
- `src/utils/courseLabelUtils.ts`
- `src/pages/Subject/modals/subject-form/BasicInfoFields.tsx`
- `src/pages/InstitutionAdminDashboard/modals/CreateClassModal.tsx`
- `src/pages/InstitutionAdminDashboard/components/classes-courses/ClassDetail.tsx`
- `src/pages/InstitutionAdminDashboard/components/classes-courses/ClassList.tsx`
- `src/pages/InstitutionAdminDashboard/components/classes-courses/CourseList.tsx`
- `src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx`
- `src/pages/InstitutionAdminDashboard/components/UserDetailView.tsx`
- `src/pages/Subject/modals/SubjectFormModal.tsx`
- `tests/unit/utils/courseLabelUtils.test.js`

## 4) Per-file verification
### File: `src/utils/courseLabelUtils.ts`
- Why touched: centralize disambiguated course label generation.
- Verification:
  - Exposes `getCourseDisplayLabelFromValues` and `getCourseDisplayLabel`.
  - Uses existing academic-year normalization utility.
- Result: ✅ expected behavior.

### File: `src/pages/Subject/modals/subject-form/BasicInfoFields.tsx`
- Why touched: show disambiguated labels in subject course selector.
- Verification:
  - Selector display now uses shared formatter.
  - Stored value remains `course.name` for compatibility.
- Result: ✅ expected behavior.

### File: `src/pages/InstitutionAdminDashboard/modals/CreateClassModal.tsx`
- Why touched: disambiguate course labels in class creation dropdown.
- Verification:
  - Dropdown labels now show `Nombre (AAAA-AAAA)` when year exists.
  - Existing courseId-based submission behavior unchanged.
- Result: ✅ expected behavior.

### File: `src/pages/InstitutionAdminDashboard/components/classes-courses/ClassDetail.tsx`
- Why touched: disambiguate labels in class detail views/edits.
- Verification:
  - Header badge, course stat, course picker options, and preview use shared formatter.
  - Existing course/year derivation logic for saves remains unchanged.
- Result: ✅ expected behavior.

### Files: `ClassList.tsx`, `CourseList.tsx`, `ClassesCoursesSection.tsx`, `UserDetailView.tsx`
- Why touched: extend disambiguated labels and implement grouped/filterable organization views.
- Verification:
  - Class list table uses shared course label formatter.
  - Course cards and trashed-course rows use disambiguated labels.
  - User detail related-class subtitles use disambiguated labels.
  - Organization toolbar now supports `Desde/Hasta` academic-year filters.
  - Courses and classes now render in collapsible academic-year groups.
  - Existing select/edit/delete flows were preserved.
- Result: ✅ expected behavior.

### File: `src/pages/Subject/modals/SubjectFormModal.tsx`
- Why touched: enforce same-year class candidate filtering in classes tab.
- Verification:
  - Derived `subjectAcademicYear` from `initialData`.
  - Class loader filters by normalized class academic year when subject year exists.
  - Added user-facing informational text in Spanish in classes tab.
- Result: ✅ expected behavior.

## 5) Validation summary
- `get_errors` on all touched implementation files: clean.
- `npm run lint`: passed with existing unrelated warnings in `src/pages/Content/Exam.jsx` and `src/pages/Content/StudyGuide.jsx`.
- `npx tsc --noEmit`: passed.
- `npx vitest run tests/unit/utils/courseLabelUtils.test.js`: passed (5 tests).

## 6) Documentation sync
- Updated codebase explanation files:
  - `copilot/explanations/codebase/src/pages/Subject/modals/SubjectFormModal.md`
  - `copilot/explanations/codebase/src/pages/Subject/modals/subject-form/BasicInfoFields.md`
  - `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/modals/CreateClassModal.md`
  - `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/classes-courses/ClassDetail.md`
  - `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/classes-courses/ClassList.md`
  - `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/classes-courses/CourseList.md`
  - `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.md`
  - `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/UserDetailView.md`
  - `copilot/explanations/codebase/src/utils/courseLabelUtils.md`
  - `copilot/explanations/codebase/tests/unit/utils/courseLabelUtils.test.md`

## 7) Cleanup metadata
- Keep until: 2026-04-05 local (minimum 48h retention)
- Cleanup candidate after: 2026-04-05 local
- Note: cleanup requires explicit user confirmation.
