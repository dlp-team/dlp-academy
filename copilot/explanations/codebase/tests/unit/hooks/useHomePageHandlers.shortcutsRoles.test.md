// copilot/explanations/codebase/tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.md

## Changelog
### 2026-04-02: Shortcut move request callable submission coverage
- Added integration assertion for `shortcut-move-request` confirmation callback in `useHomePageHandlers`.
- New test validates that confirmation:
  - invokes `createShortcutMoveRequest` with expected payload,
  - emits success feedback through `onHomeFeedback`.

### 2026-03-09: Phase 02 closure branch expansion
- Expanded drag/drop shortcut-role coverage for Home handlers.
- Added edge-case assertions for:
  - orphan source-folder move handling,
  - shortcut move fallback-to-root when tree source is unavailable,
  - breadcrumb drop parity to root behavior,
  - shared vs non-shared branch gating consistency.
- Confirms cross-view movement rules remain lossless while preserving owner/editor restrictions.

## Overview
This suite validates `useHomePageHandlers` drag/drop and shortcut movement behavior under mixed ownership, sharing, and tree-state conditions.

## Notes
- Focuses on branch-level parity between shared-tree and non-shared navigation paths.
- Keeps mutation assertions narrow to avoid masking permission regressions.
