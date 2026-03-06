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
      inviteCode: 'FIRST111',
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
    expect(subjectAccessMocks.mockGenerateInviteCode).toHaveBeenCalledTimes(1);
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
    expect(subjectAccessMocks.mockGenerateInviteCode).toHaveBeenCalledTimes(10);
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
    expect(subjectAccessMocks.mockGenerateInviteCode).not.toHaveBeenCalled();
  });
});
