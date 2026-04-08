<!-- copilot/plans/active/autopilot-plan-execution-2026-04-08/phases/phase-05-theme-preview-route-and-live-color-injection.md -->
# Phase 05 - Theme Preview Route and Live Color Injection

## Status
- PLANNED

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
