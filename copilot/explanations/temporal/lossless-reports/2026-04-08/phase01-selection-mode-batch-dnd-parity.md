<!-- copilot/explanations/temporal/lossless-reports/2026-04-08/phase01-selection-mode-batch-dnd-parity.md -->
# Lossless Report - Phase 01 Selection Mode Batch Drag/Drop Parity

## Requested Scope
- Continue active plan execution with maximum progress.
- Complete pending Phase 01 gates for selected-batch drag/drop parity and batch move confirmation parity.

## Preserved Behaviors
- Single-item drag/drop flow remains unchanged when the dragged item is not part of the selected batch.
- Existing share/unshare confirmation logic remains centralized in Home bulk move handlers.
- Selection-mode create-action guards and folder-child de-dup behavior remain unchanged.

## Touched Files
- [src/pages/Home/hooks/useHomeContentDnd.ts](../../../../../src/pages/Home/hooks/useHomeContentDnd.ts)
- [src/pages/Home/components/HomeContent.tsx](../../../../../src/pages/Home/components/HomeContent.tsx)
- [src/pages/Home/components/HomeMainContent.tsx](../../../../../src/pages/Home/components/HomeMainContent.tsx)
- [src/pages/Home/Home.tsx](../../../../../src/pages/Home/Home.tsx)
- [tests/unit/hooks/useHomeContentDnd.test.js](../../../../../tests/unit/hooks/useHomeContentDnd.test.js)

## File-by-File Verification
1. `useHomeContentDnd.ts`
- Added selection-aware drop routing helper.
- List/root subject/folder drop paths now detect when the dragged card belongs to active selection and redirect to bulk move callback.
- Preserved existing fallback routing for non-selected drags.

2. `HomeContent.tsx`
- Re-enabled DnD affordance in selection mode when context allows drag/drop.
- Forwarded selection context and bulk-drop callback to DnD hook.

3. `HomeMainContent.tsx`
- Forwarded `runBulkMoveToFolder` into `HomeContent` as selection-aware drop callback.

4. `Home.tsx`
- Passed `runBulkMoveToFolder` through Home main-content composition pipeline.

5. `useHomeContentDnd.test.js`
- Added regression tests for selected subject list-drop and selected folder root-drop batch routing.

## Validation Summary
- `get_errors` on touched files: PASS
- `npm run test -- tests/unit/hooks/useHomeContentDnd.test.js tests/unit/components/CustomScrollbar.test.jsx tests/unit/pages/theme-preview/ThemePreview.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx`: PASS
- `npm run lint`: PASS
- `npx tsc --noEmit`: PASS

## Residual Risks
- Manual in-app verification is still recommended for combined multi-selection edge cases (mixed shortcut/source entries across nested folders) before phase promotion to `COMPLETED`.
