// tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.jsx
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ClassesCoursesSection from '../../../../src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection';

const mocks = vi.hoisted(() => ({
  runTransferPromotionDryRunPreview: vi.fn(async () => ({
    success: true,
    dryRunPayload: {
      requestId: 'transfer-promote-1',
      institutionId: 'inst-1',
      sourceAcademicYear: '2025-2026',
      targetAcademicYear: '2026-2027',
      mode: 'promote',
    },
    mappings: {
      courses: [],
      classes: [],
      studentAssignments: [],
    },
    rollbackMetadata: {
      rollbackId: 'rollback-1',
      requestId: 'transfer-promote-1',
    },
    summary: {
      plannedCourseMappings: 2,
    },
  })),
  applyTransferPromotionDryRunPlan: vi.fn(async () => ({
    success: true,
    requestId: 'transfer-promote-1',
    rollbackId: 'rollback-1',
  })),
  rollbackTransferPromotionPlanById: vi.fn(async () => ({
    success: true,
    rollbackId: 'rollback-1',
  })),
}));

vi.mock('../../../../src/pages/InstitutionAdminDashboard/hooks/useClassesCourses', () => ({
  useClassesCourses: () => ({
    courses: [
      {
        id: 'course-1',
        name: '1 ESO',
        academicYear: '2025-2026',
        color: '#6366f1',
      },
    ],
    classes: [],
    trashedCourses: [],
    trashedClasses: [],
    loading: false,
    createCourse: vi.fn(),
    updateCourse: vi.fn(),
    deleteCourse: vi.fn(),
    createClass: vi.fn(),
    updateClass: vi.fn(),
    deleteClass: vi.fn(),
    restoreCourse: vi.fn(),
    restoreClass: vi.fn(),
    permanentlyDeleteCourse: vi.fn(),
    permanentlyDeleteClass: vi.fn(),
    runTransferPromotionDryRunPreview: mocks.runTransferPromotionDryRunPreview,
    applyTransferPromotionDryRunPlan: mocks.applyTransferPromotionDryRunPlan,
    rollbackTransferPromotionPlanById: mocks.rollbackTransferPromotionPlanById,
  }),
}));

vi.mock('../../../../src/pages/InstitutionAdminDashboard/components/TransferPromotionDryRunModal', () => ({
  default: ({ isOpen, onRunDryRun, onApplyPlan, onRollbackPlan }) => {
    if (!isOpen) return null;
    return (
      <>
        <button
          type="button"
          onClick={() => onRunDryRun?.({
            sourceAcademicYear: '2025-2026',
            targetAcademicYear: '2026-2027',
            mode: 'promote',
            options: {
              copyStudentLinks: true,
              includeClassMemberships: true,
              preserveVisibility: false,
            },
          })}
        >
          Ejecutar simulación mock
        </button>

        <button
          type="button"
          onClick={() => onApplyPlan?.({
            dryRunPayload: {
              requestId: 'transfer-promote-1',
            },
            mappings: {
              courses: [],
              classes: [],
              studentAssignments: [],
            },
            rollbackMetadata: {
              rollbackId: 'rollback-1',
              requestId: 'transfer-promote-1',
            },
          })}
        >
          Aplicar plan mock
        </button>

        <button
          type="button"
          onClick={() => onRollbackPlan?.({
            rollbackId: 'rollback-1',
          })}
        >
          Ejecutar rollback mock
        </button>
      </>
    );
  },
}));

describe('ClassesCoursesSection transfer/promotion dry-run trigger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('opens transfer/promotion modal and delegates dry-run/apply/rollback callbacks to hook APIs', async () => {
    render(
      <ClassesCoursesSection
        user={{ uid: 'institution-admin-1', institutionId: 'inst-1' }}
        institutionId="inst-1"
        allStudents={[]}
        allTeachers={[]}
        onUploadUsersImportFile={vi.fn()}
        onRunManualCourseLinkCsvImport={vi.fn()}
        onRunUsersImportN8n={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /simular traslado\/promoción/i }));
    fireEvent.click(screen.getByRole('button', { name: /ejecutar simulación mock/i }));
    fireEvent.click(screen.getByRole('button', { name: /aplicar plan mock/i }));
    fireEvent.click(screen.getByRole('button', { name: /ejecutar rollback mock/i }));

    await waitFor(() => {
      expect(mocks.runTransferPromotionDryRunPreview).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mocks.applyTransferPromotionDryRunPlan).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mocks.rollbackTransferPromotionPlanById).toHaveBeenCalledTimes(1);
    });

    expect(mocks.runTransferPromotionDryRunPreview).toHaveBeenCalledWith({
      sourceAcademicYear: '2025-2026',
      targetAcademicYear: '2026-2027',
      mode: 'promote',
      options: {
        copyStudentLinks: true,
        includeClassMemberships: true,
        preserveVisibility: false,
      },
    });

    expect(mocks.applyTransferPromotionDryRunPlan).toHaveBeenCalledWith({
      dryRunPayload: {
        requestId: 'transfer-promote-1',
      },
      mappings: {
        courses: [],
        classes: [],
        studentAssignments: [],
      },
      rollbackMetadata: {
        rollbackId: 'rollback-1',
        requestId: 'transfer-promote-1',
      },
    });

    expect(mocks.rollbackTransferPromotionPlanById).toHaveBeenCalledWith({
      rollbackId: 'rollback-1',
    });
  });

  it('disables transfer/promotion entry point when institution automation toggle is off', () => {
    render(
      <ClassesCoursesSection
        user={{ uid: 'institution-admin-1', institutionId: 'inst-1' }}
        institutionId="inst-1"
        automationSettings={{ transferPromotionEnabled: false }}
        allStudents={[]}
        allTeachers={[]}
        onUploadUsersImportFile={vi.fn()}
        onRunManualCourseLinkCsvImport={vi.fn()}
        onRunUsersImportN8n={vi.fn()}
      />
    );

    const disabledButton = screen.getByRole('button', { name: /traslado\/promoción deshabilitado/i });
    expect(disabledButton.hasAttribute('disabled')).toBe(true);

    fireEvent.click(disabledButton);

    expect(screen.queryByRole('button', { name: /ejecutar simulación mock/i })).toBeNull();
    expect(screen.getByText(/la simulación de traslado\/promoción está deshabilitada/i)).toBeTruthy();
  });
});
