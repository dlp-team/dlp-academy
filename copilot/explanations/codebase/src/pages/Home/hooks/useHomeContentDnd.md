<!-- copilot/explanations/codebase/src/pages/Home/hooks/useHomeContentDnd.md -->
# useHomeContentDnd.ts

## Overview
- **Source file:** `src/pages/Home/hooks/useHomeContentDnd.ts`
- **Last documented:** 2026-04-11
- **Role:** Home drag-and-drop routing hook for root/list drop zones, selection-aware bulk drops, and hover-state UI signals.

## Responsibilities
- Parses drag metadata across tree/list/native payload variants.
- Routes selection-mode drops through bulk handler when dragged item belongs to selected set.
- Preserves standard single-item drop handlers for non-selected drags and non-selection contexts.
- Manages root/promote hover booleans used by drop-zone UI feedback.

## Exports
- `default useHomeContentDnd`

## Main Dependencies
- `react` (`useState`)

## Changelog
### 2026-04-11
- Removed transient debug `console.log` statements from root/list drop paths to reduce production console noise without changing behavior.
- Extended parity coverage in `tests/unit/hooks/useHomeContentDnd.test.js` for:
	- selected subject root-drop routing through bulk move handler,
	- non-selected subject drop path preservation while selection mode is active.

### 2026-04-08
- Added selection-aware drop routing (`onDropSelectedItems`) to root and list drop handlers.
- Added tests for selected-subject list-drop and selected-folder root-drop bulk routing.

### 2026-03-06
- Added branch hardening tests for empty root payload no-op, fallback move-subject routing, and folder-shortcut nesting onto subject-parent targets.
