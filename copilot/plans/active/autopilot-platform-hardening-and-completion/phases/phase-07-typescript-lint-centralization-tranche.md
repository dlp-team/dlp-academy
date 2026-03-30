<!-- copilot/plans/active/autopilot-platform-hardening-and-completion/phases/phase-07-typescript-lint-centralization-tranche.md -->
# Phase 07 - TypeScript, Lint Debt, and Logic Centralization Tranche

## Status
PLANNED

## Objective
Reduce medium-term maintenance and regression risk through staged typing, lint cleanup, and deduplication centralization.

## Planned Change Set
- Select low-risk tranche candidates first (pure utilities and stable hooks).
- Introduce TypeScript incrementally to avoid broad destabilization.
- Remove repeated logic from oversized modules into focused shared utilities/hooks.
- Resolve lint debt introduced by touched modules and keep new code clean.

## Validation Gates
- Type checks pass for migrated tranche.
- `npm run lint` passes without new warnings/errors from migrated scope.
- Runtime behavior parity confirmed through existing tests and targeted additions.

## Rollback Triggers
- Migration introduces runtime regressions or type churn across unrelated modules.
- Centralization creates circular dependencies or import instability.

## Completion Criteria
- At least one meaningful migration tranche lands with clean lint/type/test outcomes.
- Duplicated logic in selected high-value modules is reduced and documented.
