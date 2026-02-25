# Visibility Debug Protocol — Recipient Shortcut Not Rendering

## Scope
- Shortcut doc is created successfully.
- Shared target exists.
- Recipient still does not see card in Home.

## Instrumentation Enabled
- `src/hooks/useShortcuts.js`
  - Prefix: `[VISIBILITY_DEBUG][shortcuts]`
  - Stages: `shortcuts_snapshot`, `shortcuts_filtered`, `resolve_start`, `resolve_target_deleted`, `resolve_tenant_mismatch_*`, `resolve_access_revoked`, `resolve_error`
- `src/pages/Home/hooks/useHomeState.js`
  - Prefix: `[VISIBILITY_DEBUG][home-state]`
  - Stage: `merge_result`

## Repro Steps
1. Login as recipient user.
2. Go to Home.
3. Keep console open and filter by `VISIBILITY_DEBUG`.
4. Capture one full cycle of logs after page load.

## What to Check
- `shortcuts_snapshot.rawCount` should be `>= 1`.
- `shortcuts_filtered.visibleCount` should include the created shortcut ID.
- `resolve_*` should not end in `resolve_access_revoked` or tenant mismatch.
- `merge_result.subjectsWithShortcutsCount` should be `>= 1`.

## Decision Matrix
- If snapshot is 0: shortcut read/listen issue.
- If resolve is access revoked: target permissions mismatch (`sharedWithUids` or institution).
- If merge count is 0 but resolve exists: Home filtering bug.
- If merge count > 0 but UI empty: render gate/component bug.

## Current Delta
- Previous share-debug protocol/session files removed.
- New visibility-only protocol created.

## Diagnosis Result (2026-02-24)
- Repro output shows `Error listening to shortcuts: Missing or insufficient permissions` in `useShortcuts` snapshot listener.
- This confirms rendering was blocked upstream by Firestore read denial on `shortcuts`, not by UI merge logic.

## Fix Applied
- Updated `firestore.rules` for `match /shortcuts/{shortcutId}` read rule:
  - Shortcut owner can always read own shortcut.
  - Target owners keep institution-bound read path.

## Required Follow-up
- Deploy updated Firestore rules.
- Re-test recipient Home screen and confirm shortcut appears.
