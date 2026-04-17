// tests/unit/App.authListener.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../../src/App';

const authMocks = vi.hoisted(() => ({
  mockOnAuthStateChanged: vi.fn(),
}));

const firestoreMocks = vi.hoisted(() => ({
  mockDoc: vi.fn((_db, name, id) => ({ name, id })),
  mockGetDoc: vi.fn(),
  mockSetDoc: vi.fn(),
  mockOnSnapshot: vi.fn(),
}));

vi.mock('../../src/firebase/config', () => ({
  auth: { __auth: 'mock-auth' },
  db: { __db: 'mock-db' },
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: authMocks.mockOnAuthStateChanged,
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    doc: firestoreMocks.mockDoc,
    getDoc: firestoreMocks.mockGetDoc,
    setDoc: firestoreMocks.mockSetDoc,
    onSnapshot: firestoreMocks.mockOnSnapshot,
  };
});

vi.mock('../../src/utils/permissionUtils', () => ({
  hasRequiredRoleAccess: vi.fn(() => true),
  getActiveRole: vi.fn((user) => user?.activeRole || user?.role || 'student'),
  getAssignedRoles: vi.fn((user) => {
    const normalizedRole = String(user?.role || 'student').toLowerCase();
    return [normalizedRole];
  }),
}));

vi.mock('../../src/pages/Auth/Login', () => ({ default: () => <div>Login Mock</div> }));
vi.mock('../../src/pages/Auth/Register', () => ({ default: () => <div>Register Mock</div> }));
vi.mock('../../src/pages/Profile/Profile', () => ({ default: () => <div>Profile Mock</div> }));
vi.mock('../../src/pages/Onboarding/components/OnboardingWizard', () => ({
  default: ({ user }) => <div>Onboarding Mock {user?.email}</div>,
}));
vi.mock('../../src/pages/Settings/Settings', () => ({ default: () => <div>Settings Mock</div> }));
vi.mock('../../src/pages/Home/Home', () => ({ default: ({ user }) => <div>Home Mock {user?.email}</div> }));
vi.mock('../../src/pages/Subject/Subject', () => ({ default: () => <div>Subject Mock</div> }));
vi.mock('../../src/pages/Topic/Topic', () => ({ default: () => <div>Topic Mock</div> }));
vi.mock('../../src/pages/Quizzes/Quizzes', () => ({ default: () => <div>Quizzes Mock</div> }));
vi.mock('../../src/pages/Quizzes/QuizEdit', () => ({ default: () => <div>Quiz Edit Mock</div> }));
vi.mock('../../src/pages/Content/StudyGuide', () => ({ default: () => <div>Study Guide Mock</div> }));
vi.mock('../../src/pages/Content/StudyGuideEditor', () => ({ default: () => <div>Study Guide Editor Mock</div> }));
vi.mock('../../src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard', () => ({
  default: () => <div>Institution Admin Mock</div>,
}));
vi.mock('../../src/pages/InstitutionAdminDashboard/components/UserDetailView', () => ({
  StudentDetailView: () => <div>Student Detail Mock</div>,
  TeacherDetailView: () => <div>Teacher Detail Mock</div>,
}));
vi.mock('../../src/pages/AdminDashboard/AdminDashboard', () => ({ default: () => <div>Admin Mock</div> }));
vi.mock('../../src/pages/TeacherDashboard/TeacherDashboard', () => ({ default: () => <div>Teacher Mock</div> }));
vi.mock('../../src/pages/StudentDashboard/StudentDashboard', () => ({ default: () => <div>Student Mock</div> }));
vi.mock('../../src/pages/TeacherDashboard/components/TeacherStudentDetailView', () => ({
  default: () => <div>Teacher Student Detail Mock</div>,
}));

describe('App auth listener fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();

    firestoreMocks.mockGetDoc.mockResolvedValue({
      exists: () => true,
    });

    authMocks.mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback({
        uid: 'user-1',
        email: 'teacher@test.com',
        photoURL: 'https://example.com/avatar.png',
      });

      return vi.fn();
    });

    firestoreMocks.mockOnSnapshot.mockImplementation((_docRef, _onNext, onError) => {
      onError(new Error('users doc unavailable'));
      return vi.fn();
    });
  });

  it('keeps session usable with firebase auth fields when users doc read fails', async () => {
    window.history.pushState({}, '', '/home');

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Home Mock teacher@test.com')).toBeTruthy();
    });

    expect(firestoreMocks.mockDoc).toHaveBeenCalledWith(
      expect.anything(),
      'users',
      'user-1'
    );
    expect(firestoreMocks.mockOnSnapshot).toHaveBeenCalledTimes(1);
  });

  it('blocks admin dashboard route when active role is switched to teacher', async () => {
    firestoreMocks.mockOnSnapshot.mockImplementationOnce((_docRef, onNext) => {
      onNext({
        exists: () => true,
        data: () => ({
          role: 'admin',
          roles: ['admin', 'teacher'],
          activeRole: 'teacher',
        }),
      });
      return vi.fn();
    });

    window.history.pushState({}, '', '/admin-dashboard');

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Home Mock teacher@test.com')).toBeTruthy();
    });

    expect(screen.queryByText('Admin Mock')).toBeNull();
  });
});
