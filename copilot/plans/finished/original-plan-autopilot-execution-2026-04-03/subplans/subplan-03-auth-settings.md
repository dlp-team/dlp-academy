<!-- copilot/plans/active/original-plan-autopilot-execution-2026-04-03/subplans/subplan-03-auth-settings.md -->
# Subplan 03 - Auth Settings and Remember Me

## Goal
Allow provider-linked password setup and add Remember Me.

## Tasks
- Audit current auth provider checks and password-change gate.
- Implement verification-backed password setup for Google users linked by same email.
- Ensure email/password users follow consistent verification posture.
- Add Remember Me option in login and wire persistence mode.

## Validation
- Manual and automated auth-path checks (Google + email/password).
