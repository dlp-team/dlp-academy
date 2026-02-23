# Migration Rollback Playbook

## Purpose

Provide a practical rollback procedure when a Firestore migration introduces incorrect writes, permission regressions, or unexpected data shape changes.

## Preconditions

- A migration run command is known (preset path + dry run/real run mode).
- Service account authentication is working.
- The affected collection(s) and field(s) are identified.

## Rollback Strategy Selection

Choose the smallest safe strategy:

1. **Forward fix (preferred)**
   - Use a follow-up migration to restore fields/values.
   - Best when corruption scope is understood and reversible by deterministic rules.

2. **Partial restore migration**
   - Run a scoped rollback preset for the affected subset using `where` + `limit` guards.
   - Best when blast radius is limited.

3. **Data restore from backup/export**
   - Restore from known-good backup/export and replay safe changes.
   - Best when corruption is broad or non-deterministic.

## Immediate Incident Steps

1. Stop additional write migrations.
2. Record failing migration preset and execution window.
3. Freeze related rule changes if they depend on the bad data shape.
4. Create a review log in the active plan reviewing folder.
5. Determine rollback strategy and owner.

## Rollback Procedure (Forward Fix)

1. Clone the original migration preset.
2. Invert operations where possible:
   - `renameField` back from destination to source if required.
   - Re-add removed fields only if source of truth exists.
   - Recompute canonical fields (`ownerId`, `subjectId`, `topicId`, etc.) from reliable alternatives.
3. Add strict `where` filters to target only impacted docs.
4. Run dry run and review summary counts.
5. Apply real run.
6. Verify with spot checks and checklist.

## Rollback Procedure (Partial Restore)

1. Build a dedicated rollback preset in `scripts/migrations/`.
2. Scope by known indicators (status flags, timestamps, migration markers, IDs).
3. Dry run -> evaluate counts -> real run.
4. Verify the repaired subset and related reads/writes.

## Validation After Rollback

- Re-run verification checklist.
- Confirm expected fields exist and legacy-only fields are removed when intended.
- Confirm key app flows: read, edit, share, and query filters.
- Confirm Firestore rules behavior for intended roles.

## Closure Requirements

- Update review log with root cause and fix evidence.
- Document final migration/preset used for rollback.
- Add follow-up action if runner/preset safeguards need improvement.
