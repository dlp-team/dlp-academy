<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/utils/transferPromotionPlanUtils.md -->
# transferPromotionPlanUtils.ts

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/utils/transferPromotionPlanUtils.ts`
- **Last documented:** 2026-04-04
- **Role:** Defines dry-run payload and rollback metadata contracts for Phase 05 transfer/promote orchestration.

## Responsibilities
- Validates transfer/promote dry-run payload shape (institution, years, mode).
- Builds deterministic dry-run payloads with defaults and rollback strategy metadata.
- Builds rollback metadata snapshots with normalized mappings for courses, classes, and student assignments.

## Exports
- `validateTransferPromotionPayload(payload)`
- `buildTransferPromotionDryRunPayload(input)`
- `buildTransferRollbackMetadata({ dryRunPayload, plannedCourses, plannedClasses, plannedStudentAssignments })`

## Changelog
- 2026-04-04: Added foundational transfer/promote planning utilities for dry-run contract definition and rollback metadata scaffolding.
