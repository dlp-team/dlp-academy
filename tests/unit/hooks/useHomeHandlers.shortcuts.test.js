// tests/unit/hooks/useHomeHandlers.shortcuts.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useHomeHandlers } from '../../../src/hooks/useHomeHandlers';

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
    onHomeFeedback: vi.fn(),
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
    expect(config.deleteShortcut).toHaveBeenCalledWith('shortcut-sub-2');
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

  it('blocks shortcut-folder unshare when nested in shared tree', async () => {
    const config = createBaseConfig({
      folders: [
        { id: 'root-shared', isShared: true, parentId: null },
        { id: 'child-folder', isShared: false, parentId: 'root-shared' },
      ],
      deleteConfig: {
        isOpen: true,
        type: 'shortcut-folder',
        action: 'unshare',
        item: {
          id: 'folder-5',
          targetId: 'folder-5',
          shortcutParentId: 'child-folder',
          shortcutId: 'shortcut-folder-5',
        },
      },
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleDelete();

    expect(config.unshareFolder).not.toHaveBeenCalled();
    expect(config.deleteShortcut).not.toHaveBeenCalled();
  });

  it('unshares shortcut-folder when outside shared tree', async () => {
    const config = createBaseConfig({
      folders: [{ id: 'regular-folder', isShared: false, parentId: null }],
      deleteConfig: {
        isOpen: true,
        type: 'shortcut-folder',
        action: 'unshare',
        item: {
          id: 'folder-6',
          targetId: 'folder-6',
          shortcutParentId: 'regular-folder',
          shortcutId: 'shortcut-folder-6',
        },
      },
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleDelete();

    expect(config.unshareFolder).toHaveBeenCalledWith('folder-6', 'user1@test.com');
    expect(config.deleteShortcut).toHaveBeenCalledWith('shortcut-folder-6');
  });

  it('unhides shortcut-subject and supports direct shortcut deletion action', async () => {
    const unhideConfig = createBaseConfig({
      deleteConfig: {
        isOpen: true,
        type: 'shortcut-subject',
        action: 'unhide',
        item: {
          id: 'subject-9',
          targetId: 'subject-9',
          shortcutId: 'shortcut-sub-9',
        },
      },
    });

    const handlers = useHomeHandlers(unhideConfig);
    await handlers.handleDelete();

    expect(unhideConfig.setShortcutHiddenInManual).toHaveBeenCalledWith('shortcut-sub-9', false);
    expect(unhideConfig.deleteShortcut).not.toHaveBeenCalled();

    const deleteConfig = createBaseConfig({
      deleteConfig: {
        isOpen: true,
        type: 'shortcut-subject',
        action: 'delete',
        item: {
          id: 'subject-10',
          targetId: 'subject-10',
          shortcutId: 'shortcut-sub-10',
        },
      },
    });

    const deleteHandlers = useHomeHandlers(deleteConfig);
    await deleteHandlers.handleDelete();

    expect(deleteConfig.deleteShortcut).toHaveBeenCalledWith('shortcut-sub-10');
  });

  it('moves orphan shortcut-subject deletion to bin in shared-tree ghost context', async () => {
    const config = createBaseConfig({
      folders: [
        { id: 'root-shared', isShared: true, parentId: null },
        { id: 'child-folder', isShared: false, parentId: 'root-shared' },
      ],
      deleteConfig: {
        isOpen: true,
        type: 'shortcut-subject',
        action: 'deleteShortcut',
        item: {
          id: 'subject-ghost-1',
          targetId: 'subject-ghost-1',
          shortcutParentId: 'child-folder',
          shortcutId: 'shortcut-sub-ghost-1',
          isOrphan: true,
        },
      },
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleDelete();

    expect(config.deleteShortcut).toHaveBeenCalledWith('shortcut-sub-ghost-1', { moveToBin: true });
    expect(config.unshareSubject).not.toHaveBeenCalled();
    expect(config.setDeleteConfig).toHaveBeenCalledWith({ isOpen: false, type: null, action: null, item: null });
  });

  it('moves orphan shortcut-folder deletion to bin in shared-tree ghost context', async () => {
    const config = createBaseConfig({
      folders: [
        { id: 'root-shared', isShared: true, parentId: null },
        { id: 'child-folder', isShared: false, parentId: 'root-shared' },
      ],
      deleteConfig: {
        isOpen: true,
        type: 'shortcut-folder',
        action: 'deleteShortcut',
        item: {
          id: 'folder-ghost-1',
          targetId: 'folder-ghost-1',
          shortcutParentId: 'child-folder',
          shortcutId: 'shortcut-folder-ghost-1',
          isOrphan: true,
        },
      },
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleDelete();

    expect(config.deleteShortcut).toHaveBeenCalledWith('shortcut-folder-ghost-1', { moveToBin: true });
    expect(config.unshareFolder).not.toHaveBeenCalled();
    expect(config.setDeleteConfig).toHaveBeenCalledWith({ isOpen: false, type: null, action: null, item: null });
  });

  it('deletes subject and updates manual order list', async () => {
    const config = createBaseConfig({
      deleteConfig: {
        isOpen: true,
        type: 'subject',
        item: {
          id: 'subject-delete-1',
          ownerId: 'user-1',
        },
      },
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleDelete();

    expect(config.deleteSubject).toHaveBeenCalledWith('subject-delete-1');
    expect(config.setManualOrder).toHaveBeenCalledTimes(1);

    const updater = config.setManualOrder.mock.calls[0][0];
    const nextState = updater({ subjects: ['subject-delete-1', 'subject-2'], folders: ['folder-1'] });
    expect(nextState.subjects).toEqual(['subject-2']);
  });

  it('blocks subject deletion when current user is not owner and surfaces explicit permission feedback', async () => {
    const config = createBaseConfig({
      deleteConfig: {
        isOpen: true,
        type: 'subject',
        item: {
          id: 'subject-ghost-nonowner',
          ownerId: 'owner-2',
          folderId: 'shared-folder-1',
          isShared: true,
        },
      },
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleDelete();

    expect(config.deleteSubject).not.toHaveBeenCalled();
    expect(config.setManualOrder).not.toHaveBeenCalled();
    expect(config.setDeleteConfig).toHaveBeenCalledTimes(1);
    const updater = config.setDeleteConfig.mock.calls[0][0];
    expect(typeof updater).toBe('function');
    expect(
      updater({ isOpen: true, type: 'subject', action: null, item: { id: 'subject-ghost-nonowner' } })
    ).toEqual({
      isOpen: true,
      type: 'subject',
      action: null,
      item: { id: 'subject-ghost-nonowner' },
      errorMessage: 'No tienes permisos para eliminar esta asignatura.'
    });
  });

  it('allows institution admin subject deletion within the same institution even when not owner', async () => {
    const config = createBaseConfig({
      user: {
        uid: 'inst-admin-1',
        email: 'inst-admin-1@test.com',
        role: 'institutionadmin',
        institutionId: 'inst-1',
      },
      deleteConfig: {
        isOpen: true,
        type: 'subject',
        item: {
          id: 'subject-inst-admin-delete',
          ownerId: 'teacher-1',
          institutionId: 'inst-1',
        },
      },
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleDelete();

    expect(config.deleteSubject).toHaveBeenCalledWith('subject-inst-admin-delete');
  });

  it('denies institution admin subject deletion across institutions', async () => {
    const config = createBaseConfig({
      user: {
        uid: 'inst-admin-1',
        email: 'inst-admin-1@test.com',
        role: 'institutionadmin',
        institutionId: 'inst-1',
      },
      deleteConfig: {
        isOpen: true,
        type: 'subject',
        item: {
          id: 'subject-cross-inst-delete',
          ownerId: 'teacher-2',
          institutionId: 'inst-2',
        },
      },
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleDelete();

    expect(config.deleteSubject).not.toHaveBeenCalled();
    expect(config.setDeleteConfig).toHaveBeenCalledTimes(1);
    const updater = config.setDeleteConfig.mock.calls[0][0];
    expect(typeof updater).toBe('function');
    expect(
      updater({ isOpen: true, type: 'subject', action: null, item: { id: 'subject-cross-inst-delete' } })
    ).toEqual({
      isOpen: true,
      type: 'subject',
      action: null,
      item: { id: 'subject-cross-inst-delete' },
      errorMessage: 'No tienes permisos para eliminar esta asignatura.'
    });
  });

  it('allows owner subject deletion in shared context and preserves manual-order integrity', async () => {
    const config = createBaseConfig({
      deleteConfig: {
        isOpen: true,
        type: 'subject',
        item: {
          id: 'subject-shared-owner',
          ownerId: 'user-1',
          folderId: 'shared-folder-1',
          isShared: true,
        },
      },
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleDelete();

    expect(config.deleteSubject).toHaveBeenCalledWith('subject-shared-owner');
    const updater = config.setManualOrder.mock.calls[0][0];
    const nextState = updater({ subjects: ['subject-shared-owner', 'subject-other'], folders: [] });
    expect(nextState.subjects).toEqual(['subject-other']);
  });

  it('blocks shortcut-folder unshare in shared-tree ghost context and leaves shortcut data untouched', async () => {
    const config = createBaseConfig({
      folders: [
        { id: 'root-shared', isShared: true, parentId: null },
        { id: 'nested-folder', isShared: false, parentId: 'root-shared' },
      ],
      deleteConfig: {
        isOpen: true,
        type: 'shortcut-folder',
        action: 'unshare',
        item: {
          id: 'folder-ghost-2',
          targetId: 'folder-ghost-2',
          shortcutParentId: 'nested-folder',
          shortcutId: 'shortcut-folder-ghost-2',
        },
      },
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleDelete();

    expect(config.unshareFolder).not.toHaveBeenCalled();
    expect(config.deleteShortcut).not.toHaveBeenCalled();
    expect(config.setShortcutHiddenInManual).not.toHaveBeenCalled();
    expect(config.setDeleteConfig).toHaveBeenCalledWith({ isOpen: false, type: null, action: null, item: null });
  });

  it('unshares shortcut-folder outside shared tree and removes shortcut link directly', async () => {
    const config = createBaseConfig({
      folders: [{ id: 'private-parent', isShared: false, parentId: null }],
      deleteConfig: {
        isOpen: true,
        type: 'shortcut-folder',
        action: 'unshare',
        item: {
          id: 'folder-private-1',
          targetId: 'folder-private-1',
          shortcutParentId: 'private-parent',
          shortcutId: 'shortcut-folder-private-1',
        },
      },
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleDelete();

    expect(config.unshareFolder).toHaveBeenCalledWith('folder-private-1', 'user1@test.com');
    expect(config.deleteShortcut).toHaveBeenCalledWith('shortcut-folder-private-1');
    expect(config.setDeleteConfig).toHaveBeenCalledWith({ isOpen: false, type: null, action: null, item: null });
  });

  it('deletes owned folder and updates manual order list', async () => {
    const config = createBaseConfig({
      deleteConfig: {
        isOpen: true,
        type: 'folder',
        item: {
          id: 'folder-delete-1',
          ownerId: 'user-1',
        },
      },
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleDelete();

    expect(config.deleteFolder).toHaveBeenCalledWith('folder-delete-1');
    expect(config.setManualOrder).toHaveBeenCalledTimes(1);

    const updater = config.setManualOrder.mock.calls[0][0];
    const nextState = updater({ subjects: ['subject-1'], folders: ['folder-delete-1', 'folder-2'] });
    expect(nextState.folders).toEqual(['folder-2']);
  });

  it('handleDeleteFolderAll deletes owned folder and updates manual order', async () => {
    const config = createBaseConfig({
      deleteConfig: {
        isOpen: true,
        item: {
          id: 'folder-all-1',
          ownerId: 'user-1',
        },
      },
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleDeleteFolderAll();

    expect(config.deleteFolder).toHaveBeenCalledWith('folder-all-1');
    expect(config.setManualOrder).toHaveBeenCalledTimes(1);

    const updater = config.setManualOrder.mock.calls[0][0];
    const nextState = updater({ subjects: ['subject-1'], folders: ['folder-all-1', 'folder-2'] });
    expect(nextState.folders).toEqual(['folder-2']);
    expect(config.setDeleteConfig).toHaveBeenCalledWith({ isOpen: false, type: null, item: null });
  });

  it('handleDeleteFolderAll blocks non-owner folder deletion', async () => {
    const config = createBaseConfig({
      deleteConfig: {
        isOpen: true,
        item: {
          id: 'folder-all-2',
          ownerId: 'owner-2',
        },
      },
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleDeleteFolderAll();

    expect(config.deleteFolder).not.toHaveBeenCalled();
    expect(config.setManualOrder).not.toHaveBeenCalled();
    expect(config.setDeleteConfig).toHaveBeenCalledWith({ isOpen: false, type: null, item: null });
  });

  it('handleDeleteFolderOnly deletes owned folder and updates manual order', async () => {
    const config = createBaseConfig({
      deleteConfig: {
        isOpen: true,
        item: {
          id: 'folder-only-1',
          ownerId: 'user-1',
        },
      },
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleDeleteFolderOnly();

    expect(config.deleteFolderOnly).toHaveBeenCalledWith('folder-only-1');
    expect(config.setManualOrder).toHaveBeenCalledTimes(1);

    const updater = config.setManualOrder.mock.calls[0][0];
    const nextState = updater({ subjects: ['subject-1'], folders: ['folder-only-1', 'folder-2'] });
    expect(nextState.folders).toEqual(['folder-2']);
    expect(config.setDeleteConfig).toHaveBeenCalledWith({ isOpen: false, type: null, item: null });
  });

  it('handleDeleteFolderOnly blocks non-owner folder deletion', async () => {
    const config = createBaseConfig({
      deleteConfig: {
        isOpen: true,
        item: {
          id: 'folder-only-2',
          ownerId: 'owner-2',
        },
      },
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleDeleteFolderOnly();

    expect(config.deleteFolderOnly).not.toHaveBeenCalled();
    expect(config.setManualOrder).not.toHaveBeenCalled();
    expect(config.setDeleteConfig).toHaveBeenCalledWith({ isOpen: false, type: null, item: null });
  });

  it('reports in-page error feedback when subject drop move fails', async () => {
    const config = createBaseConfig({
      subjects: [
        {
          id: 'subject-error-1',
          ownerId: 'user-1',
          folderId: 'folder-a',
        },
      ],
      updateSubject: vi.fn().mockRejectedValue(new Error('update failed')),
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleDropOnFolder('subject-error-1', 'folder-b', 'subject', 'folder-a');

    expect(config.onHomeFeedback).toHaveBeenCalledWith(
      'No se pudo completar el movimiento. Revisa permisos e intentalo nuevamente.',
      'error'
    );
  });

  it('reports in-page error feedback when nesting folder fails', async () => {
    const config = createBaseConfig({
      folders: [
        { id: 'folder-target', ownerId: 'user-1', parentId: null },
        { id: 'folder-child', ownerId: 'user-1', parentId: null },
      ],
      updateFolder: vi.fn().mockRejectedValue(new Error('nest failed')),
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleNestFolder('folder-target', 'folder-child');

    expect(config.onHomeFeedback).toHaveBeenCalledWith(
      'No se pudo anidar la carpeta seleccionada. Revisa permisos e intentalo nuevamente.',
      'error'
    );
  });

  it('reports in-page error feedback when saving an edited subject fails', async () => {
    const config = createBaseConfig({
      subjectModalConfig: {
        isOpen: true,
        isEditing: true,
        data: { id: 'subject-save-1' },
      },
      updateSubject: vi.fn().mockRejectedValue(new Error('save subject failed')),
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleSaveSubject({
      id: 'subject-save-1',
      name: 'Algebra',
      course: '1A',
      color: 'from-indigo-500 to-purple-600',
      tags: [],
    });

    expect(config.onHomeFeedback).toHaveBeenCalledWith(
      'No se pudo guardar la asignatura. Revisa los datos e intentalo nuevamente.',
      'error'
    );
  });

  it('reports in-page error feedback when saving an edited folder fails', async () => {
    const config = createBaseConfig({
      folderModalConfig: {
        isOpen: true,
        isEditing: true,
        data: { id: 'folder-save-1' },
      },
      updateFolder: vi.fn().mockRejectedValue(new Error('save folder failed')),
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleSaveFolder({
      id: 'folder-save-1',
      name: 'Carpeta Algebra',
      description: 'Descripcion',
      color: 'from-amber-400 to-amber-600',
      tags: [],
    });

    expect(config.onHomeFeedback).toHaveBeenCalledWith(
      'No se pudo guardar la carpeta. Revisa los datos e intentalo nuevamente.',
      'error'
    );
  });

  it('reports in-page error feedback when folder unshare action fails', async () => {
    const config = createBaseConfig({
      folders: [{ id: 'regular-folder', isShared: false, parentId: null }],
      unshareFolder: vi.fn().mockRejectedValue(new Error('unshare failed')),
      deleteConfig: {
        isOpen: true,
        type: 'shortcut-folder',
        action: 'unshare',
        item: {
          id: 'folder-err-1',
          targetId: 'folder-err-1',
          shortcutParentId: 'regular-folder',
          shortcutId: 'shortcut-folder-err-1',
        },
      },
    });

    const handlers = useHomeHandlers(config);
    await handlers.handleDelete();

    expect(config.onHomeFeedback).toHaveBeenCalledWith(
      'No se pudo quitar el acceso compartido de la carpeta. Intentalo de nuevo.',
      'error'
    );
    expect(config.deleteShortcut).toHaveBeenCalledWith('shortcut-folder-err-1');
    expect(config.setDeleteConfig).toHaveBeenCalledWith({ isOpen: false, type: null, action: null, item: null });
  });
});