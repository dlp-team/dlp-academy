// tests/unit/pages/quizzes/QuizReviewPage.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import QuizReviewPage from '../../../../src/pages/Quizzes/QuizReviewPage';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  params: {
    subjectId: 'subject-1',
    topicId: 'topic-1',
    quizId: 'quiz-1',
  },
  doc: vi.fn((_db, collectionName, id) => ({ collectionName, id })),
  collection: vi.fn((_db, collectionName) => ({ collectionName })),
  query: vi.fn((source, ...clauses) => ({ source, clauses })),
  where: vi.fn((field, op, value) => ({ field, op, value })),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  canUserAccessSubject: vi.fn(async () => true),
  extractColorFromGradient: vi.fn(() => '#4f46e5'),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
    useParams: () => mocks.params,
  };
});

vi.mock('../../../../src/firebase/config', () => ({
  db: { __db: 'mock-db' },
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    doc: (...args) => mocks.doc(...args),
    collection: (...args) => mocks.collection(...args),
    query: (...args) => mocks.query(...args),
    where: (...args) => mocks.where(...args),
    getDoc: (...args) => mocks.getDoc(...args),
    getDocs: (...args) => mocks.getDocs(...args),
  };
});

vi.mock('../../../../src/utils/subjectAccessUtils', () => ({
  canUserAccessSubject: (...args) => mocks.canUserAccessSubject(...args),
}));

vi.mock('../../../../src/components/modules/QuizEngine/QuizCommon', () => ({
  extractColorFromGradient: (...args) => mocks.extractColorFromGradient(...args),
}));

vi.mock('../../../../src/components/modules/QuizEngine/QuizReviewDetail', () => ({
  default: () => <div>Detalle del intento</div>,
}));

describe('QuizReviewPage load fallback behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.canUserAccessSubject.mockResolvedValue(true);
    mocks.extractColorFromGradient.mockReturnValue('#4f46e5');
  });

  it('shows explicit fallback when quiz document is missing', async () => {
    mocks.getDoc
      .mockResolvedValueOnce({
        exists: () => true,
        id: 'subject-1',
        data: () => ({ ownerId: 'teacher-1' }),
      })
      .mockResolvedValueOnce({
        exists: () => true,
        id: 'topic-1',
        data: () => ({ color: 'from-indigo-500 to-purple-600' }),
      })
      .mockResolvedValueOnce({
        exists: () => false,
        data: () => ({}),
      });

    render(<QuizReviewPage user={{ uid: 'student-1', role: 'student' }} />);

    await waitFor(() => {
      expect(screen.getByText('No se pudo abrir la revision')).toBeTruthy();
      expect(screen.getByText('El test solicitado ya no esta disponible.')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Volver al tema' })).toBeTruthy();
    });
  });

  it('shows explicit permission fallback when attempts query is denied', async () => {
    const deniedError = new Error('denied');
    deniedError.code = 'permission-denied';

    mocks.getDoc
      .mockResolvedValueOnce({
        exists: () => true,
        id: 'subject-1',
        data: () => ({ ownerId: 'teacher-1' }),
      })
      .mockResolvedValueOnce({
        exists: () => true,
        id: 'topic-1',
        data: () => ({ color: 'from-indigo-500 to-purple-600' }),
      })
      .mockResolvedValueOnce({
        exists: () => true,
        id: 'quiz-1',
        data: () => ({ title: 'Quiz 1' }),
      });

    mocks.getDocs.mockRejectedValueOnce(deniedError);

    render(<QuizReviewPage user={{ uid: 'student-1', role: 'student' }} />);

    await waitFor(() => {
      expect(screen.getByText('No se pudo abrir la revision')).toBeTruthy();
      expect(screen.getByText('No tienes permiso para revisar este test.')).toBeTruthy();
    });
  });

  it('keeps no-attempt state when attempts query succeeds with empty results', async () => {
    mocks.getDoc
      .mockResolvedValueOnce({
        exists: () => true,
        id: 'subject-1',
        data: () => ({ ownerId: 'teacher-1' }),
      })
      .mockResolvedValueOnce({
        exists: () => true,
        id: 'topic-1',
        data: () => ({ color: 'from-indigo-500 to-purple-600' }),
      })
      .mockResolvedValueOnce({
        exists: () => true,
        id: 'quiz-1',
        data: () => ({ title: 'Quiz 1' }),
      });

    mocks.getDocs.mockResolvedValueOnce({ docs: [] });

    render(<QuizReviewPage user={{ uid: 'student-1', role: 'student' }} />);

    await waitFor(() => {
      expect(screen.getByText('Aun no has completado este test. Hazlo una vez para ver la revision detallada.')).toBeTruthy();
    });

    expect(screen.queryByText('No se pudo abrir la revision')).toBeNull();
  });
});
