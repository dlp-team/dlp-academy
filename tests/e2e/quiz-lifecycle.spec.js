import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';

const E2E_EMAIL = process.env.E2E_EMAIL;
const E2E_PASSWORD = process.env.E2E_PASSWORD;
const E2E_SUBJECT_ID = process.env.E2E_SUBJECT_ID;
const E2E_TOPIC_ID = process.env.E2E_TOPIC_ID;
const E2E_QUIZ_ID = process.env.E2E_QUIZ_ID;
const E2E_INSTITUTION_ID = process.env.E2E_INSTITUTION_ID;

const buildE2eSubjectId = (ownerId) => `e2e-subject-${ownerId}`;
const buildE2eTopicId = (ownerId, subjectId) => `e2e-topic-${ownerId}-${subjectId}`;
const buildE2eQuizId = (ownerId, topicId) => `e2e-quiz-${ownerId}-${topicId}`;

const ensureAdmin = () => {
  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountRaw) return null;

  try {
    const normalized = serviceAccountRaw.trim().replace(/^'/, '').replace(/'$/, '');
    const serviceAccount = JSON.parse(normalized);
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    return admin.firestore();
  } catch {
    return null;
  }
};

const canAccessSubject = (subjectData, ownerId) => {
  if (!subjectData || !ownerId) return false;
  if (subjectData.ownerId === ownerId || subjectData.uid === ownerId) return true;
  if (Array.isArray(subjectData.editorUids) && subjectData.editorUids.includes(ownerId)) return true;
  if (Array.isArray(subjectData.viewerUids) && subjectData.viewerUids.includes(ownerId)) return true;
  if (Array.isArray(subjectData.sharedWithUids) && subjectData.sharedWithUids.includes(ownerId)) return true;
  return false;
};

const createSubjectSeed = async (db, ownerId, institutionId) => {
  const subjectId = buildE2eSubjectId(ownerId);
  await db.collection('subjects').doc(subjectId).set({
    name: 'E2E Quiz Subject',
    color: 'from-blue-400 to-blue-600',
    ownerId,
    ...(institutionId ? { institutionId } : {}),
    topicCount: 0,
    e2eSeed: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  return subjectId;
};

const createTopicSeed = async (db, subjectId, ownerId, institutionId) => {
  const topicId = buildE2eTopicId(ownerId, subjectId);
  await db.collection('topics').doc(topicId).set({
    name: 'E2E Quiz Topic',
    prompt: 'Deterministic E2E quiz seed topic',
    status: 'completed',
    color: 'from-blue-400 to-blue-600',
    order: 1,
    number: '01',
    subjectId,
    ownerId,
    ...(institutionId ? { institutionId } : {}),
    e2eSeed: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  await db.collection('subjects').doc(subjectId).set(
    {
      topicCount: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return topicId;
};

const createQuizSeed = async (db, subjectId, topicId, ownerId, institutionId) => {
  const quizId = buildE2eQuizId(ownerId, topicId);
  await db.collection('quizzes').doc(quizId).set({
    name: 'E2E Quiz',
    title: 'E2E Quiz',
    level: 'Básico',
    type: 'basic',
    subjectId,
    topicId,
    ownerId,
    ...(institutionId ? { institutionId } : {}),
    questions: [
      {
        question: '¿Cuánto es 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctIndex: 1,
      },
      {
        question: '¿Cuánto es 10 - 7?',
        options: ['1', '2', '3', '4'],
        correctIndex: 2,
      },
    ],
    formulas: [],
    e2eSeed: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  return quizId;
};

const resolveSeeds = async () => {
  const db = ensureAdmin();
  if (!db || !E2E_EMAIL) {
    return {
      subjectId: E2E_SUBJECT_ID || null,
      topicId: E2E_TOPIC_ID || null,
      quizId: E2E_QUIZ_ID || null,
      ownerId: null,
    };
  }

  let ownerId = null;
  try {
    const authUser = await admin.auth().getUserByEmail(E2E_EMAIL.trim().toLowerCase());
    ownerId = authUser.uid;
  } catch {
    ownerId = null;
  }

  let userData = {};
  if (ownerId) {
    const userDoc = await db.collection('users').doc(ownerId).get();
    if (userDoc.exists) {
      userData = userDoc.data() || {};
    }
  }

  if (!ownerId) {
    return {
      subjectId: E2E_SUBJECT_ID || null,
      topicId: E2E_TOPIC_ID || null,
      quizId: E2E_QUIZ_ID || null,
      ownerId: null,
    };
  }

  const institutionId = E2E_INSTITUTION_ID || userData.institutionId || null;

  let subjectId = E2E_SUBJECT_ID || null;
  if (subjectId) {
    const subjectDoc = await db.collection('subjects').doc(subjectId).get();
    if (!subjectDoc.exists || !canAccessSubject(subjectDoc.data(), ownerId)) {
      subjectId = null;
    }
  }

  if (!subjectId) {
    subjectId = await createSubjectSeed(db, ownerId, institutionId);
  }

  let topicId = E2E_TOPIC_ID || null;
  if (topicId) {
    const topicDoc = await db.collection('topics').doc(topicId).get();
    const topicData = topicDoc.data() || {};
    if (!topicDoc.exists || topicData.subjectId !== subjectId) {
      topicId = null;
    }
  }

  if (!topicId) {
    topicId = await createTopicSeed(db, subjectId, ownerId, institutionId);
  }

  let quizId = E2E_QUIZ_ID || null;
  if (quizId) {
    const quizDoc = await db.collection('quizzes').doc(quizId).get();
    const quizData = quizDoc.data() || {};
    if (!quizDoc.exists || quizData.topicId !== topicId || quizData.subjectId !== subjectId) {
      quizId = null;
    }
  }

  if (!quizId) {
    const quizzesSnap = await db
      .collection('quizzes')
      .where('topicId', '==', topicId)
      .limit(1)
      .get();

    quizId = quizzesSnap.empty
      ? await createQuizSeed(db, subjectId, topicId, ownerId, institutionId)
      : quizzesSnap.docs[0].id;
  }

  return { subjectId, topicId, quizId, ownerId };
};

test.describe('Quiz lifecycle', () => {
  let discoveredSubjectId = E2E_SUBJECT_ID || null;
  let discoveredTopicId = E2E_TOPIC_ID || null;
  let discoveredQuizId = E2E_QUIZ_ID || null;
  let discoveredOwnerId = null;

  test.skip(!E2E_EMAIL || !E2E_PASSWORD, 'Set E2E_EMAIL and E2E_PASSWORD to run quiz lifecycle tests.');

  test.beforeAll(async () => {
    const resolved = await resolveSeeds();
    discoveredSubjectId = resolved.subjectId;
    discoveredTopicId = resolved.topicId;
    discoveredQuizId = resolved.quizId;
    discoveredOwnerId = resolved.ownerId;
  });

  test('user can open quiz, complete it, and return to topic', async ({ page }) => {
    test.skip(!discoveredSubjectId || !discoveredTopicId || !discoveredQuizId, 'No deterministic subject/topic/quiz seed was found.');

    await page.goto('/login');
    await page.locator('#email').fill(E2E_EMAIL || '');
    await page.locator('#password').fill(E2E_PASSWORD || '');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await page.waitForURL(/\/home/);
    await page.goto(`/home/subject/${discoveredSubjectId}/topic/${discoveredTopicId}`);
    await page.waitForURL(new RegExp(`/home/subject/${discoveredSubjectId}/topic/${discoveredTopicId}`));

    await page.getByRole('button', { name: /tests prácticos/i }).click();
    await expect(page.getByRole('button', { name: /comenzar|reintentar/i }).first()).toBeVisible();
    await page.getByRole('button', { name: /comenzar|reintentar/i }).first().click();

    await page.waitForURL(new RegExp(`/home/subject/${discoveredSubjectId}/topic/${discoveredTopicId}/quiz/`));
    await expect(page.getByRole('button', { name: /comenzar test/i })).toBeVisible();

    await page.getByRole('button', { name: /comenzar test/i }).click();

    await page.getByRole('button', { name: /b\s*4/i }).first().click();
    await page.getByRole('button', { name: /comprobar/i }).click();
    await page.getByRole('button', { name: /siguiente/i }).click();

    await page.getByRole('button', { name: /c\s*3/i }).first().click();
    await page.getByRole('button', { name: /comprobar/i }).click();
    await page.getByRole('button', { name: /finalizar/i }).click();

    await expect(page.getByRole('button', { name: /volver al tema/i })).toBeVisible();
    await page.getByRole('button', { name: /volver al tema/i }).click();

    await page.waitForURL(new RegExp(`/home/subject/${discoveredSubjectId}/topic/${discoveredTopicId}`));
    await expect(page.getByRole('button', { name: /tests prácticos/i })).toBeVisible();
  });

  test('quiz completion persists result for current user', async ({ page }) => {
    test.skip(!discoveredSubjectId || !discoveredTopicId || !discoveredQuizId || !discoveredOwnerId, 'No deterministic seed/user context was found for result validation.');

    await page.goto('/login');
    await page.locator('#email').fill(E2E_EMAIL || '');
    await page.locator('#password').fill(E2E_PASSWORD || '');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await page.waitForURL(/\/home/);
    await page.goto(`/home/subject/${discoveredSubjectId}/topic/${discoveredTopicId}/quiz/${discoveredQuizId}`);
    await page.waitForURL(new RegExp(`/home/subject/${discoveredSubjectId}/topic/${discoveredTopicId}/quiz/${discoveredQuizId}`));

    await page.getByRole('button', { name: /comenzar test/i }).click();
    await page.getByRole('button', { name: /b\s*4/i }).first().click();
    await page.getByRole('button', { name: /comprobar/i }).click();
    await page.getByRole('button', { name: /siguiente/i }).click();
    await page.getByRole('button', { name: /c\s*3/i }).first().click();
    await page.getByRole('button', { name: /comprobar/i }).click();
    await page.getByRole('button', { name: /finalizar/i }).click();

    await expect(page.getByRole('button', { name: /volver al tema/i })).toBeVisible();

    const db = ensureAdmin();
    test.skip(!db, 'Missing Firebase Admin context for quiz result assertion.');

    const resultRef = db
      .collection('subjects')
      .doc(discoveredSubjectId)
      .collection('topics')
      .doc(discoveredTopicId)
      .collection('quiz_results')
      .doc(`${discoveredQuizId}_${discoveredOwnerId}`);

    let resultDoc = await resultRef.get();
    if (!resultDoc.exists) {
      await page.waitForTimeout(1500);
      resultDoc = await resultRef.get();
    }
    if (!resultDoc.exists) {
      await page.waitForTimeout(2000);
      resultDoc = await resultRef.get();
    }

    expect(resultDoc.exists).toBeTruthy();
    expect(resultDoc.data()?.quizId).toBe(discoveredQuizId);
    expect(typeof resultDoc.data()?.score).toBe('number');
  });

  test('quiz failing score renders retry flow and can restart from review', async ({ page }) => {
    test.skip(!discoveredSubjectId || !discoveredTopicId || !discoveredQuizId, 'No deterministic seed context found for retry coverage.');

    await page.goto('/login');
    await page.locator('#email').fill(E2E_EMAIL || '');
    await page.locator('#password').fill(E2E_PASSWORD || '');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await page.waitForURL(/\/home/);
    await page.goto(`/home/subject/${discoveredSubjectId}/topic/${discoveredTopicId}/quiz/${discoveredQuizId}`);
    await page.waitForURL(new RegExp(`/home/subject/${discoveredSubjectId}/topic/${discoveredTopicId}/quiz/${discoveredQuizId}`));

    await page.getByRole('button', { name: /comenzar test/i }).click();
    await page.getByRole('button', { name: /a\s*3/i }).first().click();
    await page.getByRole('button', { name: /comprobar/i }).click();
    await page.getByRole('button', { name: /siguiente/i }).click();
    await page.getByRole('button', { name: /a\s*1/i }).first().click();
    await page.getByRole('button', { name: /comprobar/i }).click();
    await page.getByRole('button', { name: /finalizar/i }).click();

    await expect(page.getByText(/sigue practicando/i)).toBeVisible();
    await expect(page.getByText(/^0%$/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /intentar de nuevo/i })).toBeVisible();

    await page.getByRole('button', { name: /intentar de nuevo/i }).click();
    await expect(page.getByRole('button', { name: /comenzar test/i })).toBeVisible();
  });
});
