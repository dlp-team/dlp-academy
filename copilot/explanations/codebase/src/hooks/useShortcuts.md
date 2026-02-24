# useShortcuts.js

## Purpose
- **Source file:** `src/hooks/useShortcuts.js`
- **Last documented:** 2026-02-24
- **Role:** Custom hook providing shared state and business logic.

## File Flow (High Level)
- Receives data/capabilities from imported modules and React ecosystem APIs.
- Defines 7 function(s) that implement the module behavior.
- Exposes behavior through the module exports consumed by pages and sibling shared modules.

## Functions Explained
### useShortcuts
- **Type:** const arrow
- **Parameters:** `user`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### resolveShortcutTargets
- **Type:** const arrow
- **Parameters:** `shortcuts`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### createShortcut
- **Type:** const arrow
- **Parameters:** `targetId`, `targetType`, `parentId = null`, `institutionId = 'default'`, `visualOverrides = {}`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### deleteShortcut
- **Type:** const arrow
- **Parameters:** `shortcutId`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### moveShortcut
- **Type:** const arrow
- **Parameters:** `shortcutId`, `newParentId`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### updateShortcutAppearance
- **Type:** const arrow
- **Parameters:** `shortcutId`, `appearanceData = {}`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### deleteOrphanedShortcuts
- **Type:** const arrow
- **Parameters:** none
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

## Function Relations
- **External calls used by this file:**
  - `useState()` from `react` is called 3 time(s).
  - `useEffect()` from `react` is called 1 time(s).
  - `canView()` from `../utils/permissionUtils` is called 1 time(s).
- Internal function-to-function calls are minimal or implicit through JSX/event handlers.

## Imports and Dependencies
- `react`: `useState`, `useEffect`
- `../firebase/config`: `db`
- `../utils/permissionUtils`: `canView`

## Example
```jsx
import { useShortcuts } from '../hooks/useShortcuts';

function ExampleComponent() {
  const state = useShortcuts();
  return <pre>{JSON.stringify(state, null, 2)}</pre>;
}
```

## Maintenance Notes
- Keep this explanation updated when adding, renaming, or deleting functions in the source file.
- If imported dependencies change, update the relation mapping and the example snippet accordingly.
