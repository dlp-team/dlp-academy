<!-- copilot/plans/todo/home-binview-refactor-2026-04-18/phases/phase-05-extract-BinListItem.md -->
# Phase 05: Extract `BinListItem` Component

## Status: `todo`

## Objective
Extract the list-view item rendering (with urgency badges, trashed date, and inline action panel) from BinView.tsx into `src/pages/Home/components/bin/BinListItem.tsx`.

## Scope
Lines ~870-990 in current BinView.tsx (the list-mode `<div className="space-y-2">` block) containing:
- Per-item wrapper with dimming and pressed-state styling
- `ListViewItem` rendering with bin-specific props
- Urgency days-remaining badge
- Trashed date display
- Inline action panel (open folder, view content, restore, delete permanently)

## Props Contract (draft)
```tsx
interface BinListItemProps {
  item: any;
  user: any;
  cardScale: number;
  isSelected: boolean;
  hasSelection: boolean;
  selectionMode: boolean;
  actionLoading: string | null;
  nestedFolderItems: any[];
  nestedFolderSubjectItems: any[];
  topLevelTrashedFolders: any[];
  topLevelTrashedSubjects: any[];
  activeFolderBinId: string | null;
  onSelect: () => void;
  onRestore: (id: string, type: string) => void;
  onDeleteConfirm: (id: string, type: string) => void;
  onOpenFolder: (item: any) => void;
  onOpenReadOnlySubject: (id: string) => void;
}
```

## Checklist
- [ ] Create `src/pages/Home/components/bin/BinListItem.tsx` with file-path comment
- [ ] Move list-item JSX and local computed values (daysRemaining, urgency classes, etc.)
- [ ] Replace inline list-item block in BinView with `<BinListItem ... />`
- [ ] Verify BinView still compiles: `npx tsc --noEmit`
- [ ] Verify lint: `npm run lint`
- [ ] Verify tests: `npm run test`
- [ ] Commit: `refactor(home): extract BinListItem component from BinView`
