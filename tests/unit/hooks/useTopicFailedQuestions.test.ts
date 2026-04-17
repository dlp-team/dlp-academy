// tests/unit/hooks/useTopicFailedQuestions.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTopicFailedQuestions } from '../../../src/pages/Topic/hooks/useTopicFailedQuestions';

const firestoreMocks = vi.hoisted(() => ({
  collection: vi.fn((database, collectionName) => ({
    __kind: 'collection',
    database,
    collectionName,
  })),
  where: vi.fn((field, op, value) => ({
    __kind: 'where',
    field,
    op,
    value,
  })),
  query: vi.fn((base, ...clauses) => ({
    __kind: 'query',
    base,
    clauses,
  })),
  doc: vi.fn((database, collectionName, id) => ({
    __kind: 'doc',
    database,
    collectionName,
    id,
  })),
  onSnapshot: vi.fn(),
}));

vi.mock('../../../src/firebase/config', () => ({
  db: { __db: 'mock-db' },
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: (...args) => firestoreMocks.collection(...args),
    where: (...args) => firestoreMocks.where(...args),
    query: (...args) => firestoreMocks.query(...args),
    doc: (...args) => firestoreMocks.doc(...args),
    onSnapshot: (...args) => firestoreMocks.onSnapshot(...args),
  };
});

const buildAttemptDoc = ({ id, quizId, completedAtMs, answersDetail }) => ({
  id,
  data: () => ({
    quizId,
    quizTitle: 'Quiz Demo',
    completedAt: { toMillis: () => completedAtMs },
    answersDetail,
  }),
});

describe('useTopicFailedQuestions', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('builds failed questions from latest attempts excluding mastered entries', async () => {
    firestoreMocks.onSnapshot.mockImplementation((source, onNext) => {
      if (source?.__kind === 'query') {
        onNext({
          docs: [
            buildAttemptDoc({
              id: 'attempt-1',
              quizId: 'quiz-1',
              completedAtMs: 200,
              answersDetail: [
                { questionIndex: 0, isCorrect: false, questionText: 'Q1' },
                { questionIndex: 1, isCorrect: false, questionText: 'Q2' },
                { questionIndex: 2, isCorrect: true, questionText: 'Q3' },
              ],
            }),
          ],
        });
        return vi.fn();
      }

      onNext({
        exists: () => true,
        data: () => ({
          masteredQuestions: [{ quizId: 'quiz-1', questionIndex: 1 }],
        }),
      });

      return vi.fn();
    });

    const { result } = renderHook(() => useTopicFailedQuestions({ uid: 'student-1' }, 'topic-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.failedQuestions).toHaveLength(1);
    expect(result.current.failedQuestions[0]).toEqual(
      expect.objectContaining({
        quizId: 'quiz-1',
        questionIndex: 0,
        questionText: 'Q1',
      })
    );
  });

  it('clears stale state when a new topic listener errors', async () => {
    let mode = 'success';

    firestoreMocks.onSnapshot.mockImplementation((source, onNext, onError) => {
      if (source?.__kind === 'query') {
        if (mode === 'error') {
          onError(new Error('permission-denied'));
          return vi.fn();
        }

        onNext({
          docs: [
            buildAttemptDoc({
              id: 'attempt-success',
              quizId: 'quiz-2',
              completedAtMs: 300,
              answersDetail: [{ questionIndex: 0, isCorrect: false, questionText: 'Stale question' }],
            }),
          ],
        });
        return vi.fn();
      }

      if (mode === 'error') {
        onError(new Error('permission-denied'));
        return vi.fn();
      }

      onNext({ exists: () => false, data: () => ({}) });
      return vi.fn();
    });

    const { result, rerender } = renderHook(
      ({ topicId }) => useTopicFailedQuestions({ uid: 'student-1' }, topicId),
      { initialProps: { topicId: 'topic-success' } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.failedQuestions).toHaveLength(1);
    });

    mode = 'error';
    rerender({ topicId: 'topic-error' });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.failedQuestions).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[TOPIC_FAILED_QUESTIONS] Error loading attempts:',
      expect.any(Error)
    );
  });
});
