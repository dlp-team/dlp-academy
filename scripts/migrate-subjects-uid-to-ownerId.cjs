// scripts/migrate-subjects-uid-to-ownerId.cjs
// Usage: node scripts/migrate-subjects-uid-to-ownerId.cjs
// Requires FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH in .env or environment

require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

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

async function migrateSubjectsUidToOwnerId() {
  const snap = await db.collection('subjects').get();
  let updated = 0;
  let skipped = 0;
  for (const doc of snap.docs) {
    const data = doc.data();
    let updateData = {};
    let shouldUpdate = false;
    if (!data.ownerId && data.uid) {
      updateData.ownerId = data.uid;
      shouldUpdate = true;
    }
    if (data.institutionId !== 'OfvtfLA39z0ahpnwwKPC') {
      updateData.institutionId = 'OfvtfLA39z0ahpnwwKPC';
      shouldUpdate = true;
    }
    if (shouldUpdate) {
      await doc.ref.update(updateData);
      updated++;
    } else {
      skipped++;
    }
  }
  console.log(`Migration complete. Updated: ${updated}, Skipped: ${skipped}`);
}

migrateSubjectsUidToOwnerId().catch(err => {
  console.error(err);
  process.exit(1);
});
