// tests/unit/pages/home/HomeMainContent.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import HomeMainContent from '../../../../src/pages/Home/components/HomeMainContent';

vi.mock('../../../../src/pages/Home/components/BinView', () => ({
  default: () => <div>BinViewMock</div>,
}));

vi.mock('../../../../src/pages/Home/components/SharedView', () => ({
  default: () => <div>SharedViewMock</div>,
}));

vi.mock('../../../../src/pages/Home/components/BreadcrumbNav', () => ({
  default: () => <div>BreadcrumbNavMock</div>,
}));

vi.mock('../../../../src/pages/Home/components/HomeShareConfirmModals', () => ({
  default: () => <div>HomeShareConfirmModalsMock</div>,
}));

vi.mock('../../../../src/pages/Home/components/HomeLoader', () => ({
  default: () => <div>HomeLoaderMock</div>,
}));

vi.mock('../../../../src/pages/Home/components/HomeContent', () => ({
  default: () => <div>HomeContentMock</div>,
}));

vi.mock('../../../../src/pages/Home/components/HomeEmptyState', () => ({
  default: () => <div>HomeEmptyStateMock</div>,
}));

const baseLogic = {
  viewMode: 'grid',
  cardScale: 100,
  layoutMode: 'grid',
  folders: [],
  subjects: [],
  currentFolder: null,
  draggedItem: null,
  draggedItemType: null,
  handleOpenFolder: vi.fn(),
  touchSubject: vi.fn(),
  navigate: vi.fn(),
  activeMenu: null,
  setActiveMenu: vi.fn(),
  flippedSubjectId: null,
  setFlippedSubjectId: vi.fn(),
  setFolderModalConfig: vi.fn(),
  setDeleteConfig: vi.fn(),
  setSubjectModalConfig: vi.fn(),
  loading: false,
  groupedContent: {},
  collapsedGroups: {},
  resolvedShortcuts: [],
  toggleGroup: vi.fn(),
  handleShareFolder: vi.fn(),
  isDragAndDropEnabled: false,
  handleDragStartSubject: vi.fn(),
  handleDragStartFolder: vi.fn(),
  handleDragEnd: vi.fn(),
  handleDragOverSubject: vi.fn(),
  handleDragOverFolder: vi.fn(),
  handleDropReorderSubject: vi.fn(),
  handleDropReorderFolder: vi.fn(),
  activeFilter: 'all',
  selectedTags: [],
};

const baseProps = {
  user: { uid: 'u1' },
  logic: baseLogic,
  isStudentRole: false,
  homeThemeTokens: { mutedTextClass: 'text-slate-500' },
  sharedFolders: [],
  sharedSubjects: [],
  sharedSelectedTags: [],
  effectiveSharedScopeSelected: true,
  shareConfirm: { isOpen: false },
  setShareConfirm: vi.fn(),
  unshareConfirm: { isOpen: false },
  setUnshareConfirm: vi.fn(),
  hasInitialDataLoaded: true,
  effectiveHasContent: false,
  displayedFolders: [],
  isFilterOpen: false,
  isScaleOverlayOpen: false,
  searchQuery: '',
  setSearchQuery: vi.fn(),
  canCreateInManualContext: true,
  selectMode: false,
  selectedItemKeys: new Set(),
  toggleSelectItem: vi.fn(),
  handleSetCurrentFolder: vi.fn(),
  handleBreadcrumbDrop: vi.fn(),
  handleOpenSubjectSharing: vi.fn(),
  handlePromoteSubjectWrapper: vi.fn(),
  handlePromoteFolderWrapper: vi.fn(),
  handleDropOnFolderWrapper: vi.fn(),
  handleNestFolder: vi.fn(),
  handleShowFolderContents: vi.fn(),
  handleTreeMoveSubject: vi.fn(),
  handleOpenTopics: vi.fn(),
  handleCardFocus: vi.fn(),
  getCardVisualState: vi.fn(() => ({ isAnimating: false, isCutPending: false })),
};

describe('HomeMainContent', () => {
  it('renders bin branch when view mode is bin', () => {
    render(<HomeMainContent {...baseProps} logic={{ ...baseLogic, viewMode: 'bin' }} />);
    expect(screen.getByText('BinViewMock')).not.toBeNull();
  });

  it('renders shared branch for non-student shared mode', () => {
    render(<HomeMainContent {...baseProps} logic={{ ...baseLogic, viewMode: 'shared' }} isStudentRole={false} />);
    expect(screen.getByText('SharedViewMock')).not.toBeNull();
  });

  it('renders empty state branch when manual mode has no content', () => {
    render(<HomeMainContent {...baseProps} logic={{ ...baseLogic, viewMode: 'grid' }} effectiveHasContent={false} searchQuery="" />);
    expect(screen.getByText('HomeEmptyStateMock')).not.toBeNull();
  });
});
