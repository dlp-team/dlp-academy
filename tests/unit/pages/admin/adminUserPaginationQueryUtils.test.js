// tests/unit/pages/admin/adminUserPaginationQueryUtils.test.js
import { describe, expect, it, vi } from 'vitest';

const {
  dbMock,
  collectionMock,
  limitMock,
  startAfterMock,
  queryMock,
} = vi.hoisted(() => ({
  dbMock: { __mock: 'db' },
  collectionMock: vi.fn(() => ({ __kind: 'collectionRef' })),
  limitMock: vi.fn((size) => ({ __kind: 'limit', size })),
  startAfterMock: vi.fn((cursor) => ({ __kind: 'startAfter', cursor })),
  queryMock: vi.fn((...args) => ({ __kind: 'query', args })),
}));

vi.mock('../../../../src/firebase/config', () => ({
  db: dbMock,
}));

vi.mock('firebase/firestore', () => ({
  collection: (...args) => collectionMock(...args),
  limit: (...args) => limitMock(...args),
  startAfter: (...args) => startAfterMock(...args),
  query: (...args) => queryMock(...args),
}));

import { buildAdminUsersPageQuery } from '../../../../src/pages/AdminDashboard/utils/adminUserPaginationQueryUtils';

describe('buildAdminUsersPageQuery', () => {
  it('builds first page query without cursor', () => {
    const builtQuery = buildAdminUsersPageQuery(50);

    expect(collectionMock).toHaveBeenCalledWith(dbMock, 'users');
    expect(limitMock).toHaveBeenCalledWith(50);
    expect(startAfterMock).not.toHaveBeenCalled();
    expect(queryMock).toHaveBeenCalledWith({ __kind: 'collectionRef' }, { __kind: 'limit', size: 50 });
    expect(builtQuery).toEqual({
      __kind: 'query',
      args: [{ __kind: 'collectionRef' }, { __kind: 'limit', size: 50 }],
    });
  });

  it('builds next page query with cursor', () => {
    const cursor = { id: 'cursor-doc' };
    const builtQuery = buildAdminUsersPageQuery(25, cursor);

    expect(collectionMock).toHaveBeenCalledWith(dbMock, 'users');
    expect(startAfterMock).toHaveBeenCalledWith(cursor);
    expect(limitMock).toHaveBeenCalledWith(25);
    expect(queryMock).toHaveBeenCalledWith(
      { __kind: 'collectionRef' },
      { __kind: 'startAfter', cursor },
      { __kind: 'limit', size: 25 }
    );
    expect(builtQuery).toEqual({
      __kind: 'query',
      args: [
        { __kind: 'collectionRef' },
        { __kind: 'startAfter', cursor },
        { __kind: 'limit', size: 25 },
      ],
    });
  });
});
