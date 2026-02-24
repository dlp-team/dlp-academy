## [2026-02-24] Update: FolderManager Refactored - No More subjectIds in Form

### Current State
The FolderManager component creates folders without `subjectIds` array field. The form data passed to `addFolder` contains only:
- `name`: string
- `description`: string
- `color`: gradient class
- `tags`: array
- `parentId`: string | null (added by wrapper)

### Key Points
- `subjectIds` field completely removed from form initialization
- New folders created with clean data structure (no unused array fields)
- All folder-subject relationships tracked by `subject.folderId` only

### Usage
When `onSave` is called, formData is passed to `addFolder` without subjectIds. The backend function respects the single source of truth model.

---

This file mirrors current state of `src/pages/Home/components/FolderManager.jsx` as of 2026-02-24.