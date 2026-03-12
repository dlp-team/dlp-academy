<!-- copilot/plans/todo/backend-zero-trust-security-hardening/strategy-roadmap.md -->
# Strategy Roadmap

## Phase sequence
0. Preflight baselining and risk guardrails
1. Security inventory and trust-boundary mapping
2. Authorization matrix definition (resource x action x actor)
3. Firestore rules hardening (deny-by-default)
4. Storage rules hardening and parity checks
5. Cloud Functions/admin path hardening
6. Comprehensive rule/unit tests + adversarial scenarios
7. Full regression execution + breakage validation
8. Staged rollout, monitoring, rollback gates

## Phase-to-file map
- Phase 00: `phases/phase-00-preflight-and-baseline.md`
- Phase 01: `phases/phase-01-inventory-and-threat-model.md`
- Phase 02: `phases/phase-02-authorization-matrix.md`
- Phase 03: `phases/phase-03-firestore-rules-hardening.md`
- Phase 04: `phases/phase-04-storage-rules-hardening.md`
- Phase 05: `phases/phase-05-functions-and-privileged-paths.md`
- Phase 06: `phases/phase-06-security-test-suite.md`
- Phase 07: `phases/phase-07-full-regression-validation.md`
- Phase 08: `phases/phase-07-rollout-and-rollback.md`

## Test execution gates (mandatory)
- After each phase: run targeted tests for touched resources and rules.
- Before moving to rollout: run full security test suite and full regression suite.
- Required outcomes: zero failing security tests, zero failing regression tests, and no unauthorized allows.
- If tests reveal breakage, rollback/fix before continuing.

## Mandatory command baseline
- `npm run test:rules`
- `npm run test`
- `npm run lint`
- `npx tsc --noEmit`

## Risk controls by checkpoint
- Checkpoint A (after Phase 02): matrix completeness and no ambiguous ownership semantics.
- Checkpoint B (after Phase 05): all privileged server paths require auth + role + tenant checks.
- Checkpoint C (after Phase 07): complete pass on security + regression suites.
- Checkpoint D (after Phase 08): deployment verification + rollback readiness.

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

## Out-of-scope changes policy
- If new unrelated defects are discovered, log them but do not expand this plan unless they directly block security hardening.
