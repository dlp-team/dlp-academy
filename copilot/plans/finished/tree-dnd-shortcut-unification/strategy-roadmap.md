# Strategy Roadmap

## Phase 01 — Tree modal shortcut-safe drop routing (COMPLETED)
- Route Tree modal drops through shared Home handler logic.
- Include shortcut IDs in Tree modal drag payloads.
- Ensure breadcrumb/list/tree all use shortcut-first movement.

## Phase 02 — Tree modal ghost drag parity (COMPLETED)
- Add custom ghost drag (`useGhostDrag`) to Tree modal rows.
- Keep visual behavior consistent with list mode.

## Phase 03 — DnD centralization baseline (IN_PROGRESS)
- Extract shared parse/build helpers for drag payloads.
- Reduce duplicated parsing logic in list and tree flows.

## Immediate Next Actions
1. Introduce shared drag payload helper utilities for list + tree.
2. Refactor list and tree to consume shared parse/build helpers.
3. Verify parity for drop-on-subject behavior across list + tree.
