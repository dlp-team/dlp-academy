<!-- copilot/plans/active/original-plan-autopilot-2026-04-07/phases/phase-05-scrollbar-theme-overlay.md -->
# Phase 05 - Scrollbar Theme and Overlay Behavior

## Status
- finished

## Objectives
- Make global scrollbar colors theme-aware (light/dark/system).
- Prevent layout shift on scrollbar appear/disappear while preserving centered layout.

## Validation
- get_errors on global style files.
- Manual verification on long-content pages in light/dark/system modes.

## Outcome (In Review)
- Scrollbar colors now derive from theme-aware CSS variables in both Home-scoped and global scrollbar selectors.
- Global scrollbar mode now uses deterministic stable-gutter handling to avoid layout shift when scrollbar state changes.
- Updated stable-mode unit coverage for class lifecycle behavior in `CustomScrollbar`.
- Commit/push gate completed on branch `feature/hector/original-plan-execution-2026-0407`.
