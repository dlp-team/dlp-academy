# useFolderCardLogic.js

## Purpose
- **Source file:** `src/components/modules/FolderCard/useFolderCardLogic.js`
- **Last documented:** 2026-02-24
- **Role:** Feature module component composed by pages and higher-level views.

## File Flow (High Level)
- Receives data/capabilities from imported modules and React ecosystem APIs.
- Defines 7 function(s) that implement the module behavior.
- Exposes behavior through the module exports consumed by pages and sibling shared modules.

## Functions Explained
### useFolderCardLogic
- **Type:** const arrow
- **Parameters:** `{
    folder`, `allFolders`, `// <--- NEW PROP: We need the list of ALL folders to look up children
    cardScale`, `canDrop`, `draggable`, `onDragOver`, `onDrop`, `onDropFolder`, `onDropReorder`, `onDragStart`, `onDragEnd`, `position
}`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### traverse
- **Type:** const arrow
- **Parameters:** `folderId`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Referenced internally 1 time(s), indicating reuse/composition.

### handleDragOver
- **Type:** const arrow
- **Parameters:** `e`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### handleDragLeave
- **Type:** const arrow
- **Parameters:** `e`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### handleDrop
- **Type:** const arrow
- **Parameters:** `e`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### handleDragStart
- **Type:** const arrow
- **Parameters:** `e`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### handleDragEnd
- **Type:** const arrow
- **Parameters:** `e`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

## Function Relations
- **External calls used by this file:**
  - `useState()` from `react` is called 1 time(s).
  - `useMemo()` from `react` is called 1 time(s).
- **Internal function interactions:**
  - `traverse()` is reused inside this file (1 additional call(s)).

## Imports and Dependencies
- `react`: `useState`, `useMemo`

## Example
```js
// Import this module from: src/components/modules/FolderCard/useFolderCardLogic.js
// Use its exported functions/components where needed in shared flows.
```

## Maintenance Notes
- Keep this explanation updated when adding, renaming, or deleting functions in the source file.
- If imported dependencies change, update the relation mapping and the example snippet accordingly.
