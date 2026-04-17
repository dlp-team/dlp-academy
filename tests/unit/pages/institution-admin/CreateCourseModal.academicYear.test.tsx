// tests/unit/pages/institution-admin/CreateCourseModal.academicYear.test.jsx
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import CreateCourseModal from '../../../../src/pages/InstitutionAdminDashboard/modals/CreateCourseModal';

describe('CreateCourseModal academic year validation', () => {
  it('prevents submit when academic year format is invalid', () => {
    const onSubmit = vi.fn();

    render(
      <CreateCourseModal
        onClose={() => {}}
        onSubmit={onSubmit}
        submitting={false}
        error=""
      />
    );

    fireEvent.change(screen.getByPlaceholderText('1'), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText(/eso, bachillerato/i), { target: { value: 'ESO' } });
    fireEvent.change(screen.getByPlaceholderText('2024-2025'), { target: { value: '2024-2026' } });

    const submitButton = screen.getByRole('button', { name: /crear curso/i });
    expect(submitButton).toHaveProperty('disabled', true);

    fireEvent.click(submitButton);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
