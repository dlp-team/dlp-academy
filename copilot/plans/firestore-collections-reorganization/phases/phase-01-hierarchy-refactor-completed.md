# Phase 01 — Hierarchical Home Stabilization
Status: COMPLETED

## Why this phase existed
The app moved to nested folders, but runtime behavior still had inconsistencies in ancestry checks, drag/drop execution, and folder-scoped discovery.

## What was done

### 1) Hierarchy consistency
- Updated ancestry/cycle logic to rely on `parentId` in `folderUtils`.

### 2) Drag & Drop reliability
- Fixed DnD orchestration to avoid duplicate move writes in list/root flows.
- Corrected folder-drop routing in list flows.
- Ensured wrapper handlers report operations as handled.

### 3) Breadcrumb robustness
- Added cycle-safe breadcrumb path construction.
- Added invalid move checks for breadcrumb drops.
- Used drag item type to validate destination legality.

### 4) Scoped filtering/search
- Improved folder/subject filtering to respect current-folder scope and descendants.
- Scoped search results to active navigation context.

### 5) Deep-linking
- Added `folderId` URL query synchronization with current folder state.

## Validation
- Targeted file diagnostics passed for modified files.
- Production build succeeded (`npm run build`).

## Files impacted (high level)
- `src/utils/folderUtils.js`
- `src/pages/Home/Home.jsx`
- `src/pages/Home/components/BreadcrumbNav.jsx`
- `src/pages/Home/hooks/useHomeContentDnd.js`
- `src/pages/Home/hooks/useHomePageHandlers.js`
- `src/pages/Home/hooks/useHomePageState.js`
- `src/pages/Home/hooks/useHomeState.js`
- `src/pages/Home/hooks/useHomeHandlers.js`

## Follow-up
- Apply same rigor to upcoming shortcut-aware move/resolve logic.
