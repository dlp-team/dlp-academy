<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.md -->
# useClassesCourses.ts

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.ts`
- **Last documented:** 2026-04-02
- **Role:** Data hook for Institution Admin courses/classes lifecycle with active vs trashed partitioning and restoration/permanent-deletion handlers.

## Responsibilities
- Fetches institution-scoped courses/classes and splits each set into active and trashed collections.
- Creates and updates courses/classes with timestamp metadata.
- Applies soft-delete lifecycle (`status: trashed`, `trashedAt`, `trashedByUid`) for course/class removal.
- Cascades course soft-delete/restore to linked classes.
- Executes permanent deletion for course/class records (including linked class cleanup for courses).
- Enforces 15-day trash retention by purging expired trashed courses/classes during fetch cycles.
- Provides transfer/promote dry-run orchestration API that validates payloads, calls backend preview callable, and normalizes rollback metadata.
- Provides transfer/promote apply API to execute backend write orchestration and refresh local course/class state.
- Provides transfer/promote rollback API (`rollbackId`) and refreshes organization state after rollback execution.

## Exports
- `useClassesCourses(user, institutionIdOverride?)`

## Main Dependencies
- `react`
- `firebase/firestore`
- `../../../firebase/config`

## Changelog
- 2026-04-04: Added `rollbackTransferPromotionPlanById(...)` hook API wired to callable rollback path and post-execution `fetchAll()` refresh.
- 2026-04-04: Added `applyTransferPromotionDryRunPlan(...)` hook API that sends dry-run outputs (`dryRunPayload`, `mappings`, `rollbackMetadata`) to backend apply callable and refetches organization data.
- 2026-04-04: Added `runTransferPromotionDryRunPreview(...)` integration, delegating to callable `runTransferPromotionDryRun` with frontend payload validation + rollback metadata normalization.
- 2026-04-03: Added `resolveCourseAcademicYear(...)` reconciliation in class create/update paths so class `academicYear` is derived from linked course metadata whenever a course is present.
- 2026-04-03: `updateClass` now ignores direct year drift when a class remains linked to a course, preserving course-year as source of truth while still providing fallback normalization for legacy/no-course cases.
- 2026-04-03: Removed post-mutation `fetchAll()` refetch cycles and replaced them with local state synchronization after create/update/delete/restore flows to reduce repeated Firestore read pressure.
- 2026-04-03: Preserved existing initial full fetch partitioning (`active` vs `trashed`) and retention purge semantics while improving runtime request efficiency for mutation-heavy sessions.
- 2026-04-02: Added canonical academic-year normalization defaults on course/class create/update paths.
- 2026-04-02: Added course-year propagation to linked classes when a course academic year changes.
- 2026-04-02: Added fetch-time retention purge for trashed courses/classes older than 15 days, including dependent class cleanup for expired trashed courses.
- 2026-04-02: Added active/trashed state partition (`courses`, `classes`, `trashedCourses`, `trashedClasses`) and normalized status handling.
- 2026-04-02: Converted course/class delete flows to trash-first soft deletion with lifecycle metadata.
- 2026-04-02: Added `restoreCourse`, `restoreClass`, `permanentlyDeleteCourse`, and `permanentlyDeleteClass` hook APIs for bin lifecycle orchestration.
