// tests/unit/components/ListViewItem.selectionDimming.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ListViewItem from '../../../src/components/modules/ListViewItem';

const mocks = vi.hoisted(() => ({
  folderListItemSpy: vi.fn(),
}));

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

vi.mock('../../../src/components/modules/ListItems/SubjectListItem', () => ({
  default: ({ subject }) => <div data-testid={`subject-list-item-${subject?.id}`}>{subject?.name}</div>,
}));

vi.mock('../../../src/components/modules/ListItems/FolderListItem', () => ({
  default: (props) => {
    mocks.folderListItemSpy(props);
    return (
      <div
        data-testid={`folder-list-item-${props?.item?.id}`}
        data-dimming={props?.dimmingClass || ''}
      >
        {props?.item?.name}
      </div>
    );
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ListViewItem selection dimming', () => {
  it('dims unselected subject rows when Home selection mode has active selections', () => {
    const { container } = render(
      <ListViewItem
        user={{ uid: 'u1' }}
        item={{ id: 'subject-1', name: 'Historia' }}
        type="subject"
        selectMode={true}
        selectedItemKeys={new Set(['subject:subject-2'])}
        enableSelectionDimming={true}
        onNavigateSubject={() => {}}
        onDropAction={() => {}}
      />
    );

    expect(container.firstChild.className).toContain('brightness-[0.92]');
    expect(container.firstChild.className).toContain('saturate-[0.72]');
  });

  it('keeps selected subject rows highlighted without dimming', () => {
    const { container } = render(
      <ListViewItem
        user={{ uid: 'u1' }}
        item={{ id: 'subject-1', name: 'Historia' }}
        type="subject"
        selectMode={true}
        selectedItemKeys={new Set(['subject:subject-1'])}
        enableSelectionDimming={true}
        onNavigateSubject={() => {}}
        onDropAction={() => {}}
      />
    );

    expect(container.firstChild.className).toContain('ring-4');
    expect(container.firstChild.className).not.toContain('brightness-[0.92]');
  });

  it('passes row-level dimming classes to folder rows without changing folder recursion contract', () => {
    render(
      <ListViewItem
        user={{ uid: 'u1' }}
        item={{ id: 'folder-1', name: 'Carpeta' }}
        type="folder"
        selectMode={true}
        selectedItemKeys={new Set(['folder:folder-2'])}
        enableSelectionDimming={true}
        onNavigate={() => {}}
        onNavigateSubject={() => {}}
        onDropAction={() => {}}
      />
    );

    expect(screen.getByTestId('folder-list-item-folder-1').dataset.dimming).toBe('brightness-[0.92] saturate-[0.72]');
  });
});
