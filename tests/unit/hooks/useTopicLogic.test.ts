// tests/unit/hooks/useTopicLogic.test.js
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTopicLogic } from '../../../src/pages/Topic/hooks/useTopicLogic';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  useParams: vi.fn(() => ({ subjectId: 'subject-1', topicId: 'topic-1' })),
  canEdit: vi.fn(() => true),
  canView: vi.fn(() => true),
  canDelete: vi.fn(() => false),
  getActiveRole: vi.fn((user) => user?.activeRole || user?.role || 'student'),
  getNormalizedRole: vi.fn((user) => {
    const role = typeof user === 'string' ? user : user?.role;
    const normalized = typeof role === 'string' ? role.trim().toLowerCase() : 'student';
    return ['student', 'teacher', 'institutionadmin', 'admin'].includes(normalized) ? normalized : 'student';
  }),
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
  getActiveRole: (...args) => mocks.getActiveRole(...args),
  getNormalizedRole: (...args) => mocks.getNormalizedRole(...args),
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
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const allowTopicDeletion = () => {
    mocks.canDelete.mockReturnValue(true);
    mocks.shouldShowDeleteUI.mockReturnValue(true);
  };

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

  it('keeps teacher edit permissions when role resolver falls back to student', async () => {
    const user = { uid: 'teacher-1', role: 'teacher' };
    mocks.getActiveRole.mockReturnValue('student');
    mocks.getNormalizedRole.mockReturnValue('teacher');
    mocks.canEdit.mockReturnValue(true);
    mocks.canView.mockReturnValue(true);
    mocks.canDelete.mockReturnValue(true);

    const { result } = renderHook(() => useTopicLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.permissions).toEqual(
      expect.objectContaining({
        canEdit: true,
        canView: true,
        canDelete: true,
        isViewer: false,
      })
    );
  });

  it('inherits subject ownership when topic owner metadata is missing', async () => {
    const user = { uid: 'teacher-1', role: 'teacher' };
    mocks.getNormalizedRole.mockReturnValue('teacher');
    mocks.getActiveRole.mockReturnValue('teacher');

    mocks.getDoc.mockResolvedValue({
      exists: () => true,
      id: 'subject-1',
      data: () => ({ id: 'subject-1', name: 'Math', ownerId: 'teacher-1', color: 'from-blue-400 to-blue-600' }),
    });

    mocks.canEdit.mockImplementation((item, userId) => item?.ownerId === userId);
    mocks.canView.mockImplementation((item, userId) => item?.ownerId === userId);
    mocks.canDelete.mockImplementation((item, userId) => item?.ownerId === userId);
    mocks.shouldShowEditUI.mockImplementation((item, userId) => item?.ownerId === userId);
    mocks.shouldShowDeleteUI.mockImplementation((item, userId) => item?.ownerId === userId);

    mocks.onSnapshot.mockImplementation((ref, callback) => {
      const isTopicDoc = ref?.__kind === 'doc' && ref?.name === 'topics';
      const isDocumentsQuery = ref?.__kind === 'query' && ref?.base?.name === 'documents';
      const isResumenQuery = ref?.__kind === 'query' && ref?.base?.name === 'resumen';
      const isQuizzesQuery = ref?.__kind === 'query' && ref?.base?.name === 'quizzes';

      if (isTopicDoc) {
        callback({
          exists: () => true,
          id: 'topic-1',
          data: () => ({ id: 'topic-1', name: 'Algebra', status: 'completed' }),
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

    const { result } = renderHook(() => useTopicLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.permissions).toEqual(
      expect.objectContaining({
        canEdit: true,
        canView: true,
        canDelete: true,
        isViewer: false,
      })
    );
    expect(mocks.canEdit).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId: 'teacher-1' }),
      'teacher-1'
    );
  });

  it('deletes topic and navigates back to subject route after in-app confirmation', async () => {
    const user = { uid: 'teacher-1', role: 'teacher' };
    allowTopicDeletion();

    const { result } = renderHook(() => useTopicLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.handleDeleteTopic();
    });

    expect(result.current.confirmDialog).toEqual(
      expect.objectContaining({
        isOpen: true,
        type: 'topic',
        itemId: 'topic-1',
      })
    );

    await act(async () => {
      await result.current.confirmDeleteAction();
    });

    expect(mocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'topics', id: 'topic-1' })
    );
    expect(mocks.navigate).toHaveBeenCalledWith('/home/subject/subject-1');
  });

  it('cascades documents, resources, quizzes, and exams before deleting topic', async () => {
    const user = { uid: 'teacher-1', role: 'teacher' };
    allowTopicDeletion();

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
      if (collectionName === 'exams') {
        return { docs: [{ id: 'exam-1', data: () => ({ title: 'Examen parcial' }) }] };
      }
      if (collectionName === 'examns') {
        return { docs: [{ id: 'examn-1', data: () => ({ title: 'Examen legacy' }) }] };
      }
      return { docs: [] };
    });

    const { result } = renderHook(() => useTopicLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.handleDeleteTopic();
    });

    expect(result.current.confirmDialog).toEqual(
      expect.objectContaining({
        isOpen: true,
        type: 'topic',
      })
    );

    await act(async () => {
      await result.current.confirmDeleteAction();
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
      expect.objectContaining({ name: 'exams', id: 'exam-1' })
    );
    expect(mocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'examns', id: 'examn-1' })
    );
    expect(mocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'topics', id: 'topic-1' })
    );
    expect(mocks.navigate).toHaveBeenCalledWith('/home/subject/subject-1');
  });

  it('still deletes topic when resource queries or item deletions fail', async () => {
    const user = { uid: 'teacher-1', role: 'teacher' };
    allowTopicDeletion();

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
      result.current.handleDeleteTopic();
    });

    expect(result.current.confirmDialog).toEqual(
      expect.objectContaining({
        isOpen: true,
        type: 'topic',
      })
    );

    await act(async () => {
      await result.current.confirmDeleteAction();
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
    allowTopicDeletion();

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
      result.current.handleDeleteTopic();
    });

    expect(result.current.confirmDialog).toEqual(
      expect.objectContaining({
        isOpen: true,
        type: 'topic',
      })
    );

    await act(async () => {
      await result.current.confirmDeleteAction();
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
    allowTopicDeletion();

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
      result.current.handleDeleteTopic();
    });

    expect(result.current.confirmDialog).toEqual(
      expect.objectContaining({
        isOpen: true,
        type: 'topic',
      })
    );

    await act(async () => {
      await result.current.confirmDeleteAction();
    });

    expect(mocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'topics', id: 'topic-1' })
    );
    expect(mocks.navigate).toHaveBeenCalledWith('/home/subject/subject-1');
  });

  it('blocks topic deletion when delete permission is denied (ghost/read-only mode)', async () => {
    const user = { uid: 'student-1', role: 'student' };
    mocks.canDelete.mockReturnValue(false);
    mocks.shouldShowDeleteUI.mockReturnValue(false);

    const { result } = renderHook(() => useTopicLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.handleDeleteTopic();
    });

    expect(result.current.confirmDialog.isOpen).toBe(false);
    expect(mocks.deleteDoc).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: 'topics', id: 'topic-1' })
    );
    expect(mocks.navigate).not.toHaveBeenCalledWith('/home/subject/subject-1');
  });

  it('opens confirmation before deleting a file and executes delete only after confirm', async () => {
    const user = { uid: 'teacher-1', role: 'teacher' };

    const { result } = renderHook(() => useTopicLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.deleteFile({ id: 'doc-1', name: 'Apuntes', _collection: 'documents' });
    });

    expect(result.current.confirmDialog).toEqual(
      expect.objectContaining({
        isOpen: true,
        type: 'file',
        itemId: 'doc-1',
        itemCollection: 'documents',
      })
    );

    expect(mocks.deleteDoc).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: 'documents', id: 'doc-1' })
    );

    await act(async () => {
      await result.current.confirmDeleteAction();
    });

    expect(mocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'documents', id: 'doc-1' })
    );
  });

  it('opens confirmation before deleting a quiz and executes delete only after confirm', async () => {
    const user = { uid: 'teacher-1', role: 'teacher' };

    const { result } = renderHook(() => useTopicLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.deleteQuiz('quiz-1');
    });

    expect(result.current.confirmDialog).toEqual(
      expect.objectContaining({
        isOpen: true,
        type: 'quiz',
        itemId: 'quiz-1',
      })
    );

    expect(mocks.deleteDoc).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: 'quizzes', id: 'quiz-1' })
    );

    await act(async () => {
      await result.current.confirmDeleteAction();
    });

    expect(mocks.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'quizzes', id: 'quiz-1' })
    );
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
    globalThis.fetch.mockResolvedValueOnce({ ok: false });

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

    expect(globalThis.fetch).toHaveBeenCalled();
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

  it('shows toast feedback when rename fails', async () => {
    const user = { uid: 'teacher-1', role: 'teacher' };
    mocks.updateDoc.mockRejectedValueOnce(new Error('rename failed'));

    const { result } = renderHook(() => useTopicLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.setTempName('Nuevo nombre');
    });

    await act(async () => {
      await result.current.saveRename({ id: 'doc-1', _collection: 'documents', name: 'Anterior' });
    });

    expect(result.current.toast).toEqual(
      expect.objectContaining({
        show: true,
        message: 'No se pudo renombrar el archivo.',
      })
    );
  });

  it('shows toast feedback when trying to view an empty file', async () => {
    const user = { uid: 'teacher-1', role: 'teacher' };

    const { result } = renderHook(() => useTopicLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.handleViewFile({ id: 'file-empty', name: 'Vacio', url: '' });
    });

    expect(result.current.toast).toEqual(
      expect.objectContaining({
        show: true,
        message: 'El archivo no tiene contenido disponible.',
      })
    );
  });

  it('shows toast feedback when file categorization fails', async () => {
    const user = { uid: 'teacher-1', role: 'teacher' };
    mocks.addDoc.mockRejectedValueOnce(new Error('categorize failed'));

    const mockReader = {
      readAsDataURL: vi.fn(function () {
        setTimeout(() => {
          if (typeof this.onload === 'function') {
            this.onload();
          }
        }, 0);
      }),
      result: 'data:application/pdf;base64,FAKE',
      onload: null,
    };
    vi.stubGlobal('FileReader', function FileReaderMock() {
      return mockReader;
    });

    const { result } = renderHook(() => useTopicLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const file = { name: 'doc.pdf', size: 1000, type: 'application/pdf' };

    await act(async () => {
      await result.current.handleManualUpload({ target: { files: [file] } });
    });

    await act(async () => {
      await result.current.handleFileCategorized('material-teorico');
    });

    expect(result.current.toast).toEqual(
      expect.objectContaining({
        show: true,
        message: 'No se pudo categorizar el archivo.',
      })
    );
  });

  it('tears down child listeners before re-subscribing on topic snapshot updates', async () => {
    const user = { uid: 'teacher-1', role: 'teacher' };
    const docsUnsubscribeFirst = vi.fn();
    const docsUnsubscribeSecond = vi.fn();
    const resumenUnsubscribeFirst = vi.fn();
    const resumenUnsubscribeSecond = vi.fn();
    const quizzesUnsubscribeFirst = vi.fn();
    const quizzesUnsubscribeSecond = vi.fn();

    const docsUnsubscribers = [docsUnsubscribeFirst, docsUnsubscribeSecond];
    const resumenUnsubscribers = [resumenUnsubscribeFirst, resumenUnsubscribeSecond];
    const quizzesUnsubscribers = [quizzesUnsubscribeFirst, quizzesUnsubscribeSecond];

    let docsSubscriptionCount = 0;
    let resumenSubscriptionCount = 0;
    let quizzesSubscriptionCount = 0;
    let topicOnNext;

    const emitTopicSnapshot = (name) => ({
      exists: () => true,
      id: 'topic-1',
      data: () => ({ id: 'topic-1', name, status: 'completed', ownerId: 'owner-1' }),
    });

    mocks.onSnapshot.mockImplementation((ref, onNext) => {
      const isTopicDoc = ref?.__kind === 'doc' && ref?.name === 'topics';
      const isDocumentsQuery = ref?.__kind === 'query' && ref?.base?.name === 'documents';
      const isResumenQuery = ref?.__kind === 'query' && ref?.base?.name === 'resumen';
      const isQuizzesQuery = ref?.__kind === 'query' && ref?.base?.name === 'quizzes';

      if (isTopicDoc) {
        topicOnNext = onNext;
        onNext(emitTopicSnapshot('Algebra inicial'));
        return vi.fn();
      }

      if (isDocumentsQuery) {
        onNext({ docs: [] });
        const unsubscribe = docsUnsubscribers[docsSubscriptionCount] ?? vi.fn();
        docsSubscriptionCount += 1;
        return unsubscribe;
      }

      if (isResumenQuery) {
        onNext({ docs: [] });
        const unsubscribe = resumenUnsubscribers[resumenSubscriptionCount] ?? vi.fn();
        resumenSubscriptionCount += 1;
        return unsubscribe;
      }

      if (isQuizzesQuery) {
        onNext({ docs: [] });
        const unsubscribe = quizzesUnsubscribers[quizzesSubscriptionCount] ?? vi.fn();
        quizzesSubscriptionCount += 1;
        return unsubscribe;
      }

      onNext({ docs: [] });
      return vi.fn();
    });

    const { result } = renderHook(() => useTopicLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof topicOnNext).toBe('function');
    expect(docsSubscriptionCount).toBe(1);
    expect(resumenSubscriptionCount).toBe(1);
    expect(quizzesSubscriptionCount).toBe(1);

    await act(async () => {
      topicOnNext(emitTopicSnapshot('Algebra actualizada'));
    });

    expect(docsUnsubscribeFirst).toHaveBeenCalledTimes(1);
    expect(resumenUnsubscribeFirst).toHaveBeenCalledTimes(1);
    expect(quizzesUnsubscribeFirst).toHaveBeenCalledTimes(1);
    expect(docsSubscriptionCount).toBe(2);
    expect(resumenSubscriptionCount).toBe(2);
    expect(quizzesSubscriptionCount).toBe(2);
  });

  it('shows toast feedback when quizzes snapshot listener fails', async () => {
    const user = { uid: 'teacher-1', role: 'teacher' };

    mocks.onSnapshot.mockImplementation((ref, onNext, onError) => {
      const isTopicDoc = ref?.__kind === 'doc' && ref?.name === 'topics';
      const isDocumentsQuery = ref?.__kind === 'query' && ref?.base?.name === 'documents';
      const isResumenQuery = ref?.__kind === 'query' && ref?.base?.name === 'resumen';
      const isQuizzesQuery = ref?.__kind === 'query' && ref?.base?.name === 'quizzes';

      if (isTopicDoc) {
        onNext({
          exists: () => true,
          id: 'topic-1',
          data: () => ({ id: 'topic-1', name: 'Algebra', status: 'completed', ownerId: 'owner-1' }),
        });
        return vi.fn();
      }

      if (isDocumentsQuery || isResumenQuery) {
        onNext({ docs: [] });
        return vi.fn();
      }

      if (isQuizzesQuery) {
        onError(new Error('network-failure'));
        return vi.fn();
      }

      onNext({ docs: [] });
      return vi.fn();
    });

    const { result } = renderHook(() => useTopicLogic(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.toast).toEqual(
      expect.objectContaining({
        show: true,
        message: 'No se pudieron sincronizar los tests del tema.',
      })
    );
  });
});
