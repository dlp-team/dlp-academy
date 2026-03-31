// tests/unit/pages/viewResource/ViewResource.errorHandling.test.jsx
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ViewResource from '../../../../src/pages/ViewResource/ViewResource';

const renderViewResource = (state) => {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/view', state }]}>
      <Routes>
        <Route path="/view" element={<ViewResource />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ViewResource iframe fallback behavior', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.scrollTo = () => {};
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('shows loading feedback before iframe load completes', () => {
    renderViewResource({
      file: {
        name: 'Guia Algebra',
        url: 'https://example.com/guia.pdf',
      },
    });

    expect(screen.getByText('Cargando vista previa...')).toBeTruthy();
  });

  it('shows error feedback when iframe fails to load', async () => {
    renderViewResource({
      file: {
        name: 'Guia Algebra',
        url: 'https://example.com/guia.pdf',
      },
    });

    await act(async () => {
      vi.advanceTimersByTime(12000);
    });

    expect(screen.getByText('No se pudo cargar la vista previa')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reintentar visor' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Descargar archivo' })).toBeTruthy();
  });

  it('retries iframe loading after an error', async () => {
    renderViewResource({
      file: {
        name: 'Guia Algebra',
        url: 'https://example.com/guia.pdf',
      },
    });

    await act(async () => {
      vi.advanceTimersByTime(12000);
    });

    expect(screen.getByText('No se pudo cargar la vista previa')).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Reintentar visor' }));
    });

    expect(screen.getByText('Cargando vista previa...')).toBeTruthy();
  });
});
