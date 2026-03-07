# Lossless Change Report - 2026-03-07

## Requested Scope
- Resolve remaining test errors.
- Remove onboarding flow from active runtime usage.
- Remove `country` from user registration flow if non-essential.
- Ensure tests reuse deterministic subject/topic identifiers to avoid creating excess data.

## Preserved Behaviors
- Teacher/student/admin registration role and institutional code validation flows remain active.
- Firestore rules tests remain runnable via emulator (`npm run test:rules`).
- Unit tests remain the default `npm run test` target.
- Existing onboarding source file remains in codebase (not mounted), avoiding destructive deletion.

## Files Touched
- `vitest.config.js`
- `vitest.rules.config.js` (new)
- `package.json`
- `src/pages/Home/Home.jsx`
- `src/pages/Auth/Register.jsx`
- `src/pages/Auth/hooks/useRegister.js`
- `src/hooks/useSubjects.js`
- `src/hooks/useFolders.js`
- `src/hooks/useShortcuts.js`
- `tests/unit/hooks/useRegister.test.js`
- `tests/e2e/subject-topic-content.spec.js`
- `tests/e2e/quiz-lifecycle.spec.js`
- `tests/e2e/auth-onboarding.spec.js`
- `copilot/explanations/codebase/src/pages/Auth/Register.md`
- `copilot/explanations/codebase/src/pages/Auth/hooks/useRegister.md`
- `copilot/explanations/codebase/src/pages/Home/Home.md`
- `copilot/explanations/codebase/src/hooks/useSubjects.md`
- `copilot/explanations/codebase/src/hooks/useFolders.md`
- `copilot/explanations/codebase/src/hooks/useShortcuts.md`

## Per-File Verification Notes
- `vitest.config.js`: default Vitest include now scopes to unit tests only; prevents emulator-dependent failures in `npm run test`.
- `vitest.rules.config.js`: dedicated rules config added for node environment and rules include path.
- `package.json`: `test:rules:unit` now uses dedicated rules Vitest config.
- `src/pages/Home/Home.jsx`: removed `OnboardingWizard` import and mount; no runtime onboarding modal.
- `src/pages/Auth/Register.jsx`: removed `country` field from visible registration form.
- `src/pages/Auth/hooks/useRegister.js`: removed `country` from form state and user write payload.
- `src/hooks/useSubjects.js`: `canReadHomeData` now checks `role` + `displayName`.
- `src/hooks/useFolders.js`: `canReadHomeData` now checks `role` + `displayName`.
- `src/hooks/useShortcuts.js`: `canReadHomeData` now checks `role` + `displayName`.
- `tests/unit/hooks/useRegister.test.js`: removed `country` interactions; assertions unchanged for core auth behavior.
- `tests/e2e/subject-topic-content.spec.js`: switched seed creation from random `.add()` to deterministic `.doc(id).set()` IDs.
- `tests/e2e/quiz-lifecycle.spec.js`: switched subject/topic/quiz seed creation to deterministic IDs.
- `tests/e2e/auth-onboarding.spec.js`: removed obsolete onboarding completion scenario; retained auth coverage.
- Explanation files: appended dated changelog entries aligned with source changes.

## Validation Summary
- `get_errors` on all touched source/test/config files: no errors.
- `npm run test`: passed (`24` files, `120` tests).
- `npm run test:rules`: passed (`1` file, `10` tests) through Firestore emulator.
- `functions` folder test command check: no `test` script exists, so no runnable suite there.

## Residual Risks
- Onboarding component still exists but is not mounted; if future routes mount it again, old behavior can reappear.
- E2E deterministic IDs are shared per owner; parallel E2E runs with the same owner could contend on same seeded docs.
