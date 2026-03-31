<!-- tests/missing-tests-net-new.md -->
# Missing Tests (Net New)

This checklist includes only gaps not already tracked in `tests/todo-tests.md`.

## Routing and Access Control
- [ ] `src/App.tsx` - unauthenticated user is redirected from protected routes to `/login` (`e2e`, High)
- [ ] `src/App.tsx` - authenticated user is redirected away from `/login` and `/register` to `/home` (`e2e`, High)
- [ ] `src/App.tsx` - unauthorized roles are redirected from `/admin-dashboard` and `/institution-admin-dashboard` to `/home` (`e2e`, High)
- [ ] `src/App.tsx` - auth listener fallback keeps session usable when `users/{uid}` snapshot fails (`unit`, Medium)

## Session and Preferences
- [ ] `src/hooks/useIdleTimeout.ts` - signs out and navigates to `/login` after inactivity timeout (`unit`, High)
- [ ] `src/hooks/useIdleTimeout.ts` - user activity resets timeout and prevents premature logout (`unit`, High)
- [ ] `src/hooks/useIdleTimeout.ts` - removes listeners and timeout on unmount (`unit`, Medium)
- [ ] `src/hooks/useUserPreferences.ts` - loads default preferences when user is missing or user doc does not exist (`unit`, Medium)
- [ ] `src/hooks/useUserPreferences.ts` - debounced update persists a single write for rapid preference changes (`unit`, Medium)
- [ ] `src/hooks/useUserPreferences.ts` - merges page preferences without overwriting other page keys (`unit`, Medium)
- [ ] `src/hooks/useUserPreferences.ts` - Firestore write failure preserves local optimistic state and does not crash (`unit`, Medium)

## Branding and Theme
- [ ] `src/hooks/useInstitutionBranding.ts` - no `institutionId` path resets branding to defaults and applies default CSS vars (`unit`, Medium)
- [ ] `src/hooks/useInstitutionBranding.ts` - snapshot updates apply CSS variables to `document.documentElement` (`unit`, Medium)
- [ ] `src/hooks/useInstitutionBranding.ts` - snapshot error fallback returns defaults (`unit`, Medium)
- [ ] `src/utils/themeMode.ts` - `resolveThemeMode('system')` respects `matchMedia` dark/light (`unit`, Low)
- [ ] `src/utils/themeMode.ts` - `applyThemeToDom` toggles `dark` and localStorage persistence correctly (`unit`, Low)
- [ ] `src/utils/themeMode.ts` - animated transition class is added and cleaned up within expected timing (`unit`, Low)

## Drag and Data Helpers
- [ ] `src/utils/dragPayloadUtils.js` - subject payload roundtrip write/read preserves fields (`unit`, Medium)
- [ ] `src/utils/dragPayloadUtils.js` - folder payload roundtrip write/read preserves fields (`unit`, Medium)
- [ ] `src/utils/dragPayloadUtils.js` - malformed JSON payload fails safely and returns `null` (`unit`, Medium)
- [ ] `src/utils/dragPayloadUtils.js` - legacy fallback keys (`subjectId`/`folderId`) parse correctly (`unit`, Medium)
- [ ] `src/utils/stringUtils.js` - accent/diacritic normalization and trim/case behavior (`unit`, Low)
- [ ] `src/utils/homeMergeUtils.js` - source/shortcut merge dedup precedence (`unit`, Low)
- [ ] `src/utils/mergeUtils.js` - dedup behavior with missing `id`/`shortcutId` remains stable (`unit`, Low)
- [ ] `src/utils/folderUtils.js` - cycle safety (`visited` guard) prevents infinite traversal on malformed trees (`unit`, Medium)

## Feature Flows Not in Current Backlog
- [ ] `src/pages/Settings/Settings.tsx` - theme/language/notification preferences persist after reload (`e2e`, Medium)
- [ ] `src/pages/Profile/modals/EditProfileModal.tsx` - save/cancel behavior and image preview lifecycle (`unit`, Low)
- [ ] `src/pages/Content/StudyGuideEditor.tsx` - edit/save lifecycle with error handling (`e2e`, Medium)
- [ ] `src/pages/ViewResource/ViewResource.tsx` - missing or invalid resource route renders controlled fallback (`e2e`, Medium)
- [ ] `src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx` - policy save flow enforces SudoModal confirmation before success state (`e2e`, High)
- [ ] `src/components/modals/SudoModal.tsx` - wrong password blocks confirmation and shows validation message (`unit`, High)
- [ ] `src/components/modals/SudoModal.tsx` - successful reauth calls `onConfirm` and closes modal (`unit`, High)

## Closed Since Last Audit (Removed From Missing List)
- Firestore rules expansion coverage now exists in `tests/rules/firestore.rules.test.js` for:
	- `institution_invites` CRUD boundaries,
	- role/institution boundaries for `folders/topics/documents/quizzes`,
	- missing/mismatched `institutionId` deny paths for non-admin writes.
- StudyGuide empty/partial fallback rendering is now covered in `tests/unit/pages/content/StudyGuide.fallback.test.jsx`.

---

**Legend**
- Priority: `High`, `Medium`, `Low`
- Type: `unit`, `e2e`, `rules/integration`
