<!-- copilot/explanations/temporal/lossless-reports/2026-04-03/phase-04-subject-period-metadata-kickoff.md -->
# Lossless Report - Phase 04 Kickoff Subject Period Metadata

## Requested Scope
- Continue roadmap execution after checkpoint commits.
- Start Phase 04 by enforcing mandatory subject period metadata on creation and persisting period fields end-to-end.

## Preserved Behaviors
- Existing subject sharing, class assignment, and invite-code workflows remain unchanged.
- Existing required general-tab fields (`name`, `course`) remain mandatory.
- Edit flows for legacy subjects remain supported (period remains optional in edit mode).

## Touched Files
- `src/pages/Subject/modals/SubjectFormModal.tsx`
- `src/hooks/useHomeHandlers.ts`
- `src/hooks/useSubjects.ts`
- `src/utils/subjectAccessUtils.ts`
- `tests/unit/utils/subjectAccessUtils.test.js`

## File-by-File Verification
- `SubjectFormModal.tsx`
  - Added institution-driven period option modeling from `academicCalendar.periodization`.
  - Added `Periodo académico` selector in general tab.
  - Enforced period selection as mandatory for subject creation.
  - Persisted normalized period fields in save payload (`periodType`, `periodLabel`, `periodIndex`).
- `useHomeHandlers.ts`
  - Subject save payload now forwards period metadata fields with normalized `periodIndex`.
- `useSubjects.ts`
  - `updateSubject(...)` now normalizes period metadata fields before update writes.
- `subjectAccessUtils.ts`
  - `normalizeSubjectAccessPayload(...)` now normalizes period metadata for create path.
- `subjectAccessUtils.test.js`
  - Added period metadata normalization assertions and empty-value null coercion coverage.

## Validation Summary
- `get_errors` clean on all touched source/test files.
- `npx vitest run tests/unit/utils/subjectAccessUtils.test.js` passed (11/11).
- `npx tsc --noEmit` passed.
- `npm run lint` passed with pre-existing unrelated warnings in:
  - `src/pages/Content/Exam.jsx`
  - `src/pages/Content/StudyGuide.jsx`
