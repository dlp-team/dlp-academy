// tests/unit/pages/admin/InstitutionFormPanel.test.jsx
import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import InstitutionFormPanel from '../../../../src/pages/AdminDashboard/components/InstitutionFormPanel';

const baseForm = {
  name: 'Colegio Demo',
  domain: 'demo.edu',
  institutionAdministrators: 'admin@demo.edu',
  type: 'school',
  city: 'Madrid',
  country: 'España',
  timezone: 'Europe/Madrid',
  institutionalCode: '',
};

const renderPanel = ({ editingInstitutionId = null, submitting = false, error = '', success = '' } = {}) => {
  const onSubmit = vi.fn((e) => e.preventDefault());
  const onClose = vi.fn();

  const Wrapper = () => {
    const [form, setForm] = useState(baseForm);

    return (
      <InstitutionFormPanel
        editingInstitutionId={editingInstitutionId}
        form={form}
        setForm={setForm}
        submitting={submitting}
        error={error}
        success={success}
        onSubmit={onSubmit}
        onClose={onClose}
      />
    );
  };

  render(<Wrapper />);
  return { onSubmit, onClose };
};

describe('InstitutionFormPanel', () => {
  it('shows creation mode texts and closes via action button', () => {
    const { onClose } = renderPanel();

    expect(screen.getByRole('heading', { name: 'Nueva Institución' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Crear' })).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows edit mode text and normalizes institutional code input', () => {
    renderPanel({ editingInstitutionId: 'inst-1' });

    expect(screen.getByRole('heading', { name: 'Editar Institución' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Guardar' })).not.toBeNull();

    fireEvent.change(screen.getByPlaceholderText('Ej: CIENCIAS-2026'), {
      target: { value: 'ciencias 2026' },
    });

    expect(screen.getByPlaceholderText('Ej: CIENCIAS-2026').value).toBe('CIENCIAS-2026');
  });
});
