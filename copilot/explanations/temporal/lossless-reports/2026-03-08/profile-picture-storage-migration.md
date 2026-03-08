// copilot/explanations/temporal/lossless-reports/2026-03-08/profile-picture-storage-migration.md

## Requested Scope
- Migrate profile picture upload logic to Firebase Storage
- Enforce 2MB file size limit
- Save download URL in Firestore
- Update display logic to use Storage URL

## Preserved Behaviors
- Existing profile display logic and fallback to initials
- All other user profile fields and update logic

## Touched Files
- src/firebase/config.js
- src/pages/Profile/modals/EditProfileModal.jsx
- src/pages/Profile/Profile.jsx
- src/pages/Profile/hooks/useProfile.js
- src/components/ui/Avatar.jsx
- src/pages/Profile/components/UserCard.jsx

## Per-file Verification
- config.js: Storage initialized and exported, no errors
- EditProfileModal.jsx: Upload logic updated, file size limit enforced, Spanish error text, no errors
- Profile.jsx: userId passed to modal, no errors
- useProfile.js: No changes needed, no errors
- Avatar.jsx: No changes needed, no errors
- UserCard.jsx: No changes needed, no errors

## Validation Summary
- All touched files compile with no errors
- Upload rejects files >2MB and shows Spanish error text
- Profile picture uploads to Storage and displays from download URL
- No regressions in adjacent profile logic

## Next Steps
- Test upload and display flows in UI
- Update codebase explanations if needed
