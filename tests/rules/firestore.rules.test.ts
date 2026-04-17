// tests/rules/firestore.rules.test.ts
import { describe, it, beforeAll, afterAll, afterEach } from 'vitest';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where, writeBatch } from 'firebase/firestore';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ID = 'dlp-academy-rules-tests';
const TEST_FILE_DIR = path.dirname(fileURLToPath(import.meta.url));
const FIRESTORE_RULES_PATH = path.resolve(TEST_FILE_DIR, '../../firestore.rules');

let testEnv;

const seedUser = async ({ uid, role, institutionId }) => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'users', uid), {
      uid,
      role,
      institutionId,
      email: `${uid}@test.com`,
      displayName: uid,
      country: 'ES',
    });
  });
};

const seedDoc = async (collectionName, docId, payload) => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, collectionName, docId), payload);
  });
};

const reseedBaseUsers = async () => {
  await seedUser({ uid: 'teacher-1', role: 'teacher', institutionId: 'inst-1' });
  await seedUser({ uid: 'teacher-2', role: 'teacher', institutionId: 'inst-2' });
  await seedUser({ uid: 'student-1', role: 'student', institutionId: 'inst-1' });
  await seedUser({ uid: 'institution-admin-1', role: 'institutionadmin', institutionId: 'inst-1' });
  await seedUser({ uid: 'institution-admin-2', role: 'institutionadmin', institutionId: 'inst-2' });
  await seedUser({ uid: 'admin-1', role: 'admin', institutionId: 'inst-1' });
};

const seedSubjectTopicFixture = async () => {
  await seedDoc('subjects', 'subject-inst1', {
    ownerId: 'teacher-1',
    institutionId: 'inst-1',
    name: 'Subject Inst 1',
    course: '1A',
    inviteCode: 'JOINX111',
    enrolledStudentUids: [],
  });

  await seedDoc('topics', 'topic-inst1', {
    ownerId: 'teacher-1',
    institutionId: 'inst-1',
    subjectId: 'subject-inst1',
    name: 'Topic Inst 1',
  });
};

describe('Firestore rules integration', () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: fs.readFileSync(FIRESTORE_RULES_PATH, 'utf8'),
      },
    });

    await reseedBaseUsers();
  });

  afterEach(async () => {
    await testEnv.clearFirestore();
    await reseedBaseUsers();
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it('allows institution admin to create teacher invite in own institution', async () => {
    const institutionAdminDb = testEnv.authenticatedContext('institution-admin-1').firestore();

    await assertSucceeds(
      setDoc(doc(institutionAdminDb, 'institution_invites', 'invite-allow-1'), {
        email: 'teacher.new@test.com',
        institutionId: 'inst-1',
        role: 'teacher',
        type: 'direct',
      })
    );
  });

  it('denies institution admin create when role is not teacher', async () => {
    const institutionAdminDb = testEnv.authenticatedContext('institution-admin-1').firestore();

    await assertFails(
      setDoc(doc(institutionAdminDb, 'institution_invites', 'invite-deny-student-role'), {
        email: 'student.new@test.com',
        institutionId: 'inst-1',
        role: 'student',
        type: 'direct',
      })
    );
  });

  it('allows unauthenticated get for invite by exact id', async () => {
    await seedDoc('institution_invites', 'invite-public-get', {
      email: 'teacher.public@test.com',
      institutionId: 'inst-1',
      role: 'teacher',
      type: 'direct',
    });

    const anonymousDb = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(anonymousDb, 'institution_invites', 'invite-public-get')));
  });

  it('allows institution admin list only for own institution', async () => {
    await seedDoc('institution_invites', 'invite-list-own', {
      email: 'teacher.list.own@test.com',
      institutionId: 'inst-1',
      role: 'teacher',
      type: 'direct',
    });

    const institutionAdminDb = testEnv.authenticatedContext('institution-admin-1').firestore();
    const ownInstitutionList = query(
      collection(institutionAdminDb, 'institution_invites'),
      where('institutionId', '==', 'inst-1')
    );

    await assertSucceeds(getDocs(ownInstitutionList));
  });

  it('denies teacher listing institution invites even in same institution', async () => {
    await seedDoc('institution_invites', 'invite-list-deny-teacher', {
      email: 'teacher.list.deny@test.com',
      institutionId: 'inst-1',
      role: 'teacher',
      type: 'direct',
    });

    const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();
    const inviteList = query(
      collection(teacherDb, 'institution_invites'),
      where('institutionId', '==', 'inst-1')
    );

    await assertFails(getDocs(inviteList));
  });

  it('denies invite update for institution admin and allows for global admin', async () => {
    await seedDoc('institution_invites', 'invite-update-boundary', {
      email: 'teacher.update@test.com',
      institutionId: 'inst-1',
      role: 'teacher',
      type: 'direct',
    });

    const institutionAdminDb = testEnv.authenticatedContext('institution-admin-1').firestore();
    await assertFails(
      setDoc(
        doc(institutionAdminDb, 'institution_invites', 'invite-update-boundary'),
        { type: 'institutional' },
        { merge: true }
      )
    );

    const globalAdminDb = testEnv.authenticatedContext('admin-1').firestore();
    await assertSucceeds(
      setDoc(
        doc(globalAdminDb, 'institution_invites', 'invite-update-boundary'),
        { type: 'institutional' },
        { merge: true }
      )
    );
  });

  it('allows delete for institution admin in own institution and denies teacher delete', async () => {
    await seedDoc('institution_invites', 'invite-delete-own', {
      email: 'teacher.delete@test.com',
      institutionId: 'inst-1',
      role: 'teacher',
      type: 'direct',
    });

    const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();
    await assertFails(deleteDoc(doc(teacherDb, 'institution_invites', 'invite-delete-own')));

    const institutionAdminDb = testEnv.authenticatedContext('institution-admin-1').firestore();
    await assertSucceeds(deleteDoc(doc(institutionAdminDb, 'institution_invites', 'invite-delete-own')));
  });

  it('allows email-owner delete path for invite', async () => {
    await seedDoc('institution_invites', 'invite-delete-email-owner', {
      email: 'owner.delete@test.com',
      institutionId: 'inst-2',
      role: 'teacher',
      type: 'direct',
    });

    const emailOwnerDb = testEnv.authenticatedContext('email-owner-1', {
      email: 'owner.delete@test.com',
    }).firestore();

    await assertSucceeds(deleteDoc(doc(emailOwnerDb, 'institution_invites', 'invite-delete-email-owner')));
  });

  it('allows institution admin delete when invite email is missing and still denies teacher', async () => {
    await seedDoc('institution_invites', 'invite-delete-no-email', {
      institutionId: 'inst-1',
      role: 'teacher',
      type: 'direct',
    });

    const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();
    await assertFails(deleteDoc(doc(teacherDb, 'institution_invites', 'invite-delete-no-email')));

    const institutionAdminDb = testEnv.authenticatedContext('institution-admin-1').firestore();
    await assertSucceeds(deleteDoc(doc(institutionAdminDb, 'institution_invites', 'invite-delete-no-email')));
  });

  it('allows non-admin folder/topic/document/quiz writes only with matching institution id', async () => {
    await seedSubjectTopicFixture();

    const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

    await assertSucceeds(
      setDoc(doc(teacherDb, 'folders', 'folder-allow-1'), {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        name: 'Folder Allow',
      })
    );

    await assertSucceeds(
      setDoc(doc(teacherDb, 'topics', 'topic-allow-create'), {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        subjectId: 'subject-inst1',
        name: 'Topic Allow',
      })
    );

    await assertSucceeds(
      setDoc(doc(teacherDb, 'documents', 'doc-allow-create'), {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        topicId: 'topic-inst1',
        title: 'Document Allow',
      })
    );

    await assertSucceeds(
      setDoc(doc(teacherDb, 'quizzes', 'quiz-allow-create'), {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        topicId: 'topic-inst1',
        title: 'Quiz Allow',
      })
    );
  });

  it('denies non-admin writes when institutionId is missing or mismatched', async () => {
    await seedSubjectTopicFixture();
    await seedDoc('folders', 'folder-existing-inst1', {
      ownerId: 'teacher-1',
      institutionId: 'inst-1',
      name: 'Folder Existing',
    });

    const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

    await assertFails(
      setDoc(doc(teacherDb, 'folders', 'folder-deny-missing-inst'), {
        ownerId: 'teacher-1',
        name: 'Folder Missing Institution',
      })
    );

    await assertFails(
      setDoc(doc(teacherDb, 'folders', 'folder-deny-mismatch-inst'), {
        ownerId: 'teacher-1',
        institutionId: 'inst-2',
        name: 'Folder Mismatch Institution',
      })
    );

    await assertFails(
      setDoc(
        doc(teacherDb, 'folders', 'folder-existing-inst1'),
        {
          ownerId: 'teacher-1',
          name: 'Folder Update Missing Institution',
        }
      )
    );

    await assertFails(
      setDoc(doc(teacherDb, 'topics', 'topic-deny-missing-inst'), {
        ownerId: 'teacher-1',
        subjectId: 'subject-inst1',
        name: 'Topic Missing Institution',
      })
    );

    await assertFails(
      setDoc(doc(teacherDb, 'documents', 'doc-deny-mismatch-inst'), {
        ownerId: 'teacher-1',
        institutionId: 'inst-2',
        topicId: 'topic-inst1',
        title: 'Document Mismatch Institution',
      })
    );

    await assertFails(
      setDoc(doc(teacherDb, 'quizzes', 'quiz-deny-missing-inst'), {
        ownerId: 'teacher-1',
        topicId: 'topic-inst1',
        title: 'Quiz Missing Institution',
      })
    );
  });

  it('allows subject move/update for legacy subject docs missing course/inviteCode/enrolledStudentUids', async () => {
    await seedDoc('subjects', 'subject-legacy-move', {
      ownerId: 'teacher-1',
      institutionId: 'inst-1',
      name: 'Legacy Subject Without Required Creation Fields',
      folderId: null,
      isShared: false,
    });

    const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

    await assertSucceeds(
      setDoc(
        doc(teacherDb, 'subjects', 'subject-legacy-move'),
        {
          folderId: 'folder-target-legacy-move',
          isShared: true,
          updatedAt: new Date(),
        },
        { merge: true }
      )
    );
  });

  it('denies self role escalation and institution reassignment on users profile update', async () => {
    const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

    await assertFails(
      setDoc(
        doc(teacherDb, 'users', 'teacher-1'),
        {
          role: 'admin',
        },
        { merge: true }
      )
    );

    await assertFails(
      setDoc(
        doc(teacherDb, 'users', 'teacher-1'),
        {
          institutionId: 'inst-2',
        },
        { merge: true }
      )
    );
  });

  it('denies institution admin promoting users to global admin role', async () => {
    const institutionAdminDb = testEnv.authenticatedContext('institution-admin-1').firestore();

    await assertFails(
      setDoc(
        doc(institutionAdminDb, 'users', 'teacher-1'),
        {
          role: 'admin',
        },
        { merge: true }
      )
    );
  });

  it('allows global admin to promote user role', async () => {
    const globalAdminDb = testEnv.authenticatedContext('admin-1').firestore();

    await assertSucceeds(
      setDoc(
        doc(globalAdminDb, 'users', 'teacher-1'),
        {
          role: 'institutionadmin',
        },
        { merge: true }
      )
    );
  });

  it('allows teacher updating only recognition fields on students in same institution', async () => {
    const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

    await assertSucceeds(
      setDoc(
        doc(teacherDb, 'users', 'student-1'),
        {
          behaviorScore: 8,
          badges: [{ key: 'participacion', awardedBy: 'teacher-1', earnedAt: new Date() }],
          badgesByCourse: {
            general: [{ key: 'participacion', awardedBy: 'teacher-1', earnedAt: new Date() }],
          },
          updatedAt: new Date(),
        },
        { merge: true }
      )
    );
  });

  it('denies teacher updating non-recognition fields in student profile', async () => {
    const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

    await assertFails(
      setDoc(
        doc(teacherDb, 'users', 'student-1'),
        {
          enabled: false,
        },
        { merge: true }
      )
    );
  });

  it('denies teacher updating recognition fields for student in another institution', async () => {
    await seedUser({ uid: 'student-2', role: 'student', institutionId: 'inst-2' });

    const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

    await assertFails(
      setDoc(
        doc(teacherDb, 'users', 'student-2'),
        {
          behaviorScore: 6,
          updatedAt: new Date(),
        },
        { merge: true }
      )
    );
  });

  // ===============================================
  // ADVERSARIAL SCENARIOS — USER PROFILE CREATE PRIVILEGE ESCALATION
  // ===============================================
  // Auth-hardening Phase 02: self-create must be restricted to student/teacher roles

  describe('User profile self-create role restriction', () => {
    it('denies self-create with admin role', async () => {
      const newUserDb = testEnv.authenticatedContext('new-user-admin-attempt').firestore();

      await assertFails(
        setDoc(doc(newUserDb, 'users', 'new-user-admin-attempt'), {
          uid: 'new-user-admin-attempt',
          email: 'hacker@test.com',
          displayName: 'Hacker',
          role: 'admin',
          institutionId: null,
          createdAt: new Date(),
          settings: { theme: 'system', language: 'es', viewMode: 'grid' },
        })
      );
    });

    it('denies self-create with institutionadmin role', async () => {
      const newUserDb = testEnv.authenticatedContext('new-user-instadmin-attempt').firestore();

      await assertFails(
        setDoc(doc(newUserDb, 'users', 'new-user-instadmin-attempt'), {
          uid: 'new-user-instadmin-attempt',
          email: 'hacker2@test.com',
          displayName: 'Hacker 2',
          role: 'institutionadmin',
          institutionId: 'inst-1',
          createdAt: new Date(),
          settings: { theme: 'system', language: 'es', viewMode: 'grid' },
        })
      );
    });

    it('denies self-create with mismatched uid field', async () => {
      const newUserDb = testEnv.authenticatedContext('new-user-uid-spoof').firestore();

      await assertFails(
        setDoc(doc(newUserDb, 'users', 'new-user-uid-spoof'), {
          uid: 'someone-else',
          email: 'spoof@test.com',
          displayName: 'Spoof',
          role: 'student',
          institutionId: null,
          createdAt: new Date(),
          settings: { theme: 'system', language: 'es', viewMode: 'grid' },
        })
      );
    });

    it('allows self-create with student role (regression)', async () => {
      const newUserDb = testEnv.authenticatedContext('new-student-valid').firestore();

      await assertSucceeds(
        setDoc(doc(newUserDb, 'users', 'new-student-valid'), {
          uid: 'new-student-valid',
          email: 'student@test.com',
          displayName: 'Student',
          role: 'student',
          institutionId: null,
          createdAt: new Date(),
          settings: { theme: 'system', language: 'es', viewMode: 'grid' },
        })
      );
    });

    it('allows self-create with teacher role (regression)', async () => {
      const newUserDb = testEnv.authenticatedContext('new-teacher-valid').firestore();

      await assertSucceeds(
        setDoc(doc(newUserDb, 'users', 'new-teacher-valid'), {
          uid: 'new-teacher-valid',
          email: 'teacher@test.com',
          displayName: 'Teacher',
          role: 'teacher',
          institutionId: 'inst-1',
          createdAt: new Date(),
          settings: { theme: 'system', language: 'es', viewMode: 'grid' },
        })
      );
    });

    it('denies self-create with unknown/fabricated role', async () => {
      const newUserDb = testEnv.authenticatedContext('new-user-fake-role').firestore();

      await assertFails(
        setDoc(doc(newUserDb, 'users', 'new-user-fake-role'), {
          uid: 'new-user-fake-role',
          email: 'faker@test.com',
          displayName: 'Faker',
          role: 'superadmin',
          institutionId: null,
          createdAt: new Date(),
          settings: { theme: 'system', language: 'es', viewMode: 'grid' },
        })
      );
    });
  });

  // ===============================================
  // ADVERSARIAL SCENARIOS — PRIVILEGE ESCALATION PREVENTION
  // ===============================================
  // Phase 4: Test suite validating all 9 vulnerabilities are fixed

  describe('Vulnerability #1: Student cannot create subject', () => {
    it('denies student subject creation', async () => {
      const studentDb = testEnv.authenticatedContext('student-1').firestore();

      await assertFails(
        setDoc(doc(studentDb, 'subjects', 'subject-student-hack'), {
          course: 'Hacked Subject',
          institutionId: 'inst-1',
          inviteCode: 'HACK123',
          enrolledStudentUids: [],
          ownerId: 'student-1',
        })
      );
    });

    it('allows teacher subject creation (regression)', async () => {
      const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

      await assertSucceeds(
        setDoc(doc(teacherDb, 'subjects', 'subject-teacher-valid'), {
          course: 'Valid Subject',
          institutionId: 'inst-1',
          inviteCode: 'VALID123',
          enrolledStudentUids: [],
          ownerId: 'teacher-1',
        })
      );
    });

    it('denies teacher subject creation when institution disables autonomous creation', async () => {
      await seedDoc('institutions', 'inst-1', {
        name: 'Inst 1',
        accessPolicies: {
          teachers: {
            allowTeacherAutonomousSubjectCreation: false,
          },
        },
      });

      const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

      await assertFails(
        setDoc(doc(teacherDb, 'subjects', 'subject-teacher-policy-disabled'), {
          course: 'Blocked Subject',
          institutionId: 'inst-1',
          inviteCode: 'BLOCK123',
          enrolledStudentUids: [],
          ownerId: 'teacher-1',
        })
      );
    });

    it('allows teacher subject creation when institution explicitly enables autonomous creation', async () => {
      await seedDoc('institutions', 'inst-1', {
        name: 'Inst 1',
        accessPolicies: {
          teachers: {
            allowTeacherAutonomousSubjectCreation: true,
          },
        },
      });

      const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

      await assertSucceeds(
        setDoc(doc(teacherDb, 'subjects', 'subject-teacher-policy-enabled'), {
          course: 'Allowed Subject',
          institutionId: 'inst-1',
          inviteCode: 'ALLOW123',
          enrolledStudentUids: [],
          ownerId: 'teacher-1',
        })
      );
    });

    it('allows teacher subject creation when classId belongs to the same institution', async () => {
      await seedDoc('classes', 'class-inst-1', {
        institutionId: 'inst-1',
        name: 'Clase Inst 1',
      });

      const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

      await assertSucceeds(
        setDoc(doc(teacherDb, 'subjects', 'subject-teacher-class-valid'), {
          course: 'Valid Subject',
          institutionId: 'inst-1',
          classId: 'class-inst-1',
          inviteCode: 'CLASS111',
          enrolledStudentUids: [],
          ownerId: 'teacher-1',
        })
      );
    });

    it('denies teacher subject creation when classId belongs to another institution', async () => {
      await seedDoc('classes', 'class-inst-2', {
        institutionId: 'inst-2',
        name: 'Clase Inst 2',
      });

      const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

      await assertFails(
        setDoc(doc(teacherDb, 'subjects', 'subject-teacher-class-invalid'), {
          course: 'Blocked Subject',
          institutionId: 'inst-1',
          classId: 'class-inst-2',
          inviteCode: 'CLASS222',
          enrolledStudentUids: [],
          ownerId: 'teacher-1',
        })
      );
    });
  });

  describe('Vulnerability #2: Student cannot update subject metadata', () => {
    it('denies student subject metadata update', async () => {
      await seedDoc('subjects', 'subject-for-update', {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        course: 'Original Course',
        inviteCode: 'ORIG123',
        enrolledStudentUids: ['student-1'],
      });

      const studentDb = testEnv.authenticatedContext('student-1').firestore();

      await assertFails(
        setDoc(
          doc(studentDb, 'subjects', 'subject-for-update'),
          { course: 'Hacked Course' },
          { merge: true }
        )
      );
    });

    it('allows teacher subject metadata update (regression)', async () => {
      await seedDoc('subjects', 'subject-for-teacher-update', {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        course: 'Original',
        inviteCode: 'ORIG456',
        enrolledStudentUids: [],
      });

      const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

      await assertSucceeds(
        setDoc(
          doc(teacherDb, 'subjects', 'subject-for-teacher-update'),
          { course: 'Updated' },
          { merge: true }
        )
      );
    });

    it('denies invalid invite governance payload updates', async () => {
      await seedDoc('subjects', 'subject-invite-governance-update', {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        course: 'Original',
        inviteCode: 'INV12345',
        inviteCodeEnabled: true,
        inviteCodeRotationIntervalHours: 24,
        enrolledStudentUids: [],
      });

      const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

      await assertFails(
        setDoc(
          doc(teacherDb, 'subjects', 'subject-invite-governance-update'),
          { inviteCodeEnabled: 'yes' },
          { merge: true }
        )
      );

      await assertFails(
        setDoc(
          doc(teacherDb, 'subjects', 'subject-invite-governance-update'),
          { inviteCodeRotationIntervalHours: 0 },
          { merge: true }
        )
      );
    });

    it('allows valid invite governance payload updates', async () => {
      await seedDoc('subjects', 'subject-invite-governance-valid', {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        course: 'Original',
        inviteCode: 'INV56789',
        inviteCodeEnabled: true,
        inviteCodeRotationIntervalHours: 24,
        enrolledStudentUids: [],
      });

      const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

      await assertSucceeds(
        setDoc(
          doc(teacherDb, 'subjects', 'subject-invite-governance-valid'),
          {
            inviteCodeEnabled: false,
            inviteCodeRotationIntervalHours: 72,
            inviteCodeLastRotatedAt: new Date(),
          },
          { merge: true }
        )
      );
    });

    it('denies teacher subject class reassignment when target class belongs to another institution', async () => {
      await seedDoc('classes', 'class-inst-1-update', {
        institutionId: 'inst-1',
        name: 'Clase Inst 1 Update',
      });
      await seedDoc('classes', 'class-inst-2-update', {
        institutionId: 'inst-2',
        name: 'Clase Inst 2 Update',
      });
      await seedDoc('subjects', 'subject-class-reassign-deny', {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        course: 'Original',
        inviteCode: 'CLASSUP1',
        classId: 'class-inst-1-update',
        enrolledStudentUids: [],
      });

      const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

      await assertFails(
        setDoc(
          doc(teacherDb, 'subjects', 'subject-class-reassign-deny'),
          { classId: 'class-inst-2-update' },
          { merge: true }
        )
      );
    });

    it('allows teacher subject class reassignment when target class is in the same institution', async () => {
      await seedDoc('classes', 'class-inst-1-current', {
        institutionId: 'inst-1',
        name: 'Clase Inst 1 Current',
      });
      await seedDoc('classes', 'class-inst-1-next', {
        institutionId: 'inst-1',
        name: 'Clase Inst 1 Next',
      });
      await seedDoc('subjects', 'subject-class-reassign-allow', {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        course: 'Original',
        inviteCode: 'CLASSUP2',
        classId: 'class-inst-1-current',
        enrolledStudentUids: [],
      });

      const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

      await assertSucceeds(
        setDoc(
          doc(teacherDb, 'subjects', 'subject-class-reassign-allow'),
          { classId: 'class-inst-1-next' },
          { merge: true }
        )
      );
    });
  });

  describe('Residual: student invite join path is constrained and allowed', () => {
    it('allows student self-join payload with sharedWithUids and enrolledStudentUids only', async () => {
      await seedDoc('subjects', 'subject-student-join-allow', {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        course: 'Joinable Subject',
        inviteCode: 'JOINSELF',
        inviteCodeEnabled: true,
        sharedWithUids: [],
        enrolledStudentUids: [],
      });

      const studentDb = testEnv.authenticatedContext('student-1').firestore();

      await assertSucceeds(
        setDoc(
          doc(studentDb, 'subjects', 'subject-student-join-allow'),
          {
            sharedWithUids: ['student-1'],
            enrolledStudentUids: ['student-1'],
            isShared: true,
            updatedAt: new Date(),
          },
          { merge: true }
        )
      );
    });

    it('denies student join payload that attempts to add extra users', async () => {
      await seedDoc('subjects', 'subject-student-join-deny', {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        course: 'Joinable Subject',
        inviteCode: 'JOINDENY',
        inviteCodeEnabled: true,
        sharedWithUids: [],
        enrolledStudentUids: [],
      });

      const studentDb = testEnv.authenticatedContext('student-1').firestore();

      await assertFails(
        setDoc(
          doc(studentDb, 'subjects', 'subject-student-join-deny'),
          {
            sharedWithUids: ['student-1', 'student-2'],
            enrolledStudentUids: ['student-1', 'student-2'],
            isShared: true,
            updatedAt: new Date(),
          },
          { merge: true }
        )
      );
    });
  });

  describe('Vulnerability #3: Student cannot create root topic', () => {
    it('denies student root topic creation', async () => {
      await seedSubjectTopicFixture();
      const studentDb = testEnv.authenticatedContext('student-1').firestore();

      await assertFails(
        setDoc(doc(studentDb, 'topics', 'topic-student-hack'), {
          name: 'Hacked Topic',
          institutionId: 'inst-1',
          subjectId: 'subject-inst1',
          ownerId: 'student-1',
        })
      );
    });

    it('allows teacher root topic creation (regression)', async () => {
      await seedSubjectTopicFixture();
      const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

      await assertSucceeds(
        setDoc(doc(teacherDb, 'topics', 'topic-teacher-valid'), {
          name: 'Valid Topic',
          institutionId: 'inst-1',
          subjectId: 'subject-inst1',
          ownerId: 'teacher-1',
        })
      );
    });
  });

  describe('Vulnerability #4: Student cannot create document', () => {
    it('denies student document creation', async () => {
      await seedSubjectTopicFixture();
      const studentDb = testEnv.authenticatedContext('student-1').firestore();

      await assertFails(
        setDoc(doc(studentDb, 'documents', 'doc-student-hack'), {
          title: 'Hacked Document',
          institutionId: 'inst-1',
          topicId: 'topic-inst1',
          ownerId: 'student-1',
        })
      );
    });

    it('allows teacher document creation (regression)', async () => {
      await seedSubjectTopicFixture();
      const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

      await assertSucceeds(
        setDoc(doc(teacherDb, 'documents', 'doc-teacher-valid'), {
          title: 'Valid Document',
          institutionId: 'inst-1',
          topicId: 'topic-inst1',
          ownerId: 'teacher-1',
        })
      );
    });
  });

  describe('Vulnerability #5: Student cannot create quiz', () => {
    it('denies student quiz creation', async () => {
      await seedSubjectTopicFixture();
      const studentDb = testEnv.authenticatedContext('student-1').firestore();

      await assertFails(
        setDoc(doc(studentDb, 'quizzes', 'quiz-student-hack'), {
          title: 'Hacked Quiz',
          institutionId: 'inst-1',
          topicId: 'topic-inst1',
          questions: [],
          ownerId: 'student-1',
        })
      );
    });

    it('allows teacher quiz creation (regression)', async () => {
      await seedSubjectTopicFixture();
      const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

      await assertSucceeds(
        setDoc(doc(teacherDb, 'quizzes', 'quiz-teacher-valid'), {
          title: 'Valid Quiz',
          institutionId: 'inst-1',
          topicId: 'topic-inst1',
          questions: [],
          ownerId: 'teacher-1',
        })
      );
    });
  });

  describe('Vulnerability #6: Student cannot create exam', () => {
    it('denies student exam creation', async () => {
      await seedSubjectTopicFixture();
      const studentDb = testEnv.authenticatedContext('student-1').firestore();

      await assertFails(
        setDoc(doc(studentDb, 'exams', 'exam-student-hack'), {
          title: 'Hacked Exam',
          institutionId: 'inst-1',
          topicId: 'topic-inst1',
          ownerId: 'student-1',
        })
      );
    });

    it('allows teacher exam creation (regression)', async () => {
      await seedSubjectTopicFixture();
      const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

      await assertSucceeds(
        setDoc(doc(teacherDb, 'exams', 'exam-teacher-valid'), {
          title: 'Valid Exam',
          institutionId: 'inst-1',
          topicId: 'topic-inst1',
          ownerId: 'teacher-1',
        })
      );
    });
  });

  describe('Vulnerability #7: Student cannot modify quiz results', () => {
    it('denies student quiz result modification', async () => {
      await seedDoc('subjects', 'subject-quiz-results', {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        course: 'Test Course',
        inviteCode: 'TEST123',
        enrolledStudentUids: ['student-1'],
      });

      await seedDoc('subjects/subject-quiz-results/topics', 'topic-quiz-results', {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        name: 'Test Topic',
        subjectId: 'subject-quiz-results',
      });

      await seedDoc('subjects/subject-quiz-results/topics/topic-quiz-results/quiz_results', 'result-123', {
        studentId: 'student-1',
        score: 45,
        maxScore: 100,
      });

      const studentDb = testEnv.authenticatedContext('student-1').firestore();

      await assertFails(
        setDoc(
          doc(studentDb, 'subjects/subject-quiz-results/topics/topic-quiz-results/quiz_results/result-123'),
          { score: 100 },
          { merge: true }
        )
      );
    });

    it('allows teacher to modify student quiz result (regression)', async () => {
      await seedDoc('subjects', 'subject-teacher-results', {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        course: 'Test Course',
        inviteCode: 'TEST456',
        enrolledStudentUids: ['student-1'],
      });

      await seedDoc('subjects/subject-teacher-results/topics', 'topic-teacher-results', {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        name: 'Test Topic',
        subjectId: 'subject-teacher-results',
      });

      await seedDoc('subjects/subject-teacher-results/topics/topic-teacher-results/quiz_results', 'result-456', {
        studentId: 'student-1',
        score: 45,
        maxScore: 100,
      });

      const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

      await assertSucceeds(
        setDoc(
          doc(teacherDb, 'subjects/subject-teacher-results/topics/topic-teacher-results/quiz_results/result-456'),
          { score: 85 },
          { merge: true }
        )
      );
    });
  });

  describe('Vulnerability #8: Non-owner cannot create subject invite code', () => {
    it('denies non-owner subject invite code creation', async () => {
      await seedDoc('subjects', 'subject-for-invites', {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        course: 'Protected Subject',
        inviteCode: 'PROTECT123',
        enrolledStudentUids: [],
      });

      const studentDb = testEnv.authenticatedContext('student-1').firestore();

      // Student tries to create invite code for teacher's subject
      await assertFails(
        setDoc(doc(studentDb, 'subjectInviteCodes', 'invite-hack-code'), {
          inviteCode: 'HACK789',
          institutionId: 'inst-1',
          subjectId: 'subject-for-invites',
          createdBy: 'student-1',
          createdAt: new Date(),
        })
      );
    });

    it('allows subject owner to create invite code (regression)', async () => {
      await seedDoc('subjects', 'subject-owner-invites', {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        course: 'Teacher Subject',
        inviteCode: 'TEACH123',
        enrolledStudentUids: [],
      });

      const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

      await assertSucceeds(
        setDoc(doc(teacherDb, 'subjectInviteCodes', 'invite-teacher-valid'), {
          inviteCode: 'VALIDCODE',
          institutionId: 'inst-1',
          subjectId: 'subject-owner-invites',
          createdBy: 'teacher-1',
          createdAt: new Date(),
        })
      );
    });

    it('denies listing subject invite codes to prevent enumeration', async () => {
      await seedDoc('subjects', 'subject-owner-invites-list', {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        course: 'Teacher Subject',
        inviteCode: 'LIST1234',
        enrolledStudentUids: [],
      });

      await seedDoc('subjectInviteCodes', 'inst-1_LIST1234', {
        inviteCode: 'LIST1234',
        institutionId: 'inst-1',
        subjectId: 'subject-owner-invites-list',
        createdBy: 'teacher-1',
        createdAt: new Date(),
      });

      const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();
      const listQuery = query(
        collection(teacherDb, 'subjectInviteCodes'),
        where('institutionId', '==', 'inst-1')
      );

      await assertFails(getDocs(listQuery));
      await assertSucceeds(getDoc(doc(teacherDb, 'subjectInviteCodes', 'inst-1_LIST1234')));
    });

    it('allows same-institution invite-code preflight get for missing doc (teacher subject creation transaction path)', async () => {
      const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();
      await assertSucceeds(getDoc(doc(teacherDb, 'subjectInviteCodes', 'inst-1_MISSING001')));
    });

    it('denies cross-institution invite-code preflight get for missing doc', async () => {
      const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();
      await assertFails(getDoc(doc(teacherDb, 'subjectInviteCodes', 'inst-2_MISSING001')));
    });

    it('allows teacher to reserve invite code and create subject in the same batch', async () => {
      const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();
      const batch = writeBatch(teacherDb);

      batch.set(doc(teacherDb, 'subjectInviteCodes', 'inst-1_BATCHCODE1'), {
        inviteCode: 'BATCHCODE1',
        institutionId: 'inst-1',
        subjectId: 'subject-batch-create',
        createdBy: 'teacher-1',
        createdAt: new Date(),
      });

      batch.set(doc(teacherDb, 'subjects', 'subject-batch-create'), {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        course: 'Batch Course',
        inviteCode: 'BATCHCODE1',
        enrolledStudentUids: [],
      });

      await assertSucceeds(batch.commit());
    });
  });

  describe('Shortcut move requests access control', () => {
    const requestId = 'shortcut-move-request-1';

    const seedShortcutMoveRequest = async (overrides = {}) => {
      await seedUser({ uid: 'teacher-owner-1', role: 'teacher', institutionId: 'inst-1' });
      await seedDoc('shortcutMoveRequests', requestId, {
        requesterUid: 'teacher-1',
        requesterEmail: 'teacher-1@test.com',
        shortcutId: 'shortcut-1',
        shortcutType: 'subject',
        targetId: 'subject-inst1',
        targetFolderId: 'folder-shared-1',
        targetFolderOwnerUid: 'teacher-owner-1',
        institutionId: 'inst-1',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
      });
    };

    it('allows requester to read own move request', async () => {
      await seedShortcutMoveRequest();

      const requesterDb = testEnv.authenticatedContext('teacher-1').firestore();
      await assertSucceeds(getDoc(doc(requesterDb, 'shortcutMoveRequests', requestId)));
    });

    it('allows target folder owner to read move request', async () => {
      await seedShortcutMoveRequest();

      const ownerDb = testEnv.authenticatedContext('teacher-owner-1').firestore();
      await assertSucceeds(getDoc(doc(ownerDb, 'shortcutMoveRequests', requestId)));
    });

    it('allows same-institution admin to read move request', async () => {
      await seedShortcutMoveRequest();

      const institutionAdminDb = testEnv.authenticatedContext('institution-admin-1').firestore();
      await assertSucceeds(getDoc(doc(institutionAdminDb, 'shortcutMoveRequests', requestId)));
    });

    it('denies cross-institution admin reading move request', async () => {
      await seedShortcutMoveRequest();

      const institutionAdminDb = testEnv.authenticatedContext('institution-admin-2').firestore();
      await assertFails(getDoc(doc(institutionAdminDb, 'shortcutMoveRequests', requestId)));
    });

    it('denies unrelated teacher reading move request', async () => {
      await seedShortcutMoveRequest();

      const unrelatedTeacherDb = testEnv.authenticatedContext('teacher-2').firestore();
      await assertFails(getDoc(doc(unrelatedTeacherDb, 'shortcutMoveRequests', requestId)));
    });

    it('denies direct client create on shortcutMoveRequests', async () => {
      const requesterDb = testEnv.authenticatedContext('teacher-1').firestore();

      await assertFails(
        setDoc(doc(requesterDb, 'shortcutMoveRequests', 'shortcut-move-request-deny-create'), {
          requesterUid: 'teacher-1',
          targetFolderOwnerUid: 'teacher-owner-1',
          institutionId: 'inst-1',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      );
    });

    it('denies direct client update on shortcutMoveRequests', async () => {
      await seedShortcutMoveRequest();

      const requesterDb = testEnv.authenticatedContext('teacher-1').firestore();
      await assertFails(
        setDoc(
          doc(requesterDb, 'shortcutMoveRequests', requestId),
          { status: 'approved' },
          { merge: true }
        )
      );
    });
  });

  describe('Vulnerability #9: Shortcuts || true bypass removed', () => {
    it('denies shortcut creation for unshared target', async () => {
      await seedDoc('subjects', 'subject-private', {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        course: 'Private Subject',
        inviteCode: 'PRIV123',
        enrolledStudentUids: [],
        sharedWithUids: [],  // NOT shared with anyone
      });

      // teacher-1 tries to create shortcut for teacher-2 to access teacher-1's unshared subject
      // This should fail because:  
      // 1. teacher-1 is not the shortcut owner (teacher-2 is)
      // 2. targetSharedWithShortcutOwner() fails (teacher-2 not in sharedWithUids)
      // 3. No || true fallback to bypass check
      const teacher1Db = testEnv.authenticatedContext('teacher-1').firestore();

      await assertFails(
        setDoc(doc(teacher1Db, 'shortcuts', 'shortcut-hack'), {
          ownerId: 'teacher-2',  // Different owner  
          parentId: 'parent-folder',
          targetId: 'subject-private',
          targetType: 'subject',
          institutionId: 'inst-1',
          createdAt: new Date(),
        })
      );
    });

    it('allows shortcut creation for shared target (regression)', async () => {
      await seedDoc('subjects', 'subject-shared', {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        course: 'Shared Subject',
        inviteCode: 'SHARE123',
        enrolledStudentUids: [],
        sharedWithUids: ['teacher-1'],
      });

      const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

      await assertSucceeds(
        setDoc(doc(teacherDb, 'shortcuts', 'shortcut-valid'), {
          ownerId: 'teacher-1',
          parentId: 'parent-folder',
          targetId: 'subject-shared',
          targetType: 'subject',
          institutionId: 'inst-1',
          createdAt: new Date(),
        })
      );
    });
  });
});
