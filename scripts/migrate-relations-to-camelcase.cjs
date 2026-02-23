// scripts/migrate-relations-to-camelcase.cjs
// Usage: node scripts/migrate-relations-to-camelcase.cjs
// Requires FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH
// Optional: DRY_RUN=true (default)

require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const dryRun = String(process.env.DRY_RUN || 'true').toLowerCase() === 'true';
const BATCH_LIMIT = 400;

function loadServiceAccount() {
  if (serviceAccountJson) {
    return JSON.parse(serviceAccountJson);
  }
  if (serviceAccountPath) {
    return JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  }
  throw new Error('Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH');
}

admin.initializeApp({
  credential: admin.credential.cert(loadServiceAccount()),
});

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

async function runMigration() {
  const stats = {
    topicsScanned: 0,
    topicsUpdated: 0,
    topicsRemovedEmbedded: 0,
    documentsScanned: 0,
    documentsUpdated: 0,
    quizzesScanned: 0,
    quizzesUpdated: 0,
    batchCommits: 0,
  };

  let pendingWrites = [];

  async function flushWrites() {
    if (pendingWrites.length === 0) {
      return;
    }

    if (!dryRun) {
      const batch = db.batch();
      for (const write of pendingWrites) {
        batch.set(write.ref, write.data, { merge: true });
      }
      await batch.commit();
      stats.batchCommits++;
    }

    pendingWrites = [];
  }

  async function queueSet(ref, data) {
    pendingWrites.push({ ref, data });
    if (pendingWrites.length >= BATCH_LIMIT) {
      await flushWrites();
    }
  }

  async function migrateTopics() {
    const snapshot = await db.collection('topics').get();

    for (const topicDoc of snapshot.docs) {
      stats.topicsScanned++;
      const data = topicDoc.data();
      const updates = {};
      let shouldUpdate = false;

      if (!data.subjectId && data.subject_id) {
        updates.subjectId = data.subject_id;
        shouldUpdate = true;
      }

      if (data.subject_id !== undefined) {
        updates.subject_id = FieldValue.delete();
        shouldUpdate = true;
      }

      const hasPdfs = data.pdfs !== undefined;
      const hasQuizzes = data.quizzes !== undefined;
      if (hasPdfs) {
        updates.pdfs = FieldValue.delete();
        shouldUpdate = true;
      }
      if (hasQuizzes) {
        updates.quizzes = FieldValue.delete();
        shouldUpdate = true;
      }

      if (hasPdfs || hasQuizzes) {
        stats.topicsRemovedEmbedded++;
      }

      if (shouldUpdate) {
        await queueSet(topicDoc.ref, updates);
        stats.topicsUpdated++;
      }
    }
  }

  async function migrateCollection(collectionName) {
    const snapshot = await db.collection(collectionName).get();

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const updates = {};
      let shouldUpdate = false;

      if (!data.subjectId && data.subject_id) {
        updates.subjectId = data.subject_id;
        shouldUpdate = true;
      }

      if (!data.topicId && data.topic_id) {
        updates.topicId = data.topic_id;
        shouldUpdate = true;
      }

      if (data.subject_id !== undefined) {
        updates.subject_id = FieldValue.delete();
        shouldUpdate = true;
      }

      if (data.topic_id !== undefined) {
        updates.topic_id = FieldValue.delete();
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        await queueSet(docSnap.ref, updates);
      }

      if (collectionName === 'documents') {
        stats.documentsScanned++;
        if (shouldUpdate) stats.documentsUpdated++;
      } else {
        stats.quizzesScanned++;
        if (shouldUpdate) stats.quizzesUpdated++;
      }
    }
  }

  await migrateTopics();
  await migrateCollection('documents');
  await migrateCollection('quizzes');
  await flushWrites();

  console.log('Migration summary:', {
    dryRun,
    ...stats,
  });
}

runMigration().catch((error) => {
  console.error(error);
  process.exit(1);
});
