<!-- copilot/plans/active/copilot-vscode-efficiency-rollout-2026-04-06/strategy-roadmap.md -->
# Strategy Roadmap

## Source of Truth
This roadmap is the authoritative sequencing reference for this plan.

## Phase Matrix
| Phase | Title | Status | Exit Gate |
|---|---|---|---|
| 01 | Research and baseline | COMPLETED | Research evidence captured with actionable controls |
| 02 | Context architecture hardening | COMPLETED | Updated instructions enforce low-noise context loading |
| 03 | Workflow automation package | COMPLETED | Reusable prompt/agent or documented runbook operational |
| 04 | Measurement and diagnostics | COMPLETED | Token/reliability troubleshooting workflow documented |
| 05 | Final optimization and deep risk review | PLANNED | Optimization + inReview risk analysis complete |

## Execution Sequence
1. Complete research synthesis from GitHub and VS Code documentation.
2. Implement environment bootstrap and instruction hardening.
3. Add operator workflow for sessions, context, and model selection.
4. Add diagnostics and reliability loop for drift detection.
5. Run final optimization and risk analysis review before closure.

## Validation Gates
- `get_errors` for all touched files.
- Manual consistency checks between roadmap, phase files, and review checklist.
- Verify no unrelated behavior drift in existing workflow docs.

## Rollback Strategy
- Revert only newly introduced efficiency guidance files if they conflict with active team process.
- Keep `.env.example` (safe additive file) unless user requests removal.
- Preserve existing multi-agent branch rules and templates as-is.

## Immediate Next Actions
1. Execute Phase 05 optimization and risk-review pass.
2. Generate lossless report and run diagnostics on all touched files.
3. Prepare commit/push package for validated block.
