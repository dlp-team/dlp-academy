# SudoModal.tsx

## Changelog
- **2026-04-05:** Migrated outer modal shell to `BaseModal` while preserving reauthentication workflow, submit-state blocking, and user-facing copy.

## Purpose
- **Source file:** `src/components/modals/SudoModal.tsx`
- **Last documented:** 2026-04-05
- **Role:** Security confirmation modal that requires user password reauthentication before sensitive actions.

## Responsibilities
- Collect password input and reauthenticate current user via Firebase Auth.
- Execute `onConfirm` only after successful reauthentication.
- Surface clear user-facing error messages for wrong password and generic failures.
- Block close while submission is in progress.

## Main Dependencies
- `firebase/auth`: `EmailAuthProvider`, `reauthenticateWithCredential`
- `src/firebase/config`: `auth`
- `src/components/ui/BaseModal.tsx`

## Behavioral Notes
- `handleClose` resets local form state and is guarded when `isSubmitting` is true.
- `onBeforeClose={() => !isSubmitting}` prevents backdrop-driven close while submit flow is active.
- Existing close button and cancel behavior continue to reuse `handleClose`.
