// tests/unit/pages/admin/adminUserFilterUtils.test.js
import { describe, expect, it } from 'vitest';
import { filterAdminUsers } from '../../../../src/pages/AdminDashboard/utils/adminUserFilterUtils';

const users = [
  { id: '1', displayName: 'Docente Uno', email: 'teacher@demo.edu', role: 'teacher', enabled: true },
  { id: '2', displayName: 'Alumno Dos', email: 'student@demo.edu', role: 'student', enabled: false },
  { id: '3', displayName: 'Admin Tres', email: 'admin@demo.edu', role: 'admin', enabled: true },
];

describe('filterAdminUsers', () => {
  it('filters by role and status', () => {
    const result = filterAdminUsers(users, '', 'student', 'disabled');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('filters by search on display name or email', () => {
    expect(filterAdminUsers(users, 'docente', 'all', 'all')).toHaveLength(1);
    expect(filterAdminUsers(users, 'admin@demo.edu', 'all', 'all')).toHaveLength(1);
  });
});
