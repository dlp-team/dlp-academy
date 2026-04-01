// src/pages/AdminDashboard/utils/adminUserPaginationStateUtils.ts

export const buildAdminUsersPageMeta = (pageDocs: any[], pageSize: number) => {
    const lastVisible = pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null;
    const hasMore = pageDocs.length === pageSize;

    return {
        lastVisible,
        hasMore,
    };
};

export const mergeAdminUsersPage = ({
    previousUsers,
    fetchedUsers,
    isNextPage,
}: {
    previousUsers: any[];
    fetchedUsers: any[];
    isNextPage: boolean;
}) => {
    if (!isNextPage) {
        return fetchedUsers;
    }

    return [...previousUsers, ...fetchedUsers];
};
