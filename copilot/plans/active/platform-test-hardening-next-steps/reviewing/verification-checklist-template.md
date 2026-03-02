# Verification Checklist (Template)

Use this checklist when the plan reaches `inReview/`.

- [ ] Unit tests pass in CI and locally.

## E2E Coverage Areas (Playwright)

- [ ] Auth: Login, Register, and auth error handling flows pass.
- [ ] Onboarding: Wizard progression/completion flow passes for new users.
- [ ] Home: Folder creation, subject creation, and folder navigation pass.
- [ ] Home Shared View: Shared scope/filter behavior and visibility pass.
- [ ] Subject/Topic: Subject open, Topic Grid render, and topic open flow pass.
- [ ] Content/ViewResource: Study guide/resource open flows pass.
- [ ] Quiz Engine: Quiz start, submit, and results rendering pass.
- [ ] Profile: Profile render and key stats visibility pass.
- [ ] Settings: Theme switch (light/dark/system) applies expected DOM class state.
- [ ] Admin dashboards: Institution admin + role-protected surfaces pass/redirect as expected.

## Unit/Hook Coverage Areas (Vitest)

- [ ] `src/hooks/useFolders.js` critical operations covered.
- [ ] `src/hooks/useSubjects.js` critical operations covered.
- [ ] `src/hooks/useShortcuts.js` critical operations covered.
- [ ] `src/hooks/useUserPreferences.js` persistence behavior covered.
- [ ] `src/pages/Home/hooks/useHomeLogic.js` covered.
- [ ] `src/pages/Home/hooks/useHomeHandlers.js` / `useHomePageHandlers.js` covered.
- [ ] `src/pages/Home/hooks/useHomeContentDnd.js` drag/drop transitions covered.
- [ ] `src/pages/Subject/hooks/useSubjectManager.js` covered.
- [ ] `src/pages/Topic/hooks/useTopicLogic.js` covered.
- [ ] `src/pages/Quizzes/hooks/useQuizzesLogic.js` covered.
- [ ] `src/pages/Profile/hooks/useProfile.js` covered.
- [ ] `src/pages/Settings/hooks/useSettingsPageState.js` covered.
- [ ] Permission utilities verify viewer/editor/owner constraints and negative paths.

## Automation and Governance

- [ ] CI workflow runs unit + E2E suites on push/PR.
- [ ] CI failure blocks merge/deploy path per branch policy.
- [ ] Any failures logged with fixes and re-test evidence.
