// tests/unit/components/NotificationToast.test.jsx
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Info } from 'lucide-react';
import NotificationToast from '../../../src/components/ui/NotificationToast';

describe('NotificationToast', () => {
  it('does not render when hidden', () => {
    const { container } = render(
      <NotificationToast show={false} message="No debe aparecer" />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders title and message', () => {
    render(
      <NotificationToast
        show
        title="Atajo de teclado"
        message="Asignatura copiada."
        icon={<Info className="h-4 w-4" />}
      />
    );

    expect(screen.getByText('Atajo de teclado')).toBeTruthy();
    expect(screen.getByText('Asignatura copiada.')).toBeTruthy();
  });

  it('handles close and custom action rendering', () => {
    const onClose = vi.fn();
    const onUndo = vi.fn();

    render(
      <NotificationToast
        show
        message="Movimiento aplicado."
        onClose={onClose}
        closeLabel="Cerrar notificacion"
        actions={(
          <button type="button" onClick={onUndo}>
            Deshacer
          </button>
        )}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar notificacion' }));

    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
