# Platform Test Hardening — Strategy Roadmap

## Mission

Establish complete platform-level automated coverage so regressions across any major page, journey, or critical hook are detected before deployment.

## Guiding Principles

- Validate foundations first, then expand by module slice.
- Cover real user journeys end-to-end for every major page family.
- Prioritize high-risk logic hooks and permission boundaries.
- Keep tests deterministic and environment-aware.
- Use CI as an enforcement layer, not as first discovery of breakages.

## Phase Status

- Phase 01 — Smoke Test Baseline: **COMPLETED**
- Phase 02 — Auth and Onboarding Coverage Foundation: **IN_PROGRESS (ONBOARDING DEFERRED)**
- Phase 03 — Home and Shared Organization Coverage: **IN_PROGRESS**
- Phase 04 — Subject, Topic, and Content Navigation Coverage: **PLANNED**
- Phase 05 — Quiz Engine and Results Coverage: **PLANNED**
- Phase 06 — Profile and Settings Coverage: **PLANNED**
- Phase 07 — Admin Surfaces and Permissions Hardening: **PLANNED**
- Phase 08 — Full Automation in CI: **PLANNED**
- Phase 09 — Review Gate and Closure Evidence: **PLANNED**

## Immediate Next Actions

1. Add remaining Phase 03 unit coverage for uncovered tree-move/sharing branches in Home handlers where callback branches are still untested.
2. Provide role fixtures for Phase 03 E2E sharing matrix (`E2E_OWNER_*`, `E2E_EDITOR_*`, `E2E_VIEWER_*`, `E2E_SHARED_FOLDER_ID`) and re-run role journeys.
3. Resume Phase 02 onboarding closure later once `E2E_ONBOARDING_EMAIL` and `E2E_ONBOARDING_PASSWORD` are available.

## Coverage Matrix (Target)

### E2E Journeys (Playwright)

- Auth: login, register, onboarding wizard.
- Home: folder creation, subject creation, folder tree navigation, shared view behavior.
- Subject/Topic/Content: open subject, render topic grid, open resources/study guides.
- Quiz engine: start quiz, submit answers, verify results views.
- Profile/Settings: view statistics, update profile details, switch theme modes.
- Admin surfaces: institution admin customization/users, teacher/admin dashboard guard rails.

### Unit/Logic Coverage (Vitest)

- Core hooks in `src/hooks`: `useFolders.js`, `useSubjects.js`, `useShortcuts.js`, `useUserPreferences.js`, `useInstitutionBranding.js`.
- Home hooks in `src/pages/Home/hooks`: `useHomeLogic.js`, `useHomeHandlers.js`, `useHomePageHandlers.js`, `useHomeContentDnd.js`, `useHomeState.js`.
- Module hooks in `src/pages/**/hooks`: `useQuizzesLogic.js`, `useSubjectManager.js`, `useProfile.js`, `useTopicLogic.js`, `useSettingsPageState.js`, `useLogin.js`, `useRegister.js`.
- Permission and role utils in `src/utils/permissionUtils.js` and related access helpers.
