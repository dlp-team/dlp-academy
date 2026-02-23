// scripts/migrate-subject-topics-to-root.cjs
// Usage: node scripts/migrate-subject-topics-to-root.cjs
// Requires FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH in .env or environment
// Optional: DRY_RUN=true (default), MIGRATION_INSTITUTION_ID=<id>

require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const dryRun = String(process.env.DRY_RUN || 'true').toLowerCase() === 'true';
const targetInstitutionId = process.env.MIGRATION_INSTITUTION_ID || 'OfvtfLA39z0ahpnwwKPC';

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
const BATCH_LIMIT = 400;

async function migrateSubjectTopicsToRoot() {
  const stats = {
    subjectsScanned: 0,
    subjectsMissingOwner: 0,
    topicsUpserted: 0,
    documentsUpserted: 0,
    quizzesUpserted: 0,
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

  const subjectsSnap = await db.collection('subjects').get();

  for (const subjectDoc of subjectsSnap.docs) {
    stats.subjectsScanned++;

    const subjectData = subjectDoc.data();
    const ownerId = subjectData.ownerId || subjectData.uid || null;

    if (!ownerId) {
      stats.subjectsMissingOwner++;
      continue;
    }

    const topicsSnap = await subjectDoc.ref.collection('topics').get();

    for (const topicDoc of topicsSnap.docs) {
      const topicData = topicDoc.data();
      const topicRootId = `${subjectDoc.id}__${topicDoc.id}`;

      await queueSet(db.collection('topics').doc(topicRootId), {
        ...topicData,
        subject_id: subjectDoc.id,
        ownerId: topicData.ownerId || ownerId,
        institutionId: targetInstitutionId,
      });
      stats.topicsUpserted++;

      const documentsSnap = await topicDoc.ref.collection('documents').get();
      for (const documentDoc of documentsSnap.docs) {
        const documentData = documentDoc.data();
        const documentRootId = `${topicRootId}__${documentDoc.id}`;

        await queueSet(db.collection('documents').doc(documentRootId), {
          ...documentData,
          topic_id: topicRootId,
          subject_id: subjectDoc.id,
          ownerId: documentData.ownerId || topicData.ownerId || ownerId,
          institutionId: targetInstitutionId,
        });
        stats.documentsUpserted++;
      }

      const quizzesSnap = await topicDoc.ref.collection('quizzes').get();
      for (const quizDoc of quizzesSnap.docs) {
        const quizData = quizDoc.data();
        const quizRootId = `${topicRootId}__${quizDoc.id}`;

        await queueSet(db.collection('quizzes').doc(quizRootId), {
          ...quizData,
          topic_id: topicRootId,
          subject_id: subjectDoc.id,
          ownerId: quizData.ownerId || topicData.ownerId || ownerId,
          institutionId: targetInstitutionId,
        });
        stats.quizzesUpserted++;
      }
    }
  }

  await flushWrites();

  console.log('Migration summary:', {
    dryRun,
    institutionId: targetInstitutionId,
    ...stats,
  });
}

migrateSubjectTopicsToRoot().catch(err => {
  console.error(err);
  process.exit(1);
});
