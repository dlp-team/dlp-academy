# Architecture 07 — Content Management

> **Protocol:** ILHP v1.0.0 | **Domain:** Content Lifecycle  
> **Last Reviewed:** 2026-04-21 | **Status:** ✅ Current  
> **Depends On:** 01 (Auth), 02 (Institution Provisioning), 03 (Teacher Management), 05 (Subject Creation)  
> **Blocks:** None (terminal architecture in content flow)

---

## 1. Scope

This architecture covers all content within subjects:
- Topic creation (with auto-numbering and ordering)
- Document resource upload and storage
- Material resources
- Quiz creation, structure, and lifecycle
- Quiz taking by students and result storage
- Topic deletion (cascade logic)
- Content access permissions by role
- Content state management (generating, active)

---

## 2. Files Involved

| File | Purpose |
|------|---------|
| `src/pages/Subject/` | Subject detail page (topic list view) |
| `src/pages/Topic/` | Topic detail page (content view) |
| `src/pages/Quizzes/` | Quiz-taking interface |
| `src/hooks/useSubjectManager.ts` | Topic creation, content management |
| `src/utils/topicDeletionUtils.ts` | Cascade delete logic for topics and subcollections |
| `src/pages/ViewResource/` | Document/material viewer |
| `firestore.rules` | Topic, material, document, quiz, quiz_results rules |

---

## 3. Data Model — Topic Hierarchy

```
subjects/{subjectId}
└── (Subject document)

topics/{topicId}
├── (Topic document)
├── resumen/                 ← AI-generated or teacher-written summary
│   └── {summaryId}
├── materials/               ← Links, embedded media, etc.
│   └── {materialId}
├── documents/               ← File uploads (PDFs, images, etc.)
│   └── {documentId}
├── quizzes/                 ← Quiz definitions
│   └── {quizId}
└── quiz_results/            ← Student quiz submissions
    └── {resultId}
```

**Note:** Topics are stored in the ROOT `topics` collection, NOT as a subcollection of subjects. They reference their parent via `subjectId` field. This is important for Firestore query efficiency.

---

## 4. Topic Document Structure (Firestore: `topics` collection)

```typescript
{
  id: string,

  // Hierarchy
  subjectId: string,          // Parent subject reference

  // Display
  name: string,               // "Álgebra Básica"
  number: string,             // Zero-padded: "01", "02", "10"
  order: number,              // Numeric order for sorting

  // Ownership & Scope
  ownerId: string,            // Inherits from subject.ownerId
  institutionId: string | null,

  // Generation State
  status: 'active' | 'generating',
  // 'generating' = topic is being processed (AI or other async process)
  // 'active' = topic is fully ready

  // Presentation
  color?: string,             // Inherited from subject.color
  prompt?: string,            // AI generation prompt if applicable

  createdAt: Timestamp
}
```

---

## 5. Topic Creation Flow

### 5.1 Create Topic

**File:** `useSubjectManager.ts` — `createTopic(data, files)`

```typescript
// Step 1: Fetch subject to inherit metadata
const subject = await getDoc(doc(db, 'subjects', subjectId))
const { color, ownerId, institutionId, topicCount } = subject.data()

// Step 2: Calculate order
const nextOrder = (topicCount || 0) + 1

// Step 3: Create topic document
const topicRef = await addDoc(collection(db, 'topics'), {
  name: data.name,
  prompt: data.prompt,
  status: 'generating',          // ← Set to 'generating' initially
  color: color,
  order: nextOrder,
  number: String(nextOrder).padStart(2, '0'),
  subjectId: subjectId,
  ownerId: ownerId || user.uid,
  institutionId: institutionId || user.institutionId,
  createdAt: serverTimestamp()
})

// Step 4: Increment subject.topicCount atomically
await updateDoc(doc(db, 'subjects', subjectId), {
  topicCount: increment(1)
})

// Step 5: If files provided → create documents in subcollection
if (files && files.length > 0) {
  for (const file of files) {
    // Upload to Firebase Storage
    // Create document in topics/{topicId}/documents/
  }
}
```

**Critical Failure Mode — Non-Atomic Sequence:** Steps 3 and 4 are NOT atomic (no transaction). If step 3 succeeds but step 4 fails, `topicCount` will be stale. The next topic will get the same `order` number as the failed-to-increment topic.

**Failure Mode — Topic Stuck in `generating` State:** If the AI generation process (or whatever sets status to `active`) fails, the topic remains in `generating` indefinitely. The UI must handle this state gracefully (show a loading indicator, provide a retry or dismiss action).

**Failure Mode — `ownerId` Inheritance:** If the subject document has a null or undefined `ownerId`, the topic inherits `null`. Topics with `null` ownerId will fail Firestore permission checks that verify ownership.

---

## 6. Document Resource Subcollection

**Firestore Path:** `topics/{topicId}/documents/{documentId}`

```typescript
{
  id: string,
  name: string,                 // Display name
  url: string,                  // Firebase Storage download URL
  storagePath: string,          // Firebase Storage path (for deletion)
  fileType: string,             // MIME type
  fileSize: number,             // Bytes
  ownerId: string,
  institutionId: string | null,
  createdAt: Timestamp
}
```

**Firestore Rules to Verify:**
```firestore
// topics/{topicId}/documents/{docId}:
// Create: Teacher/admin (not student)
// Read: Anyone who can read the parent topic
// Delete: Owner or institution admin
```

**Storage Rules to Verify:**
```firestore
// storage.rules:
// Upload: Only authenticated non-students
// Read: Enrolled students of the parent subject (or all authenticated users?)
// Delete: Only uploader or admin
```

**Audit Check:** Upload a PDF as Teacher A. Log in as Student 1 (enrolled in the subject). Verify the document is visible and downloadable. Log in as Student 3 (NOT enrolled). Verify the document is NOT accessible.

---

## 7. Quiz Document Structure

**Firestore Path:** `topics/{topicId}/quizzes/{quizId}`

```typescript
{
  id: string,
  title: string,
  description?: string,
  questions: Array<{
    id: string,
    text: string,
    type: 'multiple-choice' | 'true-false' | 'open',
    options?: Array<{ id, text, isCorrect }>,
    correctAnswer?: string
  }>,
  timeLimit?: number,          // Seconds
  shuffleQuestions?: boolean,
  shuffleOptions?: boolean,
  passingScore?: number,       // 0-100 percentage
  ownerId: string,
  institutionId: string | null,
  createdAt: Timestamp,
  updatedAt?: Timestamp
}
```

---

## 8. Quiz Result Document Structure

**Firestore Path:** `topics/{topicId}/quiz_results/{resultId}`

```typescript
{
  id: string,
  quizId: string,
  uid: string,                 // Student UID
  answers: Array<{
    questionId: string,
    selectedOptionId?: string,
    openAnswer?: string
  }>,
  score: number,               // 0-100
  isPassing: boolean,
  completedAt: Timestamp,
  timeTaken?: number           // Seconds
}
```

**Critical Firestore Rules to Verify:**
```firestore
// quiz_results create:
// - request.auth.uid == request.resource.data.uid (cannot submit as another user)
// - Student is enrolled in parent subject (expensive check or trust client)

// quiz_results read:
// - Student can only read documents where data.uid == request.auth.uid
// - Teacher/admin reads all results in their institution's subjects
```

**Audit Check:** After Student 1 completes a quiz, verify:
1. `quiz_results/{resultId}.uid === student1.uid`
2. `quiz_results/{resultId}.score` is a valid number
3. Student 1 can read their own result
4. Student 2 (also enrolled) cannot read Student 1's result
5. Teacher A can read all results

---

## 9. Topic Deletion (Cascade Logic)

**File:** `topicDeletionUtils.ts`

```typescript
// Cascade delete when a topic is deleted:
// 1. Delete all documents in topics/{topicId}/resumen/
// 2. Delete all documents in topics/{topicId}/materials/
// 3. Delete all documents in topics/{topicId}/documents/
//    → Also delete corresponding Firebase Storage files (storagePath)
// 4. Delete all documents in topics/{topicId}/quizzes/
// 5. Delete all documents in topics/{topicId}/quiz_results/
// 6. Decrement subject.topicCount
// 7. Delete the topic document itself

// This is performed as a batch (not a transaction due to Storage operations)
```

**Critical Failure Mode:** Firestore batch and Storage deletion are not atomic. If Storage deletions fail after Firestore batch commits, orphaned files remain in Storage (billing cost, potential data leak if file URLs are guessed).

**Failure Mode:** If `quiz_results` contains many documents, the batch delete may exceed Firestore batch limit (500 writes per batch). The deletion utility must handle pagination for subcollections.

---

## 10. Student Content Access Path

For a student to access content:
1. Student must be enrolled in the subject (`enrolledStudentUids` or class membership → see Architecture 06)
2. Student can read `topics/` where `topics.subjectId` matches enrolled subject (Firestore rule must enforce this)
3. Student can read all subcollections under topics they can access
4. Student CANNOT write to any topic subcollections except `quiz_results`

**Audit Check (Phase 7, step 7.13-7.15):**
- Student sees topics listed on subject page
- Student can click into a topic and see documents + quizzes
- Student cannot see edit/delete buttons
- Student can take quiz and result is saved

---

## 11. Known Failure Modes Summary

| ID | Failure | Severity | Trigger | Detection |
|----|---------|----------|---------|-----------|
| CM-01 | `topicCount` desync due to non-atomic increment | MEDIUM | Network drop between addDoc and updateDoc | Duplicate `order` numbers on topics |
| CM-02 | Topic stuck in `generating` state indefinitely | HIGH | AI/async process failure | UI shows spinner forever, no dismiss option |
| CM-03 | Document URL accessible without enrollment | HIGH | Storage rules too permissive | Unenrolled student can download PDFs |
| CM-04 | Student reads another student's quiz_results | HIGH | Missing UID filter in quiz_results read rule | Privacy breach |
| CM-05 | Quiz result submitted with wrong UID | CRITICAL | Missing uid == auth.uid Firestore rule | Student submits results attributed to another user |
| CM-06 | Cascade delete exceeds batch limit (500 writes) | MEDIUM | Topic with many quiz results | Delete fails silently for large topics |
| CM-07 | Storage orphans after topic deletion failure | MEDIUM | Storage deletion fails mid-cascade | Files remain, accumulate billing |
| CM-08 | Topic `ownerId: null` inherited from subject | HIGH | Subject created with null ownerId | All topic permission checks fail |

---

## 12. Manual Check Sequence

Refer to **Phase 7** in [MASTER_CHECKLIST.md](../MASTER_CHECKLIST.md).

---

## 13. Automated Test Coverage

| Test File | Coverage |
|-----------|---------|
| `tests/e2e/subject-topic-content.spec.ts` | Topic and resource management |
| `tests/e2e/quiz-lifecycle.spec.ts` | Quiz creation and taking |
| `tests/e2e/user-journey.spec.ts` | Full user content workflows |

**Coverage Gaps:**
- No test for `topicCount` desync when network drops between addDoc and updateDoc
- No test for student attempting to read another student's quiz_results
- No test for cascade delete with >500 subcollection documents
- No test for Storage orphan behavior after failed cascade delete
- No test for topic stuck in `generating` state (UI timeout/retry path)

---

## 14. Validation Criteria

| Criterion | Method |
|-----------|--------|
| Topic document created | Firestore `topics/{id}` query |
| `number` is zero-padded and sequential | Field comparison |
| `subjectId` references correct subject | Field comparison |
| `subject.topicCount` incremented | Firestore field check |
| Document subcollection entry created | `topics/{id}/documents/{docId}` check |
| Quiz subcollection entry created | `topics/{id}/quizzes/{quizId}` check |
| Student quiz result saved | `topics/{id}/quiz_results/{resultId}` check |
| Student cannot edit topic | UI check (no edit controls) |
| Unenrolled student cannot access topic content | Firestore rules test |

---

## 15. Security Boundary Analysis

| Boundary | Risk | Mitigation |
|---------|------|-----------|
| Document URL in Storage | Anyone with URL can download (Storage rules may allow authenticated reads) | Storage rules should check subject enrollment |
| Quiz result UID spoofing | Student submits as another student | Firestore rule: uid must equal request.auth.uid |
| Student reads others' quiz results | Privacy breach | quiz_results read rule: uid filter |
| Topic deletion without cascade | Orphaned subcollections | topicDeletionUtils must run full cascade |
| Teacher deletes another institution's topic | Cross-tenant data modification | Firestore rule: sameInstitution() on topic delete |
