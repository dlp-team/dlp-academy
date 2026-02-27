# Strategy Roadmap

## Phase 01 — Tree modal shortcut-safe drop routing (IN_PROGRESS)
- Route Tree modal drops through shared Home handler logic.
- Include shortcut IDs in Tree modal drag payloads.
- Ensure breadcrumb/list/tree all use shortcut-first movement.

## Phase 02 — Tree modal ghost drag parity (PLANNED)
- Add custom ghost drag (`useGhostDrag`) to Tree modal rows.
- Keep visual behavior consistent with list mode.

## Phase 03 — DnD centralization baseline (PLANNED)
- Extract shared parse/build helpers for drag payloads.
- Reduce duplicated parsing logic in list and tree flows.

## Immediate Next Actions
1. Refactor `FolderTreeModal` to emit/consume shortcut-aware payloads.
2. Delegate Tree modal drop actions to `onDropWithOverlay` wrapper for source-vs-shortcut decisions.
3. Add ghost drag to `TreeItem`.
