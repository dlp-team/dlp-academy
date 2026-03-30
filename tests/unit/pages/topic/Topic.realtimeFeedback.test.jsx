// tests/unit/pages/topic/Topic.realtimeFeedback.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Topic from '../../../../src/pages/Topic/Topic';

const firestoreMocks = vi.hoisted(() => ({
  collection: vi.fn((database, ...path) => ({
    __kind: 'collection',
    database,
    path,
    collectionName: path[0],
  })),
  query: vi.fn((ref, ...clauses) => ({
    __kind: 'query',
    ref,
    clauses,
  })),
  where: vi.fn((field, op, value) => ({
    __kind: 'where',
    field,
    op,
    value,
  })),
  onSnapshot: vi.fn(),
  doc: vi.fn((database, ...path) => ({ __kind: 'doc', database, path })),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'server-ts'),
}));

const topicLogicMock = vi.hoisted(() => ({
  loading: false,
  topicId: 'topic-1',
  subjectId: 'subject-1',
  topic: {
    id: 'topic-1',
    name: 'Tema base',
    quizzes: [],
    exams: [],
    pdfs: [],
    uploads: [],
  },
  subject: {
    id: 'subject-1',
    ownerId: 'teacher-1',
    editorUids: [],
  },
  activeTab: 'materials',
  setActiveTab: vi.fn(),
  permissions: {
    canEdit: true,
    canDelete: true,
    showEditUI: true,
    showDeleteUI: true,
    isViewer: false,
  },
  handleGenerateQuizSubmit: vi.fn(),
  handleManualUpload: vi.fn(),
  uploading: false,
  showCategorizationModal: false,
  setShowCategorizationModal: vi.fn(),
  setPendingFiles: vi.fn(),
  pendingFiles: [],
  categorizingFile: false,
}));

vi.mock('../../../../src/hooks/useDarkMode', () => ({
  useDarkMode: () => ({ isDark: false, toggleDarkMode: vi.fn() }),
}));

vi.mock('../../../../src/components/layout/Header', () => ({
  default: () => <header data-testid="topic-header-layout" />,
}));

vi.mock('../../../../src/pages/Topic/hooks/useTopicLogic', () => ({
  useTopicLogic: () => topicLogicMock,
}));

vi.mock('../../../../src/pages/Topic/hooks/useTopicFailedQuestions', () => ({
  useTopicFailedQuestions: () => ({ failedQuestions: [] }),
}));

vi.mock('../../../../src/pages/Subject/hooks/useClassMembers', () => ({
  useClassMembers: () => ({ members: [] }),
}));

vi.mock('../../../../src/pages/Topic/components/TopicHeader', () => ({
  default: () => <div data-testid="topic-header" />,
}));

vi.mock('../../../../src/pages/Topic/components/TopicTabs', () => ({
  default: () => <div data-testid="topic-tabs" />,
}));

vi.mock('../../../../src/pages/Topic/components/TopicContent', () => ({
  default: () => <div data-testid="topic-content" />,
}));

vi.mock('../../../../src/pages/Topic/components/TopicModals', () => ({
  default: () => null,
}));

vi.mock('../../../../src/pages/Topic/components/CategorizFileModal', () => ({
  default: () => null,
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
    onSnapshot: (...args) => firestoreMocks.onSnapshot(...args),
    doc: (...args) => firestoreMocks.doc(...args),
    setDoc: (...args) => firestoreMocks.setDoc(...args),
    deleteDoc: (...args) => firestoreMocks.deleteDoc(...args),
    serverTimestamp: (...args) => firestoreMocks.serverTimestamp(...args),
  };
});

const createDocsSnapshot = (rows) => ({
  docs: rows.map((row) => ({
    id: row.id,
    data: () => row,
  })),
});

describe('Topic realtime feedback', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('does not show realtime error banner when listeners succeed', async () => {
    firestoreMocks.onSnapshot.mockImplementation((source, onNext) => {
      const collectionName = source?.__kind === 'query' ? source.ref?.collectionName : source?.collectionName;

      if (collectionName === 'topicAssignments') {
        onNext(createDocsSnapshot([{ id: 'assign-1', title: 'Tarea 1', visibleToStudents: true }]));
        return vi.fn();
      }

      onNext(createDocsSnapshot([]));
      return vi.fn();
    });

    render(<Topic user={{ uid: 'teacher-1', role: 'teacher' }} />);

    await waitFor(() => {
      expect(screen.getByTestId('topic-content')).toBeTruthy();
    });

    expect(screen.queryByText('No se pudieron sincronizar las tareas del tema.')).toBeNull();
  });

  it('shows realtime error banner when topic assignments listener fails', async () => {
    firestoreMocks.onSnapshot.mockImplementation((source, onNext, onError) => {
      const collectionName = source?.__kind === 'query' ? source.ref?.collectionName : source?.collectionName;

      if (collectionName === 'topicAssignments') {
        onError(new Error('network-failure'));
        return vi.fn();
      }

      onNext(createDocsSnapshot([]));
      return vi.fn();
    });

    render(<Topic user={{ uid: 'teacher-1', role: 'teacher' }} />);

    await waitFor(() => {
      expect(screen.getByText('No se pudieron sincronizar las tareas del tema.')).toBeTruthy();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[TOPIC_ASSIGNMENTS] Firestore error:',
      expect.any(Error)
    );
  });
});
