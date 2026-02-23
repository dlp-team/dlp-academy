# Phase 04: Shortcut-aware DnD & Content Resolution (Completed)
Status: COMPLETED

## Why this phase existed
The shortcut model required runtime behavior that keeps source ownership immutable while allowing recipient-local organization. Without this phase, drag/drop could mutate source entities incorrectly and home selectors could render duplicates or broken entries.

## Scope
- Make drag/drop shortcut-aware in Home flows.
- Merge direct entities and shortcut-resolved entities into single folder views.
- Handle orphaned shortcuts (deleted/inaccessible targets) safely in UI.
- Preserve owner/editable source move behavior while routing shortcut moves to shortcut docs.

## What was implemented

### 1) Shortcut-aware drag/drop execution
- DnD payload carries `subjectShortcutId` where applicable.
- Folder/root drop handlers prioritize `moveShortcut(shortcutId, parentId)` when a dragged item is a shortcut.
- Non-owner direct source mutation is blocked when no shortcut context exists.
- Existing owner/editable move paths remain intact.

### 2) Data resolution + merged selectors
- `useShortcuts` resolves targets for each shortcut and normalizes output with metadata:
  - `isShortcut`, `shortcutId`, `targetId`, `targetType`, `shortcutParentId`.
- `useHomeState` merges direct folders/subjects with resolved shortcuts.
- Deduplication uses deterministic keys by target identity to avoid double rendering.
- Non-owner views prioritize shortcut representation when both direct and shortcut paths exist.

### 3) Orphan shortcut handling
- Resolver returns orphan objects when target is missing (`deleted`) or inaccessible (`no access`).
- Home UI renders orphan cards via `OrphanedShortcutCard`.
- Orphan cards expose cleanup action by deleting the shortcut document.

### 4) UI integrity and behavior compatibility
- Grid and list renderers support mixed items without requiring view-level source/shortcut branching.
- Existing menu actions keep shortcut-specific delete behavior (`delete shortcut from my view`).
- Subject card/list drag start includes shortcut metadata consistently.

## Files / systems affected (phase-level)
- `src/hooks/useShortcuts.js`
- `src/pages/Home/hooks/useHomeState.js`
- `src/pages/Home/hooks/useHomePageHandlers.js`
- `src/pages/Home/hooks/useHomeLogic.js`
- `src/pages/Home/components/HomeContent.jsx`
- `src/components/modules/SubjectCard/SubjectCard.jsx`
- `src/components/modules/ListViewItem.jsx`
- `src/utils/permissionUtils.js`

## Architectural notes
- Shortcut creation is share-driven (not drag-driven) per product decision.
- DnD in Phase 04 focuses on moving existing shortcuts and preserving source ownership boundaries.

## Risks and follow-ups
- Phase 07 must finish least-privilege rule hardening for final production policy.
- Phase 06 migration should backfill missing metadata (`institutionId`, shortcut visual fields) to reduce edge behavior.
- Large datasets may require optimization for target resolution fan-out.

## Definition of done achieved
- No source parent mutation for recipient shortcut moves.
- Merged rendering works in grid/list with shortcut metadata.
- Orphan scenarios degrade safely and are user-removable.
