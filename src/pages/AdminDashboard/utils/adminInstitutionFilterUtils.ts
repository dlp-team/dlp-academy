// src/pages/AdminDashboard/utils/adminInstitutionFilterUtils.ts
export const filterInstitutions = (
    institutions: any[] = [],
    search = '',
    statusFilter = 'all',
    typeFilter = 'all'
) => {
    const normalizedSearch = (search || '').toLowerCase();

    return institutions.filter((institution) => {
        const matchSearch = institution?.name?.toLowerCase().includes(normalizedSearch) ||
            institution?.city?.toLowerCase().includes(normalizedSearch) ||
            institution?.adminEmail?.toLowerCase().includes(normalizedSearch);

        const matchStatus = statusFilter === 'all'
            ? true
            : statusFilter === 'active'
                ? institution?.enabled !== false
                : institution?.enabled === false;

        const matchType = typeFilter === 'all' ? true : institution?.type === typeFilter;

        return matchSearch && matchStatus && matchType;
    });
};
