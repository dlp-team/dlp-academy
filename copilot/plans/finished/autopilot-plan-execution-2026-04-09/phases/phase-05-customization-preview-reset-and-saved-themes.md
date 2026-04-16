<!-- copilot/plans/finished/autopilot-plan-execution-2026-04-09/phases/phase-05-customization-preview-reset-and-saved-themes.md -->
# Phase 05 - Customization Preview, Reset, and Saved Themes

## Status
- IN_PROGRESS

## Objective
Stabilize institution customization behavior for preview fidelity, reset-to-saved behavior, and reusable saved theme sets.

## Scope
- Preserve live preview architecture and eliminate any hardcoded mock UI regressions.
- Ensure reset action restores last persisted colors, not default hardcoded palette.
- Add saved theme-set management (create, persist, and reapply color groups).
- Keep live unsaved preview updates deterministic and non-persistent until save.

## Risks
- Preview rendering paths can diverge from live app layout over time.
- Theme-set persistence schema may require migration-safe handling.

## Validation
- Targeted tests for customization state reducers and preview message flow.
- Manual checks for reset, save, and theme-set apply flows.
- `get_errors`, `npm run lint`, `npx tsc --noEmit`.

## Exit Criteria
- Preview path remains real-component based and stable.
- Reset returns to saved snapshot.
- Saved themes can be stored and reapplied reliably.

## Implementation Updates
### 2026-04-09 - Saved Theme Sets Persistence + Apply Flow
- Added persisted saved-theme support in [src/pages/InstitutionAdminDashboard/hooks/useCustomization.ts](../../../../../src/pages/InstitutionAdminDashboard/hooks/useCustomization.ts):
	- normalize + hydrate `customization.themeSets` into hook state,
	- persist named theme sets with Firestore nested path updates,
	- expose saved-theme collection and save callback to dashboard customization flow.
- Wired saved-theme props across:
	- [src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx](../../../../../src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx)
	- [src/pages/InstitutionAdminDashboard/components/CustomizationTab.tsx](../../../../../src/pages/InstitutionAdminDashboard/components/CustomizationTab.tsx)
	- [src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx](../../../../../src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx)
- Added editor-side controls to save current palette and reapply stored theme sets.
- Added focused coverage in [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](../../../../../tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx) for:
	- save current palette as named theme set,
	- apply persisted theme set colors to the active form.
- Validation:
	- `get_errors` on touched files -> PASS
	- `npm run test -- tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> PASS (25 tests)
	- `npm run lint` -> PASS
	- `npx tsc --noEmit` -> PASS
