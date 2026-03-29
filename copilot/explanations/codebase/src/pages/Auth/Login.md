# Login.jsx

## [2026-03-29] Robust User Bootstrap on Login

### Context
- New accounts could end up without a complete `users/{uid}` document during first login.
- Missing `role` caused onboarding role prompts, and invite-email lookup could fail due Firestore list restrictions.

### Change
- Hardened institution resolution to tolerate `institution_invites` list permission denials and continue with domain-based lookup.
- When `users/{uid}` does not exist, login now writes a full bootstrap profile payload (`uid`, `displayName`, `email`, `photoURL`, `role`, timestamps, and default `settings`) instead of merge-writing only login metadata.
- Existing-user behavior remains merge-based for `lastLogin` and optional `institutionId` backfill.

### Validation
- Confirmed no diagnostics after changes in `src/pages/Auth/Login.jsx`.

## Overview
- **Source file:** `src/pages/Auth/Login.jsx`
- **Last documented:** 2026-02-24
- **Role:** Page-level or feature-level module that orchestrates UI and logic.

## Responsibilities
- Manages local UI state and interaction flow.
- Handles user events and triggers updates/actions.
- Interacts with Firebase/Firestore services for data operations.
- Participates in navigation/routing behavior.

## Exports
- `default Login`

## Main Dependencies
- `react`
- `./styles/Login.module.css`
- `../../firebase/config`
- `firebase/firestore`
- `react-icons/fc`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
