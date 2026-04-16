<!-- copilot/explanations/temporal/lossless-reports/2026-04-10/phase05-scrollbar-live-theme-and-solo-vigentes-filter-fix.md -->
# Lossless Report - Phase 05 Scrollbar Live Theme + Solo Vigentes Filter Fix (2026-04-10)

## Requested Scope
- Ensure global scrollbar visuals update immediately on dark/light mode switch.
- Keep scrollbar track/gutter behavior transparent with clean neutral gray thumb colors.
- Correct `Solo Vigentes` filtering so it only returns current-academic-year subjects that are active and not finalized.

## Preserved Behaviors
- Existing global scrollbar activation strategy (`CustomScrollbar` class toggles) remains unchanged.
- Existing Home controls wiring for `Solo vigentes` and period selector remains unchanged.
- Existing lifecycle policy filtering (`isSubjectVisibleByPostCoursePolicy`) remains intact.
- Existing extraordinary-window role behavior remains intact when subject still satisfies current-academic-year filter.

## Touched Files
- `src/index.css`
- `src/hooks/useHomeState.ts`
- `tests/unit/hooks/useHomeState.academicYearFilter.test.js`

## Per-File Verification
- `src/index.css`
  - Replaced color-mix scrollbar tokens with deterministic gray RGBA tokens for stable live theme updates.
  - Removed fixed light/dark scrollbar gutter background colors so track surfaces remain transparent.
  - Corrected dark-mode selector coverage for active scrollbar mode.
- `src/hooks/useHomeState.ts`
  - Added strict current-academic-year eligibility for `showOnlyCurrentSubjects`.
  - Added active period-window validation when subject period metadata exists.
  - Kept lifecycle-active and post-course visibility logic integrated.
- `tests/unit/hooks/useHomeState.academicYearFilter.test.js`
  - Updated current-only expectations to exclude legacy no-year records.
  - Added coverage for active/inactive/future period-window behavior.
  - Updated extraordinary-window fixtures to current academic year for policy-aligned assertions.

## Validation Summary
- `get_errors` on touched files -> PASS.
- `npm run test -- tests/unit/hooks/useHomeState.academicYearFilter.test.js tests/unit/pages/home/HomeControls.activeCurrentToggle.test.jsx tests/unit/components/CustomScrollbar.test.jsx` -> PASS (16 tests).
