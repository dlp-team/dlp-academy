// tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useHomePageHandlers } from '../../../src/pages/Home/hooks/useHomePageHandlers';

const folderUtilsMocks = vi.hoisted(() => ({
  isInvalidFolderMove: vi.fn(() => false),
}));

const persistenceMocks = vi.hoisted(() => ({
  saveLastHomeFolderId: vi.fn(),
  clearLastHomeFolderId: vi.fn(),
}));

vi.mock('../../../src/firebase/config', () => ({
  db: { __db: 'mock-db' },
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    updateDoc: vi.fn(),
    doc: vi.fn(() => ({ __doc: true })),
  };
});

vi.mock('../../../src/utils/folderUtils', () => ({
  isInvalidFolderMove: (...args) => folderUtilsMocks.isInvalidFolderMove(...args),
}));

vi.mock('../../../src/pages/Home/utils/homePersistence', () => ({
  saveLastHomeFolderId: (...args) => persistenceMocks.saveLastHomeFolderId(...args),
  clearLastHomeFolderId: (...args) => persistenceMocks.clearLastHomeFolderId(...args),
}));

const createBaseConfig = (overrides = {}) => {
  const base = {
    logic: {
      folders: [],
      subjects: [],
      shortcuts: [],
      currentFolder: null,
      moveShortcut: vi.fn(),
      navigate: vi.fn(),
      setCurrentFolder: vi.fn(),
    },
    currentUserId: 'user-1',
    updateFolder: vi.fn(),
    moveSubjectToParent: vi.fn(),
    moveFolderToParent: vi.fn(),
    moveSubjectBetweenFolders: vi.fn(),
    setShareConfirm: vi.fn(),
    setUnshareConfirm: vi.fn(),
    setTopicsModalConfig: vi.fn(),
    setFolderContentsModalConfig: vi.fn(),
    rememberOrganization: false,
  };

  return {
    ...base,
    ...overrides,
    logic: {
      ...base.logic,
      ...(overrides.logic || {}),
    },
  };
};

describe('useHomePageHandlers shortcut sharing + role gates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    folderUtilsMocks.isInvalidFolderMove.mockReturnValue(false);
  });

  it('requests owner approval when moving a shortcut into a shared target folder', () => {
    const config = createBaseConfig({
      logic: {
        folders: [
          { id: 'shared-target', isShared: true, ownerId: 'owner-2', parentId: null },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    const result = handlers.handleDropOnFolderWrapper('shared-target', 'subject-1', 'subject', null, 'shortcut-1');

    expect(result).toBe(true);
    expect(config.setShareConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        type: 'shortcut-move-request',
        requestedShortcutType: 'subject',
        requestedShortcutId: 'shortcut-1',
        requestedTargetId: 'subject-1',
      })
    );
    expect(config.logic.moveShortcut).not.toHaveBeenCalled();
  });

  it('blocks viewer from moving a subject into a shared target folder', () => {
    const config = createBaseConfig({
      currentUserId: 'viewer-1',
      logic: {
        folders: [
          { id: 'source-folder', isShared: false, parentId: null },
          { id: 'shared-target', isShared: true, ownerId: 'owner-2', editorUids: [], parentId: null, sharedWithUids: [] },
        ],
        subjects: [
          { id: 'subject-1', ownerId: 'owner-2', folderId: 'source-folder', sharedWithUids: [] },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    const result = handlers.handleDropOnFolderWrapper('shared-target', 'subject-1', 'subject', 'source-folder', null);

    expect(result).toBe(true);
    expect(config.moveSubjectBetweenFolders).not.toHaveBeenCalled();
  });

  it('allows editor to move a subject into a shared target folder', () => {
    const config = createBaseConfig({
      currentUserId: 'editor-1',
      logic: {
        folders: [
          { id: 'source-folder', isShared: false, parentId: null },
          {
            id: 'shared-target',
            isShared: true,
            ownerId: 'owner-2',
            editorUids: ['editor-1'],
            parentId: null,
            sharedWithUids: [],
          },
        ],
        subjects: [
          {
            id: 'subject-1',
            ownerId: 'owner-2',
            folderId: 'source-folder',
            sharedWithUids: [],
            sharedWith: [],
          },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    const result = handlers.handleDropOnFolderWrapper('shared-target', 'subject-1', 'subject', 'source-folder', null);

    expect(result).toBe(true);
    expect(config.moveSubjectBetweenFolders).toHaveBeenCalledWith('subject-1', 'source-folder', 'shared-target');
  });

  it('executes merge callback for shared mismatch move into shared target', async () => {
    const config = createBaseConfig({
      currentUserId: 'owner-1',
      logic: {
        folders: [
          {
            id: 'source-folder',
            isShared: true,
            ownerId: 'owner-1',
            parentId: null,
            sharedWithUids: ['u-alpha'],
            sharedWith: [{ uid: 'u-alpha', email: 'alpha@test.com' }],
          },
          {
            id: 'shared-target',
            isShared: true,
            ownerId: 'owner-1',
            parentId: null,
            sharedWithUids: ['u-beta'],
            sharedWith: [{ uid: 'u-beta', email: 'beta@test.com' }],
          },
        ],
        subjects: [
          {
            id: 'subject-1',
            ownerId: 'owner-1',
            folderId: 'source-folder',
            sharedWithUids: ['u-alpha'],
            sharedWith: [{ uid: 'u-alpha', email: 'alpha@test.com' }],
          },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    const result = handlers.handleDropOnFolderWrapper('shared-target', 'subject-1', 'subject', 'source-folder', null);

    expect(result).toBe(true);
    expect(config.setShareConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        type: 'shared-mismatch-move',
      })
    );

    const confirmPayload = config.setShareConfirm.mock.calls[0][0];
    await confirmPayload.onMergeConfirm();

    expect(config.updateFolder).toHaveBeenCalledWith(
      'shared-target',
      expect.objectContaining({
        isShared: true,
        sharedWithUids: expect.arrayContaining(['u-alpha', 'u-beta']),
      })
    );
    expect(config.moveSubjectBetweenFolders).toHaveBeenCalledWith(
      'subject-1',
      'source-folder',
      'shared-target',
      { forceRefreshSharing: true }
    );
  });

  it('executes preserve-sharing callback for unshare confirmation path', async () => {
    const config = createBaseConfig({
      currentUserId: 'owner-1',
      logic: {
        folders: [
          {
            id: 'source-folder',
            isShared: true,
            ownerId: 'owner-1',
            parentId: null,
            sharedWithUids: ['u-alpha'],
            sharedWith: [{ uid: 'u-alpha', email: 'alpha@test.com' }],
          },
          {
            id: 'target-private',
            isShared: false,
            ownerId: 'owner-1',
            parentId: null,
            sharedWithUids: [],
            sharedWith: [],
          },
        ],
        subjects: [
          {
            id: 'subject-1',
            ownerId: 'owner-1',
            folderId: 'source-folder',
            sharedWithUids: ['u-alpha'],
            sharedWith: [{ uid: 'u-alpha', email: 'alpha@test.com' }],
          },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    const result = handlers.handleDropOnFolderWrapper('target-private', 'subject-1', 'subject', 'source-folder', null);

    expect(result).toBe(true);
    expect(config.setUnshareConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        subjectId: 'subject-1',
      })
    );

    const unsharePayload = config.setUnshareConfirm.mock.calls[0][0];
    await unsharePayload.onPreserveConfirm();

    expect(config.moveSubjectBetweenFolders).toHaveBeenCalledWith(
      'subject-1',
      'source-folder',
      'target-private',
      { preserveSharing: true }
    );
  });

  it('executes standard unshare confirm callback for source shared -> private target move', async () => {
    const config = createBaseConfig({
      currentUserId: 'owner-1',
      logic: {
        folders: [
          {
            id: 'source-folder',
            isShared: true,
            ownerId: 'owner-1',
            parentId: null,
            sharedWithUids: ['u-alpha'],
            sharedWith: [{ uid: 'u-alpha', email: 'alpha@test.com' }],
          },
          {
            id: 'target-private',
            isShared: false,
            ownerId: 'owner-1',
            parentId: null,
            sharedWithUids: [],
            sharedWith: [],
          },
        ],
        subjects: [
          {
            id: 'subject-1',
            ownerId: 'owner-1',
            folderId: 'source-folder',
            sharedWithUids: ['u-alpha'],
            sharedWith: [{ uid: 'u-alpha', email: 'alpha@test.com' }],
          },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    handlers.handleDropOnFolderWrapper('target-private', 'subject-1', 'subject', 'source-folder', null);

    const unsharePayload = config.setUnshareConfirm.mock.calls[0][0];
    await unsharePayload.onConfirm();

    expect(config.moveSubjectBetweenFolders).toHaveBeenCalledWith('subject-1', 'source-folder', 'target-private');
  });

  it('opens shortcut move request overlay when breadcrumb drops folder shortcut into shared target', () => {
    const config = createBaseConfig({
      logic: {
        currentFolder: { id: 'source-folder', parentId: null, isShared: false, ownerId: 'owner-1' },
        folders: [
          { id: 'source-folder', parentId: null, isShared: false, ownerId: 'owner-1' },
          { id: 'shared-target', parentId: null, isShared: true, ownerId: 'owner-2', editorUids: [] },
        ],
        shortcuts: [
          { id: 'shortcut-folder-1', targetType: 'folder', targetId: 'folder-source', parentId: 'source-folder' },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    const result = handlers.handleBreadcrumbDrop('shared-target', null, 'folder-source', 'shortcut-folder-1', null);

    expect(result).toBe(true);
    expect(config.setShareConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        type: 'shortcut-move-request',
        requestedShortcutType: 'folder',
        requestedShortcutId: 'shortcut-folder-1',
      })
    );
    expect(config.moveFolderToParent).not.toHaveBeenCalled();
  });

  it('handles breadcrumb shared mismatch folder move with merge confirmation callback', async () => {
    const config = createBaseConfig({
      currentUserId: 'owner-1',
      logic: {
        currentFolder: { id: 'source-parent', parentId: null, isShared: false, ownerId: 'owner-1' },
        folders: [
          { id: 'source-parent', parentId: null, isShared: false, ownerId: 'owner-1' },
          {
            id: 'folder-source',
            parentId: 'source-parent',
            isShared: true,
            ownerId: 'owner-1',
            sharedWithUids: ['u-alpha'],
            sharedWith: [{ uid: 'u-alpha', email: 'alpha@test.com' }],
          },
          {
            id: 'shared-target',
            parentId: null,
            isShared: true,
            ownerId: 'owner-1',
            sharedWithUids: ['u-beta'],
            sharedWith: [{ uid: 'u-beta', email: 'beta@test.com' }],
          },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    const result = handlers.handleBreadcrumbDrop('shared-target', null, 'folder-source', null, null);

    expect(result).toBe(true);
    expect(config.setShareConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        type: 'shared-mismatch-move',
        sourceType: 'folder',
      })
    );

    const confirmPayload = config.setShareConfirm.mock.calls[0][0];
    await confirmPayload.onMergeConfirm();

    expect(config.updateFolder).toHaveBeenCalledWith(
      'shared-target',
      expect.objectContaining({
        isShared: true,
        sharedWithUids: expect.arrayContaining(['u-alpha', 'u-beta']),
      })
    );
    expect(config.moveFolderToParent).toHaveBeenCalledWith('folder-source', 'source-parent', 'shared-target');
  });

  it('opens unshare overlay when promoting subject out of shared folder and supports preserve callback', async () => {
    const config = createBaseConfig({
      currentUserId: 'owner-1',
      logic: {
        currentFolder: {
          id: 'shared-source',
          parentId: 'private-parent',
          isShared: true,
          ownerId: 'owner-1',
          sharedWithUids: ['u-alpha'],
          sharedWith: [{ uid: 'u-alpha', email: 'alpha@test.com' }],
        },
        folders: [
          {
            id: 'shared-source',
            parentId: 'private-parent',
            isShared: true,
            ownerId: 'owner-1',
            sharedWithUids: ['u-alpha'],
            sharedWith: [{ uid: 'u-alpha', email: 'alpha@test.com' }],
          },
          {
            id: 'private-parent',
            parentId: null,
            isShared: false,
            ownerId: 'owner-1',
            sharedWithUids: [],
            sharedWith: [],
          },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    await handlers.handlePromoteSubjectWrapper('subject-1');

    expect(config.setUnshareConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        subjectId: 'subject-1',
      })
    );

    const unsharePayload = config.setUnshareConfirm.mock.calls[0][0];
    await unsharePayload.onPreserveConfirm();

    expect(config.moveSubjectBetweenFolders).toHaveBeenCalledWith(
      'subject-1',
      'shared-source',
      'private-parent',
      { preserveSharing: true }
    );
  });

  it('blocks viewer inside shared folder from promoting a subject shortcut upward', async () => {
    const config = createBaseConfig({
      currentUserId: 'viewer-1',
      logic: {
        currentFolder: {
          id: 'shared-source',
          parentId: 'private-parent',
          isShared: true,
          ownerId: 'owner-1',
          editorUids: [],
          sharedWithUids: ['viewer-1'],
        },
      },
    });

    const handlers = useHomePageHandlers(config);
    await handlers.handlePromoteSubjectWrapper('subject-1', 'shortcut-subject-1');

    expect(config.logic.moveShortcut).not.toHaveBeenCalled();
    expect(config.moveSubjectToParent).not.toHaveBeenCalled();
    expect(config.moveSubjectBetweenFolders).not.toHaveBeenCalled();
  });

  it('blocks drop when user cannot write into shared target folder', () => {
    const config = createBaseConfig({
      currentUserId: 'viewer-1',
      logic: {
        folders: [
          {
            id: 'shared-target',
            isShared: true,
            ownerId: 'owner-1',
            editorUids: [],
            sharedWithUids: ['viewer-1'],
            parentId: null,
          },
        ],
        subjects: [
          {
            id: 'subject-1',
            ownerId: 'viewer-1',
            folderId: null,
            sharedWithUids: [],
          },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    const result = handlers.handleDropOnFolderWrapper('shared-target', 'subject-1', 'subject', null, null);

    expect(result).toBe(true);
    expect(config.moveSubjectBetweenFolders).not.toHaveBeenCalled();
    expect(config.logic.moveShortcut).not.toHaveBeenCalled();
  });

  it('blocks drop when user cannot write from shared source folder', () => {
    const config = createBaseConfig({
      currentUserId: 'viewer-1',
      logic: {
        folders: [
          {
            id: 'source-shared',
            isShared: true,
            ownerId: 'owner-1',
            editorUids: [],
            sharedWithUids: ['viewer-1'],
            parentId: null,
          },
          {
            id: 'target-private',
            isShared: false,
            ownerId: 'owner-1',
            parentId: null,
          },
        ],
        subjects: [
          {
            id: 'subject-1',
            ownerId: 'viewer-1',
            folderId: 'source-shared',
            sharedWithUids: ['viewer-1'],
          },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    const result = handlers.handleDropOnFolderWrapper('target-private', 'subject-1', 'subject', 'source-shared', null);

    expect(result).toBe(true);
    expect(config.moveSubjectBetweenFolders).not.toHaveBeenCalled();
    expect(config.logic.moveShortcut).not.toHaveBeenCalled();
  });

  it('blocks editor from moving subject out of root shared boundary', () => {
    const config = createBaseConfig({
      currentUserId: 'editor-1',
      logic: {
        folders: [
          {
            id: 'root-shared',
            isShared: true,
            ownerId: 'owner-1',
            editorUids: ['editor-1'],
            sharedWithUids: ['editor-1'],
            parentId: null,
          },
          {
            id: 'child-source',
            isShared: false,
            ownerId: 'owner-1',
            parentId: 'root-shared',
          },
          {
            id: 'outside-target',
            isShared: false,
            ownerId: 'owner-1',
            parentId: null,
          },
        ],
        subjects: [
          {
            id: 'subject-1',
            ownerId: 'owner-1',
            folderId: 'child-source',
            sharedWithUids: ['editor-1'],
          },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    const result = handlers.handleDropOnFolderWrapper('outside-target', 'subject-1', 'subject', 'child-source', null);

    expect(result).toBe(true);
    expect(config.moveSubjectBetweenFolders).not.toHaveBeenCalled();
  });

  it('blocks breadcrumb folder move when folder move is invalid/circular', () => {
    folderUtilsMocks.isInvalidFolderMove.mockReturnValue(true);

    const config = createBaseConfig({
      logic: {
        currentFolder: { id: 'source-parent', parentId: null, isShared: false, ownerId: 'owner-1' },
        folders: [
          { id: 'source-parent', parentId: null, isShared: false, ownerId: 'owner-1' },
          { id: 'folder-source', parentId: 'source-parent', isShared: false, ownerId: 'owner-1' },
          { id: 'target-folder', parentId: null, isShared: false, ownerId: 'owner-1' },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    const result = handlers.handleBreadcrumbDrop('target-folder', null, 'folder-source', null, null);

    expect(result).toBe(true);
    expect(config.moveFolderToParent).not.toHaveBeenCalled();
  });

  it('handleNestFolder no-ops when nesting folder into itself', async () => {
    const config = createBaseConfig({
      logic: {
        currentFolder: { id: 'root', parentId: null, isShared: false, ownerId: 'owner-1' },
        folders: [
          { id: 'folder-1', parentId: 'root', isShared: false, ownerId: 'owner-1' },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    await handlers.handleNestFolder('folder-1', 'folder-1', null);

    expect(config.moveFolderToParent).not.toHaveBeenCalled();
    expect(config.logic.moveShortcut).not.toHaveBeenCalled();
  });

  it('handleNestFolder blocks non-owner from nesting source folder', async () => {
    const config = createBaseConfig({
      currentUserId: 'viewer-1',
      logic: {
        currentFolder: { id: 'root', parentId: null, isShared: false, ownerId: 'owner-1' },
        folders: [
          { id: 'folder-1', parentId: 'root', isShared: false, ownerId: 'owner-1', editorUids: [] },
          { id: 'target', parentId: null, isShared: false, ownerId: 'owner-1' },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    await handlers.handleNestFolder('target', 'folder-1', null);

    expect(config.moveFolderToParent).not.toHaveBeenCalled();
    expect(config.logic.moveShortcut).not.toHaveBeenCalled();
  });

  it('handlePromoteFolderWrapper blocks non-owner/non-editor source folder', async () => {
    const config = createBaseConfig({
      currentUserId: 'viewer-1',
      logic: {
        currentFolder: { id: 'parent-folder', parentId: null, isShared: false, ownerId: 'owner-1' },
        folders: [
          { id: 'folder-1', parentId: 'parent-folder', isShared: false, ownerId: 'owner-1', editorUids: [] },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    await handlers.handlePromoteFolderWrapper('folder-1', null);

    expect(config.moveFolderToParent).not.toHaveBeenCalled();
  });

  it('handleTreeMoveSubject falls back to moving shortcut when source edit is denied', async () => {
    const config = createBaseConfig({
      currentUserId: 'viewer-1',
      logic: {
        currentFolder: null,
        folders: [
          {
            id: 'source-regular',
            isShared: false,
            ownerId: 'owner-1',
            editorUids: [],
            sharedWithUids: ['viewer-1'],
            parentId: null,
          },
          {
            id: 'target-private',
            isShared: false,
            ownerId: 'owner-1',
            parentId: null,
          },
        ],
        subjects: [
          {
            id: 'subject-1',
            ownerId: 'owner-1',
            folderId: 'source-regular',
            sharedWithUids: ['viewer-1'],
          },
        ],
        shortcuts: [
          {
            id: 'shortcut-subject-1',
            targetId: 'subject-1',
            targetType: 'subject',
            parentId: 'source-regular',
          },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    await handlers.handleTreeMoveSubject('subject-1', 'target-private', 'source-regular');

    expect(config.logic.moveShortcut).toHaveBeenCalledWith('shortcut-subject-1', 'target-private');
    expect(config.moveSubjectBetweenFolders).not.toHaveBeenCalled();
  });

  it('handleTreeMoveSubject blocks mutation when source edit denied and no shortcut exists', async () => {
    const config = createBaseConfig({
      currentUserId: 'viewer-1',
      logic: {
        currentFolder: null,
        folders: [
          {
            id: 'source-shared',
            isShared: true,
            ownerId: 'owner-1',
            editorUids: [],
            sharedWithUids: ['viewer-1'],
            parentId: null,
          },
          {
            id: 'target-private',
            isShared: false,
            ownerId: 'owner-1',
            parentId: null,
          },
        ],
        subjects: [
          {
            id: 'subject-1',
            ownerId: 'owner-1',
            folderId: 'source-shared',
            sharedWithUids: ['viewer-1'],
          },
        ],
        shortcuts: [],
      },
    });

    const handlers = useHomePageHandlers(config);
    await handlers.handleTreeMoveSubject('subject-1', 'target-private', 'source-shared');

    expect(config.logic.moveShortcut).not.toHaveBeenCalled();
    expect(config.moveSubjectBetweenFolders).not.toHaveBeenCalled();
  });

  it('handleNavigateFromTree persists folder selection and clears it on root navigation', () => {
    const config = createBaseConfig({
      rememberOrganization: true,
    });

    const handlers = useHomePageHandlers(config);

    handlers.handleNavigateFromTree({ id: 'folder-a', name: 'Folder A' });
    handlers.handleNavigateFromTree(null);

    expect(config.logic.setCurrentFolder).toHaveBeenCalledWith(expect.objectContaining({ id: 'folder-a' }));
    expect(persistenceMocks.saveLastHomeFolderId).toHaveBeenCalledWith('folder-a');
    expect(config.logic.setCurrentFolder).toHaveBeenCalledWith(null);
    expect(persistenceMocks.clearLastHomeFolderId).toHaveBeenCalled();
  });

  it('moves breadcrumb folder directly in non-shared source/target path', () => {
    const config = createBaseConfig({
      currentUserId: 'owner-1',
      logic: {
        currentFolder: { id: 'source-parent', parentId: null, isShared: false, ownerId: 'owner-1' },
        folders: [
          { id: 'source-parent', parentId: null, isShared: false, ownerId: 'owner-1' },
          { id: 'folder-source', parentId: 'source-parent', isShared: false, ownerId: 'owner-1' },
          { id: 'target-private', parentId: null, isShared: false, ownerId: 'owner-1' },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    const result = handlers.handleBreadcrumbDrop('target-private', null, 'folder-source', null, null);

    expect(result).toBe(true);
    expect(config.moveFolderToParent).toHaveBeenCalledWith('folder-source', 'source-parent', 'target-private');
    expect(config.setShareConfirm).not.toHaveBeenCalled();
    expect(config.setUnshareConfirm).not.toHaveBeenCalled();
  });

  it('unshares breadcrumb folder when moving from shared parent tree to private target', async () => {
    const config = createBaseConfig({
      currentUserId: 'owner-1',
      logic: {
        currentFolder: { id: 'source-parent', parentId: null, isShared: false, ownerId: 'owner-1' },
        folders: [
          { id: 'source-parent', parentId: null, isShared: false, ownerId: 'owner-1' },
          {
            id: 'shared-parent',
            parentId: null,
            isShared: true,
            ownerId: 'owner-1',
            sharedWithUids: ['viewer-1'],
          },
          {
            id: 'folder-source',
            parentId: 'shared-parent',
            isShared: true,
            ownerId: 'owner-1',
            sharedWithUids: ['viewer-1'],
          },
          { id: 'target-private', parentId: null, isShared: false, ownerId: 'owner-1' },
        ],
        subjects: [
          {
            id: 'subject-inside-folder',
            folderId: 'folder-source',
            sharedWith: [{ uid: 'viewer-1', email: 'viewer1@test.com' }],
            sharedWithUids: ['viewer-1'],
          },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    const result = handlers.handleBreadcrumbDrop('target-private', null, 'folder-source', null, null);

    expect(result).toBe(true);
    expect(config.setUnshareConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        subjectId: null,
        folder: expect.objectContaining({ id: 'folder-source' }),
      })
    );

    const unsharePayload = config.setUnshareConfirm.mock.calls[0][0];
    await unsharePayload.onConfirm();

    expect(config.updateFolder).toHaveBeenCalledWith(
      'folder-source',
      expect.objectContaining({
        sharedWith: [],
        sharedWithUids: [],
        isShared: false,
      })
    );
    expect(config.moveFolderToParent).toHaveBeenCalledWith('folder-source', 'shared-parent', 'target-private');
  });

  it('unshares nested folder when handleNestFolder moves shared child into private target', async () => {
    const config = createBaseConfig({
      currentUserId: 'owner-1',
      logic: {
        currentFolder: { id: 'source-parent', parentId: null, isShared: false, ownerId: 'owner-1' },
        folders: [
          {
            id: 'shared-parent',
            parentId: null,
            isShared: true,
            ownerId: 'owner-1',
            sharedWithUids: ['viewer-1'],
          },
          {
            id: 'folder-source',
            parentId: 'shared-parent',
            isShared: true,
            ownerId: 'owner-1',
            editorUids: ['owner-1'],
            sharedWithUids: ['viewer-1'],
          },
          { id: 'target-private', parentId: null, isShared: false, ownerId: 'owner-1' },
        ],
        subjects: [
          {
            id: 'subject-inside-folder',
            folderId: 'folder-source',
            sharedWith: [{ uid: 'viewer-1', email: 'viewer1@test.com' }],
            sharedWithUids: ['viewer-1'],
          },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    await handlers.handleNestFolder('target-private', 'folder-source', null);

    expect(config.setUnshareConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ open: true, folder: expect.objectContaining({ id: 'folder-source' }) })
    );

    const unsharePayload = config.setUnshareConfirm.mock.calls[0][0];
    await unsharePayload.onConfirm();

    expect(config.updateFolder).toHaveBeenCalledWith(
      'folder-source',
      expect.objectContaining({ sharedWithUids: [], isShared: false })
    );
    expect(config.moveFolderToParent).toHaveBeenCalledWith('folder-source', 'shared-parent', 'target-private');
  });

  it('unshares folder when promote wrapper exits shared tree into private parent', async () => {
    const config = createBaseConfig({
      currentUserId: 'owner-1',
      logic: {
        currentFolder: {
          id: 'shared-current',
          parentId: 'private-parent',
          isShared: true,
          ownerId: 'owner-1',
          sharedWithUids: ['viewer-1'],
        },
        folders: [
          {
            id: 'shared-current',
            parentId: 'private-parent',
            isShared: true,
            ownerId: 'owner-1',
            sharedWithUids: ['viewer-1'],
          },
          {
            id: 'folder-to-promote',
            parentId: 'shared-current',
            isShared: false,
            ownerId: 'owner-1',
            editorUids: ['owner-1'],
          },
          { id: 'private-parent', parentId: null, isShared: false, ownerId: 'owner-1' },
        ],
        subjects: [
          {
            id: 'subject-in-promoted-folder',
            folderId: 'folder-to-promote',
            sharedWith: [{ uid: 'viewer-1', email: 'viewer1@test.com' }],
            sharedWithUids: ['viewer-1'],
          },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    await handlers.handlePromoteFolderWrapper('folder-to-promote', null);

    expect(config.setUnshareConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ open: true, folder: expect.objectContaining({ id: 'shared-current' }) })
    );

    const unsharePayload = config.setUnshareConfirm.mock.calls[0][0];
    await unsharePayload.onConfirm();

    expect(config.updateFolder).toHaveBeenCalledWith(
      'folder-to-promote',
      expect.objectContaining({ sharedWithUids: [], isShared: false })
    );
    expect(config.moveFolderToParent).toHaveBeenCalledWith('folder-to-promote', 'shared-current', 'private-parent');
  });

  it('moves subject directly between non-shared folders without share prompts', () => {
    const config = createBaseConfig({
      currentUserId: 'owner-1',
      logic: {
        folders: [
          { id: 'source-private', isShared: false, ownerId: 'owner-1', parentId: null },
          { id: 'target-private', isShared: false, ownerId: 'owner-1', parentId: null },
        ],
        subjects: [
          {
            id: 'subject-private-1',
            ownerId: 'owner-1',
            folderId: 'source-private',
            sharedWithUids: [],
            sharedWith: [],
          },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    const result = handlers.handleDropOnFolderWrapper('target-private', 'subject-private-1', 'subject', 'source-private', null);

    expect(result).toBe(true);
    expect(config.moveSubjectBetweenFolders).toHaveBeenCalledWith('subject-private-1', 'source-private', 'target-private');
    expect(config.setShareConfirm).not.toHaveBeenCalled();
    expect(config.setUnshareConfirm).not.toHaveBeenCalled();
  });

  it('moves shortcut only and does not mutate source subject when shortcut drag is used', () => {
    const config = createBaseConfig({
      logic: {
        folders: [
          { id: 'target-private', isShared: false, parentId: null, ownerId: 'owner-1' },
        ],
        subjects: [
          {
            id: 'subject-1',
            ownerId: 'owner-2',
            folderId: 'source-folder',
            sharedWithUids: ['viewer-1'],
          },
        ],
      },
      currentUserId: 'viewer-1',
    });

    const handlers = useHomePageHandlers(config);
    const result = handlers.handleDropOnFolderWrapper(
      'target-private',
      'subject-1',
      'subject',
      'source-folder',
      'shortcut-subject-1'
    );

    expect(result).toBe(true);
    expect(config.logic.moveShortcut).toHaveBeenCalledWith('shortcut-subject-1', 'target-private');
    expect(config.moveSubjectBetweenFolders).not.toHaveBeenCalled();
    expect(config.moveSubjectToParent).not.toHaveBeenCalled();
  });

  it('blocks non-editor from moving subject out of shared source folder (owner mismatch)', () => {
    const config = createBaseConfig({
      currentUserId: 'viewer-1',
      logic: {
        folders: [
          {
            id: 'source-shared',
            isShared: true,
            ownerId: 'owner-1',
            parentId: null,
            editorUids: [],
            sharedWithUids: ['viewer-1'],
          },
          {
            id: 'target-private',
            isShared: false,
            ownerId: 'owner-1',
            parentId: null,
          },
        ],
        subjects: [
          {
            id: 'subject-1',
            ownerId: 'owner-1',
            folderId: 'source-shared',
            sharedWithUids: ['viewer-1'],
          },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    const result = handlers.handleDropOnFolderWrapper(
      'target-private',
      'subject-1',
      'subject',
      'source-shared',
      null
    );

    expect(result).toBe(true);
    expect(config.moveSubjectBetweenFolders).not.toHaveBeenCalled();
    expect(config.logic.moveShortcut).not.toHaveBeenCalled();
  });

  it('is idempotent no-op when dropping subject into same folder repeatedly', () => {
    const config = createBaseConfig({
      currentUserId: 'owner-1',
      logic: {
        folders: [
          { id: 'folder-1', isShared: false, ownerId: 'owner-1', parentId: null },
        ],
        subjects: [
          { id: 'subject-1', ownerId: 'owner-1', folderId: 'folder-1', sharedWithUids: [] },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    handlers.handleDropOnFolderWrapper('folder-1', 'subject-1', 'subject', 'folder-1', null);
    handlers.handleDropOnFolderWrapper('folder-1', 'subject-1', 'subject', 'folder-1', null);

    expect(config.moveSubjectBetweenFolders).not.toHaveBeenCalled();
    expect(config.logic.moveShortcut).not.toHaveBeenCalled();
  });

  it('blocks viewer inside shared folder from upward-drop mutation handlers', async () => {
    const config = createBaseConfig({
      currentUserId: 'viewer-1',
      logic: {
        currentFolder: {
          id: 'shared-source',
          parentId: 'parent-1',
          isShared: true,
          ownerId: 'owner-1',
          editorUids: [],
          sharedWithUids: ['viewer-1'],
        },
      },
    });

    const handlers = useHomePageHandlers(config);
    const dragEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: {
        getData: vi.fn((key) => {
          if (key === 'subjectId') return 'subject-1';
          return '';
        }),
      },
    };

    await handlers.handleUpwardDrop(dragEvent);

    expect(dragEvent.preventDefault).not.toHaveBeenCalled();
    expect(dragEvent.stopPropagation).not.toHaveBeenCalled();
    expect(config.moveSubjectToParent).not.toHaveBeenCalled();
    expect(config.moveFolderToParent).not.toHaveBeenCalled();
    expect(config.logic.moveShortcut).not.toHaveBeenCalled();
  });

  it('blocks viewer inside shared folder from promoting folders and tree subject moves', async () => {
    const config = createBaseConfig({
      currentUserId: 'viewer-1',
      logic: {
        currentFolder: {
          id: 'shared-source',
          parentId: 'parent-1',
          isShared: true,
          ownerId: 'owner-1',
          editorUids: [],
          sharedWithUids: ['viewer-1'],
        },
        folders: [
          {
            id: 'folder-1',
            parentId: 'shared-source',
            isShared: false,
            ownerId: 'owner-1',
          },
        ],
        subjects: [
          {
            id: 'subject-1',
            ownerId: 'owner-1',
            folderId: 'shared-source',
          },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);

    await handlers.handlePromoteFolderWrapper('folder-1', null);
    await handlers.handleTreeMoveSubject('subject-1', 'target-folder', 'shared-source');

    expect(config.moveFolderToParent).not.toHaveBeenCalled();
    expect(config.moveSubjectBetweenFolders).not.toHaveBeenCalled();
    expect(config.logic.moveShortcut).not.toHaveBeenCalled();
  });
});
