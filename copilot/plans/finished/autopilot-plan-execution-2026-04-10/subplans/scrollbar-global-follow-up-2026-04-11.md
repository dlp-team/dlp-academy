<!-- copilot/plans/finished/autopilot-plan-execution-2026-04-10/subplans/scrollbar-global-follow-up-2026-04-11.md -->
# Subplan - Global Scrollbar Follow-up (2026-04-11)

## Intake Sources
- [AUTOPILOT_PLAN.md](../../../../../AUTOPILOT_PLAN.md)
- [SCROLLBAR_FIX.md](../../../../../SCROLLBAR_FIX.md)

## Source Delta Assessment
- Both source files currently contain identical request text.
- No extra scrollbar-specific specification is present beyond requiring a global scrollbar fix and integration into the active plan/subplan.

## Objective
Close remaining global scrollbar parity gaps by centralizing `.custom-scrollbar` behavior and removing page-local overrides that can drift from dark/light mode updates.

## Scope
- Add a global `.custom-scrollbar` style contract in [src/index.css](../../../../../src/index.css).
- Remove duplicated local `.custom-scrollbar` CSS blocks in content pages that override global tokens.
- Re-validate scrollbar behavior with targeted tests and diagnostics.

## Out of Scope
- Redesigning page layouts unrelated to scrollbar behavior.
- Reworking Home/Bin logic already covered by previous phases.
- Any deployment or environment mutation.

## Execution Checklist
- [x] Implement global `.custom-scrollbar` style rules backed by existing CSS variables.
- [x] Remove page-scoped hardcoded scrollbar styles in Exam/Formula/StudyGuide style blocks.
- [x] Run `get_errors` on touched files.
- [x] Run targeted scrollbar-related tests.
- [x] Update phase/working logs and lossless documentation.

## Validation Commands
- `npm run test:unit -- tests/unit/components/CustomScrollbar.test.jsx`
- `npm run lint`
- `npx tsc --noEmit`

## Risks
- Removing local CSS could subtly change scrollbar width/opacity on content pages.
- Legacy selectors might still apply if duplicated in other files.

## Execution Evidence (2026-04-11)
- Implemented global `.custom-scrollbar` contract in [src/index.css](../../../../../src/index.css).
- Removed page-local `.custom-scrollbar` style blocks from:
	- [src/pages/Content/Exam.tsx](../../../../../src/pages/Content/Exam.tsx)
	- [src/pages/Content/Formula.tsx](../../../../../src/pages/Content/Formula.tsx)
	- [src/pages/Content/StudyGuide.tsx](../../../../../src/pages/Content/StudyGuide.tsx)
- Validation:
	- `get_errors` on touched files -> PASS (existing CSS-language warnings on `@theme/@variant` unchanged from baseline).
	- `npm run test:unit -- tests/unit/components/CustomScrollbar.test.jsx` -> PASS (1/1).
	- `npm run test:unit -- tests/unit/pages/content/Exam.test.jsx tests/unit/pages/content/StudyGuide.fallback.test.jsx tests/unit/pages/content/StudyGuide.navigation.test.jsx` -> PASS (8/8).
	- `npm run lint` -> PASS.
	- `npx tsc --noEmit` -> FAIL due pre-existing unrelated issues in [src/hooks/useGhostDrag.ts](../../../../../src/hooks/useGhostDrag.ts) (`dataset` numeric assignment typing at lines 80-81).

## Rollback
Revert touched files for this subplan as one atomic block:
- [src/index.css](../../../../../src/index.css)
- [src/pages/Content/Exam.tsx](../../../../../src/pages/Content/Exam.tsx)
- [src/pages/Content/Formula.tsx](../../../../../src/pages/Content/Formula.tsx)
- [src/pages/Content/StudyGuide.tsx](../../../../../src/pages/Content/StudyGuide.tsx)
