# useSubjects.js

## Purpose
- **Source file:** `src/hooks/useSubjects.js`
- **Last documented:** 2026-02-24
- **Role:** Custom React hook that manages all subject CRUD operations and real-time synchronization with Firestore, including sharing, topic loading, and institution filtering.

## High-Level Architecture

This hook follows a **dual-listener pattern** with **automatic topic hydration**:
1. **Real-time listener** on owned subjects (where `ownerId === user.uid`)
2. **Lazy topic population**: For each subject, queries and loads its related topics from the `topics` collection
3. **Institution filtering**: Automatically filters subjects by current institution to prevent cross-institution leaks
4. **Fire-and-forget async operations**: Add, update, delete, share, and touch operations

## Functions Explained
### useSubjects
- **Type:** const arrow
- **Parameters:** `user`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### updateSubjectsState
- **Type:** const arrow
- **Parameters:** none
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Referenced internally 1 time(s), indicating reuse/composition.

### addSubject
- **Type:** const arrow
- **Parameters:** `payload`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### updateSubject
- **Type:** const arrow
- **Parameters:** `id`, `payload`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### deleteSubject
- **Type:** const arrow
- **Parameters:** `id`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### touchSubject
- **Type:** const arrow
- **Parameters:** `id`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### shareSubject
- **Type:** const arrow
- **Parameters:** `subjectId`, `email`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### unshareSubject
- **Type:** const arrow
- **Parameters:** `subjectId`, `email`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

## Function Relations
- **External calls used by this file:**
  - `useState()` from `react` is called 2 time(s).
  - `useEffect()` from `react` is called 1 time(s).
- **Internal function interactions:**
  - `updateSubjectsState()` is reused inside this file (1 additional call(s)).

## Imports and Dependencies
- `react`: `useState`, `useEffect`
- `../firebase/config`: `db`

## Example
```jsx
import { useSubjects } from '../hooks/useSubjects';

function ExampleComponent() {
  const state = useSubjects();
  return <pre>{JSON.stringify(state, null, 2)}</pre>;
}
```

## Maintenance Notes
- Keep this explanation updated when adding, renaming, or deleting functions in the source file.
- If imported dependencies change, update the relation mapping and the example snippet accordingly.
