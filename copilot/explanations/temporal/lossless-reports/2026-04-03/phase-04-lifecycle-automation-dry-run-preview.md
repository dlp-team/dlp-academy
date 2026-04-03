<!-- copilot/explanations/temporal/lossless-reports/2026-04-03/phase-04-lifecycle-automation-dry-run-preview.md -->
# Lossless Report - Phase 04 Lifecycle Automation Dry-Run Preview Path

## Requested Scope
- Continue Phase 04 by enabling practical dry-run validation support for lifecycle automation without requiring data writes.

## Preserved Behavior
- Existing scheduled automation behavior remains unchanged (`dryRun: false`).
- Existing lifecycle derivation logic remains unchanged.
- Existing callable role/institution authorization remains unchanged.

## Implemented Changes
- `functions/security/subjectLifecycleAutomation.js`
  - Added `evaluateSubjectLifecycleAutomationRun(...)` to provide deterministic run summaries:
    - `scannedSubjects`,
    - `updatedSubjects`,
    - `skippedSubjects`,
    - bounded `previewSubjectIds`,
    - derived update payload list.
- `functions/index.js`
  - `runSubjectLifecycleAutomation` callable now accepts:
    - `dryRun` (boolean),
    - `maxPreviewSubjectIds` (bounded integer).
  - Internal lifecycle runner now:
    - uses deterministic evaluation summary,
    - skips batch writes when `dryRun` is true,
    - returns preview IDs and committed update counts.
  - Scheduled function explicitly runs with `dryRun: false`.
- `tests/unit/functions/subjectLifecycleAutomation.test.js`
  - Added deterministic tests for dry-run summary behavior and preview ID bounds.

## Validation Evidence
- `get_errors` on touched files: no errors.
- Targeted tests:
  - `npm run test -- tests/unit/functions/subjectLifecycleAutomation.test.js tests/unit/utils/subjectPeriodLifecycleUtils.test.js tests/unit/hooks/useHomeState.academicYearFilter.test.js`
  - Result: 3 files passed, 23 tests passed.
- Emulator-backed callable dry-run execution:
  - `firebase emulators:exec --only 'firestore,functions,auth' "node scripts/lifecycle-dry-run-emulator-check.mjs"`
  - Result payload:
    - `success: true`
    - `dryRun: true`
    - `scannedSubjects: 2`
    - `updatedSubjects: 1`
    - `skippedSubjects: 1`
    - `committedUpdates: 0`
    - `previewSubjectIds: ['dryrun-subject-update']`
- Typecheck:
  - `npx tsc --noEmit` passed.
- Lint:
  - `npm run lint` passed with unchanged pre-existing 4 warnings in `src/pages/Content/Exam.jsx` and `src/pages/Content/StudyGuide.jsx`.

## Documentation Sync
- Updated:
  - `copilot/explanations/codebase/functions/index.md`
  - `copilot/explanations/codebase/functions/security/subjectLifecycleAutomation.md`
  - `copilot/explanations/codebase/tests/unit/functions/subjectLifecycleAutomation.test.md`
  - `copilot/plans/active/.../phases/phase-04-subject-periods-and-lifecycle-automation-planned.md`
  - `copilot/plans/active/.../strategy-roadmap.md`

## Lossless Conclusion
The change is additive and safe: dry-run preview and deterministic run summaries are now available for lifecycle automation validation, while scheduled production behavior and existing authorization constraints remain intact.
