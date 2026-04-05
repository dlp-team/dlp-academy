<!-- copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/reviewing/verification-checklist-2026-04-05.md -->
# Verification Checklist - 2026-04-05

## Functional Scope
- [ ] Unified modal behavior implemented and validated on target overlays.
- [ ] Scrollbar left-margin artifact removed without layout regressions.
- [ ] Home selection mode dimming mirrors Bin behavior.
- [ ] Bin grid selected-card behavior uses scale-focus transition.
- [ ] Bin list action panel appears below selected item with matching style.
- [ ] Institution settings support period defaults and course-order management.
- [ ] Institution automation toggles persist and enforce expected behavior.
- [ ] Customization preview is fullscreen-safe and header-complete.
- [ ] Preview surfaces match production behavior for requested modules.
- [ ] Live color changes and active-zone highlighting work reliably.
- [ ] Users tab supports safe delete flow for institution admin.
- [ ] User views display Firebase Storage avatars and past classes sections.

## Security and Data Integrity
- [ ] Tenant scoping validated for all new settings and user mutations.
- [ ] Least-privilege checks enforced in touched mutation paths.
- [ ] Deny-path tests covered where access-control changes exist.

## Quality Gates
- [ ] npm run lint passes.
- [ ] npx tsc --noEmit passes.
- [ ] npm run test passes for impacted scope.
- [ ] Optimization phase (Phase 06) documented and validated.
- [ ] Lossless report created with preserved behaviors and validation summary.

## Lifecycle Gate
- [ ] inReview optimization and consolidation review completed.
- [ ] inReview deep-risk analysis completed.
- [ ] Out-of-scope risks logged when applicable.
