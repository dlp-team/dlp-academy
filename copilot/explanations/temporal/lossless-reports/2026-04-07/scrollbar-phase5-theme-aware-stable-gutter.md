<!-- copilot/explanations/temporal/lossless-reports/2026-04-07/scrollbar-phase5-theme-aware-stable-gutter.md -->
# Lossless Report - Scrollbar Phase 05

## Requested Scope
1. Make global scrollbar colors theme-aware for light/dark/system modes.
2. Prevent layout shift when scrollbar visibility changes while preserving centered layout.

## Preserved Behaviors
- Existing Home and global custom scrollbar selectors remain in place.
- Existing `CustomScrollbar` mount/unmount class lifecycle remains active.
- Existing app routing and page shells are unaffected.

## Touched Files
- src/components/ui/CustomScrollbar.tsx
- src/index.css
- tests/unit/components/CustomScrollbar.test.jsx

## Per-File Verification
- src/components/ui/CustomScrollbar.tsx
  - Stabilized runtime mode to `custom-scrollbar-stable` to enforce deterministic gutter behavior.
- src/index.css
  - Added theme-aware scrollbar CSS variables driven by primary/secondary tokens.
  - Updated global and home scrollbar thumb gradients to use variables.
  - Enforced `scrollbar-gutter: stable both-edges` for active/stable/overlay class paths to avoid layout jump.
- tests/unit/components/CustomScrollbar.test.jsx
  - Updated assertions for stable-only class behavior and unmount cleanup.

## Validation Summary
- get_errors: clean for touched files.
- Targeted tests passed:
  - tests/unit/components/CustomScrollbar.test.jsx

## Risk Notes
- `stable both-edges` reserves gutter space deterministically; this avoids right-edge reflow at the cost of balanced side reservation.
- Theme variables are shared across light/dark/system because system mode resolves through root dark class.
