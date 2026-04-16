# Phase 04 - Email Verification Gate

## Objective
Enforce verified-email gate before full app access for applicable auth methods.

## Tasks
- Wire verification route into app router.
- Redirect unverified users to verification flow before protected areas.
- Exempt or define policy for trusted providers if required.
- Add route/auth listener tests for verified and unverified cases.

## Exit Criteria
- Unverified email users cannot enter protected app routes.
- Verified users can continue normally.
