# OnboardingWizard.jsx

## [2026-03-29] Removed Redundant Firestore Listener To Prevent Unhandled Permission Crashes

### Context
- The wizard opened a second `onSnapshot` against `users/{uid}` without an error callback.
- On permission-denied responses, Firestore emitted uncaught listener errors and cascaded into internal assertion logs.

### Change
- Removed internal wizard `onSnapshot` subscription.
- Wizard now derives missing required fields (`role`, `institutionId`, `displayName`) directly from the `user` prop, which is already driven by the top-level app listener.
- Preserved existing wizard progression and save behavior.

### Validation
- Confirmed no diagnostics after changes in `src/pages/Onboarding/components/OnboardingWizard.jsx`.

## Overview
- **Source file:** `src/pages/Onboarding/components/OnboardingWizard.jsx`
- **Last documented:** 2026-02-24
- **Role:** Reusable UI component consumed by the parent page/module.

## Responsibilities
- Manages local UI state and interaction flow.
- Executes side effects tied to lifecycle or dependency changes.
- Handles user events and triggers updates/actions.
- Interacts with Firebase/Firestore services for data operations.

## Exports
- `default OnboardingWizard`

## Main Dependencies
- `react`
- `lucide-react`
- `firebase/firestore`
- `../../../firebase/config`
- `../../Auth/components/UserTypeSelector`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
