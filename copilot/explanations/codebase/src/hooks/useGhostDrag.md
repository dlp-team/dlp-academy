# useGhostDrag.ts

## Purpose
- **Source file:** `src/hooks/useGhostDrag.ts`
- **Last documented:** 2026-04-11
- **Role:** Custom hook providing shared state and business logic.

## File Flow (High Level)
- Receives data/capabilities from imported modules and React ecosystem APIs.
- Defines 4 function(s) that implement the module behavior.
- Exposes behavior through the module exports consumed by pages and sibling shared modules.

## Functions Explained
### useGhostDrag
- **Type:** const arrow
- **Parameters:** `{ item`, `type`, `onDragStart`, `onDragEnd }`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### handleDragStartWithCustomImage
- **Type:** const arrow
- **Parameters:** `e`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### handleDrag
- **Type:** const arrow
- **Parameters:** `e`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### handleDragEndCustom
- **Type:** const arrow
- **Parameters:** `e`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

## Function Relations
- **External calls used by this file:**
  - `useState()` from `react` is called 1 time(s).
  - `useRef()` from `react` is called 3 time(s).
- Internal function-to-function calls are minimal or implicit through JSX/event handlers.

## Imports and Dependencies
- `react`: `useState`, `useRef`

## Example
```jsx
import { useGhostDrag } from '../hooks/useGhostDrag';

function ExampleComponent() {
  const state = useGhostDrag();
  return <pre>{JSON.stringify(state, null, 2)}</pre>;
}
```

## Maintenance Notes
- Keep this explanation updated when adding, renaming, or deleting functions in the source file.
- If imported dependencies change, update the relation mapping and the example snippet accordingly.

## Changelog
- 2026-04-11: Fixed TypeScript compatibility in multi-ghost path by storing drag scale dataset metadata as strings (`dataset.originalScale`, `dataset.scale`) and aligned file header path comment to `.ts`.
- 2026-04-10: Added multi-selection drag ghost mode with stacked cloned layers and a total-count badge while preserving previous single-card ghost behavior and breadcrumb ghost scaling compatibility.
- 2026-03-08: Added dedicated unit coverage in `tests/unit/hooks/useGhostDrag.test.js` validating:
  - ghost creation/removal lifecycle from `onDragStart` and `onDragEnd`
  - live position updates in `handleDrag` and no-op behavior for zeroed pointer events
  - callback continuity when the source node ref is missing (defensive branch)
- 2026-03-09: Expanded ghost drag edge-case coverage with 10 additional assertions validating:
  - hidden native drag image setup (`setDragImage` placeholder)
  - offset-derived `transformOrigin` and fixed ghost styling invariants
  - class cleanup on cloned nodes to avoid drag visual interference
  - independent horizontal/vertical zero-pointer guard paths
  - callback optionality and event payload integrity for start/end handlers
