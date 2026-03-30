<!-- copilot/explanations/codebase/src/pages/Auth/components/AdminPasswordWizard.md -->
# AdminPasswordWizard.jsx

## Overview
- **Source file:** `src/pages/Auth/components/AdminPasswordWizard.jsx`
- **Last documented:** 2026-03-30
- **Role:** Security-enforcement modal for institution admins authenticated without password provider.

## Responsibilities
- Detects institution-admin role in realtime from `users/{uid}` snapshot.
- Forces password-setup modal flow when account lacks password auth provider.
- Performs password update and controlled sign-out path.
- Surfaces user-facing validation and error states for password setup.

## Changelog
### 2026-03-30
- Added explicit snapshot error callback for user-doc listener.
- Listener failure path now logs and keeps the wizard hidden (`setShow(false)`) to avoid unstable modal state when user-doc subscription fails.
