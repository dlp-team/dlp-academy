<!-- copilot/explanations/codebase/functions/security/transferPromotionDryRunHandler.md -->
# transferPromotionDryRunHandler.js

## Overview
- Source file: `functions/security/transferPromotionDryRunHandler.js`
- Last documented: 2026-04-04
- Role: Callable handler factory for institution-scoped transfer/promote dry-run previews.

## Responsibilities
- Validates caller auth and role (`admin`/`institutionadmin`) with tenant enforcement for institution admins.
- Validates dry-run payload contract (`institutionId`, source/target academic year, mode).
- Builds deterministic preview mappings for courses, classes, and student assignment changes.
- Emits rollback metadata snapshot tied to dry-run request id.
- Caps mapping previews to bounded response size and reports truncation warnings.

## Exports
- `createRunTransferPromotionDryRunHandler({ dbInstance, nowProvider? })`
