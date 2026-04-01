// tests/unit/pages/admin/adminInstitutionInviteSyncUtils.test.js
import { describe, expect, it } from 'vitest';
import { buildInstitutionInviteSyncPlan } from '../../../../src/pages/AdminDashboard/utils/adminInstitutionInviteSyncUtils';

describe('buildInstitutionInviteSyncPlan', () => {
  it('returns emails to add and invites to delete', () => {
    const plan = buildInstitutionInviteSyncPlan(
      [
        { id: 'inv-1', email: 'a@demo.edu' },
        { id: 'inv-2', email: 'b@demo.edu' },
      ],
      ['b@demo.edu', 'c@demo.edu']
    );

    expect(plan.emailsToAdd).toEqual(['c@demo.edu']);
    expect(plan.invitesToDelete).toEqual([{ id: 'inv-1', email: 'a@demo.edu' }]);
  });

  it('keeps empty plan when arrays are equivalent', () => {
    const plan = buildInstitutionInviteSyncPlan(
      [{ id: 'inv-9', email: 'same@demo.edu' }],
      ['same@demo.edu']
    );

    expect(plan.emailsToAdd).toEqual([]);
    expect(plan.invitesToDelete).toEqual([]);
  });
});
