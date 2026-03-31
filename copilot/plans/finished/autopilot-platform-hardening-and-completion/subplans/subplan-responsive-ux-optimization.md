<!-- copilot/plans/finished/autopilot-platform-hardening-and-completion/subplans/subplan-responsive-ux-optimization.md -->
# Subplan - Responsive UX Optimization

## Related Main Phase
- Phase 06 - Responsive and Mobile Optimization

## Objective
Ensure that high-priority product flows are equally usable on mobile, tablet, and desktop breakpoints.

## Scope
- Home interactions for organization and navigation.
- Profile and teacher dashboard interactions.
- Institution customization preview and controls.
- Critical modals/dialogs that gate user actions.

## Breakpoint Matrix
- Mobile: 360x800, 390x844
- Tablet: 768x1024, 820x1180
- Desktop baseline: 1280x800

## Execution Slices
1. Build route-by-breakpoint issue matrix and prioritize blockers.
2. Apply layout and interaction fixes for blockers (tap targets, overflow, focus order, scrolling).
3. Validate modal usability and role-critical actions at each breakpoint.
4. Perform desktop parity pass to ensure no regressions.

## Validation and Test Strategy
- Required commands:
  - `npm run lint`
  - `npm run test`
- Additional checks:
  - responsive manual verification checklist,
  - screenshot evidence for resolved blockers when needed.

## Rollback Strategy
- Roll back by route-level fix bundles if regression appears.
- Preserve working desktop behavior as hard rollback anchor.

## Completion Criteria
- Priority pages pass breakpoint matrix without action blockers.
- Desktop behavior remains stable.
- Responsive changes are documented with validation evidence.
