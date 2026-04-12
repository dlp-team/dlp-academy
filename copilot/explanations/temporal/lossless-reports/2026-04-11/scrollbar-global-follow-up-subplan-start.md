<!-- copilot/explanations/temporal/lossless-reports/2026-04-11/scrollbar-global-follow-up-subplan-start.md -->
# Lossless Report - Scrollbar Global Follow-up Subplan Start (2026-04-11)

## Requested Scope
- Use the current active plan as authority.
- Convey the newly provided AUTOPILOT source into the active plan as a new plan/subplan item.
- Check [SCROLLBAR_FIX.md](../../../../../SCROLLBAR_FIX.md) and start execution from that scope.

## Intake Summary
- Active plan used: [copilot/plans/active/autopilot-plan-execution-2026-04-10/README.md](../../../../plans/active/autopilot-plan-execution-2026-04-10/README.md)
- Intake sources reviewed:
  - [AUTOPILOT_PLAN.md](../../../../../AUTOPILOT_PLAN.md)
  - [SCROLLBAR_FIX.md](../../../../../SCROLLBAR_FIX.md)
- Source delta result: both files contain the same text in current workspace state.

## Plan/Subplan Changes
- Added subplan index entry in [copilot/plans/active/autopilot-plan-execution-2026-04-10/subplans/README.md](../../../../plans/active/autopilot-plan-execution-2026-04-10/subplans/README.md).
- Created dedicated subplan [copilot/plans/active/autopilot-plan-execution-2026-04-10/subplans/scrollbar-global-follow-up-2026-04-11.md](../../../../plans/active/autopilot-plan-execution-2026-04-10/subplans/scrollbar-global-follow-up-2026-04-11.md).
- Synced progress/status in:
  - [copilot/plans/active/autopilot-plan-execution-2026-04-10/user-updates.md](../../../../plans/active/autopilot-plan-execution-2026-04-10/user-updates.md)
  - [copilot/plans/active/autopilot-plan-execution-2026-04-10/strategy-roadmap.md](../../../../plans/active/autopilot-plan-execution-2026-04-10/strategy-roadmap.md)
  - [copilot/plans/active/autopilot-plan-execution-2026-04-10/phases/phase-05-scrollbar-and-current-academic-filter-fix.md](../../../../plans/active/autopilot-plan-execution-2026-04-10/phases/phase-05-scrollbar-and-current-academic-filter-fix.md)
  - [copilot/plans/active/autopilot-plan-execution-2026-04-10/working/execution-log.md](../../../../plans/active/autopilot-plan-execution-2026-04-10/working/execution-log.md)
  - [BRANCH_LOG.md](../../../../../BRANCH_LOG.md)

## Implementation Changes
- Centralized reusable `.custom-scrollbar` rules in [src/index.css](../../../../../src/index.css) using shared scrollbar CSS variables.
- Removed duplicated page-local `.custom-scrollbar` style overrides from:
  - [src/pages/Content/Exam.tsx](../../../../../src/pages/Content/Exam.tsx)
  - [src/pages/Content/Formula.tsx](../../../../../src/pages/Content/Formula.tsx)
  - [src/pages/Content/StudyGuide.tsx](../../../../../src/pages/Content/StudyGuide.tsx)

## Preserved Behavior (Lossless)
- Existing animation and KaTeX style blocks in content pages remain unchanged.
- Existing global scrollbar active/stable class behavior from [src/components/ui/CustomScrollbar.tsx](../../../../../src/components/ui/CustomScrollbar.tsx) remains unchanged.
- Home page scrollbar-specific rules in [src/index.css](../../../../../src/index.css) remain intact.

## Validation
- `get_errors` on touched files: PASS.
  - Note: existing baseline CSS language warnings in [src/index.css](../../../../../src/index.css) for `@theme` and `@variant` remain unchanged and are not introduced by this subplan.
- `npm run test:unit -- tests/unit/components/CustomScrollbar.test.jsx`: PASS (1/1).
- `npm run test:unit -- tests/unit/pages/content/Exam.test.jsx tests/unit/pages/content/StudyGuide.fallback.test.jsx tests/unit/pages/content/StudyGuide.navigation.test.jsx`: PASS (8/8).
- `npm run lint`: PASS.
- `npx tsc --noEmit`: FAIL due pre-existing unrelated type errors in [src/hooks/useGhostDrag.ts](../../../../../src/hooks/useGhostDrag.ts#L80).

## Residual Risks
- Other files may still contain custom scrollbar overrides under different class names.
- Visual width/opacity changed slightly for content-page `.custom-scrollbar` surfaces due centralization (intended, but should be manually spot-checked).

## Next Step
- Continue checklist Step 7 with remaining manual parity closures for Phases 01/02, then execute Phase 06 optimization and deep risk review.
