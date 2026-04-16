# Strategy Roadmap

## Objective
Close authentication and sign-in security gaps with deterministic, test-backed, least-privilege controls while preserving existing user journeys where safe.

## Phases
1. Phase 01: Baseline threat-model and evidence lock.
2. Phase 02: Block privilege escalation at user profile creation and claim sync.
3. Phase 03: Enforce backend-authoritative role assignment for code-driven onboarding.
4. Phase 04: Enforce email verification gate and route wiring.
5. Phase 05: Harden step-up authentication for social and password providers.
6. Phase 06: Abuse-resistance hardening (rate limits, invite replay controls, telemetry).
7. Phase 07: Final optimization and consolidation review.
8. Phase 08: Deep risk analysis review and closure package.

## Execution Rules
- Each phase requires explicit validation evidence before completion.
- No phase moves forward with unresolved critical findings from earlier phases.
- Test additions are mandatory for each changed security boundary.

## Commands (planned)
- npm run test
- npm run lint
- npx tsc --noEmit
- npm run test -- tests/rules/firestore.rules.test.js
- npm run test -- tests/unit/hooks/useRegister.test.js tests/unit/hooks/useLogin.test.js

## Rollout Gate
- Remediation code is ready for review only after all security deny-path tests pass and no new lint/type errors are introduced.
