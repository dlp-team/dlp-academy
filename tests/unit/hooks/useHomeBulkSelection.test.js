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
});
