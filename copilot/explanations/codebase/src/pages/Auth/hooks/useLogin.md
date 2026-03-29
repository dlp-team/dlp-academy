# useLogin.js

## [2026-03-29] Invite Lookup Permission Fallback

### Context
- The invite-email lookup in login could throw permission-denied for non-admin users due `institution_invites` list rules.
- This interrupted first-login profile bootstrap.

### Change
- Wrapped invite-email query in a guarded `try/catch` and continued with domain-based institution resolution.
- Preserved existing login flow and data model behavior.

### Validation
- Confirmed no diagnostics after changes in `src/pages/Auth/hooks/useLogin.js`.

## Overview
- **Source file:** `src/pages/Auth/hooks/useLogin.js`
- **Last documented:** 2026-02-24
- **Role:** Custom hook with stateful/business logic for this page area.

## Responsibilities
- Manages local UI state and interaction flow.
- Handles user events and triggers updates/actions.
- Interacts with Firebase/Firestore services for data operations.
- Participates in navigation/routing behavior.

## Exports
- `const useLogin`

## Main Dependencies
- `react`
- `react-router-dom`
- `firebase/firestore`
- `../../../firebase/config`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
