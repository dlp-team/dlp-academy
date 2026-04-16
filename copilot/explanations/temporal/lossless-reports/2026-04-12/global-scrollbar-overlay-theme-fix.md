<!-- copilot/explanations/temporal/lossless-reports/2026-04-12/global-scrollbar-overlay-theme-fix.md -->
# Lossless Report - Global Scrollbar Overlay Theme Fix

## Requested Scope
- Implement a robust global scrollbar fix that:
  - avoids layout shift when vertical scrollbar appears/disappears,
  - keeps transparent track with only thumb visible,
  - updates thumb appearance immediately on light/dark mode switch.
- Follow-up requirement:
  - ensure global vertical scrollbar does not render over the fixed app header.

## Preserved Behaviors
- Existing app routing, auth flows, and protected-route logic remain unchanged.
- Existing theme switching mechanism remains `applyThemeToDom` with `.dark` class toggling on root.
- Existing optional `minimal-scrollbar` utility styles remain intact.

## Files Touched
- [src/index.css](src/index.css)
- [src/App.tsx](src/App.tsx)
- [src/main.tsx](src/main.tsx)
- [src/components/layout/Header.tsx](src/components/layout/Header.tsx)
- [src/pages/Content/StudyGuide.tsx](src/pages/Content/StudyGuide.tsx)
- [src/pages/Content/Formula.tsx](src/pages/Content/Formula.tsx)
- [src/pages/Content/Exam.tsx](src/pages/Content/Exam.tsx)
- [copilot/explanations/codebase/src/App.md](copilot/explanations/codebase/src/App.md)
- [copilot/explanations/codebase/src/index.css.md](copilot/explanations/codebase/src/index.css.md)
- [copilot/explanations/codebase/src/main.tsx.md](copilot/explanations/codebase/src/main.tsx.md)
- [copilot/explanations/codebase/src/components/ui/CustomScrollbar.md](copilot/explanations/codebase/src/components/ui/CustomScrollbar.md)
- [copilot/explanations/codebase/src/components/layout/Header.md](copilot/explanations/codebase/src/components/layout/Header.md)
- [copilot/explanations/codebase/src/pages/Content/StudyGuide.md](copilot/explanations/codebase/src/pages/Content/StudyGuide.md)
- [copilot/explanations/codebase/src/pages/Content/Formula.md](copilot/explanations/codebase/src/pages/Content/Formula.md)
- [copilot/explanations/codebase/src/pages/Content/Exam.md](copilot/explanations/codebase/src/pages/Content/Exam.md)

## File-by-File Verification
1. [src/index.css](src/index.css)
- Replaced native root scrollbar styling with OverlayScrollbars host/theme styles:
  - full-height shell (`html, body, #root`) and `body { overflow: hidden; }`,
  - `.app-global-scrollbar` sizing,
  - `.os-theme-dlp` transparent track + token-driven thumb colors.
- Added fixed-header-aware scrollbar inset using:
  - `--app-fixed-header-height` token,
  - `body.has-fixed-header .app-global-scrollbar > .os-scrollbar-vertical { top: var(--app-fixed-header-height); }`.
- Added `color-scheme: light` in root and `color-scheme: dark` in `.dark` for native control parity.
- Increased light/dark scrollbar token contrast to make mode changes visibly immediate.

2. [src/App.tsx](src/App.tsx)
- Added `OverlayScrollbarsComponent` wrapper around the full app router tree.
- Added typed global options with custom theme (`os-theme-dlp`) and `autoHide: scroll`.
- Removed `CustomScrollbar` import and mount from root render.
- Kept all existing effects, user/session behavior, and route wiring unchanged.

3. [src/main.tsx](src/main.tsx)
- Imported OverlayScrollbars base stylesheet: `overlayscrollbars/styles/overlayscrollbars.css`.

4. [src/components/layout/Header.tsx](src/components/layout/Header.tsx)
- Added mount/unmount body class lifecycle for fixed header presence:
  - add `has-fixed-header` on mount,
  - remove `has-fixed-header` on unmount.

5. [src/pages/Content/StudyGuide.tsx](src/pages/Content/StudyGuide.tsx)
- Added mount/unmount body class lifecycle plus explicit header-height token (`6rem`) while page fixed header is active.

6. [src/pages/Content/Formula.tsx](src/pages/Content/Formula.tsx)
- Added mount/unmount body class lifecycle plus explicit header-height token (`5rem`) while page fixed header is active.

7. [src/pages/Content/Exam.tsx](src/pages/Content/Exam.tsx)
- Added mount/unmount body class lifecycle plus explicit header-height token (`6rem`) while page fixed header is active.

8. Documentation sync
- App-level change documented in [copilot/explanations/codebase/src/App.md](copilot/explanations/codebase/src/App.md).
- Scrollbar architecture change documented in [copilot/explanations/codebase/src/index.css.md](copilot/explanations/codebase/src/index.css.md).
- Entry bootstrap stylesheet change documented in [copilot/explanations/codebase/src/main.tsx.md](copilot/explanations/codebase/src/main.tsx.md).
- Legacy helper status documented in [copilot/explanations/codebase/src/components/ui/CustomScrollbar.md](copilot/explanations/codebase/src/components/ui/CustomScrollbar.md).
- Header marker lifecycle documented in [copilot/explanations/codebase/src/components/layout/Header.md](copilot/explanations/codebase/src/components/layout/Header.md).
- StudyGuide marker lifecycle documented in [copilot/explanations/codebase/src/pages/Content/StudyGuide.md](copilot/explanations/codebase/src/pages/Content/StudyGuide.md).
- Formula marker lifecycle documented in [copilot/explanations/codebase/src/pages/Content/Formula.md](copilot/explanations/codebase/src/pages/Content/Formula.md).
- Exam marker lifecycle documented in [copilot/explanations/codebase/src/pages/Content/Exam.md](copilot/explanations/codebase/src/pages/Content/Exam.md).

## Validation Summary
- Editor diagnostics:
  - `get_errors` clean for [src/index.css](src/index.css).
  - `get_errors` clean for [src/App.tsx](src/App.tsx).
  - `get_errors` clean for [src/components/layout/Header.tsx](src/components/layout/Header.tsx).
  - `get_errors` clean for [src/pages/Content/StudyGuide.tsx](src/pages/Content/StudyGuide.tsx).
  - `get_errors` clean for [src/pages/Content/Formula.tsx](src/pages/Content/Formula.tsx).
  - `get_errors` clean for [src/pages/Content/Exam.tsx](src/pages/Content/Exam.tsx).
- Focused tests:
  - `npm run test -- tests/unit/App.authListener.test.jsx tests/unit/components/CustomScrollbar.test.jsx` passed.
 - Build validation:
  - `npm run build` passed.

## Regression Risk Assessment
- Low-to-moderate:
  - Global scroll ownership moved to overlay host; pages that assume native `body` scrolling may need adjustment if they rely on browser-native scroll APIs.
- Mitigation:
  - Keep overlay host mounted at app root and validate routes with very long content after future layout changes.
