# Verification Checklist — 2026-02-28 (Phase 02, Candidates 1-2)

## Goal
Verify that shared predicate unification and merge/dedup utility extraction work correctly **without losing existing Home features**.

## Pre-conditions
- Build starts without diagnostics errors in touched files.
- Test with at least:
  - Owner account
  - Shared viewer/editor account
  - Data containing folders, subjects, and shortcuts mixed across root + nested folders.

## A) Functional parity — shared visibility
- [x] In Home grid mode, toggle shared scope ON/OFF and confirm item counts match pre-change behavior.
- [x] In Home shared view, confirm only shared/non-owned content appears.
- [x] Confirm shortcuts still appear as shared for non-owner users.
- [x] Confirm owner-only items are not mistakenly marked/shared-filtered as shared.
- [x] Confirm subject items with `isShared !== true` are still excluded by shared predicate where expected.

## B) Functional parity — merge/dedup (source + shortcuts)
- [ ] For folders: when source folder and shortcut to same target coexist, only one rendered entry remains in tree lists. ## Verification showed that when moving a shared subject inside a shared folder, now the non-owner user that goes inside the folder cannot see the contents although these are shared with him.
- [ ] For subjects: same dedup expectation as folders.## Verification showed that when moving a shared subject inside a shared folder, now the non-owner user that goes inside the folder cannot see the contents although these are shared with him.
- [x] Confirm ordering parity remains stable (source items first, shortcuts after) where previously expected.
- [x] Confirm no duplicate cards/list entries after search/filter transitions.

## C) Mode parity
- [x] Grid mode: verify folders/subjects list and drag/drop affordances still render correctly.
- [ ] List mode: verify same content set and no missing entries. ## Verification showed that when dropping a folder on a folder is not taking the folder inside the folder, but dropping a folder on a subject that is inside the folder it is correctly moving the folder inside the other one. We have to fix this.
- [ ] Shared mode: verify visibility, actions, and counts. ## Verification showed that the count is not working correctly on the folder elementos. It is different the elementos from the grid mode and list mode on the shared mode tab. And they are not correct.
- [x] Nested folder path: verify tree navigation still resolves parent/child correctly.

## D) Regression safety (critical flows)
- [x] Open folder, navigate back via breadcrumb, and re-open nested nodes.
- [x] Open subject from Home and return.
- [x] Toggle tags filter and shared scope together; verify no unexpected empty states.
- [x] Confirm create/edit/delete buttons still respect permission levels.
- [x] Confirm share/unshare confirmation modals still open/close and actions remain wired.

## E) No feature loss checks
- [x] Shortcuts retain identity (`shortcutId`) and target links (`targetId`, `targetType`).
- [x] Existing owner/editor/viewer access behavior is unchanged.
- [x] Empty/loading states render as before.
- [x] No new console errors during navigation/filtering.

## F) Technical validation
- [x] `get_errors` run on touched files for Candidate 1 and Candidate 2.
- [ ] Manual smoke test executed end-to-end.
- [ ] If any mismatch appears, document it in `reviewing/review-log-2026-02-28.md` with repro + fix + retest.
