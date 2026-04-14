<!-- copilot/plans/active/autopilot-plan-notifications-suite-2026-04-14/subplans/subplan-formulas-en-mensajes.md -->
# Subplan: Formulas en Mensajes

## Target Outcomes
- Formula references are shown once in processed LaTeX form.
- Plain unprocessed duplicate formula content is removed from visual output.

## Implementation Areas
- [src/pages/Messages/Messages.tsx](src/pages/Messages/Messages.tsx)
- [src/utils/studyGuideQuestionUtils.ts](src/utils/studyGuideQuestionUtils.ts)
- [src/services/directMessageService.ts](src/services/directMessageService.ts)

## Risks
- Removing plain formula fallback may hide context if KaTeX fails.
- Existing non-formula references must remain unchanged.

## Status
- Pending.
