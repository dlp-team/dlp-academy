// copilot/explanations/codebase/src/pages/Home/utils/homeKeyboardClipboardUtils.md

## Changelog
### 2026-04-09: Metadata carry-over hardening for keyboard subject copy
- Subject keyboard clone payload now preserves lifecycle/dependency metadata from the source subject: `courseId`, `academicYear`, period fields, `postCoursePolicy`, `level`, and `grade`.
- Ownership and privacy safeguards remain unchanged: copied subjects reset share arrays and class assignment metadata while reassigning ownership to the active user.

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
