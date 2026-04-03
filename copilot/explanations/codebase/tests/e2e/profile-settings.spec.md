// copilot/explanations/codebase/tests/e2e/profile-settings.spec.md

## Changelog
### 2026-04-03: Notification persistence selector hardening
- Tightened notification toggle selection to the specific row labeled `Notificaciones por Email` instead of positional first-button lookup.
- Updated persistence wait step to require confirmed `Guardado` visibility before reload.
- Prevented intermittent false failures when save status was still transitioning.

### 2026-03-09: Phase 03 settings persistence expansion
- Added coverage for post-reload settings continuity in `/settings`.
- Validates persistence-oriented behavior for:
  - language selector continuity,
  - notification toggle state continuity,
  - theme controls remaining available after reload.

### 2026-04-01: Settings route resilience and toggle persistence hardening
- Heading assertion now tolerates locale-dependent labels (`Configuración` or `Settings`).
- Notification persistence flow now waits for post-click state transition before reload and re-selects controls after reload to avoid stale-locator flakiness.

## Overview
This E2E suite validates authenticated profile/settings user flows, including profile modal interactions and settings behavior under real route transitions.

## Notes
- Uses role-account login via `E2E_EMAIL` and `E2E_PASSWORD`.
- Includes conservative assertions to remain stable across environment-level Firestore permission differences.
