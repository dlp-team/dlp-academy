<!-- copilot/explanations/temporal/lossless-reports/2026-04-01/phase-03-04-subject-access-and-consistency.md -->

# Lossless Report: Phase 03-04 Subject Consistency and Access

Date: 2026-04-01

## Requested Scope
- Continue execution of active audit plan.
- Implement Phase 03-04 core behavior:
  - Subject class consistency when assigning classes.
  - OR-style subject access vectors for students.

## Touched Files
- `src/pages/Subject/modals/SubjectFormModal.tsx`
- `src/hooks/useSubjects.ts`
- `copilot/plans/active/audit-remediation-and-completion/phases/phase-03-subject-data-enforcement.md`
- `copilot/plans/active/audit-remediation-and-completion/phases/phase-04-subject-access-query-redesign.md` (new)
- `copilot/plans/active/audit-remediation-and-completion/strategy-roadmap.md`

## Exact Behavior Changes

### 1) Class assignment consistency
- In `SubjectFormModal.tsx`, class assignment save now sends:
  - `classIds` (full selected set)
  - `classId` (primary class = first selected or null)
- This removes singular/plural drift at save-time.

### 2) OR-style subject visibility vectors
- In `useSubjects.ts`, subject state merge now includes four vectors:
  - owned
  - shared
  - classMatched (student class)
  - enrolled (invite-based)
- Student-specific listeners were added:
  - class match query
  - enrolledStudentUids array-contains query
- Existing owner/shared and institution filtering behavior was preserved.

## Preserved Behaviors
- Owner and shared subject visibility remains intact.
- Topic loading per subject remains intact.
- Existing soft-delete filtering and dedupe logic remains intact.

## Validation Summary
- `get_errors` on touched files: no errors.
- `npm run lint`: 0 errors, 4 existing warnings in unrelated files.
- `npm run test`: 71 passed files, 385 passed tests.

## Residual Follow-ups
- Add dedicated tests for class/enrollment vectors in Phase 07.
- Consider pagination or capped fallback for users with >10 classes due to Firestore `in` query limits.
