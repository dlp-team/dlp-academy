// tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import UsersTabContent from '../../../../src/pages/InstitutionAdminDashboard/components/UsersTabContent';
import { DEFAULT_ACCESS_POLICIES } from '../../../../src/utils/institutionPolicyUtils';

vi.mock('../../../../src/pages/InstitutionAdminDashboard/components/CsvImportWorkflowModal', () => ({
  default: ({ isOpen, onRunManualImport, onRunN8nImport }) => {
    if (!isOpen) return null;

    return (
      <div>
        <button type="button" onClick={() => onRunManualImport?.({ workflowType: 'students', mapping: { emailColumn: 'email' } })}>
          Ejecutar importación manual
        </button>
        <button type="button" onClick={() => onRunN8nImport?.({ workflowType: 'students' })}>
          Ejecutar importación n8n
        </button>
      </div>
    );
  },
}));

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
    onRotateLiveCode: vi.fn(),
    isRotatingLiveCode: false,
    codeRotationMessage: { type: '', text: '' },
    onUploadUsersImportFile: vi.fn(async () => ({
      storagePath: 'institutions/inst-1/imports/students/import.csv',
      downloadUrl: 'https://example.com/import.csv',
    })),
    onRunManualStudentsCsvImport: vi.fn(async () => ({
      processedRows: 2,
      updatedStudents: 2,
      linkedRows: 1,
      linkedStudents: 1,
      invalidRows: [],
      skippedRows: [],
      missingStudents: [],
      missingCourses: [],
    })),
    onRunUsersImportN8n: vi.fn(async () => ({ queued: true })),
    ...overrides,
  };

  render(<UsersTabContent {...props} />);
  return props;
};

describe('UsersTabContent student CSV workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens student CSV workflow and triggers manual import callback', async () => {
    const props = renderStudentsUsersTab();

    fireEvent.click(screen.getByRole('button', { name: /vincular alumnos por csv/i }));
    fireEvent.click(screen.getByRole('button', { name: /ejecutar importación manual/i }));

    await waitFor(() => {
      expect(props.onRunManualStudentsCsvImport).toHaveBeenCalledTimes(1);
    });
  });

  it('opens student CSV workflow and triggers n8n callback', async () => {
    const onRunUsersImportN8n = vi.fn(async () => ({ queued: true }));

    renderStudentsUsersTab({
      onRunUsersImportN8n,
    });

    fireEvent.click(screen.getByRole('button', { name: /vincular alumnos por csv/i }));
    fireEvent.click(screen.getByRole('button', { name: /ejecutar importación n8n/i }));

    await waitFor(() => {
      expect(onRunUsersImportN8n).toHaveBeenCalledTimes(1);
    });
  });
});
