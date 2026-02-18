# Auth Feature Module

This folder contains all components, hooks, and logic specific to authentication (Login, Register, etc.).

## Structure
- `Login.jsx`, `Register.jsx`: Entry points for authentication flows.
- `components/`: Auth-only presentational components (SocialLogin, PasswordStrengthMeter, etc.)
- `hooks/`: Auth-specific hooks (useLogin, useRegister, etc.)
- `styles/`: Auth-specific styles (Auth.module.css, etc.)

## Notes
- Use only for Auth-specific logic. Reusable UI should go in `src/components/ui/` or `src/components/shared/`.
- Update this README if you add new major features or refactor the Auth module.
