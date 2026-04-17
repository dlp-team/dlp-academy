// tests/unit/pages/content/Exam.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Exam from '../../../../src/pages/Content/Exam';

const routeMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  params: { subjectId: 'subject-1', topicId: 'topic-1', examId: 'exam-1' },
}));

const firestoreMocks = vi.hoisted(() => ({
  getDoc: vi.fn(),
  doc: vi.fn((_db, collectionName, id) => ({ collectionName, id })),
}));

const subjectAccessMocks = vi.hoisted(() => ({
  canUserAccessSubject: vi.fn(async () => true),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => routeMocks.navigate,
    useParams: () => routeMocks.params,
  };
});

vi.mock('../../../../src/firebase/config', () => ({
  db: { __db: true },
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    doc: (...args) => firestoreMocks.doc(...args),
    getDoc: (...args) => firestoreMocks.getDoc(...args),
  };
});

vi.mock('../../../../src/utils/subjectAccessUtils', () => ({
  canUserAccessSubject: (...args) => subjectAccessMocks.canUserAccessSubject(...args),
}));

describe('Exam load fallback behavior', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    subjectAccessMocks.canUserAccessSubject.mockResolvedValue(true);
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('shows explicit not-found state when the exam document does not exist', async () => {
    firestoreMocks.getDoc.mockImplementation(async (ref) => {
      if (ref.collectionName === 'subjects') {
        return {
          exists: () => true,
          data: () => ({ color: 'from-blue-500 to-cyan-600' }),
        };
      }

      if (ref.collectionName === 'exams') {
        return {
          exists: () => false,
          data: () => ({}),
        };
      }

      return { exists: () => false, data: () => ({}) };
    });

    render(
      <MemoryRouter>
        <Exam />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/examen no encontrado/i)).toBeTruthy();
      expect(screen.getByRole('button', { name: /volver/i })).toBeTruthy();
    });
  });

  it('shows explicit permission feedback when exam read is denied', async () => {
    firestoreMocks.getDoc.mockImplementation(async (ref) => {
      if (ref.collectionName === 'subjects') {
        return {
          exists: () => true,
          data: () => ({ color: 'from-blue-500 to-cyan-600' }),
        };
      }

      if (ref.collectionName === 'exams') {
        const error = new Error('denied');
        error.code = 'permission-denied';
        throw error;
      }

      return { exists: () => false, data: () => ({}) };
    });

    render(
      <MemoryRouter>
        <Exam />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no se pudo abrir el examen/i)).toBeTruthy();
      expect(screen.getByText(/no tienes permiso para ver este examen/i)).toBeTruthy();
    });
  });

  it('shows non-blocking warning when subject context fails but exam can still load', async () => {
    firestoreMocks.getDoc.mockImplementation(async (ref) => {
      if (ref.collectionName === 'subjects') {
        throw new Error('subject fetch failed');
      }

      if (ref.collectionName === 'exams') {
        return {
          exists: () => true,
          data: () => ({
            title: 'Examen Algebra',
            questions: [
              {
                question: '2 + 2 = ?',
                answer: '4',
              },
            ],
          }),
        };
      }

      return { exists: () => false, data: () => ({}) };
    });

    render(
      <MemoryRouter>
        <Exam />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/examen algebra/i)).toBeTruthy();
      expect(
        screen.getByText(/no se pudo cargar el contexto de la asignatura\. el examen se mostrara con el tema por defecto\./i)
      ).toBeTruthy();
    });
  });

  it('redirects to home when subject lifecycle access is denied for the user', async () => {
    subjectAccessMocks.canUserAccessSubject.mockResolvedValue(false);

    firestoreMocks.getDoc.mockImplementation(async (ref) => {
      if (ref.collectionName === 'subjects') {
        return {
          id: 'subject-1',
          exists: () => true,
          data: () => ({ color: 'from-blue-500 to-cyan-600' }),
        };
      }

      if (ref.collectionName === 'exams') {
        return {
          exists: () => true,
          data: () => ({
            title: 'Examen no visible',
            questions: [{ question: 'Q', answer: 'A' }],
          }),
        };
      }

      return { exists: () => false, data: () => ({}) };
    });

    render(
      <MemoryRouter>
        <Exam user={{ uid: 'student-1', role: 'student' }} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(routeMocks.navigate).toHaveBeenCalledWith('/home');
    });

    expect(firestoreMocks.getDoc).toHaveBeenCalledTimes(1);
  });
});
