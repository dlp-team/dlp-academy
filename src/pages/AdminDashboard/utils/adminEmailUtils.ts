// src/pages/AdminDashboard/utils/adminEmailUtils.ts
export const parseCsvEmails = (value = ''): string[] => {
    return value
        .split(',')
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean);
};
