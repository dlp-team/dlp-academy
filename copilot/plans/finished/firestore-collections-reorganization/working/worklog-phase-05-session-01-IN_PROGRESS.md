# Worklog Phase 05 Session 01 (In Progress)

## Objective
Start multi-tenant scope execution by formalizing institution-boundary requirements, tracking verification checkpoints, and preparing implementation gates for migration (Phase 06) and rules rewrite (Phase 07).

## Session actions completed
- Promoted Phase 05 status from PLANNED to IN_PROGRESS in roadmap.
- Created phase document with explicit multi-tenant scope, execution tracks, and acceptance criteria.
- Standardized security verification format to checkbox-based tracking.
- Synced reorganization README status and source-of-truth roadmap path.
- Implemented institution-boundary filtering in `useSubjects`, `useFolders`, and `useShortcuts`.
- Added cross-institution share denial checks in subject/folder share handlers.
- Added write stamping for missing `institutionId` in subject/folder create paths.
- Added shortcut tenant consistency checks in subscription and resolution paths.
- Ran build validation successfully (`npm run build`).

## Technical intent for Phase 05
1. Query boundary hardening
   - Ensure selectors only return records in the current institution.
   - Prevent shortcut resolution from surfacing cross-tenant target docs.

2. Write consistency hardening
   - Ensure new records always stamp `institutionId`.
   - Ensure updates preserve tenant consistency and do not accidentally unset boundary fields.

3. Validation and handoff
   - Produce explicit evidence checklist to support Phase 07 rules hardening.
   - Keep tests reproducible for owner, recipient, and unrelated users.

## Security verification checklist (tick as verified)

### Tenant-isolation checks
- [ ] Same-tenant share creates one shortcut and remains visible only to expected users.
- [ ] Cross-tenant share attempt fails cleanly (no partial writes).
- [ ] Cross-tenant shortcut query from unrelated tenant user is denied.
- [ ] Cross-tenant source query (subject/folder) is denied where expected.

### Lifecycle integrity checks
- [ ] Re-share same source to same user does not create duplicate shortcut.
- [ ] Shortcut move updates only shortcut `parentId`, not source parent/folder.
- [ ] Unshare/source-delete produces orphan state and cleanup removes only shortcut.

### Authorization checks
- [ ] Non-owner cannot mutate source entities through shortcut operations.
- [ ] Shortcut owner can remove own shortcut from view.
- [ ] Unrelated user cannot update/delete another user shortcut.

### Data quality checks
- [ ] New subject/folder/shortcut writes include `institutionId`.
- [ ] Legacy docs with missing `institutionId` are identified for Phase 06 migration.

## Evidence log template
- Date:
- Environment:
- Tester account(s):
- Result summary:
- Failed checks:
- Follow-up actions:

## Next execution step
Execute manual security verification checklist with multi-user accounts and record pass/fail evidence.

## Manual verification status
- [ ] Checklist execution started
- [ ] Evidence log completed
- [ ] Blockers documented for Phase 06/07 handoff
