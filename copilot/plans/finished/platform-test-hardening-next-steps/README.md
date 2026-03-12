# Platform Test Hardening Next Steps Plan

This plan operationalizes the testing roadmap to move from scaffolded tests to a reliable, CI-enforced safety net for DLP Academy.

## Problem Statement

Test infrastructure now exists (Vitest + Playwright), but coverage is still partial. We need a platform-wide safety net that validates every major user journey and critical hook logic so regressions in any page/module are detected before release.

## Scope

- Execute immediate smoke validation for unit and E2E pipelines.
- Build Playwright coverage for all core page families in `src/pages` (Auth, Onboarding, Home, Subject, Topic, Quizzes, Profile, Settings, admin dashboards, and content/resource viewing).
- Build Vitest coverage for cross-cutting and module hooks in `src/hooks` and `src/pages/**/hooks`, including `useQuizzesLogic.js`, `useSubjectManager.js`, `useProfile.js`, and `useTopicLogic.js`.
- Expand permission and role-access checks to prevent unauthorized edit/action regressions.
- Automate test execution in CI to enforce quality gates on push/PR.

## Non-Goals

- Redesigning product UI beyond required integration points.
- Broad refactors unrelated to testability and deterministic automation.
- Visual snapshot/golden testing for every component in this plan cycle.

## Current Status

- Plan state: **ACTIVE**
- Current phase: **Phase 02 — Auth and Onboarding Coverage Foundation (PLANNED)**
- Last updated: **2026-03-02**
- Blockers: E2E scenarios that require authenticated flows remain environment-gated until stable test credentials are configured.

## Key Decisions and Assumptions

- `strategy-roadmap.md` is the source of truth for sequence and status.
- Local smoke validation remains required before each phase expansion.
- E2E tests assume a reachable app at `http://localhost:5173` plus valid environment credentials where required.
- Coverage is organized by feature/module slices to mirror `src/pages` and `src/pages/**/hooks` ownership.
- CI rollout follows local stabilization of flaky or environment-dependent tests.

## Plan Artifacts

- `strategy-roadmap.md`: phase sequencing and lifecycle status.
- `phases/`: detailed phase-level objectives, changes, risks, and completion criteria.
- `working/`: execution notes and troubleshooting logs.
- `reviewing/`: verification checklist and review logs before moving to `finished`.
