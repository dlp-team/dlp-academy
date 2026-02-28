# Lossless Change Report — transfer shortcut cleanup + owner self-unshare visibility

## Summary
Applied two follow-up fixes:
1. New-owner shortcut is now auto-removed after ownership transfer (permission-safe path).
2. In share tabs, owner no longer sees "Eliminar acceso para mí".

## Files Changed
- `src/hooks/useShortcuts.js`
  - In target snapshot resolution, when a shortcut target becomes owned by current user (`ownerId/uid === user.uid`), the shortcut is deleted via best-effort cleanup and not resolved in UI.
  - This removes recipient shortcut after transfer from the recipient side without requiring cross-user admin permissions.
- `src/pages/Home/components/FolderManager.jsx`
  - Self-unshare block now requires `!isOwnerManager`.
- `src/pages/Subject/modals/SubjectFormModal.jsx`
  - Self-unshare block now requires `!isOwnerManager`.

## Validation
- Diagnostics run on all touched files: no errors found.
