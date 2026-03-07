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
