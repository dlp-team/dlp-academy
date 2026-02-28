# Phase 03 — Theming Token Foundation (COMPLETED)

## Objective
Centralize visual primitives (colors, spacing, margins, layout constants, and related tokens) to enable institution-level customization.

## Planned changes
- Define token shape and source-of-truth location for theme primitives.
- Replace hardcoded repeated primitives with token usage in targeted Home surfaces first.
- Ensure defaults preserve current visual behavior.

## Progress update
- Candidate 1 implemented: introduced `src/utils/themeTokens.js` as source of truth for initial Home modal primitives.
- Applied tokens losslessly to Home confirmation modals:
	- `src/pages/Home/components/HomeShareConfirmModals.jsx`
	- `src/pages/Home/components/HomeDeleteConfirmModal.jsx`
- Token values preserve exact prior class values (no visual behavior changes intended).
- Candidate 2 implemented: expanded Home tokens for repeated muted text and dashed create/drop card primitives.
- Applied candidate 2 tokens losslessly to:
	- `src/pages/Home/components/HomeEmptyState.jsx`
	- `src/pages/Home/components/SharedView.jsx`
	- `src/pages/Home/Home.jsx` (search-empty message)
	- `src/pages/Home/components/HomeContent.jsx` (repeated dashed create/drop card classes)

## Completion notes
- Phase 03 objective completed with token source-of-truth established and applied to targeted Home surfaces.
- Defaults preserve existing visual behavior (class values retained).
- No feature behavior changes introduced.

## Risks
- Introducing visual regressions if token defaults are incomplete.
- Coupling tokens directly to one page instead of app-wide primitives.
