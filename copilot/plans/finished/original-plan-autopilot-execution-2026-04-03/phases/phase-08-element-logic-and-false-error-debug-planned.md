<!-- copilot/plans/active/original-plan-autopilot-execution-2026-04-03/phases/phase-08-element-logic-and-false-error-debug-planned.md -->
# Phase 08 - Element Logic and False Error Debug

## Status
COMPLETED

## Objective
Fix deletion edge-case behavior and eliminate false-negative subject-save error signaling.

## Work Items
- Ghost shortcut deletion fix: teacher deletion should move shortcut to their bin.
- Non-owner shared deletion fix: unshare for current user and remove shortcut without bin route.
- Deep root-cause analysis for subject-save false error appearing behind modal.
- Patch toast/notification/error propagation to avoid incorrect background message.

## Preserved Behaviors
- Owner deletion semantics remain unchanged except requested edge cases.
- Actual successful save behavior remains unchanged.

## Risks
- Shared deletion changes can affect collaboration semantics.
- Toast-provider fix can unintentionally suppress real errors.

## Validation
- Targeted unit/integration or E2E checks for each deletion path.
- Reproduction and fix-verification steps logged for false error issue.

## Implementation Notes (2026-04-03)
- Updated `src/hooks/useHomeHandlers.ts` so shortcut delete paths now distinguish orphan shortcut deletion (`moveToBin`) from shared unshare-removal flows.
- Updated `src/hooks/useShortcuts.tsx` to support soft delete to bin (`status: trashed`), plus shortcut restore and permanent delete APIs.
- Updated `src/pages/Home/components/BinView.tsx` to include trashed shortcut items and route restore/permanent-delete actions by item type.
- Updated `src/pages/Home/components/bin/BinGridItem.tsx` and `src/pages/Home/components/bin/BinSelectionPanel.tsx` for shortcut-aware labels and rendering.
- Updated `src/pages/Home/hooks/useHomeBulkSelection.ts` so bulk orphan-shortcut deletion routes through bin.
- Updated `src/hooks/useSubjects.ts` to make invite-code mapping sync best-effort after successful subject updates, preventing false-negative save errors.

## Validation Evidence
- `npm run test -- tests/unit/hooks/useHomeHandlers.shortcuts.test.js tests/unit/hooks/useShortcuts.test.js`
- `npx tsc --noEmit`
- `npm run lint` (0 errors; existing warnings in `src/pages/Content/Exam.jsx` and `src/pages/Content/StudyGuide.jsx` unchanged)

## Exit Criteria
- Both deletion edge cases behave as requested.
- Subject save no longer triggers false background failure signal.
