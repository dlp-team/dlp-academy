// scripts/migrations/profile-picture-field-cleanup/cleanup-profile-picture-fields.cjs
// Migration script to remove legacy profile picture fields from Firestore user documents
// Usage: node scripts/migrations/profile-picture-field-cleanup/cleanup-profile-picture-fields.cjs
// Requires FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON in .env

require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const dryRun = String(process.env.DRY_RUN || 'true').toLowerCase() === 'true';

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

const LEGACY_FIELDS = ['profilePicture', 'avatar', 'photoBase64', 'photoUrl', 'avatarUrl'];
const USERS_COLLECTION = 'users';

async function cleanupProfilePictureFields() {
  const usersSnapshot = await db.collection(USERS_COLLECTION).get();
  let updatedCount = 0;

  for (const doc of usersSnapshot.docs) {
    const data = doc.data();
    const fieldsToDelete = LEGACY_FIELDS.filter(field => field in data);
    if (fieldsToDelete.length > 0) {
      const updateObj = {};
      fieldsToDelete.forEach(field => updateObj[field] = admin.firestore.FieldValue.delete());
      if (!dryRun) {
        await db.collection(USERS_COLLECTION).doc(doc.id).update(updateObj);
      }
      updatedCount++;
      console.log(`User ${doc.id}: Removed fields [${fieldsToDelete.join(', ')}]`);
    }
  }

  console.log(`\nCleanup complete. ${updatedCount} user documents updated.`);
  if (dryRun) {
    console.log('DRY_RUN enabled: No changes written to Firestore.');
  }
}

cleanupProfilePictureFields().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
