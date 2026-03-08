<!-- copilot/plans/active/topic-linked-content-normalization/working/phase-02-summary.md -->
# Phase 02 Summary - Data Migration Ready

**Date**: 2026-03-08  
**Status**: READY FOR EXECUTION  
**Phase**: Phase 02 - Data Migration and Backfill

---

## What Was Built

### Migration Infrastructure
1. **Migration Config** (`scripts/migrations/exams-topicid-normalization.cjs`)
   - Normalizes exams collection to use canonical `topicId` field
   - Handles `topicid`, `topic_id`, and `subject_id` legacy variants
   - Idempotent and safe (won't overwrite existing canonical fields)

2. **Migration Wrapper** (`scripts/migrate-exams-topicid.cjs`)
   - User-friendly CLI script
   - Dry-run mode by default (safe preview)
   - Clear progress reporting

3. **Comprehensive Documentation**
   - Detailed runbook with pre/post checklists
   - Step-by-step user instructions
   - Troubleshooting guide
   - Rollback procedure

---

## What the Migration Does

### Target: `exams` Collection

**Field Normalizations**:
- `topicid` (lowercase) → `topicId` (camelCase)
- `topic_id` (snake_case) → `topicId` (camelCase)
- `subject_id` (snake_case) → `subjectId` (camelCase)

**Safety Features**:
- Won't overwrite existing canonical fields
- Removes source fields only after successful copy
- Batch processing (400 docs per batch)
- Detailed logging of all operations

---

## How to Execute

### Prerequisites
1. **Backup Firestore** (REQUIRED)
   - Use Firebase console or gcloud export
   - Verify backup is complete

2. **Configure Service Account**
   ```bash
   # Set environment variable
   $env:FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
   # OR
   $env:FIREBASE_SERVICE_ACCOUNT_PATH="./serviceAccountKey.json"
   ```

### Step 1: Dry Run (Preview)
```bash
$env:DRY_RUN="true"; node scripts/migrate-exams-topicid.cjs
```

**Expected**: Report showing what will change, no actual writes

### Step 2: Review Output
- Check document counts
- Verify field mappings
- Confirm operations make sense

### Step 3: Live Migration
```bash
$env:DRY_RUN="false"; node scripts/migrate-exams-topicid.cjs
```

**Expected**: Batch writes applied, final summary

### Step 4: Verify
1. **Firestore Console**: Check exam documents have `topicId` field
2. **App**: Navigate to topic → verify exams appear
3. **Query**: Run verification queries from runbook

---

## Why This Is Safe

1. **Dry-run first** - Always preview before applying
2. **Idempotent** - Can re-run safely if needed
3. **No deletions** - Only field renames, never deletes documents
4. **Batch limits** - Controlled blast radius
5. **Backup required** - Rollback always possible
6. **Proven pattern** - Uses same migration framework as previous successful migrations

---

## Current State vs. Target State

### Before Migration
```javascript
// Exam document in Firestore
{
  id: "exam_123",
  examen_titulo: "Final Exam",
  topicid: "topic_456",        // ❌ lowercase
  subject_id: "subject_789",   // ❌ snake_case
  preguntas: [...]
}
```

### After Migration
```javascript
// Exam document in Firestore
{
  id: "exam_123",
  examen_titulo: "Final Exam",
  topicId: "topic_456",        // ✅ camelCase
  subjectId: "subject_789",    // ✅ camelCase
  preguntas: [...]
}
```

### App Query Impact
```javascript
// Before: Won't find exams (field mismatch)
where("topicId", "==", topicId)  // App uses topicId
// But data has "topicid" (lowercase)

// After: Will find exams (field match)
where("topicId", "==", topicId)  // App uses topicId
// Data also has "topicId" ✅
```

---

## Expected Outcomes

### Immediate
- ✅ Exams appear in topic page
- ✅ Exam count unchanged
- ✅ Exam navigation works
- ✅ No console errors

### Long-term
- ✅ Schema consistency across all topic-linked collections
- ✅ Easier maintenance (one naming convention)
- ✅ Better security enforcement (relational rules)
- ✅ No data splits due to mixed field names

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Partial migration | Low | Medium | Idempotent script, can re-run |
| Data loss | Very Low | High | Backup required before execution |
| App breaks | Low | High | Rollback procedure documented |
| External systems still use old fields | Medium | Medium | Coordinate with backend team |

---

## Next Steps

### Immediate (User Action Required)
1. ✅ Create Firestore backup
2. ✅ Run dry-run migration
3. ✅ Review output
4. ✅ Execute live migration
5. ✅ Verify in app

### After Migration (Phase 03)
1. Deploy Firestore rules (already updated in Phase 01)
2. Add required indexes
3. Monitor for one week
4. Update external systems (n8n)

---

## Documentation

All comprehensive documentation is in the `working/` folder:

- **`phase-02-migration-runbook.md`**: Detailed execution guide with checklists
- **`migration-instructions.md`**: Step-by-step user instructions
- **`phase-02-summary.md`**: This file - high-level overview

---

## Support

If issues arise during migration:

1. Check troubleshooting section in `migration-instructions.md`
2. Review error messages carefully
3. Don't panic - backup exists
4. If stuck, stop and restore from backup
5. Re-run dry-run to diagnose issue

---

## Phase 02 Completion Criteria

- [ ] Dry-run executed and reviewed ✅
- [ ] Live migration executed successfully
- [ ] Post-migration verification passed
- [ ] Exams visible in app
- [ ] No regressions detected
- [ ] Migration logs archived
- [ ] Phase marked as COMPLETED

**Status**: Ready for user to execute migration commands.
