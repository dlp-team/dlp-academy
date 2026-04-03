<!-- copilot/explanations/temporal/lossless-reports/2026-04-03/phase-04-lifecycle-automation-trigger-and-unknown-pass-policy.md -->
# Lossless Report - Phase 04 Lifecycle Automation Trigger + Unknown Pass Policy

## Requested Scope
- Continue Phase 04 lifecycle work after the post-course policy visibility checkpoint.
- Add deterministic unknown pass-state handling during extraordinary window close.
- Add scheduled/triggered lifecycle automation path that applies transitions without requiring Home interaction.

## Preserved Behavior
- Existing Home period filtering behavior (`subjectPeriodFilter`, courses academic-year filters) remains unchanged.
- Existing post-course visibility policy behavior in Home remains unchanged:
  - `delete` hidden,
  - `retain_teacher_only` teacher/staff visible,
  - `retain_all_no_join` visible.
- Existing teacher/student extraordinary-window matrix preserved:
  - students passed => hidden,
  - students failed => visible,
  - teachers => visible.

## Implemented Changes
- `src/utils/subjectPeriodLifecycleUtils.ts`
  - Added explicit helper `shouldStudentRemainActiveDuringExtraordinaryWindow(...)`.
  - Codified unknown pass-state policy as `treat_as_pending_until_extraordinary_end`.
  - Kept lifecycle fallback and policy filtering behavior intact.
- `functions/security/subjectLifecycleAutomation.js` (new)
  - Added deterministic lifecycle phase resolver (`active`, `extraordinary`, `post_extraordinary`).
  - Added minimal-update automation output derivation:
    - lifecycle phase,
    - post-course visibility,
    - unknown pass-state policy marker,
    - automation version,
    - invite-code disable flags after extraordinary cutoff.
- `functions/index.js`
  - Added callable `runSubjectLifecycleAutomation` with role/institution safeguards:
    - `admin`: global or institution-scoped runs,
    - `institutionadmin`: own institution only.
  - Added scheduled `reconcileSubjectLifecycleAutomation` (`every day 02:15`, `Europe/Madrid`).
  - Added shared internal runner that skips trashed subjects and only writes changed documents.

## Tests Added/Updated
- `tests/unit/functions/subjectLifecycleAutomation.test.js` (new)
  - lifecycle phase resolution,
  - policy mapping,
  - invite-code disable behavior,
  - no-op alignment behavior.
- `tests/unit/utils/subjectPeriodLifecycleUtils.test.js`
  - added unknown pass-state student visibility during extraordinary window.
- `tests/unit/hooks/useHomeState.academicYearFilter.test.js`
  - added unknown pass-state subject expectation in usage/current-only filtering.

## Validation Evidence
- `get_errors` on all touched source/test files: no errors.
- Targeted tests:
  - `npm run test -- tests/unit/functions/subjectLifecycleAutomation.test.js tests/unit/utils/subjectPeriodLifecycleUtils.test.js tests/unit/hooks/useHomeState.academicYearFilter.test.js tests/unit/utils/subjectAccessUtils.test.js`
  - Result: 4 files passed, 29 tests passed.
- Typecheck:
  - `npx tsc --noEmit` passed.
- Lint:
  - `npm run lint` passed with unchanged pre-existing warnings in:
    - `src/pages/Content/Exam.jsx`
    - `src/pages/Content/StudyGuide.jsx`

## Lossless Conclusion
The change set is surgical and additive: it codifies an existing ambiguity into deterministic logic, introduces backend lifecycle automation with strict tenant-aware privilege controls, and preserves all prior Home lifecycle and policy behavior while adding deterministic test coverage.
