// tests/unit/hooks/useHomeState.academicYearFilter.test.js
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

describe('useHomeState academic-year range filter for courses mode', () => {
  const resolveRelativeIsoDate = (offsetDays = 0) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + offsetDays);
    return date.toISOString().slice(0, 10);
  };

  const resolveCurrentAcademicYear = () => {
    const now = new Date();
    const startYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
    return `${startYear}-${startYear + 1}`;
  };

  const resolvePreviousAcademicYear = () => {
    const currentStart = Number(resolveCurrentAcademicYear().split('-')[0]);
    const previousStart = currentStart - 1;
    return `${previousStart}-${previousStart + 1}`;
  };

  const baseUser = {
    uid: 'teacher-1',
    email: 'teacher@test.com',
    role: 'teacher',
  };

  const subjects = [
    { id: 'subject-2024', name: 'Matematicas I', ownerId: 'teacher-1', course: 'Bachillerato 1º', academicYear: '2024-2025' },
    { id: 'subject-2025-a', name: 'Matematicas II', ownerId: 'teacher-1', course: 'Bachillerato 1º', academicYear: '2025-2026' },
    { id: 'subject-2025-b', name: 'Fisica', ownerId: 'teacher-1', course: 'Bachillerato 2º', academicYear: '2025-2026' },
    { id: 'subject-no-year', name: 'Historia', ownerId: 'teacher-1', course: 'ESO 4º', academicYear: '' },
  ];

  const basePreferences = {
    viewMode: 'courses',
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

  it('lists available academic years and appends year labels when multiple years are visible', () => {
    const { result } = renderHook(() =>
      useHomeState({
        user: baseUser,
        searchQuery: '',
        subjects,
        folders: [],
        preferences: basePreferences,
        loadingPreferences: false,
        updatePreference: vi.fn(),
        rememberOrganization: true,
      })
    );

    expect(result.current.availableCourseAcademicYears).toEqual(['2025-2026', '2024-2025']);

    const groupedKeys = Object.keys(result.current.groupedContent);
    expect(groupedKeys).toContain('Bachillerato 1º (2025-2026)');
    expect(groupedKeys).toContain('Bachillerato 1º (2024-2025)');
  });

  it('filters courses by selected academic-year range and keeps single-year layout labels', () => {
    const { result } = renderHook(() =>
      useHomeState({
        user: baseUser,
        searchQuery: '',
        subjects,
        folders: [],
        preferences: {
          ...basePreferences,
          coursesAcademicYearFilter: {
            startYear: '2025-2026',
            endYear: '2025-2026',
          },
        },
        loadingPreferences: false,
        updatePreference: vi.fn(),
        rememberOrganization: true,
      })
    );

    const groupedKeys = Object.keys(result.current.groupedContent);
    expect(groupedKeys).toEqual(['Bachillerato 1º', 'Bachillerato 2º']);

    expect(result.current.groupedContent['Bachillerato 1º'].map((subject) => subject.id)).toEqual(['subject-2025-a']);
    expect(result.current.groupedContent['Bachillerato 2º'].map((subject) => subject.id)).toEqual(['subject-2025-b']);
  });

  it('filters courses by selected subject period metadata', () => {
    const periodSubjects = [
      {
        id: 'subject-period-1',
        name: 'Quimica',
        ownerId: 'teacher-1',
        course: 'Bachillerato 1º',
        academicYear: '2025-2026',
        periodType: 'trimester',
        periodLabel: 'Trimestre 1',
        periodIndex: 1,
      },
      {
        id: 'subject-period-2',
        name: 'Fisica',
        ownerId: 'teacher-1',
        course: 'Bachillerato 1º',
        academicYear: '2025-2026',
        periodType: 'trimester',
        periodLabel: 'Trimestre 2',
        periodIndex: 2,
      },
      {
        id: 'subject-without-period',
        name: 'Lengua',
        ownerId: 'teacher-1',
        course: 'Bachillerato 2º',
        academicYear: '2025-2026',
      },
    ];

    const { result } = renderHook(() =>
      useHomeState({
        user: baseUser,
        searchQuery: '',
        subjects: periodSubjects,
        folders: [],
        preferences: {
          ...basePreferences,
          viewMode: 'courses',
          subjectPeriodFilter: 'trimester-2',
        },
        loadingPreferences: false,
        updatePreference: vi.fn(),
        rememberOrganization: true,
      })
    );

    expect(result.current.availableSubjectPeriods.map((option) => option.value)).toEqual([
      'trimester-1',
      'trimester-2',
    ]);

    const groupedIds = Object.values(result.current.groupedContent)
      .flat()
      .map((subject) => subject.id)
      .sort();

    expect(groupedIds).toEqual(['subject-period-2']);
  });

  it('keeps only current academic-year subjects in courses mode when active-only filter is enabled', () => {
    const currentAcademicYear = resolveCurrentAcademicYear();
    const previousAcademicYear = resolvePreviousAcademicYear();
    const lifecycleSubjects = [
      { id: 'subject-current', name: 'Lengua', ownerId: 'teacher-1', course: 'ESO 3º', academicYear: currentAcademicYear },
      { id: 'subject-previous', name: 'Biologia', ownerId: 'teacher-1', course: 'ESO 3º', academicYear: previousAcademicYear },
      { id: 'subject-legacy', name: 'Musica', ownerId: 'teacher-1', course: 'ESO 4º', academicYear: '' },
    ];

    const { result } = renderHook(() =>
      useHomeState({
        user: baseUser,
        searchQuery: '',
        subjects: lifecycleSubjects,
        folders: [],
        preferences: {
          ...basePreferences,
          viewMode: 'courses',
          showOnlyCurrentSubjects: true,
        },
        loadingPreferences: false,
        updatePreference: vi.fn(),
        rememberOrganization: true,
      })
    );

    const groupedIds = Object.values(result.current.groupedContent)
      .flat()
      .map((subject) => subject.id)
      .sort();

    expect(groupedIds).toEqual(['subject-current', 'subject-legacy']);
  });

  it('applies active-only lifecycle filtering in usage mode', () => {
    const currentAcademicYear = resolveCurrentAcademicYear();
    const previousAcademicYear = resolvePreviousAcademicYear();

    const { result } = renderHook(() =>
      useHomeState({
        user: baseUser,
        searchQuery: '',
        subjects: [
          { id: 'subject-old', name: 'Historia', ownerId: 'teacher-1', academicYear: previousAcademicYear, updatedAt: { seconds: 20 } },
          { id: 'subject-current', name: 'Fisica', ownerId: 'teacher-1', academicYear: currentAcademicYear, updatedAt: { seconds: 10 } },
        ],
        folders: [],
        preferences: {
          ...basePreferences,
          viewMode: 'usage',
          showOnlyCurrentSubjects: true,
        },
        loadingPreferences: false,
        updatePreference: vi.fn(),
        rememberOrganization: true,
      })
    );

    expect(result.current.groupedContent.Recientes.map((subject) => subject.id)).toEqual(['subject-current']);
  });

  it('hides passed student subjects after ordinary period but before extraordinary close', () => {
    const previousAcademicYear = resolvePreviousAcademicYear();

    const { result } = renderHook(() =>
      useHomeState({
        user: {
          uid: 'student-1',
          email: 'student@test.com',
          role: 'student',
        },
        searchQuery: '',
        subjects: [
          {
            id: 'subject-passed',
            name: 'Algebra',
            ownerId: 'student-1',
            academicYear: previousAcademicYear,
            periodEndAt: resolveRelativeIsoDate(-1),
            periodExtraordinaryEndAt: resolveRelativeIsoDate(10),
            passed: true,
            updatedAt: { seconds: 20 },
          },
          {
            id: 'subject-failed',
            name: 'Historia',
            ownerId: 'student-1',
            academicYear: previousAcademicYear,
            periodEndAt: resolveRelativeIsoDate(-1),
            periodExtraordinaryEndAt: resolveRelativeIsoDate(10),
            passed: false,
            updatedAt: { seconds: 10 },
          },
        ],
        folders: [],
        preferences: {
          ...basePreferences,
          viewMode: 'usage',
          showOnlyCurrentSubjects: true,
        },
        loadingPreferences: false,
        updatePreference: vi.fn(),
        rememberOrganization: true,
      })
    );

    expect(result.current.groupedContent.Recientes.map((subject) => subject.id)).toEqual(['subject-failed']);
  });

  it('keeps teacher subjects visible during extraordinary window', () => {
    const previousAcademicYear = resolvePreviousAcademicYear();

    const { result } = renderHook(() =>
      useHomeState({
        user: {
          ...baseUser,
          role: 'teacher',
        },
        searchQuery: '',
        subjects: [
          {
            id: 'subject-passed',
            name: 'Algebra',
            ownerId: 'teacher-1',
            academicYear: previousAcademicYear,
            periodEndAt: resolveRelativeIsoDate(-1),
            periodExtraordinaryEndAt: resolveRelativeIsoDate(10),
            passed: true,
            updatedAt: { seconds: 20 },
          },
          {
            id: 'subject-failed',
            name: 'Historia',
            ownerId: 'teacher-1',
            academicYear: previousAcademicYear,
            periodEndAt: resolveRelativeIsoDate(-1),
            periodExtraordinaryEndAt: resolveRelativeIsoDate(10),
            passed: false,
            updatedAt: { seconds: 10 },
          },
        ],
        folders: [],
        preferences: {
          ...basePreferences,
          viewMode: 'usage',
          showOnlyCurrentSubjects: true,
        },
        loadingPreferences: false,
        updatePreference: vi.fn(),
        rememberOrganization: true,
      })
    );

    expect(result.current.groupedContent.Recientes.map((subject) => subject.id)).toEqual([
      'subject-passed',
      'subject-failed',
    ]);
  });
});
