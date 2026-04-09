// copilot/explanations/codebase/src/pages/Home/hooks/useHomeKeyboardShortcuts.md

## Changelog
### 2026-04-09: Copy/paste undo parity + deep subject content clone
- Added copy-flow undo registration for Ctrl+C/Ctrl+V:
	- subject copy registers `create-subject`,
	- folder copy registers `create-folder`.
- Added deep subject copy continuation when source has topics:
	- clones topic tree into the new subject,
	- clones topic-linked resources in `documents`, `resumen`, `quizzes`, `exams`, and `examns`.
- Added lazy Firebase DB loading inside paste flow so deep-copy logic only initializes when needed.

### 2026-04-08: Shared undo registration + toast lifecycle for keyboard flows
- Added `registerUndoAction(...)` API that stores normalized action payloads in keyboard undo stack and emits a 5-second undo toast.
- Added `undoToast`, `undoLatestActionFromToast`, and `clearUndoToast` outputs for shared page-level undo UI integration.
- Extended Ctrl+Z action handling to support `move-shortcut` payloads through `logic.moveShortcut(...)`.
- Removed creation-action undo registration from copy/paste clone paths so creation remains excluded from global undo policy.

### 2026-03-09: Dedicated edge-case unit coverage
- Added a dedicated unit suite for this hook in `tests/unit/hooks/useHomeKeyboardShortcuts.test.js`.
- Coverage focuses on cut/copy/paste/undo reliability edges:
	- Subject move writes `folderId`; folder move writes `parentId`.
	- Circular folder move blocks (self and descendant targets).
	- Undo restores moved entities and restores latest trashed subject fallback.
	- Visual state transitions (`isAnimating`, `isCutPending`) lifecycle verified.
	- Typing-target ignore path and shortcut-card copy/cut blocking verified.

### 2026-03-09: Visual feedback + deterministic cut move fixes
- Added card visual state output (`getCardVisualState`) to support Ctrl+C/X feedback: scale pulse on action and reduced opacity while cut is pending.
- Updated cut-paste move behavior to write the correct hierarchy fields directly:
	- Subjects update `folderId`.
	- Folders update `parentId` (with circular-move guard).
- Hardened Ctrl+Z bin fallback by iterating ordered trashed candidates and restoring the first valid one.

### 2026-03-09: Ctrl+Z fallback restore from bin
- Extended `onUndo` to restore the latest trashed subject when the in-memory undo stack is empty.
- Uses `logic.getTrashedSubjects()` + `logic.restoreSubject()` and keeps existing undo-stack behavior unchanged.

### 2026-03-09: Initial extraction and wire-up
- Added `useHomeKeyboardShortcuts` to centralize Home keyboard actions outside `Home.jsx`.
- Implements Ctrl+C/X/V/Z for focused subject/folder cards.
- Blocks copy/cut for shortcuts (ghost cards) and enforces edit permission.
- Ctrl+C duplicates card metadata only (new ID, no shared recipients).
- Ctrl+X + Ctrl+V moves cards using existing Home confirmation flows.

## Overview
`useHomeKeyboardShortcuts` owns keyboard clipboard state, undo stack, focused-card tracking, and inline feedback text for Home.

## Inputs
- `user`
- `logic` (Home logic object)

## Outputs
- `handleCardFocus(item, type)`
- `shortcutFeedback`
- `getCardVisualState(id, type)`
