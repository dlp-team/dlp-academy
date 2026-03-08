import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTopicLogic } from '../../../src/pages/Topic/hooks/useTopicLogic';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  useParams: vi.fn(() => ({ subjectId: 'subject-1', topicId: 'topic-1' })),
  canEdit: vi.fn(() => true),
  canView: vi.fn(() => true),
  canDelete: vi.fn(() => false),
  shouldShowEditUI: vi.fn(() => true),
  shouldShowDeleteUI: vi.fn(() => false),
  collection: vi.fn((db, name) => ({ __kind: 'collection', db, name })),
  query: vi.fn((base, ...conditions) => ({ __kind: 'query', base, conditions })),
  where: vi.fn((field, op, value) => ({ field, op, value })),
  doc: vi.fn((db, name, id) => ({ __kind: 'doc', db, name, id })),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'server-ts'),
  getDocs: vi.fn(),
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

vi.mock('../../../src/utils/permissionUtils', () => ({
  canEdit: (...args) => mocks.canEdit(...args),
  canView: (...args) => mocks.canView(...args),
  canDelete: (...args) => mocks.canDelete(...args),
  shouldShowEditUI: (...args) => mocks.shouldShowEditUI(...args),
  shouldShowDeleteUI: (...args) => mocks.shouldShowDeleteUI(...args),
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: (...args) => mocks.collection(...args),
    query: (...args) => mocks.query(...args),
    where: (...args) => mocks.where(...args),
    doc: (...args) => mocks.doc(...args),
    getDoc: (...args) => mocks.getDoc(...args),
    onSnapshot: (...args) => mocks.onSnapshot(...args),
    updateDoc: (...args) => mocks.updateDoc(...args),
    deleteDoc: (...args) => mocks.deleteDoc(...args),
    addDoc: (...args) => mocks.addDoc(...args),
    serverTimestamp: (...args) => mocks.serverTimestamp(...args),
    getDocs: (...args) => mocks.getDocs(...args),
  };
});

const setupDefaultFirestore = () => {
  mocks.getDoc.mockResolvedValue({
    exists: () => true,
    id: 'subject-1',
    data: () => ({ id: 'subject-1', name: 'Math', ownerId: 'owner-1', color: 'from-blue-400 to-blue-600' }),
  });

  mocks.getDocs.mockResolvedValue({ docs: [] });

  mocks.onSnapshot.mockImplementation((ref, callback) => {
    const isTopicDoc = ref?.__kind === 'doc' && ref?.name === 'topics';
    const isDocumentsQuery = ref?.__kind === 'query' && ref?.base?.name === 'documents';
    const isResumenQuery = ref?.__kind === 'query' && ref?.base?.name === 'resumen';
    const isQuizzesQuery = ref?.__kind === 'query' && ref?.base?.name === 'quizzes';

    if (isTopicDoc) {
      callback({
        exists: () => true,
        id: 'topic-1',
        data: () => ({ id: 'topic-1', name: 'Algebra', status: 'completed', ownerId: 'owner-1' }),
      });
      return vi.fn();
    }

    if (isDocumentsQuery || isResumenQuery || isQuizzesQuery) {
      callback({ docs: [] });
      return vi.fn();
    }

    callback({ docs: [] });
    return vi.fn();
  });
};

describe('useTopicLogic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaultFirestore();
    mocks.deleteDoc.mockResolvedValue(undefined);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    vi.stubGlobal('alert', vi.fn());
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  it('computes viewer-only permissions for student role', async () => {
    const user = { uid: 'student-1', role: 'student' };

    const { result } = renderHook(() => useTopicLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.permissions).toEqual(
      expect.objectContaining({
        canEdit: false,
        canView: true,
        canDelete: false,
        isViewer: true,
      })
    );
  });

  it('uses permission utils for teacher role and exposes edit/delete UI flags', async () => {
    const user = { uid: 'teacher-1', role: 'teacher' };
    mocks.canEdit.mockReturnValue(true);
    mocks.canView.mockReturnValue(true);
    mocks.canDelete.mockReturnValue(true);
    mocks.shouldShowEditUI.mockReturnValue(true);
    mocks.shouldShowDeleteUI.mockReturnValue(true);

    const { result } = renderHook(() => useTopicLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mocks.canEdit).toHaveBeenCalled();
    expect(mocks.canView).toHaveBeenCalled();
    expect(mocks.canDelete).toHaveBeenCalled();
    expect(result.current.permissions).toEqual(
      expect.objectContaining({
        canEdit: true,
        canView: true,
        canDelete: true,
        showEditUI: true,
        showDeleteUI: true,
      })
    );
  });

  it('deletes topic and navigates back to subject route', async () => {
    const user = { uid: 'teacher-1', role: 'teacher' };

    const { result } = renderHook(() => useTopicLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleDeleteTopic();
    });

    expect(mocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'topics', id: 'topic-1' })
    );
    expect(mocks.navigate).toHaveBeenCalledWith('/home/subject/subject-1');
  });

  it('cascades documents, resources, and quizzes before deleting topic', async () => {
    const user = { uid: 'teacher-1', role: 'teacher' };

    mocks.getDocs.mockImplementation(async (queryRef) => {
      const collectionName = queryRef?.base?.name;
      if (collectionName === 'documents') {
        return { docs: [{ id: 'doc-1' }, { id: 'doc-2' }] };
      }
      if (collectionName === 'resumen') {
        return { docs: [{ id: 'res-1' }] };
      }
      if (collectionName === 'quizzes') {
        return { docs: [{ id: 'quiz-1' }] };
      }
      return { docs: [] };
    });

    const { result } = renderHook(() => useTopicLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleDeleteTopic();
    });

    expect(mocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'documents', id: 'doc-1' })
    );
    expect(mocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'documents', id: 'doc-2' })
    );
    expect(mocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'resumen', id: 'res-1' })
    );
    expect(mocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'quizzes', id: 'quiz-1' })
    );
    expect(mocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'topics', id: 'topic-1' })
    );
    expect(mocks.navigate).toHaveBeenCalledWith('/home/subject/subject-1');
  });

  it('still deletes topic when resource queries or item deletions fail', async () => {
    const user = { uid: 'teacher-1', role: 'teacher' };

    mocks.getDocs.mockImplementation(async (queryRef) => {
      const collectionName = queryRef?.base?.name;
      if (collectionName === 'documents') {
        return { docs: [{ id: 'doc-1' }] };
      }
      if (collectionName === 'resumen') {
        throw new Error('resumen query failed');
      }
      if (collectionName === 'quizzes') {
        return { docs: [{ id: 'quiz-1' }] };
      }
      return { docs: [] };
    });

    mocks.deleteDoc.mockImplementation(async (docRef) => {
      if (docRef?.name === 'documents' && docRef?.id === 'doc-1') {
        throw new Error('document delete failed');
      }
      return undefined;
    });

    const { result } = renderHook(() => useTopicLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleDeleteTopic();
    });

    expect(mocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'documents', id: 'doc-1' })
    );
    expect(mocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'quizzes', id: 'quiz-1' })
    );
    expect(mocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'topics', id: 'topic-1' })
    );
    expect(mocks.navigate).toHaveBeenCalledWith('/home/subject/subject-1');
  });

  it('still deletes topic when child resources are orphaned (not-found deletes)', async () => {
    const user = { uid: 'teacher-1', role: 'teacher' };

    mocks.getDocs.mockImplementation(async (queryRef) => {
      const collectionName = queryRef?.base?.name;
      if (collectionName === 'documents') {
        return { docs: [{ id: 'doc-orphan' }] };
      }
      if (collectionName === 'resumen') {
        return { docs: [{ id: 'res-orphan' }] };
      }
      if (collectionName === 'quizzes') {
        return { docs: [{ id: 'quiz-orphan' }] };
      }
      return { docs: [] };
    });

    mocks.deleteDoc.mockImplementation(async (docRef) => {
      if (docRef?.name !== 'topics') {
        const err = new Error('No document to update: missing target');
        err.code = 'not-found';
        throw err;
      }
      return undefined;
    });

    const { result } = renderHook(() => useTopicLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleDeleteTopic();
    });

    expect(mocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'documents', id: 'doc-orphan' })
    );
    expect(mocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'resumen', id: 'res-orphan' })
    );
    expect(mocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'quizzes', id: 'quiz-orphan' })
    );
    expect(mocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'topics', id: 'topic-1' })
    );
    expect(mocks.navigate).toHaveBeenCalledWith('/home/subject/subject-1');
  });

  it('deletes topic when subject metadata has no institutionId', async () => {
    const user = { uid: 'teacher-1', role: 'teacher' };

    mocks.getDoc.mockResolvedValueOnce({
      exists: () => true,
      id: 'subject-1',
      data: () => ({ id: 'subject-1', name: 'Math', ownerId: 'owner-1' }),
    });

    const { result } = renderHook(() => useTopicLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleDeleteTopic();
    });

    expect(mocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'topics', id: 'topic-1' })
    );
    expect(mocks.navigate).toHaveBeenCalledWith('/home/subject/subject-1');
  });

  it('renames resumen files with both name and title fields', async () => {
    const user = { uid: 'teacher-1', role: 'teacher' };

    const { result } = renderHook(() => useTopicLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.setTempName('Nuevo resumen');
    });

    await act(async () => {
      await result.current.saveRename({ id: 'res-1', _collection: 'resumen', name: 'Old Name' });
    });

    expect(mocks.updateDoc).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ name: 'Nuevo resumen', title: 'Nuevo resumen' })
    );
  });

  it('shows error toast when AI content generation fails', async () => {
    const user = { uid: 'teacher-1', role: 'teacher' };
    global.fetch.mockResolvedValueOnce({ ok: false });

    const { result } = renderHook(() => useTopicLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.setContentFormData({
        title: 'Resumen de Algebra',
        type: 'summary',
        prompt: 'Genera resumen',
      });
    });

    await act(async () => {
      await result.current.handleGenerateContentSubmit({
        preventDefault: vi.fn(),
      });
    });

    expect(global.fetch).toHaveBeenCalled();
    expect(result.current.toast).toEqual(
      expect.objectContaining({
        show: true,
        message: '❌ Error al generar el material.',
      })
    );
  });

  it('skips manual upload when all files exceed size limit', async () => {
    const user = { uid: 'teacher-1', role: 'teacher' };

    const { result } = renderHook(() => useTopicLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const oversizedFile = {
      name: 'too-large.pdf',
      size: 1048577,
      type: 'application/pdf',
    };

    await act(async () => {
      await result.current.handleManualUpload({
        target: {
          files: [oversizedFile],
        },
      });
    });

    expect(mocks.addDoc).not.toHaveBeenCalled();
    expect(result.current.uploading).toBe(false);
  });
});
