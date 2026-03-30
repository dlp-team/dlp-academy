// tests/unit/hooks/useSubjects.test.js
// tests/unit/hooks/useSubjects.test.js
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSubjects } from '../../../src/hooks/useSubjects';

const firestoreMocks = vi.hoisted(() => {
  let autoId = 1;

  const state = {
    resetAutoId: () => {
      autoId = 1;
    },
    nextAutoId: () => {
      const id = `subject-auto-${autoId}`;
      autoId += 1;
      return id;
    },
  };

  return {
    state,
    mockCollection: vi.fn((db, name) => ({ db, name, __type: 'collection-ref' })),
    mockDoc: vi.fn((...args) => {
      if (args.length === 1 && args[0]?.__type === 'collection-ref') {
        return { id: state.nextAutoId(), collectionName: args[0].name, __type: 'doc-ref' };
      }

      return { db: args[0], name: args[1], id: args[2], __type: 'doc-ref' };
    }),
    mockRunTransaction: vi.fn(),
    mockOnSnapshot: vi.fn(() => vi.fn()),
    mockQuery: vi.fn((...parts) => ({ parts })),
    mockWhere: vi.fn((field, op, value) => ({ field, op, value })),
    mockOrderBy: vi.fn((field, direction) => ({ field, direction })),
    mockGetDocs: vi.fn(async () => ({ docs: [] })),
    mockGetDoc: vi.fn(),
    mockSetDoc: vi.fn(),
    mockAddDoc: vi.fn(),
    mockUpdateDoc: vi.fn(),
    mockDeleteDoc: vi.fn(),
    mockArrayUnion: vi.fn((...items) => items),
    mockArrayRemove: vi.fn((...items) => items),
    mockServerTimestamp: vi.fn(() => 'server-ts'),
  };
});

const subjectAccessMocks = vi.hoisted(() => ({
  mockNormalizePayload: vi.fn(),
  mockGenerateInviteCode: vi.fn(),
}));

vi.mock('../../../src/firebase/config', () => ({
  db: { __db: 'mock-db' },
}));

vi.mock('../../../src/utils/subjectAccessUtils', () => ({
  normalizeSubjectAccessPayload: subjectAccessMocks.mockNormalizePayload,
  generateSubjectInviteCode: subjectAccessMocks.mockGenerateInviteCode,
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: firestoreMocks.mockCollection,
    doc: firestoreMocks.mockDoc,
    runTransaction: firestoreMocks.mockRunTransaction,
    onSnapshot: firestoreMocks.mockOnSnapshot,
    query: firestoreMocks.mockQuery,
    where: firestoreMocks.mockWhere,
    orderBy: firestoreMocks.mockOrderBy,
    getDocs: firestoreMocks.mockGetDocs,
    getDoc: firestoreMocks.mockGetDoc,
    setDoc: firestoreMocks.mockSetDoc,
    addDoc: firestoreMocks.mockAddDoc,
    updateDoc: firestoreMocks.mockUpdateDoc,
    deleteDoc: firestoreMocks.mockDeleteDoc,
    arrayUnion: firestoreMocks.mockArrayUnion,
    arrayRemove: firestoreMocks.mockArrayRemove,
    serverTimestamp: firestoreMocks.mockServerTimestamp,
  };
});

describe('useSubjects addSubject transaction hardening', () => {
  const baseUser = {
    uid: 'owner-1',
    institutionId: 'inst-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    firestoreMocks.state.resetAutoId();

    subjectAccessMocks.mockNormalizePayload.mockReturnValue({
      name: 'Matematica',
      course: '1A',
      institutionId: 'inst-1',
      ownerId: 'owner-1',
      enrolledStudentUids: ['student-1'],
    });

    subjectAccessMocks.mockGenerateInviteCode.mockReturnValue('NEXT2222');

    firestoreMocks.mockRunTransaction.mockImplementation(async (_db, updater) => {
      const transaction = {
        get: vi.fn(async () => ({ exists: () => false })),
        set: vi.fn(),
      };

      await updater(transaction);
    });
  });

  it('retries invite code reservation after collision and succeeds', async () => {
    const transactionGet = vi
      .fn()
      .mockResolvedValueOnce({ exists: () => true })
      .mockResolvedValueOnce({ exists: () => false });
    const transactionSet = vi.fn();

    firestoreMocks.mockRunTransaction.mockImplementation(async (_db, updater) => {
      await updater({
        get: transactionGet,
        set: transactionSet,
      });
    });

    const { result } = renderHook(() => useSubjects(baseUser));

    let createdSubjectId = null;
    await act(async () => {
      createdSubjectId = await result.current.addSubject({
        name: 'Matematica',
        course: '1A',
      });
    });

    expect(firestoreMocks.mockRunTransaction).toHaveBeenCalledTimes(2);
    expect(subjectAccessMocks.mockGenerateInviteCode).toHaveBeenCalledTimes(2);
    expect(createdSubjectId).toBe('subject-auto-2');

    const inviteWrite = transactionSet.mock.calls.find(([, payload]) => payload?.subjectId);
    const subjectWrite = transactionSet.mock.calls.find(([, payload]) => payload?.ownerId === 'owner-1');

    expect(inviteWrite[1].inviteCode).toBe('NEXT2222');
    expect(inviteWrite[1].institutionId).toBe('inst-1');
    expect(subjectWrite[1].inviteCode).toBe('NEXT2222');
    expect(subjectWrite[1].enrolledStudentUids).toEqual(['student-1']);
  });

  it('fails after 10 collisions with a deterministic error', async () => {
    firestoreMocks.mockRunTransaction.mockRejectedValue({
      code: 'invite-code-collision',
      message: 'INVITE_CODE_COLLISION',
    });

    const { result } = renderHook(() => useSubjects(baseUser));

    await expect(
      result.current.addSubject({
        name: 'Historia',
        course: '2B',
      })
    ).rejects.toThrow('No se pudo generar un codigo de invitacion unico. Intentalo de nuevo.');

    expect(firestoreMocks.mockRunTransaction).toHaveBeenCalledTimes(10);
    expect(subjectAccessMocks.mockGenerateInviteCode).toHaveBeenCalledTimes(11);
  });

  it('does not retry on non-collision transaction failures', async () => {
    const permissionError = new Error('Missing or insufficient permissions.');
    permissionError.code = 'permission-denied';

    firestoreMocks.mockRunTransaction.mockRejectedValue(permissionError);

    const { result } = renderHook(() => useSubjects(baseUser));

    await expect(
      act(async () => {
        await result.current.addSubject({
          name: 'Quimica',
          course: '3C',
        });
      })
    ).rejects.toThrow('Missing or insufficient permissions.');

    expect(firestoreMocks.mockRunTransaction).toHaveBeenCalledTimes(1);
    expect(subjectAccessMocks.mockGenerateInviteCode).toHaveBeenCalledTimes(1);
  });
});

describe('useSubjects joinSubjectByInviteCode', () => {
  const baseUser = {
    uid: 'student-1',
    email: 'student1@test.com',
    role: 'student',
    institutionId: 'inst-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    firestoreMocks.state.resetAutoId();
    firestoreMocks.mockOnSnapshot.mockReturnValue(vi.fn());
  });

  it('joins a subject from invite code and creates shortcut', async () => {
    firestoreMocks.mockGetDoc.mockImplementation(async (ref) => {
      if (ref?.name === 'subjectInviteCodes') {
        return {
          exists: () => true,
          data: () => ({
            inviteCode: 'JOIN1234',
            subjectId: 'subject-join-1',
            institutionId: 'inst-1',
          }),
        };
      }

      if (ref?.name === 'subjects') {
        return {
          exists: () => true,
          data: () => ({
            name: 'Historia',
            course: '5A',
            institutionId: 'inst-1',
            ownerId: 'teacher-1',
            sharedWithUids: [],
            sharedWith: [],
            enrolledStudentUids: [],
          }),
        };
      }

      return { exists: () => false, data: () => ({}) };
    });

    const { result } = renderHook(() => useSubjects(baseUser));

    let joinResult = null;
    await act(async () => {
      joinResult = await result.current.joinSubjectByInviteCode('join1234');
    });

    expect(joinResult).toEqual({ subjectId: 'subject-join-1', alreadyJoined: false });
    expect(firestoreMocks.mockUpdateDoc).toHaveBeenCalledTimes(1);
    expect(firestoreMocks.mockSetDoc).toHaveBeenCalledTimes(1);
  });

  it('fails when invite code is missing or invalid', async () => {
    firestoreMocks.mockGetDoc.mockResolvedValue({
      exists: () => false,
      data: () => ({}),
    });

    const { result } = renderHook(() => useSubjects(baseUser));

    await expect(result.current.joinSubjectByInviteCode('')).rejects.toThrow(
      'Debes ingresar un codigo de invitacion valido.'
    );

    await expect(result.current.joinSubjectByInviteCode('BADCODE')).rejects.toThrow(
      'El codigo de invitacion no existe o no esta disponible.'
    );
  });

  it('returns alreadyJoined when user already has access', async () => {
    firestoreMocks.mockGetDoc.mockImplementation(async (ref) => {
      if (ref?.name === 'subjectInviteCodes') {
        return {
          exists: () => true,
          data: () => ({
            inviteCode: 'JOIN1234',
            subjectId: 'subject-join-2',
            institutionId: 'inst-1',
          }),
        };
      }

      if (ref?.name === 'subjects') {
        return {
          exists: () => true,
          data: () => ({
            name: 'Biologia',
            institutionId: 'inst-1',
            ownerId: 'teacher-1',
            sharedWithUids: ['student-1'],
            sharedWith: [],
            enrolledStudentUids: [],
          }),
        };
      }

      return { exists: () => false, data: () => ({}) };
    });

    const { result } = renderHook(() => useSubjects(baseUser));

    await expect(result.current.joinSubjectByInviteCode('JOIN1234')).resolves.toEqual({
      subjectId: 'subject-join-2',
      alreadyJoined: true,
    });

    expect(firestoreMocks.mockUpdateDoc).not.toHaveBeenCalled();
    expect(firestoreMocks.mockSetDoc).not.toHaveBeenCalled();
  });
});

describe('useSubjects transferSubjectOwnership', () => {
  const ownerUser = {
    uid: 'owner-1',
    email: 'owner@test.com',
    role: 'teacher',
    displayName: 'Owner User',
    institutionId: 'inst-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    firestoreMocks.state.resetAutoId();
    firestoreMocks.mockOnSnapshot.mockReturnValue(vi.fn());
    firestoreMocks.mockDeleteDoc.mockResolvedValue(undefined);
  });

  it('transfers ownership to a shared user and creates shortcut for previous owner', async () => {
    firestoreMocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        ownerId: 'owner-1',
        ownerEmail: 'owner@test.com',
        ownerName: 'Owner User',
        folderId: 'folder-1',
        institutionId: 'inst-1',
        name: 'Historia',
        course: '2A',
        tags: ['humanidades'],
        color: 'from-sky-400 to-sky-600',
        icon: 'book-open',
        cardStyle: 'modern',
        modernFillColor: '#ABCDEF',
        sharedWithUids: ['owner-1', 'user-2'],
        sharedWith: [
          { uid: 'owner-1', email: 'owner@test.com' },
          { uid: 'user-2', email: 'newowner@test.com', displayName: 'New Owner' },
        ],
      }),
    });

    const { result } = renderHook(() => useSubjects(ownerUser));

    await expect(
      result.current.transferSubjectOwnership('subject-1', 'newowner@test.com')
    ).resolves.toEqual({
      success: true,
      previousOwnerUid: 'owner-1',
      newOwnerUid: 'user-2',
      newOwnerEmail: 'newowner@test.com',
    });

    expect(firestoreMocks.mockUpdateDoc).toHaveBeenCalledTimes(1);
    const [subjectRef, subjectPayload] = firestoreMocks.mockUpdateDoc.mock.calls[0];
    expect(subjectRef).toMatchObject({ name: 'subjects', id: 'subject-1' });
    expect(subjectPayload.ownerId).toBe('user-2');
    expect(subjectPayload.ownerEmail).toBe('newowner@test.com');
    expect(subjectPayload.ownerName).toBe('New Owner');
    expect(subjectPayload.sharedWithUids).toContain('owner-1');
    expect(subjectPayload.sharedWithUids).not.toContain('user-2');
    expect(subjectPayload.isShared).toBe(true);

    expect(firestoreMocks.mockSetDoc).toHaveBeenCalledTimes(1);
    const [shortcutRef, shortcutPayload, shortcutOptions] = firestoreMocks.mockSetDoc.mock.calls[0];
    expect(shortcutRef).toMatchObject({ name: 'shortcuts', id: 'owner-1_subject-1_subject' });
    expect(shortcutPayload).toMatchObject({
      ownerId: 'owner-1',
      targetId: 'subject-1',
      targetType: 'subject',
      parentId: 'folder-1',
      institutionId: 'inst-1',
      shortcutName: 'Historia',
      shortcutCourse: '2A',
    });
    expect(shortcutOptions).toEqual({ merge: true });
  });

  it('throws when recipient is not an already shared user', async () => {
    firestoreMocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        ownerId: 'owner-1',
        sharedWithUids: ['owner-1'],
        sharedWith: [{ uid: 'owner-1', email: 'owner@test.com' }],
      }),
    });

    const { result } = renderHook(() => useSubjects(ownerUser));

    await expect(
      result.current.transferSubjectOwnership('subject-1', 'outsider@test.com')
    ).rejects.toThrow('Solo puedes transferir la propiedad a un usuario que ya tenga acceso compartido.');

    expect(firestoreMocks.mockUpdateDoc).not.toHaveBeenCalled();
    expect(firestoreMocks.mockSetDoc).not.toHaveBeenCalled();
  });

  it('throws when transferring to the same user email', async () => {
    const { result } = renderHook(() => useSubjects(ownerUser));

    await expect(
      result.current.transferSubjectOwnership('subject-1', ownerUser.email)
    ).rejects.toThrow('No puedes transferir la propiedad a tu propio usuario.');

    expect(firestoreMocks.mockGetDoc).not.toHaveBeenCalled();
  });

  it('throws when subject does not exist', async () => {
    firestoreMocks.mockGetDoc.mockResolvedValue({
      exists: () => false,
      data: () => ({}),
    });

    const { result } = renderHook(() => useSubjects(ownerUser));

    await expect(
      result.current.transferSubjectOwnership('subject-missing', 'newowner@test.com')
    ).rejects.toThrow('No se encontró la asignatura.');

    expect(firestoreMocks.mockUpdateDoc).not.toHaveBeenCalled();
    expect(firestoreMocks.mockSetDoc).not.toHaveBeenCalled();
  });

  it('throws when current user is not the owner', async () => {
    firestoreMocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        ownerId: 'another-owner',
        sharedWithUids: ['owner-1', 'user-2'],
        sharedWith: [
          { uid: 'owner-1', email: 'owner@test.com' },
          { uid: 'user-2', email: 'newowner@test.com' },
        ],
      }),
    });

    const { result } = renderHook(() => useSubjects(ownerUser));

    await expect(
      result.current.transferSubjectOwnership('subject-1', 'newowner@test.com')
    ).rejects.toThrow('Solo el propietario actual puede transferir la propiedad.');

    expect(firestoreMocks.mockUpdateDoc).not.toHaveBeenCalled();
    expect(firestoreMocks.mockSetDoc).not.toHaveBeenCalled();
  });
});

describe('useSubjects permanentlyDeleteSubject', () => {
  const ownerUser = {
    uid: 'owner-1',
    email: 'owner@test.com',
    role: 'teacher',
    displayName: 'Owner User',
    institutionId: 'inst-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    firestoreMocks.state.resetAutoId();
    firestoreMocks.mockOnSnapshot.mockReturnValue(vi.fn());
  });

  it('cascades topic, document, resource, quiz, exam, shortcut, and subject deletions for owner', async () => {
    firestoreMocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ ownerId: ownerUser.uid }),
    });

    firestoreMocks.mockGetDocs.mockImplementation(async (queryObj) => {
      const filters = queryObj.parts.filter((part) => part?.field);
      const fieldMap = new Map(filters.map((f) => [f.field, f.value]));

      if (fieldMap.get('subjectId') === 'subject-1') {
        return {
          docs: [
            { id: 'topic-1', data: () => ({}) },
            { id: 'topic-2', data: () => ({}) },
          ],
        };
      }

      if (fieldMap.get('topicId') === 'topic-1') {
        if (queryObj.parts[0]?.name === 'documents') {
          return { docs: [{ id: 'doc-1', data: () => ({}) }] };
        }
        if (queryObj.parts[0]?.name === 'resumen') {
          return { docs: [{ id: 'res-1', data: () => ({}) }] };
        }
        if (queryObj.parts[0]?.name === 'quizzes') {
          return { docs: [{ id: 'quiz-1', data: () => ({}) }] };
        }
        if (queryObj.parts[0]?.name === 'exams') {
          return { docs: [{ id: 'exam-1', data: () => ({}) }] };
        }
        if (queryObj.parts[0]?.name === 'examns') {
          return { docs: [{ id: 'examn-1', data: () => ({}) }] };
        }
      }

      if (fieldMap.get('topicId') === 'topic-2') {
        if (queryObj.parts[0]?.name === 'documents') {
          return { docs: [{ id: 'doc-2', data: () => ({}) }] };
        }
        if (queryObj.parts[0]?.name === 'resumen') {
          return { docs: [{ id: 'res-2', data: () => ({}) }] };
        }
        if (queryObj.parts[0]?.name === 'quizzes') {
          return { docs: [{ id: 'quiz-2', data: () => ({}) }] };
        }
        if (queryObj.parts[0]?.name === 'exams') {
          return { docs: [{ id: 'exam-2', data: () => ({}) }] };
        }
        if (queryObj.parts[0]?.name === 'examns') {
          return { docs: [{ id: 'examn-2', data: () => ({}) }] };
        }
      }

      if (
        fieldMap.get('targetId') === 'subject-1' &&
        fieldMap.get('targetType') === 'subject' &&
        fieldMap.get('ownerId') === ownerUser.uid
      ) {
        return {
          docs: [{ id: 'shortcut-1', data: () => ({}) }],
        };
      }

      return { docs: [] };
    });

    const { result } = renderHook(() => useSubjects(ownerUser));

    await expect(result.current.permanentlyDeleteSubject('subject-1')).resolves.toBeUndefined();

    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'documents', id: 'doc-1' })
    );
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'documents', id: 'doc-2' })
    );
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'resumen', id: 'res-1' })
    );
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'resumen', id: 'res-2' })
    );
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'quizzes', id: 'quiz-1' })
    );
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'quizzes', id: 'quiz-2' })
    );
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'exams', id: 'exam-1' })
    );
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'exams', id: 'exam-2' })
    );
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'examns', id: 'examn-1' })
    );
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'examns', id: 'examn-2' })
    );
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'topics', id: 'topic-1' })
    );
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'topics', id: 'topic-2' })
    );
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'shortcuts', id: 'shortcut-1' })
    );
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'subjects', id: 'subject-1' })
    );
  });

  it('rejects permanent deletion when current user is not owner', async () => {
    firestoreMocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ ownerId: 'another-owner' }),
    });

    const { result } = renderHook(() => useSubjects(ownerUser));

    await expect(result.current.permanentlyDeleteSubject('subject-1')).rejects.toThrow(
      'Only the owner can permanently delete this subject'
    );

    expect(firestoreMocks.mockDeleteDoc).not.toHaveBeenCalled();
  });

  it('rejects subject deletion in shared-folder context when user is shared collaborator but not owner', async () => {
    firestoreMocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        ownerId: 'owner-2',
        folderId: 'shared-folder-1',
        sharedWithUids: [ownerUser.uid, 'owner-2'],
        sharedWith: [
          { uid: ownerUser.uid, email: ownerUser.email, role: 'editor' },
          { uid: 'owner-2', email: 'owner2@test.com', role: 'owner' },
        ],
      }),
    });

    const { result } = renderHook(() => useSubjects(ownerUser));

    await expect(result.current.permanentlyDeleteSubject('subject-shared-collab')).rejects.toThrow(
      'Only the owner can permanently delete this subject'
    );

    expect(firestoreMocks.mockDeleteDoc).not.toHaveBeenCalled();
  });

  it('allows owner deletion for subject shared with multiple editors/viewers', async () => {
    firestoreMocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        ownerId: ownerUser.uid,
        sharedWithUids: ['editor-1', 'viewer-1'],
        sharedWith: [
          { uid: 'editor-1', email: 'editor1@test.com', role: 'editor' },
          { uid: 'viewer-1', email: 'viewer1@test.com', role: 'viewer' },
        ],
      }),
    });

    firestoreMocks.mockGetDocs.mockResolvedValue({ docs: [] });

    const { result } = renderHook(() => useSubjects(ownerUser));

    await expect(result.current.permanentlyDeleteSubject('subject-shared-multi')).resolves.toBeUndefined();

    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'subjects', id: 'subject-shared-multi' })
    );
  });

  it('continues permanent deletion when topic/document/resource/quiz/shortcut cleanup partially fails', async () => {
    firestoreMocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ ownerId: ownerUser.uid }),
    });

    firestoreMocks.mockGetDocs.mockImplementation(async (queryObj) => {
      const filters = queryObj.parts.filter((part) => part?.field);
      const fieldMap = new Map(filters.map((f) => [f.field, f.value]));

      if (fieldMap.get('subjectId') === 'subject-2') {
        return {
          docs: [
            { id: 'topic-a', data: () => ({}) },
            { id: 'topic-b', data: () => ({}) },
          ],
        };
      }

      if (fieldMap.get('topicId') === 'topic-a') {
        return {
          docs:
            queryObj.parts[0]?.name === 'documents'
              ? [{ id: 'doc-a', data: () => ({}) }]
              : queryObj.parts[0]?.name === 'resumen'
                ? [{ id: 'res-a', data: () => ({}) }]
                : [{ id: 'quiz-a', data: () => ({}) }],
        };
      }

      if (fieldMap.get('topicId') === 'topic-b') {
        if (queryObj.parts[0]?.name === 'documents') {
          throw new Error('topic documents query failed');
        }
        if (queryObj.parts[0]?.name === 'resumen') {
          throw new Error('topic resources query failed');
        }
        if (queryObj.parts[0]?.name === 'quizzes') {
          throw new Error('topic quizzes query failed');
        }
      }

      if (
        fieldMap.get('targetId') === 'subject-2' &&
        fieldMap.get('targetType') === 'subject' &&
        fieldMap.get('ownerId') === ownerUser.uid
      ) {
        return {
          docs: [{ id: 'shortcut-a', data: () => ({}) }],
        };
      }

      return { docs: [] };
    });

    firestoreMocks.mockDeleteDoc.mockImplementation(async (ref) => {
      if (ref?.name === 'documents' && ref?.id === 'doc-a') {
        throw new Error('document delete failed');
      }
      if (ref?.name === 'resumen' && ref?.id === 'res-a') {
        throw new Error('resource delete failed');
      }
      if (ref?.name === 'quizzes' && ref?.id === 'quiz-a') {
        throw new Error('quiz delete failed');
      }
      if (ref?.name === 'shortcuts' && ref?.id === 'shortcut-a') {
        throw new Error('shortcut delete failed');
      }
      return undefined;
    });

    const { result } = renderHook(() => useSubjects(ownerUser));

    await expect(result.current.permanentlyDeleteSubject('subject-2')).resolves.toBeUndefined();

    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'resumen', id: 'res-a' })
    );
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'quizzes', id: 'quiz-a' })
    );

    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'topics', id: 'topic-a' })
    );
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'topics', id: 'topic-b' })
    );
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'subjects', id: 'subject-2' })
    );
  });

  it('permanently deletes subject even when institutionId metadata is missing', async () => {
    firestoreMocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ ownerId: ownerUser.uid }),
    });

    firestoreMocks.mockGetDocs.mockResolvedValue({ docs: [] });

    const { result } = renderHook(() => useSubjects(ownerUser));

    await expect(result.current.permanentlyDeleteSubject('subject-no-inst')).resolves.toBeUndefined();

    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'subjects', id: 'subject-no-inst' })
    );
  });

  it('permanent deletion only targets owner shortcuts, preserving other-user ghost shortcuts', async () => {
    firestoreMocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ ownerId: ownerUser.uid }),
    });

    firestoreMocks.mockGetDocs.mockImplementation(async (queryObj) => {
      const filters = queryObj.parts.filter((part) => part?.field);
      const fieldMap = new Map(filters.map((f) => [f.field, f.value]));

      if (fieldMap.get('subjectId') === 'subject-shared-1') {
        return { docs: [] };
      }

      if (
        fieldMap.get('targetId') === 'subject-shared-1' &&
        fieldMap.get('targetType') === 'subject' &&
        fieldMap.get('ownerId') === ownerUser.uid
      ) {
        return {
          docs: [{ id: 'shortcut-owner-1', data: () => ({ ownerId: ownerUser.uid }) }],
        };
      }

      return { docs: [] };
    });

    const { result } = renderHook(() => useSubjects(ownerUser));

    await expect(result.current.permanentlyDeleteSubject('subject-shared-1')).resolves.toBeUndefined();

    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'shortcuts', id: 'shortcut-owner-1' })
    );
    expect(firestoreMocks.mockDeleteDoc).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: 'shortcuts', id: 'shortcut-recipient-1' })
    );

    const shortcutQueryCall = firestoreMocks.mockQuery.mock.calls.find((call) => {
      const clauses = call.filter((entry) => entry?.field);
      const clauseMap = new Map(clauses.map((c) => [c.field, c.value]));
      return clauseMap.get('targetId') === 'subject-shared-1' && clauseMap.get('targetType') === 'subject';
    });

    expect(shortcutQueryCall).toBeTruthy();
    const ownerFilter = shortcutQueryCall.find((entry) => entry?.field === 'ownerId');
    expect(ownerFilter?.value).toBe(ownerUser.uid);

    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'subjects', id: 'subject-shared-1' })
    );
  });

  it('deletes subject with no child topics/resources/quizzes (no-children edge case)', async () => {
    firestoreMocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ ownerId: ownerUser.uid }),
    });

    firestoreMocks.mockGetDocs.mockResolvedValue({ docs: [] });

    const { result } = renderHook(() => useSubjects(ownerUser));

    await expect(result.current.permanentlyDeleteSubject('subject-no-children')).resolves.toBeUndefined();

    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'subjects', id: 'subject-no-children' })
    );
  });

  it('handles maximum child deletion fan-out for nested shared topics/resources/quizzes', async () => {
    const topicIds = Array.from({ length: 20 }, (_, idx) => `topic-max-${idx + 1}`);

    firestoreMocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        ownerId: ownerUser.uid,
        isShared: true,
        sharedWithUids: ['editor-1', 'viewer-1'],
      }),
    });

    firestoreMocks.mockGetDocs.mockImplementation(async (queryObj) => {
      const filters = queryObj.parts.filter((part) => part?.field);
      const fieldMap = new Map(filters.map((f) => [f.field, f.value]));

      if (fieldMap.get('subjectId') === 'subject-max-children') {
        return {
          docs: topicIds.map((id) => ({ id, data: () => ({}) })),
        };
      }

      if (fieldMap.get('topicId')?.startsWith('topic-max-')) {
        if (queryObj.parts[0]?.name === 'documents') {
          return { docs: [{ id: `doc-${fieldMap.get('topicId')}`, data: () => ({}) }] };
        }
        if (queryObj.parts[0]?.name === 'resumen') {
          return { docs: [{ id: `res-${fieldMap.get('topicId')}`, data: () => ({}) }] };
        }
        if (queryObj.parts[0]?.name === 'quizzes') {
          return { docs: [{ id: `quiz-${fieldMap.get('topicId')}`, data: () => ({}) }] };
        }
      }

      if (
        fieldMap.get('targetId') === 'subject-max-children' &&
        fieldMap.get('targetType') === 'subject' &&
        fieldMap.get('ownerId') === ownerUser.uid
      ) {
        return { docs: [{ id: 'shortcut-max-children', data: () => ({}) }] };
      }

      return { docs: [] };
    });

    const { result } = renderHook(() => useSubjects(ownerUser));

    await expect(result.current.permanentlyDeleteSubject('subject-max-children')).resolves.toBeUndefined();

    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'shortcuts', id: 'shortcut-max-children' })
    );
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'subjects', id: 'subject-max-children' })
    );
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'topics', id: 'topic-max-1' })
    );
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'topics', id: 'topic-max-20' })
    );
  });
});

describe('useSubjects teacher deletion policy', () => {
  const teacherUser = {
    uid: 'teacher-1',
    email: 'teacher@example.com',
    displayName: 'Teacher',
    institutionId: 'inst-1',
    role: 'teacher',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    firestoreMocks.state.resetAutoId();
    firestoreMocks.mockOnSnapshot.mockImplementation(() => vi.fn());
    firestoreMocks.mockGetDocs.mockResolvedValue({ docs: [] });
  });

  it('blocks soft delete when the teacher policy forbids deleting assigned subjects', async () => {
    firestoreMocks.mockGetDoc
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          ownerId: 'teacher-1',
          institutionId: 'inst-1',
          classIds: ['class-1'],
          enrolledStudentUids: [],
          sharedWithUids: []
        })
      })
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          accessPolicies: {
            teachers: {
              canDeleteSubjectsWithStudents: false
            }
          }
        })
      });

    const { result } = renderHook(() => useSubjects(teacherUser));

    await expect(result.current.deleteSubject('subject-locked')).rejects.toThrow(
      'No puedes eliminar una asignatura con estudiantes asociados sin autorización del administrador de la institución.'
    );

    expect(firestoreMocks.mockUpdateDoc).not.toHaveBeenCalled();
  });

  it('allows soft delete when the teacher policy explicitly permits it', async () => {
    firestoreMocks.mockGetDoc
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          ownerId: 'teacher-1',
          institutionId: 'inst-1',
          classIds: ['class-1'],
          enrolledStudentUids: [],
          sharedWithUids: []
        })
      })
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          accessPolicies: {
            teachers: {
              canDeleteSubjectsWithStudents: true
            }
          }
        })
      });

    const { result } = renderHook(() => useSubjects(teacherUser));

    await act(async () => {
      await expect(result.current.deleteSubject('subject-open')).resolves.toBeUndefined();
    });
    expect(firestoreMocks.mockUpdateDoc).toHaveBeenCalled();
  });
});
