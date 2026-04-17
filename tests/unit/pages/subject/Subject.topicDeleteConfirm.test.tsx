// tests/unit/pages/subject/Subject.topicDeleteConfirm.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Subject from '../../../../src/pages/Subject/Subject';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  locationSearch: '',
  deleteTopic: vi.fn(async () => {}),
  updateSubject: vi.fn(),
  deleteSubject: vi.fn(async () => {}),
  createTopic: vi.fn(async () => {}),
  handleReorderTopics: vi.fn(async () => {}),
  updateTopic: vi.fn(async () => {}),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ subjectId: 'subject-1' }),
    useNavigate: () => mocks.navigate,
    useLocation: () => ({ search: mocks.locationSearch }),
  };
});

vi.mock('../../../../src/pages/Subject/hooks/useSubjectManager', () => ({
  useSubjectManager: () => ({
    subject: {
      id: 'subject-1',
      name: 'Matematicas',
      color: 'from-indigo-500 to-purple-600',
    },
    topics: [
      { id: 'topic-1', name: 'Algebra', number: '01', status: 'completed', isVisible: true },
    ],
    loading: false,
    updateSubject: (...args) => mocks.updateSubject(...args),
    deleteSubject: (...args) => mocks.deleteSubject(...args),
    createTopic: (...args) => mocks.createTopic(...args),
    deleteTopic: (...args) => mocks.deleteTopic(...args),
    handleReorderTopics: (...args) => mocks.handleReorderTopics(...args),
    updateTopic: (...args) => mocks.updateTopic(...args),
  }),
}));

vi.mock('../../../../src/pages/Subject/hooks/useSubjectPageState', () => ({
  default: () => ({
    showEditModal: false,
    setShowEditModal: vi.fn(),
    showDeleteModal: false,
    setShowDeleteModal: vi.fn(),
    showTopicModal: false,
    setShowTopicModal: vi.fn(),
    showEditTopicModal: false,
    setShowEditTopicModal: vi.fn(),
    editingTopic: null,
    setEditingTopic: vi.fn(),
    retryTopicData: null,
    setRetryTopicData: vi.fn(),
    isDeleting: false,
    setIsDeleting: vi.fn(),
    isReordering: false,
    setIsReordering: vi.fn(),
    searchTerm: '',
    setSearchTerm: vi.fn(),
    filteredTopics: [
      { id: 'topic-1', name: 'Algebra', number: '01', status: 'completed', isVisible: true },
    ],
  }),
}));

vi.mock('../../../../src/pages/Subject/hooks/useClassMembers', () => ({
  useClassMembers: () => ({ members: [], loading: false }),
}));

vi.mock('../../../../src/components/layout/Header', () => ({
  default: () => <div data-testid="header-mock" />,
}));

vi.mock('../../../../src/pages/Subject/components/SubjectHeader', () => ({
  default: () => <div data-testid="subject-header-mock" />,
}));

vi.mock('../../../../src/pages/Subject/components/TopicGrid', () => ({
  default: ({ onDeleteTopic, onSelectTopic, topics = [] }) => (
    <div>
      {onDeleteTopic && (
        <button type="button" onClick={() => onDeleteTopic('topic-1')}>
          trigger-topic-delete
        </button>
      )}
      <button type="button" onClick={() => onSelectTopic?.(topics[0] || { id: 'topic-1' })}>
        open-topic
      </button>
    </div>
  ),
}));

vi.mock('../../../../src/pages/Subject/components/SubjectGradesPanel', () => ({
  default: () => <div data-testid="subject-grades-panel-mock" />,
}));

vi.mock('../../../../src/pages/Home/modals/EditSubjectModal', () => ({
  default: () => null,
}));

vi.mock('../../../../src/pages/Subject/modals/TopicFormModal', () => ({
  default: () => null,
}));

vi.mock('../../../../src/pages/Subject/modals/EditTopicModal', () => ({
  default: () => null,
}));

describe('Subject topic deletion confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.locationSearch = '';
  });

  it('opens in-page confirmation and deletes topic only after explicit confirm', async () => {
    render(<Subject user={{ uid: 'teacher-1', role: 'teacher' }} />);

    fireEvent.click(screen.getByRole('button', { name: /trigger-topic-delete/i }));

    expect(screen.getByRole('heading', { name: /eliminar tema/i })).toBeTruthy();
    expect(mocks.deleteTopic).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /eliminar tema/i }));

    await waitFor(() => {
      expect(mocks.deleteTopic).toHaveBeenCalledWith('topic-1');
    });
  });

  it('cancels topic deletion without calling deleteTopic', () => {
    render(<Subject user={{ uid: 'teacher-1', role: 'teacher' }} />);

    fireEvent.click(screen.getByRole('button', { name: /trigger-topic-delete/i }));

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(mocks.deleteTopic).not.toHaveBeenCalled();
    expect(screen.queryByRole('heading', { name: /eliminar tema/i })).toBeNull();
  });

  it('disables mutating actions and preserves read-only topic navigation from bin mode', () => {
    mocks.locationSearch = '?mode=readonly&source=bin';

    render(<Subject user={{ uid: 'teacher-1', role: 'teacher' }} />);

    expect(screen.getByText(/modo solo lectura/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /trigger-topic-delete/i })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /open-topic/i }));

    expect(mocks.navigate).toHaveBeenCalledWith('/home/subject/subject-1/topic/topic-1?mode=readonly&source=bin');
  });
});
