# Phase 04 — Institution Customization Integration (COMPLETED)

## Objective
Connect theming tokens with institution-level settings managed via AdminInstitutionDashboard.

## Planned changes
- Define read path for institution appearance configuration.
- Implement safe fallback chain: institution theme -> default theme.
- Wire token consumer layer so client UI remains in Spanish while logic/config stay English.

## Progress update
- Candidate 1 implemented with minimal scope and lossless constraints.
- Added institution theme resolver utilities in `src/utils/themeTokens.js`:
	- `resolveInstitutionHomeThemeOverrides`
	- `getEffectiveHomeThemeTokens`
- Added Home-specific institution theme hook in `src/pages/Home/hooks/useInstitutionHomeThemeTokens.js`:
	- Reads `institutions/{institutionId}`.
	- Resolves known token override shapes.
	- Falls back to defaults on missing/invalid data.
- Wired resolved tokens into Home token consumers:
	- `src/pages/Home/Home.jsx`
	- `src/pages/Home/components/HomeContent.jsx`
	- `src/pages/Home/components/SharedView.jsx`
	- `src/pages/Home/components/HomeEmptyState.jsx`
	- `src/pages/Home/components/HomeShareConfirmModals.jsx`
	- `src/pages/Home/components/HomeModals.jsx`
	- `src/pages/Home/components/HomeDeleteConfirmModal.jsx`

## Completion notes
- Phase 04 objective completed.
- Fallback chain is enforced: institution overrides -> `HOME_THEME_TOKENS` defaults.
- Client-visible text remains unchanged (Spanish), while logic/config internals are in English.
- No behavior branches or permissions logic were changed.

## Risks
- Config-read latency or stale cache inconsistencies.
- Partial rollout where only some surfaces consume institution theme.
