import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFolders } from '../../../src/hooks/useFolders';

const firestoreMocks = vi.hoisted(() => ({
  mockCollection: vi.fn((db, name) => ({ db, name })),
  mockWhere: vi.fn((field, op, value) => ({ field, op, value })),
  mockQuery: vi.fn((...parts) => ({ parts })),
  mockAddDoc: vi.fn(),
  mockOnSnapshot: vi.fn(),
  mockGetDoc: vi.fn(),
}));

vi.mock('../../../src/firebase/config', () => ({
  db: { __db: 'mock-db' },
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: firestoreMocks.mockCollection,
    where: firestoreMocks.mockWhere,
    query: firestoreMocks.mockQuery,
    addDoc: firestoreMocks.mockAddDoc,
    onSnapshot: firestoreMocks.mockOnSnapshot,
    getDoc: firestoreMocks.mockGetDoc,
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn((db, name, id) => ({ db, name, id })),
    setDoc: vi.fn(),
    arrayUnion: vi.fn((...args) => args),
    arrayRemove: vi.fn((...args) => args),
    writeBatch: vi.fn(() => ({ update: vi.fn(), delete: vi.fn(), commit: vi.fn() })),
    getDocs: vi.fn(),
  };
});

const createDoc = (id, data) => ({ id, data: () => data });

describe('useFolders', () => {
  const user = {
    uid: 'user-1',
    email: 'teacher@test.com',
    displayName: 'Teacher Test',
    role: 'teacher',
    country: 'ES',
    institutionId: 'inst-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    firestoreMocks.mockGetDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
  });

  it('updates folders state from Firestore snapshots', async () => {
    firestoreMocks.mockOnSnapshot.mockImplementation((queryObj, callback) => {
      const isOwnedQuery = queryObj.parts.some((entry) => entry?.field === 'ownerId');

      if (isOwnedQuery) {
        callback({
          docs: [
            createDoc('owned-folder', {
              name: 'Owned Folder',
              ownerId: user.uid,
              institutionId: user.institutionId,
            }),
          ],
        });
      } else {
        callback({
          docs: [
            createDoc('shared-folder', {
              name: 'Shared Folder',
              ownerId: 'other-user',
              institutionId: user.institutionId,
              isShared: true,
              sharedWith: [{ uid: user.uid, email: user.email }],
            }),
          ],
        });
      }

      return vi.fn();
    });

    const { result } = renderHook(() => useFolders(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.folders).toHaveLength(2);
    });

    const folderIds = result.current.folders.map((folder) => folder.id);
    expect(folderIds).toContain('owned-folder');
    expect(folderIds).toContain('shared-folder');
  });

  it('addFolder sends institutionId and ownerId to Firestore', async () => {
    firestoreMocks.mockOnSnapshot.mockImplementation((_queryObj, callback) => {
      callback({ docs: [] });
      return vi.fn();
    });

    firestoreMocks.mockAddDoc.mockResolvedValue({ id: 'new-folder-id' });

    const { result } = renderHook(() => useFolders(user));

    await act(async () => {
      await result.current.addFolder({
        name: 'Planning',
        description: 'Q1 content',
      });
    });

    expect(firestoreMocks.mockAddDoc).toHaveBeenCalledTimes(1);
    const [, payload] = firestoreMocks.mockAddDoc.mock.calls[0];

    expect(payload.ownerId).toBe(user.uid);
    expect(payload.ownerEmail).toBe(user.email);
    expect(payload.institutionId).toBe(user.institutionId);
    expect(payload.name).toBe('Planning');
  });
});
