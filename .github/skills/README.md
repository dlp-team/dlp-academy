<!-- .github/skills/README.md -->
# DLP Academy Skills

This folder contains on-demand Copilot skills for specialized workflows.

## Why this exists
- Keep global instructions lean and always-on.
- Load protocol-heavy guidance only when relevant.
- Reduce prompt/context noise for regular coding tasks.

## Skill list
- `create-plan`: Protocol-compliant plan creation and lifecycle transitions.
- `lossless-change`: Surgical change discipline and regression-safe verification.
- `debug-in-depth`: Stepwise root-cause analysis for hard failures.
- `explain-code`: Codebase and temporal explanation updates.
- `find-missing-tests`: Comprehensive missing-tests audit workflow.
- `git-workflow`: Safe branch/commit/push workflow for this repository.
- `test-stabilization`: Unit/rules/e2e failure and skip remediation flow.
- `docs-sync`: Post-change documentation and closure sync.
- `askquestions-leverage`: Mandatory final leverage question before closure.

## Recommended operating model
1. Keep `.github/copilot-instructions.md` and `AGENTS.md` as always-on global policy.
2. Trigger skills by intent in chat (for example: "create plan", "lossless", "debug", "stabilize tests").
3. Use heavy audit skills only on-demand.
