# Phase 03 — Theming Token Foundation (IN_PROGRESS)

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

## Risks
- Introducing visual regressions if token defaults are incomplete.
- Coupling tokens directly to one page instead of app-wide primitives.
