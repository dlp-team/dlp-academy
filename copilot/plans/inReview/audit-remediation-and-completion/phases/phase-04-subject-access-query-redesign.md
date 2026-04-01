<!-- copilot/plans/inReview/audit-remediation-and-completion/phases/phase-04-subject-access-query-redesign.md -->

# Phase 04: Subject Access Query Redesign

**Duration:** 4-6 hours | **Priority:** 🔴 CRITICAL | **Status:** ✅ COMPLETED

## Objective
Implement OR-style subject visibility behavior using multiple realtime listeners merged into one deduplicated state:
- Teachers: own subjects (`ownerId == user.uid`)
- Students (standard): class-linked subjects (`classId` matches student class)
- Students (guest): invite-based subjects (`enrolledStudentUids` contains student UID)

## Implemented Changes

### 1. Extended `useSubjects` realtime strategy
File: `src/hooks/useSubjects.ts`

- Added normalized role resolution and student class IDs extraction.
- Added `classMatchedSubjects` and `enrolledSubjects` datasets.
- Added realtime listener for student class access:
  - `where('classId', '==', classId)` for one class.
  - `where('classId', 'in', classIds.slice(0, 10))` for multiple classes.
- Added realtime listener for invite enrollment:
  - `where('enrolledStudentUids', 'array-contains', user.uid)`.
- Merged all vectors in one dedup pipeline:
  - owned + shared + classMatched + enrolled.

### 2. Preserved existing behavior
- Existing owner/shared listeners remain unchanged.
- Existing institutional filter remains in place.
- Existing topic-loading behavior remains intact.

## Validation

- `get_errors` on touched files: clean.
- `npm run lint`: 0 errors (4 pre-existing warnings in unrelated files).
- `npm run test`: 71/71 files passing, 385/385 tests passing.

## Risks and Notes
- Firestore `in` queries are capped at 10 values; current implementation safely slices to 10.
- Additional scenario tests for class/enrollment vectors are still recommended in Phase 07.

## Success Criteria
- [x] Student class-linked subjects are visible.
- [x] Invite-enrolled subjects are visible.
- [x] Owner/shared behavior preserved.
- [x] No regressions in lint/test baseline.
