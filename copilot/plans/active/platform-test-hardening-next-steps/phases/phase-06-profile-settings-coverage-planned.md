# Phase 06 — Profile and Settings Coverage (IN_PROGRESS)

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

## Execution Notes

- Added Phase 06 E2E suite:
  - `tests/e2e/profile-settings.spec.js`
  - Validates:
    - Profile route user surface render (`Cerrar Sesión`, `Plan Gratuito`).
    - Settings route render (`Configuración`, `Apariencia`).
    - Theme toggle `Oscuro` => `.dark` class set.
    - Theme toggle `Claro` => `.dark` class removed.
    - Language selector update and saved state signal.
    - Profile edit modal open/field interaction/close flow.
    - Notification toggle interaction path.
    - Organization `rememberSort` + `viewMode` interaction path.

- Added Phase 06 hook unit baselines:
  - `tests/unit/hooks/useProfile.test.js`
    - Profile + owned-subject load path.
    - Profile update (`updateDoc`) and local state merge.
    - Logout (`signOut`) path.
  - `tests/unit/hooks/useSettingsPageState.test.js`
    - Snapshot load + `applyThemeToDom` path.
    - Theme update optimistic state + Firestore persistence path.
    - Nested notifications update + error-state path.

## Validation Evidence

- `npm run test:unit -- tests/unit/hooks/useProfile.test.js tests/unit/hooks/useSettingsPageState.test.js` → ✅ `2 files`, `6 tests` passed.
- `npm run test:e2e -- tests/e2e/profile-settings.spec.js --reporter=list` → ✅ `1 passed`.
- `npm run test:e2e -- tests/e2e/auth.spec.js tests/e2e/user-journey.spec.js tests/e2e/home-sharing-roles.spec.js tests/e2e/subject-topic-content.spec.js tests/e2e/quiz-lifecycle.spec.js tests/e2e/profile-settings.spec.js --reporter=list` → ✅ `11 passed`.
