<!-- copilot/explanations/codebase/src/pages/AdminDashboard/utils/adminInstitutionInviteSyncUtils.md -->

# adminInstitutionInviteSyncUtils.ts

## Overview
- **Source file:** `src/pages/AdminDashboard/utils/adminInstitutionInviteSyncUtils.ts`
- **Last documented:** 2026-04-01
- **Role:** Computes invite synchronization deltas for institutions edit flow.

## Responsibilities
- Computes admin emails to add based on desired and existing invite lists.
- Computes invite records to delete when removed from desired admin emails.
- Keeps invite diff behavior centralized and testable.

## Exports
- `type InstitutionInviteRecord`
- `const buildInstitutionInviteSyncPlan`

## Main Dependencies
- None
