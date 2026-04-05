<!-- copilot/explanations/temporal/home/phase-01-modal-foundation-and-scrollbar-block-a-2026-04-05.md -->
# Phase 01 Block A - Modal Foundation and Scrollbar Correction

## Context
Phase 01 started with a low-risk migration slice to establish a reusable modal shell and remove the Home-related global scrollbar left-gap artifact.

## Previous State
- Multiple confirm modal components implemented their own overlay/backdrop shell markup.
- Global custom scrollbar mode used `scrollbar-gutter: stable both-edges`, reserving space on both sides and causing an unwanted left visual gap.

## New State
- Added [src/components/ui/BaseModal.tsx](src/components/ui/BaseModal.tsx) to centralize:
  - backdrop rendering,
  - outside-click close behavior,
  - content click propagation guard,
  - wrapper/class/style extension hooks.
- Migrated initial consumers:
  - [src/components/modals/DeleteModal.tsx](src/components/modals/DeleteModal.tsx)
  - [src/pages/Home/components/HomeDeleteConfirmModal.tsx](src/pages/Home/components/HomeDeleteConfirmModal.tsx)
- Corrected scrollbar compensation in [src/index.css](src/index.css) by changing `stable both-edges` to `stable`.

## Why This Is Lossless
- All user-visible confirmation copy and action branching in migrated components remains unchanged.
- Existing handler contracts (`onClose`, `onConfirm`, `handleDelete`) remain unchanged.
- Home tokenized styling remains intact by passing existing class tokens into the shared shell.

## Validation
- Added [tests/unit/components/BaseModal.test.jsx](tests/unit/components/BaseModal.test.jsx) for deterministic close/propagation/style behavior.
- Re-ran nearby modal tests:
  - `tests/unit/components/BinConfirmModals.test.jsx`.
- `get_errors` returned no diagnostics for touched files.

## Follow-Up in Phase 01
- Adopt `BaseModal` in higher-complexity modal flows.
- Add dirty-state close interception support and first adopting form modal.
- Run broader modal regression suite before closing Phase 01.
