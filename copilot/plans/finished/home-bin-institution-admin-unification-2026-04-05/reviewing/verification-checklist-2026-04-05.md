<!-- copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/reviewing/verification-checklist-2026-04-05.md -->
# Verification Checklist - 2026-04-05

## Functional Scope
- [x] Unified modal behavior implemented and validated on target overlays.
- [x] Scrollbar left-margin artifact removed without layout regressions.
- [x] Home selection mode dimming mirrors Bin behavior.
- [x] Bin grid selected-card behavior uses scale-focus transition.
- [x] Bin list action panel appears below selected item with matching style.
- [x] Institution settings support period defaults and course-order management.
- [x] Institution automation toggles persist and enforce expected behavior.
- [x] Customization preview is fullscreen-safe and header-complete.
- [x] Preview surfaces match production behavior for requested modules.
- [x] Live color changes and active-zone highlighting work reliably.
- [x] Users tab supports safe delete flow for institution admin.
- [x] User views display Firebase Storage avatars and past classes sections.

## Security and Data Integrity
- [x] Tenant scoping validated for all new settings and user mutations.
- [x] Least-privilege checks enforced in touched mutation paths.
- [x] Deny-path tests covered where access-control changes exist.

## Quality Gates
- [x] npm run lint passes.
- [x] npx tsc --noEmit passes.
- [x] npm run test passes for impacted scope.
- [x] Optimization phase (Phase 06) documented and validated.
- [x] Lossless report created with preserved behaviors and validation summary.

## Lifecycle Gate
- [x] inReview optimization and consolidation review completed.
- [x] inReview deep-risk analysis completed.
- [x] Out-of-scope risks logged when applicable.


