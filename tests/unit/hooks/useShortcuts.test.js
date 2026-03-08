// tests/unit/hooks/useShortcuts.test.js
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useShortcuts } from '../../../src/hooks/useShortcuts';

const firestoreMocks = vi.hoisted(() => ({
  mockCollection: vi.fn((db, name) => ({ db, name })),
  mockQuery: vi.fn((...parts) => ({ parts })),
  mockWhere: vi.fn((field, op, value) => ({ field, op, value })),
  mockDoc: vi.fn((db, name, id) => ({ db, name, id })),
  mockOnSnapshot: vi.fn(),
  mockUpdateDoc: vi.fn(),
  mockDeleteDoc: vi.fn(),
  mockGetDoc: vi.fn(),
  mockAddDoc: vi.fn(),
}));

vi.mock('../../../src/firebase/config', () => ({
  db: { __db: 'mock-db' },
}));

vi.mock('../../../src/utils/permissionUtils', () => ({
  canView: vi.fn(() => true),
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: firestoreMocks.mockCollection,
    query: firestoreMocks.mockQuery,
    where: firestoreMocks.mockWhere,
    doc: firestoreMocks.mockDoc,
    onSnapshot: firestoreMocks.mockOnSnapshot,
    updateDoc: firestoreMocks.mockUpdateDoc,
    deleteDoc: firestoreMocks.mockDeleteDoc,
    getDoc: firestoreMocks.mockGetDoc,
    addDoc: firestoreMocks.mockAddDoc,
  };
});

const createDoc = (id, data) => ({
  id,
  data: () => data,
});

describe('useShortcuts', () => {
  const user = {
    uid: 'user-1',
    email: 'user@test.com',
    role: 'teacher',
    displayName: 'User Test',
    institutionId: 'inst-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    firestoreMocks.mockAddDoc.mockResolvedValue({ id: 'shortcut-new' });
    firestoreMocks.mockGetDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
    firestoreMocks.mockOnSnapshot.mockImplementation((refOrQuery, callback) => {
      if (refOrQuery?.parts) {
        callback({ docs: [] });
      } else {
        callback({ id: refOrQuery?.id, exists: () => false, data: () => ({}) });
      }
      return vi.fn();
    });
  });

  it('moveShortcut updates only shortcut parentId', async () => {
    const { result } = renderHook(() => useShortcuts(user));

    await act(async () => {
      await result.current.moveShortcut('shortcut-1', 'folder-9');
    });

    expect(firestoreMocks.mockUpdateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'shortcuts', id: 'shortcut-1' }),
      expect.objectContaining({ parentId: 'folder-9' })
    );
  });

  it('deleteShortcut removes only the shortcut document', async () => {
    const { result } = renderHook(() => useShortcuts(user));

    await act(async () => {
      await result.current.deleteShortcut('shortcut-1');
    });

    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'shortcuts', id: 'shortcut-1' })
    );
  });

  it('deleteOrphanedShortcuts deletes only orphan shortcuts', async () => {
    const shortcuts = [
      {
        id: 'shortcut-orphan',
        ownerId: user.uid,
        targetId: 'subject-missing',
        targetType: 'subject',
        institutionId: user.institutionId,
        parentId: null,
      },
      {
        id: 'shortcut-valid',
        ownerId: user.uid,
        targetId: 'subject-ok',
        targetType: 'subject',
        institutionId: user.institutionId,
        parentId: null,
      },
    ];

    firestoreMocks.mockOnSnapshot.mockImplementation((refOrQuery, callback) => {
      if (refOrQuery?.parts) {
        callback({ docs: shortcuts.map((shortcut) => createDoc(shortcut.id, shortcut)) });
        return vi.fn();
      }

      if (refOrQuery?.id === 'subject-ok') {
        callback({
          id: 'subject-ok',
          exists: () => true,
          data: () => ({
            ownerId: 'teacher-2',
            institutionId: user.institutionId,
            name: 'Subject OK',
          }),
        });
        return vi.fn();
      }

      callback({ id: refOrQuery?.id, exists: () => false, data: () => ({}) });
      return vi.fn();
    });

    const { result } = renderHook(() => useShortcuts(user));

    await waitFor(() => {
      expect(result.current.resolvedShortcuts).toHaveLength(2);
    });

    let deletedCount = 0;
    await act(async () => {
      deletedCount = await result.current.deleteOrphanedShortcuts();
    });

    expect(deletedCount).toBe(1);
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'shortcuts', id: 'shortcut-orphan' })
    );
    expect(firestoreMocks.mockDeleteDoc).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: 'shortcuts', id: 'shortcut-valid' })
    );
  });

  it('deleteShortcut requires a shortcut id', async () => {
    const { result } = renderHook(() => useShortcuts(user));

    await expect(result.current.deleteShortcut('')).rejects.toThrow('Shortcut ID required');
  });

  it('deleteOrphanedShortcuts is idempotent when rerun', async () => {
    const orphan = {
      id: 'shortcut-orphan',
      ownerId: user.uid,
      targetId: 'subject-missing',
      targetType: 'subject',
      institutionId: user.institutionId,
      parentId: null,
    };

    firestoreMocks.mockOnSnapshot.mockImplementation((refOrQuery, callback) => {
      if (refOrQuery?.parts) {
        callback({ docs: [createDoc(orphan.id, orphan)] });
        return vi.fn();
      }

      callback({ id: refOrQuery?.id, exists: () => false, data: () => ({}) });
      return vi.fn();
    });

    const { result } = renderHook(() => useShortcuts(user));

    await waitFor(() => {
      expect(result.current.resolvedShortcuts).toHaveLength(1);
    });

    const firstRun = await result.current.deleteOrphanedShortcuts();
    expect(firstRun).toBe(1);

    await act(async () => {
      firestoreMocks.mockOnSnapshot.mock.calls[0][1]({ docs: [] });
    });

    await waitFor(() => {
      expect(result.current.resolvedShortcuts).toHaveLength(0);
    });

    const secondRun = await result.current.deleteOrphanedShortcuts();
    expect(secondRun).toBe(0);
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledTimes(1);
  });

  it('deleteShortcut surfaces firestore permission-denied errors', async () => {
    const permissionError = new Error('Missing or insufficient permissions.');
    permissionError.code = 'permission-denied';
    firestoreMocks.mockDeleteDoc.mockRejectedValueOnce(permissionError);

    const { result } = renderHook(() => useShortcuts(user));

    await expect(result.current.deleteShortcut('shortcut-foreign-owner')).rejects.toThrow(
      'Missing or insufficient permissions.'
    );
  });

  it('createShortcut deduplicates existing shortcuts and updates the primary one', async () => {
    const shortcuts = [
      {
        id: 'shortcut-1',
        ownerId: user.uid,
        targetId: 'subject-1',
        targetType: 'subject',
        institutionId: user.institutionId,
        parentId: 'folder-old',
      },
      {
        id: 'shortcut-2',
        ownerId: user.uid,
        targetId: 'subject-1',
        targetType: 'subject',
        institutionId: user.institutionId,
        parentId: 'folder-old-2',
      },
    ];

    firestoreMocks.mockOnSnapshot.mockImplementation((refOrQuery, callback) => {
      if (refOrQuery?.parts) {
        callback({ docs: shortcuts.map((shortcut) => createDoc(shortcut.id, shortcut)) });
        return vi.fn();
      }

      callback({
        id: refOrQuery?.id,
        exists: () => true,
        data: () => ({
          ownerId: 'teacher-2',
          institutionId: user.institutionId,
          name: 'Subject 1',
          course: '1A',
          tags: ['etiqueta'],
          color: 'from-blue-400 to-blue-600',
          icon: 'book',
          cardStyle: 'default',
        }),
      });
      return vi.fn();
    });

    firestoreMocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        name: 'Subject 1',
        course: '1A',
        tags: ['etiqueta'],
        color: 'from-blue-400 to-blue-600',
        icon: 'book',
        cardStyle: 'default',
      }),
    });

    const { result } = renderHook(() => useShortcuts(user));

    await waitFor(() => {
      expect(result.current.shortcuts).toHaveLength(2);
    });

    await expect(
      result.current.createShortcut('subject-1', 'subject', 'folder-new', user.institutionId)
    ).resolves.toBe('shortcut-1');

    expect(firestoreMocks.mockUpdateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'shortcuts', id: 'shortcut-1' }),
      expect.objectContaining({ parentId: 'folder-new', institutionId: user.institutionId })
    );
    expect(firestoreMocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'shortcuts', id: 'shortcut-2' })
    );
    expect(firestoreMocks.mockAddDoc).not.toHaveBeenCalled();
  });
});
