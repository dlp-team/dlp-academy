import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FolderCard from '../../../src/components/modules/FolderCard/FolderCard';
import { useFolderCardLogic } from '../../../src/components/modules/FolderCard/useFolderCardLogic';

vi.mock('../../../src/components/modules/FolderCard/useFolderCardLogic', () => ({
  useFolderCardLogic: vi.fn(),
}));

vi.mock('../../../src/hooks/useGhostDrag', () => ({
  useGhostDrag: () => ({
    isDragging: false,
    itemRef: { current: null },
    dragHandlers: {},
  }),
}));

const mockFolder = {
  id: 'folder-1',
  name: 'Matemáticas',
  description: 'Álgebra',
  color: 'from-amber-400 to-amber-600',
  ownerId: 'user-1',
  cardStyle: 'modern',
  isShared: false,
  tags: [],
};

const baseProps = {
  folder: mockFolder,
  user: { uid: 'user-1', email: 'owner@test.com' },
  onOpen: vi.fn(),
  activeMenu: null,
  onToggleMenu: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onShare: vi.fn(),
  onShowContents: vi.fn(),
  onGoToFolder: vi.fn(),
  isDragging: false,
  canDrop: false,
  draggable: false,
  cardScale: 100,
  allFolders: [],
  allSubjects: [],
};

describe('FolderCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useFolderCardLogic.mockImplementation(({ folder }) => ({
      state: { isOver: false },
      data: {
        isModern: folder.cardStyle === 'modern',
        gradientClass: folder.color,
        fillColor: null,
        scaleMultiplier: 1,
        subjectCount: 0,
        folderCount: 0,
        totalCount: 0,
      },
      handlers: {
        handleDragStart: vi.fn(),
        handleDragEnd: vi.fn(),
        handleDragOver: vi.fn(),
        handleDragLeave: vi.fn(),
        handleDrop: vi.fn(),
      },
    }));
  });

  it('renders folder name', () => {
    render(<FolderCard {...baseProps} />);
    expect(screen.getByText('Matemáticas')).toBeTruthy();
  });

  it('applies different container classes for modern vs classic style', () => {
    const { container, rerender } = render(<FolderCard {...baseProps} folder={{ ...mockFolder, cardStyle: 'modern' }} />);

    const modernContainer = container.querySelector('[class*="rounded-b-2xl"][class*="rounded-tr-2xl"][class*="rounded-tl-none"]');
    expect(modernContainer?.className.includes('p-[4px]')).toBe(true);

    rerender(<FolderCard {...baseProps} folder={{ ...mockFolder, cardStyle: 'classic' }} />);

    const classicContainer = container.querySelector('[class*="rounded-b-2xl"][class*="rounded-tr-2xl"][class*="rounded-tl-none"]');
    expect(classicContainer?.className.includes('p-[4px]')).toBe(false);
  });

  it('clicking share does not trigger open-folder click', () => {
    const onOpen = vi.fn();
    const onShare = vi.fn();

    render(
      <FolderCard
        {...baseProps}
        onOpen={onOpen}
        onShare={onShare}
        activeMenu={mockFolder.id}
      />
    );

    const shareButton = screen.getByRole('button', { name: /compartir/i });
    fireEvent.click(shareButton);

    expect(onShare).toHaveBeenCalledTimes(1);
    expect(onOpen).not.toHaveBeenCalled();
  });
});
