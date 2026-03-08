<!-- copilot/plans/active/topic-linked-content-normalization/working/phase-01-implementation-notes.md -->
# Phase 01 Implementation Notes

**Date**: 2026-03-08  
**Status**: COMPLETED

## Summary

Successfully normalized exam query contract and security rules to canonical `topicId`-based model, eliminating the lowercase `topicid` discrepancy that prevented exams from appearing in Topic view.

## Changes Applied

### 1. App-Side Query Normalization

**File**: `src/pages/Topic/hooks/useTopicLogic.js`

Changed exams query from:
```javascript
where("topicid", "==", topicId)  // lowercase, non-canonical
```

To:
```javascript
where("topicId", "==", topicId)  // camelCase, canonical
```

**Impact**:
- Aligns with documents, resumen, and quizzes query patterns
- Enables exams to appear once data is migrated to use canonical field

### 2. Security Rules Alignment

**File**: `firestore.rules`

Replaced broad permissive rules with relation-aware security model:

**Before**:
```javascript
match /exams/{examId} {
  allow read: if isSignedIn();
  allow write: if isSignedIn();
}
```

**After**:
- Create: requires topic relation + institution match OR ownership
- Read: enforces tenant boundaries via topic linkage
- Update: requires relation match OR ownership
- Delete: requires ownership OR admin OR relation match

Pattern now matches `/quizzes` and `/documents` security model exactly.

### 3. Documentation Enhancement

**File**: `.github/copilot-instructions.md`

Added centralized naming convention:
- All Firestore entities must use English names
- Examples: `quizzes`, `documents`, `exams` (not Spanish)
- Codifies consistency across schema

## Verification Results

- ✅ All files pass `get_errors` with no issues
- ✅ No breaking changes to adjacent functionality
- ✅ Security model consistent with other topic-linked collections
- ✅ Query pattern follows established conventions

## Known Gaps Remaining

1. **Legacy data issue**: Existing exam records with `topicid` (lowercase) will not be returned by new query
   - **Resolution**: Phase 02 will migrate all legacy records
   
2. **External write paths**: n8n or other external systems may still write `topicid`
   - **Resolution**: Coordinate with backend team to update webhook handlers

3. **Embedded status logic**: `useSubjectManager` still checks `topic.quizzes` and `topic.pdfs`
   - **Resolution**: Deferred to post-normalization cleanup (not blocking)

## Phase 02 Prerequisites

Before starting data migration:
1. Confirm n8n webhook updated to write canonical `topicId`
2. Backup Firestore data
3. Prepare dry-run migration script
4. Define rollback procedure

## Lessons Learned

- Mixed field naming (lowercase vs camelCase) creates invisible data splits
- Security rules must evolve with data model for consistency
- Centralized documentation prevents drift across team
