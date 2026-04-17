// tests/unit/pages/admin/AdminUsersFilters.test.jsx
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import AdminUsersFilters from '../../../../src/pages/AdminDashboard/components/AdminUsersFilters';

const renderFilters = (props) => {
  render(<AdminUsersFilters {...props} />);
};

describe('AdminUsersFilters', () => {
  it('triggers role filter and search callbacks', () => {
    const onRoleFilterChange = vi.fn();
    const onSearchChange = vi.fn();
    const onStatusFilterChange = vi.fn();

    renderFilters({
      roleFilter: 'all',
      onRoleFilterChange,
      search: '',
      onSearchChange,
      statusFilter: 'all',
      onStatusFilterChange,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Admin Inst.' }));
    expect(onRoleFilterChange).toHaveBeenCalledWith('institutionadmin');

    fireEvent.change(screen.getByPlaceholderText('Buscar por nombre o email...'), {
      target: { value: 'docente' },
    });
    expect(onSearchChange).toHaveBeenCalledWith('docente');
  });

  it('triggers status filter callback', () => {
    const onRoleFilterChange = vi.fn();
    const onSearchChange = vi.fn();
    const onStatusFilterChange = vi.fn();

    renderFilters({
      roleFilter: 'teacher',
      onRoleFilterChange,
      search: 'ana',
      onSearchChange,
      statusFilter: 'all',
      onStatusFilterChange,
    });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'disabled' } });
    expect(onStatusFilterChange).toHaveBeenCalledWith('disabled');
  });
});
