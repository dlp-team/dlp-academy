// copilot/explanations/codebase/vscode-askQuestions-enforcement.md

# Enforcement of Mandatory vscode/askQuestions Leverage Step

## Summary
As of March 12, 2026, the agent is required to ALWAYS execute the `vscode/askQuestions` leverage step before completing any premium request. This is enforced as a hard-coded protocol and validated in every completion flow.

## Implementation
- Protocol file created: copilot/protocols/vscode-askQuestions-enforcement.md
- Repository memory updated: /memories/repo/premium-flow-continuation.md
- Enforcement documented in lossless reports and explanations.

## Validation
- Completion is only valid if leverage step is executed and documented.
- If skipped, agent must immediately correct and re-execute.

## Changelog
- 2026-03-12: Enforcement protocol created and applied.
