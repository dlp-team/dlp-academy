// src/pages/AdminDashboard/utils/adminInstitutionPayloadUtils.ts
import { parseCsvEmails } from './adminEmailUtils';

export type NormalizedInstitutionFormInput = {
    name: string;
    domain: string;
    admins: string[];
    institutionType: string;
    city: string;
    country: string;
    timezone: string;
    institutionalCode: string;
};

export const normalizeInstitutionFormInput = (formState: any): NormalizedInstitutionFormInput => {
    return {
        name: (formState?.name || '').trim(),
        domain: (formState?.domain || '').toLowerCase().trim(),
        admins: parseCsvEmails(formState?.institutionAdministrators || ''),
        institutionType: (formState?.type || 'school').trim(),
        city: (formState?.city || '').trim(),
        country: (formState?.country || '').trim(),
        timezone: (formState?.timezone || '').trim() || 'Europe/Madrid',
        institutionalCode: (formState?.institutionalCode || '').trim(),
    };
};

export const buildInstitutionPayload = (normalizedInput: NormalizedInstitutionFormInput, updatedAt: any) => {
    return {
        name: normalizedInput.name,
        domain: normalizedInput.domain,
        domains: [normalizedInput.domain],
        institutionAdministrators: normalizedInput.admins,
        adminEmail: normalizedInput.admins[0],
        type: normalizedInput.institutionType,
        city: normalizedInput.city,
        country: normalizedInput.country,
        timezone: normalizedInput.timezone,
        updatedAt,
    };
};
