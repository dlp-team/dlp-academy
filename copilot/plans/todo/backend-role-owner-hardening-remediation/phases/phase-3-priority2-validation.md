<!-- copilot/plans/todo/backend-role-owner-hardening-remediation/phases/phase-3-priority2-validation.md -->
# Phase 3: Priority 2 — Field Immutability & Ownership Validation

**Duration:** 45 min
**Objective:** Ensure server-controlled fields cannot be manipulated and ownership is always validated

**Status:** → QUEUEUED (after Phase 2 passing tests)

---

## Fix #1: `sharedWithUids` Immutability — `/subjects/{subjectId}`

### Problem
Students can inject arbitrary UIDs into `sharedWithUids` during creation, gaining unauthorized access to resources.

### Solution
Validate that only owner/admin can set or modify `sharedWithUids`.

```firestore
// In /subjects/{subjectId} create condition, add:
&& (!request.resource.data.keys().hasAny(['sharedWithUids'])
    || request.resource.data.sharedWithUids == []
    || (isGlobalAdmin() || resource.data.ownerId == request.auth.uid))
```

### Implementation Note
- Apply to `/subjects/`, `/folders/`, `/shortcuts/` create operations
- Also add to update operations: `request.resource.data.sharedWithUids == resource.data.sharedWithUids` (immutable after creation)

---

## Fix #2: Remove `|| true` Bypass from Shortcuts

### Problem
```firestore
&& (
  targetSharedWithShortcutOwner()
  || (
    true  // ← DANGEROUS ALWAYS-TRUE FALLBACK
  )
)
```

This allows ANY user to create a shortcut to ANY resource, regardless of access.

### Solution
Remove the `|| true` fallback and enforce actual sharing validation:

```firestore
&& (
  // Shortcut owner creating own shortcut
  request.resource.data.ownerId == request.auth.uid
  // OR: Target owner creating shortcut for a recipient (share flow)
  || (
    request.resource.data.ownerId != request.auth.uid
    && isTargetOwnerForCreate()
    && targetSharedWithShortcutOwner()  // ← ENFORCE: recipient must already be shared with target
  )
)
```

**Lines to modify:** `/shortcuts/{shortcutId}` create condition (~560)

---

## Fix #3: Quiz Results Ownership Check

### Problem
```firestore
match /quiz_results/{resultId} {
  allow read, write: if isSignedIn()
    && (isGlobalAdmin() || subjectInstitutionMatches(subjectId));
}
```

Any institution member can modify any quiz result.

### Solution
Split read/write rules based on ownership and role:

```firestore
match /quiz_results/{resultId} {
  allow read: if isSignedIn()
    && (isGlobalAdmin() || subjectInstitutionMatches(subjectId));
    
  allow write: if isSignedIn()
    && !isStudentRole()  // ← Teachers/admins can write results
    && (isGlobalAdmin() || subjectInstitutionMatches(subjectId))
    || (
      isStudentRole()  // ← Students can only read/write own results (if needed)
      && resource.data.studentId == request.auth.uid
    );
}
```

**Lines to modify:** `/subjects/.../topics/.../quiz_results/{resultId}` (~330)

---

## Fix #4: Subject Invite Code Ownership Validation

### Problem
```firestore
allow create: if isSignedIn()
  && request.resource.data.createdBy == request.auth.uid
  && (isGlobalAdmin() || institution check)
```

Only checks that createdBy equals uid, but doesn't validate that creator owns/teaches the subject.

### Solution
Add validation that creator is subject owner or teacher in institution:

```firestore
allow create: if isSignedIn()
  && request.resource.data.createdBy == request.auth.uid
  && (
    isGlobalAdmin()
    || (
      currentUserInstitutionId() != null
      && request.resource.data.institutionId == currentUserInstitutionId()
      && exists(/databases/$(database)/documents/subjects/$(request.resource.data.subjectId))
      && (
        get(/databases/$(database)/documents/subjects/$(request.resource.data.subjectId)).data.ownerId == request.auth.uid
        || (isTeacherRole() && sameInstitution(get(/databases/$(database)/documents/subjects/$(request.resource.data.subjectId)).data))
      )
    )
  );
```

**Lines to modify:** `/subjectInviteCodes/{inviteCodeKey}` create (~320)

---

## Fix #5: Ensure `enrolledStudentUids` Is Not Manipulated

### Status
Current implementation allows client to set this field arbitrarily on subject creation.

### Decision
**Keep as-is** — Students usually auto-enroll, but if strict control needed, can add:
```firestore
&& (!request.resource.data.keys().hasAny(['enrolledStudentUids'])
    || request.resource.data.enrolledStudentUids == [])
```

For now: defer to application logic (server-side auto-enrollment)

---

## Summary of Changes

| Field/Path | Vulnerability | Fix | Status |
|---|---|---|---|
| `sharedWithUids` | Client can inject arbitrary UIDs | Validate on create/update (immutable or owner-only) | Ready |
| `/shortcuts` create | `\|\| true` bypass | Remove fallback, enforce actual sharing | Ready |
| `/quiz_results` write | Any institution member can modify | Add role + ownership check | Ready |
| `/subjectInviteCodes` create | Non-owner can create invites | Validate subject ownership | Ready |
| `enrolledStudentUids` | Client can set arbitrarily | Keep as-is (application controls) | Defer |

---

## Validation (after applying fixes)

1. Run `npm run test:rules` — verify all tests still pass
2. Run new adversarial tests from Phase 4
3. Proceed to Phase 4

---

## Next Step

→ Proceed to **Phase 4: Adversarial Test Suite Expansion**
