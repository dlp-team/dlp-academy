// tests/unit/hooks/useHomeState.completionTracking.test.js
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useHomeState } from '../../../src/hooks/useHomeState';

const shortcutsState = {
  resolvedShortcuts: [],
  loading: false,
};

vi.mock('../../../src/hooks/useShortcuts', () => ({
  useShortcuts: () => shortcutsState,
}));

vi.mock('../../../src/hooks/usePersistentState', () => ({
  usePersistentState: () => [{}, vi.fn()],
}));

vi.mock('../../../src/pages/Home/utils/homePersistence', () => ({
  clearLastHomeFolderId: vi.fn(),
  loadLastHomeFolderId: vi.fn(() => null),
}));

vi.mock('../../../src/utils/pagePersistence', () => ({
  buildUserScopedPersistenceKey: () => 'home-collapsed-groups-test',
}));

describe('useHomeState subject visibility after history retirement', () => {
  const baseUser = {
    uid: 'teacher-1',
    email: 'teacher@test.com',
    role: 'teacher',
  };

  const subjects = [
    { id: 'subject-active', name: 'Matematicas', ownerId: 'teacher-1', updatedAt: { seconds: 1 } },
    { id: 'subject-completed', name: 'Historia', ownerId: 'teacher-1', updatedAt: { seconds: 2 } },
  ];

  const basePreferences = {
    viewMode: 'grid',
    layoutMode: 'grid',
    cardScale: 100,
    selectedTags: [],
    manualOrder: {
      subjects: [],
      folders: [],
    },
  };

  beforeEach(() => {
    shortcutsState.resolvedShortcuts = [];
  });

  it('keeps completed subjects visible in manual mode', () => {
    const { result } = renderHook(() =>
      useHomeState({
        user: baseUser,
        searchQuery: '',
        subjects,
        folders: [],
        preferences: { ...basePreferences, viewMode: 'grid' },
        loadingPreferences: false,
        updatePreference: vi.fn(),
        rememberOrganization: true,
        completedSubjectIds: ['subject-completed'],
      })
    );

    expect(result.current.groupedContent.Todas).toHaveLength(2);
    expect(result.current.groupedContent.Todas.map((subject) => subject.id)).toEqual([
      'subject-active',
      'subject-completed',
    ]);
  });

  it('falls back to regular grouping when persisted mode is history', () => {
    const { result } = renderHook(() =>
      useHomeState({
        user: baseUser,
        searchQuery: '',
        subjects,
        folders: [],
        preferences: { ...basePreferences, viewMode: 'history' },
        loadingPreferences: false,
        updatePreference: vi.fn(),
        rememberOrganization: true,
        completedSubjectIds: ['subject-completed'],
      })
    );

    expect(result.current.groupedContent.Todas).toHaveLength(2);
    expect(result.current.groupedContent.Todas.map((subject) => subject.id)).toEqual([
      'subject-active',
      'subject-completed',
    ]);
  });
});
