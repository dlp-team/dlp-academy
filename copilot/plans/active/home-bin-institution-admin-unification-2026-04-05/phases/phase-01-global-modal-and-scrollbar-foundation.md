<!-- copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/phases/phase-01-global-modal-and-scrollbar-foundation.md -->
# Phase 01 - Global Modal and Scrollbar Foundation

## Status
- IN_PROGRESS

## Objective
Create a reusable modal foundation and remove the left-side scrollbar compensation artifact without introducing layout regressions.

## Deliverables
- Shared modal primitive (for example BaseModal wrapper) with:
  - configurable width/height,
  - constrained viewport between header and screen bottom,
  - optional outside-click close behavior,
  - dirty-state close interception with confirmation flow.
- Migration plan for existing configure/edit/create modal variants to shared style.
- Scrollbar compensation cleanup so left-side visual gap disappears while preserving centered layout behavior.

## Lossless Constraints
- Preserve existing modal forms, validation flows, and required-field semantics.
- Do not change modal close behavior for hard-required workflows unless explicitly configured.
- Keep mobile and desktop modal responsiveness.

## Kickoff Findings and Initial Implementation Slice (2026-04-05)
- Priority modal unification candidates identified:
  - [src/components/modals/DeleteModal.tsx](src/components/modals/DeleteModal.tsx)
  - [src/components/modals/FolderDeleteModal.tsx](src/components/modals/FolderDeleteModal.tsx)
  - [src/components/modals/FolderTreeModal.tsx](src/components/modals/FolderTreeModal.tsx)
  - [src/components/modals/SudoModal.tsx](src/components/modals/SudoModal.tsx)
  - [src/pages/Home/modals/SubjectModal.tsx](src/pages/Home/modals/SubjectModal.tsx)
  - [src/pages/Home/modals/EditSubjectModal.tsx](src/pages/Home/modals/EditSubjectModal.tsx)
  - [src/pages/Home/components/HomeDeleteConfirmModal.tsx](src/pages/Home/components/HomeDeleteConfirmModal.tsx)
  - [src/pages/Home/components/HomeShareConfirmModals.tsx](src/pages/Home/components/HomeShareConfirmModals.tsx)
- Scrollbar artifact touchpoints identified:
  - [src/components/ui/CustomScrollbar.tsx](src/components/ui/CustomScrollbar.tsx)
  - [src/index.css](src/index.css) (`scrollbar-gutter: stable both-edges`)
- Initial Phase 01 execution order:
  1. Define and create base modal wrapper contract.
  2. Migrate lowest-risk confirm modals to wrapper.
  3. Patch scrollbar compensation strategy and validate global layout behavior.
  4. Expand wrapper adoption to higher-complexity modal surfaces.

## Implementation Progress - Block A (2026-04-05)
- Modal foundation created:
  - [src/components/ui/BaseModal.tsx](src/components/ui/BaseModal.tsx)
- Low-risk migrations completed:
  - [src/components/modals/DeleteModal.tsx](src/components/modals/DeleteModal.tsx)
  - [src/pages/Home/components/HomeDeleteConfirmModal.tsx](src/pages/Home/components/HomeDeleteConfirmModal.tsx)
- Scrollbar compensation corrected:
  - [src/index.css](src/index.css)
  - Updated `scrollbar-gutter` from `stable both-edges` to `stable` to remove left-side reserved gutter.
- Tests added for modal foundation behavior:
  - [tests/unit/components/BaseModal.test.jsx](tests/unit/components/BaseModal.test.jsx)
- Validation evidence:
  - `npm run test:unit -- tests/unit/components/BaseModal.test.jsx tests/unit/components/BinConfirmModals.test.jsx` (PASS)
  - `get_errors` on touched files (clean)

## Implementation Progress - Block B (2026-04-05)
- Base modal close-interception contract expanded:
  - Added `onBeforeClose` and `onBlockedCloseAttempt` hooks in [src/components/ui/BaseModal.tsx](src/components/ui/BaseModal.tsx).
  - Added `rootStyle` support for top-offset constrained overlays.
- Higher-complexity modal migration completed:
  - [src/components/modals/FolderDeleteModal.tsx](src/components/modals/FolderDeleteModal.tsx) now uses `BaseModal` on both main and confirmation screens.
  - Preserved screen-specific close semantics:
    - main screen backdrop closes modal,
    - confirmation screen backdrop returns to the previous step.
- Regression tests expanded:
  - [tests/unit/components/BaseModal.test.jsx](tests/unit/components/BaseModal.test.jsx) now verifies close-block behavior.
  - New [tests/unit/components/FolderDeleteModal.test.jsx](tests/unit/components/FolderDeleteModal.test.jsx) covers backdrop and action-flow semantics.
- Validation evidence:
  - `npm run test:unit -- tests/unit/components/BaseModal.test.jsx tests/unit/components/FolderDeleteModal.test.jsx tests/unit/components/BinConfirmModals.test.jsx` (PASS)
  - `npx tsc --noEmit` (PASS)
  - `get_errors` on touched files (clean)

## Implementation Progress - Block C (2026-04-05)
- First form/modal flow adopted dirty-state close interception:
  - [src/pages/Home/components/FolderManager.tsx](src/pages/Home/components/FolderManager.tsx)
  - Backdrop, header close, and footer cancel now share one guarded close evaluation path.
- Shared close guard utility extracted for deterministic behavior and reuse:
  - [src/utils/modalCloseGuardUtils.ts](src/utils/modalCloseGuardUtils.ts)
- FolderManager shell migrated to shared modal primitive:
  - Uses [src/components/ui/BaseModal.tsx](src/components/ui/BaseModal.tsx) with `onBeforeClose`.
- Regression coverage added/expanded:
  - [tests/unit/utils/modalCloseGuardUtils.test.js](tests/unit/utils/modalCloseGuardUtils.test.js)
  - [tests/unit/components/BaseModal.test.jsx](tests/unit/components/BaseModal.test.jsx)
- Validation evidence:
  - `npm run test:unit -- tests/unit/utils/modalCloseGuardUtils.test.js tests/unit/components/BaseModal.test.jsx tests/unit/components/FolderDeleteModal.test.jsx tests/unit/components/BinConfirmModals.test.jsx` (PASS)
  - `npx tsc --noEmit` (PASS)
  - `get_errors` on touched files (clean)

## Implementation Progress - Block D (2026-04-05)
- Admin-facing modal migration completed:
  - [src/components/modals/SudoModal.tsx](src/components/modals/SudoModal.tsx) now uses [src/components/ui/BaseModal.tsx](src/components/ui/BaseModal.tsx).
- Preserved security flow semantics:
  - reauthentication logic unchanged,
  - close remains blocked while submit is in progress,
  - existing cancel/close reset behavior preserved.
- Validation evidence:
  - `npm run test:unit -- tests/unit/components/SudoModal.test.jsx tests/unit/components/BaseModal.test.jsx tests/unit/components/FolderDeleteModal.test.jsx tests/unit/components/BinConfirmModals.test.jsx` (PASS)
  - `npx tsc --noEmit` (PASS)
  - `get_errors` on touched files (clean)

## Remaining Work in Phase 01
- Expand shared modal adoption to remaining admin/form-heavy modal surfaces.
- Expand dirty-state interception to additional modal forms beyond FolderManager.
- Run broader validation pass (lint/typecheck + targeted modal regressions) before Phase 01 closure.

## Validation Gate
- Unit coverage for new modal close and dirty-state interception behavior.
- Visual smoke verification for major modal surfaces (Home and Institution Admin).
- No layout shift regressions when scrollbar appears/disappears.
- Lint/typecheck pass for touched modules.

## Exit Criteria
- Shared modal foundation is production-safe and adopted by prioritized overlays.
