# Phase 06 — Profile and Settings Coverage (PLANNED)

## Objective

Verify profile and settings surfaces so personal data and theme preferences remain reliable.

## Planned Changes / Actions

- Add Playwright journeys for:
  - Loading profile and statistics widgets.
  - Updating profile details (where editable).
  - Switching settings theme modes and verifying `.dark` class application.
- Add Vitest coverage for:
  - `src/pages/Profile/hooks/useProfile.js`
  - `src/pages/Profile/hooks/useUserStatistics.js`
  - `src/pages/Settings/hooks/useSettingsPageState.js`

## Risks

- Stats data can depend on historical entities and produce sparse-state edge cases.
- Theme mode tests can be brittle without explicit DOM/class assertions.

## Completion Criteria

- Profile/settings E2E tests pass across expected user states.
- Hook tests validate loading, update, and persistence behavior.
- Theme class toggling is covered and stable.
