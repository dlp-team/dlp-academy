---
# .github/skills/askquestions-leverage/SKILL.md
name: askquestions-leverage
description: Enforce the mandatory vscode/askQuestions leverage step before task closure. Use in every completion flow where user confirmation or next-step intent must be captured.
---

# AskQuestions Leverage Skill

## Objective
Guarantee a final leverage prompt runs before closing work.

## Standard
1. Ask one concise final question with `vscode/askQuestions`.
2. Keep prompt under 200 characters when possible.
3. If tool fails, document failure and request user direction.
4. Do not close task until this step is completed or explicitly blocked.
