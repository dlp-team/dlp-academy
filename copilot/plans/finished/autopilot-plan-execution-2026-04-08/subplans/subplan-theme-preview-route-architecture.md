<!-- copilot/plans/finished/autopilot-plan-execution-2026-04-08/subplans/subplan-theme-preview-route-architecture.md -->
# Subplan: Theme Preview Route Architecture

## Objective
Replace real-account preview with a route-based mock-state iframe architecture.

## Requested Outcomes
- New route: `/theme-preview` with role toggle (`teacher`/`student`).
- Route bypasses Firebase auth and uses local mock-state fixtures.
- Parent customization tab sends unsaved colors by `postMessage`.
- Preview route listens and updates CSS variables live without DB writes.

## Candidate Target Files
- `src/App.tsx` or route registry files
- `src/pages/InstitutionAdminDashboard/**`
- `src/pages/theme-preview/**` (new)
- `src/styles/**` (CSS variable application)

## Risks
- Auth context bleed if preview route accidentally mounts normal auth flow.
- Cross-window message handling without payload guards.

## Validation
- Route render checks for teacher/student mode.
- Live color update checks without save.
- Confirm no Firebase auth/account switch occurs.
