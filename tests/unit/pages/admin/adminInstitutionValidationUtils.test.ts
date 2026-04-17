// tests/unit/pages/admin/adminInstitutionValidationUtils.test.js
import { describe, expect, it } from 'vitest';
import { getInstitutionSubmitValidationError } from '../../../../src/pages/AdminDashboard/utils/adminInstitutionValidationUtils';

const baseInput = {
  name: 'Institucion Demo',
  domain: 'demo.edu',
  admins: ['admin@demo.edu'],
  institutionType: 'school',
  city: '',
  country: '',
  timezone: 'Europe/Madrid',
  institutionalCode: '',
};

describe('getInstitutionSubmitValidationError', () => {
  it('returns empty string for valid input', () => {
    expect(getInstitutionSubmitValidationError(baseInput)).toBe('');
  });

  it('returns expected message for invalid domain', () => {
    const input = { ...baseInput, domain: 'invalid-domain' };
    expect(getInstitutionSubmitValidationError(input)).toBe(
      'El dominio es obligatorio y debe ser válido (ej: universidad.edu).'
    );
  });

  it('returns expected message for missing admins', () => {
    const input = { ...baseInput, admins: [] };
    expect(getInstitutionSubmitValidationError(input)).toBe(
      'Debes indicar al menos un administrador institucional.'
    );
  });

  it('returns expected message for invalid admin emails', () => {
    const input = { ...baseInput, admins: ['ok@demo.edu', 'correo-invalido'] };
    expect(getInstitutionSubmitValidationError(input)).toBe(
      'Emails de administradores inválidos: correo-invalido'
    );
  });

  it('returns expected message for empty type', () => {
    const input = { ...baseInput, institutionType: '' };
    expect(getInstitutionSubmitValidationError(input)).toBe('El tipo de institución es obligatorio.');
  });
});
