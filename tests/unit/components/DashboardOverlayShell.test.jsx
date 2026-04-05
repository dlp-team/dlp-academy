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

  it('applies top-constrained wrapper and width presets', () => {
    render(
      <DashboardOverlayShell isOpen onClose={() => {}} maxWidth="md">
        <p>Ancho controlado</p>
      </DashboardOverlayShell>
    );

    expect(screen.getByTestId('base-modal-wrapper').className).toContain('pt-24');
    expect(screen.getByTestId('base-modal-content').className).toContain('max-w-md');
  });
});
