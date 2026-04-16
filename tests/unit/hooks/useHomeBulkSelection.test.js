// tests/unit/hooks/useHomeBulkSelection.test.js
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useHomeBulkSelection } from '../../../src/pages/Home/hooks/useHomeBulkSelection';

const createLogic = (overrides = {}) => ({
  viewMode: 'grid',
  moveShortcut: vi.fn(async () => {}),
  updateSubject: vi.fn(async () => {}),
  updateFolder: vi.fn(async () => {}),
  deleteShortcut: vi.fn(async () => {}),
  deleteSubject: vi.fn(async () => {}),
  deleteFolder: vi.fn(async () => {}),
  addFolder: vi.fn(async () => ({ id: 'folder-created' })),
  currentFolder: null,
  ...overrides,
});

describe('useHomeBulkSelection', () => {
  it('tracks selection and clears it when role/view no longer supports select mode', () => {
    const onHomeFeedback = vi.fn();
    const logic = createLogic({ viewMode: 'grid' });

    const { result, rerender } = renderHook(
      ({ isStudentRole, viewMode }) =>
        useHomeBulkSelection({
          logic: { ...logic, viewMode },
          isStudentRole,
          onHomeFeedback,
        }),
      {
        initialProps: {
          isStudentRole: false,
          viewMode: 'grid',
        },
      }
    );

    act(() => {
      result.current.setSelectMode(true);
      result.current.toggleSelectItem({ id: 'subject-1' }, 'subject');
    });

    expect(result.current.selectMode).toBe(true);
    expect(result.current.selectedItems).toHaveLength(1);

    rerender({ isStudentRole: true, viewMode: 'grid' });

    expect(result.current.selectMode).toBe(false);
    expect(result.current.selectedItems).toHaveLength(0);
    expect(result.current.selectedItemKeys.size).toBe(0);
  });

  it('drops selected ancestor folder when selecting a child subject', () => {
    const onHomeFeedback = vi.fn();
    const logic = createLogic({
      folders: [
        { id: 'folder-parent', parentId: null },
        { id: 'folder-child', parentId: 'folder-parent' },
      ],
    });

    const { result } = renderHook(() =>
      useHomeBulkSelection({
        logic,
        isStudentRole: false,
        onHomeFeedback,
      })
    );

    act(() => {
      result.current.toggleSelectItem({ id: 'folder-parent' }, 'folder');
      result.current.toggleSelectItem({ id: 'subject-1', folderId: 'folder-child' }, 'subject');
    });

    expect(result.current.selectedItems).toHaveLength(1);
    expect(result.current.selectedItems[0]).toEqual(
      expect.objectContaining({
        type: 'subject',
      })
    );
  });

  it('drops selected descendant entries when selecting a parent folder', () => {
    const onHomeFeedback = vi.fn();
    const logic = createLogic({
      folders: [
        { id: 'folder-parent', parentId: null },
        { id: 'folder-child', parentId: 'folder-parent' },
      ],
    });

    const { result } = renderHook(() =>
      useHomeBulkSelection({
        logic,
        isStudentRole: false,
        onHomeFeedback,
      })
    );

    act(() => {
      result.current.toggleSelectItem({ id: 'subject-1', folderId: 'folder-child' }, 'subject');
      result.current.toggleSelectItem({ id: 'folder-parent' }, 'folder');
    });

    expect(result.current.selectedItems).toHaveLength(1);
    expect(result.current.selectedItems[0]).toEqual(
      expect.objectContaining({
        type: 'folder',
        item: expect.objectContaining({ id: 'folder-parent' }),
      })
    );
  });

  it('starts selection and selects range from the anchor item', () => {
    const onHomeFeedback = vi.fn();
    const logic = createLogic();

    const { result } = renderHook(() =>
      useHomeBulkSelection({
        logic,
        isStudentRole: false,
        onHomeFeedback,
      })
    );

    const orderedEntries = [
      { key: 'subject:subject-1', type: 'subject', item: { id: 'subject-1' } },
      { key: 'subject:subject-2', type: 'subject', item: { id: 'subject-2' } },
      { key: 'subject:subject-3', type: 'subject', item: { id: 'subject-3' } },
      { key: 'subject:subject-4', type: 'subject', item: { id: 'subject-4' } },
    ];

    act(() => {
      result.current.startSelectionWithItem({ id: 'subject-2' }, 'subject');
    });

    expect(result.current.selectMode).toBe(true);
    expect(result.current.selectedItemKeys.has('subject:subject-2')).toBe(true);

    act(() => {
      result.current.selectRangeToItem({ id: 'subject-4' }, 'subject', orderedEntries);
    });

    expect(result.current.selectedItemKeys.has('subject:subject-2')).toBe(true);
    expect(result.current.selectedItemKeys.has('subject:subject-3')).toBe(true);
    expect(result.current.selectedItemKeys.has('subject:subject-4')).toBe(true);
    expect(result.current.selectedItemKeys.size).toBe(3);
  });

  it('passes batch confirmation preview metadata into move options', async () => {
    const onHomeFeedback = vi.fn();
    const logic = createLogic();
    const moveSelectionEntryWithShareRules = vi.fn(async () => ({ status: 'moved' }));

    const { result } = renderHook(() =>
      useHomeBulkSelection({
        logic,
        isStudentRole: false,
        onHomeFeedback,
        moveSelectionEntryWithShareRules,
      })
    );

    act(() => {
      result.current.setSelectMode(true);
      result.current.toggleSelectItem({ id: 'subject-1', name: 'Matematicas', isShared: true }, 'subject');
      result.current.toggleSelectItem({ id: 'subject-2', name: 'Historia' }, 'subject');
    });

    await act(async () => {
      await result.current.runBulkMoveToFolder('folder-target');
    });

    const [, , moveOptions] = moveSelectionEntryWithShareRules.mock.calls[0];
    expect(moveOptions.confirmationPreview).toEqual(
      expect.objectContaining({
        totalCount: 2,
        visibleNames: ['Matematicas', 'Historia'],
        hiddenCount: 0,
      })
    );
  });

  it('aggregates undo payload across deferred batch confirmation continuations', async () => {
    vi.useFakeTimers();

    const onHomeFeedback = vi.fn();
    const logic = createLogic();
    const moveSelectionEntryWithShareRules = vi.fn(async (entry, _targetFolderId, moveOptions) => {
      if (entry?.item?.id === 'subject-1' && !moveOptions?.batchDecisions?.subjectShareToTarget) {
        moveOptions?.setBatchDecision?.('subjectShareToTarget', 'confirm');
        window.setTimeout(() => {
          moveOptions?.onDeferredResolved?.({ key: entry?.key, moved: true });
        }, 0);
        return { status: 'deferred' };
      }

      return { status: 'moved' };
    });

    const { result } = renderHook(() =>
      useHomeBulkSelection({
        logic,
        isStudentRole: false,
        onHomeFeedback,
        moveSelectionEntryWithShareRules,
      })
    );

    act(() => {
      result.current.setSelectMode(true);
      result.current.toggleSelectItem({ id: 'subject-1', folderId: null, isShared: true }, 'subject');
      result.current.toggleSelectItem({ id: 'subject-2', folderId: null }, 'subject');
    });

    await act(async () => {
      await result.current.runBulkMoveToFolder('folder-target');
    });

    await act(async () => {
      vi.runAllTimers();
      await Promise.resolve();
    });

    expect(moveSelectionEntryWithShareRules).toHaveBeenCalled();
    expect(result.current.undoToast).toEqual(
      expect.objectContaining({
        message: 'Movimiento aplicado en 2 elemento(s).',
      })
    );
    expect(result.current.selectedItems).toHaveLength(0);

    vi.useRealTimers();
  });

  it('keeps selection mode disabled and restores sharing metadata after undo', async () => {
    const onHomeFeedback = vi.fn();
    const logic = createLogic({
      updateSubject: vi.fn(async () => {}),
    });

    const { result } = renderHook(() =>
      useHomeBulkSelection({
        logic,
        isStudentRole: false,
        onHomeFeedback,
      })
    );

    act(() => {
      result.current.setSelectMode(true);
      result.current.toggleSelectItem(
        {
          id: 'subject-1',
          folderId: 'folder-source',
          isShared: true,
          sharedWithUids: ['u-1'],
          sharedWith: [{ uid: 'u-1', email: 'u1@test.com' }],
        },
        'subject'
      );
    });

    await act(async () => {
      await result.current.runBulkMoveToFolder('folder-target');
    });

    expect(result.current.undoToast).toEqual(
      expect.objectContaining({
        message: 'Movimiento aplicado en 1 elemento(s).',
      })
    );

    await act(async () => {
      await result.current.undoLastSelectionAction();
    });

    expect(logic.updateSubject).toHaveBeenNthCalledWith(1, 'subject-1', {
      folderId: 'folder-target',
    });
    expect(logic.updateSubject).toHaveBeenNthCalledWith(
      2,
      'subject-1',
      expect.objectContaining({
        folderId: 'folder-source',
        isShared: true,
        sharedWithUids: ['u-1'],
      })
    );
    expect(result.current.selectMode).toBe(false);
    expect(result.current.selectedItems).toHaveLength(0);
  });

  it('undoes mixed subject and folder batch moves with full metadata restoration', async () => {
    const onHomeFeedback = vi.fn();
    const logic = createLogic({
      updateSubject: vi.fn(async () => {}),
      updateFolder: vi.fn(async () => {}),
    });

    const { result } = renderHook(() =>
      useHomeBulkSelection({
        logic,
        isStudentRole: false,
        onHomeFeedback,
      })
    );

    act(() => {
      result.current.setSelectMode(true);
      result.current.toggleSelectItem(
        {
          id: 'subject-1',
          folderId: 'folder-source-a',
          isShared: true,
          sharedWithUids: ['u-1'],
          sharedWith: [{ uid: 'u-1', email: 'u1@test.com' }],
        },
        'subject'
      );

      result.current.toggleSelectItem(
        {
          id: 'folder-1',
          parentId: 'folder-source-b',
          isShared: true,
          sharedWithUids: ['u-2'],
          sharedWith: [{ uid: 'u-2', email: 'u2@test.com' }],
        },
        'folder'
      );
    });

    await act(async () => {
      await result.current.runBulkMoveToFolder('folder-target');
    });

    expect(result.current.undoToast).toEqual(
      expect.objectContaining({
        message: 'Movimiento aplicado en 2 elemento(s).',
      })
    );

    await act(async () => {
      await result.current.undoLastSelectionAction();
    });

    expect(logic.updateSubject).toHaveBeenNthCalledWith(1, 'subject-1', {
      folderId: 'folder-target',
    });
    expect(logic.updateSubject).toHaveBeenNthCalledWith(
      2,
      'subject-1',
      expect.objectContaining({
        folderId: 'folder-source-a',
        isShared: true,
        sharedWithUids: ['u-1'],
      })
    );

    expect(logic.updateFolder).toHaveBeenNthCalledWith(1, 'folder-1', {
      parentId: 'folder-target',
    });
    expect(logic.updateFolder).toHaveBeenNthCalledWith(
      2,
      'folder-1',
      expect.objectContaining({
        parentId: 'folder-source-b',
        isShared: true,
        sharedWithUids: ['u-2'],
      })
    );

    expect(result.current.selectMode).toBe(false);
    expect(result.current.selectedItems).toHaveLength(0);
  });
});
