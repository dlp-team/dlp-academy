// copilot/plans/todo/profile-picture-storage-migration/README.md

# Profile Picture Storage Migration Plan

## Problem Statement
Currently, profile pictures are uploaded and stored as base64 or URLs in Firestore. This is inefficient and not scalable for image files. The goal is to migrate profile picture uploads to Firebase Storage, enforce a file size limit, and update display logic to use Storage download URLs.

## Scope
- Move profile picture upload logic to Firebase Storage.
- Enforce a file size limit (default: 2MB unless specified otherwise).
- Save only the download URL in Firestore for user profile reference.
- Update profile picture display logic to use the Storage URL.
- Validate and document all changes.

## Non-Goals
- Migration of existing profile pictures (unless requested).
- Changes to other user fields or unrelated upload logic.

## Status
Drafted. Awaiting implementation.

## Key Decisions & Assumptions
- File size limit will be 2MB unless user specifies otherwise.
- Only new uploads will use Storage; existing images remain until migrated.
- All visible text for upload errors/info will be in Spanish.
- No browser alerts; info will be shown as text near the upload element.

---

## Next Steps
- Create `strategy-roadmap.md` and phase files.
- Begin implementation after plan review.
