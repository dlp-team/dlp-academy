<!-- copilot/explanations/temporal/lossless-reports/2026-03-31/subject-form-modal-unshare-feedback-phase-05-slice-48.md -->
# Lossless Report - Phase 05 Slice 48 SubjectFormModal Apply-All Unshare Feedback Hardening

## Requested Scope
Continue the active plan with the next Phase 05 reliability slice and keep per-subtask commit/push documentation on branch.

## Delivered Scope
- Hardened `src/pages/Subject/modals/SubjectFormModal.jsx` apply-all unshare mutation feedback.
- Added permission-specific per-user failure detail for denied unshare writes.
- Preserved generic per-user failure detail for non-permission unshare failures.
- Expanded `tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx` with denied apply-all unshare regression coverage.

## Preserved Behaviors
- Existing preload and mutation feedback branches remain unchanged.
- Existing apply-all confirmation and batching behavior remain unchanged.
- Existing sharing success-path update logic remains unchanged.

## Touched Files
1. `src/pages/Subject/modals/SubjectFormModal.jsx`
2. `tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx`
3. `copilot/plans/active/autopilot-platform-hardening-and-completion/phases/phase-05-subject-topic-exam-workflow-completion.md`
4. `copilot/plans/active/autopilot-platform-hardening-and-completion/strategy-roadmap.md`
5. `copilot/explanations/codebase/src/pages/Subject/modals/SubjectFormModal.md`
6. `copilot/explanations/codebase/tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.md`
7. `copilot/explanations/temporal/lossless-reports/2026-03-31/subject-form-modal-unshare-feedback-phase-05-slice-48.md`

## Validation Summary
- Diagnostics: `get_errors` clean for touched source and test files.
- Touched-file lint:
  - `npx eslint src/pages/Subject/modals/SubjectFormModal.jsx tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx`
- Focused tests:
  - `npx vitest run tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx`

## Residual Risks
- Apply-all unshare failure feedback remains grouped inline; there is no per-user retry action.
