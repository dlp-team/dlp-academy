<!-- copilot/explanations/temporal/lossless-reports/2026-04-10/phase04-theme-preview-real-home-context-and-scroll-fix.md -->
# Lossless Report - Phase 04 Theme Preview Real Home Context and Scroll Fix (2026-04-10)

## Requested Scope
- Continue active plan Step 7 with Phase 04 institution customization preview parity.
- Remove hardcoded/fake preview route rendering and use real web composition for preview.
- Preserve live postMessage color-preview behavior without persistence side effects.
- Keep reset-to-saved and saved-themes behaviors intact.
- Eliminate nested preview-pane scroll behavior around the iframe preview.

## Preserved Behaviors
- Save and reset confirmation overlays remain unchanged and continue using `DashboardOverlayShell`.
- Saved-theme creation and apply behavior remains unchanged.
- Existing live preview postMessage theme/highlight CSS contract remains backward compatible.
- Existing role/viewport toggles and fullscreen controls remain intact.

## Touched Files
- `src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx`
- `src/pages/InstitutionAdminDashboard/components/CustomizationTab.tsx`
- `src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx`
- `src/pages/InstitutionAdminDashboard/components/customization/themePreviewUtils.ts`
- `src/pages/ThemePreview/ThemePreview.tsx`
- `tests/unit/pages/theme-preview/ThemePreview.test.jsx`

## Per-File Verification
- `InstitutionAdminDashboard.tsx`: now forwards dashboard user context into customization tab for preview routing context.
- `CustomizationTab.tsx`: now forwards `previewUser` into customization preview component.
- `InstitutionCustomizationMockView.tsx`: now includes preview user context in live preview postMessage payload and uses `overflow-hidden` in right preview pane to avoid nested scrolling.
- `themePreviewUtils.ts`: now sanitizes preview user context and includes it in preview message payload while preserving existing `themeCss`/`highlightCss` fields.
- `ThemePreview.tsx`: no longer renders hardcoded mock preview surface; now renders real `Home` route composition with role-forced preview user derived from message context.
- `ThemePreview.test.jsx`: updated to validate role bootstrap + same-origin user-context message handling and theme style-tag updates for the new route behavior.

## Validation Summary
- `get_errors` on all touched source/test files: PASS.
- `npm run test -- tests/unit/pages/theme-preview/ThemePreview.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx tests/unit/pages/institution-admin/themePreviewUtils.messagePayload.test.js`: PASS (30 tests).
- `npm run test -- tests/unit/pages/theme-preview/ThemePreview.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx`: PASS (28 tests).
