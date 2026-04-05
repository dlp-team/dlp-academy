// tests/unit/pages/institution-admin/useInstitutionSettings.automation.test.jsx
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useInstitutionSettings } from '../../../../src/pages/InstitutionAdminDashboard/hooks/useInstitutionSettings';

const firestoreMocks = vi.hoisted(() => ({
  collection: vi.fn((dbRef, collectionName) => ({
    dbRef,
    collectionName,
    path: collectionName,
  })),
  where: vi.fn((field, operator, value) => ({ field, operator, value })),
  query: vi.fn((collectionRef, ...filters) => ({ collectionRef, filters })),
  doc: vi.fn((dbRef, collectionName, docId) => ({
    dbRef,
    collectionName,
    docId,
    path: `${collectionName}/${docId}`,
  })),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(async () => {}),
  serverTimestamp: vi.fn(() => '__SERVER_TIMESTAMP__'),
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: (...args) => firestoreMocks.collection(...args),
    where: (...args) => firestoreMocks.where(...args),
    query: (...args) => firestoreMocks.query(...args),
    doc: (...args) => firestoreMocks.doc(...args),
    getDoc: (...args) => firestoreMocks.getDoc(...args),
    getDocs: (...args) => firestoreMocks.getDocs(...args),
    updateDoc: (...args) => firestoreMocks.updateDoc(...args),
    serverTimestamp: (...args) => firestoreMocks.serverTimestamp(...args),
  };
});

vi.mock('../../../../src/firebase/config', () => ({
  db: { __mockDb: true },
}));

const buildSnapshot = (data) => ({
  exists: () => true,
  data: () => data,
});

const buildQuerySnapshot = (docs = []) => ({
  docs: docs.map((entry) => ({
    id: entry.id,
    data: () => entry.data,
  })),
});

describe('useInstitutionSettings automation settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firestoreMocks.getDocs.mockResolvedValue(buildQuerySnapshot([]));
  });

  it('loads automation settings from institution document with backward-compatible defaults', async () => {
    firestoreMocks.getDocs.mockResolvedValue(
      buildQuerySnapshot([
        { id: 'course-1', data: { name: '2º ESO', institutionId: 'inst-1' } },
        { id: 'course-2', data: { name: '1º ESO', institutionId: 'inst-1' } },
        { id: 'course-3', data: { name: '1º ESO', institutionId: 'inst-1' } },
        { id: 'course-4', data: { name: '2º Bachillerato', institutionId: 'inst-1' } },
      ])
    );

    firestoreMocks.getDoc.mockResolvedValue(
      buildSnapshot({
        academicCalendar: {
          startDate: '2025-09-01',
          ordinaryEndDate: '2026-06-20',
          extraordinaryEndDate: '2026-07-10',
          periodization: {
            mode: 'trimester',
            customLabel: '',
          },
        },
        accessPolicies: {
          teachers: {
            allowTeacherAutonomousSubjectCreation: true,
            canAssignClassesAndStudents: true,
            canDeleteSubjectsWithStudents: false,
          },
        },
        automationSettings: {
          transferPromotionEnabled: false,
        },
      })
    );

    const { result } = renderHook(() => useInstitutionSettings({ institutionId: 'inst-1' }, null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.settingsForm.transferPromotionEnabled).toBe(false);
    expect(result.current.settingsForm.subjectLifecycleAutomationEnabled).toBe(true);
    expect(result.current.settingsForm.coursePromotionOrder).toEqual([
      '2º Bachillerato',
      '2º ESO',
      '1º ESO',
    ]);
    expect(result.current.automationSettings).toEqual({
      transferPromotionEnabled: false,
      subjectLifecycleAutomationEnabled: true,
    });
  });

  it('persists automation settings when saving institution settings', async () => {
    firestoreMocks.getDocs.mockResolvedValue(
      buildQuerySnapshot([
        { id: 'course-1', data: { name: '2º ESO', institutionId: 'inst-1' } },
        { id: 'course-2', data: { name: '1º ESO', institutionId: 'inst-1' } },
      ])
    );

    firestoreMocks.getDoc.mockResolvedValue(
      buildSnapshot({
        academicCalendar: {
          startDate: '2025-09-01',
          ordinaryEndDate: '2026-06-20',
          extraordinaryEndDate: '2026-07-10',
          periodization: {
            mode: 'trimester',
            customLabel: '',
          },
        },
        accessPolicies: {
          teachers: {
            allowTeacherAutonomousSubjectCreation: true,
            canAssignClassesAndStudents: true,
            canDeleteSubjectsWithStudents: false,
          },
        },
        courseLifecycle: {
          postCoursePolicy: 'retain_all_no_join',
          coursePromotionOrder: ['2º ESO', '1º ESO'],
        },
        automationSettings: {
          transferPromotionEnabled: true,
          subjectLifecycleAutomationEnabled: true,
        },
      })
    );

    const { result } = renderHook(() => useInstitutionSettings({ institutionId: 'inst-1' }, null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setSettingsForm((previous) => ({
        ...previous,
        transferPromotionEnabled: false,
        subjectLifecycleAutomationEnabled: false,
        coursePromotionOrder: ['1º ESO', '2º ESO', '1º ESO'],
      }));
    });

    await act(async () => {
      await result.current.handleSaveSettings();
    });

    expect(firestoreMocks.updateDoc).toHaveBeenCalledTimes(1);
    const [, payload] = firestoreMocks.updateDoc.mock.calls[0];

    expect(payload).toMatchObject({
      courseLifecycle: {
        postCoursePolicy: 'retain_all_no_join',
        coursePromotionOrder: ['1º ESO', '2º ESO'],
      },
      automationSettings: {
        transferPromotionEnabled: false,
        subjectLifecycleAutomationEnabled: false,
      },
    });
  });

  it('merges persisted promotion order with active courses preserving configured precedence', async () => {
    firestoreMocks.getDocs.mockResolvedValue(
      buildQuerySnapshot([
        { id: 'course-1', data: { name: '3º ESO', institutionId: 'inst-1' } },
        { id: 'course-2', data: { name: '2º ESO', institutionId: 'inst-1' } },
        { id: 'course-3', data: { name: '1º ESO', institutionId: 'inst-1' } },
        { id: 'course-4', data: { name: '2º Bachillerato', institutionId: 'inst-1' } },
      ])
    );

    firestoreMocks.getDoc.mockResolvedValue(
      buildSnapshot({
        academicCalendar: {
          startDate: '2025-09-01',
          ordinaryEndDate: '2026-06-20',
          extraordinaryEndDate: '2026-07-10',
          periodization: {
            mode: 'trimester',
            customLabel: '',
          },
        },
        accessPolicies: {
          teachers: {
            allowTeacherAutonomousSubjectCreation: true,
            canAssignClassesAndStudents: true,
            canDeleteSubjectsWithStudents: false,
          },
        },
        courseLifecycle: {
          postCoursePolicy: 'retain_all_no_join',
          coursePromotionOrder: ['2º Bachillerato', '2º ESO'],
        },
      })
    );

    const { result } = renderHook(() => useInstitutionSettings({ institutionId: 'inst-1' }, null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.settingsForm.coursePromotionOrder).toEqual([
      '2º Bachillerato',
      '2º ESO',
      '3º ESO',
      '1º ESO',
    ]);
  });
});
