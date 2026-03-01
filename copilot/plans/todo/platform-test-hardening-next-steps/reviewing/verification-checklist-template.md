# Verification Checklist (Template)

Use this checklist when the plan reaches `inReview/`.

- [ ] Unit tests pass in CI and locally.
- [ ] E2E tests pass for auth, branding, study flow, and user journey.
- [ ] Institution customization integration verified in admin dashboard.
- [ ] High-risk hook tests cover drag-drop and state merge scenarios.
- [ ] Permission tests prove viewer cannot enter edit state.
- [ ] CI workflow blocks merges/deploys on test failure.
- [ ] Any failures logged with fixes and re-test evidence.
