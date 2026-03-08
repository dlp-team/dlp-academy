<!-- copilot/plans/active/topic-linked-content-normalization/working/phase-02-migration-runbook.md -->
# Phase 02 Migration Runbook

**Date**: 2026-03-08  
**Phase**: Phase 02 - Data Migration and Backfill  
**Target**: Normalize exams collection to use canonical `topicId` field

---

## Pre-Migration Checklist

### Environment Setup
- [ ] Firestore service account credentials configured
  - Set `FIREBASE_SERVICE_ACCOUNT_JSON` or `FIREBASE_SERVICE_ACCOUNT_PATH`
- [ ] Node.js and required packages installed (`firebase-admin`, `dotenv`)
- [ ] Current Firestore backup created and verified
- [ ] Migration scripts reviewed: `scripts/migrate-exams-topicid.cjs`

### Data Baseline
- [ ] Count of exams with `topicid` (lowercase) field recorded
- [ ] Count of exams with `topicId` (camelCase) field recorded  
- [ ] Count of exams with `topic_id` (snake_case) field recorded
- [ ] Total exam count recorded

Query templates for baseline:
```javascript
// In Firestore console or admin SDK
db.collection('exams').get().then(snap => console.log('Total exams:', snap.size));
// Manual inspection needed for field variants
```

---

## Migration Steps

### Step 1: Dry Run (REQUIRED)

**Command**:
```bash
DRY_RUN=true node scripts/migrate-exams-topicid.cjs
```

**Expected Output**:
- Summary of documents to be modified
- Fields to be renamed per document
- No actual writes to Firestore

**Validation**:
- Review migration plan output
- Confirm field mappings are correct
- Verify no unexpected operations

**Go/No-Go Decision**:
- [ ] Dry run completed without errors
- [ ] Output reviewed and validated
- [ ] Ready to proceed with live run

---

### Step 2: Live Migration

**Command**:
```bash
DRY_RUN=false node scripts/migrate-exams-topicid.cjs
```

**Expected Behavior**:
- Batch operations applied to exams collection
- Progress logged to console
- Final summary of changes

**Monitoring**:
- Watch for errors or warnings
- Note document IDs that fail (if any)
- Capture final statistics

**Success Criteria**:
- [ ] Migration completes without fatal errors
- [ ] All targeted documents updated
- [ ] No unexpected field deletions

---

### Step 3: Post-Migration Verification

**Firestore Checks**:
1. Query exams by new `topicId` field:
   ```javascript
   db.collection('exams').where('topicId', '==', '<test-topic-id>').get()
   ```
2. Verify old `topicid` field removed:
   ```javascript
   // Manual inspection: check sample docs don't have topicid
   ```
3. Confirm exam counts unchanged:
   ```javascript
   db.collection('exams').get().then(snap => console.log('Post-migration count:', snap.size));
   ```

**App Verification**:
1. Navigate to a topic page in the app
2. Verify exams appear in uploads tab
3. Verify exam cards render correctly
4. Verify exam navigation works (click card → exam page)

**Verification Checklist**:
- [ ] Exams visible in topic page
- [ ] Exam count matches baseline
- [ ] No console errors related to exams
- [ ] Exam navigation functional

---

## Migration Operations Detail

### Collection: `exams`

**Operation 1**: Rename `topicid` → `topicId`
- Source field: `topicid` (lowercase)
- Target field: `topicId` (camelCase)
- Overwrite: `false` (preserve existing `topicId` if present)
- Remove source: `true` (delete old field after copy)

**Operation 2**: Rename `topic_id` → `topicId` (if exists)
- Source field: `topic_id` (snake_case)
- Target field: `topicId` (camelCase)
- Overwrite: `false`
- Remove source: `true`

**Operation 3**: Rename `subject_id` → `subjectId` (if exists)
- Source field: `subject_id` (snake_case)
- Target field: `subjectId` (camelCase)
- Overwrite: `false`
- Remove source: `true`

---

## Rollback Procedure

### If Migration Fails Mid-Execution

1. **Stop migration immediately** (Ctrl+C if running)
2. **Assess partial state**:
   - Identify which documents were modified
   - Verify mix of old/new field names
3. **Restore from backup**:
   ```bash
   # Use Firestore console or gcloud firestore import
   gcloud firestore import gs://<backup-bucket>/<backup-date>/
   ```
4. **Re-run dry run** to diagnose issue
5. **Fix migration script** if needed
6. **Retry** from Step 1

### If App Breaks Post-Migration

1. **Immediate**: Revert app query to use `topicid` (temporary)
   - Edit `src/pages/Topic/hooks/useTopicLogic.js`
   - Change back to `where("topicid", "==", topicId)`
   - Deploy hotfix
2. **Investigate**: Check Firestore for data integrity
3. **Restore from backup** if data corruption detected
4. **Re-plan migration** with additional safeguards

---

## Risk Mitigation

### Risk: Partial Migration
**Impact**: Some exams use old field, some use new field  
**Mitigation**: 
- Dual-read compatibility (app reads both fields temporarily)
- Migration script is idempotent (can re-run safely)
- Batch limit controls blast radius

### Risk: Data Loss
**Impact**: Critical exam data lost during migration  
**Mitigation**:
- Pre-migration backup required
- Dry run validates operations
- Migration script never deletes documents, only renames fields

### Risk: External Systems Still Write Old Field
**Impact**: New exams created with `topicid` after migration  
**Mitigation**:
- Coordinate with backend team to update n8n webhook
- App rules now require canonical fields (new writes will use `topicId`)
- Post-migration monitoring detects new legacy writes

---

## Post-Migration Actions

1. **Deploy Firestore rules** (if not already deployed):
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Monitor for one week**:
   - Check for exams with `topicid` field reappearing
   - Watch for user reports of missing exams
   - Validate exam navigation remains functional

3. **Update external systems** (n8n, etc.):
   - Ensure webhook handlers write `topicId` canonically
   - Test exam creation from external sources

4. **Document completion**:
   - Update Phase 02 status to COMPLETED
   - Record migration statistics
   - Archive migration logs

---

## Troubleshooting

### Exams Still Not Appearing

**Diagnosis**:
1. Check Firestore console: Do exam docs have `topicId` field?
2. Check browser console: Any query errors?
3. Check app query: Using `topicId` (not `topicid`)?

**Solutions**:
- Re-run migration if field missing
- Clear browser cache
- Verify topic ID matches between topic and exam

### Migration Script Errors

**Error**: `FIREBASE_SERVICE_ACCOUNT_JSON not set`  
**Solution**: Set environment variable with service account JSON

**Error**: `Permission denied`  
**Solution**: Verify service account has Firestore write permissions

**Error**: `Collection not found`  
**Solution**: Verify collection name is correct (`exams`)

---

## Success Metrics

- ✅ 100% of exams migrated to use `topicId`
- ✅ 0% of exams retain legacy `topicid` field
- ✅ App query returns expected exam count
- ✅ No user-facing errors or regressions
- ✅ External systems updated to write canonical fields
