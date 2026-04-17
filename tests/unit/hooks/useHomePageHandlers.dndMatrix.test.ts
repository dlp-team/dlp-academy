// tests/unit/hooks/useHomePageHandlers.dndMatrix.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useHomePageHandlers } from '../../../src/pages/Home/hooks/useHomePageHandlers';

vi.mock('../../../src/firebase/config', () => ({
  db: { __db: 'mock-db' },
}));

const firestoreMocks = vi.hoisted(() => ({
  updateDoc: vi.fn(),
  doc: vi.fn(() => ({ __doc: true })),
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    updateDoc: firestoreMocks.updateDoc,
    doc: firestoreMocks.doc,
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

const createDropEvent = (dataMap = {}) => ({
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  dataTransfer: {
    getData: vi.fn((key) => dataMap[key] || ''),
  },
});

describe('useHomePageHandlers DnD matrix closure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handleUpwardDrop moves subject to parent when source item is direct subject', async () => {
    const config = createBaseConfig({
      logic: {
        currentFolder: { id: 'folder-current', parentId: 'folder-parent', isShared: false, ownerId: 'user-1' },
      },
    });

    const handlers = useHomePageHandlers(config);
    const event = createDropEvent({
      subjectId: 'subject-1',
    });

    await handlers.handleUpwardDrop(event);

    expect(config.moveSubjectToParent).toHaveBeenCalledWith('subject-1', 'folder-current', 'folder-parent');
  });

  it('handleUpwardDrop uses shortcut move path for subject shortcuts', async () => {
    const config = createBaseConfig({
      logic: {
        currentFolder: { id: 'folder-current', parentId: 'folder-parent', isShared: false, ownerId: 'user-1' },
      },
    });

    const handlers = useHomePageHandlers(config);
    const event = createDropEvent({
      subjectId: 'subject-1',
      subjectShortcutId: 'shortcut-sub-1',
    });

    await handlers.handleUpwardDrop(event);

    expect(config.logic.moveShortcut).toHaveBeenCalledWith('shortcut-sub-1', 'folder-parent');
    expect(config.moveSubjectToParent).not.toHaveBeenCalled();
  });

  it('handleNestFolder blocks non-editable source folder move', async () => {
    const config = createBaseConfig({
      currentUserId: 'viewer-1',
      logic: {
        folders: [
          { id: 'folder-source', parentId: null, isShared: false, ownerId: 'owner-9', editorUids: [] },
          { id: 'folder-target', parentId: null, isShared: false, ownerId: 'owner-9', editorUids: [] },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    await handlers.handleNestFolder('folder-target', 'folder-source');

    expect(config.moveFolderToParent).not.toHaveBeenCalled();
  });

  it('handleNestFolder opens shared mismatch confirmation and executes merge callback', async () => {
    const config = createBaseConfig({
      currentUserId: 'owner-1',
      logic: {
        currentFolder: { id: 'folder-parent', parentId: null, isShared: false, ownerId: 'owner-1' },
        folders: [
          {
            id: 'folder-source',
            parentId: 'folder-parent',
            isShared: true,
            ownerId: 'owner-1',
            sharedWithUids: ['u-alpha'],
            sharedWith: [{ uid: 'u-alpha', email: 'alpha@test.com' }],
          },
          {
            id: 'folder-target',
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
    await handlers.handleNestFolder('folder-target', 'folder-source');

    expect(config.setShareConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        type: 'shared-mismatch-move',
      })
    );

    const payload = config.setShareConfirm.mock.calls[0][0];
    await payload.onMergeConfirm();

    expect(config.updateFolder).toHaveBeenCalledWith(
      'folder-target',
      expect.objectContaining({
        sharedWithUids: expect.arrayContaining(['u-alpha', 'u-beta']),
      })
    );
    expect(config.moveFolderToParent).toHaveBeenCalledWith('folder-source', 'folder-parent', 'folder-target');
  });

  it('handlePromoteFolderWrapper uses shortcut path when folder shortcut is provided', async () => {
    const config = createBaseConfig({
      logic: {
        currentFolder: { id: 'folder-current', parentId: 'folder-parent', isShared: false, ownerId: 'owner-1' },
      },
    });

    const handlers = useHomePageHandlers(config);
    await handlers.handlePromoteFolderWrapper('folder-source', 'shortcut-folder-1');

    expect(config.logic.moveShortcut).toHaveBeenCalledWith('shortcut-folder-1', 'folder-parent');
    expect(config.moveFolderToParent).not.toHaveBeenCalled();
  });

  it('handlePromoteFolderWrapper opens unshare confirmation when moving shared folder to private parent', async () => {
    const config = createBaseConfig({
      currentUserId: 'owner-1',
      logic: {
        currentFolder: {
          id: 'shared-folder',
          parentId: 'private-parent',
          isShared: true,
          ownerId: 'owner-1',
          sharedWithUids: ['u-alpha'],
          sharedWith: [{ uid: 'u-alpha', email: 'alpha@test.com' }],
        },
        folders: [
          {
            id: 'folder-child',
            parentId: 'shared-folder',
            isShared: true,
            ownerId: 'owner-1',
            sharedWithUids: ['u-alpha'],
            sharedWith: [{ uid: 'u-alpha', email: 'alpha@test.com' }],
          },
          {
            id: 'shared-folder',
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
          },
        ],
        subjects: [
          {
            id: 'subject-1',
            folderId: 'folder-child',
            sharedWithUids: ['u-alpha'],
            sharedWith: [{ uid: 'u-alpha', email: 'alpha@test.com' }],
          },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    await handlers.handlePromoteFolderWrapper('folder-child');

    expect(config.setUnshareConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        subjectId: null,
      })
    );

    const payload = config.setUnshareConfirm.mock.calls[0][0];
    await payload.onConfirm();

    expect(config.updateFolder).toHaveBeenCalled();
    expect(firestoreMocks.updateDoc).toHaveBeenCalled();
    expect(config.moveFolderToParent).toHaveBeenCalledWith('folder-child', 'shared-folder', 'private-parent');
  });

  it('handleTreeMoveSubject uses shortcut move for non-edit users when shortcut exists', async () => {
    const config = createBaseConfig({
      currentUserId: 'viewer-1',
      logic: {
        subjects: [{ id: 'subject-1', ownerId: 'owner-2', folderId: 'folder-source', sharedWithUids: [] }],
        shortcuts: [
          { id: 'shortcut-sub-1', targetType: 'subject', targetId: 'subject-1', parentId: 'folder-source' },
        ],
        folders: [
          { id: 'folder-source', parentId: null, isShared: false, ownerId: 'owner-2' },
          { id: 'folder-target', parentId: null, isShared: false, ownerId: 'owner-2' },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    await handlers.handleTreeMoveSubject('subject-1', 'folder-target', 'folder-source');

    expect(config.logic.moveShortcut).toHaveBeenCalledWith('shortcut-sub-1', 'folder-target');
    expect(config.moveSubjectBetweenFolders).not.toHaveBeenCalled();
  });

  it('handleTreeMoveSubject moves direct source subject when user can edit', async () => {
    const config = createBaseConfig({
      currentUserId: 'owner-1',
      logic: {
        subjects: [{ id: 'subject-1', ownerId: 'owner-1', folderId: 'folder-source' }],
        folders: [
          { id: 'folder-source', parentId: null, isShared: false, ownerId: 'owner-1' },
          { id: 'folder-target', parentId: null, isShared: false, ownerId: 'owner-1' },
        ],
      },
    });

    const handlers = useHomePageHandlers(config);
    await handlers.handleTreeMoveSubject('subject-1', 'folder-target', 'folder-source');

    expect(config.moveSubjectBetweenFolders).toHaveBeenCalledWith('subject-1', 'folder-source', 'folder-target');
  });
});
