<!-- copilot/explanations/codebase/src/pages/AdminDashboard/utils/adminInstitutionBatchQueueUtils.md -->

# adminInstitutionBatchQueueUtils.ts

## Overview
- **Source file:** `src/pages/AdminDashboard/utils/adminInstitutionBatchQueueUtils.ts`
- **Last documented:** 2026-04-01
- **Role:** Queues Firestore batch operations for institution create/edit submit flows.

## Responsibilities
- Queues edit flow batch operations (institution update, invite add/remove sync, optional institutional code).
- Queues create flow batch operations (institution seed, invite seed, optional institutional code).
- Centralizes batch orchestration logic while preserving existing write semantics.

## Exports
- `const queueInstitutionEditBatchOps`
- `const queueInstitutionCreateBatchOps`

## Main Dependencies
- `src/pages/AdminDashboard/utils/adminInstitutionInviteSyncUtils`
