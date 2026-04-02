// tests/unit/pages/institution-admin/CreateClassModal.academicYear.test.jsx
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CreateClassModal from '../../../../src/pages/InstitutionAdminDashboard/modals/CreateClassModal';

describe('CreateClassModal academic year behavior', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('submits with academic year inherited from selected course', async () => {
    const onSubmit = vi.fn();

    render(
      <CreateClassModal
        onClose={() => {}}
        onSubmit={onSubmit}
        submitting={false}
        error=""
        courses={[
          { id: 'course-1', name: '1 ESO', academicYear: '2026-2027' },
        ]}
        allTeachers={[]}
        allStudents={[]}
      />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'course-1' } });
    fireEvent.change(screen.getByPlaceholderText('A'), { target: { value: 'B' } });
    fireEvent.click(screen.getByRole('button', { name: /crear clase/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      courseId: 'course-1',
      academicYear: '2026-2027',
      name: '1 ESO B',
    }));
  });

  it('uses fallback academic year when selected course lacks a valid value', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 10)); // March -> 2025-2026 fallback

    const onSubmit = vi.fn();

    render(
      <CreateClassModal
        onClose={() => {}}
        onSubmit={onSubmit}
        submitting={false}
        error=""
        courses={[
          { id: 'course-legacy', name: 'Legacy', academicYear: 'invalid' },
        ]}
        allTeachers={[]}
        allStudents={[]}
      />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'course-legacy' } });
    fireEvent.change(screen.getByPlaceholderText('A'), { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: /crear clase/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      academicYear: '2025-2026',
      name: 'Legacy A',
    }));
    expect(screen.getByText(/no tenía año académico válido/i)).toBeTruthy();
  });
});
