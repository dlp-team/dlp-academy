// copilot/plans/todo/profile-picture-storage-migration/phases/phase-2-firestore-update-display.md

# Phase 2: Firestore Update & Display Logic

## Objective
Save Storage download URL in Firestore and update display logic to use the URL.

## Changes
- Update user profile update logic to save download URL.
- Update Avatar and UserCard components to use Storage URL.

## Risks
- Broken image links if URL not saved correctly.
- UI regressions in profile display.

## Completion Notes
- Profile picture displays correctly from Storage URL.
- Firestore only stores the download URL, not the image itself.
