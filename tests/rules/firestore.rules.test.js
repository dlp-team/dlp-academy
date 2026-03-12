// tests/rules/firestore.rules.test.js
import { describe, it, beforeAll, afterAll, afterEach } from 'vitest';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import fs from 'node:fs';
import path from 'node:path';

const PROJECT_ID = 'dlp-academy-rules-tests';
const FIRESTORE_RULES_PATH = path.resolve(process.cwd(), 'firestore.rules');

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
});
