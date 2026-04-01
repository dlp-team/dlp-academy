---
# .github/instructions/plans-and-docs.instructions.md
description: Apply plan lifecycle and documentation sync requirements for copilot planning and explanations folders.
applyTo: "copilot/**"
---

# Plans and Documentation Workflow

- Keep plan lifecycle accurate: `todo` -> `active` -> `inReview` -> `finished`.
- Keep roadmap status synchronized with phase files and checklist state.
- For implementation changes, update matching `copilot/explanations/codebase/**` docs.
- Create/update temporal lossless reports for code changes under `copilot/explanations/temporal/lossless-reports/YYYY-MM-DD/`.
- Avoid stale path comments after plan folder transitions.
