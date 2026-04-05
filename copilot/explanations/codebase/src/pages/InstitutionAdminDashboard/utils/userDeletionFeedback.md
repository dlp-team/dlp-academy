<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/utils/userDeletionFeedback.md -->
# userDeletionFeedback.ts

## Overview
- Source file: `src/pages/InstitutionAdminDashboard/utils/userDeletionFeedback.ts`
- Last documented: 2026-04-05
- Role: Shared Spanish message formatter for users-tab deletion success/error feedback.

## Responsibilities
- Converts user roles into normalized Spanish labels (`profesor`, `alumno`).
- Maps delete-guard error codes to deterministic user-facing Spanish messages.
- Provides role-aware success message helper for completed deletions.

## Exports
- `getUserDeletionRoleLabel`
- `mapUserDeletionErrorMessage`
- `buildUserDeletionSuccessMessage`

## Main Dependencies
- `./userDeletionGuard`

## Changelog
- 2026-04-05: Added initial shared feedback utility to consolidate users-tab deletion message formatting.
