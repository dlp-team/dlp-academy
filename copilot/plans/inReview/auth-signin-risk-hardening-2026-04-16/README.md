# Auth Sign-In Risk Hardening Plan (2026-04-16)

## Status
- Lifecycle: inReview
- Owner: Copilot
- Requested by: user
- Last updated: 2026-04-16
- Current Phase: 08 (all phases complete — merged to development, awaiting user verification)

## Problem Statement
Current authentication, login, registration, and onboarding flows contain security and integrity risks that can lead to privilege escalation, role misassignment, access-policy bypass, and weak step-up authentication behavior. The existing risk log needs a fresh, implementation-grounded reassessment and a remediation roadmap.

## Source Priority
1. Primary source: SIGN_LOG_IN risk log provided by user.
2. Secondary source: Gemini conversation embedded in same source file.
3. Codebase reality always supersedes assumptions in narrative text.

## Source Artifacts
- [sources/source-sign-log-in-auth-risk-reference-2026-04-16.md](sources/source-sign-log-in-auth-risk-reference-2026-04-16.md)

## Scope
- Review and harden auth-adjacent flows:
  - login (email/password and Google)
  - register and invite/access-code flows
  - onboarding role/institution resolution
  - email verification gating
  - step-up auth (sudo) behavior for admin-level actions
  - relevant Firestore rules and callable functions tied to identity/role claims
- Produce a severity-ranked finding set and implementation plan.
- Implement remediations in phased, low-regression increments.

## Out of Scope
- Full redesign of user-management UX beyond security requirements.
- Non-auth product feature work unrelated to identity, role, or tenant access.
- Production deploy activity.

## Success Criteria
- No user can self-assign privileged role via client-controlled profile creation path.
- Role assignment is backend-authoritative for code-based onboarding paths.
- Domain-based institution linking cannot bypass required code/invite constraints.
- Email verification is enforced before protected app access where policy requires.
- Step-up auth for privileged actions works for both password and social providers.
- Rule/function tests cover deny paths for escalation attempts.

## Risk Register (Initial)
- Critical: user-profile self-create can set privileged role/institution.
- High: client-selected role drives code validation path.
- High: domain auto-link can attach users without invite/code flow.
- High: email verification route exists but is not enforced in app routing.
- Medium: callable access-code validation is public and brute-forceable without server throttling.
- Medium: invite redemption cleanup is non-transactional (replay window if deletion fails).

## Validation Strategy
- Unit: hooks/services for register/login/onboarding and step-up auth logic.
- Rules: explicit deny tests for role escalation on users create/update.
- Functions: callable tests for access-code validation and claim sync restrictions.
- E2E: auth + onboarding happy/deny paths (including verification gate).

## Rollback Strategy
- Keep remediations phase-scoped and commit in small blocks.
- If a phase causes regressions, revert only the phase commits and preserve verified previous phases.
- Maintain backward-compatible data handling for existing user docs.

## Residual Risks to Track
- Legacy accounts with inconsistent role/institution fields.
- Existing invitation IDs that may remain guessable if not rotated.
- Operational process risk if admin governance docs are not followed.
