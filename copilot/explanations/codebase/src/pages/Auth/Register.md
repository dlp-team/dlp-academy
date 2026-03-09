# [2026-03-07] Country Field Removed From Registration UI

## Context
- Registration already captures role and institutional linkage, and country was no longer required for access gating.

## Change
- Removed the `country` selector from `src/pages/Auth/Register.jsx`.
- Registration form now focuses on identity, credentials, and institutional code flow only.

## Validation
- Unit registration flow remains green via `tests/unit/hooks/useRegister.test.js`.

# [2026-03-07] Student Institutional Code Input Support

## Context
- Students needed the ability to register using an institutional student code, similar to the teacher path.

## Change
- The institutional code field is now shown for `student`, `teacher`, and `admin` registration types.
- For students, the field is optional and relabeled to `Código Institucional de Estudiante` with helper guidance.
- For teachers/admins, the field remains required.

## Validation
- Integration path verified through updated `useRegister` logic and passing registration unit tests.

# Register.jsx

## Overview
- **Source file:** `src/pages/Auth/Register.jsx`
- **Last documented:** 2026-02-24
- **Role:** Page-level or feature-level module that orchestrates UI and logic.

## Responsibilities
- Handles user events and triggers updates/actions.
- Participates in navigation/routing behavior.

## Exports
- `default Register`

## Main Dependencies
- `react`
- `lucide-react`
- `react-router-dom`
- `./hooks/useRegister`
- `./components/UserTypeSelector`
- `./components/PasswordStrengthMeter`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
