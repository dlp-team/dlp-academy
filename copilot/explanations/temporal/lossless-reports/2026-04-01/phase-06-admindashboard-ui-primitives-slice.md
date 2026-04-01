<!-- copilot/explanations/temporal/lossless-reports/2026-04-01/phase-06-admindashboard-ui-primitives-slice.md -->

# Lossless Report: Phase 06 AdminDashboard UI Primitives + Utility + Users/Institutions Row + User/Institution Filter + Users Pagination Query + Confirm-Copy + Role Constants + Users/Institutions Filters + Institution Form + Institution Form-State + Institution Invite-Sync + Institution Payload + Institution Validation + Institution Batch-Queue + Institution Invite-Query Utility Slices

Date: 2026-04-01

## Requested Scope
Continue the plan with commit/push-per-task discipline and begin Phase 06 by extracting reusable UI primitives from `AdminDashboard.tsx`.
Then continue Phase 06 with extraction of reusable email parsing utility.
Then continue Phase 06 with extraction of users-table row rendering/actions.
Then continue Phase 06 with extraction of institutions-table row rendering/actions.
Then continue Phase 06 with extraction of users filtering utility logic.
Then continue Phase 06 with extraction of institutions filtering utility logic.
Then continue Phase 06 with extraction of users pagination query-building utility logic.
Then continue Phase 06 with extraction of user/institution confirm-dialog copy derivation logic.
Then continue Phase 06 with extraction of users role constants/display mappers.
Then continue Phase 06 with extraction of users-tab filter controls into a dedicated component.
Then continue Phase 06 with extraction of institutions-tab filter controls into a dedicated component.
Then continue Phase 06 with extraction of institutions create/edit form panel into a dedicated component.
Then continue Phase 06 with extraction of repeated institutions form default/reset/edit mapping logic into a utility.
Then continue Phase 06 with extraction of institutions invite-sync diff logic into a utility.
Then continue Phase 06 with extraction of institutions submit normalization/payload construction into a utility.
Then continue Phase 06 with extraction of institutions submit validation checks/messages into a utility.
Then continue Phase 06 with extraction of institutions create/edit batch queue orchestration into utilities.
Then continue Phase 06 with extraction of institutions edit-flow invite query/loading into a utility.

## Explicitly Preserved (Out of Scope)
- No Firestore query or mutation behavior changes.
- No tab workflow changes in Institutions/Users/Overview.
- No role/permission policy changes.

## Touched Files
- `src/pages/AdminDashboard/AdminDashboard.tsx`
- `src/pages/AdminDashboard/components/RoleBadge.tsx` (new)
- `src/pages/AdminDashboard/components/AdminConfirmModal.tsx` (new)
- `src/pages/AdminDashboard/utils/adminEmailUtils.ts` (new)
- `src/pages/AdminDashboard/components/UserStatusBadge.tsx` (new)
- `src/pages/AdminDashboard/components/UserTableRow.tsx` (new)
- `src/pages/AdminDashboard/components/InstitutionTableRow.tsx` (new)
- `src/pages/AdminDashboard/utils/adminUserFilterUtils.ts` (new)
- `src/pages/AdminDashboard/utils/adminInstitutionFilterUtils.ts` (new)
- `src/pages/AdminDashboard/utils/adminUserPaginationQueryUtils.ts` (new)
- `src/pages/AdminDashboard/utils/adminConfirmDialogTextUtils.ts` (new)
- `src/pages/AdminDashboard/utils/adminUserRoleConstants.ts` (new)
- `src/pages/AdminDashboard/components/AdminUsersFilters.tsx` (new)
- `src/pages/AdminDashboard/components/AdminInstitutionsFilters.tsx` (new)
- `src/pages/AdminDashboard/components/InstitutionFormPanel.tsx` (new)
- `src/pages/AdminDashboard/utils/adminInstitutionFormUtils.ts` (new)
- `src/pages/AdminDashboard/utils/adminInstitutionInviteSyncUtils.ts` (new)
- `src/pages/AdminDashboard/utils/adminInstitutionPayloadUtils.ts` (new)
- `src/pages/AdminDashboard/utils/adminInstitutionValidationUtils.ts` (new)
- `src/pages/AdminDashboard/utils/adminInstitutionBatchQueueUtils.ts` (new)
- `src/pages/AdminDashboard/utils/adminInstitutionInviteQueryUtils.ts` (new)
- `tests/unit/pages/admin/RoleBadge.test.jsx` (new)
- `tests/unit/pages/admin/AdminConfirmModal.test.jsx` (new)
- `tests/unit/pages/admin/adminEmailUtils.test.js` (new)
- `tests/unit/pages/admin/UserTableRow.test.jsx` (new)
- `tests/unit/pages/admin/InstitutionTableRow.test.jsx` (new)
- `tests/unit/pages/admin/adminUserFilterUtils.test.js` (new)
- `tests/unit/pages/admin/adminInstitutionFilterUtils.test.js` (new)
- `tests/unit/pages/admin/adminUserPaginationQueryUtils.test.js` (new)
- `tests/unit/pages/admin/adminConfirmDialogTextUtils.test.js` (new)
- `tests/unit/pages/admin/adminUserRoleConstants.test.js` (new)
- `tests/unit/pages/admin/AdminUsersFilters.test.jsx` (new)
- `tests/unit/pages/admin/AdminInstitutionsFilters.test.jsx` (new)
- `tests/unit/pages/admin/InstitutionFormPanel.test.jsx` (new)
- `tests/unit/pages/admin/adminInstitutionFormUtils.test.js` (new)
- `tests/unit/pages/admin/adminInstitutionInviteSyncUtils.test.js` (new)
- `tests/unit/pages/admin/adminInstitutionPayloadUtils.test.js` (new)
- `tests/unit/pages/admin/adminInstitutionValidationUtils.test.js` (new)
- `tests/unit/pages/admin/adminInstitutionBatchQueueUtils.test.js` (new)
- `tests/unit/pages/admin/adminInstitutionInviteQueryUtils.test.js` (new)
- `copilot/plans/active/audit-remediation-and-completion/phases/phase-06-admindashboard-modularization.md` (new)
- `copilot/plans/active/audit-remediation-and-completion/strategy-roadmap.md`
- `copilot/explanations/codebase/src/pages/AdminDashboard/AdminDashboard.md`
- `copilot/explanations/codebase/src/pages/AdminDashboard/components/RoleBadge.md` (new)
- `copilot/explanations/codebase/src/pages/AdminDashboard/components/AdminConfirmModal.md` (new)
- `copilot/explanations/codebase/src/pages/AdminDashboard/utils/adminEmailUtils.md` (new)
- `copilot/explanations/codebase/src/pages/AdminDashboard/components/UserStatusBadge.md` (new)
- `copilot/explanations/codebase/src/pages/AdminDashboard/components/UserTableRow.md` (new)
- `copilot/explanations/codebase/src/pages/AdminDashboard/components/InstitutionTableRow.md` (new)
- `copilot/explanations/codebase/src/pages/AdminDashboard/utils/adminUserFilterUtils.md` (new)
- `copilot/explanations/codebase/src/pages/AdminDashboard/utils/adminInstitutionFilterUtils.md` (new)
- `copilot/explanations/codebase/src/pages/AdminDashboard/utils/adminUserPaginationQueryUtils.md` (new)
- `copilot/explanations/codebase/src/pages/AdminDashboard/utils/adminConfirmDialogTextUtils.md` (new)
- `copilot/explanations/codebase/src/pages/AdminDashboard/utils/adminUserRoleConstants.md` (new)
- `copilot/explanations/codebase/src/pages/AdminDashboard/components/AdminUsersFilters.md` (new)
- `copilot/explanations/codebase/src/pages/AdminDashboard/components/AdminInstitutionsFilters.md` (new)
- `copilot/explanations/codebase/src/pages/AdminDashboard/components/InstitutionFormPanel.md` (new)
- `copilot/explanations/codebase/src/pages/AdminDashboard/utils/adminInstitutionFormUtils.md` (new)
- `copilot/explanations/codebase/src/pages/AdminDashboard/utils/adminInstitutionInviteSyncUtils.md` (new)
- `copilot/explanations/codebase/src/pages/AdminDashboard/utils/adminInstitutionPayloadUtils.md` (new)
- `copilot/explanations/codebase/src/pages/AdminDashboard/utils/adminInstitutionValidationUtils.md` (new)
- `copilot/explanations/codebase/src/pages/AdminDashboard/utils/adminInstitutionBatchQueueUtils.md` (new)
- `copilot/explanations/codebase/src/pages/AdminDashboard/utils/adminInstitutionInviteQueryUtils.md` (new)
- `copilot/explanations/codebase/src/pages/AdminDashboard/components/UserTableRow.md`

## Per-File Verification
1. `src/pages/AdminDashboard/AdminDashboard.tsx`
- Verified inline `RoleBadge` and `AdminConfirmModal` definitions were removed and imports substituted.
- Verified component usage call sites remain unchanged in institutions/users flows.

2. `src/pages/AdminDashboard/components/RoleBadge.tsx`
- Verified known-role mapping and fallback behavior match prior inline implementation.

3. `src/pages/AdminDashboard/components/AdminConfirmModal.tsx`
- Verified dialog render gates and cancel/confirm actions match prior inline implementation.

4. Tests
- Verified new component tests pass.
- Verified existing confirmation-dialog integration tests still pass.
- Verified new `parseCsvEmails` utility tests pass.
- Verified users-row extraction tests pass and integration confirmations remain green.
- Verified institutions-row extraction tests pass and integration confirmations remain green.
- Verified users-filter utility tests pass and integration confirmations remain green.
- Verified institutions-filter utility tests pass and integration confirmations remain green.
- Verified users pagination query utility tests pass and integration confirmations remain green.
- Verified confirm-dialog copy utility tests pass and integration confirmations remain green.
- Verified users role constants/label mapper tests pass and integration confirmations remain green.
- Verified users-filters component tests pass and integration confirmations remain green.
- Verified institutions-filters component tests pass and integration confirmations remain green.
- Verified institution-form component tests pass and integration confirmations remain green.
- Verified institution form-state utility tests pass and integration confirmations remain green.
- Verified institution invite-sync utility tests pass and integration confirmations remain green.
- Verified institution payload utility tests pass and integration confirmations remain green.
- Verified institution validation utility tests pass and integration confirmations remain green.
- Verified institution batch-queue utility tests pass and integration confirmations remain green.
- Verified institution invite-query utility tests pass and integration confirmations remain green.

## Validation Summary
- `get_errors` on touched files: clean.
- `npm run test -- tests/unit/pages/admin/AdminConfirmModal.test.jsx tests/unit/pages/admin/RoleBadge.test.jsx tests/unit/pages/admin/adminEmailUtils.test.js tests/unit/pages/admin/UserTableRow.test.jsx tests/unit/pages/admin/InstitutionTableRow.test.jsx tests/unit/pages/admin/adminUserFilterUtils.test.js tests/unit/pages/admin/adminInstitutionFilterUtils.test.js tests/unit/pages/admin/adminUserPaginationQueryUtils.test.js tests/unit/pages/admin/adminConfirmDialogTextUtils.test.js tests/unit/pages/admin/adminUserRoleConstants.test.js tests/unit/pages/admin/AdminUsersFilters.test.jsx tests/unit/pages/admin/AdminInstitutionsFilters.test.jsx tests/unit/pages/admin/InstitutionFormPanel.test.jsx tests/unit/pages/admin/adminInstitutionFormUtils.test.js tests/unit/pages/admin/adminInstitutionInviteSyncUtils.test.js tests/unit/pages/admin/adminInstitutionPayloadUtils.test.js tests/unit/pages/admin/adminInstitutionValidationUtils.test.js tests/unit/pages/admin/adminInstitutionBatchQueueUtils.test.js tests/unit/pages/admin/adminInstitutionInviteQueryUtils.test.js tests/unit/pages/admin/AdminDashboard.confirmDialogs.test.jsx`: 20/20 files passed, 47/47 tests passed.
- `npm run lint`: 0 errors, 4 pre-existing warnings in unrelated files.

## Risks and Checks
- Risk: confirmation dialog behavior drift during extraction.
  - Check: reused original JSX/handlers, and integration tests remained green.
- Risk: role label/style regressions.
  - Check: added targeted role badge tests for known and unknown roles.
- Risk: invite/admin email parsing drift during extraction.
  - Check: added dedicated utility tests for normalization and empty-entry trimming.
- Risk: users-table row action wiring regressions.
  - Check: extracted row component preserves callback contracts and is covered by focused row tests plus existing integration suite.
- Risk: institutions-table row action wiring regressions.
  - Check: extracted row component preserves callbacks and is covered by focused row tests plus existing confirmation-dialog integration tests.
- Risk: users filter semantics drift during utility extraction.
  - Check: extracted utility mirrors prior conditions and is covered by focused utility tests plus existing integration suite.
- Risk: institutions filter semantics drift during utility extraction.
  - Check: extracted utility mirrors prior conditions and is covered by focused utility tests plus existing integration suite.
- Risk: users pagination query semantics drift during utility extraction.
  - Check: utility tests assert first-page and next-page Firestore query-shape semantics, and existing pagination integration test remains green.
- Risk: confirm-dialog messaging semantics drift during copy utility extraction.
  - Check: dedicated utility tests assert action-specific titles/labels/fallbacks and existing confirmation integration tests remained green.
- Risk: role filter/option label drift while centralizing constants.
  - Check: dedicated utility tests assert exported arrays/labels and fallback behavior; row and integration tests remained green.
- Risk: users-tab filter control wiring drift during component extraction.
  - Check: dedicated component tests assert role/search/status callback wiring and existing integration tests remained green.
- Risk: institutions-tab filter/control wiring drift during component extraction.
  - Check: dedicated component tests assert status/type/search/button callback wiring and existing integration tests remained green.
- Risk: institution form input/update behavior drift during component extraction.
  - Check: dedicated component tests assert create/edit mode rendering and institutional code normalization; existing integration tests remained green.
- Risk: institutions form defaults/edit mapping drift during utility extraction.
  - Check: utility tests assert default form-state values, fresh object creation, and edit mapping fallbacks; integration tests remained green.
- Risk: institution invite add/delete diff semantics drift during utility extraction.
  - Check: utility tests assert invite add/delete outcomes for changed and unchanged sets; integration tests remained green.
- Risk: submit normalization/payload shape semantics drift during utility extraction.
  - Check: utility tests assert trimming, timezone fallback, admin parsing, and payload field mapping; integration tests remained green.
- Risk: submit validation message/branch semantics drift during utility extraction.
  - Check: utility tests assert expected Spanish validation messages for valid and invalid inputs; integration tests remained green.
- Risk: create/edit batch queue side-effect semantics drift during utility extraction.
  - Check: utility tests assert queued set/update/delete operations for edit/create branches and integration tests remained green.
- Risk: edit-flow invite query filter/mapping semantics drift during utility extraction.
  - Check: utility tests assert query constraints and mapped invite records; integration tests remained green.
