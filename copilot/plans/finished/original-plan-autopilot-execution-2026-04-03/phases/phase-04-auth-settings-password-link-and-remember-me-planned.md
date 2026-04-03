<!-- copilot/plans/active/original-plan-autopilot-execution-2026-04-03/phases/phase-04-auth-settings-password-link-and-remember-me-planned.md -->
# Phase 04 - Auth Settings: Password Link and Remember Me

## Status
COMPLETED

## Objective
Allow Google-auth users to set a password for the same email with verification-backed flow and add Remember Me option in login.

## Work Items
- Audit current change-password and provider constraints.
- Add secure provider-link path for password setup (email verification/re-auth as required).
- Ensure flow also supports users who sign in with email/password.
- Add functional Remember Me option to login/session persistence behavior.

## Preserved Behaviors
- Existing Google sign-in remains available.
- Existing password reset flow remains intact.

## Risks
- Firebase Auth linking constraints and re-auth requirements.
- Session persistence changes can impact security posture.

## Validation
- Auth flow tests/manual checks for Google user linking password.
- Login persistence verification for Remember Me behavior.

## Exit Criteria
- OAuth user can securely set and use password for same account.
- Remember Me option works as expected without breaking default session behavior.

## Completion Notes
- Updated login hook so Google sign-in also respects Remember Me persistence mode.
- Added verification-email password setup/change flow in Settings security section for all users.
- Kept direct password update path available for password-provider accounts while adding the verified email option as a universal secure method.
- `get_errors` passed for touched auth/settings files.
