<!-- copilot/explanations/temporal/lossless-reports/2026-04-07/institution-live-iframe-phase4-postmessage-and-save-gate.md -->
# Lossless Report - Institution Live Iframe Phase 04

## Requested Scope
1. Replace static customization preview with live iframe rendering.
2. Add postMessage dispatcher for temporary color injection.
3. Separate color-card selection from swatch picker open behavior.
4. Add highlight messaging for affected regions inside iframe.
5. Add save confirmation gate using registry-approved modal shell.
6. Support preview role toggle (`teacher`/`student`) with mock preview account flow.

## Preserved Behaviors
- Existing color token model and safe hex normalization remain intact.
- Existing role toggle UI remains available and now drives live preview payload.
- Existing reset/save mechanics remain explicit (no auto-save).
- Existing mock preview path remains available for deterministic tests (`previewMode='mock'`).

## Touched Files
- src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx
- src/pages/InstitutionAdminDashboard/components/customization/ColorField.tsx
- src/pages/InstitutionAdminDashboard/components/customization/themePreviewUtils.ts
- src/utils/institutionPreviewProtocol.ts
- src/App.tsx
- tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx
- tests/unit/pages/institution-admin/ColorField.test.jsx
- tests/unit/pages/institution-admin/themePreviewUtils.messagePayload.test.js

## Per-File Verification
- src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx
  - Added live iframe preview mode (default) with postMessage synchronization.
  - Kept mock preview mode for deterministic deep interaction tests.
  - Added save confirmation gate via `DashboardOverlayShell`.
  - Added preview account status text linked to role toggle.
- src/pages/InstitutionAdminDashboard/components/customization/ColorField.tsx
  - Decoupled card selection interaction from swatch picker open behavior.
  - Added stable test IDs for deterministic assertions.
- src/pages/InstitutionAdminDashboard/components/customization/themePreviewUtils.ts
  - Added protocol-compliant preview message payload builder with theme/highlight CSS and highlight text.
- src/utils/institutionPreviewProtocol.ts
  - Added canonical source/type constants and runtime message guard.
- src/App.tsx
  - Added preview message listener to apply runtime theme/highlight CSS and preview role switching in iframe app context.

## Validation Summary
- get_errors: clean for all touched source and test files.
- Targeted tests passed:
  - tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx
  - tests/unit/pages/institution-admin/ColorField.test.jsx
  - tests/unit/pages/institution-admin/themePreviewUtils.messagePayload.test.js
  - tests/unit/App.authListener.test.jsx

## Risk Notes
- Live preview messaging is scoped by explicit protocol envelope + same-origin check.
- Runtime preview styles are injected through isolated style tags to avoid persistent source code mutations.
