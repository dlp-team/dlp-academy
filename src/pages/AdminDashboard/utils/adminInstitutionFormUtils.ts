// src/pages/AdminDashboard/utils/adminInstitutionFormUtils.ts
export type AdminInstitutionFormState = {
    name: string;
    domain: string;
    institutionAdministrators: string;
    institutionalCode: string;
    type: string;
    city: string;
    country: string;
    timezone: string;
};

export const createAdminInstitutionFormState = (): AdminInstitutionFormState => ({
    name: '',
    domain: '',
    institutionAdministrators: '',
    institutionalCode: '',
    type: 'school',
    city: '',
    country: '',
    timezone: 'Europe/Madrid',
});

export const mapInstitutionToFormState = (institution: any): AdminInstitutionFormState => ({
    name: institution?.name || '',
    domain: institution?.domain || institution?.domains?.[0] || '',
    institutionAdministrators: Array.isArray(institution?.institutionAdministrators)
        ? institution.institutionAdministrators.join(', ')
        : (institution?.adminEmail || ''),
    institutionalCode: '',
    type: institution?.type || 'school',
    city: institution?.city || '',
    country: institution?.country || '',
    timezone: institution?.timezone || 'Europe/Madrid',
});
