// tests/unit/pages/topic/CategorizFileModal.test.jsx
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import CategorizFileModal from '../../../../src/pages/Topic/components/CategorizFileModal';

describe('CategorizFileModal', () => {
  it('does not render content when modal is closed', () => {
    render(
      <CategorizFileModal
        isOpen={false}
        onClose={() => {}}
        onSubmit={() => {}}
      />
    );

    expect(screen.queryByText(/categorizar archivo/i)).toBeNull();
  });

  it('keeps backdrop click disabled to preserve prior behavior', () => {
    const onClose = vi.fn();

    render(
      <CategorizFileModal
        isOpen={true}
        onClose={onClose}
        onSubmit={() => {}}
      />
    );

    fireEvent.click(screen.getByTestId('base-modal-backdrop'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('submits selected category and closes via button controls', () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();

    render(
      <CategorizFileModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /ejercicios/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('ejercicios');

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
