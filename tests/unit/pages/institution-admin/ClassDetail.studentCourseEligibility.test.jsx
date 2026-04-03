// tests/unit/pages/institution-admin/ClassDetail.studentCourseEligibility.test.jsx
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ClassDetail from '../../../../src/pages/InstitutionAdminDashboard/components/classes-courses/ClassDetail';

const baseCourse = {
  id: 'course-1',
  name: '1 ESO',
  academicYear: '2026-2027',
  color: '#0ea5e9',
};

const baseClass = {
  id: 'class-1',
  name: '1 ESO A',
  courseId: 'course-1',
  teacherId: 'teacher-1',
  studentIds: ['student-legacy'],
  academicYear: '2026-2027',
  status: 'active',
};

const baseTeacher = {
  id: 'teacher-1',
  displayName: 'Docente Uno',
  email: 'docente@example.com',
};

describe('ClassDetail student course eligibility', () => {
  it('shows only course-eligible options for new assignments while keeping selected rows visible', async () => {
    const onUpdateField = vi.fn().mockResolvedValue(undefined);

    render(
      <ClassDetail
        cls={baseClass}
        courses={[baseCourse]}
        allTeachers={[baseTeacher]}
        allStudents={[
          { id: 'student-legacy', displayName: 'Alumno Legacy', email: 'legacy@example.com', courseId: 'course-2' },
          { id: 'student-in-course', displayName: 'Alumno Curso', email: 'curso@example.com', courseId: 'course-1' },
          { id: 'student-external', displayName: 'Alumno Externo', email: 'externo@example.com', courseId: 'course-2' },
        ]}
        allClasses={[baseClass]}
        onBack={() => {}}
        onDelete={() => {}}
        onUpdateField={onUpdateField}
      />
    );

    fireEvent.click(screen.getByTitle(/editar alumnos/i));

    expect(screen.getAllByText('Alumno Legacy').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Alumno Curso').length).toBeGreaterThan(0);
    expect(screen.queryByText('Alumno Externo')).toBeNull();

    fireEvent.click(screen.getByText('Alumno Curso'));
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(onUpdateField).toHaveBeenCalledTimes(1);
    });

    expect(onUpdateField).toHaveBeenCalledWith('class-1', {
      studentIds: ['student-legacy', 'student-in-course'],
    });
  });

  it('falls back to full student list when no course links are available yet', () => {
    render(
      <ClassDetail
        cls={{ ...baseClass, studentIds: [] }}
        courses={[baseCourse]}
        allTeachers={[baseTeacher]}
        allStudents={[
          { id: 'student-1', displayName: 'Alumno Uno', email: 'uno@example.com' },
          { id: 'student-2', displayName: 'Alumno Dos', email: 'dos@example.com' },
        ]}
        allClasses={[]}
        onBack={() => {}}
        onDelete={() => {}}
        onUpdateField={vi.fn().mockResolvedValue(undefined)}
      />
    );

    fireEvent.click(screen.getByTitle(/editar alumnos/i));

    expect(screen.getByText('Alumno Uno')).toBeTruthy();
    expect(screen.getByText('Alumno Dos')).toBeTruthy();
    expect(screen.getByText(/listado completo temporalmente/i)).toBeTruthy();
  });

  it('prunes incompatible students when changing class course', async () => {
    const onUpdateField = vi.fn().mockResolvedValue(undefined);

    render(
      <ClassDetail
        cls={{ ...baseClass, studentIds: ['student-legacy', 'student-in-course'] }}
        courses={[
          baseCourse,
          { id: 'course-2', name: '2 ESO', academicYear: '2026-2027', color: '#14b8a6' },
        ]}
        allTeachers={[baseTeacher]}
        allStudents={[
          { id: 'student-legacy', displayName: 'Alumno Legacy', email: 'legacy@example.com', courseId: 'course-2' },
          { id: 'student-in-course', displayName: 'Alumno Curso', email: 'curso@example.com', courseId: 'course-1' },
        ]}
        allClasses={[{ ...baseClass, studentIds: ['student-legacy', 'student-in-course'] }]}
        onBack={() => {}}
        onDelete={() => {}}
        onUpdateField={onUpdateField}
      />
    );

    fireEvent.click(screen.getByTitle(/editar nombre de la clase/i));

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'course-2' } });
    fireEvent.change(screen.getByPlaceholderText('A'), { target: { value: 'B' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(onUpdateField).toHaveBeenCalledTimes(1);
    });

    expect(onUpdateField).toHaveBeenCalledWith('class-1', expect.objectContaining({
      name: '2 ESO B',
      courseId: 'course-2',
      studentIds: ['student-legacy'],
    }));
  });
});
