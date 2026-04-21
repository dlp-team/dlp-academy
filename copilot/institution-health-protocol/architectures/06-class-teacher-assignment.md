# Architecture 06 — Class & Teacher Assignment

> **Protocol:** ILHP v1.0.0 | **Domain:** Class & Assignment Management  
> **Last Reviewed:** 2026-04-21 | **Status:** ✅ Current  
> **Depends On:** 01 (Auth), 02 (Institution Provisioning), 03 (Teacher Management), 04 (Student Management), 05 (Subject Creation)  
> **Blocks:** 07 (Content Management — student access path)

---

## 1. Scope

This architecture covers the organizational layer of DLP Academy:
- Class document creation and structure
- Linking classes to subjects
- Adding students to classes
- Class-based subject access for students
- Teacher assignment to subjects (editor/owner model)
- Bulk operations for class management
- Class archival and lifecycle

---

## 2. Files Involved

| File | Purpose |
|------|---------|
| `src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx` | Organization tab — class management UI |
| `src/pages/InstitutionAdminDashboard/hooks/useUsers.ts` | User management + class operations |
| `src/hooks/useSubjects.ts` | Subject `classIds` update operations |
| `firestore.rules` | `classes` and `subjects` rules for class operations |

---

## 3. Class Document Structure (Firestore: `classes` collection)

```typescript
{
  id: string,            // Auto-generated Firestore document ID
  name: string,          // "Clase A Test"
  institutionId: string, // Must match creating institution admin's institutionId
  
  studentIds: string[],  // Array of student UIDs enrolled in this class
  status: 'active' | 'archived',
  
  createdAt: Timestamp,
  updatedAt?: Timestamp
}
```

**Note:** The class document does NOT store `subjectIds` directly. The relationship is stored on the **subject side**: `subjects/{id}.classIds`. This is a one-to-many from class perspective (one class → many subjects can reference it), but subjects own the relationship.

---

## 4. Class Creation Flow

### 4.1 Create Class (Institution Admin)

```typescript
// InstitutionAdminDashboard — Organization Tab
await addDoc(collection(db, 'classes'), {
  name: 'Clase A Test',
  institutionId: user.institutionId,
  studentIds: [],
  status: 'active',
  createdAt: serverTimestamp()
})
```

**Firestore Rule to Verify:**
```firestore
// classes/{classId} create:
// Allow if:
//   - isInstitutionAdmin() AND request.resource.data.institutionId == currentUserInstitutionId()
//   - isGlobalAdmin()
```

**Failure Mode:** If the rule does not check `institutionId` on create, an institution admin could create a class in another institution's space.

### 4.2 Class Visibility

Classes must be queryable by institution admin:
```typescript
query(
  collection(db, 'classes'),
  where('institutionId', '==', institutionId)
)
```

**Firestore Rule to Verify (Read):**
```firestore
// classes/{classId} read:
// Allow if: isInstitutionAdmin() AND sameInstitution(resource.data)
//         OR isGlobalAdmin()
//         OR isTeacherRole() AND sameInstitution() (teachers may need to see their classes)
```

---

## 5. Adding Students to a Class

### 5.1 Individual Student Addition

```typescript
// Institution admin adds student to class:
await updateDoc(doc(db, 'classes', classId), {
  studentIds: arrayUnion(studentUid)
})
```

**Firestore Rule to Verify:**
```firestore
// classes/{classId} update:
// Allow if: isInstitutionAdmin() AND sameInstitution(resource.data)
//           AND only modifying studentIds (other fields locked to admin edits)
```

**Failure Mode:** If the rule allows any field update (not just `studentIds`), an admin could accidentally rename a class or change its `institutionId` via a direct Firestore write.

### 5.2 Bulk Student Assignment

The institution admin dashboard may support bulk assignment of multiple students to a class at once (CSV or multi-select).

**n8n Integration Note:** `src/services/n8nService.ts` handles CSV import workflows. If CSV import is used to add students to classes, verify:
1. n8n webhook URL is not exposed in the frontend bundle
2. n8n integration respects institution scoping
3. Failed CSV rows are clearly reported to the admin

---

## 6. Linking Classes to Subjects

### 6.1 Subject `classIds` Update

When a class is linked to a subject, the subject's `classIds` array is updated:

```typescript
// useSubjects.ts — updateSubject() or dedicated linkClassToSubject():
await updateDoc(doc(db, 'subjects', subjectId), {
  classIds: arrayUnion(classId)
})
```

**Firestore Rule to Verify:**
```firestore
// subjects/{subjectId} update:
// Allow if: isOwner OR isEditor OR isInstitutionAdmin()
//   AND sameInstitution(resource.data)
```

### 6.2 How Students Access Subjects via Classes

The relationship chain:
```
class.studentIds → [student UIDs]
subject.classIds → [class IDs]

Student can access subject IF:
  subject.classIds.includes(classId) 
  AND classes[classId].studentIds.includes(student.uid)
```

**Critical Architecture Decision:** This two-hop relationship means the Firestore security rule for `subjects` read must either:

**Option A:** Check both hops in the rule (expensive — requires two Firestore `get()` calls per rule evaluation)

**Option B:** Trust app-level logic to populate `enrolledStudentUids` when a student is added to a class linked to a subject

**Option B Risk:** If the app logic fails (bug, race condition), `enrolledStudentUids` and class membership diverge. Students may lose subject access or gain it erroneously.

**Audit Check (Critical):** When Student 1 is added to Clase A Test (which is linked to Matemáticas Test), is `subjects/{id}.enrolledStudentUids` automatically updated to include Student 1's UID? Or does the system only rely on the `classIds` array?

If the system uses two separate data sources (classIds + enrolledStudentUids), a sync mechanism must exist and must be tested.

---

## 7. Teacher Assignment to Subjects

Teachers become subject owners by creating the subject. They can also be added as editors by the institution admin or subject owner.

### 7.1 Editor Assignment

```typescript
// Adding a teacher as subject editor:
await updateDoc(doc(db, 'subjects', subjectId), {
  editorUids: arrayUnion(teacherUid)
})
```

**Audit Check:** Verify the institution admin can assign a second teacher to a subject as an editor. Verify the assigned teacher sees the subject on their home page with edit access (not just view).

### 7.2 Editor Permissions

```typescript
// permissionUtils.ts — canEdit(item, userId):
return item.ownerId === userId || item.editorUids?.includes(userId)
```

An editor can:
- Create/edit/delete topics
- Upload resources
- Manage quizzes
- Edit subject settings

An editor CANNOT:
- Delete the subject (only owner can)
- Change the subject's `ownerId`

---

## 8. Class Archival

```typescript
// Archiving a class:
await updateDoc(doc(db, 'classes', classId), {
  status: 'archived'
})
```

**Post-Archival Behavior:**
- Archived classes should not appear in active class lists
- Students in archived classes — do they lose subject access?
- If `subject.classIds` still contains the archived class ID, the two-hop access logic may still grant students access unless the system explicitly filters for `status: 'active'` classes

**Audit Check:** Archive a class. Verify students previously in that class lose subject access (or verify the intended behavior is documented).

---

## 9. Known Failure Modes Summary

| ID | Failure | Severity | Trigger | Detection |
|----|---------|----------|---------|-----------|
| CA-01 | Class created in wrong institution | CRITICAL | Missing `institutionId` check in Firestore rule | Students from different institutions could see class |
| CA-02 | `enrolledStudentUids` not synced when student added to class | CRITICAL | Two-hop logic only; no sync mechanism | Students in class but cannot read subject in Firestore |
| CA-03 | Students retain subject access after class archival | MEDIUM | Archived `classIds` still reference subject | Unintended access after academic period ends |
| CA-04 | Teacher not added as editor loses subject visibility | HIGH | `editorUids` not updated correctly | Teacher cannot manage their assigned subject |
| CA-05 | Bulk CSV import adds students to wrong class | HIGH | n8n integration bug or wrong mapping | Students enrolled in wrong classes |
| CA-06 | Race condition on concurrent `arrayUnion` to `studentIds` | LOW | Multiple simultaneous student additions | Some additions silently dropped |

---

## 10. Manual Check Sequence

Refer to **Phase 6** in [MASTER_CHECKLIST.md](../MASTER_CHECKLIST.md).

---

## 11. Automated Test Coverage

| Test File | Coverage |
|-----------|---------|
| `tests/e2e/home-sharing-operations.spec.ts` | Sharing/assignment workflows |
| `tests/e2e/home-sharing-roles.spec.ts` | Role-based access after assignment |

**Coverage Gaps:**
- No dedicated test for class creation and student assignment
- No test for the two-hop student-via-class subject access (UI vs. Firestore consistency)
- No test for class archival and its effect on student subject access
- No test for `enrolledStudentUids` sync when students are added to a linked class

---

## 12. Validation Criteria

| Criterion | Method |
|-----------|--------|
| Class document created | Firestore `classes/{id}` query |
| `institutionId` matches institution | Field comparison |
| Students added to `studentIds` | Firestore doc check after add |
| Subject `classIds` contains class ID | Field comparison |
| Student 1 sees Matemáticas Test after class enrollment | UI check |
| Student 3 does NOT see Matemáticas Test (not in Clase A) | UI check |
| Second teacher assigned as editor sees subject | UI check |

---

## 13. Security Boundary Analysis

| Boundary | Risk | Mitigation |
|---------|------|-----------|
| Class creation by teacher | Teachers should not create institution-wide classes | Firestore rule: only institutionadmin/admin can create classes |
| Student added to class in different institution | Cross-tenant enrollment | `sameInstitution()` check on class update |
| Direct subject access via classIds manipulation | Teacher edits their own `classIds` to include unrelated class | Firestore rule: only class owner's institutionId class can be linked |
| Class archival without access revocation | Students retain access to closed-year subjects | App must filter archived classes in access check |
