import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';

const E2E_EMAIL = process.env.E2E_EMAIL;
const E2E_PASSWORD = process.env.E2E_PASSWORD;
const E2E_SUBJECT_ID = process.env.E2E_SUBJECT_ID;
const E2E_TOPIC_ID = process.env.E2E_TOPIC_ID;
const E2E_INSTITUTION_ID = process.env.E2E_INSTITUTION_ID;

const buildE2eSubjectId = (ownerId) => `e2e-subject-${ownerId}`;
const buildE2eTopicId = (ownerId, subjectId) => `e2e-topic-${ownerId}-${subjectId}`;
const buildE2eSummaryId = (topicId) => `e2e-summary-${topicId}`;

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

const createSubjectSeed = async (db, ownerId, institutionId) => {
  const subjectId = buildE2eSubjectId(ownerId);
  const subjectPayload = {
    name: 'E2E Subject Seed',
    color: 'from-blue-400 to-blue-600',
    ownerId,
    ...(institutionId ? { institutionId } : {}),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    topicCount: 0,
    e2eSeed: true,
  };

  await db.collection('subjects').doc(subjectId).set(subjectPayload, { merge: true });
  return subjectId;
};

const createTopicSeed = async (db, subjectId, ownerId, institutionId) => {
  const topicId = buildE2eTopicId(ownerId, subjectId);
  const topicPayload = {
    name: 'E2E Topic Seed',
    prompt: 'Deterministic E2E seed topic',
    status: 'completed',
    color: 'from-blue-400 to-blue-600',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    order: 1,
    number: '01',
    subjectId,
    ownerId,
    ...(institutionId ? { institutionId } : {}),
    e2eSeed: true,
  };

  await db.collection('topics').doc(topicId).set(topicPayload, { merge: true });

  await db.collection('resumen').doc(buildE2eSummaryId(topicId)).set({
    name: 'E2E Seed Summary',
    title: 'E2E Seed Summary',
    type: 'summary',
    content: 'Contenido de semilla para validación E2E.',
    topicId,
    subjectId,
    ownerId,
    ...(institutionId ? { institutionId } : {}),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    e2eSeed: true,
  });

  await db.collection('subjects').doc(subjectId).set(
    {
      topicCount: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return topicId;
};

const canAccessSubject = (subjectData, ownerId) => {
  if (!subjectData || !ownerId) return false;
  if (subjectData.ownerId === ownerId || subjectData.uid === ownerId) return true;
  if (Array.isArray(subjectData.editorUids) && subjectData.editorUids.includes(ownerId)) return true;
  if (Array.isArray(subjectData.viewerUids) && subjectData.viewerUids.includes(ownerId)) return true;
  if (Array.isArray(subjectData.sharedWithUids) && subjectData.sharedWithUids.includes(ownerId)) return true;
  return false;
};

const ensureTopicHasSeededContent = async (db, subjectId, topicId, ownerId, institutionId) => {
  if (!db || !subjectId || !topicId || !ownerId) return;

  const resumenSnap = await db.collection('resumen').where('topicId', '==', topicId).limit(1).get();
  if (!resumenSnap.empty) return;

  await db.collection('resumen').doc(buildE2eSummaryId(topicId)).set({
    name: 'E2E Seed Summary',
    title: 'E2E Seed Summary',
    type: 'summary',
    content: 'Contenido de semilla para validación E2E.',
    topicId,
    subjectId,
    ownerId,
    ...(institutionId ? { institutionId } : {}),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    e2eSeed: true,
  });
};

const resolveSubjectAndTopic = async () => {
  const db = ensureAdmin();
  if (!db || !E2E_EMAIL) {
    return { subjectId: E2E_SUBJECT_ID || null, topicId: E2E_TOPIC_ID || null };
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
    const userByUidDoc = await db.collection('users').doc(ownerId).get();
    if (userByUidDoc.exists) {
      userData = userByUidDoc.data() || {};
    }
  }

  let usersSnap = await db.collection('users').where('email', '==', E2E_EMAIL).limit(1).get();
  if (usersSnap.empty) {
    usersSnap = await db.collection('users').where('email', '==', E2E_EMAIL.toLowerCase()).limit(1).get();
  }

  const userDoc = usersSnap.empty ? null : usersSnap.docs[0];
  if ((!userData || Object.keys(userData).length === 0) && userDoc) {
    userData = userDoc.data() || {};
  }
  if (!ownerId && userDoc?.id) {
    ownerId = userDoc.id;
  }
  if (!ownerId) {
    return { subjectId: E2E_SUBJECT_ID || null, topicId: E2E_TOPIC_ID || null };
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

  await ensureTopicHasSeededContent(db, subjectId, topicId, ownerId, institutionId);

  return { subjectId, topicId };
};

test.describe('Subject topic content navigation', () => {
  let discoveredSubjectId = E2E_SUBJECT_ID || null;
  let discoveredTopicId = E2E_TOPIC_ID || null;
  let discoveredGuideId = null;

  test.skip(!E2E_EMAIL || !E2E_PASSWORD, 'Set E2E_EMAIL and E2E_PASSWORD to run Subject/Topic navigation tests.');

  test.beforeAll(async () => {
    const resolved = await resolveSubjectAndTopic();
    discoveredSubjectId = resolved.subjectId;
    discoveredTopicId = resolved.topicId;

    const db = ensureAdmin();
    if (db && discoveredTopicId) {
      const guideSnap = await db.collection('resumen').where('topicId', '==', discoveredTopicId).limit(1).get();
      if (!guideSnap.empty) {
        discoveredGuideId = guideSnap.docs[0].id;
      }
    }
  });

  test('subject route renders and topic surface is reachable', async ({ page }) => {
    test.skip(!discoveredSubjectId, 'No subject seed was found for the E2E account.');

    await page.goto('/login');
    await page.locator('#email').fill(E2E_EMAIL || '');
    await page.locator('#password').fill(E2E_PASSWORD || '');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await page.waitForURL(/\/home/);
    await page.goto(`/home/subject/${discoveredSubjectId}`);
    await expect(page).toHaveURL(new RegExp(`/home/subject/${discoveredSubjectId}`));
    await expect(page.getByPlaceholder('Buscar tema o número...')).toBeVisible();

    if (discoveredTopicId) {
      await page.goto(`/home/subject/${discoveredSubjectId}/topic/${discoveredTopicId}`);
      await page.waitForURL(new RegExp(`/home/subject/${discoveredSubjectId}/topic/${discoveredTopicId}`));
    } else {
      const firstTopicCard = page.locator('div[draggable="true"]').first();
      await expect(firstTopicCard).toBeVisible();
      await firstTopicCard.click();
      await page.waitForURL(new RegExp(`/home/subject/${discoveredSubjectId}/topic/`));
    }

    await expect(page.getByRole('button', { name: /generados por ia/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /mis archivos/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /tests prácticos/i })).toBeVisible();
  });

  test('topic can navigate into content route when seeded material exists', async ({ page }) => {
    test.skip(!discoveredSubjectId || !discoveredTopicId, 'No subject/topic seed was found for deterministic content-route coverage.');

    await page.goto('/login');
    await page.locator('#email').fill(E2E_EMAIL || '');
    await page.locator('#password').fill(E2E_PASSWORD || '');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await page.waitForURL(/\/home/);
    await page.goto(`/home/subject/${discoveredSubjectId}/topic/${discoveredTopicId}`);
    await page.waitForURL(new RegExp(`/home/subject/${discoveredSubjectId}/topic/${discoveredTopicId}`));

    const viewButtons = page.getByRole('button', { name: /^ver$/i });
    const availableViewButtons = await viewButtons.count();

    if (availableViewButtons > 0) {
      await viewButtons.first().click();
      await page.waitForURL(/\/home\/subject\/.*\/topic\/.*\/(resumen|resource)\/.+/);
      expect(page.url()).toMatch(/\/(resumen|resource)\//);
      return;
    }

    test.skip(!discoveredGuideId, 'No visible content card and no discovered summary id for deterministic route coverage.');
    await page.goto(`/home/subject/${discoveredSubjectId}/topic/${discoveredTopicId}/resumen/${discoveredGuideId}`);
    await page.waitForURL(new RegExp(`/home/subject/${discoveredSubjectId}/topic/${discoveredTopicId}/resumen/${discoveredGuideId}`));
    expect(page.url()).toMatch(/\/(resumen|resource)\//);
  });

  test('study guide editor save action keeps editor state controlled', async ({ page }) => {
    test.skip(!discoveredSubjectId || !discoveredTopicId || !discoveredGuideId, 'No deterministic summary id available for editor lifecycle coverage.');

    await page.goto('/login');
    await page.locator('#email').fill(E2E_EMAIL || '');
    await page.locator('#password').fill(E2E_PASSWORD || '');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await page.waitForURL(/\/home/);
    await page.goto(`/home/subject/${discoveredSubjectId}/topic/${discoveredTopicId}/resumen/${discoveredGuideId}/edit`);
    await page.waitForURL(new RegExp(`/home/subject/${discoveredSubjectId}/topic/${discoveredTopicId}/resumen/${discoveredGuideId}/edit`));

    const saveButton = page.getByRole('button', { name: /guardar/i }).first();
    await expect(saveButton).toBeVisible({ timeout: 15000 });

    await saveButton.click();

    await expect(page.getByText(/modo editor/i)).toBeVisible();
    await expect(saveButton).toBeVisible();
  });

  test('invalid resource route shows controlled fallback state', async ({ page }) => {
    test.skip(!discoveredSubjectId || !discoveredTopicId, 'No subject/topic seed available for invalid-resource fallback coverage.');

    await page.goto('/login');
    await page.locator('#email').fill(E2E_EMAIL || '');
    await page.locator('#password').fill(E2E_PASSWORD || '');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await page.waitForURL(/\/home/);
    await page.goto(`/home/subject/${discoveredSubjectId}/topic/${discoveredTopicId}/resource/e2e-missing-resource`);

    await expect(page.getByText(/contenido no disponible/i)).toBeVisible({ timeout: 12000 });
    await expect(page.getByRole('button', { name: /volver atrás/i })).toBeVisible();
  });
});
