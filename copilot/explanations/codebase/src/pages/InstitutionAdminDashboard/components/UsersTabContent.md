<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/UsersTabContent.md -->
# UsersTabContent.jsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/components/UsersTabContent.jsx`
- **Last documented:** 2026-03-30
- **Role:** Institution Admin users tab UI orchestrator for policy controls, user tables, and invite management actions.

## Responsibilities
- Renders teacher/student segmented user management views.
- Renders access policy controls and save action wiring.
- Displays pending invite rows and invite code copy actions.
- Controls in-page confirmation modal for invite-access removal before destructive execution.

## Exports
- `default UsersTabContent`

## Main Dependencies
- `react`
- `lucide-react`
- `../../../utils/institutionPolicyUtils`

## Changelog
- 2026-04-01: Added teacher policy toggle `allowTeacherAutonomousSubjectCreation` to the security panel and included it in policy save payloads.
- 2026-03-30: Replaced invite deletion browser confirm with modal-first in-page confirmation (`accessDeleteConfirm`, `confirmRemoveAccess`, `closeAccessDeleteConfirm`).
- 2026-03-30: Invite removal now executes only after explicit confirm action and keeps cancel path side-effect free.
