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
});
