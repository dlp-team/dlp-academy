# Platform Test Hardening — Strategy Roadmap

## Mission

Establish a dependable testing progression from local smoke confidence to CI-enforced protection for critical user and admin workflows.

## Guiding Principles

- Validate foundations first, then expand coverage.
- Prioritize high-risk logic and permission boundaries.
- Keep tests deterministic and environment-aware.
- Use CI as an enforcement layer, not as first discovery of breakages.

## Phase Status

- Phase 01 — Smoke Test Baseline: **COMPLETED**
- Phase 02 — Customization Integration Verification: **IN_PROGRESS**
- Phase 03 — Danger Zone Unit Hardening: **PLANNED**
- Phase 04 — Full Automation in CI: **PLANNED**
- Phase 05 — Review Gate and Closure Evidence: **PLANNED**

## Immediate Next Actions

1. Provide `E2E_EMAIL` and `E2E_PASSWORD` to execute `tests/e2e/branding.spec.js` without skip.
2. Confirm live update assertion for branding preview/CSS variable path in customization flow.
3. Record Phase 02 execution details and decide whether selector/data refinements are needed.
