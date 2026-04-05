// tests/unit/pages/institution-admin/UsersTabContent.deleteUserGuard.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import UsersTabContent from '../../../../src/pages/InstitutionAdminDashboard/components/UsersTabContent';
import { DEFAULT_ACCESS_POLICIES } from '../../../../src/utils/institutionPolicyUtils';

const renderUsersTab = (overrides = {}) => {
  const props = {
    userType: 'teachers',
    setUserType: vi.fn(),
    accessPolicies: DEFAULT_ACCESS_POLICIES,
    onSavePolicies: vi.fn(),
    isUpdatingPolicies: false,
    policyMessage: { type: '', text: '' },
    searchTerm: '',
    setSearchTerm: vi.fn(),
    loading: false,
    teachers: [
      {
        id: 'teacher-1',
        displayName: 'Profesor Uno',
        email: 'profesor1@colegio.com',
        enabled: true,
      },
    ],
    students: [
      {
        id: 'student-1',
        displayName: 'Alumno Uno',
        email: 'alumno1@colegio.com',
        enabled: true,
      },
    ],
    canLoadMoreUsers: false,
    isLoadingMoreUsers: false,
    onLoadMoreUsers: vi.fn(),
    allowedTeachers: [],
    onNavigateTeacher: vi.fn(),
    onNavigateStudent: vi.fn(),
    onRemoveAccess: vi.fn(),
    onDeleteUser: vi.fn(async () => {}),
    liveAccessCode: 'ABC123',
    liveCodeLoading: false,
    liveCodeError: '',
    onRotateLiveCode: vi.fn(),
    isRotatingLiveCode: false,
    codeRotationMessage: { type: '', text: '' },
    onUploadUsersImportFile: vi.fn(async () => ({ storagePath: '', downloadUrl: '' })),
    onRunManualStudentsCsvImport: vi.fn(async () => ({ processedRows: 0, updatedStudents: 0 })),
    onRunUsersImportN8n: vi.fn(async () => ({ queued: true })),
    ...overrides,
  };

  render(<UsersTabContent {...props} />);
  return props;
};

describe('UsersTabContent user deletion guardrails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens confirmation and deletes teacher only after explicit confirmation', async () => {
    const props = renderUsersTab();

    fireEvent.click(screen.getByRole('button', { name: /eliminar profesor/i }));

    expect(props.onNavigateTeacher).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: /eliminar profesor/i })).toBeTruthy();
    expect(props.onDeleteUser).not.toHaveBeenCalled();

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /eliminar usuario/i }));

    await waitFor(() => {
      expect(props.onDeleteUser).toHaveBeenCalledTimes(1);
    });

    expect(props.onDeleteUser).toHaveBeenCalledWith({
      userId: 'teacher-1',
      userRole: 'teacher',
    });
    expect(screen.getByText(/se eliminó el profesor correctamente/i)).toBeTruthy();
    expect(screen.queryByRole('heading', { name: /eliminar profesor/i })).toBeNull();
  });

  it('shows guard message when student deletion is blocked by active classes', async () => {
    const onDeleteUser = vi.fn(async () => {
      throw new Error('USER_DELETE_STUDENT_HAS_ACTIVE_CLASSES');
    });

    renderUsersTab({
      userType: 'students',
      onDeleteUser,
      teachers: [],
    });

    fireEvent.click(screen.getByRole('button', { name: /eliminar alumno/i }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /eliminar usuario/i }));

    await waitFor(() => {
      expect(onDeleteUser).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.getByText(/no se puede eliminar el alumno mientras tenga clases activas asignadas/i)
    ).toBeTruthy();
    expect(screen.getByRole('heading', { name: /eliminar alumno/i })).toBeTruthy();
  });
});
