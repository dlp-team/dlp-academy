// tests/rules/firestore.rules.test.js
import { describe, it, beforeAll, afterAll, afterEach, expect } from 'vitest';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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

describe('Firestore rules: subjects + subjectInviteCodes', () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: fs.readFileSync(FIRESTORE_RULES_PATH, 'utf8'),
      },
    });

    await seedUser({ uid: 'teacher-1', role: 'teacher', institutionId: 'inst-1' });
    await seedUser({ uid: 'teacher-2', role: 'teacher', institutionId: 'inst-2' });
    await seedUser({ uid: 'admin-1', role: 'admin', institutionId: 'inst-1' });
  });

  afterEach(async () => {
    await testEnv.clearFirestore();

    await seedUser({ uid: 'teacher-1', role: 'teacher', institutionId: 'inst-1' });
    await seedUser({ uid: 'teacher-2', role: 'teacher', institutionId: 'inst-2' });
    await seedUser({ uid: 'admin-1', role: 'admin', institutionId: 'inst-1' });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it('allows subject creation with required schema in same institution', async () => {
    const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

    await assertSucceeds(
      setDoc(doc(teacherDb, 'subjects', 'subject-allow-1'), {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        name: 'Matematica',
        course: '1A',
        inviteCode: 'JOINA111',
        enrolledStudentUids: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );
  });

  it('allows subject creation without enrolledStudentUids', async () => {
    const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

    await assertSucceeds(
      setDoc(doc(teacherDb, 'subjects', 'subject-allow-1b'), {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        name: 'Fisica',
        course: '2A',
        inviteCode: 'JOINA112',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );
  });

  it('rejects subject creation missing required fields', async () => {
    const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

    await assertFails(
      setDoc(doc(teacherDb, 'subjects', 'subject-deny-1'), {
        ownerId: 'teacher-1',
        institutionId: 'inst-1',
        name: 'Quimica',
        inviteCode: 'JOINB111',
        enrolledStudentUids: [],
      })
    );
  });

  it('allows invite code reservation for same institution creator', async () => {
    const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

    await assertSucceeds(
      setDoc(doc(teacherDb, 'subjectInviteCodes', 'inst-1_JOINC111'), {
        inviteCode: 'JOINC111',
        institutionId: 'inst-1',
        subjectId: 'subject-allow-2',
        createdBy: 'teacher-1',
        createdAt: new Date(),
      })
    );
  });

  it('rejects invite code reservation when createdBy mismatches auth uid', async () => {
    const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

    await assertFails(
      setDoc(doc(teacherDb, 'subjectInviteCodes', 'inst-1_JOIND111'), {
        inviteCode: 'JOIND111',
        institutionId: 'inst-1',
        subjectId: 'subject-deny-2',
        createdBy: 'teacher-2',
        createdAt: new Date(),
      })
    );
  });

  it('denies reading invite code from different institution for non-admin', async () => {
    await seedDoc('subjectInviteCodes', 'inst-1_JOINE111', {
      inviteCode: 'JOINE111',
      institutionId: 'inst-1',
      subjectId: 'subject-read-1',
      createdBy: 'teacher-1',
      createdAt: new Date(),
    });

    const teacher2Db = testEnv.authenticatedContext('teacher-2').firestore();

    await assertFails(getDoc(doc(teacher2Db, 'subjectInviteCodes', 'inst-1_JOINE111')));
  });

  it('allows admin reading invite code across institutions', async () => {
    await seedDoc('subjectInviteCodes', 'inst-2_JOINF111', {
      inviteCode: 'JOINF111',
      institutionId: 'inst-2',
      subjectId: 'subject-read-2',
      createdBy: 'teacher-2',
      createdAt: new Date(),
    });

    const adminDb = testEnv.authenticatedContext('admin-1').firestore();

    await assertSucceeds(getDoc(doc(adminDb, 'subjectInviteCodes', 'inst-2_JOINF111')));
  });

  it('denies invite code updates and deletes', async () => {
    await seedDoc('subjectInviteCodes', 'inst-1_JOING111', {
      inviteCode: 'JOING111',
      institutionId: 'inst-1',
      subjectId: 'subject-rw-1',
      createdBy: 'teacher-1',
      createdAt: new Date(),
    });

    const teacherDb = testEnv.authenticatedContext('teacher-1').firestore();

    await assertFails(
      setDoc(
        doc(teacherDb, 'subjectInviteCodes', 'inst-1_JOING111'),
        {
          inviteCode: 'JOING111',
          institutionId: 'inst-1',
          subjectId: 'subject-rw-1',
          createdBy: 'teacher-1',
          createdAt: new Date(),
        },
        { merge: true }
      )
    );
  });
});
