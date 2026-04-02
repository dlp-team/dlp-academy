<!-- copilot/explanations/codebase/src/pages/Home/components/bin/BinConfirmModals.md -->
# BinConfirmModals.tsx

## Overview
- **Source file:** `src/pages/Home/components/bin/BinConfirmModals.tsx`
- **Last documented:** 2026-04-02
- **Role:** Confirmation dialogs for single-item and full-bin permanent deletion.

## Responsibilities
- Presents irreversible-action warning dialogs.
- Handles loading state while permanent deletion is running.
- Adapts copy/details for subject deletion vs folder subtree deletion.

## Changelog
- **2026-04-02:** Extended `EmptyBinConfirmModal` with optional `title`, `description`, `confirmLabel`, and `isConfirming` props so bin selection-mode bulk delete can reuse the same modal with explicit copy/loading states.
- **2026-04-02:** Updated `DeleteConfirmModal` to support typed targets (`subject` or `folder`) and loading keys based on `{itemType}:{id}`.
