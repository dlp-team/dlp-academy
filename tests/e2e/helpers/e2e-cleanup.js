// tests/e2e/helpers/e2e-cleanup.js
import { ensureAdmin, adminDeleteDoc, adminDeleteByQuery } from './e2e-firebase-admin.js';

class CleanupRegistry {
  constructor() {
    this._docs = [];
    this._storagePaths = [];
  }

  register(collection, docId) {
    if (collection && docId) {
      this._docs.push({ collection, docId });
    }
  }

  registerBatch(collection, docIds) {
    if (!Array.isArray(docIds)) return;
    for (const docId of docIds) {
      this.register(collection, docId);
    }
  }

  registerStoragePath(path) {
    if (path) {
      this._storagePaths.push(path);
    }
  }

  async executeAll() {
    const db = ensureAdmin();
    if (!db) return;

    // Delete registered Firestore docs (reverse order for nested deps)
    const reversed = [...this._docs].reverse();
    for (const { collection, docId } of reversed) {
      try {
        await adminDeleteDoc(collection, docId);
      } catch {
        // Best-effort cleanup; continue with remaining
      }
    }

    // Delete registered Storage files
    if (this._storagePaths.length > 0) {
      try {
        const { getStorage } = await import('firebase-admin/storage');
        const bucket = getStorage().bucket();
        for (const path of this._storagePaths) {
          try {
            await bucket.file(path).delete();
          } catch {
            // File may already be deleted
          }
        }
      } catch {
        // Storage cleanup is best-effort
      }
    }

    this.reset();
  }

  reset() {
    this._docs = [];
    this._storagePaths = [];
  }

  get pendingCount() {
    return this._docs.length + this._storagePaths.length;
  }
}

export const cleanup = new CleanupRegistry();

export const sweepE2eSeedData = async (collections = ['subjects', 'folders', 'studyTopics', 'notifications', 'shortcuts']) => {
  let totalDeleted = 0;
  for (const collection of collections) {
    const deleted = await adminDeleteByQuery(collection, 'e2eSeed', '==', true);
    totalDeleted += deleted;
  }
  return totalDeleted;
};

export const createCleanupScope = () => new CleanupRegistry();
