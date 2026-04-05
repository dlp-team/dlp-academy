// tests/unit/pages/institution-admin/userDeletionFeedback.test.js
import { describe, it, expect } from 'vitest';
import {
  buildUserDeletionSuccessMessage,
  getUserDeletionRoleLabel,
  mapUserDeletionErrorMessage,
} from '../../../../src/pages/InstitutionAdminDashboard/utils/userDeletionFeedback';
import { USER_DELETION_GUARD_CODES } from '../../../../src/pages/InstitutionAdminDashboard/utils/userDeletionGuard';

describe('userDeletionFeedback', () => {
  it('returns Spanish role labels for teacher and student', () => {
    expect(getUserDeletionRoleLabel('teacher')).toBe('profesor');
    expect(getUserDeletionRoleLabel('student')).toBe('alumno');
    expect(getUserDeletionRoleLabel('unknown-role')).toBe('profesor');
  });

  it('maps known guard errors to explicit Spanish messages', () => {
    expect(
      mapUserDeletionErrorMessage(new Error(USER_DELETION_GUARD_CODES.CROSS_TENANT), 'teacher')
    ).toBe('No puedes eliminar usuarios de otra institución.');

    expect(
      mapUserDeletionErrorMessage(
        new Error(USER_DELETION_GUARD_CODES.STUDENT_HAS_ACTIVE_CLASSES),
        'student'
      )
    ).toBe('No se puede eliminar el alumno mientras tenga clases activas asignadas.');

    expect(
      mapUserDeletionErrorMessage(new Error(USER_DELETION_GUARD_CODES.SELF_FORBIDDEN), 'teacher')
    ).toBe('No puedes eliminar tu propia cuenta desde este panel.');
  });

  it('returns role-aware fallback message for unknown errors', () => {
    expect(mapUserDeletionErrorMessage(new Error('UNKNOWN_CODE'), 'teacher')).toBe(
      'No se pudo eliminar el profesor. Inténtalo de nuevo.'
    );
    expect(mapUserDeletionErrorMessage(new Error('UNKNOWN_CODE'), 'student')).toBe(
      'No se pudo eliminar el alumno. Inténtalo de nuevo.'
    );
  });

  it('builds role-aware success messages', () => {
    expect(buildUserDeletionSuccessMessage('teacher')).toBe('Se eliminó el profesor correctamente.');
    expect(buildUserDeletionSuccessMessage('student')).toBe('Se eliminó el alumno correctamente.');
  });
});
