<!-- copilot/explanations/temporal/lossless-reports/2026-04-08/phase06-global-scrollbar-overlay-adaptation.md -->
# Lossless Report - Phase 06 Global Scrollbar Overlay Adaptation

## Requested Scope
- Continue active plan execution with maximum progress.
- Implement Phase 06 global scrollbar behavior update to remove side compensation artifacts while preserving theme adaptation.

## Preserved Behaviors
- Existing global/custom scrollbar theme token variables remain unchanged.
- Home-page scoped scrollbar appearance remains unchanged.
- `CustomScrollbar` component lifecycle behavior remains unchanged (class mount/unmount contract preserved).

## Touched Files
- [src/index.css](../../../../../src/index.css)

## File-by-File Verification
1. `index.css`
- Removed `scrollbar-gutter` reservation from active/stable/overlay global scrollbar mode selectors.
- Changed active global scrollbar mode from `overflow-y: auto` to `overflow-y: scroll`.
- Preserved transparent track and theme-variable thumb gradients for light/dark parity.

## Validation Summary
- `get_errors` on touched files: PASS
- `npm run test -- tests/unit/components/CustomScrollbar.test.jsx tests/unit/pages/theme-preview/ThemePreview.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx`: PASS
- `npm run lint`: PASS
- `npx tsc --noEmit`: PASS

## Residual Risks
- Manual visual verification on narrow/mobile breakpoints is still recommended to confirm subjective clipping perception in real browser scroll environments.
