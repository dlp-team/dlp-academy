// tests/unit/pages/home/HomeContent.selectionModifiers.test.jsx
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import HomeContent from '../../../../src/pages/Home/components/HomeContent';

vi.mock('../../../../src/pages/Home/hooks/useHomeContentDnd', () => ({
  default: () => ({
    isPromoteZoneHovered: false,
    isRootZoneHovered: false,
    setIsRootZoneHovered: vi.fn(),
    handlePromoteZoneDragOver: vi.fn(),
    handlePromoteZoneDragLeave: vi.fn(),
    handlePromoteZoneDrop: vi.fn(),
    handleRootZoneDrop: vi.fn(),
    handleListDrop: vi.fn(),
  }),
}));

vi.mock('../../../../src/hooks/useAutoScrollOnDrag', () => ({
  default: vi.fn(),
}));

vi.mock('../../../../src/components/modules/ListViewItem', () => ({
  default: (props) => {
    const selectionKey = `${props.type}:${props.item?.shortcutId || props.item?.id}`;

    if (props.type === 'folder') {
      return (
        <button
          data-testid={`folder-${props.item.id}`}
          data-selection-key={selectionKey}
          onClick={(event) => props.onNavigate?.(props.item, event)}
        >
          {props.item.name}
        </button>
      );
    }

    return (
      <button
        data-testid={`subject-${props.item.id}`}
        data-selection-key={selectionKey}
        onClick={(event) => props.onNavigateSubject?.(props.item.id, event)}
      >
        {props.item.name}
      </button>
    );
  },
}));

const baseSubject1 = { id: 'subject-1', name: 'Asignatura 1', folderId: null };
const baseSubject2 = { id: 'subject-2', name: 'Asignatura 2', folderId: null };
const baseFolder = { id: 'folder-1', name: 'Carpeta 1', parentId: null };

const buildProps = (overrides = {}) => {
  const handleOpenFolder = vi.fn();
  const handleSelectSubject = vi.fn();
  const setSelectMode = vi.fn();
  const onToggleSelectItem = vi.fn();

  return {
    user: { uid: 'user-1' },
    viewMode: 'grid',
    layoutMode: 'list',
    groupedContent: {
      Principal: [baseSubject1, baseSubject2],
    },
    collapsedGroups: {},
    currentFolder: null,
    orderedFolders: [baseFolder],
    handleSelectSubject,
    handleOpenFolder,
    handleDropOnFolder: vi.fn(),
    handleNestFolder: vi.fn(),
    handlePromoteSubject: vi.fn(),
    handlePromoteFolder: vi.fn(),
    handleShowFolderContents: vi.fn(),
    handleMoveSubjectWithSource: vi.fn(),
    handleMoveFolderWithSource: vi.fn(),
    onOpenTopics: vi.fn(),
    isDragAndDropEnabled: false,
    draggedItem: null,
    draggedItemType: null,
    handleDragStartSubject: vi.fn(),
    handleDragStartFolder: vi.fn(),
    handleDragEnd: vi.fn(),
    handleDragOverSubject: vi.fn(),
    handleDragOverFolder: vi.fn(),
    handleDropReorderSubject: vi.fn(),
    handleDropReorderFolder: vi.fn(),
    subjects: [baseSubject1, baseSubject2],
    folders: [baseFolder],
    resolvedShortcuts: [],
    navigate: vi.fn(),
    selectMode: false,
    setSelectMode,
    selectedItemKeys: new Set(),
    onToggleSelectItem,
    setSubjectModalConfig: vi.fn(),
    setFolderModalConfig: vi.fn(),
    setDeleteConfig: vi.fn(),
    setActiveMenu: vi.fn(),
    activeMenu: null,
    ...overrides,
  };
};

describe('HomeContent modifier selection behavior', () => {
  it('enters selection mode and selects item on Ctrl+click outside selection mode', () => {
    const props = buildProps();

    render(<HomeContent {...props} />);

    fireEvent.click(screen.getByTestId('folder-folder-1'), { ctrlKey: true });

    expect(props.setSelectMode).toHaveBeenCalledWith(true);
    expect(props.onToggleSelectItem).toHaveBeenCalledWith(baseFolder, 'folder');
    expect(props.handleOpenFolder).not.toHaveBeenCalled();
  });

  it('navigates selected item on Ctrl+click while selection mode stays active', () => {
    const props = buildProps({
      selectMode: true,
      selectedItemKeys: new Set(['folder:folder-1']),
    });

    render(<HomeContent {...props} />);

    fireEvent.click(screen.getByTestId('folder-folder-1'), { ctrlKey: true });

    expect(props.handleOpenFolder).toHaveBeenCalledWith(baseFolder);
    expect(props.onToggleSelectItem).not.toHaveBeenCalled();
    expect(props.setSelectMode).not.toHaveBeenCalled();
  });

  it('adds contiguous range on Ctrl+Shift+click from anchor to target in list order', () => {
    const props = buildProps({
      selectMode: true,
      selectedItemKeys: new Set(['subject:subject-1']),
    });

    render(<HomeContent {...props} />);

    fireEvent.click(screen.getByTestId('subject-subject-2'), {
      ctrlKey: true,
      shiftKey: true,
    });

    expect(props.onToggleSelectItem).toHaveBeenCalledTimes(1);
    expect(props.onToggleSelectItem).toHaveBeenCalledWith(baseSubject2, 'subject');
    expect(props.handleSelectSubject).not.toHaveBeenCalled();
  });
});
