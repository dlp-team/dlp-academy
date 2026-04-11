// tests/unit/components/AppToast.test.jsx
import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import AppToast from '../../../src/components/ui/AppToast';

describe('AppToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
  });

  it('does not render when show is false', () => {
    const { container } = render(
      <AppToast
        show={false}
        message="Sin mostrar"
        onClose={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders in the lower-left area with title and message', () => {
    render(
      <AppToast
        show
        title="Nueva notificacion"
        message="Tienes actividad pendiente."
        type="assignment_new"
        onClose={vi.fn()}
      />
    );

    const toast = screen.getByTestId('app-toast');
    expect(toast.className).toContain('bottom-5');
    expect(toast.className).toContain('left-5');
    expect(screen.getByText('Nueva notificacion')).toBeTruthy();
    expect(screen.getByText('Tienes actividad pendiente.')).toBeTruthy();
  });

  it('auto closes after configured duration', () => {
    const onClose = vi.fn();

    render(
      <AppToast
        show
        title="Notificacion"
        message="Mensaje"
        durationMs={10000}
        onClose={onClose}
      />
    );

    act(() => {
      vi.advanceTimersByTime(9999);
    });
    expect(onClose).toHaveBeenCalledTimes(0);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('supports custom positioning and hides close button when onClose is not provided', () => {
    render(
      <AppToast
        show
        title="Atajo de teclado"
        message="Selecciona una tarjeta para continuar."
        positionClassName="bottom-24 left-5"
      />
    );

    const toast = screen.getByTestId('app-toast');
    expect(toast.className).toContain('bottom-24');
    expect(toast.className).toContain('left-5');
    expect(screen.queryByLabelText('Cerrar notificacion')).toBeNull();
  });
});
