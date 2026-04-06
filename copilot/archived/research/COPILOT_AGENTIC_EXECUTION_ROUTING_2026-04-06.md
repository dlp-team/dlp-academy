<!-- copilot/COPILOT_AGENTIC_EXECUTION_ROUTING_2026-04-06.md -->
# Copilot Agentic Execution Routing (2026-04-06)

## Purpose
Provide a deterministic routing table for mode selection, skill loading, and validation gates so autonomous execution stays efficient and auditable.

## Request Routing Matrix
| Request Pattern | Primary Mode | Required Skills | Minimum Validation | Escalation Trigger |
|---|---|---|---|---|
| Quick question or exploration | Ask | none or targeted domain skill | Source check only | Ambiguity impacts architecture/safety |
| Multi-step feature or migration | Plan -> Agent | create-plan, lossless-change | `get_errors` + plan artifacts synced | Missing scope boundaries |
| Risky bug or flaky behavior | Ask -> Agent | debug-in-depth, lossless-change | Repro confirmed + fix validated | 3 failed remediation attempts |
| Docs + plan lifecycle sync | Agent | docs-sync, explain-code | Plan, review, and explanation docs synced | Missing mirror docs or stale lifecycle |
| Branch/commit/push workflow | Agent | git-workflow | Branch safety + scans + validation logs | Branch is `main` or forbidden command |
| Test stabilization | Agent | test-stabilization | Targeted tests then full impacted suite | Non-deterministic failures remain |

## Canonical Autonomous Loop
1. Verify request scope and constraints.
2. Load only relevant skills and scoped instructions.
3. Gather context with parallel read/search calls.
4. Implement in small validated blocks.
5. Run required validations and log outcomes.
6. Sync plan lifecycle and explanation docs.
7. Execute final leverage question via `vscode/askQuestions`.
8. Close only when artifacts and validations are complete.

## Anti-Patterns
- Loading full large files for simple edits.
- Using Agent mode for small one-file conceptual questions.
- Starting a new major block without validating previous block.
- Treating unknown commands as implicitly safe.

## Command Governance Link
See [autopilot/COMMAND_APPROVAL_MATRIX.md](autopilot/COMMAND_APPROVAL_MATRIX.md) for command risk tiers and approval policy.
