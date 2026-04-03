<!-- copilot/explanations/temporal/lossless-reports/2026-04-03/phase-04-home-period-filtering.md -->
# Lossless Report - Phase 04 Home Period Filtering

## Requested Scope
- Continue Phase 04 implementation after period metadata kickoff.
- Add Home-level filtering by academic period (trimester/cuatrimester/custom) using persisted subject period metadata.

## Preserved Behaviors
- Existing Home controls and filters (tags, academic-year range, and `Solo vigentes`) remain unchanged.
- Shared-tab behavior and shared-scope toggle logic remain unchanged.
- Course grouping and academic-year labeling behavior remain unchanged when no period filter is selected.

## Touched Files
- `src/hooks/useHomeState.ts`
- `src/pages/Home/hooks/useHomeLogic.ts`
- `src/pages/Home/hooks/useHomeControlsHandlers.ts`
- `src/pages/Home/components/HomeControls.tsx`
- `src/pages/Home/Home.tsx`
- `tests/unit/hooks/useHomeState.academicYearFilter.test.js`
- `tests/unit/pages/home/HomeControls.activeCurrentToggle.test.jsx`

## File-by-File Verification
- `useHomeState.ts`
  - Added persisted `subjectPeriodFilter` state.
  - Added derived `availableSubjectPeriods` options from visible subject metadata.
  - Added normalized period-filter application in grouped output and grouped search output for `usage` and `courses` modes.
  - Exposed `subjectPeriodFilter`, `setSubjectPeriodFilter`, and `availableSubjectPeriods`.
- `useHomeLogic.ts`
  - Forwarded the new period-filter state and options from `useHomeState` to consuming Home UI.
- `useHomeControlsHandlers.ts`
  - Added `handleSubjectPeriodFilterChange` with preference persistence (`subjectPeriodFilter`).
- `HomeControls.tsx`
  - Added `Periodo` selector UI in `usage` and `courses` modes.
  - Wired selector changes through `handleSubjectPeriodFilterChange`.
- `Home.tsx`
  - Passed period-filter state/options into `HomeControls` from logic hook output.
- `useHomeState.academicYearFilter.test.js`
  - Added deterministic assertion for period-filtered grouped output.
- `HomeControls.activeCurrentToggle.test.jsx`
  - Added selector interaction assertions for setter + persisted preference callback.

## Validation Summary
- `get_errors` clean on all touched source/test files.
- `npm run test:unit -- tests/unit/hooks/useHomeState.academicYearFilter.test.js tests/unit/pages/home/HomeControls.activeCurrentToggle.test.jsx` passed (8/8).
- `npx tsc --noEmit` passed.
- `npm run lint` passed with pre-existing unrelated warnings in:
  - `src/pages/Content/Exam.jsx`
  - `src/pages/Content/StudyGuide.jsx`
