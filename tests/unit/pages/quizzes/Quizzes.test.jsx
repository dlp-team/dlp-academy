// tests/unit/pages/quizzes/Quizzes.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Quizzes from '../../../../src/pages/Quizzes/Quizzes';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  params: {
    subjectId: 'subject-1',
    topicId: 'topic-1',
    quizId: 'quiz-1',
  },
  doc: vi.fn((_db, collectionName, id) => ({ collectionName, id })),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  collection: vi.fn((_db, collectionName) => ({ collectionName })),
  serverTimestamp: vi.fn(() => 'server-ts'),
  canUserAccessSubject: vi.fn(async () => true),
  extractColorFromGradient: vi.fn(() => '#4f46e5'),
  useConfetti: vi.fn(() => ({
    confettiTrigger: 0,
    triggerConfetti: vi.fn(),
  })),
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
    setDoc: (...args) => mocks.setDoc(...args),
    addDoc: (...args) => mocks.addDoc(...args),
    collection: (...args) => mocks.collection(...args),
    serverTimestamp: (...args) => mocks.serverTimestamp(...args),
  };
});

vi.mock('../../../../src/utils/subjectAccessUtils', () => ({
  canUserAccessSubject: (...args) => mocks.canUserAccessSubject(...args),
}));

vi.mock('../../../../src/components/modules/QuizEngine/QuizFeedback', () => ({
  default: () => null,
  useConfetti: () => mocks.useConfetti(),
}));

vi.mock('../../../../src/components/modules/QuizEngine/QuizHeader', () => ({
  default: () => <div>Quiz Header</div>,
}));

vi.mock('../../../../src/components/modules/QuizEngine/QuizQuestion', () => ({
  default: () => <div>Quiz Question</div>,
}));

vi.mock('../../../../src/components/modules/QuizEngine/QuizOptions', () => ({
  default: ({ onSelect }) => (
    <button onClick={() => onSelect?.(1)}>Seleccionar opcion correcta</button>
  ),
}));

vi.mock('../../../../src/components/modules/QuizEngine/QuizResults', () => ({
  default: () => <div>Quiz Results</div>,
}));

vi.mock('../../../../src/components/modules/QuizEngine/QuizCommon', () => ({
  ANSWER_STATUS: {
    IDLE: 'idle',
    CORRECT: 'correct',
    INCORRECT: 'incorrect',
  },
  VIEW_STATES: {
    REVIEW: 'review',
    QUIZ: 'quiz',
    RESULTS: 'results',
  },
  DEFAULT_QUIZ: {
    title: 'Fallback Quiz',
    subtitle: 'Fallback',
    formulas: [],
    questions: [],
  },
  VIBRATION_DURATION: 200,
  MAX_OPTION_LENGTH_FOR_GRID: 24,
  extractColorFromGradient: (...args) => mocks.extractColorFromGradient(...args),
  calculateScore: (correct, total) => (total ? Math.round((correct / total) * 100) : 0),
  isPassed: (score) => score >= 60,
  LoadingSpinner: () => <div>Cargando...</div>,
  SubjectIcon: () => <div>Icono</div>,
  FormulaDisplay: ({ formula }) => <div>{formula}</div>,
  ProgressBar: () => <div>Barra progreso</div>,
  QuizFooter: ({ onCheck, onNext }) => (
    <div>
      <button onClick={() => onCheck?.()}>Comprobar</button>
      <button onClick={() => onNext?.()}>Siguiente</button>
    </div>
  ),
  RenderLatex: ({ text }) => <>{text}</>,
}));

describe('Quizzes load fallback behavior', () => {
  const user = { uid: 'student-1', role: 'student', email: 'student@test.dev' };

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mocks.canUserAccessSubject.mockResolvedValue(true);
    mocks.extractColorFromGradient.mockReturnValue('#4f46e5');
  });

  it('shows explicit fallback when quiz document is missing', async () => {
    mocks.getDoc
      .mockResolvedValueOnce({
        id: 'subject-1',
        exists: () => true,
        data: () => ({ name: 'Matematicas', icon: 'book' }),
      })
      .mockResolvedValueOnce({
        id: 'topic-1',
        exists: () => true,
        data: () => ({ color: 'from-indigo-500 to-purple-600' }),
      })
      .mockResolvedValueOnce({
        id: 'quiz-1',
        exists: () => false,
        data: () => ({}),
      });

    render(<Quizzes user={user} />);

    await waitFor(() => {
      expect(screen.getByText('No se pudo abrir el test')).toBeTruthy();
      expect(screen.getByText('El test solicitado ya no esta disponible.')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Volver al tema' }));
    expect(mocks.navigate).toHaveBeenCalledWith('/home/subject/subject-1/topic/topic-1');
  });

  it('shows explicit permission fallback when quiz read is denied', async () => {
    const deniedError = new Error('denied');
    deniedError.code = 'permission-denied';

    mocks.getDoc
      .mockResolvedValueOnce({
        id: 'subject-1',
        exists: () => true,
        data: () => ({ name: 'Matematicas', icon: 'book' }),
      })
      .mockResolvedValueOnce({
        id: 'topic-1',
        exists: () => true,
        data: () => ({ color: 'from-indigo-500 to-purple-600' }),
      })
      .mockRejectedValueOnce(deniedError);

    render(<Quizzes user={user} />);

    await waitFor(() => {
      expect(screen.getByText('No se pudo abrir el test')).toBeTruthy();
      expect(screen.getByText('No tienes permiso para abrir este test.')).toBeTruthy();
    });
  });

  it('keeps review flow available when quiz loads successfully', async () => {
    mocks.getDoc
      .mockResolvedValueOnce({
        id: 'subject-1',
        exists: () => true,
        data: () => ({ name: 'Matematicas', icon: 'book' }),
      })
      .mockResolvedValueOnce({
        id: 'topic-1',
        exists: () => true,
        data: () => ({ color: 'from-indigo-500 to-purple-600' }),
      })
      .mockResolvedValueOnce({
        id: 'quiz-1',
        exists: () => true,
        data: () => ({
          name: 'Quiz Algebra',
          level: 'Repaso',
          questions: [
            { question: '2 + 2', options: ['3', '4'], correctIndex: 1 },
          ],
        }),
      });

    render(<Quizzes user={user} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Comenzar Test/i })).toBeTruthy();
    });

    expect(screen.queryByText('No se pudo abrir el test')).toBeNull();
  });

  it('shows explicit save feedback when quiz result persistence is denied', async () => {
    const deniedError = new Error('denied');
    deniedError.code = 'permission-denied';
    mocks.setDoc.mockRejectedValueOnce(deniedError);

    mocks.getDoc
      .mockResolvedValueOnce({
        id: 'subject-1',
        exists: () => true,
        data: () => ({ name: 'Matematicas', icon: 'book' }),
      })
      .mockResolvedValueOnce({
        id: 'topic-1',
        exists: () => true,
        data: () => ({ color: 'from-indigo-500 to-purple-600' }),
      })
      .mockResolvedValueOnce({
        id: 'quiz-1',
        exists: () => true,
        data: () => ({
          name: 'Quiz Algebra',
          level: 'Repaso',
          questions: [
            { question: '2 + 2', options: ['3', '4'], correctIndex: 1 },
          ],
        }),
      });

    render(<Quizzes user={user} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Comenzar Test/i })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /Comenzar Test/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Seleccionar opcion correcta' }));
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));

    await waitFor(() => {
      expect(screen.getByText('No tienes permiso para guardar tu resultado del test.')).toBeTruthy();
    });

    expect(screen.getByText('Quiz Results')).toBeTruthy();
    expect(mocks.setDoc).toHaveBeenCalled();
  });
});
