// copilot/explanations/codebase/src/pages/Home/utils/homeKeyboardClipboardUtils.md

## Changelog
### 2026-03-12: Copy-paste reset for subject assignments
- Subject clone payload now clears assignment metadata (`classId`, `classIds`, `enrolledStudentUids`) so pasted copies are unassigned/new.
- Folder clone payload no longer carries description metadata.

### 2026-03-09: Initial utility helpers
- Added helpers to build copy-clone payloads for subject/folder keyboard workflows.
- Subject clone payload is private by default (`isShared: false`, empty sharing arrays).
- Folder clone payload includes only card-level metadata and parent target.

## Overview
Utility module for keyboard copy/paste cloning semantics in Home.

## Exports
- `buildSubjectClonePayload(subject, targetFolderId, user)`
- `buildFolderClonePayload(folder, targetParentId)`
