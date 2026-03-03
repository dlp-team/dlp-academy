import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSubjectManager } from '../../../src/pages/Subject/hooks/useSubjectManager';

const mockNavigate = vi.fn();

const firestoreMocks = vi.hoisted(() => ({
  mockCollection: vi.fn((db, name) => ({ db, name })),
  mockQuery: vi.fn((...parts) => ({ parts })),
  mockWhere: vi.fn((field, op, value) => ({ field, op, value })),
  mockOrderBy: vi.fn((field, direction) => ({ field, direction })),
  mockDoc: vi.fn((db, name, id) => ({ db, name, id })),
  mockGetDoc: vi.fn(),
  mockOnSnapshot: vi.fn(),
  mockUpdateDoc: vi.fn(),
  mockDeleteDoc: vi.fn(),
  mockAddDoc: vi.fn(),
  mockServerTimestamp: vi.fn(() => 'server-ts'),
  mockWriteBatch: vi.fn(),
  mockIncrement: vi.fn((value) => ({ __increment: value })),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../src/firebase/config', () => ({
  db: { __db: 'mock-db' },
}));

vi.mock('../../../src/utils/permissionUtils', () => ({
  canView: vi.fn(() => true),
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: firestoreMocks.mockCollection,
    query: firestoreMocks.mockQuery,
    where: firestoreMocks.mockWhere,
    orderBy: firestoreMocks.mockOrderBy,
    doc: firestoreMocks.mockDoc,
    getDoc: firestoreMocks.mockGetDoc,
    onSnapshot: firestoreMocks.mockOnSnapshot,
    updateDoc: firestoreMocks.mockUpdateDoc,
    deleteDoc: firestoreMocks.mockDeleteDoc,
    addDoc: firestoreMocks.mockAddDoc,
    serverTimestamp: firestoreMocks.mockServerTimestamp,
    writeBatch: firestoreMocks.mockWriteBatch,
    increment: firestoreMocks.mockIncrement,
  };
});

const createDoc = (id, data) => ({
  id,
  data: () => data,
});

describe('useSubjectManager', () => {
  const user = {
    uid: 'user-1',
    institutionId: 'inst-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    firestoreMocks.mockOnSnapshot.mockImplementation((_q, callback) => {
      callback({ docs: [] });
      return vi.fn();
    });
  });

  it('navigates back home when subject does not exist', async () => {
    firestoreMocks.mockGetDoc.mockResolvedValue({
      exists: () => false,
    });

    const { result } = renderHook(() => useSubjectManager(user, 'missing-subject'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  it('creates a new topic and increments subject topicCount', async () => {
    firestoreMocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      id: 'subject-1',
      data: () => ({
        name: 'Math',
        color: 'from-blue-500 to-indigo-600',
        ownerId: 'owner-1',
        institutionId: 'inst-1',
      }),
    });

    firestoreMocks.mockAddDoc.mockResolvedValueOnce({ id: 'topic-new' });

    const { result } = renderHook(() => useSubjectManager(user, 'subject-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.subject?.id).toBe('subject-1');
    });

    await act(async () => {
      await result.current.createTopic({
        name: 'Algebra',
        prompt: 'Introduce conceptos clave',
      }, []);
    });

    expect(firestoreMocks.mockAddDoc).toHaveBeenCalled();
    const [topicCollection, topicPayload] = firestoreMocks.mockAddDoc.mock.calls[0];

    expect(topicCollection.name).toBe('topics');
    expect(topicPayload.name).toBe('Algebra');
    expect(topicPayload.subjectId).toBe('subject-1');
    expect(topicPayload.ownerId).toBe('owner-1');
    expect(topicPayload.institutionId).toBe('inst-1');

    expect(firestoreMocks.mockUpdateDoc).toHaveBeenCalled();
    const [, subjectPatch] = firestoreMocks.mockUpdateDoc.mock.calls.find(([, patch]) => patch?.topicCount);
    expect(subjectPatch.topicCount).toEqual({ __increment: 1 });
  });

  it('reorders topics and persists new order through batch', async () => {
    firestoreMocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      id: 'subject-1',
      data: () => ({
        name: 'Math',
        color: 'from-blue-500 to-indigo-600',
        ownerId: 'owner-1',
        institutionId: 'inst-1',
      }),
    });

    firestoreMocks.mockOnSnapshot.mockImplementation((q, callback) => {
      const isTopicsQuery = Array.isArray(q?.parts) && q.parts.some((part) => part?.field === 'subjectId');

      if (isTopicsQuery) {
        callback({
          docs: [
            createDoc('topic-a', { name: 'A', subjectId: 'subject-1', order: 1 }),
            createDoc('topic-b', { name: 'B', subjectId: 'subject-1', order: 2 }),
          ],
        });
      } else {
        callback({ docs: [] });
      }

      return vi.fn();
    });

    const batchUpdate = vi.fn();
    const batchCommit = vi.fn().mockResolvedValue(undefined);
    firestoreMocks.mockWriteBatch.mockReturnValue({
      update: batchUpdate,
      commit: batchCommit,
    });

    const { result } = renderHook(() => useSubjectManager(user, 'subject-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.topics).toHaveLength(2);
    });

    await act(async () => {
      await result.current.handleReorderTopics('topic-a', 'topic-b');
    });

    expect(batchUpdate).toHaveBeenCalledTimes(2);
    expect(batchCommit).toHaveBeenCalledTimes(1);
  });
});
