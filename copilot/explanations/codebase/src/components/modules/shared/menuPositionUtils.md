<!-- copilot/explanations/codebase/src/components/modules/shared/menuPositionUtils.md -->
# menuPositionUtils.ts

## Purpose
- Source file: [src/components/modules/shared/menuPositionUtils.ts](../../../../../../../src/components/modules/shared/menuPositionUtils.ts)
- Role: Shared viewport-safe positioning logic for list/card context menus.

## Function
### computeMenuPosition
- Inputs:
  - trigger rect
  - menu width/height
  - safe top and margins
  - viewport dimensions (optional overrides)
  - mode (`list` or `card`)
- Output:
  - normalized `{ top, left }` position clamped to viewport and header-safe constraints.

## Current Adopters
- [src/components/modules/ListItems/SubjectListItem.tsx](../../../../../../../src/components/modules/ListItems/SubjectListItem.tsx)
- [src/components/modules/ListItems/FolderListItem.tsx](../../../../../../../src/components/modules/ListItems/FolderListItem.tsx)
- [src/components/modules/SubjectCard/SubjectCardFront.tsx](../../../../../../../src/components/modules/SubjectCard/SubjectCardFront.tsx)
- [src/components/modules/FolderCard/FolderCardBody.tsx](../../../../../../../src/components/modules/FolderCard/FolderCardBody.tsx)

## Tests
- [tests/unit/utils/menuPositionUtils.test.js](../../../../../../../tests/unit/utils/menuPositionUtils.test.js)
