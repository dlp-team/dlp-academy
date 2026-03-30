<!-- copilot/plans/active/autopilot-platform-hardening-and-completion/subplans/subplan-architecture-migration-and-centralization.md -->
# Subplan - Architecture Migration and Centralization

## Related Main Phase
- Phase 07 - TypeScript, Lint Debt, and Logic Centralization Tranche

## Objective
Land a low-risk architecture tranche that improves maintainability with measurable quality gains.

## Scope
- Utilities and hooks with clear interfaces suitable for TypeScript-first migration.
- Localized lint debt cleanup in touched modules.
- Centralization of duplicated business logic found during Phase 05/06 work.

## Out of Scope
- Full repo TypeScript migration in one pass.
- Non-essential refactors in stable feature areas.

## Execution Slices
1. Identify tranche candidate files and dependency impact map.
2. Migrate tranche to TypeScript with minimal behavioral change.
3. Extract duplicated logic into reusable modules with tests.
4. Resolve lint warnings/errors in migrated scope.

## Validation and Test Strategy
- Required commands:
  - `npm run lint`
  - `npm run test`
  - `npx tsc --noEmit` (for migrated tranche)
- Additional checks:
  - verify imports and runtime paths,
  - compare pre/post behavior for touched surfaces.

## Rollback Strategy
- Keep migration changes partitioned by tranche and module type.
- Revert tranche commit if type migration destabilizes runtime behavior.

## Completion Criteria
- One meaningful tranche lands with passing lint/tests/type checks.
- Duplicated logic is reduced and centralized without behavior regression.
