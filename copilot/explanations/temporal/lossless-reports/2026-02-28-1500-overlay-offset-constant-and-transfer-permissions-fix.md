# Lossless Change Report — Overlay offset constant + transfer permission fix

## Summary
Two changes were applied:
1. Centralized overlay top alignment using a shared constant and replaced all previous `top-28`/variant usages.
2. Removed cross-user shortcut operations from ownership transfer flows to avoid Firestore permission failures.

## Files Changed

### Overlay alignment centralization
- `src/utils/layoutConstants.js`
  - Added `OVERLAY_TOP_OFFSET_PX = 84` (equivalent to "21" Tailwind units at 4px scale).
  - Added `OVERLAY_TOP_OFFSET_STYLE` reusable inline style.
- `src/pages/Home/components/FolderManager.jsx`
- `src/pages/Subject/modals/SubjectFormModal.jsx`
- `src/pages/Home/components/HomeShareConfirmModals.jsx`
- `src/pages/Home/components/HomeDeleteConfirmModal.jsx`
- `src/components/modals/FolderTreeModal.jsx`
- `src/components/modals/FolderDeleteModal.jsx`

All overlay wrappers now use `style={OVERLAY_TOP_OFFSET_STYLE}` and `bottom-0` instead of hardcoded `top-*` classes.

### Transfer permission fix
- `src/hooks/useSubjects.js`
  - `transferSubjectOwnership` now resolves recipient from existing `sharedWith` entry in the source subject document.
  - Removed reads/deletes of recipient-owned shortcut docs (cross-user writes/deletes).
  - Kept previous-owner shortcut creation and owner/share updates on source subject.
- `src/hooks/useFolders.js`
  - Same approach for `transferFolderOwnership`.

## Why this fixes "missing or insufficient permissions"
The previous transfer flow queried/deleted shortcut docs owned by another user (new owner). Typical Firestore rules reject those cross-user reads/writes. The new flow only mutates resources the current owner can validly edit: the source item and current-owner shortcut.

## Validation
- Ran diagnostics on all changed files: no errors reported.
- Searched for old hardcoded `top-28`/`top-25`/`top-21` overlay classes in `src/**/*.jsx`: no matches.
