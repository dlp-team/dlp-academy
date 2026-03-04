import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useQuizzesLogic } from '../../../src/pages/Quizzes/hooks/useQuizzesLogic';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  useParams: vi.fn(() => ({ subjectId: 'subject-1', topicId: 'topic-1', quizId: 'quiz-1' })),
  doc: vi.fn((...parts) => ({ parts })),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'server-ts'),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
    useParams: () => mocks.useParams(),
  };
});

vi.mock('../../../src/firebase/config', () => ({
  db: { __db: 'mock-db' },
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    doc: (...args) => mocks.doc(...args),
    getDoc: (...args) => mocks.getDoc(...args),
    setDoc: (...args) => mocks.setDoc(...args),
    serverTimestamp: (...args) => mocks.serverTimestamp(...args),
  };
});

const subjectSnap = {
  exists: () => true,
  data: () => ({ name: 'Math' }),
};

const topicSnap = {
  exists: () => true,
  data: () => ({ name: 'Algebra', color: 'from-blue-400 to-blue-600' }),
};

const quizSnap = {
  exists: () => true,
  data: () => ({
    name: 'Quiz Algebra',
    questions: [
      { question: '2 + 2', options: ['3', '4'], correctAnswer: 1 },
      { question: '10 - 7', options: ['2', '3'], correctAnswer: 1 },
    ],
  }),
};

describe('useQuizzesLogic', () => {
  const user = { uid: 'user-1', email: 'user@test.dev' };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDoc
      .mockResolvedValueOnce(subjectSnap)
      .mockResolvedValueOnce(topicSnap)
      .mockResolvedValueOnce(quizSnap);
  });

  it('loads subject, topic and quiz data', async () => {
    const { result } = renderHook(() => useQuizzesLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.quizData?.name).toBe('Quiz Algebra');
      expect(result.current.subject?.name).toBe('Math');
      expect(result.current.topic?.name).toBe('Algebra');
    });
  });

  it('applies correct answer flow and accumulates score/streak', async () => {
    const { result } = renderHook(() => useQuizzesLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.handleOptionSelect(1);
    });

    await act(async () => {
      result.current.handleCheckAnswer();
    });

    expect(result.current.showResult).toBe(true);
    expect(result.current.showExplanation).toBe(true);
    expect(result.current.correctCount).toBe(1);
    expect(result.current.score).toBe(10);
    expect(result.current.streak).toBe(1);
  });

  it('finishes quiz and saves result document', async () => {
    const { result } = renderHook(() => useQuizzesLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.handleOptionSelect(1);
      result.current.handleCheckAnswer();
      await result.current.handleNextQuestion();
    });

    await act(async () => {
      result.current.handleOptionSelect(1);
      result.current.handleCheckAnswer();
      await result.current.handleNextQuestion();
    });

    expect(result.current.quizFinished).toBe(true);
    expect(mocks.setDoc).toHaveBeenCalled();
    expect(mocks.setDoc).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        quizId: 'quiz-1',
        userId: 'user-1',
        totalQuestions: 2,
      }),
      { merge: true }
    );
  });

  it('navigates back to topic route', async () => {
    const { result } = renderHook(() => useQuizzesLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.handleGoBack();
    });

    expect(mocks.navigate).toHaveBeenCalledWith('/home/subject/subject-1/topic/topic-1');
  });

  it('applies incorrect answer flow and resets streak', async () => {
    const { result } = renderHook(() => useQuizzesLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.handleOptionSelect(0);
    });
    await act(async () => {
      result.current.handleCheckAnswer();
    });

    await waitFor(() => {
      expect(result.current.showResult).toBe(true);
    });
    expect(result.current.showResult).toBe(true);
    expect(result.current.showExplanation).toBe(true);
    expect(result.current.wrongCount).toBe(1);
    expect(result.current.streak).toBe(0);
    expect(result.current.score).toBe(0);
  });

  it('resets quiz state on retry', async () => {
    const { result } = renderHook(() => useQuizzesLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.handleOptionSelect(1);
    });
    await act(async () => {
      result.current.handleCheckAnswer();
    });
    await act(async () => {
      await result.current.handleNextQuestion();
    });
    await act(async () => {
      result.current.handleOptionSelect(0);
    });
    await act(async () => {
      result.current.handleCheckAnswer();
    });
    await act(async () => {
      await result.current.handleNextQuestion();
    });

    await waitFor(() => {
      expect(result.current.quizFinished).toBe(true);
    });

    await act(async () => {
      result.current.handleRetry();
    });

    expect(result.current.quizFinished).toBe(false);
    expect(result.current.currentQuestionIndex).toBe(0);
    expect(result.current.selectedOption).toBe(null);
    expect(result.current.showResult).toBe(false);
    expect(result.current.showExplanation).toBe(false);
    expect(result.current.score).toBe(0);
    expect(result.current.streak).toBe(0);
    expect(result.current.correctCount).toBe(0);
    expect(result.current.wrongCount).toBe(0);
  });

  it('computes progress and streak helper colors across branches', async () => {
    const { result } = renderHook(() => useQuizzesLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.getProgressColor()).toBe('bg-purple-500');
    expect(result.current.getStreakColor()).toBe('text-slate-300');

    await act(async () => {
      result.current.handleOptionSelect(1);
    });
    await act(async () => {
      result.current.handleCheckAnswer();
    });
    await waitFor(() => {
      expect(result.current.getStreakColor()).toBe('text-emerald-500');
    });

    await act(async () => {
      await result.current.handleNextQuestion();
    });
    expect(result.current.getProgressColor()).toBe('bg-emerald-500');

    await act(async () => {
      result.current.handleOptionSelect(1);
    });
    await act(async () => {
      result.current.handleCheckAnswer();
    });
    await act(async () => {
      result.current.handleCheckAnswer();
      result.current.handleCheckAnswer();
    });
    expect(result.current.getStreakColor()).toBe('text-orange-500');
  });
});
