# Shortcut Share Debug Session — 2026-02-24

## Status
- Protocol activated.
- Structured runtime debug logging added in share flows:
  - `src/hooks/useSubjects.js` (`[SHARE_DEBUG][subject]`)
  - `src/hooks/useFolders.js` (`[SHARE_DEBUG][folder]`)
- Noisy permission logs were removed from `src/utils/permissionUtils.js`.

## How to Capture the Failure
1. Open browser devtools console.
2. Reproduce the failing share action.
3. Filter logs by `SHARE_DEBUG`.
4. Copy the full sequence from `start` to `shortcut_step_fail`/`rollback_*`.

## Expected Critical Events
- `start`
- `user_lookup_*`
- `source_update_*`
- `shortcut_query_attempt`
- `shortcut_create_attempt` or `shortcut_update_attempt`
- `shortcut_step_fail` (if failure)
- `rollback_*` (if share was reverted)

## What To Paste Here After Repro
- Error code (e.g. `permission-denied`)
- Error message
- targetType (`subject` or `folder`)
- actorUid / targetUid
- institutionId / targetInstitutionId
- whether `sourceUpdated` was true

## Initial Hypothesis
- Shortcut creation is failing due to Firestore rule constraints or payload/institution mismatch in the shortcut create/update step.
- New logs should identify exact failure stage and error code.

## Diagnosis Update (from latest reproduction)
- Failure happens at `shortcut_query_attempt` before create/update (`shortcut_step_fail` right after query).
- This indicates the read/query step itself fails (likely permissions/index), not the actual create payload.

## Mitigation Applied
- Replaced shortcut lookup query + add/update path with deterministic shortcut upsert (`setDoc`) in:
  - `src/hooks/useSubjects.js`
  - `src/hooks/useFolders.js`
- Deterministic IDs:
  - Subject shortcut: `${targetUid}_${subjectId}_subject`
  - Folder shortcut: `${targetUid}_${folderId}_folder`
- This removes dependency on reading `shortcuts` first and avoids query/index/rule-read failure in share flow.

## Next Verification
- Re-run share for subject and folder.
- Expect `shortcut_upsert_attempt` → `shortcut_upsert_success` and no rollback.
