<!-- copilot/COPILOT_EFFICIENCY_SCORECARD_TEMPLATE.md -->
# Copilot Efficiency Scorecard Template

## Run Metadata
- Date:
- Workspace:
- Task category:
- Agent mode used:
- Model used:
- Plan reference:
- Branch:

## Core Metrics
- Session count for task:
- Average context load trend (low/medium/high):
- Compaction events used:
- Tool calls (approx):
- Rework loops before success:
- Time to first acceptable result:
- Time to final validated result:
- Unknown command requests logged:
- Pending command decisions resolved:

## Quality Metrics
- Followed instruction files correctly: Yes/No
- Adjacent behavior preserved: Yes/No
- Validation completed: Yes/No
- Manual follow-up needed: Yes/No
- Lossless report updated: Yes/No
- Plan lifecycle synced: Yes/No

## Incident Flags
- Instructions not applied
- Context overflow
- Wrong file targeting
- Tool overuse
- Missing validation
- Command boundary ambiguity
- Duplicate lifecycle state

## KPI Targets (Baseline)
- AI PR acceptance rate target: 60-80%
- Rework rate target: <10%
- Security incidents (credentials/deploy violations): 0
- Context overload events per session: <=1

## Calculated Indicators
- Rework Rate = Rework loops / major blocks
- Validation Completion Rate = validated blocks / total blocks
- Command Decision Latency = pending decision timestamp delta

## Improvement Actions
1.
2.
3.

## Weekly Trend Summary
- What improved:
- What regressed:
- Next optimization to apply:
- Command categories added/removed:
- Residual risks to carry forward:
