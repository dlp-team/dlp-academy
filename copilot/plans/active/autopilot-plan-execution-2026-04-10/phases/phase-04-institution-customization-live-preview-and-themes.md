<!-- copilot/plans/active/autopilot-plan-execution-2026-04-10/phases/phase-04-institution-customization-live-preview-and-themes.md -->
# Phase 04 - Institution Customization Live Preview and Themes

## Status
- IN_REVIEW

## Objective
Restore real-app preview parity in institution customization and add reset-to-saved + saved-theme management behavior.

## Scope
- Remove fake/hardcoded preview composition and nested multi-scroll wrappers.
- Ensure preview uses real route/component stack, not made-up HTML.
- Preserve postMessage live color update behavior.
- `Restablecer` returns to last saved state (not hardcoded default).
- Add saved theme sets for institutions and apply-on-click behavior.

## Risks
- Preview route coupling can cause runtime drift with app routing changes.
- Theme persistence structure can break existing institution docs if unguarded.

## Exit Criteria
- [x] Preview reflects real web composition with clean single-scroll behavior.
- [x] Reset returns to fetched saved state.
- [x] Saved themes can be created, stored, and applied.
- [x] All visible text remains Spanish and component registry rules are respected.

## Implementation Update (2026-04-10)
- Refactored `ThemePreview` route to render the real `Home` page surface instead of the hardcoded mock preview composition.
- Added preview-user context propagation (`InstitutionAdminDashboard` -> `CustomizationTab` -> `InstitutionCustomizationMockView` -> `themePreviewUtils` message payload) so the iframe route can resolve a Home-compatible user profile without fabricated preview markup.
- Kept live `postMessage` theme/highlight synchronization behavior intact while adding user-context delivery to the same payload envelope.
- Removed preview-pane nested scrolling by making the right preview container overflow hidden so iframe content owns scroll behavior.

## Validation Evidence (2026-04-10)
- `get_errors` on all touched source/test files -> PASS.
- `npm run test -- tests/unit/pages/theme-preview/ThemePreview.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx tests/unit/pages/institution-admin/themePreviewUtils.messagePayload.test.js` -> PASS (30 tests).
- `npm run test -- tests/unit/pages/theme-preview/ThemePreview.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> PASS (28 tests).
