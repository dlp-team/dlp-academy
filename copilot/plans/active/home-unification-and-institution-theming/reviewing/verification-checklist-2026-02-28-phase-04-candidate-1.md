# Verification Checklist — 2026-02-28 — Phase 04 Candidate 1

## Scope
- [x] Institution theme read path implemented from `institutions/{institutionId}`.
- [x] Fallback chain implemented: institution overrides -> default `HOME_THEME_TOKENS`.
- [x] Token consumer wiring updated for Home component tree.

## Changed runtime files
- [x] `src/utils/themeTokens.js`
- [x] `src/pages/Home/hooks/useInstitutionHomeThemeTokens.js`
- [x] `src/pages/Home/Home.jsx`
- [x] `src/pages/Home/components/HomeContent.jsx`
- [x] `src/pages/Home/components/SharedView.jsx`
- [x] `src/pages/Home/components/HomeEmptyState.jsx`
- [x] `src/pages/Home/components/HomeShareConfirmModals.jsx`
- [x] `src/pages/Home/components/HomeModals.jsx`
- [x] `src/pages/Home/components/HomeDeleteConfirmModal.jsx`

## Lossless checks
- [x] Existing class values preserved via defaults.
- [x] No user-facing copy changes.
- [x] No handler or permission branch changes.
- [x] No new UI flow introduced.

## Diagnostics
- [x] `get_errors` executed on all touched runtime files.
- [x] No diagnostics errors found.

## Manual smoke checks (pending)
- [ ] Home shared/manual views render as before with no institution theme doc.
- [ ] Home modals (share/unshare/delete) render and close/confirm as before.
- [ ] If institution doc has token overrides, Home applies overrides without runtime errors.

## Candidate status
- Automated checks: PASS
- Manual smoke: PENDING_USER_SMOKE
