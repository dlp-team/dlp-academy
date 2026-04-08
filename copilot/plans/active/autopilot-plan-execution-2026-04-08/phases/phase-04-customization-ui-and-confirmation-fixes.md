<!-- copilot/plans/active/autopilot-plan-execution-2026-04-08/phases/phase-04-customization-ui-and-confirmation-fixes.md -->
# Phase 04 - Customization UI and Confirmation Fixes

## Status
- IN_REVIEW

## Objective
Fix customization tab interactions before implementing preview-route architecture.

## Scope
- Card-body click selects active card only.
- Swatch click opens color selector only.
- Hex text input updates color values.
- Save and reset actions execute through confirmation overlays.

## Validation
- Card/swatch event separation tests.
- Confirmation accept/cancel tests.
- Spanish UI text and icon compliance checks.

## Implementation Update (2026-04-08)
- Updated `ColorField` interaction contract:
	- card-body click now selects/activates the token,
	- swatch click opens native color picker without forcing card activation,
	- hex input accepts typed editing flow and commits valid values.
- Added reset confirmation parity in `InstitutionCustomizationMockView` using `DashboardOverlayShell`.
- Save and reset actions now both execute through explicit confirmation overlays.
- Added deterministic tests for card/swatch separation, typed-hex updates, and reset confirmation accept/cancel paths.

## Validation Evidence (2026-04-08)
- `get_errors` on touched files -> PASS.
- `npm run test -- tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> PASS.
- `npm run lint` -> PASS.
- `npx tsc --noEmit` -> PASS.
