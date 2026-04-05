// tests/unit/pages/institution-admin/userDeletionGuard.test.js
import { describe, it, expect } from 'vitest';
import {
  evaluateUserDeletionGuard,
  USER_DELETION_GUARD_CODES,
} from '../../../../src/pages/InstitutionAdminDashboard/utils/userDeletionGuard';

describe('userDeletionGuard', () => {
  const buildUser = (overrides = {}) => ({
    id: 'user-1',
    institutionId: 'inst-1',
    role: 'teacher',
    ...overrides,
  });

  it('allows deletion when tenant, role and safeguards pass', () => {
    const result = evaluateUserDeletionGuard({
      targetUser: buildUser(),
      effectiveInstitutionId: 'inst-1',
      expectedRole: 'teacher',
      requesterUid: 'admin-1',
      hasActiveClasses: false,
    });

    expect(result).toBe(USER_DELETION_GUARD_CODES.ALLOWED);
  });

  it('blocks deletion for cross-tenant users', () => {
    const result = evaluateUserDeletionGuard({
      targetUser: buildUser({ institutionId: 'inst-2' }),
      effectiveInstitutionId: 'inst-1',
      expectedRole: 'teacher',
      requesterUid: 'admin-1',
    });

    expect(result).toBe(USER_DELETION_GUARD_CODES.CROSS_TENANT);
  });

  it('blocks deletion when role does not match expected role', () => {
    const result = evaluateUserDeletionGuard({
      targetUser: buildUser({ role: 'student' }),
      effectiveInstitutionId: 'inst-1',
      expectedRole: 'teacher',
      requesterUid: 'admin-1',
    });

    expect(result).toBe(USER_DELETION_GUARD_CODES.ROLE_MISMATCH);
  });

  it('blocks deletion for protected roles', () => {
    const result = evaluateUserDeletionGuard({
      targetUser: buildUser({ role: 'admin' }),
      effectiveInstitutionId: 'inst-1',
      expectedRole: 'admin',
      requesterUid: 'admin-2',
    });

    expect(result).toBe(USER_DELETION_GUARD_CODES.PROTECTED_ROLE);
  });

  it('blocks self deletion', () => {
    const result = evaluateUserDeletionGuard({
      targetUser: buildUser({ id: 'admin-1' }),
      effectiveInstitutionId: 'inst-1',
      expectedRole: 'teacher',
      requesterUid: 'admin-1',
    });

    expect(result).toBe(USER_DELETION_GUARD_CODES.SELF_FORBIDDEN);
  });

  it('blocks teachers with active classes', () => {
    const result = evaluateUserDeletionGuard({
      targetUser: buildUser({ role: 'teacher' }),
      effectiveInstitutionId: 'inst-1',
      expectedRole: 'teacher',
      requesterUid: 'admin-1',
      hasActiveClasses: true,
    });

    expect(result).toBe(USER_DELETION_GUARD_CODES.TEACHER_HAS_ACTIVE_CLASSES);
  });

  it('blocks students with active classes', () => {
    const result = evaluateUserDeletionGuard({
      targetUser: buildUser({ role: 'student' }),
      effectiveInstitutionId: 'inst-1',
      expectedRole: 'student',
      requesterUid: 'admin-1',
      hasActiveClasses: true,
    });

    expect(result).toBe(USER_DELETION_GUARD_CODES.STUDENT_HAS_ACTIVE_CLASSES);
  });
});
