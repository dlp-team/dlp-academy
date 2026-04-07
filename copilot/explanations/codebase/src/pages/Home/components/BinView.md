# BinView.tsx

## Overview
- **Source file:** `src/pages/Home/components/BinView.tsx`
- **Last documented:** 2026-04-05
- **Role:** Renders trash contents (paper bin) with restore/permanent-delete actions and content preview.

## Responsibilities
- Loads trashed subjects and removes expired entries automatically.
- Supports both `grid` and `list` layouts using the same contracts as Home tabs.
- Applies `cardScale` via responsive grid min-width and list item scale.
- Shows selection side panel with restore/delete and preview actions.
- Displays urgency countdown and sorts cards by time remaining.

## Exports
- `default BinView`

## Main Dependencies
- `react`
- `lucide-react`
- `firebase/firestore`
- `../../../hooks/useSubjects`
- `../../../components/modules/SubjectCard/SubjectCard`
- `../../../components/modules/ListViewItem`

## Changelog
- **2026-04-07:** Phase 02 bin visual-parity pass:
	- list inline selected-item panel now uses grid-aligned reveal styling (`fade + slide + zoom`) and elevated shell treatment,
	- list inline action buttons now mirror grid-panel visual semantics (contextual neutral action + urgency-themed restore + soft-danger delete),
	- preserved selection contracts and existing action labels.
- **2026-04-05:** Phase 02 list-interaction parity updates:
	- list-mode selected-item action area now renders inline directly under the selected item,
	- removed bottom-of-list selected-item aside in list mode,
	- preserved selection mode and bulk-action behavior while adding smooth inline transition classes.
- **2026-04-04:** Phase 08 selection parity and bin-visual consistency updates:
	- urgency sort labels renamed to `Urgencia: Ascendente` and `Urgencia: Descendente`,
	- list-mode selected items now reuse shared selection ring visuals,
	- unselected items dim with brightness/saturation classes (no opacity reduction) when any bin item is selected.
- **2026-04-03:** Added shortcut-bin integration to the bin surface:
	- loads trashed shortcut items via `useShortcuts.getTrashedShortcuts`,
	- supports restore and permanent delete for `shortcut-subject` and `shortcut-folder`,
	- keeps folder drilldown behavior unchanged (shortcut items remain top-level bin entries),
	- routes overlay/list actions by typed item behavior without changing subject/folder flows.
- **2026-04-02:** Bin student-mode hook wiring now resolves via `getActiveRole(user)` so read-only behavior follows switched role context.
- **2026-04-02:** Completed Phase 06 UX reliability updates:
	- added bin sort selector (`urgency asc/desc`, `name A-Z/Z-A`),
	- added bin-only selection mode with multi-select restore/permanent-delete actions,
	- added bulk-delete confirmation flow for selected bin items,
	- preserved single-item detail overlay behavior outside selection mode.
- **2026-04-02:** Reintroduced retention-window enforcement with controlled auto-purge during load:
	- expired top-level trashed folders are permanently removed automatically,
	- expired trashed subjects outside expired folder roots are permanently removed automatically,
	- purge runs once per load cycle with recursion guard to prevent repeated delete loops.
- **2026-04-02:** Extended folder drilldown to full nested navigation inside bin:
	- keeps a breadcrumb-like folder trail for multi-level navigation,
	- shows immediate subfolders plus immediate subjects for the active trashed folder level,
	- allows opening nested trashed subfolders from the same selection overlay/panel actions,
	- preserves top-level bin behavior for root folder containers while preventing duplicate nested entries.
- **2026-04-02:** Extended bin scope to include top-level trashed folders alongside subjects:
	- loads folder trash data via `useFolders` (`getTrashedFolders`, `restoreFolder`, `permanentlyDeleteFolder`),
	- hides subjects already nested under trashed folders from top-level bin list,
	- unifies selection, restore, and permanent-delete handling with typed item keys (`subject` vs `folder`),
	- updates confirm/selection UI text and behavior to support folder subtree operations,
	- adds folder-entry drilldown so a trashed folder can be opened from the bin and nested subject items can be restored/deleted individually.
- **2026-03-13:** Stabilized initial bin loading by removing load-effect dependency churn and stopping automatic expired-item deletion during read path; this prevents repeated loading cycles and noisy Firestore permission errors on enter.
- **2026-03-06:** Rebuilt bin rendering to align with Home structure: fixed `grid/list` behavior, fixed `cardScale`, stabilized click-to-select side panel, and disabled hover-shift behavior in SubjectCard for this view (`filterOverlayOpen={true}`).
- **2026-03-06:** Improved desktop UX with side panel anchored to selected card (dynamic left/right placement), extracted reusable bin date/urgency helpers to `binViewUtils.js`, and added E2E + unit tests for bin behavior.
