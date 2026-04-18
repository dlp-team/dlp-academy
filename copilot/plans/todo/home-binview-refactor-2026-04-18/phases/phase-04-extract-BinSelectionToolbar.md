<!-- copilot/plans/todo/home-binview-refactor-2026-04-18/phases/phase-04-extract-BinSelectionToolbar.md -->
# Phase 04: Extract `BinSelectionToolbar` Component

## Status: `todo`

## Objective
Extract the bulk selection toolbar render block from BinView.tsx into `src/pages/Home/components/bin/BinSelectionToolbar.tsx`.

## Scope
Lines ~780-870 in current BinView.tsx containing:
- Selection mode toggle button
- Selected count badge
- "Seleccionar todo" / "Quitar todo" button
- "Limpiar" button
- "Restaurar selección" button
- "Eliminar selección" button
- Safety mode warning text

## Props Contract (draft)
```tsx
interface BinSelectionToolbarProps {
  selectionMode: boolean;
  selectedBulkCount: number;
  visibleCount: number;
  bulkActionLoading: boolean;
  onToggleSelectionMode: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkRestore: () => void;
  onBulkDelete: () => void;
}
```

## Checklist
- [ ] Create `src/pages/Home/components/bin/BinSelectionToolbar.tsx` with file-path comment
- [ ] Move selection toolbar JSX
- [ ] Replace inline block in BinView with `<BinSelectionToolbar ... />`
- [ ] Verify BinView still compiles: `npx tsc --noEmit`
- [ ] Verify lint: `npm run lint`
- [ ] Verify tests: `npm run test`
- [ ] Commit: `refactor(home): extract BinSelectionToolbar component from BinView`
