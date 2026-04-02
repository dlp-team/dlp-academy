<!-- copilot/plans/finished/backend-role-owner-hardening-remediation/phases/phase-2-priority1-fixes.md -->
# Phase 2: Priority 1 — Role-Based Access Control Hardening

**Duration:** 45 min
**Objective:** Add `!isStudentRole()` guards to all student-sensitive write paths

**Status:** ✅ COMPLETED

---

## Implementation Checklist

### Fix #1: `/subjects/{subjectId}` create — Add role check
**Line:** ~240 in firestore.rules

```firestore
// BEFORE
allow create: if isSignedIn()
  && (
    isGlobalAdmin()
    || (
      currentUserInstitutionId() != null
      && request.resource.data.institutionId == currentUserInstitutionId()
    )
    || request.resource.data.ownerId == request.auth.uid
  )

// AFTER
allow create: if isSignedIn()
  && !isStudentRole()
  && (
    isGlobalAdmin()
    || (
      currentUserInstitutionId() != null
      && request.resource.data.institutionId == currentUserInstitutionId()
    )
    || request.resource.data.ownerId == request.auth.uid
  )
```

✅ Status: Ready to apply

---

### Fix #2: `/subjects/{subjectId}` update — Add role check
**Line:** ~260 in firestore.rules

```firestore
// BEFORE
allow update: if isSignedIn()
  && (
    canWriteResource(resource.data)
    || resource.data.ownerId == request.auth.uid
    || ...
  )

// AFTER
allow update: if isSignedIn()
  && !isStudentRole()
  && (
    canWriteResource(resource.data)
    || resource.data.ownerId == request.auth.uid
    || ...
  )
```

✅ Status: Ready to apply

---

### Fix #3: `/subjects/.../topics/{topicId}` write — Add role check
**Line:** ~290 in firestore.rules

```firestore
// BEFORE
match /topics/{topicId} {
  allow read, write: if isSignedIn()
    && (isGlobalAdmin() || subjectInstitutionMatches(subjectId));

// AFTER
match /topics/{topicId} {
  allow read: if isSignedIn()
    && (isGlobalAdmin() || subjectInstitutionMatches(subjectId));
  allow write: if isSignedIn()
    && !isStudentRole()
    && (isGlobalAdmin() || subjectInstitutionMatches(subjectId));
```

✅ Status: Ready to apply

---

### Fix #4: `/topics/{topicId}` create — Add role check
**Line:** ~355 in firestore.rules

```firestore
// BEFORE
allow create: if isSignedIn()
  && (
    isGlobalAdmin()
    || (...)
  );

// AFTER
allow create: if isSignedIn()
  && !isStudentRole()
  && (
    isGlobalAdmin()
    || (...)
  );
```

✅ Status: Ready to apply

---

### Fix #5: `/topics/{topicId}` update — Add role check
**Line:** ~370 in firestore.rules

```firestore
// BEFORE
allow update: if isSignedIn()
  && (
    isGlobalAdmin()
    || (...)
  );

// AFTER
allow update: if isSignedIn()
  && !isStudentRole()
  && (
    isGlobalAdmin()
    || (...)
  );
```

✅ Status: Ready to apply

---

### Fix #6: `/documents/{documentId}` create — Add role check
**Line:** ~390 in firestore.rules

```firestore
// BEFORE
allow create: if isSignedIn()
  && (
    isGlobalAdmin()
    || (...)
  );

// AFTER
allow create: if isSignedIn()
  && !isStudentRole()
  && (
    isGlobalAdmin()
    || (...)
  );
```

✅ Status: Ready to apply

---

### Fix #7: `/documents/{documentId}` update — Add role check
**Line:** ~410 in firestore.rules

```firestore
// BEFORE
allow update: if isSignedIn()
  && (
    isGlobalAdmin()
    || (...)
  );

// AFTER
allow update: if isSignedIn()
  && !isStudentRole()
  && (
    isGlobalAdmin()
    || (...)
  );
```

✅ Status: Ready to apply

---

### Fix #8: `/quizzes/{quizId}` create — Add role check
**Line:** ~480 in firestore.rules

```firestore
// BEFORE
allow create: if isSignedIn()
  && (
    isGlobalAdmin()
    || (...)
  );

// AFTER
allow create: if isSignedIn()
  && !isStudentRole()
  && (
    isGlobalAdmin()
    || (...)
  );
```

✅ Status: Ready to apply

---

### Fix #9: `/quizzes/{quizId}` update — Add role check
**Line:** ~500 in firestore.rules

```firestore
// BEFORE
allow update: if isSignedIn()
  && (
    isGlobalAdmin()
    || (...)
  );

// AFTER
allow update: if isSignedIn()
  && !isStudentRole()
  && (
    isGlobalAdmin()
    || (...)
  );
```

✅ Status: Ready to apply

---

### Fix #10: `/exams/{examId}` create — Add role check
**Line:** ~635 in firestore.rules

```firestore
// BEFORE
allow create: if isSignedIn()
  && (
    isGlobalAdmin()
    || (...)
  );

// AFTER
allow create: if isSignedIn()
  && !isStudentRole()
  && (
    isGlobalAdmin()
    || (...)
  );
```

✅ Status: Ready to apply

---

### Fix #11: `/exams/{examId}` update — Add role check
**Line:** ~655 in firestore.rules

```firestore
// BEFORE
allow update: if isSignedIn()
  && (
    isGlobalAdmin()
    || (...)
  );

// AFTER
allow update: if isSignedIn()
  && !isStudentRole()
  && (
    isGlobalAdmin()
    || (...)
  );
```

✅ Status: Ready to apply

---

## Summary of Changes

- **Total changes:** 11 firestore.rules modifications
- **Pattern:** Add `&& !isStudentRole()` after `isSignedIn()` check
- **Impact:** Students cannot create/update teacher-level content
- **Regression risk:** LOW (only adds restriction, doesn't change existing allowed flows)

---

## Validation (after applying fixes)

1. Read firestore.rules to confirm all 11 changes applied
2. Run `npm run test:rules` to verify tests still pass
3. Proceed to Phase 3

---

## Next Step

→ Proceed to **Phase 3: Priority 2 — Field Immutability & Ownership Validation**
