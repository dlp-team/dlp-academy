<!-- copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/reviewing/review-log-2026-04-05.md -->
# Review Log - 2026-04-05

Use this file to document failed checks during inReview and their remediation.

## Entry Template
- Failed Check:
- Reproduction Steps:
- Root Cause:
- Fix Applied:
- Re-test Result:
- Status:

## Entries
- Failed Check: `npm run test` full suite (1 failure)
	- Reproduction Steps:
		- Run `npm run test` in repository root.
		- Observe failure in [tests/unit/pages/institution-admin/UserDetailView.studentCourseLinks.test.jsx](tests/unit/pages/institution-admin/UserDetailView.studentCourseLinks.test.jsx), case: `falls back to initials when profile photo fails to load`.
	- Root Cause:
		- Profile-photo fallback used a boolean failure flag reset by profile object updates; async re-fetch ordering could repopulate the same image URL after `onError` and invalidate fallback expectation.
	- Fix Applied:
		- Replaced boolean fallback flag with URL-specific failed marker in [src/pages/InstitutionAdminDashboard/components/UserDetailView.tsx](src/pages/InstitutionAdminDashboard/components/UserDetailView.tsx), clearing it only when `profilePhotoUrl` changes.
	- Re-test Result:
		- `npm run test -- tests/unit/pages/institution-admin/UserDetailView.studentCourseLinks.test.jsx` -> PASS.
		- `npm run test` -> PASS (150 files / 682 tests).
		- `npm run lint` -> PASS.
		- `npx tsc --noEmit` -> PASS.
	- Status: RESOLVED


