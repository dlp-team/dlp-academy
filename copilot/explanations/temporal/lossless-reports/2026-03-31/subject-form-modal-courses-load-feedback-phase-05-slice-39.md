<!-- copilot/explanations/temporal/lossless-reports/2026-03-31/subject-form-modal-courses-load-feedback-phase-05-slice-39.md -->
# Lossless Report - Phase 05 Slice 39 SubjectFormModal Courses Load Feedback Hardening

## Requested Scope
Continue the active plan with the next Phase 05 reliability slice and keep per-subtask commit/push documentation on branch.

## Delivered Scope
- Hardened `src/pages/Subject/modals/SubjectFormModal.jsx` general-tab course loading determinism.
- Added explicit `coursesLoadError` state for failed `courses` queries.
- Added permission-specific and generic course-load feedback messaging.
- Added inline general-tab banner so course-load failures are visible to users.
- Expanded `tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx` with denied-courses-query regression coverage.

## Preserved Behaviors
- Existing classes-tab load feedback (`classesLoadError`) remains unchanged.
- Existing form validation and save flow remain unchanged.
- Existing sharing and classes assignment action flows remain unchanged.

## Touched Files
1. `src/pages/Subject/modals/SubjectFormModal.jsx`
2. `tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx`
3. `copilot/plans/active/autopilot-platform-hardening-and-completion/phases/phase-05-subject-topic-exam-workflow-completion.md`
4. `copilot/plans/active/autopilot-platform-hardening-and-completion/strategy-roadmap.md`
5. `copilot/explanations/codebase/src/pages/Subject/modals/SubjectFormModal.md`
6. `copilot/explanations/codebase/tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.md`
7. `copilot/explanations/temporal/lossless-reports/2026-03-31/subject-form-modal-courses-load-feedback-phase-05-slice-39.md`

## Validation Summary
- Diagnostics: `get_errors` clean for touched source and test files.
- Touched-file lint:
  - `npx eslint src/pages/Subject/modals/SubjectFormModal.jsx tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx`
  - Result: clean.
- Focused tests:
  - `npx vitest run tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx`
  - Result: 1 file passed, 3 tests passed.

## Residual Risks
- General-tab course-load feedback is informational only and does not include an explicit retry button.
