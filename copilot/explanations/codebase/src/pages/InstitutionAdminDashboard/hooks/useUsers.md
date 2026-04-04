<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/hooks/useUsers.md -->
# useUsers.ts

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/hooks/useUsers.ts`
- **Last documented:** 2026-04-04
- **Role:** Institution Admin users-domain hook for paginated user loading, invite management, and policy update operations.

## Responsibilities
- Loads teachers/students/invites scoped by institution.
- Paginates teacher/student list reads with cursor-based `limit/startAfter` loading.
- Handles invite creation and invite-access removal writes.
- Manages institutional dynamic-code updates and policy persistence.
- Lazily loads full teacher/student sets only when organization tab needs cross-list datasets.
- Provides CSV import handlers for student enrichment and course-link assignment flows.
- Uploads import files to institution-scoped Firebase Storage paths.
- Delegates optional automation runs to n8n webhook integration.
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
- 2026-04-04: Replaced legacy plain-text CSV linker with storage-backed import workflow handlers (`uploadUsersImportFile`, `runManualStudentsCsvImport`, `runManualCourseLinkCsvImport`, `triggerUsersImportN8n`) and kept compatibility wrapper for existing `handleBulkLinkStudentsCsv` call sites.
- 2026-04-04: Added student CSV bulk-link handler that appends course links to student profile fields (`courseId`, `courseIds`, `enrolledCourseIds`) with per-run summary output.
- 2026-04-04: Added student-tab course catalog loading for CSV validation and users-tab modal wiring.
- 2026-04-02: Added cursor-based pagination state (`hasMore`, `lastVisible`) and `handleLoadMoreUsers` for teachers/students.
- 2026-04-02: Added `loadAllUsers` option to defer full teachers/students collection fetches until organization workflows require them.
- 2026-03-30: Removed `window.confirm(...)` from `handleRemoveAccess`; confirmation is now UI-owned to support in-page modal flow.
- 2026-03-30: Cleaned duplicate `institutionId` keys in invite-code payloads to keep touched-file lint validation clean without changing behavior.
