<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/subject-form-create-outside-close-guard-fix.md -->
# Lossless Report - Subject Create Outside-Close Guard Fix

## 1. Requested Scope
- Fix the create-subject flow so outside click does not close immediately when the user already entered data.
- Keep continuing the active unification plan after applying the regression fix.

## 2. Explicitly Preserved Out-of-Scope Behavior
- No Firestore queries, write payload shape, or permission checks were changed.
- No changes to subject save/submit business logic.
- No visual redesign of modal layout.
- Existing sharing-tab close guard behavior remains unchanged.

## 3. Touched Files
- [src/pages/Subject/modals/SubjectFormModal.tsx](src/pages/Subject/modals/SubjectFormModal.tsx)
- [tests/unit/pages/subject/SubjectFormModal.closeGuard.test.jsx](tests/unit/pages/subject/SubjectFormModal.closeGuard.test.jsx)
- [copilot/explanations/codebase/src/pages/Subject/modals/SubjectFormModal.md](copilot/explanations/codebase/src/pages/Subject/modals/SubjectFormModal.md)
- [copilot/explanations/codebase/tests/unit/pages/subject/SubjectFormModal.closeGuard.test.md](copilot/explanations/codebase/tests/unit/pages/subject/SubjectFormModal.closeGuard.test.md)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/strategy-roadmap.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/strategy-roadmap.md)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/user-updates.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/user-updates.md)

## 4. Per-File Verification
- [src/pages/Subject/modals/SubjectFormModal.tsx](src/pages/Subject/modals/SubjectFormModal.tsx)
  - Added open-state snapshot tracking for create-flow form state.
  - Extended close evaluation to block close when create-flow unsaved changes exist.
  - Kept sharing guard decisions via existing utility and preserved pending-apply-all blocking behavior.
  - Reused the existing discard dialog with reason-based message text.
- [tests/unit/pages/subject/SubjectFormModal.closeGuard.test.jsx](tests/unit/pages/subject/SubjectFormModal.closeGuard.test.jsx)
  - Added deterministic regression assertions for clean close and dirty-close confirmation in create flow.

## 5. Risks and Checks
- Risk: edit-flow close behavior could regress while fixing create flow.
  - Check: guard logic scoped to create unsaved snapshot path; existing sharing flow remains utility-driven.
- Risk: false-positive unsaved prompts from async loading.
  - Check: snapshot captured from initialized open-state payload, not from default constructor state.

## 6. Validation Summary
- Diagnostics:
  - `get_errors` clean for touched source/test files.
- Targeted regression tests:
  - `npm run test -- tests/unit/pages/subject/SubjectFormModal.closeGuard.test.jsx tests/unit/pages/home/HomeSubjectModals.test.jsx` -> PASS.
  - `npm run test -- tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx tests/unit/pages/subject/SubjectFormModal.coursePeriodSchedule.test.jsx` -> PASS.
- Static gates:
  - `npm run lint` -> PASS.
  - `npx tsc --noEmit` -> PASS.


