import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useHomeHandlers } from '../../../src/pages/Home/hooks/useHomeHandlers';

const createBaseConfig = (overrides = {}) => {
  const base = {
    user: { uid: 'user-1', email: 'user1@test.com' },
    subjects: [],
    folders: [],
    filteredFolders: [],
    currentFolder: null,
    groupedContent: { all: [] },
    orderedFolders: [],
    subjectModalConfig: { isOpen: false, isEditing: false, data: null },
    folderModalConfig: { isOpen: false, isEditing: false, data: null },
    deleteConfig: { isOpen: false, type: null, action: null, item: null },
    setSubjectModalConfig: vi.fn(),
    setFolderModalConfig: vi.fn(),
    setDeleteConfig: vi.fn(),
    setCurrentFolder: vi.fn(),
    setCollapsedGroups: vi.fn(),
    setManualOrder: vi.fn(),
    setActiveFilter: vi.fn(),
    setDraggedItem: vi.fn(),
    setDraggedItemType: vi.fn(),
    setDropPosition: vi.fn(),
    touchSubject: vi.fn(),
    updateSubject: vi.fn(),
    addSubject: vi.fn(),
    addSubjectToFolder: vi.fn(),
    updateFolder: vi.fn(),
    addFolder: vi.fn(),
    deleteSubject: vi.fn(),
    deleteFolder: vi.fn(),
    deleteFolderOnly: vi.fn(),
    deleteShortcut: vi.fn(),
    unshareSubject: vi.fn(),
    unshareFolder: vi.fn(),
    updatePreference: vi.fn(),
    navigate: vi.fn(),
    isDescendant: vi.fn(() => false),
    updateShortcutAppearance: vi.fn(),
    setShortcutHiddenInManual: vi.fn(),
  };

  return { ...base, ...overrides };
};

describe('useHomeHandlers shortcut sharing + roles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks shortcut-subject unshare when item is inside a shared folder tree', async () => {
    const config = createBaseConfig({
      folders: [
        { id: 'root-shared', isShared: true, parentId: null },
        { id: 'child-folder', isShared: false, parentId: 'root-shared' },
      ],
      deleteConfig: {
        isOpen: true,
        type: 'shortcut-subject',
        action: 'unshare',
        item: {
          id: 'subject-1',
          targetId: 'subject-1',
          shortcutParentId: 'child-folder',
          shortcutId: 'shortcut-sub-1',
        },
      },
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleDelete();

    expect(config.unshareSubject).not.toHaveBeenCalled();
    expect(config.deleteShortcut).not.toHaveBeenCalled();
    expect(config.setDeleteConfig).toHaveBeenCalledWith({ isOpen: false, type: null, action: null, item: null });
  });

  it('unshares shortcut-subject when outside shared tree', async () => {
    const config = createBaseConfig({
      folders: [{ id: 'regular-folder', isShared: false, parentId: null }],
      deleteConfig: {
        isOpen: true,
        type: 'shortcut-subject',
        action: 'unshare',
        item: {
          id: 'subject-2',
          targetId: 'subject-2',
          shortcutParentId: 'regular-folder',
          shortcutId: 'shortcut-sub-2',
        },
      },
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleDelete();

    expect(config.unshareSubject).toHaveBeenCalledWith('subject-2', 'user1@test.com');
    expect(config.deleteShortcut).not.toHaveBeenCalled();
    expect(config.setDeleteConfig).toHaveBeenCalledWith({ isOpen: false, type: null, action: null, item: null });
  });

  it('hides shortcut-folder via manual visibility toggle', async () => {
    const config = createBaseConfig({
      deleteConfig: {
        isOpen: true,
        type: 'shortcut-folder',
        action: 'hide',
        item: {
          id: 'folder-2',
          targetId: 'folder-2',
          shortcutId: 'shortcut-folder-2',
        },
      },
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleDelete();

    expect(config.setShortcutHiddenInManual).toHaveBeenCalledWith('shortcut-folder-2', true);
    expect(config.unshareFolder).not.toHaveBeenCalled();
    expect(config.deleteShortcut).not.toHaveBeenCalled();
  });

  it('prevents folder deletion when current user is not owner', async () => {
    const config = createBaseConfig({
      deleteConfig: {
        isOpen: true,
        type: 'folder',
        item: {
          id: 'folder-9',
          ownerId: 'owner-2',
        },
      },
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleDelete();

    expect(config.deleteFolder).not.toHaveBeenCalled();
    expect(config.setDeleteConfig).toHaveBeenCalledWith({ isOpen: false, type: null, action: null, item: null });
  });

  it('does not move subject on drop when user is viewer', async () => {
    const config = createBaseConfig({
      subjects: [
        {
          id: 'subject-a',
          ownerId: 'owner-2',
          editorUids: [],
          viewerUids: ['user-1'],
          folderId: 'folder-a',
        },
      ],
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleDropOnFolder('subject-a', 'folder-b', 'subject', 'folder-a');

    expect(config.updateSubject).not.toHaveBeenCalled();
    expect(config.touchSubject).not.toHaveBeenCalled();
  });

  it('moves subject on drop when user is editor', async () => {
    const config = createBaseConfig({
      subjects: [
        {
          id: 'subject-a',
          ownerId: 'owner-2',
          editorUids: ['user-1'],
          folderId: 'folder-a',
        },
      ],
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleDropOnFolder('subject-a', 'folder-b', 'subject', 'folder-a');

    expect(config.updateSubject).toHaveBeenCalledWith('subject-a', { folderId: 'folder-b' });
    expect(config.touchSubject).toHaveBeenCalledWith('subject-a');
  });
});