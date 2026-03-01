# Platform Test Hardening — Strategy Roadmap

## Mission

Establish a dependable testing progression from local smoke confidence to CI-enforced protection for critical user and admin workflows.

## Guiding Principles

- Validate foundations first, then expand coverage.
- Prioritize high-risk logic and permission boundaries.
- Keep tests deterministic and environment-aware.
- Use CI as an enforcement layer, not as first discovery of breakages.

## Phase Status

- Phase 01 — Smoke Test Baseline: **PLANNED**
- Phase 02 — Customization Integration Verification: **PLANNED**
- Phase 03 — Danger Zone Unit Hardening: **PLANNED**
- Phase 04 — Full Automation in CI: **PLANNED**
- Phase 05 — Review Gate and Closure Evidence: **PLANNED**

## Immediate Next Actions

1. Run `npm run test:unit` and capture failures/flakes in `working/smoke-log-2026-03-01.md`.
2. Run `npx playwright test --ui` and confirm local app reachability plus baseline flow execution.
3. Record smoke outcomes and move this plan to `active/` when Phase 01 execution begins.
