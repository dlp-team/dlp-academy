<!-- copilot/plans/active/autopilot-platform-hardening-and-completion/phases/phase-06-responsive-mobile-optimization.md -->
# Phase 06 - Responsive and Mobile Optimization

## Status
PLANNED

## Objective
Ensure consistent and reliable UX on phone/tablet breakpoints for high-priority routes without degrading desktop workflows.

## Planned Change Set
- Define route-priority matrix (Home, Profile, TeacherDashboard, InstitutionAdmin customization, core content pages).
- Fix overflow, spacing, target sizes, and interaction issues for touch usage.
- Ensure modal/dialog patterns remain usable on small screens.
- Validate role-critical actions on mobile viewport combinations.

## Validation Gates
- Breakpoint matrix pass for selected priority pages.
- Critical interactions verified on mobile and tablet widths.
- Desktop parity checks confirm no regressions.
- `npm run lint` and `npm run test` pass after responsive changes.

## Rollback Triggers
- Major desktop layout regressions.
- Primary CTA actions inaccessible on mobile for any role.

## Completion Criteria
- Mobile/tablet experience meets baseline interaction quality across priority pages.
- Responsive fixes are test-backed where feasible and manually validated where visual.
