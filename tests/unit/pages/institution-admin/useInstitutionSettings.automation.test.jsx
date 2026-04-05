// tests/unit/pages/institution-admin/useInstitutionSettings.automation.test.jsx
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useInstitutionSettings } from '../../../../src/pages/InstitutionAdminDashboard/hooks/useInstitutionSettings';

const firestoreMocks = vi.hoisted(() => ({
  doc: vi.fn((dbRef, collectionName, docId) => ({
    dbRef,
    collectionName,
    docId,
    path: `${collectionName}/${docId}`,
  })),
  getDoc: vi.fn(),
  updateDoc: vi.fn(async () => {}),
  serverTimestamp: vi.fn(() => '__SERVER_TIMESTAMP__'),
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    doc: (...args) => firestoreMocks.doc(...args),
    getDoc: (...args) => firestoreMocks.getDoc(...args),
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

describe('useInstitutionSettings automation settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads automation settings from institution document with backward-compatible defaults', async () => {
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
    expect(result.current.automationSettings).toEqual({
      transferPromotionEnabled: false,
      subjectLifecycleAutomationEnabled: true,
    });
  });

  it('persists automation settings when saving institution settings', async () => {
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
      }));
    });

    await act(async () => {
      await result.current.handleSaveSettings();
    });

    expect(firestoreMocks.updateDoc).toHaveBeenCalledTimes(1);
    const [, payload] = firestoreMocks.updateDoc.mock.calls[0];

    expect(payload).toMatchObject({
      automationSettings: {
        transferPromotionEnabled: false,
        subjectLifecycleAutomationEnabled: false,
      },
    });
  });
});
