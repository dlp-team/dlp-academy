<!-- copilot/explanations/codebase/functions/security/transferPromotionPlanUtils.md -->
# transferPromotionPlanUtils.js

## Overview
- Source file: `functions/security/transferPromotionPlanUtils.js`
- Last documented: 2026-04-04
- Role: Shared transfer/promote dry-run contract helpers for payload validation, deterministic request metadata, and rollback snapshot normalization.

## Exports
- `validateTransferPromotionPayload(payload)`
- `buildTransferPromotionDryRunPayload(input)`
- `buildTransferRollbackMetadata({ dryRunPayload, plannedCourses, plannedClasses, plannedStudentAssignments })`
- `toUniqueIds(values)`
- `buildPlannedEntityId({ prefix, institutionId, sourceId, targetAcademicYear })`

## Notes
- Mirrors frontend transfer-contract semantics in backend-compatible JavaScript.
- Keeps deterministic id generation (`transfer-promote-*`, `rollback-*`) for auditable dry-run previews.
