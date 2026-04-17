// tests/unit/pages/admin/UserTableRow.test.jsx
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import UserTableRow from '../../../../src/pages/AdminDashboard/components/UserTableRow';

const renderRow = (props) => {
  render(
    <table>
      <tbody>
        <UserTableRow {...props} />
      </tbody>
    </table>
  );
};

describe('UserTableRow', () => {
  it('renders row fields and triggers role change', () => {
    const handleRoleChange = vi.fn();
    const handleToggle = vi.fn();

    const userData = {
      id: 'u1',
      displayName: 'Docente Uno',
      email: 'docente@demo.edu',
      role: 'teacher',
      enabled: true,
    };

    renderRow({ userData, handleRoleChange, handleToggle });

    expect(screen.getByText('Docente Uno')).not.toBeNull();
    expect(screen.getByText('docente@demo.edu')).not.toBeNull();
    expect(screen.getByText('Activo')).not.toBeNull();

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'student' } });
    expect(handleRoleChange).toHaveBeenCalledWith(userData, 'student');
  });

  it('triggers toggle action button', () => {
    const handleRoleChange = vi.fn();
    const handleToggle = vi.fn();

    const userData = {
      id: 'u2',
      displayName: 'Alumno Dos',
      email: 'alumno@demo.edu',
      role: 'student',
      enabled: false,
    };

    renderRow({ userData, handleRoleChange, handleToggle });

    fireEvent.click(screen.getByTitle('Habilitar'));
    expect(handleToggle).toHaveBeenCalledWith(userData);
    expect(screen.getByText('Deshabilitado')).not.toBeNull();
  });
});
