# Phase 02 — Customization Integration Verification (PLANNED)

## Objective

Integrate the new `InstitutionCustomizationView.jsx` dashboard layout path and verify live branding propagation with targeted E2E automation.

## Planned Changes / Actions

- Integrate customization view into the Admin Dashboard route/entry point.
- Execute `tests/e2e/branding.spec.js` after integration.
- Validate that updating hex input updates `--home-primary` on the preview container in real time.

## Risks

- Integration mismatch between new view and existing dashboard wiring.
- CSS variable propagation failing due to scope/provider boundaries.

## Completion Criteria

- Admin dashboard uses the intended customization view.
- `branding.spec.js` passes with expected CSS variable assertion.
- Any required selector or test data adjustments are documented.
