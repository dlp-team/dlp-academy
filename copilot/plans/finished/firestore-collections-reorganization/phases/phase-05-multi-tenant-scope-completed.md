# Phase 05: Multi-Tenant Scope (In Progress)
Status: IN_PROGRESS

## Why this phase exists
Shortcut-first sharing can work functionally but still fail in production if tenant boundaries are not enforced consistently. This phase ensures institution isolation is explicit in schema, reads, writes, and rule validation.

## Scope
- Enforce `institutionId` as a first-class boundary on subjects, folders, and shortcuts.
- Ensure read selectors cannot mix cross-tenant records.
- Ensure write paths stamp consistent tenant metadata.
- Prepare security validation before Phase 07 hardening completes.

## Planned execution tracks

### 1) Query boundary track
- Audit Home/Subject/Topic selectors for tenant-aware filtering.
- Ensure shortcut resolution does not surface targets from other institutions.
- Verify merged direct+shortcut selectors preserve tenant boundaries.

### 2) Write consistency track
- Ensure create/update paths include or preserve `institutionId`.
- Identify fallback behavior where legacy records have missing tenant fields.
- Document migration dependencies for legacy backfill.

### 3) Rules alignment track
- Confirm current rules can support required query/read/write patterns without cross-tenant leakage.
- Prepare exact test matrix handoff for Phase 07 least-privilege rewrite.

## Current implementation checkpoint
- Strategy and phase plan updated to IN_PROGRESS.
- Security verification is now tracked using tickable checklists in worklogs.
- Tenant-aware filtering implemented in:
	- `src/hooks/useSubjects.js`
	- `src/hooks/useFolders.js`
	- `src/hooks/useShortcuts.js`
- Share guards added to block cross-institution sharing attempts in subject/folder share flows.
- New writes now consistently stamp `institutionId` for subject/folder/shortcut create paths.
- Legacy fallback behavior added for owner-owned records missing `institutionId` (migration window support).

## Implemented details (Session 01)

### Query boundary hardening done
- `useSubjects`: owned records filtered by current institution, with owner-safe fallback for legacy docs without `institutionId`.
- `useFolders`: owned records filtered by current institution (with legacy owner fallback), shared records constrained to current institution.
- `useShortcuts`: shortcut subscription filtered by institution; target resolution marks cross-tenant records as inaccessible/orphan state.

### Write consistency hardening done
- `addSubject` stamps `institutionId` when missing in payload.
- `addFolder` stamps `institutionId` when missing in payload.
- `createShortcut`/share-driven shortcut creation aligns to active institution.

### Runtime validation done
- Build sanity check passed (`npm run build`).

## Acceptance criteria
- Tenant boundary respected in all high-traffic selectors.
- Shortcut lifecycle remains functional under tenant constraints.
- Cross-tenant read/write attempts are rejected.

## Security verification checklist (tick as verified)
- [ ] Verify same-tenant share creates exactly one shortcut for recipient.
- [ ] Verify cross-tenant share attempt is denied.
- [ ] Verify same-tenant shortcut move updates only shortcut `parentId`.
- [ ] Verify cross-tenant shortcut read attempt is denied.
- [ ] Verify orphan shortcut cleanup works without cross-tenant side effects.
- [ ] Verify owner-source updates do not bypass tenant isolation.
- [ ] Verify non-owner cannot mutate source entities across tenant boundaries.

## Dependencies
- Phase 06 migration for backfilling missing `institutionId`.
- Phase 07 security rules rewrite for final least-privilege enforcement.
