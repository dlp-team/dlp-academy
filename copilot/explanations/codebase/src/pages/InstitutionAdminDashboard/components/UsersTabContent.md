<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/UsersTabContent.md -->
# UsersTabContent.tsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx`
- **Last documented:** 2026-04-04
- **Role:** Institution Admin users tab UI orchestrator for policy controls, user tables, and invite management actions.

## Responsibilities
- Renders teacher/student segmented user management views.
- Renders access policy controls and save action wiring.
- Displays pending invite rows and invite code copy actions.
- Adds in-panel `Regenerar ahora` action for immediate teacher/student code rotation.
- Controls in-page confirmation modal for invite-access removal before destructive execution.
- Renders pagination controls for teacher/student tables and delegates cursor loading via `onLoadMoreUsers`.
- Exposes `Vincular alumnos por CSV` workflow entrypoint with reusable storage/mapping/n8n modal integration.

## Exports
- `default UsersTabContent`

## Main Dependencies
- `react`
- `lucide-react`
- `../../../utils/institutionPolicyUtils`

## Changelog
- 2026-04-05: Added users-tab delete action buttons for teacher/student rows with modal-first confirmation (`Eliminar usuario`) and inline success/error messaging.
- 2026-04-05: Added guard-code-aware Spanish error mapping so blocked deletion attempts surface explicit reasons (cross-tenant, role mismatch, protected role, self-delete, active classes).
- 2026-04-04: Added immediate code regeneration control in security card with inline success/error feedback and loading state.
- 2026-04-04: Renamed students action to `Vincular alumnos por CSV` and switched to shared `CsvImportWorkflowModal` so students import now supports file upload, manual column mapping, and n8n dispatch.
- 2026-04-04: Added student-side CSV bulk-link modal (`email,courseId`) with summary rendering, error handling, and async delegation via `onBulkLinkStudentsCsv`.
- 2026-04-03: Moved teacher-governance toggles out of `UsersTabContent` into the new dashboard `Configuración` tab (`SettingsTabContent`) and added in-tab guidance message for teachers.
- 2026-04-02: Added `Cargar más profesores/alumnos` pagination controls with loading state wiring.
- 2026-04-02: Switched user table filtering to explicit precomputed filtered arrays for clearer pagination + search behavior.
- 2026-04-01: Added teacher policy toggle `allowTeacherAutonomousSubjectCreation` to the security panel and included it in policy save payloads.
- 2026-03-30: Replaced invite deletion browser confirm with modal-first in-page confirmation (`accessDeleteConfirm`, `confirmRemoveAccess`, `closeAccessDeleteConfirm`).
- 2026-03-30: Invite removal now executes only after explicit confirm action and keeps cancel path side-effect free.
