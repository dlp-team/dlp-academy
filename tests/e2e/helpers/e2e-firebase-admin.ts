// tests/e2e/helpers/e2e-firebase-admin.ts
import admin from 'firebase-admin';

/**
 * Singleton Firebase Admin SDK initializer.
 * Parses FIREBASE_SERVICE_ACCOUNT_JSON env var and returns a Firestore instance.
 * Returns null if the env var is missing or invalid (tests continue without Admin SDK).
 */
let _db: FirebaseFirestore.Firestore | null = null;
let _initialized = false;

export const ensureAdmin = (): FirebaseFirestore.Firestore | null => {
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

export const resolveUidByEmail = async (email: string | undefined): Promise<string | null> => {
  if (!email) return null;
  try {
    const authUser = await admin.auth().getUserByEmail(String(email).trim().toLowerCase());
    return authUser?.uid || null;
  } catch {
    return null;
  }
};

export const adminGetDoc = async (collection: string, docId: string): Promise<Record<string, any> | null> => {
  const db = ensureAdmin();
  if (!db) return null;
  try {
    const snap = await db.collection(collection).doc(docId).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
  } catch {
    return null;
  }
};

export const adminSetDoc = async (collection: string, docId: string, data: Record<string, any>, options: { merge: boolean } = { merge: true }): Promise<boolean> => {
  const db = ensureAdmin();
  if (!db) return false;
  try {
    await db.collection(collection).doc(docId).set(data, options);
    return true;
  } catch {
    return false;
  }
};

export const adminDeleteDoc = async (collection: string, docId: string): Promise<boolean> => {
  const db = ensureAdmin();
  if (!db) return false;
  try {
    await db.collection(collection).doc(docId).delete();
    return true;
  } catch {
    return false;
  }
};

export const adminQueryDocs = async (collection: string, fieldPath: string, op: FirebaseFirestore.WhereFilterOp, value: any): Promise<Record<string, any>[]> => {
  const db = ensureAdmin();
  if (!db) return [];
  try {
    const snap = await db.collection(collection).where(fieldPath, op, value).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
};

export const adminDeleteByQuery = async (collection: string, fieldPath: string, op: FirebaseFirestore.WhereFilterOp, value: any): Promise<number> => {
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

export const runBestEffortWithTimeout = async (task: () => Promise<void>, timeoutMs = 12000): Promise<void> => {
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
export const arrayUnion = (...elements: any[]) => admin.firestore.FieldValue.arrayUnion(...elements);
export const arrayRemove = (...elements: any[]) => admin.firestore.FieldValue.arrayRemove(...elements);
export const increment = (n: number) => admin.firestore.FieldValue.increment(n);
