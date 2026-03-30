// tests/unit/pages/subject/SubjectTestsPanel.snapshotError.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SubjectTestsPanel from '../../../../src/pages/Subject/components/SubjectTestsPanel';

const routerMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

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
  query: vi.fn((ref, ...clauses) => ({
    __kind: 'query',
    ref,
    clauses,
  })),
  onSnapshot: vi.fn(),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'server-ts'),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => routerMocks.navigate,
  };
});

vi.mock('../../../../src/firebase/config', () => ({
  db: { __db: 'mock-db' },
}));

vi.mock('../../../../src/pages/Subject/modals/SubjectTestModal', () => ({
  default: () => null,
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: (...args) => firestoreMocks.collection(...args),
    where: (...args) => firestoreMocks.where(...args),
    query: (...args) => firestoreMocks.query(...args),
    onSnapshot: (...args) => firestoreMocks.onSnapshot(...args),
    addDoc: (...args) => firestoreMocks.addDoc(...args),
    serverTimestamp: (...args) => firestoreMocks.serverTimestamp(...args),
  };
});

describe('SubjectTestsPanel snapshot reliability', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const renderPanel = () => {
    render(
      <SubjectTestsPanel
        user={{ uid: 'teacher-1', role: 'teacher', institutionId: 'institution-1' }}
        subject={{ id: 'subject-1', institutionId: 'institution-1', ownerId: 'teacher-1' }}
        topics={[{ id: 'topic-1', name: 'Tema A' }, { id: 'topic-2', name: 'Tema B' }]}
      />
    );
  };

  it('renders quizzes from snapshot data and clears loading state', async () => {
    firestoreMocks.onSnapshot.mockImplementation((_source, onNext) => {
      onNext({
        docs: [
          {
            id: 'quiz-1',
            data: () => ({
              title: 'Quiz Inicial',
              level: 'Principiante',
              topicId: 'topic-1',
              questions: [{}, {}],
            }),
          },
          {
            id: 'quiz-2',
            data: () => ({
              title: 'Quiz Intermedio',
              level: 'Intermedio',
              topicId: 'topic-2',
              questions: [{}],
            }),
          },
        ],
      });

      return vi.fn();
    });

    renderPanel();

    await waitFor(() => {
      expect(screen.getByText('Quiz Inicial')).toBeTruthy();
      expect(screen.getByText('Quiz Intermedio')).toBeTruthy();
    });

    expect(screen.getByText('Gestor de tests por seccion')).toBeTruthy();
  });

  it('shows inline error and exits loading state when snapshot listener fails', async () => {
    firestoreMocks.onSnapshot.mockImplementation((_source, _onNext, onError) => {
      onError(new Error('permission-denied'));
      return vi.fn();
    });

    renderPanel();

    await waitFor(() => {
      expect(screen.getByText('No se pudieron cargar los tests. Intentalo de nuevo.')).toBeTruthy();
    });

    expect(screen.getByText('Gestor de tests por seccion')).toBeTruthy();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
