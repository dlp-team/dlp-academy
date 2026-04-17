// tests/unit/pages/home/HomeControls.sharedScopeToggle.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import HomeControls from '../../../../src/pages/Home/components/HomeControls';

const buildBaseProps = (overrides = {}) => ({
  viewMode: 'shared',
  setViewMode: vi.fn(),
  layoutMode: 'grid',
  setLayoutMode: vi.fn(),
  cardScale: 100,
  setCardScale: vi.fn(),
  allTags: ['matematicas', 'fisica'],
  selectedTags: [],
  setSelectedTags: vi.fn(),
  currentFolder: null,
  setFolderModalConfig: vi.fn(),
  setCollapsedGroups: vi.fn(),
  setCurrentFolder: vi.fn(),
  isDragAndDropEnabled: false,
  draggedItem: null,
  draggedItemType: null,
  onPreferenceChange: vi.fn(),
  searchQuery: '',
  setSearchQuery: vi.fn(),
  activeFilter: 'all',
  onFilterOverlayChange: vi.fn(),
  onScaleOverlayChange: vi.fn(),
  sharedScopeSelected: true,
  onSharedScopeChange: vi.fn(),
  canCreateFolder: true,
  showSharedTab: true,
  hideSharedScopeToggle: true,
  studentMode: false,
  ...overrides,
});

describe('HomeControls shared scope toggle visibility', () => {
  it('hides shared scope toggle in shared tab context', () => {
    render(<HomeControls {...buildBaseProps({ hideSharedScopeToggle: true })} />);

    fireEvent.click(screen.getByRole('button', { name: /filtrar/i }));

    expect(screen.queryByLabelText('Alternar filtro de compartidos')).toBeNull();
  });

  it('shows shared scope toggle when not hidden', () => {
    render(<HomeControls {...buildBaseProps({ hideSharedScopeToggle: false })} />);

    fireEvent.click(screen.getByRole('button', { name: /filtrar/i }));

    expect(screen.getByLabelText('Alternar filtro de compartidos')).not.toBeNull();
  });
});
