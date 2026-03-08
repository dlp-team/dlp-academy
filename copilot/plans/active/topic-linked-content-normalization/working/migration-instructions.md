<!-- copilot/plans/active/topic-linked-content-normalization/working/migration-instructions.md -->
# Migration Instructions - Exams topicId Normalization

## Quick Start

### Prerequisites
1. Node.js installed
2. Firebase Admin SDK access configured
3. Firestore backup created

### Environment Setup

Create or update `.env` file in project root:

```env
# Option 1: Service account JSON (preferred for CI/CD)
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'

# Option 2: Service account file path (preferred for local development)
FIREBASE_SERVICE_ACCOUNT_PATH=./path/to/serviceAccountKey.json

# Migration control
DRY_RUN=true  # Set to false for live run
```

### Migration Commands

**1. Dry Run (Preview Changes)**
```bash
# Windows PowerShell
$env:DRY_RUN="true"; node scripts/migrate-exams-topicid.cjs

# Linux/Mac/WSL
DRY_RUN=true node scripts/migrate-exams-topicid.cjs
```

**2. Live Migration (Apply Changes)**
```bash
# Windows PowerShell
$env:DRY_RUN="false"; node scripts/migrate-exams-topicid.cjs

# Linux/Mac/WSL
DRY_RUN=false node scripts/migrate-exams-topicid.cjs
```

---

## What the Migration Does

### Collection: `exams`

**Changes Applied**:
1. Renames `topicid` → `topicId` (if field exists)
2. Renames `topic_id` → `topicId` (if field exists)
3. Renames `subject_id` → `subjectId` (if field exists)
4. Removes source fields after successful copy

**Safety Features**:
- Dry run mode (default) shows changes without applying
- Won't overwrite existing canonical fields
- Batch processing with configurable limits
- Detailed logging of all operations

---

## Expected Output

### Dry Run Output
```
=================================================
Exams topicId Normalization Migration
=================================================
Config: scripts/migrations/exams-topicid-normalization.cjs
Dry run: YES (no changes will be made)
=================================================

Migration: exams-topicid-normalization
Running in DRY RUN mode. No writes will occur.

Collection: exams
  Found 15 documents to process
  
  Document: exam_001
    topicid -> topicId (rename)
  
  Document: exam_002
    topicid -> topicId (rename)
    subject_id -> subjectId (rename)

... (more documents)

Summary:
  Total documents: 15
  Documents to modify: 15
  Fields renamed: 18
  Batch commits: 0 (dry run)

Migration completed successfully.
```

### Live Run Output
```
=================================================
Exams topicId Normalization Migration
=================================================
Config: scripts/migrations/exams-topicid-normalization.cjs
Dry run: NO (changes will be applied)
=================================================

Migration: exams-topicid-normalization
Running in LIVE mode. Changes will be written to Firestore.

Collection: exams
  Processing batch 1...
  Committed batch 1 (15 documents)

Summary:
  Total documents: 15
  Documents modified: 15
  Fields renamed: 18
  Batch commits: 1

Migration completed successfully.
```

---

## Verification Steps

### 1. Check Firestore Console
1. Navigate to Firestore in Firebase console
2. Open `exams` collection
3. Select a random exam document
4. Verify fields:
   - ✅ `topicId` exists (camelCase)
   - ❌ `topicid` does NOT exist (removed)
   - ❌ `topic_id` does NOT exist (removed)

### 2. Test App Functionality
1. Log into DLP Academy
2. Navigate to any subject → any topic
3. Check uploads tab for exam cards
4. Click an exam card
5. Verify exam page loads correctly

### 3. Run Verification Query
Use Firebase Admin SDK or Firestore console:

```javascript
// Count exams with new canonical field
db.collection('exams')
  .where('topicId', '!=', null)
  .get()
  .then(snap => console.log('Exams with topicId:', snap.size));

// Verify no exams with old field (should return 0)
db.collection('exams')
  .where('topicid', '!=', null)
  .get()
  .then(snap => console.log('Exams with topicid:', snap.size));
```

---

## Troubleshooting

### Issue: "FIREBASE_SERVICE_ACCOUNT_JSON not set"

**Problem**: Environment variable not configured  
**Solution**: 
```bash
# Set in PowerShell
$env:FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

# Or use file path
$env:FIREBASE_SERVICE_ACCOUNT_PATH="./serviceAccountKey.json"
```

### Issue: "Permission denied"

**Problem**: Service account lacks Firestore write permissions  
**Solution**: In Firebase console:
1. Go to IAM & Admin → Service Accounts
2. Find your service account
3. Add role: "Cloud Datastore User" or "Owner"

### Issue: No documents modified

**Problem**: Exams already have canonical fields OR collection is empty  
**Solution**: 
- Check Firestore console for exam documents
- Verify field names in existing documents
- Confirm migration hasn't already been run

### Issue: Exams still not showing in app

**Problem**: Migration ran but app still can't find exams  
**Solution**:
1. Clear browser cache and reload
2. Check browser console for errors
3. Verify topic ID in URL matches exam's `topicId` field
4. Confirm app query uses `topicId` (not `topicid`)

---

## Rollback Instructions

If something goes wrong and you need to revert:

### Option 1: Restore from Backup
1. Go to Firebase console → Firestore → Import/Export
2. Select backup created before migration
3. Restore to current database
4. Wait for restore to complete

### Option 2: Manual Field Rename (if backup unavailable)
Create a reverse migration script:
```javascript
// Manually rename fields back
// topicId -> topicid
// subjectId -> subject_id
```

**Warning**: Manual rollback is error-prone. Always create backups before migration.

---

## Post-Migration

### Required Actions
1. ✅ Deploy updated Firestore rules (already done in Phase 01)
2. ✅ Update external systems (n8n webhook) to write canonical fields
3. ✅ Monitor for one week for issues
4. ✅ Document completion in Phase 02 notes

### Optional Cleanup
- Archive migration logs
- Remove temporary compatibility code (if added)
- Update API documentation to reflect canonical schema
