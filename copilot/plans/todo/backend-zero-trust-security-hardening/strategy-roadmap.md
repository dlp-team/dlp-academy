<!-- copilot/plans/todo/backend-zero-trust-security-hardening/strategy-roadmap.md -->
# Strategy Roadmap

## Phase sequence
1. Security inventory and trust-boundary mapping
2. Authorization matrix definition (resource x action x actor)
3. Firestore rules hardening (deny-by-default)
4. Storage rules hardening and parity checks
5. Cloud Functions/admin path hardening
6. Comprehensive rule/unit tests + adversarial scenarios
7. Full regression execution + breakage validation
8. Staged rollout, monitoring, rollback gates

## Test execution gates (mandatory)
- After each phase: run targeted tests for touched resources and rules.
- Before moving to rollout: run full security test suite and full regression suite.
- Required outcomes: zero failing security tests, zero failing regression tests, and no unauthorized allows.
- If tests reveal breakage, rollback/fix before continuing.

## Core decision principles
- Break-glass admin operations are explicit, logged, and minimal.
- Institution admins can only manage institution-scoped records.
- Teachers/students are constrained by ownership + institutional scope.
- Shared-resource access requires explicit access lists and role restrictions.

## Acceptance criteria
- No resource path has implicit broad allow.
- Every collection and storage path is covered by allow+deny tests.
- Multi-tenant leakage tests fail closed.
- CI security tests become required check for merges.
- Regression suite proves existing authorized flows still work.
- Post-hardening run confirms no functional breakage in protected read/create/update/delete paths.
