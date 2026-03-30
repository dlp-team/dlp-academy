// tests/unit/pages/institution-admin/ClassesCoursesSection.deleteConfirm.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import ClassesCoursesSection from '../../../../src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection';

const mocks = vi.hoisted(() => ({
  createCourse: vi.fn(),
  updateCourse: vi.fn(),
  deleteCourse: vi.fn(),
  createClass: vi.fn(),
  updateClass: vi.fn(),
  deleteClass: vi.fn(),
}));

vi.mock('../../../../src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.js', () => ({
  useClassesCourses: () => ({
    courses: [
      {
        id: 'course-1',
        name: '1 ESO',
        color: '#6366f1',
      },
    ],
    classes: [
      {
        id: 'class-1',
        name: '1 ESO A',
        courseId: 'course-1',
        teacherId: 'teacher-1',
        studentIds: [],
      },
    ],
    loading: false,
    createCourse: mocks.createCourse,
    updateCourse: mocks.updateCourse,
    deleteCourse: mocks.deleteCourse,
    createClass: mocks.createClass,
    updateClass: mocks.updateClass,
    deleteClass: mocks.deleteClass,
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

    expect(screen.getByRole('heading', { name: /eliminar curso/i })).toBeTruthy();
    expect(globalThis.confirm).not.toHaveBeenCalled();
    expect(mocks.deleteCourse).not.toHaveBeenCalled();

    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: /^eliminar curso$/i })
    );

    await waitFor(() => {
      expect(mocks.deleteCourse).toHaveBeenCalledTimes(1);
    });

    expect(mocks.deleteCourse).toHaveBeenCalledWith('course-1');
    expect(mocks.deleteClass).not.toHaveBeenCalled();
    expect(screen.queryByRole('heading', { name: /eliminar curso/i })).toBeNull();
  });

  it('cancels course deletion without calling delete handlers', () => {
    renderSection();

    fireEvent.click(screen.getByTitle(/eliminar curso/i));
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(screen.queryByRole('heading', { name: /eliminar curso/i })).toBeNull();
    expect(mocks.deleteCourse).not.toHaveBeenCalled();
    expect(mocks.deleteClass).not.toHaveBeenCalled();
    expect(globalThis.confirm).not.toHaveBeenCalled();
  });

  it('opens in-page confirmation before deleting a class and confirms explicitly', async () => {
    renderSection();

    fireEvent.click(screen.getByRole('button', { name: /clases/i }));
    fireEvent.click(screen.getByTitle(/^eliminar$/i));

    expect(screen.getByRole('heading', { name: /eliminar clase/i })).toBeTruthy();
    expect(globalThis.confirm).not.toHaveBeenCalled();
    expect(mocks.deleteClass).not.toHaveBeenCalled();

    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: /^eliminar clase$/i })
    );

    await waitFor(() => {
      expect(mocks.deleteClass).toHaveBeenCalledTimes(1);
    });

    expect(mocks.deleteClass).toHaveBeenCalledWith('class-1');
    expect(mocks.deleteCourse).not.toHaveBeenCalled();
  });
});
