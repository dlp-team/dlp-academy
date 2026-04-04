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

## Changelog
### 2026-04-04
- Hardened user-query reliability for real e2e environments by replacing the multi-field Firestore query (`institutionId` + `role`) with an institution-only query plus in-memory student-role filtering.
- Preserved transfer mapping semantics while reducing runtime dependency on composite-index availability for callable dry-run execution.

## Exports
- `createRunTransferPromotionDryRunHandler({ dbInstance, nowProvider? })`
