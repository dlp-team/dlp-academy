<!-- copilot/plans/active/topic-linked-content-normalization/phases/phase-02-data-migration-and-backfill-ready.md -->
# Phase 02 - Data Migration and Backfill (READY FOR EXECUTION)

## Objective

Backfill and normalize stored data so all topic-linked records use canonical camelCase relations.

## Changes

### Migration Assets Created
- ✅ Migration config: `scripts/migrations/exams-topicid-normalization.cjs`
- ✅ Migration wrapper: `scripts/migrate-exams-topicid.cjs`
- ✅ Runbook: `working/phase-02-migration-runbook.md`
- ✅ User instructions: `working/migration-instructions.md`

### Operations Defined
1. **Rename `topicid` → `topicId`** in exams collection
2. **Rename `topic_id` → `topicId`** (if exists)
3. **Rename `subject_id` → `subjectId`** (if exists)
4. **Remove source fields** after successful copy

### Migration Features
- Dry-run mode (default) for safe preview
- Batch processing (configurable limit: 400)
- Idempotent (can re-run safely)
- Detailed logging and reporting
- Won't overwrite existing canonical fields

## Risks

- Partial migration can silently hide content.
- Incorrect derivation of relation fields can orphan records.

## Mitigation Strategies

1. **Pre-migration backup** (required - see runbook)
2. **Dry-run validation** (required before live run)
3. **Post-migration verification** (checklist in runbook)
4. **Rollback procedure** documented
5. **Batch processing** limits blast radius

## Execution Requirements

### Prerequisites
- [ ] Firestore backup created and verified
- [ ] Service account credentials configured
- [ ] Dry-run executed and reviewed
- [ ] External systems (n8n) coordinated for canonical writes

### Migration Command
```bash
# Dry run (preview only)
DRY_RUN=true node scripts/migrate-exams-topicid.cjs

# Live run (apply changes)
DRY_RUN=false node scripts/migrate-exams-topicid.cjs
```

### Verification Steps
1. Check Firestore console for canonical fields
2. Test app: navigate to topic → verify exams appear
3. Run verification queries (documented in runbook)
4. Monitor for one week post-migration

## Completion Criteria

- [ ] Dry-run completed without errors
- [ ] Live migration executed successfully
- [ ] Post-migration verification passed
- [ ] Exam count matches baseline
- [ ] Exams visible in topic page
- [ ] No console errors or regressions
- [ ] External systems updated

## Documentation

- Migration runbook: `working/phase-02-migration-runbook.md`
- User instructions: `working/migration-instructions.md`
- Migration config: `scripts/migrations/exams-topicid-normalization.cjs`

## Next Steps

1. Execute pre-migration checklist from runbook
2. Run dry-run and review output
3. Execute live migration
4. Complete post-migration verification
5. Mark phase as COMPLETED
6. Proceed to Phase 03 (Rules and Index Hardening)

## Status

**READY FOR EXECUTION** - All migration assets created and documented. Awaiting user to run migration commands.
