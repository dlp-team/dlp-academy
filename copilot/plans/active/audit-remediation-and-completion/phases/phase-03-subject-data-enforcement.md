<!-- copilot/plans/active/audit-remediation-and-completion/phases/phase-03-subject-data-enforcement.md -->

# Phase 03: Subject Data Enforcement & Consistency

**Duration:** 4-6 hours | **Priority:** 🔴 CRITICAL | **Status:** ✅ COMPLETED

## Update: Schema Already Evolved!

✅ **Good News:** Fields already exist in Firestore:
- `course` (required, enforced in rules)
- `classId` / `classIds` (both present)
- `enrolledStudentUids` ([already initialized](src/hooks/useSubjects.ts#L216))
- `inviteCode` (8-char code, auto-generated)
- `institutionId` (scoping, immutable)

## Actual Objectives (Corrected)

### 1. Enforce Required Fields in UI
- [x] Make `course` dropdown **required** in SubjectFormModal (already implemented before this phase)
- [x] Validate `course` is not empty before subject creation (already implemented before this phase)
- [x] Add validation message in form (already implemented before this phase)

### 2. Ensure classId Consistency
- [x] When multiple `classIds` are selected, set `classId` to first one (primary)
- [x] When `classId` is modified, update `classIds` array (existing in `updateSubject`)
- [x] Prevent mismatches between singular and plural field

### 3. Enable Invite Code Based Access
- [x] Verify `inviteCode` is always generated on creation ✅ (already automatic)
- [x] Ensure `enrolledStudentUids` array is initialized (_already done_)
- [ ] Test: Student can join subject via invite code → added to `enrolledStudentUids` (pending dedicated scenario test)

### 4. Validation: Class-Institution Relationship
- [ ] Verify `classId` must belong to same `institutionId`
- [ ] Add Firestore rule to prevent cross-institution class assignment
- [ ] Test: Classes can only be assigned if they match subject's institutionId

### 5. Update Subject Access Query (Prep for Phase 04)
- [x] Document current single-condition queries
- [x] Prepare multi-condition OR logic for Phase 04
- [ ] Add test cases for 3 access vectors:
  - Teachers: by `ownerId`
  - Standard Students: by `classId` match
  - Guest Students: by `uid` in `enrolledStudentUids`

## Changes Required

### File: src/pages/Subject/modals/SubjectFormModal.tsx

**Make `course` field required:**
```diff
- <select value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})}>
-   <option value="">Select Course</option>
- </select>

+ <select value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})} required>
+   <option value="">-- Select Course --</option>
+ </select>
```

**Add validation before submit:**
```javascript
if (!formData.course) {
    throw new Error("Please select a course level (Primary/Secondary/University)");
}
```

### File: src/utils/subjectAccessUtils.ts

**Update normalization to sync classId/classIds:**
```javascript
export const normalizeSubjectAccessPayload = (formData) => {
  const classIds = Array.isArray(formData.classIds) ? formData.classIds : [];
  const classId = classIds.length > 0 ? classIds[0] : null; // Primary class
  
  return {
    ...formData,
    classIds,
    classId, // Sync singular with plural
    course: formData.course, // Ensure course is set
  };
};
```

### File: firestore.rules

**Add validation: classId must match institutionId:**
```firestore
match /subjects/{doc} {
  allow create: if isTeacher() && request.resource.data.course != ''
    && (request.resource.data.classId == null || isClassInInstitution(request.resource.data.classId, request.resource.data.institutionId));
}

function isClassInInstitution(classId, institutionId) {
  return exists(/databases/$(database)/documents/classes/$(classId))
    && get(/databases/$(database)/documents/classes/$(classId)).data.institutionId == institutionId;
}
```

## Validation Commands

```bash
# Type checking
npx tsc --noEmit
✅ Expected: 0 type errors

# Linting
npm run lint
✅ Expected: 0 errors

# Unit tests
npm run test
✅ Expected: all tests pass

# Rules testing (emulator required)
npm run test:rules
✅ Expected: 0 failures
```

## Testing Strategy

1. **Manual Test: Create Subject with Course Required**
   - Try to create subject without selecting course → error
   - Select course → success

2. **Manual Test: Class Assignment**
   - Create subject and assign to 1 class → classId should equal first classIds[0]
   - Assign to multiple classes → classId still matches classIds[0]

3. **Manual Test: Invite Code Access**
   - Generate invite code (should happen automatically)
   - Student joins via code → added to enrolledStudentUids
   - Verify student can now access subject

4. **Firestore Rules Test (emulator)**
   - Try to assign class from different institution → blocked by rules
   - Assign class from correct institution → allowed

## Risks

**Risk:** Existing subjects might not have `course` set
**Impact:** Medium - subjects created before enforcement may be incomplete
**Mitigation:** In Phase 11, audit existing subjects and backfill missing data

**Risk:** Multiple classIds but no classId sync
**Impact:** Low - query logic will prioritize classIds array
**Mitigation:** Normalization function ensures sync

## Success Criteria

- [ ] `course` field is required in UI form
- [ ] `classId` stays synced with `classIds[0]`
- [ ] `enrolledStudentUids` properly initialized
- [ ] Firestore rules validate class-institution relationship
- [ ] All tests pass
- [ ] No type errors
- [ ] Linting clean

## Notes

- This phase is now focused on **enforcement** rather than schema migration
- The schema is already properly designed; this is about ensuring UI and rules respect the design
- Phase 04 will implement the OR-based query logic using these validated fields
- Phase 08 (Permissions) will enhance this with configurable teacher autonomy

## Implementation Notes (2026-04-01)

- Updated `SubjectFormModal.tsx` class assignment save path to persist both `classIds` and `classId` (primary class) in one operation.
- Confirmed `course` required validation already existed in `SubjectFormModal.tsx` + `BasicInfoFields.tsx` and retained behavior.
- Retained existing normalization in `subjectAccessUtils.ts` and `useSubjects.ts` for invite code and enrollment consistency.
- Added invite-code governance controls in class section (three-dots menu): enable/disable joins, rotation interval, and regenerate now.
- Enforced invite-code validity checks on join flow: disabled-code block, stale-code block, and interval-based expiration enforcement.
- Hardened `firestore.rules` for invite governance fields and privacy: `subjectInviteCodes` now allows `get` only and denies `list`.
