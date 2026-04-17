// tests/unit/utils/topicDeletionUtils.test.js
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_TOPIC_CASCADE_COLLECTIONS,
  cascadeDeleteTopicResources,
} from '../../../src/utils/topicDeletionUtils';

const firestoreMocks = vi.hoisted(() => ({
  collection: vi.fn((db, name) => ({ __kind: 'collection', db, name })),
  query: vi.fn((base, ...conditions) => ({ __kind: 'query', base, conditions })),
  where: vi.fn((field, op, value) => ({ field, op, value })),
  doc: vi.fn((db, name, id) => ({ __kind: 'doc', db, name, id })),
  getDocs: vi.fn(),
  deleteDoc: vi.fn(),
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: (...args) => firestoreMocks.collection(...args),
    query: (...args) => firestoreMocks.query(...args),
    where: (...args) => firestoreMocks.where(...args),
    doc: (...args) => firestoreMocks.doc(...args),
    getDocs: (...args) => firestoreMocks.getDocs(...args),
    deleteDoc: (...args) => firestoreMocks.deleteDoc(...args),
  };
});

describe('topicDeletionUtils', () => {
  const db = { __db: 'mock-db' };

  beforeEach(() => {
    vi.clearAllMocks();
    firestoreMocks.getDocs.mockResolvedValue({ docs: [] });
    firestoreMocks.deleteDoc.mockResolvedValue(undefined);
  });

  it('cascades deletes for all default topic-linked collections', async () => {
    firestoreMocks.getDocs.mockImplementation(async (queryRef) => {
      const collectionName = queryRef?.base?.name;
      if (collectionName === 'documents') {
        return { docs: [{ id: 'doc-1' }] };
      }
      if (collectionName === 'resumen') {
        return { docs: [{ id: 'res-1' }] };
      }
      if (collectionName === 'quizzes') {
        return { docs: [{ id: 'quiz-1' }] };
      }
      if (collectionName === 'exams') {
        return { docs: [{ id: 'exam-1' }] };
      }
      if (collectionName === 'examns') {
        return { docs: [{ id: 'examn-1' }] };
      }
      return { docs: [] };
    });

    const result = await cascadeDeleteTopicResources({ db, topicId: 'topic-1' });

    expect(result.collections).toEqual(DEFAULT_TOPIC_CASCADE_COLLECTIONS);
    expect(result.attemptedDeletes).toBe(5);
    expect(result.queryFailures).toEqual([]);
    expect(result.deleteFailures).toEqual([]);

    expect(firestoreMocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'documents', id: 'doc-1' })
    );
    expect(firestoreMocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'resumen', id: 'res-1' })
    );
    expect(firestoreMocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'quizzes', id: 'quiz-1' })
    );
    expect(firestoreMocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'exams', id: 'exam-1' })
    );
    expect(firestoreMocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'examns', id: 'examn-1' })
    );
  });

  it('continues when query/delete errors occur and ignores not-found deletes', async () => {
    const warn = vi.fn();

    firestoreMocks.getDocs.mockImplementation(async (queryRef) => {
      const collectionName = queryRef?.base?.name;
      if (collectionName === 'documents') {
        return { docs: [{ id: 'doc-error' }, { id: 'doc-orphan' }] };
      }
      if (collectionName === 'resumen') {
        throw Object.assign(new Error('permission error'), { code: 'permission-denied' });
      }
      return { docs: [] };
    });

    firestoreMocks.deleteDoc.mockImplementation(async (docRef) => {
      if (docRef?.name === 'documents' && docRef?.id === 'doc-error') {
        throw Object.assign(new Error('delete failed'), { code: 'internal' });
      }
      if (docRef?.name === 'documents' && docRef?.id === 'doc-orphan') {
        throw Object.assign(new Error('No document to update: missing target'), { code: 'not-found' });
      }
      return undefined;
    });

    const result = await cascadeDeleteTopicResources({
      db,
      topicId: 'topic-1',
      logger: { warn },
    });

    expect(result.queryFailures).toHaveLength(1);
    expect(result.queryFailures[0].collectionName).toBe('resumen');
    expect(result.deleteFailures).toHaveLength(1);
    expect(result.deleteFailures[0]).toEqual(
      expect.objectContaining({ collectionName: 'documents', itemId: 'doc-error' })
    );
    expect(warn).toHaveBeenCalled();
  });

  it('normalizes custom collection lists and deduplicates entries', async () => {
    const result = await cascadeDeleteTopicResources({
      db,
      topicId: 'topic-1',
      collections: [' documents ', '', 'quizzes', 'documents', '   ', 'exams'],
    });

    expect(result.collections).toEqual(['documents', 'quizzes', 'exams']);
    expect(firestoreMocks.getDocs).toHaveBeenCalledTimes(3);
  });
});
