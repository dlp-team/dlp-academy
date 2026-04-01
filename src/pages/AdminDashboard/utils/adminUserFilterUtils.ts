// src/pages/AdminDashboard/utils/adminUserFilterUtils.ts
export const filterAdminUsers = (users: any[] = [], search = '', roleFilter = 'all', statusFilter = 'all') => {
    const normalizedSearch = (search || '').toLowerCase();

    return users.filter((userItem) => {
        const matchSearch = userItem?.email?.toLowerCase().includes(normalizedSearch) ||
            userItem?.displayName?.toLowerCase().includes(normalizedSearch);

        const matchRole = roleFilter === 'all' || userItem?.role === roleFilter;

        const matchStatus = statusFilter === 'all'
            ? true
            : statusFilter === 'active'
                ? userItem?.enabled !== false
                : userItem?.enabled === false;

        return matchSearch && matchRole && matchStatus;
    });
};
