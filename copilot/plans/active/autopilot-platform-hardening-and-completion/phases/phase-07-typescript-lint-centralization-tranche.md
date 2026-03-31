<!-- copilot/plans/active/autopilot-platform-hardening-and-completion/phases/phase-07-typescript-lint-centralization-tranche.md -->
# Phase 07 - TypeScript, Lint Debt, and Logic Centralization Tranche

## Status
IN_PROGRESS

## Objective
Reduce medium-term maintenance and regression risk through staged typing, lint cleanup, and deduplication centralization.

## Planned Change Set
- Select low-risk tranche candidates first (pure utilities and stable hooks).
- Introduce TypeScript incrementally to avoid broad destabilization.
- Remove repeated logic from oversized modules into focused shared utilities/hooks.
- Resolve lint debt introduced by touched modules and keep new code clean.

## Progress Updates
- 2026-03-31 Tranche 01 completed:
	- Introduced ESLint environment overrides for Node/test files and reduced false-positive `no-undef` debt.
	- Ignored archive/copy artifacts from lint scope to prioritize runtime modules.
	- Applied targeted no-unused/state-effect fixes in active modals and shared UI modules.
	- Refactored quiz confetti logic into dedicated hook file (`useConfetti.js`) and deterministic render-safe generation.
	- Lint baseline improved from `193 problems (178 errors, 15 warnings)` to `72 problems (60 errors, 12 warnings)`.
	- Regression validation: `npm run test` passed (`71 files, 385 tests`).
- 2026-03-31 Tranche 02 completed:
	- Reduced high-density errors in `Exam`, `StudyGuide`, `InstitutionCustomizationView`, and `useShortcuts`.
	- Replaced remaining empty catches with explicit no-op comments and stabilized preview utility dependencies.
	- Removed additional unused imports/helpers and cleaned escaped-regex debt in content pages.
	- Lint baseline improved from `72 problems (60 errors, 12 warnings)` to `54 problems (44 errors, 10 warnings)`.
	- Regression validation: `npm run test` passed (`71 files, 385 tests`).

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
