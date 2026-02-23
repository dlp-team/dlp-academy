/*
  Backfill institutionId on legacy docs.
  Usage:
    - Set FIREBASE_SERVICE_ACCOUNT_JSON (JSON string) or
      FIREBASE_SERVICE_ACCOUNT_PATH (path to serviceAccount.json)
    - Optional: DRY_RUN=true (default)
    - Run: node scripts/backfill-institution-id.js
*/
require('dotenv').config();
const fs = require('fs');
const admin = require('firebase-admin');

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const dryRun = false; //String(process.env.DRY_RUN || 'true').toLowerCase() === 'true';

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

async function resolveInstitutionIdByEmail(email) {
  if (!email) return null;
  const normalizedEmail = String(email).toLowerCase();
  const domain = normalizedEmail.split('@')[1];
  if (!domain) return null;

  const allowedSnap = await db
    .collection('allowed_teachers')
    .where('email', '==', normalizedEmail)
    .limit(1)
    .get();
  if (!allowedSnap.empty) {
    return allowedSnap.docs[0].data().institutionId || null;
  }

  const domainSnap = await db
    .collection('institutions')
    .where('domains', 'array-contains', domain)
    .limit(1)
    .get();
  if (!domainSnap.empty) return domainSnap.docs[0].id;

  const singleSnap = await db
    .collection('institutions')
    .where('domain', '==', domain)
    .limit(1)
    .get();
  if (!singleSnap.empty) return singleSnap.docs[0].id;

  return null;
}

async function backfillUsers() {
  const snap = await db.collection('users').get();
  const updates = [];

  for (const doc of snap.docs) {
    const data = doc.data();
    if (data.institutionId) continue;
    const institutionId = await resolveInstitutionIdByEmail(data.email);
    if (!institutionId) continue;
    updates.push({ ref: doc.ref, data: { institutionId } });
  }

  await commitBatches(updates);
  return updates.length;
}

async function backfillByOwner(collectionName, ownerField = 'ownerId') {
  const snap = await db.collection(collectionName).get();
  const updates = [];

  for (const doc of snap.docs) {
    const data = doc.data();
    if (data.institutionId) continue;
    const ownerId = data[ownerField];
    if (!ownerId) continue;
    const ownerSnap = await db.collection('users').doc(ownerId).get();
    if (!ownerSnap.exists) continue;
    const institutionId = ownerSnap.data().institutionId;
    if (!institutionId) continue;
    updates.push({ ref: doc.ref, data: { institutionId } });
  }

  await commitBatches(updates);
  return updates.length;
}

async function backfillClassesAndCourses() {
  const collections = ['classes', 'courses'];
  let total = 0;

  for (const name of collections) {
    const snap = await db.collection(name).get();
    const updates = [];

    for (const doc of snap.docs) {
      const data = doc.data();
      if (data.institutionId) continue;
      const userId = data.createdBy || data.teacherId || null;
      if (!userId) continue;
      const userSnap = await db.collection('users').doc(userId).get();
      if (!userSnap.exists) continue;
      const institutionId = userSnap.data().institutionId;
      if (!institutionId) continue;
      updates.push({ ref: doc.ref, data: { institutionId } });
    }

    await commitBatches(updates);
    total += updates.length;
  }

  return total;
}

async function backfillAllowedTeachers() {
  const snap = await db.collection('allowed_teachers').get();
  const updates = [];

  for (const doc of snap.docs) {
    const data = doc.data();
    if (data.institutionId) continue;
    const institutionId = await resolveInstitutionIdByEmail(data.email);
    if (!institutionId) continue;
    updates.push({ ref: doc.ref, data: { institutionId } });
  }

  await commitBatches(updates);
  return updates.length;
}

async function commitBatches(updates) {
  if (updates.length === 0) return;
  const chunkSize = 450;

  for (let i = 0; i < updates.length; i += chunkSize) {
    const batch = db.batch();
    const chunk = updates.slice(i, i + chunkSize);
    for (const entry of chunk) {
      batch.set(entry.ref, entry.data, { merge: true });
    }
    if (!dryRun) {
      await batch.commit();
    }
  }
}

async function run() {
  console.log(`DRY_RUN=${dryRun}`);
  const users = await backfillUsers();
  const subjects = await backfillByOwner('subjects', 'ownerId');
  const folders = await backfillByOwner('folders', 'ownerId');
  const shortcuts = await backfillByOwner('shortcuts', 'ownerId');
  const classesCourses = await backfillClassesAndCourses();
  const allowedTeachers = await backfillAllowedTeachers();

  console.log('Backfill summary:', {
    users,
    subjects,
    folders,
    shortcuts,
    classesCourses,
    allowedTeachers,
  });
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
