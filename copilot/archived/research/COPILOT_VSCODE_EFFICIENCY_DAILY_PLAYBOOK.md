<!-- copilot/COPILOT_VSCODE_EFFICIENCY_DAILY_PLAYBOOK.md -->
# Copilot VS Code Daily Efficiency Playbook

## Purpose
Fast, repeatable workflow to maximize Copilot output quality while minimizing context waste and token overhead.

## 0) One-Time Local Setup
1. Copy `.env.example` to `.env`.
2. Set `COPILOT_PC_ID` uniquely per machine.
3. Keep `.env` local only.

## 1) Session Start (2 minutes)
1. Define one objective for this session.
2. Choose mode:
   - Ask for exploration
   - Plan for architecture and sequencing
   - Agent for implementation
3. Attach only critical context (`#` mentions for exact files/symbols).

## 2) Context Budget Rules
- Do not load long files end-to-end unless strictly required.
- Read only the section needed for the current step.
- Use a new session for unrelated topics.
- Run `/compact` when context gets noisy.

## 3) Prompt Pattern (High-Yield)
Use this structure in one message:
- Goal
- Constraints
- Expected output
- Validation criteria

Example template:
- Goal: Implement X in Y files.
- Constraints: Preserve Z behavior, no API contract changes.
- Expected output: Code + docs + tests.
- Validation: run A, B, C and report results.

## 4) Execution Discipline
1. Search/read first.
2. Edit second.
3. Execute commands last and only if necessary.
4. Validate touched files and adjacent behavior.

## 5) Reliability Loop
If quality drops:
1. Check Agent Debug Logs.
2. Check Chat Debug View context payload and loaded instructions.
3. Run `/troubleshoot` with targeted question.
4. Start a new session if context is saturated.

## 6) Task-Type Routing
- Small one-file edit: Inline chat or Ask + focused context.
- Multi-file feature: Plan first, then Agent.
- Refactor with risk: Plan + explicit rollback notes.
- Documentation sync: docs workflow with lossless report.

## 7) Anti-Patterns to Avoid
- One giant prompt spanning unrelated tasks.
- Always-on instruction files that become huge and repetitive.
- Full-file reads for large docs when only one section is needed.
- Continuing long degraded sessions instead of resetting.

## 8) Daily Exit Checklist
- Objective complete end-to-end.
- Validation executed and summarized.
- Required docs/plan/lossless artifacts updated.
- Manual user actions logged in `copilot/user-action-notes.md` when needed.
- Command approvals resolved (`allowed`, `forbidden`, or `pending`) for any new command class.
- Scorecard entry captured in `copilot/COPILOT_EFFICIENCY_SCORECARD_TEMPLATE.md`.
- Final leverage step asked before closure.
