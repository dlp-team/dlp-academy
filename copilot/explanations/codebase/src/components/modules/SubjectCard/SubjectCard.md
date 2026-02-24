# SubjectCard.jsx

## Purpose
- **Source file:** `src/components/modules/SubjectCard/SubjectCard.jsx`
- **Last documented:** 2026-02-24
- **Role:** Display component for a single subject as a draggable card.

## High-Level Architecture

This component follows a **composition pattern** with **hook-based logic extraction**:
1. **Business Logic:** `useSubjectCardLogic` hook manages state and event handlers
2. **Drag Feedback:** `useGhostDrag` hook manages opacity/scale transform during drag
3. **Presentation:** `SubjectCardFront` child component handles layout and styling
4. **Visual States:** Normal → Hover (scale) → Dragging (opacity) → Active (overlay)

## Drag Lifecycle

### `handleLocalDragStart(e)` - Encode Drag Data
Extracts subject metadata for drop validation:
```javascript
const subjectParentId = subject.shortcutParentId ?? subject.folderId ?? null;
// Uses shortcut parent if subject is a shortcut, falls back to folder ID
```

Creates drag payload:
```javascript
{
  id: subject.id,
  type: 'subject',
  parentId: subjectParentId,
  shortcutId: subject.shortcutId
}
```

**Why:** Drop target (Folder) needs to know where subject currently lives for reordering validation

### Visual States
| State | Visual | Code |
|-------|--------|------|
| Normal | Natural | Opacity 100%, scale 100% |
| Hover | About to drag | scale 105% |
| Dragging | Mid-drag | Opacity 50%, scale 95% |

Applied via `useGhostDrag` hook's transform classes

## Child Delegation

Props delegated to `SubjectCardFront`:
- `subject`, `isMenuOpen`, `onMenuToggle`, `onSelect`
- Logic stays in SubjectCard (sibling coordination)
- Presentation delegated (layout/styling in child)

## Integration

Typical usage in grid:
```javascript
subjects.map(subject => (
  <SubjectCard
    key={subject.id}
    subject={subject}
    onSelect={() => navigate(`/subject/${subject.id}`)}
  />
))
```
- Exposes behavior through the module exports consumed by pages and sibling shared modules.

## Functions Explained
### SubjectCard
- **Type:** const arrow
- **Parameters:** `props`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### handleLocalDragStart
- **Type:** const arrow
- **Parameters:** `e`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

## Function Relations
- **External calls used by this file:**
  - `useSubjectCardLogic()` from `./useSubjectCardLogic` is called 1 time(s).
  - `useGhostDrag()` from `../../../hooks/useGhostDrag` is called 1 time(s).
- Internal function-to-function calls are minimal or implicit through JSX/event handlers.

## Imports and Dependencies
- `react`: `React`
- `./useSubjectCardLogic`: `useSubjectCardLogic`
- `./SubjectCardFront`: `SubjectCardFront`
- `../../../hooks/useGhostDrag`: `useGhostDrag`

## Example
```jsx
import SubjectCard from '../components/modules/SubjectCard/SubjectCard';

function ExampleScreen() {
  return <SubjectCard />;
}
```

## Maintenance Notes
- Keep this explanation updated when adding, renaming, or deleting functions in the source file.
- If imported dependencies change, update the relation mapping and the example snippet accordingly.
