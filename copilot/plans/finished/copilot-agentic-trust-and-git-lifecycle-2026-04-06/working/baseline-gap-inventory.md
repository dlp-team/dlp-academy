<!-- copilot/plans/finished/copilot-agentic-trust-and-git-lifecycle-2026-04-06/working/baseline-gap-inventory.md -->
# Baseline Gap Inventory (Phase 01)

## Objective
Map research recommendations to repository status and prioritize implementation work.

| Theme | Current State | Gap | Priority | Owner | Planned Action |
|---|---|---|---|---|---|
| Context compaction | Strong baseline model exists in always-on instructions | Duplicate enforcement lines and missing scoped efficiency file | High | Copilot | Add scoped efficiency instruction and compact duplicate rules |
| Skill routing determinism | Skills are available but routing cues are distributed | No single decision table for mode + skill + validation mapping | High | Copilot | Add routing matrix runbook |
| Command approval clarity | Allowed/forbidden/pending docs exist | Risk tiers and approval matrix not explicit in one place | High | Copilot | Add command approval matrix and update docs |
| Destructive command boundaries | Forbidden list covers many high-risk commands | Some revert-like git commands still appear in allow list | Critical | Copilot | Move destructive revert patterns to forbidden guidance |
| KPI instrumentation | Scorecard template exists | Missing measurable thresholds, formulas, and cadence notes | Medium | Copilot | Expand scorecard template and pilot metrics workflow |
| Diagnostics escalation | Diagnostics matrix exists | No explicit escalation thresholds for repeated degradation | Medium | Copilot | Add escalation thresholds and stop conditions |

## Prioritized Execution Backlog
1. Complete context-compaction updates with no safety-rule loss.
2. Land deterministic routing and command-approval matrix.
3. Tighten command boundaries in allow/forbid/pending files.
4. Upgrade scorecard and diagnostics for pilot observability.

## Exit Check
- Gap items are either completed or explicitly moved to residual risk tracking.


