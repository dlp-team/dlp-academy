// tests/unit/pages/admin/adminInstitutionFormUtils.test.js
import { describe, expect, it } from 'vitest';
import {
  createAdminInstitutionFormState,
  mapInstitutionToFormState,
} from '../../../../src/pages/AdminDashboard/utils/adminInstitutionFormUtils';

describe('adminInstitutionFormUtils', () => {
  it('builds default institution form state with fresh objects', () => {
    const stateA = createAdminInstitutionFormState();
    const stateB = createAdminInstitutionFormState();

    expect(stateA).toEqual({
      name: '',
      domain: '',
      institutionAdministrators: '',
      institutionalCode: '',
      type: 'school',
      city: '',
      country: '',
      timezone: 'Europe/Madrid',
    });
    expect(stateB).toEqual(stateA);
    expect(stateB).not.toBe(stateA);
  });

  it('maps institution payload to form state with admin fallbacks', () => {
    const mapped = mapInstitutionToFormState({
      name: 'Academia Demo',
      domains: ['academia.demo'],
      institutionAdministrators: ['uno@demo.edu', 'dos@demo.edu'],
      type: 'academy',
      city: 'Sevilla',
      country: 'España',
    });

    expect(mapped).toEqual({
      name: 'Academia Demo',
      domain: 'academia.demo',
      institutionAdministrators: 'uno@demo.edu, dos@demo.edu',
      institutionalCode: '',
      type: 'academy',
      city: 'Sevilla',
      country: 'España',
      timezone: 'Europe/Madrid',
    });

    const mappedWithEmail = mapInstitutionToFormState({
      name: 'Colegio Uno',
      domain: 'colegio.demo',
      adminEmail: 'admin@colegio.demo',
    });

    expect(mappedWithEmail.institutionAdministrators).toBe('admin@colegio.demo');
  });
});
