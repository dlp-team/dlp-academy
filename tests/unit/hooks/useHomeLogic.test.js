import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useHomeLogic } from '../../../src/pages/Home/hooks/useHomeLogic';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  useSubjects: vi.fn(),
  useFolders: vi.fn(),
  useShortcuts: vi.fn(),
  useUserPreferences: vi.fn(),
  useHomeState: vi.fn(),
  useHomeHandlers: vi.fn(),
  isReadOnlyRole: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
  };
});

vi.mock('../../../src/hooks/useSubjects', () => ({
  useSubjects: mocks.useSubjects,
}));

vi.mock('../../../src/hooks/useFolders', () => ({
  useFolders: mocks.useFolders,
}));

vi.mock('../../../src/hooks/useShortcuts', () => ({
  useShortcuts: mocks.useShortcuts,
}));

vi.mock('../../../src/hooks/useUserPreferences', () => ({
  useUserPreferences: mocks.useUserPreferences,
}));

vi.mock('../../../src/pages/Home/hooks/useHomeState', () => ({
  useHomeState: mocks.useHomeState,
}));

vi.mock('../../../src/pages/Home/hooks/useHomeHandlers', () => ({
  useHomeHandlers: mocks.useHomeHandlers,
}));

vi.mock('../../../src/utils/permissionUtils', async () => {
  const actual = await vi.importActual('../../../src/utils/permissionUtils');
  return {
    ...actual,
    isReadOnlyRole: mocks.isReadOnlyRole,
  };
});

const baseSubjectsPayload = {
  subjects: [{ id: 's1' }],
  loading: false,
  addSubject: vi.fn(),
  updateSubject: vi.fn(),
  deleteSubject: vi.fn(),
  touchSubject: vi.fn(),
  shareSubject: vi.fn(),
  unshareSubject: vi.fn(),
  transferSubjectOwnership: vi.fn(),
};

const baseFoldersPayload = {
  folders: [{ id: 'f1' }],
  loading: false,
  addFolder: vi.fn(),
  updateFolder: vi.fn(),
  deleteFolder: vi.fn(),
  deleteFolderOnly: vi.fn(),
  shareFolder: vi.fn(),
  unshareFolder: vi.fn(),
  transferFolderOwnership: vi.fn(),
  addSubjectToFolder: vi.fn(),
};

const baseShortcutsPayload = {
  shortcuts: [{ id: 'sc1' }],
  loading: false,
  createShortcut: vi.fn(),
  deleteShortcut: vi.fn(),
  moveShortcut: vi.fn(),
  updateShortcutAppearance: vi.fn(),
  setShortcutHiddenInManual: vi.fn(),
  deleteOrphanedShortcuts: vi.fn(),
};

const basePreferencesPayload = {
  preferences: {},
  loading: false,
  updatePreference: vi.fn(),
};

const baseHomeStatePayload = {
  viewMode: 'grid',
  setViewMode: vi.fn(),
  layoutMode: 'comfortable',
  setLayoutMode: vi.fn(),
  cardScale: 1,
  setCardScale: vi.fn(),
  flippedSubjectId: null,
  setFlippedSubjectId: vi.fn(),
  activeMenu: null,
  setActiveMenu: vi.fn(),
  collapsedGroups: {},
  setCollapsedGroups: vi.fn(),
  selectedTags: [],
  setSelectedTags: vi.fn(),
  currentFolder: null,
  setCurrentFolder: vi.fn(),
  activeFilter: 'all',
  setActiveFilter: vi.fn(),
  draggedItem: null,
  setDraggedItem: vi.fn(),
  draggedItemType: null,
  setDraggedItemType: vi.fn(),
  setDropPosition: vi.fn(),
  setManualOrder: vi.fn(),
  subjectModalConfig: { isOpen: false, isEditing: false, data: null },
  setSubjectModalConfig: vi.fn(),
  folderModalConfig: { isOpen: false, isEditing: false, data: null },
  setFolderModalConfig: vi.fn(),
  deleteConfig: { isOpen: false, type: null, item: null },
  setDeleteConfig: vi.fn(),
  groupedContent: { all: [] },
  orderedFolders: [],
  allTags: [],
  filteredFoldersByTags: [],
  filteredFolders: [],
  searchFolders: [],
  searchSubjects: [],
  sharedFolders: [],
  sharedSubjects: [],
  isDragAndDropEnabled: true,
  shortcuts: [{ id: 'resolved-sc1' }],
};

const baseHandlersPayload = {
  handleSaveSubject: vi.fn(),
  handleSaveFolder: vi.fn(),
  handleDelete: vi.fn(),
  handleDeleteFolderAll: vi.fn(),
  handleDeleteFolderOnly: vi.fn(),
  handleSelectSubject: vi.fn(),
  handleOpenFolder: vi.fn(),
  handleShareFolder: vi.fn(),
  toggleGroup: vi.fn(),
  handleFilterChange: vi.fn(),
  handleDragStartSubject: vi.fn(),
  handleDragStartFolder: vi.fn(),
  handleDragEnd: vi.fn(),
  handleDragOverSubject: vi.fn(),
  handleDragOverFolder: vi.fn(),
  handleDropOnFolder: vi.fn(),
  handleNestFolder: vi.fn(),
  handleDropReorderSubject: vi.fn(),
  handleDropReorderFolder: vi.fn(),
  handlePreferenceChange: vi.fn(),
};

describe('useHomeLogic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useSubjects.mockReturnValue(baseSubjectsPayload);
    mocks.useFolders.mockReturnValue(baseFoldersPayload);
    mocks.useShortcuts.mockReturnValue(baseShortcutsPayload);
    mocks.useUserPreferences.mockReturnValue(basePreferencesPayload);
    mocks.useHomeState.mockReturnValue(baseHomeStatePayload);
    mocks.useHomeHandlers.mockReturnValue(baseHandlersPayload);
    mocks.isReadOnlyRole.mockReturnValue(false);
  });

  it('passes read-only shortcut mode to home handlers for student-like roles', () => {
    const user = { uid: 'student-1', role: 'student' };
    mocks.isReadOnlyRole.mockReturnValue(true);

    renderHook(() => useHomeLogic(user));

    expect(mocks.useHomeHandlers).toHaveBeenCalledWith(
      expect.objectContaining({
        studentShortcutTagOnlyMode: true,
      })
    );
  });

  it('exposes share and shortcut functions from composed hooks', () => {
    const user = { uid: 'teacher-1', role: 'teacher' };

    const { result } = renderHook(() => useHomeLogic(user));

    expect(result.current.shareFolder).toBe(baseFoldersPayload.shareFolder);
    expect(result.current.unshareFolder).toBe(baseFoldersPayload.unshareFolder);
    expect(result.current.shareSubject).toBe(baseSubjectsPayload.shareSubject);
    expect(result.current.unshareSubject).toBe(baseSubjectsPayload.unshareSubject);
    expect(result.current.createShortcut).toBe(baseShortcutsPayload.createShortcut);
    expect(result.current.deleteShortcut).toBe(baseShortcutsPayload.deleteShortcut);
    expect(result.current.resolvedShortcuts).toEqual([{ id: 'resolved-sc1' }]);
  });
});