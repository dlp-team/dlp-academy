// tests/unit/components/FolderListItem.collapseSpacing.test.jsx
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FolderListItem from '../../../src/components/modules/ListItems/FolderListItem';

vi.mock('../../../src/hooks/useGhostDrag', () => ({
  useGhostDrag: () => ({
    isDragging: false,
    itemRef: null,
    dragHandlers: {
      onDragStart: () => {},
      onDrag: () => {},
      onDragEnd: () => {},
    },
  }),
}));

describe('FolderListItem collapsed children spacing', () => {
  const baseProps = {
    user: { uid: 'user-1', email: 'user-1@test.com' },
    item: { id: 'folder-parent', name: 'Carpeta padre' },
    index: 0,
    parentId: null,
    depth: 0,
    allFolders: [
      { id: 'folder-parent', name: 'Carpeta padre', parentId: null },
      { id: 'folder-child', name: 'Carpeta hija', parentId: 'folder-parent' },
    ],
    allSubjects: [],
    onNavigate: vi.fn(),
    onNavigateSubject: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onShare: vi.fn(),
    onGoToFolder: vi.fn(),
    onDragStart: vi.fn(),
    onDragEnd: vi.fn(),
    onDropAction: vi.fn(),
    draggable: true,
    path: [],
  };

  it('keeps children container clipped when collapsed and restores visible overflow when expanded', () => {
    render(<FolderListItem {...baseProps} />);

    const shell = screen.getByTestId('folder-list-children-shell-folder-parent');
    const content = screen.getByTestId('folder-list-children-content-folder-parent');

    expect(shell.className).toContain('grid-rows-[0fr]');
    expect(content.className).toContain('overflow-hidden');
    expect(content.className).toContain('pb-0');

    fireEvent.click(screen.getByText('Carpeta padre'));

    expect(shell.className).toContain('grid-rows-[1fr]');
    expect(content.className).toContain('overflow-visible');
    expect(content.className).toContain('pb-1');

    fireEvent.click(screen.getByText('Carpeta padre'));

    expect(shell.className).toContain('grid-rows-[0fr]');
    expect(content.className).toContain('overflow-hidden');
    expect(content.className).toContain('pb-0');
  });
});
