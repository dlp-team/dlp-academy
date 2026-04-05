<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/phase-01-modal-foundation-block-e.md -->
# Lossless Report - Phase 01 Modal Foundation Block E

## 1. Requested Scope
- Continue Phase 01 without stopping.
- Expand dirty-state close interception to another form-heavy modal flow.
- Reuse shared modal shell and close-guard utility in Subject modal surface.

## 2. Explicitly Preserved Out-of-Scope Behavior
- Subject creation/edit form fields and validations were preserved.
- Sharing/class tabs business logic and existing pending-action overlays were preserved.
- Existing save/apply/request action workflows were preserved.
- No Firebase backend/security logic was modified.

## 3. Touched Files
- [src/pages/Subject/modals/SubjectFormModal.tsx](src/pages/Subject/modals/SubjectFormModal.tsx)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/phases/phase-01-global-modal-and-scrollbar-foundation.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/phases/phase-01-global-modal-and-scrollbar-foundation.md)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/working/phase-01-modal-and-scrollbar-kickoff.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/working/phase-01-modal-and-scrollbar-kickoff.md)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/strategy-roadmap.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/strategy-roadmap.md)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/user-updates.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/user-updates.md)
- [copilot/explanations/codebase/src/components/ui/BaseModal.md](copilot/explanations/codebase/src/components/ui/BaseModal.md)
- [copilot/explanations/codebase/src/utils/modalCloseGuardUtils.md](copilot/explanations/codebase/src/utils/modalCloseGuardUtils.md)
- [copilot/explanations/codebase/src/pages/Subject/modals/SubjectFormModal.md](copilot/explanations/codebase/src/pages/Subject/modals/SubjectFormModal.md)

## 4. Per-File Verification
- [src/pages/Subject/modals/SubjectFormModal.tsx](src/pages/Subject/modals/SubjectFormModal.tsx)
  - Verified shell migration to `BaseModal` preserved visual classes and top-offset bounds.
  - Verified close triggers (backdrop/header/footer) now share one guarded close path.
  - Verified `canCloseSharingModal` integration only prompts discard for unsaved-sharing reason.
  - Verified pending action and discard overlays remain unchanged.

## 5. Risks and Checks
- Risk: close behavior regressions in complex multi-tab modal.
  - Check: preserved all tab/action logic and only rewired shell + close request routing.
- Risk: hidden side effects in course/period/class flows.
  - Check: re-ran existing SubjectForm tests covering period schedule and classes load feedback paths.

## 6. Validation Summary
- Diagnostics:
  - `get_errors` clean for `src/pages/Subject/modals/SubjectFormModal.tsx`.
- Tests:
  - `npm run test:unit -- tests/unit/pages/subject/SubjectFormModal.coursePeriodSchedule.test.jsx tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx tests/unit/utils/modalCloseGuardUtils.test.js tests/unit/components/BaseModal.test.jsx` -> PASS.
- Typecheck:
  - `npx tsc --noEmit` -> PASS.


