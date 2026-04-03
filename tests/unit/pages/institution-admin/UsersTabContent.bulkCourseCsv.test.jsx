// tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import UsersTabContent from '../../../../src/pages/InstitutionAdminDashboard/components/UsersTabContent';
import { DEFAULT_ACCESS_POLICIES } from '../../../../src/utils/institutionPolicyUtils';

const renderStudentsUsersTab = (overrides = {}) => {
  const props = {
    userType: 'students',
    setUserType: vi.fn(),
    accessPolicies: DEFAULT_ACCESS_POLICIES,
    onSavePolicies: vi.fn(),
    isUpdatingPolicies: false,
    policyMessage: { type: '', text: '' },
    searchTerm: '',
    setSearchTerm: vi.fn(),
    loading: false,
    teachers: [],
    students: [
      { id: 'student-1', email: 'alumno1@colegio.com', displayName: 'Alumno Uno', enabled: true },
    ],
    canLoadMoreUsers: false,
    isLoadingMoreUsers: false,
    onLoadMoreUsers: vi.fn(),
    allowedTeachers: [],
    onNavigateTeacher: vi.fn(),
    onNavigateStudent: vi.fn(),
    onRemoveAccess: vi.fn(),
    liveAccessCode: 'ABC123',
    liveCodeLoading: false,
    liveCodeError: '',
    institutionCourses: [
      { id: 'course-1', name: '1 ESO', academicYear: '2026-2027' },
      { id: 'course-2', name: '2 ESO', academicYear: '2026-2027' },
    ],
    onBulkLinkStudentsCsv: vi.fn(async () => ({
      totalRows: 2,
      linkedRows: 2,
      linkedStudents: 2,
      invalidRows: [],
      missingStudents: [],
      missingCourses: [],
    })),
    ...overrides,
  };

  render(<UsersTabContent {...props} />);
  return props;
};

describe('UsersTabContent bulk student-course CSV linking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens CSV modal, submits rows, and renders summary feedback', async () => {
    const props = renderStudentsUsersTab();

    fireEvent.click(screen.getByRole('button', { name: /vincular cursos por csv/i }));

    fireEvent.change(screen.getByPlaceholderText(/email,courseid/i), {
      target: { value: 'email,courseId\nalumno1@colegio.com,course-1\nalumno2@colegio.com,course-2' },
    });

    fireEvent.click(screen.getByRole('button', { name: /aplicar vínculos/i }));

    await waitFor(() => {
      expect(props.onBulkLinkStudentsCsv).toHaveBeenCalledTimes(1);
    });

    expect(props.onBulkLinkStudentsCsv).toHaveBeenCalledWith(
      'email,courseId\nalumno1@colegio.com,course-1\nalumno2@colegio.com,course-2'
    );

    expect(screen.getByText(/filas procesadas/i)).toBeTruthy();
    expect(screen.getByText(/alumnos actualizados/i)).toBeTruthy();
  });

  it('shows inline error when CSV linking handler fails', async () => {
    renderStudentsUsersTab({
      onBulkLinkStudentsCsv: vi.fn(async () => {
        throw new Error('boom');
      }),
    });

    fireEvent.click(screen.getByRole('button', { name: /vincular cursos por csv/i }));
    fireEvent.change(screen.getByPlaceholderText(/email,courseid/i), {
      target: { value: 'alumno1@colegio.com,course-1' },
    });

    fireEvent.click(screen.getByRole('button', { name: /aplicar vínculos/i }));

    await waitFor(() => {
      expect(screen.getByText(/no se pudieron aplicar los vínculos csv/i)).toBeTruthy();
    });
  });
});
