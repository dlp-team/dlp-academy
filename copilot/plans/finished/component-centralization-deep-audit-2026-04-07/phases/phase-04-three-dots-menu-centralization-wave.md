<!-- copilot/plans/finished/component-centralization-deep-audit-2026-04-07/phases/phase-04-three-dots-menu-centralization-wave.md -->
# Phase 04 - Three-Dots Menu Centralization Wave

## Objective
Extract duplicated context-menu portal, positioning, and close-layer behavior into shared reusable logic/components.

## Candidate Targets
- [src/components/modules/ListItems/SubjectListItem.tsx](../../../../../src/components/modules/ListItems/SubjectListItem.tsx)
- [src/components/modules/ListItems/FolderListItem.tsx](../../../../../src/components/modules/ListItems/FolderListItem.tsx)
- [src/components/modules/SubjectCard/SubjectCardFront.tsx](../../../../../src/components/modules/SubjectCard/SubjectCardFront.tsx)
- [src/components/modules/FolderCard/FolderCardBody.tsx](../../../../../src/components/modules/FolderCard/FolderCardBody.tsx)

## Tasks
1. Extract shared menu positioning utility.
2. Extract shared menu portal shell/overlay behavior.
3. Adopt utility/shell in at least 2 high-impact files first.
4. Verify permission and action parity in all adopters.

## Exit Gate
- Duplicated menu portal and position logic significantly reduced with no behavior regressions.

## Status
COMPLETED

## Execution Notes (2026-04-07)
- Added shared utility: [src/components/modules/shared/menuPositionUtils.ts](../../../../../src/components/modules/shared/menuPositionUtils.ts)
- Adopted utility in:
	- [src/components/modules/ListItems/SubjectListItem.tsx](../../../../../src/components/modules/ListItems/SubjectListItem.tsx)
	- [src/components/modules/ListItems/FolderListItem.tsx](../../../../../src/components/modules/ListItems/FolderListItem.tsx)
	- [src/components/modules/SubjectCard/SubjectCardFront.tsx](../../../../../src/components/modules/SubjectCard/SubjectCardFront.tsx)
	- [src/components/modules/FolderCard/FolderCardBody.tsx](../../../../../src/components/modules/FolderCard/FolderCardBody.tsx)
- Added tests: [tests/unit/utils/menuPositionUtils.test.js](../../../../../tests/unit/utils/menuPositionUtils.test.js)
- Added shared portal shell: [src/components/modules/shared/ContextActionMenuPortal.tsx](../../../../../src/components/modules/shared/ContextActionMenuPortal.tsx)
- Added component tests: [tests/unit/components/ContextActionMenuPortal.test.jsx](../../../../../tests/unit/components/ContextActionMenuPortal.test.jsx)
- Validation completed:
	- get_errors clean for touched files
	- targeted tests passed
	- lint passed

## Completion Notes
- Shared portal and positioning logic now centralized and adopted across all four targeted menu implementations.
