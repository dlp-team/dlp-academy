<!-- copilot/explanations/codebase/src/pages/Content/Formula.md -->
# Formula.tsx

## Overview
- **Source file:** `src/pages/Content/Formula.tsx`
- **Last documented:** 2026-04-03
- **Role:** Formula-focused study-guide visualization route.

## Responsibilities
- Loads subject context and formula guide payload by route params.
- Renders formula sections in list/grid presentation mode.
- Preserves themed gradient styling from subject metadata.
- Handles fallback rendering when no formulas exist.

## Main Dependencies
- `react`
- `react-router-dom`
- `firebase/firestore`
- `../../firebase/config`
- `../../utils/subjectAccessUtils`
- `react-katex`
- `katex/dist/katex.min.css`

## Changelog
- 2026-04-12: Added page-level fixed-header marker lifecycle for global overlay scrollbar alignment; while Formula is mounted, body now uses `has-fixed-header` with `--app-fixed-header-height: 5rem` so scrollbar rail stays below the fixed top bars.
- 2026-04-03: Added lifecycle-aware subject access gate via `canUserAccessSubject(...)` during subject context load so direct formula-route access honors post-course visibility policy.
