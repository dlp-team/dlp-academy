// tests/unit/pages/admin/adminUserRoleConstants.test.js
import { describe, expect, it } from 'vitest';
import {
  ADMIN_USER_ROLE_FILTERS,
  ADMIN_USER_ROLE_LABELS,
  ADMIN_USER_ROLE_OPTIONS,
  getAdminRoleFilterLabel,
  getAdminRoleOptionLabel,
} from '../../../../src/pages/AdminDashboard/utils/adminUserRoleConstants';

describe('adminUserRoleConstants', () => {
  it('exports role label map and filter/order arrays', () => {
    expect(ADMIN_USER_ROLE_LABELS.institutionadmin).toBe('Admin Institución');
    expect(ADMIN_USER_ROLE_FILTERS).toEqual(['all', 'admin', 'institutionadmin', 'teacher', 'student']);
    expect(ADMIN_USER_ROLE_OPTIONS).toEqual(['student', 'teacher', 'institutionadmin', 'admin']);
  });

  it('formats role filter labels', () => {
    expect(getAdminRoleFilterLabel('all')).toBe('Todos');
    expect(getAdminRoleFilterLabel('institutionadmin')).toBe('Admin Inst.');
    expect(getAdminRoleFilterLabel('teacher')).toBe('Teacher');
  });

  it('returns role option labels with fallback', () => {
    expect(getAdminRoleOptionLabel('admin')).toBe('Admin Global');
    expect(getAdminRoleOptionLabel('unknown')).toBe('unknown');
  });
});
