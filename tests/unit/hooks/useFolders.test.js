import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFolders } from '../../../src/hooks/useFolders';

const firestoreMocks = vi.hoisted(() => ({
  mockCollection: vi.fn((db, name) => ({ db, name })),
  mockDoc: vi.fn((db, name, id) => ({ db, name, id })),
  mockWhere: vi.fn((field, op, value) => ({ field, op, value })),
  mockQuery: vi.fn((...parts) => ({ parts })),
  mockAddDoc: vi.fn(),
  mockOnSnapshot: vi.fn(),
  mockGetDoc: vi.fn(),
  mockGetDocs: vi.fn(),
  mockUpdateDoc: vi.fn(),
  mockDeleteDoc: vi.fn(),
  mockSetDoc: vi.fn(),
  mockBatchUpdate: vi.fn(),
  mockBatchDelete: vi.fn(),
  mockBatchCommit: vi.fn(),
  mockWriteBatch: vi.fn(),
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
    getDocs: firestoreMocks.mockGetDocs,
    updateDoc: firestoreMocks.mockUpdateDoc,
    deleteDoc: firestoreMocks.mockDeleteDoc,
    doc: firestoreMocks.mockDoc,
    setDoc: firestoreMocks.mockSetDoc,
    arrayUnion: vi.fn((...args) => args),
    arrayRemove: vi.fn((...args) => args),
    writeBatch: firestoreMocks.mockWriteBatch,
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
    firestoreMocks.mockOnSnapshot.mockImplementation((_queryObj, callback) => {
      callback({ docs: [] });
      return vi.fn();
    });
    firestoreMocks.mockGetDocs.mockResolvedValue({ docs: [], forEach: () => {} });
    firestoreMocks.mockBatchUpdate.mockReset();
    firestoreMocks.mockBatchDelete.mockReset();
    firestoreMocks.mockBatchCommit.mockReset();
    firestoreMocks.mockWriteBatch.mockReturnValue({
      update: firestoreMocks.mockBatchUpdate,
      delete: firestoreMocks.mockBatchDelete,
      commit: firestoreMocks.mockBatchCommit,
    });
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

  it('deleteFolderOnly re-parents children and deletes only selected folder', async () => {
    firestoreMocks.mockOnSnapshot.mockImplementation((queryObj, callback) => {
      const isOwnedQuery = queryObj.parts.some((entry) => entry?.field === 'ownerId');

      if (isOwnedQuery) {
        callback({
          docs: [
            createDoc('folder-1', {
              name: 'Folder 1',
              ownerId: user.uid,
              institutionId: user.institutionId,
              parentId: 'parent-1',
            }),
          ],
        });
      } else {
        callback({ docs: [] });
      }

      return vi.fn();
    });

    firestoreMocks.mockGetDocs.mockImplementation(async (queryObj) => {
      const whereBy = queryObj.parts.find((entry) => entry?.field)?.field;

      if (whereBy === 'folderId') {
        return {
          docs: [createDoc('subject-1', { folderId: 'folder-1' })],
          forEach: (fn) => [createDoc('subject-1', { folderId: 'folder-1' })].forEach(fn),
        };
      }

      if (whereBy === 'parentId') {
        return {
          docs: [createDoc('child-folder-1', { parentId: 'folder-1' })],
          forEach: (fn) => [createDoc('child-folder-1', { parentId: 'folder-1' })].forEach(fn),
        };
      }

      return { docs: [], forEach: () => {} };
    });

    const { result } = renderHook(() => useFolders(user));

    await act(async () => {
      await result.current.deleteFolderOnly('folder-1');
    });

    expect(firestoreMocks.mockBatchUpdate).toHaveBeenCalledTimes(2);
    expect(firestoreMocks.mockBatchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'subjects', id: 'subject-1' }),
      expect.objectContaining({ folderId: 'parent-1' })
    );
    expect(firestoreMocks.mockBatchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'folders', id: 'child-folder-1' }),
      expect.objectContaining({ parentId: 'parent-1' })
    );
    expect(firestoreMocks.mockBatchCommit).toHaveBeenCalledTimes(1);
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'folders', id: 'folder-1' })
    );
  });

  it('deleteFolder recursively deletes child subjects and child folders', async () => {
    firestoreMocks.mockOnSnapshot.mockImplementation((queryObj, callback) => {
      const isOwnedQuery = queryObj.parts.some((entry) => entry?.field === 'ownerId');

      if (isOwnedQuery) {
        callback({
          docs: [
            createDoc('folder-1', {
              name: 'Folder 1',
              ownerId: user.uid,
              institutionId: user.institutionId,
              parentId: null,
            }),
            createDoc('folder-child', {
              name: 'Folder Child',
              ownerId: user.uid,
              institutionId: user.institutionId,
              parentId: 'folder-1',
            }),
          ],
        });
      } else {
        callback({ docs: [] });
      }

      return vi.fn();
    });

    firestoreMocks.mockGetDocs.mockImplementation(async (queryObj) => {
      const filter = queryObj.parts.find((entry) => entry?.field);

      if (filter?.field === 'folderId' && filter?.value === 'folder-1') {
        return {
          docs: [createDoc('subject-root', { folderId: 'folder-1' })],
          forEach: (fn) => [createDoc('subject-root', { folderId: 'folder-1' })].forEach(fn),
        };
      }

      if (filter?.field === 'folderId' && filter?.value === 'folder-child') {
        return {
          docs: [createDoc('subject-child', { folderId: 'folder-child' })],
          forEach: (fn) => [createDoc('subject-child', { folderId: 'folder-child' })].forEach(fn),
        };
      }

      if (filter?.field === 'parentId' && filter?.value === 'folder-1') {
        return {
          docs: [createDoc('folder-child', { parentId: 'folder-1' })],
          forEach: (fn) => [createDoc('folder-child', { parentId: 'folder-1' })].forEach(fn),
        };
      }

      if (filter?.field === 'parentId' && filter?.value === 'folder-child') {
        return { docs: [], forEach: () => {} };
      }

      return { docs: [], forEach: () => {} };
    });

    const { result } = renderHook(() => useFolders(user));

    await act(async () => {
      await result.current.deleteFolder('folder-1');
    });

    expect(firestoreMocks.mockBatchDelete).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'subjects', id: 'subject-root' })
    );
    expect(firestoreMocks.mockBatchDelete).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'subjects', id: 'subject-child' })
    );
    expect(firestoreMocks.mockBatchDelete).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'folders', id: 'folder-child' })
    );
    expect(firestoreMocks.mockBatchDelete).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'folders', id: 'folder-1' })
    );
    expect(firestoreMocks.mockBatchCommit).toHaveBeenCalledTimes(1);
  });

  it('deleteFolder still deletes folder when child queries fail', async () => {
    firestoreMocks.mockOnSnapshot.mockImplementation((queryObj, callback) => {
      const isOwnedQuery = queryObj.parts.some((entry) => entry?.field === 'ownerId');

      if (isOwnedQuery) {
        callback({
          docs: [
            createDoc('folder-1', {
              name: 'Folder 1',
              ownerId: user.uid,
              institutionId: user.institutionId,
              parentId: null,
            }),
          ],
        });
      } else {
        callback({ docs: [] });
      }

      return vi.fn();
    });

    firestoreMocks.mockGetDocs.mockRejectedValue(new Error('query failed'));

    const { result } = renderHook(() => useFolders(user));

    await act(async () => {
      await result.current.deleteFolder('folder-1');
    });

    expect(firestoreMocks.mockBatchDelete).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'folders', id: 'folder-1' })
    );
    expect(firestoreMocks.mockBatchCommit).toHaveBeenCalledTimes(1);
  });

  it('deleteFolder falls back to root delete when batch commit fails', async () => {
    firestoreMocks.mockOnSnapshot.mockImplementation((queryObj, callback) => {
      const isOwnedQuery = queryObj.parts.some((entry) => entry?.field === 'ownerId');

      if (isOwnedQuery) {
        callback({
          docs: [
            createDoc('folder-1', {
              name: 'Folder 1',
              ownerId: user.uid,
              institutionId: user.institutionId,
              parentId: null,
            }),
          ],
        });
      } else {
        callback({ docs: [] });
      }

      return vi.fn();
    });

    firestoreMocks.mockGetDocs.mockResolvedValue({ docs: [], forEach: () => {} });
    firestoreMocks.mockBatchCommit.mockRejectedValueOnce(new Error('batch commit failed'));

    const { result } = renderHook(() => useFolders(user));

    await act(async () => {
      await result.current.deleteFolder('folder-1');
    });

    expect(firestoreMocks.mockBatchCommit).toHaveBeenCalledTimes(1);
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'folders', id: 'folder-1' })
    );
  });

  it('deleteFolder continues when shortcut cleanup fails', async () => {
    firestoreMocks.mockOnSnapshot.mockImplementation((queryObj, callback) => {
      const isOwnedQuery = queryObj.parts.some((entry) => entry?.field === 'ownerId');

      if (isOwnedQuery) {
        callback({
          docs: [
            createDoc('folder-1', {
              name: 'Folder 1',
              ownerId: user.uid,
              institutionId: user.institutionId,
              parentId: null,
            }),
          ],
        });
      } else {
        callback({ docs: [] });
      }

      return vi.fn();
    });

    firestoreMocks.mockGetDocs.mockImplementation(async (queryObj) => {
      const filters = queryObj.parts.filter((entry) => entry?.field);
      const fieldMap = new Map(filters.map((f) => [f.field, f.value]));

      if (fieldMap.get('targetId') === 'folder-1' && fieldMap.get('targetType') === 'folder') {
        return {
          docs: [createDoc('shortcut-folder-1', { targetId: 'folder-1', targetType: 'folder' })],
          forEach: (fn) => [createDoc('shortcut-folder-1', { targetId: 'folder-1', targetType: 'folder' })].forEach(fn),
        };
      }

      return { docs: [], forEach: () => {} };
    });

    firestoreMocks.mockDeleteDoc.mockImplementation(async (docRef) => {
      if (docRef?.name === 'shortcuts') {
        throw new Error('shortcut delete failed');
      }
      return undefined;
    });

    const { result } = renderHook(() => useFolders(user));

    await act(async () => {
      await result.current.deleteFolder('folder-1');
    });

    expect(firestoreMocks.mockBatchCommit).toHaveBeenCalledTimes(1);
    expect(firestoreMocks.mockBatchDelete).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'folders', id: 'folder-1' })
    );
  });

  it('deleteFolder cascades shared subjects inside folder', async () => {
    firestoreMocks.mockOnSnapshot.mockImplementation((queryObj, callback) => {
      const isOwnedQuery = queryObj.parts.some((entry) => entry?.field === 'ownerId');

      if (isOwnedQuery) {
        callback({
          docs: [
            createDoc('folder-shared', {
              name: 'Folder Shared',
              ownerId: user.uid,
              institutionId: user.institutionId,
              parentId: null,
              isShared: true,
              sharedWithUids: ['editor-1', 'viewer-1'],
            }),
          ],
        });
      } else {
        callback({ docs: [] });
      }

      return vi.fn();
    });

    firestoreMocks.mockGetDocs.mockImplementation(async (queryObj) => {
      const filter = queryObj.parts.find((entry) => entry?.field);

      if (filter?.field === 'folderId' && filter?.value === 'folder-shared') {
        return {
          docs: [
            createDoc('subject-shared-1', {
              folderId: 'folder-shared',
              isShared: true,
              sharedWithUids: ['editor-1', 'viewer-1'],
            }),
          ],
          forEach: (fn) => [
            createDoc('subject-shared-1', {
              folderId: 'folder-shared',
              isShared: true,
              sharedWithUids: ['editor-1', 'viewer-1'],
            }),
          ].forEach(fn),
        };
      }

      if (filter?.field === 'parentId' && filter?.value === 'folder-shared') {
        return { docs: [], forEach: () => {} };
      }

      return { docs: [], forEach: () => {} };
    });

    const { result } = renderHook(() => useFolders(user));

    await act(async () => {
      await result.current.deleteFolder('folder-shared');
    });

    expect(firestoreMocks.mockBatchDelete).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'subjects', id: 'subject-shared-1' })
    );
    expect(firestoreMocks.mockBatchDelete).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'folders', id: 'folder-shared' })
    );
  });

  it('deleteFolder shortcut cleanup targets owner shortcuts only, preserving recipient orphan entries', async () => {
    firestoreMocks.mockOnSnapshot.mockImplementation((queryObj, callback) => {
      const isOwnedQuery = queryObj.parts.some((entry) => entry?.field === 'ownerId');

      if (isOwnedQuery) {
        callback({
          docs: [
            createDoc('folder-ghost-owner', {
              name: 'Folder Ghost Owner',
              ownerId: user.uid,
              institutionId: user.institutionId,
              parentId: null,
            }),
          ],
        });
      } else {
        callback({ docs: [] });
      }

      return vi.fn();
    });

    firestoreMocks.mockGetDocs.mockImplementation(async (queryObj) => {
      const filters = queryObj.parts.filter((entry) => entry?.field);
      const fieldMap = new Map(filters.map((f) => [f.field, f.value]));

      if (
        fieldMap.get('targetId') === 'folder-ghost-owner' &&
        fieldMap.get('targetType') === 'folder' &&
        fieldMap.get('ownerId') === user.uid
      ) {
        return {
          docs: [createDoc('shortcut-owner-folder-1', { targetId: 'folder-ghost-owner', targetType: 'folder' })],
          forEach: (fn) => [createDoc('shortcut-owner-folder-1', { targetId: 'folder-ghost-owner', targetType: 'folder' })].forEach(fn),
        };
      }

      return { docs: [], forEach: () => {} };
    });

    const { result } = renderHook(() => useFolders(user));

    await act(async () => {
      await result.current.deleteFolder('folder-ghost-owner');
    });

    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'shortcuts', id: 'shortcut-owner-folder-1' })
    );
    expect(firestoreMocks.mockDeleteDoc).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: 'shortcuts', id: 'shortcut-recipient-folder-1' })
    );

    const shortcutQueryCall = firestoreMocks.mockQuery.mock.calls.find((call) => {
      const clauses = call.filter((entry) => entry?.field);
      const clauseMap = new Map(clauses.map((c) => [c.field, c.value]));
      return clauseMap.get('targetId') === 'folder-ghost-owner' && clauseMap.get('targetType') === 'folder';
    });

    expect(shortcutQueryCall).toBeTruthy();
    const ownerFilter = shortcutQueryCall.find((entry) => entry?.field === 'ownerId');
    expect(ownerFilter?.value).toBe(user.uid);
  });

  it('deleteFolderOnly still deletes folder when move queries fail', async () => {
    firestoreMocks.mockOnSnapshot.mockImplementation((queryObj, callback) => {
      const isOwnedQuery = queryObj.parts.some((entry) => entry?.field === 'ownerId');

      if (isOwnedQuery) {
        callback({
          docs: [
            createDoc('folder-1', {
              name: 'Folder 1',
              ownerId: user.uid,
              institutionId: user.institutionId,
              parentId: 'parent-1',
            }),
          ],
        });
      } else {
        callback({ docs: [] });
      }

      return vi.fn();
    });

    firestoreMocks.mockGetDocs.mockRejectedValue(new Error('query failed'));

    const { result } = renderHook(() => useFolders(user));

    await act(async () => {
      await result.current.deleteFolderOnly('folder-1');
    });

    expect(firestoreMocks.mockBatchUpdate).not.toHaveBeenCalled();
    expect(firestoreMocks.mockBatchCommit).toHaveBeenCalledTimes(1);
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'folders', id: 'folder-1' })
    );
  });

  it('deleteFolderOnly still deletes folder when batch commit fails', async () => {
    firestoreMocks.mockOnSnapshot.mockImplementation((queryObj, callback) => {
      const isOwnedQuery = queryObj.parts.some((entry) => entry?.field === 'ownerId');

      if (isOwnedQuery) {
        callback({
          docs: [
            createDoc('folder-1', {
              name: 'Folder 1',
              ownerId: user.uid,
              institutionId: user.institutionId,
              parentId: 'parent-1',
            }),
          ],
        });
      } else {
        callback({ docs: [] });
      }

      return vi.fn();
    });

    firestoreMocks.mockGetDocs.mockResolvedValue({ docs: [], forEach: () => {} });
    firestoreMocks.mockBatchCommit.mockRejectedValueOnce(new Error('batch commit failed'));

    const { result } = renderHook(() => useFolders(user));

    await act(async () => {
      await result.current.deleteFolderOnly('folder-1');
    });

    expect(firestoreMocks.mockBatchCommit).toHaveBeenCalledTimes(1);
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'folders', id: 'folder-1' })
    );
  });

  it('deleteFolderOnly still deletes folder when shortcut cleanup fails', async () => {
    firestoreMocks.mockOnSnapshot.mockImplementation((queryObj, callback) => {
      const isOwnedQuery = queryObj.parts.some((entry) => entry?.field === 'ownerId');

      if (isOwnedQuery) {
        callback({
          docs: [
            createDoc('folder-1', {
              name: 'Folder 1',
              ownerId: user.uid,
              institutionId: user.institutionId,
              parentId: null,
            }),
          ],
        });
      } else {
        callback({ docs: [] });
      }

      return vi.fn();
    });

    firestoreMocks.mockGetDocs.mockImplementation(async (queryObj) => {
      const filters = queryObj.parts.filter((entry) => entry?.field);
      const fieldMap = new Map(filters.map((f) => [f.field, f.value]));

      if (fieldMap.get('targetId') === 'folder-1' && fieldMap.get('targetType') === 'folder') {
        return {
          docs: [createDoc('shortcut-folder-1', { targetId: 'folder-1', targetType: 'folder' })],
          forEach: (fn) => [createDoc('shortcut-folder-1', { targetId: 'folder-1', targetType: 'folder' })].forEach(fn),
        };
      }

      return { docs: [], forEach: () => {} };
    });

    firestoreMocks.mockDeleteDoc.mockImplementation(async (docRef) => {
      if (docRef?.name === 'shortcuts') {
        throw new Error('shortcut delete failed');
      }
      return undefined;
    });

    const { result } = renderHook(() => useFolders(user));

    await act(async () => {
      await result.current.deleteFolderOnly('folder-1');
    });

    expect(firestoreMocks.mockBatchCommit).toHaveBeenCalledTimes(1);
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'folders', id: 'folder-1' })
    );
  });

  it('deleteFolder is idempotent no-op when folder is already missing', async () => {
    firestoreMocks.mockOnSnapshot.mockImplementation((_queryObj, callback) => {
      callback({ docs: [] });
      return vi.fn();
    });

    const { result } = renderHook(() => useFolders(user));

    await act(async () => {
      await result.current.deleteFolder('folder-missing');
      await result.current.deleteFolder('folder-missing');
    });

    expect(firestoreMocks.mockBatchCommit).not.toHaveBeenCalled();
    expect(firestoreMocks.mockDeleteDoc).not.toHaveBeenCalled();
  });

  it('deleteFolderOnly is idempotent no-op when folder is already missing', async () => {
    firestoreMocks.mockOnSnapshot.mockImplementation((_queryObj, callback) => {
      callback({ docs: [] });
      return vi.fn();
    });

    const { result } = renderHook(() => useFolders(user));

    await act(async () => {
      await result.current.deleteFolderOnly('folder-missing');
      await result.current.deleteFolderOnly('folder-missing');
    });

    expect(firestoreMocks.mockBatchCommit).not.toHaveBeenCalled();
    expect(firestoreMocks.mockDeleteDoc).not.toHaveBeenCalled();
  });

  it('deleteFolder still cascades when folder institutionId is missing', async () => {
    firestoreMocks.mockOnSnapshot.mockImplementation((queryObj, callback) => {
      const isOwnedQuery = queryObj.parts.some((entry) => entry?.field === 'ownerId');

      if (isOwnedQuery) {
        callback({
          docs: [
            createDoc('folder-no-inst', {
              name: 'Folder No Inst',
              ownerId: user.uid,
              parentId: null,
            }),
          ],
        });
      } else {
        callback({ docs: [] });
      }

      return vi.fn();
    });

    firestoreMocks.mockGetDocs.mockResolvedValue({ docs: [], forEach: () => {} });

    const { result } = renderHook(() => useFolders(user));

    await act(async () => {
      await result.current.deleteFolder('folder-no-inst');
    });

    expect(firestoreMocks.mockBatchDelete).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'folders', id: 'folder-no-inst' })
    );
    expect(firestoreMocks.mockBatchCommit).toHaveBeenCalledTimes(1);
  });

  it('deleteFolderOnly still deletes folder when institutionId is missing', async () => {
    firestoreMocks.mockOnSnapshot.mockImplementation((queryObj, callback) => {
      const isOwnedQuery = queryObj.parts.some((entry) => entry?.field === 'ownerId');

      if (isOwnedQuery) {
        callback({
          docs: [
            createDoc('folder-no-inst', {
              name: 'Folder No Inst',
              ownerId: user.uid,
              parentId: null,
            }),
          ],
        });
      } else {
        callback({ docs: [] });
      }

      return vi.fn();
    });

    firestoreMocks.mockGetDocs.mockResolvedValue({ docs: [], forEach: () => {} });

    const { result } = renderHook(() => useFolders(user));

    await act(async () => {
      await result.current.deleteFolderOnly('folder-no-inst');
    });

    expect(firestoreMocks.mockBatchCommit).toHaveBeenCalledTimes(1);
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'folders', id: 'folder-no-inst' })
    );
  });

  it('transferFolderOwnership updates owner and writes previous-owner shortcut', async () => {
    firestoreMocks.mockOnSnapshot.mockImplementation((queryObj, callback) => {
      const isOwnedQuery = queryObj.parts.some((entry) => entry?.field === 'ownerId');

      if (isOwnedQuery) {
        callback({
          docs: [
            createDoc('folder-1', {
              name: 'Folder 1',
              ownerId: user.uid,
              institutionId: user.institutionId,
              parentId: 'root',
            }),
          ],
        });
      } else {
        callback({ docs: [] });
      }

      return vi.fn();
    });

    firestoreMocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        ownerId: user.uid,
        ownerEmail: user.email,
        parentId: 'root',
        institutionId: user.institutionId,
        name: 'Folder 1',
        tags: ['test'],
        color: 'from-amber-400 to-amber-600',
        icon: 'folder',
        cardStyle: 'default',
        modernFillColor: '#112233',
        sharedWithUids: [user.uid, 'user-2'],
        sharedWith: [
          { uid: user.uid, email: user.email },
          { uid: 'user-2', email: 'newowner@test.com', displayName: 'New Owner' },
        ],
      }),
    });

    const { result } = renderHook(() => useFolders(user));

    await expect(
      result.current.transferFolderOwnership('folder-1', 'newowner@test.com')
    ).resolves.toEqual({
      success: true,
      previousOwnerUid: user.uid,
      newOwnerUid: 'user-2',
      newOwnerEmail: 'newowner@test.com',
    });

    expect(firestoreMocks.mockUpdateDoc).toHaveBeenCalledTimes(1);
    const [folderRef, folderPayload] = firestoreMocks.mockUpdateDoc.mock.calls[0];
    expect(folderRef).toMatchObject({ name: 'folders', id: 'folder-1' });
    expect(folderPayload.ownerId).toBe('user-2');
    expect(folderPayload.ownerEmail).toBe('newowner@test.com');
    expect(folderPayload.sharedWithUids).toContain(user.uid);
    expect(folderPayload.sharedWithUids).not.toContain('user-2');

    expect(firestoreMocks.mockSetDoc).toHaveBeenCalledTimes(1);
    const [shortcutRef, shortcutPayload, shortcutOptions] = firestoreMocks.mockSetDoc.mock.calls[0];
    expect(shortcutRef).toMatchObject({ name: 'shortcuts', id: `${user.uid}_folder-1_folder` });
    expect(shortcutPayload).toMatchObject({
      ownerId: user.uid,
      targetId: 'folder-1',
      targetType: 'folder',
      parentId: 'root',
      institutionId: user.institutionId,
      shortcutName: 'Folder 1',
    });
    expect(shortcutOptions).toEqual({ merge: true });
  });

  it('transferFolderOwnership rejects same-user recipient', async () => {
    const { result } = renderHook(() => useFolders(user));

    await expect(
      result.current.transferFolderOwnership('folder-1', user.email)
    ).rejects.toThrow('No puedes transferir la propiedad a tu propio usuario.');

    expect(firestoreMocks.mockGetDoc).not.toHaveBeenCalled();
    expect(firestoreMocks.mockUpdateDoc).not.toHaveBeenCalled();
  });

  it('transferFolderOwnership rejects transfer when current user is not owner', async () => {
    firestoreMocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        ownerId: 'another-owner',
        sharedWithUids: [user.uid, 'user-2'],
        sharedWith: [
          { uid: user.uid, email: user.email },
          { uid: 'user-2', email: 'newowner@test.com' },
        ],
      }),
    });

    const { result } = renderHook(() => useFolders(user));

    await expect(
      result.current.transferFolderOwnership('folder-1', 'newowner@test.com')
    ).rejects.toThrow('Solo el propietario actual puede transferir la propiedad.');

    expect(firestoreMocks.mockUpdateDoc).not.toHaveBeenCalled();
    expect(firestoreMocks.mockSetDoc).not.toHaveBeenCalled();
  });

  it('transferFolderOwnership rejects transfer to non-shared recipient', async () => {
    firestoreMocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        ownerId: user.uid,
        sharedWithUids: [user.uid],
        sharedWith: [{ uid: user.uid, email: user.email }],
      }),
    });

    const { result } = renderHook(() => useFolders(user));

    await expect(
      result.current.transferFolderOwnership('folder-1', 'outsider@test.com')
    ).rejects.toThrow('Solo puedes transferir la propiedad a un usuario que ya tenga acceso compartido.');

    expect(firestoreMocks.mockUpdateDoc).not.toHaveBeenCalled();
    expect(firestoreMocks.mockSetDoc).not.toHaveBeenCalled();
  });
});
