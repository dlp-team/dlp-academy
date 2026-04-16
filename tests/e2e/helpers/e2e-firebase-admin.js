// tests/e2e/helpers/e2e-firebase-admin.js
import admin from 'firebase-admin';

/**
 * Singleton Firebase Admin SDK initializer.
 * Parses FIREBASE_SERVICE_ACCOUNT_JSON env var and returns a Firestore instance.
 * Returns null if the env var is missing or invalid (tests continue without Admin SDK).
 */
let _db = null;
let _initialized = false;

export const ensureAdmin = () => {
  if (_initialized) return _db;
  _initialized = true;

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
    _db = admin.firestore();
    return _db;
  } catch {
    return null;
  }
};

export const getAdminAuth = () => admin.auth();

export const resolveUidByEmail = async (email) => {
  if (!email) return null;
  try {
    const authUser = await admin.auth().getUserByEmail(String(email).trim().toLowerCase());
    return authUser?.uid || null;
  } catch {
    return null;
  }
};

export const adminGetDoc = async (collection, docId) => {
  const db = ensureAdmin();
  if (!db) return null;
  try {
    const snap = await db.collection(collection).doc(docId).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
  } catch {
    return null;
  }
};

export const adminSetDoc = async (collection, docId, data, options = { merge: true }) => {
  const db = ensureAdmin();
  if (!db) return false;
  try {
    await db.collection(collection).doc(docId).set(data, options);
    return true;
  } catch {
    return false;
  }
};

export const adminDeleteDoc = async (collection, docId) => {
  const db = ensureAdmin();
  if (!db) return false;
  try {
    await db.collection(collection).doc(docId).delete();
    return true;
  } catch {
    return false;
  }
};

export const adminQueryDocs = async (collection, fieldPath, op, value) => {
  const db = ensureAdmin();
  if (!db) return [];
  try {
    const snap = await db.collection(collection).where(fieldPath, op, value).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
};

export const adminDeleteByQuery = async (collection, fieldPath, op, value) => {
  const db = ensureAdmin();
  if (!db) return 0;
  try {
    const snap = await db.collection(collection).where(fieldPath, op, value).get();
    const batch = db.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    return snap.size;
  } catch {
    return 0;
  }
};

export const runBestEffortWithTimeout = async (task, timeoutMs = 12000) => {
  await Promise.race([
    task(),
    new Promise((resolve) => {
      setTimeout(resolve, timeoutMs);
    }),
  ]).catch(() => {
    // Best-effort: should not block tests on fixture prep failure.
  });
};

export const serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp();
export const arrayUnion = (...elements) => admin.firestore.FieldValue.arrayUnion(...elements);
export const arrayRemove = (...elements) => admin.firestore.FieldValue.arrayRemove(...elements);
export const increment = (n) => admin.firestore.FieldValue.increment(n);
