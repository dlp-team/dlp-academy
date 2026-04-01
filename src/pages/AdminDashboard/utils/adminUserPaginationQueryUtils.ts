// src/pages/AdminDashboard/utils/adminUserPaginationQueryUtils.ts
import { collection, limit, query, startAfter } from 'firebase/firestore';
import { db } from '../../../firebase/config';

export const buildAdminUsersPageQuery = (pageSize: number, cursor: any = null) => {
    if (cursor) {
        return query(collection(db, 'users'), startAfter(cursor), limit(pageSize));
    }

    return query(collection(db, 'users'), limit(pageSize));
};
