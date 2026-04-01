// tests/unit/pages/admin/InstitutionTableRow.test.jsx
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import InstitutionTableRow from '../../../../src/pages/AdminDashboard/components/InstitutionTableRow';

const renderRow = (props) => {
  render(
    <table>
      <tbody>
        <InstitutionTableRow {...props} />
      </tbody>
    </table>
  );
};

describe('InstitutionTableRow', () => {
  it('renders institution fields and action callbacks', () => {
    const onOpenDashboard = vi.fn();
    const onEdit = vi.fn();
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    const school = {
      id: 'inst-1',
      name: 'Institucion Demo',
      domain: 'demo.edu',
      type: 'school',
      city: 'Madrid',
      institutionAdministrators: ['admin@demo.edu'],
      enabled: true,
    };

    renderRow({ school, onOpenDashboard, onEdit, onToggle, onDelete });

    expect(screen.getByText('Institucion Demo')).not.toBeNull();
    expect(screen.getByText('demo.edu')).not.toBeNull();
    expect(screen.getByText('Activa')).not.toBeNull();

    fireEvent.click(screen.getByTitle('Abrir panel de institución'));
    fireEvent.click(screen.getByTitle('Editar'));
    fireEvent.click(screen.getByTitle('Deshabilitar'));
    fireEvent.click(screen.getByTitle('Eliminar'));

    expect(onOpenDashboard).toHaveBeenCalledWith('inst-1');
    expect(onEdit).toHaveBeenCalledWith(school);
    expect(onToggle).toHaveBeenCalledWith(school);
    expect(onDelete).toHaveBeenCalledWith(school);
  });
});
