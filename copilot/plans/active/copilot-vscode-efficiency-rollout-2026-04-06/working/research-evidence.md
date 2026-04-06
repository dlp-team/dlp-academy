<!-- copilot/plans/active/copilot-vscode-efficiency-rollout-2026-04-06/working/research-evidence.md -->
# Research Evidence and High-Value Findings

## Context and Session Efficiency
- VS Code exposes context-window usage and supports automatic and manual compaction (`/compact`).
- New sessions should be started for unrelated tasks to prevent context pollution.
- Subagents are recommended for isolated exploration to avoid cluttering main context.

## Instructions and Customization Strategy
- Always-on instructions should be concise because they load on every chat interaction.
- Scoped `*.instructions.md` files should carry task/file-specific rules via `applyTo`.
- VS Code combines multiple instruction sources; conflicting directives should be minimized.
- In VS Code, repo instructions + path instructions + AGENTS are supported.

## Agent and Tool Strategy
- Choose interaction mode by task: Ask (research), Plan (design), Agent (execution).
- Limit tool scope for faster and more relevant responses.
- Use prompt files for repeatable one-task workflows and custom agents for persistent personas.

## Reliability and Observability
- Agent Debug Logs and Chat Debug View provide token usage, loaded instructions, context payloads, and tool traces.
- `/troubleshoot` can inspect session behavior when debug logging is enabled.
- Workspace indexing improves semantic search quality for large repos.

## Model Strategy
- Auto model selection can reduce rate limits and latency overhead.
- Model selection should be matched to task complexity (fast models for simple tasks, reasoning models for planning/debugging).
- Model choice for chat is separate from inline suggestion model.

## Security and Policy
- Never include secrets in prompts or committed files.
- Keep `.env` ignored; commit only `.env.example` placeholders.
