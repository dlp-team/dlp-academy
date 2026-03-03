import { test, expect } from '@playwright/test';
import admin from 'firebase-admin';

const E2E_EMAIL = process.env.E2E_EMAIL;
const E2E_PASSWORD = process.env.E2E_PASSWORD;
const E2E_SUBJECT_ID = process.env.E2E_SUBJECT_ID;
const E2E_TOPIC_ID = process.env.E2E_TOPIC_ID;

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

const resolveSubjectAndTopic = async () => {
  if (E2E_SUBJECT_ID && E2E_TOPIC_ID) {
    return { subjectId: E2E_SUBJECT_ID, topicId: E2E_TOPIC_ID };
  }

  const db = ensureAdmin();
  if (!db || !E2E_EMAIL) {
    return { subjectId: E2E_SUBJECT_ID || null, topicId: E2E_TOPIC_ID || null };
  }

  let usersSnap = await db.collection('users').where('email', '==', E2E_EMAIL).limit(1).get();
  if (usersSnap.empty) {
    usersSnap = await db.collection('users').where('email', '==', E2E_EMAIL.toLowerCase()).limit(1).get();
  }
  if (usersSnap.empty) {
    return { subjectId: E2E_SUBJECT_ID || null, topicId: E2E_TOPIC_ID || null };
  }

  const userDoc = usersSnap.docs[0];
  const ownerId = userDoc.id;

  const subjectsSnap = await db.collection('subjects').where('ownerId', '==', ownerId).limit(1).get();
  if (subjectsSnap.empty) {
    return { subjectId: E2E_SUBJECT_ID || null, topicId: E2E_TOPIC_ID || null };
  }

  const subjectId = E2E_SUBJECT_ID || subjectsSnap.docs[0].id;
  const topicsSnap = await db.collection('topics').where('subjectId', '==', subjectId).limit(1).get();
  const topicId = E2E_TOPIC_ID || (topicsSnap.empty ? null : topicsSnap.docs[0].id);

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
    await page.waitForURL(new RegExp(`/home/subject/${discoveredSubjectId}`));

    await expect(page.getByRole('button', { name: /crear nuevo tema/i })).toBeVisible();

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

    let viewButtons = page.getByRole('button', { name: /^ver$/i });
    let buttonCount = await viewButtons.count();

    if (buttonCount === 0) {
      await page.getByRole('button', { name: /mis archivos/i }).click();
      viewButtons = page.getByRole('button', { name: /^ver$/i });
      buttonCount = await viewButtons.count();
    }

    test.skip(buttonCount === 0, 'No material/resource cards with Ver action were found for this seeded topic.');

    await viewButtons.first().click();
    await page.waitForURL(/\/home\/subject\/.*\/topic\/.*\/(resumen|resource)\/.+/);

    expect(page.url()).toMatch(/\/(resumen|resource)\//);
  });
});
