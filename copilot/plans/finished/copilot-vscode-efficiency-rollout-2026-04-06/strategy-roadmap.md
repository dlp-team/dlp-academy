<!-- copilot/plans/finished/copilot-vscode-efficiency-rollout-2026-04-06/strategy-roadmap.md -->
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
| 05 | Final optimization and deep risk review | COMPLETED | Optimization + inReview risk analysis complete |

## Lifecycle Outcome
- User confirmed OPEN manual setup action in `copilot/user-action-notes.md`.
- Plan lifecycle transitioned from `inReview` to `finished`.

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

## Post-Closure Actions
1. Keep plan in `finished` as the current reference baseline.
2. Reuse diagnostics matrix and scorecard in future efficiency cycles.
3. Archive only if superseded by a newer efficiency plan.

