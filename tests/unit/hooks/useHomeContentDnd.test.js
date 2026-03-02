import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import useHomeContentDnd from '../../../src/pages/Home/hooks/useHomeContentDnd';

const createEvent = (data = {}) => {
  const dataTransfer = {
    getData: vi.fn((key) => data[key] || ''),
  };

  return {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    dataTransfer,
  };
};

describe('useHomeContentDnd', () => {
  it('promotes a dragged subject from promote zone', () => {
    const handlePromoteSubject = vi.fn();

    const { result } = renderHook(() =>
      useHomeContentDnd({
        currentFolder: { id: 'folder-a' },
        draggedItem: { id: 'subject-1' },
        draggedItemType: 'subject',
        handlePromoteSubject,
      })
    );

    const dragOverEvent = createEvent();
    act(() => {
      result.current.handlePromoteZoneDragOver(dragOverEvent);
    });

    expect(result.current.isPromoteZoneHovered).toBe(true);

    const dropEvent = createEvent();
    act(() => {
      result.current.handlePromoteZoneDrop(dropEvent);
    });

    expect(handlePromoteSubject).toHaveBeenCalledWith('subject-1', null);
    expect(result.current.isPromoteZoneHovered).toBe(false);
  });

  it('drops tree subject into current folder via handleDropOnFolder', () => {
    const handleDropOnFolder = vi.fn(() => false);
    const handleDragEnd = vi.fn();

    const { result } = renderHook(() =>
      useHomeContentDnd({
        currentFolder: { id: 'folder-target' },
        draggedItem: null,
        draggedItemType: null,
        handleDropOnFolder,
        handleDragEnd,
      })
    );

    const dropEvent = createEvent({
      treeItem: JSON.stringify({
        id: 'subject-9',
        type: 'subject',
        parentId: 'folder-origin',
        shortcutId: 'shortcut-1',
      }),
    });

    act(() => {
      result.current.handleRootZoneDrop(dropEvent);
    });

    expect(handleDropOnFolder).toHaveBeenCalledWith('folder-target', 'subject-9', 'folder-origin', 'shortcut-1');
    expect(handleDragEnd).toHaveBeenCalledTimes(1);
  });

  it('reorders subjects within same parent using handleDropReorderSubject', () => {
    const handleDropReorderSubject = vi.fn();
    const handleDragEnd = vi.fn();

    const { result } = renderHook(() =>
      useHomeContentDnd({
        currentFolder: { id: 'folder-current' },
        draggedItem: null,
        draggedItemType: null,
        handleDropReorderSubject,
        handleDragEnd,
      })
    );

    act(() => {
      result.current.handleListDrop(
        {
          id: 'subject-a',
          type: 'subject',
          parentId: 'folder-current',
          shortcutId: 'shortcut-a',
          index: 0,
        },
        {
          id: 'subject-b',
          type: 'subject',
          parentId: 'folder-current',
          index: 2,
        }
      );
    });

    expect(handleDropReorderSubject).toHaveBeenCalledWith('shortcut-a', 0, 2);
    expect(handleDragEnd).toHaveBeenCalledTimes(1);
  });

  it('moves folder into folder target using source-aware handler', () => {
    const handleMoveFolderWithSource = vi.fn();
    const handleDragEnd = vi.fn();

    const { result } = renderHook(() =>
      useHomeContentDnd({
        currentFolder: null,
        draggedItem: null,
        draggedItemType: null,
        handleMoveFolderWithSource,
        handleDragEnd,
      })
    );

    act(() => {
      result.current.handleListDrop(
        {
          id: 'folder-child',
          type: 'folder',
          parentId: 'folder-root',
        },
        {
          id: 'folder-target',
          type: 'folder',
        }
      );
    });

    expect(handleMoveFolderWithSource).toHaveBeenCalledWith('folder-child', 'folder-root', 'folder-target');
    expect(handleDragEnd).toHaveBeenCalledTimes(1);
  });
});