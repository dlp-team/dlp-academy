<!-- copilot/plans/todo/home-binview-refactor-2026-04-18/phases/phase-01-extract-useBinData-hook.md -->
# Phase 01: Extract `useBinData` Hook

## Status: `todo`

## Objective
Extract all state declarations, data fetching, memoized derived lists, and auto-retention purge logic from BinView.tsx into `src/hooks/useBinData.ts`.

## Scope

### State to extract (~20 useState hooks)
- `trashedItems`, `allTrashedSubjects`, `allTrashedFolders`
- `loading`, `actionLoading`, `errorMessage`
- `deleteConfirm`, `emptyConfirmOpen`
- `selectedItemId`, `selectedItemType`
- `folderBinTrail`, `sortMode`
- `selectionMode`, `bulkSelection`, `bulkDeleteConfirmOpen`, `bulkActionLoading`

### useMemo computations to extract
- `activeFolderBin`, `activeFolderBinId`, `activeFolderRootId`
- `topLevelTrashedSubjects`, `topLevelTrashedFolders`
- `sortedTopLevelTrashedItems`
- `nestedFolderItems`, `nestedFolderSubjectItems`
- `activeFolderBinItems`, `visibleTrashedItems`
- `selectedItem`
- `selectedBulkEntries`, `selectedBulkCount`, `selectedBulkKeys`

### Data fetching logic
- `loadTrashedItems()` with auto-retention purge
- `useEffect` for initial data load
- `useEffect` for selection/visibility sync
- `useEffect` for selection mode cleanup on folder change

### Hook source data
- `useSubjects(user)` — `getTrashedSubjects`, `restoreSubject`, `permanentlyDeleteSubject`
- `useFolders(user)` — `getTrashedFolders`, `restoreFolder`, `permanentlyDeleteFolder`
- `useShortcuts(user)` — `getTrashedShortcuts`, `restoreShortcut`, `permanentlyDeleteShortcut`

## Return Contract (draft)
```ts
interface UseBinDataReturn {
  // State
  loading: boolean;
  actionLoading: string | null;
  errorMessage: string | null;
  deleteConfirm: { id: string; itemType: string } | null;
  emptyConfirmOpen: boolean;
  selectedItemId: string | null;
  selectedItemType: string | null;
  folderBinTrail: Array<{ id: string; name: string }>;
  sortMode: string;
  selectionMode: boolean;
  bulkSelection: Record<string, { id: string; itemType: string }>;
  bulkDeleteConfirmOpen: boolean;
  bulkActionLoading: boolean;

  // Derived
  activeFolderBinId: string | null;
  visibleTrashedItems: any[];
  selectedItem: any | null;
  topLevelTrashedSubjects: any[];
  topLevelTrashedFolders: any[];
  nestedFolderItems: any[];
  nestedFolderSubjectItems: any[];
  selectedBulkEntries: any[];
  selectedBulkCount: number;
  selectedBulkKeys: Set<string>;
  activeFolderPathLabel: string;
  folderBackButtonLabel: string;
  isStudent: boolean;

  // Setters
  setActionLoading: React.Dispatch<any>;
  setErrorMessage: React.Dispatch<any>;
  setDeleteConfirm: React.Dispatch<any>;
  setEmptyConfirmOpen: React.Dispatch<any>;
  setSelectedItemId: React.Dispatch<any>;
  setSelectedItemType: React.Dispatch<any>;
  setFolderBinTrail: React.Dispatch<any>;
  setSortMode: React.Dispatch<any>;
  setSelectionMode: React.Dispatch<any>;
  setBulkSelection: React.Dispatch<any>;
  setBulkDeleteConfirmOpen: React.Dispatch<any>;
  setBulkActionLoading: React.Dispatch<any>;

  // Actions (data-layer)
  loadTrashedItems: (options?: any) => Promise<void>;
  buildActionKey: (itemId: string, itemType: string) => string;

  // Hook pass-throughs for actions hook
  restoreSubject: (id: string) => Promise<void>;
  restoreFolder: (id: string) => Promise<void>;
  restoreShortcut: (id: string) => Promise<void>;
  permanentlyDeleteSubject: (id: string) => Promise<void>;
  permanentlyDeleteFolder: (id: string) => Promise<void>;
  permanentlyDeleteShortcut: (id: string) => Promise<void>;
}
```

## Checklist
- [ ] Create `src/hooks/useBinData.ts` with file-path comment
- [ ] Move all state, memos, effects, and fetching logic
- [ ] Import and call `useBinData(user)` from BinView
- [ ] Verify BinView still compiles: `npx tsc --noEmit`
- [ ] Verify lint: `npm run lint`
- [ ] Verify tests: `npm run test`
- [ ] Commit: `refactor(home): extract useBinData hook from BinView`
