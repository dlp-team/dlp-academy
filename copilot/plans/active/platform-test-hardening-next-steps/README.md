# Platform Test Hardening Next Steps Plan

This plan operationalizes the testing roadmap to move from scaffolded tests to a reliable, CI-enforced safety net for DLP Academy.

## Problem Statement

Test infrastructure now exists (Vitest + Playwright), but execution and coverage must be stabilized in phases to protect high-risk workflows and prevent regressions from reaching production.

## Scope

- Execute immediate smoke validation for unit and E2E pipelines.
- Integrate and verify institution customization behavior with automated E2E checks.
- Add targeted unit tests for high-risk state/logic and permission boundaries.
- Automate test execution in CI to enforce quality gates on push/PR.

## Non-Goals

- Redesigning product UI beyond required integration points.
- Broad refactors outside the targeted high-risk modules.
- Full end-to-end test coverage of every feature in this plan cycle.

## Current Status

- Plan state: **ACTIVE**
- Current phase: **Phase 02 — Customization Integration Verification (IN_PROGRESS)**
- Last updated: **2026-03-02**
- Blockers: `branding.spec.js` currently skips without `E2E_EMAIL` / `E2E_PASSWORD` environment credentials.

## Key Decisions and Assumptions

- `strategy-roadmap.md` is the source of truth for sequence and status.
- Local smoke validation is required before expanding coverage.
- E2E tests assume a reachable app at `http://localhost:5173` and valid environment credentials where required.
- CI rollout follows local stabilization of flaky or environment-dependent tests.

## Plan Artifacts

- `strategy-roadmap.md`: phase sequencing and lifecycle status.
- `phases/`: detailed phase-level objectives, changes, risks, and completion criteria.
- `working/`: execution notes and troubleshooting logs.
- `reviewing/`: verification checklist and review logs before moving to `finished`.
