<!-- copilot/plans/active/autopilot-plan-execution-2026-04-08/phases/phase-07-share-and-assignment-notifications.md -->
# Phase 07 - Share and Assignment Notifications

## Status
- COMPLETED

## Objective
Ensure users receive notifications when subjects are shared or assigned through class/enrollment flows.

## Scope
- Notification triggers for direct sharing.
- Notification triggers for class assignment and enrolled students.
- Multi-tenant-safe filtering by `institutionId`.

## Validation
- Tenant-isolation checks for notification recipients.
- Duplicate-notification prevention checks.
- Targeted tests for each dispatch path.

## Implementation Update (2026-04-08)
- Added direct-share notification dispatch in `useSubjects.shareSubject(...)` (`subject_shared`).
- Added assignment notification dispatch in `useSubjects.updateSubject(...)` based on class/enrollment deltas:
	- `subject_assigned_class`
	- `subject_assigned_student`
- Added tenant-safe recipient filtering and student-role gating before notification writes.
- Added focused unit coverage for share notifications, assignment fan-out, and unchanged-recipient no-op behavior.

## Validation Evidence (2026-04-08)
- `get_errors` on `src/hooks/useSubjects.ts` and `tests/unit/hooks/useSubjects.test.js` -> PASS.
- `npm run test -- tests/unit/hooks/useSubjects.test.js` -> PASS.
- `npm run lint` -> PASS.
- `npx tsc --noEmit` -> PASS.
