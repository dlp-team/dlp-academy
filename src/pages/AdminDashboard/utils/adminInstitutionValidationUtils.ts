// src/pages/AdminDashboard/utils/adminInstitutionValidationUtils.ts
import type { NormalizedInstitutionFormInput } from './adminInstitutionPayloadUtils';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export const getInstitutionSubmitValidationError = (
    normalizedInput: NormalizedInstitutionFormInput
): string => {
    if (!normalizedInput.name) {
        return 'El nombre es obligatorio.';
    }

    if (!normalizedInput.domain || !normalizedInput.domain.includes('.')) {
        return 'El dominio es obligatorio y debe ser válido (ej: universidad.edu).';
    }

    if (normalizedInput.admins.length === 0) {
        return 'Debes indicar al menos un administrador institucional.';
    }

    const invalidAdmins = normalizedInput.admins.filter((emailItem) => !EMAIL_PATTERN.test(emailItem));
    if (invalidAdmins.length > 0) {
        return `Emails de administradores inválidos: ${invalidAdmins.join(', ')}`;
    }

    if (!normalizedInput.institutionType) {
        return 'El tipo de institución es obligatorio.';
    }

    return '';
};
