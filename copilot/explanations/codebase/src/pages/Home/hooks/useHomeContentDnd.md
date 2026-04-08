## [2026-04-08] Selection-Mode Batch Drag/Drop Parity
### Behavior Updates
- Added selection-aware drop routing (`onDropSelectedItems`) to root and list drop handlers.
- When selection mode is active and the dragged card belongs to the selected batch, drops now execute the bulk move pipeline instead of single-item move handlers.
- Preserved legacy single-item drop behavior for unselected drags and non-selection contexts.

### Validation Additions
- Extended `tests/unit/hooks/useHomeContentDnd.test.js` with:
	- selected-subject list drop -> bulk move route,
	- selected-folder root drop -> bulk move route.

## [2026-03-06] Test Hardening: Additional DnD Branch Paths
### Context & Validation Additions
- Extended `tests/unit/hooks/useHomeContentDnd.test.js` with branch-level checks for:
	- root drop with empty payload (no-op),
	- fallback `handleMoveSubjectWithSource` path when no folder-drop handler is provided,
	- folder-shortcut drop onto subject-target parent resolution.

# useHomeContentDnd.js

## Overview
- **Source file:** `src/pages/Home/hooks/useHomeContentDnd.js`
- **Last documented:** 2026-02-24
- **Role:** Custom hook with stateful/business logic for this page area.

## Responsibilities
- Manages local UI state and interaction flow.
- Handles user events and triggers updates/actions.

## Exports
- `default useHomeContentDnd`

## Main Dependencies
- `react`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
