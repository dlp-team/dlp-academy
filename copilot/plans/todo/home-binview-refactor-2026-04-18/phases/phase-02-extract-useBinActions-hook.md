<!-- copilot/plans/todo/home-binview-refactor-2026-04-18/phases/phase-02-extract-useBinActions-hook.md -->
# Phase 02: Extract `useBinActions` Hook

## Status: `todo`

## Objective
Extract all action handlers from BinView.tsx into `src/hooks/useBinActions.ts`.

## Handlers to extract

| Handler | Lines (approx) | Purpose |
|---|---|---|
| `clearBulkSelection` | 1 | Reset bulk selection |
| `toggleBulkSelectionMode` | 10 | Toggle selection mode on/off |
| `toggleBulkItemSelection` | 12 | Add/remove item from bulk selection |
| `handleSelectAllVisible` | 10 | Select or deselect all visible items |
| `handleBulkRestore` | 25 | Restore all selected items |
| `handleBulkPermanentDelete` | 25 | Delete all selected items permanently |
| `handleRestore` | 25 | Restore single item |
| `handlePermanentDelete` | 25 | Delete single item permanently |
| `handleEmptyBin` | 20 | Empty all visible trash items |
| `handleOpenReadOnlySubject` | 3 | Navigate to subject in read-only mode |
| `handleSelectItem` | 10 | Select/deselect an item (toggle + bulk-mode branching) |
| `handleOpenFolderTrashView` | 10 | Drill into folder trash contents |
| `handleCloseFolderTrashView` | 8 | Go back up folder trail |

## Input Contract
The hook receives the return values from `useBinData` plus `navigate` and `getPreviewSafePath`:
```ts
function useBinActions(binData: UseBinDataReturn, navigate: NavigateFunction, getPreviewSafePath: (path: string) => string): UseBinActionsReturn
```

## Checklist
- [ ] Create `src/hooks/useBinActions.ts` with file-path comment
- [ ] Move all action handlers into the hook
- [ ] Import and call `useBinActions(binData, navigate, getPreviewSafePath)` from BinView
- [ ] Verify BinView still compiles: `npx tsc --noEmit`
- [ ] Verify lint: `npm run lint`
- [ ] Verify tests: `npm run test`
- [ ] Commit: `refactor(home): extract useBinActions hook from BinView`
