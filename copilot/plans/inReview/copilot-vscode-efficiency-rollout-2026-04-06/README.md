<!-- copilot/plans/inReview/copilot-vscode-efficiency-rollout-2026-04-06/README.md -->
# Copilot VS Code Efficiency Rollout Plan (2026-04-06)

## Status
- Lifecycle: inReview
- Overall status: IN_REVIEW
- Current phase: Review gates and closure checks
- Owner: Copilot (autopilot branch)

## Problem Statement
The repository already contains strong workflows, but the user requested a deeper, research-backed operating model so Copilot in VS Code can work faster, skip fewer rules, and reduce context token waste while preserving quality and safety.

## Requested Outcomes
1. Ensure new environment variable setup is explicit before deployment.
2. Produce deep research about high-efficiency Copilot use in VS Code.
3. Deliver a complete and executable plan with phases, validation gates, and rollback strategy.
4. Start implementation immediately in the same request.

## Scope
- Add explicit environment bootstrap for `COPILOT_PC_ID` via `.env.example`.
- Add a research-backed efficiency operating model for VS Code Copilot sessions.
- Harden workspace instructions so large-skill token overhead is reduced.
- Add rollout, measurement, and troubleshooting steps for sustained reliability.
- Keep existing branch/workflow behavior intact (lossless change).

## Out of Scope
- Product feature code changes in `src/**`.
- Firebase rules/function behavioral changes.
- CI pipeline redesign.

## Success Criteria
- `.env.example` exists and documents `COPILOT_PC_ID` setup.
- Copilot operating guidance includes session hygiene, context compaction, prompt design, tool scoping, model strategy, and diagnostics.
- Plan lifecycle artifacts exist and remain synchronized.
- Lossless report documents preserved behavior and validations.

## Key Risks and Controls
- Risk: Overly long always-on instructions degrade response quality.
  - Control: Move task-specific detail to scoped `*.instructions.md` and skills; keep always-on concise.
- Risk: Token waste from stale session history.
  - Control: Enforce new-session boundaries plus `/compact` policy.
- Risk: Missing env bootstrap causes branch ownership ambiguity.
  - Control: `.env.example` and user action note entry kept OPEN until user confirms.

## Plan Artifacts
- Roadmap: [strategy-roadmap.md](strategy-roadmap.md)
- User updates: [user-updates.md](user-updates.md)
- Phases: [phases/](phases)
- Working notes: [working/execution-log.md](working/execution-log.md)
- Review gate: [reviewing/verification-checklist-2026-04-06.md](reviewing/verification-checklist-2026-04-06.md)

## InReview Notes
- Implementation phases 01-05 are completed.
- Deep risk analysis documented in `reviewing/deep-risk-analysis-2026-04-06.md`.
- Final closure depends on user confirmation of OPEN action in `copilot/user-action-notes.md`.

