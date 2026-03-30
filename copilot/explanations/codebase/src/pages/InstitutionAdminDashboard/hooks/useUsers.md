<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/hooks/useUsers.md -->
# useUsers.js

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/hooks/useUsers.js`
- **Last documented:** 2026-03-30
- **Role:** Institution Admin users-domain hook for data loading, invite management, and policy update operations.

## Responsibilities
- Loads teachers/students/invites scoped by institution.
- Handles invite creation and invite-access removal writes.
- Manages institutional dynamic-code updates and policy persistence.
- Exposes users tab state/actions to `InstitutionAdminDashboard`.

## Exports
- `useUsers`

## Main Dependencies
- `react`
- `firebase/firestore`
- `../../../firebase/config`
- `../../../services/accessCodeService`
- `../../../utils/institutionPolicyUtils`
- `../../../hooks/usePersistentState`
- `../../../utils/pagePersistence`

## Changelog
- 2026-03-30: Removed `window.confirm(...)` from `handleRemoveAccess`; confirmation is now UI-owned to support in-page modal flow.
- 2026-03-30: Cleaned duplicate `institutionId` keys in invite-code payloads to keep touched-file lint validation clean without changing behavior.
