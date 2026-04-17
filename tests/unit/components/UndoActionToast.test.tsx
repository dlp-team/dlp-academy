// tests/unit/components/UndoActionToast.test.jsx
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import UndoActionToast from '../../../src/components/ui/UndoActionToast';

describe('UndoActionToast', () => {
  it('does not render when message is empty', () => {
    const { container } = render(<UndoActionToast message="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders message and default action label', () => {
    render(<UndoActionToast message="Movimiento aplicado." onAction={() => {}} onClose={() => {}} />);
    expect(screen.getByText('Movimiento aplicado.')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Deshacer' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Cerrar notificacion' })).not.toBeNull();
  });

  it('triggers action and close callbacks', () => {
    const onAction = vi.fn();
    const onClose = vi.fn();

    render(
      <UndoActionToast
        message="Se movió la carpeta."
        actionLabel="Deshacer cambio"
        onAction={onAction}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Deshacer cambio' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar notificacion' }));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
