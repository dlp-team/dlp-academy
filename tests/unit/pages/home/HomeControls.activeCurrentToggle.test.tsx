// tests/unit/pages/home/HomeControls.activeCurrentToggle.test.jsx
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import HomeControls from '../../../../src/pages/Home/components/HomeControls';

const buildBaseProps = (overrides = {}) => ({
  viewMode: 'courses',
  setViewMode: vi.fn(),
  layoutMode: 'grid',
  setLayoutMode: vi.fn(),
  cardScale: 100,
  setCardScale: vi.fn(),
  allTags: ['matematicas'],
  selectedTags: [],
  setSelectedTags: vi.fn(),
  showOnlyCurrentSubjects: false,
  setShowOnlyCurrentSubjects: vi.fn(),
  coursesAcademicYearFilter: { startYear: '', endYear: '' },
  setCoursesAcademicYearFilter: vi.fn(),
  availableCourseAcademicYears: ['2025-2026', '2024-2025'],
  subjectPeriodFilter: '',
  setSubjectPeriodFilter: vi.fn(),
  availableSubjectPeriods: [
    { value: 'trimester-1', label: 'Trimestre 1' },
    { value: 'trimester-2', label: 'Trimestre 2' },
  ],
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
  hideSharedScopeToggle: false,
  studentMode: false,
  ...overrides,
});

describe('HomeControls active/current subjects toggle', () => {
  it('shows lifecycle toggle in courses mode and persists the change intent', () => {
    const setShowOnlyCurrentSubjects = vi.fn();
    const onPreferenceChange = vi.fn();

    render(
      <HomeControls
        {...buildBaseProps({
          viewMode: 'courses',
          setShowOnlyCurrentSubjects,
          onPreferenceChange,
        })}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Alternar filtro de asignaturas vigentes' }));

    expect(setShowOnlyCurrentSubjects).toHaveBeenCalledWith(true);
    expect(onPreferenceChange).toHaveBeenCalledWith('showOnlyCurrentSubjects', true);
  });

  it('updates subject period filter and persists user preference', () => {
    const setSubjectPeriodFilter = vi.fn();
    const onPreferenceChange = vi.fn();

    render(
      <HomeControls
        {...buildBaseProps({
          viewMode: 'courses',
          setSubjectPeriodFilter,
          onPreferenceChange,
        })}
      />
    );

    fireEvent.change(screen.getByLabelText('Filtrar por periodo academico'), {
      target: { value: 'trimester-2' },
    });

    expect(setSubjectPeriodFilter).toHaveBeenCalledWith('trimester-2');
    expect(onPreferenceChange).toHaveBeenCalledWith('subjectPeriodFilter', 'trimester-2');
  });

  it('hides lifecycle toggle outside usage/courses modes', () => {
    render(<HomeControls {...buildBaseProps({ viewMode: 'grid' })} />);

    expect(screen.queryByRole('button', { name: 'Alternar filtro de asignaturas vigentes' })).toBeNull();
    expect(screen.queryByLabelText('Filtrar por periodo academico')).toBeNull();
  });
});
