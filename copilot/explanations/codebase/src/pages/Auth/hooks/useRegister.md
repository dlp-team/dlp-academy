# [2026-03-07] Student Institutional Code Registration Path

## Context
- Student self-registration needed parity with teachers for institutional code onboarding.
- Student users should be able to provide a student institutional code and be attached to the institution at sign-up.

## Change
- Extended validation entry logic in `useRegister` to include `student` in the verification-code flow.
- For students:
	- verification code is optional,
	- if provided, backend callable `validateInstitutionalAccessCode` is invoked with `userType: 'student'`,
	- on success, created user document persists `institutionId` from validated result.
- Kept direct invite behavior intact and one-time invite deletion unchanged.

## Validation
- Added and passed unit test in `tests/unit/hooks/useRegister.test.js`:
	- `registers student with institutional student code via callable when provided`.

# [2026-03-07] Secure Institutional Code Validation via Cloud Function

## Context
- Institutional teacher access code must be deterministic by institution/time/frequency without storing a shared institutional code document in Firestore.
- Direct invites still use case-sensitive document IDs in `institution_invites`.

## Change
- Registration now uses a dual-path strategy:
	- direct invite lookup by exact code first (case-sensitive doc ID preserved),
	- secure callable validation (`validateInstitutionalAccessCode`) for teacher institutional rotating codes when no direct invite doc exists.
- Added normalized uppercase fallback only for compatibility checks where needed, without breaking direct invite IDs.

## Validation
- Added/ran tests in `tests/unit/hooks/useRegister.test.js` for:
	- direct invite case-preserving lookup/deletion,
	- dynamic institutional code callable validation path,
	- lowercase-to-uppercase institutional compatibility.

# [2026-03-07] Verification Code Normalization Fix

## Context
- Teacher registration with institutional code could fail with "Código de verificación inválido o expirado" when users typed a lowercase code.
- Institutional codes are stored as uppercase Firestore document IDs under `institution_invites`.

## Change
- Normalized `verificationCode` to uppercase before invite lookup in `src/pages/Auth/hooks/useRegister.js`.
- Normalized code to uppercase in the direct-invite deletion path as well.

## Validation
- Added/ran `tests/unit/hooks/useRegister.test.js` case: teacher registration accepts lowercase user input and resolves uppercase invite lookup.

# useRegister.js

## Overview
- **Source file:** `src/pages/Auth/hooks/useRegister.js`
- **Last documented:** 2026-02-24
- **Role:** Custom hook with stateful/business logic for this page area.

## Responsibilities
- Manages local UI state and interaction flow.
- Handles user events and triggers updates/actions.
- Interacts with Firebase/Firestore services for data operations.
- Participates in navigation/routing behavior.

## Exports
- `const useRegister`

## Main Dependencies
- `react`
- `react-router-dom`
- `firebase/auth`
- `firebase/firestore`
- `../../../firebase/config`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
