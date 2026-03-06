// tests/unit/components/BinConfirmModals.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DeleteConfirmModal, EmptyBinConfirmModal } from '../../../src/pages/Home/components/bin/BinConfirmModals';

describe('BinConfirmModals', () => {
  it('DeleteConfirmModal invokes cancel and confirm handlers', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <DeleteConfirmModal
        subjectId="subject-1"
        actionLoading={null}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    fireEvent.click(screen.getByRole('button', { name: /eliminar permanentemente/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith('subject-1');
  });

  it('DeleteConfirmModal disables confirm button while action is loading', () => {
    const onConfirm = vi.fn();

    render(
      <DeleteConfirmModal
        subjectId="subject-2"
        actionLoading="subject-2"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /eliminar permanentemente/i });
    expect(confirmButton.hasAttribute('disabled')).toBe(true);
  });

  it('EmptyBinConfirmModal invokes cancel and confirm handlers', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(<EmptyBinConfirmModal count={3} onConfirm={onConfirm} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    fireEvent.click(screen.getByRole('button', { name: /vaciar papelera/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
