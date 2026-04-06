---
description: Apply context-budget and deterministic workflow rules for Copilot operational docs and planning assets.
applyTo: "{.github/copilot-instructions.md,AGENTS.md,copilot/**}"
---

# Copilot Context Efficiency Rules

Use these rules when working on Copilot workflows, plans, prompts, and operational docs:

- Keep always-on files concise. Move heavy procedural detail into scoped instruction files, skills, or runbooks.
- Load large docs by section. Avoid full-file reads unless architectural context truly requires it.
- Use one objective per session; split unrelated work into new sessions.
- Prefer read-only/search tools first, then edits, then terminal actions.
- Keep command authorization deterministic: allowed, forbidden, or pending review only.
- Do not introduce duplicate policy statements across always-on and scoped layers.
- Before closing work, ensure `vscode/askQuestions` leverage step executed and documented.
- Update plan lifecycle and review artifacts in the same request to avoid state drift.
