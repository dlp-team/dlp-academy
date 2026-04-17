// tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import UsersTabContent from '../../../../src/pages/InstitutionAdminDashboard/components/UsersTabContent';
import { DEFAULT_ACCESS_POLICIES } from '../../../../src/utils/institutionPolicyUtils';

describe('UsersTabContent invite removal confirmation', () => {
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
      teachers: [],
      students: [],
      canLoadMoreUsers: false,
      isLoadingMoreUsers: false,
      onLoadMoreUsers: vi.fn(),
      allowedTeachers: [
        { id: 'invite-1', type: 'direct', email: 'profe@example.com' },
        { id: 'institutional-1', type: 'institutional', email: '' },
      ],
      onNavigateTeacher: vi.fn(),
      onNavigateStudent: vi.fn(),
      onRemoveAccess: vi.fn(async () => {}),
      liveAccessCode: 'ABC123',
      liveCodeLoading: false,
      liveCodeError: '',
      onRotateLiveCode: vi.fn(async () => {}),
      isRotatingLiveCode: false,
      codeRotationMessage: { type: '', text: '' },
      ...overrides,
    };

    render(<UsersTabContent {...props} />);
    return props;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens in-page confirmation before removing invite access and confirms explicitly', async () => {
    const props = renderUsersTab();

    fireEvent.click(screen.getByTitle(/eliminar invitación/i));

    expect(screen.getByRole('heading', { name: /eliminar acceso de profesor/i })).toBeTruthy();
    expect(props.onRemoveAccess).not.toHaveBeenCalled();
    expect(globalThis.confirm).not.toHaveBeenCalled();

    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: /^eliminar acceso$/i })
    );

    await waitFor(() => {
      expect(props.onRemoveAccess).toHaveBeenCalledTimes(1);
    });

    expect(props.onRemoveAccess).toHaveBeenCalledWith('invite-1');
    expect(screen.queryByRole('heading', { name: /eliminar acceso de profesor/i })).toBeNull();
  });

  it('cancels invite access removal without calling destructive handler', () => {
    const props = renderUsersTab();

    fireEvent.click(screen.getByTitle(/eliminar invitación/i));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /cancelar/i }));

    expect(props.onRemoveAccess).not.toHaveBeenCalled();
    expect(globalThis.confirm).not.toHaveBeenCalled();
    expect(screen.queryByRole('heading', { name: /eliminar acceso de profesor/i })).toBeNull();
  });

  it('shows teacher-permission guidance and preserves policy payload on save', () => {
    const props = renderUsersTab();

    expect(
      screen.getByText(/las opciones de permisos docentes se gestionan ahora desde la pestaña/i)
    ).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /guardar políticas/i }));

    expect(props.onSavePolicies).toHaveBeenCalledTimes(1);
    expect(props.onSavePolicies).toHaveBeenCalledWith(
      expect.objectContaining({
        teachers: expect.objectContaining({
          allowTeacherAutonomousSubjectCreation: DEFAULT_ACCESS_POLICIES.teachers.allowTeacherAutonomousSubjectCreation,
        }),
      })
    );
  });

  it('calls load-more handler from teacher table pagination control', () => {
    const props = renderUsersTab({
      teachers: Array.from({ length: 2 }).map((_, index) => ({
        id: `teacher-${index}`,
        displayName: `Profesor ${index}`,
        email: `profesor-${index}@example.com`,
        enabled: true,
      })),
      canLoadMoreUsers: true,
    });

    fireEvent.click(screen.getByRole('button', { name: /cargar más profesores/i }));

    expect(props.onLoadMoreUsers).toHaveBeenCalledTimes(1);
  });

  it('triggers immediate code regeneration handler from security card', () => {
    const props = renderUsersTab();

    fireEvent.click(screen.getByRole('button', { name: /regenerar ahora/i }));

    expect(props.onRotateLiveCode).toHaveBeenCalledTimes(1);
  });
});
