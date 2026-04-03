// tests/unit/pages/institution-admin/UserDetailView.studentCourseLinks.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StudentDetailView } from '../../../../src/pages/InstitutionAdminDashboard/components/UserDetailView';

const routeMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  params: { studentId: 'student-1', teacherId: null },
}));

const firestoreMocks = vi.hoisted(() => ({
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(async () => undefined),
  doc: vi.fn((_db, collectionName, id) => ({ collectionName, id })),
  collection: vi.fn((_db, collectionName) => ({ collectionName })),
  where: vi.fn((field, operator, value) => ({ type: 'where', field, operator, value })),
  query: vi.fn((collectionRef, ...constraints) => ({ collectionName: collectionRef.collectionName, constraints })),
  serverTimestamp: vi.fn(() => '__SERVER_TIMESTAMP__'),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => routeMocks.navigate,
    useParams: () => routeMocks.params,
  };
});

vi.mock('../../../../src/firebase/config', () => ({
  db: { __db: true },
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    getDoc: (...args) => firestoreMocks.getDoc(...args),
    getDocs: (...args) => firestoreMocks.getDocs(...args),
    updateDoc: (...args) => firestoreMocks.updateDoc(...args),
    doc: (...args) => firestoreMocks.doc(...args),
    collection: (...args) => firestoreMocks.collection(...args),
    where: (...args) => firestoreMocks.where(...args),
    query: (...args) => firestoreMocks.query(...args),
    serverTimestamp: () => firestoreMocks.serverTimestamp(),
  };
});

vi.mock('../../../../src/components/layout/Header', () => ({
  default: () => <div data-testid="header-mock" />,
}));

const buildSnap = (rows = []) => ({
  docs: rows.map((row) => ({
    id: row.id,
    data: () => row,
  })),
});

const setupFirestoreMocks = ({ studentProfile, courses }) => {
  firestoreMocks.getDoc.mockImplementation(async (ref) => {
    if (ref.collectionName === 'users' && ref.id === 'student-1') {
      return {
        id: 'student-1',
        exists: () => true,
        data: () => studentProfile,
      };
    }

    return {
      id: ref.id,
      exists: () => false,
      data: () => ({}),
    };
  });

  firestoreMocks.getDocs.mockImplementation(async (queryObject) => {
    if (queryObject.collectionName === 'classes') {
      return buildSnap([
        {
          id: 'class-1',
          courseId: 'course-1',
          teacherId: 'teacher-1',
          studentIds: ['student-1'],
          name: 'Clase 1',
        },
      ]);
    }

    if (queryObject.collectionName === 'courses') {
      return buildSnap(courses);
    }

    if (queryObject.collectionName === 'users') {
      return buildSnap([
        { id: 'teacher-1', displayName: 'Docente Uno', email: 'docente@colegio.com' },
      ]);
    }

    return buildSnap([]);
  });
};

describe('UserDetailView student course linking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds a new linked course from the student detail panel', async () => {
    setupFirestoreMocks({
      studentProfile: {
        institutionId: 'inst-1',
        displayName: 'Alumno Uno',
        email: 'alumno1@colegio.com',
        courseId: 'course-1',
        courseIds: ['course-1'],
        enrolledCourseIds: ['course-1'],
      },
      courses: [
        { id: 'course-1', name: '1 ESO', academicYear: '2026-2027' },
        { id: 'course-2', name: '2 ESO', academicYear: '2026-2027' },
      ],
    });

    render(<StudentDetailView user={{ uid: 'admin-1', institutionId: 'inst-1' }} />);

    await waitFor(() => {
      expect(screen.getByText(/vinculación de cursos/i)).toBeTruthy();
    });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'course-2' } });
    fireEvent.click(screen.getByRole('button', { name: /vincular curso/i }));

    await waitFor(() => {
      expect(firestoreMocks.updateDoc).toHaveBeenCalledTimes(1);
    });

    expect(firestoreMocks.updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ collectionName: 'users', id: 'student-1' }),
      expect.objectContaining({
        courseId: 'course-1',
        courseIds: ['course-1', 'course-2'],
        enrolledCourseIds: ['course-1', 'course-2'],
      }),
    );

    expect(screen.getByText(/cursos actualizados correctamente/i)).toBeTruthy();
  });

  it('removes an existing linked course from the student detail panel', async () => {
    setupFirestoreMocks({
      studentProfile: {
        institutionId: 'inst-1',
        displayName: 'Alumno Dos',
        email: 'alumno2@colegio.com',
        courseId: 'course-1',
        courseIds: ['course-1', 'course-2'],
        enrolledCourseIds: ['course-1', 'course-2'],
      },
      courses: [
        { id: 'course-1', name: '1 ESO', academicYear: '2026-2027' },
        { id: 'course-2', name: '2 ESO', academicYear: '2026-2027' },
      ],
    });

    render(<StudentDetailView user={{ uid: 'admin-1', institutionId: 'inst-1' }} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /quitar 1 eso/i })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /quitar 1 eso/i }));

    await waitFor(() => {
      expect(firestoreMocks.updateDoc).toHaveBeenCalledTimes(1);
    });

    expect(firestoreMocks.updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ collectionName: 'users', id: 'student-1' }),
      expect.objectContaining({
        courseId: 'course-2',
        courseIds: ['course-2'],
        enrolledCourseIds: ['course-2'],
      }),
    );
  });
});
