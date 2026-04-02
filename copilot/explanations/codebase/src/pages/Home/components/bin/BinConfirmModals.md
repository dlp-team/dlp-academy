<!-- copilot/explanations/codebase/src/pages/Home/components/bin/BinConfirmModals.md -->
# BinConfirmModals.jsx

## Overview
- **Source file:** `src/pages/Home/components/bin/BinConfirmModals.jsx`
- **Last documented:** 2026-04-02
- **Role:** Confirmation dialogs for single-item and full-bin permanent deletion.

## Responsibilities
- Presents irreversible-action warning dialogs.
- Handles loading state while permanent deletion is running.
- Adapts copy/details for subject deletion vs folder subtree deletion.

## Changelog
- **2026-04-02:** Updated `DeleteConfirmModal` to support typed targets (`subject` or `folder`) and loading keys based on `{itemType}:{id}`.
