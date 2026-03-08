<!-- copilot/explanations/temporal/lossless-reports/2026-03-08/topic-linked-content-phase-01.md -->
# Lossless Change Report: Topic-Linked Content Phase 01

**Date**: 2026-03-08  
**Plan**: Topic-Linked Content Normalization  
**Phase**: Phase 01 - App Contract Normalization  
**Scope**: Normalize exams query to use canonical `topicId` field and align security rules with other topic-linked collections

---

## Requested Scope

1. Fix exams query in `useTopicLogic.js` to use `topicId` instead of `topicid` (lowercase)
2. Update Firestore rules for `/exams` to match relational security model used by `/quizzes` and `/documents`
3. Add Firestore naming convention (English only) to `copilot-instructions.md`

## Preserved Behaviors

### useTopicLogic.js
- ✅ All existing query patterns for documents, resumen, and quizzes unchanged
- ✅ Topic data loading flow unchanged
- ✅ Exam data merging into topic state unchanged
- ✅ Error handling and logging pattern preserved
- ✅ All other hooks, handlers, and state management unchanged

### firestore.rules
- ✅ All existing rules for subjects, folders, topics, documents, quizzes, resumen, shortcuts unchanged
- ✅ Helper functions (hasTopicRef, topicRef, topicInstitutionMatches) unchanged
- ✅ Institution boundary enforcement unchanged
- ✅ Rules structure and syntax unchanged

### copilot-instructions.md
- ✅ All existing content and structure preserved
- ✅ Only added new bullet point in Firebase Patterns section

---

## Files Touched

### 1. `src/pages/Topic/hooks/useTopicLogic.js`

**Change**: Updated exams query to use canonical `topicId` field

**Before**:
```javascript
const examsQ = query(collection(db, "exams"), where("topicid", "==", topicId));
```

**After**:
```javascript
const examsQ = query(collection(db, "exams"), where("topicId", "==", topicId));
```

**Impact**:
- Exams now query using canonical camelCase field name
- Aligns with documents, resumen, and quizzes query patterns
- Console logs updated to reflect canonical field name
- Comment updated to clarify relational approach

**Verification**:
- ✅ No syntax errors
- ✅ Query structure unchanged (still filters by topicId)
- ✅ Error handling preserved
- ✅ State update pattern preserved

---

### 2. `firestore.rules`

**Change**: Updated `/exams` security rules to match relational model

**Before**:
```javascript
match /exams/{examId} {
  allow read: if isSignedIn();
  allow write: if isSignedIn();
}
```

**After**:
```javascript
match /exams/{examId} {
  allow create: if isSignedIn()
    && (
      isGlobalAdmin()
      || (
        hasTopicRef(request.resource.data)
        && topicInstitutionMatches(topicRef(request.resource.data))
        && request.resource.data.institutionId == currentUserInstitutionId()
      )
      || request.resource.data.ownerId == request.auth.uid
    );

  allow read: if isSignedIn()
    && (
      canReadResource(resource.data)
      || (
        hasTopicRef(resource.data)
        && topicInstitutionMatches(topicRef(resource.data))
      )
      || resource.data.ownerId == request.auth.uid
    );

  allow update: if isSignedIn()
    && (
      isGlobalAdmin()
      || (
        hasTopicRef(resource.data)
        && topicInstitutionMatches(topicRef(resource.data))
      )
      || resource.data.ownerId == request.auth.uid
    );

  allow delete: if isSignedIn()
    && (
      isGlobalAdmin()
      || resource.data.ownerId == request.auth.uid
      || (
        hasTopicRef(resource.data)
        && topicInstitutionMatches(topicRef(resource.data))
      )
    );
}
```

**Impact**:
- Exams now enforce tenant boundaries via topic linkage
- Ownership validation added
- Institution matching required for access
- Security posture aligned with quizzes/documents

**Verification**:
- ✅ No syntax errors
- ✅ Uses existing helper functions (hasTopicRef, topicInstitutionMatches)
- ✅ Pattern matches quizzes rules exactly
- ✅ All other collection rules unchanged

---

### 3. `.github/copilot-instructions.md`

**Change**: Added Firestore naming convention to Firebase Patterns section

**Before**:
```markdown
### Firebase Patterns
- **Collections**: camelCase (e.g., `institutionUsers`, `studyTopics`)
- **Query structure**: Use `where()` clauses for `institutionId` scoping
```

**After**:
```markdown
### Firebase Patterns
- **Collections**: camelCase (e.g., `institutionUsers`, `studyTopics`)
- **Naming Language**: All Firestore collection names, document field names, and schema identifiers must be in English for consistency and professionalism (e.g., `quizzes`, `documents`, `exams`, not `cuestionarios`, `documentos`, `exámenes`)
- **Query structure**: Use `where()` clauses for `institutionId` scoping
```

**Impact**:
- Codifies English-only naming convention
- Provides clear examples
- Centralizes the rule in main instructions file

**Verification**:
- ✅ No syntax errors
- ✅ All other sections unchanged
- ✅ Formatting preserved

---

## Validation Summary

### Code Quality
- ✅ `get_errors` clean for all touched files
- ✅ No TypeScript/linting issues
- ✅ No import/dependency errors

### Functional Integrity
- ✅ Exams query now uses canonical field
- ✅ Security rules enforce tenant boundaries
- ✅ All existing functionality preserved
- ✅ No breaking changes to adjacent code

### Documentation
- ✅ Lossless report created
- ✅ Phase 01 completion notes added
- ✅ Plan status updated
- ✅ Naming convention documented

---

## Known Limitations

1. **Legacy data compatibility**: Exams with `topicid` (lowercase) will not be returned by the new query until migrated
2. **External write paths**: If exams are created externally (e.g., n8n), those systems must use canonical `topicId` field
3. **Migration required**: Phase 02 will backfill and migrate legacy field names

---

## Next Steps

1. Phase 02: Data migration to backfill canonical fields and remove legacy keys
2. Phase 03: Deploy Firestore rules and verify with role-based testing
3. Phase 04: Remove temporary compatibility once migration verified
4. Phase 05: Final review gate before closure
