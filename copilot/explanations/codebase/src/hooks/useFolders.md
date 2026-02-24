## [2026-02-24] Refactor: Remove subjectIds/folderIds from Folder Creation and All Operations

### Context
- The folder and subject data model was refactored to use a single source of truth for relationships.
- Folders no longer have `folderIds` or `subjectIds` fields.
- All folder/subject relationships are now tracked by `parentId` (for folders) and `folderId` (for subjects).

### Previous State
- `addFolder` sometimes created folders with `folderIds: []` and `subjectIds: []` fields.
- Folder move/delete operations manipulated these arrays.

### New State
- `addFolder` only creates the fields needed for the folder (no subjectIds/folderIds arrays).
- All folder/subject relationships are managed by updating the `parentId` or `folderId` field on the child.
- All code that manipulated `subjectIds` or `folderIds` arrays has been removed.

### Changelog
- Removed all code that creates or updates `subjectIds` or `folderIds` arrays in folders.
- All folder/subject relationships are now managed by updating the `parentId` or `folderId` field on the child document.
- Updated all move/delete/share/unshare logic to use queries by `parentId` or `folderId`.

---

This file mirrors the current state of `src/hooks/useFolders.js` as of 2026-02-24. All folder/subject relationships are now single-source-of-truth and array fields are not used or created.