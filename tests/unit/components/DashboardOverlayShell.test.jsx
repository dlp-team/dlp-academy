// tests/unit/components/DashboardOverlayShell.test.jsx
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import DashboardOverlayShell from '../../../src/components/ui/DashboardOverlayShell';

describe('DashboardOverlayShell', () => {
  it('renders overlay content and closes on backdrop click by default', () => {
    const onClose = vi.fn();

    render(
      <DashboardOverlayShell isOpen onClose={onClose}>
        <p>Contenido de prueba</p>
      </DashboardOverlayShell>
    );

    expect(screen.getByText('Contenido de prueba')).toBeTruthy();

    fireEvent.click(screen.getByTestId('base-modal-backdrop'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('supports disabling backdrop close behavior', () => {
    const onClose = vi.fn();

    render(
      <DashboardOverlayShell
        isOpen
        onClose={onClose}
        closeOnBackdropClick={false}
      >
        <p>Sin cierre por fondo</p>
      </DashboardOverlayShell>
    );

    fireEvent.click(screen.getByTestId('base-modal-backdrop'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('applies constrained viewport root and width presets', () => {
    render(
      <DashboardOverlayShell isOpen onClose={() => {}} maxWidth="md">
        <p>Ancho controlado</p>
      </DashboardOverlayShell>
    );

    const rootNode = screen.getByTestId('base-modal-backdrop').parentElement;
    expect(rootNode?.className).toContain('inset-x-0');
    expect(screen.getByTestId('base-modal-wrapper').className).toContain('py-6');
    expect(screen.getByTestId('base-modal-content').className).toContain('max-w-md');
  });

  it('shows discard confirmation before closing when unsaved changes exist', () => {
    const onClose = vi.fn();

    render(
      <DashboardOverlayShell
        isOpen
        onClose={onClose}
        hasUnsavedChanges
        confirmOnUnsavedClose
      >
        <p>Cambios pendientes</p>
      </DashboardOverlayShell>
    );

    fireEvent.click(screen.getByTestId('base-modal-backdrop'));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText(/hay cambios sin guardar/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /salir sin guardar/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
