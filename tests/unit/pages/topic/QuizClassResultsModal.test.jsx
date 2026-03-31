// tests/unit/pages/topic/QuizClassResultsModal.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import QuizClassResultsModal from '../../../../src/pages/Topic/components/QuizClassResultsModal';

const firestoreMocks = vi.hoisted(() => ({
  collection: vi.fn((database, collectionName) => ({
    __kind: 'collection',
    database,
    collectionName,
  })),
  query: vi.fn((source, ...clauses) => ({
    __kind: 'query',
    source,
    clauses,
  })),
  where: vi.fn((field, op, value) => ({
    __kind: 'where',
    field,
    op,
    value,
  })),
  getDocs: vi.fn(),
}));

vi.mock('../../../../src/firebase/config', () => ({
  db: { __db: 'mock-db' },
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: (...args) => firestoreMocks.collection(...args),
    query: (...args) => firestoreMocks.query(...args),
    where: (...args) => firestoreMocks.where(...args),
    getDocs: (...args) => firestoreMocks.getDocs(...args),
  };
});

vi.mock('../../../../src/components/modules/QuizEngine/QuizReviewDetail', () => ({
  default: ({ answersDetail }) => (
    <div data-testid="quiz-review-detail">Respuestas: {answersDetail?.length || 0}</div>
  ),
}));

const baseProps = {
  isOpen: true,
  onClose: vi.fn(),
  topicId: 'topic-1',
  quiz: { id: 'quiz-1', title: 'Test Algebra' },
  analytics: {
    participants: 1,
    averageScore: 85,
    students: [
      {
        userId: 'student-1',
        userName: 'Alumno Uno',
        userEmail: 'alumno1@test.com',
        hasResult: true,
        score: 90,
        rawScore: 88,
        overrideScore: null,
      },
    ],
  },
  onSaveQuizScoreOverride: vi.fn(),
};

describe('QuizClassResultsModal attempts feedback', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('shows explicit permission feedback when attempts query fails', async () => {
    const permissionError = new Error('denied');
    permissionError.code = 'permission-denied';
    firestoreMocks.getDocs.mockRejectedValue(permissionError);

    render(<QuizClassResultsModal {...baseProps} />);

    await waitFor(() => {
      expect(screen.getByText('No tienes permiso para cargar las respuestas de este alumno.')).toBeTruthy();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[QUIZ_CLASS_MODAL] Error loading attempts:',
      expect.any(Error)
    );
  });

  it('keeps empty-state feedback when attempts query succeeds without details', async () => {
    firestoreMocks.getDocs.mockResolvedValue({ docs: [] });

    render(<QuizClassResultsModal {...baseProps} />);

    await waitFor(() => {
      expect(
        screen.getByText('Este alumno aún no tiene respuestas detalladas registradas para este test.')
      ).toBeTruthy();
    });

    expect(screen.queryByText('No tienes permiso para cargar las respuestas de este alumno.')).toBeNull();
  });
});
