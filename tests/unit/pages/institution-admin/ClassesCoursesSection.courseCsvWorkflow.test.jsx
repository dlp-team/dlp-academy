// tests/unit/pages/institution-admin/ClassesCoursesSection.courseCsvWorkflow.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ClassesCoursesSection from '../../../../src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection';

vi.mock('../../../../src/pages/InstitutionAdminDashboard/hooks/useClassesCourses', () => ({
  useClassesCourses: () => ({
    courses: [
      {
        id: 'course-1',
        name: '1 ESO',
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
  }),
}));

vi.mock('../../../../src/pages/InstitutionAdminDashboard/components/CsvImportWorkflowModal', () => ({
  default: ({ isOpen, onRunManualImport }) => {
    if (!isOpen) return null;
    return (
      <button type="button" onClick={() => onRunManualImport?.({ workflowType: 'course-links' })}>
        Ejecutar vinculación de cursos
      </button>
    );
  },
}));

describe('ClassesCoursesSection CSV workflow action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('opens course CSV workflow and delegates manual import callback', async () => {
    const onRunManualCourseLinkCsvImport = vi.fn(async () => ({
      processedRows: 2,
      linkedRows: 2,
      linkedStudents: 2,
    }));

    render(
      <ClassesCoursesSection
        user={{ uid: 'institution-admin-1', institutionId: 'inst-1' }}
        institutionId="inst-1"
        allStudents={[]}
        allTeachers={[]}
        onUploadUsersImportFile={vi.fn()}
        onRunManualCourseLinkCsvImport={onRunManualCourseLinkCsvImport}
        onRunUsersImportN8n={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /vincular cursos por csv/i }));
    fireEvent.click(screen.getByRole('button', { name: /ejecutar vinculación de cursos/i }));

    await waitFor(() => {
      expect(onRunManualCourseLinkCsvImport).toHaveBeenCalledTimes(1);
    });
  });
});
