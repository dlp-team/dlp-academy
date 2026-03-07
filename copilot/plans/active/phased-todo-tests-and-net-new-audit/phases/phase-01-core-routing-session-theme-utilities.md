<!-- copilot/plans/active/phased-todo-tests-and-net-new-audit/phases/phase-01-core-routing-session-theme-utilities.md -->
# Phase 01 - Core Routing, Session, Theme, and Utility Foundations

## Routing and access control
- [x] `src/App.jsx` - unauthenticated user redirected from protected routes to `/login` (`e2e`)
- [x] `src/App.jsx` - authenticated user redirected away from `/login` and `/register` to `/home` (`e2e`)
- [x] `src/App.jsx` - role guard redirects unauthorized roles from `/admin-dashboard` and `/institution-admin-dashboard` to `/home` (`e2e`)
- [ ] `src/App.jsx` - auth listener fallback keeps session usable when `users/{uid}` read fails (`unit`)

## Idle session and preference state
- [x] `src/hooks/useIdleTimeout.js` - signs out and navigates to `/login` after inactivity timeout (`unit`)
- [x] `src/hooks/useIdleTimeout.js` - activity events reset timer and prevent premature logout (`unit`)
- [x] `src/hooks/useIdleTimeout.js` - removes listeners and timeout on unmount (`unit`)
- [x] `src/hooks/useUserPreferences.js` - loads defaults when no user or missing doc (`unit`)
- [x] `src/hooks/useUserPreferences.js` - debounced `updatePreference` produces single write after rapid updates (`unit`)
- [x] `src/hooks/useUserPreferences.js` - merges page-specific preferences without overwriting other pages (`unit`)
- [x] `src/hooks/useUserPreferences.js` - write failure handling keeps hook usable (`unit`)

## Branding and theme behavior
- [x] `src/hooks/useInstitutionBranding.js` - no `institutionId` returns defaults and applies default CSS vars (`unit`)
- [x] `src/hooks/useInstitutionBranding.js` - snapshot update applies branding tokens to `document.documentElement` (`unit`)
- [x] `src/hooks/useInstitutionBranding.js` - snapshot error path falls back to defaults (`unit`)
- [x] `src/utils/themeMode.js` - `resolveThemeMode('system')` respects `matchMedia` dark/light (`unit`)
- [x] `src/utils/themeMode.js` - `applyThemeToDom` toggles dark class and localStorage persistence (`unit`)
- [x] `src/utils/themeMode.js` - animated transition class add/remove timing (`unit`)

## Utility correctness
- [x] `src/utils/dragPayloadUtils.js` - write/read roundtrip preserves subject payload fields (`unit`)
- [x] `src/utils/dragPayloadUtils.js` - write/read roundtrip preserves folder payload fields (`unit`)
- [x] `src/utils/dragPayloadUtils.js` - malformed `treeItem` JSON safely returns `null` (`unit`)
- [x] `src/utils/dragPayloadUtils.js` - legacy fallback keys (`subjectId`/`folderId`) parse correctly (`unit`)
- [x] `src/utils/stringUtils.js` - accent/diacritic normalization and trimming/casing behavior (`unit`)
- [x] `src/utils/homeMergeUtils.js` - dedup merge precedence between source and shortcut lists (`unit`)
- [x] `src/utils/mergeUtils.js` - dedup with missing IDs/shortcut IDs remains stable (`unit`)
- [x] `src/utils/folderUtils.js` - cycle/corruption safety with `visited` guard (`unit`)
