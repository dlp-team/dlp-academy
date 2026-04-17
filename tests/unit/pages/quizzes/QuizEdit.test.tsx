// tests/unit/pages/quizzes/QuizEdit.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import QuizEdit from '../../../../src/pages/Quizzes/QuizEdit';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  params: {
    subjectId: 'subject-1',
    topicId: 'topic-1',
    quizId: 'quiz-1',
  },
  doc: vi.fn((database, collectionName, id) => ({
    __kind: 'doc',
    database,
    collectionName,
    id,
  })),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'server-ts'),
  canEdit: vi.fn(() => true),
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
    getDoc: (...args) => mocks.getDoc(...args),
    updateDoc: (...args) => mocks.updateDoc(...args),
    serverTimestamp: (...args) => mocks.serverTimestamp(...args),
  };
});

vi.mock('../../../../src/utils/permissionUtils', () => ({
  canEdit: (...args) => mocks.canEdit(...args),
}));

vi.mock('../../../../src/components/modules/QuizEngine/QuizCommon', () => ({
  RenderLatex: ({ text }) => <span>{text}</span>,
}));

describe('QuizEdit', () => {
  const mockLoadedQuizWithSingleQuestion = () => {
    mocks.getDoc.mockReset();
    mocks.getDoc
      .mockResolvedValueOnce({
        exists: () => true,
        id: 'topic-1',
        data: () => ({ ownerId: 'teacher-1', institutionId: 'inst-1' }),
      })
      .mockResolvedValueOnce({
        exists: () => true,
        id: 'subject-1',
        data: () => ({ ownerId: 'teacher-1', institutionId: 'inst-1' }),
      })
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          title: 'Evaluacion corta',
          questions: [
            {
              question: 'Pregunta base',
              options: ['A', 'B'],
              correctIndex: 0,
            },
          ],
          subjectId: 'subject-1',
          topicId: 'topic-1',
          ownerId: 'teacher-1',
          institutionId: 'inst-1',
          createdBy: 'teacher-1',
        }),
      });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDoc.mockResolvedValueOnce({
      exists: () => false,
    });
    vi.stubGlobal('alert', vi.fn());
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows inline not-found feedback instead of browser alert when topic is missing', async () => {
    render(<QuizEdit user={{ uid: 'teacher-1', role: 'teacher' }} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /tema no encontrado/i })).toBeTruthy();
    });

    expect(globalThis.alert).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /volver/i }));
    expect(mocks.navigate).toHaveBeenCalledWith(-1);
  });

  it('opens in-page confirmation before deleting a question and confirms explicitly', async () => {
    mockLoadedQuizWithSingleQuestion();

    render(<QuizEdit user={{ uid: 'teacher-1', role: 'teacher' }} />);

    await waitFor(() => {
      expect(screen.getByText('Pregunta base')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /eliminar pregunta 1/i }));

    expect(screen.getByRole('heading', { name: /eliminar pregunta/i })).toBeTruthy();
    expect(globalThis.confirm).not.toHaveBeenCalled();
    expect(screen.getByText('Pregunta base')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /^eliminar pregunta$/i }));

    await waitFor(() => {
      expect(screen.queryByText('Pregunta base')).toBeNull();
    });
  });

  it('cancels question deletion without mutating questions', async () => {
    mockLoadedQuizWithSingleQuestion();

    render(<QuizEdit user={{ uid: 'teacher-1', role: 'teacher' }} />);

    await waitFor(() => {
      expect(screen.getByText('Pregunta base')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /eliminar pregunta 1/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(screen.queryByRole('heading', { name: /eliminar pregunta/i })).toBeNull();
    expect(screen.getByText('Pregunta base')).toBeTruthy();
    expect(globalThis.confirm).not.toHaveBeenCalled();
  });
});
