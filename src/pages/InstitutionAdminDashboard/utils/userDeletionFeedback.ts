// src/pages/InstitutionAdminDashboard/utils/userDeletionFeedback.ts
import { USER_DELETION_GUARD_CODES } from './userDeletionGuard';

const normalizeRole = (value: any) => String(value || '').trim().toLowerCase();

export const getUserDeletionRoleLabel = (role: any) => (
  normalizeRole(role) === 'student' ? 'alumno' : 'profesor'
);

export const mapUserDeletionErrorMessage = (error: any, role: any) => {
  const normalizedCode = String(error?.message || '').trim();
  const roleLabel = getUserDeletionRoleLabel(role);

  if (normalizedCode === USER_DELETION_GUARD_CODES.CROSS_TENANT) {
    return 'No puedes eliminar usuarios de otra institución.';
  }
  if (normalizedCode === USER_DELETION_GUARD_CODES.ROLE_MISMATCH) {
    return `El usuario seleccionado no coincide con el tipo actual (${roleLabel}).`;
  }
  if (normalizedCode === USER_DELETION_GUARD_CODES.PROTECTED_ROLE) {
    return 'Este rol está protegido y no se puede eliminar desde esta vista.';
  }
  if (normalizedCode === USER_DELETION_GUARD_CODES.SELF_FORBIDDEN) {
    return 'No puedes eliminar tu propia cuenta desde este panel.';
  }
  if (normalizedCode === USER_DELETION_GUARD_CODES.TEACHER_HAS_ACTIVE_CLASSES) {
    return 'No se puede eliminar el profesor mientras tenga clases activas asignadas.';
  }
  if (normalizedCode === USER_DELETION_GUARD_CODES.STUDENT_HAS_ACTIVE_CLASSES) {
    return 'No se puede eliminar el alumno mientras tenga clases activas asignadas.';
  }
  if (normalizedCode === USER_DELETION_GUARD_CODES.NOT_FOUND) {
    return 'El usuario ya no existe o fue eliminado previamente.';
  }

  return `No se pudo eliminar el ${roleLabel}. Inténtalo de nuevo.`;
};

export const buildUserDeletionSuccessMessage = (role: any) => {
  const roleLabel = getUserDeletionRoleLabel(role);
  return `Se eliminó el ${roleLabel} correctamente.`;
};
