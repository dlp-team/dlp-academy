// copilot/explanations/temporal/lossless-reports/2026-03-30/profile-dashboard-recognition-and-rules-hardening.md

# Lossless Report - Profile/Dashboard Recognition and Rules Hardening

## Requested Scope
- Continue autopilot implementation after regression fix in profile statistics.
- Deliver teacher profile aggregate statistics (assigned students), teacher badge assignment support, and dashboard actions for behavior + badges.
- Align Firestore rules and rules tests for constrained teacher writes on student recognition data.
- Keep Home reliability/auth changes intact and clean diagnostics.

## Preserved Behaviors
- Student profile flow still uses single-user statistics and existing badges rendering.
- Existing institution-admin/global-admin user update paths in rules remain unchanged.
- Existing teacher dashboard tabs (`overview`, `classes`, `students`, `correction`) preserved while adding `subjects`.
- Existing Home bulk selection behavior preserved; only error-path lint cleanup applied.

## Changes Applied
1. `src/pages/Profile/components/UserStatistics.jsx`
- Fixed accidental duplicate component declaration regression.

2. `src/pages/Profile/hooks/useUserStatistics.js`
- Added stable aggregate-mode support (`aggregateMode`, `aggregateUserIds`, `aggregateUsersById`).
- Added empty-state guard for aggregate mode with no users.

3. `src/pages/Profile/hooks/useProfile.js`
- Added role/scoped guards for manual badge award action.
- Added profile institution fallback (`profileData.institutionId`) when loading teacher-assigned students.

4. `src/pages/Profile/Profile.jsx`
- Wired teacher aggregate stats options from assigned students.
- Connected teacher badge assignment UI via `BadgesSection`.
- Passed role/stats options into detailed statistics component.

5. `src/pages/Profile/components/StatsSidebar.jsx`
- Added `showBadges` prop so teacher sidebar can render chart-only mode.

6. `src/pages/Profile/components/BadgesSection.jsx`
- Added compatibility for student payloads using either `id` or `uid`.

7. `src/pages/TeacherDashboard/TeacherDashboard.jsx`
- Added `subjects` tab with subject summary table.
- Added student actions for `behaviorScore` and manual badge awarding (`participacion`, `esfuerzo`).
- Added action-pending guards and inline feedback messaging.

8. `firestore.rules`
- Added constrained teacher update branch in `match /users/{userId}`:
  - target must be same-institution student,
  - only `badges`, `badgesByCourse`, `behaviorScore`, `updatedAt` may be changed,
  - role/institution immutability enforced.
- Repaired malformed syntax block in `subjects` read rule (existing corruption) to restore rules compilation.

9. `tests/rules/firestore.rules.test.js`
- Added tests for teacher recognition-field permission boundaries.
- Updated rules file path resolution for lint-compatible Node globals removal.

10. `tests/unit/utils/badgeUtils.test.js`
- Added new unit tests for course badge utilities.

11. `tests/unit/pages/settings/SecuritySection.test.jsx`
- Added new unit tests for password-change/logout behavior in settings security section.

12. `src/pages/Home/Home.jsx`
- Removed unused catch variable in folder-from-selection handler.

13. `src/pages/InstitutionAdminDashboard/components/CustomizationTab.jsx`
- Rewired personalization preview to use mock-role preview component instead of iframe-driven live preview.

14. `src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.jsx`
- Added deterministic teacher/student mock preview with viewport toggles and token-driven color editor integration.
- Preserved explicit-save behavior (no implicit Firestore write on palette preview apply).

15. `tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx`
- Added unit coverage for role switching, save payload, and palette-preview apply behavior.

## Documentation Updates
- Updated codebase explanations for:
  - `src/pages/Profile/Profile.jsx`
  - `src/pages/Profile/hooks/useProfile.js`
  - `src/pages/Profile/hooks/useUserStatistics.js`
  - `src/pages/Profile/components/BadgesSection.jsx`
  - `src/pages/Profile/components/StatsSidebar.jsx`
  - `src/pages/TeacherDashboard/TeacherDashboard.jsx`
  - `firestore.rules`
  - `tests/rules/firestore.rules.test.js`
- Created codebase explanations for:
  - `src/pages/Settings/components/SecuritySection.jsx`
  - `src/utils/badgeUtils.js`
  - `tests/unit/utils/badgeUtils.test.js`
  - `tests/unit/pages/settings/SecuritySection.test.jsx`
  - `src/pages/InstitutionAdminDashboard/components/CustomizationTab.jsx`
  - `src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.jsx`
  - `tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx`

## Validation Summary
- Diagnostics (`get_errors`) on all touched source/test/rules files: clean.
- Lint (targeted touched files): clean.
- Unit tests:
  - `npm run test:unit -- tests/unit/utils/badgeUtils.test.js tests/unit/pages/settings/SecuritySection.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> passed.
- Rules tests:
  - `npm run test:rules` -> passed (`44/44` tests).

## Residual Risks
- Teacher recognition writes are institution-scoped and field-scoped in rules, but class-level teacher-student assignment cannot be fully enforced in current rule model without additional relationship indexing in user documents.
- `useProfile` auto-badge effect intentionally keeps dependency scope anchored to `user` to avoid re-fetch loops during local state mutation.
