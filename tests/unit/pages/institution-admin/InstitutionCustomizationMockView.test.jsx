// tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import InstitutionCustomizationMockView from '../../../../src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView';

describe('InstitutionCustomizationMockView', () => {
  it('switches preview role between docente and estudiante', () => {
    render(
      <InstitutionCustomizationMockView
        initialValues={{ institutionName: 'Academia Demo' }}
        onSave={vi.fn(async () => {})}
      />
    );

    expect(screen.getByText(/panel docente/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /vista estudiante/i }));

    expect(screen.getByText(/panel estudiante/i)).toBeTruthy();
  });

  it('calls onSave with updated form values', async () => {
    const onSave = vi.fn(async () => {});

    render(
      <InstitutionCustomizationMockView
        initialValues={{ institutionName: 'Academia Demo' }}
        onSave={onSave}
      />
    );

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
      <InstitutionCustomizationMockView
        initialValues={{ primary: '#6366f1' }}
        previewPaletteApply={null}
        onSave={vi.fn(async () => {})}
      />
    );

    rerender(
      <InstitutionCustomizationMockView
        initialValues={{ primary: '#6366f1' }}
        previewPaletteApply={{ token: 'primary', color: '#123456', _ts: Date.now() }}
        onSave={vi.fn(async () => {})}
      />
    );

    expect(screen.getAllByDisplayValue('#123456').length).toBeGreaterThan(0);
  });
});
