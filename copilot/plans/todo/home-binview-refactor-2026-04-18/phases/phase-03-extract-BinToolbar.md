<!-- copilot/plans/todo/home-binview-refactor-2026-04-18/phases/phase-03-extract-BinToolbar.md -->
# Phase 03: Extract `BinToolbar` Component

## Status: `todo`

## Objective
Extract the toolbar render section from BinView.tsx (sort selector, breadcrumb, empty-bin button, folder back-button) into `src/pages/Home/components/bin/BinToolbar.tsx`.

## Scope
Lines ~700-780 in current BinView.tsx containing:
- Folder back button with `handleCloseFolderTrashView`
- Title with item count and folder path label
- Sort description text
- Sort select dropdown (`BIN_SORT_OPTIONS`)
- "Vaciar papelera" button

## Props Contract (draft)
```tsx
interface BinToolbarProps {
  activeFolderBinId: string | null;
  activeFolderPathLabel: string;
  folderBackButtonLabel: string;
  visibleCount: number;
  sortMode: string;
  onSortChange: (mode: string) => void;
  onEmptyBin: () => void;
  onCloseFolderView: () => void;
}
```

## Checklist
- [ ] Create `src/pages/Home/components/bin/BinToolbar.tsx` with file-path comment
- [ ] Move toolbar JSX and related constants (`BIN_SORT_OPTIONS`, `BIN_SORT_DESCRIPTIONS`)
- [ ] Replace inline toolbar in BinView with `<BinToolbar ... />`
- [ ] Verify BinView still compiles: `npx tsc --noEmit`
- [ ] Verify lint: `npm run lint`
- [ ] Verify tests: `npm run test`
- [ ] Commit: `refactor(home): extract BinToolbar component from BinView`
