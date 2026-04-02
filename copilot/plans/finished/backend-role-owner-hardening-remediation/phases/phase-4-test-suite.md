<!-- copilot/plans/finished/backend-role-owner-hardening-remediation/phases/phase-4-test-suite.md -->
# Phase 4: Adversarial Test Suite Expansion

**Duration:** 60 min
**Objective:** Create comprehensive test coverage for all 9 vulnerabilities with explicit DENY validations

**Status:** ✅ COMPLETED

---

## Test Coverage Matrix

### Test Suite Template
All tests follow this pattern:
```javascript
describe('[Vulnerability] Student cannot [operation]', () => {
  it('denies student [operation] attempt', async () => {
    const studentDb = initializeTestingApp({
      uid: 'student-123',
      role: 'student',
      institutionId: INSTITUTION_ID
    });

    await expect(
      studentDb.collection('[path]')[operation]([payload])
    ).toDeny('[expected error message]');
  });
});
```

---

## Tests to Add (9 Core Vulnerabilities + Regression)

### Test #1: Student CANNOT Create Subject
```javascript
it('Student cannot create subject', async () => {
  const studentDb = initializeTestingApp({
    uid: 'student-1',
    role: 'student',
    institutionId: INST_ID
  });

  await expect(
    studentDb.collection('subjects').add({
      course: 'Hacked Subject',
      institutionId: INST_ID,
      inviteCode: 'HACK123',
      enrolledStudentUids: [],
      ownerId: 'student-1'
    })
  ).toDeny();
});

// Regression: Teacher CAN create subject
it('Teacher can create subject', async () => {
  const teacherDb = initializeTestingApp({
    uid: 'teacher-1',
    role: 'teacher',
    institutionId: INST_ID
  });

  await expect(
    teacherDb.collection('subjects').add({
      course: 'Valid Subject',
      institutionId: INST_ID,
      inviteCode: 'VALID123',
      enrolledStudentUids: [],
      ownerId: 'teacher-1'
    })
  ).toAllow();
});
```

---

### Test #2: Student CANNOT Write Topic (SubCollection)
```javascript
it('Student cannot write to subject/topics subcollection', async () => {
  const studentDb = initializeTestingApp({
    uid: 'student-1',
    role: 'student',
    institutionId: INST_ID
  });

  await expect(
    studentDb
      .collection('subjects').doc('subject-123')
      .collection('topics').add({
        name: 'Hacked Topic',
        subjectId: 'subject-123'
      })
  ).toDeny();
});

// Regression: Teacher CAN write
it('Teacher can write to subject/topics subcollection', async () => {
  const teacherDb = initializeTestingApp({
    uid: 'teacher-1',
    role: 'teacher',
    institutionId: INST_ID
  });

  await expect(
    teacherDb
      .collection('subjects').doc('subject-123')
      .collection('topics').add({
        name: 'Valid Topic',
        subjectId: 'subject-123'
      })
  ).toAllow();
});
```

---

### Test #3: Student CANNOT Create Root Topic
```javascript
it('Student cannot create root topic', async () => {
  const studentDb = initializeTestingApp({
    uid: 'student-1',
    role: 'student',
    institutionId: INST_ID
  });

  await expect(
    studentDb.collection('topics').add({
      name: 'Hacked Root Topic',
      institutionId: INST_ID,
      subjectId: 'subject-123'
    })
  ).toDeny();
});

// Regression: Teacher CAN create
it('Teacher can create root topic', async () => {
  const teacherDb = initializeTestingApp({
    uid: 'teacher-1',
    role: 'teacher',
    institutionId: INST_ID
  });

  await expect(
    teacherDb.collection('topics').add({
      name: 'Valid Root Topic',
      institutionId: INST_ID,
      subjectId: 'subject-123'
    })
  ).toAllow();
});
```

---

### Test #4: Student CANNOT Create Document
```javascript
it('Student cannot create root document', async () => {
  const studentDb = initializeTestingApp({
    uid: 'student-1',
    role: 'student',
    institutionId: INST_ID
  });

  await expect(
    studentDb.collection('documents').add({
      title: 'Hacked Document',
      institutionId: INST_ID,
      topicId: 'topic-123'
    })
  ).toDeny();
});

// Regression: Teacher CAN create
it('Teacher can create root document', async () => {
  const teacherDb = initializeTestingApp({
    uid: 'teacher-1',
    role: 'teacher',
    institutionId: INST_ID
  });

  await expect(
    teacherDb.collection('documents').add({
      title: 'Valid Document',
      institutionId: INST_ID,
      topicId: 'topic-123'
    })
  ).toAllow();
});
```

---

### Test #5: Student CANNOT Create Quiz
```javascript
it('Student cannot create quiz', async () => {
  const studentDb = initializeTestingApp({
    uid: 'student-1',
    role: 'student',
    institutionId: INST_ID
  });

  await expect(
    studentDb.collection('quizzes').add({
      title: 'Hacked Quiz',
      institutionId: INST_ID,
      topicId: 'topic-123',
      questions: []
    })
  ).toDeny();
});

// Regression: Teacher CAN create
it('Teacher can create quiz', async () => {
  const teacherDb = initializeTestingApp({
    uid: 'teacher-1',
    role: 'teacher',
    institutionId: INST_ID
  });

  await expect(
    teacherDb.collection('quizzes').add({
      title: 'Valid Quiz',
      institutionId: INST_ID,
      topicId: 'topic-123',
      questions: []
    })
  ).toAllow();
});
```

---

### Test #6: Student CANNOT Create Exam
```javascript
it('Student cannot create exam', async () => {
  const studentDb = initializeTestingApp({
    uid: 'student-1',
    role: 'student',
    institutionId: INST_ID
  });

  await expect(
    studentDb.collection('exams').add({
      title: 'Hacked Exam',
      institutionId: INST_ID,
      topicId: 'topic-123'
    })
  ).toDeny();
});

// Regression: Teacher CAN create
it('Teacher can create exam', async () => {
  const teacherDb = initializeTestingApp({
    uid: 'teacher-1',
    role: 'teacher',
    institutionId: INST_ID
  });

  await expect(
    teacherDb.collection('exams').add({
      title: 'Valid Exam',
      institutionId: INST_ID,
      topicId: 'topic-123'
    })
  ).toAllow();
});
```

---

### Test #7: Student CANNOT Modify Quiz Result
```javascript
it('Student cannot modify their own quiz result score', async () => {
  const studentDb = initializeTestingApp({
    uid: 'student-1',
    role: 'student',
    institutionId: INST_ID
  });

  // Pre-existing quiz result (created by teacher)
  const existingResult = {
    studentId: 'student-1',
    score: 45,
    maxScore: 100,
    createdAt: firestore.Timestamp.now()
  };

  await expect(
    studentDb
      .collection('subjects').doc('subject-123')
      .collection('topics').doc('topic-456')
      .collection('quiz_results').doc('result-789')
      .update({ score: 100 })
  ).toDeny();
});

// Regression: Teacher CAN modify
it('Teacher can modify student quiz result', async () => {
  const teacherDb = initializeTestingApp({
    uid: 'teacher-1',
    role: 'teacher',
    institutionId: INST_ID
  });

  await expect(
    teacherDb
      .collection('subjects').doc('subject-123')
      .collection('topics').doc('topic-456')
      .collection('quiz_results').doc('result-789')
      .update({ score: 85 })
  ).toAllow();
});
```

---

### Test #8: Arbitrary sharedWithUids Injection Blocked
```javascript
it('Cannot inject arbitrary UIDs into sharedWithUids on create', async () => {
  const studentDb = initializeTestingApp({
    uid: 'student-1',
    role: 'student',
    institutionId: INST_ID
  });

  await expect(
    studentDb.collection('subjects').add({
      course: 'Shared Subject',
      institutionId: INST_ID,
      inviteCode: 'SHARE123',
      enrolledStudentUids: [],
      ownerId: 'teacher-1',  // Note: someone else
      sharedWithUids: ['other-student-2', 'other-student-3']  // Inject into shared list
    })
  ).toDeny();
});

// Regression: Owner CAN set sharedWithUids
it('Owner can set sharedWithUids on subject create', async () => {
  const teacherDb = initializeTestingApp({
    uid: 'teacher-1',
    role: 'teacher',
    institutionId: INST_ID
  });

  await expect(
    teacherDb.collection('subjects').add({
      course: 'Shared Subject',
      institutionId: INST_ID,
      inviteCode: 'SHARE123',
      enrolledStudentUids: [],
      ownerId: 'teacher-1',
      sharedWithUids: ['student-1']  // Owner explicitly shares
    })
  ).toAllow();
});
```

---

### Test #9: Shortcut || true Bypass Blocked
```javascript
it('Cannot create shortcut for unshared target via || true bypass', async () => {
  const userDb = initializeTestingApp({
    uid: 'user-123',
    role: 'teacher',
    institutionId: INST_ID
  });

  // user-123 tries to create shortcut to subject they don't have access to
  await expect(
    userDb.collection('shortcuts').add({
      ownerId: 'other-user',
      parentId: 'folder-123',
      targetId: 'private-subject',
      targetType: 'subject',
      institutionId: INST_ID,
      createdAt: firestore.Timestamp.now()
    })
  ).toDeny();  // Should deny because:
                // 1. user is not shortcut owner
                // 2. isTargetOwnerForCreate() fails (user doesn't own subject)
                // 3. targetSharedWithShortcutOwner() would fail (no || true fallback)
});

// Regression: Owner CAN create shortcut to shared target
it('Owner can create shortcut to shared target', async () => {
  const ownerDb = initializeTestingApp({
    uid: 'owner-id',
    role: 'teacher',
    institutionId: INST_ID
  });

  // Pre-existing subject with owner-id sharing content
  await expect(
    ownerDb.collection('shortcuts').add({
      ownerId: 'other-user',
      parentId: 'folder-123',
      targetId: 'shared-subject',  // This subject has owner-id in sharedWithUids
      targetType: 'subject',
      institutionId: INST_ID,
      createdAt: firestore.Timestamp.now()
    })
  ).toAllow();
});
```

---

## Test File Structure

Create new test section in `tests/rules/firestore.rules.test.js`:

```javascript
describe('Adversarial Scenarios — Privilege Escalation Prevention', () => {
  describe('Role-Based Access Control', () => {
    // Tests #1-6 (student cannot create content)
  });

  describe('Quiz Result Ownership', () => {
    // Test #7
  });

  describe('Field Immutability & Injection Prevention', () => {
    // Tests #8-9
  });

  describe('Regression — Authorized Flows Still Work', () => {
    // All .toAllow() test variants
  });
});
```

---

## Acceptance Criteria

✅ All tests compile and run
✅ All adversarial (DENY) tests pass
✅ All regression (ALLOW) tests pass  
✅ Total test count: 21+ (maintain existing + add new)
✅ `npm run test:rules` output: fully green

---

## Next Step

→ Proceed to **Phase 5: Validation & Closure**
