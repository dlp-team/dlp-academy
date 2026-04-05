// tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import InstitutionCustomizationMockView from '../../../../src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView';

const renderCustomizationPreview = (props = {}) => {
  return render(
    <MemoryRouter>
      <InstitutionCustomizationMockView
        initialValues={{ institutionName: 'Academia Demo' }}
        onSave={vi.fn(async () => {})}
        {...props}
      />
    </MemoryRouter>
  );
};

describe('InstitutionCustomizationMockView', () => {
  it('switches preview role between docente and estudiante', () => {
    renderCustomizationPreview();

    expect(screen.getByText(/panel docente/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /vista estudiante/i }));

    expect(screen.getByText(/panel estudiante/i)).toBeTruthy();
  });

  it('keeps exact preview header and content controls aligned', () => {
    renderCustomizationPreview();

    expect(screen.getByText(/panel docente/i)).toBeTruthy();
    expect(screen.getByText(/^inicio$/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /manual/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /cursos/i })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /vista estudiante/i }));

    expect(screen.getByText(/panel estudiante/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /manual/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /cursos/i })).toBeTruthy();
  });

  it('calls onSave with updated form values', async () => {
    const onSave = vi.fn(async () => {});

    renderCustomizationPreview({ onSave });

    fireEvent.change(screen.getByPlaceholderText(/nombre visible/i), {
      target: { value: 'Colegio Horizonte' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^guardar$/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    expect(onSave.mock.calls[0][0]).toMatchObject({
      institutionName: 'Colegio Horizonte',
    });
  });

  it('applies palette preview input without persisting automatically', () => {
    const { rerender } = render(
      <MemoryRouter>
        <InstitutionCustomizationMockView
          initialValues={{ primary: '#6366f1' }}
          previewPaletteApply={null}
          onSave={vi.fn(async () => {})}
        />
      </MemoryRouter>
    );

    rerender(
      <MemoryRouter>
        <InstitutionCustomizationMockView
          initialValues={{ primary: '#6366f1' }}
          previewPaletteApply={{ token: 'primary', color: '#123456', _ts: Date.now() }}
          onSave={vi.fn(async () => {})}
        />
      </MemoryRouter>
    );

    expect(screen.getAllByDisplayValue('#123456').length).toBeGreaterThan(0);
  });

  it('toggles fullscreen mode and collapses controls panel', () => {
    renderCustomizationPreview();

    const collapseButton = screen.getByTitle(/colapsar panel de controles/i);
    fireEvent.click(collapseButton);
    expect(screen.getByTitle(/expandir panel de controles/i)).toBeTruthy();

    const fullscreenButton = screen.getByTitle(/pantalla completa/i);
    fireEvent.click(fullscreenButton);

    const previewRoot = screen.getByTestId('institution-customization-preview-root');
    expect(previewRoot.className).toContain('fixed');
    expect(previewRoot.className).toContain('flex');
    expect(previewRoot.className).toContain('z-[10050]');
    expect(screen.getByText(/pulsa esc para salir de pantalla completa/i)).toBeTruthy();
    expect(screen.getByTitle(/salir de pantalla completa/i)).toBeTruthy();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByText(/pulsa esc para salir de pantalla completa/i)).toBeNull();
  });

  it('switches preview tabs and supports subject topic drilldown', () => {
    renderCustomizationPreview();

    fireEvent.click(screen.getByRole('button', { name: /papelera/i }));
    expect(screen.getByText(/papelera de vista previa/i)).toBeTruthy();
    expect(screen.getByText(/tecnología/i)).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /restaurar/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /eliminar/i }).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /compartido/i }));
    expect(screen.getByText(/asignaturas compartidas/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /manual/i }));
    fireEvent.click(screen.getByText('Matemáticas'));

    expect(screen.getByText(/temas de la asignatura/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /volver a asignaturas/i })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /ecuaciones lineales/i }));
    expect(screen.getByText(/guías de estudio/i)).toBeTruthy();
    expect(screen.getByText(/^archivos$/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /volver a asignaturas/i }));
    expect(screen.getByText(/mis asignaturas/i)).toBeTruthy();
  });
});
