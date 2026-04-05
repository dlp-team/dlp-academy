<!-- copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/working/phase-01-modal-and-scrollbar-kickoff.md -->
# Phase 01 Kickoff - Modal and Scrollbar Foundation

## Scope Slice
- Build the first reusable modal wrapper contract.
- Select and migrate low-risk confirmation modals first.
- Correct left-side scrollbar visual artifact without introducing global layout regressions.

## First Batch Candidate Files
- [src/components/modals/DeleteModal.tsx](src/components/modals/DeleteModal.tsx)
- [src/components/modals/FolderDeleteModal.tsx](src/components/modals/FolderDeleteModal.tsx)
- [src/pages/Home/components/HomeDeleteConfirmModal.tsx](src/pages/Home/components/HomeDeleteConfirmModal.tsx)
- [src/components/ui/CustomScrollbar.tsx](src/components/ui/CustomScrollbar.tsx)
- [src/index.css](src/index.css)

## Guardrails
- Keep existing modal close contracts stable per modal type.
- Do not alter required-form close flows unless dirty-state intercept behavior is explicitly configured.
- Verify desktop and mobile overlay fit after each migration step.

## Validation Plan
- Targeted tests:
  - modal outside-click behavior,
  - dirty-state close interception,
  - scrollbar layout shift and visual symmetry.
- Static checks:
  - npm run lint
  - npx tsc --noEmit
- Regression checks:
  - Home modals,
  - Institution Admin Sudo modal,
  - common confirm dialogs.

## Status Log
- 2026-04-05: Phase 01 set to IN_PROGRESS; kickoff inventory captured.
- 2026-04-05: Block A implemented.
  - Added [src/components/ui/BaseModal.tsx](src/components/ui/BaseModal.tsx).
  - Migrated [src/components/modals/DeleteModal.tsx](src/components/modals/DeleteModal.tsx) and [src/pages/Home/components/HomeDeleteConfirmModal.tsx](src/pages/Home/components/HomeDeleteConfirmModal.tsx) to the shared base.
  - Fixed scrollbar left-gap artifact in [src/index.css](src/index.css) by switching to `scrollbar-gutter: stable`.
  - Added tests in [tests/unit/components/BaseModal.test.jsx](tests/unit/components/BaseModal.test.jsx) and re-ran nearby modal tests.
- 2026-04-05: Block B implemented.
  - Extended [src/components/ui/BaseModal.tsx](src/components/ui/BaseModal.tsx) with close interception hooks and root style support.
  - Migrated [src/components/modals/FolderDeleteModal.tsx](src/components/modals/FolderDeleteModal.tsx) to `BaseModal` while preserving per-screen close semantics.
  - Added [tests/unit/components/FolderDeleteModal.test.jsx](tests/unit/components/FolderDeleteModal.test.jsx).
  - Expanded [tests/unit/components/BaseModal.test.jsx](tests/unit/components/BaseModal.test.jsx) for blocked-close coverage.
- 2026-04-05: Block C implemented.
  - Migrated [src/pages/Home/components/FolderManager.tsx](src/pages/Home/components/FolderManager.tsx) modal shell to `BaseModal`.
  - Adopted dirty-state close interception in FolderManager using [src/utils/modalCloseGuardUtils.ts](src/utils/modalCloseGuardUtils.ts).
  - Routed backdrop/header/footer close triggers through the same guard path.
  - Added [tests/unit/utils/modalCloseGuardUtils.test.js](tests/unit/utils/modalCloseGuardUtils.test.js).
- 2026-04-05: Block D implemented.
  - Migrated [src/components/modals/SudoModal.tsx](src/components/modals/SudoModal.tsx) to `BaseModal`.
  - Preserved submit-time close lock via guarded close logic.
  - Re-ran existing Sudo modal tests plus shared modal regression suite.
