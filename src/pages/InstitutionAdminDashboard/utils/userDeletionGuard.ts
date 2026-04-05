// src/pages/InstitutionAdminDashboard/utils/userDeletionGuard.ts

const normalizeId = (value: any) => String(value || '').trim();
const normalizeRole = (value: any) => String(value || '').trim().toLowerCase();

const PROTECTED_ROLES = new Set(['admin', 'institutionadmin']);

export const USER_DELETION_GUARD_CODES = {
  ALLOWED: 'USER_DELETE_ALLOWED',
  MISSING_ID: 'USER_DELETE_MISSING_ID',
  MISSING_INSTITUTION: 'USER_DELETE_MISSING_INSTITUTION',
  NOT_FOUND: 'USER_DELETE_NOT_FOUND',
  CROSS_TENANT: 'USER_DELETE_CROSS_TENANT',
  ROLE_MISMATCH: 'USER_DELETE_ROLE_MISMATCH',
  PROTECTED_ROLE: 'USER_DELETE_PROTECTED_ROLE',
  SELF_FORBIDDEN: 'USER_DELETE_SELF_FORBIDDEN',
  TEACHER_HAS_ACTIVE_CLASSES: 'USER_DELETE_TEACHER_HAS_ACTIVE_CLASSES',
  STUDENT_HAS_ACTIVE_CLASSES: 'USER_DELETE_STUDENT_HAS_ACTIVE_CLASSES',
} as const;

type UserDeletionGuardInput = {
  targetUser: any;
  effectiveInstitutionId: any;
  expectedRole?: any;
  requesterUid?: any;
  hasActiveClasses?: boolean;
};

export const evaluateUserDeletionGuard = ({
  targetUser,
  effectiveInstitutionId,
  expectedRole,
  requesterUid,
  hasActiveClasses = false,
}: UserDeletionGuardInput) => {
  const targetId = normalizeId(targetUser?.id);
  if (!targetId) return USER_DELETION_GUARD_CODES.NOT_FOUND;

  const targetInstitutionId = normalizeId(targetUser?.institutionId);
  const normalizedEffectiveInstitutionId = normalizeId(effectiveInstitutionId);
  if (!normalizedEffectiveInstitutionId) return USER_DELETION_GUARD_CODES.MISSING_INSTITUTION;
  if (targetInstitutionId !== normalizedEffectiveInstitutionId) return USER_DELETION_GUARD_CODES.CROSS_TENANT;

  const normalizedTargetRole = normalizeRole(targetUser?.role);
  if (PROTECTED_ROLES.has(normalizedTargetRole)) return USER_DELETION_GUARD_CODES.PROTECTED_ROLE;

  const normalizedExpectedRole = normalizeRole(expectedRole);
  if (normalizedExpectedRole && normalizedExpectedRole !== normalizedTargetRole) {
    return USER_DELETION_GUARD_CODES.ROLE_MISMATCH;
  }

  const normalizedRequesterUid = normalizeId(requesterUid);
  if (normalizedRequesterUid && normalizedRequesterUid === targetId) {
    return USER_DELETION_GUARD_CODES.SELF_FORBIDDEN;
  }

  if (hasActiveClasses) {
    return normalizedTargetRole === 'teacher'
      ? USER_DELETION_GUARD_CODES.TEACHER_HAS_ACTIVE_CLASSES
      : USER_DELETION_GUARD_CODES.STUDENT_HAS_ACTIVE_CLASSES;
  }

  return USER_DELETION_GUARD_CODES.ALLOWED;
};
