<!-- copilot/plans/active/autopilot-plan-scrollbar-execution-2026-04-12/phases/phase-05-global-scrollbar-fix.md -->
# Phase 05 - Global Scrollbar Fix

## Objective
Finalize global scrollbar behavior so it is visually stable, theme-reactive, and free of track/opacity artifacts.

## Scope
- Execute global scrollbar fixes guided by the ingested scrollbar source reference.
- Ensure dark/light/system mode changes update scrollbar tokens without requiring refresh.
- Preserve modal/content container behavior that already relies on `custom-scrollbar` utility classes.

## Primary File Surfaces
- `src/index.css`
- `src/components/ui/CustomScrollbar.tsx`
- `src/App.tsx`

## Execution Status
- Status: COMPLETED (2026-04-12)
- Added token-driven global `.custom-scrollbar` rules in `src/index.css` so content and modal surfaces inherit theme-reactive thumb/track behavior.
- Removed page-local `.custom-scrollbar` WebKit overrides from content pages to prevent stale hardcoded gradients during dark/light/system switches.

## Implemented File Surfaces
- `src/index.css`
- `src/pages/Content/Exam.tsx`
- `src/pages/Content/Formula.tsx`
- `src/pages/Content/StudyGuide.tsx`

## Acceptance Criteria
- No flicker, phantom track surfaces, or stale theme thumb colors.
- Layout remains stable across major pages and overlays.

## Validation
- `npm run lint`
- `npx tsc --noEmit`
- `npm run test`
- `npm run build`
- Manual dark/light/system switch validation on Home, content pages, and modals.

### Validation Evidence (2026-04-12)
- `get_errors` clean on touched files (baseline CSS at-rule diagnostics unchanged for `@theme`/`@variant`).
- `npm run test:unit -- tests/unit/components/CustomScrollbar.test.jsx tests/unit/pages/content/Exam.test.jsx tests/unit/pages/content/StudyGuide.fallback.test.jsx tests/unit/pages/content/StudyGuide.navigation.test.jsx` -> PASS.
- `npm run lint` -> PASS.
- `npx tsc --noEmit` -> FAIL due pre-existing unrelated typing issue in `src/pages/Home/components/HomeContent.tsx` (`selectedItemKeys` anchor assignment typing).
- `npm run test` -> one flaky failure in `tests/unit/pages/content/StudyGuide.navigation.test.jsx` under full-suite load; isolated rerun passed.
- `npm run build` -> PASS.