// tests/unit/pages/institution-admin/CreateClassModal.academicYear.test.jsx
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CreateClassModal from '../../../../src/pages/InstitutionAdminDashboard/modals/CreateClassModal';
import { getDefaultAcademicYear } from '../../../../src/pages/InstitutionAdminDashboard/components/classes-courses/academicYearUtils';

describe('CreateClassModal academic year behavior', () => {
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
    const onSubmit = vi.fn();
    const fallbackAcademicYear = getDefaultAcademicYear();

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
      academicYear: fallbackAcademicYear,
      name: 'Legacy A',
    }));
    expect(screen.getByText(/no tenía año académico válido/i)).toBeTruthy();
  });

  it('filters student picker by selected course when course links exist', () => {
    render(
      <CreateClassModal
        onClose={() => {}}
        onSubmit={() => {}}
        submitting={false}
        error=""
        courses={[
          { id: 'course-1', name: '1 ESO', academicYear: '2026-2027' },
          { id: 'course-2', name: '2 ESO', academicYear: '2026-2027' },
        ]}
        allTeachers={[]}
        allStudents={[
          { id: 'student-1', displayName: 'Alumno Uno', email: 'uno@example.com', courseId: 'course-1' },
          { id: 'student-2', displayName: 'Alumno Dos', email: 'dos@example.com', courseId: 'course-2' },
          { id: 'student-3', displayName: 'Alumno Tres', email: 'tres@example.com' },
        ]}
      />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'course-1' } });

    expect(screen.getByText('Alumno Uno')).toBeTruthy();
    expect(screen.queryByText('Alumno Dos')).toBeNull();
    expect(screen.queryByText('Alumno Tres')).toBeNull();
  });

  it('keeps legacy student list when no student-course links are present', () => {
    render(
      <CreateClassModal
        onClose={() => {}}
        onSubmit={() => {}}
        submitting={false}
        error=""
        courses={[
          { id: 'course-1', name: '1 ESO', academicYear: '2026-2027' },
        ]}
        allTeachers={[]}
        allStudents={[
          { id: 'student-1', displayName: 'Alumno Uno', email: 'uno@example.com' },
          { id: 'student-2', displayName: 'Alumno Dos', email: 'dos@example.com' },
        ]}
      />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'course-1' } });

    expect(screen.getByText('Alumno Uno')).toBeTruthy();
    expect(screen.getByText('Alumno Dos')).toBeTruthy();
    expect(screen.getByText(/se muestra el listado completo temporalmente/i)).toBeTruthy();
  });
});
