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
});