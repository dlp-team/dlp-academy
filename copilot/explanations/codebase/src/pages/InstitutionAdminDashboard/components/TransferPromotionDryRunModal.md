<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/TransferPromotionDryRunModal.md -->
# TransferPromotionDryRunModal.tsx

## Overview
- Source file: `src/pages/InstitutionAdminDashboard/components/TransferPromotionDryRunModal.tsx`
- Last documented: 2026-04-04
- Role: UI modal to configure and execute transfer/promote dry-run previews from Institution Admin organization tab.

## Responsibilities
- Collects source/destination academic years and dry-run mode (`promote`/`transfer`).
- Captures optional flags (`copyStudentLinks`, `includeClassMemberships`, `preserveVisibility`).
- Invokes provided dry-run callback and renders summary + warnings + rollback reference.
- Invokes apply callback to execute planned writes from dry-run output and renders apply status feedback.
- Invokes rollback callback using persisted rollback id after apply and renders rollback execution feedback.
- Keeps all visible copy in Spanish and disables closure/actions during execution.

## Changelog
### 2026-04-04
- Fixed modal state-reset race by initializing default values only on open transitions (not on every `availableAcademicYears` refresh while open).
- Preserves dry-run summary and apply/rollback feedback during post-apply `fetchAll()` refreshes, which is required for deterministic full execution-path e2e assertions.

## Exports
- `default TransferPromotionDryRunModal`
