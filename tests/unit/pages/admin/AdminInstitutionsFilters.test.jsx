// tests/unit/pages/admin/AdminInstitutionsFilters.test.jsx
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import AdminInstitutionsFilters from '../../../../src/pages/AdminDashboard/components/AdminInstitutionsFilters';

const renderFilters = (props) => {
  render(<AdminInstitutionsFilters {...props} />);
};

describe('AdminInstitutionsFilters', () => {
  it('triggers status, type and search callbacks', () => {
    const onStatusFilterChange = vi.fn();
    const onTypeFilterChange = vi.fn();
    const onSearchChange = vi.fn();
    const onToggleCreateForm = vi.fn();

    renderFilters({
      statusFilter: 'all',
      onStatusFilterChange,
      typeFilter: 'all',
      onTypeFilterChange,
      search: '',
      onSearchChange,
      onToggleCreateForm,
    });

    fireEvent.change(screen.getByLabelText('Filtrar por estado'), { target: { value: 'disabled' } });
    expect(onStatusFilterChange).toHaveBeenCalledWith('disabled');

    fireEvent.change(screen.getByLabelText('Filtrar por tipo'), { target: { value: 'academy' } });
    expect(onTypeFilterChange).toHaveBeenCalledWith('academy');

    fireEvent.change(screen.getByPlaceholderText('Buscar institución...'), {
      target: { value: 'IES' },
    });
    expect(onSearchChange).toHaveBeenCalledWith('IES');
  });

  it('triggers create-form toggle callback', () => {
    const onStatusFilterChange = vi.fn();
    const onTypeFilterChange = vi.fn();
    const onSearchChange = vi.fn();
    const onToggleCreateForm = vi.fn();

    renderFilters({
      statusFilter: 'active',
      onStatusFilterChange,
      typeFilter: 'school',
      onTypeFilterChange,
      search: 'centro',
      onSearchChange,
      onToggleCreateForm,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Nueva Institución' }));
    expect(onToggleCreateForm).toHaveBeenCalledTimes(1);
  });
});
