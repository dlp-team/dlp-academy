# Lossless Change Report — Transfer promotion + previous-owner shortcut fix

## Summary
Fixed remaining transfer issues:
1. New owner now gets the original item moved to their former shortcut location (`folderId`/`parentId`).
2. Previous owner now reliably gets a new shortcut pointing to the transferred original, in the original location they had before transfer.

## Root cause
- Previous-owner shortcut was created before ownership update and could be auto-cleaned by shortcut-owner logic while item was still owned by the same user.
- New owner placement relied on cross-user reads in earlier versions and then lost relocation after permission-safe simplification.

## Changes

### 1) Shortcut promotion logic (new owner side)
- File: `src/hooks/useShortcuts.js`
- In target snapshot handling for a shortcut whose target is now owned by current user:
  - Promote shortcut placement into source item before deleting shortcut:
    - subject: set `folderId = shortcut.parentId`
    - folder: set `parentId = shortcut.parentId`
  - Promote appearance overrides from shortcut into source item where present.
  - Then delete shortcut.
- Added in-memory guard (`promotingShortcutIdsRef`) to prevent duplicate promotion/delete races.

### 2) Previous-owner shortcut timing
- File: `src/hooks/useSubjects.js`
  - Moved previous-owner shortcut creation to run **after** source ownership update.
- File: `src/hooks/useFolders.js`
  - Same timing change for folders.

This ordering avoids accidental cleanup of the newly-created previous-owner shortcut.

## Validation
- Diagnostics on changed files report no errors.
