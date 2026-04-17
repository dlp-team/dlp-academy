// tests/unit/pages/admin/AdminConfirmModal.test.jsx
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import AdminConfirmModal from '../../../../src/pages/AdminDashboard/components/AdminConfirmModal';

describe('AdminConfirmModal', () => {
  it('does not render when closed', () => {
    const { container } = render(
      <AdminConfirmModal
        isOpen={false}
        title="Titulo"
        description="Descripcion"
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(container.textContent).toBe('');
  });

  it('invokes handlers when buttons are clicked', () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(
      <AdminConfirmModal
        isOpen
        title="Eliminar"
        description="Descripcion"
        confirmLabel="Confirmar"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
