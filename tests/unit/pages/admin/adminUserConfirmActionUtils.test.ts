// tests/unit/pages/admin/adminUserConfirmActionUtils.test.js
import { describe, expect, it } from 'vitest';
import { buildUserConfirmUpdatePayload } from '../../../../src/pages/AdminDashboard/utils/adminUserConfirmActionUtils';

describe('buildUserConfirmUpdatePayload', () => {
  it('builds toggle payload based on current enabled state', () => {
    const enabledUserPayload = buildUserConfirmUpdatePayload({
      action: 'toggle',
      user: { enabled: true },
    });
    expect(enabledUserPayload).toEqual({ enabled: false });

    const disabledUserPayload = buildUserConfirmUpdatePayload({
      action: 'toggle',
      user: { enabled: false },
    });
    expect(disabledUserPayload).toEqual({ enabled: true });
  });

  it('builds role payload', () => {
    const payload = buildUserConfirmUpdatePayload({
      action: 'role',
      newRole: 'teacher',
      user: { id: 'u1' },
    });

    expect(payload).toEqual({ role: 'teacher' });
  });

  it('returns null for unsupported action or missing user', () => {
    expect(buildUserConfirmUpdatePayload({ action: 'unknown', user: { id: 'u1' } })).toBeNull();
    expect(buildUserConfirmUpdatePayload({ action: 'toggle', user: null })).toBeNull();
  });
});
