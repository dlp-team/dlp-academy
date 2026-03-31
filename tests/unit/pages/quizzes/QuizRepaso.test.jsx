// tests/unit/pages/quizzes/QuizRepaso.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuizRepaso from '../../../../src/pages/Quizzes/QuizRepaso';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  params: {
    subjectId: 'subject-1',
    topicId: 'topic-1',
  },
  doc: vi.fn((_db, collectionName, id) => ({ collectionName, id })),
  setDoc: vi.fn(),
  arrayUnion: vi.fn((...items) => items),
  serverTimestamp: vi.fn(() => 'server-ts'),
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
    setDoc: (...args) => mocks.setDoc(...args),
    arrayUnion: (...args) => mocks.arrayUnion(...args),
    serverTimestamp: (...args) => mocks.serverTimestamp(...args),
  };
});

vi.mock('../../../../src/components/modules/QuizEngine/QuizFeedback', () => ({
  default: () => null,
  useConfetti: () => mocks.useConfetti(),
}));

vi.mock('../../../../src/components/modules/QuizEngine/QuizHeader', () => ({
  default: () => <div>Quiz Header</div>,
}));

vi.mock('../../../../src/components/modules/QuizEngine/QuizOptions', () => ({
  default: () => <div>Quiz Options</div>,
}));

vi.mock('../../../../src/components/modules/QuizEngine/QuizQuestion', () => ({
  default: () => <div>Quiz Question</div>,
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
  MAX_OPTION_LENGTH_FOR_GRID: 24,
  VIEW_STATES: {
    REVIEW: 'review',
    QUIZ: 'quiz',
    RESULTS: 'results',
  },
  VIBRATION_DURATION: 200,
  calculateScore: (correct, total) => (total ? Math.round((correct / total) * 100) : 0),
  isPassed: (score) => score >= 60,
  ProgressBar: () => <div>Barra progreso</div>,
  QuizFooter: () => <div>Pie quiz</div>,
  RenderLatex: ({ text }) => <>{text}</>,
  SubjectIcon: () => <div>Icono</div>,
}));

describe('QuizRepaso session fallback behavior', () => {
  const user = { uid: 'student-1', role: 'student' };

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mocks.params = {
      subjectId: 'subject-1',
      topicId: 'topic-1',
    };
  });

  it('shows explicit feedback when repaso session data is corrupted', () => {
    sessionStorage.setItem('repasoQuestions', '{invalid-json');

    render(<QuizRepaso user={user} />);

    expect(screen.getByText('No hay preguntas para repasar')).toBeTruthy();
    expect(screen.getByText('No se pudieron leer las preguntas guardadas de repaso.')).toBeTruthy();
  });

  it('keeps no-questions state without storage warning when session data is empty', () => {
    render(<QuizRepaso user={user} />);

    expect(screen.getByText('No hay preguntas para repasar')).toBeTruthy();
    expect(screen.queryByText('No se pudieron leer las preguntas guardadas de repaso.')).toBeNull();
  });

  it('uses home fallback route when topic params are missing', () => {
    mocks.params = {};

    render(<QuizRepaso user={user} />);

    fireEvent.click(screen.getByRole('button', { name: 'Volver al tema' }));
    expect(mocks.navigate).toHaveBeenCalledWith('/home');
  });
});
