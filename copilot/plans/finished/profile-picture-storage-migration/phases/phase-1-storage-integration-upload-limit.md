// copilot/plans/todo/profile-picture-storage-migration/phases/phase-1-storage-integration-upload-limit.md

# Phase 1: Storage Integration & Upload Limit

## Objective
Integrate Firebase Storage for profile picture uploads and enforce a file size limit (2MB).

## Changes
- Add Firebase Storage initialization if missing.
- Update upload logic in EditProfileModal to use Storage.
- Add file size check before upload (max 2MB).
- Show Spanish error/info text near upload element (no alerts).

## Risks
- Storage SDK integration issues.
- UI regressions if upload logic breaks.

## Completion Notes
- Upload logic must reject files >2MB and show clear Spanish message.
- Storage upload must succeed and return download URL.
