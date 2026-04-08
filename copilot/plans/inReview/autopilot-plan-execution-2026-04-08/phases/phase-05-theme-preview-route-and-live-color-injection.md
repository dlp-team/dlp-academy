<!-- copilot/plans/active/autopilot-plan-execution-2026-04-08/phases/phase-05-theme-preview-route-and-live-color-injection.md -->
# Phase 05 - Theme Preview Route and Live Color Injection

## Status
- COMPLETED

## Objective
Deliver iframe preview architecture using mock route and live unsaved color updates without secondary auth account.

## Scope
- Add `/theme-preview` route with role parameter.
- Bypass Firebase auth in preview route and use local mock state.
- Parent customization sends unsaved colors to iframe via `postMessage`.
- Preview route listens and applies CSS variable updates live.

## Validation
- Verify no auth-session collision with parent app.
- Verify live color updates without save.
- Verify teacher/student role preview switching.

## Implementation Update (2026-04-08)
- Added new public route page: `src/pages/ThemePreview/ThemePreview.tsx`.
- Registered `/theme-preview` in `src/App.tsx` as a public route (no `ProtectedRoute` auth gate).
- Updated customization live preview iframe default source to `/theme-preview?role=teacher`.
- Extended preview protocol payload (`buildInstitutionPreviewThemeMessage`) to include normalized `colors` in postMessage payload.
- `ThemePreview` now listens for preview messages and applies:
	- role updates (`teacher`/`student`),
	- active token highlight state,
	- runtime theme/highlight CSS updates,
	- live unsaved color form updates without persistence.
- Added focused unit coverage for route role-param initialization, postMessage live updates, and foreign-origin message rejection.

## Validation Evidence (2026-04-08)
- `get_errors` on touched files -> PASS.
- `npm run test -- tests/unit/pages/theme-preview/ThemePreview.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> PASS.
- `npm run lint` -> PASS.
- `npx tsc --noEmit` -> PASS.
