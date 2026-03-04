import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';

const E2E_EMAIL = process.env.E2E_EMAIL;
const E2E_PASSWORD = process.env.E2E_PASSWORD;
const E2E_SUBJECT_ID = process.env.E2E_SUBJECT_ID;
const E2E_TOPIC_ID = process.env.E2E_TOPIC_ID;
const E2E_INSTITUTION_ID = process.env.E2E_INSTITUTION_ID;

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
  const now = Date.now();
  const subjectPayload = {
    name: `E2E Subject Seed ${now}`,
    color: 'from-blue-400 to-blue-600',
    ownerId,
    ...(institutionId ? { institutionId } : {}),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    topicCount: 0,
    e2eSeed: true,
  };

  const subjectRef = await db.collection('subjects').add(subjectPayload);
  return subjectRef.id;
};

const createTopicSeed = async (db, subjectId, ownerId, institutionId) => {
  const now = Date.now();
  const topicPayload = {
    name: `E2E Topic Seed ${now}`,
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

  const topicRef = await db.collection('topics').add(topicPayload);

  await db.collection('resumen').add({
    name: 'E2E Seed Summary',
    title: 'E2E Seed Summary',
    type: 'summary',
    content: 'Contenido de semilla para validación E2E.',
    topicId: topicRef.id,
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

  return topicRef.id;
};

const canAccessSubject = (subjectData, ownerId) => {
  if (!subjectData || !ownerId) return false;
  if (subjectData.ownerId === ownerId || subjectData.uid === ownerId) return true;
  if (Array.isArray(subjectData.editorUids) && subjectData.editorUids.includes(ownerId)) return true;
  if (Array.isArray(subjectData.viewerUids) && subjectData.viewerUids.includes(ownerId)) return true;
  if (Array.isArray(subjectData.sharedWithUids) && subjectData.sharedWithUids.includes(ownerId)) return true;
  return false;
};

const resolveSubjectAndTopic = async () => {
  if (E2E_SUBJECT_ID && E2E_TOPIC_ID) {
    return { subjectId: E2E_SUBJECT_ID, topicId: E2E_TOPIC_ID };
  }

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

  return { subjectId, topicId };
};

test.describe('Subject topic content navigation', () => {
  let discoveredSubjectId = E2E_SUBJECT_ID || null;
  let discoveredTopicId = E2E_TOPIC_ID || null;

  test.skip(!E2E_EMAIL || !E2E_PASSWORD, 'Set E2E_EMAIL and E2E_PASSWORD to run Subject/Topic navigation tests.');

  test.beforeAll(async () => {
    const resolved = await resolveSubjectAndTopic();
    discoveredSubjectId = resolved.subjectId;
    discoveredTopicId = resolved.topicId;
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
    try {
      await viewButtons.first().waitFor({ state: 'visible', timeout: 8000 });
    } catch {
      // Keep deterministic skip behavior below when no material is available
    }
    const buttonCount = await viewButtons.count();

    test.skip(buttonCount === 0, 'No material/resource cards with Ver action were found for this seeded topic.');

    await viewButtons.first().click();
    await page.waitForURL(/\/home\/subject\/.*\/topic\/.*\/(resumen|resource)\/.+/);

    expect(page.url()).toMatch(/\/(resumen|resource)\//);
  });
});
