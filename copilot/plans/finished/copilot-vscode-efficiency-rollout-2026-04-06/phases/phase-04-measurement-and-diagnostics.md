<!-- copilot/plans/finished/copilot-vscode-efficiency-rollout-2026-04-06/phases/phase-04-measurement-and-diagnostics.md -->
# Phase 04 - Measurement and Diagnostics

## Status
COMPLETED

## Objective
Add measurable controls so efficiency and reliability can be monitored instead of assumed.

## Planned Changes
- Define simple metrics: average context size trend, instruction load count, session reset cadence, rework loops.
- Document debug flow using Agent Debug Logs, Chat Debug View, and `/troubleshoot`.
- Define fallback when instructions are not loaded or responses degrade.

## Validation
- Spot-check diagnostics workflow in docs for practical reproducibility.

## Exit Criteria
- Operators can diagnose performance and context issues in under 5 minutes.

## Completion Notes
- Added diagnostics matrix: `copilot/COPILOT_VSCODE_DIAGNOSTICS_MATRIX_2026-04-06.md`.
- Added scorecard template: `copilot/COPILOT_EFFICIENCY_SCORECARD_TEMPLATE.md`.
- Added triage sequence and issue-to-fix mapping for practical incident response.

