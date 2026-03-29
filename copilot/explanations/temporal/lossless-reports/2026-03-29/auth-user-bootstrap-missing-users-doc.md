# Lossless Change Report - Auth User Bootstrap Missing users/{uid} Doc

## Date
- 2026-03-29

## Requested Scope
- Investigate why a newly logged-in account is prompted for role/onboarding and why no document appears in `users` collection.
- Fix the responsible code paths without regressing existing auth flows.

## Root Cause Summary
- `src/pages/Auth/Login.jsx` created `users/{uid}` via `setDoc(..., { merge: true })` with only `email` and `lastLogin` for non-existing docs. This produced incomplete user docs (missing `role` and often `displayName`), which triggers onboarding role steps.
- In both login paths (`Login.jsx` and `useLogin.js`), `resolveInstitutionId` queried `institution_invites` with `getDocs(...where('email'...))`. Firestore rules restrict list access for normal users, causing permission errors before user bootstrap write, leaving no `users/{uid}` doc in some first-login paths.
- In `useRegister.js`, direct-invite deletion happened before creating `users/{uid}`. If invite deletion failed, registration could complete in Auth but skip Firestore profile creation.
- `src/hooks/useNotifications.js` subscribed to `notifications` with `onSnapshot` without an error callback, while `firestore.rules` had no `notifications` match block (implicit deny). This caused uncaught `permission-denied` snapshot errors and downstream Firestore internal assertion logs.

## Files Touched
- `src/pages/Auth/Login.jsx`
- `src/pages/Auth/hooks/useLogin.js`
- `src/pages/Auth/hooks/useRegister.js`
- `src/pages/Onboarding/components/OnboardingWizard.jsx`
- `src/hooks/useNotifications.js`
- `firestore.rules`
- `copilot/explanations/codebase/src/pages/Auth/Login.md`
- `copilot/explanations/codebase/src/pages/Auth/hooks/useLogin.md`
- `copilot/explanations/codebase/src/pages/Auth/hooks/useRegister.md`
- `copilot/explanations/codebase/src/pages/Onboarding/components/OnboardingWizard.md`
- `copilot/explanations/codebase/src/hooks/useNotifications.md`
- `copilot/explanations/codebase/firestore.rules.md`

## Lossless Preservation Checklist
- Preserved existing route structure and visual UI behavior for login/register pages.
- Preserved role defaults (`student`) and institution-resolution strategy (invite-first, domain fallback).
- Preserved onboarding wizard behavior for genuinely missing profile fields.
- Preserved direct-invite cleanup behavior, but made it non-blocking after user creation.

## Per-File Verification
- `src/pages/Auth/Login.jsx`
  - Added file path header comment.
  - Hardened institution lookup: permission failures on invite list now warn and continue to domain-based lookup.
  - New-user bootstrap now writes complete user schema (`uid`, `displayName`, `email`, `photoURL`, `role`, `institutionId`, `createdAt`, `lastLogin`, `settings`).
  - Existing-user updates remain merge-based (`lastLogin`, optional `institutionId` backfill).
- `src/pages/Auth/hooks/useLogin.js`
  - Added file path header comment.
  - Hardened invite-email query with fallback behavior on permission-denied.
- `src/pages/Auth/hooks/useRegister.js`
  - Added file path header comment.
  - Reordered operations: create `users/{uid}` first, then attempt direct invite deletion in try/catch to prevent profile creation loss.
- `src/pages/Onboarding/components/OnboardingWizard.jsx`
  - Removed redundant internal `onSnapshot` listener on `users/{uid}`.
  - Wizard now derives missing fields from the `user` prop already maintained by `App` listener.
  - Prevents unhandled snapshot permission errors from crashing the client with Firestore internal assertion chains.
- `src/hooks/useNotifications.js`
  - Added explicit snapshot error callback for the notifications listener.
  - Listener failures now degrade gracefully (clear list + log) instead of causing uncaught runtime crashes.
- `firestore.rules`
  - Added explicit rules for `notifications/{notificationId}`.
  - Users can manage only own notifications; global admin retains full access; institution admin can manage same-institution docs.

## Validation Summary
- `get_errors` on touched files: clean.
  - `src/pages/Auth/Login.jsx`: no errors.
  - `src/pages/Auth/hooks/useLogin.js`: no errors.
  - `src/pages/Auth/hooks/useRegister.js`: no errors.
  - `src/pages/Onboarding/components/OnboardingWizard.jsx`: no errors.
  - `src/hooks/useNotifications.js`: no errors.
  - `firestore.rules`: no errors.

## Expected Outcome After Fix
- First login no longer leaves missing `users/{uid}` due invite-list permission failures.
- First-login bootstrap produces a role-populated user doc (`student` by default) when missing.
- Registration no longer loses profile creation if invite cleanup fails.
- Onboarding wizard only appears for genuinely missing required fields (e.g., missing institution/display name), not because of silent bootstrap write failures.
- Realtime notifications listener no longer crashes the app on permission denials.
- `notifications` collection now has explicit access policy in repository rules (must be deployed to take effect in project backend).
