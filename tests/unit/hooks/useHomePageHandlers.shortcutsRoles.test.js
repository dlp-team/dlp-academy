import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useHomePageHandlers } from '../../../src/pages/Home/hooks/useHomePageHandlers';

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
});
