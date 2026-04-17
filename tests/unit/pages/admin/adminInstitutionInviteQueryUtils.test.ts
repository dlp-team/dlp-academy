// tests/unit/pages/admin/adminInstitutionInviteQueryUtils.test.js
import { describe, expect, it, vi } from 'vitest';

const { dbMock, collectionMock, whereMock, queryMock, getDocsMock } = vi.hoisted(() => ({
  dbMock: { __kind: 'db' },
  collectionMock: vi.fn((database, collectionName) => ({ kind: 'collection', database, collectionName })),
  whereMock: vi.fn((field, op, value) => ({ kind: 'where', field, op, value })),
  queryMock: vi.fn((base, ...clauses) => ({ kind: 'query', base, clauses })),
  getDocsMock: vi.fn(),
}));

vi.mock('../../../../src/firebase/config', () => ({
  db: dbMock,
}));

vi.mock('firebase/firestore', () => ({
  collection: (...args) => collectionMock(...args),
  where: (...args) => whereMock(...args),
  query: (...args) => queryMock(...args),
  getDocs: (...args) => getDocsMock(...args),
}));

import { loadInstitutionAdminInvites } from '../../../../src/pages/AdminDashboard/utils/adminInstitutionInviteQueryUtils';

describe('loadInstitutionAdminInvites', () => {
  it('loads and maps institution admin invites', async () => {
    getDocsMock.mockResolvedValue({
      forEach: (cb) => {
        cb({ id: 'inv-1', data: () => ({ email: 'one@demo.edu' }) });
        cb({ id: 'inv-2', data: () => ({ email: 'two@demo.edu' }) });
      },
    });

    const result = await loadInstitutionAdminInvites('inst-1');

    expect(collectionMock).toHaveBeenCalledWith(dbMock, 'institution_invites');
    expect(whereMock).toHaveBeenCalledWith('institutionId', '==', 'inst-1');
    expect(whereMock).toHaveBeenCalledWith('role', '==', 'institutionadmin');
    expect(result).toEqual([
      { id: 'inv-1', email: 'one@demo.edu' },
      { id: 'inv-2', email: 'two@demo.edu' },
    ]);
  });
});
