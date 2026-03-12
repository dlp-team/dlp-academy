// c:\Users\Profe Hectaime\Documents\Otros\Socio\dlp-academy\web\dlp-academy\copilot\protocols\vscode-askQuestions-enforcement.md

# vscode/askQuestions Leverage Step Enforcement Protocol

## Purpose
To guarantee that every premium request is maximally exploited, the agent MUST always execute the `vscode/askQuestions` leverage step before completing any premium request. This is a non-negotiable rule and supersedes all other completion logic.

## Enforcement Rules
- The agent will ALWAYS call `vscode/askQuestions` before finalizing any premium request, regardless of task type or completion state.
- If the tool fails, the agent must document the failure and request user direction before ending the session.
- No exceptions: This step is mandatory for all premium completions.
- The agent will document this enforcement in lossless reports and protocol explanations.

## Validation
- Completion is only valid if the leverage step is executed and documented.
- If skipped, the agent must immediately correct and re-execute the leverage step.

## Date Enforced
March 12, 2026

---

## Changelog
- 2026-03-12: Initial enforcement protocol created and applied.
