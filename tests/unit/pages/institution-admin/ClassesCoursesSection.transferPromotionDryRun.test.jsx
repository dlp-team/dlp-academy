// tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.jsx
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ClassesCoursesSection from '../../../../src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection';

const mocks = vi.hoisted(() => ({
  runTransferPromotionDryRunPreview: vi.fn(async () => ({
    success: true,
    summary: {
      plannedCourseMappings: 2,
    },
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
  }),
}));

vi.mock('../../../../src/pages/InstitutionAdminDashboard/components/TransferPromotionDryRunModal', () => ({
  default: ({ isOpen, onRunDryRun }) => {
    if (!isOpen) return null;
    return (
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
    );
  },
}));

describe('ClassesCoursesSection transfer/promotion dry-run trigger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('opens transfer/promotion modal and delegates dry-run to hook callback', async () => {
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

    await waitFor(() => {
      expect(mocks.runTransferPromotionDryRunPreview).toHaveBeenCalledTimes(1);
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
  });
});
