<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/utils/userDeletionGuard.md -->
# userDeletionGuard.ts

## Overview
- Source file: `src/pages/InstitutionAdminDashboard/utils/userDeletionGuard.ts`
- Last documented: 2026-04-05
- Role: Central guard evaluator for institution-admin delete-user operations.

## Responsibilities
- Normalizes role and id inputs for deterministic guard decisions.
- Enforces tenant isolation guard (`institutionId` mismatch denial).
- Blocks protected-role and self-deletion attempts.
- Evaluates expected-role alignment for teacher/student tab integrity.
- Returns explicit guard codes for active-class blocking cases.

## Exports
- `USER_DELETION_GUARD_CODES`
- `evaluateUserDeletionGuard`

## Main Dependencies
- none (pure utility)

## Changelog
- 2026-04-05: Added initial guard-code utility for users-tab deletion flow with tenant, role, self, protected-role, and active-class safeguards.
