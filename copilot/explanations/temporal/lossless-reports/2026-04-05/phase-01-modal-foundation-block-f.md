<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/phase-01-modal-foundation-block-f.md -->
# Lossless Report - Phase 01 Modal Foundation Block F

## 1. Requested Scope
- Continue Phase 01 modal-shell unification.
- Migrate remaining low-risk Home modal shells.
- Add focused regression coverage for migrated Home modal surfaces.

## 2. Explicitly Preserved Out-of-Scope Behavior
- Subject create/edit form fields and submit handlers were preserved.
- Existing icon/color selection behavior in both Home subject modals was preserved.
- No sharing/permissions/Firebase data behavior was changed.

## 3. Touched Files
- [src/pages/Home/modals/SubjectModal.tsx](src/pages/Home/modals/SubjectModal.tsx)
- [src/pages/Home/modals/EditSubjectModal.tsx](src/pages/Home/modals/EditSubjectModal.tsx)
- [tests/unit/pages/home/HomeSubjectModals.test.jsx](tests/unit/pages/home/HomeSubjectModals.test.jsx)
- [copilot/plans/inReview/home-bin-institution-admin-unification-2026-04-05/phases/phase-01-global-modal-and-scrollbar-foundation.md](copilot/plans/inReview/home-bin-institution-admin-unification-2026-04-05/phases/phase-01-global-modal-and-scrollbar-foundation.md)
- [copilot/plans/inReview/home-bin-institution-admin-unification-2026-04-05/working/phase-01-modal-and-scrollbar-kickoff.md](copilot/plans/inReview/home-bin-institution-admin-unification-2026-04-05/working/phase-01-modal-and-scrollbar-kickoff.md)
- [copilot/plans/inReview/home-bin-institution-admin-unification-2026-04-05/strategy-roadmap.md](copilot/plans/inReview/home-bin-institution-admin-unification-2026-04-05/strategy-roadmap.md)
- [copilot/plans/inReview/home-bin-institution-admin-unification-2026-04-05/user-updates.md](copilot/plans/inReview/home-bin-institution-admin-unification-2026-04-05/user-updates.md)
- [copilot/explanations/codebase/src/components/ui/BaseModal.md](copilot/explanations/codebase/src/components/ui/BaseModal.md)
- [copilot/explanations/codebase/src/pages/Home/modals/SubjectModal.md](copilot/explanations/codebase/src/pages/Home/modals/SubjectModal.md)
- [copilot/explanations/codebase/src/pages/Home/modals/EditSubjectModal.md](copilot/explanations/codebase/src/pages/Home/modals/EditSubjectModal.md)

## 4. Per-File Verification
- [src/pages/Home/modals/SubjectModal.tsx](src/pages/Home/modals/SubjectModal.tsx)
  - Verified shell migrated to `BaseModal` while preserving existing header/body form controls and submit action.
  - Verified backdrop close still triggers `onClose`.
- [src/pages/Home/modals/EditSubjectModal.tsx](src/pages/Home/modals/EditSubjectModal.tsx)
  - Verified shell migrated to `BaseModal` while preserving local form state and submit behavior.
  - Verified backdrop close still triggers `onClose`.
- [tests/unit/pages/home/HomeSubjectModals.test.jsx](tests/unit/pages/home/HomeSubjectModals.test.jsx)
  - Verified deterministic backdrop-close behavior for both migrated Home modals.

## 5. Risks and Checks
- Risk: migration could alter modal close behavior.
  - Check: added focused unit tests for backdrop close behavior.
- Risk: form behavior regressions in Subject modals.
  - Check: preserved form internals and re-ran related SubjectForm regression tests in the same block.

## 6. Validation Summary
- Diagnostics:
  - `get_errors` clean for touched source/test files.
- Tests:
  - `npm run test:unit -- tests/unit/pages/home/HomeSubjectModals.test.jsx tests/unit/components/BaseModal.test.jsx tests/unit/pages/subject/SubjectFormModal.coursePeriodSchedule.test.jsx tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx` -> PASS.
- Typecheck:
  - `npx tsc --noEmit` -> PASS.

