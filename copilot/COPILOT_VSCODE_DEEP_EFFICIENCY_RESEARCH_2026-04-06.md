<!-- copilot/COPILOT_VSCODE_DEEP_EFFICIENCY_RESEARCH_2026-04-06.md -->
# Deep Research: Most Efficient Copilot Usage in VS Code

## Date
2026-04-06

## Objective
Provide a practical, high-efficiency operating model for Copilot in VS Code that reduces token waste, improves reliability, and prevents instruction drift.

## Sources Reviewed
- VS Code docs: best practices, context management, sessions, debug view, settings reference, customization docs, agents overview.
- GitHub docs: prompt engineering, custom instruction support matrix, model selection, auto model selection, copilot memory concept.

## High-Impact Findings (Ranked)

### 1) Keep always-on instructions concise
Always-on instruction files are applied on every request. Large always-on files increase context load and can dilute task-specific reasoning. Keep global policy minimal and move specialized rules into `*.instructions.md` and skills.

### 2) Separate unrelated work into new sessions
Session context accumulation causes quality degradation. Start a fresh session for unrelated objectives. Use `/compact` when conversation drift starts.

### 3) Use section-targeted context loading
For large docs (for example large SKILL files), load only relevant sections. Avoid full-file reads by default. This directly reduces context token usage and lowers skip risk.

### 4) Use mode routing deliberately
- Ask: exploration and Q/A
- Plan: structured design and sequencing
- Agent: execution and tool orchestration
Choosing the correct mode avoids unnecessary tool calls and context bloat.

### 5) Use explicit context mentions when ambiguity exists
Use `#` mentions to attach exact files/symbols or `#codebase` when full semantic search is needed. Explicit targeting improves retrieval quality and reduces irrelevant search churn.

### 6) Keep tool surfaces minimal per task
Fewer enabled tools and tighter tool scope generally improve relevance and latency. Favor read/search first, edits second, terminal/network last.

### 7) Treat observability as a first-class loop
Use Agent Debug Logs and Chat Debug View to verify:
- Which instruction files were actually loaded
- Context size and composition
- Tool-call sequences
- Token usage and truncation behavior
Use `/troubleshoot` for fast diagnosis.

### 8) Match model choice to task complexity
Use fast models for small edits and reasoning-strong models for planning/debugging. Auto model selection can lower latency and reduce rate-limit pressure.

### 9) Use prompt files and custom agents for repeatability
Prompt files are ideal for single recurring tasks. Custom agents are better for persistent personas with specific tool limits and optional handoffs.

### 10) Capture stable facts in memory, not repeated prompts
Store stable repository facts once, then reuse. This lowers repetitive context transfer and improves consistency.

## Practical Efficiency Operating Model

### Layer A: Always-on (small)
- Keep `.github/copilot-instructions.md` short, policy-focused.
- Keep `AGENTS.md` as safety and execution guardrails only.

### Layer B: Scoped instructions
- Use `.github/instructions/*.instructions.md` with `applyTo` for language/path-specific guidance.
- Avoid duplicating rules already in always-on files.

### Layer C: On-demand skills/prompts
- Skills for domain workflows (planning, lossless changes, docs sync).
- Prompt files for repeatable task templates.

### Layer D: Session controls
- New session per objective.
- `/compact` when context usage rises.
- Subagents for isolated research.

### Layer E: Diagnostics
- Use Agent Debug Logs + Chat Debug View when quality drops.
- Confirm instruction discovery and context payload correctness.

## Recommended VS Code Settings to Review
- `chat.includeApplyingInstructions`
- `chat.useAgentsMdFile`
- `chat.instructionsFilesLocations`
- `chat.promptFilesLocations`
- `chat.useAgentSkills`
- `github.copilot.chat.agentDebugLog.enabled`
- `github.copilot.chat.tools.memory.enabled`
- `chat.useCustomizationsInParentRepositories` (for monorepos)

## Immediate Rollout Actions (Start Now)
1. Add `.env.example` for `COPILOT_PC_ID` bootstrap.
2. Keep always-on instruction layer concise and explicit.
3. Enforce section-based reads for large workflow docs.
4. Use plan-first flow for complex tasks.
5. Enable and use debug tooling when response quality drops.

## Expected Gains
- Lower context overhead per request.
- Lower probability of instruction omission.
- Faster turnaround on focused tasks.
- More predictable behavior across long-running workflows.

## Notes
This research is intended to be operational, not theoretical. It is aligned with current project protocols and can be rolled out incrementally.
