// tests/unit/hooks/useHomeContentDnd.test.js
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

  it('ignores root drop when payload is empty', () => {
    const handleDropOnFolder = vi.fn();
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

    act(() => {
      result.current.handleRootZoneDrop(createEvent());
    });

    expect(handleDropOnFolder).not.toHaveBeenCalled();
    expect(handleDragEnd).not.toHaveBeenCalled();
  });

  it('uses fallback moveSubjectWithSource when overlay is not shown', () => {
    const handleMoveSubjectWithSource = vi.fn();
    const handleDragEnd = vi.fn();

    const { result } = renderHook(() =>
      useHomeContentDnd({
        currentFolder: { id: 'folder-target' },
        draggedItem: null,
        draggedItemType: null,
        handleMoveSubjectWithSource,
        handleDragEnd,
      })
    );

    act(() => {
      result.current.handleListDrop(
        {
          id: 'subject-a',
          type: 'subject',
          parentId: 'folder-source',
          folderId: 'folder-source',
          shortcutId: 'shortcut-a',
        },
        {
          id: 'folder-target',
          type: 'folder',
        }
      );
    });

    expect(handleMoveSubjectWithSource).toHaveBeenCalledWith('subject-a', 'folder-target', 'folder-source');
    expect(handleDragEnd).toHaveBeenCalledTimes(1);
  });

  it('routes selected subject drops through bulk move handler in select mode', () => {
    const handleDropOnFolder = vi.fn(() => false);
    const handleDragEnd = vi.fn();
    const onDropSelectedItems = vi.fn();

    const { result } = renderHook(() =>
      useHomeContentDnd({
        currentFolder: { id: 'folder-current' },
        draggedItem: null,
        draggedItemType: null,
        handleDropOnFolder,
        handleDragEnd,
        selectMode: true,
        selectedItemKeys: new Set(['subject:shortcut-a']),
        onDropSelectedItems,
      })
    );

    act(() => {
      result.current.handleListDrop(
        {
          id: 'subject-a',
          type: 'subject',
          parentId: 'folder-source',
          folderId: 'folder-source',
          shortcutId: 'shortcut-a',
        },
        {
          id: 'folder-target',
          type: 'folder',
        }
      );
    });

    expect(onDropSelectedItems).toHaveBeenCalledWith('folder-target');
    expect(handleDropOnFolder).not.toHaveBeenCalled();
    expect(handleDragEnd).toHaveBeenCalledTimes(1);
  });

  it('routes selected folder root drops through bulk move handler in select mode', () => {
    const handleNestFolder = vi.fn();
    const handleDragEnd = vi.fn();
    const onDropSelectedItems = vi.fn();

    const { result } = renderHook(() =>
      useHomeContentDnd({
        currentFolder: { id: 'folder-target' },
        draggedItem: null,
        draggedItemType: null,
        handleNestFolder,
        handleDragEnd,
        selectMode: true,
        selectedItemKeys: new Set(['folder:shortcut-folder-1']),
        onDropSelectedItems,
      })
    );

    const dropEvent = createEvent({
      treeItem: JSON.stringify({
        id: 'folder-source',
        type: 'folder',
        parentId: 'folder-parent',
        shortcutId: 'shortcut-folder-1',
      }),
    });

    act(() => {
      result.current.handleRootZoneDrop(dropEvent);
    });

    expect(onDropSelectedItems).toHaveBeenCalledWith('folder-target');
    expect(handleNestFolder).not.toHaveBeenCalled();
    expect(handleDragEnd).toHaveBeenCalledTimes(1);
  });

  it('routes selected subject root drops through bulk move handler in select mode', () => {
    const handleDropOnFolder = vi.fn(() => false);
    const handleDragEnd = vi.fn();
    const onDropSelectedItems = vi.fn();

    const { result } = renderHook(() =>
      useHomeContentDnd({
        currentFolder: { id: 'folder-target' },
        draggedItem: null,
        draggedItemType: null,
        handleDropOnFolder,
        handleDragEnd,
        selectMode: true,
        selectedItemKeys: new Set(['subject:shortcut-subject-1']),
        onDropSelectedItems,
      })
    );

    const dropEvent = createEvent({
      treeItem: JSON.stringify({
        id: 'subject-1',
        type: 'subject',
        parentId: 'folder-source',
        shortcutId: 'shortcut-subject-1',
      }),
    });

    act(() => {
      result.current.handleRootZoneDrop(dropEvent);
    });

    expect(onDropSelectedItems).toHaveBeenCalledWith('folder-target');
    expect(handleDropOnFolder).not.toHaveBeenCalled();
    expect(handleDragEnd).toHaveBeenCalledTimes(1);
  });

  it('keeps non-selected subject drops on normal path while selection mode is active', () => {
    const handleDropOnFolder = vi.fn(() => false);
    const handleDragEnd = vi.fn();
    const onDropSelectedItems = vi.fn();

    const { result } = renderHook(() =>
      useHomeContentDnd({
        currentFolder: { id: 'folder-current' },
        draggedItem: null,
        draggedItemType: null,
        handleDropOnFolder,
        handleDragEnd,
        selectMode: true,
        selectedItemKeys: new Set(['subject:shortcut-selected-other']),
        onDropSelectedItems,
      })
    );

    act(() => {
      result.current.handleListDrop(
        {
          id: 'subject-a',
          type: 'subject',
          parentId: 'folder-source',
          folderId: 'folder-source',
          shortcutId: 'shortcut-a',
        },
        {
          id: 'folder-target',
          type: 'folder',
        }
      );
    });

    expect(onDropSelectedItems).not.toHaveBeenCalled();
    expect(handleDropOnFolder).toHaveBeenCalledWith('folder-target', 'subject-a', 'folder-source', 'shortcut-a');
    expect(handleDragEnd).toHaveBeenCalledTimes(1);
  });

  it('nests folder shortcut directly when dropped on subject target parent', () => {
    const handleNestFolder = vi.fn();
    const handleDragEnd = vi.fn();

    const { result } = renderHook(() =>
      useHomeContentDnd({
        currentFolder: { id: 'folder-current' },
        draggedItem: null,
        draggedItemType: null,
        handleNestFolder,
        handleDragEnd,
      })
    );

    act(() => {
      result.current.handleListDrop(
        {
          id: 'folder-shortcut',
          type: 'folder',
          parentId: 'folder-source',
          shortcutId: 'shortcut-folder-1',
        },
        {
          id: 'subject-target',
          type: 'subject',
          parentId: 'folder-target',
        }
      );
    });

    expect(handleNestFolder).toHaveBeenCalledWith('folder-target', 'folder-shortcut', 'shortcut-folder-1');
    expect(handleDragEnd).toHaveBeenCalledTimes(1);
  });
});