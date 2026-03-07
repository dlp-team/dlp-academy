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
});
