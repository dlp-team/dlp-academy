// tests/unit/pages/admin/adminUserPaginationStateUtils.test.js
import { describe, expect, it } from 'vitest';
import {
  buildAdminUsersPageMeta,
  mergeAdminUsersPage,
} from '../../../../src/pages/AdminDashboard/utils/adminUserPaginationStateUtils';

describe('adminUserPaginationStateUtils', () => {
  it('builds pagination metadata for populated pages', () => {
    const docs = [{ id: 'u1' }, { id: 'u2' }];

    const result = buildAdminUsersPageMeta(docs, 2);

    expect(result).toEqual({
      lastVisible: docs[1],
      hasMore: true,
    });
  });

  it('builds pagination metadata for empty pages', () => {
    const result = buildAdminUsersPageMeta([], 50);

    expect(result).toEqual({
      lastVisible: null,
      hasMore: false,
    });
  });

  it('replaces users on first page fetch', () => {
    const result = mergeAdminUsersPage({
      previousUsers: [{ id: 'old-user' }],
      fetchedUsers: [{ id: 'new-user' }],
      isNextPage: false,
    });

    expect(result).toEqual([{ id: 'new-user' }]);
  });

  it('appends users on next-page fetch', () => {
    const result = mergeAdminUsersPage({
      previousUsers: [{ id: 'user-1' }, { id: 'user-2' }],
      fetchedUsers: [{ id: 'user-3' }],
      isNextPage: true,
    });

    expect(result).toEqual([{ id: 'user-1' }, { id: 'user-2' }, { id: 'user-3' }]);
  });
});
