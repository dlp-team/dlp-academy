// tests/unit/pages/institution-admin/ClassesCoursesSection.deleteConfirm.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import ClassesCoursesSection from '../../../../src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection';
import { getDefaultAcademicYear } from '../../../../src/pages/InstitutionAdminDashboard/components/classes-courses/academicYearUtils';

const DEFAULT_YEAR = getDefaultAcademicYear();

const mocks = vi.hoisted(() => ({
  createCourse: vi.fn(),
  updateCourse: vi.fn(),
  deleteCourse: vi.fn(),
  createClass: vi.fn(),
  updateClass: vi.fn(),
  deleteClass: vi.fn(),
  restoreCourse: vi.fn(),
  restoreClass: vi.fn(),
  permanentlyDeleteCourse: vi.fn(),
  permanentlyDeleteClass: vi.fn(),
}));

vi.mock('../../../../src/pages/InstitutionAdminDashboard/hooks/useClassesCourses', () => ({
  useClassesCourses: () => ({
    courses: [
      {
        id: 'course-1',
        name: '1 ESO',
        color: '#6366f1',
        academicYear: DEFAULT_YEAR,
      },
    ],
    classes: [
      {
        id: 'class-1',
        name: '1 ESO A',
        courseId: 'course-1',
        teacherId: 'teacher-1',
        studentIds: [],
        academicYear: DEFAULT_YEAR,
      },
    ],
    trashedCourses: [
      {
        id: 'course-trash-1',
        name: '2 ESO',
        trashedAt: '2026-04-02T10:00:00.000Z',
      },
    ],
    trashedClasses: [
      {
        id: 'class-trash-1',
        name: '2 ESO B',
        courseId: 'course-trash-1',
        teacherId: 'teacher-1',
        studentIds: [],
        trashedAt: '2026-04-02T10:00:00.000Z',
      },
    ],
    loading: false,
    createCourse: mocks.createCourse,
    updateCourse: mocks.updateCourse,
    deleteCourse: mocks.deleteCourse,
    createClass: mocks.createClass,
    updateClass: mocks.updateClass,
    deleteClass: mocks.deleteClass,
    restoreCourse: mocks.restoreCourse,
    restoreClass: mocks.restoreClass,
    permanentlyDeleteCourse: mocks.permanentlyDeleteCourse,
    permanentlyDeleteClass: mocks.permanentlyDeleteClass,
  }),
}));

describe('ClassesCoursesSection delete confirmation', () => {
  const renderSection = () => render(
    <ClassesCoursesSection
      user={{ uid: 'institution-admin-1', institutionId: 'inst-1' }}
      institutionId="inst-1"
      allStudents={[]}
      allTeachers={[{ id: 'teacher-1', displayName: 'Docente Demo', email: 'docente@example.com' }]}
    />
  );

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens in-page confirmation before deleting a course and confirms explicitly', async () => {
    renderSection();

    fireEvent.click(screen.getByTitle(/eliminar curso/i));

    expect(screen.getByRole('heading', { name: /mover curso a papelera/i })).toBeTruthy();
    expect(globalThis.confirm).not.toHaveBeenCalled();
    expect(mocks.deleteCourse).not.toHaveBeenCalled();

    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: /^mover a papelera$/i })
    );

    await waitFor(() => {
      expect(mocks.deleteCourse).toHaveBeenCalledTimes(1);
    });

    expect(mocks.deleteCourse).toHaveBeenCalledWith('course-1');
    expect(mocks.deleteClass).not.toHaveBeenCalled();
    expect(screen.queryByRole('heading', { name: /mover curso a papelera/i })).toBeNull();
  });

  it('cancels course deletion without calling delete handlers', () => {
    renderSection();

    fireEvent.click(screen.getByTitle(/eliminar curso/i));
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(screen.queryByRole('heading', { name: /mover curso a papelera/i })).toBeNull();
    expect(mocks.deleteCourse).not.toHaveBeenCalled();
    expect(mocks.deleteClass).not.toHaveBeenCalled();
    expect(globalThis.confirm).not.toHaveBeenCalled();
  });

  it('opens in-page confirmation before deleting a class and confirms explicitly', async () => {
    renderSection();

    fireEvent.click(screen.getByRole('button', { name: /clases/i }));
    fireEvent.click(screen.getByTitle(/^eliminar$/i));

    expect(screen.getByRole('heading', { name: /mover clase a papelera/i })).toBeTruthy();
    expect(globalThis.confirm).not.toHaveBeenCalled();
    expect(mocks.deleteClass).not.toHaveBeenCalled();

    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: /^mover a papelera$/i })
    );

    await waitFor(() => {
      expect(mocks.deleteClass).toHaveBeenCalledTimes(1);
    });

    expect(mocks.deleteClass).toHaveBeenCalledWith('class-1');
    expect(mocks.deleteCourse).not.toHaveBeenCalled();
  });

  it('restores a trashed course from the bin tab', async () => {
    renderSection();

    fireEvent.click(screen.getByRole('button', { name: /papelera/i }));

    const restoreButtons = screen.getAllByRole('button', { name: /^restaurar$/i });
    fireEvent.click(restoreButtons[0]);

    await waitFor(() => {
      expect(mocks.restoreCourse).toHaveBeenCalledTimes(1);
    });

    expect(mocks.restoreCourse).toHaveBeenCalledWith('course-trash-1');
    expect(mocks.restoreClass).not.toHaveBeenCalled();
  });

  it('requires exact typed name before permanent deleting a trashed course', async () => {
    renderSection();

    fireEvent.click(screen.getByRole('button', { name: /papelera/i }));

    fireEvent.click(screen.getAllByRole('button', { name: /eliminar definitivamente/i })[0]);

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: /eliminar curso definitivamente/i })).toBeTruthy();

    const actionButton = within(dialog).getByRole('button', { name: /eliminar definitivamente/i });
    expect(actionButton).toHaveProperty('disabled', true);

    const input = within(dialog).getByLabelText(/escribe el nombre exacto para confirmar/i);
    fireEvent.change(input, { target: { value: 'nombre incorrecto' } });
    expect(actionButton).toHaveProperty('disabled', true);

    fireEvent.change(input, { target: { value: '2 ESO' } });
    expect(actionButton).toHaveProperty('disabled', false);

    fireEvent.click(actionButton);

    await waitFor(() => {
      expect(mocks.permanentlyDeleteCourse).toHaveBeenCalledTimes(1);
    });

    expect(mocks.permanentlyDeleteCourse).toHaveBeenCalledWith('course-trash-1');
    expect(mocks.deleteCourse).not.toHaveBeenCalled();
  });
});
