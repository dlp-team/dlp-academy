# SecuritySection.jsx

## Overview
- **Source file:** `src/pages/Settings/components/SecuritySection.jsx`
- **Last documented:** 2026-03-30
- **Role:** Reusable UI component consumed by the parent settings page.

## Responsibilities
- Collects and validates password-change form data.
- Executes authenticated password update flow after re-auth confirmation.
- Exposes logout action with inline status feedback.

## Exports
- `default SecuritySection`

## Main Dependencies
- `react`
- `lucide-react`
- `firebase/auth`
- `../../../firebase/config`
- `../../../components/modals/SudoModal`

## Changelog
### 2026-03-30
- Introduced password update UI with confirmation guard through `SudoModal`.
- Added provider-aware validation for password-based accounts.
- Added inline logout action (no browser alerts) with loading/feedback states.

## Notes
- Visible UI copy is kept in Spanish per project UX guidelines.
