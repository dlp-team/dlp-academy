# Phase 05 - Step-Up Auth Modernization

## Objective
Replace brittle password-only step-up assumptions with provider-compatible secure reauthentication strategy.

## Tasks
- Define step-up path for password users and social-login users.
- Remove forced password creation dependency for Google-admin flows.
- Implement provider-aware reauth prompt for critical actions.
- Add tests for both provider types.

## Exit Criteria
- Admin critical actions require fresh auth proof.
- Social provider admins can complete step-up without forced password setup.
