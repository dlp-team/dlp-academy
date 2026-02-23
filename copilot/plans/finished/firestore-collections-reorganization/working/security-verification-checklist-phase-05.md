# Security Verification Checklist — Phase 05 (Multi-Tenant Scope)

Use this as the execution sheet for manual verification. Tick each item only after you validate it with real test users.

## Test metadata
- Date:
- Environment:
- Build/commit:
- Tester(s):
- Institution A user(s):
- Institution B user(s):

## Tenant-isolation checks
- [ ] Same-tenant share creates one shortcut and remains visible only to expected users.
- [ ] Cross-tenant share attempt fails cleanly (no partial writes).
- [ ] Cross-tenant shortcut query from unrelated tenant user is denied.
- [ ] Cross-tenant source query (subject/folder) is denied where expected.

## Lifecycle integrity checks
- [ ] Re-share same source to same user does not create duplicate shortcut.
- [ ] Shortcut move updates only shortcut `parentId`, not source parent/folder.
- [ ] Unshare/source-delete produces orphan state and cleanup removes only shortcut.

## Authorization checks
- [ ] Non-owner cannot mutate source entities through shortcut operations.
- [ ] Shortcut owner can remove own shortcut from view.
- [ ] Unrelated user cannot update/delete another user shortcut.

## Data quality checks
- [ ] New subject writes include `institutionId`.
- [ ] New folder writes include `institutionId`.
- [ ] New shortcut writes include `institutionId`.
- [ ] Legacy docs missing `institutionId` are identified and logged for Phase 06 migration.

## Results summary
- Passed:
- Failed:
- Notes:
- Required follow-ups:
