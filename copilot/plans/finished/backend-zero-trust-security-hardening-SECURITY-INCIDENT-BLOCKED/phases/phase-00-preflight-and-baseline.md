<!-- copilot/plans/todo/backend-zero-trust-security-hardening/phases/phase-00-preflight-and-baseline.md -->
# Phase 00 — Preflight and Baseline

## Objective
Establish a stable baseline before hardening to ensure all future changes can be measured and verified for regressions.

## Tasks
- Capture current `firestore.rules`, `storage.rules`, and `functions/` auth-sensitive paths.
- Run baseline validation commands and store outputs.
- List known existing failures not caused by this plan.
- Freeze scope and define owners/reviewers.

## Required commands
- `npm run test:rules`
- `npm run test`
- `npm run lint`
- `npx tsc --noEmit`

## Artifacts
- Baseline report with command outputs.
- Known pre-existing issue register.
- Scoped file inventory for hardening work.

## Exit criteria
- Baseline evidence stored.
- Scope confirmed and approved.
- Pre-existing failures separated from hardening work.
## Status
 - Completed (2026-03-12)
## Completed artifacts
 - `working/phase-00-baseline-report.md`