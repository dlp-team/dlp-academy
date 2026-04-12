<!-- copilot/explanations/codebase/src/pages/Home/components/HomeMainContent.md -->

# HomeMainContent.tsx

## Changelog
- **2026-04-12:** Added `setSelectMode` passthrough into `HomeContent` so modifier-click interactions can enter selection mode from grid/list item clicks.
- **2026-04-10:** Empty-state create-subject card now remains visible during selection mode; click behavior is controlled as inert in the child component instead of suppressing card rendering.
- **2026-04-08:** Forwarded `runBulkMoveToFolder` into `HomeContent` as `onDropSelectedItems` so selection-mode drag/drop uses batch move confirmation/share-rule parity.
- **2026-04-08:** Empty-state create-subject passthrough now disables while selection mode is active (`canCreateSubject = canCreateInManualContext && !selectMode`).
- **2026-04-02:** Stopped forwarding completion-tracking props into `HomeContent` as part of Home history/send-to-history retirement.
- **2026-04-01:** Forwarded `completedSubjectIds` and `setSubjectCompletion` into `HomeContent` for phase 10 completion actions.

## Overview
- **Source file:** `src/pages/Home/components/HomeMainContent.tsx`
- **Last documented:** 2026-04-01
- **Role:** Main content router for Home page view modes (`bin`, `shared`, and manual content views).

## Responsibilities
- Selects and renders the correct branch for current Home view mode.
- Hosts shared-view action wiring for folders and subjects.
- Hosts manual-view rendering pipeline (share confirmations, breadcrumb, loader/content/empty branches).
- Preserves existing drag/drop, selection, and card-visual wiring by forwarding handlers and state.

## Exports
- `default HomeMainContent`

## Main Dependencies
- `react`
- `./BreadcrumbNav`
- `./SharedView`
- `./HomeContent`
- `./HomeEmptyState`
- `./HomeLoader`
- `./HomeShareConfirmModals`
- `./BinView`
- `../../../utils/permissionUtils`
