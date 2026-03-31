<!-- copilot/explanations/temporal/lossless-reports/2026-03-31/subject-form-modal-policy-load-feedback-phase-05-slice-42.md -->
# Lossless Report - Phase 05 Slice 42 SubjectFormModal Policy Load Feedback Hardening

## Requested Scope
Continue the active plan with the next Phase 05 reliability slice and keep per-subtask commit/push documentation on branch.

## Delivered Scope
- Hardened `src/pages/Subject/modals/SubjectFormModal.jsx` institution-policy preload determinism.
- Added explicit `institutionPolicyLoadError` state for failed institution policy reads.
- Added permission-specific and generic classes-tab policy preload feedback messages.
- Added inline classes-tab banner for policy-load failures.
- Expanded `tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx` with denied policy-read regression coverage.

## Preserved Behaviors
- Existing classes/general/sharing load feedback branches remain unchanged.
- Existing direct-assignment and request-assignment policy behavior remains unchanged.
- Existing sharing and save flows remain unchanged.

## Touched Files
1. `src/pages/Subject/modals/SubjectFormModal.jsx`
2. `tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx`
3. `copilot/plans/active/autopilot-platform-hardening-and-completion/phases/phase-05-subject-topic-exam-workflow-completion.md`
4. `copilot/plans/active/autopilot-platform-hardening-and-completion/strategy-roadmap.md`
5. `copilot/explanations/codebase/src/pages/Subject/modals/SubjectFormModal.md`
6. `copilot/explanations/codebase/tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.md`
7. `copilot/explanations/temporal/lossless-reports/2026-03-31/subject-form-modal-policy-load-feedback-phase-05-slice-42.md`

## Validation Summary
- Diagnostics: `get_errors` clean for touched source and test files.
- Touched-file lint:
  - `npx eslint src/pages/Subject/modals/SubjectFormModal.jsx tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx`
  - Result: clean.
- Focused tests:
  - `npx vitest run tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx`
  - Result: 1 file passed, 6 tests passed.

## Residual Risks
- Policy preload feedback is informational and does not include a dedicated retry action.
