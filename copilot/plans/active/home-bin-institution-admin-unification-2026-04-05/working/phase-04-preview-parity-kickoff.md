<!-- copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/working/phase-04-preview-parity-kickoff.md -->
# Phase 04 Working Note - Preview Parity Kickoff

## Status
- IN_PROGRESS

## Block Tracking
- Block A (2026-04-05): COMPLETED
- Block B: PLANNED
- Block C: PLANNED

## Block A Scope (Completed)
- Fix fullscreen customization preview overlap with global fixed header.
- Add deterministic regression assertion for fullscreen stacking context contract.

## Block A Validation Evidence
- `npm run test -- tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Upcoming Block B Scope
- Integrate exact header parity inside fullscreen preview shell.
- Verify top-toolbar/spacing behavior remains stable across desktop/tablet/mobile preview widths.

## Upcoming Block C Scope
- Expand real-surface parity for topic/resources/bin rendering deltas.
- Add focused parity tests for requested preview behavior consistency.
